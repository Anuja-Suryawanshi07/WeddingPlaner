# WeddingPlaner — Module Design

**Document:** `MODULE_DESIGN.md`  
**Project:** WeddingPlaner  
**Version:** V1  
**Architecture:** Modular Monolith  
**Framework:** Next.js 16.3.4 App Router  
**Language:** TypeScript 5  
**Database:** MongoDB Atlas + Mongoose 9  
**Validation:** Zod 4  
**Testing:** Vitest  
**Status:** Frozen for V1 implementation

---

# 1. Purpose

This document defines how the WeddingPlaner codebase is organized at module level.

The PRD defines **what the product does**. The System Design defines **how the system behaves at architecture level**. The Database Design defines **how data is stored and related**. The API Design defines **how clients interact with the backend**.

This Module Design defines:

- where code lives
- how domain modules are separated
- how Route Handlers interact with Services
- how Services interact with Repositories
- how Repositories interact with Mongoose Models
- where shared infrastructure lives
- how permissions are enforced
- how external providers are abstracted
- how server/client boundaries are handled
- how tests are organized
- how cross-module dependencies are controlled

The goal is to ensure that Codex and future developers implement every feature consistently instead of inventing a new structure per feature.

---

# 2. Core Architecture Style

WeddingPlaner uses a:

```text
Domain-Oriented Modular Monolith
```

The application remains one deployable Next.js application, but business capabilities are separated into well-defined modules.

```text
Next.js App Layer
        ↓
Domain / Application Services
        ↓
Repositories
        ↓
Mongoose Models
        ↓
MongoDB
```

External providers follow:

```text
Domain Service
      ↓
Shared Provider Abstraction
      ↓
Cloudflare R2 / Resend / Google Places
```

Authorization follows:

```text
Route Handler
     ↓
Session / Membership Context
     ↓
Permission Helper
     ↓
Service
```

---

# 3. Top-Level Source Structure

```text
src/
├── app/
├── components/
├── config/
├── lib/
├── modules/
└── types/
```

Responsibilities:

```text
app/        → Next.js pages, layouts, route groups, Route Handlers
components/ → shared reusable UI components
config/     → validated application/environment configuration
lib/        → shared technical infrastructure
modules/    → domain/business modules
types/      → truly global shared TypeScript types only
```

---

# 4. `src/app` Responsibility

`src/app` contains Next.js-specific application entry points.

```text
src/app/
├── (auth)/
├── (dashboard)/
├── api/
├── invite/
├── gallery/
├── w/
├── layout.tsx
└── page.tsx
```

Examples:

```text
src/app/api/auth/login/route.ts
src/app/api/events/route.ts
src/app/api/events/[eventId]/route.ts
src/app/api/expenses/[expenseId]/void/route.ts
```

## Rule

`src/app` must remain thin.

Route Handlers are responsible for:

- reading the HTTP request
- authentication
- Wedding Membership resolution
- permission checks
- input validation
- calling the appropriate Service
- returning standardized API responses

Route Handlers must NOT contain:

- direct Mongoose queries
- complex business logic
- payment calculations
- RSVP rules
- R2 object management
- Resend provider logic
- Google Places provider logic
- large data transformations

---

# 5. Standard Route Handler Flow

```text
HTTP Request
    ↓
authenticate()
    ↓
resolveMembership()
    ↓
requirePermission()
    ↓
validate()
    ↓
DomainService.method()
    ↓
standard API response
```

---

# 6. Domain Modules

WeddingPlaner V1 uses:

```text
src/modules/
├── auth/
├── weddings/
├── members/
├── events/
├── tasks/
├── vendors/
├── finance/
├── guests/
├── gallery/
├── documents/
├── activity/
└── email/
```

There is no separate `website` module in V1. Wedding Website and Livestream configuration are owned by the Wedding domain because their configuration is embedded inside the Wedding document.

---

# 7. Standard Module Anatomy

Example:

```text
src/modules/events/
├── event.model.ts
├── event.repository.ts
├── event.service.ts
├── event.schemas.ts
├── event.types.ts
├── event.permissions.ts
└── event.errors.ts
```

Not every module must contain every file. Do not create empty files just to satisfy the pattern.

---

# 8. Model Layer

Model files contain:

- Mongoose Schema
- Mongoose Model
- explicit collection name where important
- persistence defaults
- indexes
- field-level persistence constraints
- protected/select-false fields where required

They must not contain HTTP logic, React code, permission decisions, provider calls, or route behavior.

---

