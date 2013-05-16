var BEMJST = {

    _pp: [],
    _ps: [],
    _bs: [],

    _ops: [],
    _tree: {},

    _rand: '__rand-' + +new Date(),

    _inited: false,

    _idx: undefined,

    ctx: null,

    isTrue: function(val) {
        return !!val;
    },

    isFalse: function(val) {
        return !val;
    },

    isNot: function(val) {
        var result = function(cVal) {
                return val !== cVal;
            };
        result._isNot = val;
        return result;
    },

    build: function(ctx) {

        this._inited || this.init();
        return this._apply(this.ctx = ctx);

    },

    _parse: function(p) {

        var arr = p.split(', '),
            result = {},
            special = { '*': this.isTrue, '!': this.isFalse },
            pp;

        while (pp = arr.pop()) {

            if (pp.charAt(0) === '!') pp = pp.substr(1) + ' !';
            if (pp.charAt(0) === '*') pp = pp.substr(1) + ' *';

            var keys = pp.split(' '),
                l = keys.length - 1,
                key = keys[0];

            if (l) {
                var val = keys[l];
                val = special[val] || (val.charAt(0) === '!'? this.isNot(val.substr(1)): val);

                if (--l) {
                    var i = 0, obj = {};
                    result[key] = obj;
                    while (++i < l) obj[keys[i]] = obj = {};
                    obj[keys[i]] = val;
                } else {
                    result[key] = val;
                }
            } else {
                result['_mode'] = key;
            }
        }

        return result;

    },

    template: function() {

        var _this = this,
            l = arguments.length,
            i = -1;

        while (++i < l) {
            var p = arguments[i];
            this._pp.push((typeof p === 'string')? this._parse(p): p);
        }

        return function(body) {

            if (body !== _this._rand) {
                _this._ps.push(_this._pp.slice());
                _this._bs.push(body);
            }

            _this._pp.length -= l;

            return _this._rand;

        };

    },

    isEmptyObject: function(obj) {

        for (var name in obj) return false;
		return true;

	},

    init: function() {

        var i = -1,
            ps = this._ps,
            l = ps.length,
            blocks = {},
            modes = {};

        while (++i < l) {
            var p = ps[i],
                j = -1,
                pl = p.length,
                op = [],
                obj = {};

            while (++j < pl) {
                var pp = p[j],
                    type = typeof pp;

                if (type === 'object') {
                    for (var key in pp) {
                        var val = pp[key];

                        if (key === 'mod' || key === 'elemMod') obj[key + 's'] = val;
                        else obj[key] = val;
                    }
                } else {
                    (type === 'boolean' && pp) || op.push(pp);
                }
            }

            if ('block' in obj && !('elem' in obj)) obj.elem = this.isFalse;

            pushKeyIdx(blocks, 'block');
            pushKeyIdx(modes, '_mode');

            this.isEmptyObject(obj) || op.push(obj);

            this._ops.push(op);
        }

        function pushKeyIdx(res, key) {
            if (key in obj) {
                var val = obj[key];
                if (typeof val === 'string') delete obj[key];
                else val = '?';
            } else  {
                val = '?';
            }
            res[val]? res[val].push(i): (res[val] = [i]);
        }

        this._buildTree(blocks, modes);

        return this._inited = true;

    },

    _buildTree: function(blocks, modes) {

        function merge(obj) {
            if (obj['?'] && obj['?'].length) {
                for (var key in obj) {
                    if (key !== '?') {
                        obj[key] = obj['?'].concat(obj[key]);
                        obj[key].sort(function(a, b) { return a - b });
                    }
                }
            }
        }

        function intersect(arr1, arr2) {
            return arr1.filter(function(idx) {
                return arr2.indexOf(idx) > -1;
            });
        }

        merge(blocks);
        merge(modes);

        var tree = this._tree;

        for (var block in blocks) {
            var modeKeys = tree[block] || (tree[block] = {});
            for (var mode in modes) {
                modeKeys[mode] = intersect(blocks[block], modes[mode]);
            }
        }

    },

    _check: function(p, ctx) {

        ctx || (ctx = {});

        for (var key in p) {

            var pVal = p[key],
                cVal = ctx[key],
                type = typeof pVal,
                result = (type === 'object')?
                    this._check(pVal, cVal):
                    (type === 'function')?
                        pVal.call(this.ctx, cVal):
                        pVal === cVal;

            if (!result) return false;

        }

        return true;

    },

    _apply: function(ctx, _idx) {

        var tree = this._tree,
            block = tree[ctx.block] || tree['?'],
            indexes = block[ctx._mode] || block['?'],
            t = indexes.length;

        while (--t > -1) {

            var i = indexes[t];

            if (_idx && i >= _idx) continue;

            var p = this._ops[i],
                j = -1,
                l = p.length,
                match = true;

            while (++j < l) {

                var pp = p[j],
                    type = typeof pp;

                if ((type === 'boolean' && !pp) ||
                    (type === 'function' && !pp.call(ctx, ctx.ctx)) ||
                    !this._check(pp, ctx)) {
                        match = false;
                        break;
                    }
            }

            if (match) {
                var b = this._bs[i];

                if (typeof b === 'function') {
                    var idx = this._idx,
                        result;

                    this._idx = i;
                    result = b.call(ctx, ctx.ctx);
                    this._idx = idx;

                    return result;
                } else {
                    return b;
                }
            }

        }

        throw new Error('Match failed!');

    },

    local: function(context, callback) {

        var ctx = this.ctx,
            backup = {},
            key;

        if (typeof context === 'string') context = { _mode: context };

        for (key in context) {
            backup[key] = ctx[key];
            ctx[key] = context[key];
        }

        var result = callback.call(ctx);

        for (key in backup) ctx[key] = backup[key];

        return result;

    },

    apply: function(context, _idx) {

        var _this = this;

        return context?
            _this.local(context, function() {
                return _this._apply(this, _idx);
            }):
            _this._apply(_this.ctx, _idx);

    },

    applyNext: function(context) {

        return this.apply(context, this._idx);

    },

    applyCtx: function(ctx) {

        return this.apply({ _mode: '', ctx: ctx });

    },

    isSimple: function(obj) {

        var t = typeof obj;
        return t === 'string' || t === 'number' || t === 'boolean';

    }

};

