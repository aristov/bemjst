_(true)
    (function() {
        var toString = Object.prototype.toString,
            buildEscape = (function() {
                var ts = { '"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;' },
                    f = function(t) { return ts[t] || t };
                return function(r) {
                    r = new RegExp(r, 'g');
                    return function(s) { return ('' + s).replace(r, f) }
                }
            })(),
            ctx = {
                _mode: '',
                ctx: this,
                _: {
                    isArray: function(obj) {
                        return toString.call(obj) === "[object Array]";
                    },
                    isSimple: function(obj) {
                        var t = typeof obj;
                        return t === 'string' || t === 'number' || t === 'boolean';
                    },
                    extend: function(o1, o2) {
                        if(!o1 || !o2) return o1 || o2;
                        var res = {}, n;
                        for(n in o1) o1.hasOwnProperty(n) && (res[n] = o1[n]);
                        for(n in o2) o2.hasOwnProperty(n) && (res[n] = o2[n]);
                        return res;
                    },
                    identify: (function() {
                        var cnt = 0,
                            id = (+new Date()),
                            expando = '__' + id,
                            get = function() { return 'uniq' + id + ++cnt; };
                        return function(obj, onlyGet) {
                            if(!obj) return get();
                            if(onlyGet || obj[expando]) return obj[expando];
                            else return (obj[expando] = get());
                        };
                    })(),
                    xmlEscape: buildEscape('[&<>]'),
                    attrEscape: buildEscape('["&<>]')
                },
                generateId: function() { return this._.identify(this.ctx); }
            };

        return BEMJST.build(ctx);
    });

_({ _mode: '' }) (

    _(true)
        (function(ctx) {
            var vBlock = ctx.block,
                vElem = ctx.elem,
                block = this._currBlock || this.block;

            return apply({
                _mode: 'default',
                block: vBlock || (vElem ? block : undefined),
                _currBlock: (vBlock || vElem) ? undefined : block,
                elem: ctx.elem,
                mods: (vBlock ? ctx.mods : this.mods) || {},
                elemMods: ctx.elemMods || {}
            });
        }),

    _(function(ctx) { return this._.isArray(ctx) })
        (function(ctx) {
            var l = ctx.length,
                i = 0,
                buf = [];

            while(i < l)
                buf.push(apply({ ctx: ctx[i++] }));

            return buf;
        }),

    _(function(ctx) { return !ctx }) (function(ctx) { return ctx }),

    _(function(ctx) { return this._.isSimple(ctx) })
        (function(ctx) {
            if (ctx && ctx !== true || ctx === 0) return ctx;
        })

);

_('default')
    (function(v) {
        // ctx
        var ctx = apply('ctx');
        if (ctx) v = this._.extend(v, ctx);

        // wrap
        var wrap = apply('wrap'),
            result;

        if (wrap && !v._wrap) {
            v._wrap = true;
            v.block || (v.block = this.block);
            result = applyCtx(wrap);
            delete v._wrap;

            return result;
        }

        // extend
        var extend = apply('extend');

        if (extend && v.extend !== false) {
            var ce = v.extend || {},
                _extend = this._.extend;

            ['mods', 'elemMods', 'js', 'attrs']
                .forEach(
                    function(item) {
                        ce[item] = _extend(extend[item], ce[item]);
                    });

            if (extend.mix || ce.mix) {
                ce.mix = (ce.mix || []).concat(extend.mix || []);
            } else {
                v.block = this.block;
                v.js = _extend(v.js, apply('js'));

                delete v.extend;

                ce.mix = [ v ].concat(v.mix || [], apply('mix') || []);
            }

            return applyCtx(_extend(extend, ce));
        }

        // bem
        var js = apply('js');
        if (js) v.js = (js === true && v.js === true) ? true : this._.extend(v.js, js);

        var mix = apply('mix');
        if (v.mix && !this._.isArray(v.mix)) v.mix = [v.mix];
        if (mix) {
            this._.isArray(mix) || (mix = [mix]);
            v.mix = v.mix ? mix.concat(v.mix) : mix;
        }

        // html
        var tag = apply('tag');
        if (tag) v.tag = tag;

        var attrs = apply('attrs');
        if (attrs) v.attrs = this._.extend(attrs, v.attrs);

        var cls = apply('cls');
        if (cls) v.cls = cls;

        var bem = apply('bem');
        if (typeof bem !== 'undefined') v.bem = bem;

        var jsAttr = apply('jsAttr');
        if (jsAttr) v.jsAttr = jsAttr;

        // content
        var content = apply('content');
        if (content || content === 0) v.content = applyCtx(content);

        return v;
    });

_('ctx') (undefined);

_('wrap') (undefined);

_('extend') (undefined);

_('js') (undefined);

_('mix') (undefined);

_('tag') (undefined);

_('attrs') (undefined);

_('cls') (undefined);

_('bem') (undefined);

_('jsAttr') (undefined);

_('content')
    (function(ctx) {
        return ctx.content;
    });
