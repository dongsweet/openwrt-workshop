#!/usr/bin/env python3

import json
import pathlib


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
    assert "function checkbox(attributes, checked)" in view_source
    assert "input.checked = checked === true" in view_source
    assert "checked: configuredServiceEnabled" not in view_source
    assert "checked: isEnabled(enabled)" not in view_source
    assert "selected: existing && existing.node_id" not in view_source
    assert "option.selected = !!existing && option.value === existing.node_id" in view_source
    assert "set_service_enabled" not in view_source
    assert "callSetSetting('service_enabled'" in view_source
    assert "pageView.serviceEnabledDirty" in view_source
    assert "pageView.pendingOperations" in view_source
    assert "queuePendingOperation(() => callSetNodeEnabled" in view_source
    assert "queuePendingOperation(() => callSetProfileEnabled" in view_source
    assert "queuePendingOperation(() => callSelectProfile" not in view_source
    assert "queuePendingOperation(() => callDeleteNode" in view_source
    assert "queuePendingOperation(() => callDeleteProfile" in view_source
    assert "field(_('Profile to activate'), activeProfileSelect" in view_source
    assert "card(_('Applied profile')" in view_source
    assert "activeProfileRows = parseRows(outputOf(data[5]))" not in view_source
    assert "appliedProfileRows = parseRows(outputOf(data[5]))" in view_source
    assert "const activeProfileRow = appliedProfileRows[0] || null" in view_source
    assert "method: 'get_applied_profile'" in view_source
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
    assert "was_proxy ? 'restart' : 'start'" in rpc_source
    assert "run(init_path, [ 'stop' ])" in rpc_source
    assert "method: 'apply_draft'" in view_source
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
    assert "method: 'add_profile'" in view_source
    assert "direct_dns', 'transparent_proxy_ports', 'bypass_china'" in view_source
    assert "Profile policy" in view_source
    assert "8080-8443" in view_source
    assert "profilePolicyText(row)" in view_source
    assert "method: 'dns_state'" in view_source
    assert "Use V2Ray DNS as dnsmasq default" in view_source
    assert "Enable MosDNS branch" in view_source
    assert "MosDNS domains" in view_source
    assert "MosDNS match rules" in view_source
    assert "mosdnsDomains.disabled = !enabled;" in view_source
    assert "mosdnsRules.disabled = !enabled;" in view_source
    assert "class: 'cbi-input-text v2rayb-form-wide'" in view_source
    assert "class: 'cbi-value-description'" in view_source
    assert "help ? E('div', { class: 'v2rayb-help' }" not in view_source
    assert "mosdnsDomains.value.split(/[\\s,]+/)" in view_source
    assert "One suffix per line." in view_source
    assert "Disabled: domains and rules are inactive but retained." in view_source
    assert "Force-proxy: V2Ray DNS + force_proxy sets." in view_source
    assert "Direct match: Direct DNS + direct sets." in view_source
    assert "Fallback: V2Ray DNS, no direct sets." in view_source
    assert "E('h4', {}, _('Fixed evaluation order and actions'))" not in view_source
    assert "table([ _('Order'), _('Match group'), _('Fixed action') ]" not in view_source
    assert "mosdnsRulesHelp" in view_source
    assert "mosdns_enabled == '1' && mosdns_domains == ''" in rpc_source
    assert "method: 'get_v2ray_config'" in view_source
    assert "Applied V2Ray configuration" in view_source
    assert "Contains credentials. Do not share." in view_source
    assert "get_v2ray_config" in rpc_source
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
    assert "function valid_profile_policy" in rpc_source
    assert "Invalid Bypass China IP value; expected 0 or 1" in rpc_source
    assert "Invalid Use V2Ray DNS value; expected 0 or 1" in rpc_source
    assert "Invalid Enable MosDNS value; expected 0 or 1" in rpc_source
    assert "get-profile" in (FILES / "usr/libexec/v2rayB/v2rayBctl").read_text(encoding="utf-8")
    for method in (
        "get_node", "get_profile", "update_node", "set_node_enabled", "delete_node",
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
    assert "setting draft_direct_dns" not in ctl_source
    assert "setting draft_transparent_proxy_ports" not in ctl_source
    assert "printf 'transparent_proxy_ports=%s\\n'" not in ctl_source
    assert "DELETE FROM settings WHERE key IN ('direct_dns','transparent_proxy_ports','draft_direct_dns','draft_transparent_proxy_ports')" in ctl_source
    assert "Profile name" not in view_source[view_source.index('function showNodeModal'):view_source.index('function showProfileModal')]
    for method in methods:
        assert f"\n\t{method}: {{" in rpc_source
    assert "luci-compat" not in (ROOT / "Makefile").read_text(encoding="utf-8")
    assert not (FILES / "usr/lib/lua/luci/controller/v2rayB.lua").exists()
    assert not (FILES / "usr/lib/lua/luci/view/v2rayB/overview.htm").exists()

    print("modern LuCI package tests: ok")


if __name__ == "__main__":
    main()
