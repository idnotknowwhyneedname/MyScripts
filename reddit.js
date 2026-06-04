/***********************************************
> 应用名称：Reddit 终极精准三合一脚本
> 脚本功能：
  1. 列表/帖子内广告全方位清除 (完美去广告)
  2. 解锁 Premium 会员状态 (自由更换 App 图标)
  3. 彻底不锁定 NSFW 选项 (恢复本地 18+ 开关自主控制)
> 适配系统：Surge, Quantumult X, Loon
> 仓库路径：https://github.com/idnotknowwhyneedname/MyScripts/blob/main/reddit.js
> 更新时间：2026-06-04
***********************************************/

const opName = $request?.headers?.['X-Reddit-Operation-Name'] || $request?.headers?.['x-reddit-operation-name'] || '';
let body = $response.body;

// 1. 快捷通断：如果请求名称包含 Ads 直接返回空（直接屏蔽纯广告流）
if (/Ads/i.test(opName)) {
    $done({ body: '{}' });
} else if (!body) {
    $done({});
} else {
    try {
        // 2. 解锁换 Icon：将数据包中所有 Premium 会员状态强制修改为 true，从而解锁限定图标
        if (body.includes('"isPremiumMember"')) {
            body = body.replace(/"isPremiumMember":false/g, '"isPremiumMember":true');
        }
        if (body.includes('"isPremium"')) {
            body = body.replace(/"isPremium":false/g, '"isPremium":true');
        }

        // 3. 解析 JSON 结构，处理信息流和帖子详情内部的隐蔽广告
        let obj = JSON.parse(body);

        if (obj.data) {
            Object.keys(obj.data).forEach(key => {
                let currentData = obj.data[key];
                if (!currentData) return;

                // 【信息流列表广告清除】
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

                // 【帖子内部/评论区广告清除】
                // 深度扫描新版 API 经常变动的 edges、nodes、distinguish 等包含的赞助商、广告单元
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

                // 清除附加版块中的关联广告 (addSections)
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
        console.log("Reddit 终极脚本执行出错: " + err);
    } finally {
        // 4. 交还系统，由于完全没有修改过 "isNsfw" 相关的布尔值，NSFW 控制权将百分之百由你本地设置决定
        $done({ body });
    }
}
