/*
小红书极致精炼修复版 (2026 卖家补丁)
功能：点亮灰色下载按钮、去水印、首页去广告、搜索净化
*/

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

// --- 1. 核心过滤逻辑 (首页广告 & 视频流广告) ---
if (url.includes("/v6/homefeed") || url.includes("/v4/followfeed") || url.includes("/v10/search/notes")) {
  if (obj.data) {
    const list = obj.data.items || obj.data;
    if (Array.isArray(list)) {
      const filtered = list.filter(item => {
        // 过滤：广告(ads_info)、直播(live_v2)、推广卡片(card_icon)
        if (item.ads_info || item.card_icon || item.model_type === "live_v2") return false;
        return true;
      });
      if (obj.data.items) obj.data.items = filtered; else obj.data = filtered;
    }
  }
}

// --- 2. 核心修复：点亮下载按钮 & 去水印 (解决变灰问题) ---
else if (url.includes("/note/feed") || url.includes("/note/imagefeed") || url.includes("/note/videofeed") || url.includes("/note/v")) {
  if (obj.data) {
    // 兼容多种数据结构 (数组或单对象)
    let notes = Array.isArray(obj.data) ? obj.data : [obj.data];
    
    notes.forEach(note => {
      // 这里的 note 可能包裹在 note_list 里，也可能就是 note 本体
      let item = note.note_list ? note.note_list[0] : note;
      if (item.note_list && Array.isArray(item.note_list)) item = item.note_list[0];

      // 【保命补丁】：点亮灰色下载按钮
      if (item.privilege) {
        item.privilege.can_download = true;
        item.privilege.can_copy = true;
      }
      
      // 【保命补丁】：绕过下载限制和去水印
      if (item.media_save_config) {
        item.media_save_config.disable_save = false;
        item.media_save_config.disable_watermark = true;
      }

      // 【保命补丁】：重构分享菜单，强行插入彩色下载按钮
      if (item.share_info?.function_entries) {
        let entries = item.share_info.function_entries;
        // 强制开启并修改动作类型为 safe_download
        entries.forEach(e => {
          if (e.type === "video_download" || e.type === "save_image") {
            e.name = "✨无水印保存";
            e.action_type = "safe_download"; // 关键：绕过灰化校验
          }
        });
        // 把下载按钮排到第一个
        const idx = entries.findIndex(i => i.type === "video_download" || i.type === "save_image");
        if (idx > 0) entries.unshift(entries.splice(idx, 1)[0]);
      }
    });
  }
}

// --- 3. 搜索净化 (热搜、预填词、横幅) ---
else if (url.includes("/search/")) {
  if (obj.data && !url.includes("/notes")) { // 排除笔记搜索结果，只清空热搜等
    obj.data = {};
  }
}

// --- 4. UI 净化 (开屏、配置、小组件) ---
else if (url.includes("/splash_config") || url.includes("/system_service/config") || url.includes("/v2/note/widgets")) {
  if (obj.data) {
    if (obj.data.ads_groups) obj.data.ads_groups = [];
    const delKeys = ["app_theme", "loading_img", "splash", "store", "sideConfigHomepage", "cooperate_binds"];
    delKeys.forEach(k => delete obj.data[k]);
  }
}

$done({ body: JSON.stringify(obj) });
