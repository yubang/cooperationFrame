/**
 * 前后端分离小框架
 * author: yubang
 * version: 0.1
 * web: https://github.com/yubang/cooperationFrame
 */

/**
 * 使用文档：详细请参考 https://github.com/yubang/cooperationFrame
 * 依赖jquery
 * 对外提供函数
 * run()
 * gotoUrl(模拟跳转到的页面url)
 * reload([是否清空缓存，默认为false])
 */
 
 
/**
 * 初始化框架
 * @param config 配置信息（js对象）
 * @return 框架核心对象
 */
 function cooperationFrameInit(configs){
    
    //默认配置
    var baseConfig = {
        'urlError': function(t1, t2, t3){alert('get error!');},
        'renderFunc': function(templateId, renderData){return template(templateId, renderData);},
        'templateRoot': '/static/template/',
        'jsonRoot': '/',
        'templateId': 'templateId',
        'templateSuffix': '.html',
        'headers': {'ajax-from-frame': 'cooperationFrame'},
        'debug': true,
        'spa': false,
        'loadingFunc': function(){},
    };
    
    //内部初始化函数
    function cooperationFrameRun(){
        //替换默认参数
        for(var k in configs){
            baseConfig[k] = configs[k];
        }
        
        //处理后退事件
        if(!baseConfig['spa']){
            window.addEventListener('popstate', function(e) {     
　　　　    	this.gotoUrl(location.pathname);
 　　    });
        }
        
        //记录标题（sessionLocation）
        cooperationFrameCacheSet("cooperationFrameTitleCache_"+location.pathname, document.title);
        
    }
    
    
    
    /**
     * 拦截页面的所有带有data-attr属性的a标签跳转事件
     *
     */
    this.run = function(){
        $("a[data-attr='route']").on('click', handleAHref);
    } 
    
    
    /**
     * 模拟触发框架执行的跳转
     * @param targetUrl 要跳转的目标url
     */
    this.gotoUrl = function(targetUrl){
        $("body").html("<a cooperation-frame-a='temp' data-cooperationFrame-label='true' href='"+targetUrl+"' data-attr='route' data-title='"+cooperationFrameCacheGet("cooperationFrameTitleCache_"+targetUrl)+"'></a>");
        this.run();
        $("a[cooperation-frame-a='temp']").trigger("click");
    }
    
    /**
     * 重新加载本页面
     * @param 第一个参数默认值为false（是否清空缓存）
     */
    this.reload = function(){
        var clearCacheSign = arguments[0] ? arguments[0] : false;
        if(clearCacheSign){
            //清空缓存的刷新
            cooperationFrameCacheClear();
        }
        gotoUrl(location.pathname);
    }
    
    /**
     * a标签跳转拦截处理函数
     */
    function handleAHref(){
    
        //初始化动画
        baseConfig['loadingFunc']();
        
        //拉取模板文件和json数据
        var url = $(this).attr('href');
        getJsonFromUrl(url, getTemplateFromUrl, $(this));
        return false;
    }
    
    /*
     *拉取json数据
     *处理完成以后拉取模板文件
     */
    function getJsonFromUrl(baseUrl, getTemplateFunc, aObj){
        var url = baseUrl;
        if(url[0] == "/"){
            url = "." + url;
        }
        var jsonUrl = baseConfig['jsonRoot'] + url;
        var templateUrl = baseConfig['templateRoot'] + url + baseConfig['templateSuffix'];
        cooperationFrameGET(jsonUrl, {}, getTemplateFunc, {"templateUrl": templateUrl, 'baseUrl': baseUrl, 'aObj': aObj});
    }
    
    /**
     * 拉取模板数据
     * 处理完成后回调渲染函数
     * @param data cooperationFrameGETResponse对象
     */
    function getTemplateFromUrl(data){
    
        //处理特殊情况（例如后台的情况）
        if(typeof data['html'] != 'object'){
            var tempObj = document.createElement("html");
            tempObj.innerHTML = data['html'];
            $("body").html($(tempObj).find("body").html());
            //修改标题
            var title = data['data']['aObj'].attr('data-title') == undefined ? '' : data['data']['aObj'].attr('data-title');
            document.title = title;
            //添加拦截
            this.run();
            return;
        }
    
        var callbackObj = {};
        callbackObj['jsonData'] = data['html'];
        callbackObj['baseUrl'] = data['data']['baseUrl'];
        callbackObj['aObj'] = data['data']['aObj'];
        cooperationFrameGET(data['data']['templateUrl'], {'isTemplate': true}, renderTemplateUseData, callbackObj);
    }
    
    /**
     * 渲染dom函数
     * @param data cooperationFrameGETResponse对象
     */
    function renderTemplateUseData(data){
        $("#"+baseConfig['templateId']).html(data['html']);
        var html = cooperationFrameRender(baseConfig['templateId'], data['data']['jsonData']);
        $("body").html(html);
        //修改浏览器标题
        var title = data['data']['aObj'].attr('data-title') == undefined ? '' : data['data']['aObj'].attr('data-title');
        document.title = title;
        //记录标题（sessionLocation）
        cooperationFrameCacheSet("cooperationFrameTitleCache_"+data['data']['baseUrl'], title);
        //是否需要修改浏览器url
        if(!baseConfig['spa'] && !data['data']['aObj'].attr("data-cooperationFrame-label")){
            window.history.pushState(null, title, data['data']['baseUrl']);
        }
        
        //调用run方法
        this.run();
    }
    
    
    /**
     * 封装get请求
     *
     */
    function cooperationFrameGET(url, dataObj, callbackFunc, callbackData){
        
        var cacheKey = "cooperationFrameCache_" + url;
        if(dataObj['isTemplate'] && !baseConfig['debug']){
            //获取缓存
            var cacheData = cooperationFrameCacheGet(cacheKey);
            if(cacheData){
                var tempData = {'html': cacheData, 'data': callbackData};
                callbackFunc(tempData);
                return;
            }
        }
        
        $.ajax({
            'method': "get",
            'url': url,
            'data': {},
            'cache': !baseConfig['debug'],
            'headers': baseConfig['headers'],
            success: function(data){
                if(dataObj['isTemplate']){
                    //保存缓存
                    cooperationFrameCacheSet(cacheKey, data);
                }
                var tempData = {'html': data, 'data': callbackData};
                callbackFunc(tempData);
            },
            error: function(t1, t2, t3){
                baseConfig['urlError'](t1, t2, t3);
            }
        });
        
    }
    
    /**
     * 渲染模板
     * @param templateId 模板代码id
     * @param renderData 需要渲染的js对象
     * @return 渲染好的html代码
     */
    function cooperationFrameRender(templateId, renderData){
        return baseConfig['renderFunc'](templateId, renderData);
    }
    
    
    //获取缓存
    function cooperationFrameCacheGet(cacheKey){
        if(window.sessionStorage){
            return window.sessionStorage.getItem(cacheKey);
        }
        return null;
    }
    
    //保存缓存
    function cooperationFrameCacheSet(cacheKey, cacheValue){
        if(window.sessionStorage){
            window.sessionStorage.setItem(cacheKey, cacheValue);
        }
    }
    
    //清空缓存
    function cooperationFrameCacheClear(){
        if(window.sessionStorage){
            window.sessionStorage.clear();
        }
    }
    
    cooperationFrameRun();
    return this;
 
 }
 
