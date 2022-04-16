import re
import eel
import time
import os
import shelve
import sqlite3
from backup_file import pyFun_backup_database
import random

# 程序运行的时候执行


def init_basic():
    # config_file 用来保存默认设置、用户设置等
    config_file_path = r'./neo_web/data/others/init_file'
    # 判断配置文件是否存在
    config_file_is_exists = os.path.isfile(config_file_path)
    # 如果不存在就创建，并且返回默认的配置列表
    if not config_file_is_exists:
        with shelve.open(config_file_path) as config_file:
            config_file['keyMap_type'] = 'vim'
            config_file['default_selected'] = {
                'group': "0"
            }
            pass
        pass
    # 如果存在就读取文件，并且返回配置列表
    else:
        with shelve.open(config_file_path) as config_file:
            # 配置文件
            config_list = {
                'keyMap_type': config_file['keyMap_type']
            }
        return config_list

    # 如果文件存在
    # 如果文件不存在就创建
    pass
# from database_handler import dbFun_insertValue


# 程序启动时执行 --start
# 连接数据库
db_codelist = sqlite3.connect('./neo_web/data/databases/codelist.db')
# 创建游标
curs_codelist = db_codelist.cursor()
# 程序启动时执行 --end

# 连接数据库(切换数据库的时候使用)


@eel.expose
def pyFun_connect_database(database_name):
    global db_codelist, curs_codelist
    # 关闭原来的数据库以及其游标
    curs_codelist.close()
    db_codelist.close()
    # 连接目标数据库
    db_codelist = sqlite3.connect('./neo_web/data/databases/'+database_name)
    # 创建游标
    curs_codelist = db_codelist.cursor()
    return '切换数据库成功'

# pyFun_connect_database()


@eel.expose
def pyFun_get_database_list():

    list1 = list(os.walk('./neo_web/data/databases'))

    # 数据库列表
    database_list = list1[0][2]
    return database_list


# 创建数据库
# def dbFun_creatable():
@eel.expose
def pyFun_creat_database(database_name):
    new_database_path = './neo_web/data/databases/'+database_name+'.db'
    is_exists = os.path.exists(new_database_path)

    # 如果数据库已存在就不创建
    if is_exists:
        # print("数据库已存在")
        return "exist"
    # try:
    # 连接数据库
    db_codelist = sqlite3.connect(new_database_path)

    # 创建游标
    curs_codelist = db_codelist.cursor()

    # 创建一个名为 codelist 的表，包含 id,name,age,sex字段
    sql_create_table = '''
    CREATE TABLE IF NOT EXISTS codelist(
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        group_name TEXT NOT NULL,
        group_id TEXT NOT NULL,
        group_is_active INT(1) NOT NULL,
        file_name TEXT NOT NULL,
        file_id TEXT NOT NULL,
        file_is_active INT(1) NOT NULL,
        html_code TEXT NOT NULL,
        css_code TEXT NOT NULL,
        js_code TEXT NOT NULL,
        created_time DATETIME NOT NULL
    );
    '''
    # 执行sql语句
    curs_codelist.execute(sql_create_table)

    # 提交修改
    db_codelist.commit()

    curs_codelist.close()
    db_codelist.close()
    return True
    # except:
    #     return False


# 插入数据
@eel.expose
def pyFun_db_insertValue(group_name, group_id, group_is_active, file_name, file_id, file_is_active, html_code, css_code, js_code):
    # db_codelist = sqlite3.connect('./neo_web/data/codelist.db')

    # curs_codelist = db_codelist.cursor()

    # values那里用 ? 号的形式占位的话，sqlite会自动转移内容里面的特殊字符
    sql_insert_value = '''
    INSERT INTO codelist(group_name,group_id,group_is_active,file_name,file_id,file_is_active,html_code,css_code,js_code,created_time) VALUES (?,?,?,?,?,?,?,?,?,?);
    '''

    # 创建时间
    created_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

    # 执行sql语句
    curs_codelist.execute(sql_insert_value, (group_name, group_id, group_is_active,
                                             file_name, file_id, file_is_active, html_code, css_code, js_code, created_time))

    # 提交修改
    db_codelist.commit()

    # curs_codelist.close()
    # db_codelist.close()


