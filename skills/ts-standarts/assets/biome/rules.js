import { ast, defineRule, registerDiagnostic } from '@biomejs/runtime/plugin'

const unwrapType = type => {
  while (type?.kind === 'TS_PARENTHESIZED_TYPE') {
    type = type.ty
  }
  return type
}

export const namedObjectTypes = defineRule({
  query: ast('TS_UNION_TYPE', 'TS_INTERSECTION_TYPE', 'JS_FORMAL_PARAMETER'),
  run(node) {
    const parameter = node.kind === 'JS_FORMAL_PARAMETER'
    const parts = parameter ? [node.typeAnnotation?.ty] : node.types
    for (const part of parts) {
      const type = unwrapType(part)
      if (type?.kind === 'TS_OBJECT_TYPE') {
        const message = parameter
          ? 'Объяви именованный тип объекта и укажи его в параметре функции.'
          : 'Объяви объектную часть отдельно и используй её имя в объединении или пересечении.'
        registerDiagnostic(type, 'error', `[TS-NAMED-OBJECT] ${message}`)
      }
    }
  }
})

export const multilineObjectTypes = defineRule({
  query: ast('TS_OBJECT_TYPE', 'TS_INTERFACE_DECLARATION'),
  run(node) {
    // Компактная запись допустима у значения объекта, но не у объявления его типа.
    if (node.members.length > 0 && !/[\r\n]/.test(node.text)) {
      registerDiagnostic(node, 'error', '[TS-OBJECT-LINES] Перенеси первое поле на строку после {, даже если оно одно.')
    }
  }
})

const simpleTypes = new Set([
  'TS_STRING_TYPE', 'TS_NUMBER_TYPE', 'TS_BOOLEAN_TYPE', 'TS_BIGINT_TYPE', 'TS_SYMBOL_TYPE',
  'TS_UNDEFINED_TYPE', 'TS_NULL_LITERAL_TYPE', 'TS_ANY_TYPE', 'TS_UNKNOWN_TYPE', 'TS_NEVER_TYPE'
])

export const arrayNotation = defineRule({
  query: ast('TS_ARRAY_TYPE', 'TS_REFERENCE_TYPE', { semantic: true }),
  run(node, { model }) {
    if (node.kind === 'TS_ARRAY_TYPE') {
      if (unwrapType(node.elementType)?.kind === 'TS_UNION_TYPE') {
        registerDiagnostic(node, 'error', '[TS-ARRAY] Для объединения используй Array<A | B> или ReadonlyArray<A | B>.')
      }
      return
    }

    const name = node.name
    if (name?.kind !== 'JS_REFERENCE_IDENTIFIER' || !['Array', 'ReadonlyArray'].includes(name.text)) return
    if (model.binding(name)) return // Локальный тип с таким именем не является встроенным массивом.
    const args = node.typeArguments?.tsTypeArgumentList
    if (args?.length !== 1) return
    const element = unwrapType(args[0])
    if (simpleTypes.has(element?.kind) || (element?.kind === 'TS_REFERENCE_TYPE' && !element.typeArguments)) {
      registerDiagnostic(node, 'error', '[TS-ARRAY] Для простого элемента используй T[] или readonly T[].')
    }
  }
})
