/***********************************************
> 应用名称：Reddit 全方位精准去广告脚本（极致纯净版）
> 脚本功能：
  1. 精准清洗信息流列表广告（Promoted / AdPost）
  2. 深度过滤点击进入帖子后的详情页与评论区广告
  3. 0多余功能，不干扰换图标，不锁定/不干涉 NSFW (18+) 原生设置
> 适配系统：Surge, Quantumult X, Loon
> 仓库路径：https://github.com/idnotknowwhyneedname/MyScripts/blob/main/reddit.js
> 更新时间：2026-06-04
***********************************************/

const opName = $request?.headers?.['X-Reddit-Operation-Name'] || $request?.headers?.['x-reddit-operation-name'] || '';
let body = $response.body;

// 1. 快捷通断：如果是纯广告流请求，直接返回空对象拦截
if (/Ads/i.test(opName)) {
    $done({ body: '{}' });
} else if (!body) {
    $done({});
} else {
    try {
        let obj = JSON.parse(body);

        if (obj.data) {
            // 遍历所有数据节点进行深度清洗
            Object.keys(obj.data).forEach(key => {
                let currentData = obj.data[key];
                if (!currentData) return;

                // 【A. 帖子列表/信息流广告清洗】
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

                // 【B. 帖子详情内部 / 评论区潜伏广告清洗】
                // 深度扫描新版 GraphQL 数据结构中所有的 edges 数组
                if (Array.isArray(currentData.edges)) {
                    currentData.edges = currentData.edges.filter(edge => {
                        const node = edge?.node;
                        if (!node) return true;
                        if (node.__typename === "AdPost" || node.__typename?.includes("Ad") || node.__typename?.includes("Promoted") || node.adPayload) return false;
                        return true;
                    });
                }

                // 深度扫描新版 GraphQL 数据结构中所有的 nodes 数组
                if (Array.isArray(currentData.nodes)) {
                    currentData.nodes = currentData.nodes.filter(node => {
                        if (!node) return true;
                        if (node.__typename === "AdPost" || node.__typename?.includes("Ad") || node.__typename?.includes("Promoted") || node.adPayload) return false;
                        return true;
                    });
                }

                // 清洗帖子底部的推荐或附加关联广告版块 (addSections)
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
        console.log("Reddit 去广告脚本执行出错: " + err);
    } finally {
        // 2. 干净返回：绝不包含修改会员、换图标或 NSFW 的任何文本替换代码
        $done({ body });
    }
}
