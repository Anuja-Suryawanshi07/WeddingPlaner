# Product Requirements Document (PRD)

## Wedding Management Platform

**Version:** 1.0  
**Status:** Baseline Feature Scope  
**Document Type:** Product Requirements Document

---

## 1. Product Overview

### Product Concept

A collaborative web application that helps a bride, groom, family members, and organizers plan and manage a wedding in one place.

The platform combines:

- Event planning
- Task management
- Vendor management
- Expense and payment tracking
- Guest management
- Digital invitations
- RSVP and reminders
- Public wedding website
- Live streaming
- Collaborative photo gallery
- Wedding-related document management

### Primary Goal

Replace scattered spreadsheets, notebooks, chats, phone contacts, and individual guest/vendor lists with one shared source of truth for the wedding.

### Important Scope Decision

**Accommodation and Travel management is intentionally excluded from the current scope.**

---

## 2. Problem Statement

Wedding planning involves many events, people, tasks, vendors, payments, guests, and deadlines.

Information is often distributed across:

- WhatsApp conversations
- Spreadsheets
- Notebooks
- Phone contacts
- Cloud folders
- Separate guest and vendor lists

This creates common problems:

- Family members may not know who owns a task.
- Pending work can be difficult to identify.
- Expenses may be tracked inconsistently.
- Vendor payments may be missed.
- Guest lists can become duplicated or inconsistent across events.
- Guests need a simple way to access wedding information and RSVP.
- Guests may want to share photos from the wedding, but there may be no controlled way to collect them.

The system should provide a shared planning workspace for organizers while keeping private planning and financial information separated from public guest-facing information.

---

## 3. Product Goals

1. Create a shared workspace for planning a complete wedding.
2. Give organizers clear visibility into events, tasks, vendors, guests, expenses, and payments.
3. Provide guests with a simple public-facing wedding experience.
4. Enable collaborative guest photo uploads through controlled shareable gallery links.
5. Use role-based access to separate private planning data from public guest-facing content.
6. Build a realistic full-stack portfolio project with strong practical value.

---

## 4. Non-Goals / Excluded from Current Scope

The following are intentionally excluded from the current release:

- Accommodation management
- Travel and transportation management for guests
- Marketplace for discovering or booking vendors
- Online wedding payments / checkout for guests
- AI assistant in the initial core release

These may be considered as future enhancements where appropriate.

---

## 5. Target Users & Roles

| Role | Purpose | Typical Access |
|---|---|---|
| **Wedding Owner / Admin** | Primary person managing the wedding workspace | Full wedding management access |
| **Bride** | Co-manages wedding planning | Planning + guest-facing management as permitted |
| **Groom** | Co-manages wedding planning | Planning + guest-facing management as permitted |
| **Family Member / Organizer** | Handles assigned areas and tasks | Limited management access based on role |
| **Guest** | Consumes wedding information and participates | Public website, RSVP, invitations, gallery upload/view access |

---

## 6. Core Product Concepts

### Wedding

The top-level container for all planning data.

### Event

An individual wedding function such as Haldi, Mehendi, Sangeet, Wedding, Reception, or a custom event.

### Organizer

An authenticated person with a role in managing the wedding.

### Guest

A person invited to one or more wedding events.

### Vendor

A service provider associated with one or more wedding events.

### Task

An actionable planning item assigned to one or more organizers.

### Expense

Money spent against the wedding, event, or vendor.

### Payment

An individual payment made toward an expense or vendor commitment.

### Public Wedding Experience

The guest-facing experience consisting of digital invitations, RSVP, wedding website, live stream, and collaborative photo gallery.

---

## 7. Final Feature Scope

