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
    assert "function isEnabled(value)" in view_source
    assert "profileAddButton.disabled = !enabled;" in view_source
    assert "disabled: !nodes.some" not in view_source
    assert "function buildOutbound" in view_source
    assert "E('textarea'" not in view_source
    assert "params: [ 'name', 'protocol', 'server', 'port', 'data_json' ]" in view_source
    assert "method: 'add_profile'" in view_source
    assert "direct_dns', 'transparent_proxy_ports', 'bypass_china'" in view_source
    assert "Profile policy" in view_source
    assert "profilePolicyText(row)" in view_source
    assert "Array.isArray(error)" in view_source
    assert "rpc.getStatusText(error[0])" in view_source
    assert "expect: { '': {} }, reject: true" in view_source
    assert "args: {\n\t\t\tname: '', protocol: '', server: '', port: '', data_json: ''\n\t\t}" in rpc_source
    assert "function valid_node_fields" in rpc_source
    assert "function valid_profile_policy" in rpc_source
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
