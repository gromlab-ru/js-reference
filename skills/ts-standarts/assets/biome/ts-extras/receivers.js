import { expr, globalName, identifier, plainString } from './syntax.js'

const builtin = new Map([
  ['Array', 'array'], ['ReadonlyArray', 'array'], ['Map', 'map'], ['ReadonlyMap', 'map'],
  ['Set', 'set'], ['ReadonlySet', 'set'], ['Record', 'object'], ['RegExp', 'regexp']
])
const primitives = new Map([
  ['TS_STRING_TYPE', 'string'], ['TS_STRING_LITERAL_TYPE', 'string'], ['TS_TEMPLATE_LITERAL_TYPE', 'string'],
  ['TS_NUMBER_TYPE', 'number'], ['TS_NUMBER_LITERAL_TYPE', 'number'], ['TS_BOOLEAN_TYPE', 'boolean'],
  ['TS_BOOLEAN_LITERAL_TYPE', 'boolean'], ['TS_UNKNOWN_TYPE', 'unknown'], ['TS_NULL_LITERAL_TYPE', 'null'],
  ['TS_UNDEFINED_TYPE', 'undefined'], ['TS_OBJECT_TYPE', 'object'], ['TS_NON_PRIMITIVE_TYPE', 'object']
])

// Только локально доказуемые типы. Бюджет ограничивает обход рекурсивных и ветвящихся псевдонимов.
function describe(type, model, budget) {
  if (!type || budget.left-- <= 0) return
  if (type.kind === 'TS_PARENTHESIZED_TYPE') return describe(type.ty, model, budget)
  if (type.kind === 'TS_TYPE_OPERATOR_TYPE' && type.operatorToken === 'readonly') {
    const part = describe(type.ty, model, budget)
    return part && { ...part, readonly: true }
  }
  if (type.kind === 'TS_ARRAY_TYPE') return { kind: 'array', element: type.elementType }
  if (type.kind === 'TS_TUPLE_TYPE') return { kind: 'array', tuple: true }
  if (type.kind === 'TS_UNION_TYPE') {
    const parts = type.types.map(part => describe(part, model, budget))
    if (parts.some(part => !part)) return
    const first = parts[0]
    if (!first || parts.some(part => part.kind !== first.kind)) return { kind: 'union', parts }
    if (first.kind === 'array' && parts.some(part => !!part.tuple !== !!first.tuple)) return
    return { kind: first.kind, parts, tuple: parts.some(part => part.tuple), readonly: parts.some(part => part.readonly) }
  }
  if (type.kind === 'TS_REFERENCE_TYPE' && type.name?.kind === 'JS_REFERENCE_IDENTIFIER') {
    const name = type.name.valueToken
    const decl = model.binding(type.name)?.syntax().parent
    if (!decl) {
      const kind = builtin.get(name)
      if (kind) return { kind, element: type.typeArguments?.tsTypeArgumentList[0], readonly: name.startsWith('Readonly') }
    }
    if (decl?.kind === 'TS_TYPE_ALIAS_DECLARATION' && !decl.typeParameters) return describe(decl.ty, model, budget)
    if (decl?.kind === 'TS_INTERFACE_DECLARATION') return { kind: 'object' }
    return
  }
  if (primitives.has(type.kind)) return { kind: primitives.get(type.kind), type }
}

function inspect(node, model, budget) {
  const value = expr(node)
  if (!value || budget.left-- <= 0) return
  switch (value.kind) {
    case 'JS_ARRAY_EXPRESSION': return { kind: 'array', literal: value }
    case 'JS_OBJECT_EXPRESSION': return { kind: 'object', literal: value }
    case 'JS_STRING_LITERAL_EXPRESSION': return { kind: 'string' }
    case 'JS_TEMPLATE_EXPRESSION': return value.tag ? undefined : { kind: 'string' }
    case 'JS_REGEX_LITERAL_EXPRESSION': return { kind: 'regexp' }
    case 'JS_NUMBER_LITERAL_EXPRESSION': return { kind: 'number' }
    case 'JS_BOOLEAN_LITERAL_EXPRESSION': return { kind: 'boolean' }
    case 'TS_SATISFIES_EXPRESSION': return inspect(value.expression, model, budget)
    case 'TS_AS_EXPRESSION': {
      if (value.ty?.text !== 'const') return
      const part = inspect(value.expression, model, budget)
      return part && { ...part, readonly: true, tuple: part.kind === 'array' }
    }
    case 'JS_NEW_EXPRESSION': {
      const kind = builtin.get(globalName(value.callee, model))
      if (kind === 'map' || kind === 'set' || kind === 'array') return { kind, element: value.typeArguments?.tsTypeArgumentList[0] }
      return
    }
    case 'JS_IDENTIFIER_EXPRESSION': {
      const decl = value.name && model.binding(value.name)?.syntax().parent
      if (decl?.kind === 'JS_FORMAL_PARAMETER' || decl?.kind === 'JS_REST_PARAMETER') {
        if (!decl.questionMarkToken) return describe(decl.typeAnnotation?.ty, model, budget)
      }
      if (decl?.kind === 'JS_VARIABLE_DECLARATOR') {
        if (decl.variableAnnotation) return describe(decl.variableAnnotation.ty, model, budget)
        if (decl.parent?.parent?.kindToken === 'const') return inspect(decl.initializer?.expression, model, budget)
      }
    }
  }
}

