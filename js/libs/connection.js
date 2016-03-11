(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.connection = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./lib/HttpConnection');
require('./lib/WebSocketConnection');

module.exports = require('./lib/connection');
},{"./lib/HttpConnection":3,"./lib/WebSocketConnection":5,"./lib/connection":8}],2:[function(require,module,exports){
/**
 * connection基类
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var BaseConnection = (function () {

  /**
   * 构造方法
   * @param {!string} address 连接地址
   * @param {!object} options 设置参数
   * @param {object=} handler 事件处理对象
   * @param {boolean=} [secure=false]
   */

  function BaseConnection(address, options, handler, secure) {
    _classCallCheck(this, BaseConnection);

    this._address = address;
    this.options = options || {};

    if (typeof handler === 'boolean') {
      this._secure = handler;
      this._handler = null;
    } else {
      this._secure = secure || false;
      this._handler = handler;
    }

    // 默认协议
    this._protocol = 'http';

    this._listenerMap = {};
  }

  _createClass(BaseConnection, [{
    key: 'getAddress',
    value: function getAddress() {
      return this.getProtocol() + '://' + this._address.replace(/^(\w+:\/\/)?/, '');
    }
  }, {
    key: 'getProtocol',
    value: function getProtocol() {
      return this._protocol + (this._secure ? 's' : '');
    }
  }, {
    key: 'request',
    value: function request(message, options) {}
  }, {
    key: 'send',
    value: function send(message, options) {
      this.request(message, options);
    }
  }, {
    key: 'close',
    value: function close() {}
  }, {
    key: 'on',

    /**
     * 事件监听接口
     */

    value: function on(type, listener) {
      if (typeof listener === 'function') {
        var listeners = this._listenerMap[type] || (this._listenerMap[type] = []);
        if (listeners.indexOf(listener) < 0) {
          listeners.push(listener);
        }
      }
      return this;
    }
  }, {
    key: 'off',
    value: function off(type, listener) {
      if (typeof listener === 'function') {
        var listeners = this._listenerMap[type] || (this._listenerMap[type] = []);
        var index = listeners.indexOf(listener);
        index >= 0 && listeners.splice(index, 1);
      }
      return this;
    }
  }, {
    key: 'trigger',
    value: function trigger(type) {
      var _this = this;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var listeners = this._listenerMap[type];
      listeners && listeners.forEach(function (listener) {
        return listener.apply(_this, args);
      });

      // 同时触发handler中对应方法
      this._handler && typeof this._handler[type] === 'function' && this._handler[type].apply(this._handler, args);
      return this;
    }
  }]);

  return BaseConnection;
})();

BaseConnection.EVENT_OPEN = 'open';
BaseConnection.EVENT_CLOSE = 'close';
BaseConnection.EVENT_ERROR = 'error';
BaseConnection.EVENT_REQUEST = 'request';
BaseConnection.EVENT_SEND = 'send';
BaseConnection.EVENT_RESPONSE = 'response';
BaseConnection.EVENT_MESSAGE = 'message';
BaseConnection.EVENT_PROGRESS = 'progress';

exports['default'] = BaseConnection;
module.exports = exports['default'];
},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _connection = require('./connection');

var _connection2 = _interopRequireDefault(_connection);

var _BaseConnection2 = require('./BaseConnection');

var _BaseConnection3 = _interopRequireDefault(_BaseConnection2);

var _util = require('./util');

var _ajax = require('./ajax');

var _ajax2 = _interopRequireDefault(_ajax);

