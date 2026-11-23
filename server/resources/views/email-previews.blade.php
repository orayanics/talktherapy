<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $subject ?? 'Email previews' }}</title>
</head>
<body>
@if ($subject !== null)
    <a href="{{ route('email-previews') }}">All email previews</a>
    <h1>{{ $subject }}</h1>
    <iframe title="Rendered email" sandbox srcdoc="{{ $html }}" style="width:100%;height:80vh;border:0"></iframe>
@else
    <h1>Email previews</h1>
    @foreach ($groups as $group => $samples)
        <h2>{{ $group }}</h2>
        <ul>
            @foreach ($samples as $key => [$label])
                <li><a href="{{ route('email-previews', ['sample' => $key]) }}">{{ $label }}</a></li>
            @endforeach
        </ul>
    @endforeach
@endif
</body>
</html>
