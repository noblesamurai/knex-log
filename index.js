const stream = require('stream');
const streamMap = require('through2-map');

module.exports = (knex, config) => {
  const columnName = config.columnName || 'value';

  async function open () {
    return knex.schema.createTableIfNotExists(config.tableName, function (table) {
      table.increments();
      table.jsonb(columnName);
      table.timestamps(true, true);
    }).then(() => {
      if (config._purgeLog) return knex(config.tableName).delete();
    });
  }

  async function close () {
    return Promise.resolve();
  }

  async function append (payload) {
    const data = {};
    data[columnName] = JSON.stringify(payload);
    return knex(config.tableName)
      .insert(data)
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
    return knex(config.tableName).first('id', columnName)
      .where({ id: offset.id })
      .then((obj) => {
        return JSON.parse(obj[columnName]);
      });
  }

  function createWriteStream () {
    const ws = stream.Writable({ objectMode: true });
    ws._write = (payload, enc, cb) => {
      const data = {};
      data[columnName] = JSON.stringify(payload);
      return knex(config.tableName)
        .insert(data)
        .then(() => cb())
        .catch(cb);
    };
    return ws;
  }

  function createReadStream (opts = {}) {
    return knex(config.tableName).select('id', columnName, 'created_at')
      .where('id', '>=', (opts.offset && opts.offset.id) || 0)
      .stream()
      .pipe(streamMap({ objectMode: true }, (obj) => {
        return { offset: { id: obj.id, timestamp: obj.created_at }, value: JSON.parse(obj[columnName]) };
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
