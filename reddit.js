/***********************************************
> 应用名称：Reddit 精准去广告脚本（纯净自主控制版）
> 脚本功能：精准过滤 GraphQL 信息流广告，不锁定/不干涉 NSFW (18+) 设置
> 适配系统：Surge, Quantumult X, Loon
> 仓库路径：https://github.com/idnotknowwhyneedname/MyScripts/blob/main/reddit.js
> 更新时间：2026-06-04
***********************************************/

// 获取当前 GraphQL 请求的操作名称（Operation Name）
const opName = $request?.headers?.['X-Reddit-Operation-Name'] || $request?.headers?.['x-reddit-operation-name'] || '';
let body = $response.body;

// 1. 快捷通断：如果请求名称直接包含 Ads（如 GetAdsList），判定 100% 为广告，直接返回空对象
if (/Ads/i.test(opName)) {
    $done({ body: '{}' });
} else if (!body) {
    $done({});
} else {
    try {
        let obj = JSON.parse(body);

        // 2. 核心过滤：检查是否存在 data 节点
        if (obj.data) {
            // 遍历所有的一级数据节点（例如各种 feed, postCollection 等）
            Object.keys(obj.data).forEach(key => {
                let currentData = obj.data[key];
                
                // 定位到包含帖子列表的 elements 或 edges 节点
                if (currentData && currentData.elements && Array.isArray(currentData.elements.edges)) {
                    
                    // 核心过滤算法：只留下正常的帖子，干掉广告
                    currentData.elements.edges = currentData.elements.edges.filter(edge => {
                        const node = edge?.node;
                        if (!node) return true;

                        // 过滤条件 A：节点类型明确为广告 (AdPost)
                        if (node.__typename === "AdPost") return false;

                        // 过滤条件 B：节点包含广告载荷 (adPayload)
                        if (node.adPayload !== undefined && node.adPayload !== null) return false;

                        // 过滤条件 C：检测卡片流组件中是否混入广告单元
                        if (Array.isArray(node.cells)) {
                            const hasAdCell = node.cells.some(cell => 
                                cell?.__typename?.includes("Ad") || 
                                cell?.__typename === "AdMetadataCell"
                            );
                            if (hasAdCell) return false;
                        }

                        return true; // 正常帖子，放行
                    });
                }
            });
        }

        // 3. 将清洗干净的数据重新打包
        body = JSON.stringify(obj);
    } catch (err) {
        console.log("Reddit 去广告脚本执行出错: " + err);
    } finally {
        $done({ body });
    }
}
