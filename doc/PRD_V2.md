# Product Requirements Document (PRD) V2

## Wedding Management Platform

**Version:** 2.0\
**Status:** Product Scope Approved for Architecture Planning\
**Document Type:** Product Requirements Document\
**Updated:** 26 September 2026\
**Repository:** `Anuja-Suryawanshi07/WeddingPlaner`

------------------------------------------------------------------------

## 1. Document Purpose

This PRD V2 defines the product scope, functional requirements, user
roles, workflows, privacy requirements, non-functional requirements,
technical direction, release strategy, edge cases, and success criteria
for the Wedding Management Platform.

V2 builds on the original Wedding Management Platform PRD and
incorporates the additional product decisions discussed during planning.

The product is intended to be a realistic full-stack portfolio
application and an AI-native software engineering project.

The initial core product does **not** require AI functionality.
AI-assisted development is part of the engineering methodology; AI
product features remain future enhancements.

------------------------------------------------------------------------

# 2. Product Vision

The Wedding Management Platform is a collaborative web application that
gives a couple and their trusted organizers one shared workspace for
planning and managing a wedding.

The platform brings together:

-   Wedding setup
-   Organizers and permissions
-   Multiple wedding events
-   Dashboard and action tracking
-   Task management
-   Vendor management
-   Vendor discovery
-   Budgets and expenses
-   Payment tracking
-   Guests and households
-   Event-level guest assignment
-   Digital invitations
-   Email invitations
-   WhatsApp sharing
-   RSVP and reminders
-   Public wedding website
-   Predefined website themes
-   Live-stream links
-   Collaborative photo gallery
-   QR-based gallery access
-   Wedding documents
-   Activity timeline

### Core Principle

> One wedding, one organized workspace, one source of truth.

------------------------------------------------------------------------

# 3. Problem Statement

Wedding planning commonly involves many people, events, vendors, guests,
payments, documents, invitations, and photographs.

Information can become fragmented across:

-   WhatsApp
-   Spreadsheets
-   Notebooks
-   Phone contacts
-   Email
-   Cloud folders
-   Separate invitation tools
-   Photo-sharing applications

This creates problems such as:

-   Unclear task ownership
-   Missed deadlines
-   Duplicate guest records
-   Difficulty tracking event-specific guests
-   Unclear vendor commitments
-   Incomplete payment records
-   Difficulty tracking outstanding amounts
-   Invitation and RSVP confusion
-   Private planning information being shared unintentionally
-   Guest photos being collected through uncontrolled channels
-   Difficulty understanding the current state of wedding planning

The platform should provide a structured alternative without becoming a
marketplace, travel platform, payment processor, or general-purpose
wedding social network.

------------------------------------------------------------------------

# 4. Product Goals

## 4.1 Primary Goals

1.  Provide a shared wedding planning workspace.
2.  Allow authorized organizers to collaborate according to their
    permissions.
3.  Support multiple wedding events within one wedding.
4.  Provide clear visibility into tasks, guests, vendors, expenses,
    payments, and upcoming activities.
5.  Make guest invitations and RSVP simple.
6.  Provide a guest-friendly public wedding experience.
7.  Support controlled collaborative photo collection.
8.  Protect private wedding information through server-side
    authorization.
9.  Provide a realistic full-stack portfolio project.
10. Demonstrate AI-native software engineering practices.

## 4.2 Experience Goals

The product should be:

-   Simple enough for parents and non-technical family members
-   Mobile-friendly for guests
-   Structured enough for organizers
-   Clear about what is public and private
-   Responsive and predictable
-   Safe when public links are shared
-   Suitable for large Indian wedding guest lists

------------------------------------------------------------------------

# 5. Non-Goals

The following are outside the initial product scope:

1.  Accommodation management.
2.  Guest travel or transportation management.
3.  Vendor marketplace.
4.  Vendor booking marketplace.
5.  Vendor payment processing.
6.  Guest online payment or checkout.
7.  Native live video streaming.
8.  Custom website builder.
9.  Custom domains.
10. Full WhatsApp Business/API integration.
11. SMS gateway integration.
12. Real-time collaborative editing.
13. Push notification infrastructure.
14. Multiple independent weddings per user in the initial release.
15. AI wedding assistant in the initial core release.
16. AI document processing in the initial core release.
17. AI-powered analytics in the initial core release.
18. Native video management for the gallery in the initial release.
19. Complex seating-plan management.
20. QR-based physical event check-in.

------------------------------------------------------------------------

# 6. Product Scope V2

  -----------------------------------------------------------------------
  \#                      Product Area            Scope
  ----------------------- ----------------------- -----------------------
  1                       Authentication &        Registration, login,
                          Wedding Setup           wedding creation

  2                       Members, Organizers &   Workspace membership
                          RBAC                    and permissions

  3                       Multiple Events         Event planning and
                                                  event-specific records

  4                       Dashboard & Action      Planning overview and
                          Center                  priorities

  5                       Task Planner            Ownership, status and
                                                  deadlines

  6                       Vendor Management       Vendor records and
                                                  event association

  7                       Vendor Discovery        Discover and add
                                                  potential vendors

  8                       Budget & Expense        Budgets and expenses
                          Management              

  9                       Payment Management      Advance, partial and
                                                  final payment records

  10                      Guest & Household       Guest records and
                          Management              invitation groups

  11                      Event-Level Guests      Assign guests to one or
                                                  more events

  12                      Digital Invitations     Secure shareable
                                                  invitation experience

  13                      Email & WhatsApp        Email delivery and
                          Sharing                 convenient sharing

  14                      RSVP & Reminders        Guest responses and
                                                  follow-up

  15                      Wedding Website         Public wedding
                                                  information

  16                      Website Themes          Predefined presentation
                                                  themes

  17                      Live Stream             External live-stream
                                                  link

  18                      Collaborative Photo     Controlled
                          Gallery                 organizer/guest uploads

  19                      QR Gallery Access       QR-based gallery entry

  20                      Documents               Private wedding
                                                  documents

  21                      Activity Timeline       Important workspace
                                                  activity
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 7. Users and Roles

## 7.1 Wedding Owner / Admin

The primary owner of the wedding workspace.

Capabilities may include:

-   Create and configure the wedding
-   Manage members
-   Manage permissions
-   Manage events
-   Manage guests
-   Manage vendors
-   Manage financial records
-   Manage invitations
-   Publish or unpublish public experiences
-   Manage gallery settings
-   Manage documents
-   Review activity

## 7.2 Organizer

A trusted member of the planning team.

Organizer access is controlled through the RBAC capability matrix.

An organizer may receive access to:

-   Events
-   Tasks
-   Guests
-   Vendors
-   Expenses
-   Payments
-   Documents
-   Gallery moderation
-   Invitations

## 7.3 Guest

Guests do not need a full application account for the primary guest
experience.

Guest access may be provided through:

-   Secure invitation links
-   RSVP links
-   Gallery links
-   Public wedding website

Guest capabilities may include:

-   View invitation
-   RSVP
-   Update RSVP where permitted
-   View permitted gallery content
-   Upload photos through an authorized gallery link

