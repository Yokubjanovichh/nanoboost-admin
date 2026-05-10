# E2E tests

Playwright suite for nanoboost-admin. V1 — smoke coverage (login renders,
validation errors, app shell). V2 — full CRUD coverage (Games, Services,
Orders, Reviews) — to be added in Phase 8.

## Running

```bash
# Install browsers once
npx playwright install chromium

# Local (auto-starts dev server)
npx playwright test

# Against a running URL (e.g., Vercel preview)
E2E_BASE_URL=https://preview.example.com npx playwright test

# Include backend-dependent tests (login + redirect)
E2E_RUN_BACKEND_TESTS=1 \
E2E_ADMIN_EMAIL=admin@nanoboost.io \
E2E_ADMIN_PASSWORD=ChangeMeImmediately123! \
  npx playwright test
```

## Files

| File | Coverage |
| --- | --- |
| `auth.spec.js` | Login render, validation, real login (gated) |
| `smoke.spec.js` | Auth redirect, 404, keyboard a11y |

## CI hook (Phase 8)

```yaml
- name: E2E tests
  run: |
    npx playwright install --with-deps chromium
    npx playwright test
```

## Roadmap (V2)

- `games-crud.spec.js` — create / edit / toggle / delete game
- `services-crud.spec.js` — service form + nested options dialog
- `orders.spec.js` — order detail + status transition
- `reviews.spec.js` — RatingStarsInput interaction
- `dashboard.spec.js` — period switch + chart render
