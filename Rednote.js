/*
小红书终极隐私净化版 - 17PM 专供
- 彻底封杀：AI 提问、有问必答、后台日志上报、热搜、Banner
- 深度净化：移除 AB 测试、审计追踪、所有非浏览功能
- 核心保留：无水印下载权限
*/

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

// --- 1. 拦截日志上报与实验配置 (防止偷偷上传行为数据) ---
if (url.includes("/system_service/config") || url.includes("/v2/system_service/widgets") || url.includes("/interaction/config")) {
    const trash = [
        "app_theme", "loading_img", "splash", "store", "sideConfigHomepage", 
        "sideConfigPersonalPage", "widgets_nbb", "widgets_ncb", "daily_checkin", 
        "revenue_center", "ai_helper_config", "search_ai_entry", "audit_info",
        "event_logging", "ab_test_config", "apm_config"
    ];
    if (obj.data) {
        trash.forEach(k => delete obj.data[k]);
        if (obj.data.sideConfigHomepage) obj.data.sideConfigHomepage = [];
        if (obj.data.sideConfigPersonalPage) obj.data.sideConfigPersonalPage = [];
    }
}

// --- 2. 搜索页深度净化 (杀掉：AI 提问、热搜、发现、干预) ---
else if (url.includes("/search/hot_list") || url.includes("/search/trending") || url.includes("/v4/search/hint") || url.includes("/search/banner_list") || url.includes("/v1/search/intervene")) {
    obj.data = {
        items: [], history: [], hot_queries: [], hint_words: [], queries: [],
        ai_search_info: {}, search_intervene: {}, floating_button: {}, banner_list: []
    };
    if (url.includes("/search/banner_list")) obj.data = {};
}

// --- 3. 笔记流：解锁无水印 + 彻底切断广告/追踪 ---
else if (url.includes("/note/feed") || url.includes("/note/imagefeed") || url.includes("/note/videofeed")) {
    const items = obj.data?.[0]?.note_list || obj.data || [];
    items.forEach(item => {
        if (!item || typeof item !== 'object') return;
        // 开启最高质量无水印保存
        if (item.media_save_config) {
            item.media_save_config = { disable_save: false, disable_watermark: true, disable_weibo_cover: true };
        }
        // 物理删除所有广告和追踪字段
        delete item.ads_info;
        delete item.common_ad_info;
        delete item.related_goods_info;
        delete item.is_ads;
        delete item.track_id; // 删除追踪 ID
    });
}

// --- 4. 信息流去广告与算法屏蔽 ---
else if (url.includes("/homefeed") || url.includes("/search/notes")) {
    if (obj.data?.items) {
        obj.data.items = obj.data.items.filter(i => {
            const isAd = i.ads_info || i.is_ads || i.card_icon || i.model_type === "live_v2" || i.note_attributes?.includes("goods");
            // 屏蔽强行推荐，只保留纯粹的内容
            if (i.recommend_reason && i.recommend_reason !== "friend_post") i.recommend_reason = "";
            return !isAd;
        });
    }
}

// --- 5. 开屏广告与启动追踪 ---
else if (url.includes("/splash_config")) {
    if (obj.data?.ads_groups) obj.data.ads_groups = [];
}

$done({ body: JSON.stringify(obj) });
