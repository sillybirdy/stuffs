/* 
 * test version 0.15.9
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
            require(['domReady!', 'app/debug', 'app/yell', 'app/layer', 'app/pong'], function(doc, Debug, Yell, Layer) 
            {
                // new test
                var g = new Layer({ name: 'Test' }), incr = 0;
                
                //data test
                g.content('increment')
                .template({
                    count: '<h1>Nombre de recherche(s) {{count}}</h1>'
                })
                .data({ row1: { count: incr } }, 'count');
        
                g.content('form')
                .template({
                    form: '<form><input type="text" name="search" /><input type="submit" value="OK" /></form>',
                    count: g.content('increment'),
                    list: g.content('datas')
                }).define({show: function(sc)
                    {
                        $('#'+sc+' form').submit(function()
                        {console.log('get search result');
                            g.content('datas')
                            .reset().data({ 
                                row1: { title: 'résultat 1 de recherche', txt: 'texte bidon after change', infos: { desc: 'ezr', num: 1} },
                                row2: { title: 'deuxième titre', txt: 'texte 2 after change', infos: { desc: 'ezr', num: 8} }
                            }, 'list').print();
                            
                            g.content('increment')
                            .data({ 
                                row1: { count: (++incr) } 
                            }, 'count').print();
                            return false; 
                        });
                    }});
                
                g.content('datas')
                .template({
                    list: '<h1>{{title}}</h1><p>{{txt}}</p><p>{{infos.desc}} {{infos.num}}</p>'
                })
                .data({ 
                    row1: { title: 'premier titre avant changement', txt: 'texte bidon', infos: { desc: 'ezr', num: -1} },
                    row2: { title: 'dfgdf gd', txt: 'tyuyuiuioipiopyutyytrtrtezr zerzer zr zer', infos: { desc: 'ezr', num: 0} },
                    row3: { title: 'hfg hfg fhg ', txt: 'sdfsdf sf sfsf sfsf', infos: { desc: 'ezr', num: 1} },
                    row4: { title: 'ertert', txt: 'gfhfghfghfhfg hfhfhf hf hfhf hfhfh', infos: { desc: 'ezr', num: 2} },
                    row5: { title: 'azezerert', txt: 'gfdg fdg fdgdf gdgdf gdfgggdgd gfdfgdfgdfgdgdfgdgdg', infos: { desc: 'ezr', num: 3} }
                }, 'list');
                
                g.content('form').print().show();
                
                setTimeout(function()
                {console.log('1st change from list');
                    g.content('datas')
                    .data({ 
                        row1: { title: 'premier titre', txt: 'texte bidon', infos: { desc: 'ezr', num: -1} },
                        row2: { title: '222222', txt: 'change', infos: { desc: 'ezr', num: 222} },
                        row3: { title: '3e titree', txt: 'texte bidon after change', infos: { desc: 'ezr', num: 3} }
                    }, 'list').print();
                }, 2000);
                setTimeout(function()
                {console.log('2nd change from list');
                    g.content('datas')
                    .data({ 
                        row2: null
                    }, 'list').print();
                }, 4000);
                setTimeout(function()
                {console.log('change from parent layer');
                    g.content('form')
                    .data({ 
                        row1: { title: 'premier titre qui change', txt: 'texte bidon after change', infos: { desc: 'ezr', num: 1} },
                        row2: { title: 'deuxième titre', txt: 'texte 2 after change', infos: { desc: 'ezr', num: 8} }
                    }, 'list').print();
                }, 6000);
                
                // --------------------------------
                // 
                // new Game
                var game = new Layer({ name: 'Pong', size: '960*540', switchContent: true });
                
                // define Main Screen
                game.content('main').set('style', 'background: #0ff; color: #000')
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
                                            g.content('menu').show();
                                        }).log();}
                                } 
                            }
                        ]);
                    }})

                // define Menu Screen
                game.content('menu').set('style', 'background: #ff0; color: #000')
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
                                g.content('main').show();
                            }
                            else if (k == 13)
                            {
                                Yell(document.body).off(evt);
                                g.content(nextScreen[num]).show();
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
                    }});

                // define Options Screen
                game.content('options').set('style', 'background: #f0f; color: #000')
                .print('<h1 style="text-align: center">Hello World</h1><p>Options</p>')
                .define({
                    show: function(sc)
                        {
                            Yell(document.body).on('keyup').hook(function(k)
                            {
                                return !!(k == 27);//escape
                            }).act(function(elem, evt, k) {
                                Yell(document.body).off(evt);
                                g.content('menu').show();
                            });
                        }
                    });

                // define Credits Screen
                game.content('credits').set('style', 'background: #000; color: #fff')
                .print('<h1 style="text-align: center">Hello World</h1><p>Credits</p>')
                .define({
                    show: function(sc)
                        {
                            Yell(document.body).on('keyup').hook(function(k)
                            {
                                return !!(k == 27);//escape
                            }).act(function(elem, evt, k) {
                                Yell(document.body).off(evt);
                                g.content('menu').show();
                            });
                        }
                    });

                // define Game Screen
                game.content('game').set('style', 'background: #000; color: #fff')
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
