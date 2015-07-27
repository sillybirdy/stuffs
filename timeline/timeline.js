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

var data = [], range = { min: 9000, max: 0 }, timel = {};
for (var i = 0; i < 1000; i++)
    data.push({ date: { from: formatDate(randomDate(new Date(1200, 0, 1), new Date())) } });

for (var i = 0, l = data.length; i < l; i++)
{
    var dt = data[i].date.from.split('/');
    range.min = Math.min(range.min, dt[2]);
    range.max = Math.max(range.max, dt[2]);
    if (!timel[dt[2]]) timel[dt[2]] = [];
    timel[dt[2]].push(dt);
}

var frag = document.createDocumentFragment(), j = 0;
for (var i = range.min; i <= range.max; i++)
{
    if (!timel[i]) continue;
    j++;
    var tt = document.createElement('span');
    tt.style.position = 'absolute';
    tt.style.top = (20 * j)+'px';
    tt.style.left = (Math.round((i - range.min) * 90 / (range.max - range.min))) + '%';
    tt.innerHTML = i+' ('+timel[i].length+')';
    tt.style.background = '#ccc';
    frag.appendChild(tt);
}
var dd = document.createElement('div');
dd.style.position = 'relative';
dd.style.width = '100%';
dd.appendChild(frag);
document.body.appendChild(dd);
console.log(j);
