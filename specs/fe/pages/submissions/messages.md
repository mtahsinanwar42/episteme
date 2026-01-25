# Submissions — Messages

## Route

- Route: `/submissions/:id/messages`
- Access:
  - USER
  - REVIEWER
  - ADMIN
- Mode: View + Create (for submissions of PENDING_APPROVAL or RETURNED status)

---

## Purpose

- Display submission-related messages.
- Enable role-based communication between:
  - USER ↔ ADMIN
  - ADMIN ↔ REVIEWER
- Maintain a clear, chronological conversation history.

---

## API

### Fetch Messages

- `GET /api/v1/submissions/:id/messages`
- Trigger: Page load
- Sort: Descending by `createdAt` (latest first)

### Create Message

- `POST /api/v1/submissions/:id/messages`
- Trigger: Send message action
- Request body: As defined in Message API spec
- Applicable for submissions of PENDING_APPROVAL or RETURNED status

### Fetch Reviewers (ADMIN only)

- `GET /api/v1/submissions/:id/reviewers`
- Purpose: Determine valid reviewer recipients
- Reviewer states to include:
  - ACCEPTED
  - COMPLETED

---

## UI Requirements

### Messages List

- Display messages ordered by:
  - `createdAt` descending
- Each message displays:
  - Sender name
  - Sender email
  - Timestamp
  - Message content
  - Sender badge (role-based)

### Sender / Receiver Badges

- If `sender.id === loggedInUserId`:
  - Show badge: **You**
- Else:
  - Show badge: `<Sender Name> (<Sender Email>)`

---

## Role-Based Behavior

### USER

- Can view messages related to own submission.
- Can send new messages to ADMIN.

**New Message**

- Input: Single text area below message list
- On Send:
  - Call `POST /api/v1/submissions/:id/messages`
  - Payload:
    - `scope = USER_ADMIN`

---

### REVIEWER

- Can view messages related to assigned submissions.
- Can send new messages to ADMIN.

**New Message**

- Input: Single text area below message list
- On Send:
  - Call `POST /api/v1/submissions/:id/messages`
  - Payload:
    - `scope = USER_ADMIN`

---

### ADMIN

- Can view all messages for the submission.
- Can communicate individually with:
  - Submission owner (USER)
  - REVIEWERs with status **ACCEPTED** or **COMPLETED**

---

#### Message Groups (Per Recipient)

- Display separate message groups (cards/sections) for each recipient:
  - One group for the submission owner (scope = USER_ADMIN)
  - One group per REVIEWER with status:
    - ACCEPTED
    - COMPLETED

> REVIEWERs with status other than ACCEPTED or COMPLETED must not be shown.

- Each group displays:
  - Recipient name and email
  - Messages exchanged with that recipient
  - Messages ordered by `createdAt` (descending)

---

#### New Message (Per Group)

- Each message group contains:
  - A text area below the message list
  - A Send action specific to that recipient

- On Send:
  - Call `POST /api/v1/submissions/:id/messages`
  - Payload:
    - When sending to USER:
      - `scope = USER_ADMIN`
      - `receiverUsrId = <userId>`
    - When sending to REVIEWER:
      - `scope = ADMIN_REVIEWER`
      - `receiverUsrId = <reviewerId>`

- After successful send:
  - Clear the text area for that group
  - Append the new message to the message list

---

## States

- Loading (initial message load)
- Loading (send message)
- Empty:
  - Message: “No messages yet.”
- Error (API failure)
- Forbidden (user not allowed to access messages)
- Message Text Box preserves input on error and clears on success.

---

## Access Control Rules

- USER:
  - Can access messages only for own submissions.
- REVIEWER:
  - Can access messages only for assigned submissions.
- ADMIN:
  - Can access messages for all submissions.
