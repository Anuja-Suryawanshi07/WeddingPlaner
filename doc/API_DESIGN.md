# WeddingPlaner — API Design

**Document:** `API_DESIGN.md`  
**Project:** WeddingPlaner  
**Version:** V1  
**Architecture:** Modular Monolith  
**Backend:** Next.js 16 Route Handlers + Node.js runtime  
**API Style:** REST  
**Authentication:** Custom server-side sessions  
**Validation:** Zod 4  
**Database:** MongoDB Atlas + Mongoose 9  
**Storage:** Cloudflare R2 through AWS S3-compatible SDK  
**Email:** Resend + MongoDB Email Jobs + Vercel Cron  
**Status:** Frozen for V1 implementation

---

# 1. Purpose

This document defines the HTTP API contract for WeddingPlaner V1. It translates the frozen PRD, System Design, and Database Design into concrete route boundaries, authentication rules, authorization rules, request/response conventions, pagination, filtering, idempotency, concurrency, guest capability routes, finance mutation semantics, gallery upload flows, and internal worker APIs.

---

# 2. Core API Principles

- REST through Next.js Route Handlers.
- Thin route handlers; business logic belongs in services.
- Private APIs derive Wedding context from the authenticated Membership.
- Client input never controls tenant identity.
- Cross-Wedding resource access returns `404 NOT_FOUND`.
- Zod validates path params, query params, request bodies, and relevant headers.
- Public/token routes expose only page-required data.
- External providers are called only through backend abstractions.
- Secret tokens and signed URLs are never logged.
- Photo/document binaries never flow through normal application APIs.

Typical request flow:

```text
HTTP Request
    ↓
Route Handler
    ↓
Authentication / Capability Resolution
    ↓
Authorization
    ↓
Zod Validation
    ↓
Service Layer
    ↓
Repository / Provider
    ↓
HTTP Response
```

---

# 3. API Base Path

All V1 APIs use `/api`.

Surfaces:

```text
/api/auth/*       Authentication
/api/*            Authenticated Wedding Member APIs
/api/public/*     Public / capability APIs
/api/internal/*   System-only APIs
```

No `/api/v1` prefix is required initially.

---

# 4. HTTP Method Conventions

```text
GET     Read
POST    Create or execute a genuine lifecycle action
PATCH   Partial update
DELETE  Delete/archive where DELETE remains semantically correct
```

Action endpoints are reserved for genuine lifecycle transitions such as:

```text
accept
send
remind
revoke
rsvp
void
approve
reject
confirm
rotate-token
archive
```

---

# 5. Response Conventions

Single resource:

```json
{
  "data": {
    "id": "..."
  }
}
```

Page-based collection:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 125,
    "totalPages": 7
  }
}
```

Cursor collection:

```json
{
  "data": [],
  "pagination": {
    "nextCursor": "opaque-cursor-or-null"
  }
}
```

Simple action:

```json
{
  "data": {
    "success": true
  }
}
```

---

# 6. Error Conventions

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "email": "Invalid email address"
    },
    "requestId": "optional-request-id"
  }
}
```

Core error codes:

```text
VALIDATION_ERROR
UNAUTHENTICATED
FORBIDDEN
NOT_FOUND
CONFLICT
INVALID_TOKEN
TOKEN_EXPIRED
RATE_LIMITED
UPLOAD_ERROR
EXTERNAL_SERVICE_ERROR
INTERNAL_ERROR
```

Business codes include:

```text
EMAIL_ALREADY_EXISTS
INVITATION_ALREADY_ACCEPTED
INVITATION_EMAIL_MISMATCH
LAST_OWNER
ALREADY_MEMBER
ALBUM_NOT_EMPTY
EXPENSE_HAS_ACTIVE_PAYMENTS
PAYMENT_EXCEEDS_OUTSTANDING
IDEMPOTENCY_KEY_REUSED
PHOTO_NOT_PENDING
PHOTO_ALREADY_MODERATED
GALLERY_DISABLED
GUEST_UPLOADS_DISABLED
```

Use ordinary HTTP semantics:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
429 Too Many Requests
500 Internal Server Error
502/503 External dependency unavailable
```

---

# 7. Authentication

Conceptual session cookie:

```text
wp_session
```

Properties:

```text
HttpOnly
Secure in production
SameSite=Lax
Path=/
```

Session secrets are stored only as hashes.

Private Wedding context is resolved as:

```text
Session → User → WeddingMembership → Wedding
```

The client does not control `weddingId`.

Authentication routes:

```text
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

