'use strict';
'require rpc';
'require ui';
'require view';

const _zh = {
	'Engine': '引擎',
	'New': '新建',
	'Testing...': '正在测试……',
	'V2Ray + MosDNS': 'V2Ray + MosDNS',
	'v2rayB unified proxy': 'v2rayB 统一代理',
	'Open this tab to load the active configuration.': '打开此标签页加载当前配置。',
	'Loading configuration...': '正在加载配置……',
	'Loading DNS status...': '正在加载 DNS 状态……',
	'Add subscription': '添加订阅',
	'Edit subscription': '编辑订阅',
	'Subscription source': '订阅来源',
	'Name': '名称',
	'URL': 'URL',
	'Format': '格式',
	'Add and fetch': '添加订阅',
	'Save and refresh': '保存订阅并更新',
	'Subscription update started.': '订阅更新已在后台开始。',
	'Subscription update completed.': '订阅更新完成。',
	'Fetching...': '获取中……',
	'Subscription update failed: %s': '订阅更新失败：%s',
	'Subscription status could not be read.': '无法读取订阅状态。',
	'Cancel': '取消',
	'The router downloads this URL directly.': '路由器会直接下载此 URL。',
	'Auto detects plain URI lines or Base64-encoded URI lines.': '自动识别普通 URI 行或 Base64 编码的 URI 行。',
	'Subscriptions': '订阅',
	'Proxy Nodes': '代理节点',
	'Profiles': '配置',
	'Overview': '概览',
	'Nodes and profiles': '节点与配置',
	'DNS and proxy': 'DNS 与代理',
	'Diagnostics': '诊断',
	'Logs': '日志',
	'All components': '全部组件',
	'v2rayB': 'v2rayB',
	'V2Ray': 'V2Ray',
	'Proxy engine': '代理引擎',
	'Use Xray for REALITY nodes that fail with the V2Ray compatibility engine.': 'V2Ray 兼容引擎无法连接 REALITY 节点时请选择 Xray。',
	'MosDNS': 'MosDNS',
	'dnsmasq': 'dnsmasq',
	'System log': '系统日志',
	'Log component': '日志组件',
	'Lines': '行数',
	'Refresh logs': '刷新日志',
	'Loading logs...': '正在读取日志……',
	'No log entries.': '没有可显示的日志。',
	'Add': '添加',
	'Edit': '编辑',
	'Delete': '删除',
	'Update': '更新',
	'Status': '状态',
	'Service Control': '服务控制',
	'Enable v2rayB': '启用 v2rayB',
	'Enabled': '已启用',
	'Disabled': '已禁用',
	'Current state:': '当前状态：',
	'Applied profile': '当前应用配置',
	'Profile': '配置',
	'DNS Resolution Chain': 'DNS 解析链路',
	'MosDNS Narrow Route': 'MosDNS 窄路由',
	'Runtime status': '运行状态',
	'Applied V2Ray configuration': '当前 V2Ray 配置',
	'Test URL': '测试 URL',
	'Target URL': '目标 URL',
	'Test a URL from this router': '从本路由器测试 URL',
	'Name and URL are required.': '名称和 URL 不能为空。',
	'Subscription saved and nodes updated.': '订阅已保存，节点已更新。',
	'Subscription nodes updated.': '订阅节点已更新。',
	'Subscription deleted.': '订阅已删除。',
	'No subscriptions configured.': '尚未配置订阅。',
	'No nodes configured.': '尚未配置节点。',
	'No matching nodes in this group.': '此分组没有匹配节点。',
	'No profiles configured.': '尚未配置配置。',
	'Ready': '就绪',
	'Manual': '手动',
	'Node': '节点',
	'Server': '服务器',
	'Port': '端口',
	'Protocol': '协议',
	'Source': '来源',
	'Actions': '操作',
	'A answers': 'A 记录',
	'AAAA answers': 'AAAA 记录',
	'Add proxy node': '添加代理节点',
	'Add to pending changes': '加入待应用变更',
	'All through proxy': '全部走代理',
	'Allow insecure': '允许不安全连接',
	'ALPN': 'ALPN',
	'Also controls boot startup.': '同时控制开机启动。',
	'Applied after Save & Apply.': '点击“保存并应用”后生效。',
	'Applying configuration changes…': '正在应用配置变更……',
	'Apply status could not be read; retrying…': '无法读取应用状态，正在重试……',
	'Configuration changes applied.': '配置变更已应用。',
	'Configuration apply failed.': '配置应用失败。',
	'Preparing configuration': '正在准备配置',
	'Queued': '等待执行',
	'Rendering configuration': '正在生成配置',
	'Restarting service': '正在重启服务',
	'Resuming service': '正在恢复服务',
	'Restoring service': '正在恢复服务',
	'Rolling back changes': '正在回滚变更',
	'Saving configuration': '正在保存配置',
	'Starting service': '正在启动服务',
	'Stopping service': '正在停止服务',
	'The configuration apply failed.': '配置应用失败。',
	'The configuration apply status could not be read.': '无法读取配置应用状态。',
	'This task continues in the background if this page is closed.': '关闭此页面后，任务仍会在后台继续。',
	'Updating boot state': '正在更新开机启动状态',
	'Verifying service': '正在验证服务状态',
	'Auto detects plain URI lines or Base64-encoded URI lines.': '自动识别普通 URI 行或 Base64 编码的 URI 行。',
	'Basic settings': '基本设置',
	'Bypass China IP': '中国 IP 直连',
	'China IP direct': '中国 IP 直连',
	'CNAME': 'CNAME',
	'Comma-separated values, for example h2,http/1.1.': '多个值用逗号分隔，例如 h2,http/1.1。',
	'Component': '组件',
	'Configured upstreams': '配置的上游',
	'Confirm deletion': '确认删除',
	'Connected remote': '连接的远端',
	'Contains credentials. Do not share.': '包含账号凭据，请勿分享。',
	'Create a profile': '创建配置方案',
	'Current value': '当前值',
	'Default upstream': '默认上游',
	'Defaults to the server address.': '默认使用服务器地址。',
	'Degraded': '异常降级',
	'Suspended': '已暂停接管',
	'Delete node "%s"?': '删除节点“%s”？',
	'Delete profile "%s"?': '删除配置“%s”？',
	'Delete subscription "%s" and its unreferenced nodes?': '删除订阅“%s”及其未被配置引用的节点？',
	'Direct DNS': '直连 DNS',
	'Direct DNS default': '默认直连 DNS',
	'Download': '下载',
	'IPv4 + IPv6': 'IPv4 + IPv6',
	'IPv4 only': '仅 IPv4',
	'IPv4 only download': '仅使用 IPv4 下载',
	'Only affects subscription downloads; proxy traffic is unchanged.': '仅影响订阅下载，不影响代理流量。',
	'The router downloads this URL directly through WAN, bypassing the router traffic proxy.': '路由器通过 WAN 直连下载此 URL，不经过路由器流量代理。',
	'Direct DNS upstream': '直连 DNS 上游',
	'Direct DNS upstreams': '直连 DNS 上游列表',
	'Global DNS settings': '全局 DNS 设置',
	'One upstream per line or comma-separated. Used for bootstrap, subscription and MosDNS direct resolution.': '每行一个上游，也可用逗号分隔。用于节点引导、订阅下载和 MosDNS 直连解析。',
	'Direct match: Direct DNS + direct sets.': '直连匹配：直连 DNS + 直连地址集合。',
	'Direct regexp': '直连正则表达式',
	'Disabled: all intercepted traffic uses the proxy.': '关闭后，所有被拦截流量都走代理。',
	'Disabled: domains and rules are inactive but retained.': '关闭后，域名和规则不生效，但会保留。',
	'Direct: use Direct DNS and add the answer to the direct nft set.': '直连：使用直连 DNS，并将解析结果加入直连 nft 集合。',
	'Handles the listed Google Play download suffixes separately so mainland cache addresses can stay direct. Disabled: settings are retained but inactive.': '单独处理列出的 Google Play 下载域名后缀，使返回国内缓存地址时保持直连。关闭后，设置会保留但不生效。',
	'Suffixes forwarded to MosDNS, one per line.': '转发给 MosDNS 的域名后缀，每行一个。',
	'Unmatched names use V2Ray DNS.': '未匹配的域名使用 V2Ray DNS。',
	'Intercepted TCP destination ports': '拦截的 TCP 目标端口',
	'Transparent proxy listener port': '透明代理监听端口',
	'Loopback transparent proxy inbound port.': '透明代理入站的本地监听端口。',
	'Verify proxy connectivity': '验证代理连通性',
	'When disabled, traffic and DNS are imported immediately without an end-to-end proxy check.': '关闭后不进行端到端代理检查，直接导入流量和 DNS。',
	'Connectivity probe': '连通性探测',
	'Connectivity probe port': '连通性探测端口',
	'Loopback-only SOCKS port used to verify that the proxy can reach the internet.': '仅监听回环地址的 SOCKS 端口，用于验证代理能否访问互联网。',
	'Enter valid listener and probe ports.': '请输入有效的监听端口和探测端口。',
	'Transparent proxy and probe ports must differ.': '透明代理端口和探测端口不能相同。',
	'DNS': 'DNS',
	'DNS / TCP / TLS / first byte / total': 'DNS / TCP / TLS / 首字节 / 总耗时',
	'DNS branch': 'DNS 分支',
	'DNS entry': 'DNS 入口',
	'DNS path': 'DNS 路径',
	'DNS query time': 'DNS 查询耗时',
	'DNS result': 'DNS 结果',
	'DNS route': 'DNS 路由',
	'DNS routing': 'DNS 路由',
	'DNS upstream note': 'DNS 上游说明',
	'Domain-rule files': '域名规则文件',
	'Edit profile': '编辑配置方案',
	'Edit proxy node': '编辑代理节点',
	'Effective Profile Policy': '当前生效的配置策略',
	'Effective value': '生效值',
	'Egress device / gateway': '出口设备 / 网关',
	'Enable MosDNS branch': '启用 MosDNS 分流',
	'Enable mux': '启用多路复用',
	'Enter a profile name, primary node, DNS upstream and proxy ports.': '请填写配置名称、主节点、DNS 上游和代理端口。',
	'Enter an http:// or https:// URL first.': '请先输入 http:// 或 https:// 开头的网址。',
	'Enter at least one domain when MosDNS is enabled.': '启用 MosDNS 时，至少填写一个域名。',
	'Example: 80,443,8080-8443.': '例如：80,443,8080-8443。',
	'Fallback: V2Ray DNS, no direct sets.': '回退策略：使用 V2Ray DNS，不写入直连地址集合。',
	'For MosDNS direct queries.': '用于 MosDNS 的直连查询。',
	'Force-proxy answers': '强制代理解析结果',

	'Forwarded suffix': '转发域名后缀',
	'gRPC service name': 'gRPC 服务名称',
	'H2 host': 'H2 主机',
	'H2 path': 'H2 路径',
	'HTTP(S) result': 'HTTP(S) 结果',
	'HTTPS error': 'HTTPS 错误',
	'ID': '编号',
	'Important: v2rayB transparent redirect rules currently apply to LAN traffic in PREROUTING. A request generated by the router follows its own OUTPUT route and may not use the LAN client proxy path.': '注意：v2rayB 透明代理规则目前只在 PREROUTING 中处理 LAN 流量。路由器自身发起的请求走 OUTPUT 路径，可能不会经过 LAN 客户端代理。',
	'Imported: ': '导入来源：',
	'Includes TCP connections started by this router. UDP and DNS are not proxied.': '包括路由器自身发起的 TCP 连接；UDP 和 DNS 不经过代理。',
	'Item': '项目',
	'Kernel route': '内核路由',
	'LAN client': 'LAN 客户端',
	'Last update': '最近更新',
	'Listener / upstream': '监听地址 / 上游',
	'Local socket': '本地套接字',
	'MosDNS direct answers': 'MosDNS 直连解析结果',
	'MosDNS domains': 'MosDNS 域名',
	'MosDNS listener': 'MosDNS 监听地址',
	'MosDNS match rules': 'MosDNS 匹配规则',
	'MosDNS narrow branch': 'MosDNS 精细分流',
	'MosDNS off': 'MosDNS 已关闭',
	'MosDNS on': 'MosDNS 已开启',
	'Multiplexing': '多路复用',
	'Mux concurrency': '多路复用并发数',
	'Name and URL are required.': '名称和网址不能为空。',
	'Name, server, port and UUID/password are required.': '名称、服务器、端口和 UUID/密码不能为空。',
	'nftables Direct Sets': 'nftables 直连地址集合',
	'No active profile policy': '没有活动配置策略',
	'No active profile policy available.': '没有可用的活动配置策略。',
	'No direct regex rule configured': '未配置直连正则规则',
	'No DNS state data available. Use URL diagnostics for the observed path.': '暂无 DNS 状态数据。请使用网址诊断查看实际链路。',
	'No MosDNS route data available.': '暂无 MosDNS 路由信息。',
	'No nftables set data available.': '暂无 nftables 地址集合信息。',
	'No node': '没有节点',
	'No probe result.': '暂无诊断结果。',
	'No profiles configured.': '尚未添加配置方案。',
	'No request has been tested yet.': '尚未进行测试。',
	'No runtime status available.': '暂无运行状态。',
	'No status data available.': '暂无状态信息。',
	'No V2Ray configuration available.': '暂无 V2Ray 配置。',
	'Node is referenced by a profile; delete or move that profile before disabling the node.': '该节点正被配置方案引用，请先修改配置方案再停用节点。',
	'Node is referenced by a profile; delete or move that profile first.': '该节点正被配置方案引用，请先修改配置方案再删除节点。',
	'Nodes': '节点',
	'Node group': '节点分组',
	'All nodes': '全部节点',
	'Test current group': '测速当前分组',
	'Node latency': '节点延迟',
	'Not tested': '未测速',
	'Testing node group...': '正在测速当前分组……',
	'Node speed test started.': '节点测速已在后台开始。',
	'Node speed test completed.': '节点测速完成。',
	'Node speed test failed: %s': '节点测速失败：%s',
	'TLS/HTTP success': 'TLS/HTTP 成功',
	'TCP connected': 'TCP 已连通',
	'Connection failed': '连接失败',
	'Tests TCP and TLS connection from the router; it does not change the active profile.': '从路由器测试节点的 TCP 和 TLS 建连，不会切换当前应用配置。',
	'None': '无',
	'none': '无',
	'Normal mode': '普通模式',
	'not applicable': '不适用',
	'Not selected': '未选择',
	'Observation scope': '观测范围',
	'Observation status': '观测状态',
	'Observed query types': '观测到的查询类型',
	'Observed upstreams': '观测到的上游',
	'One rule per line: domain:, full: or regexp:.': '每行一条规则，格式为 domain:、full: 或 regexp:。',
	'Only names not matched by a domain-specific dnsmasq rule use the V2Ray resolver. China domain rules still use Direct DNS.': '仅未命中 dnsmasq 域名专属规则的查询会使用 V2Ray DNS；中国域名规则仍走直连 DNS。',
	'Order': '顺序',
	'Path note': '链路说明',
	'Pending changes: Save & Apply to activate, or Reset to discard.': '存在待应用的变更：点击“保存并应用”以生效，或点击“重置”放弃。',
	'Policy': '策略',
	'Ports': '端口',
	'Listen': '监听',
	'Probe': '探测',
	'Probe off': '探测关闭',
	'Primary node': '主节点',
	'Probe detail': '诊断详情',
	'Profile name': '配置名称',
	'Profile policy': '配置策略',
	'Profile to activate': '要启用的配置方案',
	'Property': '属性',
	'Protocol details': '协议详情',
	'Proxy DNS': '代理 DNS',
	'Proxy mode': '代理模式',
	'Proxy router-originated TCP': '代理路由器自身发起的 TCP 流量',
	'Reality fingerprint': 'Reality 指纹',
	'Reality public key': 'Reality 公钥',
	'Reality short ID': 'Reality 短 ID',
	'Reality SpiderX': 'Reality SpiderX',
	'Request failed with code %s.': '请求失败，错误码：%s。',
	'Requested URL': '请求网址',
	'Result': '结果',
	'Route source address': '路由源地址',
	'Router RPC failed with ubus code %s: %s.': '路由器 RPC 调用失败，ubus 错误码 %s：%s。',
	'Router TCP off': '路由器 TCP 代理已关闭',
	'Router TCP on': '路由器 TCP 代理已开启',
	'Running DNS and HTTPS checks from the router...': '正在从路由器执行 DNS 和 HTTPS 检查……',
	'Runtime set': '运行时集合',
	'Save and refresh': '保存并刷新',
	'Security': '安全设置',
	'Select a primary node': '选择主节点',
	'Select a profile': '选择配置方案',
	'Select and apply another profile before deleting this one.': '请先选择并应用其他配置方案，再删除当前方案。',
	'Select and apply another profile before disabling this one.': '请先选择并应用其他配置方案，再停用当前方案。',
	'Service': '服务',
	'Shadowsocks method': 'Shadowsocks 加密方式',
	'Skip certificate verification.': '跳过证书验证。',
	'SNI / server name': 'SNI / 服务器名称',
	'Starting': '启动中',
	'Static set': '静态集合',
	'Stopping': '停止中',
	'Stored node settings could not be decoded.': '无法解析已保存的节点设置。',
	'Subscription: ': '订阅来源：',
	'TCP header type': 'TCP 请求头类型',
	'TCP HTTP host': 'TCP HTTP 主机',
	'TCP HTTP path': 'TCP HTTP 路径',
	'The router queries local dnsmasq and records its actual outbound DNS targets, then makes a real HTTP(S) request. Cache and local answers may have no observed upstream.': '路由器会通过本机 dnsmasq 查询域名、记录实际 DNS 出站目标，然后发起真实的 HTTP(S) 请求。命中缓存或本地应答时，可能无法观测到上游。',
	'The router returned no error details. Check the system log for the request time.': '路由器未返回错误详情，请检查对应时间的系统日志。',
	'The URL probe could not be started.': '无法启动网址诊断。',
	'The URL probe failed.': '网址诊断失败。',
	'The URL probe is still running. Try again in a moment.': '网址诊断仍在运行，请稍后重试。',
	'The URL probe status could not be read.': '无法读取网址诊断状态。',
	'There are no pending draft changes.': '没有待应用的草稿变更。',
	'TLS and security': 'TLS 与安全',
	'TLS verification': 'TLS 验证',
	'Transparent TCP ports': '透明代理 TCP 端口',
	'Transport': '传输方式',
	'Unknown': '未知',
	'Unspecified error': '未指定错误',
	'Update failed: %s': '更新失败：%s',
	'Update pending changes': '更新待应用变更',
	'Use a full http:// or https:// URL. The request originates on the router itself.': '请输入完整的 http:// 或 https:// 网址。请求由路由器自身发起。',
	'Use V2Ray DNS as dnsmasq default': '将 V2Ray DNS 设为 dnsmasq 默认上游',
	'UUID / password': 'UUID / 密码',
	'V2Ray DNS default': '默认使用 V2Ray DNS',
	'V2Ray DNS listener': 'V2Ray DNS 监听地址',
	'valid': '有效',
	'VLESS flow': 'VLESS 流控',
	'WAN / normal mode': 'WAN / 普通模式',
	'WAN DHCP DNS': 'WAN DHCP DNS',
	'Watchdog': '看门狗',
	'Enable watchdog': '启用看门狗',
	'Automatically withdraws traffic and DNS imports after repeated proxy connectivity failures.': '代理连续连通失败时，自动撤销流量和 DNS 接管。',
	'WebSocket host': 'WebSocket 主机',
	'WebSocket path': 'WebSocket 路径',
	'Your changes are saved as a draft. Use Save & Apply to make them active.': '变更已保存为草稿，请点击“保存并应用”使其生效。',
};
const _ = value => Object.prototype.hasOwnProperty.call(_zh, value) ? _zh[value] : value;

