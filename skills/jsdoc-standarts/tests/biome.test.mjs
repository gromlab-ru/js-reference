import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const skill = fileURLToPath(new URL('../', import.meta.url))
const cli = process.env.BIOME_BINARY || 'biome'

// Каждый запуск имитирует проект потребителя. Из репозитория ему доступны только два поставляемых ресурса.
function lint(t, files, { command = 'lint', standalone = false, projectRules = { preset: 'none' } } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'jsdoc consumer '))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const preset = 'tools/jsdoc/jsdoc.json'
  for (const name of ['jsdoc.json', 'jsdoc.js']) {
    const target = standalone ? join(root, name === 'jsdoc.json' ? 'biome.json' : name) : join(root, 'tools/jsdoc', name)
    mkdirSync(dirname(target), { recursive: true })
    cpSync(join(skill, 'assets/biome', name), target)
  }
  if (!standalone) {
    writeFileSync(join(root, 'biome.json'), JSON.stringify({
      extends: [`./${preset}`],
      ...(projectRules ? { linter: { rules: projectRules } } : {})
    }))
  }
  for (const [name, text] of Object.entries(files)) {
    const target = join(root, name)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, text)
  }
  const args = [command, '--reporter=json', '--max-diagnostics=none']
  if (command === 'check') args.push('--formatter-enabled=false', '--assist-enabled=false')
  const run = spawnSync(cli, [...args, '.'], { cwd: root, encoding: 'utf8' })
  if (run.error) throw run.error
  assert.ok([0, 1].includes(run.status) && run.stdout.trim(), run.stderr)
  const { diagnostics, summary } = JSON.parse(run.stdout)
  assert.equal(run.status, summary.errors ? 1 : 0, run.stderr)
  assert.equal(summary.diagnosticsNotPrinted, 0)
  return diagnostics.map(d => ({
    rule: d.category === 'plugin' ? d.message.match(/^\[JSDOC-([A-Z]+)\]/)?.[1] : d.category,
    file: basename(d.location.path),
    line: d.location.start.line,
    message: d.message
  }))
}

test('готовый профиль работает из каталога проекта с пробелом и дополняет правила проекта', t => {
  const files = {
    'src/price.mts': '/** Ставка. **/\nexport const RATE = 1\ndebugger\n',
    'src/shipment.cts': 'interface Shipment {}\n',
    'src/ignored.js': 'export const ordinaryJavaScript = 1\n'
  }
  const issues = lint(t, files, { command: 'check', projectRules: { preset: 'none', suspicious: { noDebugger: 'error' } } })
  assert.deepEqual(issues.map(d => [d.file, d.rule]).sort(), [
    ['price.mts', 'BLOCK'], ['price.mts', 'lint/correctness/useSingleJsDocAsterisk'],
    ['price.mts', 'lint/suspicious/noDebugger'], ['shipment.cts', 'MISSING']
  ].sort())
})

test('комментарии из руководств проходят, включая объявление в начале файла', t => {
  const files = {}
  const ref = join(skill, 'reference')
  for (const name of readdirSync(ref).filter(n => n.endsWith('.md'))) {
    const text = readFileSync(join(ref, name), 'utf8')
    for (const [index, [, lang, snippet]] of [...text.matchAll(/^```(tsx?)\n([\s\S]*?)^```/gm)].entries()) {
      let code = snippet
      if (lang === 'tsx' && !snippet.includes('export ')) {
        code += 'export const DeliveryFee = ({feeKopecks}: Props) => <span>{feeKopecks}</span>\n'
      }
      files[`src/${name}-${index}.${lang}`] = code
    }
  }
  assert.ok(Object.keys(files).length > 5)
  assert.deepEqual(lint(t, files), [])
})

test('чистый проект наследует подключённый плагин без других настроек', t => {
  assert.deepEqual(lint(t, { 'src/index.ts': 'export function run() {}\n' }, { projectRules: null })
    .map(d => [d.file, d.line, d.rule]), [['index.ts', 1, 'MISSING']])
})

test('тот же конфиг работает как основной biome.json без extends', t => {
  assert.deepEqual(lint(t, { 'index.ts': 'export const batchLimit = 2\n' }, { standalone: true })
    .map(d => [d.file, d.rule]), [['index.ts', 'MISSING']])
})

