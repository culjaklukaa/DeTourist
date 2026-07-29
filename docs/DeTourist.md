# DeTourist — Country-Specific Travel Companion App

## Development Specification v1.0

## 1. Executive Summary

DeTourist is a mobile-native travel companion — iOS and Android — for independent tourists exploring a single country. Rather than replicate what OTAs (Booking.com, Expedia, Airbnb) and general-purpose maps already do well, DeTourist's core bet is **decision quality during the trip**: pacing an itinerary to the length of stay, routing tourists toward high-quality experiences without funneling everyone into the same crowded top-10 list, and giving them a live, trackable record of what they've seen. Booking functionality is included but deliberately phased — affiliate links and direct boutique-property partnerships first, full OTA-style aggregation later, once the discovery experience has earned a user base worth negotiating supply access with.

There is no separate web client. Trip recaps and group-trip invites — the two things that might otherwise need a shareable webpage — are handled natively instead: recaps render as an on-device image for the OS share sheet, and joining a group trip happens by entering a short code inside the app. See §8.5 for the mechanism and the trade-off it makes.

## 2. Problem & Product Thesis

Independent tourists don't lack booking tools — they have too many. What they lack is a reliable signal for *where to actually go and when*, one that adapts to how long they're staying and doesn't just repeat the same "top 10" list every other app and blog surfaces, which is precisely what produces overcrowded landmarks and hollowed-out "authentic" experiences at the edges. DeTourist's thesis: a travel app earns daily use during a trip (not just a one-time booking transaction) by being the layer that tells someone what to do *today*, adjusts as they go, and gives them a private record of the trip afterward.

## 3. Target Users

**Primary — the Independent Explorer.** Books their own lodging and transport, wants day-to-day guidance rather than a rigid pre-built itinerary, stays 3–14 days, comfortable granting location access if the payoff is immediate and visible.

**Secondary — the Light Planner.** Pre-books most logistics through existing OTAs, wants a lighter-touch discovery layer during the trip and a shareable recap afterward. Lower engagement with tracking/route features, higher potential value as an affiliate-booking referral source.

## 4. Pilot Market: Bosnia and Hercegovina (illustrative)

Used throughout this spec as a concrete example; the product framework is portable to any similar-scale destination. Bosnia and Hercegovina fits a pilot well: substantial but not saturated tourism volume, well-documented overtourism pressure concentrated in specific cities, decent OpenStreetMap coverage to bootstrap POI data cheaply, and a tourism-board structure (national + regional boards) that is a plausible partner for both data-sharing and the Phase 3 municipal dashboard product.

## 5. Product Principles (Non-Goals for v1)

- **Not an OTA.** No attempt to replicate Booking.com/Airbnb's inventory or booking-flow infrastructure in v1. Lodging monetizes via affiliate links and direct boutique partnerships until there's a user base worth negotiating deeper OTA access with.
- **"Best" is not "most visited."** Recommending strictly by popularity creates a feedback loop — popular spots get recommended harder, get more crowded, and the experience quality drops exactly where the app is directing the most people. Route and discovery scoring explicitly penalize over-concentration (see §8.4).
- **Tracking is opt-in per trip, not account-wide.** Continuous location access is a high trust ask for a new app; it's requested with an immediate, visible payoff (auto-built trip map/recap), not upfront during signup.

## 6. Feature Set by Phase

Everything below is mobile-native (iOS/Android) — there is no separate web client (§8.5 covers how sharing and joining work without one).

### Phase 1 — MVP

- Trip setup (dates, home base, interests, pace preference)
- Itinerary pacing engine (trip-length-aware, §8.1)
- Discovery feed (§8.2)
- Live tracking map with visited/not-visited layer (§8.3)
- Route Intelligence Engine (§8.4)
- Offline map packs per region
- Auto-generated, shareable trip recap (§8.3, §8.5)

### Phase 2 — Booking & Growth