------------------------------------------------------------------------

# 8. Bride and Groom Representation

Bride and Groom are wedding participants, not separate authorization
roles.

The Wedding record should contain the couple information required by:

-   Dashboard
-   Invitations
-   Public website
-   Event presentation
-   RSVP experience
-   Gallery presentation

This keeps the permission model simple while preserving the wedding
domain model.

------------------------------------------------------------------------

# 9. Core Domain Concepts

The primary domain concepts are:

-   User
-   Wedding
-   Wedding Membership
-   Role
-   Permission / Capability
-   Bride/Groom Profile
-   Event
-   Task
-   Vendor
-   Vendor Discovery Result
-   Budget
-   Expense
-   Payment
-   Guest
-   Household / Invitation Group
-   Event Guest Assignment
-   Invitation
-   Guest Invitation Token
-   RSVP
-   Reminder
-   Wedding Website
-   Website Theme
-   Live Stream
-   Gallery
-   Gallery Album
-   Gallery Access Token
-   Media Asset
-   Document
-   Activity Timeline Entry

------------------------------------------------------------------------

# 10. Feature Requirements

## 10.1 Authentication & Wedding Setup

### Objective

Allow a user to securely create and access a wedding workspace.

### Functional Requirements

The system shall support:

1.  User registration.
2.  Secure login.
3.  Logout.
4.  Secure authenticated sessions.
5.  Password hashing using Argon2.
6.  Password reset through email.
7.  Wedding creation.
8.  Bride name.
9.  Groom name.
10. Wedding date.
11. Wedding settings.
12. Primary Wedding Owner/Admin.
13. Initial organizer setup.
14. Workspace access restrictions.

### Security Requirements

-   Passwords must never be stored in plaintext.
-   Authentication must not depend only on frontend state.
-   Protected data must be checked server-side.
-   Invalid authentication attempts must fail safely.
-   Authentication secrets must never be exposed to the client.

------------------------------------------------------------------------

## 10.2 Member and Organizer Management

The Wedding Owner/Admin can:

-   Add organizers
-   Assign permissions
-   Change permissions
-   Deactivate access
-   Restore access where appropriate
-   Remove membership without deleting historical records
-   View current members
-   Identify the Wedding Owner/Admin

Authorization must be enforced on the server.

Frontend controls may hide unavailable actions but are not the security
boundary.

------------------------------------------------------------------------

## 10.3 Role-Based Access Control

The permission model should use capabilities rather than relying only on
broad role names.

Example capability areas:

-   Wedding settings
-   Members
-   Events
-   Tasks
-   Vendors
-   Guests
-   Expenses
-   Payments
-   Invitations
-   RSVP
-   Website publishing
-   Gallery
-   Documents
-   Activity timeline

The detailed capability matrix will be finalized in the architecture
specification.

------------------------------------------------------------------------

## 10.4 Multiple Events

### Objective

Represent a wedding as a collection of related events.

Examples:

-   Engagement
-   Haldi
-   Mehendi
-   Sangeet
-   Wedding
-   Reception
-   Custom event

### Event Fields

An event may contain:

-   Name
-   Event type
-   Date
-   Start time
-   End time
-   Venue
-   Address
-   Description
-   Dress code
-   Notes
-   Budget
-   Cover image where supported
-   Status
-   Created timestamp
-   Updated timestamp

### Event Relationships

An event may be linked to:

-   Guests
-   Tasks
-   Vendors
-   Expenses
-   Invitations
-   RSVP information
-   Gallery albums
-   Website presentation
-   Live-stream information

The system shall support:

-   Create event
-   Edit event
-   Archive event
-   Restore event where appropriate
-   View event details
-   Associate related records
-   Publish event information selectively

------------------------------------------------------------------------

## 10.5 Dashboard & Action Center

### Objective

Provide a planning overview and identify actions that require attention.

The dashboard should display:

-   Wedding countdown
-   Upcoming events
-   Urgent tasks
-   Overdue tasks
-   Tasks assigned to the current user
-   Planning progress
-   Guest summary
-   Vendor summary
-   Expense summary
-   Outstanding payments
-   Budget versus actual
-   Recent activity
-   Important incomplete actions

### Action Center

The dashboard should prioritize actions rather than only display
statistics.

Examples:

-   RSVP awaiting follow-up
-   Overdue task
-   Outstanding vendor payment
-   Event missing venue
-   Invitation not sent
-   Guest without event assignment
-   Gallery submissions awaiting review

The dashboard must respect RBAC.

------------------------------------------------------------------------

## 10.6 Task Planner

### Task Fields

-   Title
-   Description
-   Wedding
-   Event
-   Assignee
-   Due date
-   Priority
-   Status
-   Created by
-   Updated by
-   Created timestamp
-   Updated timestamp

### Statuses

-   To Do
-   In Progress
-   Blocked
-   Completed

### Requirements

The system shall support:

-   Create task
-   Edit task
-   Assign task
-   Reassign task
-   Change status
-   Mark complete
-   Archive task
-   Filter by event
-   Filter by assignee
-   Filter by status
-   Filter by priority
-   Filter by due date
-   Identify overdue tasks

------------------------------------------------------------------------

## 10.7 Vendor Management

### Vendor Fields

-   Name
-   Category
-   Contact person
-   Phone
-   Email
-   Address
-   Service description
-   Notes
-   Associated events
-   Quoted amount
-   Agreed/final amount
-   Payment summary
-   Related expenses
-   Status
-   Timestamps

### Vendor Categories

Examples:

-   Venue
-   Catering
-   Decor
-   Photography
-   Videography
-   Makeup
-   Mehendi
-   Music
-   DJ
-   Entertainment
-   Invitation
-   Clothing
-   Jewellery
-   Transportation
-   Priest/Pandit
-   Florist
-   Cake
-   Other

The category system must remain extensible.

------------------------------------------------------------------------

## 10.8 Vendor Discovery

### Objective

Help organizers discover potential vendors without creating a
marketplace.

Users should be able to:

-   Search by vendor category
-   Search by location
-   View available business information
-   Shortlist a vendor
-   Add a discovered vendor to the private vendor list

### Scope Boundary

Vendor discovery does not include:

-   Vendor booking
-   Vendor payment processing
-   Marketplace checkout
-   Vendor contracts
-   Vendor-side accounts
-   Marketplace commissions

The external discovery provider will be selected during architecture
planning.

------------------------------------------------------------------------

## 10.9 Budget & Expense Management

### Objective

Track wedding spending and compare actual spending with planned amounts.

### Budget Scope

The platform supports:

-   Wedding-level budget
-   Event-level budget
-   Category-level planning
-   Actual expense tracking
-   Budget versus actual comparison

### Expense Fields

-   Amount
-   Category
-   Date
-   Event
-   Vendor
-   Payer
-   Status
-   Notes
-   Receipt/document reference
-   Created by
-   Updated by
-   Timestamps

### Expense Categories

Examples:

