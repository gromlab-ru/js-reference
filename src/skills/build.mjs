import {
  copyFile,
  lstat,
  mkdir,
  readFile,
  realpath,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const skillsSourceDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.resolve(skillsSourceDirectory, "../..")
const referencesDirectory = path.join(projectDirectory, "src/references")
const outputDirectory = path.join(projectDirectory, "skills")
const buildId = `${process.pid}-${Date.now()}`
const stagingDirectory = path.join(projectDirectory, `.skills-build-${buildId}`)
const backupDirectory = path.join(projectDirectory, `.skills-backup-${buildId}`)

const isObject = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const isInside = (rootDirectory, targetPath) => {
  const relativePath = path.relative(rootDirectory, targetPath)
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
}

const toPosixPath = (filePath) => filePath.split(path.sep).join("/")

const assertKnownKeys = (value, knownKeys, label) => {
  for (const key of Object.keys(value)) {
    if (!knownKeys.includes(key)) {
      throw new Error(`${label}: неизвестное поле "${key}"`)
    }
  }
}

const resolveInside = (rootDirectory, relativePath, label) => {
  if (typeof relativePath !== "string" || relativePath.length === 0) {
    throw new Error(`${label}: ожидается непустой относительный путь`)
  }

  if (path.isAbsolute(relativePath)) {
    throw new Error(`${label}: абсолютные пути запрещены`)
  }

  const absolutePath = path.resolve(rootDirectory, relativePath)

  if (!isInside(rootDirectory, absolutePath)) {
    throw new Error(`${label}: путь выходит за пределы root`)
  }

  return absolutePath
}

const getPathInfo = async (filePath, label) => {
  try {
    const pathInfo = await lstat(filePath)

    if (pathInfo.isSymbolicLink()) {
      throw new Error(`${label}: symbolic links не поддерживаются`)
    }

    return pathInfo
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`${label}: путь не существует`)
    }

    throw error
  }
}

const assertRealPathInside = async (rootDirectory, targetPath, label) => {
  const [rootRealPath, targetRealPath] = await Promise.all([
    realpath(rootDirectory),
    realpath(targetPath),
  ])
  const expectedRealPath = path.resolve(
    rootRealPath,
    path.relative(rootDirectory, targetPath),
  )

  if (!isInside(rootRealPath, targetRealPath)) {
    throw new Error(`${label}: реальный путь выходит за пределы source root`)
  }

  if (targetRealPath !== expectedRealPath) {
    throw new Error(`${label}: symbolic links в пути не поддерживаются`)
  }
}

const collectFiles = async (entryPath, label) => {
  const pathInfo = await getPathInfo(entryPath, label)

  if (pathInfo.isFile()) {
    return [entryPath]
  }

  if (!pathInfo.isDirectory()) {
    throw new Error(`${label}: поддерживаются только файлы и каталоги`)
  }

  const entries = await readdir(entryPath, { withFileTypes: true })
  const files = []

  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    if (entry.isSymbolicLink()) {
      throw new Error(`${label}: symbolic links не поддерживаются`)
    }

    files.push(...(await collectFiles(path.join(entryPath, entry.name), label)))
  }

  return files
}

const readConfig = async (skillName, sourceDirectory) => {
  const configPath = path.join(sourceDirectory, "skill.config.mjs")

  try {
    await lstat(configPath)
  } catch (error) {
    if (error.code === "ENOENT") {
      return null
    }

    throw error
  }

  await assertRealPathInside(sourceDirectory, configPath, `${skillName}/skill.config.mjs`)

  const configUrl = pathToFileURL(configPath)
  configUrl.searchParams.set("build", buildId)
  const config = (await import(configUrl.href)).default
  const label = `${skillName}/skill.config.mjs`

  if (!isObject(config)) {
    throw new Error(`${label}: default export должен быть object`)
  }

  assertKnownKeys(config, ["schemaVersion", "entries"], label)

  if (config.schemaVersion !== 2) {
    throw new Error(`${label}: поддерживается schemaVersion 2`)
  }

  if (!Array.isArray(config.entries) || config.entries.length === 0) {
    throw new Error(`${label}: entries должен быть непустым массивом`)
  }

  return config
}

