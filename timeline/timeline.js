/* 
 * Timeline
 */

// timeObject:  { date: { from: 01/01/2015 00:00:00, to: 31/12/2015 23:59:59 }, infos: {} }

function randomBg()
{
    return '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6);
}
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

// init dates / get data

var data = [], range = { min: 9000, max: 0 }, timel = {};
for (var i = 0; i < 10000; i++)
    data.push({ date: { from: formatDate(randomDate(new Date(1917, 0, 1), new Date())) } });

for (var i = 0, l = data.length; i < l; i++)
{
    var dt = data[i].date.from.split('/');
    range.min = Math.min(range.min, dt[2]);
    range.max = Math.max(range.max, dt[2]);
    if (!timel[dt[2]]) timel[dt[2]] = [];
    timel[dt[2]].push(dt);
}

// define scale for timeline

var scale = (function()
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
})();
var begin = (function()
{
    var begin = 0;
    while (begin < range.min)
        begin += scale;
    return begin - (scale == 1 ? 0 : scale);
})();
var end = (function()
{
    var end = 0;
    while (end < range.max)
        end += scale;
    return end + scale;
})();
var steps = (end - begin) / scale;

var j = 0, w = scale * 100 / (end - begin);
var tr = document.createElement('div');

// display dates

function addElem(cc)
{
    var tt = document.createElement('span');
    tt.style.position = 'absolute';
    //tt.style.top = (20 * j)+'px';
    tt.style.left = cc[0].pos + '%';
    tt.innerHTML = '&nbsp;';
    tt.style.width = Math.max(1, (100/scale))+'%';
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
var frag = document.createDocumentFragment(), j = 0, d = [0], l = 0;
var cache = {}, pos;

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
        ts.style.textAlign = 'center';
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

document.body.appendChild(tr);
document.body.appendChild(dd);

console.log(j);
