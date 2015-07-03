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
            return new Date().getTime() + String.fromCharCode(n) + k;
        },
        isInteger = function(val)
        {
            return !!((val - parseInt(val) + 1) > 0);
        },
        parameters = 
        { 
            context: { type: 'object', value: document.body, isValid: function(obj){ return !!(obj.nodeType && (obj.nodeType == 1 || obj.nodeType == 9)); } },
            name: { type: 'string', value: 'Game Undefined', isValid: function(){ return true; } }, 
            size: { type: 'string|object', value: { width: 900, height: 600 }, isValid: function(val)
                {
                    var size = val ? 
                    typeof val == 'string' ? 
                        (function()
                        {
                            var s = val.split(new RegExp([' ', '-', '\\*', ':', 'x'].join('|'))),
                            w = parseInt(s[0]), h = parseInt(s[1]);
                            return isInteger(w) && isInteger(h) ? { width: w, height: h } : null;
                        })() : 
                        (typeof val == 'object' && isInteger(val.width) && isInteger(val.height)) ? 
                            val : 
                        null :
                    parameters.size.value;
                    if (size === null) console.log('Game: size is undefined');
                    return size;
                }
            }
        };
        
        var Screen = function(param)
        {
            return this.fn.init(param);
        };
        Screen.fn = Screen.prototype =
        {
            init: function(param)
            {
                
            },
            print: function(str)
            {
                
            }
        };
        Screen.fn.init = Screen.prototype;
        
        var Game = function(param)
        {
            this._param = {};
            if (!param || typeof param != 'object')
                var param = {};
            
            for (var i in parameters)
            {
                var p = parameters[i];
                this._param[i] = (typeof param[i]).match(p.type) && p.isValid(param[i]) ? param[i] : p.value;
            }
            this._param.id = uniqId();
            
            var frame = document.createElement('div');
            frame.id = this._param.id;
            frame.style.width = this._param.size.width;
            frame.style.height = this._param.size.height;
            frame.style.background = '#000';
            this._param.context.appendChild(frame);
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
                    this._screens[id] = new Screen(this._param);
                
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
        window.GameScreen = Ginit();
    }
})();
