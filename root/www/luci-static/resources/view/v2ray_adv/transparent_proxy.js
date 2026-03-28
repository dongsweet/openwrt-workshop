'use strict'; 'require view'; 'require form'; 'require uci'; 'require ui';

return view.extend({
	load: function () {
		return uci.load('v2ray_adv');
	},

	render: function () {
		var m, s, o;

		m = new form.Map('v2ray_adv', _('Transparent Proxy'),
			_('Configure transparent proxy firewall rules and IP bypass lists. The selected Dokodemo-door inbound determines which port iptables redirects traffic to.'));

		// --- Detect dokodemo-door inbounds ---
		var inbounds = uci.sections('v2ray_adv', 'inbound');
		var doko_inbounds = [];
		for (var i = 0; i < inbounds.length; i++) {
			if (inbounds[i].protocol === 'dokodemo-door') {
				doko_inbounds.push(inbounds[i]);
			}
		}

		s = m.section(form.NamedSection, 'tproxy', 'transparent_proxy', _('Proxy Settings'));
		s.anonymous = true;
		s.addremove = false;

		// --- Warning if no dokodemo-door inbound ---
		if (doko_inbounds.length === 0) {
			o = s.option(form.DummyValue, '_no_inbound_warning');
			o.rawhtml = true;
			o.cfgvalue = function () {
				return E('div', { 'class': 'alert-message warning' }, [
					E('b', {}, [_('No Dokodemo-door Inbound Found!')]),
					E('br'),
					_('You need to create a Dokodemo-door inbound in '),
					E('a', { 'href': L.url('admin/services/v2ray_adv/inbounds') }, [_('Inbound Management')]),
					_(' before transparent proxy can work.')
				]);
			};
		}

		// --- Inbound selection ---
		o = s.option(form.ListValue, 'inbound', _('Proxy Inbound'),
			_('Select which Dokodemo-door inbound to use for transparent proxy firewall rules.'));
		o.value('', _('-- Disabled (no transparent proxy) --'));
		for (var i = 0; i < doko_inbounds.length; i++) {
			var sec = doko_inbounds[i];
			var sid = sec['.name'];
			var alias = sec.alias || sid;
			var port = sec.port || '?';
			var status = sec.enabled === '1' ? '✓' : '✗';
			o.value(sid, status + ' ' + alias + ' (:' + port + ')');
		}
		if (doko_inbounds.length === 1) {
			o.default = doko_inbounds[0]['.name'];
		}

		// --- Selected inbound info (read-only) ---
		o = s.option(form.DummyValue, '_inbound_info', _('Selected Inbound Details'));
		o.rawhtml = true;
		o.cfgvalue = function (section_id) {
			var selected = uci.get('v2ray_adv', 'tproxy', 'inbound');
			if (!selected) {
				return E('em', {}, [_('No inbound selected. Transparent proxy firewall rules will not be created.')]);
			}
			var sec = uci.get('v2ray_adv', selected);
			if (!sec) {
				return E('em', { 'style': 'color:red;' }, [_('Selected inbound "%s" not found!').format(selected)]);
			}
			var port = uci.get('v2ray_adv', selected, 'port') || '?';
			var tproxy = uci.get('v2ray_adv', selected, 'u_tproxy') === '1';
			var enabled = uci.get('v2ray_adv', selected, 'enabled') === '1';
			var alias = uci.get('v2ray_adv', selected, 'alias') || selected;

			var items = [
				E('strong', {}, [alias]),
				E('br'),
				_('Port: '), E('code', {}, [port]),
				' | ',
				_('TProxy: '), E('code', {}, [tproxy ? _('Yes') : _('No')]),
				' | ',
				_('Enabled: '), E('code', {}, [enabled ? _('Yes') : _('No')])
			];

			if (!enabled) {
				items.push(E('br'));
				items.push(E('span', { 'style': 'color:orange;' },
					[_('⚠ This inbound is currently disabled. Firewall rules will not be created.')]));
			}

			return E('div', { 'style': 'padding:8px; background:#f9f9f9; border:1px solid #ddd; border-radius:4px;' }, items);
		};

		// --- Bypass China ---
		o = s.option(form.Flag, 'bypass_china', _('Bypass China'),
			_('Bypass China IPs and domains automatically. Uses geoip:cn ipset and geosite:cn routing rules.'));
		o.default = '1';
		o.rmempty = false;

		// --- Proxy Ports ---
		o = s.option(form.Value, 'proxy_ports', _('Proxy Ports'),
			_('Only forward traffic destined for these ports to the proxy. Example: <code>22-10000</code> or <code>80,443</code>. Leave empty to forward all ports.'));
		o.datatype = 'string';
		o.placeholder = '0-65535';

		// --- Pass IP List ---
		o = s.option(form.DynamicList, 'pass_ip', _('Direct Access IPs'),
			_('IP addresses or CIDRs that should bypass the proxy and connect directly. These are added to the "pass" ipset.'));
		o.datatype = 'or(ipaddr, cidr4)';
		o.placeholder = '223.5.5.5';

		return m.render();
	}
});
