(function()
{
    var Debug = window.Debug =
            {
                enabled: false,
                test: function (msg) {
                    return new Debug.test.fn.init(msg);
                }
            };

    Debug.test.fn =
            {
                expression: null,
                message: null,
                init: function (msg)
                {
                    this.message = msg || '';
                    return this;
                },
                expect: function (expr)
                {
                    this.expression = expr;
                    return this;
                },
                toBe: function (result)
                {
                    var error = !!(this.expression !== result);
                    this.print(this.message + (error ? '==> ###Failed###' : '==> ***Succeed***'), (error ? 'error' : 'success'));

                },
                toBeDefined: function ()
                {
                    var error = !!(typeof this.expression == 'undefined');
                    this.print(this.message + (error ? '==> ###Failed###' : '==> ***Succeed***'), (error ? 'error' : 'success'));

                },
                toBeTypeOf: function (type)
                {
                    var error = !!(typeof this.expression !== type);
                    this.print(this.message + (error ? '==> ###Failed###' : '==> ***Succeed***'), (error ? 'error' : 'success'));

                },
                print: function (msg, status)
                {
                    var color = status || "Black", bgc = "White";
                    switch (color) {
                        case "success":
                            color = "Black";
                            bgc = "LimeGreen";
                            break;
                        case "info":
                            color = "Black";
                            bgc = "Turquoise";
                            break;
                        case "error":
                            color = "Black";
                            bgc = "Red";
                            break;
                        case "warning":
                            color = "Black";
                            bgc = "Tomato";
                            break;
                        default:
                            color = color;
                    }
                    try
                    {
                        console.log('%c' + msg || this.message, 'color:' + color + '; font-weight: normal; background-color: ' + bgc + ';');
                    }
                    catch (e)
                    {
                        console.log('Test ' + e.message);
                    }
                }
            };
    Debug.test.fn.init.prototype = Debug.test.fn;
    
    try
    {
        define(Debug);
    }
    catch(e)
    {
        Debug.test().print('RequireJS not found.', 'info');
    }
})();