# 9. Repository Layer

Repositories own database access.

Typical methods:

```text
findByIdForWedding()
listForWedding()
create()
update()
archive()
```

Wedding-owned repositories must scope queries by Wedding.

Correct:

```ts
findOne({ _id: eventId, weddingId });
```

Incorrect for Wedding-owned entities:

```ts
findById(eventId);
```

Repositories must never silently bypass tenant isolation.

---

# 10. Service Layer

Services contain business/application rules.

Examples:

```text
createEvent()
updateEvent()
archiveEvent()
```

Services decide:

- whether an operation is valid
- whether related entities belong to the same Wedding
- whether a state transition is allowed
- whether Activity Event should be written
- whether Audit Log should be written
- whether Email Job should be created
- whether storage/provider operations are required

Services call Repositories. Route Handlers call Services.

---

# 11. Zod Schema Layer

`*.schemas.ts` files contain validation for:

- create input
- update input
- query filters
- action input
- module-specific params

External input must be validated before reaching business logic.

---

# 12. Type Layer

`*.types.ts` contains module-specific TypeScript types for:

- service input/output
- domain DTOs
- normalized provider mappings
- reusable module types

Avoid unnecessary duplication of Mongoose document types.

---

# 13. Shared Infrastructure

```text
src/lib/
├── api/
├── auth/
├── db/
├── email/
├── errors/
├── integrations/
├── permissions/
├── security/
├── storage/
└── utils/
```

Shared infrastructure must remain domain-agnostic.

---

# 14. Database Infrastructure

```text
src/lib/db/
├── mongoose.ts
└── transaction.ts
```

Responsibilities:

- connect to MongoDB Atlas
- reuse connections during development
- avoid hot-reload connection duplication
- provide transaction/session helpers
- normalize connection failures

Business queries and Mongoose Models do not belong here.

---

# 15. API Infrastructure

```text
src/lib/api/
├── response.ts
├── validation.ts
├── request-context.ts
└── pagination.ts
```

Responsibilities include standardized success/error responses, request parsing, request IDs, and page/cursor helpers.

---

# 16. Error Infrastructure

```text
src/lib/errors/
├── app-error.ts
├── error-codes.ts
└── map-error.ts
```

Services throw domain/application errors. HTTP mapping happens at the API boundary. Services do not manually construct `Response` objects.

---

# 17. Authentication Infrastructure

```text
src/lib/auth/
├── session.ts
├── cookies.ts
├── password.ts
├── tokens.ts
└── current-user.ts
```

Responsibilities:

- Argon2 password hashing/verification
- secure token generation/hashing
- session cookie helpers
- session lifecycle primitives
- current User resolution

Persistent User/Session/Reset models remain in the Auth module.

---

# 18. Permission Infrastructure

```text
src/lib/permissions/
├── permissions.ts
├── role-permissions.ts
├── authorize.ts
└── membership-context.ts
```

Use centralized permission checks such as:

```ts
requirePermission(membership, "expense:create");
```

Do not repeat role comparisons throughout Route Handlers.

---

# 19. Security Infrastructure

```text
src/lib/security/
├── origin.ts
├── rate-limit.ts
├── hashing.ts
└── request-id.ts
```

Exact thresholds and production policy are finalized in `SECURITY_DESIGN.md`.

---

# 20. Storage Abstraction

```text
src/lib/storage/
├── storage-client.ts
├── signed-upload.ts
├── signed-download.ts
└── object-keys.ts
```

Domain modules do not call AWS SDK commands directly.

Expected capabilities include:

```text
createSignedUpload()
createSignedDownload()
headObject()
verifyObject()
copyObject()
deleteObject()
buildObjectKey()
```

---

# 21. Email Provider Abstraction

```text
src/lib/email/
├── email-provider.ts
├── resend-provider.ts
└── templates/
```

Application modules must not call Resend directly. Email Job orchestration belongs in the Email module.

---

# 22. External Integrations

```text
src/lib/integrations/google-places/
├── client.ts
├── schemas.ts
└── mapper.ts
```

Google Places response structures must be validated and normalized before they enter Vendor domain logic.

---

# 23. Auth Module

```text
src/modules/auth/
├── user.model.ts
├── session.model.ts
├── password-reset-token.model.ts
├── auth.repository.ts
├── auth.service.ts
├── auth.schemas.ts
└── auth.types.ts
```

Owns User, Session, Password Reset, Signup, Login, Logout, Current User, and password reset lifecycle.

---

# 24. Weddings Module

