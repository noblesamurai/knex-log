const tape = require('tape');
const it = require('tape-promise').default(tape);
const knexLog = require('..');
const test = require('abstract-log');
const db = process.env.TEST_DATABASE_URL || {
  client: 'sqlite3',
  connection: {
    filename: './mydb.sqlite'
  }
};

let knex;
const common = {
  setup: async (t) => {
    knex = require('knex')(db);
    return knexLog(knex, {
      tableName: 'logs',
      _purgeLog: true
    });
  },
  teardown: async (t, log) => {
    return knex.destroy();
  }
};

test(it, common);
