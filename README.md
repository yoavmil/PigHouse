# 🐷 בית של חזירים — The Pig House

> A chore monetization app for families. Kids earn money by completing tasks. Parents control the board.

**Live app:** [yoavmil.github.io/PigHouse](https://yoavmil.github.io/PigHouse/)

---

## What is this?

The Pig House turns household chores into a marketplace. Parents create chore cards (cleaning the living room, doing the dishes, etc.). Kids browse the board, pick up a card, complete the tasks, and request approval. Once a parent approves, the kid gets paid.

Prices aren't fixed — they shift weekly based on demand. Unpopular chores get more expensive, popular ones get cheaper. The total weekly payout stays constant; the money just moves between cards.

The entire app is in **Hebrew** and built for families with multiple kids.

---

## How it works

```
Parent creates card → Kid picks it up → Kid completes subtasks → Kid requests approval → Parent approves → Kid gets paid 💰
```

### Card lifecycle

```
available ──► taken ──► pending ──► available (paid out)
    ▲                                    │
    └── suspended (parent hides card) ───┘
```

### Roles

| Role | Hebrew | Can do |
|------|--------|--------|
| Parent | הורה | Create/edit/delete cards, approve tasks, manage kids, adjust prices |
| Kid | ילד | Pick up cards, check off subtasks, request approval, see earnings |

---

## Tech stack

| Layer | Technology | Hosted on |
|-------|-----------|-----------|
| Frontend | Angular + Angular Material | GitHub Pages |
| Backend | Node.js + Express | Render |
| Database | MongoDB + Mongoose | MongoDB Atlas |

---

## Project structure

```
PigHouse/
├── PigHouseFE/          # Angular frontend
├── server/              # Express backend
│   └── src/
│       ├── routes/      # auth, cards, approvals, users
│       ├── middleware/  # auth (X-User-Id header)
│       └── models/      # Family, User, Card (Mongoose)
├── shared/types/        # Shared TypeScript types (used by both FE and BE)
└── .github/workflows/   # Auto-deploy to GitHub Pages on push to main
```

---

## Running locally

**Prerequisites:** Node.js, a MongoDB instance (local or Atlas)

```bash
# 1. Install dependencies
npm install --prefix PigHouseFE
npm install --prefix server

# 2. Create server/.env
echo "MONGO_URI=mongodb://localhost:27017/pighouse" > server/.env
echo "PORT=3000" >> server/.env

# 3. Start both (from repo root)
npm run dev
```

Frontend → `http://localhost:4200`  
Backend → `http://localhost:3000`

---

## Deployment

| | |
|---|---|
| **Frontend** | Automatically deployed to GitHub Pages on every push to `main` |
| **Backend** | Automatically deployed to Render on every push to `main` |
| **Database** | MongoDB Atlas (free tier) |

> **Note:** Render's free tier sleeps after 15 minutes of inactivity. The first request after idle takes ~30 seconds to wake up.

---

## Authentication

MVP-level — no passwords. A family registers with a family name, parent names, and kid names. To log in, you pick your family and your name. The server returns a user object stored in `localStorage`; all API calls include the user ID in an `X-User-Id` header.

Proper auth (hashed passwords, JWT) is planned for a future version.
