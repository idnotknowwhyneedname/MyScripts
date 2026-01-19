/***********************************************
amdc脚本

***********************************************/
/**
 * 闲鱼 (Goofish) 综合去广告 & 协议降级脚本
 * 作用：拦截广告、闲鱼币、策略流，并强制降级 AMDC 调度至 HTTPS (解决卡顿)
 */

const url = $request.url;

// 1. 处理 AMDC 调度 (防止走加密的 QUIC 协议)
if (url.includes("amdc.m.taobao.com")) {
    if (typeof $response !== "undefined" && $response.body) {
        let body = $response.body;
        // 强制将 http3, h3, quic 的开启标志改为 false
        body = body.replace(/\"(http3|h3|quic)\":\s*\"true\"/g, '\"$1\":\"false\"');
        $done({ body });
    } else {
        $done({});
    }
} 
// 2. 拦截闲鱼广告与冗余接口
else if (url.includes("goofish.com/gw/mtop")) {
    const blockList = [
        "splash.ads",                // 开屏广告
        "idle.ad.expose",            // 广告曝光埋点
        "idle.user.strategy.list",   // 用户行为策略
        "idlehome.home.circle.list", // 闲鱼币/鱼塘圈子
        "idlemtopsearch.search.shade", // 搜索框阴影/热搜词
        "idlemtopsearch.item.search.activate", // 红包弹窗
        "idle.item.recommend",       // 推荐流推广
        "idle.user.page.my.adapter", // 我的页面冗余模块
        "idle.local.home"            // 附近频道的广告流
    ];

    if (blockList.some(keyword => url.includes(keyword))) {
        // 直接返回 HTTP 200 和空 JSON，不请求服务器，提升速度
        $done({ response: { status: 200, body: "{}" } });
    } else {
        $done({});
    }
} 
// 3. 其他请求放行
else {
    $done({});
}