const callStatus = rpc.declare({
	object: 'luci.v2rayb', method: 'status', expect: { '': {} }
});
const callDnsState = rpc.declare({
	object: 'luci.v2rayb', method: 'dns_state', expect: { '': {} }
});
const callGetV2rayConfig = rpc.declare({
	object: 'luci.v2rayb', method: 'get_v2ray_config', expect: { '': {} }
});
const callLogs = rpc.declare({
	object: 'luci.v2rayb', method: 'logs', params: [ 'component', 'lines' ], expect: { '': {} }, reject: true
});
const callNetworkProbeStart = rpc.declare({
	object: 'luci.v2rayb', method: 'network_probe_start', params: [ 'url' ], expect: { '': {} }, reject: true
});
const callNetworkProbeStatus = rpc.declare({
	object: 'luci.v2rayb', method: 'network_probe_status', params: [ 'job_id' ], expect: { '': {} }, reject: true
});
const callNodes = rpc.declare({
	object: 'luci.v2rayb', method: 'list_nodes', expect: { '': {} }
});
const callSources = rpc.declare({
	object: 'luci.v2rayb', method: 'list_sources', expect: { '': {} }
});
const callAddSource = rpc.declare({
	object: 'luci.v2rayb', method: 'add_source',
	params: [ 'name', 'url', 'format', 'ipv4_only' ], expect: { '': {} }, reject: true
});
const callSubscriptionUpdateStart = rpc.declare({
	object: 'luci.v2rayb', method: 'subscription_update_start', params: [ 'source_id' ], expect: { '': {} }, reject: true
});
const callSubscriptionUpdateStatus = rpc.declare({
	object: 'luci.v2rayb', method: 'subscription_update_status', params: [ 'job_id' ], expect: { '': {} }, reject: true
});
const callNodeProbeStart = rpc.declare({
	object: 'luci.v2rayb', method: 'node_probe_start', params: [ 'source_id' ], expect: { '': {} }, reject: true
});
const callNodeProbeStatus = rpc.declare({
	object: 'luci.v2rayb', method: 'node_probe_status', params: [ 'job_id' ], expect: { '': {} }, reject: true
});
const callDeleteSource = rpc.declare({
	object: 'luci.v2rayb', method: 'delete_source', params: [ 'source_id' ], expect: { '': {} }, reject: true
});
const callProfiles = rpc.declare({
	object: 'luci.v2rayb', method: 'list_profiles', expect: { '': {} }
});
const callSetSetting = rpc.declare({
	object: 'luci.v2rayb', method: 'set_setting', params: [ 'key', 'value' ], expect: { '': {} }, reject: true
});
const callSelectProfile = rpc.declare({
	object: 'luci.v2rayb', method: 'select_profile', params: [ 'profile_id' ], expect: { '': {} }, reject: true
});
const callApplyDraftStart = rpc.declare({
	object: 'luci.v2rayb', method: 'apply_draft_start', expect: { '': {} }, reject: true
});
const callApplyDraftStatus = rpc.declare({
	object: 'luci.v2rayb', method: 'apply_draft_status', params: [ 'job_id' ], expect: { '': {} }, reject: true
});
const callRevertDraft = rpc.declare({
	object: 'luci.v2rayb', method: 'revert_draft', expect: { '': {} }, reject: true
});
const callAddProfile = rpc.declare({
	object: 'luci.v2rayb', method: 'add_profile',
	params: [ 'name', 'node_id', 'direct_dns', 'transparent_proxy_ports', 'bypass_china',
		'use_v2ray_dns', 'mosdns_enabled', 'mosdns_domains', 'mosdns_match_rules',
		'proxy_router_traffic', 'transparent_proxy_port', 'probe_enabled', 'probe_port', 'engine' ],
	expect: { '': {} }, reject: true
});
const callUpdateProfile = rpc.declare({
	object: 'luci.v2rayb', method: 'update_profile',
	params: [ 'profile_id', 'name', 'node_id', 'direct_dns', 'transparent_proxy_ports', 'bypass_china',
		'use_v2ray_dns', 'mosdns_enabled', 'mosdns_domains', 'mosdns_match_rules',
		'proxy_router_traffic', 'transparent_proxy_port', 'probe_enabled', 'probe_port', 'engine' ],
	expect: { '': {} }, reject: true
});
const callGetProfile = rpc.declare({
	object: 'luci.v2rayb', method: 'get_profile', params: [ 'profile_id' ], expect: { '': {} }
});
const callSetProfileEnabled = rpc.declare({
	object: 'luci.v2rayb', method: 'set_profile_enabled', params: [ 'profile_id', 'enabled' ], expect: { '': {} }, reject: true
});
const callDeleteProfile = rpc.declare({
	object: 'luci.v2rayb', method: 'delete_profile', params: [ 'profile_id' ], expect: { '': {} }, reject: true
});
const callAddNode = rpc.declare({
	object: 'luci.v2rayb', method: 'add_node',
	params: [ 'name', 'protocol', 'server', 'port', 'data_json' ], expect: { '': {} }, reject: true
});
const callGetNode = rpc.declare({
	object: 'luci.v2rayb', method: 'get_node', params: [ 'node_id' ], expect: { '': {} }
});
const callUpdateNode = rpc.declare({
	object: 'luci.v2rayb', method: 'update_node',
	params: [ 'node_id', 'name', 'protocol', 'server', 'port', 'data_json' ], expect: { '': {} }, reject: true
});
const callSetNodeEnabled = rpc.declare({
	object: 'luci.v2rayb', method: 'set_node_enabled', params: [ 'node_id', 'enabled' ], expect: { '': {} }, reject: true
});
const callDeleteNode = rpc.declare({
	object: 'luci.v2rayb', method: 'delete_node', params: [ 'node_id' ], expect: { '': {} }, reject: true
});

function outputOf(result) {
	return result && typeof result.output === 'string' ? result.output : '';
}

function parseKeyValues(text) {
	const result = {};
	for (const line of text.split('\n')) {
		const index = line.indexOf('=');
		if (index > 0)
			result[line.slice(0, index)] = line.slice(index + 1);
	}
	return result;
}

function parseRows(text) {
	return text.trim() ? text.trim().split('\n').map(line => line.split('\t')) : [];
}

function isEnabled(value) {
	return value === '1' || value === 1 || value === true;
}

function checkbox(attributes, checked) {
	const input = E('input', {
		type: 'checkbox',
		class: 'cbi-input-checkbox',
		...(attributes || {})
	});
	input.checked = checked === true;
	return input;
}

