var BEMHTML = function() {
  var cache,
      xjst = (function(exports) {
    !function() {
        var BEM_ = {}, toString = Object.prototype.toString, SHORT_TAGS = {
            area: 1,
            base: 1,
            br: 1,
            col: 1,
            command: 1,
            embed: 1,
            hr: 1,
            img: 1,
            input: 1,
            keygen: 1,
            link: 1,
            meta: 1,
            param: 1,
            source: 1,
            wbr: 1
        };
        (function(BEM, undefined) {
            var MOD_DELIM = "_", ELEM_DELIM = "__", NAME_PATTERN = "[a-zA-Z0-9-]+";
            function buildModPostfix(modName, modVal, buffer) {
                buffer.push(MOD_DELIM, modName, MOD_DELIM, modVal);
            }
            function buildBlockClass(name, modName, modVal, buffer) {
                buffer.push(name);
                modVal && buildModPostfix(modName, modVal, buffer);
            }
            function buildElemClass(block, name, modName, modVal, buffer) {
                buildBlockClass(block, undefined, undefined, buffer);
                buffer.push(ELEM_DELIM, name);
                modVal && buildModPostfix(modName, modVal, buffer);
            }
            BEM.INTERNAL = {
                NAME_PATTERN: NAME_PATTERN,
                MOD_DELIM: MOD_DELIM,
                ELEM_DELIM: ELEM_DELIM,
                buildModPostfix: function(modName, modVal, buffer) {
                    var res = buffer || [];
                    buildModPostfix(modName, modVal, res);
                    return buffer ? res : res.join("");
                },
                buildClass: function(block, elem, modName, modVal, buffer) {
                    var typeOf = typeof modName;
                    if (typeOf == "string") {
                        if (typeof modVal != "string") {
                            buffer = modVal;
                            modVal = modName;
                            modName = elem;
                            elem = undefined;
                        } else {
                            undefined;
                        }
                    } else {
                        if (typeOf != "undefined") {
                            buffer = modName;
                            modName = undefined;
                        } else {
                            if (elem && typeof elem != "string") {
                                buffer = elem;
                                elem = undefined;
                            } else {
                                undefined;
                            }
                        }
                    }
                    if (!(elem || modName || buffer)) {
                        return block;
                    } else {
                        undefined;
                    }
                    var res = buffer || [];
                    elem ? buildElemClass(block, elem, modName, modVal, res) : buildBlockClass(block, modName, modVal, res);
                    return buffer ? res : res.join("");
                },
                buildModsClasses: function(block, elem, mods, buffer) {
                    var res = buffer || [];
                    if (mods) {
                        var modName;
                        for (modName in mods) {
                            if (!mods.hasOwnProperty(modName)) {
                                continue;
                            } else {
                                undefined;
                            }
                            var modVal = mods[modName];
                            if (modVal == null) {
                                continue;
                            } else {
                                undefined;
                            }
                            modVal = mods[modName] + "";
                            if (!modVal) {
                                continue;
                            } else {
                                undefined;
                            }
                            res.push(" ");
                            if (elem) {
                                buildElemClass(block, elem, modName, modVal, res);
                            } else {
                                buildBlockClass(block, modName, modVal, res);
                            }
                        }
                    } else {
                        undefined;
                    }
                    return buffer ? res : res.join("");
                },
                buildClasses: function(block, elem, mods, buffer) {
                    var res = buffer || [];
                    elem ? buildElemClass(block, elem, undefined, undefined, res) : buildBlockClass(block, undefined, undefined, res);
                    this.buildModsClasses(block, elem, mods, buffer);
                    return buffer ? res : res.join("");
                }
            };
        })(BEM_);
        var buildEscape = function() {
            var ts = {
                '"': "&quot;",
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;"
            }, f = function(t) {
                return ts[t] || t;
            };
            return function(r) {
                r = new RegExp(r, "g");
                return function(s) {
                    return ("" + s).replace(r, f);
                };
            };
        }();
        function BEMContext(context, apply_) {
            this.ctx = context;
            this.apply = apply_;
            this._buf = [];
            this._ = this;
            this._start = true;
            this._mode = "";
            this._listLength = 0;
            this._notNewList = false;
            this.position = 0;
            this.block = undefined;
            this.elem = undefined;
            this.mods = undefined;
            this.elemMods = undefined;
        }
        BEMContext.prototype.isArray = function isArray(obj) {
            return toString.call(obj) === "[object Array]";
        };
        BEMContext.prototype.isSimple = function isSimple(obj) {
            var t = typeof obj;
            return t === "string" || t === "number" || t === "boolean";
        };
        BEMContext.prototype.isShortTag = function isShortTag(t) {
            return SHORT_TAGS.hasOwnProperty(t);
        };
        BEMContext.prototype.extend = function extend(o1, o2) {
            if (!o1 || !o2) {
                return o1 || o2;
            } else {
                undefined;
            }
            var res = {}, n;
            for (n in o1) {
                o1.hasOwnProperty(n) && (res[n] = o1[n]);
            }
            for (n in o2) {
                o2.hasOwnProperty(n) && (res[n] = o2[n]);
            }
            return res;
        };
        BEMContext.prototype.identify = function() {
            var cnt = 0, id = BEM_["__id"] = +(new Date), expando = "__" + id, get = function() {
                return "uniq" + id + ++cnt;
            };
            return function(obj, onlyGet) {
                if (!obj) {
                    return get();
                } else {
                    undefined;
                }
                if (onlyGet || obj[expando]) {
                    return obj[expando];
                } else {
                    return obj[expando] = get();
                }
            };
        }();
        BEMContext.prototype.xmlEscape = buildEscape("[&<>]");
        BEMContext.prototype.attrEscape = buildEscape('["&<>]');
        BEMContext.prototype.BEM = BEM_;
        BEMContext.prototype.isFirst = function isFirst() {
            return this.position === 1;
        };
        BEMContext.prototype.isLast = function isLast() {
            return this.position === this._listLength;
        };
        BEMContext.prototype.generateId = function generateId() {
            return this.identify(this.ctx);
        };
        exports.apply = BEMContext.apply = function _apply() {
            var ctx = new BEMContext(this, apply);
            ctx.apply();
            return ctx._buf.join("");
        };
    }();
    return exports;
    exports.apply = apply;
    function apply(callback) {
        if (typeof callback !== "function") {
            var reqq = apply.reqq, resq = apply.resq, result;
            delete apply.reqq;
            delete apply.resq;
            applySync.call(this, function(err, r) {
                if (err) throw err;
                result = r;
            });
            apply.reqq = reqq;
            apply.resq = resq;
            return result;
        }
        var reqq = apply.reqq || [], resq = apply.resq || [];
        reqq.push({
            self: this,
            res: null,
            callback: callback
        });
        if (apply.reqq && apply.resq) return;
        apply.reqq = reqq;
        apply.resq = resq;
        while (reqq.length !== 0 || resq.length !== 0) {
            if (reqq.length !== 0) {
                var item = reqq.pop();
                (function(item) {
                    applySync.call(item.self, function(err, r) {
                        if (err) throw err;
                        item.res = r;
                        resq.push(item);
                    });
                })(item);
            }
            if (resq.length !== 0) {
                var item = resq.shift();
                item.callback.call(item.self, null, item.res);
            }
        }
        delete apply.reqq;
        delete apply.resq;
        return null;
    }
    function applySync(__$callback) {
        var __t = this._mode;
        if (__t === "content") {
            return $3.call(this, __$callback);
        } else if (__t === "mix") {
            return $5.call(this, __$callback);
        } else if (__t === "bem") {
            return $7.call(this, __$callback);
        } else if (__t === "jsAttr") {
            return $9.call(this, __$callback);
        } else if (__t === "js") {
            return $11.call(this, __$callback);
        } else if (__t === "cls") {
            return $13.call(this, __$callback);
        } else if (__t === "attrs") {
            return $15.call(this, __$callback);
        } else if (__t === "tag") {
            return $17.call(this, __$callback);
        } else {
            if (!this.ctx === false) {
                if (!this.ctx.link === false) {
                    if (!!this._.isSimple(this.ctx) === false) {
                        return $22.call(this, __$callback);
                    } else {
                        return $27.call(this, __$callback);
                    }
                } else {
                    return $27.call(this, __$callback);
                }
            } else {
                return $27.call(this, __$callback);
            }
        }
    }
    function $3(__$callback) {
        return __$callback.call(this, null, this["ctx"]["content"]);
    }
    function $5(__$callback) {
        return __$callback.call(this, null, undefined);
    }
    function $7(__$callback) {
        return __$callback.call(this, null, undefined);
    }
    function $9(__$callback) {
        return __$callback.call(this, null, undefined);
    }
    function $11(__$callback) {
        return __$callback.call(this, null, undefined);
    }
    function $13(__$callback) {
        return __$callback.call(this, null, undefined);
    }
    function $15(__$callback) {
        return __$callback.call(this, null, undefined);
    }
    function $17(__$callback) {
        return __$callback.call(this, null, undefined);
    }
    function $22(__$callback) {
        var __$i18;
        var __$i8;
        var _$6res;
        var _$6contents;
        var __r52, __r53;
        var __this;
        __this = this;
        function _$6follow() {
            var data;
            if (this["ctx"]["link"] === "no-follow") {
                return undefined;
            } else {
                undefined;
                data = this["_links"][this["ctx"]["link"]];
                "";
                __r52 = this["ctx"];
                this["ctx"] = data;
                __r53 = apply["call"](__this);
                this["ctx"] = __r52;
                "";
                return __r53;
            }
        }
        __$i8 = !cache;
        if (__$i8) {
            __$i18 = __$i8;
        } else {
            __$i18 = !this["_cacheLog"];
        }
        if (__$i18) {
            return __$callback.call(this, null, _$6follow["call"](this));
        } else {
            undefined;
            _$6contents = this["_buf"]["slice"](this["_cachePos"])["join"]("");
            this["_cachePos"] = this["_buf"]["length"];
            this["_cacheLog"]["push"](_$6contents, {
                log: this["_localLog"]["slice"](),
                link: this["ctx"]["link"]
            });
            _$6res = _$6follow["call"](this);
            this["_cachePos"] = this["_buf"]["length"];
            return __$callback.call(this, null, _$6res);
        }
    }
    function $27(__$callback) {
        if (!cache === false) {
            if (!this.ctx === false) {
                if (!this.ctx.cache === false) {
                    return $31.call(this, __$callback);
                } else {
                    return $36.call(this, __$callback);
                }
            } else {
                return $36.call(this, __$callback);
            }
        } else {
            return $36.call(this, __$callback);
        }
    }
    function $31(__$callback) {
        var __$r56;
        function __$fn56(__$e, __$r) {
            if (__$e) {
                return __$callback.call(this, __$e, __$r);
            } else {
                __$r56 = __$r;
            }
            _$5res = __$r56;
            _$5tail = this["_buf"]["slice"](this["_cachePos"])["join"]("");
            if (_$5tail) {
                _$5cacheLog["push"](_$5tail);
            } else {
                undefined;
            }
            __r47["cache"] = __r48;
            this["_cachePos"] = __r49;
            this["_cacheLog"] = __r50;
            this["_localLog"] = __r51;
            "";
            cache["set"](this["ctx"]["cache"], {
                log: _$5cacheLog,
                res: _$5res
            });
            return __$callback.call(this, null, _$5res);
        }
        var __$r55;
        function __$fn55(__$e, __$r) {
            if (__$e) {
                return __$callback.call(this, __$e, __$r);
            } else {
                __$r55 = __$r;
            }
            while (true) {
                if (!(_$5i < _$5cached["log"]["length"])) {
                    break;
                } else {
                    if (typeof _$5cached["log"][_$5i] === "string") {
                        this["_buf"]["push"](_$5cached["log"][_$5i]);
                        _$5i++;
                        return __$fn54.call(this);
                    } else {
                        undefined;
                        _$5log = _$5cached["log"][_$5i];
                        _$5reverseLog = _$5log["log"]["map"](function(entry) {
                            return {
                                key: entry[0],
                                value: _$5setProperty(this, entry[0], entry[1])
                            };
                        }, this)["reverse"]();
                        "";
                        __r42 = this["ctx"];
                        __r43 = __r42["cache"];
                        __r42["cache"] = null;
                        __r44 = this["_cacheLog"];
                        this["_cacheLog"] = null;
                        __r45 = this["ctx"];
                        __r46 = __r45["link"];
                        __r45["link"] = _$5log["link"];
                        return apply["call"](__this, __$fn53);
                    }
                }
            }
            return __$callback.call(this, null, _$5cached["res"]);
        }
        var __$r54;
        function __$fn54(__$e, __$r) {
            if (__$e) {
                return __$callback.call(this, __$e, __$r);
            } else {
                __$r54 = __$r;
            }
            return __$fn55.call(this);
        }
        var __$r53;
        function __$fn53(__$e, __$r) {
            if (__$e) {
                return __$callback.call(this, __$e, __$r);
            } else {
                __$r53 = __$r;
            }
            __r42["cache"] = __r43;
            this["_cacheLog"] = __r44;
            __r45["link"] = __r46;
            "";
            undefined;
            _$5reverseLog["forEach"](function(entry) {
                _$5setProperty(this, entry["key"], entry["value"]);
            }, this);
            _$5i++;
            return __$fn54.call(this);
        }
        var _$5tail;
        var __r51;
        var __r50;
        var __r49;
        var __r47, __r48;
        var _$5cacheLog, _$5res;
        var __r45, __r46;
        var __r44;
        var __r42, __r43;
        var _$5log, _$5reverseLog;
        var _$5i;
        var _$5cached;
        var __this;
        __this = this;
        function _$5setProperty(obj, key, value) {
            var i;
            var host, previous;
            var i;
            var target;
            if (key["length"] === 0) {
                return undefined;
            } else {
                undefined;
                if (Array["isArray"](value)) {
                    target = obj;
                    i = 0;
                    while (true) {
                        if (!(i < value["length"] - 1)) {
                            break;
                        } else {
                            target = target[value[i]];
                            i++;
                        }
                    }
                    value = target[value[i]];
                } else {
                    undefined;
                }
                host = obj;
                i = 0;
                previous = host[key[i]];
                host[key[i]] = value;
                return previous;
            }
            while (true) {
                if (!(i < key["length"] - 1)) {
                    break;
                } else {
                    host = host[key[i]];
                    i++;
                }
            }
        }
        if (_$5cached = cache["get"](this["ctx"]["cache"])) {
            _$5i = 0;
            return __$fn55.call(this);
        } else {
            undefined;
            _$5cacheLog = [];
            "";
            __r47 = this["ctx"];
            __r48 = __r47["cache"];
            __r47["cache"] = null;
            __r49 = this["_cachePos"];
            this["_cachePos"] = this["_buf"]["length"];
            __r50 = this["_cacheLog"];
            this["_cacheLog"] = _$5cacheLog;
            __r51 = this["_localLog"];
            this["_localLog"] = [];
            return apply["call"](__this, __$fn56);
        }
    }
    function $36(__$callback) {
        if (this._mode === "default") {
            return $38.call(this, __$callback);
        } else {
            if (!this._.isSimple(this.ctx) === false) {
                if (!!this._mode === false) {
                    return $42.call(this, __$callback);
                } else {
                    return $45.call(this, __$callback);
                }
            } else {
                return $45.call(this, __$callback);
            }
        }
    }
    function $38(__$callback) {
        var __$i945;
        var __$i946;
        var __$i889;
        var __$i879;
        var __$i880;
        var __$i881;
        var __$i882;
        var __$i654;
        var __$i641;
        var __$i635;
        var __$i630;
        var __$i620;
        var __$i616;
        var __$i613;
        var __$i598;
        var __$i588;
        var __$i580;
        var __$i572;
        var __$i563;
        var __$i559;
        var __$i555;
        var __$i538;
        var __$i526;
        var __$i529;
        var __$i524;
        var __$i515;
        var __$i511;
        var __$i501;
        var __$i498;
        var __$i488;
        var __$i479;
        var __$i474;
        var __$i464;
        var __$i455;
        var __$i450;
        var __$i441;
        var __$i762;
        var __$i744;
        var __$i734;
        var __$i845;
        var __$i835;
        var __$i833;
        var __$i825;
        var __$i815;
        var __$i816;
        var __$i813;
        var __$i386;
        var __$i379;
        var __$i362;
        var __$i1184;
        var __$i1172;
        var __$i334;
        var __$i315;
        var __$i316;
        var __$i319;
        var __$i322;
        var __$i325;
        var __$i304;
        var __$i297;
        var __$i294;
        var __$i287;
        var __$i282;
        var __$i272;
        var __$i1121;
        var __$i1109;
        var __$i1110;
        var __$i1101;
        var __$i1089;
        var __$i1090;
        var __$i1071;
        var __$i1062;
        var __$i1056;
        var __$i1047;
        var __$i248;
        var __$i243;
        var __$i239;
        var __$i230;
        var __$i212;
        var __$i1023;
        var __$i1013;
        var __$i176;
        var __$i155;
        var __$i152;
        var __$i148;
        var __$i129;
        var __$i114;
        var __$i115;
        var __$i118;
        var __$i86;
        var __$i75;
        var __$i68;
        var __$i60;
        var __$i55;
        var __$i45;
        var __$r272;
        function __$fn272(__$e, __$r) {
            var __$r275;
            function __$fn275(__$e, __$r) {
                var __$r289;
                function __$fn289(__$e, __$r) {
                    if (__$e) {
                        return __$callback.call(this, __$e, __$r);
                    } else {
                        __$r289 = __$r;
                    }
                    return __$callback.call(this, null);
                }
                var __$r288;
                function __$fn288(__$e, __$r) {
                    var __$r291;
                    function __$fn291(__$e, __$r) {
                        if (__$e) {
                            return __$callback.call(this, __$e, __$r);
                        } else {
                            __$r291 = __$r;
                        }
                        __$i1172 = _$4tag;
                        if (__$i1172) {
                            __$i1184 = _$4buf["push"]("</", _$4tag, ">");
                        } else {
                            __$i1184 = __$i1172;
                        }
                        return __$fn289.call(this);
                    }
                    var __$r290;
                    function __$fn290(__$e, __$r) {
                        if (__$e) {
                            return __$callback.call(this, __$e, __$r);
                        } else {
                            __$r290 = __$r;
                        }
                        this["_notNewList"] = __r32;
                        this["position"] = __r33;
                        this["_listLength"] = __r34;
                        this["ctx"] = __r35;
                        this["_mode"] = __r36;
                        "";
                        undefined;
                        return __$fn291.call(this);
                    }
                    if (__$e) {
                        return __$callback.call(this, __$e, __$r);
                    } else {
                        __$r288 = __$r;
                    }
                    __r31 = __$r288;
                    this["_mode"] = __r30;
                    "";
                    _$4content = __r31;
                    __$i1047 = _$4content;
                    if (__$i1047) {
                        __$i1056 = __$i1047;
                    } else {
                        __$i1056 = _$4content === 0;
                    }
                    if (__$i1056) {
                        __$i1062 = this["block"];
                        if (__$i1062) {
                            __$i1071 = __$i1062;
                        } else {
                            __$i1071 = this["elem"];
                        }
                        _$4isBEM = __$i1071;
                        "";
                        __r32 = this["_notNewList"];
                        this["_notNewList"] = false;
                        __r33 = this["position"];
                        __$i1089 = this;
                        __$i1090 = "position";
                        if (_$4isBEM) {
                            __$i1101 = 1;
                        } else {
                            __$i1101 = this["position"];
                        }
                        __$i1089[__$i1090] = __$i1101;
                        __r34 = this["_listLength"];
                        __$i1109 = this;
                        __$i1110 = "_listLength";
                        if (_$4isBEM) {
                            __$i1121 = 1;
                        } else {
                            __$i1121 = this["_listLength"];
                        }
                        __$i1109[__$i1110] = __$i1121;
                        __r35 = this["ctx"];
                        this["ctx"] = _$4content;
                        __r36 = this["_mode"];
                        this["_mode"] = "";
                        return apply["call"](__this, __$fn290);
                    } else {
                        undefined;
                        return __$fn291.call(this);
                    }
                }
                if (__$e) {
                    return __$callback.call(this, __$e, __$r);
                } else {
                    __$r275 = __$r;
                }
                if (this["_"]["isShortTag"](_$4tag)) {
                    _$4buf["push"]("/>");
                    return __$fn289.call(this);
                } else {
                    __$i1013 = _$4tag;
                    if (__$i1013) {
                        __$i1023 = _$4buf["push"](">");
                    } else {
                        __$i1023 = __$i1013;
                    }
                    "";
                    __r30 = this["_mode"];
                    this["_mode"] = "content";
                    return apply["call"](__this, __$fn288);
                }
            }
            var __$r274;
            function __$fn274(__$e, __$r) {
                var __$r276;
                function __$fn276(__$e, __$r) {
                    var __$r277;
                    function __$fn277(__$e, __$r) {
                        var __$r280;
                        function __$fn280(__$e, __$r) {
                            var __$r286;
                            function __$fn286(__$e, __$r) {
                                var __$r287;
                                function __$fn287(__$e, __$r) {
                                    if (__$e) {
                                        return __$callback.call(this, __$e, __$r);
                                    } else {
                                        __$r287 = __$r;
                                    }
                                    __r29 = __$r287;
                                    this["_mode"] = __r28;
                                    "";
                                    _$4attrs = __r29;
                                    _$4attrs = this["_"]["extend"](_$4attrs, _$4v["attrs"]);
                                    if (_$4attrs) {
                                        _$4name = undefined;
                                        _$4name;
                                        __$i945 = _$4attrs;
                                        __$i946 = typeof __$i945 === "object" && __$i945 !== null ? Object.keys(__$i945) : [];
                                        __$fi946 = 0;
                                        while (__$fi946 < __$i946["length"]) {
                                            _$4name = __$i946[__$fi946];
                                            if (_$4attrs[_$4name] === undefined) {
                                                __$fi946++;
                                                continue;
                                            } else {
                                                undefined;
                                                _$4buf["push"](" ", _$4name, '="', this["_"]["attrEscape"](_$4attrs[_$4name]), '"');
                                                __$fi946++;
                                            }
                                        }
                                    } else {
                                        undefined;
                                    }
                                    return __$fn275.call(this);
                                }
                                if (__$e) {
                                    return __$callback.call(this, __$e, __$r);
                                } else {
                                    __$r286 = __$r;
                                }
                                "";
                                __r28 = this["_mode"];
                                this["_mode"] = "attrs";
                                return apply["call"](__this, __$fn287);
                            }
                            var __$r285;
                            function __$fn285(__$e, __$r) {
                                if (__$e) {
                                    return __$callback.call(this, __$e, __$r);
                                } else {
                                    __$r285 = __$r;
                                }
                                __r27 = __$r285;
                                this["_mode"] = __r26;
                                "";
                                _$4jsAttr = __r27;
                                __$i879 = _$4buf;
                                __$i880 = "push";
                                __$i881 = " ";
                                __$i882 = _$4jsAttr;
                                if (__$i882) {
                                    __$i889 = __$i882;
                                } else {
                                    __$i889 = "onclick";
                                }
                                __$i879[__$i880](__$i881, __$i889, '="return ', this["_"]["attrEscape"](JSON["stringify"](_$4jsParams)), '"');
                                return __$fn286.call(this);
                            }
                            if (__$e) {
                                return __$callback.call(this, __$e, __$r);
                            } else {
                                __$r280 = __$r;
                            }
                            if (_$4jsParams) {
                                "";
                                __r26 = this["_mode"];
                                this["_mode"] = "jsAttr";
                                return apply["call"](__this, __$fn285);
                            } else {
                                undefined;
                                return __$fn286.call(this);
                            }
                        }
                        var __$r279;
                        function __$fn279(__$e, __$r) {
                            if (__$e) {
                                return __$callback.call(this, __$e, __$r);
                            } else {
                                __$r279 = __$r;
                            }
                            __$i813 = _$4cls;
                            if (__$i813) {
                                __$i815 = _$4buf;
                                __$i816 = "push";
                                if (_$4isBEM) {
                                    __$i825 = " ";
                                } else {
                                    __$i825 = "";
                                }
                                __$i833 = __$i815[__$i816](__$i825, _$4cls);
                            } else {
                                __$i833 = __$i813;
                            }
                            __$i835 = _$4addJSInitClass;
                            if (__$i835) {
                                __$i845 = _$4buf["push"](" i-bem");
                            } else {
                                __$i845 = __$i835;
                            }
                            _$4buf["push"]('"');
                            return __$fn280.call(this);
                        }
                        var __$r278;
                        function __$fn278(__$e, __$r) {
                            var __$r284;
                            function __$fn284(__$e, __$r) {
                                if (__$e) {
                                    return __$callback.call(this, __$e, __$r);
                                } else {
                                    __$r284 = __$r;
                                }
                                return __$fn279.call(this);
                            }
                            var __$r283;
                            function __$fn283(__$e, __$r) {
                                if (__$e) {
                                    return __$callback.call(this, __$e, __$r);
                                } else {
                                    __$r283 = __$r;
                                }
                                while (true) {
                                    if (!(_$4i < _$4mix["length"])) {
                                        break;
                                    } else {
                                        _$4mixItem = _$4mix[_$4i];
                                        __$i441 = _$4mixItem["block"];
                                        if (__$i441) {
                                            __$i450 = __$i441;
                                        } else {
                                            __$i450 = _$4mixItem["elem"];
                                        }
                                        _$4hasItem = __$i450;
                                        __$i455 = _$4mixItem["block"];
                                        if (__$i455) {
                                            __$i464 = __$i455;
                                        } else {
                                            __$i464 = _$4mixItem["_block"];
                                        }
                                        if (__$i464) {
                                            __$i474 = __$i464;
                                        } else {
                                            __$i474 = _$4_this["block"];
                                        }
                                        _$4block = __$i474;
                                        __$i479 = _$4mixItem["elem"];
                                        if (__$i479) {
                                            __$i488 = __$i479;
                                        } else {
                                            __$i488 = _$4mixItem["_elem"];
                                        }
                                        if (__$i488) {
                                            __$i498 = __$i488;
                                        } else {
                                            __$i498 = _$4_this["elem"];
                                        }
                                        _$4elem = __$i498;
                                        __$i501 = _$4hasItem;
                                        if (__$i501) {
                                            __$i511 = _$4buf["push"](" ");
                                        } else {
                                            __$i511 = __$i501;
                                        }
                                        __$i515 = _$4BEM_["INTERNAL"];
                                        if (_$4hasItem) {
                                            __$i524 = "buildClasses";
                                        } else {
                                            __$i524 = "buildModsClasses";
                                        }
                                        __$i526 = _$4block;
                                        __$i529 = _$4mixItem["elem"];
                                        if (__$i529) {
                                            __$i538 = __$i529;
                                        } else {
                                            __$i538 = _$4mixItem["_elem"];
                                        }
                                        if (__$i538) {
                                            __$i559 = __$i538;
                                        } else {
                                            if (_$4mixItem["block"]) {
                                                __$i555 = undefined;
                                            } else {
                                                __$i555 = _$4_this["elem"];
                                            }
                                            __$i559 = __$i555;
                                        }
                                        __$i563 = _$4mixItem["elemMods"];
                                        if (__$i563) {
                                            __$i572 = __$i563;
                                        } else {
                                            __$i572 = _$4mixItem["mods"];
                                        }
                                        __$i515[__$i524](__$i526, __$i559, __$i572, _$4buf);
                                        if (_$4mixItem["js"]) {
                                            __$i580 = _$4jsParams;
                                            if (__$i580) {
                                                __$i588 = __$i580;
                                            } else {
                                                __$i588 = _$4jsParams = {};
                                            }
                                            __$i598 = _$4BEM_["INTERNAL"]["buildClass"](_$4block, _$4mixItem["elem"]);
                                            if (_$4mixItem["js"] === true) {
                                                __$i613 = {};
                                            } else {
                                                __$i613 = _$4mixItem["js"];
                                            }
                                            __$i588[__$i598] = __$i613;
                                            __$i616 = _$4addJSInitClass;
                                            if (__$i616) {
                                                __$i635 = __$i616;
                                            } else {
                                                __$i620 = _$4block;
                                                if (__$i620) {
                                                    __$i630 = !_$4mixItem["elem"];
                                                } else {
                                                    __$i630 = __$i620;
                                                }
                                                __$i635 = _$4addJSInitClass = __$i630;
                                            }
                                        } else {
                                            undefined;
                                        }
                                        __$i641 = _$4hasItem;
                                        if (__$i641) {
                                            __$i654 = !_$4visited[_$4visitedKey(_$4block, _$4elem)];
                                        } else {
                                            __$i654 = __$i641;
                                        }
                                        if (__$i654) {
                                            _$4visited[_$4visitedKey(_$4block, _$4elem)] = true;
                                            "";
                                            __r20 = this["block"];
                                            this["block"] = _$4block;
                                            __r21 = this["elem"];
                                            this["elem"] = _$4elem;
                                            __r22 = this["_mode"];
                                            this["_mode"] = "mix";
                                            return apply["call"](__this, __$fn281);
                                        } else {
                                            undefined;
                                            return __$fn282.call(this);
                                        }
                                    }
                                }
                                return __$fn284.call(this);
                            }
                            var __$r282;
                            function __$fn282(__$e, __$r) {
                                if (__$e) {
                                    return __$callback.call(this, __$e, __$r);
                                } else {
                                    __$r282 = __$r;
                                }
                                _$4i++;
                                return __$fn283.call(this);
                            }
                            var __$r281;
                            function __$fn281(__$e, __$r) {
                                if (__$e) {
                                    return __$callback.call(this, __$e, __$r);
                                } else {
                                    __$r281 = __$r;
                                }
                                __r23 = __$r281;
                                this["block"] = __r20;
                                this["elem"] = __r21;
                                this["_mode"] = __r22;
                                "";
                                _$4nestedMix = __r23;
                                if (_$4nestedMix) {
                                    _$4j = 0;
                                    while (true) {
                                        if (!(_$4j < _$4nestedMix["length"])) {
                                            break;
                                        } else {
                                            _$4nestedItem = _$4nestedMix[_$4j];
                                            __$i734 = !_$4nestedItem["block"];
                                            if (__$i734) {
                                                __$i744 = !_$4nestedItem["elem"];
                                            } else {
                                                __$i744 = __$i734;
                                            }
                                            if (__$i744) {
                                                __$i762 = __$i744;
                                            } else {
                                                __$i762 = !_$4visited[_$4visitedKey(_$4nestedItem["block"], _$4nestedItem["elem"])];
                                            }
                                            if (__$i762) {
                                                _$4nestedItem["_block"] = _$4block;
                                                _$4nestedItem["_elem"] = _$4elem;
                                                _$4mix["splice"](_$4i + 1, 0, _$4nestedItem);
                                            } else {
                                                undefined;
                                            }
                                            _$4j++;
                                        }
                                    }
                                } else {
                                    undefined;
                                }
                                return __$fn282.call(this);
                            }
                            if (__$e) {
                                return __$callback.call(this, __$e, __$r);
                            } else {
                                __$r278 = __$r;
                            }
                            __r19 = __$r278;
                            this["_mode"] = __r18;
                            "";
                            _$4mix = __r19;
                            __$i362 = _$4v["mix"];
                            if (__$i362) {
                                if (_$4mix) {
                                    __$i379 = _$4mix["concat"](_$4v["mix"]);
                                } else {
                                    __$i379 = _$4v["mix"];
                                }
                                __$i386 = _$4mix = __$i379;
                            } else {
                                __$i386 = __$i362;
                            }
                            if (_$4mix) {
                                _$4visited = {};
                                function _$4visitedKey(block, elem) {
                                    var __$i1207;
                                    var __$i1199;
                                    var __$i1200;
                                    var __$i1196;
                                    var __$i1189;
                                    __$i1189 = block;
                                    if (__$i1189) {
                                        __$i1196 = __$i1189;
                                    } else {
                                        __$i1196 = "";
                                    }
                                    __$i1199 = __$i1196 + "__";
                                    __$i1200 = elem;
                                    if (__$i1200) {
                                        __$i1207 = __$i1200;
                                    } else {
                                        __$i1207 = "";
                                    }
                                    return __$i1199 + __$i1207;
                                }
                                _$4visited[_$4visitedKey(this["block"], this["elem"])] = true;
                                if (!this["_"]["isArray"](_$4mix)) {
                                    _$4mix = [ _$4mix ];
                                } else {
                                    undefined;
                                }
                                _$4i = 0;
                                return __$fn283.call(this);
                            } else {
                                undefined;
                                return __$fn284.call(this);
                            }
                        }
                        if (__$e) {
                            return __$callback.call(this, __$e, __$r);
                        } else {
                            __$r277 = __$r;
                        }
                        __r17 = __$r277;
                        this["_mode"] = __r16;
                        "";
                        _$4cls = __r17;
                        __$i272 = _$4cls;
                        if (__$i272) {
                            __$i282 = __$i272;
                        } else {
                            __$i282 = _$4cls = _$4v["cls"];
                        }
                        __$i287 = _$4v["block"];
                        if (__$i287) {
                            __$i294 = _$4jsParams;
                        } else {
                            __$i294 = __$i287;
                        }
                        _$4addJSInitClass = __$i294;
                        __$i297 = _$4isBEM;
                        if (__$i297) {
                            __$i304 = __$i297;
                        } else {
                            __$i304 = _$4cls;
                        }
                        if (__$i304) {
                            _$4buf["push"](' class="');
                            if (_$4isBEM) {
                                __$i315 = _$4BEM_["INTERNAL"];
                                __$i316 = "buildClasses";
                                __$i319 = this["block"];
                                __$i322 = _$4v["elem"];
                                __$i325 = _$4v["elemMods"];
                                if (__$i325) {
                                    __$i334 = __$i325;
                                } else {
                                    __$i334 = _$4v["mods"];
                                }
                                __$i315[__$i316](__$i319, __$i322, __$i334, _$4buf);
                                "";
                                __r18 = this["_mode"];
                                this["_mode"] = "mix";
                                return apply["call"](__this, __$fn278);
                            } else {
                                undefined;
                                return __$fn279.call(this);
                            }
                        } else {
                            undefined;
                            return __$fn280.call(this);
                        }
                    }
                    if (__$e) {
                        return __$callback.call(this, __$e, __$r);
                    } else {
                        __$r276 = __$r;
                    }
                    __r15 = __$r276;
                    this["_mode"] = __r14;
                    "";
                    _$4isBEM = __r15;
                    __$i212 = typeof _$4isBEM != "undefined";
                    if (__$i212) {
                        __$i248 = __$i212;
                    } else {
                        if (typeof _$4v["bem"] != "undefined") {
                            __$i243 = _$4v["bem"];
                        } else {
                            __$i230 = _$4v["block"];
                            if (__$i230) {
                                __$i239 = __$i230;
                            } else {
                                __$i239 = _$4v["elem"];
                            }
                            __$i243 = __$i239;
                        }
                        __$i248 = _$4isBEM = __$i243;
                    }
                    "";
                    __r16 = this["_mode"];
                    this["_mode"] = "cls";
                    return apply["call"](__this, __$fn277);
                }
                if (__$e) {
                    return __$callback.call(this, __$e, __$r);
                } else {
                    __$r274 = __$r;
                }
                _$4buf["push"]("<", _$4tag);
                "";
                __r14 = this["_mode"];
                this["_mode"] = "bem";
                return apply["call"](__this, __$fn276);
            }
            var __$r273;
            function __$fn273(__$e, __$r) {
                if (__$e) {
                    return __$callback.call(this, __$e, __$r);
                } else {
                    __$r273 = __$r;
                }
                __r13 = __$r273;
                this["_mode"] = __r12;
                "";
                _$4js = __r13;
                if (_$4js) {
                    __$i114 = this["_"];
                    __$i115 = "extend";
                    __$i118 = _$4v["js"];
                    if (_$4js === true) {
                        __$i129 = {};
                    } else {
                        __$i129 = _$4js;
                    }
                    __$i152 = __$i114[__$i115](__$i118, __$i129);
                } else {
                    if (_$4v["js"] === true) {
                        __$i148 = {};
                    } else {
                        __$i148 = _$4v["js"];
                    }
                    __$i152 = __$i148;
                }
                _$4js = __$i152;
                __$i155 = _$4js;
                if (__$i155) {
                    __$i176 = (_$4jsParams = {})[_$4BEM_["INTERNAL"]["buildClass"](this["block"], _$4v["elem"])] = _$4js;
                } else {
                    __$i176 = __$i155;
                }
                return __$fn274.call(this);
            }
            if (__$e) {
                return __$callback.call(this, __$e, __$r);
            } else {
                __$r272 = __$r;
            }
            __r9 = __$r272;
            this["_mode"] = __r8;
            "";
            _$4tag = __r9;
            __$i45 = typeof _$4tag != "undefined";
            if (__$i45) {
                __$i55 = __$i45;
            } else {
                __$i55 = _$4tag = _$4v["tag"];
            }
            __$i60 = typeof _$4tag != "undefined";
            if (__$i60) {
                __$i68 = __$i60;
            } else {
                __$i68 = _$4tag = "div";
            }
            if (_$4tag) {
                __$i75 = this["block"];
                if (__$i75) {
                    __$i86 = _$4v["js"] !== false;
                } else {
                    __$i86 = __$i75;
                }
                if (__$i86) {
                    "";
                    __r12 = this["_mode"];
                    this["_mode"] = "js";
                    return apply["call"](__this, __$fn273);
                } else {
                    undefined;
                    return __$fn274.call(this);
                }
            } else {
                undefined;
                return __$fn275.call(this);
            }
        }
        var __r36;
        var __r35;
        var __r34;
        var __r33;
        var __r32;
        var _$4isBEM;
        var _$4content;
        var __$fi946;
        var _$4name;
        var _$4attrs;
        var _$4jsAttr;
        var _$4nestedItem;
        var _$4j;
        var _$4nestedMix;
        var _$4mixItem, _$4hasItem, _$4block, _$4elem;
        var _$4i;
        var _$4visited;
        var _$4mix;
        var _$4addJSInitClass;
        var _$4cls;
        var _$4isBEM;
        var _$4jsParams, _$4js;
        var _$4_this, _$4BEM_, _$4v, _$4buf, _$4tag;
        var __r20, __r8, __r12, __r13, __r14, __r15, __r16, __r17, __r18, __r19, __r9, __r21, __r22, __r23, __r26, __r27, __r28, __r29, __r30, __r31;
        var __this;
        __this = this;
        _$4_this = this;
        _$4BEM_ = _$4_this["BEM"];
        _$4v = this["ctx"];
        _$4buf = this["_buf"];
        "";
        __r8 = this["_mode"];
        this["_mode"] = "tag";
        return apply["call"](__this, __$fn272);
    }
    function $42(__$callback) {
        var __$i43;
        var __$i30;
        var __$i20;
        var __$i11;
        var _$3ctx;
        this["_listLength"]--;
        _$3ctx = this["ctx"];
        __$i11 = _$3ctx;
        if (__$i11) {
            __$i20 = _$3ctx !== true;
        } else {
            __$i20 = __$i11;
        }
        if (__$i20) {
            __$i30 = __$i20;
        } else {
            __$i30 = _$3ctx === 0;
        }
        if (__$i30) {
            __$i43 = this["_buf"]["push"](_$3ctx);
        } else {
            __$i43 = __$i30;
        }
        return __$callback.call(this, null);
    }
    function $45(__$callback) {
        if (!!this._mode === false) {
            if (!!this.ctx === false) {
                return $48.call(this, __$callback);
            } else {
                return $51.call(this, __$callback);
            }
        } else {
            return $51.call(this, __$callback);
        }
    }
    function $48(__$callback) {
        this["_listLength"]--;
        return __$callback.call(this, null);
    }
    function $51(__$callback) {
        if (!this._.isArray(this.ctx) === false) {
            if (!!this._mode === false) {
                return $54.call(this, __$callback);
            } else {
                return $57.call(this, __$callback);
            }
        } else {
            return $57.call(this, __$callback);
        }
    }
    function $54(__$callback) {
        var __$i93;
        var __$i83;
        var __$r20;
        function __$fn20(__$e, __$r) {
            if (__$e) {
                return __$callback.call(this, __$e, __$r);
            } else {
                __$r20 = __$r;
            }
            while (true) {
                if (!(_$1i < _$1l)) {
                    break;
                } else {
                    "";
                    __r7 = this["ctx"];
                    this["ctx"] = _$1v[_$1i++];
                    return apply["call"](__this, __$fn19);
                }
            }
            undefined;
            __$i83 = _$1prevNotNewList;
            if (__$i83) {
                __$i93 = __$i83;
            } else {
                __$i93 = this["position"] = _$1prevPos;
            }
            return __$callback.call(this, null);
        }
        var __$r19;
        function __$fn19(__$e, __$r) {
            if (__$e) {
                return __$callback.call(this, __$e, __$r);
            } else {
                __$r19 = __$r;
            }
            this["ctx"] = __r7;
            "";
            return __$fn20.call(this);
        }
        var __r7;
        var _$1v, _$1l, _$1i, _$1prevPos, _$1prevNotNewList;
        var __this;
        __this = this;
        _$1v = this["ctx"];
        _$1l = _$1v["length"];
        _$1i = 0;
        _$1prevPos = this["position"];
        _$1prevNotNewList = this["_notNewList"];
        if (_$1prevNotNewList) {
            this["_listLength"] += _$1l - 1;
        } else {
            this["position"] = 0;
            this["_listLength"] = _$1l;
        }
        this["_notNewList"] = true;
        return __$fn20.call(this);
    }
    function $57(__$callback) {
        if (!true === false) {
            if (!!this._mode === false) {
                return $60.call(this, __$callback);
            } else {
                return $e.call(this, __$callback);
            }
        } else {
            return $e.call(this, __$callback);
        }
    }
    function $60(__$callback) {
        var __$i235;
        var __$i222;
        var __$i211;
        var __$i212;
        var __$i215;
        var __$i208;
        var __$i199;
        var __$i194;
        var __$i181;
        var __$i182;
        var __$i187;
        var __$i173;
        var __$i165;
        var __$i149;
        var __$i150;
        var __$i128;
        var __$i119;
        var __$i110;
        var __$i111;
        var __$i112;
        var __$i102;
        var __$i98;
        var __$i84;
        var __$i85;
        var __$i86;
        var __$i76;
        var __$i61;
        var __$i62;
        var __$i67;
        var __$i44;
        var __$i34;
        var __$i29;
        var __$i20;
        var __$r54;
        function __$fn54(__$e, __$r) {
            if (__$e) {
                return __$callback.call(this, __$e, __$r);
            } else {
                __$r54 = __$r;
            }
            undefined;
            this["_mode"] = __r0;
            this["_links"] = __r1;
            this["block"] = __r2;
            this["_currBlock"] = __r3;
            this["elem"] = __r4;
            this["mods"] = __r5;
            this["elemMods"] = __r6;
            "";
            return __$callback.call(this, null);
        }
        var __r6;
        var __r5;
        var __r4;
        var __r3;
        var __r2;
        var __r1;
        var __r0;
        var _$0vBlock, _$0vElem, _$0block;
        var __this;
        __this = this;
        _$0vBlock = this["ctx"]["block"];
        _$0vElem = this["ctx"]["elem"];
        __$i20 = this["_currBlock"];
        if (__$i20) {
            __$i29 = __$i20;
        } else {
            __$i29 = this["block"];
        }
        _$0block = __$i29;
        __$i34 = this["ctx"];
        if (__$i34) {
            __$i44 = __$i34;
        } else {
            __$i44 = this["ctx"] = {};
        }
        "";
        __r0 = this["_mode"];
        this["_mode"] = "default";
        __r1 = this["_links"];
        __$i61 = this;
        __$i62 = "_links";
        __$i67 = this["ctx"]["links"];
        if (__$i67) {
            __$i76 = __$i67;
        } else {
            __$i76 = this["_links"];
        }
        __$i61[__$i62] = __$i76;
        __r2 = this["block"];
        __$i84 = this;
        __$i85 = "block";
        __$i86 = _$0vBlock;
        if (__$i86) {
            __$i102 = __$i86;
        } else {
            if (_$0vElem) {
                __$i98 = _$0block;
            } else {
                __$i98 = undefined;
            }
            __$i102 = __$i98;
        }
        __$i84[__$i85] = __$i102;
        __r3 = this["_currBlock"];
        __$i110 = this;
        __$i111 = "_currBlock";
        __$i112 = _$0vBlock;
        if (__$i112) {
            __$i119 = __$i112;
        } else {
            __$i119 = _$0vElem;
        }
        if (__$i119) {
            __$i128 = undefined;
        } else {
            __$i128 = _$0block;
        }
        __$i110[__$i111] = __$i128;
        __r4 = this["elem"];
        this["elem"] = this["ctx"]["elem"];
        __r5 = this["mods"];
        __$i149 = this;
        __$i150 = "mods";
        if (_$0vBlock) {
            __$i165 = this["ctx"]["mods"];
        } else {
            __$i165 = this["mods"];
        }
        if (__$i165) {
            __$i173 = __$i165;
        } else {
            __$i173 = {};
        }
        __$i149[__$i150] = __$i173;
        __r6 = this["elemMods"];
        __$i181 = this;
        __$i182 = "elemMods";
        __$i187 = this["ctx"]["elemMods"];
        if (__$i187) {
            __$i194 = __$i187;
        } else {
            __$i194 = {};
        }
        __$i181[__$i182] = __$i194;
        __$i199 = this["block"];
        if (__$i199) {
            __$i208 = __$i199;
        } else {
            __$i208 = this["elem"];
        }
        if (__$i208) {
            __$i211 = this;
            __$i212 = "position";
            __$i215 = this["position"];
            if (__$i215) {
                __$i222 = __$i215;
            } else {
                __$i222 = 0;
            }
            __$i235 = __$i211[__$i212] = __$i222 + 1;
        } else {
            __$i235 = this["_listLength"]--;
        }
        return apply["call"](__this, __$fn54);
    }
    function $e(__$callback) {
        throw new Error;
    }
    return exports;
})(typeof exports === "undefined" ? {} : exports);;
  return function(options) {
    if (!options) options = {};
    cache = options.cache;
    return xjst.apply.call(
[this]
    );
  };
}();
typeof exports === "undefined" || (exports.BEMHTML = BEMHTML);