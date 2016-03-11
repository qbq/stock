(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.yfloat = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * yfloat格式数据的解析模块
 * Created by jiagang on 2015/10/15.
 */

var TWO_PWR_16_DBL = 1 << 16;
var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;

/**
 * 得到value中高32位数值
 * @param {number} value
 * @returns {number}
 */
function getHighBits(value) {
  return (value / TWO_PWR_32_DBL) | 0;
}

/**
 * 得到value中低32位数值
 * @param {number} value
 * @returns {number}
 */
function getLowBits(value) {
  return (value % TWO_PWR_32_DBL) | 0;
}

/**
 * 高位和低位合并为一个数字
 * @param {number} low
 * @param {number} high
 * @returns {number}
 */
function toNumber(low, high) {
  return ((high >>> 0) * TWO_PWR_32_DBL) + (low >>> 0);
}

/**
 * 解析yfloat类型数字，返回数值和精度的数组
 * @param {number|Long} value
 * @returns {Array}
 */
function unmakeValue(value) {
  var high, low;

  // 数字类型
  if (typeof value === 'number' && value > 0) {
    high = getHighBits(value);
    low = getLowBits(value);
  }

  // Long型
  else if (value && typeof value['getHighBits'] === 'function' && typeof value['getLowBits'] === 'function') {
    high = value.getHighBits();
    low = value.getLowBits();
  }

  // 其它类型不支持
  else {
    console.warn('unmakeValue: invalid value');
    return [NaN, 0];
  }

  var b = (low >> 16) & 0xFF,
    l = b & 0x0F,
    h = (b >> 4) & 0x0F,
    bx = toNumber((high << 24) + ((low >>> 24) << 16) + (low & 0xFFFF), high >> 8),
    dq = [2, 1, null, 3, 4, 5, 6, 7, 8, 9, 0][l],
    temp = dq != null ? bx / (Math.pow(10, dq) || 1) : NaN;

  if (h != 0) {
    temp = -temp;
  }
  return [temp, dq];
}

/**
 * 解析yfloat类型数字，返回数字类型
 * @param {number|Long} value
 * @returns {number}
 */
function unmakeValueToNumber(value) {
  return unmakeValue(value)[0];
}

/**
 * 解析yfloat类型数字，返回根据精度格式化后的字符串
 * @param {number|Long} value
 * @returns {string}
 */
function unmakeValueToString (value) {
  var result = unmakeValue(value),
    resultValue = result[0],
    dq = result[1];
  return dq !== null ? resultValue.toFixed(dq) : resultValue.toString();
}

module.exports = {
  unmakeValue: unmakeValue,
  unmakeValueToNumber: unmakeValueToNumber,
  unmakeValueToString: unmakeValueToString
};

},{}]},{},[1])(1)
});