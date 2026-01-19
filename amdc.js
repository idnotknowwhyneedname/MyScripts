/**
 * 闲鱼综合优化脚本 (GitHub 版)
 * 功能：AMDC 降级、拦截开屏、隐藏首页回收与猜你喜欢
 */

const url = $request.url;
const ua = $request.headers["User-Agent"] || $request.headers["user-agent"];

// 1. AMDC 降级逻辑
if (url.includes("amdc.m.taobao.com")) {
    if (/(%E9%97%B2%E9%B1%BC|Alibaba|AMap|Cainiao)/.test(ua)) {
        $done({ body: "ddgksf2013" });
    } else {
        $done({});
    }
} 

// 2. 拦截开屏广告
else if (url.includes("idle.splash.ads") || url.includes("idle.ad.expose")) {
    $done({ response: { status: 200, body: "{}" } });
}

// 3. 隐藏特定模块 (猜你喜欢 & 闲鱼回收)
else if (url.includes("idlehome.home.nextfresh")) {
    let body = $response.body;
    if (body) {
        try {
            let obj = JSON.parse(body);
            if (obj.data && obj.data.sections) {
                obj.data.sections = obj.data.sections.filter(section => {
                    const tName = (section.templateName || "").toLowerCase();
                    const bType = (section.data?.bizType || "").toLowerCase();
                    const title = (section.data?.title || "").toLowerCase();
                    
                    // 匹配：回收、猜你喜欢
                    const isRecycle = tName.includes("recycle") || bType.includes("recycle") || title.includes("回收");
                    const isGuess = tName.includes("guess") || bType.includes("guess") || title.includes("喜欢");
                    
                    return !(isRecycle || isGuess);
                });
            }
            $done({ body: JSON.stringify(obj) });
        } catch (e) { $done({}); }
    } else { $done({}); }
}

else { $done({}); }
