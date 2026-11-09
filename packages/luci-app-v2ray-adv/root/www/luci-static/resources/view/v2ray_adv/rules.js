'use strict'; 'require view'; 'require form'; 'require uci'; 'require ui';

return view.extend({
	load: function () {
		return uci.load('v2ray_adv');
	},

	render: function (data) {
		var m, s, o;

		m = new form.Map('v2ray_adv', _('Routing Rules'),
			_('Define rules to route traffic to specific servers. Rules are evaluated in order; unmatched traffic goes to the Default Outbound.'));

		// --- Default Outbound Section ---
		s = m.section(form.NamedSection, 'routing', 'routing', _('Default Outbound'));
		s.anonymous = true;

		o = s.option(form.ListValue, 'default_server', _('Default Outbound Server'),
			_('All traffic not matching any rule below will be sent to this server.'));

		var sections = uci.sections('v2ray_adv', 'server');
		for (var i = 0; i < sections.length; i++) {
			var sid = sections[i]['.name'];
			var alias = sections[i].alias || sid;
			o.value(sid, alias);
		}
		o.value('direct', _('Direct (Bypass)'));

		// --- Rules TypedSection ---
		s = m.section(form.TypedSection, 'rule', _('Rules'));
		s.addremove = true;
		s.anonymous = true;
		s.sortable = true;

		s.tab('general', _('General Settings'));
		s.tab('domain', _('Domain Match'));
		s.tab('ip', _('IP Match'));

		o = s.taboption('general', form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;
		o.default = '1';

		o = s.taboption('general', form.Value, 'alias', _('Alias'));
		o.placeholder = 'e.g., Target Google';

		o = s.taboption('general', form.ListValue, 'server', _('Target Server'));
		// Load servers from UCI
		for (var i = 0; i < sections.length; i++) {
			var sid = sections[i]['.name'];
			var alias = sections[i].alias || sid;
			o.value(sid, alias);
		}
		o.value('direct', _('Direct (Bypass)'));
		o.value('block', _('Block'));

		// Domain definitions
		o = s.taboption('domain', form.DynamicList, 'geosite', _('Geosite Categories'), _('Select predefined geosite categories to match.'));
		o.value('cn', 'China Domains (cn)');
		o.value('geolocation-!cn', 'Non-China Domains (geolocation-!cn)');
		o.value('google', 'Google');
		o.value('youtube', 'YouTube');
		o.value('telegram', 'Telegram');
		o.value('netflix', 'Netflix');
		o.value('apple', 'Apple');
		o.value('github', 'GitHub');
		o.value('microsoft', 'Microsoft');

		o = s.taboption('domain', form.DynamicList, 'domain', _('Custom Domains'), _('Manually specify domains (e.g., <code>google.com</code>, <code>domain:netflix.com</code>, <code>full:www.baidu.com</code>)'));

		// IP definitions
		o = s.taboption('ip', form.DynamicList, 'geoip', _('GeoIP Categories'), _('Select predefined geoip categories to match.'));
		o.value('cn', 'China IPs (cn)');
		o.value('private', 'Private LAN IPs (private)');
		o.value('google', 'Google');
		o.value('telegram', 'Telegram');
		o.value('netflix', 'Netflix');

		o = s.taboption('ip', form.DynamicList, 'ip', _('Custom IPs'), _('Manually specify IPs or CIDRs (e.g., <code>8.8.8.8</code>, <code>192.168.0.0/16</code>)'));

		return m.render();
	}
});
