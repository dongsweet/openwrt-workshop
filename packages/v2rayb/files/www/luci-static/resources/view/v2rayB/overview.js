'use strict';
'require rpc';
'require ui';
'require view';

const callStatus = rpc.declare({
	object: 'luci.v2rayb', method: 'status', expect: { '': {} }
});
const callDnsState = rpc.declare({
	object: 'luci.v2rayb', method: 'dns_state', expect: { '': {} }
});
const callGetV2rayConfig = rpc.declare({
	object: 'luci.v2rayb', method: 'get_v2ray_config', expect: { '': {} }
});
const callNodes = rpc.declare({
	object: 'luci.v2rayb', method: 'list_nodes', expect: { '': {} }
});
const callProfiles = rpc.declare({
	object: 'luci.v2rayb', method: 'list_profiles', expect: { '': {} }
});
const callAppliedProfile = rpc.declare({
	object: 'luci.v2rayb', method: 'get_applied_profile', expect: { '': {} }
});
const callSetSetting = rpc.declare({
	object: 'luci.v2rayb', method: 'set_setting', params: [ 'key', 'value' ], expect: { '': {} }, reject: true
});
const callSelectProfile = rpc.declare({
	object: 'luci.v2rayb', method: 'select_profile', params: [ 'profile_id' ], expect: { '': {} }, reject: true
});
const callApplyDraft = rpc.declare({
	object: 'luci.v2rayb', method: 'apply_draft', expect: { '': {} }, reject: true
});
const callRevertDraft = rpc.declare({
	object: 'luci.v2rayb', method: 'revert_draft', expect: { '': {} }, reject: true
});
const callAddProfile = rpc.declare({
	object: 'luci.v2rayb', method: 'add_profile',
	params: [ 'name', 'node_id', 'direct_dns', 'transparent_proxy_ports', 'bypass_china',
		'use_v2ray_dns', 'mosdns_enabled', 'mosdns_domains', 'mosdns_match_rules' ],
	expect: { '': {} }, reject: true
});
const callUpdateProfile = rpc.declare({
	object: 'luci.v2rayb', method: 'update_profile',
	params: [ 'profile_id', 'name', 'node_id', 'direct_dns', 'transparent_proxy_ports', 'bypass_china',
		'use_v2ray_dns', 'mosdns_enabled', 'mosdns_domains', 'mosdns_match_rules' ],
	expect: { '': {} }, reject: true
});
const callGetProfile = rpc.declare({
	object: 'luci.v2rayb', method: 'get_profile', params: [ 'profile_id' ], expect: { '': {} }
});
const callSetProfileEnabled = rpc.declare({
	object: 'luci.v2rayb', method: 'set_profile_enabled', params: [ 'profile_id', 'enabled' ], expect: { '': {} }, reject: true
});
const callDeleteProfile = rpc.declare({
	object: 'luci.v2rayb', method: 'delete_profile', params: [ 'profile_id' ], expect: { '': {} }, reject: true
});
const callAddNode = rpc.declare({
	object: 'luci.v2rayb', method: 'add_node',
	params: [ 'name', 'protocol', 'server', 'port', 'data_json' ], expect: { '': {} }, reject: true
});
const callGetNode = rpc.declare({
	object: 'luci.v2rayb', method: 'get_node', params: [ 'node_id' ], expect: { '': {} }
});
const callUpdateNode = rpc.declare({
	object: 'luci.v2rayb', method: 'update_node',
	params: [ 'node_id', 'name', 'protocol', 'server', 'port', 'data_json' ], expect: { '': {} }, reject: true
});
const callSetNodeEnabled = rpc.declare({
	object: 'luci.v2rayb', method: 'set_node_enabled', params: [ 'node_id', 'enabled' ], expect: { '': {} }, reject: true
});
const callDeleteNode = rpc.declare({
	object: 'luci.v2rayb', method: 'delete_node', params: [ 'node_id' ], expect: { '': {} }, reject: true
});

function outputOf(result) {
	return result && typeof result.output === 'string' ? result.output : '';
}

function parseKeyValues(text) {
	const result = {};
	for (const line of text.split('\n')) {
		const index = line.indexOf('=');
		if (index > 0)
			result[line.slice(0, index)] = line.slice(index + 1);
	}
	return result;
}

function parseRows(text) {
	return text.trim() ? text.trim().split('\n').map(line => line.split('\t')) : [];
}

function isEnabled(value) {
	return value === '1' || value === 1 || value === true;
}

function checkbox(attributes, checked) {
	const input = E('input', {
		type: 'checkbox',
		class: 'cbi-input-checkbox',
		...(attributes || {})
	});
	input.checked = checked === true;
	return input;
}

function css() {
	return E('style', {}, `
		.v2rayb-shell { max-width: 1180px; }
		.v2rayb-hero { color: #fff; padding: 1.5rem 1.6rem; margin-bottom: 1rem; border-radius: 16px;
			background: linear-gradient(135deg, #17324d 0%, #286b78 100%); box-shadow: 0 12px 30px rgba(23,50,77,.18); }
		.v2rayb-hero h2 { margin: 0 0 .3rem; color: #fff; font-size: 1.65rem; }
		.v2rayb-hero p { margin: 0; color: rgba(255,255,255,.82); }
		.v2rayb-hero-meta { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1rem; }
		.v2rayb-chip { display: inline-flex; align-items: center; gap: .35rem; padding: .35rem .65rem;
			border: 1px solid #d5dce5; border-radius: 999px; background: #f6f8fa; color: #29384d; font-size: .82rem; }
		.v2rayb-hero .v2rayb-chip { border-color: rgba(255,255,255,.22); background: transparent; color: #fff; }
		.v2rayb-nav { display: flex; flex-wrap: wrap; gap: .55rem; margin-bottom: 1rem; }
		.v2rayb-nav button { min-width: 9.5rem; padding: .75rem .9rem; text-align: left; cursor: pointer;
			border: 1px solid #d5dce5; border-radius: 12px; background: #fff; color: #29384d; }
		.v2rayb-nav button:hover { border-color: #2d7d86; box-shadow: 0 5px 14px rgba(31,70,85,.1); }
		.v2rayb-nav button.active { border-color: #286b78; background: #286b78; color: #fff; box-shadow: 0 7px 18px rgba(40,107,120,.2); }
		.v2rayb-nav-title { display: block; font-weight: 700; }
		.v2rayb-nav-caption { display: block; margin-top: .2rem; font-size: .78rem; opacity: .75; }
		.v2rayb-panel { display: block; }
		.v2rayb-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: .75rem; margin-bottom: 1rem; }
		.v2rayb-card { padding: 1rem 1.1rem; border: 1px solid #d8dfe7; border-radius: 14px;
			background: linear-gradient(180deg, #fff 0%, #f6f8fa 100%); }
		.v2rayb-card-label { color: #657286; font-size: .78rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
		.v2rayb-card-value { margin-top: .35rem; color: #203047; font-size: 1.35rem; font-weight: 750; }
		.v2rayb-card-help { margin-top: .3rem; color: #6a7585; font-size: .82rem; line-height: 1.35; }
		.v2rayb-status { display: inline-flex; align-items: center; gap: .4rem; padding: .25rem .6rem; border-radius: 999px; font-weight: 700; }
		.v2rayb-status::before { content: ''; width: .5rem; height: .5rem; border-radius: 50%; background: currentColor; }
		.v2rayb-status-ok { color: #19734a; background: #e4f5ec; }
		.v2rayb-status-warn { color: #9a6500; background: #fff3d7; }
		.v2rayb-status-off { color: #9a3b35; background: #fbe9e7; }
		.v2rayb-toolbar { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; margin-top: 1rem; }
		.v2rayb-toolbar .cbi-button { margin: 0; }
		.v2rayb-table .cbi-section-table-cell { text-align: left !important; vertical-align: middle; }
		.v2rayb-disabled-control { opacity: .5; }
		.v2rayb-form-wide { width: 100%; box-sizing: border-box; min-height: 7rem; resize: vertical; font-family: monospace; }
		.v2rayb-form-wide:disabled { background: #f0f2f5; cursor: not-allowed; }
		.v2rayb-create { display: flex; justify-content: flex-start; margin-top: .75rem; }
		.v2rayb-help { color: #687587; font-size: .88rem; line-height: 1.5; }
		.v2rayb-code { display: block; max-height: 20rem; overflow: auto; padding: 1rem; border-radius: 10px;
			background: #17212b; color: #cfe6e7; white-space: pre-wrap; font: .82rem/1.5 monospace; }
	`);
}

