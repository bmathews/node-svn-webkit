// note: auto detect and encode to utf8
// https://github.com/fritx/gui-cli/blob/master/js/to-utf8.js
var iconv = require('iconv-lite')

function isAscii(buf) {
  for (var i = 0; i < buf.length; i++) {
    if ((buf[i] >> 7) > 0) {
      return false
    }
  }
  return true
}

function toUtf8(buf) {
  if (isAscii(buf)) return iconv.decode(buf, 'utf8')
  return iconv.decode(buf, 'gbk')
}

module.exports = toUtf8
