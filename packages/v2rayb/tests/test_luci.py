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
    assert "set_service_enabled" not in view_source
    assert "callSetSetting('service_enabled'" in view_source
    assert "pageView.serviceEnabledDirty" in view_source
    assert "Enable v2rayB" in view_source
    assert "standard Save, Save & Apply and Reset workflow" in view_source
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
    assert "Draft version %s is saved. Use Save & Apply" in view_source
    assert "Apply changes" not in view_source
    assert "Revert changes" not in view_source
    assert "addFooter() {" not in view_source
    assert "draft_pending === '1'" in view_source
    assert "status.applied_config_version" in view_source
    assert "status.draft_config_version" in view_source
    assert "Pending draft version" in view_source
    assert "Use the standard Save & Apply or Reset footer actions." in view_source
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
    assert "One domain suffix per line." in view_source
    assert "Domains and rules remain saved but inactive." in view_source
    assert "Fixed evaluation order and actions" in view_source
    assert "write force_proxy4/force_proxy6/force_proxy" in view_source
    assert "write direct4/direct6" in view_source
    assert "do not write the direct sets" in view_source
    assert "E('h4', {}, _('Fixed evaluation order and actions'))" not in view_source
    assert "table([ _('Order'), _('Match group'), _('Fixed action') ]" not in view_source
    assert "mosdnsRulesHelp" in view_source
    assert "mosdns_enabled == '1' && mosdns_domains == ''" in rpc_source
    assert "method: 'get_v2ray_config'" in view_source
    assert "Applied V2Ray configuration" in view_source
    assert "contains node UUIDs or passwords" in view_source
    assert "get_v2ray_config" in rpc_source
    assert "DNS Resolution Chain" in view_source
    assert "MosDNS Narrow Route" in view_source
    assert "nftables Direct Sets" in view_source
    assert "Proxy mode only:" in view_source
    assert "proxy-only MosDNS/V2Ray route is inactive" in view_source
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
    assert "showNodeModal(pageView, onNodeSaved)" in view_source
    assert "callGetNode(row[0])" in view_source
    assert "callSetNodeEnabled(row[0], enabled)" in view_source
    assert "callDeleteNode(row[0])" in view_source
    assert "callSetProfileEnabled(row[0], enabled)" in view_source
    assert "callDeleteProfile(row[0])" in view_source
    assert "class: 'cbi-button cbi-button-add'" in view_source
    assert "refreshNodeTable();" in view_source
    assert "refreshProfileTable();" in view_source
    assert "notify(result, _('Direct DNS saved.'))" in view_source
    assert "notify(result, _('Proxy ports saved.'))" in view_source
    assert "Profile name" not in view_source[view_source.index('function showNodeModal'):view_source.index('function showProfileModal')]
    for method in methods:
        assert f"\n\t{method}: {{" in rpc_source
    assert "luci-compat" not in (ROOT / "Makefile").read_text(encoding="utf-8")
    assert not (FILES / "usr/lib/lua/luci/controller/v2rayB.lua").exists()
    assert not (FILES / "usr/lib/lua/luci/view/v2rayB/overview.htm").exists()

    print("modern LuCI package tests: ok")


if __name__ == "__main__":
    main()
