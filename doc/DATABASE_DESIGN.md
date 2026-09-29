# WeddingPlaner — Database Design

**Document:** `DATABASE_DESIGN.md`  
**Project:** WeddingPlaner  
**Version:** V1  
**Database:** MongoDB Atlas  
**ODM:** Mongoose 9  
**Validation:** Zod 4  
**Primary Currency:** INR  
**Status:** Frozen for V1 implementation

---

# 1. Purpose

This document defines the database architecture for WeddingPlaner V1.

It translates the frozen Product Requirements and System Design into concrete MongoDB collections, ownership rules, relationships, indexes, validation expectations, lifecycle rules, deletion policies, idempotency rules, and storage metadata.

The database design prioritizes:

- clear tenant isolation
- secure access control
- predictable ownership
- minimal duplication
- reliable finance calculations
- secure guest invitation flows
- secure collaborative gallery access
- auditable important operations
- scalable unbounded data collections
- simple V1 implementation without unnecessary infrastructure

This document is implementation-oriented and should be treated as the database source of truth for V1.

---

# 2. Core Database Principles

## 2.1 Wedding is the tenant boundary

A `Wedding` is the primary tenant boundary in WeddingPlaner.

All wedding-scoped domain records MUST belong to exactly one wedding.

Examples:

- events
- tasks
- vendors
- budgets
- expenses
- payments
- guests
- guest invitations
- photo albums
- photos
- documents
- activity events
- audit logs

Most wedding-scoped collections MUST contain:

```ts
weddingId: ObjectId
```

Every wedding-scoped query MUST constrain by `weddingId`.

Incorrect:

```ts
Expense.findById(expenseId)
```

Preferred:

```ts
Expense.findOne({
  _id: expenseId,
  weddingId,
})
```

This is a mandatory tenant-isolation rule.

## 2.2 Internal identifiers use MongoDB ObjectId

All internal database records use MongoDB ObjectIds.

Examples:

```ts
_id: ObjectId
weddingId: ObjectId
userId: ObjectId
eventId: ObjectId
expenseId: ObjectId
```

Public links MUST NOT expose ObjectIds as access credentials.

Public and guest routes use:

- slugs
- high-entropy capability tokens
- invitation tokens

## 2.3 Separate unbounded data into collections

Growing or unbounded lists MUST use separate collections.

Examples:

- tasks
- guests
- payments
- photos
- activity events
- audit logs

Do NOT embed thousands of records inside the `Wedding` document.

## 2.4 Embed small bounded 1:1 configuration

Small configuration that is naturally owned 1:1 by a Wedding may be embedded.

Examples:

```ts
wedding.gallery
wedding.website
wedding.livestream
```

These fields are small, bounded, and frequently loaded with the Wedding.

## 2.5 Derived values should not become duplicate sources of truth

WeddingPlaner should compute values where practical instead of storing redundant totals.

Examples of derived values:

```text
Expense paid amount
Expense outstanding amount
Expense payment status
Budget actual spend
Budget remaining amount
Vendor total paid
Dashboard counts
```

Avoid maintaining duplicated counters unless profiling later proves they are necessary.

## 2.6 Money uses integer minor units

All INR values MUST be stored in paise.

Example:

```text
₹1,20,000.00 = 12,000,000 paise
```

Use integer fields such as:

```ts
amountPaise: number
```

Do NOT use floating-point rupee values.

V1 currency:

```ts
currency: "INR"
```

---

# 3. Collection Overview

## Identity

```text
users
sessions
password_reset_tokens
```

## Wedding and Membership

```text
weddings
wedding_memberships
member_invitations
```

## Planning

```text
events
tasks
vendors
```

## Finance

```text
budget_categories
expenses
payments
```

## Guests and Invitations

```text
guest_households
guest_invitations
invitation_history
```

## Media and Gallery

```text
gallery_access
photo_albums
photos
```

## Documents

```text
documents
```

## Communication

```text
email_jobs
```

## History and Security

```text
activity_events
audit_logs
```

---

# 4. High-Level Relationship Map

```text
User
 │
 ├── Session
 │
 └── WeddingMembership
          │
          ▼
       Wedding
          │
          ├── Event
          ├── Task
          ├── Vendor
          ├── BudgetCategory
          │      │
          │      ▼
          │    Expense ─────► Vendor?
          │      │
          │      ├──────────► Event?
          │      │
          │      ▼
          │    Payment
          │
          ├── GuestHousehold
          │      │
          │      ▼
          │  GuestInvitation
          │      │
          │      ├── invited Event IDs
          │      ├── household RSVP
          │      └── InvitationHistory
          │
          ├── GalleryAccess
          ├── PhotoAlbum
          │      │
          │      ▼
          │    Photo
          │
          ├── Document
          ├── ActivityEvent
          └── AuditLog
```

---

# 5. Users

Collection:

```text
users
```

Represents authenticated WeddingPlaner users.

## Suggested schema

```ts
{
  _id: ObjectId,
  email: string,
  emailNormalized: string,
  passwordHash: string,
  firstName: string,
  lastName?: string,
  status: "ACTIVE" | "DISABLED",
  emailVerifiedAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Rules

- Email MUST be normalized before uniqueness checks.
- Passwords MUST be hashed using Argon2.
- Raw passwords MUST never be persisted.
- Email uniqueness is global.

## Indexes

```ts
{ emailNormalized: 1 } unique
{ status: 1 }
```

---

# 6. Sessions

Collection:

```text
sessions
```

WeddingPlaner uses server-side sessions with secure cookies.

The browser stores an opaque session token; MongoDB stores only the hash.

## Suggested schema

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  tokenHash: string,
  createdAt: Date,
  expiresAt: Date,
  lastSeenAt?: Date,
  revokedAt?: Date,
  ipHash?: string,
  userAgent?: string
}
```

## Indexes

```ts
{ tokenHash: 1 } unique
{ userId: 1, expiresAt: 1 }
{ expiresAt: 1 }
```

A TTL index may be used for expired sessions after product requirements are validated.

---

# 7. Password Reset Tokens

Collection:

```text
password_reset_tokens
```

