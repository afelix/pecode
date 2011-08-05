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
            result = body[3];
            t.push({ p: this.getPattern(body[2].slice(2)) });
        }
    }
    return r;
};

Generator.prototype.getPattern = function(pattern) {
    var t, op, p = [];
    for (var i = 0; i < pattern.length; i++) {
        t = pattern[i];
        p.push(this.getOp(t));
    }
    return p;
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

Generator.prototype.p2code = function(parser) {
    var s = '', p = this.parser, t, tab = '    ';
    s += 'function ' + p.name + '() {};\n';
    for (var k in p.rules) {
        t = p.rules[k];
        s += p.name + '.prototype.' + k + ' = function() {\n';
        s += tab + 'var _b_;\n';
        for (var i = 0; i < t.length; i++) {
            s += tab + 'if (_b_ = this.$()';
            for (var j = 0; j < t[i].p.length; j++) s += t[i].p[j].s;
            s += '._()) {\n';
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
