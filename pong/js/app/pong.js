/* 
 * 
 */

(function(container)
{
    var TILE = 32, DURATION = 100;
    
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
            this._a._r.css({ left: Math.round((g.infos().size.width - this.width())) / 2, bottom: TILE });
            return this;
        },
        event: function(d)
        {
            if (d == 'left')
                this._a._r.css({ left: parseInt(this._a._r[0].style.left) - TILE });
            else if (d == 'right')
                this._a._r.css({ left: parseInt(this._a._r[0].style.left) + TILE });
            //console.log(this._a._r.size().left);
            return this;
        }
    };
    Get.fn.init.prototype = Get.fn;
    
    var prefix = (function () {
        var styles = window.getComputedStyle(document.documentElement, ''),
            pre = (Array.prototype.slice
                .call(styles)
                .join('')
                .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
                )[1],
            dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
        return {
            dom: dom,
            lowercase: pre,
            css: '-' + pre + '-',
            js: pre[0].toUpperCase() + pre.substr(1)
        };
    })();
    
    var transform = prefix.css+'transform';
    
    // User racket
    var Raket = function(selector)
    {
        this._c = $(selector);
        this._c.append('<div data-ui="raket" style="position: absolute; background: #fff;" />');
        this._r = this._c.find('[data-ui=raket]');
        this.set = Get(this);
        this.animate = function(anim)
        {
            this._r.velocity('stop', true);
            if (anim)
                this._r.velocity(anim, { duration: DURATION });
        };
    };
    
    require(['app/yell'], function(Yell)
    {
        var raket = null, keyIsDown = { 13: 0, 27: 0, 32: 0, 37: 0, 38: 0, 39: 0, 40: 0 };
        
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
                }, DURATION);
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
                keyIsDown[k] = 0;
                
                if (k == 27)
                {   
                    g.screen('menu').show();
                }
                else if (k == 13)
                {
                    
                }
                else
                {
                    var nbKeysDown = 0;
                    for(var i in keyIsDown) nbKeysDown += keyIsDown[i];
                    
                    eventHandler.stop('key_'+k);
                    
                    if (!nbKeysDown) raket.animate({ translateZ: 0, translateX: 0, rotateZ: 0});
                }
            });
            Yell(document.body).on('keydown').hook(function(k)
            {
                return !!(k.toString().match(/32|37|38|39|40/));//space|left|up|right|down
            }).act(function(elem, evt, k) {
                if (keyIsDown[k]) return;
            
                keyIsDown[k] = 1;
                
                var keyRef = { '37': 'left', '38': 'up', '39': 'right', '40': 'down' },
                    animRef = { '37': { translateZ: 0, translateX: 0, rotateZ: "-15deg"}, 
                                '39': { translateZ: 0, translateX: 0, rotateZ: "15deg"} 
                        };
                eventHandler.start('key_'+k, function(){ raket.set.event(keyRef[k]); });
                
                raket.animate(animRef[k]);
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
