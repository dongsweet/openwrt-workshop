'use strict'; 'require view'; 'require form'; 'require uci';

return view.extend({
	render: function () {
		var m, s, o;

		m = new form.Map('v2ray_adv', _('Inbound Management'),
			_('Configure V2Ray inbound services for local and external access.'));

		s = m.section(form.GridSection, 'inbound', _('Inbound Services'));
		s.anonymous = true;
		s.addremove = true;
		s.sortable = true;

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(form.Value, 'alias', _('Alias'), _('Descriptive name for this inbound.'));
		o.rmempty = false;

		o = s.option(form.ListValue, 'protocol', _('Protocol'));
		o.value('dokodemo-door', 'Dokodemo-door (Transparent Proxy)');
		o.value('vmess', 'VMess (Service)');
		o.value('shadowsocks', 'Shadowsocks');
		o.value('socks', 'SOCKS');
		o.value('http', 'HTTP');
		o.default = 'dokodemo-door';

		o = s.option(form.Value, 'port', _('Listen Port'));
		o.datatype = 'port';
		o.rmempty = false;

		o = s.option(form.Value, 'listen', _('Listen Address'));
		o.datatype = 'ipaddr';
		o.default = '0.0.0.0';
		o.placeholder = '0.0.0.0';

		// VMess specific options
		o = s.option(form.Value, 'uuid', _('UUID/Password'));
		o.depends('protocol', 'vmess');
		o.depends('protocol', 'shadowsocks');
		o.rmempty = true;

		o = s.option(form.ListValue, 'vmess_security', _('VMess Security'));
		o.depends('protocol', 'vmess');
		o.value('auto', 'Auto');
		o.value('aes-128-gcm', 'AES-128-GCM');
		o.value('chacha20-poly1305', 'Chacha20-Poly1305');
		o.value('none', 'None');
		o.default = 'auto';

		// Dokodemo-door specific options
		o = s.option(form.Flag, 'follow_redirect', _('Follow Redirect'));
		o.depends('protocol', 'dokodemo-door');
		o.default = '1';

		o = s.option(form.Flag, 'u_tproxy', _('Use TProxy'));
		o.depends('protocol', 'dokodemo-door');
		o.default = '1';

		return m.render();
	}
});
