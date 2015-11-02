# 一个为了前后端分离而制作的js小框架

##### 第一个版本要实现功能


* 拦截特定a标签的跳转
* 根据a标签的href自动寻找输出json的url和模板文件位置
* 可以自主选择模板引擎渲染出html代码
* 缓存模板文件
* 自定义请求header

##### 使用方法

        
        <!--引入小框架-->
        <script src="/cooperationFrame.js"></script>
        <script id="templateId" type="text/html"></script>
        <script>
            var coreObj = null;
            $(document).ready(function(){
                coreObj = cooperationFrameInit({'templateRoot': '/demo/template/'});
                coreObj.run();
            });
        </script>
        
cooperationFrameInit函数的参数是一个js对象，用于配置

配置对象key定义

    {
    
    urlError: function(XMLHttpRequest 对象、错误信息、（可选）捕获的异常对象){} //ajax拉取数据发生错误的时候的处理函数
    renderFunc: function(模板代码所在标签id, 需要渲染的json对象){return html字符串} //渲染模板函数
    templateRoot: 模板路径前缀
    jsonRoot： json页面路径前缀
    templateId: 放置模板代码的标签id
    templateSuffix: 模板路径后缀
    headers: {}//ajax请求数据的时候的自定义headers
    }

配置对默认值

    {

        'urlError': function(t1, t2, t3){alert('get error!');},
        'renderFunc': function(templateId, renderData){return template(templateId, renderData);},
        'templateRoot': '/static/template/',
        'jsonRoot': '/',
        'templateId': 'templateId',
        'templateSuffix': '.html',
        'headers': {'ajax-from-frame': 'cooperationFrame'}

    }

run方法是初始化方法，只需要运行一次


拦截的a标签需要加上自定义属性data-attr="route"

##### 如果对本框架使用有不明白的地方欢迎留言