(function(undefined) {

    var toString = Object.prototype.toString,
        buf = [];

    BEMJST.isArray = function(obj) {

       return toString.call(obj) === "[object Array]";

    }

    BEMJST._buildHtml = function(v) {

        if (this.isSimple(v)) {
            (v && v !== true || v === 0) && buf.push(v);

        } else if (this.isArray(v)) {
            var i = 0,
                l = v.length;

            while(i < l) this._buildHtml(v[i++]);

        } else {
            var tag = v.tag;

            tag === undefined && (tag = 'div');

            if (tag) {
                buf.push('<', tag, '>');

                var content = v.content;

                if (content || content === 0) {
                    this._buildHtml(content);
                }

                buf.push('</', tag, '>');
            }
        }

    }

    BEMJST.buildHtml = function(v) {

        buf.length = 0;
        this._buildHtml(v);

        return buf.join('');

    }

})();


(function(undefined) {

    var _toString = Object.prototype.toString,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        meta = {
            '\b' : '\\b',
            '\t' : '\\t',
            '\n' : '\\n',
            '\f' : '\\f',
            '\r' : '\\r',
            '"'  : '\\"',
            '\\' : '\\\\'
        };

    BEMJST.stringify = function(val) {

        if (val === null) {
            return 'null';
        }

        if (typeof val === 'undefined') {
            return undefined;
        }

        if (typeof val === 'function') {
            if (val === this.isTrue) return 'isTrue';
            if (val === this.isFalse) return 'isFalse';

            if ('_isNot' in val) {
                var res = ['isNot('],
                    isNot = val._isNot,
                    type = typeof isNot;

                if (type === 'string') res.push('"' + isNot + '"');
                else if (type === 'undefined') res.push('undefined');
                else if (isNot === null) res.push('null');
                else res.push(isNot.toString());

                res.push(')');

                return res.join('');
            }

            return val.toString();
        }

        switch (_toString.call(val)) {
            case '[object String]':
                return '"' +
                    (escapable.test(val)?
                        val.replace(escapable, function(a) {
                            var c = meta[a];
                            return typeof c === 'string'? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                        }) :
                        val) +
                    '"';
            case '[object Number]':
            case '[object Boolean]':
                return '' + val;
            case '[object Array]':
                var res = '[', i = 0, len = val.length, strVal;
                while(i < len) {
                    strVal = this.stringify(val[i]);
                    res += (i++? ',' : '') + (typeof strVal == 'undefined'? 'undefined' : strVal);
                }
                return res + ']';
            case '[object Object]':
                var res = '{', i = 0, strVal;
                for(var key in val) {
                    if(val.hasOwnProperty(key)) {
                        strVal = this.stringify(val[key]);
                        typeof strVal != 'undefined' && (res += (i++? ',' : '') + '"' + key + '":' + strVal);
                    }
                }
                return res + '}';
            default:
                return undefined;
        }

    };

    BEMJST.dump = function() {

        this._inited || this.init();

        return [
            'BEMJST._tree = ' + this.stringify(this._tree),
            'BEMJST._ops = ' + this.stringify(this._ops),
            'BEMJST._bs = ' + this.stringify(this._bs),
            'BEMJST._inited = true;'
        ]
            .join(';\n\n');

    };

})();


var _ = BEMJST.template.bind(BEMJST),
    local = BEMJST.local.bind(BEMJST),
    apply = BEMJST.apply.bind(BEMJST),
    applyNext = BEMJST.applyNext.bind(BEMJST),    // апплаится начиная со следующего шаблона
    applyCtx = BEMJST.applyCtx.bind(BEMJST),      // не имеет защиты от зацикливания
    isTrue = BEMJST.isTrue,
    isFalse = BEMJST.isFalse,
    isNot = BEMJST.isNot;
