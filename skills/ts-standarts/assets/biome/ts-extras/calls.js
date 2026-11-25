import { nullishCheck } from './conditions.js'
import { acceptsUnknownGuard, facts, joinable, knownSearch, ordinaryLiteral, ownRows, simpleNumeric, staticKey, truthyCanNarrow } from './receivers.js'
import { argsOf, arrowParameter, diagnostic, expr, globalName, identifier, importedName, member, numberLiteral, plainString } from './syntax.js'

const helper = {
  at: ['array-at', 'arrayAt'], concat: ['array-concat', 'arrayConcat'], join: ['array-join', 'arrayJoin'],
  includes: ['array-includes', 'arrayIncludes'], indexOf: ['array-index-of', 'arrayIndexOf'],
  lastIndexOf: ['array-last-index-of', 'arrayLastIndexOf'], split: ['string-split', 'stringSplit'],
  endsWith: ['string-ends-with', 'stringEndsWith'], startsWith: ['string-starts-with', 'stringStartsWith']
}
const numeric = {
  isFinite: 'is-finite', isInteger: 'is-integer', isSafeInteger: 'is-safe-integer'
}
const objectMethods = {
  keys: ['object-keys', 'objectKeys'], values: ['object-values', 'objectValues'],
  entries: ['object-entries', 'objectEntries'], fromEntries: ['object-from-entries', 'objectFromEntries'],
  assign: ['object-assign', 'objectAssign'], hasOwn: ['object-has-own', 'objectHasOwn']
}
const isObject = info => ['array', 'object', 'set', 'map'].includes(info?.kind)

function builtinCall(node, base, method, args, model) {
  if (base === 'Number' && Object.hasOwn(numeric, method) && args.length === 1) {
    diagnostic(node, numeric[method], method)
  } else if (base === 'Array' && method === 'isArray' && args.length === 1) {
    const info = facts(args[0], model)
    if (info?.kind === 'unknown' || (info?.kind === 'array' && info.readonly) ||
      info?.parts?.some(p => p.kind === 'array' && p.readonly)) {
      diagnostic(node, 'array-is-array', 'arrayIsArray')
    }
  } else if (base === 'Reflect' && method === 'has') {
    if (args.length === 2 && isObject(facts(args[0], model)) && staticKey(args[1]) !== undefined) {
      diagnostic(node, 'object-has-in', 'objectHasIn')
    }
  } else if (base === 'Object' && Object.hasOwn(objectMethods, method)) {
    const info = facts(args[0], model)
    if (method === 'hasOwn' && !(args.length === 2 && isObject(info))) return
    if (method === 'fromEntries' && !(args.length === 1 && (info?.kind === 'array' || info?.kind === 'map'))) return
    if (method === 'assign' && !(args.length >= 2 && info?.kind === 'object' && args.slice(1).every(ordinaryLiteral))) return
    if (['keys', 'entries', 'values'].includes(method) && !(args.length === 1 && isObject(info))) return
    diagnostic(node, ...objectMethods[method])
  }
}

function filter(node, receiver, info, callback, model) {
  if (globalName(callback, model) === 'Boolean') {
    if (truthyCanNarrow(info.element)) {
      diagnostic(node, 'is-truthy', 'isTruthy', 'Сохранит отбор по истинности, в том числе отбросит 0 и пустую строку.')
    }
    return
  }
  const arrow = expr(callback)
  const id = arrowParameter(arrow)
  if (id?.kind !== 'JS_IDENTIFIER_BINDING') return
  const body = expr(arrow.body)
  const check = nullishCheck(body, model)
  if (check?.positive && ['defined', 'present'].includes(check.kind)) {
    const suffix = check.kind === 'defined' ? 'Defined' : 'Present'
    if (identifier(check.target)?.text === id.text) {
      diagnostic(callback, `is-${check.kind}-filter`, `is${suffix}`)
      return
    }
    const field = member(check.target)
    if (field && identifier(field.object)?.text === id.text && ownRows(receiver, field.member.text)) {
      diagnostic(callback, `is-property-${check.kind}`, `isProperty${suffix}('${field.member.text}')`)
    }
  } else if (body?.kind === 'JS_UNARY_EXPRESSION' && body.operatorToken === '!') {
    const call = expr(body.argument)
    const args = argsOf(call)
    if (args?.length === 1 && identifier(args[0])?.text === id.text && acceptsUnknownGuard(call.callee, model)) {
      diagnostic(callback, 'not', 'not', 'Обращай только предикат, корректно описывающий обе ветки.')
    }
  }
}

