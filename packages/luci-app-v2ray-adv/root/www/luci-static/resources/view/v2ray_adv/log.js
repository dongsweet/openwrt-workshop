'use strict';
'require view';
'require form';
'require uci';
'require fs';
'require ui';

return view.extend({
	load: function() {
		return uci.load('v2ray_adv').then(function() {
			var access_log = uci.get('v2ray_adv', 'main', 'access_log') || '/var/log/v2ray-acc.log';
			var error_log = uci.get('v2ray_adv', 'main', 'error_log') || '/var/log/v2ray.log';

			// Use tail to only read the last 100 lines, preventing UI hang on large files
			return Promise.all([
				fs.exec('/usr/bin/tail', [ '-n', '100', access_log ]).then(function(res) { return res.stdout || ''; }).catch(function() { return ''; }),
				fs.exec('/usr/bin/tail', [ '-n', '100', error_log ]).then(function(res) { return res.stdout || ''; }).catch(function() { return ''; })
			]);
		});
	},

	render: function(data) {
		var access_content = data[0];
		var error_content = data[1];

		var m, s, o;

		m = new form.Map('v2ray_adv', _('V2Ray Logs'),
			_('View the recent execution logs for the V2Ray service. Only the last 100 lines are shown for performance.'));

		s = m.section(form.TypedSection, '_log_view');
		s.anonymous = true;
		s.render = function() {
			return E('div', { 'class': 'cbi-section' }, [
				E('div', { 'class': 'cbi-section-node' }, [
					E('div', { 'class': 'cbi-value' }, [
						E('div', { 'style': 'width:100%; display:flex; flex-direction:column; gap:20px;' }, [
							// Error Log
							E('div', {}, [
								E('h3', [ _('Error Log') ]),
								E('textarea', {
									'id': 'error_log_content',
									'style': 'width:100%; height:400px; font-family:monospace; background:#000; color:#ff9900; border:1px solid #333; padding:10px; border-radius: 4px; overflow-y:auto;',
									'readonly': 'readonly'
								}, [error_content || _('No error logs found.')])
							]),
							// Access Log
							E('div', {}, [
								E('h3', [ _('Access Log') ]),
								E('textarea', {
									'id': 'access_log_content',
									'style': 'width:100%; height:300px; font-family:monospace; background:#000; color:#00ff00; border:1px solid #333; padding:10px; border-radius: 4px; overflow-y:auto;',
									'readonly': 'readonly'
								}, [access_content || _('No access logs found.')])
							])
						])
					])
				])
			]);
		};

		return m.render().then(function(node) {
			// Scroll to bottom of textareas
			var err_el = node.querySelector('#error_log_content');
			var acc_el = node.querySelector('#access_log_content');
			if (err_el) err_el.scrollTop = err_el.scrollHeight;
			if (acc_el) acc_el.scrollTop = acc_el.scrollHeight;

			return node;
		});
	}
});
