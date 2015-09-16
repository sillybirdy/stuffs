/* 
 * Timeline
 */

// timeObject:  { date: { from: 01/01/2015 00:00:00, to: 31/12/2015 23:59:59 }, infos: {} }

(function()
{
    var _uuid = 0,
    Timeline = function(context)
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
        mousePos: {},
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
            else
            {
                if (range.min < this.range.min)
                    range.min = this.range.min;
                if (range.max > this.range.max)
                    range.max = this.range.max;
            }
            this.scale = {};
            this.scale.unit = this.defineUnit(range);
            this.scale.begin = this.defineDateBegin(range);
            this.scale.end = this.defineDateEnd(range);
            this.scale.steps = (this.scale.end - this.scale.begin) / this.scale.unit;
            
            if (!this.range.focus) this.range.focus = 0; // year 0 doesn't exist
            if (!this.range.month) this.range.month = 14;
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
                this.data.push({ date: { from: formatDate(randomDate(new Date(1817, 0, 1), new Date())) } });
            
            this.parseDates();
        },
        getYearPos: function()
        {
            var focus = Math.round(this.mousePos.x * 100 / parseInt(this.context.offsetWidth)),
                year = Math.round(focus * (this.range.end - this.range.begin) / 100) + this.range.begin,
                mid = Math.round((this.range.min + this.range.max) / 2);
            /*while (!this.cache[focus] && focus)
                focus--;
            return focus ? this.cache[focus][0].year : 0;*/
            return focus;// + (focus < 50 ? year - mid : mid - year);
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
            if (!this.context.id) this.context.id = 'timeline_'+(++_uuid);
            this.context.style.position = 'relative';
            this.context.style.height = '100px';
            this.context.style.overflow = 'hidden';
            
            (function(that)
            {
                var u = 0, endZoomIn, endZoomOut, range = {};
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
                        
                        var min = that.range.min, max = that.range.max, mid = Math.round((max + min) / 2), diff = { min: 0, max: 0 };
                        //if (that.range.focus)
                        //    diff = { min: that.range.focus - mid, max: 0 };
                        
                        // re-center date range
                        min += diff.min;
                        max += diff.max;
                        
                        range = { min: min + u, max: max - u };
                        
                        if (range.min <= that.range.min && range.max >= that.range.max) 
                            endZoomOut = true;
                        
                        if (range.min < that.range.min) range.min = that.range.min;
                        if (range.max > that.range.max) range.max = that.range.max;
                    }
                    
                    if (range.min == range.max && that.range.month <= 12)
                    {
                        endZoomIn = true;
                        that.range.month += 1;
                        if (that.range.month == 12) 
                            endZoomOut = false;
                    }
                    that.setScale(range);
                    that.display();

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
                        
                        var min = that.range.min, max = that.range.max, mid = Math.round((max + min) / 2), diff = { min: 0, max: 0 };
                        
                        if (that.range.focus)
                        {
                            var dm = Math.round(u * that.range.focus / 100);
                            diff = { min: dm, max: 100 - dm };
                        }
                        // re-center date range
                        min += diff.min;
                        max += diff.max;
                        try{console.log('*** '+that.range.focus+'; '+u);
                        console.log(that.range.focus+' - '+mid+' = '+diff); }catch(e){}
                        console.log(min+', '+max);
                        range = { min: min + u, max: max - u };
                        console.log(range);
                        if (range.min >= range.max) 
                        {
                            range.min = range.max;
                            that.range.month = 13;
                            endZoomIn = true;
                        }
                    }
                    
                    if (range.min == range.max)
                    {
                        if (that.range.month < 13) endZoomOut = true;
                        if (that.range.month > 1) that.range.month -= 1;
                    }

                    that.setScale(range);
                    that.display();
                    //}
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
                else if (that.context.attachEvent)// really?
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

            var eventDoc, doc, body;

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
            that.mousePos = { x: event.pageX, y: event.pageY };
            that.range.focus = that.getYearPos();
            
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
            this.displayYear();
            this.displayDays();
        },
        displayYear: function()
        {
            this.context.innerHTML = '';
            function randomBg()
            {
                return '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6);
            }
            var id = this.context.id;
            // display dates

            function addElem(cc)
            {
                var tt = document.createElement('span');
                tt.id = id+'_year_'+cc[0].year;
                tt.style.position = 'absolute';
                //tt.style.top = (20 * j)+'px';
                tt.style.left = cc[0].pos + '%';
                tt.innerHTML = '&nbsp;';
                tt.style.width = Math.max(1, (100/scale))+'%';
                tt.style.height = '40px';
                tt.style.background = randomBg();
                tt.onmouseover = function()
                {
                    var ll = document.createElement('div');
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
            var cache = this.cache = {}, timel = this.timel, rpos, ppos, cpos;

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
                rpos = (i - begin) * 100 / (end - begin);
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
                    ppos = cpos;
                    cache[cpos].push({ pos: rpos, year: i, length: timel[i].length });
                    j++;
                }
                if (i == end && cache[ppos].length)
                    frag.appendChild(addElem(cache[ppos]));
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
        },
        displayDays: function()
        {
            if (this.scale.begin !== this.scale.end - 1) return;
            var from = 0;//@todo
            var tr = document.getElementById(this.context.id+'_year_'+this.scale.begin);
            for (var i = 1 + from, j = 0; i <= this.range.month + from; i++)
            {
                var ts = document.createElement('div');
                ts.innerHTML = i;
                ts.style.position = 'absolute';
                //ts.style.top = '0px';
                ts.style.left = (100 / this.range.month) * j + '%';
                ts.style.width = (100 / this.range.month) + '%';
                ts.style.background = '#ccc';
                ts.style.border = '1px solid #111';
                ts.style.margin = '0 -1px';
                //ts.style.textAlign = 'center';
                tr.appendChild(ts);
                j++;
            }
        }
    };
    
    var TL = new Timeline();
    TL.display();
})();
