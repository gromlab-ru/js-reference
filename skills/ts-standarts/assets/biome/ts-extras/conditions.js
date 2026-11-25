import { facts } from './receivers.js'
import { diagnostic, expr, globalName, identifier, member, numberLiteral, plainString } from './syntax.js'

function lengthReceiver(node, model) {
  const access = member(node)
  if (access?.member.text !== 'length') return
  const info = facts(access.object, model)
  if (info?.kind === 'array' && !info.tuple) return access.object
}

export function booleanLength(test, model, negated = false) {
  const array = lengthReceiver(test, model)
  if (array) diagnostic(test, negated ? 'is-empty' : 'is-non-empty', negated ? 'isEmpty' : 'isNonEmpty')
}

const reverse = { '<': '>', '<=': '>=', '>': '<', '>=': '<=' }

function compareLength(node, model) {
  let n = numberLiteral(node.right)
  let left = node.left
  let op = node.operatorToken
  if (n === undefined) {
    n = numberLiteral(node.left)
    left = node.right
    op = reverse[op] ?? op
  }
  if (!Number.isSafeInteger(n) || !lengthReceiver(left, model)) return
  if (n === 0 && ['===', '=='].includes(op)) return diagnostic(node, 'is-empty', 'isEmpty')
  const minimum = op === '>=' ? n : op === '>' ? n + 1 : n === 0 && ['!=', '!=='].includes(op) ? 1 : 0
  if (minimum === 1) diagnostic(node, 'is-non-empty', 'isNonEmpty')
  if (minimum >= 2 && minimum <= 999) {
    diagnostic(node, 'has-at-least', 'hasAtLeast', `Минимум — ${minimum}. Если проверяешь числовой лимит, оставь сравнение.`)
  }
}

function singleCheck(node, model) {
  node = expr(node)
  const op = node?.operatorToken
  if (node?.kind !== 'JS_BINARY_EXPRESSION' || !['!==', '===', '!=', '=='].includes(op)) return
  const positive = op === '!==' || op === '!='
  const loose = op.length === 2
  for (const [side, compared] of [[node.right, node.left], [node.left, node.right]]) {
    const value = expr(side)
    let target = expr(compared)
    let kind
    if (value?.kind === 'JS_NULL_LITERAL_EXPRESSION') kind = loose ? 'present' : 'null'
    else if (globalName(value, model) === 'undefined') kind = loose ? 'present' : 'defined'
    else if (plainString(value) === 'undefined' && target?.kind === 'JS_UNARY_EXPRESSION' && target.operatorToken === 'typeof') {
      target = expr(target.argument)
      // typeof незаявленного имени допустим, передача этого имени в функцию — нет.
      const id = identifier(target)
      if (!id || !model.binding(id)) return
      kind = 'defined'
    }
    if (kind && target) return { kind, positive, target }
  }
}

export function nullishCheck(node, model) {
  node = expr(node)
  if (node?.kind !== 'JS_LOGICAL_EXPRESSION') return singleCheck(node, model)
  const a = singleCheck(node.left, model)
  const b = singleCheck(node.right, model)
  const positive = node.operatorToken === '&&'
  if (!a || !b || !['&&', '||'].includes(node.operatorToken) || a.positive !== positive || b.positive !== positive) return
  if (a.kind === b.kind || ![a.kind, b.kind].includes('null') || ![a.kind, b.kind].includes('defined')) return
  // При повторном чтении свойства мог бы выполниться геттер.
  const id = identifier(a.target)
  if (id && id.text === identifier(b.target)?.text) return { kind: 'present', positive, target: a.target }
}

function infinitySide(node, model) {
  const value = expr(node)
  if (globalName(value, model) === 'Infinity') return 1
  if (value?.kind === 'JS_UNARY_EXPRESSION' && value.operatorToken === '-' && globalName(value.argument, model) === 'Infinity') return -1
  const access = member(value)
  if (access && globalName(access.object, model) === 'Number') {
    if (access.member.text === 'POSITIVE_INFINITY') return 1
    if (access.member.text === 'NEGATIVE_INFINITY') return -1
  }
}

function infinityComparison(node, model) {
  node = expr(node)
  if (node?.kind !== 'JS_BINARY_EXPRESSION' || node.operatorToken !== '===') return
  for (const [side, other] of [[node.left, node.right], [node.right, node.left]]) {
    const sign = infinitySide(side, model)
    const id = identifier(other)
    if (sign && id) return { sign, name: id.text }
  }
}

function enclosingFilter(node) {
  for (const parent of node.ancestors()) {
    if (parent.kind === 'JS_ARROW_FUNCTION_EXPRESSION' || parent.kind === 'JS_FUNCTION_EXPRESSION') {
      const call = parent.parent?.parent?.parent
      return call?.kind === 'JS_CALL_EXPRESSION' && member(call.callee)?.member.text === 'filter'
    }
    if (parent.kind.endsWith('_DECLARATION') || parent.kind.endsWith('_CLASS_MEMBER')) return false
  }
  return false
}

export function assertion(node, model) {
  if (node.elseClause) return
  let stmt = node.consequent
  if (stmt?.kind === 'JS_BLOCK_STATEMENT') stmt = stmt.statements.length === 1 ? stmt.statements[0] : undefined
  const thrown = stmt?.argument
  if (stmt?.kind !== 'JS_THROW_STATEMENT' || thrown?.kind !== 'JS_NEW_EXPRESSION') return
  const args = thrown.arguments?.args ?? []
  if (args.length > 1 || (args.length && plainString(args[0]) === undefined)) return
  const error = globalName(thrown.callee, model)
  const check = nullishCheck(node.test, model)
  if (error === 'TypeError' && check && !check.positive && identifier(check.target)) {
    if (check.kind === 'defined') return ['assert-defined', 'assertDefined']
    if (check.kind === 'present') return ['assert-present', 'assertPresent']
  }
  const test = expr(node.test)
  if (error === 'TypeError' && test?.kind === 'JS_UNARY_EXPRESSION' && test.operatorToken === '!') {
    const instance = expr(test.argument)
    if (instance?.kind === 'JS_INSTANCEOF_EXPRESSION' && globalName(instance.right, model) === 'Error') return ['assert-error']
  }
  if (error === 'Error' && test?.kind === 'JS_UNARY_EXPRESSION' && test.operatorToken === '!') {
    if (!lengthReceiver(test.argument, model)) return ['assert', 'assert']
  }
}

export function comparison(node, model) {
  if (node.kind === 'JS_BINARY_EXPRESSION') compareLength(node, model)
  else if (node.operatorToken === '||') {
    const a = infinityComparison(node.left, model)
    const b = infinityComparison(node.right, model)
    if (a && b && a.sign !== b.sign && a.name === b.name) return diagnostic(node, 'is-infinite', 'isInfinite')
  }
  const check = nullishCheck(node, model)
  if (!check || check.kind === 'null' || !identifier(check.target) || enclosingFilter(node)) return
  let parent = node.parent
  while (parent?.kind === 'JS_PARENTHESIZED_EXPRESSION') parent = parent.parent
  if (parent?.kind === 'JS_LOGICAL_EXPRESSION' && nullishCheck(parent, model)) return
  if (parent?.kind === 'JS_IF_STATEMENT' && assertion(parent, model)) return
  const helper = check.kind === 'defined' ? 'isDefined' : 'isPresent'
  diagnostic(node, `is-${check.kind}`, helper, check.positive ? '' : 'Для проверки отсутствия отрицай результат.')
}
