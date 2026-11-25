import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const skill = fileURLToPath(new URL('../../skills/ts-standarts/', import.meta.url))
const cli = fileURLToPath(import.meta.resolve('@biomejs/biome/bin/biome'))

// Приложение получает только поставляемые ресурсы по инструкции из assets/biome.
function consumer(t, files, config = {}) {
  const root = mkdtempSync(join(tmpdir(), 'ts standards '))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const tools = join(root, 'tools/ts-standarts')
  mkdirSync(tools, { recursive: true })
  for (const name of ['ts.json', 'rules.js', 'ts-extras.settings.js']) {
    copyFileSync(join(skill, 'assets/biome', name), join(tools, name))
  }
  cpSync(join(skill, 'assets/biome/ts-extras'), join(tools, 'ts-extras'), { recursive: true })
  writeFileSync(join(root, 'biome.json'), JSON.stringify({ extends: ['./tools/ts-standarts/ts.json'], ...config }))
  for (const [name, code] of Object.entries(files)) {
    const file = join(root, 'src', name)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, code)
  }
  return root
}

function run(root, command, ...args) {
  const result = spawnSync(process.execPath, [cli, command, ...args, 'src'], { cwd: root, encoding: 'utf8' })
  if (result.error) throw result.error
  return result
}

function errors(root, command = 'lint') {
  const { status, stdout, stderr } = run(root, command, '--reporter=json', '--max-diagnostics=none')
  assert.ok([0, 1].includes(status) && stdout.trim(), stderr)
  const { summary, diagnostics } = JSON.parse(stdout)
  assert.equal(status, summary.errors ? 1 : 0, stderr)
  assert.equal(summary.diagnosticsNotPrinted, 0)
  return diagnostics.filter(d => d.severity === 'error' || d.severity === 'fatal' || d.message.startsWith('[TS-EXTRAS/'))
    .map(d => `${basename(d.location.path)}: ${d.category === 'plugin' ? d.message.split(']')[0] + ']' : d.category}`)
    .sort()
}

test('форматтер применяет стиль к ts/mts/cts и сохраняет оформление других языков проекта', t => {
  const source = 'export const labels=()=>{\r\nreturn ["F42","F73",].map((id)=>id);\r\n};\r\n'
  const root = consumer(t, Object.fromEntries(['ts', 'mts', 'cts', 'js', 'tsx'].map(ext => [`list.${ext}`, source])), {
    formatter: { indentStyle: 'tab' },
    javascript: { formatter: { quoteStyle: 'double', semicolons: 'always', arrowParentheses: 'always' } }
  })
  const before = errors(root, 'check')
  assert.ok(before.includes('list.ts: format'), before)
  const format = run(root, 'format', '--write')
  assert.equal(format.status, 0, format.stderr)
  const read = ext => readFileSync(join(root, 'src', `list.${ext}`), 'utf8')
  for (const ext of ['ts', 'mts', 'cts']) {
    assert.equal(read(ext), "export const labels = () => {\n  return ['F42', 'F73'].map(id => id)\n}\n")
  }
  for (const ext of ['js', 'tsx']) assert.match(read(ext), /\treturn \["F42", "F73"\]\.map\(\(id\) => id\);/)
  assert.deepEqual(errors(root, 'check'), [])
})

test('отличает безымянные части типов и параметры от именованных типов и значений объектов', t => {
  const root = consumer(t, {
    'union.ts': 'export type Bad = string | ({\n  id: string\n})\n',
    'intersection.mts': 'export type Bad<T> = T & {\n  flightId: string\n}\n',
    'parameter.cts': 'export const read = ({ limit }: {\n  limit: number\n}) => limit\n',
    'object.ts': 'export type Flight = { id: string }\n',
    'allowed.ts': 'type Flight = {\n  id: string\n}\nexport type Result = Flight | null\n' +
      "export type Phase = 'open' | 'closed'\nexport const make = (id: string) => ({ id })\n",
    'ignored.tsx': 'export type Inline = { id: string } | { price: number }\n'
  }, { linter: { rules: { preset: 'none' } } })
  assert.deepEqual(errors(root), [
    'intersection.mts: [TS-NAMED-OBJECT]', 'object.ts: [TS-OBJECT-LINES]',
    'parameter.cts: [TS-NAMED-OBJECT]', 'union.ts: [TS-NAMED-OBJECT]'
  ].sort())
})

