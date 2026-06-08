# Saarika Web Migration Guide

Migration from **Flutter/Dart mobile app** (Android host in Kotlin) to **Next.js 14 + Express**.

## Quick start

```bash
# Frontend
cd frontend && cp .env.example .env.local
npm install && npm run dev

# Backend (optional Express proxy — app can also talk to Supabase directly)
cd backend && cp .env.example .env
npm install && npm run migrate && npm start
```

## Screen → Route map

| Flutter screen | Next.js route |
|----------------|---------------|
| SplashScreen | middleware + loading.tsx |
| LoginScreen | `/login` |
| SignUpScreen | `/signup` |
| HomeScreen | `/home` |
| CollectionScreen | `/collection` |
| OrdersScreen | `/orders` |
| ProfileScreen | `/profile` |
| CartScreen | `/cart` |
| AdminShell | `/admin/*` |
| ProductDetailScreen | `/products/[id]` |
| SearchScreen | `/search` |

## Converted modules (Phase 1–2)

| Flutter | Web |
|---------|-----|
| `cart_store.dart` | `frontend/lib/cart-store.ts` (Zustand + localStorage) |
| `whatsapp_order_service.dart` | `frontend/lib/whatsapp.ts` |
| `sample_data.dart` | `frontend/lib/constants/sample-data.ts` |
| `inr_format.dart` | `frontend/lib/formatting/inr.ts` |
| `product_repository.dart` | Supabase in RSC pages + Express `/api/products` |
| `supabase_auth_repository.dart` | Supabase SSR + `/login`, `/signup`, OAuth callback |

## Remaining work

- [ ] Collection, Orders, Profile, Search, PDP pages
- [ ] Admin CRUD (products, orders, buyers, banners)
- [ ] Image upload via Express multer → Supabase Storage
- [ ] Server-side search endpoint
- [ ] E2E tests

See the full architecture review in the chat response.
