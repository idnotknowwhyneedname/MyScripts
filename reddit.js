/***********************************************
> 应用名称：Reddit 精准去广告脚本（列表+帖子内全方位+解锁图标版）
> 脚本功能：过滤信息流及帖子内广告，解锁 Premium 会员图标，不锁定/不干涉 NSFW 设置
> 适配系统：Surge, Quantumult X, Loon
> 仓库路径：https://github.com/idnotknowwhyneedname/MyScripts/blob/main/reddit.js
> 更新时间：2026-06-04
***********************************************/

const opName = $request?.headers?.['X-Reddit-Operation-Name'] || $request?.headers?.['x-reddit-operation-name'] || '';
let body = $response.body;

if (/Ads/i.test(opName)) {
    $done({ body: '{}' });
} else if (!body) {
    $done({});
} else {
    try {
        // 1. 【强效解锁 Icon】在文本层面同时修改多种可能的会员判定字段（防止旧版 App 或新版 API 字段不一致）
        if (body.includes('"isPremiumMember"')) {
            body = body.replace(/"isPremiumMember":false/g, '"isPremiumMember":true');
        }
        if (body.includes('"isPremium"')) {
            body = body.replace(/"isPremium":false/g, '"isPremium":true');
        }
        if (body.includes('"hasPremium"')) {
            body = body.replace(/"hasPremium":false/g, '"hasPremium":true');
        }

        let obj = JSON.parse(body);

        if (obj.data) {
            Object.keys(obj.data).forEach(key => {
                let currentData = obj.data[key];
                if (!currentData) return;

                // 2. 【列表流去广告】针对首页、频道等帖子列表
                if (currentData.elements && Array.isArray(currentData.elements.edges)) {
                    currentData.elements.edges = currentData.elements.edges.filter(edge => {
                        const node = edge?.node;
                        if (!node) return true;
                        if (node.__typename === "AdPost" || node.adPayload !== undefined && node.adPayload !== null) return false;
                        if (Array.isArray(node.cells)) {
                            return !node.cells.some(cell => cell?.__typename?.includes("Ad") || cell?.__typename === "AdMetadataCell");
                        }
                        return true;
                    });
                }

                // 3. 【帖子内去广告】针对点击进入帖子后的详情页、评论区及推荐流
                // 新版 API 帖子内广告常藏在各种类型的 edges 数组、nodes 数组中，对其进行无差别扫描剔除
                if (Array.isArray(currentData.edges)) {
                    currentData.edges = currentData.edges.filter(edge => {
                        const node = edge?.node;
                        if (!node) return true;
                        if (node.__typename === "AdPost" || node.__typename?.includes("Ad") || node.__typename?.includes("Promoted") || node.adPayload) return false;
                        return true;
                    });
                }

                if (Array.isArray(currentData.nodes)) {
                    currentData.nodes = currentData.nodes.filter(node => {
                        if (!node) return true;
                        if (node.__typename === "AdPost" || node.__typename?.includes("Ad") || node.__typename?.includes("Promoted") || node.adPayload) return false;
                        return true;
                    });
                }

                // 清洗可能存在的附加版块 (addSections)
                if (currentData.addSections && Array.isArray(currentData.addSections.edges)) {
                    currentData.addSections.edges = currentData.addSections.edges.filter(edge => {
                        const node = edge?.node;
                        if (!node) return true;
                        if (node.__typename?.includes("Ad") || node.__typename === "AdPost" || node.adPayload) return false;
                        return true;
                    });
                }
            });
        }

        body = JSON.stringify(obj);
    } catch (err) {
        console.log("Reddit 全方位去广告脚本执行出错: " + err);
    } finally {
        $done({ body });
    }
}
