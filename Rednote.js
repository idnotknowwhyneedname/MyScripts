/*
小红书优化精简版 (整合去广告+搜索净化+存实况照片)
作者: RuCu6 & Gemini 优化
*/

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

// 1. 实况照片/保存逻辑 (Live Photo)
if (url.includes("/v1/interaction/comment/video/download")) {
  let commitsCache = JSON.parse($persistentStore.read("redBookCommentLivePhoto"));
  if (commitsCache?.livePhotos?.length > 0 && obj?.data?.video) {
    for (const item of commitsCache.livePhotos) {
      if (item?.videId === obj?.data?.video?.video_id) { obj.data.video.video_url = item.videoUrl; break; }
    }
  }
} else if (url.includes("/v1/note/imagefeed") || url.includes("/v2/note/feed") || url.includes("/v3/note/videofeed") || url.includes("/v4/note/videofeed")) {
  // 水印与下载限制处理
  if (obj?.data?.[0]?.note_list) {
    obj.data[0].note_list.forEach(item => {
      if (item.media_save_config) { item.media_save_config.disable_save = false; item.media_save_config.disable_watermark = true; }
      if (item.share_info?.function_entries) {
        let idx = item.share_info.function_entries.findIndex(i => i.type === "video_download");
        if (idx !== -1) item.share_info.function_entries.unshift(item.share_info.function_entries.splice(idx, 1)[0]);
        else item.share_info.function_entries.unshift({ type: "video_download" });
      }
    });
  }
} else if (url.includes("/v1/note/live_photo/save")) {
  let livePhoto = JSON.parse($persistentStore.read("redBookLivePhoto"));
  if (obj?.data?.datas?.length > 0 && livePhoto?.length > 0) {
    obj.data.datas.forEach(itemA => {
      livePhoto.forEach(itemB => { if (itemB?.file_id === itemA?.file_id && itemA?.url) itemA.url = itemA.url.replace(/^https?:\/\/.*\.mp4$/g, itemB.url); });
    });
  }
} 

// 2. 广告拦截逻辑
else if (url.includes("/v6/homefeed") || url.includes("/v4/followfeed") || url.includes("/v4/followfeed")) {
  // 首页信息流/关注流：过滤直播、赞助、带货
  if (obj.data) {
    obj.data = obj.data.filter(item => {
      if (item.ads_info || item.card_icon || item.model_type === "live_v2" || item.recommend_reason === "recommend_user") return false;
      if (item.related_ques) delete item.related_ques;
      return true;
    });
  }
} else if (url.includes("/v2/system_service/splash_config")) {
  // 开屏广告失效处理 (Unix 时间戳至 2090 年)
  if (obj.data?.ads_groups) {
    obj.data.ads_groups.forEach(g => {
      g.start_time = 3818332800; g.end_time = 3818419199;
      if (g.ads) g.ads.forEach(a => { a.start_time = 3818332800; a.end_time = 3818419199; });
    });
  }
}

// 3. 搜索页净化 (新加入的核心功能)
else if (url.includes("/search/banner_list") || url.includes("/search/hot_list") || url.includes("/search/hint") || url.includes("/search/trending")) {
  if (obj.data) obj.data = {}; // 直接清空热搜、横幅和预填词
} else if (url.includes("/v10/search/notes")) {
  if (obj?.data?.items) obj.data.items = obj.data.items.filter(i => i.model_type === "note");
}

// 4. UI 净化与系统配置
else if (url.includes("/system/service/ui/config") || url.includes("/system_service/config") || url.includes("/v2/note/widgets")) {
  const delKeys = ["app_theme", "loading_img", "splash", "store", "sideConfigHomepage", "sideConfigPersonalPage", "cooperate_binds", "generic", "note_next_step"];
  if (obj.data) delKeys.forEach(k => { if(obj.data[k]) delete obj.data[k]; });
}

// 5. 视频下载补丁
else if (url.includes("/v10/note/video/save")) {
  let videoFeed = JSON.parse($persistentStore.read("redBookVideoFeed"));
  if (obj?.data?.note_id && videoFeed) {
    let target = videoFeed.find(i => i.id === obj.data.note_id);
    if (target) obj.data.download_url = target.url;
  }
}

$done({ body: JSON.stringify(obj) });
