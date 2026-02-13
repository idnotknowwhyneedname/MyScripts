#!name= Together-
#!desc= 全局去追踪
[Rule]
# >>> 全局 QUIC 降级
UDP, DEST-PORT, 443, REJECT
# >>> iOS 系统级隐私与分析 (Apple)
DOMAIN, fpt.apple.com, REJECT
DOMAIN, securemetrics.apple.com, REJECT
DOMAIN, supportmetrics.apple.com, REJECT
DOMAIN, metrics.apple.com, REJECT
DOMAIN, stocks-analytics-events.apple.com, REJECT
# >>> HTTPDNS 防绕过 (防止 App 跨境/绕过追踪)
DOMAIN, dop.pddpic.com, REJECT
DOMAIN, httpdns.alicdn.com, REJECT
DOMAIN, httpdns.baidupv.com, REJECT
DOMAIN, dns.jd.com, REJECT
DOMAIN, mDNS.m.taobao.com, REJECT
DOMAIN-SUFFIX, httpdns.c.meituan.com, REJECT
# >>> 海外版 App 日志上报 (TikTok / WeChat)
DOMAIN, hklog.wechat.com, REJECT
DOMAIN, sglog.wechat.com, REJECT
DOMAIN, wechat-analysis.com, REJECT
DOMAIN-SUFFIX, muscdn.com, REJECT
DOMAIN-SUFFIX, musical.ly, REJECT
DOMAIN-SUFFIX, log-va.tiktokv.com, REJECT
DOMAIN-SUFFIX, analytics.tiktok.com, REJECT
# >>> 常见 App 通用追踪器拦截 (星巴克、Grab等都在用)
DOMAIN-SUFFIX, braze.com, REJECT
DOMAIN-SUFFIX, segment.io, REJECT
DOMAIN-SUFFIX, adjust.com, REJECT
DOMAIN-SUFFIX, appsflyer.com, REJECT
# >>> Google/Firebase 海外通用追踪
DOMAIN, app-measurement.com, REJECT
DOMAIN, firebaselogging-pa.googleapis.com, REJECT
DOMAIN-SUFFIX, google-analytics.com, REJECT
DOMAIN-SUFFIX, doubleclick.net, REJECT
DOMAIN-SUFFIX, firebase-settings.crashlytics.com, REJECT
# >>> 国内 App 深度数据采集补漏 (美团/京东/高德/百度/字节)
DOMAIN, d.meituan.net, REJECT
DOMAIN, log.jzt.jd.com, REJECT
DOMAIN, clk.jd.com, REJECT
DOMAIN, logs.amap.com, REJECT
DOMAIN, dualstack-logs.amap.com, REJECT
DOMAIN, refine.amap.com, REJECT
DOMAIN, out.map.baidu.com, REJECT
DOMAIN-SUFFIX, snssdk.com, REJECT
DOMAIN, apilocate.amap.com, REJECT
DOMAIN-SUFFIX, log.byteoversea.com, REJECT
DOMAIN-SUFFIX, ichannel.snssdk.com, REJECT
# >>> 小红书 (核心屏蔽)
DOMAIN, ads-img-qc.xhscdn.com, REJECT
DOMAIN, ads-video-al.xhscdn.com, REJECT
DOMAIN, ads-video-qc.xhscdn.com, REJECT
DOMAIN, t-ads.xiaohongshu.com, REJECT
DOMAIN-SUFFIX, shisandao.com, REJECT
DOMAIN-SUFFIX, stats.xiaohongshu.com, REJECT
DOMAIN-SUFFIX, log.xiaohongshu.com, REJECT
DOMAIN-SUFFIX, stripe.com, REJECT
DOMAIN,deer.xiaohongshu.com,REJECT
DOMAIN,track.xiaohongshu.com,REJECT
DOMAIN,report.xiaohongshu.com,REJECT
DOMAIN,gemini.xiaohongshu.com,REJECT
DOMAIN,p-logs.xiaohongshu.com,REJECT
DOMAIN-KEYWORD,analysis,REJECT
# >>> 支付宝 & 阿里系 (去重合并)
DOMAIN, log.mmstat.com, REJECT
DOMAIN, loggw.alipay.com, REJECT
DOMAIN, loggw-ex.alipay.com, REJECT
DOMAIN, mas-wgw.alipay.com, REJECT
DOMAIN, mdc.alipay.com, REJECT
DOMAIN, amdc.alipay.com, REJECT
DOMAIN, adash.alipay.com, REJECT
DOMAIN, ntp.aliyun.com, REJECT
DOMAIN-KEYWORD, amdc, REJECT
DOMAIN-KEYWORD, log.aliyuncs, REJECT
DOMAIN-SUFFIX, abtest.alibaba.com, REJECT
DOMAIN-SUFFIX, log.aliyuncs.com, REJECT
DOMAIN-SUFFIX, alivc-aio.cn-hangzhou.dualstack.log.aliyuncs.com, REJECT
DOMAIN-SUFFIX, videocloud.cn-hangzhou.dualstack.log.aliyuncs.com, REJECT
DOMAIN-SUFFIX, mmstat.com, REJECT
DOMAIN-SUFFIX, uls.alibaba.com, REJECT
# 高德/阿里系定位核心
DOMAIN, nsm.amap.com, REJECT
DOMAIN, amap-forward.cn-hangzhou.log.aliyuncs.com, REJECT
# 腾讯/微信系定位核心 (防止微信在后台偷偷定位)
DOMAIN, lls.map.qq.com, REJECT
DOMAIN, apis.map.qq.com, REJECT
DOMAIN, oversea-map.qq.com, REJECT
# 百度定位相关 (如有使用百度系 App)
DOMAIN, loc.map.baidu.com, REJECT
DOMAIN, api.map.baidu.com, REJECT
# >>> 闲鱼/淘宝/阿里通用 (去重合并)
DOMAIN, amdc.m.taobao.com, REJECT
DOMAIN, ads-mtop.taobao.com, REJECT
DOMAIN, adashbc.ut.taobao.com, REJECT
DOMAIN, p-adashbc.ut.taobao.com, REJECT
DOMAIN, adash-m.ut.taobao.com, REJECT
DOMAIN, phi.m.taobao.com, REJECT
DOMAIN, guides-acs.m.taobao.com, REJECT
DOMAIN, ut.taobao.com, REJECT
DOMAIN, alilog.taobao.com, REJECT
DOMAIN, adash.m.taobao.com, REJECT
DOMAIN, ads.m.taobao.com, REJECT
DOMAIN-SUFFIX, df.tanx.com, REJECT
DOMAIN-SUFFIX, iyes.youku.com, REJECT
DOMAIN-SUFFIX, biz.m.taobao.com, REJECT
URL-REGEX,^https?:\/\/acs\.m\.goofish\.com\/gw\/mtop\.taobao\.idle\.(splash\.ads|ad\.expose|user\.strategy\.list),REJECT
URL-REGEX,^https?:\/\/acs\.m\.goofish\.com\/gw\/mtop\.idlemtopsearch\.(search\.shade|item\.search\.activate),REJECT
URL-REGEX,^https?:\/\/h5\.m\.goofish\.com\/app\/idleFish-F2e\/idlefish-pop,REJECT
# >>> 微信与腾讯系隐私追踪
DOMAIN, ad.jiagu.qq.com, REJECT
DOMAIN, btrace.qq.com, REJECT
DOMAIN, rpt.jiagu.qq.com, REJECT
DOMAIN, v.smtcdns.com, REJECT
DOMAIN, monitor.uu.qq.qq.com, REJECT
DOMAIN, htrace.qq.com, REJECT
DOMAIN, hstats.qq.com, REJECT
DOMAIN, mta.qq.com, REJECT
DOMAIN, mi.gdt.qq.com, REJECT
DOMAIN, win.gdt.qq.com, REJECT
DOMAIN, tpns.qq.com, REJECT
DOMAIN, log.weixin.qq.com, REJECT
DOMAIN, long.weixin.qq.com, REJECT
DOMAIN, snowflake.qq.com, REJECT
DOMAIN, mazu.m.qq.com, REJECT
DOMAIN, sdk.e.qq.com, REJECT
DOMAIN, pgdt.gtimg.cn, REJECT
DOMAIN-SUFFIX, gdt.qq.com, REJECT, pre-matching
DOMAIN-SUFFIX, tpns.tencent.com, REJECT
DOMAIN-SUFFIX, bugly.qq.com, REJECT
# >>> Lazada 专项
DOMAIN, adash.ut.lazada.com, REJECT
DOMAIN, optimus-ads.lazada.com, REJECT
DOMAIN, m-ads.lazada.co.th, REJECT
URL-REGEX, ^https?:\/\/acs\.m\.lazada\.com\/gw\/mtop\.lazada\.guide\.getSplashAd, REJECT
URL-REGEX, ^https?:\/\/acs\.m\.lazada\.com\/gw\/mtop\.lazada\.ad\.expose, REJECT
# >>> Agoda 隐私追踪与日志上报
DOMAIN, gadgets.agoda.com, REJECT
DOMAIN, metrics.agoda.com, REJECT
DOMAIN, trace.agoda.com, REJECT
DOMAIN-SUFFIX, agodametrics.com, REJECT
# >>> AirAsia (亚航) 行为审计与统计
DOMAIN, d.airasia.com, REJECT
DOMAIN, analytics.airasia.com, REJECT
DOMAIN, travel-api.airasia.com, REJECT
DOMAIN-SUFFIX, airasia.io, REJECT
# 拦截亚航集成的 Braze 追踪 (海外 App 常用)
DOMAIN-KEYWORD, braze, REJECT
DOMAIN, mobile-logging.truemoney.com, REJECT
# >>> 百度 (去重合并)
DOMAIN-SUFFIX, pos.baidu.com, REJECT
DOMAIN-SUFFIX, mobads.baidu.com, REJECT
# >>> Instagram & Meta/Facebook (去重合并)
DOMAIN, scontent.fads.fbcdn.net, REJECT
DOMAIN, ads.fbsbx.com, REJECT
DOMAIN, edge-chat.facebook.com, REJECT
DOMAIN, graph.instagram.com, REJECT
DOMAIN, pixel.facebook.com, REJECT
DOMAIN, telemetry.instagram.com, REJECT
DOMAIN, ads.facebook.com, REJECT
DOMAIN, z-p42-instagram.fna.fbcdn.net, REJECT
DOMAIN, b-graph.facebook.com, REJECT
DOMAIN, graph.facebook.com, REJECT
DOMAIN, connect.facebook.net, REJECT
DOMAIN, analytics.facebook.com, REJECT
DOMAIN-SUFFIX, config.facebook.com, REJECT
DOMAIN-SUFFIX, graph.fb.com, REJECT
DOMAIN-SUFFIX, fbevents.com, REJECT
DOMAIN-SUFFIX, facebk.com, REJECT
# >>> 拼多多
DOMAIN, titan.pinduoduo.com, REJECT
DOMAIN, log.pinduoduo.com, REJECT
DOMAIN-SUFFIX, pinduoduo.com, REJECT
DOMAIN-SUFFIX, yangkeduo.com, REJECT
# >>> 携程 Ctrip/Trip.com (去重合并)
DOMAIN, m.ctrip.com, REJECT
DOMAIN, t.ctrip.com, REJECT
DOMAIN, s.ctrip.com, REJECT
DOMAIN, f-log.ctrip.com, REJECT
DOMAIN, l.ctrip.com, REJECT
DOMAIN, ad.ctrip.com, REJECT
DOMAIN, ads.ctrip.com, REJECT
DOMAIN, mads.ctrip.com, REJECT
DOMAIN, p.ctrip.com, REJECT
DOMAIN, m.trip.com, REJECT
DOMAIN, flip.ctrip.com, REJECT
DOMAIN, adtrack.ctrip.com, REJECT
DOMAIN, afp.ctrip.com, REJECT
DOMAIN, telemetry.ctrip.com, REJECT
DOMAIN, ubt.ctrip.com, REJECT
DOMAIN, m.ctrip.com.ubt.com, REJECT
DOMAIN-SUFFIX, c-ctrip.com, REJECT
DOMAIN-KEYWORD, ctrip.log, REJECT
DOMAIN, sofire.baidu.com, REJECT, extended-matching, pre-matching
DOMAIN-SUFFIX, cn-shanghai.nlb.aliyuncs.com, REJECT, extended-matching, pre-matching
DOMAIN-SUFFIX, volceapplog.com, REJECT, extended-matching, pre-matching
IP-CIDR, 210.13.85.204/32, REJECT, no-resolve, pre-matching
IP-CIDR, 114.80.56.98/32, REJECT, no-resolve, pre-matching
IP-CIDR, 162.14.145.54/32, REJECT, no-resolve, pre-matching
IP-CIDR, 162.14.137.43/32, REJECT, no-resolve, pre-matching
# >>> 字节/穿山甲/广告 SDK (去重合并)
DOMAIN-KEYWORD, pangolin-sdk, REJECT
DOMAIN-SUFFIX, toblog.ctobsnssdk.com, REJECT
DOMAIN-SUFFIX, fengkongcloud.com, REJECT
DOMAIN-SUFFIX, api-access.pangolin-sdk-toutiao-b.com, REJECT
DOMAIN-SUFFIX, api-access.pangolin-sdk-toutiao1.com, REJECT
DOMAIN-SUFFIX, tnc3-alisc1.zijieapi.com, REJECT
DOMAIN-SUFFIX, pangolin-sdk-toutiao.com, REJECT
DOMAIN-SUFFIX, miads-sdk.com, REJECT
DOMAIN-SUFFIX, adukwai.com, REJECT
DOMAIN-SUFFIX, pglstatp-toutiao.com, REJECT
DOMAIN-SUFFIX, volces.com, REJECT
DOMAIN-SUFFIX, beizi.biz, REJECT
DOMAIN-SUFFIX, mangzx.com, REJECT
DOMAIN-SUFFIX, ubixioe.com, REJECT
DOMAIN-SUFFIX, hubcloud.com.cn, REJECT
DOMAIN-SUFFIX, talkingdata.com, REJECT
DOMAIN-SUFFIX, e.kuaishou.com, REJECT
DOMAIN-SUFFIX, gifshow.com, REJECT
DOMAIN-SUFFIX, ad.toutiao.com, REJECT
DOMAIN-SUFFIX, ad.zijieapi.com, REJECT
DOMAIN-SUFFIX, pangle.io, REJECT
DOMAIN-SUFFIX, volcengine.com, REJECT
IP-CIDR, 139.95.0.151/32, REJECT
# >>> 友盟/数美/其他
DOMAIN-SUFFIX, umeng.com, REJECT, pre-matching
DOMAIN-SUFFIX, umengcloud.com, REJECT, pre-matching
DOMAIN-SUFFIX, shuzilm.cn, REJECT
# >>> 其他互联网服务 (京东/美团/Apple/Google等)
DOMAIN, mercury.jd.com, REJECT
DOMAIN-SUFFIX, jads.jd.com, REJECT
DOMAIN-SUFFIX, report.meituan.net, REJECT
DOMAIN-SUFFIX, sigmob.cn, REJECT
DOMAIN-SUFFIX, etoolads.cn, REJECT
DOMAIN-SUFFIX, sdk.xylink.com, REJECT
DOMAIN-SUFFIX, iadsdk.apple.com, REJECT
DOMAIN-SUFFIX, crashlytics.com, REJECT
DOMAIN, logs.apple.com, REJECT
DOMAIN, app-analytics-services.com, REJECT
DOMAIN, ads.google.com, REJECT
DOMAIN-SUFFIX, www.googleadservices.com, REJECT
########################################
# URL Rewrite（屏蔽请求）
########################################
[URL Rewrite]
^https?:\/\/[\w-]+\.googlevideo\.com\/initplayback.+&oad - reject-200 
^https?:\/\/acs\.m\.goofish\.com\/gw\/mtop\.taobao\.idle\.(splash|ad\.expose) - reject
########################################
# Script
########################################
[Script]
youtube.response = type=http-response, pattern=^https:\/\/youtubei\.googleapis\.com\/(youtubei\/v1\/(browse|next|search|reel\/reel_watch_sequence|guide|account\/get_setting|get_watch))(\?(.*))?$, script-path=https://raw.githubusercontent.com/idnotknowwhyneedname/MyScripts/main/youtube.response.js, requires-body=true, binary-body-mode=true, max-size=1048576, argument="{"blockUpload":true,"blockImmersive":true,"blockShorts":true,"debug":false}"
# 小红书
小红书 = type=http-response, pattern=^https:\/\/edith\.xiaohongshu\.com\/api\/sns\/(v\d\/|search\/|system_service\/), script-path=https://raw.githubusercontent.com/idnotknowwhyneedname/MyScripts/main/Rednote.js, requires-body=true, binary-body-mode=true, max-size=1048576
[MITM]
hostname = %APPEND% edith.xiaohongshu.com, youtubei.googleapis.com, *.googlevideo.com, acs.m.goofish.com