function field(label, control, help) {
	return E('div', { class: 'cbi-value' }, [
		E('label', { class: 'cbi-value-title' }, label),
		E('div', { class: 'cbi-value-field' }, [
			control,
			help ? E('div', { class: 'cbi-value-description' }, help) : ''
		])
	]);
}

function statusBadge(state) {
	let cls = 'v2rayb-status-off';
	if (state === 'proxy') cls = 'v2rayb-status-ok';
	else if (state === 'starting' || state === 'stopping' || state === 'degraded') cls = 'v2rayb-status-warn';
	const labels = { normal: _('Normal mode'), starting: _('Starting'), proxy: _('Proxy mode'), stopping: _('Stopping'), degraded: _('Degraded') };
	return E('span', { class: 'v2rayb-status ' + cls }, labels[state] || state || _('Unknown'));
}

function table(headers, rows, empty, actionColumn) {
	const body = rows.length ? rows.map((row, index) => E('tr', {
		class: 'tr cbi-section-table-row cbi-rowstyle-' + (index % 2 ? '2' : '1')
	}, row.map(value => value && value.nodeName === 'TD'
		? value
		: E('td', { class: 'td cbi-section-table-cell' }, value || '')))) :
		[ E('tr', { class: 'tr cbi-section-table-row' }, [
			E('td', { class: 'td cbi-section-table-cell', colspan: headers.length }, E('em', {}, empty))
		]) ];
	return E('table', { class: 'table cbi-section-table v2rayb-table' }, [
		E('thead', { class: 'thead cbi-section-thead' }, E('tr', { class: 'tr cbi-section-table-titles' },
			headers.map((value, index) => E('th', {
				class: 'th cbi-section-table-cell' +
					(actionColumn && index === headers.length - 1 ? ' nowrap cbi-section-actions' : '')
			}, value)))),
		E('tbody', { class: 'tbody cbi-section-tbody' }, body)
	]);
}

function confirmDelete(message) {
	return new Promise(resolve => ui.showModal(_('Confirm deletion'), [
		E('p', {}, message),
		E('div', { class: 'right' }, [
			E('button', { class: 'btn', type: 'button', click: () => { ui.hideModal(); resolve(false); } }, _('Cancel')),
			' ',
			E('button', { class: 'btn cbi-button cbi-button-remove', type: 'button', click: () => { ui.hideModal(); resolve(true); } }, _('Delete'))
		])
	]));
}

function actionCell(buttons) {
	return E('td', { class: 'td cbi-section-table-cell nowrap cbi-section-actions' },
		E('div', buttons));
}

function card(label, value, help) {
	return E('div', { class: 'v2rayb-card' }, [
		E('div', { class: 'v2rayb-card-label' }, label), E('div', { class: 'v2rayb-card-value' }, value),
		help ? E('div', { class: 'v2rayb-card-help' }, help) : ''
	]);
}

function errorMessage(error) {
	if (typeof error === 'string')
		return error;
	if (Array.isArray(error) && typeof error[0] === 'number') {
		const status = rpc.getStatusText ? rpc.getStatusText(error[0]) : _('Unspecified error');
		return _('Router RPC failed with ubus code %s: %s.').format(error[0], status);
	}
	if (error) {
		for (const value of [ error.message, error.error, error.output, error.data && error.data.message, error.data && error.data.error ])
			if (typeof value === 'string' && value)
				return value;
		if (error.code !== undefined)
			return _('Request failed with code %s.').format(error.code);
		if (typeof error.toString === 'function') {
			const value = error.toString();
			if (value && value !== '[object Object]')
				return value;
		}
	}
	return _('The router returned no error details. Check the system log for the request time.');
}

function showRequestError(error) {
	ui.addNotification(null, E('p', {}, errorMessage(error)), 'error');
}

function reloadPage() {
	const active = document.querySelector('.v2rayb-nav-link.active');
	if (active && active.dataset.tab && window.history && window.history.replaceState)
		window.history.replaceState(null, '', '#' + active.dataset.tab);
	window.location.reload();
}

function notify(result, successText, reload) {
	if (result && (result.success || result.code === 0)) {
		ui.addNotification(null, E('p', {}, successText), 'info');
		if (reload) window.setTimeout(reloadPage, 700);
	} else {
		showRequestError(result);
	}
}

