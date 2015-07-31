/* 
 * Screen
 */

(function()
{
    var Ginit = function()
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
            name: { type: 'string', value: 'Game Undefined', isValid: function(p){ return true; } }, 
            tile: { type: 'number', value: 32, isValid: function(p){ return !!(isInteger(p.tile)); } },
            offset: { type: 'string|object', value: { width: 900, height: 600 }, isValid: function(p)
                {
                    var val = p.offset;
                    p.offset = (val && typeof val == 'string') ? 
                        (function()
                        {
                            var s = val.split(new RegExp([' ', '-', '\\*', ':', 'x'].join('|'))),
                            w = parseInt(s[0]), h = parseInt(s[1]);
                            return isInteger(w) && isInteger(h) ? { width: w, height: h } : null;
                        })() : 
                        (val && typeof val == 'object' && isInteger(val.width) && isInteger(val.height)) ? 
                            val : 
                        parameters.offset.value;
                    if (p.offset === null) console.log('Game: offset is undefined');
                    return !!(p.offset);
                }
            }
        },
        jQueryRequired = function()
        {
            console.log('jQuery required');
        };
        
        var Screen = function(id, param)
        {
            return new Screen.fn.init(id, param);
        };
        Screen.fn = Screen.prototype =
        {
            _fn: null,
            id: '',
            displayed: false,
            init: function(id, param)
            {
                this.id = param.id+'_'+id;
                var id = this.id, css = {
                        position: 'absolute',
                        top: '0px',
                        left: '0px',
                        width: param.offset.width.toString()+'px',
                        height: param.offset.height.toString()+'px'
                    };
                try
                {
                    $('#'+param.id).append('<div id="'+id+'" />').find('#'+id).css(css).hide();
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
                $('#'+this.id).hide();
                this.displayed = false;
                $(this).trigger('hidden');
                if (typeof callback == 'function') callback.apply(this, [this.id]);
                else if (this._fn !== null && typeof this._fn.hide == 'function') this._fn.hide.apply(this, [this.id]);
                return this;
            },
            show: function(callback)
            {
                $('#'+this.id).show();
                this.displayed = true;
                $(this).trigger('shown');
                if (typeof callback == 'function') callback.apply(this, [this.id]);
                else if (this._fn !== null && typeof this._fn.show == 'function') this._fn.show.apply(this, [this.id]);
                return this;
            },
            print: function(str, norep)
            {
                if (norep) $('#'+this.id).append(str);
                else $('#'+this.id).html(str);
                return this;
            },
            define: function(fn)
            {
                this._fn = typeof fn == 'object' && (typeof fn.show == 'function' || typeof fn.hide == 'function') ? fn : null;
                return this;
            }
        };
        Screen.fn.init.prototype = Screen.fn;
        
        var Game = function(param)
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
            
            var h = $(window).height() - this._param.tile, w = $(window).width() - this._param.tile;
            
            if (this._param.offset.height > h)
            {
                this._param.offset.width = Math.round(this._param.offset.width * h / this._param.offset.height);
                this._param.offset.height = h;
            }
            if (this._param.offset.width > w)
            {
                this._param.offset.height = Math.round(this._param.offset.height * w / this._param.offset.width);
                this._param.offset.width = h;
            }
            
            nb = 0;
            while (nb * this._param.tile < this._param.offset.width)
                nb++;
            this._param.offset.width = nb * this._param.tile;
            
            nb = 0;
            while (nb * this._param.tile < this._param.offset.height)
                nb++;
            this._param.offset.height = nb * this._param.tile;
            
            var id = this._param.id, css = (function(that)
                {
                    return {
                        position: 'relative',
                        width: that._param.offset.width.toString()+'px',
                        height: that._param.offset.height.toString()+'px',
                        overflow: 'hidden',
                        background: '#000'
                    };
                })(this);
            try
            {
                $(this._param.context).append('<div id="'+id+'" />').find('#'+id).css(css);
            }
            catch(e)
            {
                jQueryRequired();
            }
        };
        Game.prototype = 
        {
            _screens: {},
            infos: function()
            {
                return this._param;
            },
            screen: function(id)
            {
                if (!this._screens[id])
                {
                    this._screens[id] = Screen(id, this._param);
                    var show = (function(screens, sid)
                    {
                        return function()
                        {
                            console.log('show '+sid);
                            for(var i in screens)
                            {
                                if (screens[i].displayed && i !== sid) 
                                    screens[i].hide();
                            }
                        };
                    })(this._screens, id),
                    hide = (function(sid)
                    {
                        return function(){console.log('hide '+sid);};
                    })(id);
                    $(this._screens[id])
                        .on('shown', show)
                        .on('hidden', hide);
                }
                return this._screens[id];
            }
        };
        return Game;
    };
    
    try
    {
        define(Ginit);
    }
    catch(e)
    {
        window.Game = Ginit();
    }
})();