- Affiliate deep-links to OTAs (Booking.com, Airbnb, etc.) — no in-app booking flow, just tracked outbound referral
- Direct booking for boutique/independent properties recruited manually in the pilot region
- Native trip recap sharing: on-device generated image handed to the OS share sheet — no link, no webpage (§8.5)
- Personalization v1 (collaborative filtering on first-party visit data)
- Group trips: multiple users join one trip via a short invite code, entered manually in-app (§8.5)
- Expense tracking with receipt scanning (§8.6)
- Settlement calculator: equal split across trip members, showing who owes/is owed (§8.6)
- User reviews for POIs and properties, surfaced in discovery feed and property listings

### Phase 3 — Data Business & Scale

- Municipal/tourism-board dashboard: anonymized, aggregated visitor-flow analytics licensed to local government and tourism boards — a separate partner/admin tool, not part of the consumer app, and not subject to the "no web" decision above since its audience is analysts at a desk, not tourists
- ML-based crowd prediction (replacing Phase 1 heuristics) — backend, platform-agnostic
- Expansion to additional pilot countries
- Full OTA API integration if supply/partnership terms make sense by this point

## 7. Data Model

```erd
User
  id, email, home_country, created_at,
  preferences { interests[], pace, mobility }

Trip
  id, user_id, country, currency, start_date, end_date, status,
  preferences { interests[], pace, mobility }
  -- user_id is the trip owner/creator; other participants via TripMember
  -- preferences: for solo trips, copied from the creator's profile at setup;
  --   for group trips, set at trip level and editable by any member (§8.5)
  -- currency: single currency per trip, defaults to pilot country's currency (§13)

TripMember                    -- Phase 2, group trips
  id, trip_id, user_id, role (owner | member), joined_at

POI (Point of Interest)
  id, name, category, lat, lng, country,
  avg_visit_duration_min, source (osm | partner | manual),
  significance_tier (landmark | standard)

Visit
  id, trip_id, poi_id, arrived_at, departed_at,
  source (gps_auto | manual_checkin)

CrowdSignal
  id, poi_id, time_bucket (day_of_week + hour),
  crowd_index (0.0–1.0), sample_size, source (heuristic | first_party | partner_feed)

Route
  id, trip_id, generated_at, poi_sequence[],
  total_score, mode (walk | drive | transit)

Expense                       -- Phase 2, group trips
  id, trip_id, paid_by (user_id), amount,
  category, description, receipt_image_url,
  ocr_status (none | pending | confirmed), split_type (equal),
  created_at
  -- currency lives on Trip, not per-expense (single currency per trip, §13)
  -- split_type hardcoded to 'equal' in v1; extensible to itemized/custom in Phase 3

Property                      -- Phase 2
  id, name, type (hotel | apartment | guesthouse),
  lat, lng, direct_bookable (bool), affiliate_refs {}

Review                        -- Phase 2
  id, user_id, target_type (poi | property), target_id,
  rating, text, created_at
  -- surfaces in discovery feed (POI ratings) and property listings

InviteCode                    -- Phase 2, group trips
  id, trip_id, code (char 6), created_by (user_id),
  expires_at, is_active (bool), created_at
  -- short, human-typeable code for joining group trips (§8.5)
  -- previous codes deactivated on rotation; expires after 72h by default

SettlementPayment             -- Phase 2, group trips
  id, trip_id, from_user_id, to_user_id, amount,
  marked_by (user_id), confirmed_by (user_id),
  confirmed_at, created_at
  -- records that a debt from the settlement calculation was paid
  -- marked_by: the user who initiated the payment record (typically from_user)
  -- confirmed_by: the counterparty who confirms receipt of payment
  -- confirmed_at is set only when the counterparty confirms; prevents
  --   a debtor from unilaterally marking a payment they haven't made
```

## 8. Feature Deep Dives

### 8.1 Itinerary Pacing (trip-length-aware)

Resolves "based on how long tourists stay" as a pacing function, not just a popularity filter:

| Stay length | Behavior                                                                                                                                    |
|-------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| 1–3 days    | Tight cluster of high-confidence, logistically close POIs (landmark-tier POIs are the backbone here, §8.4). Minimize inter-stop travel time.|
| 4–7 days    | Mix of flagship + secondary POIs, one longer excursion day included.                                                                        |
| 8+ days     | Heavier weight toward under-visited, quality-matched spots; slower pace; neighborhood-level depth over checklist coverage.                  |

### 8.2 Discovery Feed

