/* 
 * Pong test version 0.15.6
 */
require.config({
    baseUrl: 'js/lib',
    paths: {
        jquery: 'jquery-1.11.3.min',
        app: '../app'
    }
});

require(['jquery'], function($)
{
    window.jQuery = window.$ = $;
    
    require(['velocity', 'velocity.ui'], function(Velocity)
    {
        require(['domReady!', 'app/yell', 'app/game'], function(doc, Yell, Game) 
        {
            // test game
            var g = new Game({ name: 'Pong', offset: '960*540' });
            console.log(g.infos());
            g.screen('menu').print('Hello');

            // key event test
            Yell(document.body).on('keyup').hook(function(k)
            {
                console.log(k+': '+String.fromCharCode(k));
                if (k == 88)
                    return true;
            }).act(function(elem, evt, k) {
                 Yell(document.body).off('keyup');
            }).log();

            // mouse event test
            Yell(document).on('mousemove').act(function(elem, evt, m) {
                console.log('mouse: '+m.x+' ; '+m.y);
                if (m.x > 300 && m.y > 100)
                    Yell(document).off('mousemove');
            }).log();
        });
    });
});
