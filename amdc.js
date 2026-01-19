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

const url = $request.url;
const ua = $request.headers["User-Agent"] || $request.headers["user-agent"];

// 1. AMDC 暴力降級 (確保不卡頓的核心)
if (url.includes("amdc.m.taobao.com")) {
    if (/(AMap|Cainiao|%E9%97%B2%E9%B1%BC|%E9%A3%9E%E7%8C%AA%E6%97%85%E8%A1%8C|%E5%96%B5%E8%A1%97|%E5%A4%A9%E7%8C%AB|Alibaba|MovieApp|Hema4iPhone|Moon|DMPortal)/.test(ua)) {
        $done({ body: "ddgksf2013" });
    } else {
        $done({});
    }
} 

// 2. 閒魚廣告接口精準處理
else if (url.includes("goofish.com/gw/mtop")) {
    // 那些會導致「漏廣告」的接口，我們不再直接攔截，而是進一步清理 Body
    if (url.includes("idlehome.home.nextfresh") || url.includes("idlemtopsearch.search")) {
        let body = $response.body;
        if (body) {
            try {
                let obj = JSON.parse(body);
                // 這裡可以加入你之前的 jq 邏輯（清空資料流中的廣告項）
                if (obj.data && obj.data.sections) {
                    obj.data.sections = obj.data.sections.filter(item => item.data && item.data.bizType === "item");
                }
                $done({ body: JSON.stringify(obj) });
            } catch (e) {
                $done({});
            }
        } else {
            $done({});
        }
    } 
    // 其他確定是廣告的接口，繼續保持靜默攔截
    else {
        const blockList = [
            "splash.ads", "idle.ad.expose", "idle.user.strategy.list",
            "idlehome.home.circle.list", "idlemtopsearch.search.shade",
            "idlemtopsearch.item.search.activate", "idle.item.recommend",
            "idle.user.page.my.adapter"
        ];
        if (blockList.some(keyword => url.includes(keyword))) {
            $done({ response: { status: 200, body: "{}" } });
        } else {
            $done({});
        }
    }
} else {
    $done({});
}
