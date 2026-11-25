import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'

// Эталон устанавливают отдельно: ESLint и его зависимости не попадают в скилл или обязательную проверку CI.
if (!process.argv[2]) throw new Error('Передай каталог с установленным eslint-plugin-typefest@1.7.1 (см. ts-extras-biome.md).')
const modules = resolve(process.argv[2], 'node_modules')
const readJson = path => JSON.parse(readFileSync(path, 'utf8'))
for (const [name, version] of [['eslint-plugin-typefest', '1.7.1'], ['ts-extras', '3.0.0'], ['typescript', '6.0.3']]) {
  assert.equal(readJson(join(modules, name, 'package.json')).version, version, name)
}
const root = mkdtempSync(join(tmpdir(), 'ts-extras upstream '))
try {
  symlinkSync(modules, join(root, 'node_modules'), 'junction')
  cpSync(new URL('./ts-extras-cases/', import.meta.url), join(root, 'src'), { recursive: true })
  const pkg = join(root, 'package.json')
  writeFileSync(pkg, JSON.stringify({ name: 'ts-extras-probe', private: true, type: 'module', dependencies: { 'ts-extras': '3.0.0' } }))
  writeFileSync(join(root, 'tsconfig.json'), JSON.stringify({ compilerOptions: {
    target: 'ES2022', lib: ['ESNext', 'DOM'], module: 'NodeNext', strict: true, noUncheckedIndexedAccess: true,
    exactOptionalPropertyTypes: true, noEmit: true
  }, include: ['src'] }))
  const prefix = 'prefer-ts-extras-'
  const imported = createRequire(pkg)('eslint-plugin-typefest')
  const rules = Object.keys((imported.default ?? imported).rules).filter(r => r.startsWith(prefix))
  const settings = Object.fromEntries(rules.map(r => [`typefest/${r}`, 'warn']))
  writeFileSync(join(root, 'eslint.config.mjs'), `import plugin from 'eslint-plugin-typefest'
export default [{ ...plugin.configs['ts-extras/type-guards'], rules: ${JSON.stringify(settings)} }]\n`)

  function check(bin, ...args) {
    const r = spawnSync(process.execPath, [join(modules, bin), ...args], { cwd: root, encoding: 'utf8' })
    if (r.error) throw r.error
    assert.equal(r.status, 0, r.stderr || r.stdout)
    return r.stdout
  }
  check('typescript/bin/tsc', '-p', 'tsconfig.json')
  const result = JSON.parse(check('eslint/bin/eslint.js', '-f', 'json', 'src'))
  const positives = result.find(file => basename(file.filePath) === 'positive.ts').messages
  const expected = new Set()
  readFileSync(join(root, 'src/positive.ts'), 'utf8').split('\n').forEach((line, i) => {
    const slug = line.match(/\/\/ expect: ([\w-]+)$/)?.[1]
    if (!slug) return
    const rule = `${prefix}${slug}`
    expected.add(rule)
    assert.ok(positives.some(m => m.line === i + 1 && m.ruleId === `typefest/${rule}`), `${rule}, строка ${i + 1}`)
  })
  assert.deepEqual([...expected].sort(), rules.sort())
  console.log(`ESLint: совпали все ${expected.size} ожидаемых правил на отмеченных строках. Фикстуры прошли tsc.`)
  const other = result.find(file => basename(file.filePath) === 'negative.ts').messages
  console.log(`Отличия на примерах, которые Biome намеренно пропускает: ${other.length} замечаний ESLint.`)
  for (const m of other) console.log(`  negative.ts:${m.line} ${m.ruleId}`)
} finally {
  rmSync(root, { recursive: true, force: true })
}
