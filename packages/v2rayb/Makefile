include $(TOPDIR)/rules.mk

PKG_NAME:=v2rayb
PKG_VERSION:=0.1.0
PKG_RELEASE:=72
PKG_MAINTAINER:=local
PKG_LICENSE:=MIT
PKGARCH:=all

include $(INCLUDE_DIR)/package.mk

define Build/Compile
	true
endef

define Package/v2rayb
  SECTION:=net
  CATEGORY:=Network
  TITLE:=v2rayB unified proxy control plane
  DEPENDS:=+sqlite3-cli +v2ray-core +v2ray-geoip +mosdns +nftables-json +bind-dig +curl
endef

define Package/v2rayb/description
  Database-backed V2Ray lifecycle manager with dnsmasq as the primary resolver and a narrow MosDNS Google Play branch.
endef

define Package/v2rayb/conffiles
/etc/v2rayB/rules/direct_domains.txt
/etc/v2rayB/rules/force_proxy_domains.txt
/etc/v2rayB/rules/direct_ipv4.txt
/etc/v2rayB/rules/direct_ipv6.txt
endef

define Package/v2rayb/install
	$(INSTALL_DIR) $(1)/etc/v2rayB/rules
	$(INSTALL_DATA) ./files/etc/v2rayB/schema.sql $(1)/etc/v2rayB/
	$(INSTALL_DATA) ./files/etc/v2rayB/rules/*.txt $(1)/etc/v2rayB/rules/
	$(INSTALL_DIR) $(1)/usr/libexec/v2rayB
	$(INSTALL_BIN) ./files/usr/libexec/v2rayB/v2rayBctl $(1)/usr/libexec/v2rayB/
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) ./files/usr/bin/v2rayB-watchdog $(1)/usr/bin/
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/etc/init.d/v2rayB $(1)/etc/init.d/
endef

define Package/v2rayb/postinst
#!/bin/sh
[ -n "$$IPKG_INSTROOT" ] || {
	/usr/libexec/v2rayB/v2rayBctl init-db >/dev/null 2>&1 || exit 1
	service_enabled="$$(/usr/libexec/v2rayB/v2rayBctl status 2>/dev/null | sed -n 's/^service_enabled=//p' | head -n1)"
	if [ "$$service_enabled" = 1 ]; then
		/etc/init.d/v2rayB enable >/dev/null 2>&1 || exit 1
		/etc/init.d/v2rayB start >/dev/null 2>&1 || exit 1
	else
		/etc/init.d/v2rayB disable >/dev/null 2>&1 || true
	fi
}
exit 0
endef

define Package/v2rayb/prerm
#!/bin/sh
[ -n "$$IPKG_INSTROOT" ] || /etc/init.d/v2rayB stop >/dev/null 2>&1 || exit 1
exit 0
endef

define Package/luci-app-v2rayb
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=Applications
  TITLE:=LuCI support for v2rayB
  DEPENDS:=+v2rayb +luci-base +rpcd-mod-ucode
endef

define Package/luci-app-v2rayb/description
  JavaScript LuCI control and node/profile configuration for v2rayB.
endef

define Package/luci-app-v2rayb/install
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/v2rayB
	$(INSTALL_DATA) ./files/www/luci-static/resources/view/v2rayB/overview.js $(1)/www/luci-static/resources/view/v2rayB/
	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DATA) ./files/usr/share/luci/menu.d/luci-app-v2rayb.json $(1)/usr/share/luci/menu.d/
	$(INSTALL_DIR) $(1)/usr/share/rpcd/ucode
	$(INSTALL_BIN) ./files/usr/share/rpcd/ucode/luci.v2rayb $(1)/usr/share/rpcd/ucode/
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DATA) ./files/usr/share/rpcd/acl.d/luci-app-v2rayb.json $(1)/usr/share/rpcd/acl.d/
endef

define Package/luci-app-v2rayb/postinst
#!/bin/sh
[ -n "$$IPKG_INSTROOT" ] || /etc/init.d/rpcd restart >/dev/null 2>&1
exit 0
endef

$(eval $(call BuildPackage,v2rayb))
$(eval $(call BuildPackage,luci-app-v2rayb))
