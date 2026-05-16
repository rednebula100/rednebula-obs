DROP TABLE IF EXISTS daily_views;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS project_meta;

-- Extra metadata for GitHub repos.
-- If a repo has no row here it still shows up with auto-generated defaults.
CREATE TABLE project_meta (
  repo_name       TEXT PRIMARY KEY,
  type            TEXT NOT NULL DEFAULT 'WEB' CHECK(type IN ('GAME','WEB','LIB','TOOL')),
  sub             TEXT,
  mag             REAL,
  seed            REAL,
  ra              TEXT,
  dec             TEXT,
  stack           TEXT NOT NULL DEFAULT '[]',
  override_status TEXT CHECK(override_status IN ('LIVE','WIP','ALPHA','ARCHIVED') OR override_status IS NULL)
);

CREATE TABLE daily_views (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  target_id TEXT    NOT NULL,
  date      TEXT    NOT NULL,
  count     INTEGER NOT NULL DEFAULT 0,
  UNIQUE(target_id, date)
);

CREATE INDEX idx_dv_target_date ON daily_views(target_id, date);