Personalized feed of POIs ranked by the Route Intelligence scoring function (§8.4) rather than raw visit counts, filtered by the user's stated interests and current itinerary pacing tier.

### 8.3 Live Tracking Map

Opt-in per trip. Uses adaptive-frequency GPS polling (dense while the user is actively moving/exploring, sparse or geofenced while stationary, e.g. at a hotel) to control battery drain. Renders a visited/not-visited layer over the map and auto-generates a shareable trip recap on completion, rendered natively for the OS share sheet (§8.5).

### 8.4 Route Intelligence Engine

This directly replaces "most visited" as the definition of "best" — but "avoid crowds" and "avoid fame" are not the same instruction, and an earlier version of this formula conflated them: a globally iconic, genuinely worth-seeing landmark and a merely-trendy same-category alternative both just look like "high CrowdIndex" to a pure crowd-penalty term, and would have been suppressed identically. Stari Most being crowded doesn't make it not worth seeing. Fixing this needed two tiers, not one formula:

**Landmark tier** — a small, hand-curated set per pilot country (UNESCO World Heritage sites, plus other unmissable-by-consensus landmarks tagged manually at launch — for Bosnia and Herzegovina, this starts as maybe 20–30 places, not hundreds; `significance_tier` on the POI record, §7). These are always included in an itinerary long enough to fit them. Crowd data still does real work here, just differently: instead of deciding whether to recommend Stari Most, it picks which `time_slot` to schedule it in — before 10am or after 5pm, avoiding the Dubrovnik/Split day-tripper window — actively spreading load at the sites that most need it, rather than pretending the crowding problem doesn't exist at the places people most want to see.

**Everything else** — scored per user, per time slot, exactly as before:

```bash
RouteScore(poi, time_slot, user) =
    w1 * InterestMatch(poi, user.preferences)
  + w2 * (1 - CrowdIndex(poi, time_slot))
  + w3 * ProximityScore(poi, current_route_path)
  + w4 * NoveltyScore(poi, user.pacing_tier)
  - w5 * RedundancyPenalty(poi, already_selected_similar_pois)
```

This fills the itinerary around the landmark-tier anchors — surfacing genuinely good alternatives from the long tail, rather than either defaulting to the same top-10 list (the original problem, §5) or accidentally editorializing famous places out because a quieter alternative scored better on one axis (this one).

`CrowdIndex` starts as a heuristic (generic time-of-day/day-of-week curves by POI category — markets busy mornings, museums quieter early/late) and is replaced by a proper model once first-party visit-timestamp data reaches sufficient volume (Phase 3). Weights (`w1`–`w5`) are tunable per pacing tier — e.g., short stays weight `InterestMatch` and `ProximityScore` higher; long stays weight `NoveltyScore` higher. Landmark-tier curation is manual at pilot scale; it's a real, unautomated step that needs a repeatable process before this expands past one country (§14).

### 8.5 Group Trips & Native Sharing

No web client means no clickable links for sharing or joining — both are handled entirely on-device instead.

**Joining:** a trip has one owner (the creator) and any number of members. The owner generates a short, human-typeable invite code, shareable through any channel — text, WhatsApp, said out loud. Someone without the app installs it, opens it, taps "Join a Trip," and enters the code. This has more friction than a tap-to-join link (install → open → find the screen → type the code), and that's a real, deliberate trade-off for having zero web dependency, not an oversight (§14). Keeping the code short (6 characters) keeps that friction as low as it can be.

**Invite-code security:** codes expire after 72 hours by default (configurable by the trip owner). The `POST /trips/join` endpoint is rate-limited (5 attempts per minute per IP/device) to prevent brute-force enumeration of 6-character codes. Generating a new code deactivates all previous codes for that trip. Only one active code per trip at a time.

**Recap sharing:** the trip recap (§8.3) renders as a native image on-device — trip map, stats, a few highlight photos, in the spirit of a Strava or Spotify Wrapped card — and hands off to the OS share sheet. This isn't a workaround for lacking a web page; it's arguably the better mechanism for casual sharing specifically, since most recipients would rather see an image directly in their chat than tap through to a webpage.

