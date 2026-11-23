<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $subject ?? config('app.name') }}</title>
    <style>
        body { margin: 0; background: #f3f4f6; color: #1f2937; font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 32px auto; padding: 32px; background: #ffffff; }
        .header { margin-bottom: 24px; font-size: 22px; font-weight: 700; }
        .body { white-space: pre-line; line-height: 1.6; }
        .button { display: inline-block; margin-top: 24px; padding: 12px 18px; background: #2563eb; color: #ffffff !important; text-decoration: none; }
        .footer { margin-top: 32px; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
<main class="container">
    <header class="header">{{ config('app.name') }}</header>
    <section class="body">{{ $body }}</section>
    @isset($action)
        <a class="button" href="{{ $action['url'] }}">{{ $action['label'] }}</a>
    @endisset
    <footer class="footer">This is an automated message from {{ config('app.name') }}.</footer>
</main>
</body>
</html>
