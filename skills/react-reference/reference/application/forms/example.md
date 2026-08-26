# Пример формы редактирования

Пример показывает локальный контракт формы и подтверждённую механику `@mantine/form`. Он не задаёт контракт доменной
ошибки: ближайший владелец преобразует предусмотренный результат своей операции в один из результатов отправки формы.

```tsx
import { useState } from 'react'
import { Alert, Button, Checkbox, Stack, TextInput } from '@mantine/core'
import { isEmail, isNotEmpty, useForm } from '@mantine/form'

import type { UpdateProfileInput } from 'domains/profile'

interface ProfileFormValues {
  displayName: string
  email: string
  receiveUpdates: boolean
}

type ProfileFormField = 'displayName' | 'email'

type ProfileFormSubmitResult =
  | Readonly<{
      status: 'success'
      values: ProfileFormValues
    }>
  | Readonly<{
      status: 'field-error'
      field: ProfileFormField
      message: string
    }>
  | Readonly<{
      status: 'form-error'
      message: string
    }>

interface ProfileFormProps {
  initialValues: ProfileFormValues
  submit: (input: UpdateProfileInput) => Promise<ProfileFormSubmitResult>
  handleUnexpectedError: (error: unknown) => void
}

export const ProfileForm = ({
  initialValues,
  submit,
  handleUnexpectedError
}: ProfileFormProps) => {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<ProfileFormValues>({
    mode: 'uncontrolled',
    initialValues,
    validateInputOnBlur: true,
    onValuesChange: () => setSubmitError(null),
    validate: {
      displayName: isNotEmpty('Введите отображаемое имя'),
      email: isEmail('Введите корректный адрес почты')
    }
  })

  const handleValidationError = (errors: typeof form.errors): void => {
    const firstErrorPath = Object.keys(errors)[0]

    if (firstErrorPath !== undefined) {
      form.getInputNode(firstErrorPath)?.focus()
    }
  }

  const handleSubmit = async (values: ProfileFormValues): Promise<void> => {
    setSubmitError(null)
    form.clearErrors()

    const input: UpdateProfileInput = {
      displayName: values.displayName.trim(),
      contact: {
        email: values.email.trim()
      },
      receiveUpdates: values.receiveUpdates
    }

    try {
      const result = await submit(input)

      if (result.status === 'field-error') {
        form.setFieldError(result.field, result.message)
        return
      }

      if (result.status === 'form-error') {
        setSubmitError(result.message)
        return
      }

      form.setInitialValues(result.values)
      form.setValues(result.values)
      form.resetDirty(result.values)
    } catch (error) {
      handleUnexpectedError(error)
      setSubmitError('Не удалось сохранить изменения. Попробуйте ещё раз.')
    }
  }

  return (
    <form
      noValidate
      onSubmit={form.onSubmit(handleSubmit, handleValidationError)}
    >
      <fieldset disabled={form.submitting}>
        <Stack>
          <TextInput
            key={form.key('displayName')}
            autoComplete="name"
            label="Отображаемое имя"
            required
            {...form.getInputProps('displayName')}
          />

          <TextInput
            key={form.key('email')}
            autoComplete="email"
            label="Почта"
            required
            type="email"
            {...form.getInputProps('email')}
          />

          <Checkbox
            key={form.key('receiveUpdates')}
            label="Получать уведомления"
            {...form.getInputProps('receiveUpdates', { type: 'checkbox' })}
          />

          {submitError !== null && (
            <Alert color="red" role="alert">
              {submitError}
            </Alert>
          )}

          <Button loading={form.submitting} type="submit">
            Сохранить
          </Button>
        </Stack>
      </fieldset>
    </form>
  )
}
```

`UpdateProfileInput` принадлежит домену и импортируется через его публичный фасет. `submit` принадлежит ближайшему
владельцу сценария. Он вызывает публичную доменную операцию, преобразует только предусмотренные исходы в `field-error`
или `form-error` и передаёт форме готовый безопасный текст. DTO и техническая ошибка источника в форму не попадают.
Отклонённый `Promise` означает неожиданный сбой и передаётся через `handleUnexpectedError` принятому механизму приложения.

После успеха пример остаётся на экране, принимает сохранённые значения за новые исходные и очищает `dirty`. Если сценарий
после сохранения закрывает форму или выполняет переход, эти три вызова не нужны.
