CREATE TABLE virtual_user (
  dataset       VARCHAR         NOT NULL,
  time          TIMESTAMPTZ     NOT NULL,
  virtual_user  INTEGER         NOT NULL
);

CREATE TABLE request (
  dataset       VARCHAR         NOT NULL,
  time          TIMESTAMPTZ     NOT NULL,
  trace         VARCHAR         NOT NULL,
  scenario      VARCHAR         NOT NULL,
  action        VARCHAR         NOT NULL,
  virtual_user  INTEGER         NOT NULL,
  method        VARCHAR         NOT NULL,
  url           VARCHAR         NOT NULL
);

CREATE TABLE response (
  dataset       VARCHAR         NOT NULL,
  time          TIMESTAMPTZ     NOT NULL,
  trace         VARCHAR         NOT NULL,
  method        VARCHAR         NOT NULL,
  url           VARCHAR         NOT NULL,
  timing_wait  BIGINT          NOT NULL,
  timing_dns   BIGINT          NOT NULL,
  timing_tcp   BIGINT          NOT NULL,
  timing_total BIGINT          NOT NULL,
  status_code   INTEGER         NOT NULL
);

CREATE TABLE success (
  dataset       VARCHAR         NOT NULL,
  time          TIMESTAMPTZ     NOT NULL,
  trace         VARCHAR         NOT NULL,
  status_code   INTEGER         NOT NULL
);

CREATE TABLE failure (
  dataset       VARCHAR         NOT NULL,
  time          TIMESTAMPTZ     NOT NULL,
  trace         VARCHAR         NOT NULL,
  status_code   INTEGER         NOT NULL
);

CREATE TABLE error (
  dataset       VARCHAR         NOT NULL,
  time          TIMESTAMPTZ     NOT NULL,
  trace         VARCHAR         NOT NULL,
  virtual_user  INTEGER         NOT NULL,
  method        VARCHAR         NOT NULL,
  url           VARCHAR         NOT NULL,
  error         VARCHAR         NOT NULL
);

SELECT create_hypertable('virtual_user', 'time');
SELECT create_hypertable('request', 'time');
SELECT create_hypertable('response', 'time');
SELECT create_hypertable('error', 'time');
