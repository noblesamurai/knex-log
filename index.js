const Knex = require('knex');
const stream = require('stream');

module.exports = (config) => {
  const knex = Knex(config.knex);

  return {
    open: async () => {
      return knex.schema.createTableIfNotExists(config.tableName, function (table) {
        table.increments();
        table.json('value');
        table.timestamps(true, true);
      }).then(() => {
        if (config._purgeLog) return knex(config.tableName).delete();
      });
    },
    close: async () => knex.destroy(),
    append: async (payload) => knex(config.tableName).insert({ value: JSON.stringify(payload) }).returning('id').then((result) => result[0]),
    get: async () => { return { msg: 'hello world' }; },
    createWriteStream: () => {
      const ws = stream.Writable({ objectMode: true });
      ws._write = (payload, enc, cb) => {
        return knex(config.tableName).insert({ value: JSON.stringify(payload) }).then(() => cb()).catch(cb);
      };
      return ws;
    },
    createReadStream: (opts = {}) => {
      return knex(config.tableName).select('id', 'value').where('id', '>=', opts.offset || 0)
        .stream()
        .pipe(new stream.Transform({
          objectMode: true,
          transform (chunk, encoding, callback) {
            let value;
            try {
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
    },
    _knex: knex
  };
};
