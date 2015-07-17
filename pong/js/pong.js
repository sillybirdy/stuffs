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
            // new game
            var g = new Game({ name: 'Pong', offset: '960*540' });
            
            g.screen('main').set('style', 'background: #0ff; color: #000')
            .print('<h1 style="text-align: center">Hello World</h1><p style="text-align: center">Press "Enter"</p>')
            .define(function(sc)
            {
                $.Velocity.RunSequence([
                    { e: $('#'+sc).find('h1'), p: { paddingTop: '200px' }, o: {
                            duration: 2000,
                            begin: function(){ 
                                $('#'+sc).find('h1').css({ padding: '100% 0 0' }); 
                                $('#'+sc).find('p').css({ opacity: '0' }); 
                            }
                        } 
                    },
                    { e: $('#'+sc).find('p'), p: { opacity: '1' }, o: {
                            delay: 400,
                            duration: 500,
                            complete: function(){ 
                                Yell(document.body).on('keyup').hook(function(k)
                                {
                                    return !!(k == 13);//enter
                                }).act(function(elem, evt, k) {
                                    Yell(document.body).off('keyup');
                                    g.screen('menu').show();
                                }).log();}
                        } 
                    }
                ]);
            }).show();
    
            g.screen('menu').set('style', 'background: #ff0; color: #000')
            .print('<h1 style="text-align: center">Select Mode</h1>')
            .define(function(sc)
            {
                Yell(document.body).on('keyup').hook(function(k)
                {
                    return !!(k == 27);//escape
                }).act(function(elem, evt, k) {
                    Yell(document.body).off('keyup');
                    g.screen('main').show();
                }).log();
            });
            /*
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
            }).log();*/
        });
    });
});
