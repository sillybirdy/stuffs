/* 
 * Pong test version 0.15.6
 */
requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: '../'
    }
});

requirejs(['domReady!', 'yell'], function(doc, Yell) {
    // key event test
    Yell(document.body).on('keyup').hook(function(k)
    {
        if (k == 88)
            return true;
    }).act(function(elem, evt, k) {
        console.log(k+': '+String.fromCharCode(k));
    }).log();
    
    // mouse event test
    Yell(document).on('mousemove').act(function(elem, evt, m) {
        console.log('mouse: '+m.x+' ; '+m.y);
        if (m.x > 300 && m.y > 100)
            Yell(document).off('mousemove');
    }).log();
});


