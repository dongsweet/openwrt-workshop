#!/usr/bin/env python3

import pathlib
import re


ROOT = pathlib.Path(__file__).resolve().parents[1]
RULES = ROOT / "files" / "etc" / "v2rayB" / "rules"


def main():
    direct = (RULES / "direct_domains.txt").read_text(encoding="utf-8").splitlines()
    regexes = [line.removeprefix("regexp:") for line in direct if line.startswith("regexp:")]
    assert len(regexes) == 1
    assert not any(line.startswith(("domain:", "full:")) for line in direct)
    pattern = re.compile(regexes[0])

    assert pattern.fullmatch("r+123---sn-2x3abcde.xn--ngstr-lra8j.com")
    assert pattern.fullmatch("r+9.sn-ni5abc_1.xn--ngstr-lra8j.com")
    assert not pattern.fullmatch("sn-2x3abcde.xn--ngstr-lra8j.com")
    assert not pattern.fullmatch("cdn.xn--ngstr-lra8j.com")

    force_proxy = (RULES / "force_proxy_domains.txt").read_text(encoding="utf-8")
    assert "services.googleapis.cn" not in force_proxy
    assert "xn--ngstr-lra8j.com" not in force_proxy

    init_script = (ROOT / "files" / "etc" / "init.d" / "v2rayB").read_text(
        encoding="utf-8"
    )
    assert "write_mosdns_forward_expected" in init_script
    assert "server=/%s/%s" in init_script
    assert 'default_upstream="$(dns_policy_value dnsmasq_default)"' in init_script
    assert "mosdns_enabled" in init_script
    assert "start_mosdns" in init_script

    print("domain rule tests: ok")


if __name__ == "__main__":
    main()
