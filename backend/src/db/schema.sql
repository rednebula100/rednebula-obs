DROP TABLE IF EXISTS daily_views;
DROP TABLE IF EXISTS projects;

CREATE TABLE projects (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  sub         TEXT,
  description TEXT,
  type        TEXT NOT NULL CHECK(type IN ('GAME','WEB','LIB','TOOL')),
  status      TEXT NOT NULL CHECK(status IN ('LIVE','WIP','ALPHA','ARCHIVED')),
  year        INTEGER,
  mag         REAL,
  seed        REAL,
  ra          TEXT,
  dec         TEXT,
  stack       TEXT NOT NULL DEFAULT '[]',
  live_url    TEXT,
  repo_url    TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE daily_views (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  target_id TEXT    NOT NULL,
  date      TEXT    NOT NULL,
  count     INTEGER NOT NULL DEFAULT 0,
  UNIQUE(target_id, date)
);

CREATE INDEX idx_dv_target_date ON daily_views(target_id, date);
