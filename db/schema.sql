CREATE TABLE families (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id  UUID          NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name       TEXT          NOT NULL,
  role       TEXT          NOT NULL CHECK (role IN ('parent', 'kid')),
  balance    NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE(family_id, name)
);

CREATE TABLE cards (
  id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id  UUID          NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title      TEXT          NOT NULL DEFAULT '',
  price      NUMERIC(10,2) NOT NULL DEFAULT 10,
  state      TEXT          NOT NULL DEFAULT 'available'
               CHECK (state IN ('suspended', 'available', 'taken', 'pending')),
  taken_by   UUID          REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE subtasks (
  id       UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id  UUID    NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  text     TEXT    NOT NULL,
  done     BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE completed_cards (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id      UUID          REFERENCES cards(id) ON DELETE SET NULL,
  card_title   TEXT          NOT NULL,
  amount       NUMERIC(10,2) NOT NULL,
  completed_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on cards
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
