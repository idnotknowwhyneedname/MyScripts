/***********************************************
> 应用名称：Reddit 四合一纯净去广告脚本
> 脚本功能：
  1. ✓ 去面板广告（通过 Operation-Name 快捷拦截）
  2. ✓ 去推广帖 / 信息流广告（Promoted / AdPost）
  3. ✓ 去评论广告 / 帖子内潜伏广告
  4. ✓ 关闭广告个性化（Ad Personalization 强行关闭）
> 额外特性：零多余功能，绝对不碰、不锁死 NSFW (18+) 设置
> 适配系统：Surge, Quantumult X, Loon
> 仓库路径：https://github.com/idnotknowwhyneedname/MyScripts/blob/main/reddit.js
> 更新时间：2026-06-04
***********************************************/

const opName = $request?.headers?.['X-Reddit-Operation-Name'] || $request?.headers?.['x-reddit-operation-name'] || '';
let body = $response.body;

// 1. 【✓ 去面板广告】：如果操作名称直接包含 Ads，判定 100% 为纯广告数据流，直接拦截
if (/Ads/i.test(opName)) {
    $done({ body: '{}' });
} else if (!body) {
    $done({});
} else {
    try {
        // 2. 【✓ 关闭广告个性化】：在文本层面直接干掉广告追踪和第三方广告个性化许可
        if (body.includes('"isAdPersonalizationAllowed":true')) {
            body = body.replace(/"isAdPersonalizationAllowed":true/g, '"isAdPersonalizationAllowed":false');
        }
        if (body.includes('"isThirdPartyInfoAdPersonalizationAllowed":true')) {
            body = body.replace(/"isThirdPartyInfoAdPersonalizationAllowed":true/g, '"isThirdPartyInfoAdPersonalizationAllowed":false');
        }

        let obj = JSON.parse(body);

        if (obj.data) {
            Object.keys(obj.data).forEach(key => {
                let currentData = obj.data[key];
                if (!currentData) return;

                // 3. 【✓ 去推广帖】：针对首页、频道等帖子列表，过滤掉所有 Promoted 推广帖
                if (currentData.elements && Array.isArray(currentData.elements.edges)) {
                    currentData.elements.edges = currentData.elements.edges.filter(edge => {
                        const node = edge?.node;
                        if (!node) return true;
                        // 剔除 AdPost 类型及带有广告载荷的节点
                        if (node.__typename === "AdPost" || node.adPayload !== undefined && node.adPayload !== null) return false;
                        // 剔除单元流中混入的广告卡片
                        if (Array.isArray(node.cells)) {
                            return !node.cells.some(cell => cell?.__typename?.includes("Ad") || cell?.__typename === "AdMetadataCell");
                        }
                        return true;
                    });
                }

                // 4. 【✓ 去评论广告】：深度清洗点击进入帖子后，评论区和详情页里潜伏的广告
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

                // 清洗帖子下方的关联广告/赞助商推荐版块
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
        console.log("Reddit 四合一脚本执行出错: " + err);
    } finally {
        // 5. 纯净返回：完全没碰 "isNsfw" 字段，NSFW (18+) 开关将完美恢复原生自主控制
        $done({ body });
    }
}