## Suggested schema

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  tokenHash: string,
  createdAt: Date,
  expiresAt: Date,
  usedAt?: Date
}
```

## Rules

- Raw reset token is never stored.
- Token is single-use.
- Reset endpoint must atomically validate and consume the token.

## Indexes

```ts
{ tokenHash: 1 } unique
{ userId: 1, createdAt: -1 }
{ expiresAt: 1 }
```

---

# 8. Weddings

Collection:

```text
weddings
```

Represents the primary tenant.

## Suggested schema

```ts
{
  _id: ObjectId,
  name: string,
  brideName?: string,
  groomName?: string,
  weddingDate?: Date,
  timezone: string,
  status: "ACTIVE" | "ARCHIVED",
  publicSlug?: string,

  website: {
    enabled: boolean,
    themeKey?: string,
    story?: string,
    venueSummary?: string,
    showEvents: boolean,
    showGalleryLink: boolean,
    showLivestream: boolean,
    updatedAt?: Date
  },

  gallery: {
    enabled: boolean,
    allowGuestUploads: boolean,
    allowDownloads: boolean,
    moderationRequired: boolean
  },

  livestream: {
    enabled: boolean,
    provider?: "YOUTUBE" | "OTHER",
    url?: string
  },

  createdBy: ObjectId,
  archivedAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Rules

- `publicSlug` must be globally unique if set.
- Sensitive/private internal data must never be exposed through public wedding endpoints.
- Public website availability depends on `website.enabled`.
- Gallery capability access does not use `publicSlug`.
- Gallery settings are embedded because they are bounded 1:1 configuration.

## Indexes

```ts
{ publicSlug: 1 } unique sparse
{ createdBy: 1, createdAt: -1 }
{ status: 1 }
```

---

# 9. Wedding Memberships

Collection:

```text
wedding_memberships
```

Represents the relationship between a User and a Wedding.

This collection is the source of truth for private Wedding RBAC.

## V1 Roles

```text
OWNER
BRIDE
GROOM
ORGANIZER
FAMILY_MEMBER
```

A guest is NOT a membership role.

## Suggested schema

```ts
{
  _id: ObjectId,
  weddingId: ObjectId,
  userId: ObjectId,
  role:
    | "OWNER"
    | "BRIDE"
    | "GROOM"
    | "ORGANIZER"
    | "FAMILY_MEMBER",
  status: "ACTIVE" | "REMOVED",
  invitedBy?: ObjectId,
  joinedAt: Date,
  removedAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Constraints

A user may have only one membership record per wedding.

## Indexes

```ts
{ weddingId: 1, userId: 1 } unique
{ userId: 1, status: 1 }
{ weddingId: 1, role: 1, status: 1 }
```

---

# 10. Member Invitations

Collection:

```text
member_invitations
```

This is for inviting authenticated collaborators such as family members or organizers.

It is different from a guest wedding invitation.

## Suggested schema

```ts
{
  _id: ObjectId,
  weddingId: ObjectId,
  emailNormalized: string,
  role:
    | "BRIDE"
    | "GROOM"
    | "ORGANIZER"
    | "FAMILY_MEMBER",
  tokenHash: string,
  status:
    | "PENDING"
    | "ACCEPTED"
    | "REVOKED"
    | "EXPIRED",
  invitedByMembershipId: ObjectId,
  createdAt: Date,
  expiresAt: Date,
  acceptedAt?: Date,
  revokedAt?: Date
}
```

## Indexes

```ts
{ tokenHash: 1 } unique
{ weddingId: 1, emailNormalized: 1, status: 1 }
{ expiresAt: 1 }
```

---

# 11. Events

Collection:

```text
events
```

Represents Engagement, Haldi, Mehendi, Sangeet, Wedding, Reception, etc.

## Suggested schema

```ts
{
  _id: ObjectId,
  weddingId: ObjectId,
  name: string,
  type?: string,
  description?: string,
  startAt: Date,
  endAt?: Date,
  venueName?: string,
  venueAddress?: string,
  notes?: string,
  status: "ACTIVE" | "ARCHIVED",
  createdByMembershipId: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  archivedAt?: Date
}
```

## Indexes

```ts
{ weddingId: 1, startAt: 1 }
{ weddingId: 1, status: 1, startAt: 1 }
```

---

# 12. Tasks

Collection:

```text
tasks
```

## Suggested schema

```ts
{
  _id: ObjectId,
  weddingId: ObjectId,
  eventId?: ObjectId,
  title: string,
  description?: string,
  assignedToMembershipId?: ObjectId,
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  status: "TODO" | "IN_PROGRESS" | "DONE",
  dueAt?: Date,
  createdByMembershipId: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  completedAt?: Date
}
```

## Rules

Tasks may optionally belong to an Event.

Task deletion may be hard-delete in V1 if the task does not carry compliance or financial meaning.

## Indexes

```ts
{ weddingId: 1, status: 1, dueAt: 1 }
{ weddingId: 1, assignedToMembershipId: 1, status: 1 }
{ weddingId: 1, eventId: 1, status: 1 }
{ weddingId: 1, priority: 1, status: 1 }
```

---

# 13. Vendors

Collection:

```text
vendors
```

## Suggested schema

```ts
{
  _id: ObjectId,
  weddingId: ObjectId,
  name: string,
  category: string,
  contactPerson?: string,
  phone?: string,
  email?: string,
  address?: string,
  externalSource?: "MANUAL" | "GOOGLE_PLACES",
  externalPlaceId?: string,
  quotedAmountPaise?: number,
  agreedAmountPaise?: number,
  notes?: string,
  status: "ACTIVE" | "ARCHIVED",
  createdByMembershipId: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  archivedAt?: Date
}
```

## Rules

Vendor amount fields are commercial reference values.

They are NOT the authoritative source of:

```text
total paid
remaining amount
actual wedding spend
```

Those values are derived from Expenses and Payments.

## Delete policy

If a Vendor is referenced by financial records, do not hard-delete it. Archive it.

## Indexes

```ts
{ weddingId: 1, status: 1, category: 1 }
{ weddingId: 1, name: 1 }
{ weddingId: 1, externalPlaceId: 1 }
```

---

# 14. Budget Categories

Collection:

```text
budget_categories
```

V1 uses category-level budgets.

Examples:

```text
Venue
Catering
Photography
Decoration
Clothing
Entertainment
Invitations
Gifts
Miscellaneous
```

## Suggested schema

```ts
{
  _id: ObjectId,
  weddingId: ObjectId,
  name: string,
  allocatedAmountPaise: number,
  notes?: string,
  sortOrder?: number,
  status: "ACTIVE" | "ARCHIVED",
  createdByMembershipId: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  archivedAt?: Date
}
```

## Rules

- One category may contain many Expenses.
- Budgets are category-level, not individual line-item forecasts.
- `allocatedAmountPaise >= 0`.
- An Expense must belong to one budget category.

## Indexes

```ts
{ weddingId: 1, status: 1, sortOrder: 1 }
{ weddingId: 1, name: 1 }
```

---

# 15. Expenses

Collection:

```text
expenses
```

An Expense represents an actual wedding spending commitment.

## Suggested schema

```ts
{
  _id: ObjectId,
  weddingId: ObjectId,
  categoryId: ObjectId,
  vendorId?: ObjectId,
  eventId?: ObjectId,
  title: string,
  description?: string,
  amountPaise: number,
  currency: "INR",
  expenseDate?: Date,
  status: "ACTIVE" | "VOIDED",
  notes?: string,
  createdByMembershipId: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  voidedAt?: Date,
  voidedByMembershipId?: ObjectId,
  voidReason?: string
}
```

## Required relationships

```text
Expense → Wedding
Expense → BudgetCategory
```

## Optional relationships

```text
Expense → Vendor
Expense → Event
```

This intentionally supports non-vendor expenses.

## Derived finance values

Do NOT persist the following as authoritative fields:

```text
paidAmount
outstandingAmount
paymentStatus
```

Calculate:

```text
paidAmount = SUM(recorded payments)
outstandingAmount = expense.amountPaise - paidAmount
```

Derived payment status:

```text
UNPAID
PARTIALLY_PAID
PAID
OVERPAID
```

## Delete policy

If Payments exist, the Expense MUST NOT be hard-deleted. Use `VOIDED` instead.

## Indexes

```ts
{ weddingId: 1, status: 1, expenseDate: -1 }
{ weddingId: 1, categoryId: 1, status: 1 }
{ weddingId: 1, vendorId: 1, status: 1 }
{ weddingId: 1, eventId: 1, status: 1 }
```

---

# 16. Payments

Collection:

```text
payments
```

A Payment records money actually paid against an Expense.

## Suggested schema

```ts
{
  _id: ObjectId,
  weddingId: ObjectId,
  expenseId: ObjectId,
  amountPaise: number,
  currency: "INR",
  paymentDate: Date,
  method:
    | "CASH"
    | "UPI"
    | "BANK_TRANSFER"
    | "CARD"
    | "CHEQUE"
    | "OTHER",
  referenceNumber?: string,
  notes?: string,
  status: "RECORDED" | "VOIDED",
  idempotencyKey: string,
  createdByMembershipId: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  voidedAt?: Date,
  voidedByMembershipId?: ObjectId,
  voidReason?: string
}
```

## Rules

A Payment MUST reference an Expense.

A Payment does NOT need a direct `vendorId`.

Vendor is resolved through:

```text
Payment → Expense → Vendor?
```

## Payment proof

Payment-proof file uploads are deferred from V1.

V1 supports:

```text
payment method
reference number
notes
```

## Idempotency

Payment creation MUST be idempotent.

Recommended uniqueness:

```ts
{ weddingId: 1, idempotencyKey: 1 } unique
```

## Delete policy

Recorded Payments MUST NOT normally be hard-deleted.

Correction flow:

```text
RECORDED → VOIDED
```

## Indexes

```ts
{ weddingId: 1, expenseId: 1, paymentDate: 1 }
{ weddingId: 1, status: 1, paymentDate: -1 }
{ weddingId: 1, idempotencyKey: 1 } unique
```

---

# 17. Finance Relationship Rules

```text
                         Wedding
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
   Budget Category        Vendor            Event
          │                 │                 │
          │                 │ optional        │ optional
          │                 ▼                 ▼
          └──────────────► Expense ◄──────────┘
                              │
                              │ 1:N
                              ▼
                           Payment
```

Frozen decisions:

```text
Budget = category-level
Expense → BudgetCategory = required
Expense → Vendor = optional
Expense → Event = optional
Non-vendor Expense = allowed
Expense → Payment = one-to-many
Payment → Expense = required
Payment → Vendor = derived through Expense
Payment proof upload = deferred
Payment reference number = optional
Payment notes = optional
Recorded payment hard-delete = disallowed
```

---

# 18. Guest Households

Collection:

```text
guest_households
```

WeddingPlaner V1 deliberately uses a household-level guest model.

Frozen rule:

```text
One household = one invitation = one household RSVP
```

Individual family members are NOT invited separately for selective events.

## Suggested schema

```ts
{
  _id: ObjectId,
  weddingId: ObjectId,
  householdName: string,
  primaryContactName?: string,
  phone?: string,
  email?: string,
  members: [
    {
      _id: ObjectId,
      name: string,
      relationLabel?: string
    }
  ],
  notes?: string,
  status: "ACTIVE" | "ARCHIVED",
  createdByMembershipId: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  archivedAt?: Date
}
```

## Rules

Household members:

- do not have independent RSVP state
- do not have individual invitation links
- do not belong to multiple invitation groups
- do not receive selective event invitation assignments

The `members` array is bounded household metadata and may remain embedded.

---

# 19. Guest Invitations

Collection:

```text
guest_invitations
```

Each active household has one primary wedding invitation.

The invitation is the public capability boundary for RSVP.

## Suggested schema

```ts
{
  _id: ObjectId,
  weddingId: ObjectId,
  householdId: ObjectId,
  token: string,
  invitedEventIds: [ObjectId],
  deliveryStatus:
    | "DRAFT"
    | "SENT"
    | "DELIVERED"
    | "FAILED",

  rsvp: {
    status:
      | "PENDING"
      | "YES"
      | "NO"
      | "MAYBE",
    attendeeCount?: number,
    note?: string,
    submittedAt?: Date
  },

  createdByMembershipId: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  sentAt?: Date,
  lastOpenedAt?: Date,
  lastResentAt?: Date,
  revokedAt?: Date
}
```

## Invitation token rule

The invitation token identifies the `GuestInvitation`, not the household.

It is a stable high-entropy secret used in the shareable guest URL:

```text
/invite/<token>
```

Because organizers need to reuse the same shareable guest link, V1 may store the stable raw token.

Security requirements:

- high entropy
- unique
- excluded from ordinary list projections
- never logged
- never exposed through unrelated APIs
- only returned by explicitly authorized invitation-share operations

## Event assignment rule

One household invitation may include multiple events.

Example:

```text
Sharma Family
  → Engagement
  → Wedding
  → Reception
```

Do NOT support selective individual family-member event invitations in V1.

## RSVP rule

RSVP is household-level.

Example:

```text
status: YES
attendeeCount: 3
```

Individual member RSVP statuses are not stored.

## Validation

If `attendeeCount` is supplied:

```text
0 <= attendeeCount <= household member count
```

Recommended behavior:

```text
YES → attendeeCount typically >= 1
NO → attendeeCount = 0 or omitted
MAYBE → attendeeCount optional
```

## Indexes

```ts
{ token: 1 } unique
{ weddingId: 1, householdId: 1 } unique
{ weddingId: 1, "rsvp.status": 1 }
{ weddingId: 1, invitedEventIds: 1 }
```

---

# 20. Invitation History

Collection:

```text
invitation_history
```

WeddingPlaner preserves invitation lifecycle history.

## Suggested schema

```ts
{
  _id: ObjectId,
  weddingId: ObjectId,
  invitationId: ObjectId,
  type:
    | "CREATED"
    | "SENT"
    | "RESENT"
    | "DELIVERED"
    | "OPENED"
    | "RSVP_SUBMITTED"
    | "RSVP_UPDATED"
    | "REVOKED"
    | "DELIVERY_FAILED",
  actorType: "MEMBER" | "GUEST" | "SYSTEM",
  actorMembershipId?: ObjectId,
  metadata?: {
    previousRsvpStatus?: string,
    newRsvpStatus?: string,
    attendeeCount?: number,
    channel?: "EMAIL" | "WHATSAPP" | "LINK"
  },
  createdAt: Date
}
```

## Rules

Invitation history is append-oriented.

Do not put secrets such as invitation tokens into `metadata`.

## Indexes

```ts
{ weddingId: 1, invitationId: 1, createdAt: -1 }
{ weddingId: 1, type: 1, createdAt: -1 }
```

---

# 21. Guest and Invitation Relationship Summary

```text
Wedding
  │
  └── GuestHousehold
        │
        ├── embedded household members
        │
        └── GuestInvitation
              │
              ├── invited Event IDs
              ├── one capability token
              ├── one household RSVP
              └── InvitationHistory
```

Rules:

```text
Household independently managed? NO
Individual RSVP? NO
RSVP scope? Household
One person in multiple invitation groups? NO
Selective event invite by member? NO
Invitation token identifies? Invitation
Invitation history? YES
```

---

# 22. Gallery Configuration

Gallery configuration is embedded in the Wedding.

```ts
gallery: {
  enabled: boolean,
  allowGuestUploads: boolean,
  allowDownloads: boolean,
  moderationRequired: boolean
}
```

V1 supports exactly one wedding gallery capability space per Wedding.

Albums provide content organization.

---

# 23. Gallery Access

Collection:

```text
gallery_access
```

Guest gallery access uses a dedicated capability token.

This token is independent from the Guest Invitation token.

## Suggested schema

```ts
{
  _id: ObjectId,
  weddingId: ObjectId,
  token: string,
  status: "ACTIVE" | "REVOKED",
  createdByMembershipId: ObjectId,
  createdAt: Date,
  lastUsedAt?: Date,
  revokedAt?: Date,
  revokedByMembershipId?: ObjectId,
  expiresAt?: Date
}
```

## Token rule

V1 uses a stable high-entropy gallery token.

Example:

```text
/gallery/<token>
```

The token may be stored as a protected raw secret in V1 because organizers need to repeatedly copy/share the same link.

Security requirements:

- high entropy
- globally unique
- excluded from ordinary projections
- never logged
- not exposed in generic Wedding responses
- only returned through authorized gallery-share operations

## Token rotation

Regenerating the gallery link MUST:

1. revoke the old GalleryAccess record
2. create a new GalleryAccess record
3. return the new share link
4. cause the old URL and QR code to stop working

## QR code

The QR code is derived from the active gallery URL.

Do NOT store QR image binaries or dedicated QR-code records in MongoDB.

## Indexes

```ts
{ token: 1 } unique
{ weddingId: 1, status: 1 }
```

At most one active GalleryAccess record should exist per Wedding.

---

# 24. Photo Albums

Collection:

```text
photo_albums
```

## Suggested schema

```ts
{
  _id: ObjectId,
  weddingId: ObjectId,
  eventId?: ObjectId,
  name: string,
  description?: string,
  coverPhotoId?: ObjectId,
  isGuestVisible: boolean,
  sortOrder?: number,
  createdByMembershipId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## Rules

Album → Event is optional.

Album-level capability tokens are NOT supported.

Gallery token grants guest access only to albums where:

```ts
isGuestVisible === true
```

Organizers may maintain private albums by setting:

```ts
isGuestVisible: false
```

## Indexes

```ts
{ weddingId: 1, sortOrder: 1, createdAt: 1 }
{ weddingId: 1, eventId: 1 }
{ weddingId: 1, isGuestVisible: 1, sortOrder: 1 }
```

---

# 25. Photos

Collection:

```text
photos
```

MongoDB stores photo metadata. Actual photo bytes are stored in Cloudflare R2.

## Suggested schema

```ts
{
  _id: ObjectId,
  weddingId: ObjectId,
  albumId: ObjectId,
  eventId?: ObjectId,
  uploadKey: string,
  objectKey: string,
  originalFilename: string,
  mimeType: string,
  sizeBytes: number,
  uploaderType: "MEMBER" | "GUEST",
  uploadedByMembershipId?: ObjectId,
  guestUploaderName?: string,
  storageStatus: "PENDING" | "READY" | "DELETED",
  moderationStatus:
    | "NOT_REQUIRED"
    | "PENDING"
    | "APPROVED"
    | "REJECTED",
  expiresAt?: Date,
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date,
  deletedByMembershipId?: ObjectId
}
```

## Upload source rules

### Member upload

```text
uploaderType = MEMBER
uploadedByMembershipId = required
moderationStatus = NOT_REQUIRED
```

### Guest upload

```text
uploaderType = GUEST
uploadedByMembershipId = absent
guestUploaderName = optional
moderationStatus = PENDING
```

The guest uploader name is unverified display metadata only.

---

# 26. Photo Storage Lifecycle

WeddingPlaner adapts the staging lifecycle pattern.

## Stage 1 — Upload reservation

Create Photo metadata:

```text
storageStatus = PENDING
```

Set:

```text
uploadKey
objectKey = staging object key
expiresAt
```

The application issues a presigned R2 PUT URL.

The browser uploads directly to R2.

## Stage 2 — Confirmation

After upload, the client confirms completion.

Server verifies the expected R2 object.

If valid, atomically transition:

```text
PENDING → READY
```

and finalize the permanent object key.

## Stage 3 — Gallery visibility

A photo is visible to guest gallery viewers only when:

```ts
storageStatus === "READY"
```

AND:

```ts
moderationStatus === "NOT_REQUIRED"
|| moderationStatus === "APPROVED"
```

Guest uploads require organizer approval in V1.

## Stage 4 — Deletion

Deletion flow:

1. delete or hide R2 object
2. mark metadata `storageStatus = DELETED`

Do NOT physically remove the metadata record during normal gallery deletion.

The tombstone prevents late confirmation flows from resurrecting deleted uploads.

---

# 27. Photo Idempotency and Concurrency

`uploadKey` is the server-issued unique reservation key.

Use unique indexes:

```ts
{ uploadKey: 1 } unique
{ objectKey: 1 } unique
```

Confirmation MUST transition only a still-pending photo.

Conceptually:

```ts
findOneAndUpdate(
  {
    _id: photoId,
    weddingId,
    storageStatus: "PENDING",
  },
  {
    $set: {
      storageStatus: "READY",
      objectKey: finalObjectKey,
    },
  }
)
```

Concurrent confirmations must not produce two committed metadata transitions.

Any duplicate or losing R2 copies should be removed on a best-effort basis.

Do not use a TTL index that deletes only MongoDB metadata while leaving the storage object unmanaged.

Orphan reconciliation may be introduced in a future version.

---

# 28. Photo Indexes

Recommended:

```ts
{
  weddingId: 1,
  albumId: 1,
  storageStatus: 1,
  moderationStatus: 1,
  createdAt: -1,
  _id: -1
}
```

For event-filtered galleries:

```ts
{
  weddingId: 1,
  eventId: 1,
  storageStatus: 1,
  moderationStatus: 1,
  createdAt: -1,
  _id: -1
}
```

Operational indexes:

```ts
{ uploadKey: 1 } unique
{ objectKey: 1 } unique
{ weddingId: 1, storageStatus: 1, createdAt: -1 }
```

Final index selection should be validated against API query patterns.

---

# 29. Gallery Access Summary

```text
One Wedding → one gallery
Gallery configuration → embedded in Wedding
Gallery guest access → separate GalleryAccess collection
Guest gallery token ≠ guest invitation token
Token rotation → supported
Token revocation → supported
QR → generated from gallery URL
Albums → separate collection
Album event relation → optional
Private albums → supported via isGuestVisible
Album-level tokens → not supported
Photos → separate collection
Photo bytes → Cloudflare R2
Guest accounts → not required
Guest uploader name → optional
Guest upload moderation → required
Guest-visible photo → READY + approved/not-required
Open slug-based anonymous gallery → not supported in V1
```

---

# 30. Documents

Collection:

```text
documents
```

Documents represent private wedding files.

Examples:

- contracts
- vendor quotations
- planning PDFs
- venue documents
- private organizer files

Payment-proof upload is NOT part of V1 finance.

## Suggested schema

```ts
{
  _id: ObjectId,
  weddingId: ObjectId,
  eventId?: ObjectId,
  vendorId?: ObjectId,
  title: string,
  description?: string,
  objectKey: string,
  originalFilename: string,
  mimeType: string,
  sizeBytes: number,
  category?: string,
  uploadedByMembershipId: ObjectId,
  status: "ACTIVE" | "DELETED",
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date,
  deletedByMembershipId?: ObjectId
}
```

## Rules

Documents are private authenticated content.

Guest gallery tokens and invitation tokens MUST NOT provide access to Documents.

## Indexes

```ts
{ weddingId: 1, status: 1, createdAt: -1 }
{ weddingId: 1, vendorId: 1, status: 1 }
{ weddingId: 1, eventId: 1, status: 1 }
{ objectKey: 1 } unique
```

---

# 31. Email Jobs

Collection:

```text
email_jobs
```

Used for asynchronous email delivery through Resend and Vercel Cron.

## Suggested schema

```ts
{
  _id: ObjectId,
  weddingId?: ObjectId,
  type:
    | "MEMBER_INVITATION"
    | "GUEST_INVITATION"
    | "GUEST_REMINDER"
    | "PASSWORD_RESET"
    | "OTHER",
  to: string,
  templateKey: string,
  payload: object,
  status:
    | "PENDING"
    | "PROCESSING"
    | "SENT"
    | "FAILED"
    | "CANCELLED",
  idempotencyKey: string,
  attempts: number,
  nextRetryAt?: Date,
  lockedAt?: Date,
  providerMessageId?: string,
  lastErrorCode?: string,
  createdAt: Date,
  updatedAt: Date,
  sentAt?: Date
}
```

## Rules

One logical email operation should have one idempotency identity.

Workers must safely handle retries.

Payload MUST NOT contain passwords, raw session tokens, or unnecessary secret capability tokens.

## Indexes

```ts
{ idempotencyKey: 1 } unique
{ status: 1, nextRetryAt: 1, createdAt: 1 }
{ lockedAt: 1 }
{ weddingId: 1, createdAt: -1 }
```

---

# 32. Activity Events

Collection:

```text
activity_events
```

Activity Timeline is product-facing history.

Examples:

```text
Anuja created the Reception event.
Amit completed "Confirm photographer".
Sharma Family submitted RSVP.
Anuja recorded ₹20,000 payment.
Guest uploaded 8 photos.
Anuja approved 6 guest photos.
```

## Suggested schema

```ts
{
  _id: ObjectId,
  weddingId: ObjectId,
  actorType: "MEMBER" | "GUEST" | "SYSTEM",
  actorMembershipId?: ObjectId,
  type: string,
  entityType?: string,
  entityId?: ObjectId,
  displayText?: string,
  metadata?: object,
  createdAt: Date
}
```

## Rules

Activity metadata must be safe for UI display.

Do not store secrets.

## Indexes

```ts
{ weddingId: 1, createdAt: -1, _id: -1 }
{ weddingId: 1, entityType: 1, entityId: 1, createdAt: -1 }
```

---

# 33. Audit Logs

Collection:

```text
audit_logs
```

Audit Logs are security/system records, not the user-friendly Activity Timeline.

Examples:

```text
ROLE_CHANGED
MEMBER_REMOVED
INVITATION_REVOKED
GALLERY_TOKEN_ROTATED
GALLERY_ACCESS_REVOKED
PAYMENT_VOIDED
EXPENSE_VOIDED
```

## Suggested schema

```ts
{
  _id: ObjectId,
  weddingId?: ObjectId,
  actorUserId?: ObjectId,
  actorMembershipId?: ObjectId,
  action: string,
  targetType?: string,
  targetId?: ObjectId,
  requestId?: string,
  ipHash?: string,
  metadata?: object,
  createdAt: Date
}
```

## Rules

Audit logs are append-oriented.

They should not be edited by routine application features.

Metadata must never contain secrets.

## Indexes

```ts
{ weddingId: 1, createdAt: -1 }
{ action: 1, createdAt: -1 }
{ targetType: 1, targetId: 1, createdAt: -1 }
```

---

# 34. Activity Timeline vs Audit Log

These are intentionally separate.

## Activity Event

Purpose:

```text
User-facing collaboration history
```

Optimized for:

```text
"What happened in this wedding?"
```

## Audit Log

Purpose:

```text
Security-sensitive and administrative traceability
```

Optimized for:

```text
"Who changed this permission?"
"Who revoked this token?"
"Who voided this payment?"
```

A single user action may generate one ActivityEvent plus one AuditLog when appropriate.

---

# 35. Public Website Data

Wedding Website configuration is embedded in the Wedding document.

The public website uses a stable public slug:

```text
/w/<slug>
```

Public website data may include:

- bride/groom names
- story
- public event summaries
- venue summary
- livestream URL when enabled
- gallery link when deliberately enabled

The public website MUST NOT expose:

- membership records
- guest lists
- RSVP records
- budget
- expenses
- payments
- private vendor information
- documents
- tokens
- internal activity metadata
- audit logs

---

# 36. Trust Boundaries

WeddingPlaner has three main trust zones.

## Private authenticated zone

```text
/app/*
```

Requires:

- valid server-side session
- active membership
- role authorization
- object-level wedding ownership validation

## Guest capability zone

```text
/invite/:token
/gallery/:token
```

Requires a valid capability token and capability-specific authorization.

Invitation token grants only invitation/RSVP capability.

Gallery token grants only permitted gallery capability.

They MUST NOT be interchangeable.

## Public website zone

```text
/w/:slug
```

No authentication. Only explicit public-safe fields may be returned.

---

# 37. Cross-Wedding Relationship Validation

MongoDB does not provide relational foreign-key constraints.

Application services MUST validate that related IDs belong to the same Wedding.

Examples:

Before creating an Expense:

```text
Expense.weddingId
BudgetCategory.weddingId
Vendor.weddingId if supplied
Event.weddingId if supplied
```

must all match.

Before assigning a Task:

```text
Task.weddingId
Membership.weddingId
```

must match.

Before attaching a Photo to an Album:

```text
Photo.weddingId
Album.weddingId
```

must match.

Never trust client-supplied IDs without cross-tenant validation.

---

# 38. Transactions

MongoDB transactions should be used selectively.

Potential examples:

- accept member invitation + create membership
- payment creation + critical financial audit record
- invitation revocation + history event when strict consistency is required
- gallery access rotation
- wedding archival + critical state transitions

Prefer single-document atomic operations whenever possible.

---

# 39. Idempotency

Idempotency is mandatory for high-risk mutation flows.

Especially:

```text
Payment creation
Email job scheduling
Photo upload confirmation
Invitation resend scheduling
```

Potential future uses:

```text
RSVP submission
Member invitation acceptance
```

The API Design will define headers and request behavior.

---

# 40. Deletion Strategy

WeddingPlaner does NOT use one deletion strategy for every collection.

| Entity | V1 deletion strategy |
|---|---|
| Wedding | Archive |
| Event | Archive |
| Task | Hard-delete when safe |
| Vendor | Archive when referenced |
| Budget Category | Archive when referenced |
| Expense | Void if financial history exists |
| Payment | Void; no normal hard-delete |
| Guest Household | Archive preferred |
| Guest Invitation | Revoke once sent/used |
| Invitation History | Append-only |
| Photo | Storage-aware deletion + tombstone |
| Document | Storage-aware soft deletion |
| Activity Event | Append-oriented |
| Audit Log | Append-only |

---

# 41. Archive vs Void

Use `ARCHIVED` for records that are no longer actively used but remain historically valid.

Examples:

```text
Vendor
Event
Budget Category
Guest Household
```

Use `VOIDED` for financial records that were recorded but later invalidated.

Examples:

```text
Expense
Payment
```

---

# 42. Timestamp Standard

All database timestamps are stored as UTC MongoDB dates.

Wedding timezone is stored separately:

```ts
wedding.timezone
```

Rendering and date-entry conversion happens in the application layer.

---

# 43. Pagination

Collections expected to grow should support cursor-based pagination.

Recommended ordering:

```text
createdAt DESC
_id DESC
```

Examples:

- photos
- activity events
- audit logs
- invitation history

---

# 44. Index Strategy

Indexes should be driven by actual API query patterns.

Primary query categories:

```text
Tenant-scoped list queries
Status filters
Event filters
Assigned-member filters
Finance category/vendor filters
Invitation token lookup
Gallery token lookup
Photo album/event pagination
Activity timeline pagination
Job queue processing
```

Final index definitions should be reviewed again while producing `API_DESIGN.md`.

---

# 45. Denormalization Policy

V1 avoids unnecessary denormalized counters.

Do NOT initially persist:

```text
wedding.totalGuests
wedding.totalExpenses
wedding.totalPaid
vendor.totalPaid
expense.paidAmount
expense.remainingAmount
album.photoCount
```

Use indexed queries and aggregation.

---

# 46. Dashboard Aggregation

Dashboard data should be derived from underlying collections.

## Upcoming events

```text
events where
weddingId = X
status = ACTIVE
startAt >= now
```

## Urgent tasks

```text
tasks where
weddingId = X
status != DONE
priority = URGENT
```

## Guest RSVP summary

Aggregate:

```text
guest_invitations.rsvp.status
```

## Budget summary

```text
allocated = budget_categories.allocatedAmountPaise
actual = SUM(active expenses.amountPaise)
```

## Payment summary

```text
paid = SUM(recorded payments.amountPaise)
```

No V1 dashboard counter collection is required.

---

# 47. Finance Aggregation Examples

## Expense paid amount

```text
SUM payments.amountPaise
WHERE
  payments.weddingId = expense.weddingId
  AND payments.expenseId = expense._id
  AND payments.status = RECORDED
```

## Expense outstanding

```text
expense.amountPaise - paidAmount
```

## Category actual

```text
SUM active expenses.amountPaise WHERE categoryId = category._id
```

## Category variance

```text
allocatedAmountPaise - actualAmountPaise
```

---

# 48. Overpayment

Derived status may become:

```text
OVERPAID
```

if recorded payment total exceeds expense amount.

V1 API should normally block accidental overpayment unless explicitly allowed by a later product decision.

---

# 49. Security-Sensitive Fields

The following fields require special handling:

```text
sessions.tokenHash
password_reset_tokens.tokenHash
member_invitations.tokenHash
guest_invitations.token
gallery_access.token
```

Rules:

- never log them
- never include them in generic serializers
- never return them in list APIs unless specifically required
- never include them in Activity metadata
- never include them in Audit metadata

Mongoose schemas should use `select: false` for secret fields where appropriate.

---

# 50. Validation Layers

## Zod

Request and command validation.

Examples:

```text
required fields
enum values
string lengths
amount >= 0
attendee count
email formatting
```

## Service layer

Business validation.

Examples:

```text
membership permissions
same-wedding relationship
payment overrun
album guest visibility rules
household RSVP constraints
active token validation
```

## Mongoose

Persistence-level schema validation and indexes.

Do not depend only on frontend validation.

---

# 51. Naming Conventions

MongoDB collections:

```text
snake_case plural
```

TypeScript model names:

```text
PascalCase singular
```

Fields:

```text
camelCase
```

---

# 52. Document Size Awareness

Avoid embedding unbounded collections inside:

```text
Wedding
GuestHousehold
Event
Vendor
```

Bounded embedded fields are acceptable:

```text
Wedding.gallery
Wedding.website
Wedding.livestream
GuestHousehold.members
GuestInvitation.rsvp
```

Household members are intentionally embedded because the household is one invitation group and the member list remains small.

---

# 53. Guest Household Edge Cases

## Household member removed

Member edits are household metadata changes.

No RSVP migration is needed because RSVP belongs to the household.

## Household archived

Existing invitation/history records must remain historically resolvable.

## Invitation events changed after sending

Allowed only through an authorized organizer action and should generate an invitation-history entry.

---

# 54. Invitation Event Integrity

Every `invitedEventId` MUST:

- exist
- belong to the same Wedding
- not be from another tenant

Duplicate event IDs must be removed or rejected.

---

# 55. Gallery Moderation Edge Cases

## Guest upload approved

```text
PENDING → APPROVED
```

## Guest upload rejected

```text
PENDING → REJECTED
```

Rejected content must not appear in guest gallery results.

## Organizer upload

```text
NOT_REQUIRED
```

Guest uploads require organizer approval in V1.

---

# 56. Gallery Access Revocation

When gallery access is revoked:

- existing token becomes invalid immediately
- photos and albums remain unchanged
- authenticated organizers retain private access
- a new GalleryAccess may later be generated

Revocation does not delete gallery content.

---

# 57. Album Visibility

Album visibility uses:

```ts
isGuestVisible: boolean
```

This is not a full permission model.

Private albums are visible to authorized Wedding members and not visible through the gallery capability route.

No per-household or per-guest album authorization exists in V1.

---

# 58. Documents Security

Documents are always private V1 data.

Access requires:

```text
authenticated user
+
active wedding membership
+
role authorization if applicable
```

Guest tokens do not grant document access.

---

# 59. Cloudflare R2 Metadata Strategy

MongoDB stores:

```text
objectKey
mimeType
sizeBytes
originalFilename
```

Cloudflare R2 stores the binary object.

Avoid permanent public object URLs where access control is required.

For photos:

- organizer/private access is authorized
- guest access is gated by active gallery capability
- album visibility and moderation rules are checked before serving signed URLs

For documents:

- always private authenticated access

---

# 60. Email Job Retry Model

Recommended processing:

```text
PENDING → PROCESSING → SENT
```

Retryable failures may use:

```text
FAILED → nextRetryAt → PROCESSING
```

Workers should use atomic locking to avoid duplicate processing.

---

# 61. Job Idempotency

Examples:

```text
guest-invite:<invitationId>:initial
guest-invite:<invitationId>:reminder:<sequence>
member-invite:<memberInvitationId>
password-reset:<resetRequestId>
```

The exact key format is implementation-defined.

---

# 62. Audit Requirements for Finance

Security-sensitive finance actions should create Audit Logs.

Examples:

```text
PAYMENT_CREATED
PAYMENT_VOIDED
EXPENSE_VOIDED
BUDGET_CATEGORY_ARCHIVED
```

Product-facing equivalents may also create Activity Events.

---

# 63. No Payment Processing in V1

WeddingPlaner V1 is not a payment gateway.

It records external payments such as:

```text
UPI
bank transfer
cash
card paid outside WeddingPlaner
cheque
```

The database does not store:

- card numbers
- bank credentials
- payment gateway secrets
- guest checkout records

---

# 64. Explicitly Deferred Database Scope

Do not create V1 schemas for:

```text
Accommodation / travel
AI conversations or vector data
Notification center / push
Vendor marketplace bookings
Multiple galleries per wedding
Individual guest RSVP records
Per-album share tokens
Payment-proof attachment workflow
```

---

# 65. Environment Separation

Separate databases must be used for:

```text
development
test
preview/staging
production
```

Never use the production database for local development or automated tests.

---

# 66. Seed Data

Development may include seed scripts for:

- demo Wedding
- example Events
- example Vendors
- example Budget Categories
- sample Household Invitations

Seed scripts MUST NOT execute automatically in production.

---

# 67. Uniqueness Summary

Recommended unique constraints:

```text
users.emailNormalized
sessions.tokenHash
password_reset_tokens.tokenHash
weddings.publicSlug (sparse)
wedding_memberships(weddingId,userId)
member_invitations.tokenHash
payments(weddingId,idempotencyKey)
guest_invitations.token
guest_invitations(weddingId,householdId)
gallery_access.token
photos.uploadKey
photos.objectKey
documents.objectKey
email_jobs.idempotencyKey
```

Some constraints may require partial indexes based on active-state semantics.

---

# 68. Suggested Enum Centralization

Enums should be shared through TypeScript domain constants rather than duplicated as arbitrary strings across services.

Examples:

```text
WeddingRole
TaskStatus
TaskPriority
VendorStatus
ExpenseStatus
PaymentStatus
PaymentMethod
RsvpStatus
InvitationHistoryType
GalleryAccessStatus
PhotoStorageStatus
PhotoModerationStatus
EmailJobStatus
```

Zod and Mongoose schemas should derive from the same canonical values where practical.

---

# 69. Schema Evolution

V1 should support forward-compatible schema evolution.

Rules:

- avoid renaming fields casually after production
- add fields in backward-compatible phases
- prefer optional new fields first
- use migration scripts for semantic changes
- never rely on manually editing production documents

Future DB migrations should live in a dedicated folder such as:

```text
scripts/migrations/
```

---

# 70. Example Wedding Finance Data

```text
Wedding: Example Family Wedding

Budget Categories
-----------------
Venue           ₹4,00,000
Catering        ₹4,50,000
Photography     ₹1,50,000

Vendor
------
Royal Photography
quotedAmount    ₹1,35,000
agreedAmount    ₹1,20,000

Expense
-------
Wedding Photography Package
category        Photography
vendor          Royal Photography
amount          ₹1,20,000

Payments
--------
₹20,000  UPI
₹40,000  Bank Transfer
₹60,000  UPI

Derived
-------
Paid            ₹1,20,000
Outstanding     ₹0
Status          PAID
```

No duplicate `paidAmount` is required on Vendor or Expense.

---

# 71. Example Household Invitation Data

```text
Household
---------
Sharma Family

Members
-------
Rajesh Sharma
Sunita Sharma
Amit Sharma
Priya Sharma

Invitation
----------
Events:
- Engagement
- Wedding
- Reception

RSVP
----
YES

Attendee Count
--------------
3
```

There is no individual RSVP table.

---

# 72. Example Gallery Data

```text
Wedding Gallery
---------------
Enabled: Yes
Guest Uploads: Yes
Downloads: Yes
Moderation: Required

Gallery Access
--------------
One active capability token

Albums
------
Engagement
Mehendi
Wedding
Reception
Family Private Photos

Family Private Photos:
isGuestVisible = false

Guest Upload
------------
storageStatus = READY
moderationStatus = PENDING

After organizer approval:
moderationStatus = APPROVED
```

---

# 73. Data Retention

Exact legal/data retention durations are not finalized in V1.

Therefore:

- do not automatically purge core wedding records
- use explicit archival/void/revocation states
- use TTL only for clearly temporary token/session cases where appropriate
- never TTL-delete financial history
- never TTL-delete invitation history
- never TTL-delete audit logs without an explicit retention policy

---

# 74. Sensitive Data Minimization

Collect only what the product needs.

Do not collect unnecessary:

```text
government IDs
bank details
date of birth
sensitive demographics
```

---

# 75. API Design Dependencies

The upcoming `API_DESIGN.md` must derive endpoint behavior from this database model.

Key API groups:

```text
/auth
/weddings
/members
/events
/tasks
/vendors
/budgets
/expenses
/payments
/guests
/invitations
/rsvp
/gallery
/albums
/photos
/documents
/activity
/public
/internal/email-jobs
```

The API Design must preserve:

- tenant scoping
- RBAC
- capability boundaries
- idempotency
- financial void semantics
- gallery moderation
- household RSVP rules

---

# 76. Database Decisions Frozen for V1

## Tenant

```text
Wedding is the tenant boundary.
```

## Authentication

```text
Server-side sessions.
Session secrets hashed.
```

## Membership

```text
User ↔ Wedding through WeddingMembership.
```

## Guest Model

```text
One household = one invitation = one household RSVP.
```

## Guest Events

```text
Invitation contains multiple invited event IDs.
No selective event assignment per household member.
```

## Finance

```text
Category-level budgets.
Expense category required.
Vendor optional.
Event optional.
Non-vendor expenses allowed.
Payments are separate 1:N children of Expense.
```

## Payment Proof

```text
Deferred from V1.
Reference number + notes only.
```

## Gallery

```text
One gallery per Wedding.
Configuration embedded in Wedding.
Gallery access in separate collection.
One active gallery capability token.
```

## Albums

```text
Separate collection.
Event optional.
Guest visibility controlled by isGuestVisible.
```

## Guest Photo Uploads

```text
Allowed.
No guest account required.
Organizer approval required.
```

## Storage

```text
Photo/document metadata in MongoDB.
Binary files in Cloudflare R2.
```

## History

```text
Invitation History supported.
Activity Timeline separate from Audit Logs.
```

## Derived Values

```text
Do not denormalize dashboard/finance counters initially.
```

---

# 77. Final Collection List

The V1 database design consists of:

```text
1.  users
2.  sessions
3.  password_reset_tokens
4.  weddings
5.  wedding_memberships
6.  member_invitations
7.  events
8.  tasks
9.  vendors
10. budget_categories
11. expenses
12. payments
13. guest_households
14. guest_invitations
15. invitation_history
16. gallery_access
17. photo_albums
18. photos
19. documents
20. email_jobs
21. activity_events
22. audit_logs
```

This collection count is a consequence of WeddingPlaner's V1 requirements, not an arbitrary target.

---

# 78. Database Design Completion Criteria

This database design is ready for API Design because it defines:

- tenant ownership
- identity/session persistence
- membership and RBAC relationship
- event/task/vendor persistence
- category budget structure
- expense/payment relationships
- payment lifecycle and idempotency
- household invitation model
- household RSVP model
- invitation history
- gallery capability access
- album visibility
- photo staging/moderation lifecycle
- document metadata
- email jobs
- Activity Timeline
- Audit Logs
- deletion strategy
- indexing direction
- derived-value rules
- cross-wedding validation
- transaction/idempotency expectations
- trust-boundary data separation

---

# 79. Next Document

Next:

```text
API_DESIGN.md
```

The API Design should define:

- route structure
- request/response contracts
- authentication requirements
- RBAC requirements
- guest capability routes
- public routes
- pagination
- filtering
- validation/error format
- idempotency behavior
- finance mutations
- invitation lifecycle endpoints
- RSVP endpoints
- gallery upload workflow
- photo moderation endpoints
- document access
- activity endpoints
- internal cron/job endpoints

---

# 80. Final Architecture Snapshot

```text
                         ┌─────────────────────┐
                         │        User         │
                         └──────────┬──────────┘
                                    │
                              Membership
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       Wedding       │
                         │ Tenant Boundary     │
                         └──────────┬──────────┘
                                    │
       ┌────────────┬───────────────┼───────────────┬──────────────┐
       │            │               │               │              │
       ▼            ▼               ▼               ▼              ▼
     Event        Task            Vendor     BudgetCategory   GuestHousehold
                                      │             │              │
                                      │             ▼              ▼
                                      └──────────► Expense    GuestInvitation
                                                     │              │
                                                     ▼              ├─ Events
                                                   Payment           ├─ RSVP
                                                                     └─ History

                         Wedding
                            │
                            ├── Embedded Gallery Config
                            ├── GalleryAccess
                            └── PhotoAlbum
                                   │
                                   ▼
                                 Photo
                                   │
                                   ▼
                            Cloudflare R2

                         Wedding
                            │
                            ├── Document ───────────► R2
                            ├── EmailJob
                            ├── ActivityEvent
                            └── AuditLog
```

---

# 81. Status

```text
DATABASE_DESIGN.md
Status: FROZEN FOR V1
```

Any future change that affects collection boundaries, tenant ownership, guest invitation model, finance relationships, gallery security, payment lifecycle, token handling, or deletion rules should update this document before Codex changes the persistence model.