const expandMappings = async (skillName, targetDirectory, config) => {
  const fileMappings = []
  const directoryMappings = []
  const sourcePaths = new Set()
  const targetPaths = new Set()

  for (const [index, entry] of config.entries.entries()) {
    const label = `${skillName}/skill.config.mjs entries[${index}]`

    if (!isObject(entry)) {
      throw new Error(`${label}: ожидается object`)
    }

    assertKnownKeys(entry, ["to", "from", "rewrite"], label)

    if (entry.rewrite !== undefined && typeof entry.rewrite !== "boolean") {
      throw new Error(`${label}.rewrite: ожидается boolean`)
    }

    const sourcePath = resolveInside(projectDirectory, entry.from, `${label}.from`)
    const targetPath = resolveInside(targetDirectory, entry.to, `${label}.to`)

    if (
      !isInside(referencesDirectory, sourcePath) &&
      !isInside(path.join(skillsSourceDirectory, skillName), sourcePath)
    ) {
      throw new Error(`${label}.from: source разрешён только из текущего skill или src/references`)
    }

    await assertRealPathInside(projectDirectory, sourcePath, `${label}.from`)
    const sourceInfo = await getPathInfo(sourcePath, `${label}.from`)

    if (sourceInfo.isDirectory()) {
      directoryMappings.push({ sourcePath, targetPath })
    }

    const sourceFiles = await collectFiles(sourcePath, `${label}.from`)

    for (const sourceFile of sourceFiles) {
      const targetFile = sourceInfo.isDirectory()
        ? path.join(targetPath, path.relative(sourcePath, sourceFile))
        : targetPath
      const sourceKey = path.normalize(sourceFile)
      const targetKey = path.normalize(targetFile)

      if (sourcePaths.has(sourceKey)) {
        throw new Error(`${label}.from: source уже добавлен: ${entry.from}`)
      }

      if (targetPaths.has(targetKey)) {
        throw new Error(`${label}.to: target уже занят: ${entry.to}`)
      }

      sourcePaths.add(sourceKey)
      targetPaths.add(targetKey)
      fileMappings.push({
        sourcePath: sourceFile,
        targetPath: targetFile,
        rewrite: entry.rewrite !== false,
      })
    }
  }

  const skillEntries = fileMappings.filter(
    ({ targetPath }) => path.relative(targetDirectory, targetPath) === "SKILL.md",
  )

  if (skillEntries.length !== 1) {
    throw new Error(`${skillName}: manifest должен создавать ровно один SKILL.md`)
  }

  const skillContent = await readFile(skillEntries[0].sourcePath, "utf8")
  const frontmatterName = skillContent.match(
    /^---\s*\n[\s\S]*?^name:\s*([^\n]+)$/m,
  )?.[1]?.trim()

  if (frontmatterName !== skillName) {
    throw new Error(`${skillName}: frontmatter name должен быть "${skillName}"`)
  }

  return { fileMappings, directoryMappings }
}

const splitLocalTarget = (rawTarget) => {
  const target = rawTarget.trim()

  if (
    target.length === 0 ||
    target.startsWith("#") ||
    /^[a-z][a-z\d+.-]*:/i.test(target)
  ) {
    return null
  }

  if (target.startsWith("<")) {
    const closingBracket = target.indexOf(">")

    if (closingBracket === -1) {
      throw new Error(`Некорректная Markdown-ссылка: ${rawTarget}`)
    }

    return {
      path: target.slice(1, closingBracket),
      prefix: "<",
      suffix: `>${target.slice(closingBracket + 1)}`,
    }
  }

  const match = target.match(/^(\S+)([\s\S]*)$/)
  return { path: match[1], prefix: "", suffix: match[2] }
}

