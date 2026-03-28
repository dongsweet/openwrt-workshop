'use strict'; 'require view'; 'require form'; 'require uci'; 'require ui'; 'require fs';

return view.extend({
	render: function () {
		var m, s, o;

		m = new form.Map('v2ray_adv', _('V2Ray Advanced'),
			_('A LuCI interface for advanced V2Ray management.'));

		s = m.section(form.NamedSection, 'main', 'global', _('Global Settings'));
		s.anonymous = true;
		s.addremove = false;

		o = s.option(form.Flag, 'enabled', _('Enabled'));
		o.rmempty = false;

		o = s.option(form.ListValue, 'log_level', _('Log Level'));
		o.value('debug', _('Debug'));
		o.value('info', _('Info'));
		o.value('warning', _('Warning'));
		o.value('error', _('Error'));
		o.value('none', _('None'));
		o.default = 'warning';

		o = s.option(form.Value, 'access_log', _('Access Log'));
		o.default = '/var/log/v2ray-acc.log';

		o = s.option(form.Value, 'error_log', _('Error Log'));
		o.default = '/var/log/v2ray.log';

		o = s.option(form.Value, 'v2ray_path', _('V2Ray Path'),
			_('The absolute path to the V2Ray binary.'));
		o.default = '/usr/bin/v2ray';
		o.rmempty = false;

		o.render = function(section_id, option_index, backup_id) {
			return form.Value.prototype.render.apply(this, [section_id, option_index, backup_id]).then(L.bind(function(node) {
				var input = node.querySelector('input');
				if (!input) return node;

				var btn = E('button', {
					'class': 'cbi-button cbi-button-action',
					'style': 'margin-left: 10px;',
					'click': ui.createHandlerFn(this, function(ev) {
						var path = input.value;
						if (!path) return;
						
						var btn_el = ev.target;
						btn_el.disabled = true;
						var old_text = btn_el.innerText;
						btn_el.innerText = _('Detecting...');

						fs.exec('/usr/libexec/v2ray-adv-check', [path]).then(function(res) {
							var status_id = 'v2ray_path_status';
							var status_el = document.getElementById(status_id);
							if (!status_el) {
								status_el = E('span', { 'id': status_id, 'style': 'margin-left: 10px; font-weight: bold;' });
								btn_el.parentNode.appendChild(status_el);
							}

							if (res && res.code === 0) {
								status_el.innerText = ' [ ' + (res.stdout || '').trim() + ' ]';
								status_el.style.color = 'green';
							} else {
								status_el.innerText = ' [ ' + (res && res.stderr ? res.stderr.trim() : _('Not found or error')) + ' ]';
								status_el.style.color = 'red';
							}
							btn_el.disabled = false;
							btn_el.innerText = old_text;
						}).catch(function(err) {
							ui.addNotification(null, E('p', [_('Detection failed: %s').format(err.message || _('Unknown error'))]), 'error');
							btn_el.disabled = false;
							btn_el.innerText = old_text;
						});
					})
				}, _('Detect'));

				input.parentNode.appendChild(btn);

				return node;
			}, this));
		};

		return m.render();
	}
});
