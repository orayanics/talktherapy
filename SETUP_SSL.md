# Local HTTPS with Laragon Nginx

This setup terminates HTTPS in Laragon's Nginx while keeping the development services on local HTTP ports:

```text
https://172.30.204.234:8443
 ├── /api/*, /sanctum/*, /login, /logout -> Laravel :8080
 ├── /app/*                             -> Reverb :8081
 └── everything else                    -> Vite :3000
```

HTTPS is required for camera and microphone access when the frontend is opened through a LAN address.

## 1. Create a trusted certificate

The certificate must include the LAN IP as a Subject Alternative Name. A certificate created only for `localhost` is not sufficient.

Install [mkcert](https://github.com/FiloSottile/mkcert), then run PowerShell as Administrator:

```powershell
mkcert -install
mkcert `
  -cert-file C:/laragon/etc/ssl/talktherapy.crt `
  -key-file C:/laragon/etc/ssl/talktherapy.key `
  172.30.204.234 localhost 127.0.0.1
```

The device/browser used to access the application must trust the mkcert root CA. For another computer, install the root CA on that device too.

## 2. Configure Nginx

Your Laragon Nginx configuration directory is:

```text
C:\laragon\bin\nginx\nginx-1.30.4\conf
```

Open `nginx.conf` in that directory. Put the `map` directive inside the existing `http {}` block. Add the `server` block inside the same `http {}` block, or merge its `location` directives into the existing SSL server block if Laragon already generated one for port `8443`.

Before restarting, validate the configuration from the Nginx installation directory:

```powershell
cd C:\laragon\bin\nginx\nginx-1.30.4
.\nginx.exe -t -p . -c conf\nginx.conf
```

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

# Keep frontend routes such as GET /login on Vite, while sending
# POST /login and POST /logout to Laravel.
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

server {
    listen 8443 ssl;
    server_name 172.30.204.234;

    ssl_certificate     C:/laragon/etc/ssl/talktherapy.crt;
    ssl_certificate_key C:/laragon/etc/ssl/talktherapy.key;

    location ~ ^/(api|sanctum)/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location = /login {
        proxy_pass $talktherapy_login_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location = /logout {
        proxy_pass $talktherapy_logout_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Reverb's websocket endpoint.
    location /app/ {
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_read_timeout 60s;
    }

    # Vite development server and HMR websocket.
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

Reload or restart Nginx after saving the configuration. Allow inbound TCP `8443` through Windows Firewall if another device connects over the LAN.

## 3. Configure Laravel

Update `server/.env`:

```env
APP_URL=https://172.30.204.234:8443
FRONTEND_URL=https://172.30.204.234:8443

CORS_ALLOWED_ORIGINS=https://172.30.204.234:8443
SANCTUM_STATEFUL_DOMAINS=172.30.204.234:8443

SESSION_SECURE_COOKIE=true
SESSION_DOMAIN=null
SESSION_SAME_SITE=lax

REVERB_HOST=127.0.0.1
REVERB_PORT=8081
REVERB_SCHEME=http
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8081
REVERB_ALLOWED_ORIGINS=172.30.204.234,localhost,127.0.0.1
```

Clear cached configuration and start the backend services:

```powershell
cd server
php artisan config:clear
composer run dev
```

The Composer dev script binds Laravel to `0.0.0.0:8080`, while Reverb listens on `0.0.0.0:8081` for Nginx to proxy.

## 4. Configure the frontend

Update `client/.env`:

```env
VITE_APP_API_URL=https://172.30.204.234:8443
VITE_APP_WSS_URL=wss://172.30.204.234:8443

VITE_REVERB_HOST=172.30.204.234
VITE_REVERB_PORT=8443
VITE_REVERB_SCHEME=https
```

Restart Vite:

```powershell
cd client
npm run dev
```

Open the application at:

```text
https://172.30.204.234:8443
```

If the network IP changes, regenerate the certificate and update the Nginx and environment values. Camera and microphone permissions will remain blocked if the certificate is untrusted or does not contain the address being used.
