# The Pig House — בית של חזירים

A web app for monetizing household chores.

---

## Concept

Parents define chore cards. Kids pick cards, complete the tasks, and request approval. Upon approval, kids receive payment. Prices adjust weekly based on supply and demand — unpopular chores rise in price, popular chores drop.

The app is entirely in **Hebrew**.

---

## Stack

| Layer     | Technology          |
|-----------|---------------------|
| Frontend  | Angular              |
| Backend   | Node.js (Express)    |
| Database  | MongoDB (via Mongoose)      |

---

## Multi-Family Support

Each **family** is the top-level data boundary. All cards, users, transactions, and pricing are scoped to a family — no data leaks between families.

### Family Entity
| Field        | Description                                      |
|--------------|--------------------------------------------------|
| `id`         | Unique family ID                                 |
| `name`       | Display name (e.g., "משפחת מילר")                |
| `createdAt`  | Timestamp                                        |

### Login Flow
- A family logs in with a shared family identifier (e.g., family name or invite code).
- Within the family, each member (parent or kid) has their own account.
- Authentication is family-scoped: JWT payload carries both `familyId` and `userId`.
- All API queries are automatically filtered by `familyId` derived from the token — no cross-family data access is possible.

> Security is deferred for MVP, but the schema and query layer must always enforce `familyId` scoping from day one.

---

## Users & Roles

### Parents (מנהלים)
- Full CRUD on cards and subtasks
- Set and adjust price tags
- Move cards between any state
- Approve completed chore cards → triggers payment
- Manage the weekly price-rebalancing algorithm
- Manage family members (add/remove kids)

### Kids (ילדים)
- View all available cards
- Pick an available card → moves it to "taken" (by them)
- Mark a card as done → moves it to "pending"
- See their balance / earnings history

---

## Users

### User Fields
| Field        | Description                                                        |
|--------------|--------------------------------------------------------------------|
| `id`         | Unique user ID                                                     |
| `familyId`   | Reference to the family this user belongs to                       |
| `name`       | Display name (Hebrew OK)                                           |
| `role`       | `parent` or `kid`                                                  |
| `balance`        | Accumulated unpaid earnings (₪) — kids only                   |
| `completedCards` | List of every card this kid has been paid for (see below)      |
| `createdAt`      | Timestamp                                                      |

### CompletedCard Fields (embedded in User)
| Field         | Description                                    |
|---------------|------------------------------------------------|
| `cardId`      | Reference to the original card                 |
| `cardTitle`   | Snapshot of the title at approval time         |
| `amount`      | Amount paid (₪)                                |
| `completedAt` | Timestamp of parent approval                   |

---

## Chore Card

Each card represents a room or a task (e.g., "סלון", "חדר שינה", "כלים").

### Card Fields
| Field       | Description                                      |
|-------------|--------------------------------------------------|
| `id`        | Unique card ID                                   |
| `familyId`  | Reference to the owning family                   |
| `title`     | Name of the room / task (Hebrew)                 |
| `subtasks`  | Ordered checklist of items to complete           |
| `price`     | Current payment amount (₪)                       |
| `state`     | Current lifecycle state (see below)              |
| `takenBy`   | Reference to the kid who took the card (if any)  |
| `createdAt` | Timestamp                                        |
| `updatedAt` | Timestamp                                        |

### Subtask Fields
| Field  | Description                         |
|--------|-------------------------------------|
| `id`   | Unique subtask ID                   |
| `text` | Description of the subtask (Hebrew) |
| `done` | Boolean — checked off by the kid    |

---

## Card States

```
suspended ──────────────────────────────┐
    ↑                                    │
    │        ┌── (parent only) ──────────┤
available ──►│                           │
    ▲        └── (kid or parent) ──► taken ──► pending ──► (back to available, after approval)
    │                                                │
    └────────────────────────────────────────────────┘
```

| State       | Hebrew        | Description                                                      | Who can enter this state              |
|-------------|---------------|------------------------------------------------------------------|---------------------------------------|
| `suspended` | מושהה         | Task not currently needed (e.g., room is already clean)          | Parents only                          |
| `available` | פנוי          | Card is open for a kid to pick up                                | Parents only (or auto after approval) |
| `taken`     | נלקח          | A kid is actively working on it                                  | Kids or parents                       |
| `pending`   | ממתין לאישור  | Kid finished; waiting for parent approval                        | Kid who holds the card                |

**Approval flow:** Parent reviews a `pending` card → approves → payment credited to kid → card returns to `available`.

---

## Pricing & Weekly Rebalancing

- Every card has a `price` (₪).
- A weekly algorithm rebalances prices based on demand:
  - Cards that were **not picked** in the past week → price **increases**
  - Cards that were **picked quickly / often** → price **decreases**
  - The total weekly budget (sum of all prices) remains roughly constant — prices shift between cards.
