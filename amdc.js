/***********************************************
amdc脚本

***********************************************/
/**
 * 修复版闲鱼/阿里系去广告脚本
 * 作用：绕过图片和正常业务，仅拦截包含 splash (开屏) 或 ad (广告) 的/**
 * 合并版：AMDC 调度 + 闲鱼去广告
 /**
/**
 * 閒魚去廣告最終版 - 兼顧速度與穩定性
 */
const url = $request.url;

// 1. 判斷是否為閒魚數據接口
if (url.includes("goofish.com/gw/mtop")) {
    // 嚴格攔截清單：廣告、閒魚幣、推薦流、搜索遮罩
    const blockList = [
        "splash.ads",                // 開屏廣告
        "idle.ad.expose",            // 廣告曝光
        "idle.user.strategy.list",   // 用戶策略
        "idlehome.home.circle.list", // 閒魚幣/圈子
        "idlemtopsearch.search.shade", // 搜索框廣告
        "idlemtopsearch.item.search.activate", // 紅包彈窗
        "idle.item.recommend",       // 推薦流推廣
        "idle.user.page.my.adapter"  // 我的頁面廣告
    ];

    if (blockList.some(keyword => url.includes(keyword))) {
        // 攔截並返回空 JSON
        $done({ status: "HTTP/1.1 200 OK", body: "{}" });
    } else {
        // 正常商品數據放行
        $done({});
    }
} 
// 2. 處理 AMDC 降級 (確保廣告不走 QUIC 漏洞)
else if (url.includes("amdc.m.taobao.com")) {
    let body = $response.body;
    if (body) {
        body = body.replace(/\"http3\":\s*\"true\"/g, '\"http3\":\"false\"');
        body = body.replace(/\"h3\":\s*\"true\"/g, '\"h3\":\"false\"');
        body = body.replace(/\"quic\":\s*\"true\"/g, '\"quic\":\"false\"');
        $done({ body });
    } else {
        $done({});
    }
}
// 3. 其他所有請求（含圖片）原路放行
else {
    $done({});
}
