# DeTourist — Development Roadmap

*Derived from the DeTourist Development Specification v1.0. Section references (§) point back to that spec.*

This roadmap sequences the spec's three feature phases (§6) against the build timeline sketched in §16, split into seven execution phases (Phase 1 is split into 1A and 1B to avoid overloading a single 10-week sprint). This expanded version adds, for every phase: a sprint-level timeline, tasks broken down to an implementable grain with role ownership, a Definition of Done for exiting the phase, data-migration notes, and the specific risks from §14 that phase is meant to address.

**Open-source preference applied throughout.** Where the spec (§10) originally specified a paid/managed service, this roadmap substitutes an open-source or self-hosted alternative wherever practical. Key deviations from §10: custom JWT auth replaces Firebase Auth, MapLibre + PMTiles replaces Mapbox SDK, PaddleOCR replaces AWS Textract, self-hosted Sentry replaces managed Sentry. See individual phase tasks for details.

Team baseline throughout, per §16: 1 PM, 2 mobile engineers (React Native), 2 backend engineers, 1 data/ML engineer (part-time pre-launch is workable), 1 product designer, 1 shared/part-time QA. Phase 5 outgrows this roster — flagged where it happens.

## Phase Map

| Roadmap Phase                   | Corresponds to                 | Timing                              |
|---------------------------------|--------------------------------|-------------------------------------|
| **0 — Foundation & Setup**      | groundwork ahead of §6 Phase 1 | Weeks 1–4                           |
| **1A — MVP Core Loop**          | Spec Phase 1 (§6), core        | Weeks 5–12                          |
| **1B — MVP Polish & Testing**   | Spec Phase 1 (§6), polish      | Weeks 13–16                         |
| **2 — Closed Beta & Hardening** | —                              | Weeks 17–22                         |
| **3 — Public Launch**           | —                              | Weeks 23–26 (readiness-gated)       |
| **4 — Booking & Growth**        | Spec Phase 2 (§6)              | +8–12 weeks post-launch             |
| **5 — Data Business & Scale**   | Spec Phase 3 (§6)              | Post–Phase 4, not timeboxed in spec |

Each phase's file list shows only what's **new** since the previous phase — everything earlier still exists underneath it. By the end of Phase 4, the full repo structure from §11 is in place.

---

## Phase 0 — Foundation & Setup

**Weeks 1–4 · Goal:** a working skeleton — repo, infra, auth, and the API-contract pipeline — for every later phase to build on.

### Sprint Breakdown

| Week | Focus                                                                                                |
|------|------------------------------------------------------------------------------------------------------|
| 1    | Repo scaffolded, tooling/conventions locked, infra skeleton started                                  |
| 2    | Backend skeleton live (FastAPI + DB + custom auth); mobile skeleton live (Expo + routing)            |
| 3    | API-contract pipeline working end-to-end; OSM ingestion pipeline built                               |
| 4    | Design system delivered; CI green; full-stack smoke test (mobile → API → DB round trip) — phase exit |

### Tasks

**Repo & tooling** *(PM + both eng teams)*

- [ ] Initialize git repo; branch protection on `main`; document branching/PR conventions (feeds the CI gate design in §18)
- [ ] Scaffold the monorepo per §11: `apps/mobile`, `services/backend`, `packages/api-types`, `infra/`, `docs/` — this structure is a deliberate choice for colocation and shared CI; evaluate early whether it's earning its keep vs. a multi-repo setup
- [ ] `pnpm-workspace.yaml` linking `apps/mobile` ↔ `packages/api-types` (no Turborepo needed — single app, §11)
- [ ] `pyproject.toml` (Poetry) for `services/backend`, deliberately outside the pnpm workspace (§11)
- [ ] Shared lint/format config (ESLint, Prettier) across mobile + api-types
- [ ] Commit this spec to `docs/DeTourist-dev-spec.md`; write `README.md` with setup instructions

**Infrastructure** *(backend eng)*

- [ ] `infra/docker-compose.yml` — local Postgres+PostGIS, Redis, Meilisearch
- [ ] `infra/terraform/` skeleton — VPC, ECS Fargate cluster, RDS/PostGIS, ElastiCache Redis, S3, CloudFront (§9, §10)
- [ ] AWS API Gateway provisioned in front of the (not-yet-deployed) FastAPI service
- [ ] Secrets management (Secrets Manager / SSM) for DB creds, JWT signing secret, S3 credentials, FCM server key (Phase 4)
- [ ] GitHub Actions: `mobile.yml`, `backend.yml` — lint + unit tests gating every PR (§18)
- [ ] `/v1/` URL-prefix convention documented (§13)

**Backend skeleton** *(backend eng)*

