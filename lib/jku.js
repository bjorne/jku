var util = require('util');

function Jku(options) {
  this.options = options;
  this.filterFn = options.filter ? this.constructor.parseFn(options.filter) : null;
  this.transformFn = options.transform ? this.constructor.parseFn(options.transform) : null;
}

Jku.prototype.run = function(io) {
  var self = this;
  var buffer = '';

  io.on('data', function(d) {
    buffer += d;
    var index;
    while((index = buffer.indexOf('\n')) !== -1) {
      self.handleLine(buffer.slice(0, index));
      buffer = buffer.slice(index+1);
    }
  });

  io.on('end', function () {
    if (buffer.length) {
      self.handleLine(buffer);
    }
  });
};

Jku.prototype.handleLine = function(str) {
  try {
    var json = JSON.parse(str);
    if (!this.filterFn || this.filterFn(json)) {
      var res = this.transformFn ? this.transformFn(json) : json;
      if (res == null) {
        return;
      }
      switch(res.constructor) {
      case Array:
        console.log(res.join(this.constructor.tab));
        break;
      case Object:
        console.log(JSON.stringify(res));
        break;
      default:
        console.log(res);
      }
    }
  } catch (ex) {
    console.error("String '" + str + "'");
    console.error('caused exception: ' + ex);
    process.exit(1);
  }
};

Jku.fnTemplate = function(json) {
  return __PLACEHOLDER__;
};

Jku.tab = '	';

Jku.parseFn = function(pseudoCode) {
  var code = pseudoCode.replace(/(\W|^)(\.[a-zA-Z_])/g, '$1json$2').replace(/(json(\.[a-zA-Z_][^.\W]+)+)/g, function(s, m) {
    return '(' + m.split('.').reduce(function(memo, str) {
      memo.push(memo.length > 0 ? memo[memo.length-1] + '.' + str : str);
      return memo;
    }, []).slice(1).join(' && ') + ')';
  });
  var fnStr = this.fnTemplate.toString();
  return eval('(' + fnStr.replace('__PLACEHOLDER__', code) + ')');
};

module.exports = Jku;