| # | Feature | Purpose |
|---:|---|---|
| 1 | **Auth & Wedding Setup** | Authentication and creation/configuration of a wedding workspace. |
| 2 | **Organizer Management** | Manage bride, groom, family members, coordinators, roles, and permissions. |
| 3 | **Multiple Events** | Create and manage Haldi, Mehendi, Sangeet, Wedding, Reception, and custom events. |
| 4 | **Wedding Dashboard** | Single overview of wedding progress, events, tasks, guests, vendors, expenses, and payments. |
| 5 | **Task Planner** | Create, assign, prioritize, schedule, track, and remind organizers about tasks. |
| 6 | **Vendor Management** | Track wedding service providers, contacts, events, quotations, final amounts, and notes. |
| 7 | **Expense Tracker** | Track budget, expenses, categories, event/vendor linkage, payer, status, and reports. |
| 8 | **Payment Management** | Track advances, partial payments, remaining amounts, dates, and payment status. |
| 9 | **Guest Management** | Maintain guest profiles, relationship/group details, contact information, and attendance data. |
| 10 | **Event-Level Guests** | Control which guests are invited to which individual events. |
| 11 | **Digital Wedding Invitations** | Create and share digital invitations with event information and links. |
| 12 | **RSVP & Reminders** | Collect attendance responses and remind guests who have not responded. |
| 13 | **Wedding Website** | Public wedding website with couple, story, schedule, venue, RSVP, stream, and gallery. |
| 14 | **Live Stream** | Publish a live-stream link for guests who cannot attend in person. |
| 15 | **Collaborative Photo Gallery** | Event-wise photo albums with organizer uploads and guest uploads through shareable links. |
| 16 | **Documents** | Store wedding-related contracts, bills, receipts, booking files, and other documents. |

---

## 8. Detailed Functional Requirements

### 8.1 Auth & Wedding Setup

- Users must be able to register, log in, log out, and manage their session securely.
- An authenticated user can create a wedding workspace with bride/groom names, wedding date, and basic settings.
- A wedding has one primary administration context and can have multiple organizers.
- Users must only see wedding workspaces to which they have access.

### 8.2 Organizer Management

- Admin can add organizers and assign roles.
- Organizer permissions must control access to planning features.
- Organizers can see their assigned responsibilities and relevant wedding data.
- Admin can deactivate or remove organizer access without deleting historical wedding records.

### 8.3 Multiple Events

- Admin or an authorized organizer can create, edit, archive, and view events.
- Each event stores:
  - Name
  - Date
  - Start time
  - End time
  - Venue/address
  - Description
  - Budget
  - Optional notes
- Events can be linked to:
  - Tasks
  - Vendors
  - Expenses
  - Guests
  - Invitations
  - Gallery albums
- Dashboard and public website must be able to display the wedding schedule.

### 8.4 Wedding Dashboard

The dashboard should:

- Display countdown or time-to-wedding.
- Display upcoming events.
- Display urgent or overdue tasks.
- Display guest, vendor, expense, and payment summaries.
- Display budget vs. actual spending.
- Display high-level planning progress.
- Respect user permissions when showing information.

### 8.5 Task Planner

- Create, edit, assign, reassign, complete, and archive tasks.
- Tasks support:
  - Title
  - Description
  - Event
  - Owner/assignee
  - Due date
  - Priority
  - Status
- Task statuses:
  - To Do
  - In Progress
  - Blocked
  - Completed
- Users can filter tasks by:
  - Event
  - Assignee
  - Status
  - Priority
  - Due date
- System can flag overdue tasks and surface them on the dashboard.

### 8.6 Vendor Management

- Store vendor name, category, contact details, address, notes, and service information.
- Associate vendors with one or more events.
- Track quoted amount and final agreed amount.
- Show vendor payment and expense information without duplicating the source of truth.

Example vendor categories:

- Venue
- Caterer
- Decorator
- Florist
- Photographer
- Videographer
- Makeup artist
- Mehendi artist
- DJ / Music
- Invitation designer
- Pandit / ceremony services
- Cake
- Return gifts
- Other wedding services

### 8.7 Expense Tracker

- Create expenses with:
  - Amount
  - Category
  - Date
  - Event
  - Vendor
  - Payer
  - Status
  - Notes
