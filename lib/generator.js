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
        t;
    for (var i = 0; i < rr.length; i++) {
        t = rr[i];
        r[t[2][2][2]] = '<..>';
    }
    return r;
};

Generator.prototype.p2code = function(parser) {
    var s = '', p = this.parser, t;
    s += 'function ' + p.name + '() {};\n';
    for (var k in p.rules) {
        t = p.rules[k];
        s += p.name + '.prototype.' + k + ' = function() {};\n'
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
