<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'broadcasting/auth'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_origins' => array_values(array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', env('FRONTEND_URL', 'http://localhost:3000')))))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Accept', 'Content-Type', 'Authorization', 'X-XSRF-TOKEN', 'X-CSRF-TOKEN', 'X-Requested-With'],
    'exposed_headers' => ['X-Request-ID', 'Retry-After'],
    'max_age' => 600,
    'supports_credentials' => true,
];