function renderTabs(panes) {
	const buttons = [], panels = [];
	const ids = panes.map(pane => pane.id);
	let initial = window.location.hash.replace(/^#/, '');
	if (!ids.includes(initial))
		initial = panes[0].id;

	function activate(id, remember) {
		if (!ids.includes(id))
			return;
		buttons.forEach(button => {
			const active = button.dataset.tab === id;
			button.classList.toggle('active', active);
			button.setAttribute('aria-selected', active ? 'true' : 'false');
		});
		panels.forEach(panel => {
			const visible = panel.dataset.tab === id;
			panel.style.display = visible ? '' : 'none';
			panel.setAttribute('aria-hidden', visible ? 'false' : 'true');
		});
		if (remember && window.history && window.history.replaceState)
			window.history.replaceState(null, '', '#' + id);
	}
	panes.forEach((pane, index) => {
		const selected = pane.id === initial;
		const button = E('button', {
			class: 'v2rayb-nav-link' + (selected ? ' active' : ''), type: 'button', role: 'tab',
			'aria-selected': selected ? 'true' : 'false', 'data-tab': pane.id,
			click: () => activate(pane.id, true)
		}, [ E('span', { class: 'v2rayb-nav-title' }, pane.title), pane.caption ? E('span', { class: 'v2rayb-nav-caption' }, pane.caption) : '' ]);
		const panel = E('div', {
			class: 'v2rayb-panel', role: 'tabpanel', 'data-tab': pane.id,
			style: selected ? '' : 'display:none', 'aria-hidden': selected ? 'false' : 'true'
		}, pane.nodes);
		buttons.push(button); panels.push(panel);
	});
	return E('div', {}, [ E('div', { class: 'v2rayb-nav', role: 'tablist' }, buttons), E('div', {}, panels) ]);
}

function showNodeModal(view, onSaved, existing) {
	const name = E('input', { class: 'cbi-input-text', type: 'text', maxlength: '64', required: true });
	const protocol = E('select', { class: 'cbi-input-select' }, [ 'vless', 'vmess', 'trojan', 'shadowsocks' ].map(value => E('option', { value }, value.toUpperCase())));
	const server = E('input', { class: 'cbi-input-text', type: 'text', maxlength: '255', required: true });
	const port = E('input', { class: 'cbi-input-text', type: 'number', min: '1', max: '65535', value: '443', required: true });
	const uuid = E('input', { class: 'cbi-input-text', type: 'password', maxlength: '255', required: true });
	const flow = E('select', { class: 'cbi-input-select' }, [ E('option', { value: '' }, _('None')), E('option', { value: 'xtls-rprx-vision' }, 'xtls-rprx-vision') ]);
	const ssMethod = E('select', { class: 'cbi-input-select' }, [ 'aes-128-gcm', 'aes-256-gcm', 'chacha20-poly1305', 'none' ].map(value => E('option', { value }, value)));
	const security = E('select', { class: 'cbi-input-select' }, [ 'none', 'tls', 'reality' ].map(value => E('option', { value }, value.toUpperCase())));
	const sni = E('input', { class: 'cbi-input-text', type: 'text', maxlength: '255' });
	const alpn = E('input', { class: 'cbi-input-text', type: 'text', placeholder: 'h2,http/1.1' });
	const insecure = checkbox({}, false);
	const fingerprint = E('select', { class: 'cbi-input-select' }, [ 'chrome', 'firefox', 'safari', 'edge', 'android', 'ios' ].map(value => E('option', { value }, value)));
	const publicKey = E('input', { class: 'cbi-input-text', type: 'text' });
	const shortId = E('input', { class: 'cbi-input-text', type: 'text' });
	const spiderX = E('input', { class: 'cbi-input-text', type: 'text', value: '/' });
	const transport = E('select', { class: 'cbi-input-select' }, [ 'tcp', 'ws', 'h2', 'grpc' ].map(value => E('option', { value }, value.toUpperCase())));
	const tcpGuise = E('select', { class: 'cbi-input-select' }, [ E('option', { value: 'none' }, _('None')), E('option', { value: 'http' }, 'HTTP') ]);
	const tcpPath = E('input', { class: 'cbi-input-text', type: 'text', value: '/' });
	const tcpHost = E('input', { class: 'cbi-input-text', type: 'text', placeholder: 'example.com' });
	const wsPath = E('input', { class: 'cbi-input-text', type: 'text', value: '/' });
	const wsHost = E('input', { class: 'cbi-input-text', type: 'text' });
	const h2Path = E('input', { class: 'cbi-input-text', type: 'text', value: '/' });
	const h2Host = E('input', { class: 'cbi-input-text', type: 'text' });
	const grpcService = E('input', { class: 'cbi-input-text', type: 'text' });
	const muxEnabled = checkbox({}, true);
	const muxConcurrency = E('input', { class: 'cbi-input-text', type: 'number', min: '1', max: '128', value: '8' });
	const conditional = [];
	function add(label, control, help, predicate, full) {
		const node = field(label, control, help, full);
		if (predicate) conditional.push([ node, predicate ]);
		return node;
	}
	function list(value) {
		return value.split(/[;,\s]+/).filter(item => item !== '');
	}
	function buildOutbound() {
		let settings;
		const user = { id: uuid.value, encryption: protocol.value === 'vless' ? 'none' : 'auto', level: 1 };
		if (protocol.value === 'vless' && flow.value) user.flow = flow.value;
		if (protocol.value === 'vmess') { user.alterId = 0; user.security = 'auto'; }
		if (protocol.value === 'trojan') settings = { servers: [ { address: server.value, port: Number(port.value), password: uuid.value, level: 1 } ] };
		else if (protocol.value === 'shadowsocks') settings = { servers: [ { address: server.value, port: Number(port.value), password: uuid.value, method: ssMethod.value, level: 1 } ] };
		else settings = { vnext: [ { address: server.value, port: Number(port.value), users: [ user ] } ] };

		const streamSettings = { network: transport.value, security: security.value };
		if (security.value === 'tls') {
			streamSettings.tlsSettings = { allowInsecure: insecure.checked, serverName: sni.value || server.value };
			if (alpn.value) streamSettings.tlsSettings.alpn = list(alpn.value);
		} else if (security.value === 'reality') {
			streamSettings.realitySettings = { show: false, fingerprint: fingerprint.value, serverName: sni.value || server.value };
			if (publicKey.value) streamSettings.realitySettings.publicKey = publicKey.value;
			if (shortId.value) streamSettings.realitySettings.shortId = shortId.value;
			if (spiderX.value) streamSettings.realitySettings.spiderX = spiderX.value;
			if (alpn.value) streamSettings.realitySettings.alpn = list(alpn.value);
		}
		if (transport.value === 'tcp' && tcpGuise.value === 'http') {
			streamSettings.tcpSettings = { header: { type: 'http', request: { version: '1.1', method: 'GET', path: [ tcpPath.value || '/' ], headers: { Host: list(tcpHost.value), 'User-Agent': [ 'Mozilla/5.0' ] } } } };
		} else if (transport.value === 'ws') {
			streamSettings.wsSettings = { path: wsPath.value || '/' };
			if (wsHost.value) streamSettings.wsSettings.headers = { Host: wsHost.value };
		} else if (transport.value === 'h2') {
			streamSettings.httpSettings = { path: h2Path.value || '/' };
			if (h2Host.value) streamSettings.httpSettings.host = list(h2Host.value);
		} else if (transport.value === 'grpc' && grpcService.value) {
			streamSettings.grpcSettings = { serviceName: grpcService.value };
		}
		return JSON.stringify({ settings: settings, streamSettings: streamSettings, mux: { enabled: muxEnabled.checked, concurrency: Number(muxConcurrency.value) || 8 } });
	}
	function refresh() {
		conditional.forEach(item => { item[0].style.display = item[1]() ? '' : 'none'; });
	}
	function prefill(node) {
		let data;
		try {
			data = JSON.parse(node.data_json || '{}');
		} catch (e) {
			ui.addNotification(null, E('p', {}, _('Stored node settings could not be decoded.')), 'error');
			return;
		}
		const settings = data.settings || {};
		const stream = data.streamSettings || {};
		const vnext = settings.vnext && settings.vnext[0];
		const serverConfig = settings.servers && settings.servers[0];
		const endpoint = vnext || serverConfig || {};
		const user = vnext && vnext.users && vnext.users[0];
		name.value = node.name;
		protocol.value = node.protocol;
		server.value = node.server;
		port.value = node.port;
		uuid.value = (user && user.id) || endpoint.password || '';
		flow.value = (user && user.flow) || '';
		ssMethod.value = endpoint.method || 'aes-128-gcm';
		security.value = stream.security || 'none';
		transport.value = stream.network || 'tcp';
		const tls = stream.tlsSettings || {};
		const reality = stream.realitySettings || {};
		sni.value = tls.serverName || reality.serverName || '';
		insecure.checked = !!tls.allowInsecure;
		fingerprint.value = reality.fingerprint || 'chrome';
		publicKey.value = reality.publicKey || '';
		shortId.value = reality.shortId || '';
		spiderX.value = reality.spiderX || '/';
		alpn.value = ((tls.alpn || reality.alpn || [])).join(',');
		const tcp = (stream.tcpSettings && stream.tcpSettings.header) || {};
		tcpGuise.value = tcp.type === 'http' ? 'http' : 'none';
		tcpPath.value = (tcp.request && tcp.request.path && tcp.request.path[0]) || '/';
		tcpHost.value = (tcp.request && tcp.request.headers && tcp.request.headers.Host && tcp.request.headers.Host[0]) || '';
		wsPath.value = (stream.wsSettings && stream.wsSettings.path) || '/';
		wsHost.value = (stream.wsSettings && stream.wsSettings.headers && stream.wsSettings.headers.Host) || '';
		h2Path.value = (stream.httpSettings && stream.httpSettings.path) || '/';
		h2Host.value = ((stream.httpSettings && stream.httpSettings.host) || []).join(',');
		grpcService.value = (stream.grpcSettings && stream.grpcSettings.serviceName) || '';
		muxEnabled.checked = !data.mux || data.mux.enabled !== false;
		muxConcurrency.value = (data.mux && data.mux.concurrency) || 8;
	}
	protocol.addEventListener('change', refresh);
	security.addEventListener('change', refresh);
	transport.addEventListener('change', refresh);
	tcpGuise.addEventListener('change', refresh);
	const save = E('button', { class: 'cbi-button cbi-button-apply', type: 'button', click: () => {
		if (!name.value || !server.value || !port.value || !uuid.value) {
			ui.addNotification(null, E('p', {}, _('Name, server, port and UUID/password are required.')), 'warning'); return;
		}
		const outbound = buildOutbound();
		ui.hideModal();
		if (onSaved)
			onSaved({
				id: existing ? existing.id : null,
				name: name.value, protocol: protocol.value, server: server.value, port: port.value,
				data_json: outbound
			});
	}, }, existing ? _('Update pending changes') : _('Add to pending changes'));
	const cancel = E('button', { class: 'cbi-button', type: 'button', click: () => ui.hideModal() }, _('Cancel'));
	if (existing)
		prefill(existing);
	ui.showModal(existing ? _('Edit proxy node') : _('Add proxy node'), [
		E('div', { class: 'cbi-section' }, [ E('h3', {}, _('Basic settings')),
			add(_('Name'), name), add(_('Protocol'), protocol), add(_('Server'), server), add(_('Port'), port),
			add(_('UUID / password'), uuid)
		]),
		E('div', { class: 'cbi-section' }, [ E('h3', {}, _('Protocol details')),
			add(_('VLESS flow'), flow, null, () => protocol.value === 'vless'),
			add(_('Shadowsocks method'), ssMethod, null, () => protocol.value === 'shadowsocks')
		]),
		E('div', { class: 'cbi-section' }, [ E('h3', {}, _('TLS and security')),
			add(_('Security'), security), add(_('SNI / server name'), sni, _('Defaults to the server address.'), () => security.value === 'tls' || security.value === 'reality'),
			add(_('ALPN'), alpn, _('Comma-separated values, for example h2,http/1.1.'), () => security.value === 'tls' || security.value === 'reality'),
			add(_('Allow insecure'), insecure, _('Skip certificate verification.'), () => security.value === 'tls'),
			add(_('Reality fingerprint'), fingerprint, null, () => security.value === 'reality'), add(_('Reality public key'), publicKey, null, () => security.value === 'reality'),
			add(_('Reality short ID'), shortId, null, () => security.value === 'reality'), add(_('Reality SpiderX'), spiderX, null, () => security.value === 'reality')
		]),
		E('div', { class: 'cbi-section' }, [ E('h3', {}, _('Transport')),
			add(_('Transport'), transport), add(_('TCP header type'), tcpGuise, null, () => transport.value === 'tcp'),
			add(_('TCP HTTP path'), tcpPath, null, () => transport.value === 'tcp' && tcpGuise.value === 'http'), add(_('TCP HTTP host'), tcpHost, null, () => transport.value === 'tcp' && tcpGuise.value === 'http'),
			add(_('WebSocket path'), wsPath, null, () => transport.value === 'ws'), add(_('WebSocket host'), wsHost, null, () => transport.value === 'ws'),
			add(_('H2 path'), h2Path, null, () => transport.value === 'h2'), add(_('H2 host'), h2Host, null, () => transport.value === 'h2'),
			add(_('gRPC service name'), grpcService, null, () => transport.value === 'grpc')
		]),
		E('div', { class: 'cbi-section' }, [ E('h3', {}, _('Multiplexing')),
			add(_('Enable mux'), muxEnabled), add(_('Mux concurrency'), muxConcurrency)
		]),
		E('div', { class: 'cbi-page-actions' }, [ cancel, save ])
	]);
	refresh();
}

function showProfileModal(onSaved, nodes, defaults, existing) {
	const name = E('input', { class: 'cbi-input-text', type: 'text', maxlength: '64', required: true, value: existing ? existing.name : '' });
	const nodeOptions = [
		E('option', { value: '' }, _('Select a primary node')),
		...nodes.filter(row => isEnabled(row[5])).map(row => E('option', {
			value: row[0]
		}, `${row[1]} (${row[2].toUpperCase()} ${row[3]}:${row[4]})`))
	];
	for (const option of nodeOptions)
		option.selected = !!existing && option.value === existing.node_id;
	const nodeSelect = E('select', { class: 'cbi-input-select' }, nodeOptions);
	const profileDns = E('input', {
		class: 'cbi-input-text', type: 'text',
		value: (existing && existing.direct_dns) || defaults.direct_dns
	});
	const profilePorts = E('input', {
		class: 'cbi-input-text', type: 'text',
		value: (existing && existing.transparent_proxy_ports) || defaults.transparent_proxy_ports
	});
	const bypassChina = checkbox({}, existing ? isEnabled(existing.bypass_china) : true);
	const useV2rayDns = checkbox({}, existing ? isEnabled(existing.use_v2ray_dns) : true);
	const mosdnsEnabled = checkbox({}, existing ? isEnabled(existing.mosdns_enabled) : true);
	const mosdnsDomains = E('textarea', {
		class: 'cbi-input-text v2rayb-form-wide', rows: '4', spellcheck: 'false',
		maxlength: '1024', placeholder: 'xn--ngstr-lra8j.com\nexample.com'
	});
	mosdnsDomains.value = ((existing && existing.mosdns_domains) || defaults.mosdns_domains || 'xn--ngstr-lra8j.com')
		.replace(/,/g, '\n');
	const mosdnsRules = E('textarea', {
		class: 'cbi-input-text v2rayb-form-wide', rows: '7', spellcheck: 'false',
		placeholder: 'domain:example.com\nfull:www.example.com\nregexp:^r\\+...$'
	});
	mosdnsRules.value = (existing && existing.mosdns_match_rules) || defaults.mosdns_match_rules || '';
	const mosdnsDomainsField = field(_('MosDNS domains'), mosdnsDomains,
		_('One suffix per line.'));
	const mosdnsRulesHelp = E('div', {}, [
		E('p', {}, _('One per line: domain:, full: or regexp:.')),
		E('p', {}, _('Force-proxy: V2Ray DNS + force_proxy sets.')),
		E('p', {}, _('Direct match: Direct DNS + direct sets.')),
		E('p', {}, _('Fallback: V2Ray DNS, no direct sets.'))
	]);
	const mosdnsRulesField = field(_('MosDNS match rules'), mosdnsRules, mosdnsRulesHelp);
	function refreshMosdnsFields() {
		const enabled = mosdnsEnabled.checked;
		mosdnsDomains.disabled = !enabled;
		mosdnsRules.disabled = !enabled;
		mosdnsDomainsField.classList.toggle('v2rayb-disabled-control', !enabled);
		mosdnsRulesField.classList.toggle('v2rayb-disabled-control', !enabled);
	}
	mosdnsEnabled.addEventListener('change', refreshMosdnsFields);
	refreshMosdnsFields();
	const save = E('button', { class: 'cbi-button cbi-button-apply', type: 'button', click: () => {
		const profileName = name.value.trim();
		if (!profileName || !nodeSelect.value || !profileDns.value || !profilePorts.value) {
			ui.addNotification(null, E('p', {}, _('Enter a profile name, primary node, DNS upstream and proxy ports.')), 'warning');
			return;
		}
		const bypass = bypassChina.checked ? '1' : '0';
		const v2rayDns = useV2rayDns.checked ? '1' : '0';
		const mosdns = mosdnsEnabled.checked ? '1' : '0';
		const domains = mosdnsDomains.value.split(/[\s,]+/).filter(value => value !== '').join(',');
		if (mosdns === '1' && !domains) {
			ui.addNotification(null, E('p', {}, _('Enter at least one domain when MosDNS is enabled.')), 'warning');
			return;
		}
		ui.hideModal();
		if (onSaved)
			onSaved({
				id: existing ? existing.id : null,
				name: profileName,
				node_id: nodeSelect.value,
				direct_dns: profileDns.value,
				transparent_proxy_ports: profilePorts.value,
				bypass_china: bypass,
				use_v2ray_dns: v2rayDns,
				mosdns_enabled: mosdns,
				mosdns_domains: domains,
				mosdns_match_rules: mosdnsRules.value.trim()
			});
	} }, existing ? _('Update pending changes') : _('Add to pending changes'));
	ui.showModal(existing ? _('Edit profile') : _('Create a profile'), [
		E('div', { class: 'cbi-section' }, [
			field(_('Profile name'), name),
			field(_('Primary node'), nodeSelect)
		]),
		E('div', { class: 'cbi-section' }, [
			E('h3', {}, _('Profile policy')),
			field(_('Direct DNS upstream'), profileDns,
				_('For MosDNS direct queries.')),
			field(_('Transparent TCP ports'), profilePorts,
				_('Example: 80,443,8080-8443.')),
			field(_('Bypass China IP'), bypassChina,
				_('Disabled: all intercepted traffic uses the proxy.'))
		]),
		E('div', { class: 'cbi-section' }, [
			E('h3', {}, _('DNS routing')),
			field(_('Use V2Ray DNS as dnsmasq default'), useV2rayDns,
				_('Disabled: default DNS uses Direct DNS.')),
			field(_('Enable MosDNS branch'), mosdnsEnabled,
				_('Disabled: domains and rules are inactive but retained.')),
			mosdnsDomainsField,
			mosdnsRulesField
		]),
		E('div', { class: 'cbi-page-actions' }, [
			E('button', { class: 'cbi-button', type: 'button', click: () => ui.hideModal() }, _('Cancel')),
			save
		])
	]);
}

return view.extend({
	handleSave() {
		const hadChanges = this.hasLocalChanges();
		return this.persistLocalChanges().then(result => {
			if (!result || !result.success) {
				notify(result, '');
				return;
			}
			if (hadChanges) {
				window.location.reload();
				return;
			}
			ui.addNotification(null, E('p', {}, this.draftPending
				? _('Your changes are saved as a draft. Use Save & Apply to make them active.')
				: _('There are no pending draft changes.')), 'info');
		}).catch(showRequestError);
	},

	handleSaveApply() {
		return this.persistLocalChanges().then(result => {
			if (!result || !result.success) {
				notify(result, '');
				return;
			}
			return callApplyDraft();
		}).then(result => {
			if (result && result.success) {
				window.location.reload();
				return;
			}
			if (result)
				notify(result, '');
		}).catch(showRequestError);
	},

	handleReset() {
		return callRevertDraft().then(result => {
			if (result && result.success) {
				window.location.reload();
				return;
			}
			notify(result, '');
		}).catch(showRequestError);
	},

	load() {
		return Promise.all([
			L.resolveDefault(callStatus(), { output: '' }), L.resolveDefault(callNodes(), { output: '' }),
			L.resolveDefault(callProfiles(), { output: '' }),
			L.resolveDefault(callDnsState(), { output: '' }), L.resolveDefault(callGetV2rayConfig(), { output: '' }),
			L.resolveDefault(callAppliedProfile(), { output: '' })
		]);
	},

	render(data) {
		const pageView = this;
		const status = parseKeyValues(outputOf(data[0]));
		const draftPending = status.draft_pending === '1';
		const appliedVersion = status.applied_config_version || '1';
		const draftVersion = status.draft_config_version || appliedVersion;
		pageView.draftPending = draftPending;
		pageView.draftVersion = draftVersion;
		const nodes = parseRows(outputOf(data[1]));
		const profiles = parseRows(outputOf(data[2]));
		const dnsState = parseKeyValues(outputOf(data[3]));
		const appliedProfileRows = parseRows(outputOf(data[5]));
		const appliedProfile = status.active_profile || '';
		let activeProfile = draftPending
			? (status.draft_active_profile || appliedProfile)
			: appliedProfile;
		const state = status.state || 'normal';
		let enabledNodes = nodes.filter(row => isEnabled(row[5])).length;
		let enabledProfiles = profiles.filter(row => isEnabled(row[4])).length;

		function profilePolicyText(row) {
			if (!row)
				return _('No active profile policy');
			const dns = row[6] || '-';
			const ports = row[7] || '-';
			const china = isEnabled(row[8]) ? _('China IP direct') : _('All through proxy');
			const v2rayDns = isEnabled(row[9]) ? _('V2Ray DNS default') : _('Direct DNS default');
			const mosdns = isEnabled(row[10]) ? _('MosDNS on') : _('MosDNS off');
			return `${_('DNS')} ${dns} · ${_('Ports')} ${ports} · ${china} · ${v2rayDns} · ${mosdns}`;
		}
		const activeProfileRow = appliedProfileRows[0] || null;
		const activeProfileCard = card(_('Applied profile'),
			activeProfileRow ? activeProfileRow[1] : (appliedProfile || _('Not selected')),
			profilePolicyText(activeProfileRow));
		function profileOptionsFromProfiles(rows) {
			const options = [ E('option', { value: '' }, _('Select a profile')) ];
			for (const row of rows) {
				if (!isEnabled(row[4]))
					continue;
				const option = E('option', { value: row[0] }, row[1]);
				option.selected = row[0] === activeProfile;
				options.push(option);
			}
			return options;
		}
		const activeProfileSelect = E('select', { class: 'cbi-input-select' },
			profileOptionsFromProfiles(profiles));
		activeProfileSelect.value = activeProfile;
		const nodesCard = card(_('Nodes'), `${enabledNodes} / ${nodes.length}`);
		const appliedServiceEnabled = status.service_enabled !== '0';
		const configuredServiceEnabled = draftPending
			? status.draft_service_enabled !== '0'
			: appliedServiceEnabled;
		const serviceEnabled = checkbox({}, configuredServiceEnabled);
		pageView.serviceEnabledDesired = configuredServiceEnabled;
		pageView.serviceEnabledDirty = false;
		pageView.pendingOperations = [];
		pageView.tempSequence = 0;
		pageView.nodeIdMap = {};
		pageView.profileIdMap = {};
		pageView.localNodeDetails = {};
		pageView.localProfileDetails = {};
		pageView.nextTempId = function(kind) {
			this.tempSequence += 1;
			return '__new_' + kind + '_' + this.tempSequence;
		};
		pageView.resolveNodeId = function(id) {
			return this.nodeIdMap[id] || id;
		};
		pageView.resolveProfileId = function(id) {
			return this.profileIdMap[id] || id;
		};
		pageView.activeProfileDirty = false;
		pageView.hasLocalChanges = function() {
			return this.serviceEnabledDirty || this.activeProfileDirty ||
				this.pendingOperations.length > 0;
		};
		pageView.refreshActiveProfileSelect = function() {
			const current = String(activeProfile || '');
			const options = profileOptionsFromProfiles(profiles);
			activeProfileSelect.replaceChildren(...options);
			activeProfileSelect.value = options.some(option => option.value === current) ? current : '';
		};
		pageView.persistLocalChanges = function() {
			let chain = Promise.resolve({ success: true });
			if (this.serviceEnabledDirty)
				chain = chain.then(() => callSetSetting('service_enabled', this.serviceEnabledDesired ? '1' : '0'));
			for (const operation of this.pendingOperations)
				chain = chain.then(result => {
					if (result && result.success === false)
						return result;
					const next = operation();
					return Promise.resolve(next).then(opResult =>
						opResult && opResult.success === false ? { failed: true, result: opResult } : opResult);
				});
			return chain.then(result => {
				if (result && result.failed)
					return result.result;
				if (result && result.success) {
					this.serviceEnabledDirty = false;
					this.pendingOperations = [];
				}
				return result;
			});
		};
		function queuePendingOperation(operation, pendingKey) {
			if (pendingKey) {
				operation.pendingKey = pendingKey;
				pageView.pendingOperations = pageView.pendingOperations.filter(
					item => item.pendingKey !== pendingKey);
			}
			pageView.pendingOperations.push(operation);
			return operation;
		}
		function discardPendingOperation(pendingKey) {
			pageView.pendingOperations = pageView.pendingOperations.filter(
				operation => operation.pendingKey !== pendingKey);
		}
		function isTempId(id) {
			return String(id).startsWith('__new_');
		}
		function displayId(id) {
			return isTempId(id) ? E('em', {}, _('New')) : id;
		}
		const unappliedNotice = E('div', {
			class: 'cbi-section',
			style: pageView.hasLocalChanges() || draftPending ? '' : 'display:none'
		}, [
			E('p', { class: 'v2rayb-help' }, _('Pending changes: Save & Apply to activate, or Reset to discard.'))
		]);
		function updateLocalChangesNotice() {
			unappliedNotice.style.display = pageView.hasLocalChanges() || draftPending ? '' : 'none';
		}
		serviceEnabled.addEventListener('change', () => {
			pageView.serviceEnabledDesired = serviceEnabled.checked;
			pageView.serviceEnabledDirty = serviceEnabled.checked !== configuredServiceEnabled;
			updateLocalChangesNotice();
		});
		activeProfileSelect.addEventListener('change', () => {
			activeProfile = activeProfileSelect.value;
			pageView.activeProfileDirty = activeProfile !== appliedProfile;
			updateLocalChangesNotice();
		});

		const overview = [
			unappliedNotice,
			E('div', { class: 'v2rayb-cards' }, [
				card(_('Service'), statusBadge(state)),
				activeProfileCard,
				nodesCard,
				card(_('DNS path'), state === 'proxy' ? _('V2Ray + MosDNS') : _('WAN / normal mode'))
			]),
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Service Control')),
				field(_('Enable v2rayB'), E('div', {}, [ serviceEnabled, ' ', statusBadge(state) ]),
					_('Also controls boot startup.')),
				field(_('Profile to activate'), activeProfileSelect,
					_('Applied after Save & Apply.'))
			]),
			table([ _('Property'), _('Current value') ], [
				[ _('Engine'), status.active_engine || '-' ], [ _('Proxy mode'), status.proxy_mode || '-' ],
				[ _('Watchdog'), status.watchdog_enabled === '1' ? _('Enabled') : _('Disabled') ],
				[ _('MosDNS listener'), status.mosdns_listen || '-' ], [ _('V2Ray DNS listener'), status.v2ray_dns_listen || '-' ]
			], _('No status data available.'))
		];

		let profileTable, nodeTable, profileAddButton;
		const profileTableHeaders = [ _('ID'), _('Name'), _('Primary node'), _('Policy'), _('Enabled'), _('Actions') ];
		const nodeTableHeaders = [ _('ID'), _('Name'), _('Protocol'), _('Server'), _('Port'), _('Enabled'), _('Actions') ];

		function enabledToggle(enabled, change) {
			const input = checkbox({}, isEnabled(enabled));
			input.addEventListener('change', () => change(input.checked ? '1' : '0'));
			return input;
		}
		function editButton(handler) {
			return E('button', { class: 'btn cbi-button cbi-button-edit', type: 'button', click: handler }, _('Edit'));
		}
		function removeButton(handler) {
			return E('button', { class: 'btn cbi-button cbi-button-remove', type: 'button', click: handler }, _('Delete'));
		}
		function profilePolicySummary(row) {
			return E('span', {}, profilePolicyText(row));
		}
		function profileTableRows() {
			return profiles.map(row => {
				const primary = nodes.find(node => node[0] === row[5]);
				const primaryName = primary ? primary[1] : row[3];
				return [
				displayId(row[0]), row[1], primaryName || E('span', { class: 'v2rayb-muted' }, _('No node')),
				profilePolicySummary(row),
				enabledToggle(row[4], enabled => {
					if (enabled === '0' && (row[0] === activeProfile || row[0] === appliedProfile)) {
						ui.addNotification(null, E('p', {}, _('Select and apply another profile before disabling this one.')), 'warning');
						refreshProfileTable();
						return;
					}
					row[4] = enabled;
					if (pageView.localProfileDetails[row[0]])
						pageView.localProfileDetails[row[0]].enabled = enabled;
					if (!isTempId(row[0]))
						queuePendingOperation(() => callSetProfileEnabled(pageView.resolveProfileId(row[0]), enabled), 'profile-enabled:' + row[0]);
					refreshProfileTable();
					refreshProfileCard();
				}),
				actionCell([
					editButton(async () => {
						let details;
						if (pageView.localProfileDetails[row[0]])
							details = { success: true, profile: pageView.localProfileDetails[row[0]] };
						else
							details = await callGetProfile(row[0]).catch(error => { showRequestError(error); return null; });
						if (!details || !details.success) {
							if (details) notify(details, '');
							return;
						}
						showProfileModal(profile => {
							const node = nodes.find(item => item[0] === profile.node_id);
							const index = profiles.findIndex(item => item[0] === row[0]);
							if (index >= 0)
								profiles[index] = [ row[0], profile.name, 'v2ray', node ? node[1] : '', row[4], profile.node_id, profile.direct_dns, profile.transparent_proxy_ports, profile.bypass_china, profile.use_v2ray_dns, profile.mosdns_enabled, profile.mosdns_domains, profile.mosdns_match_rules ];
							pageView.localProfileDetails[row[0]] = Object.assign({ id: row[0], enabled: row[4] }, profile);
							if (!isTempId(row[0]))
								queuePendingOperation(() => callUpdateProfile(
									pageView.resolveProfileId(row[0]), profile.name, pageView.resolveNodeId(profile.node_id),
									profile.direct_dns, profile.transparent_proxy_ports, profile.bypass_china,
									profile.use_v2ray_dns, profile.mosdns_enabled, profile.mosdns_domains,
									profile.mosdns_match_rules), 'profile-update:' + row[0]);
							refreshProfileTable();
							refreshProfileCard();
						}, nodes, {
							direct_dns: '223.5.5.5:53',
							transparent_proxy_ports: '80,443,8080,8443',
							mosdns_domains: dnsState.mosdns_route_suffix || 'xn--ngstr-lra8j.com',
							mosdns_match_rules: dnsState.direct_rule || ''
						}, details.profile);
					}),
					removeButton(async () => {
						if (row[0] === activeProfile || row[0] === appliedProfile) {
							ui.addNotification(null, E('p', {}, _('Select and apply another profile before deleting this one.')), 'warning');
							return;
						}
						if (!await confirmDelete(_('Delete profile "%s"?').format(row[1])))
							return;
						const index = profiles.findIndex(item => item[0] === row[0]);
						if (index >= 0) profiles.splice(index, 1);
						if (isTempId(row[0])) {
							discardPendingOperation('profile-create:' + row[0]);
							discardPendingOperation('profile-update:' + row[0]);
						} else
							queuePendingOperation(() => callDeleteProfile(row[0]), 'profile-delete:' + row[0]);
						refreshProfileTable();
						refreshProfileCard();
					})
				].filter(Boolean))
			];
			});
		}
		function nodeTableRows() {
			return nodes.map(row => [
				displayId(row[0]), row[1], row[2].toUpperCase(), row[3], row[4],
				enabledToggle(row[5], enabled => {
					if (enabled === '0' && profiles.some(profile => profile[5] === row[0])) {
						ui.addNotification(null, E('p', {}, _('Node is referenced by a profile; delete or move that profile before disabling the node.')), 'warning');
						refreshNodeTable();
						return;
					}
					row[5] = enabled;
					if (pageView.localNodeDetails[row[0]])
						pageView.localNodeDetails[row[0]].enabled = enabled;
					if (!isTempId(row[0]))
						queuePendingOperation(() => callSetNodeEnabled(row[0], enabled), 'node-enabled:' + row[0]);
					refreshNodeTable();
					refreshNodeCard();
					refreshProfileAddButton();
				}),
				actionCell([
					editButton(async () => {
						let details;
						if (pageView.localNodeDetails[row[0]])
							details = { success: true, node: pageView.localNodeDetails[row[0]] };
						else
							details = await callGetNode(row[0]).catch(error => { showRequestError(error); return null; });
						if (!details || !details.success) {
							if (details) notify(details, '');
							return;
						}
						showNodeModal(pageView, onNodeSaved, details.node);
					}),
					removeButton(async () => {
						if (profiles.some(profile => profile[5] === row[0])) {
							ui.addNotification(null, E('p', {}, _('Node is referenced by a profile; delete or move that profile first.')), 'warning');
							return;
						}
						if (!await confirmDelete(_('Delete node "%s"?').format(row[1])))
							return;
						const index = nodes.findIndex(item => item[0] === row[0]);
						if (index >= 0) nodes.splice(index, 1);
						if (isTempId(row[0])) {
							discardPendingOperation('node-create:' + row[0]);
							discardPendingOperation('node-update:' + row[0]);
						} else
							queuePendingOperation(() => callDeleteNode(row[0]), 'node-delete:' + row[0]);
						refreshNodeTable();
						refreshNodeCard();
						refreshProfileTable();
						refreshProfileAddButton();
					})
				])
			]);
		}
		function refreshNodeTable() {
			const next = table(nodeTableHeaders, nodeTableRows(), _('No nodes configured.'), true);
			nodeTable.replaceWith(next);
			nodeTable = next;
			updateLocalChangesNotice();
		}
		function refreshProfileTable() {
			const next = table(profileTableHeaders, profileTableRows(), _('No profiles configured.'), true);
			profileTable.replaceWith(next);
			profileTable = next;
			updateLocalChangesNotice();
		}
		function refreshNodeCard() {
			enabledNodes = nodes.filter(row => isEnabled(row[5])).length;
			nodesCard.querySelector('.v2rayb-card-value').textContent = `${enabledNodes} / ${nodes.length}`;
		}
		function refreshProfileCard() {
			enabledProfiles = profiles.filter(row => isEnabled(row[4])).length;
			const row = activeProfileRow;
			activeProfileCard.querySelector('.v2rayb-card-value').textContent =
				row ? row[1] : (appliedProfile || _('Not selected'));
			activeProfileCard.querySelector('.v2rayb-card-help').textContent = profilePolicyText(row);
			pageView.refreshActiveProfileSelect();
		}
		function onNodeSaved(node) {
			if (node.id) {
				const id = String(node.id);
				const index = nodes.findIndex(item => item[0] === id);
				if (index >= 0)
					nodes[index] = [ id, node.name, node.protocol, node.server, node.port, nodes[index][5] ];
				pageView.localNodeDetails[id] = {
					id: id, name: node.name, protocol: node.protocol,
					server: node.server, port: node.port,
					enabled: nodes[index] ? nodes[index][5] : '1', data_json: node.data_json
				};
				if (!isTempId(id))
					queuePendingOperation(() => callUpdateNode(
						id, node.name, node.protocol, node.server, node.port, node.data_json
					), 'node-update:' + id);
				refreshNodeTable();
				refreshNodeCard();
				refreshProfileTable();
				refreshProfileAddButton();
				return;
			}

			const tempId = pageView.nextTempId('node');
			const row = [ tempId, node.name, node.protocol, node.server, node.port, '1' ];
			nodes.push(row);
			pageView.localNodeDetails[tempId] = {
				id: tempId, name: node.name, protocol: node.protocol,
				server: node.server, port: node.port, enabled: '1', data_json: node.data_json
			};
			queuePendingOperation(() => callAddNode(
				node.name, node.protocol, node.server, node.port, node.data_json
			).then(result => {
				if (!result || !result.success)
					return result;
				pageView.nodeIdMap[tempId] = String(result.node_id);
				return result;
			}), 'node-create:' + tempId);
			refreshNodeTable();
			refreshNodeCard();
			refreshProfileTable();
			refreshProfileAddButton();
		}
		function refreshProfileAddButton() {
			if (!profileAddButton)
				return;
			const enabled = nodes.some(row => isEnabled(row[5]));
			profileAddButton.disabled = !enabled;
			profileAddButton.classList.toggle('disabled', !enabled);
		}
		function onProfileSaved(profile) {
			const node = nodes.find(item => item[0] === profile.node_id);
			const row = [
				profile.id || pageView.nextTempId('profile'), profile.name, 'v2ray',
				node ? node[1] : '', '1', profile.node_id, profile.direct_dns,
				profile.transparent_proxy_ports, profile.bypass_china,
				profile.use_v2ray_dns, profile.mosdns_enabled,
				profile.mosdns_domains, profile.mosdns_match_rules
			];
			const id = row[0];
			const index = profiles.findIndex(item => item[0] === id);
			if (index >= 0)
				profiles[index] = row;
			else
				profiles.push(row);
			pageView.localProfileDetails[id] = Object.assign({ id: id, enabled: '1' }, profile);
			queuePendingOperation(() => callAddProfile(
				profile.name, pageView.resolveNodeId(profile.node_id),
				profile.direct_dns, profile.transparent_proxy_ports,
				profile.bypass_china, profile.use_v2ray_dns,
				profile.mosdns_enabled, profile.mosdns_domains,
				profile.mosdns_match_rules
			).then(result => {
				if (!result || !result.success)
					return result;
				pageView.profileIdMap[id] = String(result.profile_id);
				return result;
			}), 'profile-create:' + id);
			refreshProfileTable();
			refreshProfileCard();
		}
		nodeTable = table(nodeTableHeaders, nodeTableRows(), _('No nodes configured.'), true);
		profileTable = table(profileTableHeaders, profileTableRows(), _('No profiles configured.'), true);
		profileAddButton = E('button', {
			class: 'cbi-button cbi-button-add', type: 'button',
			click: () => showProfileModal(onProfileSaved, nodes, {
				direct_dns: '223.5.5.5:53',
				transparent_proxy_ports: '80,443,8080,8443',
				mosdns_domains: dnsState.mosdns_route_suffix || 'xn--ngstr-lra8j.com',
				mosdns_match_rules: dnsState.direct_rule || ''
			})
		}, _('Add'));
		pageView.resolveActiveProfile = function() {
			return this.resolveProfileId(activeProfile);
		};
		const originalPersistLocalChanges = pageView.persistLocalChanges;
		pageView.persistLocalChanges = function() {
			const initialActiveProfile = status.active_profile || '';
			return originalPersistLocalChanges.call(this).then(result => {
				if (!result || !result.success)
					return result;
				const resolvedActive = this.resolveProfileId(activeProfile);
				if (!activeProfile || String(resolvedActive) === String(initialActiveProfile))
					return result;
				return callSelectProfile(resolvedActive).then(selectResult => {
					if (selectResult && selectResult.success)
						this.activeProfileDirty = false;
					return selectResult;
				});
			});
		};
		refreshProfileAddButton();
		const nodesPane = [
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Proxy Nodes')),
				nodeTable,
				E('div', { class: 'v2rayb-create' }, [
					E('button', { class: 'cbi-button cbi-button-add', type: 'button', click: () => showNodeModal(pageView, onNodeSaved) }, _('Add'))
				])
			]),
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Profiles')),
				profileTable,
				E('div', { class: 'v2rayb-create' }, [ profileAddButton ])
			])
		];

		const effectiveDns = dnsState.direct_dns || '-';
		const dnsmasqDefault = dnsState.dnsmasq_default || (state === 'proxy' ? (dnsState.v2ray_dns_listen || '127.0.0.1#5353') : _('WAN DHCP DNS'));
		const v2rayDns = dnsState.v2ray_dns_listen || status.v2ray_dns_listen || '127.0.0.1#5353';
		const mosDns = dnsState.mosdns_listen || status.mosdns_listen || '127.0.0.1#5354';
		const dnsSuffix = dnsState.mosdns_route_suffix || 'xn--ngstr-lra8j.com';
		const directRule = dnsState.direct_rule || _('No direct regex rule configured');
		const accelFiles = dnsState.china_accel_files || '0';

		const dnsPipeline = table([ _('Order'), _('Component'), _('Listener / upstream') ], [
			[ '1', _('LAN client'), 'dnsmasq :53' ],
			[ '2', _('dnsmasq main resolver'), dnsmasqDefault ],
			[ '3', _('China acceleration'), `${dnsState.dnsmasq_confdir || '/etc/dnsmasq.d'} (${accelFiles})` ],
			[ '4', _('MosDNS narrow branch'), `${mosDns} ← *.${dnsSuffix}` ],
			[ '5', _('Direct match + nftset'), effectiveDns ],
			[ '6', _('Fallback'), v2rayDns ]
		], _('No DNS state data available.'));

		const runtimePane = [
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('DNS Resolution Chain')),
				dnsPipeline
			]),
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('MosDNS Narrow Route')),
				table([ _('Item'), _('Current value') ], [
					[ _('Forwarded suffix'), `*.${dnsSuffix}` ],
					[ _('MosDNS listener'), mosDns ],
					[ _('Direct DNS upstream'), effectiveDns ],
					[ _('Direct regexp'), E('code', {}, directRule) ]
				], _('No MosDNS route data available.'))
			]),
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('nftables Direct Sets')),
				table([ _('Source'), _('Runtime set'), _('Static set') ], [
					[ _('MosDNS direct answers'), dnsState.nft_direct_sets || 'direct4,direct6', dnsState.nft_direct_static_sets || 'direct_static4,direct_static6' ],
					[ _('Force-proxy answers'), dnsState.nft_force_proxy_sets || 'force_proxy4,force_proxy6,force_proxy', '-' ]
				], _('No nftables set data available.'))
			]),
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Effective Profile Policy')),
				table([ _('Item'), _('Effective value') ], [
					[ _('Applied profile'), activeProfileRow ? activeProfileRow[1] : _('Not selected') ],
					[ _('Direct DNS upstream'), effectiveDns ],
					[ _('Transparent TCP ports'), activeProfileRow ? (activeProfileRow[7] || '-') : '-' ]
				], _('No active profile policy available.'))
			])
		];

		const diagnosticsPane = [
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Runtime Diagnostics')),
				E('pre', { class: 'v2rayb-code' }, outputOf(data[0]) || _('No diagnostic output available.'))
			]),
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Applied V2Ray configuration')),
				E('p', { class: 'cbi-value-description' }, _('Contains credentials. Do not share.')),
				E('pre', { class: 'v2rayb-code' }, outputOf(data[5]) || _('No V2Ray configuration available.'))
			])
		];

		return E('div', { class: 'cbi-map v2rayb-shell' }, [
			css(),
			E('div', { class: 'v2rayb-hero' }, [
				E('h2', {}, _('v2rayB unified proxy')),
				E('div', { class: 'v2rayb-hero-meta' }, [
					E('span', { class: 'v2rayb-chip' }, [ _('Current state:'), statusBadge(state) ]),
					E('span', { class: 'v2rayb-chip' }, `${_('Profile')}: ${appliedProfile || _('none')}`),
					E('span', { class: 'v2rayb-chip' }, `${_('DNS')}: ${status.v2ray_dns_listen || '-'}`)
				])
			]),
			renderTabs([
				{ id: 'overview', title: _('Overview'), nodes: overview },
				{ id: 'nodes', title: _('Nodes and profiles'), nodes: nodesPane },
				{ id: 'runtime', title: _('DNS and proxy'), nodes: runtimePane },
				{ id: 'diagnostics', title: _('Diagnostics'), nodes: diagnosticsPane }
			])
		]);
	}
});
