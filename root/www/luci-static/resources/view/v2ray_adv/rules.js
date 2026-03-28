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

		// --- Rules Grid ---
		s = m.section(form.GridSection, 'rule', _('Rules'));
		s.addremove = true;
		s.anonymous = true;
		s.sortable = true;

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(form.Value, 'alias', _('Alias'));
		o.placeholder = 'Google Domains';

		o = s.option(form.DynamicList, 'domain', _('Domain List'));
		o.placeholder = 'google.com';

		o = s.option(form.DynamicList, 'ip', _('IP List'));
		o.placeholder = '8.8.8.8';

		o = s.option(form.ListValue, 'server', _('Target Server'));

		// Load servers from UCI
		for (var i = 0; i < sections.length; i++) {
			var sid = sections[i]['.name'];
			var alias = sections[i].alias || sid;
			o.value(sid, alias);
		}
		o.value('direct', _('Direct (Bypass)'));
		o.value('block', _('Block'));

		return m.render();
	}
});
