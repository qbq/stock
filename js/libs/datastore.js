(typeof ArrayBuffer==='undefined')&&(ArrayBuffer=function(){});(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define(["connection","protobufjs","yfloat"],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.DataStore = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
// 添加依赖Promise
if (typeof Promise === 'undefined') {
  global.Promise = require('promise');
}
module.exports = require('./lib/DataStore');
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./lib/DataStore":3,"promise":15}],2:[function(require,module,exports){
// 数据解析接口
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var DataParser = (function () {
  function DataParser() {
    _classCallCheck(this, DataParser);
  }

  _createClass(DataParser, [{
    key: 'parse',

    // 解析数据
    // @return {Promise}
    value: function parse(data) {
      return Promise.reject('未实现');
    }
  }]);

  return DataParser;
})();

exports['default'] = DataParser;
module.exports = exports['default'];
},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _util = require('./util');

var $ = _interopRequireWildcard(_util);

var _dzhyunDzhyunDataParser = require('./dzhyun/DzhyunDataParser');

var _dzhyunDzhyunDataParser2 = _interopRequireDefault(_dzhyunDzhyunDataParser);

var _dzhyunDzhyunTokenManager = require('./dzhyun/DzhyunTokenManager');

var _dzhyunDzhyunTokenManager2 = _interopRequireDefault(_dzhyunDzhyunTokenManager);

var connection;
try {
  connection = require('connection');
} catch (err) {
  connection = window.connection;
}

var Request = (function () {
  function Request(qid, key, filter, subscribe, queryObject) {
    var _this = this;

    _classCallCheck(this, Request);

    this._promise = new Promise(function (resolve, reject) {
      _this.resolve = resolve;
      _this.reject = reject;
    });
    this.qid = qid;
    this.key = key;
    this.filter = filter;
    this.subscribe = subscribe;
    this.callbacks = [];
    this.queryObject = queryObject;
  }

  _createClass(Request, [{
    key: 'response',
    value: function response(data) {
      this.resolve(data);
      this.callbacks.forEach(function (callback) {
        callback(data);
      });
    }
  }, {
    key: 'error',
    value: function error(err) {
      var e = new Error(err);
      this.reject(e);
      this.callbacks.forEach(function (callback) {
        callback(e);
      });
    }
  }, {
    key: 'then',
    value: function then() {
      var _promise;

      return (_promise = this._promise).then.apply(_promise, arguments);
    }
  }, {
    key: 'catch',
    value: function _catch() {
      var _promise2;

      return (_promise2 = this._promise)['catch'].apply(_promise2, arguments);
    }
  }]);

  return Request;
})();

var DataStore = (function () {
  _createClass(DataStore, null, [{
    key: '_generateQid',

    // 生成请求序号，递增序号
    value: function _generateQid() {
      return DataStore._qid = (DataStore._qid || 0) + 1;
    }
  }, {
    key: 'cancel',

    /**
     * 取消全部datastore请求
     */
    value: function cancel() {
      DataStore._datastores.forEach(function (datastore) {
        datastore.cancel();
      });
    }
  }, {
    key: '_datastores',
    value: [],
    enumerable: true
  }]);

  function DataStore(options) {
    _classCallCheck(this, DataStore);

    options = options || {};

    /**
     * {'auto'|boolean} cache缓存规则，默认auto表示根据请求订阅与否决定是否缓存，订阅的请求数据会被缓存，非订阅则不缓存
     * true，则一定都缓存，每次query一定先从缓存查找
     * false，则一定不缓存，每次query一定请求数据
     */
    this.cacheEnable = typeof options.cacheEnable === 'undefined' ? 'auto' : options.cacheEnable;

    /** {String} 连接的服务器地址 */
    this.address = options.address || this.constructor.address;

    /** {String} 请求数据的返回类型 pb|json */
    this.dataType = options.dataType || this.constructor.dataType || 'pb';

    /** {String} 请求的服务url */
    this.serviceUrl = options.serviceUrl;

    /** {String} 请求数据的连接类型 http|ws，不指定的话在请求时根据address定 */
    this.connectionType = options.connectionType;

    /** {boolean} 是否创建独立连接 */
    this.alone = options.alone || false;

    /**
     * {String|Array|Object.<String, String>}
     * 请求的字段，字符串需要‘,’分隔，对象表示需要做字段映射，key是服务提供字段名，value是对应要转换的字段名
     */
    this.fields = options.fields;

    this.dataParser = options.dataParser || new _dzhyunDzhyunDataParser2['default'](this.serviceUrl);

    /**
     * 其它参数
     * @see <http://dms.gw.com.cn/pages/viewpage.action?pageId=128057536#id-请求格式-APP参数>
     *
     * begin_time
     * end_time
     * start
     * count
     * period
     * prefix
     * split
     * name
     * parameter
     * type
     */
    this.otherParams = options.otherParams;

    /** 请求连接 */
    this.conn = null;

    /** 数据的id属性名称（主键），cache中以查询参数中该属性的值为key存储缓存，默认是查询对象obj */
    this.idProperty = options.idProperty || 'obj';

    ///** pb格式message类型 */
    //  Message: null,
    //
    //  dataAdapter: new MSGAdapter(),

    /** {Object.<String, Array>}*/
    this.cache = {};

    this.requestQueue = {};

    // 云平台访问token（暂时）
    this.token = options.token || this.constructor.token;

    this.tokenManager = options.tokenManager || this.constructor.tokenManager;

    this.pushInterval = options.pushInterval || this.constructor.pushInterval;

    DataStore._datastores.push(this);
  }

  // 创建连接，考虑连接共用

  _createClass(DataStore, [{
    key: '_connection',
    value: function _connection() {
      if (this.conn === null) {
        var map = DataStore._connMap = DataStore._connMap || {};
        var address = this.address;
        var conn;
        if (this.alone === false) {
          conn = map[address];
        }
        if (!conn) {
          var options = { deferred: true };
          conn = this.connectionType ? connection[this.connectionType](address, options) : connection(address, options);

          if (this.alone === false) {
            map[address] = conn;
          }
        }
        this.conn = conn;

        // 实际连接方式
        this.connectionType = conn._protocol;

        this.conn.on('open', this._open.bind(this));
        this.conn.on('request', this._request.bind(this));
        this.conn.on('response', this._response.bind(this));
        this.conn.on('close', this._close.bind(this));
        this.conn.on('error', this._error.bind(this));
      }
    }
  }, {
    key: '_open',
    value: function _open() {}
  }, {
    key: '_request',
    value: function _request() {}

    /**
     * 存储数据
     * @param data
     * @private
     */
  }, {
    key: '_store',
    value: function _store(data) {
      var _this2 = this;

      var objs = Object.keys(data);
      objs.forEach(function (obj) {

        var cacheForObj = _this2.cache[obj];
        var dataForObj = data[obj];

        // 判断数据是数组则追加缓存
        if (dataForObj instanceof Array) {
          cacheForObj = cacheForObj || [];
          cacheForObj.push.apply(cacheForObj, dataForObj);
          _this2.cache[obj] = cacheForObj;
        } else {
          _this2.cache[obj] = dataForObj;
        }
      });
    }
  }, {
    key: '_response',
    value: function _response(data) {
      var _this3 = this;

      this.dataParser.parse(data).then(function (response) {
        var qid = response.qid;
        var data = response.data;

        var request = _this3.requestQueue[qid];
        if (!request) {
          return;
        }

        if (_this3.cacheEnable) {
          _this3._store(data);
        }

        var resultData = data;
        if (request.filter) {
          resultData = _this3._filter(data, request.filter);
        }
        request.response(resultData);

        if (request.subscribe !== true) {
          delete _this3.requestQueue[qid];
        } else if (_this3.connectionType === 'http') {

          var nextRequest = function nextRequest() {

            // 对于http方式订阅则定时再次查询
            setTimeout(function () {

              // 暂停请求则不做下一次的请求，同时定时下次判断
              if (DataStore.pause === true) {
                nextRequest();
              } else if (request.start) {
                request.start();
              }
            }, _this3.pushInterval);
          };
          nextRequest();
        }
      })['catch'](function (response) {
        var qid = response.qid;
        var error = response.error;

        var request = _this3.requestQueue[qid];
        if (request) {
          request.error(error);
          if (request.subscribe !== true) {
            delete _this3.requestQueue[qid];
          }
        }
      });
    }
  }, {
    key: '_close',
    value: function _close() {

      // 连接关闭时，调用当前请求的错误回调方法，并且将请求全部取消
      var requestQueue = this.requestQueue;
      var keys = Object.keys(requestQueue);
      keys.forEach(function (qid) {
        var request = requestQueue[qid];
        request.error('connection close');
      });

      this.conn = null;
      this.cancel();
    }
  }, {
    key: '_error',
    value: function _error() {

      // 连接请求错误时，调用当前请求的错误回调方法
      var requestQueue = this.requestQueue;
      var keys = Object.keys(requestQueue);
      keys.forEach(function (qid) {
        var request = requestQueue[qid];
        request.error('request error');
      });
    }

    /**
     * 从缓存中查询指定obj的数据，filter做数据筛选
     * @param {?string} obj
     * @param {function|string|Object} filter
     * @return {boolean.<false>|Object} 返回false表示未找到指定obj的缓存数据，否则应该返回经过filter筛选过的数据
     * @private
     */
  }, {
    key: '_queryCache',
    value: function _queryCache(obj, filter) {

      if (this.cacheEnable === false) {
        return false;
      }
      var data;

      // 如果obj存在则根据obj找出cache中的待选数据
      if (obj) {
        var data = this.cache[obj];
        if (!data) {
          return false;
        }
        return this._filter(data, filter);
      } else {
        // 否则obj不存在则从全部的cache中做筛选
        return this._filter(this.cache, filter);
      }
    }

    /**
     * 使用指定的筛选器筛选data中数据，返回筛选结果
     * @param {Object|Array} data
     * @param {function|string|Object}filter
     * @returns {*}
     * @private
     */
  }, {
    key: '_filter',
    value: function _filter(data, filter) {

      var d = !(data instanceof Array) ? [data] : data;
      if (typeof filter === 'function') {
        return d.filter(filter);
      } else if (typeof filter === 'string') {
        return JSONSelect.match(filter, d);
      } else if (typeof filter === 'object') {
        var selector = [];
        var keys = Object.keys(filter);
        keys.forEach(function (key) {
          var value = filter[key];
          selector.push(':has(.' + key + ':expr(x' + value + '))');
        });
        selector = selector.join('');
        return d.filter(function (eachData) {
          return JSONSelect.match(selector, eachData).length > 0;
        });
      }
      return data;
    }
  }, {
    key: '_requestParams',
    value: function _requestParams(qid, obj, subscribe) {
      var params = {
        qid: qid,
        sub: subscribe && this.connectionType === 'ws' ? 1 : 0,
        output: this.dataType
      };

      var fieldStr = this._requestFieldStr();
      fieldStr ? params.field = fieldStr : null;

      return $.param($.extend(params, obj, this.otherParams));
    }
  }, {
    key: '_requestFieldStr',
    value: function _requestFieldStr() {
      if (!this.fields) {
        return null;
      } else if (this.fields instanceof Array) {
        return this.fields.join(',');
      } else if (typeof this.fields === 'object') {
        return Object.keys(this.fields).join(',');
      } else {
        return this.fields;
      }
    }

    /**
     * 查询数据
     * @param {Object|string} queryObject 查询对象
     * @param {Object} options 查询参数
     *  obj: {string|Array} 查询对象，obj key值对应着idProperty中指定的属性值
     *    string，是以逗号分割的多个obj
     *  filter: {?function|string|Object} 数据筛选条件，注意设置了filter情况，返回的每一个obj的数据肯定是数组
     *    function，对于每一条数据调用该function，返回true和false表示是否选中
     *    string，使用JSONSelect对于数据进行筛选 @see <http://jsonselect.org/>
     *      example: ':has(:root > .Open:expr(x>=100)):has(.Last:expr(x=100))'
     *    Object，筛选条件的数据对象,使用的也是JSONSelect的:expr，具体查看@see <http://jsonselect.org/#docs/>
     *      example:
     *      {
     *        Open: '>=100',
     *        Last: '=100'
     *        ...
     *      }
     *  subscribe: {?boolean} 是否订阅，默认false
     *  partial: {?boolean} 订阅请求时，返回是增量数据还是全量数据，默认true返回增量数据，(非订阅请求返回都是全量)
     *
     *  @return {Promise}
     */
  }, {
    key: 'query',
    value: function query(queryObject, options, cb) {
      var _this4 = this;

      var o = options || {},
          filter = o.filter;

      // 如果queryObject不存在则从缓存中筛选数据
      if (!queryObject) {

        // filter存在则是从cache中过滤所有数据
        if (filter) {
          return Promise.resolve(this._queryCache(null, filter));
        } else {
          return Promise.reject(new Error('query object is null'));
        }
      }

      // 如果查询对象是字符串则反序列化为对象
      if (typeof queryObject === 'string') {
        queryObject = $.unParam(queryObject);
      }

      var key = queryObject[this.idProperty],
          subscribe = o.subscribe || false,
          forceRequest = o.request,
          partial = o.partial !== false;

      if (key instanceof Array) {
        queryObject[this.idProperty] = key.join(',');
      }

      if (!!key && forceRequest !== true) {

        var request;

        // 判断查询对象是否已请求，已请求过则直接返回请求对象
        var keys = Object.keys(this.requestQueue);
        if (keys.some(function (qid) {
          var r = _this4.requestQueue[qid];
          if (r.key && r.key.toString() === key.toString()) {
            cb && r.callbacks.push(cb);
            request = r;
            return true;
          }
        })) {
          return request;
        }

        // 不是订阅则尝试从缓存中找到数据方法
        if (subscribe !== true && this.cacheEnable !== false) {
          var obj = key;
          if (typeof obj === 'string') {
            obj = obj.split(',').map(function (eachObj) {
              return eachObj.trim();
            });
          }
          var result = [];
          if (obj.every(function (eachObj) {
            var data = _this4._queryCache(eachObj, filter);
            if (data !== false) {
              result[eachObj] = data;
              return true;
            } else {
              return false;
            }
          }) === true) {
            return Promise.resolve(result);
          }
        }
      }

      // 连接
      this._connection();

      var options;

      if (this.connectionType === 'http') {

        // http协议不支持订阅
        //subscribe = false;
        if (this.dataType === 'pb') {

          // 如果以http协议请求pb格式数据时，需设置额外参数以指定响应数据是二进制数据
          options = {
            dataType: 'arraybuffer'
          };
        }
      }
      var qid = DataStore._generateQid();
      var params = this._requestParams(qid, queryObject, subscribe);

      var request = new Request(qid, key, filter, subscribe, queryObject);
      this.requestQueue[qid] = request;
      cb && request.callbacks.push(cb);

      // 附加token处理
      Promise.resolve(this.token || this.tokenManager && this.tokenManager.getToken()).then(function (token) {
        if (token) {

          // 如果ws方式则修改conn的地址添加上token
          if (_this4.connectionType === 'ws' && _this4.conn._address.indexOf('token=') < 0) {
            _this4.conn._address = _this4.conn._address + '?token=' + token;
          } else if (_this4.connectionType === 'http') {
            params = params + '&token=' + token;
          }
        }

        request.start = function () {
          _this4.conn.request(_this4.serviceUrl + '?' + params, options);
        };
        request.start();
      })['catch'](function (data) {

        // 请求token失败，尝试不带token请求服务
        request.start = function () {
          _this4.conn.request(_this4.serviceUrl + '?' + params, options);
        };
        request.start();
      });

      return request;

      //// 否则通过连接请求数据
      //var qid = this._generateQid();
      //var params = this._requestParams(qid, obj, subscribe);
      //var request = this.conn.request(this.serviceUrl, params, options).always(DataStore._response);
      //
      //// 封装request
      //request = _wrapperRequest(request, {
      //  qid: qid,
      //  obj: obj,
      //  deferreds: [deferred],
      //  subscribe: subscribe,
      //  dataStore: this
      //});
      //
      //this.requestQueue[qid] = request;
      //
      //return deferred;
    }
  }, {
    key: 'request',
    value: function request(queryObject, options) {
      return this.query(queryObject, $.extend(options, {
        subscribe: false,
        request: true
      }));
    }
  }, {
    key: 'subscribe',
    value: function subscribe(queryObject, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      } else {
        options = options || {};
      }
      return this.query(queryObject, $.extend(options, {
        subscribe: true
      }), cb);
    }
  }, {
    key: '_cancelRequest',
    value: function _cancelRequest(qid) {
      if (this.connectionType === 'ws') {
        this.conn && this.conn.request('/cancel?' + $.param({
          qid: qid
        }));
      }
    }

    /**
     * 取消查询
     * @param number|string qid|obj
     */
  }, {
    key: 'cancel',
    value: function cancel(arg) {
      var _this5 = this;

      if (typeof arg === 'number') {
        var qid = arg;
        this._cancelRequest(qid);
        delete this.requestQueue[qid];
      } else {
        var requestQueue = this.requestQueue;
        var keys = Object.keys(requestQueue);
        keys.forEach(function (qid) {
          var request = requestQueue[qid];
          if (!arg || request.key === arg) {
            _this5._cancelRequest(qid);
            delete request.start;
            delete requestQueue[qid];
          }
        });
      }
    }

    /**
     * 重置store
     */
  }, {
    key: 'reset',
    value: function reset(options) {

      // 取消当前请求，
      this.cancel();

      // 带入新的设置项
      $.extend(this, options);

      // 清理之前的缓存以及设置
      this.cache = {};

      this.requestQueue = {};

      this.conn = null;
    }
  }]);

  return DataStore;
})();

exports['default'] = DataStore;

DataStore.address = null;
DataStore.datatype = 'pb';
DataStore.pushInterval = 5000;

// 全局暂停标识，对于http订阅数据有效，默认为false
DataStore.pause = false;
module.exports = exports['default'];
},{"./dzhyun/DzhyunDataParser":4,"./dzhyun/DzhyunTokenManager":5,"./util":14,"connection":"connection"}],4:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _DataParser2 = require('../DataParser');

var _DataParser3 = _interopRequireDefault(_DataParser2);

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _adapterMSGAdapter = require('./adapter/MSGAdapter');

var _adapterMSGAdapter2 = _interopRequireDefault(_adapterMSGAdapter);

var _adapterMSGDirectAdapter = require('./adapter/MSGDirectAdapter');

var _adapterMSGDirectAdapter2 = _interopRequireDefault(_adapterMSGDirectAdapter);

var _pbTable = require('./pbTable');

var _pbTable2 = _interopRequireDefault(_pbTable);

var _yfloat = require('yfloat');

var _yfloat2 = _interopRequireDefault(_yfloat);

var adapterMap = {
  _default: new _adapterMSGAdapter2['default'](),
  _direct: new _adapterMSGDirectAdapter2['default'](),
  'news': new _adapterMSGDirectAdapter2['default']()
};

var DzhyunDataParser = (function (_DataParser) {
  _inherits(DzhyunDataParser, _DataParser);

  function DzhyunDataParser(service) {
    _classCallCheck(this, DzhyunDataParser);

    _get(Object.getPrototypeOf(DzhyunDataParser.prototype), 'constructor', this).call(this);
    this.service = service;
    this.direct = false;
  }

  _createClass(DzhyunDataParser, [{
    key: 'parse',
    value: function parse(data) {
      var uaResponse = _parser2['default'].parse(data, 'UAResponse');
      data = uaResponse.Data;
      if (uaResponse.Err !== 0) {
        return Promise.reject({
          qid: uaResponse.Qid,
          error: data ? typeof data === 'string' ? data : data.toUTF8 ? data.toUTF8() : data.toString() : 'unknown error'
        });
      } else {
        return Promise.resolve({
          qid: uaResponse.Qid,

          // 待解析数据
          data: this._adapter(_parser2['default'].parse(data, 'MSG'))
        });
      }
    }

    // 根据service进行数据转换
  }, {
    key: '_adapter',
    value: function _adapter(data) {
      var _this = this;

      if (!data) {
        return data;
      }
      var keys = Object.keys(adapterMap);
      var adapter = this.direct ? adapterMap._direct : adapterMap._default;
      keys.some(function (key) {
        if (_this.service.indexOf(key) >= 0) {
          adapter = adapterMap[key];
          return true;
        }
      });
      return adapter.adapt(data);
    }
  }]);

  return DzhyunDataParser;
})(_DataParser3['default']);

exports['default'] = DzhyunDataParser;

DzhyunDataParser.parser = _parser2['default'];
DzhyunDataParser.MSGAdapter = _adapterMSGAdapter2['default'];
DzhyunDataParser.pbTable = _pbTable2['default'];
DzhyunDataParser.yfloat = _yfloat2['default'];

// 将DzhyunDataParser暴露到全局，便于外部使用（之后应该要从datastore中提出成单独模块）
var _global = global || undefined;
_global.DzhyunDataParser = DzhyunDataParser;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../DataParser":2,"./adapter/MSGAdapter":7,"./adapter/MSGDirectAdapter":8,"./parser":11,"./pbTable":12,"yfloat":"yfloat"}],5:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _connection = require('connection');

var _connection2 = _interopRequireDefault(_connection);

var _util = require('../util');

var util = _interopRequireWildcard(_util);

var _DzhyunDataParser = require('./DzhyunDataParser');

var _DzhyunDataParser2 = _interopRequireDefault(_DzhyunDataParser);

/**
 * 云平台Token管理（暂时）
 */

