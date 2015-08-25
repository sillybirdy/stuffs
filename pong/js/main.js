/* 
 * Pong test version 0.15.6
 */
(function(container)
{
    require.config({
        baseUrl: 'js/lib',
        paths: {
            jquery: 'jquery-1.11.3.min',
            app: '../app'
        }
    });

    require(['jquery'], function($)
    {
        container['jQuery'] = container['$'] = $;

        require(['velocity', 'velocity.ui'], function(Velocity)
        {
            require(['domReady!', 'app/debug', 'app/yell', 'app/game', 'app/pong'], function(doc, Debug, Yell, Game) 
            {
                // new Game
                var g = new Game({ name: 'Pong', size: '960*540' });

                // define Main Screen
                g.screen('main').set('style', 'background: #0ff; color: #000')
                .print('<h1 style="text-align: center">Hello World</h1><p style="text-align: center">Press "Enter"</p>')
                .define({
                    show: function(sc)
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
                                            Yell(document.body).off(evt);
                                            g.screen('menu').show();
                                        }).log();}
                                } 
                            }
                        ]);
                    }})

                // define Menu Screen
                g.screen('menu').set('style', 'background: #ff0; color: #000')
                .print('<h1 style="text-align: center">Hello World</h1><p style="text-align: center">Use "Up" and "Down" arrows to select mode<br />and press "Enter".</p><ul style="text-align: center; list-style: none;"><li data-screen-name="game">ln 1</li><li data-screen-name="options">ln 2</li><li data-screen-name="credits">ln 3</li></ul>')
                .define({ 
                    show: function(sc)
                    {
                        var lis = $('#'+sc).find('ul li'),
                            len = lis.length -1, num = 0,
                            nextScreen = ['game', 'options', 'credits'];

                        if (!$('#'+sc).find('ul li.selected').length)
                            lis.eq(num).addClass('selected');

                        Yell(document.body).on('keyup').hook(function(k)
                        {
                            return !!(k.toString().match(/13|27|38|40/));//enter|escape|up|down
                        }).act(function(elem, evt, k) {
                            if (k == 27)
                            {   Yell(document.body).off(evt);
                                g.screen('main').show();
                            }
                            else if (k == 13)
                            {
                                Yell(document.body).off(evt);
                                g.screen(nextScreen[num]).show();
                            }
                            else
                            {
                                if (k == 38)
                                {
                                    num--;
                                    if (num < 0) num = len;
                                }
                                else if(k == 40)
                                {
                                    num++;
                                    if (num > len) num = 0;
                                }
                                lis.removeClass('selected').eq(num).addClass('selected');
                            }
                        }).log();
                    }}).show();

                // define Options Screen
                g.screen('options').set('style', 'background: #f0f; color: #000')
                .print('<h1 style="text-align: center">Hello World</h1><p>Options</p>')
                .define({
                    show: function(sc)
                        {
                            Yell(document.body).on('keyup').hook(function(k)
                            {
                                return !!(k == 27);//escape
                            }).act(function(elem, evt, k) {
                                Yell(document.body).off(evt);
                                g.screen('menu').show();
                            });
                        }
                    });

                // define Credits Screen
                g.screen('credits').set('style', 'background: #000; color: #fff')
                .print('<h1 style="text-align: center">Hello World</h1><p>Credits</p>')
                .define({
                    show: function(sc)
                        {
                            Yell(document.body).on('keyup').hook(function(k)
                            {
                                return !!(k == 27);//escape
                            }).act(function(elem, evt, k) {
                                Yell(document.body).off(evt);
                                g.screen('menu').show();
                            });
                        }
                    });

                // define Game Screen
                g.screen('game').set('style', 'background: #000; color: #fff')
                .define({
                    show: function(sc){ showTime('#'+sc, g); },
                    hide: function(sc){ holdOn('#'+sc, g); }
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
})(this);
