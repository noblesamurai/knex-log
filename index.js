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
      .then((inserted) => {
        return knex(config.tableName).first('id', 'created_at')
            // NOTE (tim): sqlite cannot do returning of multiple cols, so we
            // have to requery to get the created_at.
            .where({ id: inserted[0] })
            .then((result) => {
              return { id: result.id, timestamp: result.created_at };
            });
      });
  }

  async function get (offset) {
    return knex(config.tableName).first('id', 'value')
      .where({ id: offset.id })
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
    return knex(config.tableName).select('id', 'value', 'created_at')
      .where('id', '>=', (opts.offset && opts.offset.id) || 0)
      .stream()
      .pipe(streamMap({ objectMode: true }, (obj) => {
        return { offset: { id: obj.id, timestamp: obj.created_at }, value: JSON.parse(obj.value) };
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
