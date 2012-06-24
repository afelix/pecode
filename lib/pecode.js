var fs = require('fs'),
    print = require('util').print,
    pecode = require('./pecodeapi.js'),
    basepath = __dirname.substr(0, __dirname.length - 3) + '/src/parser.src',
    src, base, tree;

var args = process.argv.slice(2),
    opts = args.length ? getOpts(args, [
        '-v', '--version',
        '-h', '--help',
        '-dp', '--parser',
        '-ci', '--clean-info',
        '-t', '--trim',
    ], ['-r', '--rule']) : null,
    single = opts && opts.single,
    pairs = opts && opts.pairs,
    other = opts && opts.other,
    fileName = other && other[0],
    rule = pairs && (pairs['-r'] || pairs['--rule'] || 'pecode');

if (!opts || single.contains(['-h', '--help']) || other.length > 1) {
    printFile('USAGE');
} else if (single.contains(['-v', '--version'])) {
    printFile('VERSION');
} else {
    src = fs.readFileSync(fileName).toString();
    if (single.contains(['-t', '--trim'])) src = src.trim();

    tree = pecode.parse(src, rule);

    if (single.contains(['-ci', '--clean-info'])) {
        tree = pecode.cleanInfo(tree);
    }

    if (single.contains(['-dp', '--parser'])) {
        pecode.printTree(tree);
    }

    if (!single.contains(['-dp', '--parser'])) {
        base = fs.readFileSync(basepath).toString();
        print(pecode.generate(tree, base));
    }

}

// Utils

function getOpts(argv, o_single, o_pairs) {
    var opts = { single : [], pairs : {}, other : [] },
        arg,
        i = 0;

    for (; i < argv.length;) {
        arg = argv[i];
        if (o_single && o_single.indexOf(arg) !== -1 && (!o_pairs || o_pairs.indexOf(arg) === -1)) {
            opts.single.push(arg);
        } else if (o_pairs && o_pairs.indexOf(arg) !== -1 && (!o_single || o_single.indexOf(arg) === -1)) {
            opts.pairs[arg] = argv[++i];
        } else opts.other.push(arg);
        i++;
    }

    opts.single.contains = function(value) {
        if (typeof value === 'string') {
            return this.indexOf(value) !== -1;
        } else {
            for (var i = 0; i < value.length; i++) if (this.indexOf(value[i]) !== -1) return true;
        }
        return false;
    };

    return opts;
}

function printFile(filename) {
    print(fs.readFileSync(__dirname.slice(0, __dirname.lastIndexOf('/')) + '/' + filename).toString());
}
