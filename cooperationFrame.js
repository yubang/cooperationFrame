/**
 * 前后端分离小框架
 * author: yubang
 * version: 0.1
 * web: https://github.com/yubang/cooperationFrame
 */

/**
 * 使用文档：详细请参考 https://github.com/yubang/cooperationFrame
 *
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
        'debug': true
    };
    
    //替换默认参数
    for(var k in configs){
        baseConfig[k] = configs[k];
    }
    //清除缓存
    cooperationFrameCacheClear();
    
    /**
     * 拦截页面的所有带有data-attr属性的a标签跳转事件
     *
     */
    this.run = function(){
        if(baseConfig['debug']){
            //清除缓存
            cooperationFrameCacheClear();
        }
        $("a[data-attr='route']").on('click', handleAHref);
        
    } 
    
    /**
     * a标签跳转拦截处理函数
     */
    function handleAHref(){
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
        //调用run方法
        this.run();
    }
    
    /**
     * 封装get请求
     *
     */
    function cooperationFrameGET(url, dataObj, callbackFunc, callbackData){
        
        var cacheKey = "cooperationFrameCache_" + url;
        if(dataObj['isTemplate']){
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
        if(window.localStorage){
            return window.localStorage.getItem(cacheKey);
        }
        return null;
    }
    
    //保存缓存
    function cooperationFrameCacheSet(cacheKey, cacheValue){
        if(window.localStorage){
            window.localStorage.setItem(cacheKey, cacheValue);
        }
    }
    
    //清空缓存
    function cooperationFrameCacheClear(){
        if(window.localStorage){
            window.localStorage.clear();
        }
    }
    
    return this;
 
 }
 
