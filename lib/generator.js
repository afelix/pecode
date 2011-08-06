function Generator() {}

Generator.prototype.init = function(tree) {
    this.parser = {
        name: this.getName(tree),
        rules: this.getRules(tree)
    };
};

Generator.prototype.getName = function(tree) {
    return tree[2][2][2];
};

Generator.prototype.getRules = function(tree) {
    var r = {},
        rr = tree.slice(3),
        t, name, bodies, body, pattern, result;
    for (var i = 0; i < rr.length; i++) {
        t = rr[i];
        name = t[2][2][2];
        bodies = t.slice(3);
        t = r[name] = [];
        for (var j = 0; j < bodies.length; j++) {
            body = bodies[j];
            t.push({
                p: this.getPattern(body[2].slice(2)),
                r: body[3] ? this.convertPjs(body[3][2].slice(2), name) : null
            });
        }
    }
    return r;
};

Generator.prototype.getPattern = function(pattern) {
    var t, op, p = [], b = {}, x;
    for (var i = 0; i < pattern.length; i++) {
        t = pattern[i];
        t = this.getOp(t);
        p.push(t.s);
        if (t.b) b[t.b] = i;
    }
    return { p: p, b: b };
};

Generator.prototype.getOp = function(op) {
    var name = op[1],
        value = op[2],
        bind = op[3],
        s = '.';
    switch(name) {
        case 'o': s += '_o('; break;
        case 'om': s += '_om('; break;
        case 'zo': s += '_zo('; break;
        case 'zm': s += '_zm('; break;
        case 'not': s += '_not('; break;
    }
    s += "'";
    switch(value[1]) {
        case 'string':
            s += '.' + value[2].substring(1, value[2].length - 1);
            break;
        case 'ident':
            s += value[2];
            break;
        case 're':
            s += ',' + value[2];
            break;
    }
    s += "')";
    if (bind) {
        bind = bind[2][2];
    }
    return { s: s, b: bind };
};

Generator.prototype.convertPjs = function(pjs, rulename) {
    var r = [], t, v = '';
    for (var i = 0; i < pjs.length; i++) {
        t = pjs[i];
        switch(t[1]) {
            case 'pjsname':
                v += "'" + rulename + "'";
                break;
            case 'pjsinfo':
                v += 'this._info()';
                break;
            case 'pjsvbind':
                if (v) r.push(v), v = '';
                r.push({ t: 'vbind', v: t[2][2] });
                break;
            case 'pjsnbind':
                if (v) r.push(v), v = '';
                r.push({ t: 'nbind', v: t[2][2] });
                break;
            case 'string':
            case 'pjspunct':
            case 'pjsws':
            case 'pjsnumber':
            case 'pjsident':
                v += t[2];
                break;
            case 'pjsarray':
                r.push(v + '[');
                v = ']';
                r = r.concat(this.convertPjs(t.slice(2), rulename));
                break;
            case 'pjsbraces':
                r.push(v + '(');
                v = ')';
                r = r.concat(this.convertPjs(t.slice(2), rulename));
                break;
        }
    }
    if (v) r.push(v);
    return r;
};

Generator.prototype.p2code = function(parser) {
    var s = '', p = this.parser, t, tab = '    ', j, x, y, v;
    for (var k in p.rules) {
        t = p.rules[k];
        s += p.name + '.prototype.' + k + ' = function() {\n';
        s += tab + 'var _b_;\n';
        for (var i = 0; i < t.length; i++) {
            x = t[i];
            s += tab + 'if (_b_ = this.$()';
            for (j = 0; j < x.p.p.length; j++) s += x.p.p[j];
            s += '._()) {\n' + tab + tab + 'return ';
            if (x.r) {
                for (j = 0; j < x.r.length; j++) {
                    y = x.r[j];
                    if (typeof y !== 'string') {
                        switch(y.t) {
                            case 'vbind':
                                y = '_b_[' + x.p.b[y.v] + ']';
                                break;
                            case 'nbind':
                                y = '_b_[' + y.v + ']';
                                break;
                        }
                    }
                    s += y;
                }
                s += ';\n';
            } else {
                s += '_b_;\n';
            }
            s += tab + '}\n';
        }
        s += '};\n';
    }
    return s;
};

Generator.prototype.generate = function(tree) {
    this.init(tree);
    return this.p2code(tree);
};

exports.generate = function(tree) {
    return new Generator().generate(tree);
};
