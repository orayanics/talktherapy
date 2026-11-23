<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $subject ?? config('app.name') }}</title>
    <style>
        @media screen and (max-width: 620px) {
            .email-shell { width: 100% !important; }
            .email-pad { padding-left: 24px !important; padding-right: 24px !important; }
            .email-title { font-size: 30px !important; line-height: 1.1 !important; }
        }
    </style>
</head>

<body style="margin:0;background:#fff8ec;color:#172f3c;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
        style="background:#fff8ec;border-top:5px solid #72c8e7;padding:28px 12px 40px;">
        <tr>
            <td align="center">
                <table role="presentation" class="email-shell" width="600" cellspacing="0" cellpadding="0"
                    style="max-width:600px;background:#ffffff;border:1px solid #e9e4da;overflow:hidden;box-shadow:0 20px 60px rgba(23,47,60,.08);">
                    <tr>
                        <td class="email-pad"
                            style="padding:28px 32px 22px;color:#3f7a9a;font-size:25px;font-weight:700;letter-spacing:-1.2px;">
                            talktherapy<span style="margin-left:-5px;">.</span></td>
                    </tr>
                    <tr>
                        <td style="height:4px;background:{{ $accent }};font-size:0;line-height:0;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td class="email-pad" style="padding:32px 44px;line-height:1.6;">
                            @if (isset($subject))
                                <p style="margin:0 0 14px;color:#3f7a9a;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">TalkTherapy update</p>
                                <h1 class="email-title" style="margin:0 0 24px;color:#172f3c;font-size:38px;line-height:1.12;letter-spacing:-1.4px;font-weight:700;">{{ $subject }}</h1>
                            @endif
                            <div style="white-space:pre-line;">{{ $body }}</div>
                            @isset($action)
                                <a href="{{ $action['url'] }}"
                                    style="display:inline-block;margin-top:24px;padding:12px 21px;background:#72c8e7;color:#172f3c;text-decoration:none;border-radius:9px;font-weight:650;">{{ $action['label'] }}</a>
                            @endisset
                        </td>
                    </tr>
                    <tr>
                        <td class="email-pad"
                            style="padding:20px 32px;color:#56666e;font-size:12px;border-top:1px solid #e1e6e8;text-align:center;">
                            Every voice has a place here.</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
