import datetime
import os
import shutil
import eel
import random
from pathlib import Path

"""
备份文件：
每个月新建一个文件夹，用来备份。
每次启动都备份一次。
"""


@eel.expose
def pyFun_backup_database(database_name, backups_folder='auto_backups'):
    # 判断备份目录是否存在
    # 获取今天的日期
    today = datetime.datetime.today()
    # 格式示例：2020-09
    now_year_month = today.strftime('%Y-%m')

    # 程序运行目录
    current_path = os.getcwd()

    # 备份文件夹根目录
    backups_path = current_path + '/neo_web/data/databases/%s/' % backups_folder

    # 当前月份的 备份文件夹
    full_dir = backups_path + now_year_month

    # 生成5位的随机字符串，给复制后的文件名用。
    text_for_random = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
    random_text = ''.join(random.choices(text_for_random, k=5))
    # 要备份的数据库路径
    database_full_path = Path(
        current_path + '/neo_web/data/databases/'+database_name)

    # 复制后的数据库名称，格式：databasename-2020-09-29-23-56-17-aDRSz.db
    re_dababase_name = database_name.replace(
        '.db', '-'+today.strftime('%Y-%m-%d-%H-%M-%S-')+random_text+".db")
    # 目标路径
    target_path = Path("%s%s" % (full_dir+"/", re_dababase_name))
    try:
        os.mkdir(full_dir)
    except FileExistsError:
        shutil.copyfile(database_full_path, target_path)
        # shutil.copy(database_full_path, full_dir+random_text+database_name)
    return


# 删除当前数据库
# @eel.expose
# def pyFun_delete_database(database_name):
#     print(database_name)
#     pass

if __name__ == '__main__':
    pyFun_backup_database('我的代码库.db')
