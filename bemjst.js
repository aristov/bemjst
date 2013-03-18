var BEMJST = {

    _pp: [],
    _ps: [],
    _bs: [],

    _rand: '__rand-' + Math.random(),

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
        return function(cVal) {
            return val !== cVal;
        };
    },

    build: function(ctx) {

        this._inited || this.init();
        return this._apply(this.ctx = ctx);

    },

    parse: function(p) {

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
            this._pp.push((typeof p === 'string')? this.parse(p): p);
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

    init: function() {

        var i = -1,
            l = this._ps.length;

        while (++i < l) {
            var p = this._ps[i],
                j = -1,
                pl = p.length,
                isBlock = false,
                isElem = false;

            while (++j < pl) {
                var pp = p[j];

                if (typeof pp === 'object') {

                    for (var k in pp) {

                        if (pp.hasOwnProperty(k)) {
                            if (k === 'mod' || k === 'elemMod') {
                                pp[k + 's'] = pp[k];
                                delete pp[k];
                            }
                            if (k === 'block') isBlock = true;
                            if (k === 'elem') isElem = true;
                        }
                    }
                }
            }

            if (isBlock && !isElem) p.push({ elem: this.isFalse });
        }

        return this._inited = true;

    },

    check: function(p, ctx) {

        ctx || (ctx = {});

        for (var key in p) {

            var pVal = p[key];

            var cVal = ctx[key],
                type = typeof pVal,
                result = (type === 'object')?
                    this.check(pVal, cVal):
                    (type === 'function')?
                        pVal.call(this.ctx, cVal):
                        pVal === cVal;

            if (!result) return false;

        }

        return true;

    },

    _apply: function(ctx, _idx) {

        var i = _idx || this._ps.length;

        while (--i > -1) {

            var p = this._ps[i],
                j = -1,
                l = p.length,
                match = true;

            while (++j < l) {

                var pp = p[j],
                    type = typeof pp;

                if ((type === 'boolean' && !pp) ||
                    (type === 'function' && !pp.call(ctx, ctx.ctx)) ||
                    !this.check(pp, ctx)) {
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
            keys = [],
            backup = {};

        if (typeof context === 'string') context = { _mode: context };

        for (var key in context)
            if (context.hasOwnProperty(key)) {
                keys.push(key);
                backup[key] = ctx[key];
                ctx[key] = context[key];
            }

        var result = callback.call(ctx);

        while (key = keys.pop()) ctx[key] = backup[key];

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


var _ = BEMJST.template.bind(BEMJST),
    local = BEMJST.local.bind(BEMJST),
    apply = BEMJST.apply.bind(BEMJST),
    applyNext = BEMJST.applyNext.bind(BEMJST),
    applyCtx = BEMJST.applyCtx.bind(BEMJST),
    isTrue = BEMJST.isTrue,
    isFalse = BEMJST.isFalse,
    isNot = BEMJST.isNot;

