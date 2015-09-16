/* 
 * JS Layers
 */

(function()
{
    var Linit = function()
    {
        var uniqId = function()
        {
            var n = Math.floor(Math.random()*11);
            var k = Math.floor(Math.random()* 1000000);
            return new Date().getTime() + '_' + k;
        },
        isInteger = function(val)
        {
            return !!((val - parseInt(val) + 1) > 0);
        },
        parameters = 
        { 
            context: { type: 'object', value: document.body, isValid: function(p){ return !!(p.context.nodeType && (p.context.nodeType == 1 || p.context.nodeType == 9)); } },
            name: { type: 'string', value: 'Layer Undefined', isValid: function(p){ return true; } }, 
            tile: { type: 'number', value: 32, isValid: function(p){ return !!(isInteger(p.tile)); } },
            scalable: { type: 'boolean|number', value: false, isValid: function(p){ return !!(p.scalable); } },
            switchContent: { type: 'boolean|number', value: false, isValid: function(p){ return !!(p.switchContent); } },
            size: { type: 'string|object', value: { width: 900, height: 600 }, isValid: function(p)
                {
                    var val = p.size;
                    p.size = (val && typeof val == 'string') ? 
                        (function()
                        {
                            var s = val.split(new RegExp([' ', '-', '\\*', ':', 'x'].join('|'))),
                            w = parseInt(s[0]), h = parseInt(s[1]);
                            return isInteger(w) && isInteger(h) ? { width: w, height: h } : null;
                        })() : 
                        (val && typeof val == 'object' && isInteger(val.width) && isInteger(val.height)) ? 
                            val : 
                        parameters.size.value;
                
                    if (Debug.enabled)
                        Debug.test('"Layer": size is defined.').expect(p.size).toBeDefined();
                    
                    return !!(p.size);
                }
            }
        },
        jQueryRequired = function()
        {
            console.log('jQuery required');
        };
        
        var Content = function(id, param)
        {
            return new Content.fn.init(id, param);
        };
        Content.fn = Content.prototype =
        {
            _fn: null,
            _tpl: '',
            _cache: {},
            _data: {},
            _target: null,
            id: '',
            length: 0,
            displayed: false,
            init: function(cid, param)
            {
                this.id = param._containerId+'_'+cid;
                var id = this.id, css = {
                        position: 'relative'/*,
                        width: param.size.width.toString()+'px',
                        height: param.size.height.toString()+'px'*/
                    };
                try
                {
                    $('#'+param._containerId).append('<div id="'+id+'" />').find('#'+id).css(css).addClass('content '+cid).hide();
                }
                catch(e)
                {
                    jQueryRequired();
                }
                return this;
            },
            set: function(attr, val)
            {
                var prev = $('#'+this.id).attr(attr);
                $('#'+this.id).attr(attr, prev + val);
                return this;
            },
            hide: function(callback)
            {
                // template
                if (this._tpl && typeof this._tpl == 'object')
                    for (var module in this._tpl)
                    {
                        var template = this._tpl[module];
                        if (template instanceof Content)
                            template.hide();
                    }
                $('#'+this.id).hide();
                this.displayed = false;
                $(this).trigger('hidden');
                if (typeof callback == 'function') callback.apply(this, [this.id]);
                else if (this._fn !== null && typeof this._fn.hide == 'function') this._fn.hide.apply(this, [this.id]);
                return this;
            },
            show: function(callback)
            {
                // template
                if (this._tpl && typeof this._tpl == 'object')
                    for (var module in this._tpl)
                    {
                        var template = this._tpl[module];
                        if (template instanceof Content)
                            template.show();
                    }
                $('#'+this.id).show();
                this.displayed = true;
                $(this).trigger('shown');
                if (typeof callback == 'function') callback.apply(this, [this.id]);
                else if (this._fn !== null && typeof this._fn.show == 'function') this._fn.show.apply(this, [this.id]);
                return this;
            },
            template: function(tpl)
            {
                this._tpl = tpl;
                return this;
            },
            reset: function()
            {
                if (this._tpl && typeof this._tpl == 'object')
                    for (var module in this._tpl)
                    {
;                       var template = this._tpl[module];
                        if (template instanceof Content)
                            template.reset();
                    }
                this._data = {};
                this._cache = {};
                this.length = 0;
                $('#'+this.id).html('');
                return this;
            },
            data: function(input, target)
            {
                this._target = target || 'data';
                // template check target
                if (this._tpl && typeof this._tpl == 'object')
                    for (var module in this._tpl)
                    {
;                       var template = this._tpl[module];
                        if (module === this._target && template instanceof Content)
                        {
                            template.data(input, this._target);
                            return this;
                        }
                    }
                
                var dt = {}, getKeys = function(e, label, data)
                {
                    if (typeof e == 'object')
                    {
                        for (var i in e)
                            getKeys(e[i], label+(label.length ? '.' : '')+i, data);
                    }
                    else
                        data.cols[label] = e;
                };
                if (!input) var input = '{}';
                try
                {
                    if (typeof input == 'object') input = JSON.stringify(input);
                    dt = JSON.parse(input);
                }
                catch(e){ dt = {}; }
                
                this.length = 0;
                for (var i in dt)
                {
                    this._data[i] = { id: i, cols: {} };
                    if (!dt[i]) this._data[i] = null;//data displayed must be removed
                    else getKeys(dt[i], '', this._data[i]);
                    this.length++;
                }
                this._data._layerFormatted = true;
                return this;
            },
            print: function(template, norep)
            {var that = this;
                var render = function(tpl, selector)
                {
                    if (norep) $(selector).append(tpl);
                    else $(selector).html(tpl);
                };
                if (template) this._tpl = template;
                if (typeof this._tpl == 'string')
                {
                    render(this._tpl, '#'+this.id);
                    return this;
                }
                if (!this._tpl || typeof this._tpl != 'object'){ console.log('bad template'); return this;} // error
                
                for (var module in this._tpl)
                {console.log(module+' from '+this.id);
                    var template = this._tpl[module];
                    if (template instanceof Content)
                    {
                        template.print();
                    }
                    else if (module !== this._target)
                    {
                        if (this._cache[module] !== template)
                            render(template, '#'+this.id);
                        this._cache[module] = template;
                    }
                    else if (module === this._target && this.length)
                    {
                        // check cache
                        if (!this._cache[module]) this._cache[module] = {};
                        for (var i in this._data)
                        {
                            if (i === '_layerFormatted') continue;
                            if (!this._data[i])
                            {
                                if (this._cache[module][i]) this._cache[module][i] = null;
                                continue;
                            }
                            if (!this._cache[module][i]) this._cache[module][i] = { update: true, html: '', data: {} };
                            this._cache[module][i].update = false;
                            var tpl = template;
                            for (var j in this._data[i].cols)
                            {
                                tpl = tpl.replace(new RegExp('{{' + j + '}}', 'gi'), this._data[i].cols[j]);
                                if (!this._cache[module][i].data[j] || this._cache[module][i].data[j] !== this._data[i].cols[j])
                                    this._cache[module][i].update = true;
                                this._cache[module][i].data[j] = this._data[i].cols[j];
                            }
                            this._data[i] = 0; // clear data
                            this._cache[module][i].html = tpl;
                        }
                        // display html
                        var prev;
                        for (var i in this._cache[module])
                        {
                            var cid = this.id+'_'+i, inDom = $('#'+cid);
                            if (!this._cache[module][i]) 
                                inDom.remove(); // remove related dom element
                            else
                            {
                                if (this._cache[module][i].update)
                                {
                                    if (inDom.length)
                                        inDom.html(this._cache[module][i].html);
                                    else
                                    {
                                        var html = '<div id="'+cid+'" data-rows>'+this._cache[module][i].html+'</div>';
                                        if (prev && prev.length)
                                            prev.after(html);
                                        else
                                            $('#'+this.id).append(html);
                                    }
                                    this._cache[module][i].update = false;
                                }
                                prev = inDom;
                            }
                        }
                        // clear displayed data (kept in cache)
                        this._data = [];
                        this.length = 0;
                    }
                }
                return this;
            },
            define: function(fn)
            {
                this._fn = typeof fn == 'object' && (typeof fn.show == 'function' || typeof fn.hide == 'function') ? fn : null;
                return this;
            }
        };
        Content.fn.init.prototype = Content.fn;
        
        var Layer = function(param)
        {
            var nb;
            
            this._param = {};
            if (!param || typeof param != 'object')
                var param = {};
            
            for (var i in parameters)
            {
                var p = parameters[i];
                this._param[i] = (typeof param[i]).match(p.type) && p.isValid(param) ? param[i] : p.value;
            }
            this._param.id = uniqId();
            
            if (this._param.scalable)
            {
                this._param._tile = this._param.tile;
                var h = $(window).height(), w = $(window).width();

                if (this._param.size.height > h)
                {
                    this._param.size.width = Math.round(this._param.size.width * h / this._param.size.height);
                    this._param.size.height = h;
                }
                if (this._param.size.width > w)
                {
                    this._param.size.height = Math.round(this._param.size.height * w / this._param.size.width);
                    this._param.size.width = h;
                }

                nb = 0;
                while (nb * this._param.tile < this._param.size.width)
                    nb++;
                this._param.size.width = nb * this._param.tile;

                nb = 0;
                while (nb * this._param.tile < this._param.size.height)
                    nb++;
                this._param.size.height = nb * this._param.tile;
            }
            var id = this._param.id, css = (function(that)
                {
                    return {
                        position: 'relative'/*,
                        width: that._param.size.width.toString()+'px',
                        height: that._param.size.height.toString()+'px'*/
                    };
                })(this);
            try
            {
                $(this._param.context).append('<div id="'+id+'" />').find('#'+id).addClass('layer').css(css);
            }
            catch(e)
            {
                jQueryRequired();
            }
        };
        Layer.prototype = 
        {
            _cns: {},
            infos: function()
            {
                return this._param;
            },
            content: function(id, param)
            {
                if (!this._cns[id])
                {
                    if (!param) var param = this._param;
                    param._containerId = this._param.id;
                    this._cns[id] = Content(id, param);
                    var show = (function(cns, sid)
                    {
                        return function()
                        {
                            console.log('show '+sid);
                            if (param.switchContent)
                                for(var i in cns)
                                {
                                    if (cns[i].displayed && i !== sid) 
                                        cns[i].hide();
                                }
                        };
                    })(this._cns, id),
                    hide = (function(sid)
                    {
                        return function(){console.log('hide '+sid);};
                    })(id);
                    $(this._cns[id])
                        .on('shown', show)
                        .on('hidden', hide);
                }
                return this._cns[id];
            }
        };
        return Layer;
    };
    
    try
    {
        define(Linit);
    }
    catch(e)
    {
        window.Layer = Linit();
    }
})();
