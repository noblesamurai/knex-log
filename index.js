const Knex = require('knex');
const stream = require('stream');
const streamMap = require('through2-map');

// TODO(tim): Should send the timestamps through if they exist... i.e. created_at, updated_at

module.exports = (config) => {
  const knex = Knex(config.knex);

  async function open () {
    return knex.schema.createTableIfNotExists(config.tableName, function (table) {
      table.increments();
      table.jsonb('value');
      table.timestamps(true, true);
    }).then(() => {
      if (config._purgeLog) return knex(config.tableName).delete();
    });
  }

  async function close () {
    return knex.destroy();
  }

  async function append (payload) {
    return knex(config.tableName)
      .insert({ value: JSON.stringify(payload) })
      .returning('id')
      .then((result) => result[0]);
  }

  async function get (offset) {
    return knex(config.tableName).select('id', 'value')
      .first({ id: offset })
      .then((obj) => {
        return JSON.parse(obj.value);
      });
  }

  function createWriteStream () {
    const ws = stream.Writable({ objectMode: true });
    ws._write = (payload, enc, cb) => {
      return knex(config.tableName)
        .insert({ value: JSON.stringify(payload) })
        .then(() => cb())
        .catch(cb);
    };
    return ws;
  }

  function createReadStream (opts = {}) {
    return knex(config.tableName).select('id', 'value')
      .where('id', '>=', opts.offset || 0)
      .stream()
      .pipe(streamMap({ objectMode: true }, (obj) => {
        return { offset: obj.id, value: JSON.parse(obj.value) };
      }));
  }

  return {
    open,
    close,
    append,
    get,
    createWriteStream,
    createReadStream
  };
};
