import { registerDiagnostic } from '@biomejs/runtime/plugin'
import { disabledRules } from '../ts-extras.settings.js'

export function expr(node) {
  while (node?.kind === 'JS_PARENTHESIZED_EXPRESSION') node = node.expression
  return node
}

export function identifier(node) {
  const value = expr(node)
  return value?.kind === 'JS_IDENTIFIER_EXPRESSION' ? value.name : undefined
}

export function globalName(node, model) {
  const id = identifier(node)
  return id && !model.binding(id) ? id.valueToken : undefined
}

export function member(node) {
  const value = expr(node)
  return value?.kind === 'JS_STATIC_MEMBER_EXPRESSION' && value.operatorToken === '.' &&
    value.member?.kind === 'JS_NAME' ? value : undefined
}

export function argsOf(call) {
  if (call?.kind !== 'JS_CALL_EXPRESSION' || call.optionalChainToken || call.typeArguments) return
  const args = call.arguments?.args
  return args && !args.some(arg => arg.kind === 'JS_SPREAD') ? args : undefined
}

export function plainString(node) {
  const value = expr(node)
  if (value?.kind === 'JS_STRING_LITERAL_EXPRESSION' && value.valueToken && !value.valueToken.includes('\\')) {
    return value.valueToken.slice(1, -1)
  }
}

export function numberLiteral(node) {
  const value = expr(node)
  if (value?.kind === 'JS_NUMBER_LITERAL_EXPRESSION' && value.valueToken) return Number(value.valueToken.replaceAll('_', ''))
}

// Проверяем источник именованного импорта, в том числе при `import { name as alias }`.
export function importedName(id, source, model) {
  if (id?.kind !== 'JS_REFERENCE_IDENTIFIER') return
  const spec = model.binding(id)?.syntax().parent
  if (!['JS_NAMED_IMPORT_SPECIFIER', 'JS_SHORTHAND_NAMED_IMPORT_SPECIFIER'].includes(spec?.kind)) return
  const clause = spec.ancestors().find(node => node.source?.kind === 'JS_MODULE_SOURCE')
  if (clause?.source?.valueToken?.slice(1, -1) !== source) return
  return spec.name?.text ?? spec.localName?.text
}

export function arrowParameter(arrow) {
  if (arrow?.kind !== 'JS_ARROW_FUNCTION_EXPRESSION' || arrow.asyncToken || arrow.typeParameters) return
  const p = arrow.parameters
  if (p?.kind === 'JS_IDENTIFIER_BINDING') return p
  const items = p?.items
  if (items?.length === 1 && items[0].kind === 'JS_FORMAL_PARAMETER' && !items[0].initializer) return items[0].binding
}

function report(node, rule, severity, message) {
  if (!disabledRules.has(rule)) registerDiagnostic(node, severity, `[TS-EXTRAS/${rule}] ${message}`)
}

export function diagnostic(node, rule, helper, detail = '') {
  report(node, rule, 'warning', `Для этой записи подходит ${helper} из ts-extras. ${detail}`.trimEnd())
}

export function review(node, rule, detail) {
  report(node, rule, 'information', detail)
}
