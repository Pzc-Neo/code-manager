import eel
import os,sys
# 定义html文件所在文件夹的名称
eel.init('neo_web')


@eel.expose  # 使用装饰器,类似flask里面对路由的定义
def py_fun(a):
    neo_str = ''
    for item in os.listdir(r'.'):
        neo_str += item+'<br/>'
    content = '你好！<br/>' + neo_str
    return(content)

@eel.expose
def py_getSystem():
    return sys.platform

# 测试调用js中的函数,同样需要使用回调函数
js_return = eel.js_fun('python传过去的参数')(lambda x: print(x))

# 启动的函数调用放在最后,port=0表示使用随机端口,size=(宽,高)
eel.start('main.html', port=0, size=(600, 300))
