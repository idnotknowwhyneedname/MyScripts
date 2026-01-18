/***********************************************
amdc脚本

***********************************************/
/**
 * 修复版闲鱼/阿里系去广告脚本
 * 作用：绕过图片和正常业务，仅拦截包含 splash (开屏) 或 ad (广告) 的请求
 */
/**
 * 闲鱼去广告提速版 - 仅处理数据接口，不干扰图片
 */
const url = $request.url;

// 定义广告关键词
const adKeywords = /splash\.ads|idle\.ad\.expose|adv_content|guide_card|taobao\.idlemtopsearch\.item\.search\.activate/;

if (adKeywords.test(url)) {
    // 发现广告接口，直接拦截，不返回 ddgksf 字符串以免报错
    $done({ status: "HTTP/1.1 200 OK", body: "{}" });
} else {
    // 正常业务接口，直接放行
    $done({});
}
