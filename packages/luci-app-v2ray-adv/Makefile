include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-v2ray-adv
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

PKG_MAINTAINER:=Antigravity AI
PKG_LICENSE:=Apache-2.0

LUCI_TITLE:=LuCI support for V2Ray Advanced
LUCI_DEPENDS:=+iptables-mod-nat-extra +iptables-mod-tproxy +kmod-ipt-tproxy
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

define Package/luci-app-v2ray-adv/conffiles
/etc/config/v2ray_adv
endef

# call BuildPackage - OpenWrt buildroot signature
define Package/luci-app-v2ray-adv/install
	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DATA) ./root/usr/share/luci/menu.d/luci-app-v2ray-adv.json $(1)/usr/share/luci/menu.d/
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DATA) ./root/usr/share/rpcd/acl.d/luci-app-v2ray-adv.json $(1)/usr/share/rpcd/acl.d/
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) ./root/etc/config/v2ray_adv $(1)/etc/config/
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./root/etc/init.d/v2ray_adv $(1)/etc/init.d/
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/v2ray_adv
	$(INSTALL_DATA) ./root/www/luci-static/resources/view/v2ray_adv/*.js $(1)/www/luci-static/resources/view/v2ray_adv/
	$(INSTALL_DIR) $(1)/usr/libexec
	$(INSTALL_BIN) ./root/usr/libexec/v2ray-adv-config $(1)/usr/libexec/
	$(INSTALL_BIN) ./root/usr/libexec/v2ray-adv-update $(1)/usr/libexec/
	$(INSTALL_BIN) ./root/usr/libexec/v2ray-adv-check $(1)/usr/libexec/
endef