Forgot-password never reveals account existence. Reset tokens are hash-only, expiring, and single-use.

---

# 8. Wedding APIs

```text
POST  /api/wedding
GET   /api/wedding
PATCH /api/wedding
POST  /api/wedding/archive
GET   /api/dashboard
```

Wedding creation atomically creates:

```text
Wedding
+
OWNER WeddingMembership
```

Wedding archival is OWNER-only.

Dashboard aggregates source collections rather than reading denormalized counters.

---

# 9. Frozen Roles

```text
OWNER
BRIDE
GROOM
ORGANIZER
FAMILY_MEMBER
```

Guests are not Membership roles.

## OWNER

Full control. OWNER alone manages membership security and Wedding archival. V1 has exactly one active OWNER.

## BRIDE / GROOM

Same authorization capability set. Broad operational control but no membership administration and no Wedding archival.

## ORGANIZER

Operational management of Events, Tasks, Vendors, Budgets, Expenses, Payment recording, Guests, Invitations, Website, Gallery, and Documents. Cannot manage Members, archive Wedding, or void financial records.

## FAMILY_MEMBER

Mostly read-only collaboration plus:

- complete own assigned Task status
- upload Gallery Photos
- view/download Documents

---

# 10. Capability-Based Authorization

Implementation should use permissions rather than repeated role checks.

```text
wedding:view
wedding:update
wedding:archive

member:view
member:invite
member:role-change
member:remove

event:view
event:create
event:update
event:archive

task:view
task:create
task:update
task:assign
task:complete-own
task:delete

vendor:view
vendor:create
vendor:update
vendor:archive
vendor:discover

finance:view
budget:manage
expense:create
expense:update
expense:void
payment:create
payment:void

guest:view
guest:manage
invitation:send
invitation:remind
invitation:revoke

website:view
website:manage

gallery:view
gallery:manage
gallery:upload
gallery:moderate

document:view
document:manage

activity:view
```

---

# 11. Role / Permission Matrix

| Area | OWNER | BRIDE | GROOM | ORGANIZER | FAMILY_MEMBER |
|---|---:|---:|---:|---:|---:|
| Dashboard | Full | Full | Full | Full | View |
| Wedding details | Full | Edit | Edit | Edit | View |
| Wedding archive | Yes | No | No | No | No |
| Member management | Full | No | No | No | No |
| Events | Full | Full | Full | Full | View |
| Tasks | Full | Full | Full | Full | Own-status only |
| Vendors | Full | Full | Full | Full | View |
| Vendor discovery | Yes | Yes | Yes | Yes | No |
| Budget | Full | Full | Full | Full | View |
| Expenses | Full | Full | Full | Create/Edit | View |
| Record Payments | Yes | Yes | Yes | Yes | No |
| Void Expense/Payment | Yes | Yes | Yes | No | No |
| Guest Households | Full | Full | Full | Full | View |
| Invitation send/reminder | Yes | Yes | Yes | Yes | No |
| Website / Livestream | Full | Full | Full | Full | View |
| Gallery Settings | Full | Full | Full | Full | View |
| Album management | Full | Full | Full | Full | View |
| Photo upload | Yes | Yes | Yes | Yes | Yes |
| Guest-photo moderation | Yes | Yes | Yes | Yes | No |
| Photo deletion | Yes | Yes | Yes | Yes | No |
| Documents | Full | Full | Full | Full | View/Download |
| Activity Timeline | View | View | View | View | View |
| Audit UI | Deferred | Deferred | Deferred | Deferred | No |

---

# 12. Member APIs

```text
GET    /api/members
POST   /api/members/invitations
GET    /api/members/invitations
DELETE /api/members/invitations/:invitationId

GET    /api/public/member-invitations/:token
POST   /api/member-invitations/:token/accept

PATCH  /api/members/:membershipId
DELETE /api/members/:membershipId
```

Membership-management mutations are OWNER-only.

Member invitation tokens are hash-only.

---

# 13. Event APIs

```text
GET    /api/events
POST   /api/events
GET    /api/events/:eventId
PATCH  /api/events/:eventId
DELETE /api/events/:eventId
```

`DELETE` archives.

Filters:

```text
includeArchived
from
to
```

Default order:

```text
startAt ASC
```

All lookups use Event ID + current Wedding ID.

---

# 14. Task APIs

```text
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:taskId
PATCH  /api/tasks/:taskId
DELETE /api/tasks/:taskId
```

