/***********************************************
amdc脚本

***********************************************/
/**
 * 修复版闲鱼/阿里系去广告脚本
 * 作用：绕过图片和正常业务，仅拦截包含 splash (开屏) 或 ad (广告) 的/**
 * 合并版：AMDC 调度 + 闲鱼去广告
 /**
 * 合并版脚本：AMDC 调度优化 + 闲鱼精准去广告 (提速版)
 * 适用于：Shadowrocket (小火箭)
 */

const url = $request.url;
const isAMDC = url.includes("amdc/mobileDispatch");
const isGoofish = url.includes("goofish.com/gw/mtop");

// --- 1. 闲鱼广告/干扰项拦截逻辑 ---
if (isGoofish) {
    const blockList = [
        "splash.ads",                // 开屏广告
        "idle.ad.expose",            // 广告曝光记录
        "idle.user.strategy.list",   // 用户引导策略
        "idlehome.home.circle.list", // 首页闲鱼币/圈子/任务引导
        "idlemtopsearch.search.shade", // 搜索框遮罩/文字广告
        "idlemtopsearch.item.search.activate", // 搜索页红包弹窗
        "idle.item.recommend",       // 推荐流里的推广位
        "idle.user.page.my.adapter"  // 我的页面中的推广位
    ];

    if (blockList.some(keyword => url.includes(keyword))) {
        // 发现广告/干扰，返回空数据，让 App 无法显示该模块
        $done({ status: "HTTP/1.1 200 OK", body: "{}" });
    } else {
        // 正常商品信息和图片，不拦截
        $done({});
    }
} 

// --- 2. AMDC 调度逻辑 (强制降级 HTTPS，去广告的基础) ---
else if (isAMDC) {
    let body = $response.body;
    if (body) {
        // 替换调度指令，禁用 HTTP3/QUIC 协议
        body = body.replace(/\"http3\":\s*\"true\"/g, '\"http3\":\"false\"');
        body = body.replace(/\"h3\":\s*\"true\"/g, '\"h3\":\"false\"');
        body = body.replace(/\"quic\":\s*\"true\"/g, '\"quic\":\"false\"');
        $done({ body });
    } else {
        $done({});
    }
} 

// --- 3. 兜底放行 (防止其他请求卡死) ---
else {
    $done({});
}