```text
src/modules/weddings/
├── wedding.model.ts
├── wedding.repository.ts
├── wedding.service.ts
├── wedding.schemas.ts
├── wedding.types.ts
├── website.service.ts
├── website.schemas.ts
└── livestream.service.ts
```

Owns Wedding setup/update/archive plus embedded Website, Gallery configuration shape, and Livestream configuration. Gallery behavior itself remains in the Gallery module.

---

# 25. Members Module

```text
src/modules/members/
├── wedding-membership.model.ts
├── member-invitation.model.ts
├── member.repository.ts
├── member-invitation.repository.ts
├── member.service.ts
├── member-invitation.service.ts
├── member.schemas.ts
└── member.types.ts
```

Owns Wedding Membership, Member Invitation, role changes, removal, acceptance, and lifecycle.

---

# 26. Events Module

```text
src/modules/events/
├── event.model.ts
├── event.repository.ts
├── event.service.ts
├── event.schemas.ts
└── event.types.ts
```

Owns Event creation, update, listing, archival, and relationship validation.

---

# 27. Tasks Module

```text
src/modules/tasks/
├── task.model.ts
├── task.repository.ts
├── task.service.ts
├── task.schemas.ts
└── task.types.ts
```

Owns Task CRUD, assignment validation, Event validation, completion, FAMILY_MEMBER own-status rules, and Task Activity Events.

---

# 28. Vendors Module

```text
src/modules/vendors/
├── vendor.model.ts
├── vendor.repository.ts
├── vendor.service.ts
├── vendor.schemas.ts
├── vendor.types.ts
└── vendor-discovery.service.ts
```

Google Places provider implementation remains under shared integrations.

---

# 29. Finance Module

Finance remains one bounded domain:

```text
src/modules/finance/
├── budget-category.model.ts
├── expense.model.ts
├── payment.model.ts
├── budget.repository.ts
├── expense.repository.ts
├── payment.repository.ts
├── budget.service.ts
├── expense.service.ts
├── payment.service.ts
├── finance-summary.service.ts
├── finance.schemas.ts
├── finance.types.ts
└── finance.errors.ts
```

Owns Budget Category, Expense, Payment, Finance Summary, payment status derivation, outstanding balance derivation, void semantics, idempotency checks, and overpayment protection.

Key invariant examples:

```text
Payment cannot exceed Expense outstanding balance.
Expense cannot be voided while active Payment exists.
Paid amount derives from Payments.
```

---

# 30. Guests Module

```text
src/modules/guests/
├── guest-household.model.ts
├── guest-invitation.model.ts
├── invitation-history.model.ts
├── household.repository.ts
├── invitation.repository.ts
├── invitation-history.repository.ts
├── household.service.ts
├── invitation.service.ts
├── rsvp.service.ts
├── guest.schemas.ts
├── guest.types.ts
└── guest.errors.ts
```

Frozen invariant:

```text
One Household = One Invitation = One Household RSVP
```

This module owns Household management, Invitation event set, share link lifecycle, send/resend/reminder/revoke, public RSVP, invitation history, and RSVP summaries.

---

# 31. Gallery Module

```text
src/modules/gallery/
├── gallery-access.model.ts
├── photo-album.model.ts
├── photo.model.ts
├── gallery-access.repository.ts
├── album.repository.ts
├── photo.repository.ts
├── gallery.service.ts
├── album.service.ts
├── photo-upload.service.ts
├── photo-moderation.service.ts
├── gallery.schemas.ts
├── gallery.types.ts
└── gallery.errors.ts
```

Owns Gallery capability access, share-link rotation, Albums, Photo metadata, staging/confirmation, Guest moderation, public filtering, and Photo deletion lifecycle.

Uses shared `src/lib/storage/` for R2 operations.

---

# 32. Documents Module

```text
src/modules/documents/
├── document.model.ts
├── document.repository.ts
├── document.service.ts
├── document.schemas.ts
└── document.types.ts
```

Owns private document metadata, upload reservation, confirmation, download authorization, and storage-aware deletion/tombstones.

---

# 33. Activity Module

```text
src/modules/activity/
├── activity-event.model.ts
├── audit-log.model.ts
├── activity.repository.ts
├── audit.repository.ts
├── activity.service.ts
└── audit.service.ts
```

Other modules call:

```text
ActivityService.record(...)
AuditService.record(...)
```

Other modules do not write these collections directly.

---

# 34. Email Module