function entryPipeline(node, args, model) {
  if (args.length !== 1 || importedName(identifier(node.callee), 'ts-extras', model) !== 'objectFromEntries') return
  const map = expr(args[0])
  const mapArgs = argsOf(map)
  const m = member(map?.callee)
  if (mapArgs?.length !== 1 || m?.member.text !== 'map') return
  const entries = expr(m.object)
  const input = argsOf(entries)
  if (input?.length !== 1 || importedName(identifier(entries.callee), 'ts-extras', model) !== 'objectEntries') return
  if (!ordinaryLiteral(facts(input[0], model)?.literal)) return
  const arrow = expr(mapArgs[0])
  const binding = arrowParameter(arrow)
  if (binding?.kind !== 'JS_ARRAY_BINDING_PATTERN' || binding.elements.length !== 2) return
  const [key, value] = binding.elements
  if (key.pattern?.kind !== 'JS_IDENTIFIER_BINDING' || value.pattern?.kind !== 'JS_IDENTIFIER_BINDING' || key.init || value.init) return
  let pair = expr(arrow.body)
  if (pair?.kind === 'JS_FUNCTION_BODY' && pair.statements.length === 1 && pair.statements[0].kind === 'JS_RETURN_STATEMENT') {
    pair = expr(pair.statements[0].argument)
  }
  if (pair?.kind === 'JS_ARRAY_EXPRESSION' && pair.elements.length === 2 && identifier(pair.elements[0])?.text === key.pattern.text &&
    !['JS_ARRAY_HOLE', 'JS_SPREAD'].includes(pair.elements[1].kind)) {
    diagnostic(node, 'object-map-values', 'objectMapValues', 'Сохрани вычисление значения; обработчик получает сначала значение, затем ключ.')
  }
}

export function callRule(node, model) {
  const args = argsOf(node)
  if (!args) return
  const m = member(node.callee)
  if (!m) return entryPipeline(node, args, model)
  const method = m.member.text
  const base = globalName(m.object, model)
  if (base) return builtinCall(node, base, method, args, model)
  if (!Object.hasOwn(helper, method) && method !== 'has' && method !== 'filter') return
  const info = facts(m.object, model)
  if (!info) return
  if (method === 'filter' && info.kind === 'array' && args.length === 1) return filter(node, m.object, info, args[0], model)
  if (method === 'has' && ['map', 'set'].includes(info.kind) && args.length === 1 && knownSearch(info, args[0], model)) {
    return diagnostic(node, `${info.kind}-has`, info.kind === 'map' ? 'mapHas' : 'setHas')
  }
  if (!Object.hasOwn(helper, method)) return
  if (info.kind === 'array') {
    if (method === 'at' && !(args.length === 1 && simpleNumeric(args[0], model))) return
    if (method === 'concat' && !args.every(arg => ['array', 'string', 'number', 'boolean'].includes(facts(arg, model)?.kind))) return
    if (method === 'join' && (!joinable(info, model) ||
      !(args.length === 0 || (args.length === 1 && facts(args[0], model)?.kind === 'string')))) return
    if (['includes', 'indexOf', 'lastIndexOf'].includes(method)) {
      if (!args.length || args.length > 2 || !knownSearch(info, args[0], model) || (args[1] && !simpleNumeric(args[1], model))) return
    }
    if (!['at', 'concat', 'join', 'includes', 'indexOf', 'lastIndexOf'].includes(method)) return
  } else if (info.kind === 'string' && ['split', 'startsWith', 'endsWith'].includes(method)) {
    if (args.length > 2 || (!args.length && method !== 'split')) return
    if (args[0] && facts(args[0], model)?.kind !== 'string') return
    if (args[1] && !simpleNumeric(args[1], model)) return
  } else return
  diagnostic(node, ...helper[method])
}

export function tupleRead(node, model) {
  if (node.optionalChainToken || !facts(node.object, model)?.tuple) return
  let parent = node.parent
  while (['JS_PARENTHESIZED_EXPRESSION', 'TS_NON_NULL_ASSERTION_EXPRESSION', 'TS_AS_EXPRESSION',
    'TS_TYPE_ASSERTION_EXPRESSION', 'TS_SATISFIES_EXPRESSION', 'TS_INSTANTIATION_EXPRESSION'].includes(parent?.kind)) parent = parent.parent
  if (parent?.kind === 'JS_UNARY_EXPRESSION' && parent.operatorToken === 'delete') return
  // tuple[0]() и tuple[0]`...` передают массив как this.
  if (['JS_CALL_EXPRESSION', 'JS_NEW_EXPRESSION', 'JS_TEMPLATE_EXPRESSION'].includes(parent?.kind)) return
  const index = expr(node.member)
  if (numberLiteral(index) === 0 || plainString(index) === '0') {
    diagnostic(node, 'array-first', 'arrayFirst')
  } else if (index?.kind === 'JS_BINARY_EXPRESSION' && index.operatorToken === '-' && numberLiteral(index.right) === 1) {
    const length = member(index.left)
    const id = identifier(node.object)
    if (id && length?.member.text === 'length' && identifier(length.object)?.text === id.text) {
      diagnostic(node, 'array-last', 'arrayLast')
    }
  }
}
