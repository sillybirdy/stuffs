/* 
 * Timeline
 */

// timeObject:  { date: { from: 01/01/2015 00:00:00, to: 31/12/2015 23:59:59 }, infos: {} }

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
for (var i = 0; i < 1000; i++)
    data.push({ date: { from: formatDate(randomDate(new Date(1907, 0, 1), new Date())) } });

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
    if (diff > 100) return 10;
    if (diff > 50) return 5;
    return 1;
})();
var begin = (function()
{
    var begin = 0;
    while (begin < range.min)
        begin += scale;
    return begin - scale;
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

var frag = document.createDocumentFragment(), j = 0, d = [0], l = 0;

for (var i = begin; i < end; i++)
{
    if (i >= begin + (scale * (l + 1)))
    {
        var ts = document.createElement('span');
        ts.innerHTML = begin + (scale * l) + ' ('+(d[l])+')';
        ts.style.display = 'inline-block';
        ts.style.width = w + '%';
        tr.appendChild(ts);
        
        d.push(0);
        l = d.length -1;
    }
    if (!timel[i]) continue;
    j++;
    
    d[l] += timel[i].length;
    
    var tt = document.createElement('span');
    tt.style.position = 'absolute';
    tt.style.top = (20 * j)+'px';
    tt.style.left = (Math.round((i - begin) * (range.max * 100 / end) / (end - begin))) + '%';
    tt.innerHTML = i+' ('+timel[i].length+')';
    tt.style.background = '#ccc';
    frag.appendChild(tt);
}
var dd = document.createElement('div');
dd.style.position = 'relative';
dd.style.width = '100%';
dd.appendChild(frag);

document.body.appendChild(tr);
document.body.appendChild(dd);

console.log(j);
