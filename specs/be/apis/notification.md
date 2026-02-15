# Notifications API

Base Path: **/api/v1/notifications**

## 1. Get Notifications

**GET /**
Access: USER, REVIEWER, ADMIN

Query params:

- `page` (default `1`)
- `limit` (default `10`)

Response:

- `success`, `page`, `limit`, `total`, `data[]`

## 2. Get Notification Status

**GET /status**
Access: USER, REVIEWER, ADMIN

Response:

- `success`
- `data` with notification status metadata for current user (for example unread counters)

## 3. Mark Notifications As Read

**POST /read**
Access: USER, REVIEWER, ADMIN

Request body:

- `notificationIds` (number[], required)

Response:

- `success`
- `data` with update result

## 4. Create Notification

**POST /**
Access: ADMIN

Request body:

- Notification payload based on `Notification` model/service validation

Response:

- `201 Created`
- `success`, `data`
