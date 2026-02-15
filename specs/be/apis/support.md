# Contact Support API

Base Path: **/api/v1/contact-support**

## 1. Send Support Message

**POST /**
Access: Public

Request body:

- `name` (string, required)
- `email` (string, required)
- `subject` (string, required)
- `message` (string, required)

Response:

- `201 Created`
- `success: true`

Notes:

- The backend publishes this as an outbound support email workflow.
