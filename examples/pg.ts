import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'loadflux',
  user: 'postgres',
  password: 'password',
});

pool.query(
  `
            INSERT into virtual_user (dataset, time, virtual_user) values ('', now(), '${1}')
          `,
  (err, res) => {
    console.log(err, res);
    pool.end();
  },
);
