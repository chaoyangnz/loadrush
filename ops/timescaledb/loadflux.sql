CREATE TABLE virtual_user (
  dataset       VARCHAR         NOT NULL,
  time          TIMESTAMPTZ     NOT NULL,
  active        INTEGER         NOT NULL
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
  timing_wait   INTEGER         NOT NULL,
  timing_dns    INTEGER         NOT NULL,
  timing_tcp    INTEGER         NOT NULL,
  timing_tls    INTEGER         NOT NULL,
  timing_request    INTEGER         NOT NULL,
  timing_first_byte    INTEGER         NOT NULL,
  timing_download    INTEGER         NOT NULL,
  timing_total  INTEGER         NOT NULL,
  status_code   INTEGER         NOT NULL,
  success       BOOLEAN,
  time_success  TIMESTAMPTZ,
  failure       BOOLEAN,
  time_failure  TIMESTAMPTZ,
  error_capture       BOOLEAN,
  time_error_capture  TIMESTAMPTZ
);

CREATE TABLE error (
  dataset       VARCHAR         NOT NULL,
  time          TIMESTAMPTZ     NOT NULL,
  trace         VARCHAR         NOT NULL,
  virtual_user  INTEGER         NOT NULL,
  method        VARCHAR         NOT NULL,
  url           VARCHAR         NOT NULL,
  error         VARCHAR         NOT NULL,
  error_timeout BOOLEAN,
  error_network BOOLEAN
);

SELECT create_hypertable('virtual_user', 'time');
SELECT create_hypertable('request', 'time');
SELECT create_hypertable('response', 'time');
SELECT create_hypertable('error', 'time');
