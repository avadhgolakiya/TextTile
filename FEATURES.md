# Saarika feature map (wholesale saree hub parity)

This document compares **typical wholesale / ethnic B2B app capabilities** with the current **Saarika** Flutter codebase. Status: **Done** | **Partial** | **Planned**.

## Onboarding & shell

| Feature | Status | Notes |
|--------|--------|------|
| Splash / brand moment | **Done** | `SplashScreen` → `AppRoot` |
| Login | **Done** | `LoginScreen` + validation |
| Sign up | **Done** | `SignUpScreen`; auto sign-in |
| Session / logout | **Partial** | In-memory auth only; logout clears cart |
| Remember me / biometrics | **Planned** | — |
| Deep links / universal links | **Planned** | — |

## Catalog & discovery

| Feature | Status | Notes |
|--------|--------|------|
| Home feed (hero, categories, rails) | **Done** | `HomeScreen` |
| Search UI | **Partial** | `SearchScreen` filters local `SampleData` |
| Category browse | **Partial** | `ProductListScreen` + `Product.categoryKey` |
| Product grid / list | **Done** | `ProductListScreen` |
| Product detail (PDP) | **Partial** | `ProductDetailScreen`; static “wholesale notes” |
| Filters (price, fabric, MOQ) | **Planned** | Tune icon opens search only |
| Wishlist / saved | **Planned** | Profile menu is static |
| Compare products | **Planned** | — |
| Inventory / live stock | **Planned** | — |

## Cart & checkout

| Feature | Status | Notes |
|--------|--------|------|
| Shared cart | **Done** | `CartStore` + `InheritedNotifier` above `MaterialApp` |
| Add from PDP | **Done** | `ProductDetailScreen` |
| Line qty / delete | **Done** | `CartScreen` + `CartItemCard` |
| Subtotal / discount / shipping copy | **Done** | `OrderSummaryPanel` (demo %) |
| Place order | **Partial** | Clears cart + snackbar; no payment / API |
| Addresses at checkout | **Planned** | — |
| GST invoice / PO number | **Planned** | — |

## Orders & account

| Feature | Status | Notes |
|--------|--------|------|
| Order list + status chips | **Partial** | `OrdersScreen` uses static `SampleData.orders` |
| Order detail | **Planned** | “View” is no-op |
| Notifications | **Planned** | Bell icon no-op |
| Profile header from user | **Done** | Uses `AppUser` |
| Menu rows (saved, address, …) | **Partial** | UI only |
| Help / forgot password | **Partial** | Snackbars / copy |

## Data & integrations

| Feature | Status | Notes |
|--------|--------|------|
| Remote API + models | **Planned** | Replace `SampleData` + repositories |
| Image CDN / caching policy | **Partial** | `AppNetworkImage` |
| Analytics / crash reporting | **Planned** | — |
| Push notifications | **Planned** | — |

## Suggested next milestones

1. **API layer**: `ProductRepository`, `OrderRepository`, `AuthRepository` HTTP impl + env config.  
2. **Persistence**: secure tokens + optional local cart draft.  
3. **Order detail** route from `OrderCard`.  
4. **Filters** sheet on catalog (map to query params).  
5. **Wishlist** backed by API or local DB.

---

*Last updated with code changes: catalog navigation, `CartStore`, PDP, search, and this checklist.*