test('выбирает форму массива по его элементу, учитывая скобки, readonly и локальные имена', t => {
  const root = consumer(t, {
    'simple.ts': 'export type Ids = Array<string>\n',
    'readonly.ts': 'export type Ids = ReadonlyArray<string>\n',
    'union.ts': 'export type Ids = readonly (string | number)[]\n',
    'allowed.ts': 'export type Id = string | number\nexport type Ids = readonly Id[]\n' +
      'export type Mixed = ReadonlyArray<string | number>\n',
    'shadow.ts': 'type Array<T> = {\n  value: T\n}\nexport type Wrapped = Array<string>\n'
  }, { linter: { rules: { preset: 'none' } } })
  assert.deepEqual(errors(root), ['readonly.ts: [TS-ARRAY]', 'simple.ts: [TS-ARRAY]', 'union.ts: [TS-ARRAY]'])
})

test('различает let и счётчик, проверяет имена и блоки, сохраняя включённые правила приложения', t => {
  const root = consumer(t, {
    'vars.ts': 'let page_limit = 2\nif (page_limit) console.log(page_limit)\n',
    'counter.cts': 'export const sum = () => {\n  let total = 0\n  total += 1\n  return total\n}\n',
    'project.mts': 'debugger\n'
  }, { linter: { rules: { preset: 'none', suspicious: { noDebugger: 'error' } } } })
  assert.deepEqual(errors(root), [
    'project.mts: lint/suspicious/noDebugger', 'vars.ts: lint/style/useBlockStatements',
    'vars.ts: lint/style/useConst', 'vars.ts: lint/style/useNamingConvention'
  ].sort())
})

test('все положительные примеры из обоих руководств проходят biome check без исправлений', t => {
  const files = {}
  for (const doc of ['code', 'types']) {
    const text = readFileSync(join(skill, 'reference', `${doc}.md`), 'utf8')
    for (const [index, match] of [...text.matchAll(/^```ts\n([\s\S]*?)^```$/gm)].entries()) {
      const name = text.slice(0, match.index).match(/`([\w-]+\.ts)`[^\n]*:\n\n$/)?.[1] ?? `${doc}-${index}.ts`
      files[name] = match[1]
    }
  }
  assert.ok(files['board.ts'] && files['flight.ts'])
  assert.deepEqual(errors(consumer(t, files), 'check'), [])
})

