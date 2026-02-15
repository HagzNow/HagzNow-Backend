# Upload Module

Single endpoint for image uploads. Data endpoints (profile, arena, owner registration) accept **JSON only** with image **path strings**; files are uploaded separately.

## Endpoint

- **`POST /upload/:entity`**
  - **Body:** `multipart/form-data` with field **`image`** (one file per request).
  - **Response:** `{ path: "entity/uuid.webp", url: "https://..." }`
  - Use the **`path`** value in subsequent JSON requests to the data APIs.

## Entities

| Entity     | Use case                          |
| ---------- | --------------------------------- |
| `users`    | User avatar                       |
| `arenas`   | Arena thumbnail and gallery       |
| `auth`     | Owner ID images (after signup, when submitting verification) |
| `bookings` | Booking-related images            |
| `ads`      | Ad images                         |
| `reviews`  | Review images                     |
| `categories` | Category images                 |

## Authentication

- All uploads **require** `Authorization: Bearer <token>`. Use the token from login or owner signup before uploading (e.g. owner ID images via `auth` entity after signup).

## Client flow

1. **Upload** image(s) via `POST /upload/:entity` (one request per file). Collect the **`path`** from each response.
2. **Call the data endpoint** with JSON containing those paths, e.g.:
   - `PATCH /users/profile` → `{ "avatar": "users/abc.webp" }`
   - `POST /auth/register/owner` → `{ ... }` (ID images optional at signup)
   - `PATCH /users/profile/verification` → `{ "nationalIdFront": "auth/...", "nationalIdBack": "auth/...", "selfieWithId": "auth/..." }` (owner only; submit ID images after signup)
   - `POST /arenas` → `{ "thumbnail": "arenas/...", "images": [{ "path": "arenas/..." }], ... }`

## Storage

- **Paths** are relative (e.g. `users/abc.webp`). Stored under `UPLOAD_DIR` (default `./uploads`) with subfolders per entity.
- **Processing:** Images are converted to WebP, max width 1200px. Original temp file is removed after processing.
- **Cleanup:** When a path is replaced (e.g. new avatar, new arena thumbnail), the previous file is deleted from storage **after** the DB update succeeds.
