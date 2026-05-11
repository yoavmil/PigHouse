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
| Database  | TBD (MongoDB or PostgreSQL) |

---

## Users & Roles

### Parents (מנהלים)
- Full CRUD on cards and subtasks
- Set and adjust price tags
- Move cards between any state
- Approve completed chore cards → triggers payment
- Manage the weekly price-rebalancing algorithm

### Kids (ילדים)
- View all available cards
- Pick an available card → moves it to "taken" (by them)
- Mark a card as done → moves it to "pending"
- See their balance / earnings history

---

## Chore Card

Each card represents a room or a task (e.g., "סלון", "חדר שינה", "כלים").

### Card Fields
| Field       | Description                                      |
|-------------|--------------------------------------------------|
| `title`     | Name of the room / task (Hebrew)                 |
| `subtasks`  | Ordered checklist of items to complete           |
| `price`     | Current payment amount (₪)                       |
| `state`     | Current lifecycle state (see below)              |
| `takenBy`   | Reference to the kid who took the card (if any)  |
| `createdAt` | Timestamp                                        |
| `updatedAt` | Timestamp                                        |

### Subtask Fields
| Field       | Description                         |
|-------------|-------------------------------------|
| `text`      | Description of the subtask (Hebrew) |
| `done`      | Boolean — checked off by the kid    |

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

| State       | Hebrew        | Description                                                      | Who can enter this state         |
|-------------|---------------|------------------------------------------------------------------|----------------------------------|
| `suspended` | מושהה         | Task not currently needed (e.g., room is already clean)          | Parents only                     |
| `available` | פנוי          | Card is open for a kid to pick up                                | Parents only (or auto after approval) |
| `taken`     | נלקח          | A kid is actively working on it                                  | Kids or parents                  |
| `pending`   | ממתין לאישור  | Kid finished; waiting for parent approval                        | Kids (the one who took it)       |

**Approval flow:** Parent reviews a `pending` card → approves → payment is credited to the kid → card returns to `available` (or `suspended` if parent chooses).

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
│   ├── models/                 # DB schemas (Card, User, Transaction)
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
6. The weekly rebalancing preserves the total price pool (zero-sum redistribution).
7. A `suspended` card is invisible to kids on the board.

---

## Future Considerations (out of scope for MVP)

- Push notifications when a card is approved / rejected
- Leaderboard / gamification badges
- Photo evidence upload before approval request
- Multi-family / multi-household support
