# Local HTTPS with Nginx

This setup terminates HTTPS in Nginx while keeping the development services on local HTTP ports:

| HTTPS path                                  | Upstream        | Purpose                    |
| ------------------------------------------- | --------------- | -------------------------- |
| `/api/*`, `/sanctum/*`, `/login`, `/logout` | Laravel `:8080` | API and session requests   |
| `/app/*`                                    | Reverb `:8081`  | Realtime WebSocket traffic |
| Everything else                             | Vite `:3000`    | Frontend and HMR           |

Use HTTPS when opening the application from another device on the local network. Camera and microphone access require a trusted HTTPS origin.

## 1. Choose the HTTPS host

Choose the LAN IP or DNS name that browsers on test devices will use, for example `192.168.1.50` or `talktherapy.local`.

For a Windows Laragon installation, find the current LAN IP with:

```powershell
Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.InterfaceAlias -notmatch 'Loopback' } |
  Select-Object IPAddress, InterfaceAlias
```

Replace `<LAN_HOST>` below with that host and use a consistent HTTPS port, such as `8443`.

## 2. Create a trusted certificate

Install [mkcert](https://github.com/FiloSottile/mkcert), then run PowerShell as Administrator:

```powershell
mkcert -install
mkcert `
  -cert-file C:/laragon/etc/ssl/talktherapy.crt `
  -key-file C:/laragon/etc/ssl/talktherapy.key `
  <LAN_HOST> localhost 127.0.0.1
```

Use a hostname instead of an IP when using a local DNS name. Store the certificate in a location readable by the Nginx process.

The browser on every test device must trust the mkcert root certificate. Installing a server certificate alone does not trust the issuing CA on another device.

## 3. Configure Nginx

Open the active Nginx `nginx.conf`, usually from the Nginx installation's `conf` directory. Add the following `map` directives inside the `http {}` block:

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

map $request_method $talktherapy_login_upstream {
    default http://127.0.0.1:3000;
    POST    http://127.0.0.1:8080;
    OPTIONS http://127.0.0.1:8080;
}

map $request_method $talktherapy_logout_upstream {
    default http://127.0.0.1:3000;
    POST    http://127.0.0.1:8080;
    OPTIONS http://127.0.0.1:8080;
}
```

Add or merge this server block into the same `http {}` block:

```nginx
server {
    listen 8443 ssl;
    server_name <LAN_HOST>;

    ssl_certificate     C:/laragon/etc/ssl/talktherapy.crt;
    ssl_certificate_key C:/laragon/etc/ssl/talktherapy.key;

    location ~ ^/(api|sanctum)/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location = /login {
        proxy_pass $talktherapy_login_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;
    }

    location = /logout {
        proxy_pass $talktherapy_logout_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;
    }

    location /app/ {
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_read_timeout 60s;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;
    }
}
```

Validate the active configuration using the Nginx binary and configuration path:

```powershell
nginx -t
nginx -s reload
```

Allow inbound TCP `8443` through Windows Firewall for LAN devices. Replace `8443` consistently if another HTTPS port is used.

## 4. Configure Laravel

Update `server/.env` with the public HTTPS origin:

```env
APP_URL=https://<LAN_HOST>:8443
FRONTEND_URL=https://<LAN_HOST>:8443

CORS_ALLOWED_ORIGINS=https://<LAN_HOST>:8443
SANCTUM_STATEFUL_DOMAINS=<LAN_HOST>:8443

SESSION_SECURE_COOKIE=true
SESSION_DOMAIN=null
SESSION_SAME_SITE=lax

REVERB_HOST=127.0.0.1
REVERB_PORT=8081
REVERB_SCHEME=http
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8081
REVERB_ALLOWED_ORIGINS=<LAN_HOST>,localhost,127.0.0.1
```

Clear cached configuration and start the backend services:

```powershell
cd server
php artisan config:clear
composer run dev
```

The Composer dev script binds Laravel to `0.0.0.0:8080`, while Reverb listens on `0.0.0.0:8081` for Nginx to proxy.

## 5. Configure the frontend

Update `client/.env`:

```env
VITE_APP_API_URL=https://<LAN_HOST>:8443
VITE_APP_WSS_URL=wss://<LAN_HOST>:8443

VITE_REVERB_HOST=<LAN_HOST>
VITE_REVERB_PORT=8443
VITE_REVERB_SCHEME=https
```

Restart Vite:

```powershell
cd client
npm run dev
```

Open `https://<LAN_HOST>:8443` in a browser that trusts the mkcert root certificate.

If the LAN host or port changes, regenerate the certificate and update the Nginx server name, environment values, and firewall rule together. Camera and microphone access remains blocked while the certificate is untrusted or does not cover the address used in the browser.
