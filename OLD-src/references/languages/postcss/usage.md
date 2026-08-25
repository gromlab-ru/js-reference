# Использование PostCSS

Применяй этот документ ко всему CSS, который проходит через настроенный PostCSS pipeline. Он определяет правила
форматирования, именования, nesting, custom media, design tokens, комментариев и CSS Modules. Подготовка pipeline
описана в [`setup.md`](setup.md) и [`configuration.md`](configuration.md).

## Перед изменением styles

1. Найди центральные CSS variables, design tokens и theme definitions.
2. Найди breakpoint-шкалу и `@custom-media` definitions.
3. Проверь PostCSS config, фактический порядок plugins и browser targets.
4. Убедись, что nesting и custom media действительно обрабатываются для изменяемого файла.
5. Используй существующую систему и не создавай локальные дубли tokens или breakpoints.

Не начинай с новых literal-значений, пока не проверены существующие tokens и media conditions.

## Форматирование

- Используй 2 пробела и одно свойство на строку.
- Между правилами верхнего уровня оставляй одну пустую строку.
- Перед каждым вложенным блоком оставляй одну пустую строку.
- При отсутствии проектного порядка группируй свойства так: positioning, box model, visual, typography, прочее.
- Не меняй порядок свойств во всём файле без отдельной задачи.

```css
.card {
  position: relative;
  display: flex;
  width: 100%;
  padding: var(--space-4);
  border-radius: var(--radius-2);
  background-color: var(--color-bg);
  color: var(--color-text);
}
```

## Именование классов

Вне CSS Modules называй классы в `kebab-case`:

```css
.product-card {
  display: grid;
}

.product-card-title {
  font-weight: 600;
}
```

Не используй `camelCase` для global classes. Component styles изолируй через CSS Modules, а немногочисленные global
classes оставляй плоскими и называй в `kebab-case`.

В CSS Modules корневой selector называй `.root`, а остальные локальные классы называй в `camelCase`. Подробные
правила модулей приведены в главе [`CSS Modules`](#css-modules).

## Nesting

Используй nesting для media queries, псевдоклассов, псевдоэлементов и compound selector модификатора. Не создавай
каскад из нескольких классов, если элемент можно адресовать одним классом.

```css
.button {
  color: var(--color-text);

  &:hover {
    color: var(--color-primary);
  }

  &::before {
    content: '';
  }

  @media (--md) {
    display: inline-flex;
  }
}
```

Не вкладывай локальные классы элементов в корневой selector. Даже при доступном nesting храни самостоятельные
классы отдельными правилами верхнего уровня.

```css
.root {
  display: flex;
}

.title {
  font-weight: 600;
}
```

Не используй лишний каскад `.root .title`, если элемент можно адресовать локальным классом `.title`.

## Модификаторы

Модификатор оформляй отдельным коротким классом с `_`: `._active`, `._disabled`, `._red`. Всегда применяй его вместе
с базовым классом: модификатор не является самостоятельной сущностью.

```css
.button {
  color: var(--color-text);

  &._red {
    color: var(--color-danger);
  }
}
```

Не кодируй модификатор в имени базового класса: не используй `.button--red`, `.button_red` или
`.product-card--active`. Если вариант описывает самостоятельную сущность, а не состояние базовой, создай отдельный
обычный класс.

## Custom media

Пиши styles Mobile First: базовый стиль относится к минимальному viewport, а расширения layout идут вверх через
именованные `min-width` conditions.

```css
.card-grid {
  grid-template-columns: 1fr;

  @media (--md) {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

- Используй breakpoint из центрального `media.css`.
- Размещай media query внутри selector, который она изменяет.
- Не повторяй literal breakpoint, если существует соответствующий custom media.
- Не используй desktop-first откаты через `max-width`.
- Не добавляй второй способ объявления media рядом с уже используемым.
- Используй `--xs` с `max-width` только для явно необходимого upper-bound правила.

Literal breakpoint допустим только для уникального порога одного component, который не относится к общей шкале.
Оставь короткий комментарий с причиной. Если значение повторяется или совпадает с общей шкалой, добавь именованное
condition в центральную media-систему.

## Design tokens

Храни повторяемые цвета, spacing, typography, радиусы и другие смысловые значения в центральных CSS custom
properties.

```css
:root {
  --color-text: #212124;
  --space-4: 1rem;
  --radius-2: 0.5rem;
}
```

- Используй существующий token вместо копирования его значения.
- Не создавай token только ради замены одного локального literal.
- Не создавай новый token с тем же смыслом под другим именем.
- Не меняй существующую token-систему в рамках локальной style-задачи.
- Не экспортируй CSS custom properties через CSS Modules без требования проекта.

Одноразовое локальное значение оставляй в файле владельца.

## CSS Modules

Эта глава применяется к `*.module.css`, которые обрабатываются PostCSS и механизмом CSS Modules текущего bundler
или framework.

### Владение

- CSS Module принадлежит одному component или модулю, который определяет соответствующий DOM и visual behavior.
- Размещай module рядом с ближайшим владельцем styles.
- Не импортируй CSS Module одного владельца в code другого владельца.
- Не выноси локальные классы component в global styles.
- Не выноси styles внутреннего component за границу владельца только из-за декомпозиции разметки.
- Если style должен переиспользоваться, выноси UI-сущность или token, а не общий CSS Module.
- Не создавай пустой CSS Module для сущности без собственного DOM.

Global styles оставляй для tokens, media, reset, typography и themes.

### Структура классов

- Реальный корневой элемент стилизуемой сущности получает класс `.root`.
- Остальные локальные классы используют `camelCase`: `.contentItem`, `.submitButton`.
- Не заменяй `.root` именем component, назначением блока или внешним `className`.
- Не смешивай `camelCase` и `kebab-case` в одном CSS Module.
- State и variant modifiers оформляй отдельными классами `._modifier`.
- Не вкладывай классы элементов внутрь `.root`.

```css
.root {
  display: flex;
  color: var(--color-text);
}

.contentItem {
  min-width: 0;
}

.submitButton {
  color: var(--color-action);

  &._disabled {
    color: var(--color-disabled);
  }
}
```

## Комментарии

- Оформляй CSS-комментарий как `/* Причина. */`.
- Комментируй только неочевидные ограничения, workarounds и причины.
- Не пересказывай очевидные свойства и значения.
- Удаляй устаревший комментарий при изменении поведения.

## Проверка styles

- Использованы существующие central variables, tokens и custom media.
- Классы вне CSS Modules используют `kebab-case`.
- В CSS Modules корневой selector называется `.root`, а остальные классы используют `camelCase`.
- Модификаторы оформлены отдельными классами `._modifier` и применяются вместе с базовым классом.
- Nesting ограничен media queries, псевдоселекторами, модификаторами и другими обоснованными конструкциями.
- Media queries следуют Mobile First и общей breakpoint-шкале.
- Media query находится рядом с изменяемым selector.
- Повторяемые смысловые значения используют tokens.
- CSS Module не импортируется между владельцами.
- Production build преобразует nesting и custom media в код для browser targets проекта.
