/***********************************************
amdc脚本

***********************************************/
/**
 * 闲鱼 (Goofish) 综合去广告 & 协议降级脚本
 * 作用：拦截广告、闲鱼币、策略流，并强制降级 AMDC 调度至 HTTPS (解决卡顿)
 */
/**
 * 閒魚綜合版：暴力降級 (解決卡頓) + 精準去廣告 (處理 Body)
 */

/**
 * 闲鱼精简版：仅拦截开屏、隐藏猜你喜欢、隐藏闲鱼回收
 */

const url = $request.url;
const ua = $request.headers["User-Agent"] || $request.headers["user-agent"];

// 1. AMDC 暴力降级 (确保不卡顿，确保脚本生效)
if (url.includes("amdc.m.taobao.com")) {
    if (/(%E9%97%B2%E9%B1%BC|Alibaba)/.test(ua)) {
        $done({ body: "ddgksf2013" });
    } else {
        $done({});
    }
} 

// 2. 拦截开屏广告
else if (url.includes("idle.splash.ads") || url.includes("idle.ad.expose")) {
    $done({ response: { status: 200, body: "{}" } });
}

// 3. 动态隐藏：猜你喜欢 & 闲鱼回收
else if (url.includes("idlehome.home.nextfresh")) {
    let body = $response.body;
    if (body) {
        try {
            let obj = JSON.parse(body);
            if (obj.data && obj.data.sections) {
                obj.data.sections = obj.data.sections.filter(section => {
                    const templateName = section.templateName || "";
                    const bizType = section.data?.bizType || "";
                    
                    // 过滤掉包含“回收”或“猜你喜欢”特征的模块
                    const isRecycle = templateName.includes("recycle") || bizType.includes("recycle");
                    const isGuessLike = templateName.includes("guess") || bizType.includes("guess");
                    
                    return !(isRecycle || isGuessLike);
                });
            }
            $done({ body: JSON.stringify(obj) });
        } catch (e) {
            $done({});
        }
    } else {
        $done({});
    }
}

else {
    $done({});
}
