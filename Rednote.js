/*
* RedNote (海外版) 终极隐私纯净增强脚本
* 整合功能：去广告、去水印、禁止预加载缓存、设备指纹脱敏、地理位置致盲
*/

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

// ================= 1. 隐私与缓存控制模块 (狠人模式) =================

// 彻底禁止预加载，防止 App 在后台疯狂下载图片和视频占用 2TB 空间
if (obj.data?.preload_config) {
  obj.data.preload_config = {
    "is_preload": false,
    "note_preload_count": 0,
    "preload_interval": 999999
  };
}

// 设备信息模糊化：不让它识别出你是顶配 iPhone 17 Pro Max
if (obj.data?.device_info || obj.data?.system_info) {
  const info = obj.data.device_info || obj.data.system_info;
  info.device_name = "iPhone";
  info.storage_free = "64GB";
  info.storage_total = "128GB"; // 稍微报低一点，避免被标记
  delete info.idfa;
  delete info.idfv;
  delete info.uuid;
}

// 屏蔽地理位置（针对曼谷本地隐私保护）
if (url.includes("/location") || url.includes("/nearby")) {
  obj.data = {};
  obj.success = true;
  obj.msg = "Privacy Shield Active";
}

// 强制关闭隐私追踪开关
if (obj.data?.privacy_config) {
  for (let key in obj.data.privacy_config) {
    if (key.includes("ads") || key.includes("track") || key.includes("recommend")) {
      obj.data.privacy_config[key] = false; // 2 或 false
    }
  }
}

// ================= 2. 核心去广告与去水印模块 =================

if (url.includes("/v1/note/imagefeed") || url.includes("/v2/note/feed") || url.includes("/v3/note/videofeed") || url.includes("/v4/note/videofeed")) {
  // 处理信息流广告与水印
  if (obj.data) {
    let list = Array.isArray(obj.data) ? obj.data : obj.data[0]?.note_list;
    if (list?.length > 0) {
      let filteredList = [];
      for (let item of list) {
        // 剔除广告、带货、直播
        if (item.ads_info || item.card_icon || item.model_type === "live_v2" || item.ad) {
          continue;
        }
        // 开启无水印保存权限
        if (item.media_save_config) {
          item.media_save_config.disable_save = false;
          item.media_save_config.disable_watermark = true;
        }
        // 强制开启下载按钮
        if (item.share_info?.function_entries) {
          if (!item.share_info.function_entries.some(e => e.type === "video_download")) {
            item.share_info.function_entries.unshift({ type: "video_download" });
          }
        }
        filteredList.push(item);
      }
      if (Array.isArray(obj.data)) obj.data = filteredList;
      else obj.data[0].note_list = filteredList;
    }
  }
} else if (url.includes("/v6/homefeed")) {
  // 首页精选去广告
  if (obj.data?.length > 0) {
    obj.data = obj.data.filter(item => 
      !item.ads_info && 
      !item.card_icon && 
      item.model_type !== "live_v2" && 
      !item.note_attributes?.includes("goods")
    );
  }
} else if (url.includes("/v2/system_service/splash_config")) {
  // 开屏广告劫持（设定到 2090 年）
  if (obj.data?.ads_groups?.length > 0) {
    for (let group of obj.data.ads_groups) {
      group.start_time = 3818332800;
      group.end_time = 3818419199;
      group.ads?.forEach(ad => {
        ad.start_time = 3818332800;
        ad.end_time = 3818419199;
      });
    }
  }
} else if (url.includes("/v1/system_service/config") || url.includes("/v2/note/widgets")) {
  // 清理 UI 冗余：皮肤、加载图、详情页小部件
  const junkFields = ["app_theme", "loading_img", "splash", "store", "cooperate_binds", "widgets_nbb"];
  if (obj.data) {
    junkFields.forEach(field => delete obj.data[field]);
  }
}

// ================= 3. 评论区实况照片处理 =================
if (url.includes("/v5/note/comment/list")) {
  if (obj.data?.comments?.length > 0) {
    for (let comment of obj.data.comments) {
      if (comment.comment_type === 3) comment.comment_type = 2; // 表情包转图片
      // 这里可以添加更多评论区过滤逻辑
    }
  }
}

$done({ body: JSON.stringify(obj) });