- [ ] FastAPI entrypoint + health-check endpoint
- [ ] PostgreSQL + PostGIS connection layer (`core/database.py`) — session management, connection pooling
- [ ] Alembic initialized; baseline migration
- [ ] Custom JWT auth system (`core/security.py`) — registration, login, bcrypt/argon2 password hashing, access/refresh token management, token-verification middleware (replaces Firebase Auth from §10; simpler than mixing Google and AWS services, avoids vendor lock-in, and gives full control over the auth model needed for Phase 5's admin dashboard)
- [ ] `core/config.py` — environment-based settings (local / staging / prod)
- [ ] `User`, `Trip` models + migrations (§7)
- [ ] `GET/PUT /users/me`, `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST/GET/PUT/DELETE /trips/{id}` — basic CRUD, auth-gated

**Mobile skeleton** *(mobile eng)*

- [ ] Expo project (TypeScript template) + EAS project linked
- [ ] Expo Router shell: `(tabs)/discover.tsx`, `trip.tsx`, `profile.tsx` — placeholder screens, nav working
- [ ] Custom auth client integration — sign-in/sign-up screens, token storage (expo-secure-store), session persistence, automatic token refresh
- [ ] Zustand store scaffold (`store/`) — auth slice as the first real slice
- [ ] SQLite wrapper (`lib/storage.ts`) — schema for offline trip cache + GPS-ping write queue (used starting Phase 1A)
- [ ] `lib/api-client.ts` — typed fetch wrapper stub, wired to `packages/api-types`

**API contract pipeline** *(backend + mobile eng)*

- [ ] FastAPI OpenAPI schema exposed at `/openapi.json`
- [ ] `openapi-typescript` script generating `packages/api-types/src/generated/`
- [ ] `packages/api-types/src/client.ts` — thin typed fetch wrapper consumed by mobile
- [ ] CI step regenerating types on backend schema change; fails the build on drift

**Data** *(data/ML eng + backend eng)*

- [ ] OSM extract for the pilot region (Bosnia and Herzegovina, §4) via Overpass API / Geofabrik dump
- [ ] Cleanup pipeline: dedupe, normalize categories, drop low-confidence tags
- [ ] `POI` model + migration — `source` (`osm | partner | manual`); `significance_tier` field stubbed, populated in Phase 1A (§8.4)
- [ ] Seed script loading cleaned OSM data into `POI`
- [ ] Draft category taxonomy that Phase 1A's `CrowdIndex` heuristic will key off (markets, museums, landmarks, etc.)
- [ ] **CrowdIndex calibration research** — the data/ML engineer researches actual visitation patterns for the pilot region (published tourism statistics, academic literature on tourist flows, time-of-day patterns by POI category) and produces a documented, defensible set of category-level time curves. This is a *research* deliverable, not just a code commit — the heuristic curves the entire recommendation engine depends on must be reviewed and justified, not arbitrary. Deliver as `docs/crowd-index-calibration.md`

**Design** *(designer)*

- [ ] Design tokens: typography scale, color palette, spacing system
- [ ] Base component library (buttons, cards, inputs, map-layer legend) used across all Phase 1A screens
- [ ] Wireframes for trip setup, discovery feed, tracking map, recap — enough fidelity to unblock Phase 1A build

### Data Migration

N/A — this is the initial schema creation. No existing data to migrate.

### Definition of Done

- [ ] `docker-compose up` gives a working local backend against Postgres+PostGIS/Redis/Meilisearch
- [ ] Mobile app boots, authenticates against the custom JWT auth system, and calls at least one real backend endpoint through the generated client
- [ ] CI green on `main`: lint + unit tests passing for both mobile and backend
- [ ] `POI` seeded with pilot-region OSM data
- [ ] Terraform plan applies cleanly to a staging AWS account (doesn't need to be production-scale yet)
- [ ] CrowdIndex calibration research document reviewed and approved

### Risks Addressed This Phase (§14)

**Mitigation implemented:**

- **Cold start (no crowd data at launch)** — OSM seeding starts here so Phase 1A doesn't wait on it. CrowdIndex calibration research ensures the heuristic curves are grounded in real data, not guesses.

### Files after Phase 0

```folder
DeTourist/
├── apps/mobile/
│   ├── app/(tabs)/
│   │   ├── discover.tsx        # placeholder
│   │   ├── trip.tsx            # placeholder
│   │   └── profile.tsx         # placeholder
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api-client.ts   # typed fetch stub
│   │   │   └── storage.ts      # SQLite wrapper, offline schema
│   │   └── store/              # Zustand, auth slice
│   ├── app.json
│   └── eas.json
├── services/backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/{users.py, trips.py, auth.py}
│   │   ├── services/trips_service.py
│   │   ├── models/{user.py, trip.py, poi.py}
│   │   └── core/{config.py, database.py, security.py}
│   ├── alembic/
│   ├── tests/
│   └── pyproject.toml
├── packages/api-types/
│   ├── src/{generated/, client.ts}
│   └── package.json
├── infra/{terraform/, docker-compose.yml}
├── docs/{DeTourist-dev-spec.md, crowd-index-calibration.md}
├── .github/workflows/{mobile.yml, backend.yml}
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## Phase 1A — MVP Core Loop *(Spec Phase 1, §6 — core features)*

**Weeks 5–12 · Goal:** the core user loop working end-to-end for a solo trip in the pilot region — trip setup, discovery feed, route generation, live tracking, and visit recording. Offline maps and trip recap are deferred to Phase 1B to avoid overloading.

### Sprint Breakdown

| Weeks | Focus                                                                                                 |
|-------|-------------------------------------------------------------------------------------------------------|
| 5–6   | Data model complete (`Visit`, `CrowdSignal`, `Route`); landmark-tier curation; `CrowdIndex` heuristic |
| 7–8   | `RouteScore` engine + Discovery backend; trip setup flow (mobile)                                     |
| 9–10  | Live tracking (adaptive GPS, visited layer, offline write queue); discovery feed UI                   |
| 11–12 | Route-intel UI integration; unit + integration test suites; core-loop bug bash — phase exit           |

### Tasks

**Route Intelligence & data** *(backend eng + data/ML eng)*

- [ ] `Visit` model + migration — `arrived_at`, `departed_at`, `source` (`gps_auto | manual_checkin`)
- [ ] `CrowdSignal` model + migration — `time_bucket`, `crowd_index`, `sample_size`, `source`
- [ ] `Route` model + migration — `poi_sequence[]`, `total_score`, `mode`
- [ ] Landmark-tier curation: UNESCO World Heritage list + hand-picked consensus landmarks for the pilot country (~20–30 sites for Bosnia and Herzegovina), tagged via `significance_tier` — manual, one-time-per-country step (§8.4, §14)
- [ ] `CrowdIndex` heuristic v1: implement the calibrated category-level time-of-day/day-of-week curves from the Phase 0 research document (§8.4)
- [ ] `RouteScore` implementation in `route_intel_service.py`:
  - [ ] `InterestMatch(poi, user.preferences)`
  - [ ] `CrowdIndex(poi, time_slot)` lookup against the heuristic table
  - [ ] `ProximityScore(poi, current_route_path)`
  - [ ] `NoveltyScore(poi, user.pacing_tier)`
  - [ ] `RedundancyPenalty(poi, already_selected_similar_pois)`
  - [ ] Weighted sum (`w1`–`w5`) with per-pacing-tier weight presets (§8.4)
- [ ] Landmark-tier bypass logic: landmark POIs always included when the itinerary is long enough to fit them, scheduled into low-crowd `time_slot`s rather than scored/excluded like everything else (§8.4)
- [ ] Celery worker `crowd_index_recompute.py` — scheduled recompute of `CrowdSignal` rows
- [ ] `GET /routes/generate?trip_id=&date=`
- [ ] `GET /crowd-signals/{poi_id}?date=`
- [ ] Meilisearch index for POIs; `GET /pois/search?q=`, `GET /pois/{id}`

**Discovery & pacing** *(backend eng + mobile eng)*

- [ ] `discovery_service.py` + `GET /discovery/recommendations?trip_id=` — ranks by RouteScore, filtered by interests + pacing tier
- [ ] Pacing-tier logic: 1–3 / 4–7 / 8+ day behaviors (§8.1)
- [ ] Trip setup flow: dates, home base, interests, pace preference → `POST /trips`
- [ ] Discovery feed UI (`discover.tsx`, `features/discovery/`)

**Live tracking** *(mobile eng + backend eng)*

- [ ] Adaptive-frequency GPS polling — dense while moving, sparse/geofenced while stationary (`lib/location.ts`) (§8.3, battery NFR §13)
- [ ] Visited/not-visited map layer (`features/tracking/`, `trip/[id]/tracking.tsx`) — uses MapLibre GL Native for rendering (see Phase 1B for offline packs)
- [ ] `POST /trips/{id}/visits`; local write queue with reconnect sync (offline NFR §13)
- [ ] Per-trip, not account-wide, location opt-in (§5, §14)

**Testing** *(QA + backend + mobile eng)*

- [ ] Unit tests: RouteScore calculation, pacing-tier logic (§18)
- [ ] Integration tests: pytest + Docker Postgres+PostGIS — API contracts, geospatial queries, Celery execution (§18)

### Data Migration

Additive schema changes only (`Visit`, `CrowdSignal`, `Route` tables). No data migration required — Phase 0's `POI` and `User`/`Trip` data is preserved as-is.

### Definition of Done

- [ ] A solo user can complete the core loop: set up a trip → see a pacing-aware discovery feed → generate a route that respects landmark scheduling → track a visit (online and offline) → see visited/not-visited on the map
- [ ] RouteScore and discovery generation both hold under reasonable response times (full 1.5s p95 load testing is Phase 1B)
- [ ] Landmark tier fully curated and live for the pilot country
- [ ] Unit + integration test suites green in CI

### Risks Addressed This Phase (§14)

**Mitigation implemented:**

- **Popularity-driven recommendations reproducing overtourism** — the RouteScore/landmark-tier split itself is a scoring-function decision rather than a policy overlay.
- **GPS battery drain** — adaptive polling + geofencing implemented. *Validated on real hardware in Phase 2.*

### Files after Phase 1A (new since Phase 0)

```folder
apps/mobile/
├── app/
│   ├── (tabs)/{discover.tsx, trip.tsx, profile.tsx}   # now fully built out
│   └── trip/[id]/tracking.tsx
└── src/
    ├── features/{tracking/, discovery/, route-intel/, trips/}
    └── lib/location.ts

services/backend/app/
├── api/{discovery.py, routes.py, pois.py}
├── services/{discovery_service.py, route_intel_service.py}
├── models/{visit.py, crowd_signal.py, route.py}
└── workers/crowd_index_recompute.py

packages/api-types/src/shared/     # score formatting, pacing-tier labels
```

Everything from Phase 0 still exists, now fully implemented rather than stubbed.

---

## Phase 1B — MVP Polish & Testing *(Spec Phase 1, §6 — polish features)*

**Weeks 13–16 · Goal:** offline maps, trip recap, and the full integration/performance testing pass that validates the MVP is shippable.

### Sprint Breakdown

| Weeks | Focus                                                                                                     |
|-------|-----------------------------------------------------------------------------------------------------------|
| 13–14 | MapLibre offline map packs (PMTiles pipeline + download manager); trip recap generation                   |
| 15–16 | Maestro E2E tests; load testing to 1.5s p95 target; performance tuning; integration bug bash — phase exit |

### Tasks

**Offline maps** *(mobile eng + backend eng)*

- [ ] MapLibre GL Native integration via `@maplibre/maplibre-react-native` (`features/offline-maps/`) — replaces Mapbox SDK (§10 deviation); MapLibre is the open-source fork of Mapbox GL with zero licensing cost
- [ ] Tile generation pipeline: Geofabrik OSM extract → Planetiler → PMTiles format. Regional PMTiles file for Bosnia and Herzegovina (~80–120 MB) generated and uploaded to S3
- [ ] Online tile serving: PMTiles on S3 behind CloudFront, served via HTTP range requests — no tile server needed
- [ ] Offline map manager service: download regional PMTiles to device via `expo-file-system`, store locally, MapLibre reads via `pmtiles://file:///` protocol
- [ ] Map style JSON with bundled font glyphs and sprites for full offline rendering
- [ ] `GET /maps/regions` — catalog endpoint listing available offline packs with download URLs, file sizes, and bounds

**Trip recap** *(mobile eng + backend eng + designer)*

- [ ] `GET /trips/{id}/recap` — data aggregation
- [ ] Native on-device recap image generation (trip map, stats, highlight photos), Strava/Spotify-Wrapped-style visual design (`lib/share.ts`) + OS share-sheet hand-off (§8.3, §8.5)
- [ ] `trip/[id]/recap.tsx`

**Testing & performance** *(QA + backend + mobile eng)*

- [ ] Maestro E2E: trip setup, tracking session start/stop, offline-mode fallback (§18)
- [ ] Load test: route/discovery generation under ~1.5s p95 (§13) — tune query plans, caching, and PostGIS indexing before phase exit
- [ ] Performance profiling on device: MapLibre rendering, offline pack loading, GPS polling battery impact (preliminary — full hardware validation in Phase 2)

### Data Migration

N/A — no schema changes. New features (offline maps, recap) consume existing data without modifications.

### Definition of Done

- [ ] A solo user can complete the full MVP loop: set up a trip → see a pacing-aware discovery feed → generate a route that respects landmark scheduling → track a visit (online and offline) → produce and share a recap image
- [ ] Offline map pack downloadable and functional for the pilot region — map renders fully offline with labels and icons
- [ ] RouteScore and discovery generation both hold under 1.5s p95 under load-test conditions
- [ ] Unit + integration test suites green in CI; Maestro flows passing locally

### Risks Addressed This Phase (§14)

**Mitigation implemented:**

- **Offline map reliability** — pre-downloadable PMTiles packs + local `pmtiles://file:///` rendering. *Validated against real connectivity conditions in Phase 2.*

**Risk resolved:**

- **Mapbox pricing/availability** — eliminated entirely by switching to MapLibre (open-source, no licensing cost) + Protomaps PMTiles (open-source tile format) + OpenStreetMap data (open data). No vendor dependency for the map stack.

### Files after Phase 1B (new since Phase 1A)

```folder
apps/mobile/
├── app/trip/[id]/recap.tsx
└── src/
    ├── features/offline-maps/     # MapLibre + PMTiles download manager
    └── lib/share.ts               # native recap image generation + share sheet

services/backend/app/
└── api/maps.py                    # /maps/regions catalog endpoint

infra/
└── tile-pipeline/                 # Planetiler config, PMTiles generation scripts
```

---

## Phase 2 — Closed Beta & Hardening

**Weeks 17–22 · Goal:** close out the non-functional requirements, de-risk what only real devices in the real world can test, and run a beta long enough to surface real trip-length bugs.

### Sprint Breakdown

| Week | Focus                                                                                      |
|------|--------------------------------------------------------------------------------------------|
| 17   | Observability wired (self-hosted Sentry, PostHog, Grafana/Prometheus); GDPR flow finalized |
| 18   | Security hardening pass; backup/DR configured and validated (RDS Multi-AZ, RPO/RTO drill)  |
| 19   | Accessibility pass; localization complete; battery validation on real mid-range devices    |
| 20   | Beta cohort recruited; beta build distributed; dashboards monitoring live                  |
| 21–22| Beta running; weekly bug-triage cadence; iterate on beta feedback — phase exit             |

### Tasks

**Observability** *(backend + mobile eng)*

- [ ] Sentry (self-hosted) — mobile (crash + non-fatal error reporting) and backend (exception middleware) (§10 deviation; Sentry is open-source under BSL, self-hosting for internal use avoids per-event costs)
- [ ] PostHog self-hosted, EU-region, given the pilot market's data-residency considerations (§10, §13); event taxonomy defined against the §17 metrics
- [ ] Grafana Cloud (free tier) + Prometheus: request latency, RouteScore generation time, Celery queue depth (§10) — both open-source
- [ ] Alerting rules: error-rate spikes, RouteScore p95 latency breach, Celery backlog

**Security hardening** *(backend eng)*

- [ ] Rate limiting on all public-facing endpoints — especially `GET /routes/generate` and `GET /discovery/recommendations` (computationally expensive), not just the invite-code endpoint. Use Redis-backed rate limiting middleware
- [ ] Input validation hardening: GPS coordinate bounds checking, expense amount limits, file upload size enforcement (10MB receipt limit from §13 — enforce at both API Gateway and application layer)
- [ ] Authorization middleware audit: ensure every endpoint enforces ownership checks at the middleware/decorator level, not just in business logic. Document the authorization model
- [ ] JWT token security review: token expiry policy, refresh token rotation, revocation strategy for compromised tokens
- [ ] Dependency vulnerability scan added to CI (e.g., `pip-audit` for Python, `npm audit` for Node)

**Compliance & reliability** *(backend eng + PM)* (§13)

- [ ] Per-trip location opt-in copy finalized and legally reviewed (GDPR — pilot market is EU)
- [ ] Location-data retention window implemented (auto-purge policy)
- [ ] `POST /users/me/delete` — cascading deletion across `User`, `Trip`, `Visit`, and derived data; tested end-to-end (simpler with custom auth than it would have been with Firebase — no external user store to coordinate with)
- [ ] RDS Multi-AZ failover enabled; automated daily backups, 30-day retention
- [ ] DR drill: simulate failover, confirm RPO < 1h / RTO < 4h in practice, not just on paper

**Accessibility & localization** *(mobile eng + designer)*

- [ ] WCAG 2.1 AA audit on trip setup, discovery feed, tracking map; VoiceOver/TalkBack pass on navigation and discovery feed
- [ ] Localization: extract all UI strings, translate to the pilot country's primary language(s); translate POI category/description content
- [ ] Battery profiling on 2–3 mid-range Android/iOS reference devices — confirm a full sightseeing day survives on one charge with tracking on; tune adaptive-polling thresholds if not

**Beta** *(PM + QA)*

- [ ] Recruit closed-beta cohort in the pilot region (target: at least 2 weeks of active beta usage before phase exit)
- [ ] Beta build distributed (TestFlight / Play internal testing track)
- [ ] Dashboards live before beta starts, tracking the §17 metrics: % trip-days with active tracking, route-suggestion acceptance rate, crowd-avoidance efficacy vs. a popularity baseline, D1/D3/D7 trip retention
- [ ] Manual QA matrix: spotty connectivity, GPS drift in dense old-town streets, background-app suspension during tracking (§16, §18)
- [ ] Weekly bug-triage cadence, beta reports feeding directly into the backlog

### Data Migration

N/A — no schema changes. Observability, security, and compliance are infrastructure-level additions that don't modify the application data model.

### Definition of Done

- [ ] Zero P0/P1 bugs open from beta feedback
- [ ] DR drill completed with documented RPO/RTO results meeting target
- [ ] Accessibility audit passed on all Phase 1 screens
- [ ] Security hardening checklist complete — rate limiting, input validation, authorization middleware all reviewed and deployed
- [ ] Beta cohort has at least 2 full weeks of usage data; tracking-session % and retention numbers reviewed by PM — no red flags blocking launch

### Risks Addressed This Phase (§14)

**Risk validated (previously implemented, now confirmed with real data):**

- **Low trust / opt-in for location access** — validated against real beta users' opt-in behavior, not just design intent.
- **GPS battery drain** — validated on real mid-range hardware, not simulators.
- **Offline map reliability** — stress-tested against the pilot region's actual low-connectivity pockets.

### Files after Phase 2 (new since Phase 1B)

Mostly config and infra, not new application modules. None of this is explicitly enumerated in §11's tree, but all of it is required by §10/§13/§18:

```folder
infra/terraform/          # expanded: Multi-AZ RDS, backup policies, alarms
infra/sentry/             # self-hosted Sentry docker-compose / deployment config
# PostHog / Prometheus initialization added into the existing
# core/config.py (backend) and app bootstrap (mobile) — no new top-level files
# locale/translation resource files (i18n strings)
```

---

## Phase 3 — Public Launch

**Weeks 23–26 (readiness-gated) · Goal:** ship it. This phase is defined by readiness criteria, not rigid calendar weeks — if Phase 2 exits cleanly, launch can happen faster; if beta surfaces issues, it extends.

### Sprint Breakdown

| Week | Focus                                                            |
|------|------------------------------------------------------------------|
| 23   | App Store + Play Store submissions filed; store assets finalized |
| 24   | Review-process buffer (address rejections / resubmit if needed)  |
| 25   | Approved; staged / phased rollout begins                         |
| 26   | Full public launch; monitoring live — phase exit                 |

### Tasks

**Release engineering** *(mobile eng + backend eng)*

- [ ] `eas.json` production build profiles: code signing, environment variables pointed at production API
- [ ] Production infra scale check: ECS Fargate task counts, RDS sizing, Redis capacity against expected launch-week traffic, not just beta-level load
- [ ] Staged rollout configured (phased release on App Store, staged % rollout on Play Store) rather than 100% on day one, where store tooling supports it
- [ ] On-call rotation defined for launch week
- [ ] Launch-day monitoring runbook: Sentry error-rate dashboard, Grafana latency dashboard, documented rollback procedure

**Store submission** *(PM + designer)*

- [ ] Apple Developer + Google Play Console listings created
- [ ] Store screenshots, app icon, description copy finalized
- [ ] Privacy policy published (references the GDPR handling built in Phase 2), linked in both listings
- [ ] Submit to App Store review and Play Store review; track the review buffer and be ready to act on rejection feedback

**Post-submit** *(PM)*

- [ ] §17 success-metric tracking confirmed live against production data, not staging

### Data Migration

Decision required: whether beta user data survives into production or is wiped at launch. Document the decision and implement accordingly. If beta data is retained, verify that any schema changes between beta and production are handled by Alembic migrations.

### Definition of Done

- [ ] App live and installable on both App Store and Google Play in the pilot market
- [ ] No P0 incidents in the first 72 hours, or any that occurred were resolved within the runbook's target response time
- [ ] Production dashboards showing real user traffic against the §17 metrics

### Risks Addressed This Phase (§14)

None new — this phase executes cleanly on infrastructure/process risk already mitigated in Phase 2, rather than addressing new product risk.

### Files after Phase 3

No new application code — this phase is release engineering, not feature work. `eas.json` reaches its final production form; store metadata/assets live in App Store Connect / Play Console (or under `docs/store-listing/` if the team wants them versioned).

---

## Phase 4 — Booking & Growth *(Spec Phase 2, §6)*

**+8–12 weeks post-launch · Goal:** the full §6 Phase 2 feature set. Sprint numbers below are relative to phase start, not calendar weeks — the range flexes with scope.

### Sprint Breakdown

| Sprint                      | Focus                                                                                       |
|-----------------------------|---------------------------------------------------------------------------------------------|
| 1 (~weeks 1–2)              | `Property` model + affiliate deep-link tracking backend                                     |
| 2 (~weeks 3–4)              | Group trips backend (`TripMember`, `InviteCode`, permissions) + mobile join flow            |
| 3 (~weeks 5–6)              | Expense backend (PaddleOCR integration, receipt storage) + settlement algorithm             |
| 4 (~weeks 7–8)              | Mobile expense capture/OCR-confirmation UI + settlement view; Reviews (backend + surfacing) |
| 5 (~weeks 9–10)             | Personalization v1, native recap-sharing refinement, FCM real-time sync                     |
| 6 (~weeks 11–12, if needed) | API versioning strategy, E2E test extension, hardening, bug fixes — phase exit              |

### Tasks

**Booking** *(backend eng + PM)*

- [ ] `Property` model + migration — `type` (`hotel | apartment | guesthouse`), `direct_bookable`, `affiliate_refs {}`
- [ ] Manual property-recruitment pipeline for boutique/independent properties in the pilot region (PM/business-led; needs simple internal tooling to add/edit recruited properties)
- [ ] `POST /properties/{id}/book-redirect` — affiliate outbound tracking, logs referral events
- [ ] Direct-booking flow UI for recruited properties, distinct from the affiliate-redirect flow

**Personalization** *(data/ML eng + backend eng)*

- [ ] First-party visit-data pipeline feeding a collaborative-filtering model
- [ ] Personalization v1 layered into `discovery_service.py` — blends the collaborative-filtering signal into the existing RouteScore-ranked feed rather than replacing it
- [ ] Holdout evaluation: personalized vs. non-personalized feed, checked against §17 metrics before full rollout

**Group trips** *(backend eng + mobile eng)*

- [ ] `TripMember` model + migration — `role` (`owner | member`)
- [ ] `InviteCode` model + migration — 6-character code, `expires_at` (72h default, owner-configurable), `is_active`
- [ ] `group_service.py`: collision-resistant code generation; rotation deactivates prior codes; validation
- [ ] `POST /trips/{id}/invite-code` (owner-only), `POST /trips/join` (rate-limited 5 attempts/min/IP or device, §8.5), `GET /trips/{id}/members`, `DELETE /trips/{id}/members/{user_id}` (owner-only)
- [ ] Permission enforcement — owner manages membership; members add/edit only their own expenses (§14) — covered by integration tests, not just UI hiding. Enforced at the authorization middleware level, not just in business logic
- [ ] `Trip.preferences` becomes trip-level and editable by any member for group trips, vs. copied-from-creator for solo trips (§8.5)
- [ ] Mobile: `join.tsx` — enter-code screen, install → open → join flow
- [ ] Mobile: `features/group/` — membership list, invite-code display/share, role indicators
- [ ] Firebase Cloud Messaging wired for group trips; `workers/notifications.py` — push on add-expense / complete-visit / itinerary-update; clients pull fresh data on next foreground (§8.5). FCM is free and is the standard mobile push transport — kept despite removing Firebase Auth, as they are independent services
- [ ] Native recap sharing refined: image legibility and correct sizing across iMessage, WhatsApp, and Instagram Stories specifically (§13 NFR), building on the Phase 1B base implementation

**Expenses & settlement** *(backend eng + mobile eng + designer)*

- [ ] `Expense` model + migration — `paid_by`, `amount`, `category`, `receipt_image_url`, `ocr_status` (`none | pending | confirmed`), `split_type` hardcoded to `equal` (§7)
- [ ] `SettlementPayment` model + migration — includes `marked_by` (user who initiated the payment record) and `confirmed_by` (counterparty who confirms receipt). Both `from_user` and `to_user` must act for a payment to be considered settled — prevents a debtor from unilaterally marking a payment they haven't made. `confirmed_at` is set only when the counterparty confirms
- [ ] Receipt OCR Engine (`services/backend/app/services/ocr_service.py`): self-hosted PaddleOCR (PP-OCRv4, CPU-only) for text detection and recognition, with a custom spatial parsing layer that groups text by vertical alignment and extracts vendor, total, and date via rule-based logic (§10 deviation; replaces AWS Textract to avoid per-API-call costs and keep everything open-source). Falls back to manual entry if OCR confidence < 0.60
- [ ] OCR draft-only enforcement, server-side via the `ocr_status` state machine, not just a UI convention: extracted values always require user confirmation, never auto-committed (§13, §14)
- [ ] Manual expense entry as a first-class path, not a fallback UI (§14)
- [ ] Receipt image upload to S3 — per-trip key prefix, 10MB max, short-lived signed URLs scoped to trip members (§13)
- [ ] Settlement calculation: `FairShare = TotalTripExpenses / NumberOfMembers`; `Balance(member) = TotalPaidBy(member) - FairShare`
- [ ] Debt-simplification pass: match largest creditor against largest debtor, repeat, to minimize payment count (§8.6)
- [ ] `POST/GET/PUT/DELETE /trips/{id}/expenses`, `POST /trips/{id}/expenses/scan`, `GET /trips/{id}/settlement`, `POST /trips/{id}/settlement/payments` (initiates a payment record; counterparty confirms via `PUT /trips/{id}/settlement/payments/{id}/confirm`)
- [ ] Mobile: `features/expenses/` — receipt capture, OCR-draft confirmation screen, manual entry form, settlement view with two-party payment confirmation flow

**Reviews** *(backend eng)*

- [ ] `Review` model + migration — `target_type` (`poi | property`), `rating`, `text`
- [ ] `POST/GET /pois/{id}/reviews`, `POST/GET /properties/{id}/reviews`
- [ ] Aggregate ratings surfaced in the discovery feed (POI cards) and property listings

**API versioning** *(backend eng)*

- [ ] API versioning strategy documented for breaking changes introduced by group trips and expenses. Determine whether Phase 4 changes (new fields on `Trip`, new endpoints) are additive (backward-compatible with `/v1/`) or require `/v2/`. If `/v2/` is needed, implement the version routing and document the 6-month deprecation window per §13

**Testing** *(QA)*

- [ ] Maestro E2E: expense entry (capture → OCR draft → confirm → saved), invite-code join (install → join → see shared trip) (§18)
- [ ] Unit tests: settlement algorithm including debt-simplification edge cases (3+ members, uneven payments), OCR-draft confirmation state machine, two-party payment confirmation (§18)
- [ ] Integration tests: invite-code rate limiting; permission boundaries (a member can't edit another member's expense or remove another member); settlement payment requires counterparty confirmation

**Watch metric**

- [ ] Join-code completion rate, tracked from day one of this phase (§17) — if drop-off is high, scope native App/Universal Links as a follow-up (§8.5, §14); not built by default

### Data Migration

Significant schema additions (`Property`, `TripMember`, `InviteCode`, `Expense`, `SettlementPayment`, `Review`). All are new tables — no existing data modification required. However:

- The `Trip` model gains group-trip fields (`preferences` becomes trip-level). Verify via Alembic migration that existing solo trips retain their preferences without data loss
- Document whether the new `SettlementPayment` schema (with `marked_by`/`confirmed_by`) is backward-compatible with any existing API clients

### Definition of Done

- [ ] A group of 3+ users can complete the full flow: create trip → invite via code → all members join → log expenses with receipt photos → view settlement → initiate a payment → counterparty confirms payment
- [ ] OCR draft-only behavior verified — no expense is ever saved without explicit confirmation, even under network retry/race conditions
- [ ] Two-party settlement confirmation verified — a single user cannot unilaterally mark a payment as settled
- [ ] Affiliate booking redirects tracked and attributable in analytics
- [ ] §15 monetization instrumentation (affiliate + boutique-property commission tracking) live
- [ ] API versioning decision documented and implemented if needed

### Risks Addressed This Phase (§14)

**Mitigation implemented:**

- **OTA API access denied / rate-parity clauses** — sidestepped by launching on affiliate deep-links + direct boutique partnerships instead of full OTA integration.
- **Equal split not reflecting actual consumption** — explicitly scoped out as a documented v1 decision, not an oversight; itemized splits deferred to Phase 5.
- **Multi-member permission boundaries** — addressed via explicit owner/member role enforcement, covered by integration tests, enforced at middleware level.
- **Join-by-code friction** — accepted trade-off, monitored via the watch metric above rather than pre-emptively engineered around.

**Risk resolved:**

- **Settlement payment gaming** — two-party confirmation model prevents unilateral payment marking.

### Files after Phase 4 (new since Phase 3)

```folder
apps/mobile/
├── app/join.tsx
└── src/features/{group/, expenses/}

services/backend/app/
├── api/{properties.py, expenses.py, members.py}
├── services/{expense_service.py, group_service.py, ocr_service.py}
├── models/{property.py, expense.py, invite_code.py,
│           settlement_payment.py, review.py, trip_member.py}
└── workers/notifications.py
```

This completes the full repo structure specified in §11.

---

## Phase 5 — Data Business & Scale *(Spec Phase 3, §6)*

**Post–Phase 4 · Goal:** the full §6 Phase 3 feature set. Not timeboxed in the spec — gated on data volume and partnership terms rather than a fixed date, so this phase uses readiness gates instead of a weekly sprint table.

§11 doesn't extend the file structure this far; paths below are reasonable extrapolations from §6/§8/§15, not spec-specified. The original 8-person lean roster (§16) was scoped for MVP + Booking & Growth — this phase's scope (a new admin app, an ML pipeline, BD-driven partnerships) likely needs the team to grow before it starts in earnest.

### Readiness Gates

- [ ] Phase 4 feature set stable in production for at least one full pilot-season cycle
- [ ] At least one tourism-board conversation past initial interest — §4 calls this a "plausible partner," not a confirmed one
- [ ] First-party visit-data volume assessed by the data/ML team as sufficient for model training
- [ ] Team scoped beyond the original lean roster (§16) to cover the new workstreams below

### Tasks

**Municipal/tourism-board dashboard** *(new hires — backend + frontend + BD)*

- [ ] Validate scope with 1–2 pilot tourism-board partners before building
- [ ] New app: `apps/admin-dashboard/` — web-based; the "no web client" decision in §1/§8.5 is about the consumer product, and doesn't apply here since the audience is desk analysts, not tourists (§6)
- [ ] Anonymization/de-identification pipeline for aggregate visitor-flow data before it leaves the primary datastore (§13) — its own design/legal review, given it's a new data-sharing surface
- [ ] Visitor-flow analytics: aggregate `Visit`/`CrowdSignal` data into heatmaps, time-of-day flow, seasonal trends
- [ ] Separate auth model for tourism-board users — extends the existing custom JWT auth system with role-based access control (RBAC). No additional auth vendor needed since we own the auth system end-to-end

**ML-based crowd prediction** *(data/ML eng)*

- [ ] Model development replacing the category-level heuristic with a model trained on accumulated first-party `Visit` data — backend/platform-agnostic, so it ships independently of mobile release cycles (§8.4)
- [ ] New module/service: `services/ml-pipeline/` — training pipeline + model serving, integrated in place of the heuristic in `crowd_index_recompute.py`. Use open-source ML tooling (scikit-learn, PyTorch, or similar) — no managed ML service dependency
- [ ] Shadow-mode evaluation: run predictions alongside the heuristic before cutover, compared against the §17 crowd-avoidance-efficacy metric

**Multi-country expansion** *(data/ML eng + backend eng)*

- [ ] Repeatable landmark-curation process documented (UNESCO list + a lightweight review step) — turns the Phase 1A manual, one-off curation into a process a new country can run through (§14)
- [ ] OSM-ingestion pipeline generalized beyond the pilot region's specific cleanup rules
- [ ] Tile generation pipeline (Planetiler + PMTiles) generalized — country-config-driven, so adding a new country's offline pack is a pipeline run, not a code change
- [ ] Country-config scaffolding in `services/backend` (currency, language, region bounds) so trip currency/region aren't pilot-hardcoded assumptions anymore
- [ ] Second pilot country selected and onboarded end-to-end as validation

**OTA integration** *(BD + backend eng)*

- [ ] Partnership/supply terms negotiated — contingent, may not happen (§6, §14)
- [ ] If terms work: full OTA API integration replacing/supplementing the Phase 4 affiliate-link approach

**Monetization & infra** *(backend eng + mobile eng)*

- [ ] Premium subscription tier — offline map packs, advanced route planning, ad-free (§15); billing via App Store/Play Store in-app purchase
- [ ] Full WebSocket-based live sync for group trips, if Phase 4 engagement data justifies the infra cost over the FCM-based approach (§8.5)

### Data Migration

Significant:

- `CrowdSignal` data transitions from heuristic-sourced to ML-model-sourced. The `source` field (`heuristic | first_party | partner_feed`) handles this, but the cutover strategy (shadow mode → full replacement) must be documented. Historical heuristic-sourced records should be preserved for comparison
- Country-config scaffolding changes how `Trip.country` and `Trip.currency` relate to system configuration — verify backward compatibility with pilot-country data
- Admin dashboard introduces new access patterns against existing tables — ensure no performance regression on the primary database

### Definition of Done

- [ ] At least one tourism-board dashboard live with a real partner using it
- [ ] ML-based crowd prediction outperforming the Phase 1A heuristic on the crowd-avoidance-efficacy metric in shadow mode, then fully cut over
- [ ] Second pilot country's landmark tier and POI data live, sourced through the repeatable process rather than one-off manual work
- [ ] OTA integration decision made one way or the other (built, or explicitly shelved with reasoning documented)

### Risks Addressed This Phase (§14)

**Risk resolved:**

- **Landmark-tier curation not scaling past a handful of countries** — retired directly by the repeatable curation process above.
- OTA access risk isn't so much "retired" here as resolved one way or the other, since it's contingent on external partnership terms outside engineering's control.

### Files after Phase 5

```folder
apps/
└── admin-dashboard/        # new — municipal/tourism-board dashboard (web-based)
services/
├── ml-pipeline/             # new — crowd-prediction model training/serving
└── backend/                 # + country-config scaffolding for multi-country expansion
```