-   Venue
-   Catering
-   Decor
-   Photography
-   Videography
-   Makeup
-   Clothing
-   Jewellery
-   Invitations
-   Music
-   Transportation
-   Gifts
-   Miscellaneous
-   Other

### Financial Rules

-   Monetary values must be handled with appropriate decimal precision.
-   Initial currency is INR.
-   Financial records are private.
-   Public pages must never expose financial information.
-   Multi-document financial operations should use MongoDB transactions
    where atomicity is required.

------------------------------------------------------------------------

## 10.10 Payment Management

Payment tracking is record-keeping, not payment processing.

### Payment Types

-   Advance
-   Partial
-   Final

### Payment Fields

-   Amount
-   Date
-   Payment method
-   Reference
-   Status
-   Vendor
-   Event where applicable
-   Notes
-   Created by
-   Timestamp

### Calculation

`Remaining Payable = Agreed Amount - Recorded Payments`

The dashboard should identify outstanding vendor payments.

### Out of Scope

The platform does not process:

-   Credit/debit card payments
-   UPI checkout
-   Guest payments
-   Vendor marketplace payments
-   Online payment gateway settlement

------------------------------------------------------------------------

## 10.11 Guest & Household Management

### Guest Fields

-   Name
-   Phone
-   Email
-   Family/group
-   Household/invitation group
-   Bride/groom side
-   Relationship
-   Guest count
-   Notes
-   Status
-   Timestamps

### Requirements

The system shall support:

-   Create guest
-   Edit guest
-   Search guest
-   Filter guest
-   Organize guests into groups
-   Assign guests to households/invitation groups
-   Import guests where supported
-   Identify incomplete guest information
-   Keep guest planning data private

------------------------------------------------------------------------

## 10.12 Household / Invitation Group

A guest may belong to a household or invitation group.

An invitation may represent:

-   An individual
-   A couple
-   A family
-   A household

The platform should preserve individual guest information while allowing
invitation-level RSVP handling.

An invitation may have a configured maximum attendee capacity.

------------------------------------------------------------------------

## 10.13 Event-Level Guest Assignment

A guest may be invited to one or multiple events.

Example:

``` text
Rahul Patil
 ├── Wedding
 ├── Reception
 └── Sangeet
```

The system shall support:

-   Assign guest to event
-   Remove guest from event
-   View event guest list
-   Identify unassigned guests
-   Event-specific invitation context
-   Event-specific RSVP status
-   Event-specific attendance count

------------------------------------------------------------------------

## 10.14 Digital Invitations

### Objective

Provide a dedicated guest-facing invitation experience.

An invitation may contain:

-   Couple names
-   Wedding information
-   Event information
-   Venue
-   Date
-   Time
-   RSVP action
-   Public website link
-   Gallery link where applicable

Invitation presentation must be separated from core wedding data.

Changing presentation must not change the underlying event or wedding
records.

Guests should not need a full application account for the normal
invitation/RSVP flow.

------------------------------------------------------------------------

## 10.15 Secure Guest Invitation Tokens

Invitation tokens are security-sensitive.

Requirements:

1.  Tokens must be unpredictable.
2.  Tokens must not contain personally identifiable information.
3.  Token storage must follow the security architecture.
4.  Tokens must map to the correct invitation context.
5.  Invalid tokens must not reveal private information.
6.  Revoked or expired tokens must stop working.
7.  Token manipulation must not expose unrelated wedding records.
8.  Public invitation endpoints should be rate-limited.
9.  Only intentionally published information may be displayed.

------------------------------------------------------------------------

## 10.16 Email Invitations

The product will use **Resend** for transactional email.

The system shall support:

-   Send invitation email
-   Resend invitation
-   Track useful invitation-send state
-   Generate secure invitation links
-   Maintain reusable email templates
-   Keep email delivery logic separate from business-domain logic

------------------------------------------------------------------------

## 10.17 WhatsApp Sharing

The initial implementation should use a share/prefilled-message
mechanism rather than WhatsApp Business API integration.

Users may share:

-   Invitation link
-   RSVP link
-   Public wedding website
-   Gallery link

The generated message should be clear and user-friendly.

WhatsApp Business API automation is deferred.

------------------------------------------------------------------------

## 10.18 RSVP

### RSVP Options

-   Accept / Yes
-   Decline / No
-   Maybe

Where applicable, guests may provide:

-   Number attending
-   Notes
-   Optional guest information

### Requirements

The system shall:

-   Associate RSVP with the correct invitation
-   Associate RSVP with the correct event
-   Enforce maximum attendee limits where configured
-   Allow organizer viewing of response status
-   Allow guest updates through the same secure link where permitted
-   Maintain timestamps
-   Identify pending responses

### Organizer Views

-   Confirmed
-   Declined
-   Maybe
-   Pending
-   Expected attendee count

------------------------------------------------------------------------

## 10.19 RSVP Reminders

The system should identify guests who have not responded.

Initial reminder delivery should focus on supported email functionality.

Deferred:

-   WhatsApp API reminders
-   SMS reminders
-   Push notification reminders

------------------------------------------------------------------------

## 10.20 Public Wedding Website

### Sections

Possible sections include:

-   Home
-   Bride
-   Groom
-   Story
-   Events
-   Venue
-   RSVP
-   Live Stream
-   Gallery

Organizers should control which sections are published.

### Privacy

The public website must never expose:

-   Expenses
-   Payments
-   Private tasks
-   Private guest data
-   Organizer-only notes
-   Private documents
-   Private vendor information
-   Authentication data
-   Storage credentials
-   Sensitive internal identifiers

------------------------------------------------------------------------

## 10.21 Website Themes

The platform should provide predefined website themes.

A theme may control:

-   Typography
-   Layout
-   Spacing
-   Visual hierarchy
-   Section presentation
-   Invitation/website styling

### Out of Scope

-   Drag-and-drop builder
-   Arbitrary CSS editor
-   Custom domain configuration
-   Fully custom page builder

Content should remain separate from presentation so themes can change
without rewriting wedding data.

------------------------------------------------------------------------

## 10.22 Live Stream

The platform stores and presents an external live-stream URL.

Examples may include YouTube Live or another supported external
streaming page.

Requirements:

-   Organizer can add URL
-   Organizer can update URL
-   Organizer can enable/disable display
-   Public website can display the link/embed when enabled
-   Live-stream section can be hidden after the event

The platform does not provide native streaming infrastructure.

------------------------------------------------------------------------

## 10.23 Collaborative Photo Gallery

### Organizer Capabilities

Organizers can:

-   Create albums
-   Associate albums with events
-   Upload photos
-   Manage photos
-   Approve guest submissions
-   Reject submissions
-   Hide photos
-   Delete photos
-   Control visibility
-   Control download permissions

### Guest Capabilities

Guests can:

-   Open a secure gallery link
-   Select an event album
-   View permitted photos
-   Upload photos
-   Optionally provide contributor name
-   View approved content

### Upload Workflow

``` text
Secure Gallery Link
       ↓
Gallery
       ↓
Select Event Album
       ↓
Select Photos
       ↓
Validate Upload
       ↓
Secure Object Storage
       ↓
Pending Review (when enabled)
       ↓
Organizer Approval
       ↓
Visible Photo
```