```text
src/modules/email/
├── email-job.model.ts
├── email-job.repository.ts
├── email-job.service.ts
├── email-worker.service.ts
└── email.types.ts
```

Owns EmailJob persistence, enqueue, idempotency, retries, locking, stale-job recovery, and worker orchestration.

Uses shared `src/lib/email/` for provider delivery.

---

# 35. Shared UI Components

```text
src/components/
├── ui/
├── forms/
├── layout/
└── feedback/
```

Shared components remain domain-neutral.

Examples:

```text
ui/button.tsx
ui/input.tsx
ui/modal.tsx
layout/app-sidebar.tsx
feedback/empty-state.tsx
```

---

# 36. Feature-Specific UI

Domain-specific UI lives near its module.

Examples:

```text
src/modules/finance/components/
src/modules/guests/components/
src/modules/gallery/components/
```

This avoids an oversized global components directory.

---

# 37. Server / Client Boundary

Default to Server Components.

Use Client Components only for genuine interactivity such as:

- interactive forms
- modal/dialog controls
- file selection
- drag/drop
- interactive tables
- local client state

Do not add `"use client"` to whole pages by default. Security-sensitive and persistence logic remains server-side.

---

# 38. Repository Rule

Route Handlers never call Mongoose directly.

```text
Route Handler
      ↓
Service
      ↓
Repository
      ↓
Mongoose Model
      ↓
MongoDB
```

This is frozen for V1.

---

# 39. Provider Rule

Domain modules do not directly instantiate provider SDK clients.

```text
Gallery Service → Storage abstraction → R2 SDK
Email Worker → Email Provider abstraction → Resend
Vendor Discovery → Google Places abstraction → Google Places
```

---

# 40. Cross-Module Dependency Rule

Modules must not freely import other modules' Models or Repositories.

Avoid:

```text
TaskService → WeddingMembershipModel
GuestService → EventModel
```

Prefer narrow service/query contracts.

Within one bounded module, internal repositories may coordinate. For example, PaymentService may use ExpenseRepository and PaymentRepository because both belong to Finance.

---

# 41. Dependency Direction

Preferred direction:

```text
app/
 ↓
modules/
 ↓
lib/
```

Shared infrastructure must remain broadly domain-agnostic.

Avoid circular dependencies.

If circular pressure appears:

1. identify the shared concept
2. define a narrow abstraction
3. move only the abstraction to an appropriate shared location
4. do not import implementations both ways

---

# 42. No Premature Generic Base Layers

Do not create:

```text
BaseRepository<T>
BaseService<T>
GenericCrudController
UniversalEntityService
```

WeddingPlaner has strong domain-specific rules. Explicit module code is preferred.

---

# 43. No Barrel Files Initially

Avoid unnecessary `index.ts` barrel exports during early development.

Prefer explicit imports:

```ts
import { createEvent } from "@/modules/events/event.service";
```

Barrels may be added later if they improve clarity without introducing circular dependencies.

---

# 44. Naming Conventions

Files:

```text
kebab-case
```

Functions:

```text
camelCase
```

Types/classes:

```text
PascalCase
```

Environment variables:

```text
UPPER_SNAKE_CASE
```

Permission names:

```text
domain:action
```

Examples:

```text
expense:create
payment:void
gallery:moderate
```

---

# 45. MongoDB Collection Naming

Collection names should be explicit where architecturally important:

```text
users
sessions
password_reset_tokens
weddings
wedding_memberships
member_invitations
events
tasks
vendors
budget_categories
expenses
payments
guest_households
guest_invitations
invitation_history
gallery_access
photo_albums
photos
documents
email_jobs
activity_events
audit_logs
```

Do not blindly depend on Mongoose pluralization.

---

# 46. Environment Configuration

Validated environment configuration lives in:

```text
src/config/env.ts
```

Do not scatter raw `process.env` access throughout the codebase.

`.env.example` should eventually document:

```text
MONGODB_URI=
SESSION_SECRET=
RESEND_API_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
GOOGLE_PLACES_API_KEY=
CRON_SECRET=
```

Real values never enter Git.

---

# 47. Test Strategy

Unit tests colocate with code:

```text
src/modules/events/
├── event.service.ts
└── event.service.test.ts
```

Higher-level tests live in:

```text
tests/
├── integration/
└── fixtures/
```

Vitest is the test runner.

Unit tests focus on business rules, validation, permissions, finance calculations, RSVP rules, token lifecycle, photo moderation, and helper utilities.

