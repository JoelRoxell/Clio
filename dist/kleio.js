'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _logLevels = require('./models/log-levels');

var _logLevels2 = _interopRequireDefault(_logLevels);

var _log = require('./models/log');

var _log2 = _interopRequireDefault(_log);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _whatwgFetch = require('whatwg-fetch');

var _whatwgFetch2 = _interopRequireDefault(_whatwgFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// eslint-disable-line

/**
 * Core class which provides simplified logging capabilities.
 */

var Kleio = function () {
  /**
   * Constructor
   *
   * @param  {String} host comprised hostname.
   * @param  {String} env environment configuration.
   * @param  {Function} postMethod Allow send method to be replaced.
   */

  function Kleio() {
    var host = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var env = arguments.length <= 1 || arguments[1] === undefined ? 'dev' : arguments[1];
    var postMethod = arguments[2];

    _classCallCheck(this, Kleio);

    this._id = Math.random().toString(36).substring(7);
    this._env = env;
    this._host = host;

    // Allow server function to be replaced.
    this._postMethod = typeof postMethod === 'function' ? postMethod : this._defaultPostMethod;
  }

  _createClass(Kleio, [{
    key: '_print',


    /**
     * Prints log model information to console.
     *
     * @param  {Log} log object
     */
    value: function _print(log) {
      var levels = Kleio.levels,
          attr = log.data.attributes;

      switch (attr.level) {
        case levels.ERROR:
          console.error(attr.title, log);
          break;
        case levels.WARN:
          console.warn(attr.title, log);
          break;
        case levels.INFO:
          console.info(attr.title, log);
          break;
        case levels.VERBOSE:
          console.log(attr.title, log);
          break;
        case levels.DEBUG:
          console.debug(attr.title, log);
          break;
        default:
          throw new Error('A log level must be provided to print record.');
      }
    }
  }, {
    key: '_store',
    value: function _store() {}
    // TODO: Store log in localstorage.


    /**
     * Default post method used to send log object to an external service,
     * may be overriden in constructor.
     *
     * @param  {Log}      log object.
     * @param  {Function} cb  callback.
     *
     * @return {Object}   payload sent to server.
     */

  }, {
    key: '_defaultPostMethod',
    value: function _defaultPostMethod(log, cb) {
      var payload = JSON.stringify(log);

      try {
        fetch(this._host, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/vnd.api+json'
          },
          body: payload
        }).then(function (res) {
          if (typeof cb === 'function') {
            cb(null, res);
          }
        }).catch(function (err) {
          if (typeof cb === 'function') {
            cb(err);
          }
        });
      } catch (e) {
        throw e;
      }

      return payload;
    }

    /**
     * Prase the log model to a correct format based on http://jsonapi.org/
     * @param  {Log} log data model
     * @return {Object}  parsed JSON object
     */

  }, {
    key: '_prepareApiLogModel',
    value: function _prepareApiLogModel(log) {
      log.data.userAgent = navigator.userAgent;
      log.data.id = this._id;

      return {
        data: {
          type: 'log',
          attributes: _extends({}, log)
        }
      };
    }

    /**
     * Recoreds the current description, depending on the initial configuration the item will either be sent to console, server and/or localstorage.
     *
     * @param  {String}  title log title
     * @param  {String} description Description of the error or general information of the specific dunction body.
     * @param  {Number} level Error level identification.
     * @param  {String} stacktrace Current stacktrace
     * @param  {Object} data JOSN-object with additional data.
     * @param  {Funciton} cb callback
     *
     * @return {Log} The created log issue.
     */

  }, {
    key: 'record',
    value: function record(title) {
      var description = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
      var level = arguments.length <= 2 || arguments[2] === undefined ? Kleio.levels.DEBUG : arguments[2];
      var stacktrace = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
      var data = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];
      var cb = arguments[5];

      var log = new _log2.default(title, description, level, stacktrace, data);

      log = this._prepareApiLogModel(log);

      if (this._env === Kleio.ENV_MODES.PROD) {
        this._postMethod(log, cb);
      } else {
        this._print(log);
      }

      return log;
    }
  }, {
    key: 'id',
    get: function get() {
      return this._id;
    }
  }, {
    key: 'host',
    get: function get() {
      return this._host;
    }
  }, {
    key: 'levels',
    get: function get() {
      return this._levels;
    }
  }]);

  return Kleio;
}();

Kleio.levels = _logLevels2.default;
Kleio.ENV_MODES = _config2.default.ENV_MODES;

exports.default = Kleio;