- Parents can override any price manually at any time.
- The rebalancing runs automatically (e.g., every Sunday morning).

---

## API Contract

Full endpoint reference (request/response types, roles, behaviour): [`docs/dto.md`](docs/dto.md)

---

## Shared Types

The canonical API contract lives in `shared/types/` at the repo root. Both FE and BE import from this directory — never duplicate type definitions.

```
shared/types/
├── models.ts           # Core entities: User, CompletedCard, Card, Subtask, UserRole, CardState, ApiError
├── auth.dto.ts         # LoginRequest/Response, RegisterRequest/Response
├── users.dto.ts        # CreateUserRequest, GetUsersResponse, GetUserHistoryResponse
├── cards.dto.ts        # CreateCardRequest, UpdateCardRequest, StateTransitionRequest, ToggleSubtaskRequest
├── approvals.dto.ts    # ApproveResponse
└── index.ts            # Barrel export — import everything from 'shared/types'
```

Each side must configure its `tsconfig.json` with a path alias so imports resolve correctly:
```json
"paths": { "shared/types": ["../../shared/types/index.ts"] }
```

---

## Frontend Structure (Angular)

```
src/
├── app/
│   ├── core/
│   │   ├── auth/               # Login, role guard (parent / kid)
│   │   ├── models/             # Card, Subtask, User interfaces
│   │   └── services/           # API service, Auth service
│   ├── features/
│   │   ├── board/              # Main chore board (grid of cards)
│   │   │   ├── card/           # Single card component
│   │   │   └── card-detail/    # Expanded card with subtask checklist
│   │   ├── admin/              # Parent-only management screens
│   │   │   ├── card-editor/    # Create / edit cards and subtasks
│   │   │   └── approvals/      # Pending approvals queue
│   │   └── profile/            # Kid's earnings history
│   └── shared/
│       ├── components/         # Buttons, badges, Hebrew UI primitives
│       └── pipes/              # Currency formatting, state labels in Hebrew
├── assets/
│   └── i18n/                   # Hebrew strings
└── environments/
```

---

## Backend Structure (Node / Express)

```
server/
├── src/
│   ├── routes/
│   │   ├── cards.ts            # CRUD for cards + state transitions
│   │   ├── subtasks.ts         # Subtask management
│   │   ├── approvals.ts        # Approve / reject pending cards
│   │   └── users.ts            # User management (parents add kids)
│   ├── middleware/
│   │   ├── auth.ts             # JWT verification
│   │   └── roleGuard.ts        # Parent-only route protection
│   ├── jobs/
│   │   └── weeklyRebalance.ts  # Cron job — Sunday price rebalancing
│   ├── models/                 # DB schemas (Family, User, Card)
│   └── app.ts                  # Express setup
└── package.json
```

---

## API Endpoints (draft)

### Cards
| Method | Path                          | Role    | Description                          |
|--------|-------------------------------|---------|--------------------------------------|
| GET    | `/api/cards`                  | All     | List all cards                       |
| POST   | `/api/cards`                  | Parent  | Create a card                        |
| PUT    | `/api/cards/:id`              | Parent  | Edit card (title, price, subtasks)   |
| DELETE | `/api/cards/:id`              | Parent  | Delete a card                        |
| PATCH  | `/api/cards/:id/state`        | *       | Transition state (role-checked)      |
| PATCH  | `/api/cards/:id/subtasks/:sid`| Kid     | Toggle subtask done                  |

### Approvals
| Method | Path                          | Role   | Description                          |
|--------|-------------------------------|--------|--------------------------------------|
| GET    | `/api/approvals`              | Parent | List all pending cards               |
| POST   | `/api/approvals/:id/approve`  | Parent | Approve → pay kid, reset card        |
| POST   | `/api/approvals/:id/reject`   | Parent | Reject → card back to taken          |

### Users
| Method | Path                          | Role   | Description                          |
|--------|-------------------------------|--------|--------------------------------------|
| GET    | `/api/users`                  | Parent | List all family members              |
| POST   | `/api/users`                  | Parent | Add a kid account                    |
| GET    | `/api/users/:id/history`      | All    | Earnings history for a user          |

---

## Key Business Rules

1. Only one kid can hold a card at a time (`taken` state is exclusive).
2. Only the kid who took a card can mark it `pending`.
3. Subtasks can only be toggled while the card is in `taken` state by the kid who holds it.
4. Parents can override any state transition at any time.
5. Payment is only credited after explicit parent approval.
6. The weekly rebalancing preserves the total price pool (zero-sum redistribution), scoped per family.
7. A `suspended` card is invisible to kids on the board.
8. Every DB query must be scoped by `familyId` — no cross-family data access.

---

## Future Considerations (out of scope for MVP)

- Push notifications when a card is approved / rejected
- Leaderboard / gamification badges
- Photo evidence upload before approval request
- Proper authentication security (hashed passwords, refresh tokens, etc.)
