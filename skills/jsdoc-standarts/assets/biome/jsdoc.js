import { ast, defineRule, nodeKinds, registerDiagnostic } from '@biomejs/runtime/plugin'

const statementLists = nodeKinds('JS_MODULE_ITEM_LIST', 'JS_STATEMENT_LIST')
const returnOrNested = nodeKinds('JS_RETURN_STATEMENT', 'JS_ARROW_FUNCTION_EXPRESSION', 'JS_FUNCTION_EXPRESSION',
  'JS_FUNCTION_DECLARATION', 'JS_METHOD_OBJECT_MEMBER', 'JS_GETTER_OBJECT_MEMBER', 'JS_SETTER_OBJECT_MEMBER',
  'JS_CLASS_DECLARATION', 'JS_CLASS_EXPRESSION')
const wrappers = new Set(['JS_PARENTHESIZED_EXPRESSION', 'TS_AS_EXPRESSION', 'TS_SATISFIES_EXPRESSION',
  'TS_TYPE_ASSERTION_EXPRESSION', 'TS_NON_NULL_ASSERTION_EXPRESSION'])
const functionValues = new Set(['JS_ARROW_FUNCTION_EXPRESSION', 'JS_FUNCTION_EXPRESSION'])
const signatures = new Set(['TS_DECLARE_FUNCTION_DECLARATION', 'TS_DECLARE_FUNCTION_EXPORT_DEFAULT_DECLARATION',
  'TS_METHOD_SIGNATURE_CLASS_MEMBER', 'TS_CONSTRUCTOR_SIGNATURE_CLASS_MEMBER'])
const usage = 'Используется для:'
const heading = /^(`[^`\s]+`|Аргумент [1-9]\d*):(.*)$/u
const marker = /^[ \t]*[-*+](?:\s|$)/

function report(target, id, message) {
  registerDiagnostic(target, 'error', `[JSDOC-${id}] ${message}`)
}

// У export/declare комментарий принадлежит внешнему объявлению, а не вложенному имени.
function nearestDoc(owner) {
  let breaks = 0
  const pieces = owner.leadingTrivia()
  for (let i = pieces.length - 1; i >= 0; i--) {
    const piece = pieces[i]
    if (piece.kind === 'newline' && ++breaks > 1) return
    if (piece.isComment()) return /^\/\*\*(?![*/])/.test(piece.text) ? piece : undefined
  }
}

// Убираем только служебный пробел после звёздочки: в списках значим дальнейший отступ.
// Текст в ограждённом примере не должен превращаться в аргументы или теги.
function docLines(text) {
  const lines = []
  let fence = ''
  for (const [i, raw] of text.slice(3, -2).split(/\r\n?|\n/).entries()) {
    const line = (i === 0 ? raw.trimStart() : raw.replace(/^[ \t]*\* ?/, '')).trimEnd()
    const delimiter = /^(?:`{3,}|~{3,})/.exec(line.trimStart())?.[0]
    if (fence) {
      if (delimiter?.startsWith(fence) && line.trim() === delimiter) fence = ''
    } else if (delimiter) {
      fence = delimiter
      lines.push('') // Отделяет пример от предшествующего пункта.
    } else {
      lines.push(line)
    }
  }
  while (lines.length && !lines[0]) lines.shift()
  while (lines.length && !lines.at(-1)) lines.pop()
  return lines
}