------------------------------------------------------------------------

## 10.24 Gallery Security

Requirements:

-   Storage credentials must never be exposed to the browser.
-   Storage must not be unrestricted public access.
-   Uploads must be validated server-side.
-   File types must be restricted.
-   File sizes must be restricted.
-   Upload counts/rates must be controlled.
-   Gallery tokens must be unpredictable where token access is used.
-   Object-level authorization must be enforced.
-   Object keys should not expose sensitive information.
-   Downloads must respect gallery permissions.
-   Rejected/deleted media must not remain accidentally accessible.
-   Public upload endpoints must be protected against abuse.

Object storage will be accessed through the AWS S3 SDK.

The final provider may be AWS S3 or another S3-compatible service.

------------------------------------------------------------------------

## 10.25 QR Gallery Access

The platform should generate a QR code for the wedding gallery.

Use cases:

-   Wedding table signage
-   Printed cards
-   Digital sharing
-   Event displays

The QR code should resolve to a stable gallery entry point.

It must not expose:

-   Storage credentials
-   Database credentials
-   Internal database identifiers

Gallery access must continue to respect the current gallery security
settings.

------------------------------------------------------------------------

## 10.26 Gallery Albums

Albums should support event-based organization.

Examples:

-   Haldi
-   Mehendi
-   Sangeet
-   Wedding
-   Reception
-   Other

The organizer can control whether an album is:

-   Visible
-   Private
-   Accepting uploads
-   Allowing downloads

------------------------------------------------------------------------

## 10.27 Documents

### Objective

Provide a private location for wedding-related documents.

Documents may be associated with:

-   Wedding
-   Event
-   Vendor
-   Expense

Metadata should include:

-   File name
-   File type
-   Upload date
-   Uploader
-   Association
-   Visibility/permission context

Documents remain private unless explicitly exposed through a controlled
feature.

------------------------------------------------------------------------

## 10.28 Activity Timeline

### Objective

Provide a human-readable history of important workspace actions.

Examples:

-   Wedding created
-   Event created
-   Event updated
-   Organizer added
-   Permission changed
-   Task assigned
-   Task completed
-   Vendor added
-   Expense recorded
-   Payment recorded
-   Invitation sent
-   RSVP received
-   Gallery photo approved
-   Document uploaded

Each activity entry should contain, where applicable:

-   Actor
-   Action
-   Affected entity
-   Timestamp
-   Relevant context

The Activity Timeline is not a replacement for detailed security/audit
logs.

------------------------------------------------------------------------

# 11. Cross-Feature Privacy Model

The application has three information zones.

## 11.1 Private Workspace

Examples:

-   Tasks
-   Private guest data
-   Expenses
-   Payments
-   Private vendor information
-   Documents
-   Organizer information
-   Activity information

Requires authenticated authorization.

## 11.2 Controlled Guest Experience

Examples:

-   Invitation
-   RSVP
-   Gallery
-   Selected event information

Access is provided through secure guest links and explicit publication
settings.

## 11.3 Public Experience

Examples:

-   Public wedding website
-   Published event details
-   Intentionally published gallery content
-   Enabled live-stream information

Only intentionally published information may be exposed.

------------------------------------------------------------------------

# 12. Access and Privacy Matrix

  ------------------------------------------------------------------------------
  Area           Admin          Organizer          Guest          Public
  -------------- -------------- ------------------ -------------- --------------
  Wedding        Full           Permission-based   No             Published
  settings                                                        subset

  Members        Full           Permission-based   No             No

  Events         Full           Permission-based   Published      Published
                                                   subset         subset

  Tasks          Full           Permission-based   No             No

  Vendors        Full           Permission-based   No             No

  Expenses       Full           Permission-based   No             No

  Payments       Full           Permission-based   No             No

  Private guest  Full           Permission-based   Own invitation No
  records                                          context        

  Invitation     Full           Permission-based   Own invitation Published

  RSVP           Full           Permission-based   Own RSVP       Controlled

  Website        Full           Permission-based   View           View

  Live stream    Full           Permission-based   View if        View if
                                                   published      published

  Gallery        Full           Permission-based   Controlled     Published only

  Documents      Full           Permission-based   No             No

  Activity       Full           Permission-based   No             No
  timeline                                                        
  ------------------------------------------------------------------------------

------------------------------------------------------------------------

# 13. Key User Workflows

## 13.1 Wedding Setup

1.  User registers.
2.  User logs in.
3.  User creates wedding.
4.  User enters bride/groom information.
5.  User enters wedding date.
6.  User configures settings.
7.  User becomes Wedding Owner/Admin.
8.  User adds organizers.
9.  User creates initial events.
10. User reaches dashboard/action center.

## 13.2 Organizer Setup

1.  Admin opens member management.
2.  Admin adds organizer.
3.  Organizer receives access/invitation.
4.  Organizer joins workspace.
5.  Admin assigns capabilities.
6.  Organizer sees authorized areas.
7.  Organizer begins assigned planning work.

## 13.3 Event Planning

1.  Organizer creates event.
2.  Organizer enters date/time/venue.
3.  Organizer assigns guests.
4.  Organizer associates vendors.
5.  Organizer creates tasks.
6.  Organizer records event budget.
7.  Organizer records expenses.
8.  Organizer records payments.
9.  Organizer reviews event status.

## 13.4 Guest Planning

1.  Organizer creates guest.
2.  Guest is assigned to household/invitation group.
3.  Guest is assigned to one or more events.
4.  Invitation is generated.
5.  Secure invitation token is created.
6.  Invitation is sent by email or shared through WhatsApp.
7.  Guest opens invitation.
8.  Guest submits RSVP.
9.  Organizer sees response.
10. Organizer follows up with pending guests.

## 13.5 Vendor Discovery

1.  Organizer opens vendor discovery.
2.  Organizer selects category/location.
3.  System requests results from selected provider.
4.  Organizer reviews results.
5.  Organizer selects vendor.
6.  Vendor is added to private vendor records.
7.  Organizer adds event/financial details.

## 13.6 Budget and Payment Tracking

1.  Organizer creates budget.
2.  Organizer records agreed vendor amount.
3.  Organizer records expense.
4.  Organizer records payment.
5.  System updates outstanding amount.
6.  Dashboard reflects financial state.
7.  Activity timeline records important actions.

## 13.7 Collaborative Gallery

1.  Organizer creates gallery.
2.  Organizer creates event albums.
3.  System provides gallery link/QR.
4.  Guest opens gallery.
5.  Guest selects event.
6.  Guest uploads photos.
7.  System validates upload.
8.  Photo is stored securely.
9.  Photo enters moderation if enabled.
10. Organizer approves/rejects.
11. Approved photo becomes visible according to settings.

## 13.8 Public Website

1.  Organizer configures website.
2.  Organizer selects theme.
3.  Organizer selects sections.
4.  Organizer reviews published information.
5.  Organizer publishes website.
6.  Public visitor views permitted information.
7.  Organizer can update or unpublish sections.

