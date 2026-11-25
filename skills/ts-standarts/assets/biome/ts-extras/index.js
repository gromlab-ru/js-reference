import { ast, defineRule } from '@biomejs/runtime/plugin'
import { callRule, tupleRead } from './calls.js'
import { assertion, booleanLength, comparison } from './conditions.js'
import { diagnostic, review } from './syntax.js'
import { cast, declaration, keyMembership } from './type-patterns.js'

// Каждая группа запрашивает только нужные ей узлы. Идентификатор исходного правила сохраняется в замечании.
function rule(kinds, check) {
  return defineRule({
    query: ast(...kinds, { semantic: true }),
    run(node, { model, sourceType }) {
      if (sourceType.language.kind === 'typescript' && sourceType.variant !== 'jsx') check(node, model)
    }
  })
}

export const calls = rule(['JS_CALL_EXPRESSION'], callRule)
export const comparisons = rule(['JS_BINARY_EXPRESSION', 'JS_LOGICAL_EXPRESSION'], comparison)
export const tupleReads = rule(['JS_COMPUTED_MEMBER_EXPRESSION'], tupleRead)
export const casts = rule(['TS_AS_EXPRESSION', 'TS_TYPE_ASSERTION_EXPRESSION'], cast)
export const typeTests = rule(['JS_VARIABLE_DECLARATOR'], declaration)
export const keys = rule(['JS_IN_EXPRESSION'], keyMembership)
export const conditions = rule(['JS_IF_STATEMENT', 'JS_WHILE_STATEMENT', 'JS_DO_WHILE_STATEMENT',
  'JS_FOR_STATEMENT', 'JS_CONDITIONAL_EXPRESSION', 'JS_UNARY_EXPRESSION'], (node, model) => {
  if (node.kind === 'JS_UNARY_EXPRESSION') {
    if (node.operatorToken === '!') booleanLength(node.argument, model, true)
    return
  }
  if (node.kind === 'JS_IF_STATEMENT') {
    const advice = assertion(node, model)
    if (advice) {
      if (advice[0] === 'assert-error') {
        review(node, 'assert-error', 'assertError принимает в том числе ошибки из другого контекста JavaScript. Меняй instanceof Error только если нужен этот контракт.')
        return
      }
      diagnostic(node, ...advice, 'Сохрани исходное сообщение об ошибке.')
      return
    }
  }
  booleanLength(node.test, model)
})
