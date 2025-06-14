# Chytanka Proxy API

A lightweight and secure image proxy for trusted domains, used by Chytanka and its subdomains.

## ✨ Features

- ✅ Domain whitelist to prevent abuse
- ✅ Base64 URL support
- ✅ Custom `Referer` and `User-Agent` headers
- ✅ CORS support for `*.chytanka.ink`
- ✅ Rate limiting (100 requests / 15 minutes)
- ✅ Binary-safe proxying (images, files)

## 🚀 Usage

### Endpoint

`GET /api?url={encodedUrl}[&ref={referer}]`

- `url`: target URL (can be raw or Base64-encoded)
- `ref`: optional referer header

## ⚙️ Setup

```bash
npm install
node index.js
```

Runs on http://127.0.0.1:5000 by default.

## 🔒 Allowed Domains

Only requests to the following domains (and their subdomains) are allowed:

- imgur.com
- mangadex.org
- comick.fun
- imgchest.com
- mangadex.network
- nhentai.net
- pixiv.net
- pximg.net
- redd.it
- telegra.ph
- yande.re
- b-cdn.net

## 🛡 Security Notes

- CORS is restricted to *.chytanka.ink
- Rate-limited to prevent abuse
- No caching – you may place this behind a CDN or nginx for production use

📄 License

MIT