"""
如果js文件比较大的话，执行这一步的时候会很慢。
查看源码发现是下面那一步慢：
matches = EXPOSED_JS_FUNCTIONS.parseString(contents).asList()

"""
eel.init('neo_web')

# 读取数据库，并传给前端js
@eel.expose
def pyFun_readCurrentFile(group_id, file_id):
    css_cursor = curs_codelist.execute(
        "SELECT css_code from codelist WHERE group_id=? AND file_id=?", (group_id, file_id))
    # "SELECT css_code from codelist WHERE group_id='default01' AND file_id='fileid01'")
    current_css = css_cursor.fetchone()[0]

    html_cursor = curs_codelist.execute(
        "SELECT html_code from codelist WHERE group_id=? AND file_id=?", (group_id, file_id))
    # "SELECT html_code from codelist WHERE group_id='default01' AND file_id='fileid01'")
    current_html = html_cursor.fetchone()[0]

    js_cursor = curs_codelist.execute(
        "SELECT js_code from codelist WHERE group_id=? AND file_id=?", (group_id, file_id))
    # "SELECT js_code from codelist WHERE group_id='default01' AND file_id='fileid01'")
    current_js = js_cursor.fetchone()[0]

    current_file = {
        'current_css': current_css,
        'current_html': current_html,
        'current_js': current_js
    }
    # print('current_file::::',current_file)
    return current_file

# 从数据库获取文件的所有信息


@eel.expose
def pyFun_get_file_info_all(group_id, file_id):
    file_info_all = curs_codelist.execute(
        "SELECT * from codelist WHERE group_id=? AND file_id=?", (group_id, file_id)).fetchall()
    # print(file_info_all)
    return file_info_all


# 修改子文件
def changeFile(file_path, change_data):
    """
    file_path：要修改的文件的路径。
    change_data：要修改成什么内容。
    """

    # 修改子文件
    with open(file_path, 'w', encoding='utf-8') as current_css:
        current_css.write(change_data)


# 修改数据库内容(当代码编辑框的内容改变的时候修改。)
@eel.expose
def pyFun_writeCurrentFile(data_type, change_data, group_id, file_id):
    # print('-----------------------------------------------------\n',
    #       data_type, change_data, group_id, file_id)

    # print('---------------------------------')
    # print(data_type, change_data, group_id, file_id)
    # print('---------------------------------')
    if(data_type == 'css'):
        # 修改数据库
        # temp_change_data = "'"+change_data+"'"
        curs_codelist.execute(
            "UPDATE codelist SET css_code=? WHERE group_id=? AND file_id=?", (change_data, group_id, file_id))

        # 提交修改
        db_codelist.commit()

        # 修改current.css文件
        changeFile('./neo_web/current_source/current.css', change_data)

    elif(data_type == 'html'):

        temp_content = ''
        # 读取display.html文件里面的代码，并且替换内容
        with open('./neo_web/current_source/display.html', 'r', encoding='utf-8') as display_file:
            temp_file = display_file.read()

            # 把display.html里面相应标签的内容，替换成前端传过来的内容。
            temp_content = re.sub(r'<!-- neo_front_end_snippets_tool_body_start -->[\s\S]*<!-- neo_front_end_snippets_tool_body_end -->', '<!-- neo_front_end_snippets_tool_body_start -->\n%s\n<!-- neo_front_end_snippets_tool_body_end -->' %
                                  change_data, temp_file, flags=re.M | re.S)

        # 修改display.html文件
        # with open('./neo_web/current_source/display.html', 'w', encoding='utf-8') as display_file:
        #     display_file.write(temp_content)
        changeFile('./neo_web/current_source/display.html', temp_content)

        # 修改数据库
        # temp_change_data = "'"+change_data+"'"
        curs_codelist.execute(
            "UPDATE codelist SET html_code =? WHERE group_id=? AND file_id=?", (change_data, group_id, file_id))
        # "UPDATE codelist SET html_code =? WHERE group_id='default01' AND file_id='fileid01'", (change_data,))

        # curs_codelist.execute(
        #     "UPDATE codelist SET html_code =%s WHERE group_id='default01' AND file_id='fileid01'" % temp_change_data)
        # 提交修改
        db_codelist.commit()

        # 修改current.html文件
        changeFile('./neo_web/current_source/current.html', change_data)

    elif(data_type == 'js'):

        # 修改数据库
        # temp_change_data = "'"+change_data+"'"
        curs_codelist.execute(
            "UPDATE codelist SET js_code =? WHERE group_id=? AND file_id=?", (change_data, group_id, file_id))
        # "UPDATE codelist SET js_code =? WHERE group_id='default01' AND file_id='fileid01'", (change_data,))

        # 提交修改
        db_codelist.commit()

        # 修改current.js文件
        changeFile('./neo_web/current_source/current.js', change_data)
    else:
        pass