var DzhyunTokenManager = (function () {

  /**
   * @param {string} address 服务器地址
   * @param {Object=} params 请求token相关的参数 <http://dms.gw.com.cn/pages/viewpage.action?pageId=135299522>
   * @param {number=} refreshSecond 自动刷新token时间秒数，每隔指定时间则自动刷新当前token，设置为0表示不自动刷新token，不设置或者null则表示根据请求到的数据中duration来计算刷新时间
   */

  function DzhyunTokenManager(address, params, refreshSecond) {
    _classCallCheck(this, DzhyunTokenManager);

    this.address = address;
    this.params = params;
    this.refreshSecond = refreshSecond;
  }

  // 将DzhyunTokenManager暴露到全局，便于外部使用（之后应该要从datastore中提出成单独模块）

  _createClass(DzhyunTokenManager, [{
    key: '_request',
    value: function _request(service, params) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _connection2['default'].https(_this.address, {}, {
          response: resolve,
          error: reject
        }).request(service + '?' + util.param(params));
      }).then(function (data) {
        return new _DzhyunDataParser2['default'](service).parse(data);
      }).then(function (data) {
        data = data.data[0];
        if (data.result == 0) {
          return data;
        } else {
          throw data;
        }
      });
    }

    /**
     * 请求访问token
     * @param {Object} params <http://dms.gw.com.cn/pages/viewpage.action?pageId=135299522>
     * @returns {Promise.<T>}
     */
  }, {
    key: 'access',
    value: function access(params) {
      return this._request('/token/access', params);
    }

    /**
     * 刷新访问token
     * @param {Object} params <http://dms.gw.com.cn/pages/viewpage.action?pageId=135299522>
     * @returns {Promise.<T>}
     */
  }, {
    key: 'refresh',
    value: function refresh(params) {
      return this._request('/token/refresh', params);
    }

    /**
     * 得到当前token,为空则请求新的token
     */
  }, {
    key: 'getToken',
    value: function getToken() {
      var _this2 = this;

      return this._promise || (this._promise = Promise.resolve(this._token || this.access(this.params).then(function (data) {
        _this2._token = data.token;
        _this2._promise = null;

        // 自动刷新token
        _this2._refreshToken(data);
        return _this2._token;
      })));
    }

    /**
     * 自动刷新token处理
     * @private
     */
  }, {
    key: '_refreshToken',
    value: function _refreshToken(data) {
      var _this3 = this;

      var lastTime = data.create_time || data.refresh_time;
      var duration = parseInt(data.duration);

      var refreshSecond = this.refreshSecond;
      if (refreshSecond !== 0) {
        refreshSecond = refreshSecond || Math.max(duration - 60, 10);
        this._refreshTimeout && clearTimeout(this._refreshTimeout);
        this._refreshTimeout = setTimeout(function () {
          _this3._refreshTimeout = null;
          _this3.refresh(util.extend({ 'access_token': _this3._token }, _this3.params)).then(function (data) {
            _this3._token = data.token;

            // 下一次刷新
            _this3._refreshToken(data);
          })['catch'](function () {
            // 刷新失败
          });
        }, refreshSecond * 1000);
      }
    }
  }]);

  return DzhyunTokenManager;
})();

exports['default'] = DzhyunTokenManager;
var _global = global || undefined;
_global.DzhyunTokenManager = DzhyunTokenManager;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../util":14,"./DzhyunDataParser":4,"connection":"connection"}],6:[function(require,module,exports){
/**
 * 数据转换器，负责将各种响应数据类型转换为用于DataStore统一存储用格式
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BaseDataAdapter = (function () {
  function BaseDataAdapter() {
    _classCallCheck(this, BaseDataAdapter);
  }

  _createClass(BaseDataAdapter, [{
    key: "adapt",

    /**
     * 将输入数据转换为同一格式的输出
     * @param input
     * @return {Object.<key: String, value: Object|Array>}
     */
    value: function adapt() {
      return;
    }
  }]);

  return BaseDataAdapter;
})();

exports["default"] = BaseDataAdapter;
module.exports = exports["default"];
},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pbTable = require('../pbTable');

var _pbTable2 = _interopRequireDefault(_pbTable);

var _jsonTable = require('../jsonTable');

var _jsonTable2 = _interopRequireDefault(_jsonTable);

var _BaseDataAdapter2 = require('./BaseDataAdapter');

var _BaseDataAdapter3 = _interopRequireDefault(_BaseDataAdapter2);

var _yfloat = require('yfloat');

var _yfloat2 = _interopRequireDefault(_yfloat);

var _protobuf = require('../protobuf');

var _protobuf2 = _interopRequireDefault(_protobuf);

var Long = _protobuf2['default'].Long;

var excludeFieldName = ['Id', 'Obj'];

