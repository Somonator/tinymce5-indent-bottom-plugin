tinymce.PluginManager.add('indent_bottom', function (editor, url) {
    function change_indent_bottom(method, val) {
        tinymce.activeEditor.undoManager.transact(function () {
            tinymce.activeEditor.focus();
            tinymce.activeEditor.formatter[method]('indent_bottom', {value: val}, null, true);
            tinymce.activeEditor.nodeChanged();
        });
    }

    function get_current_value() {
        return new Promise(function (resolve, reject) {
            tinymce.activeEditor.dom.getParents(tinymce.activeEditor.selection.getStart(), function (elm) {
                resolve(elm.style.marginBottom.slice(0, -2));
            });
        })
    }

    async function open_enter_window() {
        editor.windowManager.open({
            title: 'Insert the number',
            body: {
                type: 'panel',
                items: [
                    {
                        label: 'In px',                        
                        type: 'input',
                        name: 'indent'
                    }
                ],
            },
            initialData: {
                indent: await get_current_value()
            },            
            buttons: [
                {
                    type: 'submit',
                    text: 'Ok',
                    primary: true
                }
            ],
            onSubmit: function (api) {
                let data = api.getData();
                
                change_indent_bottom('apply', data.indent + 'px');

                api.close();
            }
        });

        let modal = document.querySelector('.tox-dialog');

        modal.style.width = '250px';
        modal.querySelector('input').setAttribute('type', 'number');
    }

    editor.ui.registry.addMenuButton('indent_bottom', {
        text: 'Indent bottom',
        tooltip: 'unique_indent_bottom_selector29', // уникальное значение title="", для js костыля
        fetch: function (callback) {
            let items = [5, 10, 15, 20, 30, 40, 50, 'enter', 'clear'].map(function (val) {
                let item = {};

                item.type = 'menuitem';
    
                if (typeof val === 'number') {
                    item.text = val + 'px';
                    item.onAction = function () {
                        change_indent_bottom('apply', val + 'px');
                        return false;
                    };
                }
    
                if (val === 'enter') {
                    item.text = 'Your number';
                    item.onAction = function () {
                        open_enter_window();
                        return false;
                    };
                }
    
                if (val === 'clear') {
                    item.text = 'Remove indent';
                    item.onAction = function () {
                        change_indent_bottom('remove', null);
                        return false;
                    };
                }
    
                return item;
            });
    
            callback(items);
        },
        onSetup: function (api) {
            let button_el = document.querySelector('[title="unique_indent_bottom_selector29"]'),
                button_text = button_el.querySelector('span').innerHTML;

            button_el.removeAttribute('title');
            button_el.removeAttribute('aria-label');
            
            editor.on('NodeChange', async function (e) {
                let val = await get_current_value(),
                    new_button_text = button_text + (val ? ' (' + val + 'px)' : '');

                button_el.querySelector('span').innerHTML = new_button_text;
            });
        }
    });

    editor.on('init', function (e) {
        tinymce.get(editor.id).formatter.register('indent_bottom', {
            selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img',
            styles: {
                marginBottom: '%value'
            },
            remove_similar: true   
        });
    });


    return {
        getMetadata: function () {
            return {
                name: 'Indent bottom'
            };
        }
    };
});