var HttpConnection = (function (_BaseConnection) {
  function HttpConnection() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, HttpConnection);

    _get(Object.getPrototypeOf(HttpConnection.prototype), 'constructor', this).apply(this, args);

    // 用于记录当前未关闭的请求
    this._request = [];
  }

  _inherits(HttpConnection, _BaseConnection);

  _createClass(HttpConnection, [{
    key: 'request',
    value: function request(message, options) {
      var _this = this;

      options = (0, _util.extend)({}, this.options, options);

      options.success = function (data, textStatus, jqXHR) {
        _this.trigger(_BaseConnection3['default'].EVENT_MESSAGE, data);
        _this.trigger(_BaseConnection3['default'].EVENT_RESPONSE, data);
      };

      options.error = function (jqXHR, textStatus, errorThrown) {
        _this.trigger(_BaseConnection3['default'].EVENT_ERROR, errorThrown);
      };

      options.complete = function () {
        var index = _this._request.indexOf(xhr);
        _this._request.splice(index, 1);
      };

      options.url = this.getAddress() + (message ? message : '');

      var xhr = (0, _ajax2['default'])(options);

      xhr && (xhr.onreadystatechange = (function (origFun) {
        return function () {
          if (xhr.readyState === 2) {

            // 发出了请求
            _this.trigger(_BaseConnection3['default'].EVENT_SEND);
            _this.trigger(_BaseConnection3['default'].EVENT_REQUEST);
          }
          origFun && origFun();
        };
      })(xhr.onreadystatechange));

      // 打开了连接
      this.trigger(_BaseConnection3['default'].EVENT_OPEN);

      this._request.push(xhr);

      xhr.onprogress = function (event) {
        _this.trigger(_BaseConnection3['default'].EVENT_PROGRESS, event);
      };

      return this;
    }
  }, {
    key: 'close',
    value: function close() {
      var _this2 = this;

      // 取消全部未结束的请求
      this._request.forEach(function (xhr, index) {
        xhr.abort();
        _this2._request.splice(index, 1);
      });

      this.trigger(_BaseConnection3['default'].EVENT_CLOSE);
      return this;
    }
  }]);

  return HttpConnection;
})(_BaseConnection3['default']);

exports['default'] = HttpConnection;
;

_connection2['default'].http = function (url, options, handler) {
  return new HttpConnection(url, options, handler, false);
};

_connection2['default'].https = function (url, options, handler) {
  return new HttpConnection(url, options, handler, true);
};
module.exports = exports['default'];
},{"./BaseConnection":2,"./ajax":7,"./connection":8,"./util":9}],4:[function(require,module,exports){
// WebSocket 依赖，node环境使用模块ws
'use strict';

if (typeof window !== 'undefined') {
  if (window.WebSocket) {
    module.exports = window.WebSocket;
  } else {
    console.log('当前浏览器不支持WebSocket');
  }
} else {
  var wsDep = 'ws';
  module.exports = require(wsDep);
}
},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _connection = require('./connection');

var _connection2 = _interopRequireDefault(_connection);

var _BaseConnection2 = require('./BaseConnection');

var _BaseConnection3 = _interopRequireDefault(_BaseConnection2);

var _WebSocket = require('./WebSocket');

var _WebSocket2 = _interopRequireDefault(_WebSocket);

var WebSocketConnection = (function (_BaseConnection) {

  /**
   *
   * @param address
   * @param {{deferred: boolean}} options
   *  deferred: false 创建连接时马上连接websocket，默认
   *            true  延时在第一次请求时连接websocket
   */

  function WebSocketConnection(address, options, handler) {
    _classCallCheck(this, WebSocketConnection);

    _get(Object.getPrototypeOf(WebSocketConnection.prototype), 'constructor', this).apply(this, arguments);

    this._protocol = 'ws';
    this._ws = null;

    var deferred = options && options.deferred === true || false;

    if (deferred === false) {
      this._connect();
    }
  }

  _inherits(WebSocketConnection, _BaseConnection);

  _createClass(WebSocketConnection, [{
    key: 'getStatus',
    value: function getStatus() {
      return this._ws ? this._ws.readyState : _WebSocket2['default'].CLOSED;
    }
  }, {
    key: '_connect',
    value: function _connect() {
      var _this = this;

      // 连接创建websocket
      if (typeof _WebSocket2['default'] !== 'undefined') {
        this._ws = new _WebSocket2['default'](this.getAddress());

        // 避免WebSocket上没有状态静态值
        if (_WebSocket2['default'].OPEN === undefined) {
          _WebSocket2['default'].CONNECTING = this._ws.CONNECTING;
          _WebSocket2['default'].OPEN = this._ws.OPEN;
          _WebSocket2['default'].CLOSING = this._ws.CLOSING;
          _WebSocket2['default'].CLOSED = this._ws.CLOSED;
        }
        this._ws.binaryType = this.options.binaryType || this.options.dataType || 'arraybuffer';

        this._ws.addEventListener('open', function () {
          _this.trigger(_BaseConnection3['default'].EVENT_OPEN);
        });
        this._ws.addEventListener('error', function () {
          _this.trigger(_BaseConnection3['default'].EVENT_ERROR);
        });
        this._ws.addEventListener('close', function () {
          _this.trigger(_BaseConnection3['default'].EVENT_CLOSE);
        });
        this._ws.addEventListener('message', function (message) {
          _this.trigger(_BaseConnection3['default'].EVENT_MESSAGE, message.data);
          _this.trigger(_BaseConnection3['default'].EVENT_RESPONSE, message.data);
        });
      } else {
        throw Error('Don\'t support WebSocket');
      }
    }
  }, {
    key: 'request',
    value: function request(message, options) {
      var _this2 = this;

      message = message || '';
      if (this.getStatus() === _WebSocket2['default'].CLOSED) {
        this._connect();
      }

      if (this.getStatus() !== _WebSocket2['default'].OPEN) {
        this._ws.addEventListener('open', function () {
          _this2._ws.send(message);
          _this2.trigger(_BaseConnection3['default'].EVENT_SEND);
          _this2.trigger(_BaseConnection3['default'].EVENT_REQUEST);
        });
      } else {
        this._ws.send(message);
        this.trigger(_BaseConnection3['default'].EVENT_SEND);
        this.trigger(_BaseConnection3['default'].EVENT_REQUEST);
      }
      return this;
    }
  }, {
    key: 'close',
    value: function close() {
      if (this.getStatus() !== _WebSocket2['default'].CLOSED) {
        this._ws.close();
        this._ws = null;
      }
      return this;
    }
  }]);

  return WebSocketConnection;
})(_BaseConnection3['default']);

exports['default'] = WebSocketConnection;
;

_connection2['default'].ws = function (url, options, handler) {
  return new WebSocketConnection(url, options, handler, false);
};

_connection2['default'].wss = function (url, options, handler) {
  return new WebSocketConnection(url, options, handler, true);
};
module.exports = exports['default'];
},{"./BaseConnection":2,"./WebSocket":4,"./connection":8}],6:[function(require,module,exports){
// 判断环境，浏览器环境存在window对象
'use strict';

if (typeof window !== 'undefined') {

  // 不考虑IE6以下的ActiveX方式
  if (window.XMLHttpRequest) {
    module.exports = window.XMLHttpRequest;
  } else {
    console.log('当前浏览器不支持XMLHttpRequest');
  }
} else {

  // nodejs中使用xhr2模块
  var xmlhttprequestDep = 'xhr2';
  var xmlhttprequest = require(xmlhttprequestDep);
  module.exports = xmlhttprequest.XMLHttpRequest || xmlhttprequest;
}
},{}],7:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); }

