/*
小紅書終極隱私淨化版
1. 斬斷所有追蹤：猜你想搜、熱搜、Banner、廣告、直播
2. 視覺深度去垢：移除側邊欄、錢包、創作助手、跳過開屏
3. 核心功能保留：全量開啟無水印保存權限
*/

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

// --- 1. 搜索深度淨化 (斬斷“猜你想搜”、熱搜、搜索建議) ---
if (url.includes("/search/hot_list") || url.includes("/search/trending") || url.includes("/v4/search/hint") || url.includes("/search/banner_list")) {
    obj.data = {
        items: [],
        history: [],
        hot_queries: [],
        hint_words: [],
        queries: [],
        scene: ""
    };
}

// --- 2. 筆記流淨化 (開啟無水印 + 移除廣告標籤) ---
else if (url.includes("/note/feed") || url.includes("/note/imagefeed") || url.includes("/note/videofeed")) {
    const items = obj.data?.[0]?.note_list || obj.data || [];
    items.forEach(item => {
        if (!item || typeof item !== 'object') return;
        
        // 【核心】解鎖無水印保存權限
        if (item.media_save_config) {
            item.media_save_config = { 
                disable_save: false, 
                disable_watermark: true, 
                disable_weibo_cover: true 
            };
        }
        
        // 隱私增強：移除筆記關聯的商業追蹤
        delete item.ads_info;
        delete item.common_ad_info;
        delete item.related_goods_info;
        delete item.is_ads;
        if (item.share_info?.function_entries) {
            // 確保「下載」按鈕出現在分享菜單第一位
            let entries = item.share_info.function_entries;
            let idx = entries.findIndex(e => e.type === "video_download");
            if (idx !== -1) entries.unshift(entries.splice(idx, 1)[0]);
        }
    });
}

// --- 3. 首頁信息流 (過濾直播、廣告、算法推薦理由) ---
else if (url.includes("/homefeed") || url.includes("/search/notes")) {
    if (obj.data?.items) {
        obj.data.items = obj.data.items.filter(i => {
            const isAd = i.ads_info || i.is_ads || i.card_icon || i.model_type === "live_v2" || i.note_attributes?.includes("goods");
            // 隱私邏輯：除了好友動態，移除所有算法給出的「推薦理由」
            if (i.recommend_reason && i.recommend_reason !== "friend_post") i.recommend_reason = "";
            return !isAd;
        });
    }
}

// --- 4. 界面功能大閹割 (殺掉錢包、側邊欄、所有商業插件) ---
else if (url.includes("/system_service/config") || url.includes("/v2/system_service/widgets") || url.includes("/interaction/config")) {
    if (obj.data) {
        const killList = [
            "app_theme", "loading_img", "splash", "store", 
            "sideConfigHomepage", "sideConfigPersonalPage", 
            "widgets_nbb", "widgets_ncb", "daily_checkin", 
            "revenue_center", "business_info", "payment_info"
        ];
        killList.forEach(k => delete obj.data[k]);
        
        // 強制清空側邊欄所有自定義配置
        if (obj.data.sideConfigHomepage) obj.data.sideConfigHomepage = [];
        if (obj.data.sideConfigPersonalPage) obj.data.sideConfigPersonalPage = [];
    }
}

// --- 5. 屏蔽開屏廣告 ---
else if (url.includes("/splash_config")) {
    if (obj.data?.ads_groups) obj.data.ads_groups = [];
}

$done({ body: JSON.stringify(obj) });
