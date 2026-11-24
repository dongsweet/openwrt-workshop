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

    assert pattern.fullmatch("rr1---sn-j5o7dn7l.xn--ngstr-lra8j.com")
    assert pattern.fullmatch("rr9.sn-ni5abc_1.xn--ngstr-lra8j.com")
    assert not pattern.fullmatch("r+123---sn-2x3abcde.xn--ngstr-lra8j.com")
    assert not pattern.fullmatch("sn-2x3abcde.xn--ngstr-lra8j.com")
    assert not pattern.fullmatch("cdn.xn--ngstr-lra8j.com")

    init_script = (ROOT / "files" / "etc" / "init.d" / "v2rayB").read_text(
        encoding="utf-8"
    )
    ctl_script = (ROOT / "files" / "usr" / "libexec" / "v2rayB" / "v2rayBctl").read_text(
        encoding="utf-8"
    )
    assert "force_proxy4" in ctl_script
    assert "force-proxy-in" not in ctl_script
    assert "force_proxy_seq" not in ctl_script
    assert "remove_legacy_force_proxy_rule()" in init_script
    assert 'nftset=/services.googleapis.cn/4#inet#v2rayB#force_proxy' in init_script
    assert "write_mosdns_forward_expected" in init_script
    assert "server=/%s/%s" in init_script
    assert "SUBSCRIPTION_DNS_FILE=" in init_script
    assert "write_subscription_dns_expected()" in init_script
    assert "write_force_proxy_dns_expected()" in init_script
    assert "FORCE_PROXY_DNS_FILE=" in init_script
    assert "nftset=/%s/4#inet#v2rayB#force_proxy4" in init_script
    assert "nftset=/%s/4#inet#v2rayB#pass" in init_script
    assert "nftset=/%s/6#inet#v2rayB#pass6" in init_script
    assert "write_dns_domain_rules \"$bootstrap_domain\" \"$direct_dns\"" in init_script
    assert '_direct_dns_value="$(dns_policy_value direct_dns_upstreams)"' in init_script
    assert "subscription_domains" in init_script
    assert "subscription_hosts()" in ctl_script
    assert "sub(/^[A-Za-z][A-Za-z0-9+.-]*:\\/\\//" in ctl_script
    assert 'default_upstream="$(dns_policy_value dnsmasq_default)"' in init_script
    assert "mosdns_enabled" in init_script
    assert "start_mosdns" in init_script

    print("domain rule tests: ok")


if __name__ == "__main__":
    main()
