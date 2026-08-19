# Claude Crone

Otomatik tarayıcı destekli cron işlemlerinizde kullanabileceğiniz otomasyon sistemi.

## 🚀 Hızlı Başlangıç (Docker)

### 1. `docker-compose.yml` Dosyası

```bash
mkdir services
nano claude.json
nano docker-compose.yml
```

## ⚙️ `claude.json` Örneği

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://host.docker.internal:21045/v1",
    "ANTHROPIC_API_KEY": "API_KEY_BURAYA"
  }
}
```

> Örnek bir servis ekleyin services klasöründeki örneği kullanabilirsiniz

```yaml
services:
  claude-scheduler:
    image: ghcr.io/developerkubilay/claude-crone:latest
    container_name: claude_automation_scheduler
    restart: unless-stopped
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
      - TZ=Europe/Istanbul
      - NODE_ENV=production
    volumes:
      - ./services:/app/services
      - ./config.json:/app/config.json
      - ./claude.json:/app/claude.json
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

```bash
docker compose up -d
```

---

## 📁 Servis Yapısı & Örnek Kullanım

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