Filters:

```text
page
limit
status
priority
eventId
assignedMembershipId
mine
```

FAMILY_MEMBER may only update the status of a Task assigned to their own Membership.

---

# 15. Vendor APIs

```text
GET    /api/vendors
POST   /api/vendors
POST   /api/vendors/from-place
GET    /api/vendors/:vendorId
PATCH  /api/vendors/:vendorId
DELETE /api/vendors/:vendorId

GET    /api/vendor-discovery/search
```

Vendor deletion archives when referenced.

`/from-place` accepts a trusted Google Place ID and the backend retrieves provider data itself.

---

# 16. Budget APIs

```text
GET    /api/budget-categories
POST   /api/budget-categories
GET    /api/budget-categories/:categoryId
PATCH  /api/budget-categories/:categoryId
DELETE /api/budget-categories/:categoryId
```

Budgets are category-level.

Historically referenced categories archive rather than disappearing.

---

# 17. Expense APIs

```text
GET   /api/expenses
POST  /api/expenses
GET   /api/expenses/:expenseId
PATCH /api/expenses/:expenseId
POST  /api/expenses/:expenseId/void
```

Filters:

```text
page
limit
categoryId
vendorId
eventId
status
from
to
```

Rules:

```text
categoryId required
vendorId optional
eventId optional
amountPaise integer
currency INR
```

Before a Payment exists, normal fields may be edited.

After a RECORDED Payment exists:

- amount may not be directly changed
- financial correction uses void/recreate
- non-financial metadata can still be updated under service rules

Sensitive updates use optimistic concurrency.

---

# 18. Finance Void Semantics

Expense void:

```text
POST /api/expenses/:expenseId/void
```

Allowed:

```text
OWNER
BRIDE
GROOM
```

An Expense cannot be voided while active Payments exist.

Conflict:

```text
EXPENSE_HAS_ACTIVE_PAYMENTS
```

Payment APIs:

```text
GET  /api/expenses/:expenseId/payments
POST /api/expenses/:expenseId/payments
GET  /api/payments/:paymentId
POST /api/payments/:paymentId/void
```

No generic Payment PATCH.

Payment correction:

```text
void old Payment
+
create new Payment
```

ORGANIZER may record Payment but cannot void.

---

# 19. Payment Idempotency

Payment creation requires:

```text
Idempotency-Key: <unique-client-generated-key>
```

Same key + same logical request:

```text
return original successful Payment
```

Same key + different request:

```text
409 IDEMPOTENCY_KEY_REUSED
```

Normal V1 overpayment is rejected:

```text
409 PAYMENT_EXCEEDS_OUTSTANDING
```

---

# 20. Finance Summary

```text
GET /api/finance/summary
```

Returns derived values:

```text
allocatedPaise
expenseTotalPaise
paidPaise
outstandingPaise
remainingBudgetPaise
byCategory
```

No duplicate authoritative counters.

---

# 21. Frozen Guest Domain

```text
One Household
=
One Invitation
=
One Household RSVP
```

No individual RSVP.

No selective Event invitation by family member.

---

# 22. Guest Household APIs

```text
GET    /api/guest-households
POST   /api/guest-households
GET    /api/guest-households/:householdId
PATCH  /api/guest-households/:householdId
DELETE /api/guest-households/:householdId
```

Create flow:

```text
Create GuestHousehold
+
Create GuestInvitation
+
Create InvitationHistory(CREATED)
```

Filters:

```text
page
limit
search
rsvpStatus
eventId
invitationStatus
includeArchived
```

DELETE archives Household and revokes active Invitation once history exists.

---

# 23. Guest Invitation APIs

```text
GET   /api/guest-invitations/:invitationId
PATCH /api/guest-invitations/:invitationId

GET   /api/guest-invitations/:invitationId/link

POST  /api/guest-invitations/:invitationId/send
POST  /api/guest-invitations/:invitationId/remind
POST  /api/guest-invitations/:invitationId/revoke

GET   /api/guest-invitations/:invitationId/history
GET   /api/guest-invitations/rsvp-summary

POST  /api/guest-invitations/actions/send
POST  /api/guest-invitations/actions/remind
```

`send` handles both first send and resend.

Invitation history types:

```text
CREATED
SENT
RESENT
DELIVERED
OPENED
INVITATION_UPDATED
RSVP_SUBMITTED
RSVP_UPDATED
REMINDER_SENT
REVOKED
DELIVERY_FAILED
```

