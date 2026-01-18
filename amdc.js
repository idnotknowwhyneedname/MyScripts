/***********************************************
amdc脚本

***********************************************/
/**
 * 修复版闲鱼/阿里系去广告脚本
 * 作用：绕过图片和正常业务，仅拦截包含 splash (开屏) 或 ad (广告) 的请求
 */
/**
/**
 * 闲鱼精简版 - 兼顾速度与去广告
 */
const url = $request.url;

// 1. 严格拦截：这些接口全是广告或多余的动态卡片
const blockList = [
    "splash.ads",                // 开屏广告
    "idle.ad.expose",            // 广告曝光记录
    "idle.user.strategy.list",   // 用户引导策略
    "idlehome.home.circle.list", // 首页闲鱼币/圈子引导
    "idlemtopsearch.search.shade", // 搜索框遮罩广告
    "idle.item.recommend"        // 推荐流里的推广位
];

// 检查 URL 是否包含黑名单中的关键词
const shouldBlock = blockList.some(keyword => url.includes(keyword));

if (shouldBlock) {
    // 发现干扰项，直接拦截
    $done({ status: "HTTP/1.1 200 OK", body: "{}" });
} else {
    // 正常业务和图片，放行
    $done({});
}

