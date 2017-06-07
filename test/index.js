const tape = require('tape');
const it = require('tape-promise').default(tape);
const knexLog = require('..');
const test = require('abstract-log');

const common = {
  setup: async (t) => {
    return knexLog();
  },
  teardown: async (t, log) => {}
};

test(it, common);