Raw token is never returned by ordinary invitation CRUD.

---

# 24. Public Invitation APIs

```text
GET  /api/public/invitations/:token
POST /api/public/invitations/:token/rsvp
```

Public data is minimized.

RSVP:

```json
{
  "status": "YES",
  "attendeeCount": 3,
  "note": "We will attend."
}
```

Statuses:

```text
YES
NO
MAYBE
```

YES:

```text
1 <= attendeeCount <= household member count
```

NO normalizes attendee count to 0.

MAYBE attendee count is optional.

Same endpoint supports RSVP updates.

---

# 25. Stable Token Rules

Hash-only:

```text
Session Token
Password Reset Token
Wedding Member Invitation Token
```

Stable shareable protected secrets:

```text
Guest Invitation Token
Gallery Token
```

Guest/gallery secrets are high entropy, never sequential, excluded from ordinary projections, never logged, and returned only through explicit authorized share operations.

---

# 26. Gallery APIs

```text
GET   /api/gallery/settings
PATCH /api/gallery/settings

GET   /api/gallery/share-link
POST  /api/gallery/rotate-token
```

Settings:

```text
enabled
allowGuestUploads
allowDownloads
moderationRequired
```

Guest moderation is mandatory in V1 and cannot be disabled by the client.

`enabled=false` disables public Gallery access.

`rotate-token` revokes the old capability and creates a new one.

Frontend generates QR from Gallery URL.

---

# 27. Album APIs

```text
GET    /api/albums
POST   /api/albums
GET    /api/albums/:albumId
PATCH  /api/albums/:albumId
DELETE /api/albums/:albumId
```

Album fields include:

```text
eventId optional
isGuestVisible
coverPhotoId optional
```

Private Album:

```text
isGuestVisible = false
```

Album containing active Photos cannot be deleted:

```text
409 ALBUM_NOT_EMPTY
```

No destructive cascade.

---

# 28. Authenticated Photo APIs

```text
GET    /api/photos
POST   /api/photos/upload-url
POST   /api/photos/:photoId/confirm
GET    /api/photos/:photoId/download
POST   /api/photos/:photoId/approve
POST   /api/photos/:photoId/reject
DELETE /api/photos/:photoId
```

Photo list filters:

```text
albumId
moderationStatus
uploaderType
cursor
limit
```

Cursor ordering:

```text
createdAt DESC
_id DESC
```

Recommended:

```text
default limit 24
max limit 48
```

---

# 29. Photo Upload Lifecycle

Allowed V1 MIME types:

```text
image/jpeg
image/png
image/webp
```

Maximum:

```text
10 MiB/photo
```

No video, SVG, HEIC conversion, RAW, or image editing.

Reservation:

```text
POST /api/photos/upload-url
```

creates:

```text
PENDING Photo
uploadKey
staging objectKey
short-lived signed R2 PUT URL
```

Browser uploads binary directly to R2.

Confirmation:

```text
POST /api/photos/:photoId/confirm
```

Server verifies R2 object metadata and performs atomic:

```text
PENDING → READY
```

Member upload:

```text
moderationStatus = NOT_REQUIRED
```

Confirmation is idempotent.

---

# 30. Guest Photo Moderation

Guest final upload state:

```text
storageStatus = READY
moderationStatus = PENDING
uploaderType = GUEST
```

Approve:

```text
POST /api/photos/:photoId/approve
```

Reject:

```text
POST /api/photos/:photoId/reject
```

Allowed:

```text
OWNER
BRIDE
GROOM
ORGANIZER
```

FAMILY_MEMBER may upload but may not delete/moderate in V1.

Deletion is storage-aware and leaves a metadata tombstone.

---

# 31. Public Gallery APIs

```text
GET  /api/public/galleries/:token
GET  /api/public/galleries/:token/albums
GET  /api/public/galleries/:token/albums/:albumId/photos

POST /api/public/galleries/:token/upload-url
POST /api/public/galleries/:token/photos/:photoId/confirm

GET  /api/public/galleries/:token/photos/:photoId/download
```

Public Albums require:

```text
isGuestVisible = true
```

Public Photos require:

```text
storageStatus = READY
AND
moderationStatus IN [NOT_REQUIRED, APPROVED]
```

Private Album accessed through capability returns 404.

Public download additionally requires:

```text
allowDownloads = true
```

---

# 32. Documents