------------------------------------------------------------------------

# 14. Indian Wedding UX Requirements

The initial product should support common Indian wedding planning
patterns without making the system culturally inflexible.

Consider:

-   Multiple events
-   Large guest lists
-   Family/group organization
-   Bride-side and groom-side grouping
-   Event-specific guest invitations
-   INR currency
-   WhatsApp-friendly sharing
-   Mobile-first guest usage
-   Haldi
-   Mehendi
-   Sangeet
-   Wedding
-   Reception
-   Custom events

------------------------------------------------------------------------

# 15. Parent-Friendly UX Principle

The product should be usable by family members who may not be highly
technical.

UX principles:

1.  Use clear labels.
2.  Avoid unnecessary technical terminology.
3.  Keep important actions visible.
4.  Keep forms understandable.
5.  Minimize steps.
6.  Provide clear success/error feedback.
7.  Make destructive actions explicit.
8.  Use readable typography.
9.  Keep guest flows mobile-friendly.
10. Avoid unnecessary account creation for guests.

------------------------------------------------------------------------

# 16. Mobile-First Guest Experience

Priority guest flows:

-   Open invitation
-   View event details
-   RSVP
-   Update RSVP
-   Open gallery
-   Upload photo
-   Scan/open QR gallery
-   View public website
-   Open live-stream link

The organizer workspace should be responsive, while guest-facing flows
receive mobile-first priority.

------------------------------------------------------------------------

# 17. Communication and Notifications

## Initial Scope

Supported:

-   Email invitations
-   Email reminders where implemented
-   WhatsApp share links
-   In-app status information

## Deferred

-   WhatsApp Business API
-   SMS
-   Push notifications
-   Real-time notification center
-   Automated multi-channel messaging platform

------------------------------------------------------------------------

# 18. Security Requirements

Security is a core product requirement.

## Authentication

-   Argon2 password hashing
-   Secure session/token handling
-   Secure password reset
-   Safe logout/session invalidation

## Authorization

-   Server-side authorization
-   RBAC/capability checks
-   Wedding ownership checks
-   Object-level authorization
-   No trust in client-supplied role information

## Validation

Zod should be used for application-boundary validation.

Validate:

-   Request bodies
-   Query parameters
-   Route parameters
-   Invitation inputs
-   RSVP inputs
-   Financial inputs
-   Vendor data
-   Upload metadata

## Public Links

Public/guest links must:

-   Use unpredictable identifiers/tokens
-   Avoid exposing database IDs
-   Reveal only authorized data
-   Support revocation/expiry where applicable
-   Be rate-limited where appropriate

## File Uploads

Uploads must enforce:

-   Allowed file types
-   File size limits
-   Upload count limits
-   Server-side validation
-   Protected storage
-   Controlled download access

## Secrets

Never expose:

-   Database credentials
-   Email API keys
-   Storage credentials
-   Third-party API secrets
-   Authentication secrets

to the browser.

------------------------------------------------------------------------

# 19. Financial Data Requirements

Financial information is sensitive.

The system must:

1.  Store monetary values accurately.
2.  Avoid inappropriate floating-point calculations.
3.  Preserve payment history.
4.  Avoid silently overwriting payment records.
5.  Record creator/updater information.
6.  Protect financial data with authorization.
7.  Keep financial data out of public pages.
8.  Maintain traceability between vendor, expense and payment records.

------------------------------------------------------------------------

# 20. Guest Data Requirements

Guest information is private planning data unless explicitly published.

The system must:

-   Protect contact details
-   Avoid exposing the full guest list publicly
-   Prevent one guest from accessing another guest's private invitation
    context
-   Validate invitation ownership/context
-   Protect RSVP information
-   Protect guest-upload functionality

------------------------------------------------------------------------

# 21. Media Storage Requirements

Media should be stored separately from application/database records.

The database should store media metadata and references rather than
large binary files.

The initial client SDK is:

-   AWS S3 SDK

The final provider may be:

-   AWS S3
-   S3-compatible object storage

The provider decision will be finalized during architecture/deployment
planning.

------------------------------------------------------------------------

# 22. Technical Stack

The technical foundation is intentionally aligned with the stack
direction discussed for the reference project while remaining
independently designed.

## Frontend

-   Next.js 16.3.4
-   React 19.2.8
-   TypeScript 5
-   Tailwind CSS 4

## Application / Backend

-   Next.js App Router
-   Next.js server-side application layer
-   Route handlers/API layer where required
-   No separate Express backend in the initial architecture

## Database

-   MongoDB
-   Mongoose 9

## Validation

-   Zod 4

## Authentication / Security

-   Argon2
-   Secure session/token architecture
-   Server-side authorization
-   RBAC/capability checks

## Email

-   Resend

## Object Storage

-   AWS S3 SDK
-   S3-compatible object storage

## Testing

-   Vitest
-   DOM/browser-like test environment where required

## Code Quality

-   ESLint
-   TypeScript type checking
-   Automated tests

## Development

-   Git
-   GitHub
-   Node.js runtime compatible with the selected Next.js version

------------------------------------------------------------------------

# 23. Technical Architecture Direction

The initial architecture should be a modular Next.js application rather
than a distributed microservice system.

High-level structure:

``` text
WeddingPlaner
├── Next.js App Router
├── React UI
├── Server/Application Layer
├── Domain Modules
├── MongoDB + Mongoose
├── Resend
├── S3-Compatible Object Storage
└── External Vendor Discovery Provider
```

Suggested conceptual structure:

``` text
src/
├── app/
├── modules/
│   ├── auth/
│   ├── wedding/
│   ├── members/
│   ├── events/
│   ├── tasks/
│   ├── vendors/
│   ├── expenses/
│   ├── payments/
│   ├── guests/
│   ├── invitations/
│   ├── rsvp/
│   ├── website/
│   ├── gallery/
│   ├── documents/
│   └── activity/
├── server/
├── components/
├── config/
└── tests/
```

This is a high-level direction. Detailed architecture will be documented
separately before implementation.

------------------------------------------------------------------------

# 24. Data Architecture Direction

MongoDB is the primary database.

Mongoose is responsible for:

-   Schema definitions
-   Model access
-   References
-   Indexes
-   Database operations

The architecture should define:

-   Workspace ownership
-   Membership relationships
-   Event references
-   Guest/event relationships
-   Invitation/token relationships
-   Gallery/media relationships
-   Financial relationships
-   Activity relationships

Indexes should be designed around actual query patterns.

Important query areas include:

-   Workspace membership
-   Event lists
-   Task status/due dates
-   Guest search
-   Event guest assignment
-   Vendor lookup
-   Expense/date/category queries
-   Outstanding payments
-   Invitation token lookup
-   RSVP status
-   Gallery access
-   Activity timeline

------------------------------------------------------------------------

# 25. Product Data Ownership Principle

Every record should have a clear source of truth.

Examples:

-   Event date belongs to Event.
-   Vendor agreed amount belongs to the vendor/financial source of
    truth.