const getTargetSuffix = (targetPath) => {
  const suffixIndex = targetPath.search(/[?#]/)
  return suffixIndex === -1
    ? { pathname: targetPath, suffix: "" }
    : { pathname: targetPath.slice(0, suffixIndex), suffix: targetPath.slice(suffixIndex) }
}

const rewriteMarkdown = (
  markdown,
  sourceFile,
  targetFile,
  sourceToTarget,
  directoryMappings,
) => {
  if (/^\s*\[[^\]]+\]:\s*\S+/m.test(markdown) || /\[[^\]]+\]\[[^\]]*\]/.test(markdown)) {
    throw new Error(
      `${toPosixPath(path.relative(projectDirectory, sourceFile))}: reference-style Markdown-ссылки не поддерживаются; используй inline-ссылку`,
    )
  }

  const rewriteContent = (content) =>
    content.replace(/(!?\[[^\]]*\]\()([^)]+)(\))/g, (full, opening, rawTarget, closing) => {
      const parsedTarget = splitLocalTarget(rawTarget)

      if (parsedTarget === null) {
        return full
      }

      const { pathname, suffix } = getTargetSuffix(parsedTarget.path)
      let decodedPath

      try {
        decodedPath = decodeURIComponent(pathname)
      } catch {
        throw new Error(`${toPosixPath(path.relative(projectDirectory, sourceFile))}: некорректный URL ${parsedTarget.path}`)
      }

      const sourceTarget = path.resolve(path.dirname(sourceFile), decodedPath)
      let outputTarget = sourceToTarget.get(path.normalize(sourceTarget))

      if (outputTarget === undefined) {
        const directoryMapping = [...directoryMappings]
          .sort((left, right) => right.sourcePath.length - left.sourcePath.length)
          .find(({ sourcePath }) => isInside(sourcePath, sourceTarget))

        if (directoryMapping !== undefined) {
          outputTarget = path.join(
            directoryMapping.targetPath,
            path.relative(directoryMapping.sourcePath, sourceTarget),
          )
        }
      }

      if (outputTarget === undefined) {
        throw new Error(
          `${toPosixPath(path.relative(projectDirectory, sourceFile))}: ссылка ведёт в файл, отсутствующий в config: ${parsedTarget.path}`,
        )
      }

      let outputPath = toPosixPath(path.relative(path.dirname(targetFile), outputTarget))

      if (pathname.endsWith("/") && !outputPath.endsWith("/")) {
        outputPath += "/"
      }

      return `${opening}${parsedTarget.prefix}${outputPath}${suffix}${parsedTarget.suffix}${closing}`
    })

  const fencedCodePattern = /^(```|~~~)[\s\S]*?^\1.*$/gm
  let result = ""
  let cursor = 0

  for (const match of markdown.matchAll(fencedCodePattern)) {
    result += rewriteContent(markdown.slice(cursor, match.index))
    result += match[0]
    cursor = match.index + match[0].length
  }

  return result + rewriteContent(markdown.slice(cursor))
}

const getMarkdownLinks = (markdown) => {
  const links = []
  const content = markdown.replace(/^(```|~~~)[\s\S]*?^\1.*$/gm, "")

  for (const match of content.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const parsedTarget = splitLocalTarget(match[1])

    if (parsedTarget !== null) {
      links.push(parsedTarget.path)
    }
  }

  return links
}