@eel.expose
def pyFun_writeCurrentFile_backup(data_type, change_data):

    if(data_type == 'css'):
        # 修改display.html 和 current.css文件
        changeFile('./neo_web/current_source/current.css',
                   change_data)

    elif(data_type == 'html'):

        temp_content = ''
        # 读取display.html文件里面的代码，并且替换内容
        with open('./neo_web/current_source/display.html', 'r', encoding='utf-8') as display_file:
            temp_file = display_file.read()

            # 把display.html里面相应标签的内容，替换成前端传过来的内容。
            temp_content = re.sub(r'<body>[\s\S]*<!-- body -->', '<body>%s<!-- body -->' %
                                  change_data, temp_file, flags=re.M | re.S)

        # 修改display.html文件
        with open('./neo_web/current_source/display.html', 'w', encoding='utf-8') as display_file:
            display_file.write(temp_content)

        # 修改current.html文件
        changeFile('./neo_web/current_source/current.html', change_data)

    elif(data_type == 'js'):

        # 修改current.js文件
        changeFile('./neo_web/current_source/current.js', change_data)
    else:
        pass

# --un-use


@eel.expose
def pyFun_save_file(data, data_id):
    print('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
    print('进入文件保存函数')
    print('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

    with shelve.open("./neo_web/data/others/basic_data") as file:
        # print(type(data))
        try:
            file[data_id] = data
            return 1
        except:
            return 0


# 获取所有分组的 名称 以及 id
@eel.expose
def pyFun_get_group_list_from_bd():

    # temp_group_list = curs_codelist.execute(
    #     'SELECT group_name,group_id FROM codelist WHERE group_id in (SELECT DISTINCT group_id FROM codelist)').fetchall()

    # DISTINCT 关键字：返回group_name以及group_id都不重复的值
    temp_group_list = curs_codelist.execute(
        'SELECT DISTINCT group_name,group_id FROM codelist').fetchall()

    # print("temp_group_list:", temp_group_list)
    return temp_group_list


# 从数据库中获取当前组文件列表
@eel.expose
def pyFun_get_file_list_from_bd(current_group_id):
    file_list = curs_codelist.execute(
        'SELECT file_name,file_id,created_time,group_id FROM codelist WHERE group_id="%s"' % current_group_id).fetchall()
    return file_list

# 获取所有文件


@eel.expose
def pyFun_get_all_file_from_db(database):
    all_file_list = curs_codelist.execute(
        'SELECT file_name,file_id,created_time,group_id FROM codelist').fetchall()
    return all_file_list


# 删除文件


@eel.expose
def pyFun_delete_file_from_bd(group_id, file_id):
    try:
        curs_codelist.execute(
            'DELETE from codelist where group_id=? AND file_id=?', (group_id, file_id))

        # 提交修改
        db_codelist.commit()
        return True
    except:
        return False

# 删除分组


@eel.expose
def pyFun_delete_group_from_bd(group_id):
    try:
        curs_codelist.execute(
            'DELETE from codelist where group_id=?', (group_id,))

        # 提交修改
        db_codelist.commit()

        return True
    except:
        return False

# 通过分组id和文件id获取文件的所有信息


@eel.expose
def pyFun_get_data_from_bd(current_group_id, current_file_id):
    """
   current_group_id：当前分组id。
   current_file_id：当前文件id。
    """
    data = curs_codelist.execute(
        'SELECT * FROM codelist WHERE group_id=? AND file_id=?', (current_group_id, current_file_id)).fetchall()
    return data

# 分组搜索框改变时调用


@eel.expose
def pyFun_get_search_group_list_from_bd(file_name_text):
    """
   file_name_text：要搜索的字符串。
    """
    data = curs_codelist.execute(
        'SELECT DISTINCT group_name,group_id FROM codelist WHERE group_name like ?', (file_name_text,)).fetchall()
    return data

# 文件搜索框改变时调用


@eel.expose
def pyFun_get_search_file_list_from_bd(current_group_id, file_name_text):
    """
   current_group_id：当前分组id。
   file_name_text：要搜索的字符串。
    """
    data = curs_codelist.execute(
        'SELECT file_name,file_id,created_time,group_id FROM codelist WHERE group_id=? AND file_name like ?', (current_group_id, file_name_text)).fetchall()
    return data


# 处在“所有文件”状态下，并且文件搜索框改变时调用

@eel.expose
def pyFun_get_search_file_list_from_bd_by_search_text(file_name_text):
    """
   current_group_id：当前分组id。
   file_name_text：要搜索的字符串。
    """
    data = curs_codelist.execute(
        'SELECT file_name,file_id,created_time,group_id FROM codelist WHERE file_name like ?', (file_name_text,)).fetchall()
    # print('data:', data)
    return data


# 通过文件id获取所属分组id
@eel.expose
def pyFun_get_group_id_from_bd(current_file_id):
    """
   current_file_id：当前文件id。
    """
    data = curs_codelist.execute(
        'SELECT group_id FROM codelist WHERE file_id=?', (current_file_id,)).fetchall()
    return data

# 修改文件名


@eel.expose
def pyFun_change_file_name(group_id, file_id, new_name):

    try:
        curs_codelist.execute(
            "UPDATE codelist SET file_name=? WHERE group_id=? AND file_id=?", (new_name, group_id, file_id))

        # 提交修改
        db_codelist.commit()
        return True
    except:
        return False


# 交换两行数据
@eel.expose
def pyFun_switch_file_info(current_group_id, current_file_id, current_up_file_id, is_commit=True):

    # 获取要上移的文件的主id(不是文件id)
    current_id = curs_codelist.execute(
        'SELECT id FROM codelist WHERE group_id=? AND file_id=?', (current_group_id, current_file_id)).fetchall()[0][0]
    # 获取要上移的文件的上一个文件的主id
    current_up_id = curs_codelist.execute(
        'SELECT id FROM codelist WHERE group_id=? AND file_id=?', (current_group_id, current_up_file_id)).fetchall()[0][0]

    try:
        # 把要上移的文件的主id 修改成sqlite最大值(临时的,因为如果改成此文件的上一个文件的id的话，会和上一个文件的id重复，导致错误)
        curs_codelist.execute(
            "UPDATE codelist SET id=? WHERE group_id=? AND file_id=?", (9223372036854775807, current_group_id, current_file_id))

        # 把要上移的文件的上一个文件的主id，改成要上移的文件的id
        curs_codelist.execute(
            "UPDATE codelist SET id=? WHERE group_id=? AND file_id=?", (current_id, current_group_id, current_up_file_id))

        # 把要上移的文件的主id 修改出成文件上面的文件的主id
        curs_codelist.execute(
            "UPDATE codelist SET id=? WHERE group_id=? AND file_id=?", (current_up_id, current_group_id, current_file_id))

        # curs_codelist.execute(
        #     "UPDATE codelist SET file_name=? WHERE group_id=? AND file_id=?", (new_name, group_id, file_id))

        if(is_commit == True):
            # 提交修改
            db_codelist.commit()
            return True
    except Exception as e:
        print("erro", e)
        return False
# commit


@eel.expose
def pyFun_commit_change():
    db_codelist.commit()


# 交换两组位置
@eel.expose
def pyFun_switch_group_info(current_group_id, current_group_up_id):

    # 获取要上移的组的主id(不是组id)
    current_id = curs_codelist.execute(
        'SELECT id FROM codelist WHERE group_id=?', (current_group_id,)).fetchall()[0][0]
    # 获取要上移的组的上一个组的主id
    current_up_id = curs_codelist.execute(
        'SELECT id FROM codelist WHERE group_id=?', (current_group_up_id,)).fetchall()[0][0]

    try:
        # 把要上移的组的主id 修改成sqlite最大值(临时的,因为如果改成此组的上一个文件的组的话，会和上一个组的id重复，导致错误)
        curs_codelist.execute(
            "UPDATE codelist SET id=? WHERE id=?", (9223372036854775807, current_id))

        # 把要上移的组的上一个组的主id，改成要上移的组的id
        curs_codelist.execute(
            "UPDATE codelist SET id=? WHERE id=?", (current_id, current_up_id))

        # 把要上移的组的主id 修改出成文件上面的组的主id
        curs_codelist.execute(
            "UPDATE codelist SET id=? WHERE id=?", (current_up_id, 9223372036854775807))

        # curs_codelist.execute(
        #     "UPDATE codelist SET file_name=? WHERE group_id=? AND file_id=?", (new_name, group_id, file_id))

        # 提交修改
        db_codelist.commit()

        return True
    except Exception as e:
        print("erro", e)
        return False

# 打开资源文件夹窗口


@eel.expose
def pyFun_open_file_explorer(file_path):
    cwd = os.getcwd()
    os.startfile(cwd+file_path)

# 修改分组名


@eel.expose
def pyFun_change_group_name(group_id, new_name):

    try:
        curs_codelist.execute(
            "UPDATE codelist SET group_name=? WHERE group_id=? ", (new_name, group_id))

        # 提交修改
        db_codelist.commit()
        return True
    except:
        return False

# 启动应用

def start_app(port=8002):
    app_width = 1375
    app_height = 820
    # 尝试用chrome启动，如果用户没有安装，就用edge启动
    try:
        # eel.start('index.html', size=(1375, 820), mode='edge', port=port)
        eel.start('index.html', size=(app_width, app_height), port=port)
    except FileNotFoundError:
        try:
            eel.start('index.html', size=(app_width, app_height),
                      mode='edge', port=port)
        # edge也没有的话就用360极速
        except FileNotFoundError:
            eel.start('index.html', size=(app_width, app_height),
                      mode='360chrome', port=port)

    # OSError包含的错误种类很多，但是在这里一般是端口号错误
    # 如果端口号已被使用，就加1 之后 再尝试启动
    except OSError:
        port = 8000 + random.randint(1, 99)
        # 未解决的问题：eel貌似没有提供关闭窗口的函数，所以执行这一步的时候，原来的窗口不会关闭，会直接打开一个新的窗口。
        start_app(port)

    # 程序退出的时候，关闭游标和数据库连接
    except SystemExit as e:
        # 关闭游标
        curs_codelist.close()
        # 关闭数据库
        db_codelist.close()

start_app()
