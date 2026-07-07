<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Vérification de certificat</title>
    <style>
        body {
            font-family: system-ui, sans-serif;
            background: #f4f4f5;
            display: flex;
            justify-content: center;
            padding: 3rem 1rem;
        }

        .card {
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, .08);
            max-width: 520px;
            width: 100%;
            padding: 2.5rem;
        }

        .badge {
            display: inline-block;
            padding: .35rem .9rem;
            border-radius: 999px;
            font-size: .85rem;
            font-weight: 600;
        }

        .valid {
            background: #dcfce7;
            color: #166534;
        }

        .revoked {
            background: #fee2e2;
            color: #991b1b;
        }

        .notfound {
            background: #f3f4f6;
            color: #374151;
        }

        h1 {
            font-size: 1.4rem;
            margin: 1rem 0 .5rem;
        }

        .row {
            margin: .6rem 0;
            color: #3f3f46;
        }

        .label {
            font-size: .8rem;
            color: #71717a;
            text-transform: uppercase;
            letter-spacing: .04em;
        }

        .value {
            font-size: 1.05rem;
            font-weight: 500;
        }

        .code {
            font-family: monospace;
            font-size: .8rem;
            color: #a1a1aa;
            margin-top: 1.5rem;
            word-break: break-all;
        }
    </style>
</head>

<body>
    <div class="card">
        @if (!$certificate)
            <span class="badge notfound">Introuvable</span>
            <h1>Certificat introuvable</h1>
            <p class="row">Aucun certificat ne correspond à ce code de vérification.</p>
        @elseif ($certificate->status === 'valid')
            <span class="badge valid">✓ Certificat valide</span>
            <h1>Certificat authentique</h1>
            <div class="row">
                <div class="label">Apprenant</div>
                <div class="value">{{ $certificate->enrollment->account->full_name }}</div>
            </div>
            <div class="row">
                <div class="label">Formation</div>
                <div class="value">{{ $certificate->enrollment->training->title }}</div>
            </div>
            <div class="row">
                <div class="label">Délivré le</div>
                <div class="value">{{ $certificate->issued_at }}</div>
            </div>
        @else
            <span class="badge revoked">✕ Certificat révoqué</span>
            <h1>Ce certificat a été révoqué</h1>
            <div class="row">
                <div class="label">Apprenant</div>
                <div class="value">{{ $certificate->enrollment->account->full_name }}</div>
            </div>
            <div class="row">
                <div class="label">Formation</div>
                <div class="value">{{ $certificate->enrollment->training->title }}</div>
            </div>
            <div class="row">
                <div class="label">Révoqué le</div>
                <div class="value">{{ $certificate->revoked_at }}</div>
            </div>
            @if ($certificate->revocation_reason)
                <div class="row">
                    <div class="label">Motif</div>
                    <div class="value">{{ $certificate->revocation_reason }}</div>
                </div>
            @endif
        @endif

        @if ($certificate)
            <div class="code">Code : {{ $certificate->public_code }}</div>
        @endif
    </div>
</body>

</html>