export const facts = (node, model) => inspect(node, model, { left: 48 })

export function joinable(info, model) {
  const allowed = ['string', 'number', 'boolean', 'null', 'undefined']
  if (info.element) {
    const part = describe(info.element, model, { left: 48 })
    return (part?.parts ?? [part]).every(item => allowed.includes(item?.kind))
  }
  const elements = info.literal?.elements
  return elements && elements.length <= 64 && elements.every(item =>
    item.kind === 'JS_NULL_LITERAL_EXPRESSION' || allowed.includes(facts(item, model)?.kind))
}

// Смешанный тип ключа может неправильно сузиться в ветке отказа mapHas/setHas.
// Не предлагаем замену, если не знаем даже локального типа искомого значения.
export function knownSearch(info, arg, model) {
  const value = expr(arg)
  if (!identifier(value) && !['JS_STRING_LITERAL_EXPRESSION', 'JS_NUMBER_LITERAL_EXPRESSION',
    'JS_BOOLEAN_LITERAL_EXPRESSION'].includes(value?.kind)) return false
  const actual = facts(value, model)?.kind
  if (actual === 'unknown') return true
  if (!['string', 'number', 'boolean'].includes(actual)) return false
  if (info.element) return describe(info.element, model, { left: 48 })?.kind === actual
  const elements = info.literal?.elements
  return elements?.length > 0 && elements.length <= 64 && elements.every(item => facts(item, model)?.kind === actual)
}

export function ordinaryLiteral(node) {
  const value = expr(node)
  return value?.kind === 'JS_OBJECT_EXPRESSION' && value.members.every(p =>
    (p.kind === 'JS_SHORTHAND_PROPERTY_OBJECT_MEMBER' && p.name?.text !== '__proto__') ||
    (p.kind === 'JS_PROPERTY_OBJECT_MEMBER' && p.name?.kind === 'JS_LITERAL_MEMBER_NAME' && /^[\w$]+$/u.test(p.name.text) && p.name.text !== '__proto__'))
}

export function truthyCanNarrow(type) {
  if (type?.kind === 'TS_PARENTHESIZED_TYPE') return truthyCanNarrow(type.ty)
  if (type?.kind === 'TS_UNION_TYPE') return type.types.some(truthyCanNarrow)
  if (['TS_UNKNOWN_TYPE', 'TS_NULL_LITERAL_TYPE', 'TS_UNDEFINED_TYPE', 'TS_BOOLEAN_TYPE'].includes(type?.kind)) return true
  if (type?.kind === 'TS_BOOLEAN_LITERAL_TYPE') return type.literal === 'false'
  if (type?.kind === 'TS_STRING_LITERAL_TYPE') return type.literalToken === "''" || type.literalToken === '""'
  if (type?.kind === 'TS_NUMBER_LITERAL_TYPE') return Number(type.literalToken?.replaceAll('_', '')) === 0
  return type?.kind === 'TS_BIGINT_LITERAL_TYPE' && type.literalToken === '0n'
}

export function simpleNumeric(node, model) {
  const value = expr(node)
  return facts(value, model)?.kind === 'number' ||
    (value?.kind === 'JS_UNARY_EXPRESSION' && value.operatorToken === '-' && value.argument?.kind === 'JS_NUMBER_LITERAL_EXPRESSION')
}

export function staticKey(node) {
  const key = plainString(node)
  if (key !== undefined && key !== 'constructor' && key !== '__proto__') return key
}

// Предикаты свойств читают только собственное поле данных; тип интерфейса не исключает геттер или прототип.
export function ownRows(node, key) {
  const rows = expr(node)
  return rows?.kind === 'JS_ARRAY_EXPRESSION' && rows.elements.length > 0 && rows.elements.every(row =>
    row.kind === 'JS_OBJECT_EXPRESSION' && row.members.every(p =>
      p.kind === 'JS_PROPERTY_OBJECT_MEMBER' && p.name?.kind === 'JS_LITERAL_MEMBER_NAME' && p.name.text !== '__proto__'
    ) && row.members.some(p => p.name.text === key))
}

export function acceptsUnknownGuard(node, model) {
  const id = identifier(node)
  const declaration = id && model.binding(id)?.syntax().parent
  const fn = declaration?.kind === 'JS_VARIABLE_DECLARATOR' ? expr(declaration.initializer?.expression) : declaration
  const params = fn?.parameters?.items
  return fn?.returnTypeAnnotation?.ty?.kind === 'TS_PREDICATE_RETURN_TYPE' && params?.length === 1 &&
    params[0].typeAnnotation?.ty?.kind === 'TS_UNKNOWN_TYPE'
}
