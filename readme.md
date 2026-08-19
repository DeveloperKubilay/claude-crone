# Claude Crone

Otomatik tarayıcı destekli cron işlemlerinizde kullanabileceğiniz otomasyon sistemi.

## 🚀 Hızlı Başlangıç (Docker)

### 1. `docker-compose.yml` Dosyası

```yaml
services:
  claude-scheduler:
    image: ghcr.io/developerkubilay/claude-crone:latest
    container_name: claude_automation_scheduler
    restart: unless-stopped
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
      - NODE_ENV=production
      - CHECK_INTERVAL_HOURS=24
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}
      - ANTHROPIC_BASE_URL=${ANTHROPIC_BASE_URL:-http://host.docker.internal:21045/v1}
    volumes:
      - ./services:/app/services
      - ./send_msg.py:/app/send_msg.py
      - ./config.json:/app/config.json
      - ./claude.json:/root/.claude.json
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 2. İmajı Çekin & Başlatın

```bash
# İmajı çekin
docker pull ghcr.io/developerkubilay/claude-crone:latest

# Özel model / provider kullanacaksanız claude.json dosyasını düzenleyin:
nano claude.json

# Konteyneri arka planda başlatın
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