const validateMarkdownLinks = async (bundleDirectory, markdownFiles) => {
  const errors = []

  for (const markdownFile of markdownFiles) {
    const content = await readFile(markdownFile, "utf8")

    for (const rawTarget of getMarkdownLinks(content)) {
      const { pathname } = getTargetSuffix(rawTarget)
      let decodedPath

      try {
        decodedPath = decodeURIComponent(pathname)
      } catch {
        errors.push(`${path.relative(bundleDirectory, markdownFile)}: некорректный URL ${rawTarget}`)
        continue
      }

      const targetPath = path.resolve(path.dirname(markdownFile), decodedPath)

      if (!isInside(bundleDirectory, targetPath)) {
        errors.push(`${path.relative(bundleDirectory, markdownFile)}: ссылка выходит за bundle: ${rawTarget}`)
        continue
      }

      try {
        await lstat(targetPath)
      } catch (error) {
        if (error.code === "ENOENT") {
          errors.push(`${path.relative(bundleDirectory, markdownFile)}: цель отсутствует: ${rawTarget}`)
          continue
        }

        throw error
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Обнаружены сломанные локальные ссылки:\n${errors.join("\n")}`)
  }
}

const buildSkill = async (skillName, sourceDirectory, config) => {
  const targetDirectory = path.join(stagingDirectory, skillName)
  const { fileMappings, directoryMappings } = await expandMappings(
    skillName,
    targetDirectory,
    config,
  )
  const sourceToTarget = new Map(
    fileMappings.map(({ sourcePath, targetPath }) => [path.normalize(sourcePath), targetPath]),
  )

  for (const { sourcePath, targetPath, rewrite } of fileMappings) {
    await mkdir(path.dirname(targetPath), { recursive: true })

    if (
      rewrite &&
      sourcePath.endsWith(".md") &&
      isInside(referencesDirectory, sourcePath)
    ) {
      const source = await readFile(sourcePath, "utf8")
      const rewritten = rewriteMarkdown(
        source,
        sourcePath,
        targetPath,
        sourceToTarget,
        directoryMappings,
      )
      await writeFile(targetPath, rewritten)
    } else {
      await copyFile(sourcePath, targetPath)
    }
  }

  const bundleFiles = await collectFiles(targetDirectory, skillName)
  const markdownFiles = bundleFiles.filter((filePath) => filePath.endsWith(".md"))
  await validateMarkdownLinks(targetDirectory, markdownFiles)

  return fileMappings.length
}

const replaceOutput = async () => {
  let hasPreviousOutput = false

  try {
    await lstat(outputDirectory)
    hasPreviousOutput = true
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error
    }
  }

  if (hasPreviousOutput) {
    await rename(outputDirectory, backupDirectory)
  }

  try {
    await rename(stagingDirectory, outputDirectory)
  } catch (buildError) {
    if (hasPreviousOutput) {
      try {
        await rename(backupDirectory, outputDirectory)
      } catch (restoreError) {
        throw new AggregateError(
          [buildError, restoreError],
          `Не удалось установить сборку и восстановить предыдущую. Backup: ${backupDirectory}`,
        )
      }
    }

    throw buildError
  }

  if (hasPreviousOutput) {
    try {
      await rm(backupDirectory, { recursive: true, force: true })
    } catch (error) {
      console.warn(
        `Новая сборка установлена, но не удалось удалить backup ${backupDirectory}: ${error.message}`,
      )
    }
  }
}

await mkdir(stagingDirectory, { recursive: true })

try {
  const entries = await readdir(skillsSourceDirectory, { withFileTypes: true })
  const skillDirectories = entries
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name))
  let builtSkills = 0

  for (const skillDirectory of skillDirectories) {
    const skillName = skillDirectory.name
    const sourceDirectory = path.join(skillsSourceDirectory, skillName)
    const config = await readConfig(skillName, sourceDirectory)

    if (config === null) {
      continue
    }

    const fileCount = await buildSkill(skillName, sourceDirectory, config)
    builtSkills += 1
    console.log(`${skillName}: собрано ${fileCount} файлов`)
  }

  if (builtSkills === 0) {
    throw new Error("Не найдено ни одного skill.config.mjs")
  }

  await replaceOutput()
} catch (error) {
  await rm(stagingDirectory, { recursive: true, force: true })
  throw error
}
