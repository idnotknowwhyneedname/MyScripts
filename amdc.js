/***********************************************
amdc脚本

***********************************************/
/**
 * 修复版闲鱼/阿里系去广告脚本
 * 作用：绕过图片和正常业务，仅拦截包含 splash (开屏) 或 ad (广告) 的请求
 */

const version = 'V1.1.0-Fixed';
const ua = $request.headers["User-Agent"] || $request.headers["user-agent"];
const url = $request.url;

// 定义需要拦截的广告关键词
const adKeywords = /splash\.ads|idle\.ad\.expose|adv_content|guide_card/;

// 1. 首先判断是否是闲鱼等阿里系应用
if (/(AMap|Cainiao|%E9%97%B2%E9%B1%BC|Alibaba)/.test(ua)) {
    
    // 2. 如果是图片域名 (alicdn.com) 或 视频域名，直接跳过，不做任何拦截
    if (url.includes("alicdn.com") || url.includes("alipayobjects.com")) {
        $done({});
    } 
    // 3. 如果 URL 中包含广告特征码，则拦截
    else if (adKeywords.test(url)) {
        $done({ body: "" }); // 返回空数据拦截广告
    } 
    // 4. 其余正常业务请求，放行
    else {
        $done({});
    }
} else {
    // 非目标 App，直接放行
    $done({});
}
