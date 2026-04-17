/*
* RedNote (海外版) 终极隐私纯净增强脚本
* 核心逻辑：去广告/水印 + 禁预加载缓存 + 设备指纹脱敏 + 位置致盲
*/

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

// --- 1. 缓存与隐私狠狠杀 ---

// 强制禁止预加载：只有你点开的时候才加载内容，不许在后台偷偷吃缓存
if (obj.data?.preload_config) {
  obj.data.preload_config = {
    "is_preload": false,
    "note_preload_count": 0,
    "preload_interval": 999999
  };
}

// 设备信息脱敏
if (obj.data?.device_info || obj.data?.system_info) {
  const info = obj.data.device_info || obj.data.system_info;
  info.device_name = "iPhone";
  info.storage_free = "128GB";
  info.storage_total = "256GB"; 
  delete info.idfa;
  delete info.idfv;
  delete info.uuid;
}

// 位置隐私致盲
if (url.includes("/location") || url.includes("/nearby")) {
  obj.data = {};
  obj.success = true;
  obj.msg = "Privacy Shield Active";
}

// 强制关闭所有隐私追踪与个性化开关
if (obj.data?.privacy_config) {
  for (let key in obj.data.privacy_config) {
    if (key.includes("ads") || key.includes("track") || key.includes("recommend")) {
      obj.data.privacy_config[key] = false;
    }
  }
}

// --- 2. 纯净流模块 (去广告、直播与水印) ---

if (url.includes("/v6/homefeed") || url.includes("/v10/search/notes")) {
  // 首页与搜索：剔除广告、带货、直播
  if (obj.data?.length > 0) {
    obj.data = obj.data.filter(item => 
      !item.ads_info && !item.card_icon && item.model_type !== "live_v2" && !item.ad
    );
  } else if (obj.data?.items?.length > 0) {
    obj.data.items = obj.data.items.filter(i => i.model_type === "note");
  }
} else if (url.includes("/v1/note/imagefeed") || url.includes("/v2/note/feed") || url.includes("/v3/note/videofeed")) {
  // 详情页：开启无水印保存，移除视频限制
  let list = Array.isArray(obj.data) ? obj.data : obj.data[0]?.note_list;
  if (list?.length > 0) {
    for (let item of list) {
      if (item.media_save_config) {
        item.media_save_config.disable_save = false;
        item.media_save_config.disable_watermark = true;
      }
      if (item.share_info?.function_entries) {
        if (!item.share_info.function_entries.some(e => e.type === "video_download")) {
          item.share_info.function_entries.unshift({ type: "video_download" });
        }
      }
    }
  }
} else if (url.includes("/v2/system_service/splash_config")) {
  // 开屏广告劫持：直接快进到 2090 年
  if (obj.data?.ads_groups?.length > 0) {
    for (let group of obj.data.ads_groups) {
      group.start_time = 3818332800;
      group.end_time = 3818419199;
    }
  }
}

$done({ body: JSON.stringify(obj) });