Integration tests cover Route Handler → Service behavior, auth/session handling, tenant isolation, API envelopes, finance flows, invitation/RSVP flows, gallery upload/confirmation/moderation, and persistence behavior where required.

---

# 48. Activity and Audit Rules

Product-facing actions go through `ActivityService`.

Examples:

```text
Task completed
Payment recorded
Invitation sent
Guest RSVP updated
Photo approved
```

Security/integrity-sensitive actions go through `AuditService`.

Examples:

```text
Member role changed
Member removed
Wedding archived
Payment voided
Expense voided
Gallery token rotated
```

No other module writes those collections directly.

---

# 49. Domain Ownership Boundaries

Finance owns all derived budget/expense/payment calculations.

Guests owns all Household/Invitation/RSVP/history state.

Gallery owns `gallery_access`, Albums, and Photos; Weddings owns embedded Gallery configuration shape.

Email-capable domains enqueue EmailJobs rather than calling Resend directly.

Gallery/Documents use shared Storage abstraction rather than AWS SDK imports.

---

# 50. Route Group Guidance

Conceptual frontend routing:

```text
src/app/
├── (auth)/
│   ├── login/
│   ├── signup/
│   └── forgot-password/
├── (dashboard)/
│   ├── dashboard/
│   ├── events/
│   ├── tasks/
│   ├── vendors/
│   ├── finance/
│   ├── guests/
│   ├── gallery/
│   └── documents/
├── invite/[token]/
├── gallery/[token]/
└── w/[slug]/
```

Exact screen routes are finalized in Frontend Architecture.

---

# 51. API Route Placement

API Route Handlers mirror `API_DESIGN.md`.

Examples:

```text
src/app/api/auth/login/route.ts
src/app/api/events/route.ts
src/app/api/events/[eventId]/route.ts
src/app/api/expenses/[expenseId]/void/route.ts
src/app/api/public/invitations/[token]/rsvp/route.ts
src/app/api/public/galleries/[token]/upload-url/route.ts
```

HTTP routing lives in `app`; business ownership remains in `modules`.

---

# 52. Example Event Flow

```text
POST /api/events
       ↓
Route Handler
       ↓
authenticate()
       ↓
resolve Membership
       ↓
requirePermission("event:create")
       ↓
CreateEventSchema.parse()
       ↓
EventService.createEvent()
       ↓
EventRepository.create()
       ↓
Event Model
       ↓
MongoDB
       ↓
ActivityService.record()
       ↓
API response
```

---

# 53. Example Payment Flow

```text
POST /api/expenses/:expenseId/payments
       ↓
Route Handler
       ↓
authenticate()
       ↓
resolve Membership
       ↓
requirePermission("payment:create")
       ↓
validate Idempotency-Key
       ↓
PaymentService.recordPayment()
       ↓
ExpenseRepository + PaymentRepository
       ↓
business validation
       ↓
transaction where required
       ↓
ActivityService.record()
       ↓
API response
```

---

# 54. Example Public RSVP Flow

```text
POST /api/public/invitations/:token/rsvp
       ↓
validate capability token
       ↓
rate limit
       ↓
RSVP schema validation
       ↓
RsvpService.submit()
       ↓
InvitationRepository
       ↓
InvitationHistoryRepository
       ↓
ActivityService.record()
       ↓
API response
```

---

# 55. Example Guest Photo Flow

```text
POST public upload-url
       ↓
Gallery capability validation
       ↓
PhotoUploadService.createReservation()
       ↓
PhotoRepository.create(PENDING)
       ↓
Storage.createSignedUpload()
       ↓
Browser uploads directly to R2
       ↓
POST public confirm
       ↓
PhotoUploadService.confirm()
       ↓
Storage.verifyObject()
       ↓
PhotoRepository READY + PENDING moderation
       ↓
Organizer approve
       ↓
PhotoModerationService.approve()
       ↓
ActivityService.record()
```

---

# 56. Implementation Order After Module Design

Recommended sequence:

```text
1. Environment configuration
2. MongoDB connection
3. Shared error system
4. Shared API response utilities
5. Zod validation helpers
6. Session/auth primitives
7. Permission/RBAC infrastructure
8. Activity/Audit infrastructure
9. Auth domain
10. Wedding Setup
11. Members
12. Events
13. Tasks
14. Vendors
15. Finance
16. Guests / Invitations / RSVP
17. Wedding Website / Livestream
18. Gallery / Albums / Photos
19. Documents
20. Dashboard aggregation
```

Feature implementation must not jump ahead of required foundations.

---

# 57. Stage-B Scaffold Rule