function css() {
	return E('style', {}, `
		.v2rayb-shell { max-width: 1180px; }
		.v2rayb-hero { color: #fff; padding: 1.5rem 1.6rem; margin-bottom: 1rem; border-radius: 16px;
			background: linear-gradient(135deg, #17324d 0%, #286b78 100%); box-shadow: 0 12px 30px rgba(23,50,77,.18); }
		.v2rayb-hero h2 { margin: 0 0 .3rem; color: #fff; font-size: 1.65rem; }
		.v2rayb-hero p { margin: 0; color: rgba(255,255,255,.82); }
		.v2rayb-hero-meta { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1rem; }
		.v2rayb-chip { display: inline-flex; align-items: center; gap: .35rem; padding: .35rem .65rem;
			border: 1px solid #d5dce5; border-radius: 999px; background: #f6f8fa; color: #29384d; font-size: .82rem; }
		.v2rayb-hero .v2rayb-chip { border-color: rgba(255,255,255,.22); background: transparent; color: #fff; }
		.v2rayb-nav { display: flex; flex-wrap: wrap; gap: .55rem; margin-bottom: 1rem; }
		.v2rayb-nav button { min-width: 9.5rem; padding: .75rem .9rem; text-align: left; cursor: pointer;
			border: 1px solid #d5dce5; border-radius: 12px; background: #fff; color: #29384d; }
		.v2rayb-nav button:hover { border-color: #2d7d86; box-shadow: 0 5px 14px rgba(31,70,85,.1); }
		.v2rayb-nav button.active { border-color: #286b78; background: #286b78; color: #fff; box-shadow: 0 7px 18px rgba(40,107,120,.2); }
		.v2rayb-nav-title { display: block; font-weight: 700; }
		.v2rayb-nav-caption { display: block; margin-top: .2rem; font-size: .78rem; opacity: .75; }
		.v2rayb-filter-tabs { display: flex; flex-wrap: wrap; gap: .4rem; margin: .75rem 0 .25rem; }
		.v2rayb-filter-tabs button { min-width: 0; padding: .45rem .75rem; border: 1px solid #d5dce5;
			border-radius: 9px; background: #fff; color: #34465c; cursor: pointer; font-weight: 650; }
		.v2rayb-filter-tabs button:hover { border-color: #2d7d86; background: #f3f9fa; }
		.v2rayb-filter-tabs button.active { border-color: #286b78; background: #286b78; color: #fff; }
		.v2rayb-group-label { display: block; padding: .3rem .65rem; color: #687587; font-size: .82rem; font-weight: 700; }
		.v2rayb-panel { display: block; }
		.v2rayb-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: .75rem; margin-bottom: 1rem; }
		.v2rayb-card { padding: 1rem 1.1rem; border: 1px solid #d8dfe7; border-radius: 14px;
			background: linear-gradient(180deg, #fff 0%, #f6f8fa 100%); }
		.v2rayb-card-label { color: #657286; font-size: .78rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
		.v2rayb-card-value { margin-top: .35rem; color: #203047; font-size: 1.35rem; font-weight: 750; }
		.v2rayb-card-help { margin-top: .3rem; color: #6a7585; font-size: .82rem; line-height: 1.35; }
		.v2rayb-status { display: inline-flex; align-items: center; gap: .4rem; padding: .25rem .6rem; border-radius: 999px; font-weight: 700; }
		.v2rayb-status::before { content: ''; width: .5rem; height: .5rem; border-radius: 50%; background: currentColor; }
		.v2rayb-status-ok { color: #19734a; background: #e4f5ec; }
		.v2rayb-status-warn { color: #9a6500; background: #fff3d7; }
		.v2rayb-status-off { color: #9a3b35; background: #fbe9e7; }
		.v2rayb-toolbar { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; margin-top: 1rem; }
		.v2rayb-toolbar .cbi-button { margin: 0; }
		.v2rayb-table .cbi-section-table-cell { text-align: left !important; vertical-align: middle; }
		.v2rayb-disabled-control { opacity: .5; }
		.v2rayb-form-wide { width: 100%; box-sizing: border-box; min-height: 7rem; resize: vertical; font-family: monospace; }
		.v2rayb-form-wide:disabled { background: #f0f2f5; cursor: not-allowed; }
		.v2rayb-create { display: flex; justify-content: flex-start; margin-top: .75rem; }
		.v2rayb-help { color: #687587; font-size: .88rem; line-height: 1.5; }
		.v2rayb-code { display: block; max-height: 20rem; overflow: auto; padding: 1rem; border-radius: 10px;
			background: #17212b; color: #cfe6e7; white-space: pre-wrap; font: .82rem/1.5 monospace; }
	`);
}

function field(label, control, help) {
	return E('div', { class: 'cbi-value' }, [
		E('label', { class: 'cbi-value-title' }, label),
		E('div', { class: 'cbi-value-field' }, [
			control,
			help ? E('div', { class: 'cbi-value-description' }, help) : ''
		])
	]);
}

function statusBadge(state) {
	let cls = 'v2rayb-status-off';
	if (state === 'proxy') cls = 'v2rayb-status-ok';
	else if (state === 'starting' || state === 'stopping' || state === 'degraded' || state === 'suspended') cls = 'v2rayb-status-warn';
	const labels = { normal: _('Normal mode'), starting: _('Starting'), proxy: _('Proxy mode'), stopping: _('Stopping'), degraded: _('Degraded'), suspended: _('Suspended') };
	return E('span', { class: 'v2rayb-status ' + cls }, labels[state] || state || _('Unknown'));
}

function table(headers, rows, empty, actionColumn) {
	const body = rows.length ? rows.map((row, index) => E('tr', {
		class: 'tr cbi-section-table-row cbi-rowstyle-' + (index % 2 ? '2' : '1')
	}, row.map(value => value && value.nodeName === 'TD'
		? value
		: E('td', { class: 'td cbi-section-table-cell' }, value || '')))) :
		[ E('tr', { class: 'tr cbi-section-table-row' }, [
			E('td', { class: 'td cbi-section-table-cell', colspan: headers.length }, E('em', {}, empty))
		]) ];
	return E('table', { class: 'table cbi-section-table v2rayb-table' }, [
		E('thead', { class: 'thead cbi-section-thead' }, E('tr', { class: 'tr cbi-section-table-titles' },
			headers.map((value, index) => E('th', {
				class: 'th cbi-section-table-cell' +
					(actionColumn && index === headers.length - 1 ? ' nowrap cbi-section-actions' : '')
			}, value)))),
		E('tbody', { class: 'tbody cbi-section-tbody' }, body)
	]);
}

function confirmDelete(message) {
	return new Promise(resolve => ui.showModal(_('Confirm deletion'), [
		E('p', {}, message),
		E('div', { class: 'right' }, [
			E('button', { class: 'btn', type: 'button', click: () => { ui.hideModal(); resolve(false); } }, _('Cancel')),
			' ',
			E('button', { class: 'btn cbi-button cbi-button-remove', type: 'button', click: () => { ui.hideModal(); resolve(true); } }, _('Delete'))
		])
	]));
}

function actionCell(buttons) {
	return E('td', { class: 'td cbi-section-table-cell nowrap cbi-section-actions' },
		E('div', buttons));
}

function card(label, value, help) {
	return E('div', { class: 'v2rayb-card' }, [
		E('div', { class: 'v2rayb-card-label' }, label), E('div', { class: 'v2rayb-card-value' }, value),
		help ? E('div', { class: 'v2rayb-card-help' }, help) : ''
	]);
}

function errorMessage(error) {
	if (typeof error === 'string')
		return error;
	if (Array.isArray(error) && typeof error[0] === 'number') {
		const status = rpc.getStatusText ? rpc.getStatusText(error[0]) : _('Unspecified error');
		return _('Router RPC failed with ubus code %s: %s.').format(error[0], status);
	}
	if (error) {
		for (const value of [ error.message, error.error, error.output, error.data && error.data.message, error.data && error.data.error ])
			if (typeof value === 'string' && value)
				return value;
		if (error.code !== undefined)
			return _('Request failed with code %s.').format(error.code);
		if (typeof error.toString === 'function') {
			const value = error.toString();
			if (value && value !== '[object Object]')
				return value;
		}
	}
	return _('The router returned no error details. Check the system log for the request time.');
}

function showRequestError(error) {
	ui.addNotification(null, E('p', {}, errorMessage(error)), 'error');
}

function reloadPage() {
	const active = document.querySelector('.v2rayb-nav-link.active');
	if (active && active.dataset.tab && window.history && window.history.replaceState)
		window.history.replaceState(null, '', '#' + active.dataset.tab);
	window.location.reload();
}

function notify(result, successText, reload) {
	if (result && (result.success || result.code === 0)) {
		ui.addNotification(null, E('p', {}, successText), 'info');
		if (reload) window.setTimeout(reloadPage, 700);
	} else {
		showRequestError(result);
	}
}

function applyStageText(stage) {
	switch (stage) {
	case 'queued': return _('Queued');
	case 'preparing': return _('Preparing configuration');
	case 'saving-database': return _('Saving configuration');
	case 'rendering': return _('Rendering configuration');
	case 'updating-boot': return _('Updating boot state');
	case 'starting-service': return _('Starting service');
	case 'restarting-service': return _('Restarting service');
	case 'resuming-service': return _('Resuming service');
	case 'stopping-service': return _('Stopping service');
	case 'verifying': return _('Verifying service');
	case 'rolling-back': return _('Rolling back changes');
	case 'restoring-service': return _('Restoring service');
	case 'complete': return _('Configuration changes applied.');
	default: return _('Applying configuration changes…');
	}
}

function wait(ms) {
	return new Promise(resolve => window.setTimeout(resolve, ms));
}

async function runApplyJob(jobId) {
	const stageText = E('p', {}, _('Applying configuration changes…'));
	ui.showModal(_('Applying configuration changes…'), [
		E('div', { class: 'cbi-section' }, [
			stageText,
			E('p', { class: 'cbi-value-description' }, _('This task continues in the background if this page is closed.'))
		])
	]);
	sessionStorage.setItem('v2rayb.applyJob', jobId);

	let failures = 0;
	try {
		while (true) {
			let result;
			try {
				result = await callApplyDraftStatus(jobId);
				failures = 0;
			}
			catch (error) {
				failures++;
				if (failures >= 5)
					throw error;
				stageText.textContent = _('Apply status could not be read; retrying…');
				await wait(1500);
				continue;
			}
			if (!result || !result.success)
				throw result || new Error(_('The configuration apply status could not be read.'));
			if (result.stage)
				stageText.textContent = applyStageText(result.stage);
			if (result.status === 'done' || result.status === 'failed')
				return result;
			await wait(1000);
		}
	}
	finally {
		ui.hideModal();
	}
}

async function resumeApplyJob(jobId) {
	try {
		const result = await runApplyJob(jobId);
		sessionStorage.removeItem('v2rayb.applyJob');
		if (result.status === 'done') {
			ui.addNotification(null, E('p', {}, _('Configuration changes applied.')), 'info');
			window.setTimeout(reloadPage, 700);
		}
		else
			showRequestError(result.error || _('The configuration apply failed.'));
	}
	catch (error) {
		sessionStorage.removeItem('v2rayb.applyJob');
		showRequestError(error);
	}
}