-   Recorded payment belongs to Payment.
-   Expense belongs to Expense.
-   Guest identity belongs to Guest.
-   Event invitation assignment belongs to the invitation/event
    relationship.
-   RSVP belongs to the relevant invitation/event context.
-   Gallery media metadata belongs to Gallery/Media records.

Derived dashboard numbers should be calculated from source records
rather than unnecessarily duplicated.

------------------------------------------------------------------------

# 26. Performance Requirements

The product should support potentially large wedding datasets.

Requirements:

-   Paginate large lists
-   Use indexes for common queries
-   Avoid loading unnecessary guest records
-   Avoid loading unnecessary media
-   Optimize dashboard queries
-   Use caching where beneficial
-   Avoid routing large media through application servers unnecessarily
-   Use object storage for media
-   Protect public endpoints against abuse

No fixed numerical performance target is considered final until baseline
performance testing is completed.

------------------------------------------------------------------------

# 27. Reliability Requirements

Important operations should be designed for consistency.

Examples:

-   Guest assignment
-   Invitation creation
-   RSVP update
-   Payment recording
-   Expense recording
-   Permission changes
-   Gallery moderation

Where multiple MongoDB writes must succeed together, transaction
mechanisms should be considered.

Failures should produce understandable states without leaving misleading
UI information.

------------------------------------------------------------------------

# 28. Auditability

Sensitive records should include:

-   `createdBy`
-   `updatedBy`
-   `createdAt`
-   `updatedAt`

Important audit areas include:

-   Permissions
-   Financial records
-   Invitation state
-   RSVP changes
-   Gallery moderation
-   Document operations

The Activity Timeline is a human-readable history and does not replace
detailed security/audit logging.

------------------------------------------------------------------------

# 29. Product Edge Cases

## Authentication

-   Duplicate email
-   Invalid login
-   Password reset for unknown email
-   Expired password reset token
-   Invalid reset token
-   Revoked session
-   Unauthorized workspace access

## Workspace

-   Removed organizer attempts access
-   Organizer loses permission while viewing a page
-   Owner attempts to remove themselves
-   Duplicate membership invitation
-   Expired member invitation

## Events

-   Event deleted after guest invitation
-   Archived event referenced by historical records
-   Event without venue
-   Event date changed after invitations are sent
-   Event removed from public website

## Guests

-   Duplicate guest
-   Guest belongs to multiple events
-   Guest removed after RSVP
-   Household contains multiple attendees
-   Invitation maximum exceeded
-   Guest edited after invitation sent

## Invitations

-   Invalid token
-   Expired token
-   Revoked token
-   Token reuse
-   Token used against another wedding
-   Wrong invitation email
-   Invitation resend
-   Event changed after invitation sent
-   Guest invitation revoked

## RSVP

-   Duplicate RSVP
-   RSVP changed
-   RSVP submitted after event archived
-   Attendee count exceeds capacity
-   Guest declines after accepting
-   Guest changes attendance

## Vendors

-   Discovered vendor disappears from provider
-   Vendor added twice
-   Vendor deleted while financial records exist
-   Vendor amount changes after payment exists

## Financial

-   Zero-value expense
-   Negative amount
-   Payment exceeds agreed amount
-   Duplicate payment
-   Vendor has no agreed amount
-   Expense without vendor
-   Expense linked to archived event

## Gallery

-   Unsupported file
-   Oversized file
-   Too many files
-   Duplicate upload
-   Interrupted upload
-   Guest link revoked
-   Guest link shared publicly
-   Photo rejected
-   Photo deleted after approval
-   Album archived
-   QR scanned after access settings change

## Documents

-   Unsupported document type
-   Oversized document
-   Document deleted while referenced
-   Unauthorized document access

## Public Website

-   Unpublished section requested
-   Event removed from public site
-   Private data accidentally referenced
-   Invalid website slug
-   Theme changed while website is public

------------------------------------------------------------------------

# 30. Error Handling Principles

Errors should be:

-   Understandable
-   Actionable
-   Safe
-   Non-sensitive
-   Consistent

The application must not expose:

-   Stack traces
-   Database errors
-   Secret values
-   Internal storage paths
-   Authentication internals
-   Private guest information

Production errors should be logged safely on the server.

------------------------------------------------------------------------

# 31. Product Success Criteria

The initial product is successful when a wedding can be managed through
one workspace without requiring separate planning spreadsheets for core
workflows.

An organizer should be able to:

1.  Create a wedding.
2.  Create multiple events.
3.  Add organizers.
4.  Assign permissions.
5.  Create tasks.
6.  Add vendors.
7.  Discover vendors.
8.  Define budgets.
9.  Record expenses.
10. Record payments.
11. Manage guests.
12. Assign guests to events.
13. Send invitations.
14. Receive RSVPs.
15. Share through WhatsApp.
16. Publish a wedding website.
17. Select a website theme.
18. Provide a live-stream link.
19. Collect guest photos.
20. Moderate gallery submissions.
21. Provide QR gallery access.
22. Store documents.
23. Review activity history.

Guests should be able to complete their primary flows without creating a
full application account.

------------------------------------------------------------------------

# 32. Product Success Metrics

These metrics measure product usefulness and engineering quality.

## Setup Metrics

-   Weddings reaching first event creation
-   Weddings reaching first organizer addition
-   Weddings reaching first guest addition
-   Weddings reaching first invitation

## Collaboration Metrics

-   Active organizers per wedding
-   Tasks assigned
-   Tasks completed
-   Overdue task rate
-   Permission-controlled actions

## Guest Experience Metrics

-   Invitations sent
-   Invitation opens where measurable
-   RSVP completion
-   Pending RSVP count
-   RSVP update frequency

## Vendor Metrics

-   Vendor records created
-   Vendor discovery searches
-   Discovered vendors added

## Financial Metrics

-   Weddings with budgets configured
-   Expenses recorded
-   Payments recorded
-   Outstanding payment records
-   Financial records with complete source information

## Gallery Metrics

-   Gallery visits
-   QR gallery visits
-   Upload attempts
-   Successful uploads
-   Approved photos
-   Rejected photos

## Engineering Quality Metrics

-   Critical workflow test coverage
-   Type-check success
-   Lint success
-   Regression test success
-   Authorization test coverage
-   Public-link security test coverage
-   Upload security test coverage
-   Production error rate after deployment

Numerical targets should be established after baseline testing.

------------------------------------------------------------------------

# 33. Security Acceptance Criteria

Before production deployment, demonstrate that:

-   Unauthorized users cannot access private wedding data.
-   Organizers cannot access capabilities they do not have.
-   Guests cannot enumerate other guest invitations.
-   Invitation tokens cannot expose unrelated weddings.
-   Gallery tokens cannot access unrelated galleries.
-   Public pages contain no private financial information.
-   Storage credentials are never exposed.
-   Upload validation is enforced server-side.
-   Authentication secrets are not exposed to clients.
-   Sensitive API operations reject unauthorized requests.
-   Revoked/deleted access is enforced server-side.

------------------------------------------------------------------------

# 34. Testing Strategy

Testing should be implemented alongside features.

## Unit Tests

Use Vitest for:

