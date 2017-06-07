const tape = require('tape');
const it = require('tape-promise').default(tape);
const knexLog = require('..');
const test = require('abstract-log');
const knex = process.env.TEST_DATABASE_URL || {
  client: 'sqlite3',
  connection: {
    filename: './mydb.sqlite'
  }
};

const common = {
  setup: async (t) => {
    return knexLog({
      knex,
      tableName: 'logs',
      _purgeLog: true
    });
  },
  teardown: async (t, log) => {}
};

test(it, common);
