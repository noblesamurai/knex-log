const Knex = require('knex');
const stream = require('stream');

module.exports = (config) => {
  const knex = Knex(config.knex);

  async function open () {
    return knex.schema.createTableIfNotExists(config.tableName, function (table) {
      table.increments();
      table.json('value'); // FIXME(tim): Use jsonb for PG
      table.timestamps(true, true);
    }).then(() => {
      if (config._purgeLog) return knex(config.tableName).delete();
    });
  }

  async function close () {
    return knex.destroy();
  }

  async function append (payload) {
    return knex(config.tableName).insert({ value: JSON.stringify(payload) }).returning('id').then((result) => result[0]);
  }

  async function get () {
    return { msg: 'hello world' };
  }

  function createWriteStream () {
    const ws = stream.Writable({ objectMode: true });
    ws._write = (payload, enc, cb) => {
      return knex(config.tableName).insert({ value: JSON.stringify(payload) }).then(() => cb()).catch(cb);
    };
    return ws;
  }

  function createReadStream (opts = {}) {
    return knex(config.tableName).select('id', 'value').where('id', '>=', opts.offset || 0)
      .stream()
      .pipe(new stream.Transform({
        objectMode: true,
        transform (chunk, encoding, callback) {
          let value;
          try {
            // FIXME(tim) What happens when using PG?
            value = JSON.parse(chunk.value);
          } catch (e) {
            return callback(e);
          }
          callback(null, {
            offset: chunk.id,
            value
          });
        }
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
