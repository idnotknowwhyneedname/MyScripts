/*
小红书全功能增强脚本 - 深度整合版
1. 复刻 RuCu6: 实况照片(笔记/评论区)、视频下载破解、2090年开屏、Feed流去广告
2. 整合 jq 逻辑: 搜索横幅/热搜/建议词清空
3. 整合 URL Rewrite: 屏蔽营销盒子、资源广告、引导 Banner
*/

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

// --- 1. [新增] 搜索净化 (对应你的 jq 逻辑) ---
if (url.includes("/v1/search/banner_list")) {
    obj.data = {}; // 清空搜索 Banner
} else if (url.includes("/v1/search/hot_list")) {
    if (obj.data?.items) obj.data.items = []; // 清空热搜榜
} else if (url.includes("/v4/search/hint")) {
    if (obj.data?.hint_words) obj.data.hint_words = []; // 清空搜索建议
} else if (url.includes("/v4/search/trending")) {
    if (obj.data?.queries) obj.data.queries = []; // 清空趋势查询
    if (obj.data?.hint_word) obj.data.hint_word = {}; // 清空输入框预填词
}

// --- 2. [新增] 营销拦截 (对应你的 reject-dict 逻辑) ---
else if (
    url.includes("/surprisebox/") || 
    url.includes("/marketing/box/trigger") || 
    url.includes("/v2/guide/user_banner") || 
    url.includes("/v3/note/guide") || 
    url.includes("/v1/ads/resource") || 
    url.includes("/v2/hey/")
) {
    $done({ body: JSON.stringify({ code: 0, data: {} }) }); // 模拟空响应拦截
}

// --- 3. 实况视频 & 视频下载增强 (全量复刻) ---
else if (url.includes("/v1/note/imagefeed") || url.includes("/v2/note/feed") || url.includes("/v4/note/videofeed") || url.includes("/v3/note/videofeed")) {
    let liveCache = [], videoCache = [];
    const items = obj.data?.[0]?.note_list || obj.data || [];
    items.forEach(item => {
        if (!item || typeof item !== 'object') return;
        if (item.media_save_config) {
            item.media_save_config = { disable_save: false, disable_watermark: true, disable_weibo_cover: true };
        }
        if (item.share_info?.function_entries) {
            let entries = item.share_info.function_entries;
            let idx = entries.findIndex(i => i.type === "video_download");
            if (idx !== -1) entries.unshift(entries.splice(idx, 1)[0]);
            else entries.unshift({ type: "video_download" });
        }
        if (item.images_list) {
            item.images_list.forEach(i => {
                if (i.live_photo_file_id && i.live_photo?.media?.stream?.h265?.[0]?.master_url) {
                    liveCache.push({ file_id: i.live_photo_file_id, url: i.live_photo.media.stream.h265[0].master_url });
                }
            });
        }
        if (item.id && item.video_info_v2?.media?.stream?.h265?.[0]?.master_url) {
            videoCache.push({ id: item.id, url: item.video_info_v2.media.stream.h265[0].master_url });
        }
    });
    if (liveCache.length) $persistentStore.write(JSON.stringify(liveCache), "redBookLivePhoto");
    if (videoCache.length) $persistentStore.write(JSON.stringify(videoCache), "redBookVideoFeed");
}

// --- 4. 评论区实况照片处理 ---
else if (url.includes("/v5/note/comment/list")) {
    let commentLive = [];
    const traverse = (cs) => {
        cs?.forEach(c => {
            if (c.comment_type === 3) c.comment_type = 2;
            if (c.media_source_type === 1) c.media_source_type = 0;
            c.pictures?.forEach(p => {
                const info = p.video_info ? JSON.parse(p.video_info) : null;
                if (p.video_id && info?.stream?.h265?.[0]?.master_url) {
                    commentLive.push({ videId: p.video_id, videoUrl: info.stream.h265[0].master_url });
                }
            });
            if (c.sub_comments) traverse(c.sub_comments);
        });
    };
    traverse(obj.data?.comments);
    if (commentLive.length) {
        $persistentStore.write(JSON.stringify({ noteId: obj.data?.comments?.[0]?.note_id, livePhotos: commentLive }), "redBookCommentLivePhoto");
    }
}

// --- 5. 保存请求拦截替换 (实况/视频) ---
else if (url.includes("/v1/note/live_photo/save") || url.includes("/v10/note/video/save") || url.includes("/v1/interaction/comment/video/download")) {
    const liveCache = JSON.parse($persistentStore.read("redBookLivePhoto") || "[]");
    const videoCache = JSON.parse($persistentStore.read("redBookVideoFeed") || "[]");
    const commentCache = JSON.parse($persistentStore.read("redBookCommentLivePhoto") || "{}");
    if (obj.data?.datas) {
        obj.data.datas.forEach(item => {
            let match = liveCache.find(c => c.file_id === item.file_id);
            if (match) item.url = item.url.replace(/^https?:\/\/.*\.mp4$/g, match.url);
        });
    } else if (obj.data?.note_id) {
        let match = videoCache.find(v => v.id === obj.data.note_id);
        if (match) obj.data.download_url = match.url;
        if (obj.data.disable) { obj.data.status = 2; delete obj.data.disable; delete obj.data.msg; }
    } else if (obj.data?.video && commentCache.livePhotos) {
        let match = commentCache.livePhotos.find(p => p.videId === obj.data.video.video_id);
        if (match) obj.data.video.video_url = match.videoUrl;
    }
}

// --- 6. 首页 Feed & 关注页净化 ---
else if (url.includes("/v6/homefeed") || url.includes("/v4/followfeed") || url.includes("/v10/search/notes") || url.includes("/v2/user/followings/followfeed")) {
    if (obj.data) {
        let items = obj.data.items || obj.data;
        if (Array.isArray(items)) {
            const filtered = items.filter(i => {
                if (i.ads_info || i.card_icon || i.model_type === "live_v2" || i.note_attributes?.includes("goods")) return false;
                if (url.includes("followfeed") && i.recommend_reason && i.recommend_reason !== "friend_post") return false;
                return true;
            });
            if (obj.data.items) obj.data.items = filtered; else obj.data = filtered;
        }
    }
}

// --- 7. 系统 & 开屏处理 (2090年大法) ---
else if (url.includes("/splash_config")) {
    obj.data?.ads_groups?.forEach(g => {
        g.start_time = 3818332800; g.end_time = 3818419199;
        g.ads?.forEach(a => { a.start_time = 3818332800; a.end_time = 3818419199; });
    });
} else if (url.includes("/system_service/config") || url.includes("/ui/config") || url.includes("/v2/note/widgets")) {
    const keys = ["app_theme", "loading_img", "splash", "store", "sideConfigHomepage", "sideConfigPersonalPage", "cooperate_binds", "widgets_nbb", "widgets_ncb", "note_next_step"];
    if (obj.data) keys.forEach(k => { delete obj.data[k]; if (obj.data.sideConfigHomepage) delete obj.data.sideConfigHomepage[k]; });
}

$done({ body: JSON.stringify(obj) });