var _XMLHttpRequest = require('./XMLHttpRequest');

var _XMLHttpRequest2 = _interopRequireDefault(_XMLHttpRequest);

var _util = require('./util');

/**
 * 模拟jquery的ajax接口
 */

/**
 * 得到ArrayBuffer类型的响应数据
 * @param xhr
 * @returns {ArrayBuffer}
 */
function getArrayBufferResponse(xhr) {
  if (typeof ArrayBuffer === 'undefined') {
    throw new Error('不支持ArrayBuffer类型');
  } else if (xhr.response instanceof ArrayBuffer) {
    return xhr.response;
  } else {

    var text = xhr.responseText;
    var length = text.length;
    var buf = new ArrayBuffer(length);
    var bufView = new Uint8Array(buf);
    for (var i = 0; i < length; i++) {

      // "& 0xff"，表示在每个字符的两个字节之中，只保留后一个字节，将前一个字节扔掉。原因是浏览器解读字符的时候，会把字符自动解读成Unicode的0xF700-0xF7ff区段。
      // http://www.ruanyifeng.com/blog/2012/09/xmlhttprequest_level_2.html
      bufView[i] = text.charCodeAt(i) & 255;
    }
    return buf;
  }
}

/**
 * 得到Blob类型的响应数据
 * @param xhr
 */
function getBlobResponse(xhr) {
  if (typeof Blob === 'undefined') {
    throw new Error('不支持Blob类型');
  } else if (xhr.response instanceof Blob) {
    return xhr.response;
  } else {
    var buf = getArrayBufferResponse(xhr);

    // TODO 未知类型
    return new Blob([buf]);
  }
}