- Support wedding-level and event-level budgets.
- Provide budget vs. actual views and category summaries.
- Allow receipts or supporting documents to be attached where permitted.

Example expense categories:

- Venue
- Decoration
- Food / Catering
- Photography / Videography
- Makeup
- Clothing
- Jewellery
- Invitations
- Travel-related wedding expenses where applicable to the wedding budget
- Gifts
- Miscellaneous

> Note: This does **not** introduce guest travel management into the product. It only allows a generic expense category if the organizers choose to record such a cost.

### 8.8 Payment Management

- Record advance, partial, and final payments.
- Each payment stores:
  - Amount
  - Payment date
  - Payment method/reference where needed
  - Status
- System calculates the remaining payable amount from recorded payments and agreed amount.
- Dashboard surfaces upcoming or outstanding payments.

### 8.9 Guest Management

- Create and maintain guest records with:
  - Name
  - Contact information
  - Family/group
  - Bride/Groom side
  - Relation
  - Guest count
  - Notes
- Search, filter, import, and organize guest records.
- Guest data must remain separate from public wedding information unless explicitly published.

### 8.10 Event-Level Guests

- Guests can be associated with one or multiple events.
- System must provide event-specific invitation and guest counts.
- Organizers can identify guests who are not assigned to a particular event.

Example:

```text
Guest: Rahul Patil

Haldi       -> Invited
Mehendi     -> Not Invited
Wedding     -> Invited
Reception   -> Invited
```

### 8.11 Digital Wedding Invitations

- Create a digital invitation page using wedding/event data.
- Invitation must include:
  - Couple names
  - Event details
  - Venue
  - Date/time
  - RSVP entry point
- Invitation must have a shareable public link.
- Organizer can update invitation presentation/content without changing core wedding records.

### 8.12 RSVP & Reminders

Guests can respond with:

- Accept
- Decline
- Maybe

Optional RSVP fields may include:

- Number attending
- Notes

Organizers can view:

- Confirmed
- Declined
- Maybe
- Pending

The system can generate reminder candidates for pending RSVPs.

RSVP data must update the relevant event-level guest status.

### 8.13 Wedding Website

Provide a public-facing wedding website linked to the wedding workspace.

Possible sections:

- Home
- Bride & Groom
- Our Story
- Events / Schedule
- Venue
- RSVP
- Live Stream
- Photo Gallery

Organizers can control which sections are published.

Private planning data must never be exposed publicly, including:

- Expenses
- Payments
- Organizer-only tasks
- Private guest data
- Private documents
- Other sensitive information

### 8.14 Live Stream

- Organizer can add or update a live-stream URL for an event or the wedding.
- Website displays the live-stream section only when enabled.
- Organizer can hide or remove the link after the event.

### 8.15 Collaborative Photo Gallery

The gallery is a **two-way sharing feature**, not just an organizer-only photo repository.

#### Organizer Capabilities

- Create event-wise albums such as:
  - Haldi
  - Mehendi
  - Sangeet
  - Wedding
  - Reception
- Upload photos.
- Manage uploaded photos.
- Approve or reject guest submissions.
- Delete or hide uploads.
- Configure gallery visibility.

#### Guest Capabilities

Guests can receive a shareable gallery link and:

- View permitted gallery content.
- Select an allowed event album.
- Upload their own photos.
- Optionally provide their name as the contributor.

#### Guest Upload Workflow

```text
Guest receives secure gallery link
        ↓
Opens gallery
        ↓
Selects event album
        ↓
Selects photos
        ↓
Uploads photos
        ↓
Pending Review (optional)
        ↓
Organizer approves
        ↓
Photos become visible in gallery
```

#### Gallery Controls

- Public/private gallery settings.
- View/download permissions.
- Secure upload access.
- Private storage credentials must never be exposed to guests.

### 8.16 Documents

- Organizers can upload and organize wedding-related files.
- Documents can be associated with:
  - Wedding
  - Vendor
  - Event
  - Expense
