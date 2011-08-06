function Parser() {}

Parser.prototype.parse = function(s, rule) {
    this._src = s;
    this._stack = [];
    this._chains = [];
    this._i = { f: 0, l: 0 };
    var r = this.$()._o(rule)._();
    return r ? r[0] : null;
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

Parser.prototype._info = function() {
    return { f: this._i.f, l: this._i.l };
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
        this._i = { f: c.f, l: c.l };
        return r;
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
                if ((t = p.parse(_s, a[j])) !== null) {
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

Parser.prototype._re = function() {
    var s = this._src,
        sl = s.length,
        f = this._gi() + 1,
        r = '', c, n, i, j;
    if (s.charAt(f) === '/') {
       for (i = f + 1, j = i + 2; i < sl; i++, j++) {
            c = s.charAt(i);
            n = s.charAt(j);
            if (c === '\\' && j !== sl) r += c + n;
            else if (c !== '/') r += c;
            else break;
        }
        if (i !== sl) {
            this._si(f + r.length);
            return r;
        }
    }
};

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
        return v;
    }
};

Parser.prototype._join = function(a) {
    return a ? a.join('') : '';
};

Parser.prototype.pecode = function() {
    var b = this.$()._o('head')._o('.{')._om('rule')._o('.}')._();
    if (b) return [this._info(), 'pecode', b[0]].concat(b[2]);
};

Parser.prototype.head = function() {
    var b = this.$()._zo('ws')._o('.pecode')._zo('ws')._o('ident')._zo('ws')._();
    if (b) return [this._info(), 'head', b[3]];
};

Parser.prototype.rule = function() {
   var b = this.$()._zo('ws')._o('name')._zo('ws')._o('.=')._om('body')._zo('.,')._zo('ws')._();
    if (b) return [this._info(), 'rule', b[1]].concat(b[4]);
};

Parser.prototype.ident = function() {
    var b = this.$()._o(',^[a-zA-Z][a-zA-Z0-9]*$')._();
    if (b) return [this._info(), 'ident', b[0]];
};

Parser.prototype.name = function() {
    var b = this.$()._o('ident')._();
    if (b) return [this._info(), 'name', b[0]];
};

Parser.prototype.body = function() {
    var b;
    if (b = this.$()._zo('ws')._o('pattern')._o('.->')._o('result')._zo('.|')._()) {
        return [this._info(), 'body', b[1], b[3]];
    }
    if (b = this.$()._zo('ws')._o('pattern')._()) {
        return [this._info(), 'body', b[1]];
    }
};

Parser.prototype.pattern = function() {
    var b = this.$()._om('meat')._zo('ws')._();
    if (b) return [this._info(), 'pattern'].concat(b[0]);
};

Parser.prototype.result = function() {
    var b = this.$()._zo('ws')._zo('pjs')._zo('ws')._();
    if (b) {
        var r = [this._info(), 'result'];
        if (b[1]) r.push(b[1]);
        return r;
    }
};

Parser.prototype.meat = function() {
    var b = this.$()._zo('o', 'zo', 'zm', 'om', 'not', 'braces')._();
    if (b) return b[0];
};

Parser.prototype.braces = function() {
    var b = this.$()._o('.(')._om('string', 'ident', 'delim', 'or')._o('.)')._();
    if (b) {
        var r = [this._info(), 'braces'];
        if (b[1]) r = r.concat(b[1]);
        return r;
    }
};

Parser.prototype.or = function() {
    var b = this.$()._zo('ws')._o('.|')._zo('ws')._();
    if (b) return [this._info(), 'or'];
};

Parser.prototype.delim = function() {
    var b = this.$()._zo('ws')._o('.,')._zo('ws')._();
    if (b) return [this._info(), 'delim'];
};

Parser.prototype.bind = function() {
    var b = this.$()._o('.:')._o('ident')._();
    if (b) return [this._info(), 'bind', b[1]];
};

Parser.prototype.number = function() {
    var b = this.$()._o(',^[0-9]+$')._();
    if (b) return [this._info(), 'number', b[0]];
};

Parser.prototype.string = function() {
    var b;
    if (b = this.$()._o('string1')._()) return b[0];
    if (b = this.$()._o('string2')._()) return b[0];
};

Parser.prototype.escape = function() {
    var b = this.$()._o('.\\')._o('_c')._();
    if (b) return '\\' + b[1];
};

Parser.prototype._0 = function() {
    var b;
    if (b = this.$()._o('escape')._()) return b[0];
    if (b = this.$()._not('."', '.\\')._()) return b[0];
};

Parser.prototype._1 = function() {
    var b;
    if (b = this.$()._o('escape')._()) return b[0];
    if (b = this.$()._not('.\'')._()) return b[0];
};

Parser.prototype.string1 = function() {
    var b = this.$()._o('."')._zm('_0')._o('."')._();
    if (b) {
        var j = '';
        j += b[0];
        j += this._join(b[1]);
        j += b[2];
        return [this._info(), 'string', j];
    }
};

Parser.prototype.string2 = function() {
    var b = this.$()._o('.\'')._zm('_1')._o('.\'')._();
    if (b) {
        var j = '';
        j += b[0];
        j += this._join(b[1]);
        j += b[2];
        return [this._info(), 'string', j];
    }
};

Parser.prototype.re = function() {
    var b = this.$()._o('_re')._();
    if (b) return [this._info(), 're', b[0]];
};

Parser.prototype.ws = function() {
    var b = this.$()._o(',^[ \r\n\t]+$')._();
    if (b) return [this._info(), 'ws'];
};

Parser.prototype._2 = function() {
    var b = this.$()._o('braces', 'ident', 'string', 're')._();
    if (b) return b[0];
};

Parser.prototype.om = function() {
    var b;
    if (b = this.$()._zo('ws')._o('.+')._o('_2')._zo('bind')._()) {
        var r = [this._info(), 'om', b[2]];
        if (b[3]) r.push(b[3]);
        return r;
    }
};

Parser.prototype.zo = function() {
    var b;
    if (b = this.$()._zo('ws')._o('.?')._o('_2')._zo('bind')._()) {
        var r = [this._info(), 'zo', b[2]];
        if (b[3]) r.push(b[3]);
        return r;
    }
};

Parser.prototype.zm = function() {
    var b;
    if (b = this.$()._zo('ws')._o('.*')._o('_2')._zo('bind')._()) {
        var r = [this._info(), 'zm', b[2]];
        if (b[3]) r.push(b[3]);
        return r;
    }
};

Parser.prototype.not = function() {
    var b;
    if (b = this.$()._zo('ws')._o('.!')._o('_2')._zo('bind')._()) {
        var r = [this._info(), 'not', b[2]];
        if (b[3]) r.push(b[3]);
        return r;
    }
};

Parser.prototype.o = function() {
    var b;
    if (b = this.$()._o('._', 'ws')._o('_2')._zo('bind')._()) {
        var r = [this._info(), 'o', b[1]];
        if (b[2]) r.push(b[2]);
        return r;
    }
    if (b = this.$()._o('_2')._zo('bind')._()) {
        var r = [this._info(), 'o', b[0]];
        if (b[1]) r.push(b[1]);
        return r;
    }
};

Parser.prototype.pjs = function() {
    var b = this.$()._om('pjsnbind', 'pjsvbind', 'pjsinfo', 'pjsname', 'pjsident', 'pjsnumber', 'pjsbraces', 'pjsarray', 'string', 'pjsws', 'pjspunct2')._();
    if (b) return [this._info(), 'pjs'].concat(b[0]);
};

Parser.prototype.pjsws = function() {
    var b = this.$()._o(',^[ \r\n\t]+$')._();
    if (b) return [this._info(), 'pjsws', b[0]];
};

Parser.prototype.pjsnbind = function() {
    var b = this.$()._o('.#:')._o('number')._();
    if (b) return [this._info(), 'pjsnbind', b[1]];
};

Parser.prototype.pjsvbind = function() {
    var b = this.$()._o('.#:')._o('ident')._();
    if (b) return [this._info(), 'pjsvbind', b[1]];
};

Parser.prototype.pjsinfo = function() {
    var b = this.$()._o('.#.info')._();
    if (b) return [this._info(), 'pjsinfo'];
};

Parser.prototype.pjsname = function() {
    var b = this.$()._o('.#.name')._();
    if (b) return [this._info(), 'pjsname'];
};

Parser.prototype.pjsmeat = function() {
    var b = this.$()._zm('pjsnbind', 'pjsvbind', 'pjsinfo', 'pjsname', 'pjspunct', 'pjsident', 'pjsnumber', 'pjsbraces', 'pjsarray', 'pjsws', 'string')._();
    if (b) return b[0];
};

Parser.prototype.pjsarray = function() {
    var b = this.$()._o('.[')._o('pjsmeat')._o('.]')._();
    if (b) {
        var r = [this._info(), 'pjsarray'];
        if (b[1]) r = r.concat(b[1]);
        return r;
    }
};

Parser.prototype.pjsbraces = function() {
    var b = this.$()._o('.(')._o('pjsmeat')._o('.)')._();
    if (b) {
        var r = [this._info(), 'pjsbraces'];
        if (b[1]) r = r.concat(b[1]);
        return r;
    }
};

Parser.prototype.pjspunct = function() {
    var b = this.$()._o(',^[|&%=><!.,{}+*?:/\-]$')._();
    if (b) return [this._info(), 'pjspunct', b[0]];
};

Parser.prototype.pjspunct2 = function() {
    var b = this.$()._o(',^[.?:]$')._();
    if (b) return [this._info(), 'pjspunct', b[0]];
};

Parser.prototype.pjsnumber = function() {
    var b = this.$()._o(',^[0-9]+(\.[0-9]+)?$')._();
    if (b) return [this._info(), 'pjsnumber', b[0]];
};

Parser.prototype.pjsident = function() {
    var b = this.$()._o(',^[_a-zA-Z]([_a-zA-Z0-9]+)?$')._();
    if (b) return [this._info(), 'pjsident', b[0]];
};

exports.parse = function(s, rule) {
    return new Parser().parse(s, rule);
};