Group trips change one assumption from §8.1: pacing and interest preferences move from per-user to trip-level. For a solo trip, `user.preferences` (as used in the RouteScore formula, §8.4) is exactly the trip creator's preferences. For a group trip, it becomes a trip-level preference set — agreed at setup, editable by any member — rather than any single member's individual profile winning by default.

If join-code drop-off turns out to be a real problem post-launch (tracked in §17), native Android App Links / iOS Universal Links are a narrow, later addition — they'd need a small HTTPS-served verification file, not a web app, and would only improve things for people who already have the app installed. Someone without it still has to install and enter a code either way.

**Real-time sync (group trips):** when a member adds an expense, completes a visit, or the itinerary is updated, other members are notified via Firebase Cloud Messaging push notifications and pull fresh data on next app foreground. Full WebSocket-based live sync is a Phase 3 candidate if group-trip engagement justifies the infrastructure cost.

### 8.6 Expense Tracking & Settlement

Members log spend against the trip, either manually or by photographing a receipt. Receipt photos go through OCR (§10) to extract an amount, vendor, and date — the extracted values are always shown back to the user for confirmation before anything is saved; OCR output is a draft, never an auto-committed expense (§13, §14).

Settlement uses a straight equal split, per the request driving this feature — not itemized per-expense splitting:

```bash
FairShare = TotalTripExpenses / NumberOfMembers
Balance(member) = TotalPaidBy(member) - FairShare
```

A positive balance means the group owes that member money; negative means they owe the group. Balances are then run through a debt-simplification pass (match the largest creditor against the largest debtor, repeat) so members make the minimum number of payments to settle up, rather than every pair settling with every other pair.

Once a member makes a payment, the payer initiates a payment record via `POST /trips/{id}/settlement/payments`, and the counterparty (the payee) confirms receipt via `PUT /trips/{id}/settlement/payments/{id}/confirm` (see §12). A payment is only considered settled once the counterparty confirms — this two-party model prevents a debtor from unilaterally marking a payment they haven't actually made. Confirmed payments reduce the outstanding balances shown in the settlement view. This avoids the settlement screen permanently showing stale debts after a trip ends.

## 9. System Architecture

```bash
┌──────────────────────┐
│    Mobile App        │
│ React Native (Expo)  │
│ iOS/Android, offline │
│ live tracking        │
└─────────┬────────────┘
          │ HTTPS / REST
┌─────────▼───────────┐
│    API Gateway      │   AWS API Gateway
└─────────┬───────────┘
          │
┌─────────▼───────────────────────────────────────┐
│              Backend — FastAPI (Python)         │
│  ┌────────┐  ┌───────────┐  ┌────────────────┐  │
│  │ Trips  │  │ Discovery │  │ Route Intel    │  │
│  │Service │  │ Service   │  │ Service        │  │
│  └────────┘  └───────────┘  └────────────────┘  │
└──────┬────────────────┬──────────────┬──────────┘
       │                │              │
┌──────▼───────┐  ┌─────▼────────┐  ┌──▼────────────┐
│ PostgreSQL   │  │    Redis     │  │ Meilisearch   │
│ + PostGIS    │  │   (cache)    │  │ (POI search)  │
└──────────────┘  └──────────────┘  └───────────────┘
       │
┌──────▼────────────────┐
│  Celery Workers       │   Heatmap/crowd-index recompute,
│  (Redis-backed queue) │   notification dispatch
└───────────────────────┘
```

One client, one codebase — the earlier two-frontend split (and the shared-types package that existed to keep them in sync with each other) is no longer needed. Generating TypeScript types from the backend's OpenAPI schema is still worth doing for the mobile app alone, just to avoid hand-maintaining request/response shapes — a simpler, lower-stakes version of the same idea (§11).

## 10. Tech Stack

