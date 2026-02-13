/*
小红书极致精简版 - 域名特定优化
*/

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

// --- 1. 搜索净化 (对应 edith 域名的 jq 逻辑) ---
if (url.includes("/v1/search/banner_list") || url.includes("/v1/search/hot_list") || url.includes("/v4/search/hint") || url.includes("/v4/search/trending")) {
    if (url.includes("/v1/search/banner_list")) obj.data = {};
    if (obj.data?.items) obj.data.items = [];
    if (obj.data?.hint_words) obj.data.hint_words = [];
    if (obj.data?.queries) obj.data.queries = [];
    if (obj.data?.hint_word) obj.data.hint_word = {};
}

// --- 2. 笔记实况 & 视频抓取 (无水印核心) ---
else if (url.includes("/note/imagefeed") || url.includes("/note/feed") || url.includes("/note/videofeed")) {
    let liveCache = [], videoCache = [];
    const items = obj.data?.[0]?.note_list || obj.data || [];
    items.forEach(item => {
        if (!item || typeof item !== 'object') return;
        // 开启保存、禁用水印
        if (item.media_save_config) {
            item.media_save_config = { disable_save: false, disable_watermark: true, disable_weibo_cover: true };
        }
        // 破解下载限制按钮
        if (item.share_info?.function_entries) {
            let entries = item.share_info.function_entries;
            let idx = entries.findIndex(i => i.type === "video_download");
            if (idx !== -1) entries.unshift(entries.splice(idx, 1)[0]);
            else entries.unshift({ type: "video_download" });
        }
        // 缓存高清直链用于替换
        item.images_list?.forEach(i => {
            if (i.live_photo_file_id && i.live_photo?.media?.stream?.h265?.[0]?.master_url) {
                liveCache.push({ file_id: i.live_photo_file_id, url: i.live_photo.media.stream.h265[0].master_url });
            }
        });
        let vUrl = item.video_info_v2?.media?.stream?.h265?.[0]?.master_url || item.video_info_v2?.media?.stream?.h264?.[0]?.master_url;
        if (item.id && vUrl) videoCache.push({ id: item.id, url: vUrl });
    });
    if (liveCache.length) $persistentStore.write(JSON.stringify(liveCache), "redBookLivePhoto");
    if (videoCache.length) $persistentStore.write(JSON.stringify(videoCache), "redBookVideoFeed");
}

// --- 3. 评论区实况抓取 ---
else if (url.includes("/v5/note/comment/list")) {
    let commentLive = [];
    const walk = (arr) => {
        arr?.forEach(c => {
            if (c.comment_type === 3) c.comment_type = 2;
            c.pictures?.forEach(p => {
                const vInfo = p.video_info ? JSON.parse(p.video_info) : null;
                if (p.video_id && vInfo?.stream?.h265?.[0]?.master_url) {
                    commentLive.push({ videId: p.video_id, videoUrl: vInfo.stream.h265[0].master_url });
                }
            });
            if (c.sub_comments) walk(c.sub_comments);
        });
    };
    walk(obj.data?.comments);
    if (commentLive.length) {
        $persistentStore.write(JSON.stringify({ noteId: obj.data?.comments?.[0]?.note_id, livePhotos: commentLive }), "redBookCommentLivePhoto");
    }
}

// --- 4. 保存请求拦截替换 (注入高清直链) ---
else if (url.includes("/live_photo/save") || url.includes("/video/save") || url.includes("/comment/video/download")) {
    const liveC = JSON.parse($persistentStore.read("redBookLivePhoto") || "[]");
    const videoC = JSON.parse($persistentStore.read("redBookVideoFeed") || "[]");
    const commC = JSON.parse($persistentStore.read("redBookCommentLivePhoto") || "{}");
    if (obj.data?.datas) {
        obj.data.datas.forEach(item => {
            let m = liveC.find(c => c.file_id === item.file_id);
            if (m) item.url = m.url;
        });
    } else if (obj.data?.note_id) {
        let m = videoC.find(v => v.id === obj.data.note_id);
        if (m) obj.data.download_url = m.url;
        obj.data.status = 2; delete obj.data.disable; delete obj.data.msg;
    } else if (obj.data?.video && commC.livePhotos) {
        let m = commC.livePhotos.find(p => p.videId === obj.data.video.video_id);
        if (m) obj.data.video.video_url = m.videoUrl;
    }
}

// --- 5. 信息流 & 关注页去广告 ---
else if (url.includes("/homefeed") || url.includes("/followfeed") || url.includes("/search/notes")) {
    if (obj.data) {
        let list = obj.data.items || obj.data;
        if (Array.isArray(list)) {
            const filtered = list.filter(i => {
                if (i.ads_info || i.card_icon || i.model_type === "live_v2" || i.note_attributes?.includes("goods")) return false;
                if (url.includes("followfeed") && i.recommend_reason && i.recommend_reason !== "friend_post") return false;
                return true;
            });
            if (obj.data.items) obj.data.items = filtered; else obj.data = filtered;
        }
    }
}

// --- 6. 开屏 & UI 净化 ---
else if (url.includes("/splash_config")) {
    obj.data?.ads_groups?.forEach(g => {
        g.start_time = 3818332800; g.end_time = 3818419199;
        g.ads?.forEach(a => { a.start_time = 3818332800; a.end_time = 3818419199; });
    });
} else if (url.includes("/config") || url.includes("/widgets")) {
    const trash = ["app_theme", "loading_img", "splash", "store", "sideConfigHomepage", "sideConfigPersonalPage", "cooperate_binds", "widgets_nbb", "widgets_ncb", "note_next_step"];
    if (obj.data) trash.forEach(k => { delete obj.data[k]; if (obj.data.sideConfigHomepage) delete obj.data.sideConfigHomepage[k]; });
}

$done({ body: JSON.stringify(obj) });
