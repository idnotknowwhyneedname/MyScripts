/***********************************************
amdc脚本

***********************************************/
/**
 * 修复版闲鱼/阿里系去广告脚本
 * 作用：绕过图片和正常业务，仅拦截包含 splash (开屏) 或 ad (广告) 的/**
 * 合并版：AMDC 调度 + 闲鱼去广告
 */

const url = $request.url;

// --- 1. 闲鱼去广告逻辑 ---
if (url.includes("goofish.com")) {
    const blockList = [
        "splash.ads",
        "idle.ad.expose",
        "idle.user.strategy.list",
        "idlehome.home.circle.list",
        "idlemtopsearch.search.shade",
        "idle.item.recommend"
    ];
    if (blockList.some(keyword => url.includes(keyword))) {
        $done({ status: "HTTP/1.1 200 OK", body: "{}" });
    } else {
        $done({});
    }
} 
// --- 2. 你的原始 AMDC 逻辑 ---
else if (url.includes("amdc.m.taobao.com")) {
    // 这里放你原本 amdc.js 里的代码内容
    // ... 原有代码 ...
} 
// --- 3. 兜底放行 ---
else {
    $done({});
}
