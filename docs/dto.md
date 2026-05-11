# API Contract — DTOs

All requests and responses use `Content-Type: application/json`.  
All timestamps are ISO 8601 strings (`"2026-05-11T08:00:00.000Z"`).  
All money values are numbers in ₪ (shekel), two decimal places.  
Every authenticated request carries `Authorization: Bearer <token>`.

---

## Shared Types

### `CompletedCard`
```ts
{
  cardId:      string
  cardTitle:   string   // snapshot of title at approval time
  amount:      number
  completedAt: string
}
```

### `User`
```ts
{
  id:             string
  familyId:       string
  name:           string
  role:           'parent' | 'kid'
  balance:        number           // current unpaid earnings — kids only, 0 for parents
  completedCards: CompletedCard[]  // full history — kids only, [] for parents
  createdAt:      string
}
```

### `Subtask`
```ts
{
  id:   string
  text: string
  done: boolean
}
```

### `Card`
```ts
{
  id:        string
  familyId:  string
  title:     string
  subtasks:  Subtask[]
  price:     number
  state:     'suspended' | 'available' | 'taken' | 'pending'
  takenBy:   string | null   // userId of the kid holding it, null otherwise
  createdAt: string
  updatedAt: string
}
```

### Error response (all endpoints)
```ts
{
  error: string              // human-readable message (Hebrew or English)
}
```

---

## Auth

### `POST /api/auth/register`
Create a new family + initial parent account.

**Request**
```ts
{
  familyName:   string
  parentName:   string
  password:     string
}
```

**Response `201`**
```ts
{
  token: string
  user:  User
}
```

---

### `POST /api/auth/login`
Login as a family member.

**Request**
```ts
{
  familyName: string
  userName:   string
  password:   string
}
```

**Response `200`**
```ts
{
  token: string   // JWT — carries familyId, userId, role
  user:  User
}
```

---

## Users

### `GET /api/users`
List all members of the calling user's family.  
**Role:** parent

**Response `200`**
```ts
User[]
```

---

### `POST /api/users`
Add a new family member.  
**Role:** parent

**Request**
```ts
{
  name:     string
  role:     'parent' | 'kid'
  password: string
}
```

**Response `201`**
```ts
User
```

---

### `GET /api/users/:id/history`
Earnings history for a user — returns the `completedCards` array from the user record.  
**Role:** all (kids can only fetch their own)

**Response `200`**
```ts
CompletedCard[]
```

---

## Cards

### `GET /api/cards`
List all cards for the family.  
Kids receive only `available` and `taken` cards (`suspended` is hidden).  
**Role:** all

**Response `200`**
```ts
Card[]
```

---

### `POST /api/cards`
Create a new card.  
**Role:** parent

**Request**
```ts
{
  title:    string
  subtasks: { text: string }[]
  price:    number
}
```

**Response `201`**
```ts
Card
```

---

### `PUT /api/cards/:id`
Update a card's editable fields.  
**Role:** parent

**Request**
```ts
{
  title?:    string
  price?:    number
  subtasks?: {
    id?:  string   // omit to add new; include to update existing
    text: string
  }[]
}
```

**Response `200`**
```ts
Card
```

---

### `DELETE /api/cards/:id`
Delete a card.  
**Role:** parent

**Response `204`** — no body

---

### `PATCH /api/cards/:id/state`
Transition a card to a new state (server validates role + allowed transitions).  
**Role:** * (role-checked per transition rules)

**Request**
```ts
{
  state: 'suspended' | 'available' | 'taken' | 'pending'
}
```

**Response `200`**
```ts
Card
```

---

### `PATCH /api/cards/:id/subtasks/:subtaskId`
Toggle a subtask's completion.  
Only allowed while card is `taken`, by the kid who holds it.  
**Role:** kid

**Request**
```ts
{
  done: boolean
}
```

**Response `200`**
```ts
Subtask
```

---

## Approvals

### `GET /api/approvals`
List all cards in `pending` state.  
**Role:** parent

**Response `200`**
```ts
Card[]
```

---

### `POST /api/approvals/:id/approve`
Approve a pending card — credits the kid, resets card to `available`.  
**Role:** parent

**Response `200`**
```ts
{
  card:        Card   // state is now 'available'
  updatedUser: User   // kid's updated balance + completedCards
}
```

---

### `POST /api/approvals/:id/reject`
Reject a pending card — reverts to `taken`.  
**Role:** parent

**Response `200`**
```ts
Card   // state is now 'taken'
```
