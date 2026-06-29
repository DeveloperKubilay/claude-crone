# Service Scheduler

Automatic cron scheduler.

## Start

```bash
npm start
```

## Add Service

```
services/service-name/
  ├── settings.json
  └── claude.md 
```

**settings.json:**
```json
{
  "name": "service-name",
  "cron": "*/5 * * * *",
  "enabled": true,
  "model": "test"
}
```

How to run each cron: `cd services/service-name && claude --model test --once`

Config changes are detected within 1 minute.

## Cron

- `*/5 * * * *` = Every 5 min
- `*/1 * * * *` = Every 1 min
- `0 * * * *` = Every hour
- `0 9 * * 1-5` = Weekdays at 09:00