var MSGAdapter = (function (_BaseDataAdapter) {
  _inherits(MSGAdapter, _BaseDataAdapter);

  function MSGAdapter() {
    _classCallCheck(this, MSGAdapter);

    _get(Object.getPrototypeOf(MSGAdapter.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MSGAdapter, [{
    key: 'parseYFloat',

    /**
     * 递归data，将其中的数字类型按照yfloat格式解析
     */
    value: function parseYFloat(data) {
      var self = this;
      if (!data) {
        return data;
      } else if (typeof data === 'number' || data instanceof Long) {
        return _yfloat2['default'].unmakeValueToNumber(data);
      } else if (data instanceof Array) {
        var newArray = [];
        data.forEach(function (eachData) {
          newArray.push(self.parseYFloat(eachData));
        });
        return newArray;
      } else if (typeof data === 'object') {
        var keys = Object.keys(data);
        keys.forEach(function (key) {
          data[key] = self.parseYFloat(data[key]);
        });
        return data;
      } else {
        return data;
      }
    }
  }, {
    key: 'adapt',
    value: function adapt(input) {

      var output,
          isPb = input._isPb;

      // 取得其中数据
      // 如果Tbl字段有数据则将Tbl数据按pbTable转换为普通的json数组
      if (input.Tbl != null) {
        output = _pbTable2['default'].convertToJsonArray(input.Tbl, {
          filter: function filter(value, differObject) {
            if (typeof value === 'number' || value instanceof Long) {

              // 如果differObject不为空则表示使用差分计算（json格式不做查分处理，不做yfloat解析）
              if (isPb && differObject !== undefined) {

                var previousValue = differObject.previousValue,
                    dq = differObject.dq;

                // 第一次记录精度
                if (dq === undefined) {
                  var arr = _yfloat2['default'].unmakeValue(value);
                  dq = differObject.dq = arr[1];
                  return differObject.previousValue = arr[0];
                } else {
                  if (value instanceof Long) {
                    value = value.toNumber();
                  }
                  var w = Math.pow(10, dq);
                  return differObject.previousValue = Number((previousValue * w + value).toFixed()) / w;
                }
              } else {
                return isPb ? _yfloat2['default'].unmakeValueToNumber(value) : value;
              }
            }
            return true;
          }
        });

        // FIXME 后台转换后的table数据会多一层msg table，所以取output中第一行第一列数据
        output = output[0];
        output = output[Object.keys(output)[0]];
      } else if (input.JsonTbl != null) {
        output = _jsonTable2['default'].convertToJsonArray(input.JsonTbl);

        output = output[0];
        output = output[Object.keys(output)[0]];
      } else {

        // 否则查找其它有数据的字段
        var keys = Object.keys(input);
        keys.some(function (key) {
          var data = input[key];

          // 不是排除的字段并且不为null
          if (excludeFieldName.indexOf(key) < 0 && data !== null) {

            // 不是数组或者数组长度大于1
            if (!(data instanceof Array) || data.length > 0) {
              output = data;
              return true;
            }
          }
        });

        // 只对于pb格式解析yfloat, json格式数据不进行yfloat解析
        if (isPb === true) {
          output = this.parseYFloat(output);
        }
      }

      return this.format(output, input['Obj']);
    }
  }, {
    key: 'format',
    value: function format(data, obj) {
      var output = data;

      // 如果数据是数组并且如果数据有Obj字段试着将其转为obj:data结构的对象返回，否则直接将数据返回
      if (output instanceof Array) {
        if (output.length > 0 && output[0].hasOwnProperty('Obj')) {
          output = {};
          data.forEach(function (eachData) {
            output[eachData['Obj']] = eachData['Data'] || eachData;
          });
        }
      } else if (obj !== null) {
        output = {};
        output[obj] = data;
      }
      return output;
    }
  }]);

  return MSGAdapter;
})(_BaseDataAdapter3['default']);

exports['default'] = MSGAdapter;
module.exports = exports['default'];
},{"../jsonTable":10,"../pbTable":12,"../protobuf":13,"./BaseDataAdapter":6,"yfloat":"yfloat"}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _MSGAdapter2 = require('./MSGAdapter');

var _MSGAdapter3 = _interopRequireDefault(_MSGAdapter2);

var MSGDirectAdapter = (function (_MSGAdapter) {
  _inherits(MSGDirectAdapter, _MSGAdapter);

  function MSGDirectAdapter() {
    _classCallCheck(this, MSGDirectAdapter);

    _get(Object.getPrototypeOf(MSGDirectAdapter.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MSGDirectAdapter, [{
    key: 'format',
    value: function format(data) {
      return data;
    }
  }]);

  return MSGDirectAdapter;
})(_MSGAdapter3['default']);

exports['default'] = MSGDirectAdapter;
module.exports = exports['default'];
},{"./MSGAdapter":7}],9:[function(require,module,exports){
module.exports = require("./protobuf").newBuilder({})['import']({
    "package": "dzhyun",
    "options": {
        "java_package": "com.dzhyun.proto"
    },
    "messages": [
        {
            "name": "CInfo",
            "fields": [
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Name",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "Type",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "Ratio",
                    "id": 3
                }
            ]
        },
        {
            "name": "CArray",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "int64",
                    "name": "iValues",
                    "id": 1,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "float",
                    "name": "fValues",
                    "id": 2,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "double",
                    "name": "dValues",
                    "id": 3,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "string",
                    "name": "sValues",
                    "id": 4
                }
            ]
        },
        {
            "name": "CData",
            "fields": [
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "Index",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "int64",
                    "name": "iValues",
                    "id": 2,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "float",
                    "name": "fValues",
                    "id": 3,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "double",
                    "name": "dValues",
                    "id": 4,
                    "options": {
                        "packed": true
                    }
                },
                {
                    "rule": "repeated",
                    "type": "string",
                    "name": "sValues",
                    "id": 5
                },
                {
                    "rule": "repeated",
                    "type": "bytes",
                    "name": "bValues",
                    "id": 6
                },
                {
                    "rule": "repeated",
                    "type": "Table",
                    "name": "tValues",
                    "id": 7
                },
                {
                    "rule": "repeated",
                    "type": "CArray",
                    "name": "aValues",
                    "id": 8
                },
                {
                    "rule": "repeated",
                    "type": "sint64",
                    "name": "xValues",
                    "id": 9,
                    "options": {
                        "packed": true
                    }
                }
            ]
        },
        {
            "name": "CDataX",
            "fields": [
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "Index",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "iValue",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "float",
                    "name": "fValue",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "dValue",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "sValue",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "bytes",
                    "name": "bValues",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "Table",
                    "name": "tValue",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "CArray",
                    "name": "aValues",
                    "id": 8
                }
            ]
        },
        {
            "name": "Table",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "Tiid",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "CInfo",
                    "name": "Info",
                    "id": 2
                },
                {
                    "rule": "repeated",
                    "type": "CData",
                    "name": "Data",
                    "id": 3
                },
                {
                    "rule": "repeated",
                    "type": "CDataX",
                    "name": "DataX",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Name",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Memo",
                    "id": 6
                }
            ]
        },
        {
            "name": "UserProp",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Id",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Lable",
                    "id": 2
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Value",
                    "id": 3
                }
            ]
        },
        {
            "name": "UserPropsMessage",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Name",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "UserProp",
                    "name": "Lables",
                    "id": 2
                }
            ]
        },
        {
            "name": "ZhiBiaoShuChu",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "ZBShuJu",
                    "name": "ShuJu",
                    "id": 2
                },
                {
                    "rule": "repeated",
                    "type": "ZBShuXing",
                    "name": "ShuXing",
                    "id": 3
                },
                {
                    "rule": "repeated",
                    "type": "ZBHuiTu",
                    "name": "HuiTu",
                    "id": 4
                }
            ],
            "messages": [
                {
                    "name": "ZBShuJu",
                    "fields": [
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "ShiJian",
                            "id": 1
                        },
                        {
                            "rule": "repeated",
                            "type": "int64",
                            "name": "JieGuo",
                            "id": 2
                        }
                    ]
                },
                {
                    "name": "ZBShuXing",
                    "fields": [
                        {
                            "rule": "required",
                            "type": "string",
                            "name": "MingCheng",
                            "id": 1
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "YanSe",
                            "id": 2
                        },
                        {
                            "rule": "required",
                            "type": "SXLeiXing",
                            "name": "LeiXing",
                            "id": 3
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "KuanDu",
                            "id": 4
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "JingDu",
                            "id": 5
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "DuiQi",
                            "id": 6
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "ShuXing",
                            "id": 7
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "YiDong",
                            "id": 8
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "CengCi",
                            "id": 9
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "BianLiangWeiZhi",
                            "id": 10
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "KuoZhanShuXing",
                            "id": 11
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "YouXiaoWeiZhi",
                            "id": 12
                        }
                    ],
                    "enums": [
                        {
                            "name": "SXLeiXing",
                            "values": [
                                {
                                    "name": "TYPE_TEMP_EXPRESION",
                                    "id": 0
                                },
                                {
                                    "name": "TYPE_CURV_LINE",
                                    "id": 1
                                },
                                {
                                    "name": "TYPE_STICK_LINE",
                                    "id": 2
                                },
                                {
                                    "name": "TYPE_COLORSTICK_LINE",
                                    "id": 3
                                },
                                {
                                    "name": "TYPE_VOLSTICK_LINE",
                                    "id": 4
                                },
                                {
                                    "name": "TYPE_LINESTICK_LINE",
                                    "id": 5
                                },
                                {
                                    "name": "TYPE_CROSS_DOT",
                                    "id": 6
                                },
                                {
                                    "name": "TYPE_CIRCLE_DOT",
                                    "id": 7
                                },
                                {
                                    "name": "TYPE_POINT_DOT",
                                    "id": 8
                                },
                                {
                                    "name": "TYPE_STICK3D_LINE",
                                    "id": 9
                                },
                                {
                                    "name": "TYPE_COLOR3D_LINE",
                                    "id": 10
                                },
                                {
                                    "name": "TYPE_DOT_DOT",
                                    "id": 11
                                },
                                {
                                    "name": "TYPE_DASH_DOT",
                                    "id": 12
                                },
                                {
                                    "name": "TYPE_PERCENT_BAR",
                                    "id": 13
                                },
                                {
                                    "name": "TYPE_ENTER_LONG",
                                    "id": 100
                                },
                                {
                                    "name": "TYPE_EXIT_LONG",
                                    "id": 101
                                },
                                {
                                    "name": "TYPE_ENTER_SHORT",
                                    "id": 102
                                },
                                {
                                    "name": "TYPE_EXIT_SHORT",
                                    "id": 103
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "ZBHuiTu",
                    "fields": [
                        {
                            "rule": "required",
                            "type": "HTLeiXing",
                            "name": "LeiXing",
                            "id": 1
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "KuanDu",
                            "id": 2
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "ShuXing",
                            "id": 3
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "ShangCiJiSuan",
                            "id": 4
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "YanSe",
                            "id": 5
                        },
                        {
                            "rule": "required",
                            "type": "ZBShuXing.SXLeiXing",
                            "name": "ShuChuLeiXing",
                            "id": 6
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "ShuChuShuXing",
                            "id": 7
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "ShuChuKuoZhanShuXing",
                            "id": 8
                        },
                        {
                            "rule": "repeated",
                            "type": "string",
                            "name": "WenBen",
                            "id": 9
                        },
                        {
                            "rule": "repeated",
                            "type": "HTShuJu",
                            "name": "ShuJu",
                            "id": 10
                        }
                    ],
                    "messages": [
                        {
                            "name": "HTShuJu",
                            "fields": [
                                {
                                    "rule": "required",
                                    "type": "int64",
                                    "name": "WeiZhi",
                                    "id": 1
                                },
                                {
                                    "rule": "required",
                                    "type": "int64",
                                    "name": "JiaGe",
                                    "id": 2
                                },
                                {
                                    "rule": "required",
                                    "type": "int64",
                                    "name": "CanShu",
                                    "id": 3
                                }
                            ]
                        }
                    ],
                    "enums": [
                        {
                            "name": "HTLeiXing",
                            "values": [
                                {
                                    "name": "TYPE_NOLINE",
                                    "id": 0
                                },
                                {
                                    "name": "TYPE_POLYLINE",
                                    "id": 1
                                },
                                {
                                    "name": "TYPE_LINE",
                                    "id": 2
                                },
                                {
                                    "name": "TYPE_STICKLINE",
                                    "id": 3
                                },
                                {
                                    "name": "TYPE_TEXT",
                                    "id": 4
                                },
                                {
                                    "name": "TYPE_ICON",
                                    "id": 5
                                },
                                {
                                    "name": "TYPE_TIP_TEXT",
                                    "id": 6
                                },
                                {
                                    "name": "TYPE_BACK_GRD",
                                    "id": 7
                                },
                                {
                                    "name": "TYPE_BACK_GRDLAST",
                                    "id": 8
                                },
                                {
                                    "name": "TYPE_DRAWBMP",
                                    "id": 9
                                },
                                {
                                    "name": "TYPE_VERTLINE",
                                    "id": 10
                                },
                                {
                                    "name": "TYPE_TEXTABS",
                                    "id": 11
                                },
                                {
                                    "name": "TYPE_TEXTREL",
                                    "id": 12
                                },
                                {
                                    "name": "TYPE_RECTABS",
                                    "id": 13
                                },
                                {
                                    "name": "TYPE_RECTREL",
                                    "id": 14
                                },
                                {
                                    "name": "TYPE_FLAGTEXT",
                                    "id": 15
                                },
                                {
                                    "name": "TYPE_MOVETEXT",
                                    "id": 16
                                },
                                {
                                    "name": "TYPE_HORILINE",
                                    "id": 17
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "ZhiBiaoShuXingShuChu",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "ZhiBiaoShuChu.ZBShuXing",
                    "name": "ShuChu",
                    "id": 1
                }
            ]
        },
        {
            "name": "ZhiBiaoHuiTuShuChu",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "ZhiBiaoShuChu.ZBHuiTu",
                    "name": "ShuChu",
                    "id": 1
                }
            ]
        },
        {
            "name": "DSToken",
            "fields": [
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "result",
                    "id": 1,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "token",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "version",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "create_time",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "refresh_time",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "duration",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "appid",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "device",
                    "id": 8
                }
            ]
        },
        {
            "name": "LingZhangGuShuJu",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ZhongWenJianCheng",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZuiXinJia",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZhangFu",
                    "id": 4
                }
            ]
        },
        {
            "name": "TopicInvestRank",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "BianHao",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiFouReMenZhuTi",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RiPingJunZhangFuPaiMing14",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RiPingJunZhangFuPaiMing30",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RiReDuZhi14",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RiReDuZhi30",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RiReDuZhi10",
                    "id": 7
                }
            ]
        },
        {
            "name": "TopicInvest",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "BianHao",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "MingCheng",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiJian",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZhangFu",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "LiangBi",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "HuanShou",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShangZhangJiaShu",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "PingPanJiaShu",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "XiaDieJiaShu",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "LingZhangGuShuJu",
                    "name": "LingZhangGu",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiFouReMenZhuTi",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RiPingJunZhangFuPaiMing14",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RiPingJunZhangFuPaiMing30",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RiReDuZhi14",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RiReDuZhi30",
                    "id": 15
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RiReDuZhi10",
                    "id": 16
                }
            ]
        },
        {
            "name": "LiShiHangQing",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "ShiJian",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "ZhangFu",
                    "id": 2
                }
            ]
        },
        {
            "name": "LiShiZouShi",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "LiShiHangQing",
                    "name": "HangQing",
                    "id": 1
                }
            ]
        },
        {
            "name": "TopicInvestHistory",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "BianHao",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "MingCheng",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiJian",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "LiShiZouShi",
                    "name": "LiShi",
                    "id": 4
                }
            ]
        },
        {
            "name": "TopicInvestInfo",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "BianHao",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "MingCheng",
                    "id": 2
                },
                {
                    "rule": "repeated",
                    "type": "string",
                    "name": "ChengFenGu",
                    "id": 3
                }
            ]
        },
        {
            "name": "StkData",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "JiaoYiDaiMa",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ZhongWenJianCheng",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZuiXinJia",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KaiPanJia",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZuiGaoJia",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZuiDiJia",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZuoShou",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JunJia",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZhangDie",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZhangFu",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZhenFu",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChengJiaoLiang",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "XianShou",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChengJiaoE",
                    "id": 15
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZongChengJiaoBiShu",
                    "id": 16
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MeiBiChengJiaoGuShu",
                    "id": 17
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "HuanShou",
                    "id": 18
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "LiangBi",
                    "id": 19
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "NeiPan",
                    "id": 20
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WaiPan",
                    "id": 21
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZongMaiRu",
                    "id": 22
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZongMaiChu",
                    "id": 23
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZongMaiRuJunJia",
                    "id": 24
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZongMaiChuJunJia",
                    "id": 25
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuJia1",
                    "id": 26
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuJia2",
                    "id": 27
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuJia3",
                    "id": 28
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuJia4",
                    "id": 29
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuJia5",
                    "id": 30
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuLiang1",
                    "id": 31
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuLiang2",
                    "id": 32
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuLiang3",
                    "id": 33
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuLiang4",
                    "id": 34
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuLiang5",
                    "id": 35
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuJia1",
                    "id": 36
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuJia2",
                    "id": 37
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuJia3",
                    "id": 38
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuJia4",
                    "id": 39
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuJia5",
                    "id": 40
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuLiang1",
                    "id": 41
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuLiang2",
                    "id": 42
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuLiang3",
                    "id": 43
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuLiang4",
                    "id": 44
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuLiang5",
                    "id": 45
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiBi",
                    "id": 46
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiCha",
                    "id": 47
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZhangSu",
                    "id": 48
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JunLiang5Ri",
                    "id": 49
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShangZhangJiaShu",
                    "id": 50
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "XiaDieJiaShu",
                    "id": 51
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "PingPanJiaShu",
                    "id": 52
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "AGuShangZhangJiaShu",
                    "id": 53
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "AGuXiaDieJiaShu",
                    "id": 54
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "AGuPingPanJiaShu",
                    "id": 55
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "AGuChengJiaoE",
                    "id": 56
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BGuShangZhangJiaShu",
                    "id": 57
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BGuXiaDieJiaShu",
                    "id": 58
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BGuPingPanJiaShu",
                    "id": 59
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BGuChengJiaoE",
                    "id": 60
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiJinShangZhangJiaShu",
                    "id": 61
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiJinXiaDieJiaShu",
                    "id": 62
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiJinPingPanJiaShu",
                    "id": 63
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiJinChengJiaoE",
                    "id": 64
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "QiTaShangZhangJiaShu",
                    "id": 65
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "QiTaXiaDieJiaShu",
                    "id": 66
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "QiTaPingPanJiaShu",
                    "id": 67
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "QiTaChengJiaoE",
                    "id": 68
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MaiRuDanShu",
                    "id": 69
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MaiChuDanShu",
                    "id": 70
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "FenZhongZhangFu1",
                    "id": 77
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "FenZhongZhangFu2",
                    "id": 78
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "FenZhongZhangFu3",
                    "id": 79
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "FenZhongZhangFu4",
                    "id": 80
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "FenZhongZhangFu5",
                    "id": 81
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiYingLv",
                    "id": 82
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZhangTing",
                    "id": 83
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DieTing",
                    "id": 84
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ShiChangMingCheng",
                    "id": 85
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ShiChangDuanMingCheng",
                    "id": 86
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiGouChiHuoShu",
                    "id": 87
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiGouTuHuoShu",
                    "id": 88
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiGouChiHuoLiang",
                    "id": 89
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiGouTuHuoLiang",
                    "id": 90
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiGouChiHuoJunE",
                    "id": 91
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiGouTuHuoJunE",
                    "id": 92
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MeiShouGuShu",
                    "id": 93
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiaoYiDanWei",
                    "id": 94
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiXiaoLv",
                    "id": 95
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiJian",
                    "id": 96
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiJingLv",
                    "id": 97
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZongShiZhi",
                    "id": 98
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "LiuTongShiZhi",
                    "id": 99
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RiZhangFu5",
                    "id": 101
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RiPingJunZhangFu3",
                    "id": 102
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JingTaiShiYingLv",
                    "id": 103
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RongZiYuEZhangFu",
                    "id": 104
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RongZiYuELiuTongShiZhiBiLv",
                    "id": 105
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZiChanFuZhaiLv",
                    "id": 106
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiaQuanPingJunWeiTuoMaiRuJia",
                    "id": 107
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuZongLiang",
                    "id": 108
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiaQuanPingJunWeiTuoMaiChuJia",
                    "id": 109
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuZongLiang",
                    "id": 110
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuJia1",
                    "id": 111
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuJia2",
                    "id": 112
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuJia3",
                    "id": 113
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuJia4",
                    "id": 114
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuJia5",
                    "id": 115
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuLiang1",
                    "id": 116
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuLiang2",
                    "id": 117
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuLiang3",
                    "id": 118
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuLiang4",
                    "id": 119
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuLiang5",
                    "id": 120
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuJia1",
                    "id": 121
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuJia2",
                    "id": 122
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuJia3",
                    "id": 123
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuJia4",
                    "id": 124
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuJia5",
                    "id": 125
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuLiang1",
                    "id": 126
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuLiang2",
                    "id": 127
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuLiang3",
                    "id": 128
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuLiang4",
                    "id": 129
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuLiang5",
                    "id": 130
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DaDanDangRiLiuRuE",
                    "id": 131
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DaDanLiuRuE5",
                    "id": 132
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DDX",
                    "id": 133
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DDXPiaoHongTianShu10",
                    "id": 134
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DDXZongHe10",
                    "id": 135
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DDXBiaoZhunCha10",
                    "id": 136
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DDXDDXBiaoZhunCha10BiZhi",
                    "id": 137
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiFouTingPai",
                    "id": 138
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MA1minMA1",
                    "id": 200
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MA1minMA2",
                    "id": 201
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MA1minMA3",
                    "id": 202
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MA1minMA4",
                    "id": 203
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MA1minMA5",
                    "id": 204
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MA1minMA6",
                    "id": 205
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MA5minMA1",
                    "id": 206
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MA5minMA2",
                    "id": 207
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MA5minMA3",
                    "id": 208
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MA5minMA4",
                    "id": 209
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MA5minMA5",
                    "id": 210
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MA5minMA6",
                    "id": 211
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MA1dayMA1",
                    "id": 212
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MA1dayMA2",
                    "id": 213
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MA1dayMA3",
                    "id": 214
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MA1dayMA4",
                    "id": 215
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MA1dayMA5",
                    "id": 216
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MA1dayMA6",
                    "id": 217
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BOLL1minMID",
                    "id": 218
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BOLL1minUPPER",
                    "id": 219
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BOLL1minLOWER",
                    "id": 220
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BOLL5minMID",
                    "id": 221
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BOLL5minUPPER",
                    "id": 222
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BOLL5minLOWER",
                    "id": 223
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BOLL1dayMID",
                    "id": 224
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BOLL1dayUPPER",
                    "id": 225
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BOLL1dayLOWER",
                    "id": 226
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "VOL1min",
                    "id": 227
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "VOL1minMA1",
                    "id": 228
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "VOL1minMA2",
                    "id": 229
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "VOL1minMA3",
                    "id": 230
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "VOL5min",
                    "id": 231
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "VOL5minMA1",
                    "id": 232
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "VOL5minMA2",
                    "id": 233
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "VOL5minMA3",
                    "id": 234
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "VOL1day",
                    "id": 235
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "VOL1dayMA1",
                    "id": 236
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "VOL1dayMA2",
                    "id": 237
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "VOL1dayMA3",
                    "id": 238
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ARBR1minAR",
                    "id": 239
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ARBR1minBR",
                    "id": 240
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ARBR5minAR",
                    "id": 241
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ARBR5minBR",
                    "id": 242
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ARBR1dayAR",
                    "id": 243
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ARBR1dayBR",
                    "id": 244
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BIAS1minBIAS1",
                    "id": 245
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BIAS1minBIAS2",
                    "id": 246
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BIAS1minBIAS3",
                    "id": 247
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BIAS5minBIAS1",
                    "id": 248
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BIAS5minBIAS2",
                    "id": 249
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BIAS5minBIAS3",
                    "id": 250
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BIAS1dayBIAS1",
                    "id": 251
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BIAS1dayBIAS2",
                    "id": 252
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BIAS1dayBIAS3",
                    "id": 253
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CCI1min",
                    "id": 254
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CCI5min",
                    "id": 255
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CCI1day",
                    "id": 256
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CJBS1minCJBS",
                    "id": 257
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CJBS5minCJBS",
                    "id": 258
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CJBS1dayCJBS",
                    "id": 259
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CR1minCR",
                    "id": 260
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CR1minMA1",
                    "id": 261
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CR1minMA2",
                    "id": 262
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CR1minMA3",
                    "id": 263
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CR5minCR",
                    "id": 264
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CR5minMA1",
                    "id": 265
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CR5minMA2",
                    "id": 266
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CR5minMA3",
                    "id": 267
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CR1dayCR",
                    "id": 268
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CR1dayMA1",
                    "id": 269
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CR1dayMA2",
                    "id": 270
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CR1dayMA3",
                    "id": 271
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DMA1minDDD",
                    "id": 272
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DMA1minAMA",
                    "id": 273
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DMA5minDDD",
                    "id": 274
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DMA5minAMA",
                    "id": 275
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DMA1dayDDD",
                    "id": 276
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DMA1dayAMA",
                    "id": 277
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DMI1minPDI",
                    "id": 278
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DMI1minMDI",
                    "id": 279
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DMI1minADX",
                    "id": 280
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DMI1minADXR",
                    "id": 281
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DMI5minPDI",
                    "id": 282
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DMI5minMDI",
                    "id": 283
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DMI5minADX",
                    "id": 284
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DMI5minADXR",
                    "id": 285
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DMI1dayPDI",
                    "id": 286
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DMI1dayMDI",
                    "id": 287
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DMI1dayADX",
                    "id": 288
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DMI1dayADXR",
                    "id": 289
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KDJ1minK",
                    "id": 290
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KDJ1minD",
                    "id": 291
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KDJ1minJ",
                    "id": 292
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KDJ5minK",
                    "id": 293
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KDJ5minD",
                    "id": 294
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KDJ5minJ",
                    "id": 295
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KDJ1dayK",
                    "id": 296
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KDJ1dayD",
                    "id": 297
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KDJ1dayJ",
                    "id": 298
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MACD1minDIFF",
                    "id": 299
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MACD1minDEA",
                    "id": 300
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MACD1minMACD",
                    "id": 301
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MACD5minDIFF",
                    "id": 302
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MACD5minDEA",
                    "id": 303
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MACD5minMACD",
                    "id": 304
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MACD1dayDIFF",
                    "id": 305
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MACD1dayDEA",
                    "id": 306
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MACD1dayMACD",
                    "id": 307
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "OBV1min",
                    "id": 308
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "OBV5min",
                    "id": 309
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "OBV1day",
                    "id": 310
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "PSY1min",
                    "id": 311
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "PSY5min",
                    "id": 312
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "PSY1day",
                    "id": 313
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RSI1minRSI1",
                    "id": 314
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RSI1minRSI2",
                    "id": 315
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RSI1minRSI3",
                    "id": 316
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RSI5minRSI1",
                    "id": 317
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RSI5minRSI2",
                    "id": 318
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RSI5minRSI3",
                    "id": 319
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RSI1dayRSI1",
                    "id": 320
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RSI1dayRSI2",
                    "id": 321
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RSI1dayRSI3",
                    "id": 322
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WR1minWR1",
                    "id": 323
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WR1minWR2",
                    "id": 324
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WR5minWR1",
                    "id": 325
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WR5minWR2",
                    "id": 326
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WR1dayWR1",
                    "id": 327
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WR1dayWR2",
                    "id": 328
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "LeiXing",
                    "id": 400
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZiLeiXing",
                    "id": 401
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "LeiXingMingCheng",
                    "id": 402
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChengJiaoLiangDanWei",
                    "id": 403
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "MaBiao",
                    "id": 410
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "FJJJLeiXing",
                    "id": 501
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZhengTiYiJia",
                    "id": 502
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MYiJia",
                    "id": 551
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MShiShiJingZhi",
                    "id": 552
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MShangZheXuZhang",
                    "id": 553
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MXiaZheXuDie",
                    "id": 554
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "YinHanShouYi",
                    "id": 511
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiaGeGangGan",
                    "id": 512
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "PinZhongObj",
                    "id": 601
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "BaoGaoQi",
                    "id": 602
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ShangShiRiQi",
                    "id": 603
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MeiGuShouYi",
                    "id": 604
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MeiGuJingZiChan",
                    "id": 605
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JingZiChanShouYiLv",
                    "id": 606
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MeiGuJingYingXianJin",
                    "id": 607
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MeiGuGongJiJin",
                    "id": 608
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MeiGuWeiFenPei",
                    "id": 609
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "GuDongQuanYiBi",
                    "id": 610
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JingLiRunTongBi",
                    "id": 611
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZhuYingShouRuTongBi",
                    "id": 612
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "XiaoShouMaoLiLv",
                    "id": 613
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "TiaoZhengMeiGuJingZi",
                    "id": 614
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZongZiChan",
                    "id": 615
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "LiuDongZiChan",
                    "id": 616
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "GuDingZiChan",
                    "id": 617
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WuXingZiChan",
                    "id": 618
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "LiuDongFuZhai",
                    "id": 619
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChangQiFuZhai",
                    "id": 620
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZongFuZhai",
                    "id": 621
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "GuDongQuanYi",
                    "id": 622
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZiBenGongJiJin",
                    "id": 623
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JingYingXianJinLiuLiang",
                    "id": 624
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "TouZiXianJinLiuLiang",
                    "id": 625
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChouZiXianJinLiuLiang",
                    "id": 626
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "XianJinZengJiaE",
                    "id": 627
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZhuYingShouRu",
                    "id": 628
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZhuYingLiRun",
                    "id": 629
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "YingYeLiRun",
                    "id": 630
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "TouZiShouYi",
                    "id": 631
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "YingYeWaiShouZhi",
                    "id": 632
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "LiRunZongE",
                    "id": 633
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JingLiRun",
                    "id": 634
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiFenPeiLiRun",
                    "id": 635
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZongGuBen",
                    "id": 636
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WuXianShouGuHeJi",
                    "id": 637
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "LiuTongAGu",
                    "id": 638
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "LiuTongBGu",
                    "id": 639
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JingWaiShangShiGu",
                    "id": 640
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "QiTaLiuTongGu",
                    "id": 641
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "XianShouGuHeJi",
                    "id": 642
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "GuoJiaChiGu",
                    "id": 643
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "GuoYouFaRenGu",
                    "id": 644
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JingNeiFaRenGu",
                    "id": 645
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JingNeiZiRanRenGu",
                    "id": 646
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "QiTaFaQiRenGu",
                    "id": 647
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MuJiFaRenGu",
                    "id": 648
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JingWaiFaRenGu",
                    "id": 649
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JingWaiZiRanRenGu",
                    "id": 650
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "YouXianGuHuoQiTa",
                    "id": 651
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRu",
                    "id": 700
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChu",
                    "id": 701
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MaiRuZhongDanBiLi",
                    "id": 702
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MaiRuDaDanBiLi",
                    "id": 703
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MaiRuTeDaDanBiLi",
                    "id": 704
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MaiChuZhongDanBiLi",
                    "id": 705
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MaiChuDaDanBiLi",
                    "id": 706
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MaiChuTeDaDanBiLi",
                    "id": 707
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DuanXianMaiRu",
                    "id": 708
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DuanXianMaiChu",
                    "id": 709
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DuanXianChiHuo",
                    "id": 710
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DuanXianTuHuo",
                    "id": 711
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BiShi",
                    "id": 801
                },
                {
                    "rule": "optional",
                    "type": "LingZhangGuShuJu",
                    "name": "LingZhangGu",
                    "id": 901
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChiCang",
                    "id": 1001
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZengCang",
                    "id": 1002
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RiZeng",
                    "id": 1003
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JieSuanJia",
                    "id": 1004
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZuoRiJieSuanJia",
                    "id": 1005
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KaiPing",
                    "id": 1006
                }
            ]
        },
        {
            "name": "ZhiBiao",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "MingCheng",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "MiaoShu",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "YongFa",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "CanShuJingLing",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "JianYiZu",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "WenBen",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiJian",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "ZBLeiXing",
                    "name": "LeiXing",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "ZBWenBenLeiXing",
                    "name": "WenBenLeiXing",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BanBen",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShuXing",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MoRenLeiXing",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ZiJieMa",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "bool",
                    "name": "ChangYong",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "bool",
                    "name": "ZiDingYi",
                    "id": 15
                },
                {
                    "rule": "repeated",
                    "type": "int64",
                    "name": "EWaiShuJu",
                    "id": 16
                },
                {
                    "rule": "repeated",
                    "type": "ZBCanShu",
                    "name": "CanShu",
                    "id": 17
                },
                {
                    "rule": "repeated",
                    "type": "ZBShuChu",
                    "name": "ShuChu",
                    "id": 18
                }
            ],
            "messages": [
                {
                    "name": "ZBShuChu",
                    "fields": [
                        {
                            "rule": "required",
                            "type": "string",
                            "name": "MingCheng",
                            "id": 1
                        },
                        {
                            "rule": "required",
                            "type": "ZhiBiaoShuChu.ZBShuXing.SXLeiXing",
                            "name": "LeiXing",
                            "id": 2
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "YiDong",
                            "id": 3
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "ShuXing",
                            "id": 4
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "YanSe",
                            "id": 5
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "BianLiangWeiZhi",
                            "id": 6
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "KuoZhanShuXing",
                            "id": 7
                        }
                    ]
                },
                {
                    "name": "ZBCanShu",
                    "fields": [
                        {
                            "rule": "required",
                            "type": "string",
                            "name": "MingCheng",
                            "id": 1
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "MoRenZhi",
                            "id": 2
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "ZuiDaZhi",
                            "id": 3
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "ZuiXiaoZhi",
                            "id": 4
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "BuChang",
                            "id": 5
                        }
                    ]
                }
            ],
            "enums": [
                {
                    "name": "ZBLeiXing",
                    "values": [
                        {
                            "name": "TYPE_EXPLORER",
                            "id": 0
                        },
                        {
                            "name": "TYPE_SYSTEST",
                            "id": 1
                        },
                        {
                            "name": "TYPE_MAIN_PICT",
                            "id": 2
                        },
                        {
                            "name": "TYPE_MAIN_ADD",
                            "id": 3
                        },
                        {
                            "name": "TYPE_SUB_PICT",
                            "id": 4
                        },
                        {
                            "name": "TYPE_PAINT_IT",
                            "id": 5
                        },
                        {
                            "name": "TYPE_TEMP_INDI",
                            "id": 6
                        },
                        {
                            "name": "TYPE_TECHNIQUE",
                            "id": 7
                        },
                        {
                            "name": "TYPE_UNKNOWN",
                            "id": 8
                        }
                    ]
                },
                {
                    "name": "ZBWenBenLeiXing",
                    "values": [
                        {
                            "name": "TEXTTYPE_FORMULA",
                            "id": 0
                        },
                        {
                            "name": "TEXTTYPE_LUA",
                            "id": 1
                        },
                        {
                            "name": "TEXTTYPE_UNKNOWN",
                            "id": 2
                        }
                    ]
                }
            ]
        },
        {
            "name": "AlarmEvent",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CuoWuMa",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiJianBianHao",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Obj",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiJian",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RenWuBianHao",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ZiDuan",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChuFaFangShi",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShuZhi",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ChuFaXinXi",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "YiYueBiaoJi",
                    "id": 10
                }
            ],
            "enums": [
                {
                    "name": "AlarmEventStatus",
                    "values": [
                        {
                            "name": "STATUS_UnRead",
                            "id": 0
                        },
                        {
                            "name": "STATUS_Read",
                            "id": 1
                        }
                    ]
                }
            ]
        },
        {
            "name": "AlarmTask",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CuoWuMa",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RenWuBianHao",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiJian",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Obj",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ZiDuan",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChuFaFangShi",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShuZhi",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZhuangTai",
                    "id": 8
                }
            ],
            "enums": [
                {
                    "name": "AlarmTriggerType",
                    "values": [
                        {
                            "name": "TYPE_CompareGT",
                            "id": 0
                        },
                        {
                            "name": "TYPE_CompareGTE",
                            "id": 1
                        },
                        {
                            "name": "TYPE_CompareLT",
                            "id": 2
                        },
                        {
                            "name": "TYPE_CompareLTE",
                            "id": 3
                        },
                        {
                            "name": "TYPE_CompareCross",
                            "id": 4
                        },
                        {
                            "name": "TYPE_CompareUpCross",
                            "id": 5
                        },
                        {
                            "name": "TYPE_CompareDownCross",
                            "id": 6
                        }
                    ]
                },
                {
                    "name": "AlarmTaskStatus",
                    "values": [
                        {
                            "name": "STATUS_Stop",
                            "id": 0
                        },
                        {
                            "name": "STATUS_Running",
                            "id": 1
                        }
                    ]
                }
            ]
        },
        {
            "name": "BlockObjOutput",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                }
            ]
        },
        {
            "name": "BlockPropOutput",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "string",
                    "name": "name",
                    "id": 1
                }
            ]
        },
        {
            "name": "FenBiChengJiao",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "Id",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "ShiJian",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChengJiaoJia",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChengJiaoLiang",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChengJiaoE",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChengJiaoDanBiShu",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiFouZhuDongXingMaiDan",
                    "id": 7
                }
            ]
        },
        {
            "name": "GeGuDongTai",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "Id",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "ShiJian",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZuiXinJia",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KaiPanJia",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZuiGaoJia",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZuiDiJia",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZuoShou",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JunJia",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZhangDie",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZhangFu",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZhenFu",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChengJiaoLiang",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "XianShou",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChengJiaoE",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZongChengJiaoBiShu",
                    "id": 15
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MeiBiChengJiaoGuShu",
                    "id": 16
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "HuanShou",
                    "id": 17
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "LiangBi",
                    "id": 18
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "NeiPan",
                    "id": 19
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WaiPan",
                    "id": 20
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZongMaiRu",
                    "id": 21
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZongMaiChu",
                    "id": 22
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZongMaiRuJunJia",
                    "id": 23
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZongMaiChuJunJia",
                    "id": 24
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZhangTing",
                    "id": 25
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DieTing",
                    "id": 26
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "FenZhongZhangFu1",
                    "id": 27
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "FenZhongZhangFu2",
                    "id": 28
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "FenZhongZhangFu3",
                    "id": 29
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "FenZhongZhangFu4",
                    "id": 30
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "FenZhongZhangFu5",
                    "id": 31
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuJia1",
                    "id": 32
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuLiang1",
                    "id": 33
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuJia2",
                    "id": 34
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuLiang2",
                    "id": 35
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuJia3",
                    "id": 36
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuLiang3",
                    "id": 37
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuJia4",
                    "id": 38
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuLiang4",
                    "id": 39
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuJia5",
                    "id": 40
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuLiang5",
                    "id": 41
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuJia1",
                    "id": 42
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuLiang1",
                    "id": 43
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuJia2",
                    "id": 44
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuLiang2",
                    "id": 45
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuJia3",
                    "id": 46
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuLiang3",
                    "id": 47
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuJia4",
                    "id": 48
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuLiang4",
                    "id": 49
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuJia5",
                    "id": 50
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuLiang5",
                    "id": 51
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiBi",
                    "id": 52
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiCha",
                    "id": 53
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiaQuanPingJunWeiTuoMaiRuJia",
                    "id": 54
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuZongLiang",
                    "id": 55
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiaQuanPingJunWeiTuoMaiChuJia",
                    "id": 56
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuZongLiang",
                    "id": 57
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuJia1",
                    "id": 58
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuJia2",
                    "id": 59
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuJia3",
                    "id": 60
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuJia4",
                    "id": 61
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuJia5",
                    "id": 62
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuLiang1",
                    "id": 63
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuLiang2",
                    "id": 64
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuLiang3",
                    "id": 65
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuLiang4",
                    "id": 66
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuLiang5",
                    "id": 67
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuJia1",
                    "id": 68
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuJia2",
                    "id": 69
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuJia3",
                    "id": 70
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuJia4",
                    "id": 71
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuJia5",
                    "id": 72
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuLiang1",
                    "id": 73
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuLiang2",
                    "id": 74
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuLiang3",
                    "id": 75
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuLiang4",
                    "id": 76
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuLiang5",
                    "id": 77
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChiCang",
                    "id": 78
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZengCang",
                    "id": 79
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RiZeng",
                    "id": 80
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JieSuanJia",
                    "id": 81
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZuoRiJieSuanJia",
                    "id": 82
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KaiPing",
                    "id": 83
                }
            ]
        },
        {
            "name": "MaiMaiPan",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "Id",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "ShiJian",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuJia1",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuLiang1",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuJia2",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuLiang2",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuJia3",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuLiang3",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuJia4",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuLiang4",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuJia5",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuLiang5",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuJia1",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuLiang1",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuJia2",
                    "id": 15
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuLiang2",
                    "id": 16
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuJia3",
                    "id": 17
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuLiang3",
                    "id": 18
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuJia4",
                    "id": 19
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuLiang4",
                    "id": 20
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuJia5",
                    "id": 21
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuLiang5",
                    "id": 22
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiBi",
                    "id": 23
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiCha",
                    "id": 24
                }
            ]
        },
        {
            "name": "KuoZhanMaiMaiPan",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "Id",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "ShiJian",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiaQuanPingJunWeiTuoMaiRuJia",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRuZongLiang",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiaQuanPingJunWeiTuoMaiChuJia",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChuZongLiang",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuJia1",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuJia2",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuJia3",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuJia4",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuJia5",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuLiang1",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuLiang2",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuLiang3",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuLiang4",
                    "id": 15
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiRuLiang5",
                    "id": 16
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuJia1",
                    "id": 17
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuJia2",
                    "id": 18
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuJia3",
                    "id": 19
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuJia4",
                    "id": 20
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuJia5",
                    "id": 21
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuLiang1",
                    "id": 22
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuLiang2",
                    "id": 23
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuLiang3",
                    "id": 24
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuLiang4",
                    "id": 25
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KuoZhanMaiChuLiang5",
                    "id": 26
                }
            ]
        },
        {
            "name": "QuanMaiMaiPan",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "Id",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiJian",
                    "id": 2
                },
                {
                    "rule": "repeated",
                    "type": "MaiMaiBiao",
                    "name": "WeiMaiRuPan",
                    "id": 3
                },
                {
                    "rule": "repeated",
                    "type": "MaiMaiBiao",
                    "name": "WeiMaiChuPan",
                    "id": 4
                }
            ],
            "messages": [
                {
                    "name": "MaiMaiBiao",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "WeiZhi",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "Jia",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "Liang",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "DanShu",
                            "id": 4
                        }
                    ]
                }
            ]
        },
        {
            "name": "WeiTuoDuiLie",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "ShiJian",
                    "id": 2
                },
                {
                    "rule": "repeated",
                    "type": "WeiTuo",
                    "name": "MaiRuDuiLie",
                    "id": 3
                },
                {
                    "rule": "repeated",
                    "type": "WeiTuo",
                    "name": "MaiChuDuiLie",
                    "id": 4
                }
            ],
            "messages": [
                {
                    "name": "WeiTuo",
                    "fields": [
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "Jia",
                            "id": 1
                        },
                        {
                            "rule": "required",
                            "type": "int64",
                            "name": "BiShu",
                            "id": 2
                        },
                        {
                            "rule": "repeated",
                            "type": "int64",
                            "name": "Liang",
                            "id": 3
                        }
                    ]
                }
            ]
        },
        {
            "name": "Level2TongJi",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Id",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiJian",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRu",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChu",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MaiRuZhongDanBiLi",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MaiRuDaDanBiLi",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MaiRuTeDaDanBiLi",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MaiChuZhongDanBiLi",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MaiChuDaDanBiLi",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MaiChuTeDaDanBiLi",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DuanXianMaiRu",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DuanXianMaiChu",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DuanXianChiHuo",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DuanXianTuHuo",
                    "id": 14
                }
            ]
        },
        {
            "name": "KXian",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "ShiJian",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KaiPanJia",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZuiGaoJia",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZuiDiJia",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShouPanJia",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChengJiaoLiang",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChengJiaoE",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChengJiaoBiShu",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShangZhangJiaShu",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "XiaDieJiaShu",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChiCang",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZengCang",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZengLiang",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JieSuanJia",
                    "id": 14
                }
            ]
        },
        {
            "name": "FenShi",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "ShiJian",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChengJiaoJia",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChengJiaoLiang",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChengJiaoE",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JunJia",
                    "id": 5
                }
            ]
        },
        {
            "name": "QuoteDyna",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "Time",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "float",
                    "name": "LastClose",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "float",
                    "name": "High",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "float",
                    "name": "Open",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "float",
                    "name": "Low",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "float",
                    "name": "New",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "float",
                    "name": "Volume",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "float",
                    "name": "Amount",
                    "id": 8
                }
            ]
        },
        {
            "name": "QuoteDynaSingle",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "GeGuDongTai",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "QuoteDynaOutput",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "QuoteDynaSingle",
                    "name": "Results",
                    "id": 1
                }
            ]
        },
        {
            "name": "QuoteKline",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "Time",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "float",
                    "name": "High",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "float",
                    "name": "Open",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "float",
                    "name": "Low",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "float",
                    "name": "Close",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "float",
                    "name": "Volume",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "float",
                    "name": "Amount",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "TickCount",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "Advance",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "Decline",
                    "id": 10
                }
            ]
        },
        {
            "name": "QuoteKlineSingle",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "KXian",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "QuoteKlineOutput",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "QuoteKlineSingle",
                    "name": "Results",
                    "id": 1
                }
            ]
        },
        {
            "name": "QuoteTick",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "Time",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "float",
                    "name": "Price",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "float",
                    "name": "Volume",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "float",
                    "name": "Amount",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "TickCount",
                    "id": 5
                },
                {
                    "rule": "repeated",
                    "type": "float",
                    "name": "BuyPrice",
                    "id": 6
                },
                {
                    "rule": "repeated",
                    "type": "float",
                    "name": "BuyVolume",
                    "id": 7
                },
                {
                    "rule": "repeated",
                    "type": "float",
                    "name": "SellPrice",
                    "id": 8
                },
                {
                    "rule": "repeated",
                    "type": "float",
                    "name": "SellVolume",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "Outter",
                    "id": 10
                }
            ]
        },
        {
            "name": "QuoteTickSingle",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "FenBiChengJiao",
                    "name": "Data",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "QingPan",
                    "id": 3
                }
            ]
        },
        {
            "name": "QuoteTickOutput",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "QuoteTickSingle",
                    "name": "Results",
                    "id": 1
                }
            ]
        },
        {
            "name": "QuoteMin",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "Time",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "float",
                    "name": "Price",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "float",
                    "name": "Volume",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "float",
                    "name": "Amount",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "TickCount",
                    "id": 5
                },
                {
                    "rule": "repeated",
                    "type": "float",
                    "name": "BuyPrice",
                    "id": 6
                },
                {
                    "rule": "repeated",
                    "type": "float",
                    "name": "BuyVolume",
                    "id": 7
                },
                {
                    "rule": "repeated",
                    "type": "float",
                    "name": "SellPrice",
                    "id": 8
                },
                {
                    "rule": "repeated",
                    "type": "float",
                    "name": "SellVolume",
                    "id": 9
                }
            ]
        },
        {
            "name": "QuoteMinSingle",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "FenShi",
                    "name": "Data",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RiQi",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiQu",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiHeJingJiaDianShu",
                    "id": 5
                },
                {
                    "rule": "repeated",
                    "type": "JiaoYiShiJianDuanJieGou",
                    "name": "JiaoYiShiJianDuan",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZuoShou",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "QingPan",
                    "id": 8
                }
            ],
            "messages": [
                {
                    "name": "JiaoYiShiJianDuanJieGou",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "KaiShiShiJian",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "JieShuShiJian",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "KaiShiRiQi",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "JieShuRiQi",
                            "id": 4
                        }
                    ]
                }
            ]
        },
        {
            "name": "QuoteMinOutput",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "QuoteMinSingle",
                    "name": "Results",
                    "id": 1
                }
            ]
        },
        {
            "name": "QuoteBOrder",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiJian",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiRu",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WeiTuoMaiChu",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MaiRuZhongDanBiLi",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MaiRuDaDanBiLi",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MaiRuTeDaDanBiLi",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MaiChuZhongDanBiLi",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MaiChuDaDanBiLi",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MaiChuTeDaDanBiLi",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DuanXianMaiRu",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DuanXianMaiChu",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DuanXianChiHuo",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DuanXianTuHuo",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DaDanLiuRuJinE",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DaDanLiuChuJinE",
                    "id": 15
                }
            ]
        },
        {
            "name": "QuoteBOrderSingle",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "QuoteBOrder",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "QuoteBOrderOutput",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "QuoteBOrderSingle",
                    "name": "Results",
                    "id": 1
                }
            ]
        },
        {
            "name": "JPBShuJu",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "DaiMa",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "MingCheng",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ShuXing",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "KuoZhan",
                    "id": 4
                }
            ]
        },
        {
            "name": "JPBShuChu",
            "fields": [
                {
                    "rule": "required",
                    "type": "JPBLeiXing",
                    "name": "LeiXing",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "JPBShuJu",
                    "name": "ShuJu",
                    "id": 2
                }
            ]
        },
        {
            "name": "JianPanBaoShuChu",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "GuanJianZi",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "JPBShuChu",
                    "name": "JieGuo",
                    "id": 2
                }
            ]
        },
        {
            "name": "ADPutResponse",
            "fields": [
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "ErrCode",
                    "id": 1
                }
            ]
        },
        {
            "name": "ADInfo",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Slot",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Data",
                    "id": 2
                },
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "Version",
                    "id": 3
                }
            ]
        },
        {
            "name": "ADGetResponse",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "ADInfo",
                    "name": "Slots",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "PropVersion",
                    "id": 2
                }
            ]
        },
        {
            "name": "MessageChannelSubtype",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "name",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "queue_size",
                    "id": 2
                },
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "per_size",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "description",
                    "id": 4
                }
            ]
        },
        {
            "name": "FenJiJiJin",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "Type",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Obj",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZhengTiYiJia",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MYiJia",
                    "id": 51
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MShiShiJingZhi",
                    "id": 52
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MShangZheXuZhang",
                    "id": 53
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MXiaZheXuDie",
                    "id": 54
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "YinHanShouYi",
                    "id": 101
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiaGeGangGan",
                    "id": 151
                }
            ]
        },
        {
            "name": "FenJiJiJinJingTai",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "FenJiJingTaiShuJu",
                    "name": "ShuJu",
                    "id": 1
                }
            ]
        },
        {
            "name": "FenJiJingTaiShuJu",
            "fields": [
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "MObj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "MJingZhi",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "MShangZheFaZhi",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "AObj",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "AZuiXinJingZhi",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "AChangNeiFenE",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "AFenEZhanBi",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "AYueDingShouYi",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "AYueDingShouYi2",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "BObj",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "BZuiXinJingZhi",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "BChangNeiFenE",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "BGenZongObj",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "BChuShiGangGan",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "BFenEZhanBi",
                    "id": 15
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "BXiaZheFaZhi",
                    "id": 16
                }
            ]
        },
        {
            "name": "Token",
            "fields": [
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "result",
                    "id": 1,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "token",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "version",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "create_time",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "refresh_time",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "duration",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "appid",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "device",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "uid",
                    "id": 9
                }
            ]
        },
        {
            "name": "PaiXu",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Value",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Text",
                    "id": 3
                }
            ]
        },
        {
            "name": "PaiMing",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Value",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Text",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MingCi",
                    "id": 4
                }
            ]
        },
        {
            "name": "NewsInfoValue",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "ver",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "uint32",
                    "name": "act",
                    "id": 2
                },
                {
                    "rule": "required",
                    "type": "uint64",
                    "name": "newsID",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "newsTitle",
                    "id": 4
                }
            ]
        },
        {
            "name": "XinWenXinXiEx",
            "fields": [
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "source",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "date",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "title",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "context",
                    "id": 4
                }
            ]
        },
        {
            "name": "XinWenXinXiOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "TotalCount",
                    "id": 2
                },
                {
                    "rule": "repeated",
                    "type": "XinWenXinXiEx",
                    "name": "Data",
                    "id": 3
                }
            ]
        },
        {
            "name": "XinWenXinXiZhongXin",
            "fields": [
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "title",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "context",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "source",
                    "id": 4
                }
            ]
        },
        {
            "name": "XinWenXinXiZhongXinOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "TotalCount",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "XinWenXinXiZhongXin",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "GongGaoXinXi",
            "fields": [
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "source",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "date",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "title",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "context",
                    "id": 4
                }
            ]
        },
        {
            "name": "GongGaoXinXiOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "TotalCount",
                    "id": 2
                },
                {
                    "rule": "repeated",
                    "type": "GongGaoXinXi",
                    "name": "Data",
                    "id": 3
                }
            ]
        },
        {
            "name": "GongGaoXinXiZhongXin",
            "fields": [
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "title",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "context",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "source",
                    "id": 4
                }
            ]
        },
        {
            "name": "GongGaoXinXiZhongXinOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "TotalCount",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "GongGaoXinXiZhongXin",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "SelfStock",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "stock_code",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "add_time",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "op",
                    "id": 3
                }
            ]
        },
        {
            "name": "FullSelfStock",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "SelfStock",
                    "name": "codes",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "position",
                    "id": 2,
                    "options": {
                        "default": 0
                    }
                }
            ]
        },
        {
            "name": "SelfStockGetOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "uid",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "SelfStock",
                    "name": "codes",
                    "id": 2
                },
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "type",
                    "id": 3
                }
            ]
        },
        {
            "name": "SelfStockPutOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "uid",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "status",
                    "id": 2
                }
            ]
        },
        {
            "name": "Privilege",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "name",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "value",
                    "id": 2
                }
            ]
        },
        {
            "name": "Privileges",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "Privilege",
                    "name": "items",
                    "id": 1
                }
            ]
        },
        {
            "name": "AppInfo",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Name",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Owner",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Desc",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Email",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ExpireTime",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "CreateTime",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Limit",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Duration",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "AppId",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "SecretKey",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "ServiceAuth",
                    "name": "Auth",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "CrmAppId",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "ShortAppId",
                    "id": 13
                }
            ]
        },
        {
            "name": "ProfileValue",
            "fields": [
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "BitPos",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "Privilege",
                    "name": "Priv",
                    "id": 2
                }
            ]
        },
        {
            "name": "ServiceAuth",
            "fields": [
                {
                    "rule": "required",
                    "type": "bytes",
                    "name": "AuthBitMask",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "ProfileValue",
                    "name": "BitProfileValue",
                    "id": 2
                }
            ]
        },
        {
            "name": "AccOpResponse",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Result",
                    "id": 1,
                    "options": {
                        "default": "0"
                    }
                },
                {
                    "rule": "optional",
                    "type": "AppInfo",
                    "name": "Info",
                    "id": 2
                }
            ]
        },
        {
            "name": "TokenData",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Token",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Appid",
                    "id": 2
                },
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "CreatedTime",
                    "id": 3
                },
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "ExpireTime",
                    "id": 4
                },
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "RefreshTime",
                    "id": 5
                },
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "Duration",
                    "id": 6
                },
                {
                    "rule": "required",
                    "type": "ServiceAuth",
                    "name": "Auth",
                    "id": 7
                }
            ]
        },
        {
            "name": "AppKey",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "AppId",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Secret",
                    "id": 2
                }
            ]
        },
        {
            "name": "AppValue",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Secret",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "AppInfo",
                    "name": "Info",
                    "id": 2
                }
            ]
        },
        {
            "name": "AppInfoServiceAuth",
            "fields": [
                {
                    "rule": "required",
                    "type": "AppInfo",
                    "name": "Info",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "ServiceAuth",
                    "name": "Auth",
                    "id": 2
                }
            ]
        },
        {
            "name": "AppServiceAuth",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "AppId",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "AppInfoServiceAuth",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "ServiceAuthList",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "AppServiceAuth",
                    "name": "AppAuthLists",
                    "id": 1
                }
            ]
        },
        {
            "name": "TokenAuth",
            "fields": [
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "Limit",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "Expireln",
                    "id": 2
                },
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "ExpireTime",
                    "id": 3
                }
            ]
        },
        {
            "name": "YunMsg",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "RecordTime",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "from",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "to",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "type",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "msg",
                    "id": 5
                }
            ]
        },
        {
            "name": "MsgGetOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "to",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "YunMsg",
                    "name": "msgs",
                    "id": 2
                }
            ]
        },
        {
            "name": "MsgPutOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "from",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "to",
                    "id": 2
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "status",
                    "id": 3
                }
            ]
        },
        {
            "name": "YunMsgType",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "literalVal",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "uint32",
                    "name": "numericVal",
                    "id": 2
                },
                {
                    "rule": "required",
                    "type": "uint32",
                    "name": "objType",
                    "id": 3
                }
            ]
        },
        {
            "name": "UserGroup",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Id",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Name",
                    "id": 2
                },
                {
                    "rule": "repeated",
                    "type": "string",
                    "name": "user_prop",
                    "id": 3
                },
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "create_time",
                    "id": 4
                }
            ]
        },
        {
            "name": "UserGroupResponse",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Id",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Err_code",
                    "id": 2
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Err_msg",
                    "id": 3
                }
            ]
        },
        {
            "name": "PrivConst",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "name",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "urlKey",
                    "id": 2
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "attribute",
                    "id": 3
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "description",
                    "id": 4
                }
            ]
        },
        {
            "name": "ServiceAuthConsts",
            "fields": [
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "pos",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "name",
                    "id": 2
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "description",
                    "id": 3
                },
                {
                    "rule": "repeated",
                    "type": "PrivConst",
                    "name": "items",
                    "id": 4
                }
            ]
        },
        {
            "name": "YiZhiXinYeJiYuCe",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "baoGaoRiQi",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "yuCeNianDu",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jingLiRun",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "meiGuShouYi",
                    "id": 4
                }
            ]
        },
        {
            "name": "YiZhiXinYeJiYuCeOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "YiZhiXinYeJiYuCe",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "YiZhiXinTouZiPinJi",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "pinJiRiQi",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "zhengTiPinJi",
                    "id": 2
                }
            ]
        },
        {
            "name": "YiZhiXinTouZiPinJiOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "YiZhiXinTouZiPinJi",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "GeGuYeJiYuCe",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "yuCeNianDu",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "meiGuShouYi",
                    "id": 2
                }
            ]
        },
        {
            "name": "GeGuYeJiYuCeData",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "yanJiuJiGou",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "baoGaoRiQi",
                    "id": 2
                },
                {
                    "rule": "repeated",
                    "type": "GeGuYeJiYuCe",
                    "name": "data",
                    "id": 3
                }
            ]
        },
        {
            "name": "GeGuYeJiYuCeOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "GeGuYeJiYuCeData",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "GeGuTouZiYanBao",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "baoGaoRiQi",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "yanJiuJiGou",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "pinJiLeiBie",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "pinJiBianDong",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "yanBaoBiaoTi",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "yanBaoNeiRong",
                    "id": 6
                }
            ]
        },
        {
            "name": "GeGuTouZiYanBaoOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "GeGuTouZiYanBao",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "TongJiApp",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ChengJiaoE",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "LiuTongShiZhi",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZongShiZhi",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "ZhangDiePingShuJu",
                    "name": "ZhangDiePing",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "LingZhangGuShuJu",
                    "name": "LingZhangGu",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "TingPaiJiaShu",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "ZhangTingDieTingShuJu",
                    "name": "ZhangTingDieTing",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "GuPiaoGeShu",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "PingJunJingTaiShiYingLv",
                    "id": 9
                }
            ],
            "messages": [
                {
                    "name": "LingZhangGuShuJu",
                    "fields": [
                        {
                            "rule": "required",
                            "type": "string",
                            "name": "Obj",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "string",
                            "name": "ZhongWenJianCheng",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "ZuiXinJia",
                            "id": 3
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "ZhangFu",
                            "id": 4
                        }
                    ]
                },
                {
                    "name": "ZhangDiePingShuJu",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "ShangZhangJiaShu",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "XiaDieJiaShu",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "PingPanJiaShu",
                            "id": 3
                        }
                    ]
                },
                {
                    "name": "ZhangTingDieTingShuJu",
                    "fields": [
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "ZhangTingJiaShu",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "type": "int64",
                            "name": "DieTingJiaShu",
                            "id": 2
                        }
                    ]
                }
            ]
        },
        {
            "name": "AttrsMap",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "key",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "value",
                    "id": 2
                }
            ]
        },
        {
            "name": "UserGetPropResponse",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "userid",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "accounttype",
                    "id": 2
                },
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "timestamp",
                    "id": 3
                },
                {
                    "rule": "repeated",
                    "type": "AttrsMap",
                    "name": "attrs",
                    "id": 4
                }
            ]
        },
        {
            "name": "DXSpirit",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "ShiJian",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Obj",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "TongZhi",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShuJu",
                    "id": 4
                }
            ]
        },
        {
            "name": "DXSpiritStat",
            "fields": [
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "HjfsTotal",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "KsftTotal",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "GttsTotal",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JsxdTotal",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DbmrTotal",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DbmrStatistics",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DbmcTotal",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DbmcStatistics",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "FztbTotal",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "FdtbTotal",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DkztTotal",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DkdtTotal",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "YdmcPTotal",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "YdmrPTotal",
                    "id": 15
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "LszsTotal",
                    "id": 16
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DyzsTotal",
                    "id": 17
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JgmrgdTotal",
                    "id": 18
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JgmcgdTotal",
                    "id": 19
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DcjmrdTotal",
                    "id": 20
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "DcjmcdTotal",
                    "id": 21
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "FdmrgdTotal",
                    "id": 22
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "FdmcgdTotal",
                    "id": 23
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MrcdTotal",
                    "id": 24
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MccdTotal",
                    "id": 25
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MrxdTotal",
                    "id": 26
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "McxdTotal",
                    "id": 27
                }
            ]
        },
        {
            "name": "Stock",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "Price",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Time",
                    "id": 2
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 3
                }
            ]
        },
        {
            "name": "StkPool",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Text",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "Stock",
                    "name": "Stk",
                    "id": 2
                }
            ]
        },
        {
            "name": "StkPoolOuput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "CeWenShiJian",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "StkPool",
                    "name": "Pooldata",
                    "id": 2
                }
            ]
        },
        {
            "name": "EventNews",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "id",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "title",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "context",
                    "id": 4
                },
                {
                    "rule": "repeated",
                    "type": "string",
                    "name": "objList",
                    "id": 5
                }
            ]
        },
        {
            "name": "EventNewsList",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "EventNews",
                    "name": "dataList",
                    "id": 1
                }
            ]
        },
        {
            "name": "F10CpbdZxzbOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "shiq",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mgsy",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mgjzc",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zgb",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ltag",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jzcsyl",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mgxjl",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mggjj",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mgwfplr",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zylrtbzz",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jlrtbzz",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "fpyan",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "cq",
                    "id": 15
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "cym",
                    "id": 16
                }
            ]
        },
        {
            "name": "F10CpbdKpqk",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "gdhs",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "rjcltg",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "tcsdrjcltg",
                    "id": 4
                }
            ]
        },
        {
            "name": "CpbdCjhbData",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "cjl",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "cjje",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "zdlx",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zdz",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "yybmc",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mlje",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mcje",
                    "id": 7
                }
            ]
        },
        {
            "name": "F10CpbdCjhb",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "CpbdCjhbData",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10CwtsLrfpbzy",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "dw",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "yysr",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "yycb",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "glfy",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "yyfy",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "cwfy",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "yylr",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "tzsy",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "yywszje",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "lrze",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jlr",
                    "id": 12
                }
            ]
        },
        {
            "name": "F10CwtsZcfzbzy",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "dw",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zzc",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ldzc",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "hbzj",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jyxjrzc",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ch",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "yszkze",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "qtysk",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "gdzcje",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "kgcsjrzc",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "wxzc",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "dqjk",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "yszk",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "yfzk",
                    "id": 15
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ldfz",
                    "id": 16
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "cqfz",
                    "id": 17
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zfz",
                    "id": 18
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "gdqy",
                    "id": 19
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zbgjj",
                    "id": 20
                }
            ]
        },
        {
            "name": "ZygcData",
            "fields": [
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "lb",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "hy",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zysr",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zysrzb",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zysrtbbh",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zycb",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zycbtbbh",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zylr",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mll",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mlltbbh",
                    "id": 10
                }
            ]
        },
        {
            "name": "F10Zygc",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "ZygcData",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10DstxJjlt",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jjgf",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zzgf",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "gflx",
                    "id": 4
                }
            ]
        },
        {
            "name": "F10DstxRzrq",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "rzje",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "rzmre",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "rqyl",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "rqye",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "rqmcl",
                    "id": 6
                }
            ]
        },
        {
            "name": "DstxJgccData",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "cgjs",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "cgs",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zltgbl",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "type",
                    "id": 5
                }
            ]
        },
        {
            "name": "F10DstxJgcc",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "DstxJgccData",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10DstxGdzjc",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "gdmc",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "bdfx",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "gdlx",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "bdsl",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zzgb",
                    "id": 6
                }
            ]
        },
        {
            "name": "F10DstxDzjy",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jg",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "drspj",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "zjl",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "cjl",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "cjje",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "mf",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "mf2",
                    "id": 8
                }
            ]
        },
        {
            "name": "F10DstxCgbdqk",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "bdr",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "bdsl",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jj",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jcgs",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "djg",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "bdyy",
                    "id": 7
                }
            ]
        },
        {
            "name": "GlcData",
            "fields": [
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "xm",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "zw",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "lb",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "rzsj",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "xl",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "qmcgs",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "xcjzrq",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "xc",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "xb",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "csrq",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "jl",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "px",
                    "id": 12
                }
            ]
        },
        {
            "name": "F10GlcOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "GlcData",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10GlcNdbcqk",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ndbcze",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zgqswdsbcze",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zgqswgjglrybcze",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "dldsjt",
                    "id": 5
                }
            ]
        },
        {
            "name": "F10ZxjbDjdxjllb",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jyxjlr",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jyxjlc",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jyxjje",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "tzxjlr",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "tzxjlc",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "tzxjje",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "czxjlr",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "czxjlc",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "czxjje",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "xjjzje",
                    "id": 11
                }
            ]
        },
        {
            "name": "F10GdjcKggdOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "mc",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "frdb",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zczb",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "clrq",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "jyyw",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "qylx",
                    "id": 7
                }
            ]
        },
        {
            "name": "F10GdjcSjkzrOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "mc",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "sm",
                    "id": 3
                }
            ]
        },
        {
            "name": "F10GbfhGbbd",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zgb",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "yltag",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "yltbg",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "bdrqgbsm",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zxjg",
                    "id": 6
                }
            ]
        },
        {
            "name": "ZbyzCyqtsszqData",
            "fields": [
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "btzzqdm",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "btzzqjc",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "cgsl",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zbl",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "cstzje",
                    "id": 5
                }
            ]
        },
        {
            "name": "F10ZbyzCyqtsszq",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "ZbyzCyqtsszqData",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "ZbyzCyfssgqData",
            "fields": [
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "scdxmc",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "cstzje",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "cgsl",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zbl",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "qmzmjz",
                    "id": 5
                }
            ]
        },
        {
            "name": "F10ZbyzCyfssgq",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "ZbyzCyfssgqData",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10zbyzRzqkzfyss",
            "fields": [
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "rzlb",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "yarq",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "gddh",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "zgyxspl",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "lgdgqdjr",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "sgr",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "fajc",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "fxfs",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "fxgplx",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zzfx",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "fxjg",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "zcxs",
                    "id": 12
                }
            ]
        },
        {
            "name": "F10ZbyzXmtzMjzjqk",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mjzjze",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "bqsyje",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jlsyje",
                    "id": 4
                }
            ]
        },
        {
            "name": "ZbyzXmtzMjzjcnxmData",
            "fields": [
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "cnxmmc",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ntrje",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "sfbgxm",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "sjtrje",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "sjsy",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "sffhjd",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "bgyycxsm",
                    "id": 7
                }
            ]
        },
        {
            "name": "F10ZbyzXmtzMjzjcnxm",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "ZbyzXmtzMjzjcnxmData",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "ZbyzXmtzMjzjbgxmData",
            "fields": [
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "bghxmmc",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ycnxmmc",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ntrje",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "sjtrje",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "sjsy",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "xmjd",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "bgxmqksm",
                    "id": 7
                }
            ]
        },
        {
            "name": "F10ZbyzXmtzMjzjbgxm",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "ZbyzXmtzMjzjbgxmData",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "ZbyzXmtzFmjzjxmData",
            "fields": [
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "xmmc",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "xmje",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "xmjd",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "xmsyqk",
                    "id": 4
                }
            ]
        },
        {
            "name": "F10ZbyzXmtzFmjzjxm",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "ZbyzXmtzFmjzjxmData",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "HydwData",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "gpmc",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ltg",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "pm1",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zzc",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "pm2",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zysr",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "pm3",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mgsy",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "pm4",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zgb",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "pm5",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jzc",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "pm6",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jlr",
                    "id": 15
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "pm7",
                    "id": 16
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jzcsyl",
                    "id": 17
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "pm8",
                    "id": 18
                }
            ]
        },
        {
            "name": "F10HydwOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "sshy",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "zjhhy",
                    "id": 4
                },
                {
                    "rule": "repeated",
                    "type": "HydwData",
                    "name": "data",
                    "id": 5
                }
            ]
        },
        {
            "name": "RsrProForecastData",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "enddate",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mgsy",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jlr",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jlrtb",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zysr",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zysrtb",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "yyyqbhl",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "itnum",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mgjzc",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "lnzz",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "syl",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "sjl",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "peg2",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "sxl",
                    "id": 14
                }
            ]
        },
        {
            "name": "F10RsrProForecastOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 2
                },
                {
                    "rule": "repeated",
                    "type": "RsrProForecastData",
                    "name": "data",
                    "id": 3
                }
            ]
        },
        {
            "name": "RsrInvestRatingData",
            "fields": [
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "sjdValue",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mr",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zc",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zx",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jc",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mc",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jgzs",
                    "id": 7
                }
            ]
        },
        {
            "name": "F10RsrInvestRatingOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 2
                },
                {
                    "rule": "repeated",
                    "type": "RsrInvestRatingData",
                    "name": "data",
                    "id": 3
                }
            ]
        },
        {
            "name": "RsrEarnPSForeData",
            "fields": [
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "endDate",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "pj",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "value",
                    "id": 3
                }
            ]
        },
        {
            "name": "F10RsrEarnPSFore",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "companyName",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 2
                },
                {
                    "rule": "repeated",
                    "type": "RsrEarnPSForeData",
                    "name": "data",
                    "id": 3
                }
            ]
        },
        {
            "name": "F10RsrResReport",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "companyName",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "titles",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "investAdvice",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "psName",
                    "id": 5
                }
            ]
        },
        {
            "name": "F10GsgkOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "zqlx",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "gsdm",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "gsmc",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ywqc",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "zcdz",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "bgdz",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ssqy",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "sshy",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "gswz",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "dzxx",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ssrq",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "zgrq",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "fxl",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "fxj",
                    "id": 15
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "srkpj",
                    "id": 16
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "sstjr",
                    "id": 17
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "zcxs",
                    "id": 18
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "frdb",
                    "id": 19
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "dsz",
                    "id": 20
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "zjl",
                    "id": 21
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "dm",
                    "id": 22
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "zqdb",
                    "id": 23
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "dh",
                    "id": 24
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "cz",
                    "id": 25
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "yb",
                    "id": 26
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "kjsws",
                    "id": 27
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "zyfw",
                    "id": 28
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "gsjs",
                    "id": 29
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "dmdh",
                    "id": 30
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "dmcz",
                    "id": 31
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "dmdzyx",
                    "id": 32
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "RegionName",
                    "id": 33
                }
            ]
        },
        {
            "name": "F10CwtsZycwzb",
            "fields": [
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "kjssjyj",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jbmgsy",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "kchjbmgsy",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "tbmgsy",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mgjzc",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mgwfplr",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mggjj",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "xsmll",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "yylrl",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jlrl",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jqjzcsyl",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "tbjzcsyl",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "gdqy",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ldbl",
                    "id": 15
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "sdbl",
                    "id": 16
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mgjyxjll",
                    "id": 17
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "bbgbr",
                    "id": 18
                }
            ]
        },
        {
            "name": "F10CwtsZycwzbOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10CwtsZycwzb",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10CwtsXjllbzy",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "xjjzje",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "dw",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jyxjlr",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jyxjlc",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jyxjje",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "tzxjlr",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "tzxjlc",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "tzxjje",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "czxjlr",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "czxjlc",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "czxjje",
                    "id": 12
                }
            ]
        },
        {
            "name": "F10CwtsXjllbzyOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10CwtsXjllbzy",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10ZxjbDjdcwzb",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jlrhb",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mgsy",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "xsjll",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jzcsyl",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mgjyxjll",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zysrtb",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jlrtb",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "zysrhb",
                    "id": 9
                }
            ]
        },
        {
            "name": "F10ZxjbDjdcwzbOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10ZxjbDjdcwzb",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10Zxjbdjdleb",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ssgdsy",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "yysr",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "yycb",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "yysjjfj",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "xsfy",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "glfy",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "cwfy",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "tzsy",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "yylr",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "yywsr",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "yywzc",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "lrze",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "sdsfy",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "jlr",
                    "id": 15
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "mgzjlr",
                    "id": 16
                }
            ]
        },
        {
            "name": "F10ZxjbdjdlebOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10Zxjbdjdleb",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10GdjcGdhs",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Gdzhs",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "date",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Hbzj",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Hbbh",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Rjcg",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Ltgdhs",
                    "id": 6
                }
            ]
        },
        {
            "name": "F10GdjcGdhsOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10GdjcGdhs",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10GdjcGd",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Gdrs",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Xh",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Gdmc",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Cgs",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Zzgs",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Zjqk",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Gbxz",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Gsdm",
                    "id": 8
                }
            ]
        },
        {
            "name": "F10GdjcSdgd",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Date",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10GdjcGd",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10GdjcSdgdOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10GdjcSdgd",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10GdjcSdltgd",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Date",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10GdjcGd",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10GdjcSdltgdOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10GdjcSdltgd",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10GbfhFhkg",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Date",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Mgsg",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Mgzz",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Mgfh",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Mgp",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Pgjg",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Zfgfsl",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Zfjg",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Gqdjr",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Cqcxr",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Zhjyr",
                    "id": 11
                }
            ]
        },
        {
            "name": "F10GbfhFhkgOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10GbfhFhkg",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10GbfhGbjg",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Date",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Zgb",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Ltgf",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Ltag",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Ltbg",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Lthg",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Qtltgf",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Xsltg",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Xsltag",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Xsltbg",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Xslthg",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Xsgjcg",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Xsgyfrcg",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Xsjnfrcg",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Xsjnzrrcg",
                    "id": 15
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Xsggcg",
                    "id": 16
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Xsjwfrcg",
                    "id": 17
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Xsjwzrrcg",
                    "id": 18
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Wltg",
                    "id": 19
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Gjg",
                    "id": 20
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Gyfrg",
                    "id": 21
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Jnfgyfr",
                    "id": 22
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Zpg",
                    "id": 23
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Nbzgg",
                    "id": 24
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Yxg",
                    "id": 25
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Jwfrg",
                    "id": 26
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Qtwltgf",
                    "id": 27
                }
            ]
        },
        {
            "name": "F10GbfhGbjgOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10GbfhGbjg",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10CpbdKpqkOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10CpbdKpqk",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10CpbdCjhbOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10CpbdCjhb",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10CwtsLrfpbzyOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10CwtsLrfpbzy",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10CwtsZcfzbzyOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10CwtsZcfzbzy",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10ZygcOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10Zygc",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10DstxJjltOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10DstxJjlt",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10DstxRzrqOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10DstxRzrq",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10DstxJgccOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10DstxJgcc",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10DstxGdzjcOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10DstxGdzjc",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10DstxDzjyOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10DstxDzjy",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10DstxCgbdqkOutput",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10DstxCgbdqk",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10GlcNdbcqkOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10GlcNdbcqk",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10ZxjbDjdxjllbOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10ZxjbDjdxjllb",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10GbfhGbbdOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10GbfhGbbd",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10ZbyzCyqtsszqOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10ZbyzCyqtsszq",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10ZbyzCyfssgqOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10ZbyzCyfssgq",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10zbyzRzqkzfyssOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10zbyzRzqkzfyss",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10ZbyzXmtzMjzjqkOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10ZbyzXmtzMjzjqk",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10ZbyzXmtzMjzjcnxmOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10ZbyzXmtzMjzjcnxm",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10ZbyzXmtzMjzjbgxmOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10ZbyzXmtzMjzjbgxm",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10ZbyzXmtzFmjzjxmOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10ZbyzXmtzFmjzjxm",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10RsrEarnPSForeOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10RsrEarnPSFore",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "F10RsrResReportOutPut",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "F10RsrResReport",
                    "name": "data",
                    "id": 2
                }
            ]
        },
        {
            "name": "FluxValue",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Appid",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "UsedFlux",
                    "id": 2
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "MaxFlux",
                    "id": 3
                }
            ]
        },
        {
            "name": "JunXianPaiBu",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JunXianPaiBuLeiXing",
                    "id": 2
                }
            ]
        },
        {
            "name": "TopicInvestData",
            "fields": [
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "TopicInvestId",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "TopicInvestName",
                    "id": 2
                },
                {
                    "rule": "repeated",
                    "type": "string",
                    "name": "ComponentObj",
                    "id": 3
                }
            ]
        },
        {
            "name": "EventTopicData",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "TopicInvestId",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "TopicInvestName",
                    "id": 2
                }
            ]
        },
        {
            "name": "EventObjData",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Name",
                    "id": 2
                }
            ]
        },
        {
            "name": "FutureEvent",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "EventID",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Title",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ExpectTime",
                    "id": 3
                },
                {
                    "rule": "repeated",
                    "type": "EventTopicData",
                    "name": "TopicData",
                    "id": 4
                },
                {
                    "rule": "repeated",
                    "type": "EventObjData",
                    "name": "ObjData",
                    "id": 5
                }
            ]
        },
        {
            "name": "StockFutureEvent",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "FutureEvent",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "Score",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZiJinLiuXiangShiRiPingFen",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZiJinLiuXiangDangRiPingFen",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiFouShuYuRenYiZhuTi",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ZhuTiBianHao",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ZhuTiMingChen",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZhuTiReDuPingFen",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiFouRongZiRongQuanGu",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RongZiYuEZengZhangLvPingFen",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "RongZiYuEZhanBiPingFen",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShiFouShangBangGuPiao",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "LongHuBangPingFen",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "LongHuBangJiGouPingFen",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiBenMianZhuYingShouRuTongBiPingFen",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiBenMianXiaoShouMaoLiLvPingFen",
                    "id": 15
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiBenMianZiChanFuZhaiLvPingFen",
                    "id": 16
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiBenMianJingTaiShiYingLvPingFen",
                    "id": 17
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiBenMianZiChanShouYiLvPingFen",
                    "id": 18
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "GuPiaoBanKuaiPingJi",
                    "id": 19
                }
            ]
        },
        {
            "name": "LongHuBang",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShangBangCiShu",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiGouJingMaiRuE",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShangBangCiShuPaiMing",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JiGouJingMaiRuZhanBiPaiMing",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ZhuLiJingMaiRuZhanBiPaiMing",
                    "id": 6
                }
            ]
        },
        {
            "name": "LongHuBangTongJi",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ShangBangGeShu",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "string",
                    "name": "ShangBangLieBiao",
                    "id": 2
                }
            ]
        },
        {
            "name": "OverallInfo",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "TotalStockNum",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "AgreementStockNum",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BrokerStockNum",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "WaitStockNum",
                    "id": 4
                }
            ]
        },
        {
            "name": "TodayListStock",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "StockCode",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "StockName",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "MainBroker",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Industry",
                    "id": 4
                }
            ]
        },
        {
            "name": "TodayListStocks",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "ListStockNum",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "TodayListStock",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "TodayBrokerStock",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "StockCode",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "StockName",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BrokerNum",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "NewAddNum",
                    "id": 4
                }
            ]
        },
        {
            "name": "TodayBrokerStocks",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "BrokerStockNum",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "TodayBrokerStock",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "TodayConvertStock",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "StockCode",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "StockName",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "BrokerNum",
                    "id": 3
                }
            ]
        },
        {
            "name": "TodayConvertStocks",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "ConvertStockNum",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "TodayConvertStock",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "TodayIssueStock",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "StockCode",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "StockName",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ProjectAdvance",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "IssuePrice",
                    "id": 4
                }
            ]
        },
        {
            "name": "TodayIssueStocks",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "IssueStockNum",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "TodayIssueStock",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "BrokerStock",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "StockCode",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "StockName",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Price",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "InitAmount",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "InitCost",
                    "id": 5
                }
            ]
        },
        {
            "name": "BrokerDetaileInfo",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "BrokerName",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "FirstStockNum",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "LastStockNum",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MainStockNum",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "AvgPE",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "AvgPB",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "TotalValue",
                    "id": 7
                },
                {
                    "rule": "repeated",
                    "type": "BrokerStock",
                    "name": "Data",
                    "id": 8
                }
            ]
        },
        {
            "name": "BrokerInfo",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "BrokerName",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "BeginDate",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "InitAmount",
                    "id": 3
                }
            ]
        },
        {
            "name": "StockBrokerInfo",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "StockCode",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "StockName",
                    "id": 2
                },
                {
                    "rule": "repeated",
                    "type": "BrokerInfo",
                    "name": "Data",
                    "id": 3
                }
            ]
        },
        {
            "name": "IssueDetaileInfo",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "StockCode",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "StockName",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "IssueAmount",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "CollectCapital",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "IssuePrice",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "LastClose",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "IssuePE",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "OverflowRatio",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ProjectAdvance",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "IssueDate",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "IssueTarget",
                    "id": 11
                }
            ]
        },
        {
            "name": "IssueStock",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "StockCode",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "StockName",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "NoticeDate",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "IssueScale",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "IssuePrice",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ProjectAdvance",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "PE",
                    "id": 7
                }
            ]
        },
        {
            "name": "IssueStatInfo",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "StockNum",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "TotalScale",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "AvgPE",
                    "id": 3
                },
                {
                    "rule": "repeated",
                    "type": "IssueStock",
                    "name": "Data",
                    "id": 4
                }
            ]
        },
        {
            "name": "BrokerData",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "BrokerName",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "LastStockNum",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "FirstStockNum",
                    "id": 3
                }
            ]
        },
        {
            "name": "BrokerList",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "BrokerNum",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "BrokerData",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "QuickReportData",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "StockCode",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "StockName",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ReportDate",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "ReportTitle",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "Class",
                    "id": 5
                }
            ]
        },
        {
            "name": "FinanceQuickReport",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "QuickReportData",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "TopicPage",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "SuoShuZhuTi",
                    "id": 2
                }
            ]
        },
        {
            "name": "LHBTongJiGuanZhu",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "GengXinShiJian",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "JiGouJingMaiRuJinE",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "YouZiJingMaiRuJiaShu",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "JiGouMaiRuJinE",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "JiGouMaiChuJinE",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "JiGouMaiRuJiaShu",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "JiGouMaiChuJiaShu",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "YouZiMaiRuJinE",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "YouZiMaiChuJinE",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "YouZiMaiRuJiaShu",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "YouZiMaiChuJiaShu",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "GuPiaoMingCheng",
                    "id": 13
                }
            ]
        },
        {
            "name": "LHBTongJiGuanZhuFanHui",
            "fields": [
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "ShuJuZongGeShu",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "LHBTongJiGuanZhu",
                    "name": "TongJiGuanZhu",
                    "id": 2
                }
            ]
        },
        {
            "name": "LHBTongJiReMenGeGu",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "GuPiaoMingCheng",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "ShangBangChiShu",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "ChengJiaoJinE",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "MaiRuJinE",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "MaiChuJinE",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "JiGouCanYuChiShu",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "JiGouMaiRuJinE",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "JiGouMaiChuJinE",
                    "id": 12
                }
            ]
        },
        {
            "name": "LHBTongJiReMenGeGuFanHui",
            "fields": [
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "ShuJuZongGeShu",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "LHBTongJiReMenGeGu",
                    "name": "TongJiReMenGeGu",
                    "id": 2
                }
            ]
        },
        {
            "name": "LHBTongJiReMenGeGuLiShi",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "GengXinShiJian",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "YiDongChiShu",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "QuanShangMaiRuJinE",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "QuanShangMaiChuJinE",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "JiGouMaiRuJinE",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "JiGouMaiChuJinE",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "YouZiMaiRuJinE",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "YouZiMaiChuJinE",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "JiGouShangBangChiShu",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "TongJiTianShuLeiXing",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "JiGouMaiRuJiaShu",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "JiGouMaiChuJiaShu",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "YouZiMaiRuJiaShu",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "YouZiMaiChuJiaShu",
                    "id": 15
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "YiDongLeiXing",
                    "id": 16
                }
            ]
        },
        {
            "name": "LHBTongJiReMenYingYeBu",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "XiWeiDaiMa",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "GengXinShiJian",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "XiWeiMingCheng",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "MaiRuChiShu",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "MaiRuChengGongChiShu",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "MaiChuChiShu",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "MaiChuChengGongChiShu",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "MaiRuJinE",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "MaiChuJinE",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "MaiRuShouYiLv",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "MaiChuShouYiLv",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "ShangBangChiShu",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "TongJiChiShu",
                    "id": 13
                }
            ]
        },
        {
            "name": "LHBTongJiReMenYingYeBuFanHui",
            "fields": [
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "ShuJuZongGeShu",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "LHBTongJiReMenYingYeBu",
                    "name": "TongJiReMenYingYeBu",
                    "id": 2
                }
            ]
        },
        {
            "name": "LHBLiShiShuJu",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "GuPiaoMingCheng",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "XiWeiMingCheng",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "GengXinShiJian",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "DangRiZhangFu",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "ChiRiZhangFu",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "ChengJiaoJinE",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "MaiRuJinE",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "MaiChuJinE",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "YiDongLeiXing",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "ShouPanJia",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "HuanShouLv",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "YiDongZhi",
                    "id": 13
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "XiWeiDaiMa",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "TongJiTianShuLeiXing",
                    "id": 15
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "XiWeiPaiMing",
                    "id": 16
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "ShangBangChiShu",
                    "id": 17
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "MaiMaiFangXiang",
                    "id": 18
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "XiWeiLeiXing",
                    "id": 19
                }
            ]
        },
        {
            "name": "LHBLiShiShuJuFanHui",
            "fields": [
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "ShuJuZongGeShu",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "LHBLiShiShuJu",
                    "name": "LiShiShuJu",
                    "id": 2
                }
            ]
        },
        {
            "name": "LHBTongJiLiShiShuJu",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "GuPiaoMingCheng",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "XiWeiMingCheng",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "TongJiTianShu",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "GengXinShiJian",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "ShangBangChiShu",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "MaiRuJinE",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "MaiRuChiShu",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "MaiChuJinE",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "MaiChuChiShu",
                    "id": 10
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "ChengJiaoJinE",
                    "id": 11
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "XiWeiDaiMa",
                    "id": 12
                }
            ]
        },
        {
            "name": "LHBTongJiLiShiShuJuFanHui",
            "fields": [
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "ShuJuZongGeShu",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "LHBTongJiLiShiShuJu",
                    "name": "TongJiLiShiShuJu",
                    "id": 2
                }
            ]
        },
        {
            "name": "LHBLongHuBangLiShi",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "GuPiaoMingCheng",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "GengXinShiJian",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "MaiRuJinE",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "MaiChuJinE",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "ChengJiaoJinE",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "ShouPanJia",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "DangRiZhangFu",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "HuanShouLv",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "YiDongLeiXing",
                    "id": 10
                }
            ]
        },
        {
            "name": "LHBLongHuBangLiShiFanHui",
            "fields": [
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "ShuJuZongGeShu",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "LHBLongHuBangLiShi",
                    "name": "LongHuBangLiShi",
                    "id": 2
                }
            ]
        },
        {
            "name": "LHBLongHuBangGuanZhu",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "GuPiaoMingCheng",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "GengXinShiJian",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "MaiRuJinE",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "MaiChuJinE",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "ChengJiaoJinE",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "ShouPanJia",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "DangRiZhangFu",
                    "id": 8
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "HuanShouLv",
                    "id": 9
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "YiDongLeiXing",
                    "id": 10
                }
            ]
        },
        {
            "name": "PcYiZhiXinYeJiYuCe",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "YanBaoRiQi",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JinNianEEPS",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MingNianEEPS",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "JinNianEPE",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "MingNianEPE",
                    "id": 5
                }
            ]
        },
        {
            "name": "PcYeJiYuCeShuJu",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "PcYiZhiXinYeJiYuCe",
                    "name": "YiZhiXinYeJiYuCe",
                    "id": 2
                }
            ]
        },
        {
            "name": "PcYiZhiXinYeJiYuCeLiShi",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "YanBaoRiQi",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "JieZhiRiQi",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "EEPS",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "EPE",
                    "id": 5
                }
            ]
        },
        {
            "name": "XinWenXinXi",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "version",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "date",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "newsId",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "title",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "context",
                    "id": 6
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "source",
                    "id": 7
                }
            ]
        },
        {
            "name": "NewsCenter",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "version",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "date",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "newsId",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "title",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "context",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "source",
                    "id": 6
                }
            ]
        },
        {
            "name": "NewsDataItem",
            "fields": [
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "NewsId",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Date",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Title",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Context",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Source",
                    "id": 5
                }
            ]
        },
        {
            "name": "StockNews",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "NewsDataItem",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "NewsClassData",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "Version",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "int64",
                    "name": "ClassMask",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "NewsDataItem",
                    "name": "Data",
                    "id": 3
                }
            ]
        },
        {
            "name": "AnnouncemtDataItem",
            "fields": [
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Date",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "AnnouncemId",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Title",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Context",
                    "id": 4
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "type",
                    "id": 5
                }
            ]
        },
        {
            "name": "StockAnnouncemt",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Obj",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "AnnouncemtDataItem",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "InnerNewsDataItem",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "Version",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "NewsDataItem",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "InnerAnnouncemtDataItem",
            "fields": [
                {
                    "rule": "required",
                    "type": "int64",
                    "name": "Version",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "AnnouncemtDataItem",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "MSG",
            "fields": [
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "Id",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "Obj",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "Table",
                    "name": "Tbl",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "JsonTbl",
                    "id": 4
                },
                {
                    "rule": "repeated",
                    "type": "QuoteDynaSingle",
                    "name": "RepDataQuoteDynaSingle",
                    "id": 20
                },
                {
                    "rule": "repeated",
                    "type": "QuoteKlineSingle",
                    "name": "RepDataQuoteKlineSingle",
                    "id": 21
                },
                {
                    "rule": "repeated",
                    "type": "QuoteTickSingle",
                    "name": "RepDataQuoteTickSingle",
                    "id": 22
                },
                {
                    "rule": "repeated",
                    "type": "QuoteMinSingle",
                    "name": "RepDataQuoteMinSingle",
                    "id": 23
                },
                {
                    "rule": "repeated",
                    "type": "NewsInfoValue",
                    "name": "RepDataNewsInfoValue",
                    "id": 24
                },
                {
                    "rule": "repeated",
                    "type": "ZhiBiaoShuChu",
                    "name": "RepDataZhiBiaoShuChu",
                    "id": 25
                },
                {
                    "rule": "repeated",
                    "type": "ZhiBiao",
                    "name": "RepDataZhiBiao",
                    "id": 26
                },
                {
                    "rule": "repeated",
                    "type": "StkData",
                    "name": "RepDataStkData",
                    "id": 27
                },
                {
                    "rule": "repeated",
                    "type": "PaiXu",
                    "name": "RepDataPaiXu",
                    "id": 28
                },
                {
                    "rule": "repeated",
                    "type": "JianPanBaoShuChu",
                    "name": "RepDataJianPanBaoShuChu",
                    "id": 29
                },
                {
                    "rule": "repeated",
                    "type": "FenJiJiJin",
                    "name": "RepDataFenJiJiJin",
                    "id": 30
                },
                {
                    "rule": "repeated",
                    "type": "MsgGetOutput",
                    "name": "RepDataMsgGetOutput",
                    "id": 31
                },
                {
                    "rule": "repeated",
                    "type": "MsgPutOutput",
                    "name": "RepDataMsgPutOutput",
                    "id": 32
                },
                {
                    "rule": "repeated",
                    "type": "BlockObjOutput",
                    "name": "RepDataBlockObjOutput",
                    "id": 33
                },
                {
                    "rule": "repeated",
                    "type": "BlockPropOutput",
                    "name": "RepDataBlockPropOutput",
                    "id": 34
                },
                {
                    "rule": "repeated",
                    "type": "SelfStockGetOutput",
                    "name": "RepDataSelfStockGetOutput",
                    "id": 35
                },
                {
                    "rule": "repeated",
                    "type": "SelfStockPutOutput",
                    "name": "RepDataSelfStockPutOutput",
                    "id": 36
                },
                {
                    "rule": "repeated",
                    "type": "AppKey",
                    "name": "RepDataAppKey",
                    "id": 37
                },
                {
                    "rule": "repeated",
                    "type": "AppInfo",
                    "name": "RepDataAppInfo",
                    "id": 38
                },
                {
                    "rule": "repeated",
                    "type": "AppValue",
                    "name": "RepDataAppValue",
                    "id": 39
                },
                {
                    "rule": "repeated",
                    "type": "ServiceAuth",
                    "name": "RepDataServiceAuth",
                    "id": 40
                },
                {
                    "rule": "repeated",
                    "type": "AppServiceAuth",
                    "name": "RepDataAppServiceAuth",
                    "id": 41
                },
                {
                    "rule": "repeated",
                    "type": "TokenAuth",
                    "name": "RepDataTokenAuth",
                    "id": 42
                },
                {
                    "rule": "repeated",
                    "type": "AccOpResponse",
                    "name": "RepDataAccOpResponse",
                    "id": 43
                },
                {
                    "rule": "repeated",
                    "type": "Token",
                    "name": "RepDataToken",
                    "id": 44
                },
                {
                    "rule": "repeated",
                    "type": "Privilege",
                    "name": "RepDataPrivilege",
                    "id": 45
                },
                {
                    "rule": "repeated",
                    "type": "AlarmEvent",
                    "name": "RepDataAlarmEvent",
                    "id": 46
                },
                {
                    "rule": "repeated",
                    "type": "AlarmTask",
                    "name": "RepDataAlarmTask",
                    "id": 47
                },
                {
                    "rule": "repeated",
                    "type": "ADPutResponse",
                    "name": "RepDataADPutResponse",
                    "id": 48
                },
                {
                    "rule": "repeated",
                    "type": "ADGetResponse",
                    "name": "RepDataADGetResponse",
                    "id": 49
                },
                {
                    "rule": "repeated",
                    "type": "UserGroup",
                    "name": "RepDataUserGroup",
                    "id": 50
                },
                {
                    "rule": "repeated",
                    "type": "UserGroupResponse",
                    "name": "RepDataUserGroupResponse",
                    "id": 51
                },
                {
                    "rule": "repeated",
                    "type": "UserPropsMessage",
                    "name": "RepDataUserPropsMessage",
                    "id": 52
                },
                {
                    "rule": "repeated",
                    "type": "TopicInvest",
                    "name": "RepDataTopicInvest",
                    "id": 53
                },
                {
                    "rule": "repeated",
                    "type": "TopicInvestHistory",
                    "name": "RepDataTopicInvestHistory",
                    "id": 54
                },
                {
                    "rule": "repeated",
                    "type": "F10GsgkOutput",
                    "name": "RepDataF10GsgkOutput",
                    "id": 55
                },
                {
                    "rule": "repeated",
                    "type": "F10CwtsZycwzbOutput",
                    "name": "RepDataF10CwtsZycwzbOutput",
                    "id": 56
                },
                {
                    "rule": "repeated",
                    "type": "F10CwtsXjllbzyOutput",
                    "name": "RepDataF10CwtsXjllbzyOutput",
                    "id": 57
                },
                {
                    "rule": "repeated",
                    "type": "F10ZxjbDjdcwzbOutput",
                    "name": "RepDataF10ZxjbDjdcwzbOutput",
                    "id": 58
                },
                {
                    "rule": "repeated",
                    "type": "F10ZxjbdjdlebOutput",
                    "name": "RepDataF10ZxjbdjdlebOutput",
                    "id": 59
                },
                {
                    "rule": "repeated",
                    "type": "F10GdjcGdhsOutput",
                    "name": "RepDataF10GdjcGdhsOutput",
                    "id": 60
                },
                {
                    "rule": "repeated",
                    "type": "F10GdjcSdgdOutput",
                    "name": "RepDataF10GdjcSdgdOutput",
                    "id": 61
                },
                {
                    "rule": "repeated",
                    "type": "F10GdjcSdltgdOutput",
                    "name": "RepDataF10GdjcSdltgdOutput",
                    "id": 62
                },
                {
                    "rule": "repeated",
                    "type": "F10GbfhFhkgOutput",
                    "name": "RepDataF10GbfhFhkgOutput",
                    "id": 63
                },
                {
                    "rule": "repeated",
                    "type": "F10GbfhGbjgOutput",
                    "name": "RepDataF10GbfhGbjgOutput",
                    "id": 64
                },
                {
                    "rule": "repeated",
                    "type": "XinWenXinXiOutput",
                    "name": "RepDataXinWenXinXiOutput",
                    "id": 65
                },
                {
                    "rule": "repeated",
                    "type": "XinWenXinXiZhongXinOutput",
                    "name": "RepDataXinWenXinXiZhongXinOutput",
                    "id": 66
                },
                {
                    "rule": "repeated",
                    "type": "TopicInvestInfo",
                    "name": "RepDataTopicInvestInfo",
                    "id": 67
                },
                {
                    "rule": "repeated",
                    "type": "YiZhiXinYeJiYuCeOutPut",
                    "name": "RepDataYiZhiXinYeJiYuCeOutPut",
                    "id": 68
                },
                {
                    "rule": "repeated",
                    "type": "YiZhiXinTouZiPinJiOutPut",
                    "name": "RepDataYiZhiXinTouZiPinJiOutPut",
                    "id": 69
                },
                {
                    "rule": "repeated",
                    "type": "GeGuYeJiYuCeOutPut",
                    "name": "RepDataGeGuYeJiYuCeOutPut",
                    "id": 70
                },
                {
                    "rule": "repeated",
                    "type": "GeGuTouZiYanBaoOutPut",
                    "name": "RepDataGeGuTouZiYanBaoOutPut",
                    "id": 71
                },
                {
                    "rule": "repeated",
                    "type": "DSToken",
                    "name": "RepDataDSToken",
                    "id": 72
                },
                {
                    "rule": "repeated",
                    "type": "TongJiApp",
                    "name": "RepDataTongJiApp",
                    "id": 73
                },
                {
                    "rule": "repeated",
                    "type": "MessageChannelSubtype",
                    "name": "RepDataMessageChannelSubtype",
                    "id": 74
                },
                {
                    "rule": "repeated",
                    "type": "UserGetPropResponse",
                    "name": "RepDataUserGetPropResponse",
                    "id": 75
                },
                {
                    "rule": "repeated",
                    "type": "QuoteBOrderSingle",
                    "name": "RepDataQuoteBOrderSingle",
                    "id": 76
                },
                {
                    "rule": "repeated",
                    "type": "DXSpirit",
                    "name": "RepDataDXSpirit",
                    "id": 77
                },
                {
                    "rule": "repeated",
                    "type": "StkPoolOuput",
                    "name": "RepDataStkPoolOuput",
                    "id": 78
                },
                {
                    "rule": "repeated",
                    "type": "EventNews",
                    "name": "RepDataEventNews",
                    "id": 79
                },
                {
                    "rule": "repeated",
                    "type": "GongGaoXinXiOutput",
                    "name": "RepDataGongGaoXinXiOutput",
                    "id": 80
                },
                {
                    "rule": "repeated",
                    "type": "GongGaoXinXiZhongXinOutput",
                    "name": "RepDataGongGaoXinXiZhongXinOutput",
                    "id": 81
                },
                {
                    "rule": "repeated",
                    "type": "F10CpbdZxzbOutput",
                    "name": "RepDataF10CpbdZxzbOutput",
                    "id": 82
                },
                {
                    "rule": "repeated",
                    "type": "F10CpbdKpqkOutput",
                    "name": "RepDataF10CpbdKpqkOutput",
                    "id": 83
                },
                {
                    "rule": "repeated",
                    "type": "F10CpbdCjhbOutput",
                    "name": "RepDataF10CpbdCjhbOutput",
                    "id": 84
                },
                {
                    "rule": "repeated",
                    "type": "F10CwtsLrfpbzyOutput",
                    "name": "RepDataF10CwtsLrfpbzyOutput",
                    "id": 85
                },
                {
                    "rule": "repeated",
                    "type": "F10CwtsZcfzbzyOutput",
                    "name": "RepDataF10CwtsZcfzbzyOutput",
                    "id": 86
                },
                {
                    "rule": "repeated",
                    "type": "F10ZygcOutput",
                    "name": "RepDataF10ZygcOutput",
                    "id": 87
                },
                {
                    "rule": "repeated",
                    "type": "F10DstxJjltOutput",
                    "name": "RepDataF10DstxJjltOutput",
                    "id": 88
                },
                {
                    "rule": "repeated",
                    "type": "F10DstxRzrqOutput",
                    "name": "RepDataF10DstxRzrqOutput",
                    "id": 89
                },
                {
                    "rule": "repeated",
                    "type": "F10DstxJgccOutput",
                    "name": "RepDataF10DstxJgccOutput",
                    "id": 90
                },
                {
                    "rule": "repeated",
                    "type": "F10DstxGdzjcOutput",
                    "name": "RepDataF10DstxGdzjcOutput",
                    "id": 91
                },
                {
                    "rule": "repeated",
                    "type": "F10DstxDzjyOutput",
                    "name": "RepDataF10DstxDzjyOutput",
                    "id": 92
                },
                {
                    "rule": "repeated",
                    "type": "F10DstxCgbdqkOutput",
                    "name": "RepDataF10DstxCgbdqkOutput",
                    "id": 93
                },
                {
                    "rule": "repeated",
                    "type": "F10GlcOutPut",
                    "name": "RepDataF10GlcOutPut",
                    "id": 94
                },
                {
                    "rule": "repeated",
                    "type": "F10GlcNdbcqkOutPut",
                    "name": "RepDataF10GlcNdbcqkOutPut",
                    "id": 95
                },
                {
                    "rule": "repeated",
                    "type": "F10ZxjbDjdxjllbOutPut",
                    "name": "RepDataF10ZxjbDjdxjllbOutPut",
                    "id": 96
                },
                {
                    "rule": "repeated",
                    "type": "F10GdjcKggdOutPut",
                    "name": "RepDataF10GdjcKggdOutPut",
                    "id": 97
                },
                {
                    "rule": "repeated",
                    "type": "F10GdjcSjkzrOutPut",
                    "name": "RepDataF10GdjcSjkzrOutPut",
                    "id": 98
                },
                {
                    "rule": "repeated",
                    "type": "F10GbfhGbbdOutPut",
                    "name": "RepDataF10GbfhGbbdOutPut",
                    "id": 99
                },
                {
                    "rule": "repeated",
                    "type": "F10ZbyzCyqtsszqOutPut",
                    "name": "RepDataF10ZbyzCyqtsszqOutPut",
                    "id": 100
                },
                {
                    "rule": "repeated",
                    "type": "F10ZbyzCyfssgqOutPut",
                    "name": "RepDataF10ZbyzCyfssgqOutPut",
                    "id": 101
                },
                {
                    "rule": "repeated",
                    "type": "F10zbyzRzqkzfyssOutPut",
                    "name": "RepDataF10zbyzRzqkzfyssOutPut",
                    "id": 102
                },
                {
                    "rule": "repeated",
                    "type": "F10ZbyzXmtzMjzjqkOutPut",
                    "name": "RepDataF10ZbyzXmtzMjzjqkOutPut",
                    "id": 103
                },
                {
                    "rule": "repeated",
                    "type": "F10ZbyzXmtzMjzjcnxmOutPut",
                    "name": "RepDataF10ZbyzXmtzMjzjcnxmOutPut",
                    "id": 104
                },
                {
                    "rule": "repeated",
                    "type": "F10ZbyzXmtzMjzjbgxmOutPut",
                    "name": "RepDataF10ZbyzXmtzMjzjbgxmOutPut",
                    "id": 105
                },
                {
                    "rule": "repeated",
                    "type": "F10ZbyzXmtzFmjzjxmOutPut",
                    "name": "RepDataF10ZbyzXmtzFmjzjxmOutPut",
                    "id": 106
                },
                {
                    "rule": "repeated",
                    "type": "F10HydwOutPut",
                    "name": "RepDataF10HydwOutPut",
                    "id": 107
                },
                {
                    "rule": "repeated",
                    "type": "F10RsrProForecastOutPut",
                    "name": "RepDataF10RsrProForecastOutPut",
                    "id": 108
                },
                {
                    "rule": "repeated",
                    "type": "F10RsrInvestRatingOutPut",
                    "name": "RepDataF10RsrInvestRatingOutPut",
                    "id": 109
                },
                {
                    "rule": "repeated",
                    "type": "F10RsrEarnPSForeOutPut",
                    "name": "RepDataF10RsrEarnPSForeOutPut",
                    "id": 110
                },
                {
                    "rule": "repeated",
                    "type": "F10RsrResReportOutPut",
                    "name": "RepDataF10RsrResReportOutPut",
                    "id": 111
                },
                {
                    "rule": "repeated",
                    "type": "ServiceAuthConsts",
                    "name": "RepDataServiceAuthConsts",
                    "id": 112
                },
                {
                    "rule": "repeated",
                    "type": "DXSpiritStat",
                    "name": "RepDataDXSpiritStat",
                    "id": 113
                },
                {
                    "rule": "repeated",
                    "type": "FluxValue",
                    "name": "RepDataFluxValue",
                    "id": 114
                },
                {
                    "rule": "repeated",
                    "type": "PaiMing",
                    "name": "RepDataPaiMing",
                    "id": 115
                },
                {
                    "rule": "repeated",
                    "type": "JunXianPaiBu",
                    "name": "RepDataJunXianPaiBu",
                    "id": 116
                },
                {
                    "rule": "repeated",
                    "type": "StockFutureEvent",
                    "name": "RepDataStockFutureEvent",
                    "id": 117
                },
                {
                    "rule": "repeated",
                    "type": "Score",
                    "name": "RepDataScore",
                    "id": 118
                },
                {
                    "rule": "repeated",
                    "type": "LongHuBang",
                    "name": "RepDataLongHuBang",
                    "id": 119
                },
                {
                    "rule": "repeated",
                    "type": "LongHuBangTongJi",
                    "name": "RepDataLongHuBangTongJi",
                    "id": 120
                },
                {
                    "rule": "repeated",
                    "type": "OverallInfo",
                    "name": "RepDataOverallInfo",
                    "id": 121
                },
                {
                    "rule": "repeated",
                    "type": "TodayListStocks",
                    "name": "RepDataTodayListStocks",
                    "id": 122
                },
                {
                    "rule": "repeated",
                    "type": "TodayBrokerStocks",
                    "name": "RepDataTodayBrokerStocks",
                    "id": 123
                },
                {
                    "rule": "repeated",
                    "type": "TodayConvertStocks",
                    "name": "RepDataTodayConvertStocks",
                    "id": 124
                },
                {
                    "rule": "repeated",
                    "type": "TodayIssueStocks",
                    "name": "RepDataTodayIssueStocks",
                    "id": 125
                },
                {
                    "rule": "repeated",
                    "type": "BrokerDetaileInfo",
                    "name": "RepDataBrokerDetaileInfo",
                    "id": 126
                },
                {
                    "rule": "repeated",
                    "type": "StockBrokerInfo",
                    "name": "RepDataStockBrokerInfo",
                    "id": 127
                },
                {
                    "rule": "repeated",
                    "type": "IssueDetaileInfo",
                    "name": "RepDataIssueDetaileInfo",
                    "id": 128
                },
                {
                    "rule": "repeated",
                    "type": "IssueStatInfo",
                    "name": "RepDataIssueStatInfo",
                    "id": 129
                },
                {
                    "rule": "repeated",
                    "type": "TopicPage",
                    "name": "RepDataTopicPage",
                    "id": 130
                },
                {
                    "rule": "repeated",
                    "type": "LHBTongJiReMenGeGu",
                    "name": "RepDataLHBTongJiReMenGeGu",
                    "id": 131
                },
                {
                    "rule": "repeated",
                    "type": "LHBTongJiReMenYingYeBu",
                    "name": "RepDataLHBTongJiReMenYingYeBu",
                    "id": 132
                },
                {
                    "rule": "repeated",
                    "type": "LHBLiShiShuJu",
                    "name": "RepDataLHBLiShiShuJu",
                    "id": 133
                },
                {
                    "rule": "repeated",
                    "type": "LHBTongJiLiShiShuJu",
                    "name": "RepDataLHBTongJiLiShiShuJu",
                    "id": 134
                },
                {
                    "rule": "repeated",
                    "type": "LHBLongHuBangLiShi",
                    "name": "RepDataLHBLongHuBangLiShi",
                    "id": 135
                },
                {
                    "rule": "repeated",
                    "type": "LHBLongHuBangGuanZhu",
                    "name": "RepDataLHBLongHuBangGuanZhu",
                    "id": 136
                },
                {
                    "rule": "repeated",
                    "type": "BrokerList",
                    "name": "RepDataBrokerList",
                    "id": 137
                },
                {
                    "rule": "repeated",
                    "type": "FinanceQuickReport",
                    "name": "RepDataFinanceQuickReport",
                    "id": 138
                },
                {
                    "rule": "repeated",
                    "type": "LHBTongJiGuanZhu",
                    "name": "RepDataLHBTongJiGuanZhu",
                    "id": 139
                },
                {
                    "rule": "repeated",
                    "type": "PcYeJiYuCeShuJu",
                    "name": "RepDataPcYeJiYuCeShuJu",
                    "id": 140
                },
                {
                    "rule": "repeated",
                    "type": "LHBTongJiGuanZhuFanHui",
                    "name": "RepDataLHBTongJiGuanZhuFanHui",
                    "id": 141
                },
                {
                    "rule": "repeated",
                    "type": "LHBTongJiReMenGeGuFanHui",
                    "name": "RepDataLHBTongJiReMenGeGuFanHui",
                    "id": 142
                },
                {
                    "rule": "repeated",
                    "type": "LHBTongJiReMenYingYeBuFanHui",
                    "name": "RepDataLHBTongJiReMenYingYeBuFanHui",
                    "id": 143
                },
                {
                    "rule": "repeated",
                    "type": "LHBLiShiShuJuFanHui",
                    "name": "RepDataLHBLiShiShuJuFanHui",
                    "id": 144
                },
                {
                    "rule": "repeated",
                    "type": "LHBTongJiLiShiShuJuFanHui",
                    "name": "RepDataLHBTongJiLiShiShuJuFanHui",
                    "id": 145
                },
                {
                    "rule": "repeated",
                    "type": "LHBLongHuBangLiShiFanHui",
                    "name": "RepDataLHBLongHuBangLiShiFanHui",
                    "id": 146
                },
                {
                    "rule": "repeated",
                    "type": "NewsDataItem",
                    "name": "RepDataNewsDataItem",
                    "id": 147
                },
                {
                    "rule": "repeated",
                    "type": "StockNews",
                    "name": "RepDataStockNews",
                    "id": 148
                },
                {
                    "rule": "repeated",
                    "type": "AnnouncemtDataItem",
                    "name": "RepDataAnnouncemtDataItem",
                    "id": 149
                },
                {
                    "rule": "repeated",
                    "type": "StockAnnouncemt",
                    "name": "RepDataStockAnnouncemt",
                    "id": 150
                }
            ]
        },
        {
            "name": "UAResponse",
            "fields": [
                {
                    "rule": "required",
                    "type": "string",
                    "name": "Qid",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "Err",
                    "id": 2
                },
                {
                    "rule": "required",
                    "type": "uint32",
                    "name": "Counter",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "bytes",
                    "name": "Data",
                    "id": 4
                }
            ]
        },
        {
            "name": "ChildResponse",
            "fields": [
                {
                    "rule": "required",
                    "type": "int32",
                    "name": "No",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "bytes",
                    "name": "Data",
                    "id": 2
                }
            ]
        },
        {
            "name": "GroupResponse",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "ChildResponse",
                    "name": "ChildRes",
                    "id": 1
                }
            ]
        }
    ],
    "enums": [
        {
            "name": "InfoType",
            "values": [
                {
                    "name": "Type_Unknow",
                    "id": 0
                },
                {
                    "name": "Type_Int",
                    "id": 105
                },
                {
                    "name": "Type_SInt",
                    "id": 120
                },
                {
                    "name": "Type_Float",
                    "id": 102
                },
                {
                    "name": "Type_Double",
                    "id": 100
                },
                {
                    "name": "Type_String",
                    "id": 115
                },
                {
                    "name": "Type_Binary",
                    "id": 98
                },
                {
                    "name": "Type_Table",
                    "id": 116
                },
                {
                    "name": "Type_Array",
                    "id": 128
                },
                {
                    "name": "Type_ArrayInt",
                    "id": 233
                },
                {
                    "name": "Type_ArraySInt",
                    "id": 248
                },
                {
                    "name": "Type_ArrayFloat",
                    "id": 230
                },
                {
                    "name": "Type_ArrayDouble",
                    "id": 228
                },
                {
                    "name": "Type_ArrayString",
                    "id": 243
                }
            ]
        },
        {
            "name": "JPBLeiXing",
            "values": [
                {
                    "name": "TYPE_OBJ",
                    "id": 0
                },
                {
                    "name": "TYPE_INDI",
                    "id": 1
                },
                {
                    "name": "TYPE_TOPIC",
                    "id": 2
                },
                {
                    "name": "TYPE_LHB",
                    "id": 3
                },
                {
                    "name": "TYPE_BLKOBJ",
                    "id": 4
                },
                {
                    "name": "TYPE_TOPICANALY",
                    "id": 5
                }
            ]
        },
        {
            "name": "FJJJ_TYPE",
            "values": [
                {
                    "name": "FJJJ_TYPE_A",
                    "id": 1
                },
                {
                    "name": "FJJJ_TYPE_B",
                    "id": 2
                }
            ]
        },
        {
            "name": "EnumID",
            "values": [
                {
                    "name": "IDId",
                    "id": 1
                },
                {
                    "name": "IDObj",
                    "id": 2
                },
                {
                    "name": "IDTbl",
                    "id": 3
                },
                {
                    "name": "IDJsonTbl",
                    "id": 4
                },
                {
                    "name": "IDQuoteDynaSingle",
                    "id": 20
                },
                {
                    "name": "IDQuoteKlineSingle",
                    "id": 21
                },
                {
                    "name": "IDQuoteTickSingle",
                    "id": 22
                },
                {
                    "name": "IDQuoteMinSingle",
                    "id": 23
                },
                {
                    "name": "IDNewsInfoValue",
                    "id": 24
                },
                {
                    "name": "IDZhiBiaoShuChu",
                    "id": 25
                },
                {
                    "name": "IDZhiBiao",
                    "id": 26
                },
                {
                    "name": "IDStkData",
                    "id": 27
                },
                {
                    "name": "IDPaiXu",
                    "id": 28
                },
                {
                    "name": "IDJianPanBaoShuChu",
                    "id": 29
                },
                {
                    "name": "IDFenJiJiJin",
                    "id": 30
                },
                {
                    "name": "IDMsgGetOutput",
                    "id": 31
                },
                {
                    "name": "IDMsgPutOutput",
                    "id": 32
                },
                {
                    "name": "IDBlockObjOutput",
                    "id": 33
                },
                {
                    "name": "IDBlockPropOutput",
                    "id": 34
                },
                {
                    "name": "IDSelfStockGetOutput",
                    "id": 35
                },
                {
                    "name": "IDSelfStockPutOutput",
                    "id": 36
                },
                {
                    "name": "IDAppKey",
                    "id": 37
                },
                {
                    "name": "IDAppInfo",
                    "id": 38
                },
                {
                    "name": "IDAppValue",
                    "id": 39
                },
                {
                    "name": "IDServiceAuth",
                    "id": 40
                },
                {
                    "name": "IDAppServiceAuth",
                    "id": 41
                },
                {
                    "name": "IDTokenAuth",
                    "id": 42
                },
                {
                    "name": "IDAccOpResponse",
                    "id": 43
                },
                {
                    "name": "IDToken",
                    "id": 44
                },
                {
                    "name": "IDPrivilege",
                    "id": 45
                },
                {
                    "name": "IDAlarmEvent",
                    "id": 46
                },
                {
                    "name": "IDAlarmTask",
                    "id": 47
                },
                {
                    "name": "IDADPutResponse",
                    "id": 48
                },
                {
                    "name": "IDADGetResponse",
                    "id": 49
                },
                {
                    "name": "IDUserGroup",
                    "id": 50
                },
                {
                    "name": "IDUserGroupResponse",
                    "id": 51
                },
                {
                    "name": "IDUserPropsMessage",
                    "id": 52
                },
                {
                    "name": "IDTopicInvest",
                    "id": 53
                },
                {
                    "name": "IDTopicInvestHistory",
                    "id": 54
                },
                {
                    "name": "IDF10GsgkOutput",
                    "id": 55
                },
                {
                    "name": "IDF10CwtsZycwzbOutput",
                    "id": 56
                },
                {
                    "name": "IDF10CwtsXjllbzyOutput",
                    "id": 57
                },
                {
                    "name": "IDF10ZxjbDjdcwzbOutput",
                    "id": 58
                },
                {
                    "name": "IDF10ZxjbdjdlebOutput",
                    "id": 59
                },
                {
                    "name": "IDF10GdjcGdhsOutput",
                    "id": 60
                },
                {
                    "name": "IDF10GdjcSdgdOutput",
                    "id": 61
                },
                {
                    "name": "IDF10GdjcSdltgdOutput",
                    "id": 62
                },
                {
                    "name": "IDF10GbfhFhkgOutput",
                    "id": 63
                },
                {
                    "name": "IDF10GbfhGbjgOutput",
                    "id": 64
                },
                {
                    "name": "IDXinWenXinXiOutput",
                    "id": 65
                },
                {
                    "name": "IDXinWenXinXiZhongXinOutput",
                    "id": 66
                },
                {
                    "name": "IDTopicInvestInfo",
                    "id": 67
                },
                {
                    "name": "IDYiZhiXinYeJiYuCeOutPut",
                    "id": 68
                },
                {
                    "name": "IDYiZhiXinTouZiPinJiOutPut",
                    "id": 69
                },
                {
                    "name": "IDGeGuYeJiYuCeOutPut",
                    "id": 70
                },
                {
                    "name": "IDGeGuTouZiYanBaoOutPut",
                    "id": 71
                },
                {
                    "name": "IDDSToken",
                    "id": 72
                },
                {
                    "name": "IDTongJiApp",
                    "id": 73
                },
                {
                    "name": "IDMessageChannelSubtype",
                    "id": 74
                },
                {
                    "name": "IDUserGetPropResponse",
                    "id": 75
                },
                {
                    "name": "IDQuoteBOrderSingle",
                    "id": 76
                },
                {
                    "name": "IDDXSpirit",
                    "id": 77
                },
                {
                    "name": "IDStkPoolOuput",
                    "id": 78
                },
                {
                    "name": "IDEventNews",
                    "id": 79
                },
                {
                    "name": "IDGongGaoXinXiOutput",
                    "id": 80
                },
                {
                    "name": "IDGongGaoXinXiZhongXinOutput",
                    "id": 81
                },
                {
                    "name": "IDF10CpbdZxzbOutput",
                    "id": 82
                },
                {
                    "name": "IDF10CpbdKpqkOutput",
                    "id": 83
                },
                {
                    "name": "IDF10CpbdCjhbOutput",
                    "id": 84
                },
                {
                    "name": "IDF10CwtsLrfpbzyOutput",
                    "id": 85
                },
                {
                    "name": "IDF10CwtsZcfzbzyOutput",
                    "id": 86
                },
                {
                    "name": "IDF10ZygcOutput",
                    "id": 87
                },
                {
                    "name": "IDF10DstxJjltOutput",
                    "id": 88
                },
                {
                    "name": "IDF10DstxRzrqOutput",
                    "id": 89
                },
                {
                    "name": "IDF10DstxJgccOutput",
                    "id": 90
                },
                {
                    "name": "IDF10DstxGdzjcOutput",
                    "id": 91
                },
                {
                    "name": "IDF10DstxDzjyOutput",
                    "id": 92
                },
                {
                    "name": "IDF10DstxCgbdqkOutput",
                    "id": 93
                },
                {
                    "name": "IDF10GlcOutPut",
                    "id": 94
                },
                {
                    "name": "IDF10GlcNdbcqkOutPut",
                    "id": 95
                },
                {
                    "name": "IDF10ZxjbDjdxjllbOutPut",
                    "id": 96
                },
                {
                    "name": "IDF10GdjcKggdOutPut",
                    "id": 97
                },
                {
                    "name": "IDF10GdjcSjkzrOutPut",
                    "id": 98
                },
                {
                    "name": "IDF10GbfhGbbdOutPut",
                    "id": 99
                },
                {
                    "name": "IDF10ZbyzCyqtsszqOutPut",
                    "id": 100
                },
                {
                    "name": "IDF10ZbyzCyfssgqOutPut",
                    "id": 101
                },
                {
                    "name": "IDF10zbyzRzqkzfyssOutPut",
                    "id": 102
                },
                {
                    "name": "IDF10ZbyzXmtzMjzjqkOutPut",
                    "id": 103
                },
                {
                    "name": "IDF10ZbyzXmtzMjzjcnxmOutPut",
                    "id": 104
                },
                {
                    "name": "IDF10ZbyzXmtzMjzjbgxmOutPut",
                    "id": 105
                },
                {
                    "name": "IDF10ZbyzXmtzFmjzjxmOutPut",
                    "id": 106
                },
                {
                    "name": "IDF10HydwOutPut",
                    "id": 107
                },
                {
                    "name": "IDF10RsrProForecastOutPut",
                    "id": 108
                },
                {
                    "name": "IDF10RsrInvestRatingOutPut",
                    "id": 109
                },
                {
                    "name": "IDF10RsrEarnPSForeOutPut",
                    "id": 110
                },
                {
                    "name": "IDF10RsrResReportOutPut",
                    "id": 111
                },
                {
                    "name": "IDServiceAuthConsts",
                    "id": 112
                },
                {
                    "name": "IDDXSpiritStat",
                    "id": 113
                },
                {
                    "name": "IDFluxValue",
                    "id": 114
                },
                {
                    "name": "IDPaiMing",
                    "id": 115
                },
                {
                    "name": "IDJunXianPaiBu",
                    "id": 116
                },
                {
                    "name": "IDStockFutureEvent",
                    "id": 117
                },
                {
                    "name": "IDScore",
                    "id": 118
                },
                {
                    "name": "IDLongHuBang",
                    "id": 119
                },
                {
                    "name": "IDLongHuBangTongJi",
                    "id": 120
                },
                {
                    "name": "IDOverallInfo",
                    "id": 121
                },
                {
                    "name": "IDTodayListStocks",
                    "id": 122
                },
                {
                    "name": "IDTodayBrokerStocks",
                    "id": 123
                },
                {
                    "name": "IDTodayConvertStocks",
                    "id": 124
                },
                {
                    "name": "IDTodayIssueStocks",
                    "id": 125
                },
                {
                    "name": "IDBrokerDetaileInfo",
                    "id": 126
                },
                {
                    "name": "IDStockBrokerInfo",
                    "id": 127
                },
                {
                    "name": "IDIssueDetaileInfo",
                    "id": 128
                },
                {
                    "name": "IDIssueStatInfo",
                    "id": 129
                },
                {
                    "name": "IDTopicPage",
                    "id": 130
                },
                {
                    "name": "IDLHBTongJiReMenGeGu",
                    "id": 131
                },
                {
                    "name": "IDLHBTongJiReMenYingYeBu",
                    "id": 132
                },
                {
                    "name": "IDLHBLiShiShuJu",
                    "id": 133
                },
                {
                    "name": "IDLHBTongJiLiShiShuJu",
                    "id": 134
                },
                {
                    "name": "IDLHBLongHuBangLiShi",
                    "id": 135
                },
                {
                    "name": "IDLHBLongHuBangGuanZhu",
                    "id": 136
                },
                {
                    "name": "IDBrokerList",
                    "id": 137
                },
                {
                    "name": "IDFinanceQuickReport",
                    "id": 138
                },
                {
                    "name": "IDLHBTongJiGuanZhu",
                    "id": 139
                },
                {
                    "name": "IDPcYeJiYuCeShuJu",
                    "id": 140
                },
                {
                    "name": "IDLHBTongJiGuanZhuFanHui",
                    "id": 141
                },
                {
                    "name": "IDLHBTongJiReMenGeGuFanHui",
                    "id": 142
                },
                {
                    "name": "IDLHBTongJiReMenYingYeBuFanHui",
                    "id": 143
                },
                {
                    "name": "IDLHBLiShiShuJuFanHui",
                    "id": 144
                },
                {
                    "name": "IDLHBTongJiLiShiShuJuFanHui",
                    "id": 145
                },
                {
                    "name": "IDLHBLongHuBangLiShiFanHui",
                    "id": 146
                },
                {
                    "name": "IDNewsDataItem",
                    "id": 147
                },
                {
                    "name": "IDStockNews",
                    "id": 148
                },
                {
                    "name": "IDAnnouncemtDataItem",
                    "id": 149
                },
                {
                    "name": "IDStockAnnouncemt",
                    "id": 150
                }
            ]
        }
    ]
}).build(["dzhyun"]);
},{"./protobuf":13}],10:[function(require,module,exports){
/**
 * jsonTable的格式化转换模块
 * Created by jiagang on 2015/11/19.
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var convertToJsonArray = function convertToJsonArray(input) {
  if (!input || !input.head) return input;

  var head = input.head,
      data = input.data;

  return data.map(function (row) {
    var rowObject = {};
    row.forEach(function (cell, columnIndex) {
      rowObject[head[columnIndex]] = convertToJsonArray(cell);
    });
    return rowObject;
  });
};
exports["default"] = { convertToJsonArray: convertToJsonArray };
module.exports = exports["default"];
},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _dzhyun = require('./dzhyun');

var _dzhyun2 = _interopRequireDefault(_dzhyun);

var _protobuf = require('./protobuf');

var _protobuf2 = _interopRequireDefault(_protobuf);

var ByteBuffer = _protobuf2['default'].ByteBuffer;

exports['default'] = {

  stringToArrayBuffer: function stringToArrayBuffer(str) {
    var strLen = str.length;
    var buf = new ArrayBuffer(strLen * 2); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  },

  arrayBufferToString: function arrayBufferToString(arrayBuffer) {
    var uint8Array = new Uint8Array(arrayBuffer);
    var length = uint8Array.length;
    if (length > 65535) {
      var start = 0,
          results = [];
      do {
        var subArray = uint8Array.subarray(start, start += 65535);
        results.push(String.fromCharCode.apply(null, subArray));
      } while (start < length);

      return decodeURIComponent(escape(results.join('')));
    } else {
      return decodeURIComponent(escape(String.fromCharCode.apply(null, uint8Array)));
    }
  },

  parseProtoBuf: function parseProtoBuf(pbData, message) {

    var result = _dzhyun2['default'][message].decode(pbData);

    if (result) {
      result._isPb = true;
    }
    return result;
  },

  isBuffer: function isBuffer(data) {
    // 判断数据是node中的Buffer类型，避免使用instanceof
    return data.constructor && data.constructor.name === 'Buffer';
  },

  parse: function parse(data, message) {

    var result = data;

    if (!data) {
      return data;
    } else if (typeof data === 'string') {

      // 先尝试用json格式转换
      try {
        result = JSON.parse(data);
      } catch (err) {

        // 转换失败则认为是二进制数据，将其转为ArrayBuffer后按照pb格式解析
        result = this.parseProtoBuf(this.stringToArrayBuffer(data), message);
      }
    } else if (data instanceof ArrayBuffer) {

      // 先尝试用pb格式转换
      try {
        result = this.parseProtoBuf(data, message);
      } catch (err) {

        // 转换失败则认为是以ws的二进制通道传输的json格式数据，先转为字符串再用json格式解析
        result = JSON.parse(this.arrayBufferToString(data));
      }
    } else if (this.isBuffer(data)) {

      // 先尝试用pb格式转换
      try {
        result = this.parseProtoBuf(data, message);
      } catch (err) {

        // 转换失败则认为是以ws的二进制通道传输的json格式数据，先转为字符串再用json格式解析
        result = JSON.parse(data.toString('utf8'));
      }
    } else if (data instanceof ByteBuffer) {
      result = this.parseProtoBuf(data, message);
    }
    return result;
  }
};
module.exports = exports['default'];
},{"./dzhyun":9,"./protobuf":13}],12:[function(require,module,exports){
/**
 * pb table格式数据转换模块
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _dzhyun = require('./dzhyun');

var _dzhyun2 = _interopRequireDefault(_dzhyun);

var _protobuf = require('./protobuf');

var _protobuf2 = _interopRequireDefault(_protobuf);

var ByteBuffer = _protobuf2['default'].ByteBuffer;

/** 列类型枚举 */
var InfoType = _dzhyun2['default'].InfoType || {
  Type_Int: 105,
  Type_Float: 102,
  Type_Double: 100,
  Type_String: 115,
  Type_Binary: 98,
  Type_Table: 116,
  Type_SInt: 120,
  Type_Unknow: 0
};

/** PbTable类型 */
var PbTable = _dzhyun2['default'].Table;

/** 各种列类型对应数据字段前缀 */
var cDataFieldPrefix = {};
cDataFieldPrefix[InfoType.Type_Int] = 'i';
cDataFieldPrefix[InfoType.Type_Float] = 'f';
cDataFieldPrefix[InfoType.Type_Double] = 'd';
cDataFieldPrefix[InfoType.Type_String] = 's';
cDataFieldPrefix[InfoType.Type_Binary] = 'b';
cDataFieldPrefix[InfoType.Type_Table] = 't';
cDataFieldPrefix[InfoType.Type_SInt] = 'x';

//var keys = Object.keys(InfoType);
//keys.forEach(function(key){
//    cDataFieldPrefix[key] = String.fromCharCode(InfoType[key]);
//});

/** table信息缓存，多次推送数据时只有第一次会有table信息，所以需要做缓存 */
var tableInfoCache = {};

/**
 * pbTable数据转换器类型
 * @param {?{filter: {function}}} options 可以设置一个filter函数对所有解析的数据都会调用该方法，返回true保留数据，false丢弃数据，返回其它类型数据则将其替换
 * @constructor
 */
var PbTableConverter = function PbTableConverter(options) {
  this.options = options || {};
  this._tableInfoStack = [];
};

PbTableConverter.prototype = {

  /**
   * 解码二进制pbTable数据转换为pbTable定义格式的Message对象
   * @param {!ArrayBuffer|ByteBuffer|Object} pbTable 待转换的二进制pbTable数据
   * @return {Object} 转换后pbTable格式的Message对象
   * @throws {Error}
   * @private
   */
  _pbTableDecode: function _pbTableDecode(pbTable) {

    // ArrayBuffer类型数据使用pbTable定义格式解码为PbTable格式的Message对象
    if (pbTable instanceof ArrayBuffer || pbTable instanceof ByteBuffer) {
      return PbTable.decode(pbTable);
    }

    // 其它类型数据不处理
    return pbTable;
  },

  /**
   * 根据列的类型取得具体列数据中对应字段的数据值
   * @param {Object} columnData
   * @param {number} columnType
   * @private
   */
  _getColumnDataValues: function _getColumnDataValues(columnData, columnType) {

    // 非未知类型直接取类型的字段值
    if (columnType !== InfoType.Type_Unknow) {
      var fieldName = cDataFieldPrefix[columnType] + 'Values';
      return columnData[fieldName];
    }

    // 对于未知类型则按顺序找到第一个不为空的数据字段值
    else {
        return columnData.iValues || columnData.fValues || columnData.dValues || columnData.sValues || columnData.bValues || columnData.tValues || columnData.xValues;
      }
  },

  /**
   * 恢复数据值
   * @param {*} value
   * @param {number} columnType
   * @param {number} columnRatio
   * @param {number} rowIndex
   * @returns {*}
   * @private
   */
  _retrieveValue: function _retrieveValue(value, columnType, columnRatio, rowIndex) {

    // 对于Table类型数据递归转换
    if (columnType == InfoType.Type_Table) {
      value = this.convert(value, rowIndex === 0);
    }

    // 对于整型数据，根据radio将数据还原（第一行数据跳过，不处理）
    if (rowIndex !== 0 && (columnType == InfoType.Type_Int || columnType == InfoType.Type_SInt) && !!columnRatio) {
      value = value * columnRatio;
    }

    return value;
  },

  /**
   * 转换列数据
   * @param {Object} columnData 指定的一列的数据 CData|CDataX
   * @param {?Object} columnInfo 对应的该列的列信息 CInfo
   * @param {!Array.<Object>} resultArray 存放转换后数据的数组
   * @throws {Error}
   * @private
   */
  _convertColumn: function _convertColumn(columnData, columnInfo, resultArray) {
    var index = columnData.Index;

    // 类信息为null时，默认设置为空对象
    columnInfo = columnInfo || {};

    // 列信息中名称不存在时，列名使用列下标
    var columnName = columnInfo.Name || index;

    // 列信息中类型不存在时，列类型取未知
    var columnType = columnInfo.Type || InfoType.Type_Unknow;

    var columnRatio = columnInfo.Ratio;

    var values = this._getColumnDataValues(columnData, columnType);

    // 如果对应列数据为空则抛出错误
    if (values == null) {
      throw new Error('column[' + index + '] data is null');
    }

    this._columnToRow(values, index, columnName, columnType, columnRatio, resultArray);
  },

  /**
   * 列数据转为行数据
   * @param columnValues
   * @param columnIndex
   * @param columnName
   * @param columnType
   * @param columnRatio
   * @param resultArray
   * @private
   */
  _columnToRow: function _columnToRow(columnValues, columnIndex, columnName, columnType, columnRatio, resultArray) {

    // 上一个数据值，用作差分类型计算，dq记录数据差分
    var differObject = {
      previousValue: 0,
      dq: undefined
    };
    columnValues.forEach((function (value, rowIndex) {

      // 对应结果行数据不存在则创建
      var row = resultArray[rowIndex];
      if (row === undefined) {
        row = {};
        resultArray.push(row);
      }

      // 恢复数据值
      // FIXME 不需要每次判断类型
      value = this._retrieveValue(value, columnType, columnRatio, rowIndex);

      // 经options.filter处理，差分处理放到filter yloat转换时处理
      if (typeof this.options.filter === 'function') {
        var filterValue = this.options.filter(value, columnType == InfoType.Type_SInt ? differObject : void 0);
        if (filterValue === false) {
          // 返回false的数据将被忽略
        } else if (filterValue === true || filterValue === undefined) {
            // 返回true或者不返回则直接使用该数据
            row[columnName] = value;
          } else {
            // 返回其它类型则使用过滤转换后的数据
            value = row[columnName] = filterValue;
          }
      } else {
        row[columnName] = value;
      }
    }).bind(this));

    // 一列转换完成后将tableInfoStack中最后一个数据移除堆栈
    this._tableInfoStack.pop();
  },

  /**
   * 将传入的pbTable格式数据转换成标准json对象数组
   * @param {!ArrayBuffer|ByteBuffer|Object} pbTable 待转换的pbTable格式数据
   * @param {?boolean} isFirstRow 转换的pbTable数据是否是嵌套table转换数据的第一行
   *        第一行则要记录tableInfo，非第一行则不记录，避免堆栈数据重复
   * @throws {Error}
   * @return {Array.<Object>} 转换后的标准json对象数组
   */
  convert: function convert(pbTable, isFirstRow) {

    var pbTableMessage = this._pbTableDecode(pbTable);

    // 得到table列信息
    var tableInfoId = pbTableMessage.Tiid;
    var tableInfo = pbTableMessage.Info;

    // table信息不存在则从堆栈或者全局缓存中查找对应table信息
    if (!tableInfo) {
      var length = this._tableInfoStack.length;
      tableInfo = isFirstRow === false && length > 0 ? this._tableInfoStack[length] : tableInfoCache[tableInfoId];
    } else {

      // 第一行的tableInfo信息放入堆栈
      isFirstRow === true ? this._tableInfoStack.push(tableInfo) : null;
      tableInfoCache[tableInfoId] = tableInfo;
    }

    // 定义出最后的转换结果数组
    var jsonArray = [];

    // 转换table数据
    var tableData = pbTableMessage.Data || pbTableMessage.DataX;
    if (tableData) {
      tableData.forEach((function (columnData) {
        var columnIndex = columnData.Index;

        // 从table信息中得到该列对应的column信息，column信息可能不存在
        var columnInfo = tableInfo ? tableInfo[columnIndex] : null;
        this._convertColumn(columnData, columnInfo, jsonArray);
      }).bind(this));
    } else {
      throw new Error('table data undefined');
    }

    return jsonArray;
  }
};

exports['default'] = {

  /**
   * 将传入的pbTable格式数据转换成标准json对象数组
   * @param {!ArrayBuffer|ByteBuffer|Object} pbTable 待转换的pbTable格式数据
   * @param {Object=} options 选项
   * @throws {Error}
   * @return {Array.<Object>} 转换后的标准json对象数组
   */
  convertToJsonArray: function convertToJsonArray(pbTable, options) {
    return new PbTableConverter(options).convert(pbTable);
  },

  /**
   * 将传入的pbTable格式数据转换成行列结构的二维数组
   * @param {!ArrayBuffer|ByteBuffer|Object} pbTable 待转换的pbTable格式数据
   * @param {Object=} options 选项
   * @throws {Error}
   * @return {Array.<Array.<*>>} 转换后的标准json对象数组
   */
  convertToJsonTable: function convertToJsonTable(pbTable, options) {
    var converter = new PbTableConverter(options);
    converter._columnToRow = function (columnValues, columnIndex, columnName, columnType, columnRatio, resultArray) {

      // 上一个数据值，用作差分类型计算
      var previousValue = 0;
      columnValues.forEach((function (value, rowIndex) {

        // 对应结果行数据不存在则创建
        var row = resultArray[rowIndex];
        if (row === undefined) {
          row = [];
          resultArray.push(row);
        }
        previousValue = this._retrieveValue(value, previousValue, columnType, columnRatio);
        row.push(previousValue);
      }).bind(this));
    };
    return converter.convert(pbTable);
  }
};
module.exports = exports['default'];
},{"./dzhyun":9,"./protobuf":13}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ProtoBuf;
try {
  ProtoBuf = require('protobufjs');
} catch (err) {
  ProtoBuf = typeof dcodeIO !== 'undefined' && dcodeIO.ProtoBuf;
}

if (!ProtoBuf) {

  ProtoBuf = {};

  // 简单模拟ProtoBuf中ByteBuffer和Long
  ProtoBuf.Long = function Long() {
    _classCallCheck(this, Long);
  };

  ProtoBuf.ByteBuffer = function ByteBuffer() {
    _classCallCheck(this, ByteBuffer);
  };
}

//var ByteBuffer = ProtoBuf.ByteBuffer;

//function polyfill(ProtoBuf) {
//
//  // 默认true将int64类型转换为Number，false使用原始方法转换为Long
//  ProtoBuf.asNumber = true;
//
//  var ByteBufferPrototype = ByteBuffer.prototype;
//  ByteBufferPrototype._readVarint64 = ByteBufferPrototype.readVarint64;
//  ByteBufferPrototype._readVarint64ZigZag = ByteBufferPrototype.readVarint64ZigZag;
//
//  ByteBufferPrototype.parseNumber = function (lowBits, highBits) {
//    var ratios = [100, 10, 1, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000, 1];
//    var digtes = [2, 1, 0, 3, 4, 5, 6, 7, 8, 9, 0];
//
//    var B = (lowBits >> 16) & 0xFF;
//    var L = B & 0x0F;
//    var H = (B >> 4) & 0x0F;
//
//    if (L == 2)
//      return "--";
//
//    var N = highBits * 0x1000000;
//    N += (lowBits & 0xFFFF) + ((lowBits >> 24) * 0x10000);
//    N /= ratios[L];
//    if (H != 0) {
//      return Number((-N).toFixed(digtes[L]));
//    } else {
//      return Number(N.toFixed(digtes[L]));
//    }
//  };
//
//  ByteBufferPrototype.readVarint64 = function(offset) {
//    if (ProtoBuf.asNumber === false) {
//      return this._readVarint64(offset);
//    } else if (this.view) {
//      return this._readVarint64AB(offset);
//    } else {
//      return this._readVarint64NB(offset);
//    }
//  };
//
//  ByteBufferPrototype._readVarint64AB = function (offset) {
//    var relative = typeof offset === 'undefined';
//    if (relative) offset = this.offset;
//    if (!this.noAssert) {
//      if (typeof offset !== 'number' || offset % 1 !== 0)
//        throw TypeError("Illegal offset: " + offset + " (not an integer)");
//      offset >>>= 0;
//      if (offset < 0 || offset + 1 > this.buffer.byteLength)
//        throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.byteLength);
//    }
//    // ref: src/google/protobuf/io/coded_stream.cc
//    var start = offset,
//      part0 = 0,
//      part1 = 0,
//      part2 = 0,
//      b  = 0;
//    b = this.view.getUint8(offset++); part0  = (b & 0x7F)      ; if (b & 0x80) {
//      b = this.view.getUint8(offset++); part0 |= (b & 0x7F) <<  7; if (b & 0x80) {
//        b = this.view.getUint8(offset++); part0 |= (b & 0x7F) << 14; if (b & 0x80) {
//          b = this.view.getUint8(offset++); part0 |= (b & 0x7F) << 21; if (b & 0x80) {
//            b = this.view.getUint8(offset++); part1  = (b & 0x7F)      ; if (b & 0x80) {
//              b = this.view.getUint8(offset++); part1 |= (b & 0x7F) <<  7; if (b & 0x80) {
//                b = this.view.getUint8(offset++); part1 |= (b & 0x7F) << 14; if (b & 0x80) {
//                  b = this.view.getUint8(offset++); part1 |= (b & 0x7F) << 21; if (b & 0x80) {
//                    b = this.view.getUint8(offset++); part2  = (b & 0x7F)      ; if (b & 0x80) {
//                      b = this.view.getUint8(offset++); part2 |= (b & 0x7F) <<  7; if (b & 0x80) {
//                        throw Error("Buffer overrun"); }}}}}}}}}}
//    var value = this.parseNumber(part0 | (part1 << 28), (part1 >>> 4) | (part2) << 24);
//    if (relative) {
//      this.offset = offset;
//      return value;
//    } else {
//      return {
//        'value': value,
//        'length': offset - start
//      };
//    }
//  };
//
//  ByteBufferPrototype._readVarint64NB = function (offset) {
//    var relative = typeof offset === 'undefined';
//    if (relative) offset = this.offset;
//    if (!this.noAssert) {
//      if (typeof offset !== 'number' || offset % 1 !== 0)
//        throw TypeError("Illegal offset: "+offset+" (not an integer)");
//      offset >>>= 0;
//      if (offset < 0 || offset + 1 > this.buffer.length)
//        throw RangeError("Illegal offset: 0 <= "+offset+" (+"+1+") <= "+this.buffer.length);
//    }
//    // ref: src/google/protobuf/io/coded_stream.cc
//    var start = offset,
//      part0 = 0,
//      part1 = 0,
//      part2 = 0,
//      b  = 0;
//    b = this.buffer[offset++]; part0  = (b & 0x7F)      ; if ( b & 0x80                                                   ) {
//      b = this.buffer[offset++]; part0 |= (b & 0x7F) <<  7; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
//        b = this.buffer[offset++]; part0 |= (b & 0x7F) << 14; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
//          b = this.buffer[offset++]; part0 |= (b & 0x7F) << 21; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
//            b = this.buffer[offset++]; part1  = (b & 0x7F)      ; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
//              b = this.buffer[offset++]; part1 |= (b & 0x7F) <<  7; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
//                b = this.buffer[offset++]; part1 |= (b & 0x7F) << 14; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
//                  b = this.buffer[offset++]; part1 |= (b & 0x7F) << 21; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
//                    b = this.buffer[offset++]; part2  = (b & 0x7F)      ; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
//                      b = this.buffer[offset++]; part2 |= (b & 0x7F) <<  7; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
//                        throw Error("Buffer overrun"); }}}}}}}}}}
//    var value = this.parseNumber(part0 | (part1 << 28), (part1 >>> 4) | (part2) << 24);
//    if (relative) {
//      this.offset = offset;
//      return value;
//    } else {
//      return {
//        'value': value,
//        'length': offset-start
//      };
//    }
//  };
//
//  ByteBufferPrototype.readVarint64ZigZag = function (offset) {
//    if (ProtoBuf.asNumber === false) {
//      return ByteBufferPrototype._readVarint64ZigZag.call(this, offset);
//    }
//    var val = this.readVarint64(offset);
//    if (val && val['value'] instanceof Long) {
//      val["value"] = ByteBuffer.zigZagDecode64(val["value"]);
//      return this.parseNumber(val["value"].low, val["value"].high);
//    }
//    else {
//      val = ByteBuffer.zigZagDecode64(val);
//      return this.parseNumber(val.low, val.high);
//    }
//    return val;
//  };
//}

//polyfill(ProtoBuf);

exports['default'] = ProtoBuf;
module.exports = exports['default'];
},{"protobufjs":"protobufjs"}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.unParam = unParam;

