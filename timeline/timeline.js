/* 
 * Timeline
 */

// timeObject:  { date: { from: 01/01/2015 00:00:00, to: 31/12/2015 23:59:59 }, infos: {} }

(function()
{
    var Timeline = function(context)
    {
        this.init(context);
    };
    Timeline.prototype = 
    {
        context: null,
        data: [],
        range: { min: 9000, max: 0 }, 
        timel: {},
        cache: {},
        scale: {},
        defineUnit: function(range)
        {
            var diff = range.max - range.min;
            if (diff > 5000000000) return 500000000;
            if (diff > 1000000000) return 100000000;
            if (diff > 500000000) return 50000000;
            if (diff > 100000000) return 10000000;
            if (diff > 50000000) return 5000000;
            if (diff > 10000000) return 1000000;
            if (diff > 5000000) return 500000;
            if (diff > 1000000) return 100000;
            if (diff > 500000) return 50000;
            if (diff > 100000) return 10000;
            if (diff > 50000) return 5000;
            if (diff > 10000) return 1000;
            if (diff > 5000) return 500;
            if (diff > 1000) return 100;
            if (diff > 500) return 50;
            if (diff > 100) return 20;
            if (diff > 50) return 10;
            if (diff > 20) return 5;
            if (diff > 10) return 2;
            return 1;
        },
        defineDateBegin: function(range)
        {
            var begin = 0;
            while (begin < range.min)
                begin += this.scale.unit;
            return begin - (this.scale.unit == 1 ? 0 : this.scale.unit);
        },
        defineDateEnd: function(range)
        {
            var end = 0;
            while (end < range.max)
                end += this.scale.unit;
            return end + (this.scale.unit <= 2 ? this.scale.unit : 0);
        },
        setScale: function(range)
        {
            if (!range) var range = this.range;
            this.scale = {};
            this.range.focus = 0;
            this.scale.unit = this.defineUnit(range);
            this.scale.begin = this.defineDateBegin(range);
            this.scale.end = this.defineDateEnd(range);
            this.scale.steps = (this.scale.end - this.scale.begin) / this.scale.unit;
        },
        getDates: function()
        {
            //@mock get dates from db
            function randomDate(start, end) {
                return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
            }
            function formatDate(date) {
                var d = new Date(date),
                    month = '' + (d.getMonth() + 1),
                    day = '' + d.getDate(),
                    year = d.getFullYear();

                if (month.length < 2) month = '0' + month;
                if (day.length < 2) day = '0' + day;

                return [day, month, year].join('/');
            }
            for (var i = 0; i < 10000; i++)
                this.data.push({ date: { from: formatDate(randomDate(new Date(1802, 0, 1), new Date())) } });
            
            this.parseDates();
        },
        parseDates: function()
        {
            for (var i = 0, l = this.data.length; i < l; i++)
            {
                var dt = this.data[i].date.from.split('/');
                this.range.min = Math.min(this.range.min, dt[2]);
                this.range.max = Math.max(this.range.max, dt[2]);
                if (!this.timel[dt[2]]) this.timel[dt[2]] = [];
                this.timel[dt[2]].push(dt);
            }
            // define scale for timeline
            this.setScale();
        },
        init: function(context)
        {
            this.context = document.createElement('div');
            this.context.style.position = 'relative';
            
            (function(that)
            {
                var u = 0, endZoomIn, endZoomOut;
                var btn1 = document.createElement('input');
                btn1.type = 'button';
                btn1.id = 'down';
                btn1.value = '[ - ]';
                btn1.onclick = function()
                {
                    endZoomIn = false;
                    if (!endZoomOut)
                    {
                        u -= that.scale.unit;

                        var range = (that.range.focus && that.cache[that.range.focus] && that.cache[that.range.focus][0]) ?
                            { min: Math.round((that.cache[that.range.focus][0].year + that.range.min) / 2), max: that.range.max - u } :
                            { min: that.range.min + u, max: that.range.max - u };
                        
                        if (range.min <= that.range.min && range.max >= that.range.max) 
                            endZoomOut = true;
                        
                        if (range.min < that.range.min) range.min = that.range.min;
                        if (range.max > that.range.max) range.max = that.range.max;
                        
                        that.setScale(range);
                        that.display();
                    }
                    return false;
                };
                var btn2 = document.createElement('input');
                btn2.id = 'up';
                btn2.type = 'button';
                btn2.value = '[ + ]';
                btn2.onclick = function()
                {
                    endZoomOut = false;
                    if (!endZoomIn)
                    {
                        u += that.scale.unit;
                        
                        var range = (that.range.focus && that.cache[that.range.focus] && that.cache[that.range.focus][0]) ?
                            { min: Math.round((that.cache[that.range.focus][0].year + that.range.min) / 2), max: that.range.max - u } :
                            { min: that.range.min + u, max: that.range.max - u };
                        
                        if (range.min >= range.max) 
                        {
                            range.min = range.max;
                            endZoomIn = true;
                        }
                        that.setScale(range);
                        that.display();
                    }
                    return false;
                };
                document.body.appendChild(btn1);
                document.body.appendChild(btn2);
                
                if (that.context.addEventListener) 
                {    
                   that.context.addEventListener ("mousewheel", function(e)
                   {
                       that.zoom(e, that);
                   }, false);
                   that.context.addEventListener ("DOMMouseScroll", function(e)
                   {
                       that.zoom(e, that);
                   }, false);
                }
                else if (that.context.attachEvent)
                    this.context.attachEvent ("onmousewheel", function(e)
                    {
                         that.zoom(e, that);
                    });
                
            })(this);
            
            document.body.appendChild(this.context);
            
            this.getDates();
        },
        zoom: function(event, that)
        {
            if (!event) var event = window.event;
            
            var dot, eventDoc, doc, body, pageX, pageY;

            if (event.pageX == null && event.clientX != null)
            {
                eventDoc = (event.target && event.target.ownerDocument) || document;
                doc = eventDoc.documentElement;
                body = eventDoc.body;
                event.pageX = event.clientX +
                (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                (doc && doc.clientLeft || body && body.clientLeft || 0);
                event.pageY = event.clientY +
                (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
                (doc && doc.clientTop  || body && body.clientTop  || 0 );
            }
            var mousePos = { x: event.pageX, y: event.pageY };
            
            that.range.focus = Math.round(mousePos.x * 100 / parseInt(that.context.offsetWidth));
            while (!that.cache[that.range.focus] && that.range.focus)
                that.range.focus--;
            
            var rolled = 0;
            if ('wheelDelta' in event)
                rolled = event.wheelDelta;
            else
                rolled = -40 * event.detail;
            
            if (rolled < 0) document.getElementById('down').click();
            else if (rolled > 0) document.getElementById('up').click();
        },
        display: function()
        {
            if (this.range.min < this.range.max)
                this.displayYear();
            else
                console.log('month');
        },
        displayYear: function()
        {
            this.context.innerHTML = '';
            function randomBg()
            {
                return '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6);
            }

            // display dates

            function addElem(cc)
            {
                var tt = document.createElement('span');
                tt.style.position = 'absolute';
                //tt.style.top = (20 * j)+'px';
                tt.style.left = cc[0].pos + '%';
                tt.innerHTML = '&nbsp;';
                tt.style.width = Math.max(1, (100/scale))+'%';
                tt.style.height = '40px';
                tt.style.background = randomBg();
                tt.onmouseover = function()
                {
                    ll = document.createElement('div');
                    ll.innerHTML = (function(e)
                    {
                        var content = '';
                        for (var l in e)
                            content += '<p>'+e[l].year+' ('+e[l].length+')</p>';
                        return content;
                    })(cc);
                    tt.appendChild(ll);
                };
                tt.onmouseout = function()
                {
                    tt.innerHTML = '&nbsp;';
                };
                return tt;
            }
            var scale = this.scale.unit, end = this.scale.end, begin = this.scale.begin;
            var j = 0, w = scale * 100 / (end - begin);
            var tr = document.createElement('div');
            var frag = document.createDocumentFragment(), j = 0, d = [0], l = 0;
            var cache = this.cache = {}, timel = this.timel, pos;

            for (var i = begin; i <= end; i++)
            {
                if (i >= begin + (scale * (l + 1)))
                {//console.log(begin + (scale * (l + 1)));
                    var ts = document.createElement('span');
                    ts.innerHTML = begin + (scale * l);// + (d[l] ? ' ('+(d[l])+')' : '');
                    ts.style.display = 'inline-block';
                    ts.style.width = w + '%';
                    ts.style.background = '#ccc';
                    ts.style.border = '1px solid #fff';
                    ts.style.margin = '0 -1px';
                    //ts.style.textAlign = 'center';
                    tr.appendChild(ts);

                    d.push(0);
                    l = d.length -1;
                }
                var rpos = (i - begin) * 100 / (end - begin),
                    ppos = Math.ceil((i - 1 - begin) * 100 / (end - begin)),
                    cpos = Math.ceil(rpos);
                if (timel[i])
                {
                    d[l] += timel[i].length;

                    if (!cache[cpos]) 
                    {
                        cache[cpos] = [];
                        if (cache[ppos] && cache[ppos].length)
                            frag.appendChild(addElem(cache[ppos]));
                    }
                    cache[cpos].push({ pos: rpos, year: i, length: timel[i].length });
                    pos = cpos;
                    j++;
                }
                if (i == end && cache[pos].length)
                    frag.appendChild(addElem(cache[pos]));
            }
            var dd = document.createElement('div');
            dd.style.position = 'relative';
            dd.style.width = '100%';
            dd.appendChild(frag);
            
            this.context.appendChild(tr);
            this.context.appendChild(dd);
            
            var clear = document.createElement('div');
            clear.innerHTML = '&nbsp;';
            clear.style.height = '200px;';
            this.context.appendChild(clear);
            //console.log(j);
        }
    };
    
    var TL = new Timeline();
    TL.display();
})();
