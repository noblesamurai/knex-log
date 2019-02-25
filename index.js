const stream = require('stream');
const streamMap = require('through2-map');

/**
 * @module knex-log
 * @param {Knex} knex - knex instance to use, passed in...
 * @param {object} config
 * @description
 * - config.tableName - The table which logs are found in.
 * - config.columnName - The column which logs are found in.
 */
module.exports = (knex, config) => {
  const columnName = config.columnName || 'value';

  /**
   * @async
   * Prepare log for reading.
   */
  async function open () {
    return knex.schema.createTableIfNotExists(config.tableName, function (table) {
      table.increments();
      table.jsonb(columnName);
      table.timestamps(true, true);
    }).then(() => {
      if (config._purgeLog) return knex(config.tableName).delete();
    });
  }

  /**
   * Call this when done.
   */
  async function close () {
    return Promise.resolve();
  }

  /**
   * @async
   * Append to the log.
   * @param {object} payload
   */
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

  /**
   * @async
   * get log at given offset
   * @param {integer} offset
   * @return {object} value
   */
  async function get (offset) {
    return knex(config.tableName).first('id', columnName)
      .where({ id: offset.id })
      .then((obj) => {
        const value = obj[columnName];
        if (typeof value === 'string') return JSON.parse(value);
        return value;
      });
  }

  /**
   * Create a write stream that we can use to append to the log.
   */
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

  /**
   * Create a read stream that we can use to read from the log.
   * @params {object} opts
   * @description
   * - opts.offset.id - The id to read from
   * - opts.highWaterMark - stream high water mark (default 16)
   * - opts.batchSize - number of rows fetched at a time from postgres (default 100)
   */
  function createReadStream (opts = {}) {
    const { offset, ...streamOpts } = opts;
    return knex(config.tableName).select('id', columnName, 'created_at')
      .where('id', '>=', (offset && offset.id) || 0)
      .stream(streamOpts)
      .pipe(streamMap({ objectMode: true }, (obj) => {
        let value = obj[columnName];
        if (typeof value === 'string') value = JSON.parse(value);
        return { offset: { id: obj.id, timestamp: obj.created_at }, value };
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
