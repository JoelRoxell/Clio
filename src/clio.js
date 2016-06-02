import levels from 'models/log-levels';
import Log from 'models/log';
import crypto from 'crypto';

/**
 * Core class which provides simplified logging capabilities.
 */
class Clio {
  /**
   * Constructor
   * @param  {String} socket comprised host name.
   * @param  {String} env environment configuration.
   */
  constructor(socket = '', env = 'dev') {
    this._id = crypto.randomBytes(8).toString('hex');
    this._env = env;

    Object.assign(this, this._splitHostFromPath(socket));
  }

  get host() {
    return this._host;
  }

  get port() {
    return this._port;
  }

  get levels() {
    return this._levels;
  }

  /**
   * [_splitHostFromPath description]
   * @param  {[type]} url [description]
   * @return {[type]}     [description]
   */
  _splitHostFromPath(url) {
    if (typeof url !== 'string') {
      throw new Error('Passted socket configuration must be of type string');
    }

    const hostConfig = url.split(':');

    return {
      _host: hostConfig[0],
      _port: parseInt(hostConfig[1], 10)
    };
  }

  /**
   * [_send description]
   * @param  {[type]}   log [description]
   * @param  {Function} cb  [description]
   */
  _send(log, cb) {
    const postData = JSON.stringify(log);

    fetch(
      this._host,
      'POST',
      {
        body: postData
      }
    ).then(res => {
      if (typeof cb === 'function') {
        cb(null, res);
      }
    }).catch(err => {
      console.log(err);
      cb(err);
    });
  }

  /**
   * Recoreds the current description, depending on the initial configuration the item will either be sent to console, server and/or localstorage.
   * @param  {String} description Description of the error or general information of the specific dunction body.
   * @param  {Number} level Error level identification.
   * @param  {Object=} stacktrace Current stacktrace
   * @param  {Object=} data JOSN-object with additional data.
   */
  record(
    description = '',
    level = this.levels.DEBUG,
    stacktrace = {},
    data = {}
  ) {
    if (this._env === Clio.ENV_MODES.PROD) {
      this._send(new Log(...arguments));
    }

    console.log(description, stacktrace, level, data);
  }
}

Clio.levels = levels;

export default Clio;