// 判断如果$.ajax存在则直接使用$.ajax
if (typeof $ !== 'undefined' && typeof $.ajax === 'function') {
  var binaryTransport = function (options, originalOptions, jqXHR) {
    return {
      send: function send(headers, callback) {
        var data, type, url, xhr;
        xhr = options.xhr();

        url = options.url;
        type = options.type;
        data = options.data || null;
        xhr.onload = function () {

          var response = options.dataType === 'arraybuffer' ? getArrayBufferResponse(xhr) : getBlobResponse(xhr);

          var result = _defineProperty({}, options.dataType, response);
          return callback(xhr.status, xhr.statusText, result, xhr.getAllResponseHeaders());
        };
        xhr.onerror = 'error', function (err) {
          return callback(-1, err);
        };
        xhr.ontimeout = function (err) {
          return callback(-1, err);
        };

        xhr.open(type, url, true);

        // 因为IE的问题，只能将设置responseType的操作放在xhr.open之后
        // https://connect.microsoft.com/IE/feedback/details/795580/ie11-xmlhttprequest-incorrectly-throws-invalidstateerror-when-setting-responsetype
        // 判断是否支持设置responseType
        var supported = typeof xhr.responseType === 'string';

        // 支持二进制请求直接设置responseType
        if (supported) {

          // 响应类型默认arraybuffer，可以设置为blob（响应回来使用response取得数据）
          xhr.responseType = options.dataType;
        } else {

          // 不支持则尝试使用用户自定义的字符集方式（响应回来使用responseText取得数据）
          xhr.overrideMimeType ? xhr.overrideMimeType('text/plain; charset=x-user-defined') : xhr.setRequestHeader('Accept-Charset', 'x-user-defined');
        }

        for (var i in headers) {
          xhr.setRequestHeader(i, headers[i]);
        }

        return xhr.send(data);
      },
      abort: function abort() {
        return jqXHR.abort();
      }
    };
  };

  // 从jqXHR中暴露原生的xhr
  var generateXHRFun = $.ajaxSettings.xhr;

  // jquery强制支持异步跨域
  $.support.cors = true;

  $.ajaxSetup({
    xhr: function xhr() {
      var xhr = generateXHRFun();
      this.setXHR(xhr);
      return xhr;
    },
    beforeSend: function beforeSend(jqXHR, settings) {
      settings.setXHR = function (xhr) {
        xhr.abort = jqXHR.abort;
        jqXHR.xhr = xhr;
      };
    },
    crossDomain: true
  });

  $.ajaxTransport('+arraybuffer', binaryTransport);
  $.ajaxTransport('+blob', binaryTransport);

  module.exports = function ajax() {
    var jqXHR = $.ajax.apply($, [].slice.call(arguments));
    return jqXHR.xhr;
  };
} else {
  var jsonpID, nodejs, document, key, name, rscript, scriptTypeRE, xmlTypeRE, jsonType, htmlType, blankRE;
  var ajax;

  (function () {

    // trigger a custom event and return false if it was cancelled

    var triggerAndReturn = function (context, eventName, data) {
      //todo: Fire off some events
      //var event = $.Event(eventName)
      //$(context).trigger(event, data)
      return true; //!event.defaultPrevented
    };

    // trigger an Ajax "global" event

    var triggerGlobal = function (settings, context, eventName, data) {
      if (settings.global) return triggerAndReturn(context || document, eventName, data);
    };

    var ajaxStart = function (settings) {
      if (settings.global && ajax.active++ === 0) triggerGlobal(settings, null, 'ajaxStart');
    };

    var ajaxStop = function (settings) {
      if (settings.global && ! --ajax.active) triggerGlobal(settings, null, 'ajaxStop');
    };

    // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable

    var ajaxBeforeSend = function (xhr, settings) {
      var context = settings.context;
      if (settings.beforeSend.call(context, xhr, settings) === false || triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false) return false;

      triggerGlobal(settings, context, 'ajaxSend', [xhr, settings]);
    };

    var ajaxSuccess = function (data, xhr, settings) {
      var context = settings.context,
          status = 'success';
      settings.success.call(context, data, status, xhr);
      triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data]);
      ajaxComplete(status, xhr, settings);
    };

    // type: "timeout", "error", "abort", "parsererror"

    var ajaxError = function (error, type, xhr, settings) {
      var context = settings.context;
      settings.error.call(context, xhr, type, error);
      triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error]);
      ajaxComplete(type, xhr, settings);
    };

    // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"

    var ajaxComplete = function (status, xhr, settings) {
      var context = settings.context;
      settings.complete.call(context, xhr, status);
      triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings]);
      ajaxStop(settings);
    };

    // Empty function, used as default callback

    var empty = function () {};

    var mimeToDataType = function (mime) {
      return mime && (mime == htmlType ? 'html' : mime == jsonType ? 'json' : scriptTypeRE.test(mime) ? 'script' : xmlTypeRE.test(mime) && 'xml') || 'text';
    };

    var appendQuery = function (url, query) {
      return (url + '&' + query).replace(/[&?]{1,2}/, '?');
    };

    // serialize payload and append it to the URL for GET requests

    var serializeData = function (options) {
      if (typeof options.data === 'object') options.data = (0, _util.param)(options.data);
      if (options.data && (!options.type || options.type.toUpperCase() == 'GET')) options.url = appendQuery(options.url, options.data);
    };

    // 修改自https://github.com/ForbesLindesay/ajax
    jsonpID = 0;
    nodejs = typeof window === 'undefined';
    document = !nodejs && window.document;
    rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    scriptTypeRE = /^(?:text|application)\/javascript/i;
    xmlTypeRE = /^(?:text|application)\/xml/i;
    jsonType = 'application/json';
    htmlType = 'text/html';
    blankRE = /^\s*$/;

    ajax = module.exports = function (options) {
      var settings = (0, _util.extend)({}, options || {});
      for (key in ajax.settings) if (settings[key] === undefined) settings[key] = ajax.settings[key];

      ajaxStart(settings);

      if (!settings.crossDomain) {
        settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) && !nodejs && !!window.location && RegExp.$2 != window.location.host;
      }

      var dataType = settings.dataType,
          hasPlaceholder = /=\?/.test(settings.url);
      if (dataType == 'jsonp' || hasPlaceholder) {
        if (!hasPlaceholder) settings.url = appendQuery(settings.url, 'callback=?');
        return ajax.JSONP(settings);
      }

      if (!settings.url) settings.url = !nodejs && !!window.location && window.location.toString();
      serializeData(settings);

      var mime = settings.accepts[dataType],
          baseHeaders = {},
          protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : !nodejs && !!window.location && window.location.protocol,
          xhr = ajax.settings.xhr(),
          abortTimeout;

      if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest';
      if (mime) {
        baseHeaders['Accept'] = mime;
        if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0];
        xhr.overrideMimeType && xhr.overrideMimeType(mime);
      }
      if (settings.contentType || settings.data && settings.type.toUpperCase() != 'GET') baseHeaders['Content-Type'] = settings.contentType || 'application/x-www-form-urlencoded';
      settings.headers = (0, _util.extend)(baseHeaders, settings.headers || {});

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          clearTimeout(abortTimeout);
          var result,
              error = false;
          if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304 || xhr.status == 0 && protocol == 'file:') {
            dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'));

            try {
              if (dataType == 'script') (1, eval)(result);else if (dataType == 'xml') result = xhr.responseXML;else if (dataType == 'json') result = blankRE.test(xhr.responseText) ? null : JSON.parse(xhr.responseText);else if (dataType === 'arraybuffer') result = getArrayBufferResponse(xhr);else if (dataType === 'blob') result = getBlobResponse(xhr);else result = xhr.responseText;
            } catch (e) {
              error = e;
            }

            if (error) ajaxError(error, 'parsererror', xhr, settings);else ajaxSuccess(result, xhr, settings);
          } else {
            ajaxError(null, 'error', xhr, settings);
          }
        }
      };

      var async = 'async' in settings ? settings.async : true;
      xhr.open(settings.type, settings.url, async);

      if (dataType == 'arraybuffer' || dataType == 'blob') {

        // 因为IE的问题，只能将设置responseType的操作放在xhr.open之后
        // https://connect.microsoft.com/IE/feedback/details/795580/ie11-xmlhttprequest-incorrectly-throws-invalidstateerror-when-setting-responsetype
        // 判断是否支持设置responseType
        var supported = typeof xhr.responseType === 'string';

        // 支持二进制请求直接设置responseType
        if (supported) {

          // 响应类型默认arraybuffer，可以设置为blob（响应回来使用response取得数据）
          xhr.responseType = options.dataType;
        } else {

          // 不支持则尝试使用用户自定义的字符集方式（响应回来使用responseText取得数据）
          xhr.overrideMimeType ? xhr.overrideMimeType('text/plain; charset=x-user-defined') : xhr.setRequestHeader('Accept-Charset', 'x-user-defined');
        }
      }

      for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name]);

      if (ajaxBeforeSend(xhr, settings) === false) {
        xhr.abort();
        return false;
      }

      if (settings.timeout > 0) abortTimeout = setTimeout(function () {
        xhr.onreadystatechange = empty;
        xhr.abort();
        ajaxError(null, 'timeout', xhr, settings);
      }, settings.timeout);

      // avoid sending empty string (#319)
      xhr.send(settings.data ? settings.data : null);
      return xhr;
    };

    // Number of active Ajax requests
    ajax.active = 0;

    ajax.JSONP = function (options) {
      if (!('type' in options)) return ajax(options);

      var callbackName = 'jsonp' + ++jsonpID,
          script = document.createElement('script'),
          abort = function abort() {
        //todo: remove script
        //$(script).remove()
        if (!nodejs && callbackName in window) window[callbackName] = empty;
        ajaxComplete('abort', xhr, options);
      },
          xhr = { abort: abort },
          abortTimeout,
          head = document.getElementsByTagName('head')[0] || document.documentElement;

      if (options.error) script.onerror = function () {
        xhr.abort();
        options.error();
      };

      if (!nodejs) window[callbackName] = function (data) {
        clearTimeout(abortTimeout);
        //todo: remove script
        //$(script).remove()
        delete window[callbackName];
        ajaxSuccess(data, xhr, options);
      };

      serializeData(options);
      script.src = options.url.replace(/=\?/, '=' + callbackName);

      // Use insertBefore instead of appendChild to circumvent an IE6 bug.
      // This arises when a base node is used (see jQuery bugs #2709 and #4378).
      head.insertBefore(script, head.firstChild);

      if (options.timeout > 0) abortTimeout = setTimeout(function () {
        xhr.abort();
        ajaxComplete('timeout', xhr, options);
      }, options.timeout);

      return xhr;
    };

    ajax.settings = {
      // Default type of request
      type: 'GET',
      // Callback that is executed before request
      beforeSend: empty,
      // Callback that is executed if the request succeeds
      success: empty,
      // Callback that is executed the the server drops error
      error: empty,
      // Callback that is executed on request complete (both: error and success)
      complete: empty,
      // The context for the callbacks
      context: null,
      // Whether to trigger "global" Ajax events
      global: true,
      // Transport
      xhr: function xhr() {
        return new _XMLHttpRequest2['default']();
      },
      // MIME types mapping
      accepts: {
        script: 'text/javascript, application/javascript',
        json: jsonType,
        xml: 'application/xml, text/xml',
        html: htmlType,
        text: 'text/plain'
      },
      // Whether the request is to another domain
      crossDomain: false,
      // Default timeout
      timeout: 0
    };

    ajax.get = function (url, success) {
      return ajax({ url: url, success: success });
    };

    ajax.post = function (url, data, success, dataType) {
      if (typeof data === 'function') dataType = dataType || success, success = data, data = null;
      return ajax({ type: 'POST', url: url, data: data, success: success, dataType: dataType });
    };

    ajax.getJSON = function (url, success) {
      return ajax({ url: url, success: success, dataType: 'json' });
    };
  })();
}
},{"./XMLHttpRequest":6,"./util":9}],8:[function(require,module,exports){
/**
 * 解析url，根据url中指定的协议创建对应的连接对象
 * @param url
 * @param options
 * @returns {*}
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

function connection(url, options, handler) {
  if (typeof url !== 'string') {
    throw new Error('url is incorrect');
  }

  var _w$exec = /^((\w+):\/\/)?(.*)/.exec(url);

  var _w$exec2 = _slicedToArray(_w$exec, 4);

  var _w$exec2$2 = _w$exec2[2];
  var protocol = _w$exec2$2 === undefined ? 'http' : _w$exec2$2;
  var urlWithoutProtocol = _w$exec2[3];

  var func = connection[protocol];
  if (!func) {
    throw new Error('protocol "' + protocol + '" no support');
  }
  return func(urlWithoutProtocol, options, handler);
}

exports['default'] = connection;
module.exports = exports['default'];
},{}],9:[function(require,module,exports){
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