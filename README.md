# karma-toolkit

Plan-first семейство скиллов «довести код до продакшена» для Claude Code. Семь скиллов, каждый оборачивает один воркфлоу подготовки к проду с независимым критиком/верификатором и честной оговоркой о пределах — плюс два хука: `SessionStart` подмешивает в каждую сессию постоянную plan-first-политику, а `PreToolUse` сканирует изменения на секреты перед `git push`.

## Скиллы

| Команда | Что делает |
|---------|------------|
| `/karma-toolkit:karma-refactoring-ui` | Визуальные стили — внутрь компонентов; раскладка остаётся снаружи. |
| `/karma-toolkit:karma-loop` | Автономная петля «правки → переоценка» до планки качества. Без лимита итераций — единственный не-plan-first скилл. |
| `/karma-toolkit:karma-tests` | Покрытие тестами, которым можно верить, по одной фиче, с независимым ревьюером. |
| `/karma-toolkit:karma-load` | **Локальное** нагрузочное тестирование — ищет узкие места и баги (без облака). |
| `/karma-toolkit:karma-security` | Итеративный самодостаточный security-аудит с состязательной проверкой находок. |
| `/karma-toolkit:karma-logs` | Готовность наблюдаемости и логирования перед продакшеном. |
| `/karma-toolkit:karma-preflight` | Тонкий оркестратор: прогоняет остальные + проверки секретов/env/миграций/отката → GO / NO-GO. |

## Два принципа семейства

- **Plan-first.** Каждый скилл (кроме `karma-loop`) выдаёт *обсуждаемый план* — что / почему / где — и ждёт апрува перед изменением кода. Для жёсткого соблюдения запускай в plan mode (Shift+Tab).
- **Честность о пределах.** Ни один скилл не обещает того, чего не может («ноль уязвимостей», «гарантированно держит X rps»). Они снижают риск и честно сообщают об остаточном.

## Установка (через маркетплейс)

```bash
/plugin marketplace add https://github.com/code0094/karma-toolkit
/plugin install karma-toolkit@karma
```

Команды неймспейснуты под плагином: `/karma-toolkit:karma-<имя>`. Обновить позже: `/plugin marketplace update karma`.

## Локальная разработка и тестирование

```bash
# Загрузить плагин в сессию напрямую, без установки:
claude --plugin-dir ./plugins/karma-toolkit

# Провалидировать манифест + frontmatter скиллов + hooks.json:
claude plugin validate ./plugins/karma-toolkit

# Посмотреть загрузку плагина и регистрацию хуков:
claude --debug
```

Оба хука запускаются в exec-форме через `node` (работает и под Git Bash, и под PowerShell на Windows): `SessionStart` подмешивает политику в контекст сессии, а `PreToolUse` блокирует `git push`, если в изменениях найдены секреты (эвристический скан — сеть безопасности, не гарантия).

## Структура

```
.
├── .claude-plugin/marketplace.json   # этот репозиторий — ещё и маркетплейс
└── plugins/
    └── karma-toolkit/
        ├── .claude-plugin/plugin.json
        ├── hooks/hooks.json          # SessionStart + PreToolUse (secret-scan)
        ├── scripts/
        │   ├── session-start.js      # печатает политику как additionalContext
        │   └── secret-scan.js        # сканит дифф на секреты перед git push
        └── skills/karma-*/SKILL.md   # семь скиллов
```