```text
GET    /api/documents
POST   /api/documents/upload-url
POST   /api/documents/:documentId/confirm
GET    /api/documents/:documentId/download
DELETE /api/documents/:documentId
```

Documents are private authenticated data.

Guest Invitation / Gallery tokens never authorize Documents.

Binary transfer uses R2 signed URLs.

---

# 33. Wedding Website and Livestream

```text
GET   /api/wedding/website
PATCH /api/wedding/website
GET   /api/public/weddings/:slug

GET   /api/wedding/livestream
PATCH /api/wedding/livestream
```

Public website returns only public-safe fields.

Disabled/unpublished public website behaves like 404.

Public slug is system-managed in V1.

---

# 34. Activity and Audit

Activity:

```text
GET /api/activity
```

Cursor paginated and read-only for normal clients.

Business services create Activity Events.

Audit Logs have no normal V1 CRUD API. Security-sensitive services append Audit records internally.

---

# 35. Email Jobs

Bulk Invitation/Reminder operations create MongoDB EmailJobs and return promptly.

Internal worker:

```text
POST /api/internal/jobs/email
```

Called by Vercel Cron with internal authentication.

Flow:

```text
validate internal secret
recover stale jobs
atomically claim jobs
send via Resend
mark SENT / retry / FAILED
```

Advanced email-batch management UI is deferred.

---

# 36. Pagination

Page-based:

```text
Tasks
Vendors
Expenses
Payments
Guest Households
Invitation History
Documents
```

Defaults:

```text
page = 1
limit = 20
max limit = 100
```

Cursor-based:

```text
Photos
Activity Timeline
```

Cursors are opaque and based on stable indexed ordering (`createdAt`, `_id`).

---

# 37. Filtering, Sorting, Search

Use query parameters for filtering rather than creating redundant endpoints.

Examples:

```text
/api/tasks?status=TODO
/api/expenses?categoryId=...
/api/guest-households?rsvpStatus=YES
/api/photos?moderationStatus=PENDING
```

Use domain-default sorting rather than generic `sortBy` everywhere.

Examples:

```text
Events        startAt ASC
Tasks         dueAt ASC
Vendors       name ASC
Expenses      expenseDate DESC
Households    householdName ASC
Photos        createdAt DESC
Activity      createdAt DESC
```

V1 uses bounded MongoDB-backed basic search; no Elasticsearch/OpenSearch.

---

# 38. Validation and Tenant Isolation

Every external:

```text
path parameter
query parameter
JSON body
relevant header
```

passes through Zod.

Malformed ObjectIds return:

```text
400 VALIDATION_ERROR
```

Every Wedding-owned resource query includes:

```text
resourceId + currentWeddingId
```

Cross-Wedding resources return:

```text
404 NOT_FOUND
```

---

# 39. CSRF, CORS, Rate Limiting

V1:

- same-origin cookie authentication
- SameSite cookies
- validate Origin/Host for authenticated mutations
- no wildcard CORS
- future native/mobile access requires explicit redesign

At minimum rate limit:

```text
auth signup/login/reset flows
public Invitation reads/RSVP
public Gallery reads
guest upload reservation
guest upload confirmation
```

Exact thresholds belong in `SECURITY_DESIGN.md`.

---

# 40. Idempotency and Concurrency

Idempotency:

```text
Payment creation → Idempotency-Key
Email scheduling → EmailJob-level idempotency
Photo confirmation → reservation/state idempotency
RSVP → identical repeated final state is safe
```

Optimistic concurrency where stale writes materially matter:

```text
Expense edits
sensitive finance transitions
Invitation edits where appropriate
Photo transitions
```

Stale write:

```text
409 CONFLICT
```

---

# 41. Logging and Cache Rules

Safe logs may include:

```text
requestId
method
route template
status
userId
weddingId
durationMs
errorCode
```

Never log:

```text
password
session token
reset token
member invitation token
guest invitation token
gallery token
R2 signed URLs
provider credentials
```

Token-bearing routes log route templates, not raw URLs.

Share/capability/signed-URL responses use:

```text
Cache-Control: no-store
```

---

# 42. Suggested Route Tree

