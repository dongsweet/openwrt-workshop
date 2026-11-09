'use strict'; 'require view'; 'require form'; 'require uci'; 'require ui';

return view.extend({
	render: function () {
		var m, s, o;

		m = new form.Map('v2ray_adv', _('Servers'),
			_('Manage your V2Ray servers. Only essential info is shown in the list; click on a server to edit full details.'));

		s = m.section(form.GridSection, 'server', _('Server List'));
		s.addremove = true;
		s.anonymous = true;
		s.sortable = true;

		// --- Grid Columns (Visible in List) ---
		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;
		o.width = '5%';

		o = s.option(form.Value, 'alias', _('Alias'));
		o.placeholder = 'My Server';

		o = s.option(form.ListValue, 'protocol', _('Protocol'));
		o.value('vless', 'VLESS');
		o.value('vmess', 'VMess');
		o.value('shadowsocks', 'SS');
		o.value('trojan', 'Trojan');
		o.default = 'vless';

		o = s.option(form.Value, 'address', _('Address'));
		o.datatype = 'host';

		o = s.option(form.Value, 'port', _('Port'));
		o.datatype = 'port';
		o.default = '443';

		o = s.option(form.ListValue, 'transport', _('Transport'));
		o.value('tcp', 'TCP');
		o.value('ws', 'WS');
		o.value('h2', 'H2');
		o.value('grpc', 'gRPC');
		o.default = 'tcp';

		o = s.option(form.ListValue, 'security', _('Security'));
		o.value('none', _('none'));
		o.value('tls', 'TLS');
		o.value('reality', 'REALITY');
		o.default = 'none';

		// --- Modal Only Fields (Advanced Settings) ---
		
		// Auth
		o = s.option(form.Value, 'uuid', _('UUID / Password'));
		o.password = true;
		o.modalonly = true;

		o = s.option(form.ListValue, 'flow', _('Flow'));
		o.depends('protocol', 'vless');
		o.value('', _('none'));
		o.value('xtls-rprx-vision', 'xtls-rprx-vision');
		o.modalonly = true;

		// Security Detail
		o = s.option(form.Value, 'sni', _('SNI'));
		o.depends('security', 'tls');
		o.depends('security', 'reality');
		o.modalonly = true;

		o = s.option(form.DynamicList, 'alpn', _('Alpn'));
		o.depends('security', 'tls');
		o.depends('security', 'reality');
		o.value('h2');
		o.value('http/1.1');
		o.modalonly = true;

		o = s.option(form.Flag, 'insecure', _('Allow Insecure (skip cert)'));
		o.depends('security', 'tls');
		o.modalonly = true;

		// REALITY specific
		o = s.option(form.ListValue, 'fingerprint', _('Fingerprint'));
		o.depends('security', 'reality');
		o.value('chrome', 'Chrome');
		o.value('firefox', 'Firefox');
		o.value('safari', 'Safari');
		o.value('edge', 'Edge');
		o.value('android', 'Android');
		o.value('ios', 'iOS');
		o.default = 'chrome';
		o.modalonly = true;

		o = s.option(form.Value, 'public_key', _('Public Key'));
		o.depends('security', 'reality');
		o.modalonly = true;

		o = s.option(form.Value, 'short_id', _('Short ID'));
		o.depends('security', 'reality');
		o.modalonly = true;

		o = s.option(form.Value, 'spider_x', _('SpiderX'));
		o.depends('security', 'reality');
		o.modalonly = true;

		// Transport Detail
		// TCP
		o = s.option(form.ListValue, 'tcp_guise', _('TCP Guise (Type)'));
		o.depends('transport', 'tcp');
		o.value('none', _('none'));
		o.value('http', 'http');
		o.modalonly = true;

		o = s.option(form.DynamicList, 'http_host', _('HTTP Host'));
		o.depends('tcp_guise', 'http');
		o.modalonly = true;

		o = s.option(form.Value, 'http_path', _('HTTP Path'));
		o.depends('tcp_guise', 'http');
		o.default = '/';
		o.modalonly = true;

		// WS
		o = s.option(form.Value, 'ws_host', _('WS Host'));
		o.depends('transport', 'ws');
		o.modalonly = true;

		o = s.option(form.Value, 'ws_path', _('WS Path'));
		o.depends('transport', 'ws');
		o.default = '/';
		o.modalonly = true;

		// H2
		o = s.option(form.Value, 'h2_host', _('H2 Host'));
		o.depends('transport', 'h2');
		o.modalonly = true;

		o = s.option(form.Value, 'h2_path', _('H2 Path'));
		o.depends('transport', 'h2');
		o.default = '/';
		o.modalonly = true;

		// gRPC
		o = s.option(form.Value, 'grpc_service_name', _('gRPC Service Name'));
		o.depends('transport', 'grpc');
		o.modalonly = true;

		return m.render();
	}
});
