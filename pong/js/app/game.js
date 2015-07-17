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
            id: '',
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
                    $('#'+param.id).append('<div id="'+id+'" />').find('#'+id).css(css);
                }
                catch(e)
                {
                    jQueryRequired();
                }
            },
            get: function()
            {
                return $('#'+this.id)[0];
            },
            hide: function()
            {
                $('#'+this.id).hide();
            },
            show: function()
            {
                $('#'+this.id).show();
            },
            print: function(str)
            {
                $('#'+this.id).innerHTML = str;
            }
        };
        Screen.fn.init.prototype = Screen.fn;
        
        var Game = function(param)
        {
            this._param = {};
            if (!param || typeof param != 'object')
                var param = {};
            
            for (var i in parameters)
            {
                var p = parameters[i];
                this._param[i] = (typeof param[i]).match(p.type) && p.isValid(param) ? param[i] : p.value;
            }
            this._param.id = uniqId();
            
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
                    this._screens[id] = Screen(id, this._param);
                
                for(var i in this._screens)
                {
                    if (i === id) this._screens[i].show();
                    else this._screens[i].hide();
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