```text
/api
├── auth
│   ├── signup
│   ├── login
│   ├── logout
│   ├── me
│   ├── forgot-password
│   └── reset-password
├── dashboard
├── wedding
│   ├── archive
│   ├── website
│   └── livestream
├── members
│   ├── [membershipId]
│   └── invitations
├── member-invitations/[token]/accept
├── events
├── tasks
├── vendors
├── vendor-discovery/search
├── budget-categories
├── expenses
│   └── [expenseId]
│       ├── void
│       └── payments
├── payments/[paymentId]/void
├── finance/summary
├── guest-households
├── guest-invitations
│   ├── rsvp-summary
│   ├── actions
│   │   ├── send
│   │   └── remind
│   └── [invitationId]
│       ├── link
│       ├── send
│       ├── remind
│       ├── revoke
│       └── history
├── gallery
│   ├── settings
│   ├── share-link
│   └── rotate-token
├── albums
├── photos
│   ├── upload-url
│   └── [photoId]
│       ├── confirm
│       ├── download
│       ├── approve
│       └── reject
├── documents
│   ├── upload-url
│   └── [documentId]
│       ├── confirm
│       └── download
├── activity
├── public
│   ├── member-invitations/[token]
│   ├── invitations/[token]/rsvp
│   ├── weddings/[slug]
│   └── galleries/[token]
│       ├── upload-url
│       ├── albums/[albumId]/photos
│       └── photos/[photoId]
│           ├── confirm
│           └── download
└── internal/jobs/email
```

---

# 43. V1 Exclusions

No APIs for:

```text
Accommodation
Hotels
Travel
Transport
Seating Plans
SMS
WhatsApp API automation
Realtime notifications
WebSockets
Vendor marketplace checkout
Native payment processing
Payment-proof upload
Per-person Household RSVP
Selective Event invitation per Household member
Album-level access tokens
Custom public domains
AI Assistant
AI document processing
Vector search
Product analytics platform
```

---

# 44. Frozen API Decisions

1. REST through Next.js Route Handlers.
2. Thin Route Handlers; services own business logic.
3. Wedding context derives from authenticated Membership.
4. Cross-Wedding access behaves as NOT_FOUND.
5. Capability-based authorization.
6. Role & Permission Matrix frozen.
7. One Household = one Invitation = one Household RSVP.
8. Household CRUD and Invitation lifecycle are separate resources.
9. Guest Invitation and Gallery capabilities are separate.
10. Category Budget → Expense → Payment finance model.
11. Payments immutable after creation; corrections use void.
12. Expense cannot be voided while active Payments exist.
13. Payment creation requires `Idempotency-Key`.
14. Normal V1 overpayment is blocked.
15. Only OWNER/BRIDE/GROOM can void finance records.
16. One Wedding Gallery with multiple Albums.
17. Album → Event optional.
18. Private Album through `isGuestVisible=false`.
19. Photo binaries upload directly to R2.
20. Upload lifecycle = reservation → signed upload → confirmation.
21. Photo confirmation is idempotent.
22. Guest uploads always require moderation.
23. Guest Photos invisible until approved.
24. Frontend generates QR from Gallery URL.
25. Page pagination for admin datasets; cursor pagination for Photos/Activity.
26. Filtering through query params.
27. Zod at every external boundary.
28. Consistent `{ data }` and `{ error }` envelopes.
29. Action endpoints only for genuine lifecycle actions.
30. Same-origin cookie security and conservative CORS.

---

# 45. Typical End-to-End Flow

```text
Signup
  ↓
Create Wedding
  ↓
Create Events / Members / Tasks / Vendors
  ↓
Create Budget Categories / Expenses / Payments
  ↓
Create Guest Household + Invitation
  ↓
Send Invitation
  ↓
Guest RSVP
  ↓
Create Albums
  ↓
Member direct R2 uploads
  ↓
Share Gallery
  ↓
Guest direct R2 uploads
  ↓
Organizer moderation
  ↓
Approved Photos become visible
```

---

# 46. Next Design Step

```text
PRD V2
   ↓
SYSTEM_DESIGN.md
   ↓
DATABASE_DESIGN.md
   ↓
API_DESIGN.md
   ↓
MODULE_DESIGN.md
```

`MODULE_DESIGN.md` will define the concrete Next.js folder/module structure, repositories, services, models, Zod schemas, auth utilities, permission helpers, storage/email/provider abstractions, test layout, and dependency rules.

A minimal Stage-A scaffold should be created after this API Design and before/alongside Module Design. It should establish tooling without prematurely implementing domain features.

---

# 47. Status

```text
API_DESIGN.md
Status: FROZEN FOR V1
```

Any implementation change affecting route boundaries, authorization, finance mutations, Household invitation behavior, capability security, or Gallery upload lifecycle must update this document before implementation diverges.