-   Business rules
-   Validation
-   Financial calculations
-   RSVP rules
-   Token handling
-   Permission checks
-   Utility functions

## Integration Tests

Test:

-   Authentication
-   Database operations
-   Wedding ownership
-   Event relationships
-   Guest/invitation flow
-   RSVP
-   Vendor/expense/payment relationships
-   Gallery access
-   Document authorization

## UI Tests

Test critical user journeys where appropriate:

-   Login
-   Wedding setup
-   Event creation
-   Task creation
-   Guest invitation
-   RSVP
-   Gallery upload

## Security Tests

Specifically test:

-   Object-level authorization
-   Role escalation
-   Token manipulation
-   Revoked-token access
-   Unauthorized gallery access
-   Unauthorized document access
-   Upload validation
-   Public data leakage

------------------------------------------------------------------------

# 35. Release Strategy

## Phase 0 --- Foundation

-   Next.js project scaffold
-   TypeScript
-   Tailwind
-   MongoDB/Mongoose
-   Authentication foundation
-   Argon2
-   Zod
-   Testing setup
-   ESLint
-   Core project structure
-   Security baseline

## Phase 1 --- Core Planning

-   Wedding setup
-   Members
-   RBAC
-   Events
-   Dashboard/action center
-   Tasks
-   Guests
-   Event-level guest assignment

## Phase 2 --- Vendors and Finance

-   Vendor management
-   Vendor discovery
-   Budgets
-   Expenses
-   Payments
-   Financial dashboard information
-   Financial auditability

## Phase 3 --- Guest Experience

-   Digital invitations
-   Secure invitation tokens
-   Email invitations
-   Resend
-   WhatsApp sharing
-   RSVP
-   Reminders
-   Public wedding website
-   Predefined themes
-   Live-stream link

## Phase 4 --- Media and Documents

-   Gallery
-   Event albums
-   Guest uploads
-   Moderation
-   Gallery permissions
-   QR gallery access
-   Documents
-   Activity timeline

## Phase 5 --- Hardening and Deployment

-   Security testing
-   Authorization testing
-   Performance testing
-   Error handling
-   Responsive testing
-   Mobile guest testing
-   Production configuration
-   Deployment
-   Documentation

## Future Phase --- AI Layer

Potential future features:

-   AI wedding assistant
-   Automated checklist generation
-   Date-aware planning suggestions
-   Budget analysis
-   Invitation content generation
-   Schedule generation
-   Document understanding
-   AI-powered wedding planning insights

AI remains outside the initial core release.

------------------------------------------------------------------------

# 36. Deferred Feature Register

  Feature                               Status
  ------------------------------------- --------------
  Multiple weddings per user            Deferred
  Notification center                   Deferred
  Push notifications                    Deferred
  Real-time collaboration               Deferred
  WhatsApp Business API                 Deferred
  SMS                                   Deferred
  Vendor marketplace                    Deferred
  Vendor booking marketplace            Deferred
  Vendor payment marketplace            Deferred
  Accommodation management              Out of Scope
  Guest travel management               Out of Scope
  AI assistant                          Deferred
  AI document processing                Deferred
  AI analytics                          Deferred
  Custom website builder                Deferred
  Custom domains                        Deferred
  Native livestreaming                  Deferred
  Video gallery support                 Deferred
  Seating planner                       Deferred
  QR event check-in                     Deferred
  Advanced analytics/report downloads   Future
  Calendar integration                  Future
  Multilingual website/invitations      Future

------------------------------------------------------------------------

# 37. Future Extensibility Principles

Although deferred features are not part of the initial release, the
architecture should avoid unnecessary decisions that make them
impossible later.

Examples:

-   Wedding membership should be extensible to multiple weddings later.
-   Notification-producing actions should be identifiable.
-   Domain modules should remain separated.
-   Media storage should remain independent from application storage.
-   Website content should remain separate from themes.
-   Guest/household models should support future seating/check-in use
    cases.
-   Activity events should be structured enough for future
    notifications.
-   AI features should be able to consume controlled domain data later
    without becoming a dependency of the core product.

------------------------------------------------------------------------

# 38. Product Boundaries

The Wedding Management Platform is:

> A collaborative wedding planning and guest-experience platform.

It is not:

-   A vendor marketplace
-   A payment gateway
-   A travel agency
-   A hotel booking system
-   A social network
-   A general cloud drive
-   A native livestreaming service
-   A custom website-building platform
-   An AI assistant in the initial release

These boundaries keep the project achievable while retaining meaningful
real-world complexity.

------------------------------------------------------------------------

# 39. Architecture Decision Preparation

Before implementation, the following decisions should be documented in
the architecture specification.

## Authentication

-   Session strategy
-   Token/session lifetime
-   Password reset flow
-   Email verification requirement
-   Login rate limiting

## Authorization

-   Exact capability matrix
-   Owner restrictions
-   Organizer permissions
-   Public/guest access boundaries

## Invitation Tokens

-   Token generation method
-   Token storage
-   Expiration policy
-   Revocation policy
-   Resend behavior

## Guest Model

-   Individual guest schema
-   Household schema
-   Invitation group model
-   Maximum attendee rules

## Vendor Discovery

-   External provider
-   Provider authentication
-   API limits
-   Fallback behavior
-   Caching strategy

## Storage

-   AWS S3 versus S3-compatible provider
-   Bucket structure
-   Object naming
-   Signed URLs
-   Upload limits
-   Retention/deletion

## Email

-   Resend configuration
-   Sender identity
-   Email templates
-   Delivery handling
-   Retry behavior

## Website

-   Public URL/slug
-   Theme architecture
-   Publishing model
-   Cache/revalidation strategy

## Gallery

-   Access token strategy
-   Moderation defaults
-   Upload size
-   File type limits
-   Download permissions
-   Rate limiting

## Documents

-   Allowed file types
-   Maximum size
-   Retention
-   Download permissions

------------------------------------------------------------------------

# 40. Open Product Decisions

The following are intentionally left for architecture/design rather than
silently assuming an answer:

1.  Exact organizer capability matrix.
2.  Exact invitation token expiration duration.
3.  Whether email verification is mandatory before wedding creation.
4.  Exact password reset policy.
5.  Exact guest maximum-attendee rules.
6.  Final vendor discovery provider.
7.  Final object-storage provider.
8.  Maximum photo size.
9.  Maximum number of photos per upload.
10. Allowed gallery file types.
11. Default gallery moderation behavior.
12. Gallery link expiration behavior.
13. Allowed document types.
14. Maximum document size.
15. Website slug format.
16. Number of initial website themes.
17. Exact reminder schedule.
18. Deployment provider.
19. Production observability/logging solution.
20. Exact performance baselines.

These decisions should be recorded before the corresponding feature is
implemented.

------------------------------------------------------------------------

# 41. AI-Native Engineering Context

This project is being developed as an AI-native software engineering
exercise.

The product requirements remain independent of any particular AI coding
tool.

The intended workflow is:

