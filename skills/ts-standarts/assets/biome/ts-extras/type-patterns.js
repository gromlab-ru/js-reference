import { facts, ordinaryLiteral } from './receivers.js'
import { diagnostic, expr, identifier, importedName, review } from './syntax.js'

export function cast(node, model) {
  const ty = node.ty
  if (ty?.kind === 'TS_REFERENCE_TYPE' && importedName(ty.name, 'type-fest', model) === 'Writable') {
    const [arg] = ty.typeArguments?.tsTypeArgumentList ?? []
    const id = identifier(node.expression)
    if (arg?.kind === 'TS_TYPEOF_TYPE' && id && arg.expressionName?.text === id.text) {
      diagnostic(node, 'as-writable', 'asWritable', 'Это изменение типа, не копия объекта.')
    }
    return
  }
  const source = facts(node.expression, model)?.kind
  if ((source === 'string' && ty?.kind === 'TS_STRING_TYPE') || (source === 'number' && ty?.kind === 'TS_NUMBER_TYPE') ||
      (source === 'boolean' && ty?.kind === 'TS_BOOLEAN_TYPE')) {
    diagnostic(node, 'safe-cast-to', 'safeCastTo', 'Если аннотация вообще не нужна, удали приведение.')
  }
}

export function declaration(node, model) {
  const ty = node.variableAnnotation?.ty
  if (node.id?.kind !== 'JS_IDENTIFIER_BINDING' || node.parent?.parent?.kindToken !== 'const') return
  const never = ty?.kind === 'TS_NEVER_TYPE'
  if (!never && !(ty?.kind === 'TS_REFERENCE_TYPE' && ty.typeArguments?.tsTypeArgumentList.length === 2 &&
    importedName(ty.name, 'type-fest', model) === 'IsEqual')) return
  const literal = expr(node.initializer?.expression)
  const binding = model.asBinding(node.id)
  if (!binding || binding.isExported() || binding.allReferences().length) return
  if (never && identifier(literal) && node.parent.parent.declarators.length === 1) {
    review(node, 'assert-never', 'assertNever добавит исключение во время выполнения. Оставь проверку типа, если исключение не требуется.')
  } else if (!never && literal?.kind === 'JS_BOOLEAN_LITERAL_EXPRESSION') {
    diagnostic(node, 'is-equal-type', 'isEqualType', `Для проверки компилятором сохрани ожидание через satisfies ${literal.valueToken}; во время выполнения функция не возвращает boolean.`)
  }
}

export function keyMembership(node, model) {
  const key = identifier(node.property)
  if (!key || !ordinaryLiteral(facts(node.object, model)?.literal)) return
  const decl = model.binding(key)?.syntax().parent
  const ty = decl?.typeAnnotation?.ty ?? decl?.variableAnnotation?.ty
  if (ty?.kind !== 'TS_UNION_TYPE') return
  if (ty.types.every(part => part.kind === 'TS_STRING_LITERAL_TYPE' && part.literalToken && !part.literalToken.includes('\\') &&
    !(part.literalToken.slice(1, -1) in Object.prototype))) {
    diagnostic(node, 'key-in', 'keyIn', 'Здесь проверяется переменная с ключом.')
  }
}
