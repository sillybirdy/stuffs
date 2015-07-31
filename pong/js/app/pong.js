/* 
 * 
 */

(function(container)
{
    var TILE = 32;
    
    // Server side game code
    var Get = function(r)
    {
        return new Get.fn.init(r);
    };
    Get.fn = Get.prototype =
    {
        _a: null,
        init: function(a)
        {
            if (this._a === null)
                this._a = a;
            return this;
        },
        width: function(){ return TILE * 3; },
        height: function(){ return TILE; },
        size: function()
        {
            this._a._r.css({ width: this.width(), height: this.height() });
            return this;
        },
        stageFirstPos: function(g)
        {
            this._a._r.css({ left: Math.round((g.infos().offset.width - this.width())) / 2, bottom: TILE });
            return this;
        },
        event: function(d)
        {
            if (d == 'left')
                this._a._r.css({ left: parseInt(this._a._r[0].style.left) - TILE });
            else if (d == 'right')
                this._a._r.css({ left: parseInt(this._a._r[0].style.left) + TILE });
            //console.log(this._a._r.offset().left);
            return this;
        }
    };
    Get.fn.init.prototype = Get.fn;
    
    // User racket
    var Raket = function(selector)
    {
        this._c = $(selector);
        this._c.append('<div data-ui="raket" style="position: absolute; background: #fff;" />');
        this._r = this._c.find('[data-ui=raket]');
        this.set = Get(this);
    };
    
    require(['app/yell'], function(Yell)
    {
        var raket = null;
        
        // Game event handler
        var eventHandler = 
        {
            _n: null,
            _i: {},
            start: function(id, fn)
            {
                var idtvl = this._i;
                if (id && !this._i[id])
                    this._i[id] = fn;

                if (this._n !== null) return;
                this._n = setInterval(function()
                {
                    for (var i in idtvl)
                        idtvl[i].call();
                }, 100);
            },
            stop: function(id)
            {
                if (id && this._i[id])
                {
                    this._i[id] = 0;
                    delete this._i[id];
                }
                else if (!id)
                {
                    clearInterval(this._n);
                    this._n = null;
                }
            }
        };
        
        // Start game
        var showTime = container['showTime'] = function(selector, g)
        {
            if (raket === null) // init
            {
                raket = new Raket(selector);
                raket.set.size().stageFirstPos(g);
            }
            eventHandler.start();
            Yell(document.body).on('keyup').hook(function(k)
            {
                return !!(k.toString().match(/13|27|32|37|38|39|40/));//enter|escape|space|left|up|right|down
            }).act(function(elem, evt, k) {
                if (k == 27)
                {   
                    g.screen('menu').show();
                }
                else if (k == 13)
                {
                    
                }
                else
                {
                    eventHandler.stop('key_'+k);
                }
            });
            Yell(document.body).on('keydown').hook(function(k)
            {
                return !!(k.toString().match(/32|37|38|39|40/));//space|left|up|right|down
            }).act(function(elem, evt, k) {
                var keyRef = { '37': 'left', '38': 'up', '39': 'right', '40': 'down' };
                eventHandler.start('key_'+k, function(){ raket.set.event(keyRef[k]); });
            });
        };
        
        // Pause game
        var holdOn = container['holdOn'] = function(selector)
        {
            Yell(document.body).off();
            eventHandler.stop();
        };
    });
})(this);
