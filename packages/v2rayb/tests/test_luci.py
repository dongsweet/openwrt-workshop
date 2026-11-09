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
    assert "function buildOutbound" in view_source
    assert "E('textarea'" not in view_source
    assert "params: [ 'name', 'protocol', 'server', 'port', 'data_json' ]" in view_source
    assert "method: 'add_profile'" in view_source
    assert "Array.isArray(error)" in view_source
    assert "rpc.getStatusText(error[0])" in view_source
    assert "expect: { '': {} }, reject: true" in view_source
    assert "args: {\n\t\t\tname: '', protocol: '', server: '', port: '', data_json: ''\n\t\t}" in rpc_source
    assert ".test(" not in rpc_source
    assert "Profile name" not in view_source[view_source.index('function showNodeModal'):view_source.index('return view.extend')]
    for method in methods:
        assert f"\n\t{method}: {{" in rpc_source
    assert "luci-compat" not in (ROOT / "Makefile").read_text(encoding="utf-8")
    assert not (FILES / "usr/lib/lua/luci/controller/v2rayB.lua").exists()
    assert not (FILES / "usr/lib/lua/luci/view/v2rayB/overview.htm").exists()

    print("modern LuCI package tests: ok")


if __name__ == "__main__":
    main()