function _interopExportWildcard(obj, defaults) { var newObj = defaults({}, obj); delete newObj['default']; return newObj; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

var _connectionLibUtil = require('connection/lib/util');

_defaults(exports, _interopExportWildcard(_connectionLibUtil, _defaults));

function unParam(searchStr) {
  if (searchStr.indexOf('?') === 0) {
    searchStr = searchStr.substring(1);
  }
  var pairs = searchStr.split('&'),
      obj = {},
      pair,
      i;

  for (i in pairs) {
    if (pairs[i] === '') continue;

    pair = pairs[i].split('=');
    obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }

  return obj;
}
},{"connection/lib/util":16}],15:[function(require,module,exports){

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.serialize = serialize;
exports.param = param;
exports.extend = extend;
var escape = encodeURIComponent;

function serialize(params, obj, traditional, scope) {
  var array = obj instanceof Array;
  for (var key in obj) {
    var value = obj[key];

    if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']';
    // handle data in serializeArray() format
    if (!scope && array) params.add(value.name, value.value);else if (traditional ? value instanceof Array : typeof value === 'object') serialize(params, value, traditional, key);else params.add(key, value);
  }
}

function param(obj, traditional) {
  var params = [];
  params.add = function (k, v) {
    this.push(escape(k) + '=' + escape(v));
  };
  serialize(params, obj, traditional);
  return params.join('&').replace('%20', '+');
}

function extend(target) {
  var slice = Array.prototype.slice;
  slice.call(arguments, 1).forEach(function (source) {
    for (var key in source) if (source[key] !== undefined) target[key] = source[key];
  });
  return target;
}

// recurse into nested objects
},{}]},{},[1])(1)
});