function readDoc(owner, target, mode, optional = false) {
  const doc = nearestDoc(owner)
  if (!doc) {
    if (!optional) report(target ?? owner, 'MISSING', 'Перед объявлением нужен JSDoc с его назначением.')
    return
  }
  const multiline = /[\r\n]/.test(doc.text)
  if (mode === 'multi' && !multiline) report(doc, 'BLOCK', 'Над этим объявлением нужен многострочный JSDoc.')
  if (mode === 'single' && multiline) report(doc, 'BLOCK', 'Подпиши этот член одной строкой /** … */.')
  const lines = docLines(doc.text)
  if (!lines[0] || heading.test(lines[0].trim()) || lines[0].trimStart().startsWith('@')
    || marker.test(lines[0]) || lines[0] === usage) {
    report(doc, 'SUMMARY', 'Начни с фразы о назначении объявления.')
  }
  // Отдельные теги по-прежнему принадлежат JSDoc. Например, @throws {Error} и @template не описывают тип аргумента.
  const tags = lines.filter(line => /^@[\w-]+/.test(line))
  if (tags.some(tag => /^@(?:param|arg|argument|returns?|type)\s+\{/.test(tag))) {
    report(doc, 'TAGS', 'Не записывай тип в @param, @returns или @type: для этого есть TypeScript.')
  }
  const firstTag = lines.findIndex(line => /^@[\w-]+/.test(line))
  return { doc, tags, lines: firstTag < 0 ? lines : lines.slice(0, firstTag) }
}

function checkCases(block, lines, indent) {
  const items = []
  const prefix = `${' '.repeat(indent)}- `
  const continuation = ' '.repeat(prefix.length)
  for (let i = 0; i < lines.length; i++) {
    if (!marker.test(lines[i])) continue
    let content = lines[i].trim().slice(1).trim()
    let valid = lines[i].startsWith(prefix)
    while (i + 1 < lines.length && lines[i + 1] && !marker.test(lines[i + 1])) {
      const next = lines[++i]
      valid &&= next.startsWith(continuation) && next[continuation.length] !== ' '
      content += ` ${next.trim()}`
    }
    if (!valid || !/\S\s+—\s+\S/u.test(content)) {
      report(block.doc, 'LIST', `Оформи пункт как «значение — смысл». Перед дефисом после «* » нужно пробелов: ${indent}. Продолжение выровняй по тексту.`)
      return
    }
    items.push(content)
  }
  return items
}

function checkArguments(block, fn) {
  const params = fn.parameters
  const items = params?.items ?? params?.parameters ?? (params ? [params] : fn.parameter ? [fn.parameter] : [])
  const expected = []
  for (const item of items) {
    if (item.kind === 'TS_THIS_PARAMETER') continue
    const param = item.formalParameter ?? item
    const binding = param.binding ?? param
    if (binding.kind === 'JS_OBJECT_BINDING_PATTERN' || binding.kind === 'JS_ARRAY_BINDING_PATTERN') {
      expected.push(`Аргумент ${expected.length + 1}`)
    } else if (binding.nameToken) {
      expected.push(`\`${binding.nameToken}\``)
    } else return // Незаконченная сигнатура в редакторе.
  }
  const actual = []
  let since = -1
  for (const [i, line] of block.lines.entries()) {
    const match = heading.exec(line)
    if (!match) continue
    if (since >= 0) checkCases(block, block.lines.slice(since + 1, i), 2)
    since = i
    actual.push(match[1])
    if (block.lines[i - 1] !== '' || !/^[ \t]+\S/.test(match[2])) {
      report(block.doc, 'PARAGRAPH', `Начни отдельный абзац с ${match[1]}: и поясни назначение на той же строке.`)
    }
  }
  if (since >= 0) checkCases(block, block.lines.slice(since + 1), 2)
  if (expected.length !== actual.length || expected.some((name, i) => name !== actual[i])) {
    report(block.doc, 'ARGS', `По сигнатуре: ${expected.join(', ') || 'нет аргументов'}. В JSDoc: ${actual.join(', ') || 'нет абзацев'}.`)
  }
}

function checkComponent(block) {
  const { lines, doc } = block
  const start = lines.indexOf(usage)
  if (start !== 2 || lines[1] !== '') {
    report(doc, 'REACT', `После строки назначения и пустой строки добавь «${usage}».`)
    return
  }
  let count = 0
  for (const line of lines.slice(start + 1)) {
    if (/^ - \S/.test(line)) count++
    else if (line && !(count && /^ {3}\S/.test(line))) {
      report(doc, 'REACT', 'Оставь под «Используется для:» только сценарии вида «*  - сценарий». Свойства опиши у объявлений.')
      return
    }
  }
  if (count < 1 || count > 3) report(doc, 'REACT', 'Укажи от одного до трёх сценариев применения.')
}

function unwrap(value) {
  while (value && wrappers.has(value.kind)) value = value.expression
  return value
}

function jsxValue(value) {
  const expr = unwrap(value)
  if (!expr) return false
  if (expr.kind === 'JSX_TAG_EXPRESSION') return true
  if (expr.kind === 'JS_CALL_EXPRESSION' && /^(?:React\.)?createElement$/.test(expr.callee?.text)) return true
  if (expr.kind === 'JS_CONDITIONAL_EXPRESSION') return jsxValue(expr.consequent) || jsxValue(expr.alternate)
  return expr.kind === 'JS_LOGICAL_EXPRESSION' && (jsxValue(expr.left) || jsxValue(expr.right))
}

function returnsJsx(fn) {
  if (/\b(?:JSX\.Element|ReactElement|ReactNode)\b/.test(fn.returnTypeAnnotation?.text ?? '')) return true
  if (fn.body?.kind !== 'JS_FUNCTION_BODY') return jsxValue(fn.body)
  let found = false
  fn.body.walk(returnOrNested, child => {
    if (child.kind === 'JS_RETURN_STATEMENT' && jsxValue(child.argument)) found = true
    return false // Вложенная функция отвечает за свой собственный результат.
  })
  return found
}

function forbidUsage(block) {
  if (block.lines.includes(usage)) report(block.doc, 'REACT', 'Раздел «Используется для:» относится только к React-компоненту.')
}

function checkCall(owner, target, fn, componentCandidate, optional = false) {
  const block = readDoc(owner, target, 'multi', optional)
  if (!block) return
  if (componentCandidate && (block.lines.includes(usage) || returnsJsx(fn))) {
    checkComponent(block)
  } else {
    forbidUsage(block)
    checkArguments(block, fn)
  }
}

function checkValue(owner, target, mode = 'multi', cases = false, object = false) {
  const block = readDoc(owner, target, mode)
  if (!block) return
  forbidUsage(block)
  if (object && block.tags.some(tag => /^@(?:prop|property)\b/.test(tag))) {
    report(block.doc, 'TAGS', 'У объекта или интерфейса опиши поля прямо у объявлений, без повторного списка @property.')
  }
  if (cases) checkCases(block, block.lines, 0)
  return block
}

function collectLiterals(ty, variants) {
  if (ty?.kind === 'TS_PARENTHESIZED_TYPE') return collectLiterals(ty.ty, variants)
  if (ty?.kind === 'TS_UNION_TYPE') return ty.types.every(part => collectLiterals(part, variants))
  if (ty?.kind !== 'TS_STRING_LITERAL_TYPE' && ty?.kind !== 'TS_NUMBER_LITERAL_TYPE') return false
  const token = ty.literalToken
  if (!token) return false
  const negative = ty.kind === 'TS_NUMBER_LITERAL_TYPE' && !!ty.minusToken
  const value = ty.kind === 'TS_STRING_LITERAL_TYPE' ? token.slice(1, -1)
    : (negative ? -1 : 1) * Number(token.replaceAll('_', ''))
  if (!variants.has(value)) variants.set(value, negative ? `-${token}` : token)
  return true
}

function checkLiteralUnion(block, ty) {
  const variants = new Map()
  if (!collectLiterals(ty, variants) || variants.size < 2) return
  const items = checkCases(block, block.lines, 0)
  if (!items) return // Ошибка формы уже отмечена как LIST.
  const first = block.lines.findIndex(line => marker.test(line))
  if (first > 0 && block.lines[first - 1] !== '') {
    report(block.doc, 'PARAGRAPH', 'Отдели список значений от описания типа пустой строкой.')
  }

  const spellings = new Set(variants.values())
  let index = 0
  for (const [value, spelling] of variants) {
    // У строки '1' и числа 1 разные значения, даже если убрать кавычки.
    const canOmitQuotes = typeof value === 'string' && value !== '' && value === value.trim() && !spellings.has(value)
    const label = /^(`+)(.+?)\1\s+—\s+\S/u.exec(items[index] ?? '')?.[2].trim()
    if (label !== spelling && !(canOmitQuotes && label === value)) {
      report(block.doc, 'VARIANTS', `В пункте ${index + 1} опиши ${spelling}: значение в обратных кавычках — смысл.`)
      return
    }
    index++
  }
  if (items.length > index) {
    report(block.doc, 'VARIANTS', `Лишний пункт ${index + 1}: у каждого значения типа должно быть ровно одно пояснение.`)
  }
}

function checkTypeFields(ty) {
  if (!ty) return
  if (ty.kind === 'TS_PARENTHESIZED_TYPE') return checkTypeFields(ty.ty)
  if (ty.kind === 'TS_INTERSECTION_TYPE' || ty.kind === 'TS_UNION_TYPE') {
    for (const part of ty.types) checkTypeFields(part)
  }
  if (ty.kind !== 'TS_OBJECT_TYPE' && ty.kind !== 'TS_INTERFACE_DECLARATION') return
  for (const member of ty.members) {
    if (member.kind === 'TS_PROPERTY_SIGNATURE_TYPE_MEMBER') {
      checkValue(member, member.name, 'field', true)
      checkTypeFields(member.typeAnnotation?.ty)
    } else if (member.name && member.kind.endsWith('_SIGNATURE_TYPE_MEMBER')) {
      checkValue(member, member.name, 'single')
    }
  }
}

function checkClass(owner, node, target, jsx) {
  if (jsx && /^(?:React\.)?(?:PureComponent|Component)$/.test(node.extendsClause?.superClass?.text ?? '')) {
    const block = readDoc(owner, target, 'multi')
    if (block) checkComponent(block)
  } else checkValue(owner, target)
  let overload
  for (const member of node.members) {
    const name = member.name
    if (name && /(?:METHOD|CONSTRUCTOR|GETTER|SETTER)(?:_SIGNATURE)?_CLASS_MEMBER$/.test(member.kind)) {
      checkCall(member, name, member, false, !signatures.has(member.kind) && name.text === overload)
    } else if (name && member.kind.includes('PROPERTY')) {
      const value = unwrap(member.value?.expression)
      if (value && functionValues.has(value.kind)) checkCall(member, name, value, false)
      else {
        const modifiers = member.modifiers?.map(modifier => modifier.text) ?? []
        checkValue(member, name, modifiers.includes('static') && modifiers.includes('readonly') ? 'multi' : 'field', true)
      }
    }
    overload = signatures.has(member.kind) ? name?.text : undefined
  }
}

function objectLiteral(value) {
  const expr = unwrap(value)
  if (expr?.kind === 'JS_OBJECT_EXPRESSION') return expr
  if (expr?.kind === 'JS_CALL_EXPRESSION' && /^(?:Object\.freeze|z\.object)$|\.(?:safeExtend|extend)$/.test(expr.callee?.text)) {
    const arg = unwrap(expr.arguments?.args[0])
    if (arg?.kind === 'JS_OBJECT_EXPRESSION') return arg
  }
}

function checkObject(obj) {
  for (const member of obj.members) {
    if (!member.name) continue // У spread нет собственного объявления поля.
    const value = unwrap(member.value)
    if (/_(?:METHOD|GETTER|SETTER)_OBJECT_MEMBER$/.test(member.kind) || (value && functionValues.has(value.kind))) {
      checkCall(member, member.name, value ?? member, false)
    } else {
      checkValue(member, member.name, 'field', true)
      const nested = objectLiteral(value)
      if (nested) checkObject(nested)
    }
  }
}

function reactWrapper(value) {
  return value?.kind === 'JS_CALL_EXPRESSION' && /^(?:React\.)?(?:memo|forwardRef)$/.test(value.callee?.text)
}

function checkWrapped(owner, target) {
  const block = readDoc(owner, target, 'multi')
  if (block) checkComponent(block)
}

function checkVariable(owner, node, topLevel, exports, jsx) {
  const vars = node.declaration
  if (!vars) return
  for (const v of vars.declarators) {
    const target = v.id
    if (!target?.nameToken) continue
    const declaration = vars.declarators.length === 1 ? owner : v
    const value = unwrap(v.initializer?.expression)
    const componentCandidate = jsx && /^[A-Z]/.test(target.nameToken)
    if (value && functionValues.has(value.kind)) checkCall(declaration, target, value, componentCandidate)
    else if (value?.kind === 'JS_CLASS_EXPRESSION') checkClass(declaration, value, target, jsx)
    else if (componentCandidate && reactWrapper(value)) checkWrapped(declaration, target)
    else if (vars.kindToken === 'const' && topLevel && (owner.kind === 'JS_EXPORT' || exports.has(target.nameToken)
      || /^[A-Z][A-Z0-9_]*$/.test(target.nameToken) || nearestDoc(declaration))) {
      const obj = objectLiteral(value)
      checkValue(declaration, target, 'multi', false, !!obj)
      if (obj) checkObject(obj)
    }
  }
}

function collectExports(statements) {
  const names = new Set()
  for (const statement of statements) {
    const clause = statement.exportClause
    if (clause?.kind === 'JS_EXPORT_NAMED_CLAUSE') {
      for (const spec of clause.specifiers) names.add((spec.localName ?? spec.name)?.text)
    } else if (clause?.kind === 'JS_EXPORT_DEFAULT_EXPRESSION_CLAUSE' && clause.expression?.kind === 'JS_IDENTIFIER_EXPRESSION') {
      names.add(clause.expression.name?.text)
    }
  }
  return names
}

function checkStatements(list, jsx) {
  const topLevel = ['JS_MODULE', 'JS_SCRIPT', 'TS_MODULE_BLOCK'].includes(list.parent?.kind)
  const statements = list.children()
  const exports = topLevel ? collectExports(statements) : undefined
  let overload
  for (const owner of statements) {
    let node = owner.kind === 'JS_EXPORT' ? owner.exportClause : owner
    while (node && ['TS_DECLARE_STATEMENT', 'TS_EXPORT_DECLARE_CLAUSE', 'JS_EXPORT_DEFAULT_DECLARATION_CLAUSE'].includes(node.kind)) {
      node = node.declaration
    }
    if (!node) continue
    switch (node.kind) {
      case 'JS_FUNCTION_DECLARATION': case 'JS_FUNCTION_EXPORT_DEFAULT_DECLARATION':
      case 'TS_DECLARE_FUNCTION_DECLARATION': case 'TS_DECLARE_FUNCTION_EXPORT_DEFAULT_DECLARATION': {
        const candidate = jsx && (!node.id || /^[A-Z]/.test(node.id.text))
        checkCall(owner, node.id, node, candidate, !signatures.has(node.kind) && !!overload && overload === node.id?.text)
        break
      }
      case 'JS_EXPORT_DEFAULT_EXPRESSION_CLAUSE': {
        const value = unwrap(node.expression)
        if (jsx && reactWrapper(value)) checkWrapped(owner, value.callee)
        else if (value && functionValues.has(value.kind)) checkCall(owner, value.id, value, jsx)
        else if (value?.kind === 'JS_OBJECT_EXPRESSION') {
          checkValue(owner, value, 'multi', false, true)
          checkObject(value)
        }
        break
      }
      case 'JS_VARIABLE_STATEMENT': case 'JS_VARIABLE_DECLARATION_CLAUSE':
        checkVariable(owner, node, topLevel, exports, jsx)
        break
      case 'JS_CLASS_DECLARATION': case 'JS_CLASS_EXPORT_DEFAULT_DECLARATION':
        checkClass(owner, node, node.id, jsx)
        break
      case 'TS_INTERFACE_DECLARATION':
        checkValue(owner, node.id, 'multi', false, true)
        checkTypeFields(node)
        break
      case 'TS_TYPE_ALIAS_DECLARATION': {
        let ty = node.ty
        while (ty?.kind === 'TS_PARENTHESIZED_TYPE') ty = ty.ty
        if (ty?.kind === 'TS_FUNCTION_TYPE') checkCall(owner, node.bindingIdentifier, ty, false)
        else {
          const block = checkValue(owner, node.bindingIdentifier, 'multi', false, ty?.kind === 'TS_OBJECT_TYPE')
          if (block && ty?.kind === 'TS_UNION_TYPE') checkLiteralUnion(block, ty)
        }
        checkTypeFields(ty)
        break
      }
      case 'TS_ENUM_DECLARATION':
        checkValue(owner, node.id)
        for (const member of node.members) checkValue(member, member.name, 'single')
        break
    }
    overload = signatures.has(node.kind) ? node.id?.text : undefined
  }
}

export const jsdocForReader = defineRule({
  query: ast('JS_MODULE', 'JS_SCRIPT'),
  run(root, ctx) {
    if (ctx.sourceType.language.kind !== 'typescript') return
    if (typeof root.leadingTrivia !== 'function') {
      report(root, 'API', 'У этой сборки Biome нет leadingTrivia(). JSDoc не проверен. Используй сборку из инструкции к профилю.')
      return
    }
    for (const list of root.descendants(statementLists)) checkStatements(list, ctx.sourceType.variant === 'jsx')
  }
})
