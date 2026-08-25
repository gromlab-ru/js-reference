import type { ButtonProps } from './types/button-props.type'

import styles from './styles/button.module.css'

/**
 * Отображает универсальное доступное действие с единым визуальным контрактом.
 */
export const Button = (props: ButtonProps) => {
  const {
    className,
    type = 'button',
    variant = 'primary',
    ...rootAttrs
  } = props
  const variantClassName = variant === 'primary'
    ? styles._primary
    : styles._secondary
  let rootClassName = `${styles.root} ${variantClassName}`

  if (typeof className === 'string' && className !== '') {
    rootClassName = `${rootClassName} ${className}`
  }

  return (
    <button
      {...rootAttrs}
      className={rootClassName}
      type={type}
    />
  )
}
