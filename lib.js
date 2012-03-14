(function(scope){
"use strict";

var extend = function(obj, name, value) {
  Object.defineProperty(obj, name, {
    writable: true,
    configurable: true,
    enumerable: false,
    value: value,
  });
};

var om = scope.om = (scope["om"] || {});

// make Arrays print themselves sensibly
extend(Array.prototype, "toString", (function() {
  var printOn = function(x, s) {
    s = s || "";
    if (x === undefined || x === null) {
      s += ("" + x);
    } else if (x.constructor === Array) {
      s += "[";
      for (var idx = 0; idx < x.length; idx++) {
        if (idx > 0) {
          s += ", ";
        }
        s = printOn(x[idx], s);
      }
      s += "]";
    } else {
      s += x;
    }
    return s;
  };

  return function() {
    return printOn(this);
  }
})());

// delegation
om.objectThatDelegatesTo = function(x, props) {
  var f = function() { };
  f.prototype = x;
  var r = new f();
  for (var p in props) {
    if (props.hasOwnProperty(p)) {
      r[p] = props[p];
    }
  }
  return r;
};

// some reflective stuff

scope.ownPropertyNames = function(x) {
  var r = [];
  for (var name in x) {
    if (x.hasOwnProperty(name)) {
      r.push(name);
    }
  }
  return r
};

scope.isImmutable = function(x) {
   return (x === null             ||
           x === undefined        ||
           typeof x === "boolean" ||
           typeof x === "number"  ||
           typeof x === "string"
          );
};

String.prototype.digitValue  = function() {
  return this.charCodeAt(0) - "0".charCodeAt(0);
};

scope.isSequenceable = function(x) { return typeof x == "string" || x.constructor === Array }

// some functional programming stuff

Array.prototype.map = function(f) {
  var r = []
  for (var idx = 0; idx < this.length; idx++)
    r[idx] = f(this[idx])
  return r
}

Array.prototype.reduce = function(f, z) {
  var r = z
  for (var idx = 0; idx < this.length; idx++)
    r = f(r, this[idx])
  return r
}

Array.prototype.delimWith = function(d) {
  return this.reduce(
    function(xs, x) {
      if (xs.length > 0)
        xs.push(d)
      xs.push(x)
      return xs
    },
   [])
}

// Squeak's ReadStream, kind of

scope.ReadStream = function(anArrayOrString) {
  this.src = anArrayOrString;
  this.pos = 0;
}

scope.ReadStream.prototype.atEnd = function() {
  return this.pos >= this.src.length;
};

scope.ReadStream.prototype.next  = function() {
  return this.src.at(this.pos++);
};

// escape characters

String.prototype.pad = function(s, len) {
  var r = this;
  while (r.length < len) {
    r = s + r;
  }
  return r;
}

scope.escapeStringFor = {};
for (var c = 0; c < 128; c++) {
  scope.escapeStringFor[c] = String.fromCharCode(c);
}
scope.escapeStringFor["'".charCodeAt(0)]  = "\\'";
scope.escapeStringFor['"'.charCodeAt(0)]  = '\\"';
scope.escapeStringFor["\\".charCodeAt(0)] = "\\\\";
scope.escapeStringFor["\b".charCodeAt(0)] = "\\b";
scope.escapeStringFor["\f".charCodeAt(0)] = "\\f";
scope.escapeStringFor["\n".charCodeAt(0)] = "\\n";
scope.escapeStringFor["\r".charCodeAt(0)] = "\\r";
scope.escapeStringFor["\t".charCodeAt(0)] = "\\t";
scope.escapeStringFor["\v".charCodeAt(0)] = "\\v";

scope.escapeChar = function(c) {
  var charCode = c.charCodeAt(0)
  if (charCode < 128) {
    return escapeStringFor[charCode];
  } else if (128 <= charCode && charCode < 256) {
    return "\\x" + charCode.toString(16).pad("0", 2);
  } else {
    return "\\u" + charCode.toString(16).pad("0", 4);
  }
}

// FIXME(slightlyoff): can we make this private or stuff it on
//                     String.prototype? I hate that it's global.
scope.unescape = function(s) {
  if (s.charAt(0) != '\\') {
    return s;
  } else {
    switch (s.charAt(1)) {
      case "'":  return "'";
      case '"':  return '"';
      case '\\': return '\\';
      case 'b':  return '\b';
      case 'f':  return '\f';
      case 'n':  return '\n';
      case 'r':  return '\r';
      case 't':  return '\t';
      case 'v':  return '\v';
      case 'x':  return String.fromCharCode(parseInt(s.substring(2, 4), 16));
      case 'u':  return String.fromCharCode(parseInt(s.substring(2, 6), 16));
      default:   return s.charAt(1);
    }
  }
}

String.prototype.toProgramString = function() {
  var s = '"';
  for (var idx = 0; idx < this.length; idx++) {
    s += escapeChar(this.charAt(idx));
  }
  s += '"';
  return s;
}

// C-style tempnam function

scope.tempnam = function(s) { return (s ? s : "_tmpnam_") + tempnam.n++ }
scope.tempnam.n = 0

// unique tags for objects (useful for making "hash tables")

scope.getTag = (function() {
  var numIdx = 0
  return function(x) {
    if (x === null || x === undefined)
      return x
    switch (typeof x) {
      case "boolean": return x == true ? "Btrue" : "Bfalse"
      case "string":  return "S" + x
      case "number":  return "N" + x
      default:        return x.hasOwnProperty("_id_") ? x._id_ : x._id_ = "R" + numIdx++
    }
  }
})();

})(this);
