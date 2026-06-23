# Service Scheduler

Otomatik cron scheduler.

## Başlat

```bash
npm start
```

## Service Ekle

```
services/service-name/
  ├── settings.json
  └── claude.md (opsiyonel)
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

Her cron: `cd services/service-name && claude --model test --once`

Config değişiklikleri max 1dk'da algılanır.

## Cron

- `*/5 * * * *` = Her 5dk
- `*/1 * * * *` = Her 1dk
- `0 * * * *` = Her saat
- `0 9 * * 1-5` = Hafta içi 09:00