- Access to private documents must follow organizer permissions.
- File metadata should include:
  - Name
  - Type
  - Upload date
  - Uploader

---

## 9. Key User Workflows

### 9.1 Wedding Setup Workflow

```text
Register / Login
      ↓
Create Wedding
      ↓
Add Bride/Groom Details
      ↓
Add Wedding Date
      ↓
Add First Organizers
      ↓
Create Events
      ↓
Open Dashboard
```

### 9.2 Event Planning Workflow

```text
Create Event
      ↓
Set Date / Time / Venue
      ↓
Add Event-Specific Guests
      ↓
Assign Vendors
      ↓
Create Tasks
      ↓
Add Event Budget / Expenses
      ↓
Track Completion
```

### 9.3 Guest Invitation & RSVP Workflow

```text
Add Guest
      ↓
Assign Event(s)
      ↓
Publish Invitation / Website
      ↓
Guest Opens Link
      ↓
Guest RSVPs
      ↓
Organizer Views Response
      ↓
Reminder for Pending RSVP
```

### 9.4 Collaborative Photo Workflow

```text
Organizer creates event album
      ↓
Guest receives secure gallery link
      ↓
Guest selects event
      ↓
Guest uploads photos
      ↓
Photos enter review/publication flow
      ↓
Organizer approves
      ↓
Photos become visible to gallery viewers
```

---

## 10. Access & Privacy Model

| Area | Organizer | Guest |
|---|---|---|
| Planning dashboard | Allowed according to role | No |
| Tasks | Allowed according to role | No |
| Expenses & payments | Allowed according to role | No |
| Private guest list | Allowed according to role | No |
| Wedding website | Publish/manage | View |
| Digital invitation | Create/manage | View |
| RSVP | View/manage | Submit |
| Photo gallery | Manage/approve | View + upload where enabled |
| Private documents | Allowed according to role | No |

### Privacy Principles

1. Public links must expose only intentionally published content.
2. Private planning and financial data must remain behind authenticated authorization.
3. Guest uploads must not provide direct access to private cloud storage credentials.
4. Organizer permissions must be enforced at the API level, not only in the frontend.
5. Removing an organizer's access must not remove historical wedding records unless explicitly intended.

---

## 11. Non-Functional Requirements

### Security

- Password hashing
- Authenticated APIs
- Authorization checks
- Secure session/token handling
- Protected file upload flows
- Server-side validation

### Privacy

Financial data, organizer tasks, private guest data, and private documents must never be exposed through public wedding links.

### Usability

- Responsive design for desktop and mobile.
- Guest flows should work well on mobile browsers.
- Common actions should require minimal steps.

### Performance

- Dashboard and common list views should load efficiently.
- Use pagination/filtering for larger weddings.
- Avoid loading unnecessary media in list views.

### Reliability

- Important financial and guest records should be persisted transactionally.
- The system should protect important data against accidental loss.

### Auditability

Where practical, record creator/updater identity and timestamps for sensitive planning records.

### Scalability

Media storage should be separated from application/database storage as the photo gallery grows.

---

## 12. Delivery Strategy

### Phase 1 - Core MVP

- Auth & Wedding Setup
- Organizer Management
- Multiple Events
- Wedding Dashboard
- Task Planner
- Vendor Management
- Expense Tracker
- Guest Management
- Event-Level Guests

### Phase 2 - Guest Experience & Finance

- Payment Management
- Digital Wedding Invitations
- RSVP & Reminders
- Wedding Website
- Documents

### Phase 3 - Media & Real-time Experience

- Live Stream
- Collaborative Photo Gallery

---

## 13. Success Criteria

The product should satisfy the following outcomes:

1. A family can create one wedding workspace and manage all planned events without maintaining separate planning spreadsheets.
2. Authorized organizers can identify their tasks, deadlines, vendors, guests, and financial responsibilities from the application.
3. Organizers can see wedding-level and event-level guest counts and RSVP status.
4. Budget and payment information is traceable to the relevant event and/or vendor.
5. Guests can access the public wedding experience through shareable links and complete RSVP without accessing private planning data.
6. Guests can contribute photos through a controlled collaborative gallery workflow.
7. The application is usable on both desktop and mobile browsers.

