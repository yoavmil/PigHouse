# API Contract — DTOs

All requests and responses use `Content-Type: application/json`.  
All timestamps are ISO 8601 strings (`"2026-05-11T08:00:00.000Z"`).  
All money values are numbers in ₪ (shekel), two decimal places.  
Every authenticated request carries `Authorization: Bearer <token>`.

> **Canonical type definitions live in [`shared/types/`](../shared/types/).**  
> This document describes endpoint behaviour. For exact shapes, read the source:
> - Models: [`shared/types/models.ts`](../shared/types/models.ts)
> - Auth DTOs: [`shared/types/auth.dto.ts`](../shared/types/auth.dto.ts)
> - User DTOs: [`shared/types/users.dto.ts`](../shared/types/users.dto.ts)
> - Card DTOs: [`shared/types/cards.dto.ts`](../shared/types/cards.dto.ts)
> - Approval DTOs: [`shared/types/approvals.dto.ts`](../shared/types/approvals.dto.ts)

---

## Auth

### `POST /api/auth/register`
Create a new family + initial parent account.

**Request** — `RegisterRequest`  
**Response `201`** — `RegisterResponse` `{ token, user }`

---

### `POST /api/auth/login`
Login as a family member. JWT payload carries `familyId`, `userId`, `role`.

**Request** — `LoginRequest`  
**Response `200`** — `LoginResponse` `{ token, user }`

---

## Users

### `GET /api/users`
List all members of the calling user's family.  
**Role:** parent  
**Response `200`** — `User[]`

---

### `POST /api/users`
Add a new family member.  
**Role:** parent  
**Request** — `CreateUserRequest`  
**Response `201`** — `User`

---

### `GET /api/users/:id/history`
Returns the `completedCards` array from the user record.  
**Role:** all (kids can only fetch their own)  
**Response `200`** — `CompletedCard[]`

---

## Cards

### `GET /api/cards`
List all cards for the family. Kids receive only `available` and `taken` cards — `suspended` is filtered out server-side.  
**Role:** all  
**Response `200`** — `Card[]`

---

### `POST /api/cards`
Create a new card.  
**Role:** parent  
**Request** — `CreateCardRequest`  
**Response `201`** — `Card`

---

### `PUT /api/cards/:id`
Update a card's editable fields. To add a new subtask omit its `id`; to update an existing one include it.  
**Role:** parent  
**Request** — `UpdateCardRequest`  
**Response `200`** — `Card`

---

### `DELETE /api/cards/:id`
Delete a card.  
**Role:** parent  
**Response `204`** — no body

---

### `PATCH /api/cards/:id/state`
Transition a card state. Server enforces allowed transitions and role rules.  
**Role:** role-checked per transition (see state machine in CLAUDE.md)  
**Request** — `StateTransitionRequest`  
**Response `200`** — `Card`

---

### `PATCH /api/cards/:id/subtasks/:subtaskId`
Toggle a subtask's completion. Only allowed while the card is `taken`, by the kid who holds it.  
**Role:** kid  
**Request** — `ToggleSubtaskRequest`  
**Response `200`** — `Subtask`

---

## Approvals

### `GET /api/approvals`
List all cards currently in `pending` state.  
**Role:** parent  
**Response `200`** — `Card[]`

---

### `POST /api/approvals/:id/approve`
Approve a pending card — credits the kid, resets card to `available`.  
**Role:** parent  
**Response `200`** — `ApproveResponse` `{ card, updatedUser }`

---

### `POST /api/approvals/:id/reject`
Reject a pending card — reverts it to `taken`.  
**Role:** parent  
**Response `200`** — `Card`