After this document is committed, Codex may create the architectural folder scaffold:

```text
src/config/
src/lib/
src/modules/
tests/
```

and module directories.

It must NOT implement all business features at once.

The next code phase is foundational infrastructure followed by the first vertical slice.

---

# 58. First Real Feature Slice

The first real domain feature is:

```text
Authentication
+
Wedding Setup
```

Because:

```text
User
  ↓
Session
  ↓
WeddingMembership
  ↓
Wedding
```

establishes identity and tenant context required by nearly every later feature.

Do not begin with Dashboard.

---

# 59. Architecture Rules for Codex

1. Do not put business logic inside Route Handlers.
2. Do not call Mongoose directly from Route Handlers.
3. Do not call provider SDKs directly from domain modules.
4. Use Services for business logic.
5. Use Repositories for persistence.
6. Scope Wedding-owned queries by Wedding ID.
7. Use Zod at external boundaries.
8. Use centralized permission helpers.
9. Keep Finance as one bounded domain.
10. Keep Guests/Invitation/RSVP as one bounded domain.
11. Keep Gallery/Album/Photo as one bounded domain.
12. Keep Website/Livestream under Weddings in V1.
13. Keep shared providers under `src/lib`.
14. Co-locate feature UI with the owning module.
15. Keep generic UI under `src/components`.
16. Prefer Server Components by default.
17. Avoid circular dependencies.
18. Avoid premature generic abstractions.
19. Avoid unnecessary barrel files.
20. Add tests alongside business logic.

---

# 60. Final Target Structure

```text
src/
├── app/
│   ├── api/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── invite/
│   ├── gallery/
│   └── w/
├── components/
│   ├── ui/
│   ├── forms/
│   ├── layout/
│   └── feedback/
├── config/
│   └── env.ts
├── lib/
│   ├── api/
│   ├── auth/
│   ├── db/
│   ├── email/
│   ├── errors/
│   ├── integrations/
│   ├── permissions/
│   ├── security/
│   ├── storage/
│   └── utils/
├── modules/
│   ├── auth/
│   ├── weddings/
│   ├── members/
│   ├── events/
│   ├── tasks/
│   ├── vendors/
│   ├── finance/
│   ├── guests/
│   ├── gallery/
│   ├── documents/
│   ├── activity/
│   └── email/
└── types/

tests/
├── integration/
└── fixtures/
```

---

# 61. Frozen Module Decisions

1. WeddingPlaner uses a domain-oriented Modular Monolith.
2. `src/app` remains thin.
3. `src/modules` owns domain/business logic.
4. Standard backend flow is Route → Service → Repository → Model.
5. Route Handlers never call Mongoose directly.
6. Finance is one bounded module.
7. Guests/Household/Invitation/RSVP is one bounded module.
8. Gallery/Album/Photo is one bounded module.
9. Wedding Website and Livestream stay under Weddings in V1.
10. Models are colocated with owning domains.
11. Shared infrastructure lives under `src/lib`.
12. R2 is accessed only through Storage abstraction.
13. Resend is accessed only through Email abstraction.
14. Google Places is accessed only through Integration abstraction.
15. Role/Permission mapping is centralized.
16. Wedding-owned repository queries are Wedding-scoped.
17. Feature-specific UI colocates with modules.
18. Generic UI stays under `src/components`.
19. Server Components are the default.
20. Unit tests colocate with source; integration tests live under `tests/`.
21. No premature BaseRepository/BaseService abstraction.
22. No unnecessary barrel files initially.
23. No circular module dependencies.
24. Activity/Audit writes go through their Services.
25. Foundation implementation precedes domain feature implementation.

---

# 62. Next Architecture Step

With:

```text
PRD_V2.md
      ↓
SYSTEM_DESIGN.md
      ↓
DATABASE_DESIGN.md
      ↓
API_DESIGN.md
      ↓
MODULE_DESIGN.md
```

frozen, the project can move into:

```text
Stage-B Architectural Scaffold
```

followed by:

```text
Foundation Implementation
```

Later design documents:

```text
FRONTEND_ARCHITECTURE.md
SECURITY_DESIGN.md
DEPLOYMENT_DESIGN.md
ENGINEERING_SPECIFICATION.md
```

---

# 63. Status

```text
MODULE_DESIGN.md
Status: FROZEN FOR V1
```

Any implementation that changes module ownership, dependency direction, Route → Service → Repository boundaries, cross-module access rules, or provider abstraction rules must update this document before the codebase diverges from the architecture.
