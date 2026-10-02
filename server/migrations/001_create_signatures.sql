CREATE TABLE IF NOT EXISTS signatures (
    id          TEXT        PRIMARY KEY,
    name        TEXT        NOT NULL,
    style       TEXT        NOT NULL,
    seed        INTEGER     NOT NULL,
    settings    JSONB       NOT NULL,
    version     INTEGER     NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Safety net: the database refuses bad rows even if the API has a bug
    CONSTRAINT signatures_name_len    CHECK (char_length(name) BETWEEN 1 AND 40),
    CONSTRAINT signatures_style_valid CHECK (style IN ('scripts', 'scriptc', 'timesi', 'futural', 'gothiceng')),
    CONSTRAINT signatures_seed_range  CHECK (seed BETWEEN 0 AND 10000)
);

-- For the Hall of Fame: newest first, paged with a cursor
CREATE INDEX IF NOT EXISTS idx_signatures_newest
    ON signatures (created_at DESC, id DESC);
