#!/usr/bin/env python3

import json
import pathlib
import re


ROOT = pathlib.Path(__file__).resolve().parents[1]
FILES = ROOT / "files"


def main():
    menu_path = FILES / "usr/share/luci/menu.d/luci-app-v2rayb.json"
    acl_path = FILES / "usr/share/rpcd/acl.d/luci-app-v2rayb.json"
    menu = json.loads(menu_path.read_text(encoding="utf-8"))
    acl = json.loads(acl_path.read_text(encoding="utf-8"))["luci-app-v2rayb"]
    route = menu["admin/services/v2rayB"]
    assert route["action"] == {"type": "view", "path": "v2rayB/overview"}

    methods = set(acl["read"]["ubus"]["luci.v2rayb"])
    methods.update(acl["write"]["ubus"]["luci.v2rayb"])
    rpc_source = (FILES / "usr/share/rpcd/ucode/luci.v2rayb").read_text(
        encoding="utf-8"
    )
    view_source = (
        FILES / "www/luci-static/resources/view/v2rayB/overview.js"
    ).read_text(encoding="utf-8")
    ctl_source = (FILES / "usr/libexec/v2rayB/v2rayBctl").read_text(
        encoding="utf-8"
    )
    assert "function isEnabled(value)" in view_source
    assert "function valid_source_name(value)" in rpc_source
    assert "订阅名称无效：编码长度不得超过 256 字节" in rpc_source
    assert "is_source_name() {" in ctl_source
    assert "订阅名称无效：编码长度不得超过 256 字节" in ctl_source
    assert "const sourceName = name.value.trim();" in view_source
    assert "callAddSource(sourceName, url.value, format.value," in view_source
    assert "ipv4Only.checked ? '1' : '0'" in view_source
    translation_block = view_source.split("const _zh = {", 1)[1].split("};", 1)[0]
    translated_keys = set(re.findall(r"^\s*'([^']*)':", translation_block, re.MULTILINE))
    message_keys = set(re.findall(r"_\('([^']*)'\)", view_source))
    assert message_keys <= translated_keys, sorted(message_keys - translated_keys)
    assert "function checkbox(attributes, checked)" in view_source
    assert "input.checked = checked === true" in view_source
    assert "checked: configuredServiceEnabled" not in view_source
    assert "checked: isEnabled(enabled)" not in view_source
    assert "selected: existing && existing.node_id" not in view_source
    assert "function groupedNodeOptions(nodes, existingId)" in view_source
    assert "E('optgroup', { label }, items)" in view_source
    assert "option.selected = !!existingId && option.value === existingId" in view_source
    assert "class: 'v2rayb-filter-tabs'" in view_source
    assert "selectedNodeGroup = group[0];" in view_source
    assert "selectedNodeGroup = 'all';" in view_source
    assert "if (!selectedNodeGroup || selectedNodeGroup === 'all')" in view_source
    assert "callNodeProbeStart(selectedNodeGroup)" in view_source
    assert "nodeGroupFilter" not in view_source
    assert "field(_('Node group'), nodeGroupFilter)" not in view_source
    assert "const emptyText = nodes.length > 0 ? _('No matching nodes in this group.') : _('No nodes configured.');" in view_source
    assert "'No matching nodes in this group.': '此分组没有匹配节点。'" in view_source
    assert "set_service_enabled" not in view_source
    assert "callSetSetting('service_enabled'" in view_source
    assert "pageView.serviceEnabledDirty" in view_source
    assert "pageView.pendingOperations" in view_source
    assert "queuePendingOperation(() => callSetNodeEnabled" in view_source
    assert "queuePendingOperation(() => callSetProfileEnabled" in view_source
    assert "queuePendingOperation(() => callSelectProfile" not in view_source
    assert "queuePendingOperation(() => callDeleteNode" in view_source
    assert "queuePendingOperation(() => callDeleteProfile" in view_source
    assert "queuePendingOperation(() => callDeleteSource" in view_source
    assert "notify(result, _('Subscription deleted.'), true)" not in view_source
    assert "field(_('Profile to activate'), activeProfileSelect" in view_source
    assert "card(_('Applied profile')" in view_source
    assert "activeProfileRows = parseRows(outputOf(data[5]))" not in view_source
    assert "const appliedProfileRows = profiles.filter(row => row[0] === appliedProfile);" in view_source
    assert "const activeProfileRow = appliedProfileRows[0] || null" in view_source
    assert "const appliedProfileName = activeProfileRow" in view_source
    assert "? activeProfileRow[1]" in view_source
    assert "`${_('Profile')}: ${appliedProfileName}`" in view_source
    assert "`${_('Profile')}: ${appliedProfile || _('none')}`" not in view_source
    assert "method: 'get_applied_profile'" not in view_source
    assert "get_applied_profile" in rpc_source
    assert "get-applied-profile" in ctl_source
    assert "profileTableHeaders = [ _('ID'), _('Name'), _('Primary node'), _('Policy'), _('Enabled'), _('Actions') ]" in view_source
    assert "'Use')) : ''" not in view_source
    assert "_('Active')) : ''" not in view_source
    assert "pageView.activeProfileDirty" in view_source
    assert "profileOptionsFromProfiles(rows)" in view_source
    profile_change = view_source[
        view_source.index("activeProfileSelect.addEventListener('change'"):
        view_source.index("const overview = [")
    ]
    assert "refreshProfileCard();" not in profile_change
    assert "pageView.activeProfileDirty = activeProfile !== appliedProfile;" in profile_change
    assert "Save DNS setting" not in view_source
    assert "Save port setting" not in view_source
    assert "Enable v2rayB" in view_source
    assert "Also controls boot startup." in view_source
    assert "Applied after Save & Apply." in view_source
    assert "function actionButton(" not in view_source
    assert "actionButton(this, _('Start')" not in view_source
    assert "set_service_enabled" not in rpc_source
    assert "key != 'service_enabled'" in rpc_source
    assert "enabled ? 'enable' : 'disable'" in rpc_source
    assert "was_proxy ? 'restart' : was_suspended ? 'resume' : 'start'" in rpc_source
    assert "run(init_path, [ 'stop' ])" in rpc_source
    assert "method: 'apply_draft_start'" in view_source
    assert "method: 'apply_draft_status'" in view_source
    assert "method: 'apply_draft'" not in view_source
    assert "callApplyDraftStatus(jobId)" in view_source
    assert "sessionStorage.setItem('v2rayb.applyJob', jobId)" in view_source
    assert "resumeApplyJob(pendingApplyJob)" in view_source
    assert "apply_draft_start" in rpc_source
    assert "apply_draft_status" in rpc_source
    assert "apply_draft_status" in acl["read"]["ubus"]["luci.v2rayb"]
    assert "apply_draft_start" in acl["write"]["ubus"]["luci.v2rayb"]
    assert "cmd_apply_draft_start()" in ctl_source
    assert "cmd_apply_draft_status()" in ctl_source
    assert "apply_job_fail_and_rollback" in ctl_source
    assert "V2RAYB_LOCK_WAIT_SECONDS=60" in ctl_source
    assert "method: 'revert_draft'" in view_source
    assert "handleSave()" in view_source
    assert "handleSaveApply()" in view_source
    assert "handleReset()" in view_source
    assert "Your changes are saved as a draft. Use Save & Apply" in view_source
    assert "Apply changes" not in view_source
    assert "Revert changes" not in view_source
    assert "addFooter() {" not in view_source
    assert "draft_pending === '1'" in view_source
    assert "status.draft_active_profile || appliedProfile" in view_source
    assert "applied_config_version" not in view_source
    assert "draft_config_version" not in view_source
    assert "Applied version" not in view_source
    assert "Pending draft version" not in view_source
    assert "Draft version %s" not in view_source
    assert "applied_config_version=" not in ctl_source.split("cmd_status()", 1)[1]
    assert "Pending changes: Save & Apply to activate" in view_source
    assert "Pending changes: Save & Apply to activate, or Reset to discard." in view_source
    assert "running configuration is unchanged" not in view_source
    assert "running configuration is up to date" not in view_source
    assert ".v2rayb-hero .v2rayb-chip" in view_source
    assert "background: #f6f8fa; color: #29384d;" in view_source
    assert "profile policy is missing from both draft and applied configuration" in ctl_source
    assert "profileAddButton.disabled = !enabled;" in view_source
    assert "disabled: !nodes.some" not in view_source
    assert "function buildOutbound" in view_source
    assert "MosDNS match rules" in view_source
    assert "textarea" in view_source
    assert "params: [ 'name', 'protocol', 'server', 'port', 'data_json' ]" in view_source
    assert "const sourceTableHeaders = [ _('Name'), _('Nodes'), _('Format'), _('Download'), _('Last update'), _('Status'), _('Actions') ];"
    assert "isEnabled(row[9]) ? _('IPv4 only') : _('IPv4 + IPv6')" in view_source
    assert "method: 'add_profile'" in view_source
    assert "direct_dns', 'transparent_proxy_ports', 'bypass_china'" in view_source
    assert "Profile policy" in view_source
    assert "Proxy router-originated TCP" in view_source
    assert "Includes TCP connections started by this router. UDP and DNS are not proxied." in view_source
    assert "proxy_router_traffic" in rpc_source
    assert "proxy_router_traffic=' || COALESCE(pol.proxy_router_traffic, 0)" in ctl_source
    assert "type nat hook output priority -100" in ctl_source
    assert "meta skuid %s return" in ctl_source
    init_source = (FILES / "etc/init.d/v2rayB").read_text(encoding="utf-8")
    assert '[ "${V2RAYB_LOCK_HELD:-0}" = 1 ]' in init_source
    assert '[ "$LOCK_INHERITED" = 0 ]' in init_source
    assert 'V2RAY_USER="${V2RAYB_V2RAY_USER:-nobody}"' in init_source
    assert 'ulimit -n "$max_fd"' in init_source
    assert 'start-stop-daemon -S -b -c "$V2RAY_USER:$V2RAY_GROUP"' in init_source
    assert "proxy_connected()" in init_source
    assert "port_ready \"$probe_port\"" in init_source
    assert "proxy_connected \"$probe_port\"" in init_source
    assert "dns_policy_value probe_enabled" in init_source
    assert "traffic and DNS were not imported" in init_source
    assert "rollback_start suspended" in init_source
    assert "suspend_service()" in init_source
    assert '"$CTL" set-state suspended' in init_source
    assert "normal|starting|proxy|stopping|degraded|suspended" in ctl_source
    makefile_source = (ROOT / "Makefile").read_text(encoding="utf-8")
    assert 'state="$$(/usr/libexec/v2rayB/v2rayBctl status' in makefile_source
    assert 'if [ "$$start_status" != 0 ] && [ "$$state" != suspended ]; then' in makefile_source
    assert 'if [ "$$state" = suspended ]; then' in makefile_source
    assert "proxy unavailable, traffic and DNS imports suspended" in makefile_source
    assert "apply_job_restore_action=suspend" in ctl_source
    assert "apply_job_action=resume" in ctl_source
    assert "resuming-service" in ctl_source
    assert "let wasSuspended = match(before.output" in rpc_source
    assert "let was_suspended = match(before.output" in rpc_source
    assert "wasSuspended ? 'suspend'" in rpc_source
    assert "was_suspended ? 'resume'" in rpc_source
    assert 'extra_command "resume"' in init_source
    assert "proxy remains suspended; reload does not retry it" in init_source
    watchdog_source = (FILES / "usr/bin/v2rayB-watchdog").read_text(encoding="utf-8")
    assert "probe_proxy()" in watchdog_source
    assert "--socks5-hostname \"127.0.0.1:$HEALTH_PROBE_PORT\"" in watchdog_source
    assert '"$INIT_SCRIPT" suspend' in watchdog_source
    assert "V2RAYB_WATCHDOG_FAIL_LIMIT" in watchdog_source
    assert "V2RAYB_RUNTIME_DIR" in watchdog_source
    assert "withdrawing traffic and DNS imports" in watchdog_source
    assert "'Suspended':" in view_source
    assert 'for log_name in v2ray.log v2ray-error.log; do' in init_source
    assert 'chown "$V2RAY_USER:$V2RAY_GROUP" "$RUNTIME/$log_name"' in init_source
    assert "8080-8443" in view_source
    assert "profilePolicyText(row)" in view_source
    assert "method: 'dns_state'" in view_source
    assert "Use V2Ray DNS as dnsmasq default" in view_source
    assert "Only names not matched by a domain-specific dnsmasq rule" in view_source
    assert "_('Domain-rule files')" in view_source
    assert "_('Default upstream')" in view_source
    assert "_('Observed upstreams')" in view_source
    assert "_('Observation status')" in view_source
    assert "_('Observation scope')" in view_source
    assert "nftables output trace filtered to the dnsmasq process" in ctl_source
    assert "Enable MosDNS branch" in view_source
    assert "MosDNS domains" in view_source
    assert "MosDNS match rules" in view_source
    assert "mosdnsDomains.disabled = !enabled;" in view_source
    assert "mosdnsRules.disabled = !enabled;" in view_source
    assert "class: 'cbi-input-text v2rayb-form-wide'" in view_source
    assert "class: 'cbi-value-description'" in view_source
    assert "help ? E('div', { class: 'v2rayb-help' }" not in view_source
    assert "mosdnsDomains.value.split(/[\\s,]+/)" in view_source
    assert "Suffixes forwarded to MosDNS, one per line." in view_source
    assert "Handles the listed Google Play download suffixes separately" in view_source
    assert "Unmatched names use V2Ray DNS." in view_source
    assert "Direct: use Direct DNS and add the answer to the direct nft set." in view_source
    assert "Transparent proxy listener port" in view_source
    assert "Verify proxy connectivity" in view_source
    assert "Connectivity probe port" in view_source
    assert "transparent_proxy_port: String(listenerPort)" in view_source
    assert "probe_enabled: probeEnabled.checked ? '1' : '0'" in view_source
    assert "probe_port: String(healthPort)" in view_source
    assert "const transparentPort = E('input'" in view_source
    assert "const probeEnabled = checkbox" in view_source
    assert "const probePort = E('input'" in view_source
    assert "force-proxy-in" not in ctl_source
    assert "force_proxy4" not in ctl_source
    assert "Direct match: Direct DNS + direct sets." in view_source
    assert "Fallback: V2Ray DNS, no direct sets." in view_source
    assert "E('h4', {}, _('Fixed evaluation order and actions'))" not in view_source
    assert "table([ _('Order'), _('Match group'), _('Fixed action') ]" not in view_source
    assert "mosdnsRulesHelp" in view_source
    assert "mosdns_enabled == '1' && mosdns_domains == ''" in rpc_source
    assert "params: [ 'name', 'url', 'format', 'ipv4_only' ]" in view_source
    assert "const ipv4Only = checkbox" in view_source
    assert "IPv4 only download" in view_source
    assert "Only affects subscription downloads; proxy traffic is unchanged." in view_source
    assert "bypassing the router traffic proxy." in view_source
    assert "ipv4_only = string_arg(request, 'ipv4_only') || '1'" in rpc_source
    assert "ctl([ 'add-source', 'subscription', name, url, format, ipv4_only ])" in rpc_source
    assert "COALESCE(s.ipv4_only, 1)" in ctl_source
    assert "SUBSCRIPTION_DOWNLOADER=" in ctl_source
    assert "start-stop-daemon -S -b -c \"$SUBSCRIPTION_DOWNLOAD_USER:$SUBSCRIPTION_DOWNLOAD_GROUP\"" in ctl_source
    assert "\"$raw_tmp\" \"$error_tmp\" \"$rc_tmp\" \"$ipv4_only\" \"$url\"" in ctl_source
    assert "chown root:root \"$raw_tmp\"" in ctl_source
    downloader_source = (
        FILES / "usr/libexec/v2rayB/v2rayB-subscription-download"
    ).read_text(encoding="utf-8")
    assert "umask 077" in downloader_source
    assert "[ \"$ipv4_only\" = 1 ] && set -- --ipv4 \"$@\"" in downloader_source
    assert "method: 'get_v2ray_config'" in view_source
    assert "method: 'network_probe_start'" in view_source
    assert "method: 'network_probe_status'" in view_source
    assert "method: 'node_probe_start'" in view_source
    assert "method: 'node_probe_status'" in view_source
    assert "callNetworkProbeStatus(started.job_id)" in view_source
    assert "network_probe_start" in rpc_source
    assert "network_probe_status" in rpc_source
    assert "node-probe-start" in ctl_source
    assert "node-probe-status" in ctl_source
    assert "subscription_update_start" in rpc_source
    assert "subscription_update_status" in rpc_source
    assert "network_probe_status" in acl["read"]["ubus"]["luci.v2rayb"]
    assert "network_probe_start" in acl["write"]["ubus"]["luci.v2rayb"]
    assert "substr(url, 0, 7) != 'http://'" in rpc_source
    assert "substr(url, 0, 8) != 'https://'" in rpc_source
    assert "A-Za-z0-9._:[\\]-" not in rpc_source
    assert "network-probe" in ctl_source
    assert "Test a URL from this router" in view_source
    assert "records its actual outbound DNS targets" in view_source
    assert "router-originated TCP proxying is disabled for this profile" in ctl_source
    assert "router-originated curl -> v2rayB OUTPUT redirect" in ctl_source
    assert "rollbackAppliedChange" in rpc_source
    assert "Applied V2Ray configuration" in view_source
    assert "Contains credentials. Do not share." in view_source
    assert "get_v2ray_config" in rpc_source
    assert "logs: {" in rpc_source
    assert "method: 'logs'" in view_source
    assert "logs" in acl["read"]["ubus"]["luci.v2rayb"]
    assert "Logs" in view_source
    assert "DNS Resolution Chain" in view_source
    assert "MosDNS Narrow Route" in view_source
    assert "nftables Direct Sets" in view_source
    assert "Proxy mode only:" not in view_source
    assert "_('Decision')" not in view_source
    assert "proxy-only MosDNS/V2Ray route is inactive" not in view_source
    assert "dnsmasq is the public resolver" not in view_source
    assert "dns_state" in rpc_source
    assert "Array.isArray(error)" in view_source
    assert "rpc.getStatusText(error[0])" in view_source
    assert "expect: { '': {} }, reject: true" in view_source
    assert "args: {\n\t\t\tname: '', protocol: '', server: '', port: '', data_json: ''\n\t\t}" in rpc_source
    assert "function valid_node_fields" in rpc_source
    assert "const muxEnabled = checkbox({}, false);" in view_source
    assert "muxEnabled.checked = !!data.mux && (data.mux.enabled === true || data.mux.enabled === 1);" in view_source
    assert "muxEnabled.checked = !data.mux || data.mux.enabled !== false;" not in view_source
    assert "() => muxEnabled.checked" in view_source
    assert "function valid_profile_policy" in rpc_source
    assert "Invalid Bypass China IP value; expected 0 or 1" in rpc_source
    assert "Invalid Use V2Ray DNS value; expected 0 or 1" in rpc_source
    assert "Invalid Enable MosDNS value; expected 0 or 1" in rpc_source
    assert "get-profile" in (FILES / "usr/libexec/v2rayB/v2rayBctl").read_text(encoding="utf-8")
    for method in (
        "get_node", "get_profile", "update_node", "set_node_enabled", "delete_node",
        "list_sources", "add_source", "update_subscription", "delete_source",
        "update_profile", "set_profile_enabled", "delete_profile",
    ):
        assert f"\n\t{method}: {{" in rpc_source
    assert ".test(" not in rpc_source
    assert ".split(" not in rpc_source
    assert "split(result.output, '\\t')" in rpc_source
    assert "data_json[0]" not in rpc_source
    assert "substr(data_json, 0, 1)" in rpc_source
    assert "substr(data_json, length(data_json) - 1, 1)" in rpc_source
    assert "function reloadPage()" in view_source
    assert "history.replaceState(null, '', '#' + active.dataset.tab)" in view_source
    assert "window.location.hash.replace(/^#/, '')" in view_source
    assert "v2rayb-table .cbi-section-table-cell { text-align: left !important;" in view_source
    assert "value && value.nodeName === 'TD'" in view_source
    assert "class: 'td cbi-section-table-cell nowrap cbi-section-actions'" in view_source
    assert "nowrap cbi-section-actions" in view_source
    assert "Nodes are stored in the v2rayB database." not in view_source
    assert "Editor, checkbox and Delete changes are staged in the page." not in view_source
    assert "A profile selects the node plus" not in view_source
    assert "Status and service control" not in view_source
    assert "Read-only runtime details" not in view_source
    node_modal = view_source[
        view_source.index("function showNodeModal"):
        view_source.index("function showProfileModal")
    ]
    profile_modal = view_source[
        view_source.index("function showProfileModal"):
        view_source.index("return view.extend")
    ]
    assert "callAddNode(" not in node_modal
    assert "callUpdateNode(" not in node_modal
    assert "callAddProfile(" not in profile_modal
    assert "callUpdateProfile(" not in profile_modal
    assert "_('Add to pending changes')" in node_modal
    assert "_('Update pending changes')" in node_modal
    assert "pageView.nextTempId('node')" in view_source
    assert "pageView.nextTempId('profile')" in view_source
    assert "pageView.nodeIdMap[tempId]" in view_source
    assert "pageView.profileIdMap[id]" in view_source
    assert "pageView.resolveNodeId(profile.node_id)" in view_source
    assert "pageView.localNodeDetails[row[0]].enabled = enabled" in view_source
    assert "pageView.localProfileDetails[row[0]].enabled = enabled" in view_source
    assert "showNodeModal(pageView, onNodeSaved)" in view_source
    assert "callGetNode(row[0])" in view_source
    assert "callSetNodeEnabled(row[0], enabled)" in view_source
    assert "callDeleteNode(row[0])" in view_source
    assert "callSetProfileEnabled(pageView.resolveProfileId(row[0]), enabled)" in view_source
    assert "callDeleteProfile(row[0])" in view_source
    assert "class: 'cbi-button cbi-button-add'" in view_source
    assert "refreshNodeTable();" in view_source
    assert "refreshProfileTable();" in view_source
    assert "Default DNS and Transparent Proxy" not in view_source
    assert "Effective Profile Policy" in view_source
    assert "Direct DNS and transparent ports are configured per profile." not in view_source
    assert "callSetSetting('direct_dns', dnsInput.value)" not in view_source
    assert "callSetSetting('transparent_proxy_ports', portsInput.value)" not in view_source
    assert "callGetSetting" not in view_source
    assert "method: 'get_setting'" not in view_source
    assert "\n\tget_setting: {" not in rpc_source
    assert "key != 'service_enabled'" in rpc_source
    assert "setting draft_direct_dns_upstreams" in ctl_source
    assert "Direct DNS upstreams" in view_source
    assert "callSetSetting('direct_dns_upstreams', this.directDnsDesired)" in view_source
    assert "directDnsInput.addEventListener('input'" in view_source
    assert "configuredDirectDnsUpstreams" in view_source
    assert "const watchdogEnabled = checkbox" in view_source
    assert "field(_('Enable watchdog'), E('div'" in view_source
    assert "连续 3 次探测失败后停止代理并撤销接管；恢复后需手动重试。" in view_source
    assert "callSetSetting('watchdog_enabled', this.watchdogEnabledDesired ? '1' : '0')" in view_source
    assert "field(_('Proxy engine'), profileEngine" in view_source
    assert "const profileEngine = E('select'" in view_source
    assert "profile.probe_port, profile.engine" in view_source
    assert "engine: fields.engine || 'v2ray'" in rpc_source
    assert "callSetSetting('active_engine'" not in view_source
    assert "get-active-engine" in ctl_source
    assert "engine=$(sql_quote \"$engine\")" in ctl_source
    assert "XRAY_BIN=" in init_source
    assert 'XRAY_LOCATION_ASSET=/usr/share/v2ray' in init_source
    assert "run -test -c" in ctl_source
    assert "+xray-core" in makefile_source
    assert "/etc/init.d/xray disable" in makefile_source
    assert "/etc/init.d/v2ray disable" in makefile_source
    assert "this.watchdogEnabledDirty" in view_source
    assert "key != 'watchdog_enabled'" in rpc_source
    assert "setting draft_watchdog_enabled" in ctl_source
    assert "UPDATE settings SET value=COALESCE((SELECT value FROM settings WHERE key='draft_watchdog_enabled'),value)" in ctl_source
    assert "key != 'service_enabled' && key != 'direct_dns_upstreams'" in rpc_source
    assert "setting draft_transparent_proxy_ports" not in ctl_source
    assert "printf 'transparent_proxy_ports=%s\\n'" not in ctl_source
    assert "DELETE FROM settings WHERE key IN ('direct_dns','transparent_proxy_ports','draft_direct_dns','draft_transparent_proxy_ports')" in ctl_source
    assert "Profile name" not in view_source[view_source.index('function showNodeModal'):view_source.index('function showProfileModal')]
    for method in methods:
        assert f"\n\t{method}: {{" in rpc_source
    makefile_source = (ROOT / "Makefile").read_text(encoding="utf-8")
    assert "+coreutils-base64" in makefile_source
    assert "/etc/init.d/v2rayB enable" in makefile_source
    assert "/etc/init.d/v2rayB start" in makefile_source
    assert "v2rayBctl get-setting service_enabled" not in makefile_source
    assert "service_enabled=\"$$(/usr/libexec/v2rayB/v2rayBctl status" in makefile_source
    assert "luci-compat" not in makefile_source
    assert not (FILES / "usr/lib/lua/luci/controller/v2rayB.lua").exists()
    assert not (FILES / "usr/lib/lua/luci/view/v2rayB/overview.htm").exists()

    print("modern LuCI package tests: ok")


if __name__ == "__main__":
    main()