``` text
PRD
  ↓
Architecture
  ↓
Engineering Specification
  ↓
Codex Implementation
  ↓
Automated Tests
  ↓
Code Review
  ↓
Manual Product Testing
  ↓
Bug Report
  ↓
Codex Fix
  ↓
Regression Testing
  ↓
Git Commit
  ↓
Next Feature
```

The Product Owner remains responsible for final product decisions and
manual acceptance.

AI-assisted implementation does not replace product validation.

------------------------------------------------------------------------

# 42. Project Roles

## Product Owner --- User

Responsibilities:

-   Product decisions
-   Scope approval
-   Final UX acceptance
-   Manual testing
-   Reporting observed bugs
-   Deciding whether a feature meets the requirement

The Product Owner does not need to write application code for this
project.

## Technical Lead / Architect --- ChatGPT

Responsibilities:

-   Convert PRD into engineering specifications
-   Define architecture
-   Break work into tasks
-   Review implementation
-   Identify security risks
-   Design test cases
-   Review failures
-   Maintain consistency across modules
-   Guide Codex
-   Help debug defects
-   Ensure requirements are not silently changed

## AI Developer --- Codex

Responsibilities:

-   Create/edit repository files
-   Implement approved engineering tasks
-   Install/configure dependencies
-   Run tests
-   Run lint/type checks
-   Fix implementation errors
-   Update documentation
-   Create commits when instructed

------------------------------------------------------------------------

# 43. Definition of Ready

A feature is ready for implementation when:

-   Product behavior is defined.
-   User roles are identified.
-   Acceptance criteria exist.
-   Privacy requirements are known.
-   Relevant edge cases are identified.
-   Data ownership is understood.
-   Server behavior is specified.
-   Testing expectations are defined.
-   Dependencies are known.

------------------------------------------------------------------------

# 44. Definition of Done

A feature is complete only when:

1.  Implementation matches the approved requirement.
2.  Server-side authorization is implemented.
3.  Validation exists.
4.  Relevant automated tests pass.
5.  Lint passes.
6.  Type checking passes.
7.  Regression tests pass.
8.  Security-sensitive behavior is reviewed.
9.  Manual product testing passes.
10. Known edge cases are addressed.
11. Documentation is updated where necessary.
12. Changes are committed to Git.

------------------------------------------------------------------------

# 45. Change Management

The PRD is the product source of truth.

When a requirement changes:

1.  Identify the affected feature.
2.  Document the proposed change.
3.  Identify dependencies.
4.  Identify security/data implications.
5.  Update the PRD if scope changes.
6.  Update architecture/engineering documentation.
7.  Update tests.
8.  Implement only after the revised requirement is accepted.

Implementation convenience must not silently change product
requirements.

------------------------------------------------------------------------

# 46. Reference and Inspiration

The project takes architectural and product-development inspiration from
the publicly available **Make My Marriage** project by Akshay Saini,
particularly its approach to:

-   AI-native software development
-   Modular application structure
-   Guest invitation tokens
-   Email invitations
-   RSVP
-   Vendor discovery
-   Public wedding website
-   Gallery workflows
-   Mobile-first guest experience
-   Explicit edge-case thinking

This project is independently specified and is not intended to copy the
referenced project's source code, branding, or exact product design.

Reference:

`https://github.com/akshaymarch7/make-my-marriage`

------------------------------------------------------------------------

# 47. V1 → V2 Change Summary

PRD V2 preserves the core product direction of the original PRD while
improving implementation readiness.

## Adopted

-   Secure unique guest invitation tokens
-   Email invitations
-   Resend invitation
-   WhatsApp sharing
-   Vendor discovery
-   Predefined website themes
-   QR gallery access
-   Parent-friendly UX
-   Explicit edge-case requirements

## Improved

-   RBAC
-   Event model
-   Dashboard/action center
-   Guest and household model
-   RSVP
-   Vendor management
-   Budget and payment model
-   Invitation architecture
-   Gallery security
-   Mobile-first guest experience
-   Indian wedding UX
-   Security architecture

## New

-   Activity timeline
-   Product success metrics
-   Engineering quality metrics
-   Security acceptance criteria
-   Clear product/data ownership principles
-   AI-native engineering workflow context

## Deferred

-   Multiple weddings per user
-   Notification center
-   Push notifications
-   Real-time collaboration
-   WhatsApp API
-   SMS
-   Vendor marketplace
-   Vendor booking/payment marketplace
-   Accommodation/travel
-   AI assistant and AI processing
-   Custom website builder
-   Custom domains
-   Native livestreaming

------------------------------------------------------------------------

# 48. Final Scope Statement

PRD V2 defines a wedding management platform that combines private
wedding planning with controlled guest-facing experiences.

The initial product must successfully support:

``` text
Create Wedding
    ↓
Add Organizers + Permissions
    ↓
Create Events
    ↓
Plan Tasks
    ↓
Manage Vendors
    ↓
Discover Vendors
    ↓
Set Budgets
    ↓
Track Expenses + Payments
    ↓
Manage Guests + Households
    ↓
Assign Guests to Events
    ↓
Create Secure Invitations
    ↓
Send Email / Share WhatsApp
    ↓
Collect RSVP
    ↓
Publish Wedding Website
    ↓
Select Website Theme
    ↓
Share Live Stream
    ↓
Collect Photos
    ↓
Moderate Gallery
    ↓
Share Gallery via QR
    ↓
Manage Documents
    ↓
Review Activity Timeline
```

The platform must maintain strict separation between:

-   Private planning information
-   Controlled guest information
-   Public wedding information

Security, authorization, data ownership, and guest privacy are core
product requirements.

The initial release should remain focused enough to be built, tested,
reviewed, deployed, and demonstrated as a complete real-world
application.

AI functionality is intentionally deferred from the core product so the
project first establishes a reliable full-stack foundation on which
AI-native features can later be added.

------------------------------------------------------------------------

# 49. PRD Approval Checklist

-   [x] Core wedding planning platform
-   [x] MongoDB instead of MySQL
-   [x] Next.js 16.3.4
-   [x] React 19.2.8
-   [x] TypeScript 5
-   [x] Tailwind CSS 4
-   [x] Mongoose 9
-   [x] Zod 4
-   [x] Argon2
-   [x] AWS S3 SDK
-   [x] Resend
-   [x] Vitest
-   [x] ESLint
-   [x] Secure guest invitation tokens
-   [x] Email invitation + resend
-   [x] WhatsApp sharing
-   [x] Vendor discovery
-   [x] Website themes
-   [x] QR gallery
-   [x] Parent-friendly UX
-   [x] RBAC improvement
-   [x] Improved event model
-   [x] Dashboard/action center
-   [x] Guest/household model
-   [x] Improved RSVP
-   [x] Improved vendor management
-   [x] Budget + payment tracking
-   [x] Invitation architecture
-   [x] Gallery security
-   [x] Mobile-first guest experience
-   [x] Indian wedding UX
-   [x] Activity timeline
-   [x] Product/engineering success metrics
-   [x] Explicit edge-case requirements
-   [x] AI excluded from initial core release

------------------------------------------------------------------------

## End of PRD V2