---

## 14. Decisions to Finalize Before Design / Development

The following design decisions should be finalized before implementation:

### Authentication

- Registration method
- Login method
- Token/session strategy
- Password reset flow

### Roles & Permissions

- Exact organizer roles
- Permission matrix per role
- Whether bride and groom are separate fixed roles or configurable organizer roles

### Guest Access

- Whether RSVP requires guest identity verification
- Whether a public invitation link is unique per guest or generic per wedding/event
- Whether a guest can update an RSVP after submitting it

### Gallery

- Maximum upload size
- Allowed file types
- Photo count limits
- Whether videos are supported in the first release
- Whether guest uploads require approval
- Whether upload links expire

### Notifications

- In-app only initially or email as well
- Reminder timing rules

### Documents

- Allowed file types
- File size limits
- Retention rules

### Public Wedding Website

- Custom URL/slug format
- Which sections are enabled by default
- Whether the website requires a password/private mode

---

## 15. Key Risks & Considerations

### Public Link Privacy

Public invitation, RSVP, website, stream, and gallery links must not accidentally expose private wedding planning or financial data.

### Guest-Uploaded Media

Guest-uploaded media needs moderation and storage limits to avoid abuse and unexpected costs.

### Media Performance and Cost

Large media files can impact performance and storage costs. Uploads should be size- and type-constrained.

### Guest/Event Data Consistency

RSVP and guest data can become inconsistent if one guest appears across multiple events. Event-level relationships should therefore be modeled explicitly.

### Financial Accuracy

Money calculations should use precise numeric/decimal handling and clear rounding rules.

### Authorization

Access control must be enforced on the backend/API, not only through frontend route guards or UI visibility.

---

## 16. Future Enhancements (Not in Current Scope)

Potential future features include:

- AI wedding planning assistant
- Automated checklist generation based on wedding date
- Calendar integration
- WhatsApp/SMS messaging integration
- Advanced analytics and downloadable reports
- Seating planner
- QR-code based event check-in
- Multi-language wedding website/invitations

---

# Appendix A - Planned Technical Direction

The technical direction is intentionally aligned with the existing project skills and is subject to change during architecture/design.

| Area | Planned Direction |
|---|---|
| Database | Relational database; MySQL is the planned choice based on project fit and existing skills. |
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express.js REST API |
| Authentication | JWT-based authenticated API with role-based authorization |
| Media Storage | Cloud object storage such as AWS S3 for gallery/documents in a later implementation phase |
| Guest Access | Public/shareable links separated from organizer dashboard access |
| Guest Photo Uploads | Controlled upload link, event selection, optional contributor name, and moderation workflow |
| AI | Not part of the initial core release; potential future enhancement |

---

## Appendix B - High-Level Domain Model

```text
Wedding
│
├── Organizers / Users
│
├── Events
│   ├── Tasks
│   ├── Guests
│   ├── Vendors
│   ├── Expenses
│   ├── Invitations
│   └── Gallery Albums
│
├── Guests
├── Vendors
├── Tasks
├── Expenses
├── Payments
├── Invitations
├── RSVP Records
├── Wedding Website
├── Live Stream Links
├── Gallery / Media
└── Documents
```

---

## Appendix C - Current Scope Boundary

### Included

- Wedding planning
- Multiple events
- Organizer collaboration
- Tasks
- Vendors
- Expenses
- Payments
- Guests
- Event-level guest assignment
- Digital invitations
- RSVP and reminders
- Wedding website
- Live stream
- Collaborative photo gallery
- Documents

### Explicitly Excluded

- Accommodation management
- Guest travel/transport management
- Vendor marketplace/booking platform
- Guest online payment/checkout
- AI assistant in the initial core release

---

**End of PRD — Version 1.0**