| Layer                 | Choice                                                       | Rationale                                                                                                                                                                                                                     |
|-----------------------|--------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Mobile app framework  | React Native + Expo                                          | Native iOS/Android from one codebase; Expo simplifies builds (EAS) and OTA updates                                                                                                                                            |
| Maps                  | MapLibre GL Native + PMTiles                                 | Open-source fork of Mapbox GL with zero licensing cost; PMTiles (via Planetiler + OpenStreetMap data) for offline vector-tile packs served from S3/CloudFront and stored on-device via `pmtiles://file:///` protocol            |
| Client state          | Zustand + TanStack Query                                     | Lightweight local state and server-state caching                                                                                                                                                                              |
| Local/offline storage | SQLite (via expo-sqlite)                                     | Offline-first trip data, GPS-ping write queue                                                                                                                                                                                 |
| Shared code           | TypeScript types generated from the backend's OpenAPI schema | Keeps the app in sync with the API contract without hand-maintaining request/response shapes (§9)                                                                                                                             |
| Backend               | Python + FastAPI                                             | Same language as the crowd-prediction/recommendation logic (pandas, scikit-learn later) — avoids a polyglot split for a small team                                                                                            |
| Database              | PostgreSQL + PostGIS                                         | Nearly every core query (routes, POIs, "visited" geofencing, heatmaps) is geospatial; PostGIS is the standard for this                                                                                                        |
| Cache                 | Redis                                                        | Hot POI/session data, rate limiting                                                                                                                                                                                           |
| Search                | Meilisearch                                                  | Lightweight POI search; Elasticsearch is the scale-up path if needed later                                                                                                                                                    |
| Async jobs            | Celery + Redis                                               | Heatmap/crowd-index recompute, notifications                                                                                                                                                                                  |
| Auth                  | Custom JWT (bcrypt/argon2 + access/refresh tokens)           | Full control over the auth model; avoids mixing Google and AWS services; extends naturally to the Phase 3 admin dashboard via RBAC without adding another vendor                                                               |
| Push notifications    | Firebase Cloud Messaging                                     | Standard mobile push                                                                                                                                                                                                          |
| Receipt OCR           | PaddleOCR (PP-OCRv4, self-hosted, CPU-only)                  | Open-source OCR with custom spatial parsing layer for receipt fields (vendor, total, date); runs on standard CPU instances (~300ms/receipt), zero per-call cost. Extracted values are always shown for user confirmation before saving (§13) |
| Cloud / infra         | AWS (ECS Fargate, S3, CloudFront)                            | Fargate avoids K8s overhead pre-scale; CloudFront serves static backend assets, signed receipt-image URLs, and PMTiles for map rendering (no separate tile server needed — PMTiles use HTTP range requests against S3)          |
| CI/CD                 | GitHub Actions                                               | Two build/deploy jobs — mobile, backend                                                                                                                                                                                       |
| Error monitoring      | Sentry (self-hosted)                                         | Mobile + backend coverage; self-hosted under BSL license avoids per-event costs                                                                                                                                                |
| Metrics               | Grafana Cloud (free tier) + Prometheus                       | Managed free tier reduces ops overhead for a lean team; self-host path available if needed later                                                                                                                              |
| Product analytics     | PostHog                                                      | Self-hostable; useful given the EU pilot market's data-residency considerations                                                                                                                                               |

## 11. Project File Structure

Single mobile app, single backend, connected only through the API contract. The earlier need for Turborepo — orchestrating multiple frontend builds — goes away with one app; this stays a plain pnpm workspace, just to link `packages/api-types` locally without publishing it to npm. The Python backend still sits under `services/` rather than `apps/`, with its own tooling (Poetry), since it isn't part of the pnpm workspace at all.

```folder
DeTourist/
├── apps/
│   └── mobile/                    # React Native + Expo — iOS/Android
├── services/
│   └── backend/                   # FastAPI (Python) — own tooling, not in the pnpm workspace
├── packages/
│   └── api-types/                 # generated TS types + typed API client (§9)
├── infra/
│   ├── terraform/                 # or CDK — ECS Fargate, RDS/PostGIS, Redis, S3, CloudFront
│   └── docker-compose.yml         # local dev: postgres+postgis, redis, meilisearch
├── docs/
│   └── DeTourist-dev-spec.md        # this document
├── .github/workflows/             # mobile.yml, backend.yml
├── package.json
├── pnpm-workspace.yaml             # links apps/mobile ↔ packages/api-types locally
└── README.md
```

