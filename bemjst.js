/**
 * TODO
 *
 * +- удалять предикаты true (и убрать проверку)
 * переписать BEMHTML
 *
 * создавать ключи в this._pi только тех элементов и мод, для которых есть шаблоны
 * отличать isTrue, isFalse от кастомных проверок
 * оптимизировать local и apply
 * попробовать переписать циклы на forEach и сравнить производительность
 *
 * интегрировать базовые шаблоны в ядро?
 *
 * */

var BEMJST = {

    _pp: [],
    _ps: [],
    _bs: [],

    _pi: null,
    _ops: [],

    _rand: '__rand-' + +new Date(),

    _inited: false,
    _idx: undefined,

    ctx: null,

    _graph: {},

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

        //var ts = +new Date();
        this._inited || this.init();
        //alert(+new Date() - ts); // _mode = 2ms // block + _mode = 5ms // block + elem + _mode = ~65ms

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
                } else
                    result[key] = val;
            } else
                result['_mode'] = key;

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
            elems = {},
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

            /*obj.block && (this._graph[obj.block] || (this._graph[obj.block] = {}));
            obj.block && obj._mode &&
                (this._graph[obj.block][obj._mode]?
                    this._graph[obj.block][obj._mode].push(i):
                    (this._graph[obj.block][obj._mode] = [i]));*/

            this._pushKeyIdx(obj, blocks, 'block', i);
            //this._pushKeyIdx(obj, elems, 'elem', i);
            this._pushKeyIdx(obj, modes, '_mode', i);

            this.isEmptyObject(obj) || op.push(obj);

            this._ops.push(op);
        }

        this._merge(blocks);
        //this._merge(elems);
        this._merge(modes);

        //this._pi = this._intersect(blocks, elems, modes);
        this._pi = this._intersect(blocks, modes);

        return this._inited = true;

    },

    _intersect: function(blocks, modes) {

        function intersect(arr1, arr2) {
            return arr1.filter(function(idx) {
                return arr2.indexOf(idx) > -1;
            });
        }

        var blockKeys = {};

        for (var block in blocks) {
            var modeKeys = blockKeys[block] || (blockKeys[block] = {});
            for (var mode in modes) {
                modeKeys[mode] = intersect(blocks[block], modes[mode]);
            }
        }

        return blockKeys;

    },

    /*_intersect: function(blocks, elems, modes) {

        function intersect(arr1, arr2) {
            return arr1.filter(function(idx) {
                return arr2.indexOf(idx) > -1;
            });
        }

        var blockKeys = {};

        for (var block in blocks) {
            var elemKeys = blockKeys[block] || (blockKeys[block] = {});

            for (var elem in elems) {
                var modeKeys = elemKeys[elem] || (elemKeys[elem] = {}),
                    elemIndexes = intersect(blocks[block], elems[elem]);

                for (var mode in modes) {
                    modeKeys[mode] = intersect(elemIndexes, modes[mode]);
                }
            }
        }

        return blockKeys;

    },*/

    _pushKeyIdx: function(obj, res, key, idx) {

        if (key in obj) {
            var val = obj[key];

            if (typeof val === 'string') delete obj[key];
            else val = '?';
        } else val = '?';

        res[val]? res[val].push(idx): (res[val] = [idx]);

    },

    _merge: function(obj) {

        if (obj['?'] && obj['?'].length)
            for (var key in obj)
                if (key !== '?') {
                    obj[key] = obj['?'].concat(obj[key]);
                    obj[key].sort(function(a, b) { return a - b });
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

        var pi = this._pi,
            block = pi[ctx.block] || pi['?'],
            elem = block, //elem = block[ctx.elem] || block['?'],
            indexes = elem[ctx._mode] || elem['?'],
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
                    var idx = this._idx,  // local блеать!
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

    }

};


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
            'BEMJST._pi = ' + this.stringify(this._pi),
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
