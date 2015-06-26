/*
 * Yell function v. 0.15.6
 * 
 * Yell(DOMelement).on('event').act(function) for a mouse/key event
 * Yell(DOMelement).on('event').hook(function).act(function) for a specific mouse/key event
 * 
 */

define(function ()
{
    var uuid = 0,
        undefined,
        YELL = 'Yell',
        MOUSE_EVENT = 1,
        KEY_EVENT = 2,
        AUTH_EVENTS = '|click|dblclick|mousedown|mouseup|mouseenter|mouseleave|mousewheel|mouseover|mousemove|mouseout|keydown|keypress|keyup|';

    var preventEvent = function (e)
    {
        if (!e)
            var e = window.event;
        if (e.preventDefault)
            e.preventDefault();

        e.returnValue = false;
        //e.stopPropagation();
        return e;
    },
    addEvent = (function ()
    {
        var fn = null;
        var isEventListener = window.addEventListener || document.addEventListener;
        var isAttachEvent = window.attachEvent || document.attachEvent;

        if (isEventListener)
        {
            fn = function addEvent(element, event, callback, useCapture)
            {
                element.addEventListener(event, callback, (useCapture ? true : false));
            };
        }
        else if (isAttachEvent)
        {
            fn = function addEvent(element, event, callback)
            {
                element.attachEvent('on' + event, callback);
            };
        }
        else
        {
            fn = function addEvent(element, event, callback)
            {
                if (typeof element['on' + event] == 'function')
                {
                    var oldfn = element['on' + event];
                    element['on' + event] = function ()
                    {
                        oldfn();
                        callback();
                    }
                }
                else
                    element['on' + event] = callback;
            };
        }
        var addEvent = null;
        return fn;
    })(),
    removeEvent = (function ()
    {
        var fn = null;
        var isEventListener = window.removeEventListener || document.removeEventListener;
        var isDetachEvent = window.detachEvent || document.detachEvent;

        if (isEventListener)
        {
            fn = function removeEvent(element, event, callback, useCapture)
            {
                element.removeEventListener(event, callback, (useCapture ? true : false));
            };
        }
        else if (isDetachEvent)
        {
            fn = function removeEvent(element, event, callback)
            {
                element.detachEvent('on' + event, callback);
            };
        }
        else
        {
            fn = function removeEvent(element, event, callback)
            {
                element['on' + event] = null;
            };
        }
        var removeEvent = null;
        return fn;
    })();

    var Yell = window[YELL] = function (elem, evt)
    {
        return new Yell.fn.init(elem, evt);
    };
    
    Yell.fn = Yell.prototype =
    {
        errs: [],
        init: function(elem, evt)
        {
            this.id = ++uuid;
            this.errs = [];
            this.DOMelement = elem && elem.nodeType && (elem.nodeType == 1 || elem.nodeType == 9) ? elem : null;
            if (this.DOMelement === null) this.errs.push('Yell'+this.id+': no DOM element');
            return evt ? this.on(evt) : this;
        },
        on: function(evt)
        {
            if (AUTH_EVENTS.indexOf('|' + evt + '|') != -1)
                    return this.listen(evt);
            this.errs.push('Yell'+this.id+': no valid event '+evt);
            return this;
        },
        listen: function (evt)
        {
            this.event = evt;
            this.type = evt.indexOf('mouse') != -1 ? MOUSE_EVENT : KEY_EVENT;
            this.pattern = null;
            return this;
        },
        hook: function (pattern)
        {
            this.pattern = typeof pattern == 'function' ? pattern : null;
            if (this.pattern === null) this.errs.push('Yell'+this.id+': no valid hook');
            return this;
        },
        act: function (callback)
        {
            if (typeof callback == 'function')
            {
                var id = this.id,
                    evt = this.event;
                var that = this,
                    fn = function (e)
                    {
                        var e = preventEvent(e);
                        var a = that.type == KEY_EVENT ? e.keyCode : {x: e.clientX || e.pageX, y: e.clientY || e.pageY};
                        if (that.pattern === null || !!(that.pattern(a)))
                            callback.apply(that.DOMelement, [that.DOMelement, evt, a]);
                    };
                if (this.DOMelement !== null)
                    addEvent(this.DOMelement, evt, fn);
            }
            else
                this.errs.push('Yell'+this.id+': no callback function');
            return this;
        },
        log: function()
        {
            var e = this.errs;
            while (e.length)
            {
                console.log(e.shift());
            }
            return this;
        }
    };
    Yell.fn.init.prototype = Yell.fn;

    return Yell;
});