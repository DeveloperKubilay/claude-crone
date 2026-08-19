# Claude Crone

Otomatik tarayıcı destekli cron işlemlerinizde kullanabileceğiniz otomasyon sistemi.

## Kurulum & Çalıştırma

1. Yapılandırmayı düzenleyin:
```bash
nano docker-compose.yml
```

2. Özel model / provider kullanacaksanız `claude.json` dosyasını oluşturun veya düzenleyin:
```bash
nano claude.json
```

3. Konteyneri başlatın:
```bash
docker compose up -d
```

---

## Servis Yapısı & Örnek Kullanım

Her görev için `services/` altında bir klasör oluşturulur:

```text
services/
  └── projectname/
        ├── settings.json
        └── CLAUDE.md
```

### 1. `CLAUDE.md`
Buraya Claude'un periyodik olarak çalıştıracağı promptunuzu ve görev talimatlarını yazın.

### 2. `settings.json`
Zamanlama ve model ayarlarını belirler:

```json
{
  "cron": "0 10 * * 1-5",
  "enabled": true,
  "model": "otomasyon"
}
```

- `cron`: Çalışma zamanı (Örnek: `0 10 * * 1-5` hafta içi her gün 10:00).
- `enabled`: Servisi aktif (`true`) veya pasif (`false`) yapar.
- `model`: Kullanılacak model adı.