test('сверяет сигнатуры, позицию деструктуризации и форму абзацев; не читает код внутри Markdown', t => {
  const good = [
    '/**', ' * Выбирает заявки.', ' *', ' * ```ts', ' * `староеИмя`: только пример', ' * @param x', ' * ```', ' *',
    ' * `ids`: очередь.', ' *', ' * Аргумент 2: параметры.', ' *   - `limit` пропущен — вернуть очередь',
    ' *     целиком', ' *', ' * Аргумент 3: окно погрузки.', ' *', ' * `rest`: запасные заявки.', ' */',
    'export function batch(this: void, ids: string[], {limit: size = 1}: Options, [start]: Window, ...rest: string[]) {}'
  ].join('\r\n')
  const issues = lint(t, {
    'yes.ts': good,
    'name.ts': good.replace('Аргумент 2:', '`size`:'),
    'order.ts': good.replace('Аргумент 2:', 'Аргумент 4:'),
    'empty.ts': good.replace('`ids`: очередь.', '`ids`:'),
    'list.ts': good.replace(' *   - `limit`', ' * - `limit`'),
    'tag.ts': good.replace(' * `rest`: запасные заявки.', ' * @param {string[]} rest заявки'),
    'meaning.ts': '/**\n * Читает очередь без изменений.\n *\n * `ids`: заявки.\n */\nexport const peek = (ids: string[]) => ids.shift()\n'
  })
  assert.deepEqual(issues.map(d => [d.file, d.rule]).sort(), [
    ['name.ts', 'ARGS'], ['order.ts', 'ARGS'], ['empty.ts', 'PARAGRAPH'], ['list.ts', 'LIST'],
    ['tag.ts', 'TAGS'], ['tag.ts', 'ARGS']
  ].sort())
  assert.match(issues.find(d => d.file === 'name.ts').message, /Аргумент 2/)
})

test('у членов, пересечений, конструктора и перегрузок разные места для комментария', t => {
  const files = {
    'types.ts': [
      '/**', ' * Выгрузка заявок.', ' */', 'export type Manifest = Base & {',
      '  /** Число заявок. */', '  count: number', '  tag: string', '}',
      '/**', ' * Статусы заявки.', ' */', 'export enum State {', '  /**', '   * В очереди.', '   */', '  Queued', '}'
    ].join('\n'),
    'objects.ts': [
      '/**', ' * Настройки.', ' */', 'export const cfg = Object.freeze({',
      '  /** Лимит заявок. */', '  limit: 5,', '  retries: 2', '} as const)'
    ].join('\n'),
    'class.ts': [
      '/**', ' * Очередь рейса.', ' */', 'export default class Queue {',
      '  /**', '   * Открывает очередь рейса.', '   *', '   * `id`: рейс.', '   */',
      '  constructor(readonly id: string) {}', '  current = 0',
      '  /**', '   * Закрывает очередь.', '   */', '  close() {}', '}'
    ].join('\n'),
    'overloads.ts': [
      '/**', ' * Читает по номеру.', ' *', ' * `id`: номер.', ' */', 'export function get(id: number): number',
      '/**', ' * Читает по коду.', ' *', ' * `code`: код.', ' */', 'export function get(code: string): string',
      'export function get(input: number | string) { return input }'
    ].join('\n'),
    'type-fn.ts': '/**\n * Извещает о выдаче.\n *\n * `old`: заявка.\n */\nexport type Done = (id: string) => void\n',
    'detached.ts': '/** Заголовок модуля. */\n\nexport interface Detached {}\n'
  }
  const issues = lint(t, files)
  assert.deepEqual(issues.map(d => [d.file, d.line, d.rule]).sort(), [
    ['types.ts', 7, 'MISSING'], ['types.ts', 13, 'BLOCK'], ['objects.ts', 7, 'MISSING'],
    ['class.ts', 11, 'MISSING'], ['type-fn.ts', 1, 'ARGS'], ['detached.ts', 3, 'MISSING']
  ].sort())
})

