// app这个名称不要随便修改，下面的代码里面，有些函数什么的是通过：app.  来调用的
var app = new Vue({
    el: '#app',
    mounted() {

        // 设置各面板尺寸
        this.changeSize()

        // 获取数据库列表
        this.get_database_list()

        // 窗口改变大小的时候，要运行的代码
        window.onresize = () => {
            this.changeSize()
        }

        // 禁止分组列表和文件列表的右键菜单
        document.getElementById("left_side_group").oncontextmenu = function () {
            return false;
        };
        document.getElementById("left_side_file").oncontextmenu = function () {
            return false;
        };

        // 获取分组数据
        try {
            this.get_group_list_from_bd()
        } catch (err) {
            alert("读取分组列表错误。:" + err)
        }

        // --un：需要用shelve保存上次打开的文件以及其所属分组，或者直接保存到数据库也行。
        // 不然的话，只能读取特定的文件，而且如果文件删除了的话，会出错。
        // 调用python函数读取数据库中的css、html、js
        this.readCurrentFile('default02', 'File-kr74YBw5szHjiTdGES554SeDCEze8DkA')

        // 初始化编辑器
        this.init_editor()

    },

    data: {
        // 数据库列表
        database_list: [],

        // 当前选择的分组
        current_group_id: 0,
        current_group_name: '',
        current_file_id: 0,
        current_file_name: '',

        // 分组列表 - 使用
        group_list: [],

        // 当前选择的分组的文件列表
        current_file_list: [],
        // 排序面板 - 当前选择的文件
        sort_file_list_current_index: 0,

        // 当前选择的分组
        currentGroup: 1232,

        // html,css,js
        css_content: 'css',
        js_content: 'js',
        html_content: 'html',
        // iframe_src: './current_source/display.html',
        iframe_src: 'about:blank',

        // 代码编辑框的内容
        js_content_html: '',
        html_content_html: '',
        css_content_html: '',

        // 面板css-start
        right_side_style: {
            width: '500px',
            height: '100vh',
            border: '0px',
            // position:'relative'
        },

        // 代码编辑框的模式设置
        code_box_setting: {
            codeBox_them: "forneo",
            // codeBox_them: "shadowfox",
            keyMap_type: "vim"
        },
        left_side_group_style: {
            width: '160px',
            // height: '100px',
            display: '',
            // borderRight: '1px solid rgb(88, 88, 88)',
        },
        left_side_file_style: {
            width: '160px',
            height: '100px'
        },
        top_side_style: {
            width: '100vw',
            height: '30px',
            backgroundColor: '#333333',
            // backgroundColor: '#333333',
            color: 'rgb(150,150,150)',
            textAlign: "left",
            margin: '0px',
            overFlow: 'hidden'
        },
        // 编辑器容器
        editor_style: {
            height: this.editor_height,
            // height:'95%',
            // height: this.editor_height
        },

        // 编辑器容器
        full_html_style: {
            width: '100%',
            height: '100%'
            // height: this.editor_height
        },

        // 编辑器顶栏
        editor_top_panel_style: {
            height: '25px',
            lineHeight: '25px',
            // height:'5%',
            // minHeight:"25px",
        },
        full_html_top_panel_style: {
            height: '25px',
            lineHeight: '25px',
            display: ''
            // height:'5%',
            // minHeight:"25px",
        },
        // bottom_side_style: {
        //     width: '100vw',
        //     height: '30px',
        //     backgroundColor: '#333333',
        //     color: 'rgb(150,150,150)',
        //     textAlign: "left",
        //     margin: '0px',
        //     overFlow: 'hidden'
        // },
        app_style: {
            margin: '0px',
            height: '100vh',
            // overFlow:'hidden'
        },
        temp_height: 0,
        // 面板css-end
        file_context_menu_style: {
            position: 'fixed',
            width: '100px',
            height: '200px',
            color: '#eee',
            top: '30px',
            left: '30px',
            zIndex: 100000,
            // backgroundColor: 'rgb(26,179,125,.8)',
        },
        group_context_menu_style: {
            position: 'fixed',
            width: '100px',
            color: '#eee',
            top: '30px',
            left: '30px',
            zIndex: 100000,
            // border:"1px solid #eee"
        },
        fold_group_list_style: {
            width: '20px',
            height: '20px',
            lineHeight: '20px',
            position: ' fixed',
            left: '0px',
            bottom: '0px',
            color: '#EBEBEB',
            backgroundColor: '#1AB37D',
            // backgroundColor: 'rgb(235,235,235,.5)',
            // border: '1px solid #333',
            border: '0px',
            // transform: 'rotate(90deg)',
            /* background-color: #1AB37D; */
            zIndex: ' 1000000',
            cursor: 'pointer',
            textAlign: 'center',
        },
        fold_file_list_style: {
            width: '20px',
            height: '20px',
            lineHeight: '20px',
            position: ' fixed',
            left: '0px',
            bottom: '23px',
            color: '#EBEBEB',
            backgroundColor: '#1AB37D',
            // backgroundColor: 'rgb(235,235,235,.5)',
            border: '0px',
            // border: '1px solid #333',
            // border: '#333',
            // transform: 'rotate(90deg)',
            /* background-color: #1AB37D; */
            zIndex: ' 1000000',
            cursor: 'pointer',
            textAlign: 'center',
        },
        isshow_file_contextMenu: false,
        isshow_group_contextMenu: false,

        // 鼠标下的文件id、文件名称、索引组id、： 给文件列表的右键菜单函数调用
        current_file_id_for_context_menu: '',
        current_file_name_for_context_menu: '',
        current_file_index_for_context_menu: '',
        current_group_id_for_file_context_menu: '',

        // 鼠标下的分组id： 给分组列表的右键菜单函数调用
        current_group_id_for_context_menu: '',
        current_group_name_for_context_menu: '',
        current_group_index_for_context_menu: '',

        // 底栏(状态栏)的html
        bottom_side_html: '底栏的信息',
        // 底栏的sytle
        bottom_side_style: {
            position: 'fixed',
            bottom: '0px',
            left: '20px',
            color: '#333',
            backgroundColor: '#eee',
            // color:'#eee',
            // backgroundColor:'#1AB37D',
            zIndex: 100000,
            display: 'none',
        },

        // 顶栏菜单 样式
        top_side_sub_menu_style: {
            position: 'fixed',
            top: '30px',
            left: '0px',
            // color:"red",
            // backgroundColor: '#EBEBEB',
            backgroundColor: '#333333',
            // color: 'rgb(150,150,150)',
            width: '150px',
            zIndex: 1000000,
            display: 'none',
            border: '1px solid #666',
        },
        // 当前使用的菜单
        current_top_side_menu: 'file',
        // 当前使用的子菜单，当顶栏菜单被点击的时候会改变，然后会更新计算属性里面的 commend_list
        current_use_commend_list: [],
        // 顶栏菜单的子选项
        file_menu_commend_list: [{
                name: '新建数据库',
                commend: async function () {
                    let database_name = prompt("请输入数据库的名称：")
                    // 数据数据库名为 空 或者 用户取消操作，就不再运行后面的代码
                    if (database_name == "") {
                        alert("数据库名称不能为空。")
                        app.file_menu_commend_list[0].commend()
                    } else if (database_name == null) {
                        return
                    }
                    // 
                    let is_susess = await eel.pyFun_creat_database(database_name)()
                    console.log(is_susess)
                    if (is_susess == true) {
                        app.show_message_in_bottom_side(`数据库[${database_name}]创建成功。`)
                    } else if (is_susess == 'exist') {
                        alert("数据库已经存在！")
                        app.file_menu_commend_list[0].commend()
                    } else {
                        alert('数据库创建失败。')
                    }
                    // eel.pyFun_open_file_explorer('/neo_web/user_data')()
                }
            }, {
                name: '打开资源文件夹',
                commend: function () {
                    eel.pyFun_open_file_explorer('/neo_web/data/user_data')()
                }
            },
            {
                name: '打开数据库文件夹',
                commend: function () {
                    eel.pyFun_open_file_explorer('/neo_web/data/databases')()
                }
            },
            {
                name: '打开自动备份文件夹',
                commend: function () {
                    eel.pyFun_open_file_explorer('/neo_web/data/databases/auto_backups')()
                }
            },
            {
                name: '打开用户备份文件夹',
                commend: function () {
                    eel.pyFun_open_file_explorer('/neo_web/data/databases/user_backups')()
                }
            },
            {
                name: '备份当前数据库',
                commend: async function () {
                    // 备份数据库
                    await eel.pyFun_backup_database(app.selected_database, 'user_backups')
                    app.show_message_in_bottom_side(`数据库<span style="font-weight:bold;color:red;">${app.selected_database}</span>已备份。`)
                }
            },

            // {
            //     name: '删除当前数据库',
            //     commend: async function () {
            //         let confirm_delete = confirm(`是否真的要删除数据库：[ ${app.selected_database} ]?`)
            //         if (confirm_delete == true) {
            //             // 删除数据库
            //             await eel.pyFun_delete_database(app.selected_database)
            //         } else {
            //             app.show_message_in_bottom_side("取消删除数据库操作。")
            //         }
            //         // app.show_message_in_bottom_side(`数据库<span style="font-weight:bold;color:red;">${app.selected_database}</span>已备份。`)
            //     }
            // },
        ],
        edit_menu_commend_list: [{
                name: 'Vim模式 √',
                is_vim: true,
                commend: function () {
                    if (this.is_vim == true) {
                        this.name = 'Vim模式'
                        window.js_editor.setOption("keyMap", "default")
                        window.html_editor.setOption("keyMap", "default")
                        window.css_editor.setOption("keyMap", "default")
                        this.is_vim = false
                    } else {
                        this.name = 'Vim模式 √'
                        window.js_editor.setOption("keyMap", "vim")
                        window.html_editor.setOption("keyMap", "vim")
                        window.css_editor.setOption("keyMap", "vim")
                        this.is_vim = true
                    }
                }
            },
            {
                name: 'HTML 代码格式化',
                commend: function () {
                    window.format_code(window.html_editor)

                    // 保存文件
                    app.writeDisplayFile('html')
                }
            },
            {
                name: 'JS 代码格式化',
                commend: function () {
                    window.format_code(window.js_editor)

                    // 保存文件
                    app.writeDisplayFile('js')
                }
            },
            {
                name: 'CSS 代码格式化',
                commend: function () {
                    window.format_code(window.css_editor)

                    // 保存文件
                    app.writeDisplayFile('css')
                }
            },
        ],
        model_menu_commend_list: [{
            name: 'Vue 基础模板',
            commend: function () {
                let html_content = '<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>\n<div id="app">' +
                    '\n  <p @click="test()">{{message}}</p>\n  <span>{{computed_test}}</span>\n</div>'
                app.html_menu_insert(html_content, true)

                let js_content = 'var app = new Vue({\n  el:"#app",\n  data:{\n    message:"Vue 模板",\n  },\n  ' +
                    'methods:{\n    test:function(){\n      alert("Hello world!")\n    },\n  },\n  computed:{\n    computed_test:function(){\n      return "计算属性" \n    },\n  },\n})'
                app.js_menu_insert(js_content, true)
            }
        }, ],
        library_menu_commend_list: [{
            name: 'Vue 最新版',
            commend: function () {
                app.html_menu_insert('<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>')
            }
        }, {
            name: 'Vue 2.6.12',
            commend: function () {
                app.html_menu_insert('<script src="https://cdn.jsdelivr.net/npm/vue@2.6.12"></script>')
            }
        }, {
            name: 'Jquery 2.1.4',
            commend: function () {
                app.html_menu_insert('<script src="https://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js"></script>')
            }
        }, {
            name: 'Bootstrap 3.3.7',
            commend: function () {
                html_content = '<!-- 新 Bootstrap 核心 CSS 文件 -->\n' +
                    '<link href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">\n' +
                    '<!-- jQuery文件。务必在bootstrap.min.js 之前引入 -->\n' +
                    '<script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>\n' +
                    '<!-- 最新的 Bootstrap 核心 JavaScript 文件 -->\n' +
                    '<script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>'
                app.html_menu_insert(html_content)
            }
        }, {
            name: '搜索其他库...',
            commend: function () {
                // alert(123)
                app.search_library_panel_style.display = '';
                // this.selected_library = 'hint_text'
            }
        }, ],

        help_menu_commend_list: [{
            name: '软件文档',
            commend: function () {

                alert("待完善")
            }
        }, ],
        // 当前选择的分组
        current_choose_group: 0555,
        // 当前选择的文件
        current_choose_file: 0,
        // 临时保存当前选择的文件index，点击分组的时候用
        temp_current_choose_file: 0,

        right_side_right_down_class: 'right_side_right_down_class_normal',
        is_fold_group_list: false,
        is_fold_file_list: false,

        // 当前选择的数据库
        selected_database: "",

        group_search_box_value: "",
        file_search_box_value: "",

        // 自动运行代码
        auto_run_code: ['auto_run'],
        // auto_run_code: true,
        // 文件排序面板的与鼠标位置的差值
        sort_file_list_x: 0,
        sort_file_list_y: 0,
        sort_file_list_can_move: false,
        sort_file_style: {
            display: 'none',
        },

        // 是否处于“所有文件”状态下
        is_all_file_mode: false,
        // “所有文件”按钮样式
        left_all_file_style: {
            color: "#555",
            backgroundColor: '#eee',

        },
        all_file_button_text: "所有文件",

        // 当前文件的文件信息，给“文件信息”按钮调用
        current_file_info: [],
        // 文件信息面板样式
        show_file_info_panel_style: {
            display: 'none',
        },
        // 当前选择的库
        selected_library: "hint_text",
        // 是否启用vim模式
        active_vim_mode: true,
        active_rulers: false,

        // 标尺线(80个字符) - 2
        rulers_80: [{
            color: "#383838",
            column: 80,
            lineStyle: "dashed"
        }],

        // 搜索库面板的样式(主要是用来显示隐藏和显示
        search_library_panel_style: {
            // display: ''
            display: 'none'
        },
        online_library_list: [],
        library_name: '',
        online_library_list: [],
        is_show_library_table: false,

        // 右边四个面板的样式
        right_side_right_up_style: {
            zIndex: 10,
            display: "",
            height: '50%',
        },
        right_side_right_down_style: {
            zIndex: 11,
            display: "",
            height: '50%',
        },
        right_side_left_up_style: {
            zIndex: 10,
            display: "",
            height: '50%',
        },
        right_side_left_down_style: {
            zIndex: 11,
            display: "",
            height: '50%',
        },

    },
    watch: {
        css_content: function () {
            this.writeDisplayFile("css")
        },
        html_content: function () {
            this.writeDisplayFile('html')
        },
        js_content: function () {
            this.writeDisplayFile('js')
        },
        js_content_html: function () {
            this.writeDisplayFile('js')
        },
        html_content_html: function () {
            this.writeDisplayFile('html')
        },
        css_content_html: function () {
            this.writeDisplayFile('css')
        },
        // watch. 当 current_group_id改变的时候，也就是左侧第一栏的分组被点击的时候,切换第二栏的文件列表的对应id的文件
        current_group_id: async function () {

            // 调用python获取当前分组的文件列表
            // this.source_list = await eel.pyFun_get_group_list_from_bd()();
            this.current_file_list = await eel.pyFun_get_file_list_from_bd(this.current_group_id)();
        },
        // .watch --un
        selected_database: function () {
            // window.reload
            // location.reload();
            this.change_current_database(this.selected_database)

            // console.log(this.selected_database)
        },
        // .watch
        selected_library: function () {
            // console.log(this.selected_library)
            this.library_menu_commend_list.filter((item) => {
                if (item.name == app.selected_library) {
                    item.commend()
                }
            })
            // this.editor_run_commend(this.selected_library)
        },

        // 分组搜索框改变时，根据搜索框的值，从数据库搜索相应的文件并返回一个列表，然后把列表赋值给当前使用的分组列表。
        group_search_box_value: async function () {
            temp_search_text_list = this.group_search_box_value.split("")

            // 构建搜索词 符号参考资料：https://www.runoob.com/sqlite/sqlite-like-clause.html
            // 符号含义：百分号（%）代表零个、一个或多个数字或字符。下划线（_）代表一个单一的数字或字符。这些符号可以被组合使用。

            // 替换掉空格，并且在每个字符的前面加 % ，字符串最后再加上 % 。例如：把'hello world' 修改成：%h%e%l%l%o%w%o%r%l%d% 
            temp_search_text = this.group_search_box_value.replace(/\s+/g, '').replace(/((?=.)|$)/g, '%')


            this.group_list = await eel.pyFun_get_search_group_list_from_bd(temp_search_text)()
            // console.log(this.group_list)
            // this.current_file_list = await eel.pyFun_get_search_file_list_from_bd(this.current_group_id, '%' + this.file_search_box_value + '%')()
        },
        // 文件搜索框改变时，根据搜索框的值，从数据库搜索相应的文件并返回一个列表，然后把列表赋值给当前使用的文件列表。
        file_search_box_value: async function () {
            // temp_search_text_list = this.file_search_box_value.split("")

            // 构建sqlite3搜索词 参考资料：https://www.runoob.com/sqlite/sqlite-like-clause.html
            temp_search_text = this.file_search_box_value.replace(/\s+/g, '').replace(/((?=.)|$)/g, '%')

            if (this.is_all_file_mode == false) {
                this.current_file_list = await eel.pyFun_get_search_file_list_from_bd(this.current_group_id, temp_search_text)()
            } else {
                this.current_file_list = await eel.pyFun_get_search_file_list_from_bd_by_search_text(temp_search_text)()
            }
            // this.current_file_list = await eel.pyFun_get_search_file_list_from_bd(this.current_group_id, '%' + this.file_search_box_value + '%')()
        },
        auto_run_code: function () {
            console.log(this.auto_run_code)
        },
        is_all_file_mode: function () {
            if (this.is_all_file_mode == true) {
                this.left_all_file_style.color = '#eee'
                this.left_all_file_style.backgroundColor = '#1ab37d'
                this.all_file_button_text = "所有文件[启用]"
            } else {
                this.left_all_file_style.color = '#555'
                this.left_all_file_style.backgroundColor = '#eee'
                this.all_file_button_text = "所有文件"
            }
        },
        // 复选框勾选的时候，启用vim模式
        active_vim_mode: function () {
            if (this.active_vim_mode == true) {
                window.js_editor.setOption("keyMap", "vim")
                window.html_editor.setOption("keyMap", "vim")
                window.css_editor.setOption("keyMap", "vim")

            } else {
                window.js_editor.setOption("keyMap", "default")
                window.html_editor.setOption("keyMap", "default")
                window.css_editor.setOption("keyMap", "default")
            }
        },

        active_rulers: function () {
            if (this.active_rulers == true) {
                window.js_editor.setOption("rulers", this.rulers_80)
                window.html_editor.setOption("rulers", this.rulers_80)
                window.css_editor.setOption("rulers", this.rulers_80)

            } else {
                window.js_editor.setOption("rulers", "")
                window.html_editor.setOption("rulers", "")
                window.css_editor.setOption("rulers", "")
            }
        },
        online_library_list: function () {
            if (this.online_library_list.length != 0) {
                this.is_show_library_table = true
            } else {
                this.is_show_library_table = false
            }
        }


    },
    // 计算属性
    computed: {
        // 文件列表 -- 没使用
        getFileList: function () {
            let file_list_id = this.currentGroup
            return this.source_list.filter(function (file_list) {
                console.log("computed  file_list:", file_list)
                console.log('file_list_id:', file_list.id, 'currenGroup:', file_list_id)
                console.log('file_list_id_is:', file_list.id == file_list_id)
                if (file_list.id == file_list_id) {
                    return file_list.file_list
                }
            })
        },
        //文件列表(给左侧第二栏用)：当curren_group_id改变的时候，调用python从文件获取一个列表
        test_get_file_list: async function () {

            // 获取当前组的id
            // this.current_group_id

            // 根据id，从调用python函数从文件读取组的内容
            // 调用python获取当前分组的文件列表
            // this.source_list = await eel.pyFun_get_group_list_from_bd()();
            this.current_file_list = await eel.pyFun_get_file_list_from_bd(this.current_group_id)();

            return this.current_file_list

        },
        commend_list: function () {
            return this.current_use_commend_list
        },
        // 窗口改变的时候，计算代码编辑框的高度
        editor_height: function () {
            // 这行代码主要是用来：在窗口尺寸改变的时候激活计算属性的
            this.right_side_style.width
            // this.current_file_list.length
            let height = this.editor_top_panel_style.height
            let hold_height = window.getComputedStyle(document.getElementById('right_side_left_down'), null).height
            // this.editor_style.height = parseFloat(hold_height) - parseFloat(height) + 'px'
            temp_height = parseFloat(hold_height) - parseFloat(height) + 'px'
            return temp_height
        },
        com_is_show_library_table: function () {
            if (this.online_library_list.length != 0) {
                return true
            } else {
                return false
            }
        },
    },

    methods: {
        // --un
        changeSize: function () {
            // 根据顶栏的高度来调整三个面板的高度
            //窗口可视高度-顶栏高度-临时高度=面板的高度(临时高度-this.temp_height：因为直接用窗口高度减顶栏高度可能还是会超出窗口高度，所以要再减去一个高度，才刚刚好)
            let pannel_height = document.body.clientHeight - parseFloat(this.top_side_style.height) - this.temp_height + 'px'
            this.right_side_style.height = pannel_height
            this.left_side_group_style.height = pannel_height
            this.left_side_file_style.height = pannel_height

            // 改变根据左侧两个面板的宽度来改变主面板的宽度
            // this.right_side_style.width = `${document.body.clientWidth -parseFloat(this.left_side_group_style.width) - parseFloat(this.left_side_file_style.width)}px`
            if (this.is_fold_group_list == true && this.is_fold_file_list == true) {
                this.right_side_style.width = '100vw'
            } else if (this.is_fold_group_list == false && this.is_fold_file_list == true) {
                this.right_side_style.width = `${document.body.clientWidth - parseFloat(this.left_side_group_style.width) }px`
            } else if (this.is_fold_group_list == true && this.is_fold_file_list == false) {
                this.right_side_style.width = `${document.body.clientWidth - parseFloat(this.left_side_file_style.width) }px`
            } else {
                this.right_side_style.width = `${document.body.clientWidth - parseFloat(this.left_side_group_style.width)-  parseFloat(this.left_side_file_style.width) }px`
            }
        },

        // 从数据库中获取所有分组。并且赋值group_list
        get_group_list_from_bd: async function () {
            // this.source_list = await eel.pyFun_get_group_list_from_bd()();
            this.group_list = await eel.pyFun_get_group_list_from_bd()();

            if (this.current_group_id == 0) {
                // 把第一个分组的id，赋值给current_group_id
                this.current_group_id = this.group_list[0][1]

                // 设置当前的分组名
                this.current_group_name = this.group_list[0][0]
            }
            // 获取当前分组的文件列表
            // 因为依赖上面刚被赋值的current_group_id,所以这个函数要放在这里。
            // 放在其他地方的话，这个函数执行时间，会比current_group_id被赋值早
            this.get_file_list_from_bd()
        },
        // 获取当前分组的文件列表
        get_file_list_from_bd: async function () {
            this.current_file_list = await eel.pyFun_get_file_list_from_bd(this.current_group_id)();

            if (this.current_file_id == 0) {
                this.current_file_id = this.current_file_list[0][1]
                this.current_file_name = this.current_file_list[0][0]
            }

            this.set_document_title(this.current_file_name, this.current_group_name)
        },
        // 获取所有文件
        get_all_file_from_db: async function () {
            this.current_file_list = await eel.pyFun_get_all_file_from_db(this.selected_database)()
            this.is_all_file_mode = true
            // console.log(this.current_file_list)
        },

        // 读取数据库文件，并且赋值给三个小窗口(html、css、js)
        readCurrentFile: async function (group_id, file_id) {

            let current_file = await eel.pyFun_readCurrentFile(group_id, file_id)();

            this.css_content = current_file.current_css
            this.html_content = current_file.current_html
            this.js_content = current_file.current_js

            window.js_editor.setValue(current_file.current_js)
            window.html_editor.setValue(current_file.current_html)
            window.css_editor.setValue(current_file.current_css)

            // 设置iframe显示的网页为 display.html(也就是把js、css、html合并在一起的网页)
            // 不直接在html文件里面直接设置src的原因：如果上次写了个死循环，会卡死，并且代码已记录到display.html所包含的current.js文件里面。那么下次打开的时候，还是会卡死，因为软件打开的时候就加载了display.html。所以iframe的src的默认值设置为：about:blank。
            // this.iframe_src = './current_source/display.html'
            this.iframe_src = '../current_source/display.html'
        },

        // 提供给watch使用，当三个小窗口的内容修改时执行
        writeDisplayFile: async function (content_type, is_auto_run_button_click = false) {
            // 如果 自动运行 复选框勾选，就运行，不然就跳过
            if (this.auto_run_code[0] == 'auto_run' || is_auto_run_button_click == true) {
                // let isSuccese = ''
                // 判断是哪个代码编辑器的内容被修改，然后修改current_source目录里面对应的css、html或者js文件
                if (content_type == 'css') {
                    let isSuccese = await eel.pyFun_writeCurrentFile("css", window.css_editor.getValue(), this.current_group_id_for_file_context_menu, this.current_file_id)();
                } else if (content_type == 'html') {
                    let isSuccese = await eel.pyFun_writeCurrentFile("html", window.html_editor.getValue(), this.current_group_id_for_file_context_menu, this.current_file_id)();
                } else if (content_type == 'js') {
                    let isSuccese = await eel.pyFun_writeCurrentFile("js", window.js_editor.getValue(), this.current_group_id_for_file_context_menu, this.current_file_id)();
                }
                // 刷新显示完整页面的iframe
                await document.getElementById('display_iframe').contentWindow.location.reload();
            }
        },
        reload_hold_html_frame: function () {
            // 刷新显示完整页面的iframe
            document.getElementById('display_iframe').contentWindow.location.reload();
            console.log('刷新')
        },
        // 运行按钮点击的时候调用
        run_all_code: function () {
            this.writeDisplayFile('css', true)
            this.writeDisplayFile('html', true)
            this.writeDisplayFile('js', true)
            this.show_message_in_bottom_side('所有代码已<span style="color:red">保存</span>并且<span style="color:red">运行</span>')
        },

        // 编辑框内容改变时，要执行的函数 - 没有使用
        change_html: function (data_type) {
            // data_type是用来判断哪个编辑框的内容改变了，它的值可以是：html、js、css中的任意一个
            if (data_type == 'js') {
                this.js_content_html = document.getElementById('right_side_left_down').innerHTML
            } else if (data_type == 'html') {
                this.html_content_html = document.getElementById('right_side_left_up').innerHTML
            } else if (data_type == 'css') {
                this.css_content_html = document.getElementById('right_side_right_up').innerHTML
            }
        },

        // 文件名被点击的时候执行-unuse
        getDetail: function (key) {
            // alert(key)
            console.log("this.source_list[this.currentGroup][key]", this.source_list[this.currentGroup][key])
            console.log("this.source_list[this.currentGroup][key].html", this.source_list[this.currentGroup][key].html)
        },

        // 初始化编辑器
        init_editor: function () {

            // js代码编辑器，必须是全局变量，不然要调用编辑器的getValue,和setValue的时候会提示不是函数。
            window.js_editor = CodeMirror.fromTextArea(document.getElementById("js_code_box"), {
                mode: "javascript",



                lineNumbers: true,

                //自动换行
                // lineWrapping: true,

                matchBrackets: true,
                continueComments: "Enter",
                keyMap: this.code_box_setting.keyMap_type,
                theme: this.code_box_setting.codeBox_them,

                // foldGutter: true,
                // gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],

                // 聚焦到一个括号时，会显示和它配对的括号
                matchBrackets: true,
                // 自动关闭括号
                autoCloseBrackets: true,
                // 自动关闭标签
                autoCloseTags: true,

                extraKeys: {
                    "Ctrl-/": "toggleComment",

                    // 按Tab键的时候，不插入tab而是插入4个空格
                    Tab: function (cm) {
                        var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
                        cm.replaceSelection(spaces);
                    },
                    // 进入或者退出全屏
                    "F11": function (cm) {
                        cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                        // 右下角的编辑框的堆叠顺序 - 完整网页
                        if (app.right_side_right_down_style.zIndex == 11) {
                            app.right_side_right_down_style.zIndex = 10
                        } else {
                            app.right_side_right_down_style.zIndex = 11
                        }

                        // alert(app.current_file_id)
                    },
                    // 会和vim的快捷键冲突，所以不用Esc来退出全屏
                    // "Esc": function (cm) {
                    //     if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                    // }
                },
                // 代码提示选项
                hintOptions: {
                    // 当只要一个结果的时候，自动上屏
                    completeSingle: false,
                }
            })

            // 将自动提示绑定到inputRead(当我们手动操作的时候才触发)事件上，这样输入的时候就可以看到联想的关键词
            window.js_editor.on('inputRead', (instance, change) => {
                // 自动补全的时候，也会触发change事件，所以做下判断，以免死循环，正则是为了不让空格，换行之类的也提示
                // 通过change对象你可以自定义一些规则去判断是否提示
                if (change.origin !== 'complete' && /\w|\./g.test(change.text[0])) {
                    instance.showHint()
                }
            })

            // html代码编辑器，必须是全局变量
            window.html_editor = CodeMirror.fromTextArea(document.getElementById("html_code_box"), {
                // mode: mixedMode,
                mode: "htmlmixed",
                lineNumbers: true,

                //自动换行
                // lineWrapping: true,

                matchBrackets: true,
                matchTags: {
                    bothTags: true
                },
                continueComments: "Enter",
                keyMap: this.code_box_setting.keyMap_type,
                theme: this.code_box_setting.codeBox_them,

                // 聚焦到一个括号时，会显示和它配对的括号
                matchBrackets: true,
                // 自动关闭括号
                autoCloseBrackets: true,
                // 自动关闭标签
                autoCloseTags: true,

                extraKeys: {
                    "Ctrl-/": "toggleComment",

                    // 按Tab键的时候，不插入tab而是插入2个空格
                    Tab: function (cm) {
                        var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
                        cm.replaceSelection(spaces);
                    },
                    "F11": function (cm) {
                        cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                        // // 右下角的编辑框的堆叠顺序 - 完整网页
                        // if (app.right_side_right_down_style.zIndex == 11) {
                        //     app.right_side_right_down_style.zIndex = 10
                        // } else {
                        //     app.right_side_right_down_style.zIndex = 11
                        // }

                        // // 左下角的编辑框的堆叠顺序 - js编辑框
                        // if (app.right_side_left_down_style.zIndex == 11) {
                        //     app.right_side_left_down_style.zIndex = 10
                        // } else {
                        //     app.right_side_left_down_style.zIndex = 11
                        // }

                        // // 左上角的编辑框的堆叠顺序 - html编辑框
                        // if (app.right_side_left_up_style.zIndex == 10) {
                        //     app.right_side_left_up_style.zIndex = 11
                        // } else {
                        //     app.right_side_left_up_style.zIndex = 10
                        // }

                        // 切换其他三个编辑器窗口的显示或者隐藏
                        if (app.right_side_left_down_style.display == '') {
                            console.log(1)
                            app.right_side_left_down_style.display = 'none'
                            app.right_side_right_down_style.display = 'none'
                            app.right_side_right_up_style.display = 'none'
                        } else {
                            console.log(2)
                            app.right_side_left_down_style.display = ''
                            app.right_side_right_down_style.display = ''
                            app.right_side_right_up_style.display = ''
                        }
                    },
                    // "Esc": function (cm) {
                    //     if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                    // }
                },
                hintOptions: {
                    completeSingle: false,
                }
            })

            // 将自动提示绑定到inputRead(当我们手动操作的时候才触发)事件上，这样输入的时候就可以看到联想的关键词
            window.html_editor.on('inputRead', (instance, change) => {
                // 自动补全的时候，也会触发change事件，所以做下判断，以免死循环，正则是为了不让空格，换行之类的也提示
                // 通过change对象你可以自定义一些规则去判断是否提示
                if (change.origin !== 'complete' && /\w|\./g.test(change.text[0])) {
                    instance.showHint()
                }
            })

            // css代码编辑器，必须是全局变量
            window.css_editor = CodeMirror.fromTextArea(document.getElementById("css_code_box"), {
                mode: "css",
                lineNumbers: true,

                //自动换行
                // lineWrapping: true,

                matchBrackets: true,
                continueComments: "Enter",
                keyMap: this.code_box_setting.keyMap_type,
                theme: this.code_box_setting.codeBox_them,

                // 聚焦到一个括号时，会显示和它配对的括号
                matchBrackets: true,
                // 自动关闭括号
                autoCloseBrackets: true,
                // 自动关闭标签
                autoCloseTags: true,

                extraKeys: {
                    // 备注
                    "Ctrl-/": "toggleComment",

                    // 按Tab键的时候，不插入tab而是插入4个空格
                    Tab: function (cm) {
                        var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
                        cm.replaceSelection(spaces);
                    },
                    "F11": function (cm) {
                        cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                        // 切换其他三个编辑器窗口的显示或者隐藏
                        if (app.right_side_left_down_style.display == '') {
                            console.log(1)
                            app.right_side_left_down_style.display = 'none'
                            app.right_side_right_down_style.display = 'none'
                            app.right_side_left_up_style.display = 'none'
                        } else {
                            console.log(2)
                            app.right_side_left_down_style.display = ''
                            app.right_side_right_down_style.display = ''
                            app.right_side_left_up_style.display = ''
                        }
                    },
                    // "Esc": function (cm) {
                    //     if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                    // }
                },
                hintOptions: {
                    completeSingle: false,
                }
            })
            // 将自动提示绑定到inputRead(当我们手动操作的时候才触发)事件上，这样输入的时候就可以看到联想的关键词
            window.css_editor.on('inputRead', (instance, change) => {
                // 自动补全的时候，也会触发change事件，所以做下判断，以免死循环，正则是为了不让空格，换行之类的也提示
                // 通过change对象你可以自定义一些规则去判断是否提示
                if (change.origin !== 'complete' && /\w|\./g.test(change.text[0])) {
                    instance.showHint()
                }
            })

            // 格式化代码 -start
            // editor：要格式化的编辑器
            window.format_code = function (editor, is_all = true) {
                if (is_all == true) {
                    // 选择全部
                    editor.execCommand("selectAll")
                }
                // window.js_editor.execCommand("selectAll")

                // 获取选择的区域
                function getSelectedRange() {
                    return {
                        from: editor.getCursor(true),
                        to: editor.getCursor(false)
                    };
                }

                // 格式化选择的区域
                // window.autoFormatSelection = function () {
                var range = getSelectedRange();
                // window.js_editor.autoFormatRange(range.from, range.to);
                editor.autoFormatRange(range.from, range.to);
                // editor.execCommand("undoSelection")
                // }
                // 格式化代码 -end

                // 选择全部
                // editor.execCommand("undoSelection")
            }

        },

        // 修改当前分组-文件列表的内容被点击时调用
        change_group: async function (group_id, group_name, index) {
            // this.currentGroup = item_id
            this.current_group_id = group_id
            this.current_group_name = group_name
            this.current_choose_group = index
            // 取消文件的选择
            this.current_choose_file = -1

            // 清空文件搜索框
            this.file_search_box_value = ''

            // 设置“所有文件”状态为false
            this.is_all_file_mode = false
            // 获取当前文件的分组id,如果分组id不等于当前的选择的分组id，就取消文件的选中状态
            // let temp_group_id = await eel.pyFun_get_group_id_from_bd(this.current_file_id)()
            // if (temp_group_id[0][0] != this.current_group_id) {
            //     console.log(">123>>>",this.current_choose_file,this.temp_current_choose_file)
            //     this.temp_current_choose_file = this.current_choose_file
            //     console.log(">123>>>",this.current_choose_file,this.temp_current_choose_file)
            //     this.current_choose_file = -1
            // } else {
            //     console.log(">>>>",this.current_choose_file,this.temp_current_choose_file)
            //     this.current_choose_file = this.temp_current_choose_file
            //     console.log("<<<<",this.current_choose_file,this.temp_current_choose_file)
            // }
        },

        // 修改代码框中显示的文件
        change_file: function (file_id, file_name, index, group_id) {

            // 设置当前的文件id
            this.current_file_id = file_id

            // 设置当前文件的index
            this.current_choose_file = index

            // 设置当前的组id,给在搜索结果页修改文件的时候使用。
            this.current_group_id_for_file_context_menu = group_id

            this.set_document_title(file_name, this.current_group_name)

            // 读取数据库文件，并且赋值给三个小窗口(html、css、js)
            this.readCurrentFile(group_id, file_id)
        },

        // 生成随机字符串作为id
        getRandomId: function (type, len) {
            // 字符串长度等于len或者32(调用的时候没有传len的时候)
            len = len || 32;
            var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符LoOl,9gq,Vv,Uu,I1****/
            var maxPos = $chars.length;
            var pwd = '';
            for (let i = 0; i < len; i++) {
                pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
            }
            date_now = this.date_format("YYYYmmddHHMMSS", new Date());
            return type + '-' + date_now + '-' + pwd;
            // return type + "-" + pwd;
        },
        // 日期格式化。用法：
        //t1 = date_format("YYYY-mm-dd-HH-MM-SS",new Date());
        //t2 = date_format("YYYYmmddHHMMSS",new Date());
        date_format: function (fmt, date) {
            let ret;
            const opt = {
                "Y+": date.getFullYear().toString(), // 年
                "m+": (date.getMonth() + 1).toString(), // 月
                "d+": date.getDate().toString(), // 日
                "H+": date.getHours().toString(), // 时
                "M+": date.getMinutes().toString(), // 分
                "S+": date.getSeconds().toString() // 秒
                // 有其他格式化字符需求可以继续添加，必须转化成字符串
            };
            for (let k in opt) {
                ret = new RegExp("(" + k + ")").exec(fmt);
                if (ret) {
                    fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
                };
            };
            return fmt;
        },


        // 保存文件
        saveCurrentFile: async function (data, data_id) {
            let is_success = await eel.pyFun_save_file(data, data_id);
        },

        // 添加分组
        add_group: async function () {

            // 让用户输入分组名
            while (true) {
                group_name = prompt("请输入分组名：", this.getRandomId('默认分组', 5))
                if (group_name != '') {
                    break
                }
            }

            // 如果用户点了“取消”就跳过这一步
            if (group_name != null) {

                // 生成group_id
                group_id = this.getRandomId("Group")
                group_is_active = 0

                file_name = this.getRandomId('默认文件名', 5)
                file_id = this.getRandomId("File")
                file_is_active = 0
                html_code = ""
                css_code = ""
                js_code = ""

                let is_success = await eel.pyFun_db_insertValue(group_name, group_id, group_is_active, file_name, file_id, file_is_active, html_code, css_code, js_code)();

                new_group = [group_name, group_id]
                this.group_list.push(new_group)
                // 添加的当前文件列表数组
                new_file = [file_name, file_id]
                this.current_group_id = group_id
                this.current_file_list.push(new_file)


                index = this.group_list.length - 1
                // 设置新组为当前组
                this.change_group(group_id, group_name, index)
                this.show_message_in_bottom_side(`新组[${group_name}]以及文件[${file_name}]添加成功`, 2000)
                return
            }
        },
        // 添加文件
        add_file: async function () {

            temp_current_group_id = this.current_group_id

            // --can-opt：可以从数据库中获取组名或者，把当前组名也定义成一个vue的data变量
            // let temp_group_name = await ell.pyFun_get_data_from_bd()();
            temp_group_name = this.group_list.filter(function (item) {
                if (item[1] == temp_current_group_id) {
                    return item[0][0]
                }
            })
            if (temp_group_name.length == 0) {
                alert("请先添加分组!")
                return
            }
            group_name = temp_group_name[0][0]
            group_id = this.current_group_id
            group_is_active = 0
            temp_file_name = prompt("请输入文件名：", this.getRandomId('默认文件名', 5))

            if (temp_file_name != "") {
                file_name = temp_file_name
            } else {
                file_name = this.getRandomId('默认文件名', 5)
            }
            // 如果用户点了“取消”就跳过这一步
            if (file_name != null) {
                file_id = this.getRandomId("File")
                file_is_active = 0
                html_code = ""
                css_code = ""
                js_code = ""

                // 添加的当前文件列表数组
                new_file = [file_name, file_id]
                this.current_file_list.push(new_file)

                let is_success = await eel.pyFun_db_insertValue(group_name, group_id, group_is_active, file_name, file_id, file_is_active, html_code, css_code, js_code)();
                this.get_file_list_from_bd()

                index = this.current_file_list.length - 1
                // 设置新文件为当前文件
                this.change_file(file_id, file_name, index, group_id)

                this.show_message_in_bottom_side(`新文件[${file_name}]添加成功`, 2000)
                return
            }
            // 把文件添加到组
            // this.source_list.filter(group => {
            //     console.log("group::::", group)
            //     if (group.id == this.currentGroup) {
            //         group.file_list.push(new_file)
            //     }
            // })
        },
        show_file_context_menu: function (e) {
            // if (this.isshow_file_contextMenu ==false) {

            this.file_context_menu_style.left = e.pageX + 'px'
            this.file_context_menu_style.top = e.pageY + 'px'
            this.isshow_file_contextMenu = true

        },
        hide_file_context_menu: function () {
            this.isshow_file_contextMenu = false

        },
        show_group_context_menu: function (e) {

            this.group_context_menu_style.left = e.pageX + 'px'
            this.group_context_menu_style.top = e.pageY + 'px'
            this.isshow_group_contextMenu = true

        },
        hide_group_context_menu: function () {
            this.isshow_group_contextMenu = false

        },
        group_menu_option_rename: async function () {
            // 隐藏菜单
            this.isshow_group_contextMenu = false

            // 新的文件名
            let new_name = ''
            while (true) {
                // 从数据库中获取文件名 - 不需要这么麻烦
                // let file_name = await ell.pyFun_get_data_from_bd(this.current_group_id, this.current_file_id, 'file_name')
                let group_name = this.current_group_name_for_context_menu
                new_name = prompt("请输入新的分组名：", group_name)
                if (new_name != '') {
                    break
                }
            }
            // 如果点了取消按钮，就跳过
            if (new_name != null) {

                // 修改数据库里面对应的的文件名
                let is_success = await eel.pyFun_change_group_name(this.current_group_id_for_context_menu, new_name)();

                // 从数据库获取文件列表(可以确认是否修改成功)
                this.get_group_list_from_bd()
                this.show_message_in_bottom_side("已修改数据库并更新视图", 1500)
            } else {
                this.show_message_in_bottom_side('取消分组重命名操作')
            }
        },

        // 上移，下移文件。思路：主要是交换数据库里面 当前行与上一行或者下一行的id(注：这里的上一行或者下一行不是指数据库中的位置，而是指软件中的文件列表的文件位置。)
        group_menu_option_move_up: async function () {
            // 隐藏菜单
            this.isshow_group_contextMenu = false
            index = this.current_group_index_for_context_menu
            // console.log('group_index:', index)

            // 如果要上移的组，当前是选择状态，那么 is_current_seleted =true
            is_current_seleted = this.current_group_id == this.current_group_id_for_context_menu

            // 记录当前是选中状态的组的id,等代码执行完之后，在重新设置为选中状态(因为下面的代码会修改选中的组)
            // current_seleted = this.current_group_id

            // 如果文件不是排第一的时候执行
            if (index != 0) {
                // 要上移的组 --- 格式：第一个是：组名；第二个是：组id。示例：('组名001', 'dult01') 
                current = this.group_list[index]
                // 要上移的组上面的组
                current_up = this.group_list[index - 1]

                let is_success = await eel.pyFun_switch_group_info(current[1], current_up[1])
                // 从数据库获取组列表(可以确认是否修改成功)

                await this.get_group_list_from_bd()


                this.show_message_in_bottom_side(`组【${this.current_group_name_for_context_menu}】<span style="color:#1AB37D;font-weight:bold;">上移 </span>成功。`, 1500)
                // 上面这条语句：await this.get_group_list_from_bd() ，会修改当前选中状态的组为第一个
                // 如果要上移的组，当前是选择状态，就重新把它设置回选中状态
                // this.current_group_id = current_seleted
            }
        },

        group_menu_option_move_down: async function () {
            // 隐藏菜单
            this.isshow_group_contextMenu = false
            index = this.current_group_index_for_context_menu
            // console.log('group_index:', index)

            // 如果要下移的组，当前是选择状态，那么 is_current_seleted =true
            // current_seleted = this.current_group_id

            // 如果文件不是排第一的时候执行
            if (index != 0) {
                // 要上移的组 --- 格式：第一个是：组名；第二个是：组id。示例：('组名001', 'dult01') 
                current = this.group_list[index]
                // 要上移的组上面的组
                current_up = this.group_list[index + 1]

                let is_success = await eel.pyFun_switch_group_info(current_up[1], current[1])
                // 从数据库获取组列表(可以确认是否修改成功)
                await this.get_group_list_from_bd()

                this.show_message_in_bottom_side(`组【${this.current_group_name_for_context_menu}】<span style="color:#1AB37D;font-weight:bold;">下移 </span>成功。`, 1500)
                // 上面这条语句：await this.get_group_list_from_bd() ，会修改当前选中状态的组为第一个
                // 如果要上移的组，当前是选择状态，就重新把它设置回选中状态
                // this.current_group_id = current_seleted
            }
        },

        group_menu_option_delete: async function () {
            // 向用户确认是否真的要删除
            confirm_commend = confirm("此操作会同时删除分组下的文件，是否真的要删除？")
            if (confirm_commend == true) {
                // 执行删除文件命令
                let is_success = await eel.pyFun_delete_group_from_bd(this.current_group_id_for_context_menu)();
                // 确认是否删除成功
                if (is_success == true) {
                    // 从数据库获取分组列表(可以确认是否修改成功)
                    this.get_group_list_from_bd()
                } else {
                    alert("删除文件失败！")
                }
            } else {
                this.show_message_in_bottom_side("取消删除分组。")
            }

            // 隐藏菜单
            this.isshow_group_contextMenu = false
        },


        file_menu_option_rename: async function () {
            // 隐藏菜单
            this.isshow_file_contextMenu = false

            // 新的文件名
            let new_name = ''
            while (true) {
                // 从数据库中获取文件名 - 不需要这么麻烦
                // let file_name = await ell.pyFun_get_data_from_bd(this.current_group_id, this.current_file_id, 'file_name')
                let file_name = this.current_file_name_for_context_menu
                new_name = prompt("请输入新的文件名：", file_name)
                if (new_name != '') {
                    break
                }
            }
            // 如果点了取消按钮，就跳过
            if (new_name != null) {

                // 修改数据库里面对应的的文件名
                let is_success = await eel.pyFun_change_file_name(this.current_group_id_for_file_context_menu, this.current_file_id_for_context_menu, new_name)();

                if (this.is_all_file_mode == true) {
                    this.get_all_file_from_db()
                } else {
                    // 从数据库获取文件列表(可以确认是否修改成功)
                    this.get_file_list_from_bd()
                }

                this.show_message_in_bottom_side("已修改数据库并更新视图", 1500)
            } else {
                this.show_message_in_bottom_side('取消文件重命名操作')
            }
        },

        // 上移，下移文件 --start。思路：主要是交换数据库里面 当前行与上一行或者下一行的id(注：这里的上一行或者下一行不是指数据库中的位置，而是指软件中的文件列表的文件位置。)
        file_menu_option_move_up: async function () {
            // 隐藏菜单
            this.isshow_file_contextMenu = false

            if (this.is_all_file_mode == true) {
                alert("在所有文件模式下，命令不可用，而且也没有用的意义。")
                return
            }
            index = this.current_file_index_for_context_menu

            // 如果文件不是排第一的时候执行
            if (index != 0) {
                // 要上移的文件 --- 格式：第一个是：文件名；第二个是：文件id。示例：('默认1', 'dult01') 
                current = this.current_file_list[index]
                // 要上移的文件上面的文件
                current_up = this.current_file_list[index - 1]

                let is_success = await eel.pyFun_switch_file_info(this.current_group_id_for_file_context_menu, current[1], current_up[1])
                // 从数据库获取文件列表(可以确认是否修改成功)
                await this.get_file_list_from_bd()

                this.show_message_in_bottom_side(`文件【${this.current_file_name_for_context_menu}】<span style="color:#1AB37D;font-weight:bold;">上移 </span>成功。`, 1500)
            }
        },
        file_menu_option_move_down: async function () {
            // 隐藏菜单
            this.isshow_file_contextMenu = false

            if (this.is_all_file_mode == true) {
                alert("在所有文件模式下，命令不可用，而且也没有用的意义。")
                return
            }

            index = this.current_file_index_for_context_menu

            // 如果文件不是排最后的时候执行
            if (index != this.current_file_list.length - 1) {
                // 要下移的文件 --- 格式：第一个是：文件名；第二个是：文件id。示例：('默认1', 'dult01') 
                current = this.current_file_list[index]
                // 要下移的文件下面的文件
                current_up = this.current_file_list[index + 1]

                let is_success = await eel.pyFun_switch_file_info(this.current_group_id_for_file_context_menu, current_up[1], current[1])
                // 从数据库获取文件列表(可以确认是否修改成功)
                this.get_file_list_from_bd()

                this.show_message_in_bottom_side(`文件【${this.current_file_name_for_context_menu}】<span style="color:#1AB37D;font-weight:bold;">下移 </span>成功。`, 1500)
            }
        },
        // 上移，下移文件 --end

        // 打开文件排序面板
        file_menu_option_move_sort: async function () {
            // 隐藏菜单
            this.isshow_file_contextMenu = false

            // 显示文件排序面板
            this.sort_file_style.display = ''

            // 排序面板的当前选中项，设置为刚刚鼠标右键点击的时候的文件
            this.sort_file_list_current_index = this.current_file_index_for_context_menu

            return
            // 从数据库获取文件列表(可以确认是否修改成功)
            await this.get_file_list_from_bd()

            this.show_message_in_bottom_side(`文件【${this.current_file_name_for_context_menu}】<span style="color:#1AB37D;font-weight:bold;">上移 </span>成功。`, 1500)
        },
        file_menu_option_move_to_gruop: function () {
            // break
        },
        file_menu_option_duplicate: async function () {
            // this.file_context_menu_style.display='none'
            this.hide_file_context_menu()

            // console.log(this.current_group_id_for_file_context_menu, this.current_file_id_for_context_menu)
            file_info_all = await eel.pyFun_get_file_info_all(this.current_group_id_for_file_context_menu, this.current_file_id_for_context_menu)()
            // console.log(file_info_all)
            file_info_all_temp = file_info_all[0].slice(1, -1)
            // console.log(file_info_all_temp)

            group_name = file_info_all_temp[0]
            // group_name = prompt("请输入分组名：", this.getRandomId('默认分组', 5))
            group_id = file_info_all_temp[1]
            // group_id = this.getRandomId("Group")
            group_is_active = file_info_all_temp[2]
            file_name = file_info_all_temp[3] + this.getRandomId('-副本', 2)
            // file_id = file_info_all_temp[4]
            // file_name = this.getRandomId('默认文件名', 5)
            file_id = this.getRandomId("File")
            file_is_active = file_info_all_temp[5]
            html_code = file_info_all_temp[6]
            css_code = file_info_all_temp[7]
            js_code = file_info_all_temp[8]
            let is_success = await eel.pyFun_db_insertValue(group_name, group_id, group_is_active, file_name, file_id, file_is_active, html_code, css_code, js_code)();
            // let is_success = await eel.pyFun_db_insertValue(...file_info_all_temp)();
            // 从数据库获取文件列表(可以确认是否修改成功)
            await this.get_file_list_from_bd()
            // break;
        },
        file_menu_option_delete: async function () {
            // 隐藏菜单
            this.isshow_file_contextMenu = false

            confirm_commend = confirm("确认删除文件？")
            if (confirm_commend == true) {
                let is_success = await eel.pyFun_delete_file_from_bd(this.current_group_id_for_file_context_menu, this.current_file_id_for_context_menu)();

                if (is_success == true) {
                    // 从数据库获取文件列表(可以确认是否修改成功)
                    if (this.is_all_file_mode == true) {
                        this.get_all_file_from_db()
                    } else {
                        this.get_file_list_from_bd()
                    }
                } else {
                    alert("删除文件失败！")
                }

            } else {
                this.show_message_in_bottom_side("取消删除文件。")
            }
            // alert(file_info)
        },


        file_menu_option_fileInfo: async function () {
            // 隐藏菜单
            this.isshow_file_contextMenu = false

            let file_info_db = await eel.pyFun_get_data_from_bd(this.current_group_id_for_file_context_menu, this.current_file_id_for_context_menu)();
            console.log('file_info_db:', file_info_db)
            // 先清空再添加
            this.current_file_info = []
            this.current_file_info.push(["文件名", file_info_db[0][4]])
            this.current_file_info.push(["文件ID", file_info_db[0][5]])
            this.current_file_info.push(["所属分组名", file_info_db[0][1]])
            this.current_file_info.push(["所属分组ID", file_info_db[0][2]])
            this.current_file_info.push(["创建日期", file_info_db[0][10]])
            this.show_file_info_panel_style.display = ''
            return
            console.log('file_info_db:', file_info_db)
            file_info = `文件名：${file_info_db[0][4]}\n文件ID：${file_info_db[0][5]}\n所属分组名：${file_info_db[0][1]}\n所属分组ID：${file_info_db[0][2]}\n创建日期：${file_info_db[0][10]}`
            alert(file_info)
        },

        // 在文件名上点击右键的时候调用
        change_current_file_id_name_for_context_menu: function (file_id, file_name, index, group_id) {
            this.current_file_id_for_context_menu = file_id
            this.current_file_name_for_context_menu = file_name
            this.current_file_index_for_context_menu = index
            this.current_group_id_for_file_context_menu = group_id
            // console.log(group_id)


        },
        // 在分组名上点击右键的时候调用
        change_current_group_id_name_for_context_menu: function (group_id, group_name, index) {
            this.current_group_id_for_context_menu = group_id
            this.current_group_name_for_context_menu = group_name
            this.current_group_index_for_context_menu = index
        },

        // 在底栏显示信息
        show_message_in_bottom_side: function (message, display_time = 1000) {
            this.bottom_side_html = message
            // 显示信息
            this.bottom_side_style.display = 'block'
            // 过一段时间后自动隐藏
            setTimeout(() => {
                this.bottom_side_style.display = 'none'
            }, display_time)
        },
        // 设置最上面的标题
        set_document_title: function (file_name, group_name) {
            document.title = "当前文件：" + file_name + " [ 所属分组：" + group_name + " ]"
        },
        // 顶栏菜单测试
        html_menu_insert: function (insert_value, is_clear_content = false) {
            // 如果传递过来的第二个参数，为true，就清空编辑框原有的内容。
            if (is_clear_content == true) {
                window.html_editor.setValue('')
            }
            let current_html_value = window.html_editor.getValue()
            window.html_editor.setValue(insert_value + "\n" + current_html_value)
            // 保存文件
            this.writeDisplayFile('html')
            // 选择框设置为默认值
            this.selected_library = 'hint_text'
        },
        js_menu_insert: function (insert_value, is_clear_content) {
            // 如果传递过来的第二个参数，为true，就清空编辑框原有的内容。
            if (is_clear_content == true) {
                window.js_editor.setValue('')
            }
            let current_js_value = window.js_editor.getValue()
            window.js_editor.setValue(insert_value + "\n" + current_js_value)
            // 保存文件
            this.writeDisplayFile('js')
        },
        show_top_side_menu: function (item, e, menu) {
            // item：点击的元素；e：事件；menu：显示哪个菜单。

            // 如果菜单是隐藏的就显示，否则就隐藏
            // if (this.top_side_sub_menu_style.display == 'none' ) {
            //     this.top_side_sub_menu_style.display = ''
            // } else {
            //     if(this.current_top_side_menu == menu){
            //         this.top_side_sub_menu_style.display = 'none'
            //     }
            //     else{
            //         this.show_top_side_menu(item,e,menu)
            //     }
            //     // return
            // }

            this.top_side_sub_menu_style.display = ''
            // console.log("menu", menu)
            switch (menu) {
                case 'file':
                    this.current_use_commend_list = this.file_menu_commend_list
                    this.current_top_side_menu = menu
                    break
                case 'edit':
                    this.current_use_commend_list = this.edit_menu_commend_list
                    this.current_top_side_menu = menu
                    break
                case 'library':
                    this.current_use_commend_list = this.library_menu_commend_list
                    this.current_top_side_menu = menu
                    break
                case 'model':
                    this.current_use_commend_list = this.model_menu_commend_list
                    this.current_top_side_menu = menu
                    break
                case 'help':
                    this.current_use_commend_list = this.help_menu_commend_list
                    this.current_top_side_menu = menu
                    break
            }

            // if (menu == 'file') {
            //     this.current_use_commend_list = this.file_menu_commend_list
            // } else {
            //     this.current_use_commend_list = this.html_menu_commend_list
            // }

            // 获取当前鼠标位置，并修改菜单位置
            temp_x = e.target.getBoundingClientRect().x - 1
            temp_y = e.target.getBoundingClientRect().y + e.target.getBoundingClientRect().height
            this.top_side_sub_menu_style.top = temp_y + 'px'
            this.top_side_sub_menu_style.left = temp_x + 'px'
            // console.log(temp_x, temp_y)
            // console.log(e.pageX, e.pageY)

            // 显示菜单
            this.top_side_sub_menu_style.display = ''


            // } else {
            //     // 隐藏菜单
            //     this.top_side_sub_menu_style.display = 'none'
            // }

        },
        hide_top_side_menu: function (item, e, menu) {
            this.top_side_sub_menu_style.display = 'none'
        },
        root_control: function () {
            this.top_side_sub_menu_style.display = 'none'
            // 隐藏文件右键菜单
            this.isshow_file_contextMenu = false
            // 隐藏组右键菜单
            this.isshow_group_contextMenu = false
        },
        top_side_sub_menu_option: function (item) {
            // 执行命令
            item.commend()
            // 隐藏菜单
            this.top_side_sub_menu_style.display = 'none'
        },
        change_right_side_right_down_class: function () {
            // 切换右下角显示完整html的 全屏和平常状态
            if (this.right_side_right_down_class == 'right_side_right_down_class_normal') {
                this.right_side_right_down_class = 'right_side_right_down_class_fullscreen'
                this.right_side_right_down_style.height = '100%'
                this.full_html_top_panel_style.display = 'none'
            } else {
                this.right_side_right_down_class = 'right_side_right_down_class_normal'
                this.right_side_right_down_style.height = '50%'
                this.full_html_top_panel_style.display = ''
            }
        },
        // 展开/折叠左侧的两栏
        fold_group_list: function () {
            // 如果是折叠，那么就展开
            if (this.is_fold_group_list == true) {
                this.left_side_group_style.display = ''

                this.fold_group_list_style.transform = 'ratate(-90deg)'
                this.fold_group_list_style.backgroundColor = '#1AB37D'
                this.fold_group_list_style.color = '#EBEBEB'

                this.is_fold_group_list = false
                this.changeSize()

                // 折叠
            } else {
                this.left_side_group_style.display = 'none'

                this.fold_group_list_style.transform = 'ratate(-90deg)'
                // this.fold_group_list_style.backgroundColor = 'rgb(235,235,235,.9)'
                this.fold_group_list_style.backgroundColor = 'rgb(235,235,235)'
                this.fold_group_list_style.color = '#1AB37D'
                this.fold_group_list_style.border = '1px solid #1AB37D'
                this.fold_file_list_style.border = '1px solid #1AB37D'

                this.is_fold_group_list = true
                this.changeSize()
            }
        },

        // 展开/折叠左侧的分组栏
        fold_file_list: function () {
            // 如果是折叠，那么就展开
            if (this.is_fold_file_list == true) {

                this.left_side_file_style.display = ''

                this.is_fold_file_list = false

                this.changeSize()

                this.fold_file_list_style.backgroundColor = '#1AB37D'
                this.fold_file_list_style.color = '#EBEBEB'

                // 如果是展开，那么就折叠
            } else {
                this.left_side_file_style.display = 'none'

                this.is_fold_file_list = true

                this.changeSize()

                this.fold_file_list_style.backgroundColor = 'rgb(235,235,235)'
                this.fold_file_list_style.color = '#1AB37D'
            }
        },
        // 获取数据库列表
        get_database_list: async function () {
            let temp_database_list = await eel.pyFun_get_database_list()()
            this.database_list = temp_database_list

            // 设置当前选择的数据库
            this.selected_database = this.database_list[0]

            // 备份数据库
            await eel.pyFun_backup_database(this.selected_database)
            this.show_message_in_bottom_side(`数据库<span style="font-weight:bold;color:red;">${this.selected_database}</span>已备份。`, 3000)
        },
        // 切换数据库
        change_current_database: async function (database) {
            await eel.pyFun_connect_database(database)()

            // 备份数据库
            eel.pyFun_backup_database(this.selected_database)

            // 获取分组数据
            try {
                this.get_group_list_from_bd()
            } catch (err) {
                alert("读取分组列表错误。：" + err)
            }
        },
        // 搜索文件
        get_file_search_result: function (search_value) {
            console.log(search_value)
        },
        sort_file_list_change_current_index: function (index) {
            this.sort_file_list_current_index = index
        },
        // 移动文件排序面板的几个函数 --start
        // 获取并保存排序面板与鼠标指针的位置差
        sort_file_list_panel_move: function (event) {
            mouse_x = event.pageX
            mouse_y = event.pageY
            // 获取sort_file_list面板的x和y位置
            panel_x = window.getComputedStyle(event.target.parentNode).left
            panel_y = window.getComputedStyle(event.target.parentNode).top

            // 面板和鼠标位置的差值
            this.sort_file_list_x = mouse_x - parseFloat(panel_x)
            this.sort_file_list_y = mouse_y - parseFloat(panel_y)

            this.sort_file_list_can_move = true

        },
        // 停止移动
        set_sort_file_list_change_can_move: function () {
            this.sort_file_list_can_move = false
        },
        // 面板跟随指针移动
        set_sort_file_list_change_move: function (event) {
            mouse_x = event.pageX
            mouse_y = event.pageY

            if (this.sort_file_list_can_move == true) {
                event.target.parentNode.style.left = mouse_x - this.sort_file_list_x + 'px'
                event.target.parentNode.style.top = mouse_y - this.sort_file_list_y + 'px'
            }
        },
        // 移动文件排序面板的几个函数 --end

        // 取消按钮点击
        sort_file_cancel: function () {
            this.sort_file_style.display = 'none'
        },
        // 关闭文件信息面板
        close_show_file_info_panel: function () {
            this.show_file_info_panel_style.display = 'none'
        },
        // 代码格式化
        code_formatting: function (code_type, is_all) {
            switch (code_type) {
                case 'html':
                    window.format_code(window.html_editor, is_all)
                    this.writeDisplayFile('html')
                    break
                case 'css':
                    window.format_code(window.css_editor, is_all)
                    this.writeDisplayFile('css')
                    break
                case 'js':
                    window.format_code(window.js_editor, is_all)
                    this.writeDisplayFile('js')
                    break
            }
        },
        editor_run_commend: function (item) {
            // console.log(item, typeof item)
            item.commend()
        },
        get_online_library: function () {
            library_name = this.library_name;
            // console.log(library_name)
            axios.get('https://api.cdnjs.com/libraries', {
                params: {
                    search: library_name,
                }
            }).then(data => {
                // console.log(data)
                this.online_library_list = data.data.results
            })
        },
        // 插入库到html_editor
        insert_library_for_online_library_to: function (library_link, target_editor) {
            tag = `<script src="${library_link}"></script>`
            source_value = window.html_editor.getValue()
            window.html_editor.setValue(tag + '\n' + source_value)
        },
        close_search_library_panel: function () {
            this.online_library_list = []
            this.search_library_panel_style.display = 'none'
            this.selected_library = 'hint_text'
        },
        // 文件排序面板函数 --start
        // 移到顶部
        sort_file_list_move_to_top: async function () {
            // 数组长度
            file_list_lenght = this.current_file_list.length
            // 要移动的次数
            count = this.sort_file_list_current_index
            // 当前要移动的文件索引
            current_index = this.sort_file_list_current_index

            temp_group_id = this.current_file_list[this.sort_file_list_current_index][3]

            for (let i = 0; i < count; i++) {
                // console.log(i, current_index, current_index + 1)
                current = this.current_file_list[current_index]
                current_down = this.current_file_list[current_index - 1]
                // console.log(i, current, current_down)
                // console.log(this.current_file_list)

                // 参数：组id、上移文件id、上移文件上面文件的id。
                let is_success = await eel.pyFun_switch_file_info(temp_group_id, current[1], current_down[1], false)

                current_index -= 1
                this.sort_file_list_current_index -= 1
                this.sort_file_list_current_index = current_index

                // 忘了await，浪费了我大半个小时(如果不加await的话，下面这个函数还没执行完，就进入了下一次循环了，然而下一次循环以来这个函数的结果。
                await this.get_file_list_from_bd()
            }
            // 提交修改：等移动完之后，再commit。如果放到循环里面的话会很慢，而且没必要
            await eel.pyFun_commit_change()
            return
        },
        // 上移
        sort_file_list_move_up: async function () {
            if (this.sort_file_list_current_index != 0) {
                temp_group_id = this.current_file_list[this.sort_file_list_current_index][3]
                // this.current_file_list[this.sort_file_list_current_index] = this.current_file_list[this.sort_file_list_current_index - 1]
                // this.current_file_list[this.sort_file_list_current_index - 1] = temp_file
                current = this.current_file_list[this.sort_file_list_current_index]
                current_up = this.current_file_list[this.sort_file_list_current_index - 1]

                // 参数：组id、上移文件id、上移文件上面文件的id。
                let is_success = await eel.pyFun_switch_file_info(temp_group_id, current[1], current_up[1])

                await this.get_file_list_from_bd()
                this.sort_file_list_current_index -= 1
                // console.log(this.current_file_list)
            }
        },
        // 下移
        sort_file_list_move_down: async function () {
            if (this.sort_file_list_current_index != this.current_file_list.length - 1) {
                temp_group_id = this.current_file_list[this.sort_file_list_current_index][3]

                current = this.current_file_list[this.sort_file_list_current_index]
                current_down = this.current_file_list[this.sort_file_list_current_index + 1]

                let is_success = await eel.pyFun_switch_file_info(temp_group_id, current[1], current_down[1])

                await this.get_file_list_from_bd()
                this.sort_file_list_current_index += 1
                // console.log(this.current_file_list)
            }
        },
        // 移到底部
        sort_file_list_move_to_bottom: async function () {
            // 数组长度
            file_list_lenght = this.current_file_list.length
            // 要移动的次数
            count = file_list_lenght - this.sort_file_list_current_index - 1
            // 当前要移动的文件索引
            current_index = this.sort_file_list_current_index

            temp_group_id = this.current_file_list[this.sort_file_list_current_index][3]

            for (let i = 0; i < count; i++) {
                // console.log(i, current_index, current_index + 1)
                current = this.current_file_list[current_index]
                current_down = this.current_file_list[current_index + 1]
                // console.log(i, current, current_down)
                // console.log(this.current_file_list)

                // 参数：组id、上移文件id、上移文件上面文件的id。
                let is_success = await eel.pyFun_switch_file_info(temp_group_id, current[1], current_down[1], false)

                current_index += 1
                this.sort_file_list_current_index += 1
                this.sort_file_list_current_index = current_index

                // 忘了await，浪费了我大半个小时(如果不加await的话，下面这个函数还没执行完，就进入了下一次循环了，然而下一次循环以来这个函数的结果。
                await this.get_file_list_from_bd()
            }
            // 提交修改：等移动完之后，再commit。如果放到循环里面的话会很慢，而且没必要
            await eel.pyFun_commit_change()
            return
        },
        // 移到底部--unuse
        sort_file_list_move_to_bottom_1: async function () {
            // 文件列表的最后一个文件
            let last_index = this.current_file_list.length - 1
            if (this.sort_file_list_current_index != last_index) {
                temp_group_id = this.current_file_list[this.sort_file_list_current_index][3]
                // this.current_file_list[this.sort_file_list_current_index] = this.current_file_list[this.sort_file_list_current_index - 1]
                // this.current_file_list[this.sort_file_list_current_index - 1] = temp_file
                current = this.current_file_list[this.sort_file_list_current_index]
                current_up = this.current_file_list[last_index]

                // 参数：组id、上移文件id、上移文件上面文件的id。
                let is_success = await eel.pyFun_switch_file_info(temp_group_id, current[1], current_up[1])

                this.get_file_list_from_bd()
                this.sort_file_list_current_index = last_index
                console.log(this.current_file_list)
            }
        },
        // 文件排序面板函数 --end

        // 垂直放大
        html_editor_fill_full_vertical: function () {
            if (this.right_side_left_up_style.height == '50%') {
                this.right_side_left_up_style.height = "102%"
                this.right_side_left_down_style.display = "none"
            } else {
                this.right_side_left_up_style.height = '50%'
                this.right_side_left_down_style.display = ""
            }
        },
        css_editor_fill_full_vertical: function () {
            if (this.right_side_right_up_style.height == '50%') {
                this.right_side_right_up_style.height = "102%"
                // this.right_side_right_down_style.display= "none"
            } else {
                this.right_side_right_up_style.height = '50%'
                // this.right_side_right_down_style.display= ""
            }
        },
        js_editor_fill_full_vertical: function () {
            if (this.right_side_left_down_style.height == '50%') {
                this.right_side_left_down_style.height = "102%"
                this.right_side_left_up_style.display = "none"
            } else {
                this.right_side_left_down_style.height = '50%'
                this.right_side_left_up_style.display = ""
            }
        },
        full_html_fill_full_vertical: function () {
            if (this.right_side_right_down_style.height == '50%') {
                this.right_side_right_down_style.height = "102%"
                this.right_side_right_up_style.display = "none"
            } else {
                this.right_side_right_down_style.height = '50%'
                this.right_side_right_up_style.display = ""
            }
        },
    }
})