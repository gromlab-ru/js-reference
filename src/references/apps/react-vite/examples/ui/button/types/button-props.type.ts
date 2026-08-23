import type { ComponentPropsWithoutRef } from 'react'

/**
 * Визуальные варианты кнопки.
 */
export type ButtonVariant = 'primary' | 'secondary'

/**
 * Управляемые параметры кнопки.
 */
type ButtonParams = {
  /** Визуальный вариант действия. */
  variant?: ButtonVariant
}

/**
 * Нативные атрибуты корневой кнопки, не управляемые компонентом.
 */
type RootAttrs = Omit<ComponentPropsWithoutRef<'button'>, keyof ButtonParams>

/**
 * Публичный контракт универсальной кнопки.
 */
export type ButtonProps = ButtonParams & RootAttrs