test('у каждого события есть один пункт с пояснением в порядке объявления', t => {
  const type = [
    'export type DeliveryEvent =', "  | 'shipment.created'", "  | 'shipment.accepted_by_carrier'",
    "  | 'shipment.arrived_at_sorting_center'", "  | 'shipment.received_by_recipient'"
  ].join('\n')
  const points = [
    ' * - `shipment.created` — отправление зарегистрировано',
    ' * - `shipment.accepted_by_carrier` — перевозчик принял посылку',
    ' * - `shipment.arrived_at_sorting_center` — посылка поступила в центр',
    ' * - `shipment.received_by_recipient` — подтверждено вручение получателю'
  ]
  const example = lines => ['/**', ' * Событие доставки.', ' *', ...lines, ' */', type].join('\n')
  const issues = lint(t, {
    'good.ts': example([...points, ' *   лично', ' *', ' * @see DeliveryHistory']),
    'none.ts': example([]),
    'missing.ts': example([points[0], points[1], points[3]]),
    'wrong-order.ts': example([points[1], points[0], ...points.slice(2)]),
    'duplicate.ts': example([...points, points[0]]),
    'extra.ts': example([...points, ' * - `shipment.lost` — посылку не нашли']),
    'empty.ts': example([...points.slice(0, 3), ' * - `shipment.received_by_recipient` —']),
    'no-gap.ts': example(points).replace('\n *\n', '\n'),
    'in-example.ts': example([' * ```md', ...points, ' * ```']),
    'after-tag.ts': example([' * @example', ...points]),
    'no-quotes.ts': example([points[0].replaceAll('`', ''), ...points.slice(1)])
  })
  assert.deepEqual(issues.map(d => [d.file, d.rule]).sort(), [
    ['none.ts', 'VARIANTS'], ['missing.ts', 'VARIANTS'], ['wrong-order.ts', 'VARIANTS'],
    ['duplicate.ts', 'VARIANTS'], ['extra.ts', 'VARIANTS'], ['empty.ts', 'LIST'],
    ['in-example.ts', 'VARIANTS'], ['after-tag.ts', 'VARIANTS'], ['no-quotes.ts', 'VARIANTS'], ['no-gap.ts', 'PARAGRAPH']
  ].sort())
  assert.match(issues.find(d => d.file === 'missing.ts').message, /shipment\.arrived_at_sorting_center/)
})

test('сверяет числовые и строковые литералы, но не требует списка у других объединений', t => {
  const bare = '/**\n * Значение из журнала доставки.\n */\n'
  const numeric = [
    '/**', ' * Коды выхода сортировщика.', ' *', ' * - `-1` — выход ещё не выбран',
    ' * - `0` — выдача на станции', ' * - `0x10` — отправка на следующую станцию', ' */',
    'type Route = (-1 | (0 | 0x10))'
  ].join('\n')
  const mixed = [
    '/**', ' * Коды старого и нового форматов.', ' *', " * - `'1'` — строковый код",
    ' * - `1` — числовой код', " * - `''` — код не передан", ' */', "type Code = '1' | 1 | ''"
  ].join('\n')
  const issues = lint(t, {
    'numeric.ts': numeric, 'missing-number.ts': numeric.replace(' * - `0` — выдача на станции\n', ''),
    'mixed.ts': mixed, 'ambiguous.ts': mixed.replace("`'1'`", '`1`'),
    'nullable.ts': bare + 'type Deadline = Date | null',
    'alias.ts': bare + 'type Dispatch = Departure | Arrival',
    'number-type.ts': bare + "type Quantity = 'unset' | number",
    'single.ts': bare + "type Created = 'shipment.created'",
    'field.ts': bare + "type Route = {\n  /** Направление. */\n  leg: 'out' | 'back'\n}"
  })
  assert.deepEqual(issues.map(d => [d.file, d.rule]).sort(), [
    ['missing-number.ts', 'VARIANTS'], ['ambiguous.ts', 'VARIANTS']
  ].sort())
})