**apps/mobile/** — Expo Router, feature folders matching §6 / §8:

```folder
apps/mobile/
├── app/                           # Expo Router screens (file-based routing)
│   ├── (tabs)/
│   │   ├── discover.tsx
│   │   ├── trip.tsx
│   │   └── profile.tsx
│   ├── join.tsx                   # enter invite code (§8.5)
│   └── trip/[id]/
│       ├── tracking.tsx           # §8.3
│       └── recap.tsx              # native share sheet (§8.5)
├── src/
│   ├── features/
│   │   ├── tracking/              # live GPS, visited/not-visited layer (§8.3)
│   │   ├── discovery/             # §8.2
│   │   ├── route-intel/           # route scoring UI, offline route cache (§8.4)
│   │   ├── trips/                 # trip setup, pacing tier (§8.1)
│   │   ├── group/                 # invite codes, membership, join flow (§8.5)
│   │   ├── expenses/              # capture, OCR confirmation, settlement (§8.6)
│   │   └── offline-maps/          # MapLibre + PMTiles offline pack management
│   ├── lib/
│   │   ├── api-client.ts          # from @DeTourist/api-types
│   │   ├── location.ts            # adaptive GPS polling
│   │   ├── share.ts               # native recap image generation + share sheet (§8.5)
│   │   └── storage.ts             # SQLite wrapper
│   └── store/                     # Zustand
├── app.json                       # Expo config
└── eas.json                       # EAS Build
```

**packages/api-types/** — generated from the backend's OpenAPI schema (§9), consumed by the mobile app:

**services/backend/** — mirrors the Trips / Discovery / Route Intel services in §9:

```folder
services/backend/
├── app/
│   ├── main.py
│   ├── api/                       # trips.py, discovery.py, routes.py, pois.py, properties.py,
│   │                              # expenses.py, members.py, users.py
│   ├── services/
│   │   ├── trips_service.py
│   │   ├── discovery_service.py
│   │   ├── route_intel_service.py # RouteScore implementation (§8.4)
│   │   ├── expense_service.py     # OCR integration, settlement calculation (§8.6)
│   │   └── group_service.py       # invite code generation/validation, membership (§8.5)
│   ├── models/                    # one file per §7 entity: user, trip, poi, visit, crowd_signal,
│   │                              # route, property, expense, invite_code, settlement_payment, review
│   ├── workers/                   # Celery: crowd_index_recompute.py, notifications.py
│   └── core/                      # config.py, database.py (PostGIS session), security.py (custom JWT auth — registration, login, token management)
├── alembic/                       # DB migrations
├── tests/
└── pyproject.toml                 # Poetry — separate from the pnpm workspace
```

**packages/api-types/** — the sync mechanism from §9:

```folder
packages/api-types/
├── src/
│   ├── generated/                 # openapi-typescript output, regenerated from the backend's OpenAPI schema
│   ├── client.ts                  # thin typed fetch wrapper, used by the mobile app
│   └── shared/                    # score formatting, pacing-tier labels
└── package.json
```

Tests are colocated per feature (`*.test.ts(x)` next to source) rather than kept in a separate top-level test tree.

## 12. API Surface (core endpoints)

```API
# --- Auth ---
POST   /auth/register                        # create account (email, password)
POST   /auth/login                           # authenticate, returns access + refresh tokens
POST   /auth/refresh                         # exchange refresh token for new access token

# --- Users ---
GET    /users/me                             # current user profile + preferences
PUT    /users/me                             # update preferences (interests, pace, mobility)
POST   /users/me/delete                      # GDPR account + data deletion (§13)

# --- Trips ---
POST   /trips
GET    /trips/{id}
PUT    /trips/{id}                           # update dates, preferences, pacing
DELETE /trips/{id}
POST   /trips/{id}/visits
GET    /trips/{id}/recap                     # data for the native recap card (§8.5)

# --- Discovery & Routes ---
GET    /discovery/recommendations?trip_id=
GET    /routes/generate?trip_id=&date=
GET    /pois/{id}
GET    /pois/search?q=
GET    /crowd-signals/{poi_id}?date=

# --- Booking (Phase 2) ---
POST   /properties/{id}/book-redirect        # affiliate outbound

# --- Group Trips (Phase 2) ---
POST   /trips/{id}/invite-code               # owner generates/rotates a join code
POST   /trips/join                           # join by code, body: { code }
GET    /trips/{id}/members
DELETE /trips/{id}/members/{user_id}         # owner removes a member (§14)

# --- Expenses (Phase 2) ---
POST   /trips/{id}/expenses                  # log an expense (manual)
POST   /trips/{id}/expenses/scan             # upload receipt photo, returns OCR draft
GET    /trips/{id}/expenses
PUT    /trips/{id}/expenses/{expense_id}     # edit after OCR confirmation
DELETE /trips/{id}/expenses/{expense_id}     # delete an expense
GET    /trips/{id}/settlement                # equal-split balances, who-owes-who
POST   /trips/{id}/settlement/payments       # initiate a settlement payment record (§8.6)
PUT    /trips/{id}/settlement/payments/{id}/confirm  # counterparty confirms payment receipt (§8.6)

# --- Reviews (Phase 2) ---
POST   /pois/{id}/reviews                    # submit a review for a POI
POST   /properties/{id}/reviews              # submit a review for a property
GET    /pois/{id}/reviews                    # list reviews for a POI
GET    /properties/{id}/reviews              # list reviews for a property
```

## 13. Non-Functional Requirements

- **Offline reliability:** core map + tracking must function with no connectivity; writes queue locally and sync on reconnect.
- **Native share assets render correctly:** the recap image must be legible and properly sized across the native share targets (iMessage, WhatsApp, Instagram Stories) it's most likely to land in.
- **Privacy/GDPR:** pilot market is EU — location data requires explicit per-trip opt-in, a clear retention window, and a user-facing deletion path. Aggregate data used for the Phase 3 municipal product must be anonymized/de-identified before leaving the primary datastore. Receipt images and expense records are personal financial data and fall under the same retention/deletion requirements.
- **OCR is draft-only:** extracted receipt amounts must be confirmed by the user before an expense is saved; the app must never auto-commit unconfirmed OCR output as a financial record.
- **Single currency per trip (v1 scope):** expenses are tracked in one currency per trip (the pilot country's currency); multi-currency conversion for mixed-nationality groups is out of scope for v1.
- **Battery:** adaptive GPS polling must keep tracking-mode battery drain within a level that survives a full day of sightseeing on a single charge on mid-range devices.
- **Localization:** UI and POI content in English plus the pilot country's primary language(s) at minimum.
- **Performance target:** route/discovery generation under ~1.5s p95 for a same-day request.
- **Accessibility:** WCAG 2.1 AA compliance for core flows; screen-reader support for navigation, discovery feed, and expense entry.
- **API versioning:** API versioned via URL prefix (`/v1/`). Mobile clients pin to a version; deprecated versions supported for at least 6 months after successor launch.
- **Backup / disaster recovery:** automated daily database backups with 30-day retention. RDS Multi-AZ for failover. RPO < 1 hour, RTO < 4 hours for MVP.
- **Receipt image storage:** receipt photos stored in S3 with per-trip prefix, accessed via short-lived signed URLs scoped to trip members. Subject to GDPR retention/deletion requirements (see Privacy/GDPR above). Maximum upload size: 10 MB.

## 14. Key Technical Risks & Mitigations

| Risk                                                                                                | Mitigation                                                                                                                                                                      |
|-----------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Cold start — no crowd data at launch                                                                | Seed with OSM POI data + category-level heuristic time curves; pursue tourism-board data partnership from day one                                                               |
| GPS battery drain                                                                                   | Adaptive polling frequency; geofencing while stationary; user-adjustable tracking sensitivity                                                                                   |
| Low trust/opt-in for location access                                                                | Per-trip (not account-wide) opt-in; lead with immediate payoff (auto-built recap) rather than asking upfront                                                                    |
| OTA API access denied, or rate-parity clauses restrict pricing                                      | Defer full OTA integration to Phase 3; launch on affiliate deep-links (no parity exposure) + direct boutique partnerships                                                       |
| Popularity-driven recommendations reproduce overtourism                                             | Route/discovery scoring structurally penalizes over-concentration and rewards quality alternatives (§8.4) — a scoring-function decision, not a policy overlay                   |
| Landmark-tier curation is manual and doesn't scale past a handful of pilot countries                | Acceptable at single-country pilot scale (§4); needs a repeatable sourcing process (e.g., UNESCO list + a lightweight review step) before Phase 3 multi-country expansion       |
| Offline map reliability in low-connectivity regions                                                 | Pre-downloadable regional vector-tile packs; local write queue with reconnect sync                                                                                              |
| OCR misreads amounts on foreign-language or crumpled receipts                                       | Extracted values always shown for user confirmation before saving; manual entry is always available as a fallback, never a degraded path                                        |
| Equal split doesn't reflect actual per-person consumption (e.g., a non-drinker splitting a bar tab) | Documented v1 scope decision, not an oversight — matches what was requested. Itemized/custom splits are a natural Phase 3 candidate, not required now                           |
| Multi-member trips need real permission boundaries                                                  | Owner role can manage membership and remove members; members can add and edit only their own expenses, not others'                                                              |
| Join-by-code has more friction than a tap-to-join link, which may reduce group-join conversion      | Keep codes short and easy to share verbally/via text; revisit native App Links/Universal Links (§8.5) only if drop-off proves to be a real problem post-launch (tracked in §17) |
| Settlement payment gaming — a single user could mark a payment they haven't made                    | Two-party confirmation model: payer initiates the record, counterparty confirms receipt. Payment is not settled until both parties act (§8.6)                                    |

## 15. Monetization

- **Phase 1–2:** OTA affiliate commissions on outbound booking referrals; no in-app booking infrastructure cost.
- **Phase 2:** Direct commission from boutique/independent properties (pitched as an alternative to their existing 15–25% OTA commission).
- **Phase 3:** Anonymized visitor-flow data product licensed to tourism boards/municipal planners; optional premium subscription (offline map packs, advanced route planning, ad-free).

## 16. Team & Rough Timeline

**Lean MVP team:** 1 PM, 2 mobile engineers (React Native), 2 backend engineers, 1 data/ML engineer (part-time pre-launch is workable), 1 product designer, 1 shared/part-time QA. One client, one codebase — leaner than the two-frontend version earlier in this doc, with the trade-off landing entirely on the join-code UX (§8.5, §14) rather than on team size.

| Weeks               | Milestone                                                                                                        |
|---------------------|------------------------------------------------------------------------------------------------------------------|
| 1–4                 | Repo setup (mobile + backend + shared types package), design system, OSM data ingestion/cleanup for pilot region |
| 5–14                | MVP build: tracking map, discovery feed, pacing engine, offline maps                                             |
| 15–18               | Closed beta in pilot region, instrumentation, QA hardening                                                       |
| 19–22               | Public launch, pilot market (includes app-store review buffer)                                                   |
| +8–12 (post-launch) | Phase 2: affiliate booking, native recap sharing, personalization v1, group trips + expense tracking             |

## 17. Success Metrics

- % of trip-days with an active tracking session
- Route-suggestion acceptance rate (followed vs. deviated)
- Crowd-avoidance efficacy: median crowd-index of visited POIs vs. a raw-popularity baseline
- Multi-day retention within a single trip (D1/D3/D7 of trip, not calendar time)
- Join-code completion rate (code shared → successful join) — the concrete signal for whether the join-by-code trade-off (§8.5, §14) needs revisiting
- Phase 3: tourism-board data-product pilot-to-renewal conversion

## 18. Testing Strategy

- **Unit tests:** colocated with source (`*.test.ts(x)` for mobile, `test_*.py` for backend). Cover RouteScore calculation, settlement algorithm, pacing-tier logic, and OCR-draft confirmation flow.
- **Integration tests (backend):** pytest with a test PostgreSQL + PostGIS instance (via Docker). Cover API endpoint contracts, geospatial queries, and Celery task execution.
- **Mobile E2E tests:** Maestro for critical user flows — trip setup, tracking session start/stop, expense entry, invite-code join, and offline-mode fallback.
- **CI gates (GitHub Actions):** all unit + integration tests must pass before merge. Mobile E2E suite runs on the `main` branch nightly and before release builds.
- **Manual QA:** closed-beta testers in the pilot region cover real-world GPS/offline scenarios that automated tests cannot replicate (§16).
