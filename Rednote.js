/*
小红书极致精简版
优化点：合并匹配逻辑、精简持久化读取、移除冗余判断
*/

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

// --- 1. 核心过滤逻辑 (首页、关注、搜索) ---
if (url.includes("/v6/homefeed") || url.includes("/v4/followfeed") || url.includes("/v10/search/notes")) {
  if (obj.data) {
    // 过滤：广告(ads_info)、直播(live_v2)、推广卡片(card_icon)
    const list = obj.data.items || obj.data; 
    const filtered = list.filter(item => {
      if (item.ads_info || item.card_icon || item.model_type === "live_v2") return false;
      return true;
    });
    if (obj.data.items) obj.data.items = filtered; else obj.data = filtered;
  }
} 

// --- 2. 搜索净化 (热搜、预填词、横幅) ---
else if (url.includes("/search/")) {
  if (obj.data) obj.data = {}; 
}

// --- 3. UI 净化 (开屏、配置、小组件) ---
else if (url.includes("/splash_config") || url.includes("/system_service/config") || url.includes("/v2/note/widgets")) {
  if (obj.data) {
    // 抹除开屏广告组
    if (obj.data.ads_groups) obj.data.ads_groups = [];
    // 抹除冗余 UI 配置
    const delKeys = ["app_theme", "loading_img", "splash", "store", "sideConfigHomepage", "cooperate_binds"];
    delKeys.forEach(k => delete obj.data[k]);
  }
}

// --- 4. 功能增强 (水印处理 & 下载) ---
else if (url.includes("/note/feed") || url.includes("/note/imagefeed")) {
  if (obj.data?.[0]?.note_list) {
    obj.data[0].note_list.forEach(item => {
      // 开启保存、禁用水印
      if (item.media_save_config) {
        item.media_save_config.disable_save = false;
        item.media_save_config.disable_watermark = true;
      }
      // 提升下载按钮权重
      if (item.share_info?.function_entries) {
        const entries = item.share_info.function_entries;
        const idx = entries.findIndex(i => i.type === "video_download");
        if (idx !== -1) entries.unshift(entries.splice(idx, 1)[0]);
      }
    });
  }
}

$done({ body: JSON.stringify(obj) });