function renderTabs(panes) {
	const buttons = [], panels = [];
	const ids = panes.map(pane => pane.id);
	let initial = window.location.hash.replace(/^#/, '');
	if (!ids.includes(initial))
		initial = panes[0].id;

	function activate(id, remember) {
		if (!ids.includes(id))
			return;
		buttons.forEach(button => {
			const active = button.dataset.tab === id;
			button.classList.toggle('active', active);
			button.setAttribute('aria-selected', active ? 'true' : 'false');
		});
		panels.forEach(panel => {
			const visible = panel.dataset.tab === id;
			panel.style.display = visible ? '' : 'none';
			panel.setAttribute('aria-hidden', visible ? 'false' : 'true');
		});
		if (remember && window.history && window.history.replaceState)
			window.history.replaceState(null, '', '#' + id);
	}
	panes.forEach((pane, index) => {
		const selected = pane.id === initial;
		const button = E('button', {
			class: 'v2rayb-nav-link' + (selected ? ' active' : ''), type: 'button', role: 'tab',
			'aria-selected': selected ? 'true' : 'false', 'data-tab': pane.id,
			click: () => {
				activate(pane.id, true);
				if (pane.onActivate)
					pane.onActivate();
			}
		}, [ E('span', { class: 'v2rayb-nav-title' }, pane.title), pane.caption ? E('span', { class: 'v2rayb-nav-caption' }, pane.caption) : '' ]);
		const panel = E('div', {
			class: 'v2rayb-panel', role: 'tabpanel', 'data-tab': pane.id,
			style: selected ? '' : 'display:none', 'aria-hidden': selected ? 'false' : 'true'
		}, pane.nodes);
		buttons.push(button); panels.push(panel);
	});
	const initialPane = panes.find(pane => pane.id === initial);
	if (initialPane && initialPane.onActivate)
		window.setTimeout(initialPane.onActivate, 0);
	return E('div', {}, [ E('div', { class: 'v2rayb-nav', role: 'tablist' }, buttons), E('div', {}, panels) ]);
}

function showNodeModal(view, onSaved, existing) {
	const name = E('input', { class: 'cbi-input-text', type: 'text', maxlength: '64', required: true });
	const protocol = E('select', { class: 'cbi-input-select' }, [ 'vless', 'vmess', 'trojan', 'shadowsocks' ].map(value => E('option', { value }, value.toUpperCase())));
	const server = E('input', { class: 'cbi-input-text', type: 'text', maxlength: '255', required: true });
	const port = E('input', { class: 'cbi-input-text', type: 'number', min: '1', max: '65535', value: '443', required: true });
	const uuid = E('input', { class: 'cbi-input-text', type: 'password', maxlength: '255', required: true });
	const flow = E('select', { class: 'cbi-input-select' }, [ E('option', { value: '' }, _('None')), E('option', { value: 'xtls-rprx-vision' }, 'xtls-rprx-vision') ]);
	const ssMethod = E('select', { class: 'cbi-input-select' }, [ 'aes-128-gcm', 'aes-256-gcm', 'chacha20-poly1305', 'none' ].map(value => E('option', { value }, value)));
	const security = E('select', { class: 'cbi-input-select' }, [ 'none', 'tls', 'reality' ].map(value => E('option', { value }, value.toUpperCase())));
	const sni = E('input', { class: 'cbi-input-text', type: 'text', maxlength: '255' });
	const alpn = E('input', { class: 'cbi-input-text', type: 'text', placeholder: 'h2,http/1.1' });
	const insecure = checkbox({}, false);
	const fingerprint = E('select', { class: 'cbi-input-select' }, [ 'chrome', 'firefox', 'safari', 'edge', 'android', 'ios' ].map(value => E('option', { value }, value)));
	const publicKey = E('input', { class: 'cbi-input-text', type: 'text' });
	const shortId = E('input', { class: 'cbi-input-text', type: 'text' });
	const spiderX = E('input', { class: 'cbi-input-text', type: 'text', value: '/' });
	const transport = E('select', { class: 'cbi-input-select' }, [ 'tcp', 'ws', 'h2', 'grpc' ].map(value => E('option', { value }, value.toUpperCase())));
	const tcpGuise = E('select', { class: 'cbi-input-select' }, [ E('option', { value: 'none' }, _('None')), E('option', { value: 'http' }, 'HTTP') ]);
	const tcpPath = E('input', { class: 'cbi-input-text', type: 'text', value: '/' });
	const tcpHost = E('input', { class: 'cbi-input-text', type: 'text', placeholder: 'example.com' });
	const wsPath = E('input', { class: 'cbi-input-text', type: 'text', value: '/' });
	const wsHost = E('input', { class: 'cbi-input-text', type: 'text' });
	const h2Path = E('input', { class: 'cbi-input-text', type: 'text', value: '/' });
	const h2Host = E('input', { class: 'cbi-input-text', type: 'text' });
	const grpcService = E('input', { class: 'cbi-input-text', type: 'text' });
	const muxEnabled = checkbox({}, false);
	const muxConcurrency = E('input', { class: 'cbi-input-text', type: 'number', min: '1', max: '128', value: '8' });
	const conditional = [];
	function add(label, control, help, predicate, full) {
		const node = field(label, control, help, full);
		if (predicate) conditional.push([ node, predicate ]);
		return node;
	}
	function list(value) {
		return value.split(/[;,\s]+/).filter(item => item !== '');
	}
	function buildOutbound() {
		let settings;
		const user = { id: uuid.value, encryption: protocol.value === 'vless' ? 'none' : 'auto', level: 1 };
		if (protocol.value === 'vless' && flow.value) user.flow = flow.value;
		if (protocol.value === 'vmess') { user.alterId = 0; user.security = 'auto'; }
		if (protocol.value === 'trojan') settings = { servers: [ { address: server.value, port: Number(port.value), password: uuid.value, level: 1 } ] };
		else if (protocol.value === 'shadowsocks') settings = { servers: [ { address: server.value, port: Number(port.value), password: uuid.value, method: ssMethod.value, level: 1 } ] };
		else settings = { vnext: [ { address: server.value, port: Number(port.value), users: [ user ] } ] };

		const streamSettings = { network: transport.value, security: security.value };
		if (security.value === 'tls') {
			streamSettings.tlsSettings = { allowInsecure: insecure.checked, serverName: sni.value || server.value };
			if (alpn.value) streamSettings.tlsSettings.alpn = list(alpn.value);
		} else if (security.value === 'reality') {
			streamSettings.realitySettings = { show: false, fingerprint: fingerprint.value, serverName: sni.value || server.value };
			if (publicKey.value) streamSettings.realitySettings.publicKey = publicKey.value;
			if (shortId.value) streamSettings.realitySettings.shortId = shortId.value;
			if (spiderX.value) streamSettings.realitySettings.spiderX = spiderX.value;
			if (alpn.value) streamSettings.realitySettings.alpn = list(alpn.value);
		}
		if (transport.value === 'tcp' && tcpGuise.value === 'http') {
			streamSettings.tcpSettings = { header: { type: 'http', request: { version: '1.1', method: 'GET', path: [ tcpPath.value || '/' ], headers: { Host: list(tcpHost.value), 'User-Agent': [ 'Mozilla/5.0' ] } } } };
		} else if (transport.value === 'ws') {
			streamSettings.wsSettings = { path: wsPath.value || '/' };
			if (wsHost.value) streamSettings.wsSettings.headers = { Host: wsHost.value };
		} else if (transport.value === 'h2') {
			streamSettings.httpSettings = { path: h2Path.value || '/' };
			if (h2Host.value) streamSettings.httpSettings.host = list(h2Host.value);
		} else if (transport.value === 'grpc' && grpcService.value) {
			streamSettings.grpcSettings = { serviceName: grpcService.value };
		}
		return JSON.stringify({ settings: settings, streamSettings: streamSettings, mux: { enabled: muxEnabled.checked, concurrency: Number(muxConcurrency.value) || 8 } });
	}
	function refresh() {
		conditional.forEach(item => { item[0].style.display = item[1]() ? '' : 'none'; });
	}
	function prefill(node) {
		let data;
		try {
			data = JSON.parse(node.data_json || '{}');
		} catch (e) {
			ui.addNotification(null, E('p', {}, _('Stored node settings could not be decoded.')), 'error');
			return;
		}
		const settings = data.settings || {};
		const stream = data.streamSettings || {};
		const vnext = settings.vnext && settings.vnext[0];
		const serverConfig = settings.servers && settings.servers[0];
		const endpoint = vnext || serverConfig || {};
		const user = vnext && vnext.users && vnext.users[0];
		name.value = node.name;
		protocol.value = node.protocol;
		server.value = node.server;
		port.value = node.port;
		uuid.value = (user && user.id) || endpoint.password || '';
		flow.value = (user && user.flow) || '';
		ssMethod.value = endpoint.method || 'aes-128-gcm';
		security.value = stream.security || 'none';
		transport.value = stream.network || 'tcp';
		const tls = stream.tlsSettings || {};
		const reality = stream.realitySettings || {};
		sni.value = tls.serverName || reality.serverName || '';
		insecure.checked = !!tls.allowInsecure;
		fingerprint.value = reality.fingerprint || 'chrome';
		publicKey.value = reality.publicKey || '';
		shortId.value = reality.shortId || '';
		spiderX.value = reality.spiderX || '/';
		alpn.value = ((tls.alpn || reality.alpn || [])).join(',');
		const tcp = (stream.tcpSettings && stream.tcpSettings.header) || {};
		tcpGuise.value = tcp.type === 'http' ? 'http' : 'none';
		tcpPath.value = (tcp.request && tcp.request.path && tcp.request.path[0]) || '/';
		tcpHost.value = (tcp.request && tcp.request.headers && tcp.request.headers.Host && tcp.request.headers.Host[0]) || '';
		wsPath.value = (stream.wsSettings && stream.wsSettings.path) || '/';
		wsHost.value = (stream.wsSettings && stream.wsSettings.headers && stream.wsSettings.headers.Host) || '';
		h2Path.value = (stream.httpSettings && stream.httpSettings.path) || '/';
		h2Host.value = ((stream.httpSettings && stream.httpSettings.host) || []).join(',');
		grpcService.value = (stream.grpcSettings && stream.grpcSettings.serviceName) || '';
		muxEnabled.checked = !!data.mux && (data.mux.enabled === true || data.mux.enabled === 1);
		muxConcurrency.value = (data.mux && data.mux.concurrency) || 8;
	}
	protocol.addEventListener('change', refresh);
	security.addEventListener('change', refresh);
	transport.addEventListener('change', refresh);
	tcpGuise.addEventListener('change', refresh);
	muxEnabled.addEventListener('change', refresh);
	const save = E('button', { class: 'cbi-button cbi-button-apply', type: 'button', click: () => {
		if (!name.value || !server.value || !port.value || !uuid.value) {
			ui.addNotification(null, E('p', {}, _('Name, server, port and UUID/password are required.')), 'warning'); return;
		}
		const outbound = buildOutbound();
		ui.hideModal();
		if (onSaved)
			onSaved({
				id: existing ? existing.id : null,
				name: name.value, protocol: protocol.value, server: server.value, port: port.value,
				data_json: outbound
			});
	}, }, existing ? _('Update pending changes') : _('Add to pending changes'));
	const cancel = E('button', { class: 'cbi-button', type: 'button', click: () => ui.hideModal() }, _('Cancel'));
	if (existing)
		prefill(existing);
	ui.showModal(existing ? _('Edit proxy node') : _('Add proxy node'), [
		E('div', { class: 'cbi-section' }, [ E('h3', {}, _('Basic settings')),
			add(_('Name'), name), add(_('Protocol'), protocol), add(_('Server'), server), add(_('Port'), port),
			add(_('UUID / password'), uuid)
		]),
		E('div', { class: 'cbi-section' }, [ E('h3', {}, _('Protocol details')),
			add(_('VLESS flow'), flow, null, () => protocol.value === 'vless'),
			add(_('Shadowsocks method'), ssMethod, null, () => protocol.value === 'shadowsocks')
		]),
		E('div', { class: 'cbi-section' }, [ E('h3', {}, _('TLS and security')),
			add(_('Security'), security), add(_('SNI / server name'), sni, _('Defaults to the server address.'), () => security.value === 'tls' || security.value === 'reality'),
			add(_('ALPN'), alpn, _('Comma-separated values, for example h2,http/1.1.'), () => security.value === 'tls' || security.value === 'reality'),
			add(_('Allow insecure'), insecure, _('Skip certificate verification.'), () => security.value === 'tls'),
			add(_('Reality fingerprint'), fingerprint, null, () => security.value === 'reality'), add(_('Reality public key'), publicKey, null, () => security.value === 'reality'),
			add(_('Reality short ID'), shortId, null, () => security.value === 'reality'), add(_('Reality SpiderX'), spiderX, null, () => security.value === 'reality')
		]),
		E('div', { class: 'cbi-section' }, [ E('h3', {}, _('Transport')),
			add(_('Transport'), transport), add(_('TCP header type'), tcpGuise, null, () => transport.value === 'tcp'),
			add(_('TCP HTTP path'), tcpPath, null, () => transport.value === 'tcp' && tcpGuise.value === 'http'), add(_('TCP HTTP host'), tcpHost, null, () => transport.value === 'tcp' && tcpGuise.value === 'http'),
			add(_('WebSocket path'), wsPath, null, () => transport.value === 'ws'), add(_('WebSocket host'), wsHost, null, () => transport.value === 'ws'),
			add(_('H2 path'), h2Path, null, () => transport.value === 'h2'), add(_('H2 host'), h2Host, null, () => transport.value === 'h2'),
			add(_('gRPC service name'), grpcService, null, () => transport.value === 'grpc')
		]),
		E('div', { class: 'cbi-section' }, [ E('h3', {}, _('Multiplexing')),
			add(_('Enable mux'), muxEnabled),
			add(_('Mux concurrency'), muxConcurrency, null, () => muxEnabled.checked)
		]),
		E('div', { class: 'cbi-page-actions' }, [ cancel, save ])
	]);
	refresh();
}

function showSourceModal(existing, onUpdate) {
	const nameAttributes = { class: 'cbi-input-text', type: 'text', maxlength: '64', required: true, value: existing ? existing[2] : '' };
	if (existing)
		nameAttributes.disabled = true;
	const name = E('input', nameAttributes);
	const url = E('input', { class: 'cbi-input-text', type: 'url', maxlength: '2048', required: true, value: existing ? existing[3] : '' });
	const format = E('select', { class: 'cbi-input-select' }, [ 'auto', 'uri', 'base64' ].map(value => E('option', { value }, value)));
	format.value = existing ? (existing[4] || 'auto') : 'auto';
	const ipv4Only = checkbox({}, existing ? isEnabled(existing[9]) : true);
	const save = E('button', { class: 'cbi-button cbi-button-apply', type: 'button', click: async () => {
		const sourceName = name.value.trim();
		if (!sourceName || !url.value) {
			ui.addNotification(null, E('p', {}, _('Name and URL are required.')), 'warning');
			return;
		}
		try {
			const added = await callAddSource(sourceName, url.value, format.value,
				ipv4Only.checked ? '1' : '0');
			if (!added || !added.success) {
				showRequestError(added);
				return;
			}
			const updated = await (onUpdate ? onUpdate(added.source_id) : callSubscriptionUpdateStart(added.source_id));
			if (!updated || !updated.success) {
				if (!onUpdate)
					showRequestError(updated);
				return;
			}
			ui.hideModal();
			if (!onUpdate)
				ui.addNotification(null, E('p', {}, _('Subscription update started.')), 'info');
		}
		catch (error) {
			showRequestError(error);
		}
	}}, existing ? _('Save and refresh') : _('Add and fetch'));
	const cancel = E('button', { class: 'cbi-button', type: 'button', click: () => ui.hideModal() }, _('Cancel'));
	ui.showModal(existing ? _('Edit subscription') : _('Add subscription'), [
		E('div', { class: 'cbi-section' }, [
			E('h3', {}, _('Subscription source')),
			field(_('Name'), name),
			field(_('URL'), url,
				_('The router downloads this URL directly through WAN, bypassing the router traffic proxy.')),
			field(_('Format'), format, _('Auto detects plain URI lines or Base64-encoded URI lines.')),
			field(_('IPv4 only download'), ipv4Only,
				_('Only affects subscription downloads; proxy traffic is unchanged.'))
		]),
		E('div', { class: 'cbi-page-actions' }, [ cancel, save ])
	]);
	if (!existing)
		window.setTimeout(() => name.focus(), 0);
}

function groupedNodeOptions(nodes, existingId) {
	const groups = new Map();
	for (const row of nodes.filter(item => isEnabled(item[5]))) {
		const kind = row[6] === 'subscription' ? _('Subscription: ') + (row[7] || _('Unknown'))
			: row[6] === 'imported' ? _('Imported: ') + (row[7] || _('Unknown'))
			: _('Manual');
		if (!groups.has(kind))
			groups.set(kind, []);
		groups.get(kind).push(row);
	}
	const options = [ E('option', { value: '' }, _('Select a primary node')) ];
	for (const [label, rows] of groups) {
		const items = rows.map(row => E('option', { value: row[0] },
			`${row[1]} (${row[2].toUpperCase()} ${row[3]}:${row[4]})`));
		for (const option of items)
			option.selected = !!existingId && option.value === existingId;
		options.push(E('optgroup', { label }, items));
	}
	return options;
}

function showProfileModal(onSaved, nodes, defaults, existing) {
	const name = E('input', { class: 'cbi-input-text', type: 'text', maxlength: '64', required: true, value: existing ? existing.name : '' });
	const nodeOptions = groupedNodeOptions(nodes, existing ? existing.node_id : '');
	const nodeSelect = E('select', { class: 'cbi-input-select' }, nodeOptions);
	const profileEngine = E('select', { class: 'cbi-input-select' }, [
		E('option', { value: 'v2ray' }, 'V2Ray'),
		E('option', { value: 'xray' }, 'Xray')
	]);
	profileEngine.value = (existing && existing.engine === 'xray') ? 'xray' : 'v2ray';
	const profileDns = E('input', {
		class: 'cbi-input-text', type: 'hidden',
		value: (existing && existing.direct_dns) || defaults.direct_dns || '223.5.5.5:53'
	});
	const profilePorts = E('input', {
		class: 'cbi-input-text', type: 'text',
		value: (existing && existing.transparent_proxy_ports) || defaults.transparent_proxy_ports
	});
	const transparentPort = E('input', {
		class: 'cbi-input-text', type: 'number', min: '1', max: '65535',
		value: (existing && existing.transparent_proxy_port) || 12345
	});
	const probeEnabled = checkbox({}, existing ? isEnabled(existing.probe_enabled) : true);
	const probePort = E('input', {
		class: 'cbi-input-text', type: 'number', min: '1', max: '65535',
		value: (existing && existing.probe_port) || 12346
	});
	const probePortField = field(_('Connectivity probe port'), probePort,
		_('Loopback-only SOCKS port used to verify that the proxy can reach the internet.'));
	function refreshProbeFields() {
		probePort.disabled = !probeEnabled.checked;
		probePortField.classList.toggle('v2rayb-disabled-control', !probeEnabled.checked);
	}
	probeEnabled.addEventListener('change', refreshProbeFields);
	refreshProbeFields();
	const bypassChina = checkbox({}, existing ? isEnabled(existing.bypass_china) : true);
	const proxyRouterTraffic = checkbox({}, existing ? isEnabled(existing.proxy_router_traffic) : false);
	const useV2rayDns = checkbox({}, existing ? isEnabled(existing.use_v2ray_dns) : true);
	const mosdnsEnabled = checkbox({}, existing ? isEnabled(existing.mosdns_enabled) : true);
	const mosdnsDomains = E('textarea', {
		class: 'cbi-input-text v2rayb-form-wide', rows: '4', spellcheck: 'false',
		maxlength: '1024', placeholder: 'xn--ngstr-lra8j.com\nexample.com'
	});
	mosdnsDomains.value = ((existing && existing.mosdns_domains) || defaults.mosdns_domains || 'xn--ngstr-lra8j.com')
		.replace(/,/g, '\n');
	const mosdnsRules = E('textarea', {
		class: 'cbi-input-text v2rayb-form-wide', rows: '7', spellcheck: 'false',
		placeholder: 'domain:example.com\nfull:www.example.com\nregexp:^r\\+...$'
	});
	mosdnsRules.value = (existing && existing.mosdns_match_rules) || defaults.mosdns_match_rules || '';
	const mosdnsDomainsField = field(_('MosDNS domains'), mosdnsDomains,
		_('Suffixes forwarded to MosDNS, one per line.'));
	const mosdnsRulesHelp = E('div', {}, [
		E('p', {}, _('One rule per line: domain:, full: or regexp:.')),
		E('p', {}, _('Direct: use Direct DNS and add the answer to the direct nft set.')),
		E('p', {}, _('Unmatched names use V2Ray DNS.'))
	]);
	const mosdnsRulesField = field(_('MosDNS match rules'), mosdnsRules, mosdnsRulesHelp);
	function refreshMosdnsFields() {
		const enabled = mosdnsEnabled.checked;
		mosdnsDomains.disabled = !enabled;
		mosdnsRules.disabled = !enabled;
		mosdnsDomainsField.classList.toggle('v2rayb-disabled-control', !enabled);
		mosdnsRulesField.classList.toggle('v2rayb-disabled-control', !enabled);
	}
	mosdnsEnabled.addEventListener('change', refreshMosdnsFields);
	refreshMosdnsFields();
	const save = E('button', { class: 'cbi-button cbi-button-apply', type: 'button', click: () => {
		const profileName = name.value.trim();
		if (!profileName || !nodeSelect.value || !profileDns.value || !profilePorts.value) {
			ui.addNotification(null, E('p', {}, _('Enter a profile name, primary node, DNS upstream and proxy ports.')), 'warning');
			return;
		}
		const listenerPort = Number(transparentPort.value);
		const healthPort = Number(probePort.value);
		if (!listenerPort || listenerPort < 1 || listenerPort > 65535 ||
			!healthPort || healthPort < 1 || healthPort > 65535) {
			ui.addNotification(null, E('p', {}, _('Enter valid listener and probe ports.')), 'warning');
			return;
		}
		if (probeEnabled.checked && listenerPort === healthPort) {
			ui.addNotification(null, E('p', {}, _('Transparent proxy and probe ports must differ.')), 'warning');
			return;
		}
		const bypass = bypassChina.checked ? '1' : '0';
		const routerTraffic = proxyRouterTraffic.checked ? '1' : '0';
		const v2rayDns = useV2rayDns.checked ? '1' : '0';
		const mosdns = mosdnsEnabled.checked ? '1' : '0';
		const domains = mosdnsDomains.value.split(/[\s,]+/).filter(value => value !== '').join(',');
		if (mosdns === '1' && !domains) {
			ui.addNotification(null, E('p', {}, _('Enter at least one domain when MosDNS is enabled.')), 'warning');
			return;
		}
		ui.hideModal();
		if (onSaved)
			onSaved({
				id: existing ? existing.id : null,
				name: profileName,
				node_id: nodeSelect.value,
				engine: profileEngine.value,
				direct_dns: profileDns.value,
				transparent_proxy_ports: profilePorts.value,
				bypass_china: bypass,
				use_v2ray_dns: v2rayDns,
				mosdns_enabled: mosdns,
				mosdns_domains: domains,
				mosdns_match_rules: mosdnsRules.value.trim(),
				proxy_router_traffic: routerTraffic,
				transparent_proxy_port: String(listenerPort),
				probe_enabled: probeEnabled.checked ? '1' : '0',
				probe_port: String(healthPort)
			});
	} }, existing ? _('Update pending changes') : _('Add to pending changes'));
	ui.showModal(existing ? _('Edit profile') : _('Create a profile'), [
		E('div', { class: 'cbi-section' }, [
			field(_('Profile name'), name),
			field(_('Primary node'), nodeSelect),
			field(_('Proxy engine'), profileEngine,
				_('Use Xray for REALITY nodes that fail with the V2Ray compatibility engine.'))
		]),
		E('div', { class: 'cbi-section' }, [
			E('h3', {}, _('Profile policy')),
			profileDns,
			field(_('Intercepted TCP destination ports'), profilePorts,
				_('Example: 80,443,8080-8443.')),
			field(_('Transparent proxy listener port'), transparentPort,
				_('Loopback transparent proxy inbound port.')),
			field(_('Verify proxy connectivity'), probeEnabled,
				_('When disabled, traffic and DNS are imported immediately without an end-to-end proxy check.')),
			probePortField,
			field(_('Bypass China IP'), bypassChina,
				_('Disabled: all intercepted traffic uses the proxy.')),
			field(_('Proxy router-originated TCP'), proxyRouterTraffic,
				_('Includes TCP connections started by this router. UDP and DNS are not proxied.'))
		]),
		E('div', { class: 'cbi-section' }, [
			E('h3', {}, _('DNS routing')),
			field(_('Use V2Ray DNS as dnsmasq default'), useV2rayDns,
				_('Only names not matched by a domain-specific dnsmasq rule use the V2Ray resolver. China domain rules still use Direct DNS.')),
			field(_('Enable MosDNS branch'), mosdnsEnabled,
				_('Handles the listed Google Play download suffixes separately so mainland cache addresses can stay direct. Disabled: settings are retained but inactive.')),
			mosdnsDomainsField,
			mosdnsRulesField
		]),
		E('div', { class: 'cbi-page-actions' }, [
			E('button', { class: 'cbi-button', type: 'button', click: () => ui.hideModal() }, _('Cancel')),
			save
		])
	]);
}

return view.extend({
	handleSave() {
		const hadChanges = this.hasLocalChanges();
		return this.persistLocalChanges().then(result => {
			if (!result || !result.success) {
				notify(result, '');
				return;
			}
			if (hadChanges) {
				window.location.reload();
				return;
			}
			ui.addNotification(null, E('p', {}, this.draftPending
				? _('Your changes are saved as a draft. Use Save & Apply to make them active.')
				: _('There are no pending draft changes.')), 'info');
		}).catch(showRequestError);
	},

	async handleSaveApply() {
		try {
			const saved = await this.persistLocalChanges();
			if (!saved || !saved.success) {
				notify(saved, '');
				return;
			}
			const started = await callApplyDraftStart();
			if (!started || !started.success) {
				notify(started, '');
				return;
			}
			await resumeApplyJob(started.job_id);
		}
		catch (error) {
			showRequestError(error);
		}
	},

	handleReset() {
		return callRevertDraft().then(result => {
			if (result && result.success) {
				window.location.reload();
				return;
			}
			notify(result, '');
		}).catch(showRequestError);
	},

	load() {
		return Promise.all([
			L.resolveDefault(callStatus(), { output: '' }), L.resolveDefault(callNodes(), { output: '' }),
			L.resolveDefault(callSources(), { output: '' }),
			L.resolveDefault(callProfiles(), { output: '' })
		]);
	},

	render(data) {
		const pageView = this;
		const status = parseKeyValues(outputOf(data[0]));
		const draftPending = status.draft_pending === '1';
		pageView.draftPending = draftPending;
		const nodes = parseRows(outputOf(data[1]));
		const sources = parseRows(outputOf(data[2]));
		const profiles = parseRows(outputOf(data[3]));
		const appliedProfile = status.active_profile || '';
		const appliedProfileRows = profiles.filter(row => row[0] === appliedProfile);
		let activeProfile = draftPending
			? (status.draft_active_profile || appliedProfile)
			: appliedProfile;
		const state = status.state || 'normal';
		let enabledNodes = nodes.filter(row => isEnabled(row[5])).length;
		let enabledProfiles = profiles.filter(row => isEnabled(row[4])).length;

		function profilePolicyText(row) {
			if (!row)
				return _('No active profile policy');
			const ports = row[7] || '-';
			const china = isEnabled(row[8]) ? _('China IP direct') : _('All through proxy');
			const v2rayDns = isEnabled(row[9]) ? _('V2Ray DNS default') : _('Direct DNS default');
			const mosdns = isEnabled(row[10]) ? _('MosDNS on') : _('MosDNS off');
			const routerTraffic = isEnabled(row[12]) ? _('Router TCP on') : _('Router TCP off');
			const listener = row[13] || '12345';
			const probe = isEnabled(row[14]) ? `${_('Probe')} ${row[15] || '12346'}` : _('Probe off');
			const engine = row[2] === 'xray' ? 'Xray' : 'V2Ray';
			return `${engine} · ${_('Ports')} ${ports} · ${_('Listen')} ${listener} · ${probe} · ${china} · ${v2rayDns} · ${mosdns} · ${routerTraffic}`;
		}
		const activeProfileRow = appliedProfileRows[0] || null;
		const appliedProfileName = activeProfileRow
			? activeProfileRow[1]
			: (appliedProfile ? _('Unknown') : _('Not selected'));
		const activeProfileCard = card(_('Applied profile'), appliedProfileName,
			profilePolicyText(activeProfileRow));
		function profileOptionsFromProfiles(rows) {
			const options = [ E('option', { value: '' }, _('Select a profile')) ];
			for (const row of rows) {
				if (!isEnabled(row[4]))
					continue;
				const option = E('option', { value: row[0] }, row[1]);
				option.selected = row[0] === activeProfile;
				options.push(option);
			}
			return options;
		}
		const activeProfileSelect = E('select', { class: 'cbi-input-select' },
			profileOptionsFromProfiles(profiles));
		activeProfileSelect.value = activeProfile;
		const nodesCard = card(_('Nodes'), `${enabledNodes} / ${nodes.length}`);
		const appliedServiceEnabled = status.service_enabled !== '0';
		const configuredServiceEnabled = draftPending
			? status.draft_service_enabled !== '0'
			: appliedServiceEnabled;
		const serviceEnabled = checkbox({}, configuredServiceEnabled);
		pageView.serviceEnabledDesired = configuredServiceEnabled;
		pageView.serviceEnabledDirty = false;
		const configuredWatchdogEnabled = draftPending
			? status.draft_watchdog_enabled !== '0'
			: status.watchdog_enabled !== '0';
		const watchdogEnabled = checkbox({}, configuredWatchdogEnabled);
		pageView.watchdogEnabledDesired = configuredWatchdogEnabled;
		pageView.watchdogEnabledDirty = false;
		const configuredDirectDnsUpstreams = draftPending
			? (status.draft_direct_dns_upstreams || status.direct_dns_upstreams || '223.5.5.5:53')
			: (status.direct_dns_upstreams || '223.5.5.5:53');
		const directDnsInput = E('textarea', {
			class: 'cbi-input-text v2rayb-form-wide', rows: '3', spellcheck: 'false',
			maxlength: '1024',
			placeholder: '223.5.5.5:53\n119.29.29.29:53'
		});
		directDnsInput.value = configuredDirectDnsUpstreams.replace(/,/g, '\n');
		pageView.directDnsDesired = configuredDirectDnsUpstreams;
		pageView.directDnsDirty = false;
		function normalizeDirectDnsValue(value) {
			return value.split(/[\s,]+/).filter(item => item !== '').join(',');
		}
		pageView.pendingOperations = [];
		pageView.subscriptionJobs = {};
		pageView.subscriptionJobErrors = {};
		pageView.nodeProbeResults = {};
		pageView.nodeProbeJob = null;
		pageView.tempSequence = 0;
		pageView.nodeIdMap = {};
		pageView.profileIdMap = {};
		pageView.localNodeDetails = {};
		pageView.localProfileDetails = {};
		pageView.nextTempId = function(kind) {
			this.tempSequence += 1;
			return '__new_' + kind + '_' + this.tempSequence;
		};
		pageView.resolveNodeId = function(id) {
			return this.nodeIdMap[id] || id;
		};
		pageView.resolveProfileId = function(id) {
			return this.profileIdMap[id] || id;
		};
		pageView.activeProfileDirty = false;
		pageView.hasLocalChanges = function() {
			return this.serviceEnabledDirty || this.watchdogEnabledDirty ||
				this.activeProfileDirty || this.directDnsDirty ||
				this.pendingOperations.length > 0;
		};
		pageView.refreshActiveProfileSelect = function() {
			const current = String(activeProfile || '');
			const options = profileOptionsFromProfiles(profiles);
			activeProfileSelect.replaceChildren(...options);
			activeProfileSelect.value = options.some(option => option.value === current) ? current : '';
		};
		pageView.persistLocalChanges = function() {
			let chain = Promise.resolve({ success: true });
			if (this.serviceEnabledDirty)
				chain = chain.then(() => callSetSetting('service_enabled', this.serviceEnabledDesired ? '1' : '0'));
			if (this.watchdogEnabledDirty)
				chain = chain.then(() => callSetSetting('watchdog_enabled', this.watchdogEnabledDesired ? '1' : '0'));
			if (this.directDnsDirty)
				chain = chain.then(() => callSetSetting('direct_dns_upstreams', this.directDnsDesired));
			for (const operation of this.pendingOperations)
				chain = chain.then(result => {
					if (result && result.success === false)
						return result;
					const next = operation();
					return Promise.resolve(next).then(opResult =>
						opResult && opResult.success === false ? { failed: true, result: opResult } : opResult);
				});
			return chain.then(result => {
				if (result && result.failed)
					return result.result;
				if (result && result.success) {
					this.serviceEnabledDirty = false;
					this.watchdogEnabledDirty = false;
					this.directDnsDirty = false;
					this.pendingOperations = [];
				}
				return result;
			});
		};
		function queuePendingOperation(operation, pendingKey) {
			if (pendingKey) {
				operation.pendingKey = pendingKey;
				pageView.pendingOperations = pageView.pendingOperations.filter(
					item => item.pendingKey !== pendingKey);
			}
			pageView.pendingOperations.push(operation);
			return operation;
		}
		function discardPendingOperation(pendingKey) {
			pageView.pendingOperations = pageView.pendingOperations.filter(
				operation => operation.pendingKey !== pendingKey);
		}
		function isTempId(id) {
			return String(id).startsWith('__new_');
		}
		function displayId(id) {
			return isTempId(id) ? E('em', {}, _('New')) : id;
		}
		const unappliedNotice = E('div', {
			class: 'cbi-section',
			style: pageView.hasLocalChanges() || draftPending ? '' : 'display:none'
		}, [
			E('p', { class: 'v2rayb-help' }, _('Pending changes: Save & Apply to activate, or Reset to discard.'))
		]);
		function updateLocalChangesNotice() {
			unappliedNotice.style.display = pageView.hasLocalChanges() || draftPending ? '' : 'none';
		}
		serviceEnabled.addEventListener('change', () => {
			pageView.serviceEnabledDesired = serviceEnabled.checked;
			pageView.serviceEnabledDirty = serviceEnabled.checked !== configuredServiceEnabled;
			updateLocalChangesNotice();
		});
		watchdogEnabled.addEventListener('change', () => {
			pageView.watchdogEnabledDesired = watchdogEnabled.checked;
			pageView.watchdogEnabledDirty = watchdogEnabled.checked !== configuredWatchdogEnabled;
			updateLocalChangesNotice();
		});
		directDnsInput.addEventListener('input', () => {
			pageView.directDnsDesired = normalizeDirectDnsValue(directDnsInput.value);
			pageView.directDnsDirty = pageView.directDnsDesired !== configuredDirectDnsUpstreams;
			updateLocalChangesNotice();
		});
		activeProfileSelect.addEventListener('change', () => {
			activeProfile = activeProfileSelect.value;
			pageView.activeProfileDirty = activeProfile !== appliedProfile;
			updateLocalChangesNotice();
		});

		const overview = [
			unappliedNotice,
			E('div', { class: 'v2rayb-cards' }, [
				card(_('Service'), statusBadge(state)),
				activeProfileCard,
				nodesCard,
				card(_('DNS path'), state === 'proxy' ? _('V2Ray + MosDNS') : _('WAN / normal mode'))
			]),
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Service Control')),
				field(_('Enable v2rayB'), E('div', {}, [ serviceEnabled, ' ', statusBadge(state) ]),
					_('Also controls boot startup.')),
				field(_('Profile to activate'), activeProfileSelect,
					_('Applied after Save & Apply.')),
				field(_('Enable watchdog'), E('div', {}, [
					watchdogEnabled, E('span', { class: 'v2rayb-help' },
						'连续 3 次探测失败后停止代理并撤销接管；恢复后需手动重试。')
				]))
			]),
			table([ _('Property'), _('Current value') ], [
				[ _('Engine'), status.active_engine || '-' ], [ _('Proxy mode'), status.proxy_mode || '-' ],
				[ _('Watchdog'), status.watchdog_enabled === '1' ? _('Enabled') : _('Disabled') ],
				[ _('MosDNS listener'), status.mosdns_listen || '-' ], [ _('V2Ray DNS listener'), status.v2ray_dns_listen || '-' ]
			], _('No status data available.'))
		];

		let profileTable, nodeTable, sourceTable, profileAddButton, nodeGroupTabs, selectedNodeGroup, nodeProbeButton, nodeProbeHint;
		const profileTableHeaders = [ _('ID'), _('Name'), _('Primary node'), _('Policy'), _('Enabled'), _('Actions') ];
		const nodeTableHeaders = [ _('ID'), _('Name'), _('Protocol'), _('Server'), _('Port'), _('Source'), _('Node latency'), _('Enabled'), _('Actions') ];
		const sourceTableHeaders = [ _('Name'), _('Nodes'), _('Format'), _('Download'), _('Last update'), _('Status'), _('Actions') ];

		function enabledToggle(enabled, change) {
			const input = checkbox({}, isEnabled(enabled));
			input.addEventListener('change', () => change(input.checked ? '1' : '0'));
			return input;
		}
		function editButton(handler) {
			return E('button', { class: 'btn cbi-button cbi-button-edit', type: 'button', click: handler }, _('Edit'));
		}
		function removeButton(handler) {
			return E('button', { class: 'btn cbi-button cbi-button-remove', type: 'button', click: handler }, _('Delete'));
		}
		function profilePolicySummary(row) {
			return E('span', {}, profilePolicyText(row));
		}
		function profileTableRows() {
			return profiles.map(row => {
				const primary = nodes.find(node => node[0] === row[5]);
				const primaryName = primary ? primary[1] : row[3];
				return [
				displayId(row[0]), row[1], primaryName || E('span', { class: 'v2rayb-muted' }, _('No node')),
				profilePolicySummary(row),
				enabledToggle(row[4], enabled => {
					if (enabled === '0' && (row[0] === activeProfile || row[0] === appliedProfile)) {
						ui.addNotification(null, E('p', {}, _('Select and apply another profile before disabling this one.')), 'warning');
						refreshProfileTable();
						return;
					}
					row[4] = enabled;
					if (pageView.localProfileDetails[row[0]])
						pageView.localProfileDetails[row[0]].enabled = enabled;
					if (!isTempId(row[0]))
						queuePendingOperation(() => callSetProfileEnabled(pageView.resolveProfileId(row[0]), enabled), 'profile-enabled:' + row[0]);
					refreshProfileTable();
					refreshProfileCard();
				}),
				actionCell([
					editButton(async () => {
						let details;
						if (pageView.localProfileDetails[row[0]])
							details = { success: true, profile: pageView.localProfileDetails[row[0]] };
						else
							details = await callGetProfile(row[0]).catch(error => { showRequestError(error); return null; });
						if (!details || !details.success) {
							if (details) notify(details, '');
							return;
						}
						showProfileModal(profile => {
							const node = nodes.find(item => item[0] === profile.node_id);
							const index = profiles.findIndex(item => item[0] === row[0]);
							if (index >= 0)
								profiles[index] = [ row[0], profile.name, profile.engine, node ? node[1] : '', row[4], profile.node_id, profile.direct_dns, profile.transparent_proxy_ports, profile.bypass_china, profile.use_v2ray_dns, profile.mosdns_enabled, profile.mosdns_domains, profile.mosdns_match_rules, profile.proxy_router_traffic, profile.transparent_proxy_port, profile.probe_enabled, profile.probe_port ];
							pageView.localProfileDetails[row[0]] = Object.assign({ id: row[0], enabled: row[4] }, profile);
							if (!isTempId(row[0]))
								queuePendingOperation(() => callUpdateProfile(
									pageView.resolveProfileId(row[0]), profile.name, pageView.resolveNodeId(profile.node_id),
									profile.direct_dns, profile.transparent_proxy_ports, profile.bypass_china,
									profile.use_v2ray_dns, profile.mosdns_enabled, profile.mosdns_domains,
									profile.mosdns_match_rules, profile.proxy_router_traffic,
									profile.transparent_proxy_port, profile.probe_enabled,
									profile.probe_port, profile.engine), 'profile-update:' + row[0]);
							refreshProfileTable();
							refreshProfileCard();
						}, nodes, {
							direct_dns: '223.5.5.5:53',
							transparent_proxy_ports: '80,443,8080,8443',
							mosdns_domains: deferredDnsState.mosdns_route_suffix || 'xn--ngstr-lra8j.com',
							mosdns_match_rules: deferredDnsState.direct_rule || ''
						}, details.profile);
					}),
					removeButton(async () => {
						if (row[0] === activeProfile || row[0] === appliedProfile) {
							ui.addNotification(null, E('p', {}, _('Select and apply another profile before deleting this one.')), 'warning');
							return;
						}
						if (!await confirmDelete(_('Delete profile "%s"?').format(row[1])))
							return;
						const index = profiles.findIndex(item => item[0] === row[0]);
						if (index >= 0) profiles.splice(index, 1);
						if (isTempId(row[0])) {
							discardPendingOperation('profile-create:' + row[0]);
							discardPendingOperation('profile-update:' + row[0]);
						} else
							queuePendingOperation(() => callDeleteProfile(row[0]), 'profile-delete:' + row[0]);
						refreshProfileTable();
						refreshProfileCard();
					})
				].filter(Boolean))
			];
			});
		}
		function nodeGroups() {
			const groups = [ [ 'all', _('All nodes') ], [ 'manual', _('Manual') ] ];
			for (const row of sources.filter(item => item[1] === 'subscription'))
				groups.push([ row[0], row[2] ]);
			return groups;
		}
		function refreshNodeGroupOptions() {
			if (!nodeGroupTabs)
				return;
			const groups = nodeGroups();
			if (!groups.some(group => group[0] === selectedNodeGroup))
				selectedNodeGroup = 'all';
			const buttons = groups.map(group => E('button', {
				class: group[0] === selectedNodeGroup ? 'active' : '',
				type: 'button',
				role: 'tab',
				'aria-selected': group[0] === selectedNodeGroup ? 'true' : 'false',
				click: () => {
					selectedNodeGroup = group[0];
					refreshNodeGroupOptions();
					refreshNodeTable();
				}
			}, group[1]));
			nodeGroupTabs.replaceChildren(...buttons);
		}
		function nodeMatchesGroup(row) {
			if (!selectedNodeGroup || selectedNodeGroup === 'all')
				return true;
			if (selectedNodeGroup === 'manual')
				return row[6] === 'manual' || row[6] === 'imported' || !row[6];
			const source = sources.find(item => item[0] === selectedNodeGroup);
			if (source)
				return row[6] === 'subscription' && row[7] === source[2];
			return row[6] === 'imported' && row[7] === selectedNodeGroup;
		}
		function nodeLatencyCell(row) {
			const probe = pageView.nodeProbeResults[row[0]] || {};
			const latency = probe.latency_ms || row[8];
			const status = probe.status || (row[8] ? 'ok' : '');
			const label = latency ? latency + ' ms' : _('Not tested');
			if (status === 'ok')
				return E('span', { class: 'v2rayb-status v2rayb-status-ok', title: probe.checked_at || row[9] || '' }, label + ' · ' + _('TLS/HTTP success'));
			if (status === 'connected')
				return E('span', { class: 'v2rayb-status v2rayb-status-warn', title: probe.error || row[10] || '' }, label + ' · ' + _('TCP connected'));
			if (status === 'failed')
				return E('span', { class: 'v2rayb-status v2rayb-status-warn', title: probe.error || row[10] || '' }, _('Connection failed'));
			return E('span', { class: 'v2rayb-muted' }, label);
		}
		function applyNodeProbeOutput(output) {
			for (const row of parseRows(output)) {
				if (row.length < 5)
					continue;
				pageView.nodeProbeResults[row[0]] = {
					latency_ms: row[1], status: row[2], error: row[3], checked_at: row[4]
				};
			}
		}
		async function startNodeProbe() {
			if (!selectedNodeGroup || pageView.nodeProbeJob)
				return;
			const started = await callNodeProbeStart(selectedNodeGroup).catch(error => ({ success: false, error }));
			if (!started || !started.success) {
				showRequestError(started);
				return;
			}
			pageView.nodeProbeJob = started.job_id;
			nodeProbeButton.disabled = true;
			nodeProbeButton.textContent = _('Testing node group...');
			const poll = async () => {
				try {
					const result = await callNodeProbeStatus(started.job_id);
					if (!result || !result.success)
						throw result || new Error(_('The URL probe status could not be read.'));
					if (result.status === 'running') {
						window.setTimeout(poll, 1000);
						return;
					}
					pageView.nodeProbeJob = null;
					nodeProbeButton.disabled = false;
					nodeProbeButton.textContent = _('Test current group');
					if (result.status === 'done') {
						applyNodeProbeOutput(result.output || '');
						nodeProbeHint.textContent = _('Node speed test completed.');
						refreshNodeTable();
						return;
					}
					nodeProbeHint.textContent = _('Node speed test failed: %s').format(result.error || result.output || _('Unknown'));
				} catch (error) {
					if (pageView.nodeProbeJob === started.job_id)
						window.setTimeout(poll, 1500);
				}
			};
			nodeProbeHint.textContent = _('Node speed test started.');
			poll();
		}
		function nodeTableRows() {
			function nodeSourceLabel(row) {
				if (row[6] === 'subscription')
					return _('Subscription: ') + (row[7] || '');
				if (row[6] === 'imported')
					return _('Imported: ') + (row[7] || '');
				return _('Manual');
			}
			return nodes.filter(nodeMatchesGroup).map(row => [
				displayId(row[0]), row[1], row[2].toUpperCase(), row[3], row[4], nodeSourceLabel(row), nodeLatencyCell(row),
				enabledToggle(row[5], enabled => {
					if (enabled === '0' && profiles.some(profile => profile[5] === row[0])) {
						ui.addNotification(null, E('p', {}, _('Node is referenced by a profile; delete or move that profile before disabling the node.')), 'warning');
						refreshNodeTable();
						return;
					}
					row[5] = enabled;
					if (pageView.localNodeDetails[row[0]])
						pageView.localNodeDetails[row[0]].enabled = enabled;
					if (!isTempId(row[0]))
						queuePendingOperation(() => callSetNodeEnabled(row[0], enabled), 'node-enabled:' + row[0]);
					refreshNodeTable();
					refreshNodeCard();
					refreshProfileAddButton();
				}),
					actionCell([
					row[6] === 'subscription' ? null : editButton(async () => {
						let details;
						if (pageView.localNodeDetails[row[0]])
							details = { success: true, node: pageView.localNodeDetails[row[0]] };
						else
							details = await callGetNode(row[0]).catch(error => { showRequestError(error); return null; });
						if (!details || !details.success) {
							if (details) notify(details, '');
							return;
						}
						showNodeModal(pageView, onNodeSaved, details.node);
					}),
					row[6] === 'subscription' ? null : removeButton(async () => {
						if (profiles.some(profile => profile[5] === row[0])) {
							ui.addNotification(null, E('p', {}, _('Node is referenced by a profile; delete or move that profile first.')), 'warning');
							return;
						}
						if (!await confirmDelete(_('Delete node "%s"?').format(row[1])))
							return;
						const index = nodes.findIndex(item => item[0] === row[0]);
						if (index >= 0) nodes.splice(index, 1);
						if (isTempId(row[0])) {
							discardPendingOperation('node-create:' + row[0]);
							discardPendingOperation('node-update:' + row[0]);
						} else
							queuePendingOperation(() => callDeleteNode(row[0]), 'node-delete:' + row[0]);
						refreshNodeTable();
						refreshNodeCard();
						refreshProfileTable();
						refreshProfileAddButton();
						})
					].filter(Boolean))
			]);
		}
		function startSubscriptionUpdate(sourceId) {
			const id = String(sourceId);
			return callSubscriptionUpdateStart(id).then(result => {
				if (!result || !result.success) {
					showRequestError(result);
					return result;
				}
				pageView.subscriptionJobs[id] = result.job_id;
				delete pageView.subscriptionJobErrors[id];
				refreshSourceTable();
				ui.addNotification(null, E('p', {}, _('Subscription update started.')), 'info');
				const poll = () => callSubscriptionUpdateStatus(result.job_id).then(status => {
					if (!status || !status.success)
						throw status || new Error(_('Subscription status could not be read.'));
					if (status.status === 'running') {
						window.setTimeout(poll, 1000);
						return;
					}
					delete pageView.subscriptionJobs[id];
					if (status.status === 'done')
						ui.addNotification(null, E('p', {}, _('Subscription update completed.')), 'info');
					else {
						pageView.subscriptionJobErrors[id] = status.error || status.output || _('Unknown');
						ui.addNotification(null, E('p', {}, _('Subscription update failed: %s').format(pageView.subscriptionJobErrors[id])), 'error');
					}
					window.setTimeout(reloadPage, 700);
				}).catch(() => {
					if (pageView.subscriptionJobs[id] === result.job_id)
						window.setTimeout(poll, 1500);
				});
				poll();
				return result;
			}).catch(error => { showRequestError(error); return { success: false, error: error }; });
		}
		function saveSubscriptionAndStart(sourceId) {
			return callSources().then(result => {
				if (result && result.code === 0) {
					sources.splice(0, sources.length, ...parseRows(outputOf(result)));
					refreshNodeGroupOptions();
					refreshSourceTable();
				}
				return startSubscriptionUpdate(sourceId);
			});
		}
		function sourceStatus(row) {
			if (pageView.subscriptionJobs[row[0]])
				return E('span', { class: 'v2rayb-status v2rayb-status-warn' }, _('Fetching...'));
			if (pageView.subscriptionJobErrors[row[0]])
				return E('span', { class: 'v2rayb-status v2rayb-status-warn' }, _('Subscription update failed: %s').format(pageView.subscriptionJobErrors[row[0]]));
			if (row[7])
				return E('span', { class: 'v2rayb-status v2rayb-status-warn' }, _('Update failed: %s').format(row[7]));
			return E('span', { class: 'v2rayb-status v2rayb-status-ok' }, _('Ready'));
		}
		function sourceTableRows() {
			return sources.filter(row => row[1] === 'subscription').map(row => [
				row[2], row[8] || '0', row[4] || 'auto',
				isEnabled(row[9]) ? _('IPv4 only') : _('IPv4 + IPv6'),
				row[6] || '-', sourceStatus(row),
				actionCell([
					editButton(() => showSourceModal(row, startSubscriptionUpdate)),
					E('button', { class: 'btn cbi-button cbi-button-action', type: 'button', click: async () => {
						await startSubscriptionUpdate(row[0]);
					} }, _('Update')),
					removeButton(async () => {
						if (!await confirmDelete(_('Delete subscription "%s" and its unreferenced nodes?').format(row[2])))
							return;
						const index = sources.findIndex(item => item[0] === row[0]);
						if (index >= 0)
							sources.splice(index, 1);
						queuePendingOperation(() => callDeleteSource(row[0]), 'source-delete:' + row[0]);
						refreshNodeGroupOptions();
						refreshSourceTable();
						updateLocalChangesNotice();
					})
				])
			]);
		}
		function refreshSourceTable() {
			const next = table(sourceTableHeaders, sourceTableRows(), _('No subscriptions configured.'), true);
			sourceTable.replaceWith(next);
			sourceTable = next;
		}
		function refreshNodeTable() {
			const emptyText = nodes.length > 0 ? _('No matching nodes in this group.') : _('No nodes configured.');
			const next = table(nodeTableHeaders, nodeTableRows(), emptyText, true);
			nodeTable.replaceWith(next);
			nodeTable = next;
			updateLocalChangesNotice();
		}
		function refreshProfileTable() {
			const next = table(profileTableHeaders, profileTableRows(), _('No profiles configured.'), true);
			profileTable.replaceWith(next);
			profileTable = next;
			updateLocalChangesNotice();
		}
		function refreshNodeCard() {
			enabledNodes = nodes.filter(row => isEnabled(row[5])).length;
			nodesCard.querySelector('.v2rayb-card-value').textContent = `${enabledNodes} / ${nodes.length}`;
		}
		function refreshProfileCard() {
			enabledProfiles = profiles.filter(row => isEnabled(row[4])).length;
			const row = activeProfileRow;
			activeProfileCard.querySelector('.v2rayb-card-value').textContent =
				row ? row[1] : (appliedProfile || _('Not selected'));
			activeProfileCard.querySelector('.v2rayb-card-help').textContent = profilePolicyText(row);
			pageView.refreshActiveProfileSelect();
		}
		function onNodeSaved(node) {
			if (node.id) {
				const id = String(node.id);
				const index = nodes.findIndex(item => item[0] === id);
				if (index >= 0)
						nodes[index] = [ id, node.name, node.protocol, node.server, node.port, nodes[index][5], nodes[index][6], nodes[index][7], nodes[index][8] || '', nodes[index][9] || '', nodes[index][10] || '' ];
				pageView.localNodeDetails[id] = {
					id: id, name: node.name, protocol: node.protocol,
					server: node.server, port: node.port,
					enabled: nodes[index] ? nodes[index][5] : '1', data_json: node.data_json
				};
				if (!isTempId(id))
					queuePendingOperation(() => callUpdateNode(
						id, node.name, node.protocol, node.server, node.port, node.data_json
					), 'node-update:' + id);
				refreshNodeTable();
				refreshNodeCard();
				refreshProfileTable();
				refreshProfileAddButton();
				return;
			}

			const tempId = pageView.nextTempId('node');
			const row = [ tempId, node.name, node.protocol, node.server, node.port, '1', 'manual', '', '', '', '' ];
			nodes.push(row);
			pageView.localNodeDetails[tempId] = {
				id: tempId, name: node.name, protocol: node.protocol,
				server: node.server, port: node.port, enabled: '1', data_json: node.data_json
			};
			queuePendingOperation(() => callAddNode(
				node.name, node.protocol, node.server, node.port, node.data_json
			).then(result => {
				if (!result || !result.success)
					return result;
				pageView.nodeIdMap[tempId] = String(result.node_id);
				return result;
			}), 'node-create:' + tempId);
			refreshNodeTable();
			refreshNodeCard();
			refreshProfileTable();
			refreshProfileAddButton();
		}
		function refreshProfileAddButton() {
			if (!profileAddButton)
				return;
			const enabled = nodes.some(row => isEnabled(row[5]));
			profileAddButton.disabled = !enabled;
			profileAddButton.classList.toggle('disabled', !enabled);
		}
		function onProfileSaved(profile) {
			const node = nodes.find(item => item[0] === profile.node_id);
			const row = [
				profile.id || pageView.nextTempId('profile'), profile.name, profile.engine,
				node ? node[1] : '', '1', profile.node_id, profile.direct_dns,
				profile.transparent_proxy_ports, profile.bypass_china,
				profile.use_v2ray_dns, profile.mosdns_enabled,
				profile.mosdns_domains, profile.mosdns_match_rules,
				profile.proxy_router_traffic, profile.transparent_proxy_port,
				profile.probe_enabled, profile.probe_port
			];
			const id = row[0];
			const index = profiles.findIndex(item => item[0] === id);
			if (index >= 0)
				profiles[index] = row;
			else
				profiles.push(row);
			pageView.localProfileDetails[id] = Object.assign({ id: id, enabled: '1' }, profile);
			queuePendingOperation(() => callAddProfile(
				profile.name, pageView.resolveNodeId(profile.node_id),
				profile.direct_dns, profile.transparent_proxy_ports,
				profile.bypass_china, profile.use_v2ray_dns,
				profile.mosdns_enabled, profile.mosdns_domains,
				profile.mosdns_match_rules, profile.proxy_router_traffic,
				profile.transparent_proxy_port, profile.probe_enabled,
				profile.probe_port, profile.engine
			).then(result => {
				if (!result || !result.success)
					return result;
				pageView.profileIdMap[id] = String(result.profile_id);
				return result;
			}), 'profile-create:' + id);
			refreshProfileTable();
			refreshProfileCard();
		}
		nodeTable = table(nodeTableHeaders, nodeTableRows(), _('No nodes configured.'), true);
		sourceTable = table(sourceTableHeaders, sourceTableRows(), _('No subscriptions configured.'), true);
		profileTable = table(profileTableHeaders, profileTableRows(), _('No profiles configured.'), true);
		profileAddButton = E('button', {
			class: 'cbi-button cbi-button-add', type: 'button',
			click: () => showProfileModal(onProfileSaved, nodes, {
				direct_dns: '223.5.5.5:53',
				transparent_proxy_ports: '80,443,8080,8443',
				transparent_proxy_port: '12345',
				probe_enabled: '1',
				probe_port: '12346',
				mosdns_domains: deferredDnsState.mosdns_route_suffix || 'xn--ngstr-lra8j.com',
				mosdns_match_rules: deferredDnsState.direct_rule || ''
			})
		}, _('Add'));
		pageView.resolveActiveProfile = function() {
			return this.resolveProfileId(activeProfile);
		};
		const originalPersistLocalChanges = pageView.persistLocalChanges;
		pageView.persistLocalChanges = function() {
			const initialActiveProfile = status.active_profile || '';
			return originalPersistLocalChanges.call(this).then(result => {
				if (!result || !result.success)
					return result;
				const resolvedActive = this.resolveProfileId(activeProfile);
				if (!activeProfile || String(resolvedActive) === String(initialActiveProfile))
					return result;
				return callSelectProfile(resolvedActive).then(selectResult => {
					if (selectResult && selectResult.success)
						this.activeProfileDirty = false;
					return selectResult;
				});
			});
		};
		refreshProfileAddButton();
		selectedNodeGroup = 'all';
		nodeGroupTabs = E('div', { class: 'v2rayb-filter-tabs', role: 'tablist' });
		refreshNodeGroupOptions();
		nodeProbeButton = E('button', { class: 'cbi-button cbi-button-action', type: 'button', click: startNodeProbe }, _('Test current group'));
		nodeProbeHint = E('span', { class: 'v2rayb-help' }, _('Tests TCP and TLS connection from the router; it does not change the active profile.'));
		const nodesPane = [
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Subscriptions')),
				sourceTable,
				E('div', { class: 'v2rayb-create' }, [
					E('button', { class: 'cbi-button cbi-button-add', type: 'button', click: () => showSourceModal(null, saveSubscriptionAndStart) }, _('Add subscription'))
				])
			]),
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Proxy Nodes')),
				nodeGroupTabs,
				E('div', { class: 'v2rayb-toolbar' }, [
					nodeProbeButton, nodeProbeHint
				]),
				nodeTable,
				E('div', { class: 'v2rayb-create' }, [
					E('button', { class: 'cbi-button cbi-button-add', type: 'button', click: () => showNodeModal(pageView, onNodeSaved) }, _('Add'))
				])
			]),
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Profiles')),
				profileTable,
				E('div', { class: 'v2rayb-create' }, [ profileAddButton ])
			])
		];

		const deferredDnsState = {};
		const runtimePaneContent = E('div', {}, E('p', { class: 'cbi-value-description' }, _('Loading DNS status...')));
		const runtimePane = [ runtimePaneContent ];
		L.resolveDefault(callDnsState(), { output: '' }).then(result => {
			Object.assign(deferredDnsState, parseKeyValues(outputOf(result)));
			const effectiveDns = deferredDnsState.direct_dns || '-';
			const dnsmasqDefault = deferredDnsState.dnsmasq_default || (state === 'proxy' ? (deferredDnsState.v2ray_dns_listen || '127.0.0.1#5353') : _('WAN DHCP DNS'));
			const v2rayDns = deferredDnsState.v2ray_dns_listen || status.v2ray_dns_listen || '127.0.0.1#5353';
			const mosDns = deferredDnsState.mosdns_listen || status.mosdns_listen || '127.0.0.1#5354';
			const dnsSuffix = deferredDnsState.mosdns_route_suffix || 'xn--ngstr-lra8j.com';
			const directRule = deferredDnsState.direct_rule || _('No direct regex rule configured');
			const accelFiles = deferredDnsState.china_accel_files || '0';
			runtimePaneContent.replaceChildren(
				E('div', { class: 'cbi-section' }, [
					E('h3', {}, _('Global DNS settings')),
					field(_('Direct DNS upstreams'), directDnsInput,
						_('One upstream per line or comma-separated. Used for bootstrap, subscription and MosDNS direct resolution.'))
				]),
				E('div', { class: 'cbi-section' }, [
					E('h3', {}, _('DNS Resolution Chain')),
					table([ _('Order'), _('Component'), _('Listener / upstream') ], [
						[ '1', _('LAN client'), 'dnsmasq :53' ],
						[ '2', _('Domain-rule files'), (deferredDnsState.dnsmasq_confdir || '/etc/dnsmasq.d') + ' (' + accelFiles + ')' ],
						[ '3', _('Default upstream'), dnsmasqDefault ],
						[ '4', _('MosDNS narrow branch'), mosDns + ' <- *.' + dnsSuffix ],
						[ '5', _('Direct DNS'), effectiveDns ],
						[ '6', _('Proxy DNS'), v2rayDns ]
					], _('No DNS state data available. Use URL diagnostics for the observed path.'))
				]),
				E('div', { class: 'cbi-section' }, [
					E('h3', {}, _('MosDNS Narrow Route')),
					table([ _('Item'), _('Current value') ], [
						[ _('Forwarded suffix'), '*.' + dnsSuffix ],
						[ _('MosDNS listener'), mosDns ],
						[ _('Direct DNS upstream'), effectiveDns ],
						[ _('Direct regexp'), E('code', {}, directRule) ]
					], _('No MosDNS route data available.'))
				]),
				E('div', { class: 'cbi-section' }, [
					E('h3', {}, _('nftables Direct Sets')),
					table([ _('Source'), _('Runtime set'), _('Static set') ], [
						[ _('MosDNS direct answers'), deferredDnsState.nft_direct_sets || 'direct4,direct6', deferredDnsState.nft_direct_static_sets || 'direct_static4,direct_static6' ]
					], _('No nftables set data available.'))
				]),
				E('div', { class: 'cbi-section' }, [
					E('h3', {}, _('Effective Profile Policy')),
					table([ _('Item'), _('Effective value') ], [
						[ _('Applied profile'), activeProfileRow ? activeProfileRow[1] : _('Not selected') ],
						[ _('Direct DNS upstream'), effectiveDns ],
						[ _('Intercepted TCP destination ports'), activeProfileRow ? (activeProfileRow[7] || '-') : '-' ],
						[ _('Transparent proxy listener port'), activeProfileRow ? (activeProfileRow[13] || '12345') : '-' ],
						[ _('Connectivity probe'), !activeProfileRow ? '-' : isEnabled(activeProfileRow[14])
							? _('Enabled') + ' (' + (activeProfileRow[15] || '12346') + ')' : _('Disabled') ]
					], _('No active profile policy available.'))
				])
			);
		}).catch(() => {
			runtimePaneContent.replaceChildren(E('p', { class: 'cbi-value-description' }, _('No DNS state data available. Use URL diagnostics for the observed path.')));
		});

		const probeUrlInput = E('input', {
			class: 'cbi-input-text',
			type: 'url',
			value: 'https://www.google.com/',
			maxlength: '2048',
			placeholder: 'https://example.com/'
		});
		const probeResults = E('div', { class: 'v2rayb-probe-results' }, [
			E('p', { class: 'cbi-value-description' }, _('No request has been tested yet.'))
		]);
		const probeButton = E('button', {
			class: 'cbi-button cbi-button-action',
			type: 'button',
			click: async () => {
				const url = probeUrlInput.value.trim();
				if (!url) {
					ui.addNotification(null, E('p', {}, _('Enter an http:// or https:// URL first.')), 'warning');
					return;
				}
				probeButton.disabled = true;
				probeButton.textContent = _('Testing...');
				probeResults.replaceChildren(E('p', { class: 'cbi-value-description' }, _('Running DNS and HTTPS checks from the router...')));
				try {
					const started = await callNetworkProbeStart(url);
					if (!started || !started.success) {
						probeResults.replaceChildren(E('pre', { class: 'v2rayb-code' }, started && started.error || _('The URL probe could not be started.')));
						return;
					}
					let result = null;
					for (let attempt = 0; attempt < 120; attempt++) {
						if (!document.documentElement.contains(probeResults))
							return;
						result = await callNetworkProbeStatus(started.job_id);
						if (!result || !result.success || result.status === 'done' || result.status === 'failed')
							break;
						await new Promise(resolve => window.setTimeout(resolve, 500));
					}
					if (!result || !result.success) {
						probeResults.replaceChildren(E('pre', { class: 'v2rayb-code' }, result && result.error || _('The URL probe status could not be read.')));
						return;
					}
					if (result.status === 'failed') {
						probeResults.replaceChildren(E('pre', { class: 'v2rayb-code' }, result.error || _('The URL probe failed.')));
						return;
					}
					if (result.status !== 'done') {
						probeResults.replaceChildren(E('pre', { class: 'v2rayb-code' }, _('The URL probe is still running. Try again in a moment.')));
						return;
					}
					const probe = parseKeyValues(result.output || '');
					const dnsQueryMs = probe.dns_query_ms || '-';
					const rows = [
						[ _('Requested URL'), probe.probe_url || url ],
						[ _('Proxy mode'), probe.runtime_state || '-' ],
						[ _('DNS entry'), probe.dns_entry || '-' ],
						[ _('DNS route'), probe.dns_path || '-' ],
						[ _('DNS branch'), probe.dns_branch || '-' ],
						[ _('Observed upstreams'), probe.dns_observed_upstreams || '-' ],
						[ _('Observation status'), probe.dns_observation || '-' ],
						[ _('Observed query types'), probe.dns_observation_query || '-' ],
						[ _('Observation scope'), probe.dns_observation_scope || '-' ],
						[ _('Configured upstreams'), probe.dnsmasq_servers || '-' ],
						[ _('DNS result'), (probe.dns_result || '-') + ' (' + (probe.dns_status || '-') + ')' ],
						[ _('A answers'), probe.dns_a || '-' ],
						[ _('AAAA answers'), probe.dns_aaaa || '-' ],
						[ _('CNAME'), probe.dns_cname || '-' ],
						[ _('DNS query time'), dnsQueryMs !== '-' ? dnsQueryMs + ' ms' : '-' ],
						[ _('HTTP(S) result'), (probe.https_result || '-') + ' (HTTP ' + (probe.https_http_code || '-') + ')' ],
						[ _('TLS verification'), probe.probe_scheme !== 'https' ? _('not applicable') : (probe.https_tls_verify === '0' ? _('valid') : (probe.https_tls_verify || '-')) ],
						[ _('Connected remote'), probe.https_remote || '-' ],
						[ _('Local socket'), probe.https_local || '-' ],
						[ _('Kernel route'), probe.route_kernel || '-' ],
						[ _('Egress device / gateway'), (probe.route_device || '-') + ' / ' + (probe.route_gateway || '-') ],
						[ _('Route source address'), probe.route_source || '-' ],
						[ _('DNS / TCP / TLS / first byte / total'), [
							dnsQueryMs !== '-' ? dnsQueryMs + ' ms' : '-',
							probe.https_time_connect ? probe.https_time_connect + ' s' : '-',
							probe.https_time_tls ? probe.https_time_tls + ' s' : '-',
							probe.https_time_first_byte ? probe.https_time_first_byte + ' s' : '-',
							probe.https_time_total ? probe.https_time_total + ' s' : '-'
						].join(' / ') ],
						[ _('DNS upstream note'), probe.dns_upstream_observation || '-' ],
						[ _('Path note'), probe.https_path || '-' ]
					];
					if (probe.https_error && probe.https_error !== '-')
						rows.push([ _('HTTPS error'), probe.https_error ]);
					probeResults.replaceChildren(table([ _('Probe detail'), _('Result') ], rows, _('No probe result.')));
				}
				catch (error) {
					probeResults.replaceChildren(E('pre', { class: 'v2rayb-code' }, errorMessage(error)));
				}
				finally {
					probeButton.disabled = false;
					probeButton.textContent = _('Test URL');
				}
			}
		}, _('Test URL'));
		const configOutput = E('pre', { class: 'v2rayb-code' }, _('Open this tab to load the active configuration.'));
		let configRequested = false;
		function loadV2rayConfig() {
			if (configRequested)
				return;
			configRequested = true;
			configOutput.textContent = _('Loading configuration...');
			L.resolveDefault(callGetV2rayConfig(), { output: '' }).then(result => {
				configOutput.textContent = outputOf(result) || _('No V2Ray configuration available.');
			});
		}
		const diagnosticsPane = [
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Test a URL from this router')),
				E('p', { class: 'cbi-value-description' }, _('The router queries local dnsmasq and records its actual outbound DNS targets, then makes a real HTTP(S) request. Cache and local answers may have no observed upstream.')),
				field(_('Target URL'), probeUrlInput, _('Use a full http:// or https:// URL. The request originates on the router itself.')),
				E('p', { class: 'cbi-value-description' }, _('Important: v2rayB transparent redirect rules currently apply to LAN traffic in PREROUTING. A request generated by the router follows its own OUTPUT route and may not use the LAN client proxy path.')),
				E('div', { class: 'v2rayb-toolbar' }, [ probeButton ]),
				probeResults
			]),
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Applied V2Ray configuration')),
				E('p', { class: 'cbi-value-description' }, _('Contains credentials. Do not share.')),
				configOutput
			]),
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Runtime status')),
				E('pre', { class: 'v2rayb-code' }, outputOf(data[0]) || _('No runtime status available.'))
			])
		];
		const logComponent = E('select', { class: 'cbi-input-select' }, [
			[ 'all', _('All components') ],
			[ 'v2rayb', _('v2rayB') ],
			[ 'watchdog', _('Watchdog') ],
			[ 'v2ray', _('V2Ray') ],
			[ 'mosdns', _('MosDNS') ],
			[ 'dnsmasq', _('dnsmasq') ],
			[ 'system', _('System log') ]
		].map(item => E('option', { value: item[0] }, item[1])));
		const logLines = E('select', { class: 'cbi-input-select' }, [ 50, 100, 200 ].map(value =>
			E('option', { value: String(value) }, String(value))));
		logLines.value = '100';
		const logsOutput = E('pre', { class: 'v2rayb-code' }, _('Loading logs...'));
		const logsUpdated = E('span', { class: 'v2rayb-help' }, '');
		const refreshLogsButton = E('button', {
			class: 'cbi-button cbi-button-action',
			type: 'button',
			click: loadLogs
		}, _('Refresh logs'));
		async function loadLogs() {
			refreshLogsButton.disabled = true;
			logsOutput.textContent = _('Loading logs...');
			try {
				const result = await callLogs(logComponent.value, logLines.value);
				if (!result || !result.success)
					throw new Error(result && result.error || _('No log entries.'));
				logsOutput.textContent = result.output || _('No log entries.');
				logsUpdated.textContent = new Date().toLocaleString();
			}
			catch (error) {
				logsOutput.textContent = errorMessage(error);
			}
			finally {
				refreshLogsButton.disabled = false;
			}
		}
		logComponent.addEventListener('change', loadLogs);
		logLines.addEventListener('change', loadLogs);
		const logsPane = [
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Logs')),
				E('div', { class: 'v2rayb-toolbar' }, [
					field(_('Log component'), logComponent),
					field(_('Lines'), logLines),
					refreshLogsButton,
					logsUpdated
				]),
				logsOutput
			])
		];

		const pendingApplyJob = sessionStorage.getItem('v2rayb.applyJob');
		if (/^[0-9]+-[0-9]+$/.test(pendingApplyJob || ''))
			window.setTimeout(() => resumeApplyJob(pendingApplyJob), 0);

		return E('div', { class: 'cbi-map v2rayb-shell' }, [
			css(),
			E('div', { class: 'v2rayb-hero' }, [
				E('h2', {}, _('v2rayB unified proxy')),
				E('div', { class: 'v2rayb-hero-meta' }, [
					E('span', { class: 'v2rayb-chip' }, [ _('Current state:'), statusBadge(state) ]),
					E('span', { class: 'v2rayb-chip' }, `${_('Profile')}: ${appliedProfileName}`),
					E('span', { class: 'v2rayb-chip' }, `${_('DNS')}: ${status.v2ray_dns_listen || '-'}`)
				])
			]),
			renderTabs([
				{ id: 'overview', title: _('Overview'), nodes: overview },
				{ id: 'nodes', title: _('Nodes and profiles'), nodes: nodesPane },
				{ id: 'runtime', title: _('DNS and proxy'), nodes: runtimePane },
				{ id: 'diagnostics', title: _('Diagnostics'), nodes: diagnosticsPane, onActivate: loadV2rayConfig },
				{ id: 'logs', title: _('Logs'), nodes: logsPane, onActivate: loadLogs }
			])
		]);
	}
});
