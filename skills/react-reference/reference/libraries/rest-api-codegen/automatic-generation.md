# Автоматическая генерация

Используй автоматическую генерацию, если сервис предоставляет актуальную OpenAPI или Swagger specification в JSON. Сначала найди существующий API client или SDK: не создавай второй клиент для того же API.

## Настройка

Команда генерации REST API client:

```bash
npx --yes @gromlab/rest-api-codegen@5.2.4 \
  --input https://api.example.com/openapi.json \
  --output ./src/infra/pet-store-api/generated
```

Версию генератора, input и output определяй по текущему проекту.

Для воспроизводимой регенерации зафиксируй эту команду в `package.json`:

```json
{
  "scripts": {
    "generate:pet-store-api": "npx --yes @gromlab/rest-api-codegen@5.2.4 --input https://api.example.com/openapi.json --output ./src/infra/pet-store-api/generated"
  }
}
```

После добавления project script выполняй последующие регенерации только через него:

```bash
npm run generate:pet-store-api
```

Используй команду запуска scripts, соответствующую package manager текущего проекта. Не запускай отдельную CLI-команду для каждой регенерации и не меняй её параметры вне `package.json`.

CLI принимает локальный JSON-файл или HTTP(S) URL. YAML specification сначала преобразуй существующим инструментом проекта в JSON. Закрытую specification скачивай существующим авторизованным механизмом без вывода credentials в команду, логи или документацию.

## Generated output

Генератор создаёт самодостаточный TypeScript client:

```text
generated/
├── create-api-client.ts
├── data-contracts.ts
├── http-client.ts
├── index.ts
├── operations-tree.ts
└── operations/
    ├── index.ts
    └── <operation>.ts
```

- `data-contracts.ts` содержит типы из OpenAPI.
- `operations/` содержит отдельную типизированную функцию для каждого endpoint.
- `operations-tree.ts` предоставляет полное дерево операций.
- `http-client.ts` предоставляет `HttpClient`, `ApiError` и request contracts.
- `create-api-client.ts` связывает дерево операций с transport.

Generated client не требует runtime dependency на package генератора. Output-каталог полностью принадлежит CLI: не изменяй generated-файлы и не размещай внутри них transport config, ручные операции или исправления.

После генерации прочитай фактические exports, структуру `operationsTree` и сигнатуры нужных операций. Затем настрой [`transport`](transport.md) и собери [`API client`](api-client.md).

Если OpenAPI отсутствует, создай полностью ручной клиент в [`extensions`](manual-operations.md). Если specification не
содержит нужный endpoint или описывает его неверно, не редактируй output и добавь изменение в
[`overrides`](patching.md).
