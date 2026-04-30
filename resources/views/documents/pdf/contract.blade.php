<!DOCTYPE html>
<html lang="de">

<head>
    <meta charset="UTF-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            color: #1a1a1a;
            line-height: 1.5;
        }

        .page {
            padding: 40px 50px;
        }

        /* Header */
        .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }

        .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #000;
        }

        .document-label {
            font-size: 22px;
            font-weight: bold;
            text-align: right;
            color: #000;
        }

        .document-number {
            font-size: 12px;
            color: #666;
            text-align: right;
        }

        /* Addresses */
        .addresses {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }

        .address-block {
            width: 48%;
        }

        .address-label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #999;
            margin-bottom: 4px;
        }

        .address-name {
            font-weight: bold;
            font-size: 12px;
        }

        /* Dates */
        .meta {
            display: flex;
            gap: 40px;
            margin-bottom: 30px;
            border-top: 1px solid #eee;
            padding-top: 15px;
        }

        .meta-item label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #999;
            display: block;
        }

        .meta-item span {
            font-weight: bold;
        }

        /* Items table */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        thead th {
            background: #f5f5f5;
            padding: 8px 10px;
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #666;
        }

        thead th.right {
            text-align: right;
        }

        tbody td {
            padding: 8px 10px;
            border-bottom: 1px solid #f0f0f0;
            vertical-align: top;
        }

        tbody td.right {
            text-align: right;
        }

        tbody tr:last-child td {
            border-bottom: none;
        }

        /* Totals */
        .totals {
            width: 220px;
            margin-left: auto;
            margin-bottom: 30px;
        }

        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            font-size: 11px;
        }

        .totals-row.total {
            border-top: 2px solid #000;
            margin-top: 5px;
            padding-top: 8px;
            font-weight: bold;
            font-size: 13px;
        }

        /* Notes */
        .notes {
            font-size: 10px;
            color: #555;
            margin-bottom: 20px;
            padding: 12px;
            background: #fafafa;
            border-left: 3px solid #e0e0e0;
        }

        /* Footer */
        .footer {
            border-top: 1px solid #eee;
            padding-top: 15px;
            font-size: 9px;
            color: #999;
        }

        .legal-note {
            margin-top: 15px;
            font-size: 9px;
            color: #999;
            font-style: italic;
        }

        /* GoBD stamp */
        .gobd-stamp {
            font-size: 8px;
            color: #ccc;
            margin-top: 20px;
        }
    </style>
</head>

<body>
    <div class="page">

        <!-- Header -->
        <div class="header">
            <div>
                <div class="company-name">{{ $document->sender_name }}</div>
                <div style="color:#666; margin-top:4px; white-space:pre-line; font-size:10px;">
                    {{ $document->sender_address }}</div>
                <div style="color:#666; font-size:10px;">{{ $document->sender_email }}</div>
            </div>
            <div>
                <div class="document-label">
                    {{ $document->type === 'invoice' ? 'Rechnung' : ($document->type === 'proposal' ? 'Angebot' : 'Vertrag') }}
                </div>
                <div class="document-number">Nr. {{ $document->number }}</div>
            </div>
        </div>

        <!-- Addresses -->
        <div class="addresses">
            <div class="address-block">
                <div class="address-label">Rechnungsempfänger</div>
                @if ($document->recipient_company)
                    <div class="address-name">{{ $document->recipient_company }}</div>
                @endif
                <div class="{{ $document->recipient_company ? '' : 'address-name' }}">{{ $document->recipient_name }}
                </div>
                <div style="color:#555; font-size:10px; white-space:pre-line;">{{ $document->recipient_address }}</div>
                @if ($document->recipient_ust_id)
                    <div style="color:#888; font-size:9px; margin-top:4px;">USt-IdNr: {{ $document->recipient_ust_id }}
                    </div>
                @endif
            </div>
            <div class="address-block" style="text-align:right;">
                @if ($document->sender_steuernummer)
                    <div style="color:#666; font-size:10px;">Steuernummer: {{ $document->sender_steuernummer }}</div>
                @endif
                @if ($document->sender_ust_id)
                    <div style="color:#666; font-size:10px;">USt-IdNr: {{ $document->sender_ust_id }}</div>
                @endif
            </div>
        </div>

        <!-- Meta -->
        <div class="meta">
            <div class="meta-item">
                <label>Vertragsbeginn</label>
                <span>{{ $document->issued_at->format('d.m.Y') }}</span>
            </div>
            @if ($document->due_at)
                <div class="meta-item">
                    <label>Vertragsende</label>
                    <span>{{ $document->due_at->format('d.m.Y') }}</span>
                </div>
            @endif
        </div>

        <!-- Items -->
        <table>
            <thead>
                <tr>
                    <th style="width:5%">Pos.</th>
                    <th style="width:50%">Beschreibung</th>
                    <th class="right" style="width:10%">Menge</th>
                    <th class="right" style="width:10%">Einheit</th>
                    <th class="right" style="width:12%">Einzelpreis</th>
                    <th class="right" style="width:13%">Gesamt</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($document->items as $i => $item)
                    <tr>
                        <td>{{ $i + 1 }}</td>
                        <td>{{ $item->description }}</td>
                        <td class="right">{{ number_format($item->quantity, 2, ',', '.') }}</td>
                        <td class="right">{{ $item->unit }}</td>
                        <td class="right">{{ number_format($item->unit_price, 2, ',', '.') }} €</td>
                        <td class="right">{{ number_format($item->total, 2, ',', '.') }} €</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
            <div class="totals-row">
                <span>Nettobetrag</span>
                <span>{{ number_format($document->subtotal, 2, ',', '.') }} €</span>
            </div>
            @if ($document->is_kleinunternehmer)
                <div class="totals-row" style="color:#888; font-size:10px;">
                    <span>MwSt.</span>
                    <span>–</span>
                </div>
            @elseif($document->is_reverse_charge)
                <div class="totals-row" style="color:#888; font-size:10px;">
                    <span>MwSt. (Reverse Charge)</span>
                    <span>–</span>
                </div>
            @else
                <div class="totals-row">
                    <span>MwSt. {{ number_format($document->tax_rate, 0) }}%</span>
                    <span>{{ number_format($document->tax_amount, 2, ',', '.') }} €</span>
                </div>
            @endif
            <div class="totals-row total">
                <span>Gesamtbetrag</span>
                <span>{{ number_format($document->total, 2, ',', '.') }} €</span>
            </div>
        </div>

        <!-- Notes -->
        @if ($document->notes)
            <div class="notes">{{ $document->notes }}</div>
        @endif

        <!-- Payment note -->
        @if ($document->type === 'invoice')
            <div style="font-size:10px; color:#555; margin-bottom:20px;">
                Bitte überweisen Sie den Gesamtbetrag innerhalb von {{ $document->payment_terms }} Tagen
                auf das unten angegebene Konto.
            </div>
        @endif

        <!-- Legal notes -->
        @if ($document->is_kleinunternehmer)
            <div class="legal-note">
                Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.
            </div>
        @elseif($document->is_reverse_charge)
            <div class="legal-note">
                Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge gem. § 13b UStG).
            </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            {{ $document->footer ?? $document->sender_name . ' · ' . $document->sender_email }}
        </div>

        <!-- GoBD hash stamp -->
        @if ($document->gobd_hash)
            <div class="gobd-stamp">
                GoBD: {{ $document->gobd_hash }}
            </div>
        @endif

    </div>
</body>

</html>