test('в TSX различает JSX компонента, хук и JSX внутри переданной функции', t => {
  const componentDoc = '/**\n * Показывает статус заявки.\n *\n * Используется для:\n *  - проверки перед погрузкой\n */\n'
  const files = {
    'good.tsx': componentDoc + 'export const Badge = ({id}: Props) => <span>{id}</span>\n',
    'missing.tsx': '/**\n * Показывает статус.\n */\nexport function Badge({id}: Props) { if (id) return <i/>; return null }\n',
    'many.tsx': componentDoc.replace(' */', ' *  - двух\n *  - трёх\n *  - четырёх\n */') + 'export const Badge = memo(() => null)\n',
    'props.tsx': componentDoc.replace(' */', ' *\n * Аргумент 1: свойства.\n */') + 'export const Badge = () => <i/>\n',
    'default.tsx': '/**\n * Показывает очередь.\n */\nexport default () => <span />\n',
    'wrapped.tsx': '/**\n * Показывает очередь.\n */\nexport default React.forwardRef((props, ref) => <div ref={ref} />)\n',
    'hook.tsx': componentDoc + 'export function useBadge() { return 1 }\n',
    'helper.tsx': '/**\n * Возвращает размер.\n *\n * `ids`: заявки.\n */\nexport function Count(ids: string[]) { ids.map(id => <i>{id}</i>); return ids.length }\n'
  }
  assert.deepEqual(lint(t, files).map(d => [d.file, d.rule]).sort(), [
    ['missing.tsx', 'REACT'], ['many.tsx', 'REACT'], ['props.tsx', 'REACT'], ['hook.tsx', 'REACT'],
    ['default.tsx', 'REACT'], ['wrapped.tsx', 'REACT']
  ].sort())
})

test('проверяет собственные объявления, но не требует JSDoc у временных данных и реэкспортов', t => {
  const files = {
    'exports.ts': 'const batchSize = 10\nconst localPrice = 5\nexport {batchSize as limit}\nexport {carrier} from "./other"\n',
    'enum.ts': '/**\n * Состояние рейса.\n */\nexport enum Flight {\n Active = 1\n}\n',
    'getter.ts': [
      '/**', ' * Очередь.', ' */', 'export class Queue {',
      '  /** Устанавливает лимит. */', '  set limit(count: number) {}',
      '  /**', '   * Возвращает лимит.', '   */', '  get limit(): number { return 2 }', '}'
    ].join('\n'),
    'properties.ts': '/**\n * @property {number} price\n */\nexport interface Rate {\n  /** Цена. */\n  price: number\n}\n',
    'values.ts': '/**\n * Параметры отправки.\n */\nexport type Options = {\n  /**\n   * Плата.\n   *\n   *   - `0` — бесплатно\n   */\n  fee: number\n}\n',
    'local.ts': '/**\n * Считает позиции.\n *\n * `ids`: заявки.\n */\nfunction count(ids: string[]) { const cache = { len: ids.length }; return cache.len }\n'
  }
  assert.deepEqual(lint(t, files).map(d => [d.file, d.rule]).sort(), [
    ['exports.ts', 'MISSING'], ['enum.ts', 'MISSING'], ['getter.ts', 'BLOCK'], ['getter.ts', 'ARGS'],
    ['properties.ts', 'SUMMARY'], ['properties.ts', 'TAGS'], ['values.ts', 'LIST']
  ].sort())
})

test('дополнительные теги JSDoc работают рядом с каноном, включая расширения сторонних инструментов', t => {
  const source = [
    '/**', ' * Читает заявку, см. {@link Order}.', ' *', ' * `id`: номер заявки.', ' *',
    ' * @param id Номер заявки для подсказки параметра.', ' * @returns Найденная заявка.',
    ' * @throws {RangeError} Если номер отрицательный.', ' * @see {@link loadBatch}', ' * @deprecated Используй loadBatch.',
    ' * @internal', ' * @since 1.2.0', ' * @team-custom delivery', ' * @example', ' * ```ts',
    ' * const sample = `@param {number} old`', ' * `old`: не абзац аргумента', ' * ```', ' */',
    'export function load(id: number): number { return id }'
  ].join('\n')
  assert.deepEqual(lint(t, {
    'ok.ts': source,
    'typed-return.ts': source.replace('@returns Найденная', '@returns {number} Найденная'),
    'only-tag.ts': source.replace(' * `id`: номер заявки.', ' *'),
    'js.js': '/** @param {number} id Номер заявки. */\nexport function load(id) { return id }\n'
  }).map(d => [d.file, d.rule]).sort(), [['typed-return.ts', 'TAGS'], ['only-tag.ts', 'ARGS']].sort())
})