function extrasDiagnostics(root) {
  const result = run(root, 'lint', '--reporter=json', '--max-diagnostics=none')
  assert.ok([0, 1].includes(result.status) && result.stdout.trim(), result.stderr)
  const { diagnostics, summary } = JSON.parse(result.stdout)
  assert.equal(summary.diagnosticsNotPrinted, 0)
  assert.equal(result.status, summary.errors ? 1 : 0)
  for (const d of diagnostics.filter(d => d.category === 'plugin')) assert.match(d.message, /^\[TS[-/]/)
  return diagnostics.filter(d => d.category === 'plugin' && d.message.startsWith('[TS-EXTRAS/')).map(d => ({
    location: `${basename(d.location.path)}:${d.location.start.line}`,
    rule: d.message.match(/^\[TS-EXTRAS\/([\w-]+)\]/)[1],
    severity: d.severity
  }))
}

test('правила ts-extras распознают исходные выражения и не угадывают типы неподходящих вызовов', t => {
  const fixtures = Object.fromEntries(['positive.ts', 'negative.ts', 'imported.ts'].map(name =>
    [name, readFileSync(new URL(`./ts-extras-cases/${name}`, import.meta.url), 'utf8')]))
  const expected = fixtures['positive.ts'].split('\n').flatMap((line, i) => {
    const rule = line.match(/\/\/ expect: ([\w-]+)$/)?.[1]
    return rule ? [`positive.ts:${i + 1} ${rule}`] : []
  })
  const results = extrasDiagnostics(consumer(t, fixtures))
  assert.deepEqual(results.map(d => `${d.location} ${d.rule}`).sort(), expected.sort())
  const matrix = readFileSync(join(skill, 'assets/biome/ts-extras.md'), 'utf8')
  const rows = [...matrix.matchAll(/^\| `([\w-]+)` \| (Прямо|Частично|Ревью) \|/gm)]
  assert.equal(new Set(rows.map(m => m[1])).size, 46)
  assert.deepEqual(results.map(d => `${d.rule}:${d.severity}`).sort(),
    rows.map(m => `${m[1]}:${m[2] === 'Ревью' ? 'info' : 'warning'}`).sort())
})

test('сравнения и фильтры: границы, локальный псевдоним, обратные операнды и отсутствие двойных замечаний', t => {
  const cases = [
    ['type Ids = ReadonlyArray<string>'],
    ['export const show = (ids: Ids, value: unknown) => {'],
    ['  if (ids.length) { console.log(ids) }', 'is-non-empty'],
    ['  if (!ids.length) { throw new Error() }', 'is-empty'],
    ['  0 === ids.length', 'is-empty'],
    ['  ids.length != 0', 'is-non-empty'],
    ['  1 <= ids.length', 'is-non-empty'],
    ['  1 < ids.length', 'has-at-least'],
    ['  ids.length >= 999', 'has-at-least'],
    ['  ids.length >= 1000'],
    ['  ids.length < 10'],
    ['  value === undefined || null === value', 'is-present'],
    ["  typeof value !== 'undefined'", 'is-defined'],
    ['  ids.filter(v => v != undefined)', 'is-present-filter'],
    ['  ids.filter(v => v !== null)'],
    ['  return ids.length && value'],
    ['}']
  ]
  const root = consumer(t, { 'case.mts': cases.map(([code]) => code).join('\n') })
  assert.deepEqual(extrasDiagnostics(root).map(d => `${d.location} ${d.rule}`).sort(),
    cases.flatMap(([, name], i) => name ? [`case.mts:${i + 1} ${name}`] : []).sort())
})

test('рабочий профиль действует только на TypeScript; --write не добавляет импорт и не меняет условие', t => {
  const annotated = 'export const boarding = (ids: readonly string[]) => ids.length > 0\n'
  const files = { 'check.ts': annotated, 'check.mts': annotated, 'check.cts': annotated, 'check.tsx': annotated,
    'check.js': "export const list = ['F42']\nexport const boarding = list.length > 0\n" }
  const root = consumer(t, files)
  assert.deepEqual(extrasDiagnostics(root).map(d => `${d.location} ${d.rule}`).sort(), [
    'check.cts:1 is-non-empty', 'check.mts:1 is-non-empty', 'check.ts:1 is-non-empty'
  ])
  const result = run(root, 'lint', '--write')
  assert.equal(result.status, 0, result.stderr)
  for (const [name, code] of Object.entries(files)) assert.equal(readFileSync(join(root, 'src', name), 'utf8'), code)
})

test('настройка приложения отключает конкретные коды, сохраняя соседние проверки из тех же групп', t => {
  const root = consumer(t, { 'scope.ts': [
    'export const check = (ids: string[], input: unknown) => {',
    '  const hasItems = ids.length > 0',
    '  const empty = ids.length === 0',
    "  if (!(input instanceof Error)) { throw new TypeError('Ожидалась ошибка') }",
    "  if (!hasItems) { throw new Error('Пустая очередь') }",
    '  return empty',
    '}'
  ].join('\n') })
  const codes = () => extrasDiagnostics(root).map(d => d.rule).sort()
  assert.deepEqual(codes(), ['assert', 'assert-error', 'is-empty', 'is-non-empty'])
  writeFileSync(join(root, 'tools/ts-standarts/ts-extras.settings.js'),
    "export const disabledRules = new Set(['is-non-empty', 'assert-error'])\n")
  assert.deepEqual(codes(), ['assert', 'is-empty'])
})

test('редакторский проект показывает замечания только в problems.ts, включая подсказку для ревью', () => {
  const cwd = fileURLToPath(new URL('./', import.meta.url))
  const result = spawnSync(process.execPath, [cli, 'lint', '--reporter=json', '--max-diagnostics=none'], { cwd, encoding: 'utf8' })
  if (result.error) throw result.error
  assert.equal(result.status, 1, result.stderr)
  const { diagnostics, summary } = JSON.parse(result.stdout)
  assert.equal(summary.diagnosticsNotPrinted, 0)
  assert.deepEqual([...new Set(diagnostics.map(d => basename(d.location.path)))], ['problems.ts'])
  assert.ok(diagnostics.some(d => d.category === 'lint/style/useConst'))
  assert.ok(diagnostics.some(d => d.message.startsWith('[TS-EXTRAS/is-non-empty]') && d.severity === 'warning'))
  assert.ok(diagnostics.some(d => d.message.startsWith('[TS-EXTRAS/assert-error]') && d.severity === 'info'))
  assert.ok(diagnostics.some(d => d.message.startsWith('[TS-NAMED-OBJECT]') && d.severity === 'error'))
})
