# Multi-Service Scheduler

Claude tabanlı otomatik cron scheduler sistemi. Her service kendi klasöründe bağımsız çalışır.

## Yapı

```
project/
├── services/
│   └── halkarz/              # Örnek service
│       ├── settings.json     # Cron ayarları
│       ├── index.js          # Service logic
│       └── claude.md         # Claude context (opsiyonel)
├── scheduler.js              # Ana scheduler
├── package.json
└── README.md
```

## Kurulum

```bash
npm install
```

## Kullanım

### Scheduler'ı Başlat

```bash
npm start
```

veya

```bash
node scheduler.js
```

### Yeni Service Ekleme

1. `services/` altında yeni bir klasör oluştur
2. `settings.json` ekle:

```json
{
  "name": "my-service",
  "description": "Açıklama",
  "cron": "*/10 * * * *",
  "enabled": true,
  "model": "test"
}
```

3. `index.js` ekle (service logic)
4. İsteğe bağlı `claude.md` ekle (context)

Scheduler otomatik olarak yeni service'i algılayıp başlatır (max 1 dk içinde).

## settings.json Parametreleri

- **name**: Service adı
- **description**: Açıklama
- **cron**: Cron expression (örn: `*/5 * * * *` = her 5 dakika)
- **enabled**: `true` veya `false`
- **model**: Claude model (varsayılan: `test`)

## Cron Örnekleri

- `*/5 * * * *` - Her 5 dakikada
- `0 * * * *` - Her saat başı
- `0 0 * * *` - Her gün gece yarısı
- `0 9 * * 1-5` - Hafta içi her gün saat 9'da
- `*/15 9-17 * * *` - 9-17 arası her 15 dakikada

## Özellikler

- ✅ Otomatik service keşfi
- ✅ Config hot-reload (max 1 dk'da 1 kontrol)
- ✅ Service enable/disable
- ✅ Bağımsız service çalışma (isolated spawns)
- ✅ Otomatik temizlik (işlem bitince kapanır)
- ✅ Graceful shutdown

## Service Nasıl Çalışır?

Her cron tetiklendiğinde:

```bash
cd services/service-name/
claude --model test --once
```

komutu çalıştırılır. İşlem bitince otomatik kapanır.

## Notlar

- Config değişiklikleri **maksimum 1 dakika** içinde algılanır
- Her service kendi klasöründe izole çalışır
- `claude.md` dosyası varsa Claude otomatik context olarak kullanır
- Service çalışırken scheduler devam eder (non-blocking)
"# claude-crone" 
