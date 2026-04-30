# FreelancDeutsch

A SaaS platform for international freelancers operating in Germany. Combines GoBD-compliant invoicing, German language learning, and an AI-powered job application assistant in one tool.

## Features

### Document Management
- Create invoices, proposals, and contracts with PDF export
- GoBD-compliant: chained SHA-256 audit trail on every document
- Kleinunternehmer (§19 UStG) and reverse-charge tax support
- Client management with full CRUD

### German Language Learning
- Spaced-repetition vocabulary flashcards (SM-2 algorithm)
- Domain-specific card sets (business, legal, tech)
- AI-powered B2B German writing practice with instant feedback

### Job Finder & AI Application Assistant
- Aggregates remote German tech jobs from ArbeitNow and Remotive
- Store your CV profile once; AI adapts it per job
- Generates formal German cover letters (Bewerbungsschreiben)
- DSGVO consent gate before any CV data is sent to AI
- Rate-limited: 3 cover letters/day, 5 CV adaptations/hour

### Platform
- Stripe subscription billing (Free, Pro, Agency plans)
- Google OAuth login
- Usage limiter middleware per feature and plan
- Weekly progress emails and upgrade nudge emails
- Impressum, Datenschutz, and AGB legal pages

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 13, PHP 8.4 |
| Frontend | React 18, Inertia.js v3, Tailwind CSS v3 |
| Database | PostgreSQL |
| Queue / Cache | Redis |
| Billing | Laravel Cashier (Stripe) v16 |
| Auth | Laravel Breeze + Google OAuth (Socialite) |
| AI | OpenRouter — Qwen3-8b:free (fallback: Mistral-7b:free) |
| PDF | barryvdh/laravel-dompdf |
| Media | Spatie Media Library |
| Permissions | Spatie Laravel Permission |
| Testing | Pest 4 |

## Requirements

- PHP 8.3+
- Node.js 20+
- PostgreSQL
- Redis
- Composer

## Setup

```bash
git clone https://github.com/hamdidev/freelancdeutsch.git
cd freelancdeutsch

composer install
npm install

cp .env.example .env
php artisan key:generate
```

Configure the following in `.env`:

```env
# Database (PostgreSQL)
DB_HOST=localhost
DB_DATABASE=freelancdeutsch
DB_USERNAME=
DB_PASSWORD=

# Stripe
STRIPE_KEY=pk_live_...
STRIPE_SECRET=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_AGENCY=price_...

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URL=https://yourdomain.com/auth/google/callback

# AI (OpenRouter)
ANTHROPIC_API_KEY=sk-ant-...
```

```bash
php artisan migrate --seed
npm run build
php artisan queue:work
```

## Stripe Webhooks

Register the webhook endpoint in your Stripe dashboard:

```
POST /stripe/webhook
```

Events required: `customer.subscription.*`, `invoice.payment_succeeded`, `invoice.payment_failed`

## Running Tests

```bash
php artisan test --compact
```

## License

Private — all rights reserved.
