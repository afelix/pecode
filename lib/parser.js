function Parser() {
}

Parser.prototype.parse = function(s, rule) {
    this._src = s;
    this._stack = [];
    this._chains = [];
    var r = this.$()._o(rule)._();
    return r ? r.b[0] : null;
};

Parser.prototype._push = function(o) {
    this._stack.push(o);
};

Parser.prototype._last = function() {
    return this._chains[this._chains.length - 1];
};

Parser.prototype._fail = function() {
    this._last().fail = true;
};

Parser.prototype._failed = function() {
    return this._last().fail;
};

Parser.prototype._apply = function(s) {
    switch (s.charAt(0)) {
            case '.': return this._s(s.substring(1));
            case ',': return this._r(s.substring(1));
            default: return this[s]();
    }
};

Parser.prototype._gi = function() {
    return this._last().l;
};

Parser.prototype._si = function(i) {
    if (this._chains.length) this._last().l = i;
};

Parser.prototype.$ = function() {
    var i = this._chains.length ? this._last().l + 1 : 0;
    this._chains.push({ i: this._stack.length, fail: false, f: i, l: i - 1 });
    return this;
};

Parser.prototype._ = function() {
    var c = this._chains.pop(),
        r = this._stack.splice(c.i);
    if (!c.fail) {
        if (c.l >= c.f) this._si(c.l);
        return { f: c.f, l: c.l, b: r };
    }
};

Parser.prototype._o = function() {
    if (!this._failed()) {
        var a = arguments, b = [], t;
        for (var i = 0; i < a.length; i++) {
            if (t = this._apply(a[i])) break;
        }
        t !== undefined ? this._push(t) : this._fail();
    }
    return this;
};

Parser.prototype._om = function() {
    if (!this._failed()) {
        var a = arguments, t, n0, n1 = 0, b = [];
        do {
            n0 = n1;
            for (var i = 0; i < a.length; i++) {
                if (t = this._apply(a[i])) {
                    b.push(t);
                    n1++;
                    break;
                }
            }
        } while (n0 !== n1);
        n1 ? this._push(b) : this._fail();
    }
    return this;
};

Parser.prototype._zm = function() {
    if (!this._failed()) {
        var a = arguments, t, n0, n1 = 0, b = [];
        do {
            n0 = n1;
            for (var i = 0; i < a.length; i++) {
                if (t = this._apply(a[i])) {
                    b.push(t);
                    n1++;
                    break;
                }
            }
        } while (n0 !== n1);
        this._push(n1 ? b : null);
    }
    return this;
};

Parser.prototype._zo = function() {
    if (!this._failed()) {
        var a = arguments, t;
        for (var i = 0; i < a.length; i++) {
            if (t = this._apply(a[i])) break;
        }
        this._push(t ? t : null);
    }
    return this;
};

Parser.prototype._not = function() {
    if (!this._failed()) {
        var f = this._gi() + 1,
            s = this._src,
            a = arguments,
            p = new Parser(),
            _s, t, l = s.length + 1;
        for (var i = f; i < l; i++) {
            _s = s.substr(i);
            for (var j = 0; j < a.length; j++) {
                t = p.parse(_s, a[j]);
                if (t !== null) {
                    _s  = s.substring(f, i);
                    i = l;
                    break;
                }
            }
        }
        if (_s) {
            this._si(f + _s.length - 1);
            this._push(_s);
        }
    }
    return this;
};

Parser.prototype._s = function(s) {
    var sl = s.length,
        f = this._gi() + 1;
    if (this._src.substr(f, sl) === s) {
        this._si(f + sl - 1);
        return s;
    }
};

// char
Parser.prototype._c = function() {
    var s = this._src,
        f = this._gi() + 1;
    if (f <= s.length) {
        this._si(f);
        return s.charAt(f);
    }
};

Parser.prototype._r = function(r) {
    var s = this._src,
        f = this._gi() + 1,
        v = '', c,
        re = new RegExp(r);
    for (var i = f; i < s.length; i++) {
        c = s.charAt(i);
        if (re.test(v + c)) v += c;
        else break;
    }
    if (v) {
        this._si(f + v.length - 1);
        this._push(v);
        return v;
    }
};

// tokens

Parser.prototype.rule = function() {
    var b = this.$()._o('name')._o('.=')._om('body')._zo('.,')._();
    if (b !== undefined) {
        var r = [{ f: b.f, l: b.l }, 'rule'];
        b = b.b[0];
        r.push(b[0]);
        r = r.concat(b[2]);
        return r;
    }
};

Parser.prototype.name = function() {
    var b = this.$()._o(',^[a-zA-Z][a-zA-Z0-9]*$')._();
    if (b) {
        var i = { f: b.f, l: b.l }, x = b.b;
        return [i, 'name', x[0]];
    }
};

Parser.prototype.body = function() {
    var b = this.$()._o('pattern')._o('.->')._om('result')._zo('.|')._();
    if (b) return [{ f: b.f, l: b.l }, 'body', b.b[0], b.b[2]];
};

Parser.prototype.pattern = function() {
    var b = this.$()._om('string', 'ws')._();
    if (b) {
        var i = { f: b.f, l: b.l }, x = b.b;
        return [i, 'pattern'].concat(x[0]);
    }
};
/*
Parser.prototype.nbind = function() {
    var b = this.$()._o('.:')._o('number')._();
    if (b) {
        var i = { f : b.f, l: b.l }, x = b.b;
        return [i, 'nbind', x[1]];
    }
};

Parser.prototype.number = function() {
    var b = this.$()._o(',^0|[1-9][0-9]*$')._();
    if (b) {
        var i = { f: b.f, l: b.l }, x = b.b;
        return [i, 'number', x[0]];
    }
};
*/
Parser.prototype.string = function() {
    var b;
    b = this.$()._o('string1')._();
    if (b) return b.b[0];
    b = this.$()._o('string2')._();
    if (b) return b.b[0];
};

Parser.prototype.escape = function() {
    var b = this.$()._o('.\\')._o('_c')._();
    if (b) return '\\' + b.b[1];
};

Parser.prototype._0 = function() {
    var b;
    b  = this.$()._o('escape')._();
    if (b) return b.b[0];
    b = this.$()._not('."', '.\\')._();
    if (b) return b.b[0];
};

Parser.prototype._1 = function() {
    var b;
    b = this.$()._o('escape')._();
    if (b) return b.b[0];
    b = this.$()._not('.\'')._();
    if (b) return b.b[0];
};

Parser.prototype._join = function(a) {
    return a ? a.join('') : '';
};

Parser.prototype.string1 = function() {
    var b = this.$()._o('."')._zm('_0')._o('."')._();
    if (b) {
        var j = '', i = { f: b.f, l: b.l }, x = b.b;
        j += x[0];
        j += this._join(x[1]);
        j += x[2];
        return [i, 'string', j];
    }
};

Parser.prototype.string2 = function() {
    var b = this.$()._o('.\'')._zm('_1')._o('.\'')._();
    if (b) {
        var j = '', i = { f: b.f, l: b.l }, x = b.b;
        j += x[0];
        j += this._join(x[1]);
        j += x[2];
        return [i, 'string', j];
    }
};

Parser.prototype.ws = function() {
    var b = this.$()._o(',^[ \r\n\t]+$')._();
    if (b) {
        var i = { f: b.f, l: b.l }, x = b.b;
        return [i, 'ws', x[0]];
    }
};

var util = require('../../sandbox/lib/util.js');

//util.printTree(new Parser().parse('"te\"st"', 'string'));
util.printTree(new Parser().parse('"x\\"x"', 'string'));
