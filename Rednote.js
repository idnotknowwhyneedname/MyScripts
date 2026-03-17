/*
小红书 极限只读模式（最终版）
- 保留：刷、看评论、点开笔记、视频点击加载
- 禁止：点赞 / 评论 / 收藏 / 关注 / 发布 / 上传 / 日志上报
- 优化：去广告 / 去推荐干扰 / 搜索净化 / 无水印 / 禁视频预加载
*/

const url = $request.url;

// =========================
// 1. request 阶段：拦截所有“写操作 / 上传 / 上报”
// =========================
if ($request.method !== "GET") {
    if (/(like|dislike|favorite|collect|comment|publish|post|delete|follow|unfollow|upload|report|log|track|apm)/i.test(url)) {
        $done({ response: { status: 200, body: "" } });
        return;
    }
}

// =========================
// 2. response 阶段
// =========================
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

// -------------------------
// 2.1 配置净化（去 AB / 日志 / AI）
// -------------------------
if (url.includes("/system_service/config") || url.includes("/v2/system_service/widgets") || url.includes("/interaction/config")) {
    const trash = [
        "app_theme","loading_img","splash","store",
        "sideConfigHomepage","sideConfigPersonalPage",
        "widgets_nbb","widgets_ncb","daily_checkin",
        "revenue_center","ai_helper_config","search_ai_entry",
        "audit_info","event_logging","ab_test_config","apm_config"
    ];
    if (obj.data) {
        trash.forEach(k => delete obj.data[k]);
        if (obj.data.sideConfigHomepage) obj.data.sideConfigHomepage = [];
        if (obj.data.sideConfigPersonalPage) obj.data.sideConfigPersonalPage = [];
    }
}

// -------------------------
// 2.2 搜索页净化（无热搜 / 无 AI）
// -------------------------
else if (
    url.includes("/search/hot_list") ||
    url.includes("/search/trending") ||
    url.includes("/v4/search/hint") ||
    url.includes("/search/banner_list") ||
    url.includes("/v1/search/intervene")
) {
    obj.data = {
        items: [],
        history: [],
        hot_queries: [],
        hint_words: [],
        queries: [],
        ai_search_info: {},
        search_intervene: {},
        floating_button: {},
        banner_list: []
    };
}

// -------------------------
// 2.3 feed（首页 / 搜索流）处理
// 核心：去广告 + 禁视频预加载 + 弱化推荐
// -------------------------
else if (url.includes("/homefeed") || url.includes("/search/notes")) {
    if (obj.data?.items) {
        obj.data.items = obj.data.items.filter(i => {
            const isAd =
                i.ads_info ||
                i.is_ads ||
                i.card_icon ||
                i.model_type === "live_v2" ||
                i.note_attributes?.includes("goods");

            // 去推荐标签
            if (i.recommend_reason && i.recommend_reason !== "friend_post") {
                i.recommend_reason = "";
            }

            // === 核心：禁止视频预加载 ===
            if (i.note_card?.video) delete i.note_card.video;
            if (i.video) delete i.video;

            return !isAd;
        });
    }
}

// -------------------------
// 2.4 笔记流（imagefeed / videofeed）
// -------------------------
else if (
    url.includes("/note/feed") ||
    url.includes("/note/imagefeed") ||
    url.includes("/note/videofeed")
) {
    let items = [];

    if (Array.isArray(obj.data)) items = obj.data;
    else if (obj.data?.items) items = obj.data.items;
    else if (obj.data?.note_list) items = obj.data.note_list;

    items.forEach(item => {
        if (!item || typeof item !== "object") return;

        // 无水印保存
        if (item.media_save_config) {
            item.media_save_config = {
                disable_save: false,
                disable_watermark: true,
                disable_weibo_cover: true
            };
        }

        // 去广告 & 追踪
        delete item.ads_info;
        delete item.common_ad_info;
        delete item.related_goods_info;
        delete item.is_ads;
        delete item.track_id;

        // 禁止 feed 视频加载
        if (item.video) delete item.video;
        if (item.note_card?.video) delete item.note_card.video;
    });
}

// -------------------------
// 2.5 开屏广告
// -------------------------
else if (url.includes("/splash_config")) {
    if (obj.data?.ads_groups) obj.data.ads_groups = [];
}

// =========================
$done({ body: JSON.stringify(obj) });
