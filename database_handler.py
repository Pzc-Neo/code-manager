import time
import sqlite3

# 创建表格


def dbFun_creatTable():
    # 连接数据库
    db_codelist = sqlite3.connect('./data/codelist.db')

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
        js_code TEXT NOT NULL
    );
    '''
    # 执行sql语句
    curs_codelist.execute(sql_create_table)

    db_codelist.commit()

    curs_codelist.close()
    db_codelist.close()


# 插入数据
def dbFun_insertValue(group_name, group_id, group_is_active, file_name, file_id, file_is_active, html_code, css_code, js_code):
    db_codelist = sqlite3.connect('./data/codelist.db')

    curs_codelist = db_codelist.cursor()

    # 数据加引号
    group_name = "'"+group_name+"'"
    group_id = "'"+group_id+"'"
    group_is_active = group_is_active
    file_name = "'"+file_name+"'"
    file_id = "'"+file_id+"'"
    file_is_active = file_is_active
    html_code = "'"+html_code+"'"
    css_code = "'"+css_code+"'"
    js_code = "'"+js_code+"'"

    # 向 codelist 插入一行数据
    sql_insert_value = '''
    INSERT INTO codelist(group_name,group_id,group_is_active,file_name,file_id,file_is_active,html_code,css_code,js_code) VALUES ({group_name},{group_id},{group_is_active},{file_name},{file_id},{file_is_active},{html_code},{css_code},{js_code})
    '''.format(group_name=group_name, group_id=group_id, group_is_active=group_is_active, file_name=file_name, file_id=file_id, file_is_active=file_is_active, html_code=html_code, css_code=css_code, js_code=js_code)

    # print(sql_insert_value)

    # 执行sql语句
    curs_codelist.execute(sql_insert_value)

    db_codelist.commit()

    curs_codelist.close()
    db_codelist.close()


def dbFun_insertValue_test():
    db_codelist = sqlite3.connect('codelist.db')

    curs_codelist = db_codelist.cursor()

    start_time = time.time()

    for i in range(1, 1000000):
        # 向 codelist 插入一行数据
        sql_insert_value = '''
        INSERT INTO codelist(id,name,age,sex) VALUES (%d,'neo%d',28,0)
        ''' % (i, i)

        # 执行sql语句
        curs_codelist.execute(sql_insert_value)

    end_time = time.time()
    spend_time = end_time-start_time
    print('花费时间：', spend_time)

    db_codelist.commit()

    curs_codelist.close()
    db_codelist.close()


if __name__ == '__main__':
    # dbFun_creatTable()
    # dbFun_insertValue_test()
    dbFun_insertValue('dfsaf', 'fdskalj1', 0, '文件名1321312',
                      'fdskfjdlksajlkf11213', 0, '<div>dkfjkdlsajf</div>', 'h1{sakfdjslkaj}', 'const test=function(){return 0}')
