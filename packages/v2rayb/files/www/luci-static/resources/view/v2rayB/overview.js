'use strict';
'require rpc';
'require ui';
'require view';

const callStatus = rpc.declare({
	object: 'luci.v2rayb', method: 'status', expect: { '': {} }
});
const callNodes = rpc.declare({
	object: 'luci.v2rayb', method: 'list_nodes', expect: { '': {} }
});
const callProfiles = rpc.declare({
	object: 'luci.v2rayb', method: 'list_profiles', expect: { '': {} }
});
const callGetSetting = rpc.declare({
	object: 'luci.v2rayb', method: 'get_setting', params: [ 'key' ], expect: { '': {} }
});
const callService = rpc.declare({
	object: 'luci.v2rayb', method: 'service_action', params: [ 'action' ], expect: { '': {} }, reject: true
});
const callSetSetting = rpc.declare({
	object: 'luci.v2rayb', method: 'set_setting', params: [ 'key', 'value' ], expect: { '': {} }, reject: true
});
const callSelectProfile = rpc.declare({
	object: 'luci.v2rayb', method: 'select_profile', params: [ 'profile_id' ], expect: { '': {} }, reject: true
});
const callAddProfile = rpc.declare({
	object: 'luci.v2rayb', method: 'add_profile', params: [ 'name', 'node_id' ], expect: { '': {} }, reject: true
});
const callAddNode = rpc.declare({
	object: 'luci.v2rayb', method: 'add_node',
	params: [ 'name', 'protocol', 'server', 'port', 'data_json' ], expect: { '': {} }, reject: true
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

function css() {
	return E('style', {}, `
		.v2rayb-shell { max-width: 1180px; }
		.v2rayb-hero { color: #fff; padding: 1.5rem 1.6rem; margin-bottom: 1rem; border-radius: 16px;
			background: linear-gradient(135deg, #17324d 0%, #286b78 100%); box-shadow: 0 12px 30px rgba(23,50,77,.18); }
		.v2rayb-hero h2 { margin: 0 0 .3rem; color: #fff; font-size: 1.65rem; }
		.v2rayb-hero p { margin: 0; color: rgba(255,255,255,.82); }
		.v2rayb-hero-meta { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1rem; }
		.v2rayb-chip { display: inline-flex; align-items: center; gap: .35rem; padding: .35rem .65rem;
			border: 1px solid rgba(255,255,255,.22); border-radius: 999px; color: #fff; font-size: .82rem; }
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
		.v2rayb-help { color: #687587; font-size: .88rem; line-height: 1.5; }
		.v2rayb-code { display: block; max-height: 20rem; overflow: auto; padding: 1rem; border-radius: 10px;
			background: #17212b; color: #cfe6e7; white-space: pre-wrap; font: .82rem/1.5 monospace; }
	`);
}

function field(label, control, help) {
	return E('div', { class: 'cbi-value' }, [
		E('label', { class: 'cbi-value-title' }, label),
		E('div', { class: 'cbi-value-field' }, [ control, help ? E('div', { class: 'v2rayb-help' }, help) : '' ])
	]);
}

function statusBadge(state) {
	let cls = 'v2rayb-status-off';
	if (state === 'proxy') cls = 'v2rayb-status-ok';
	else if (state === 'starting' || state === 'stopping' || state === 'degraded') cls = 'v2rayb-status-warn';
	const labels = { normal: _('Normal mode'), starting: _('Starting'), proxy: _('Proxy mode'), stopping: _('Stopping'), degraded: _('Degraded') };
	return E('span', { class: 'v2rayb-status ' + cls }, labels[state] || state || _('Unknown'));
}

function table(headers, rows, empty) {
	const body = rows.length ? rows.map((row, index) => E('tr', {
		class: 'tr cbi-section-table-row cbi-rowstyle-' + (index % 2 ? '2' : '1')
	}, row.map(value => E('td', { class: 'td cbi-section-table-cell' }, value || '')))) :
		[ E('tr', { class: 'tr cbi-section-table-row' }, [
			E('td', { class: 'td cbi-section-table-cell', colspan: headers.length }, E('em', {}, empty))
		]) ];
	return E('table', { class: 'table cbi-section-table v2rayb-table' }, [
		E('thead', { class: 'thead cbi-section-thead' }, E('tr', { class: 'tr cbi-section-table-titles' },
			headers.map(value => E('th', { class: 'th cbi-section-table-cell' }, value)))),
		E('tbody', { class: 'tbody cbi-section-tbody' }, body)
	]);
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

function actionButton(view, title, action, style) {
	return E('button', {
		class: 'cbi-button ' + style, type: 'button',
		click: ui.createHandlerFn(view, function() {
			return callService(action).then(result => notify(result, _('Service action completed.'), true));
		})
	}, title);
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
		}, [ E('span', { class: 'v2rayb-nav-title' }, pane.title), E('span', { class: 'v2rayb-nav-caption' }, pane.caption) ]);
		const panel = E('div', {
			class: 'v2rayb-panel', role: 'tabpanel', 'data-tab': pane.id,
			style: selected ? '' : 'display:none', 'aria-hidden': selected ? 'false' : 'true'
		}, pane.nodes);
		buttons.push(button); panels.push(panel);
	});
	return E('div', {}, [ E('div', { class: 'v2rayb-nav', role: 'tablist' }, buttons), E('div', {}, panels) ]);
}

function showNodeModal(view, onSaved) {
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
	const insecure = E('input', { type: 'checkbox' });
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
	const muxEnabled = E('input', { type: 'checkbox' });
	muxEnabled.checked = true;
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
	protocol.addEventListener('change', refresh);
	security.addEventListener('change', refresh);
	transport.addEventListener('change', refresh);
	tcpGuise.addEventListener('change', refresh);
	const save = E('button', { class: 'cbi-button cbi-button-apply', type: 'button', click: () => {
		if (!name.value || !server.value || !port.value || !uuid.value) {
			ui.addNotification(null, E('p', {}, _('Name, server, port and UUID/password are required.')), 'warning'); return;
		}
		save.disabled = true;
		const outbound = buildOutbound();
		return callAddNode(name.value, protocol.value, server.value, port.value, outbound)
			.then(result => {
				if (result && result.success) {
					ui.hideModal();
					if (onSaved)
						onSaved(result, {
							name: name.value, protocol: protocol.value, server: server.value, port: port.value
						});
				}
				notify(result, _('Node saved. Create a profile for it in the Profiles section.'));
			})
			.catch(error => showRequestError(error))
			.finally(() => { save.disabled = false; });
	}, }, _('Save node'));
	const cancel = E('button', { class: 'cbi-button', type: 'button', click: () => ui.hideModal() }, _('Cancel'));
	ui.showModal(_('Add proxy node'), [
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

return view.extend({
	load() {
		return Promise.all([
			L.resolveDefault(callStatus(), { output: '' }), L.resolveDefault(callNodes(), { output: '' }),
			L.resolveDefault(callProfiles(), { output: '' }), L.resolveDefault(callGetSetting('direct_dns'), { output: '223.5.5.5:53' })
		]);
	},

	render(data) {
		const status = parseKeyValues(outputOf(data[0]));
		const nodes = parseRows(outputOf(data[1]));
		const profiles = parseRows(outputOf(data[2]));
		const directDns = outputOf(data[3]) || '223.5.5.5:53';
		let activeProfile = status.active_profile || '';
		const state = status.state || 'normal';
		let enabledNodes = nodes.filter(row => row[5] === '1').length;
		let enabledProfiles = profiles.filter(row => row[4] === '1').length;

		const profileOptions = [ E('option', { value: '' }, _('Select a profile')) ];
		profiles.forEach(row => profileOptions.push(E('option', { value: row[0], selected: row[0] === activeProfile }, `${row[1]} (#${row[0]})`)));
		const profileSelect = E('select', { class: 'cbi-input-select' }, profileOptions);
		const newProfileName = E('input', { class: 'cbi-input-text', type: 'text', maxlength: '64' });
		const profileNodeOptions = [
			E('option', { value: '' }, _('Select a primary node')),
			...nodes.filter(row => row[5] === '1').map(row => E('option', { value: row[0] },
				`${row[1]} (${row[2].toUpperCase()} ${row[3]}:${row[4]})`))
		];
		const profileNodeSelect = E('select', { class: 'cbi-input-select' }, profileNodeOptions);
		const dnsInput = E('input', { class: 'cbi-input-text', type: 'text', value: directDns });
		const portsInput = E('input', { class: 'cbi-input-text', type: 'text', value: status.transparent_proxy_ports || '80,443,8080,8443' });
		const activeProfileCard = card(_('Active profile'), activeProfile || _('Not selected'), `${enabledProfiles} ${_('enabled profile(s)')}`);
		const nodesCard = card(_('Nodes'), `${enabledNodes} / ${nodes.length}`, _('Enabled nodes / total nodes'));

		const overview = [
			E('div', { class: 'v2rayb-cards' }, [
				card(_('Service'), statusBadge(state), _('Unified V2Ray, MosDNS, dnsmasq and nftables lifecycle')),
				activeProfileCard,
				nodesCard,
				card(_('DNS path'), state === 'proxy' ? _('V2Ray + MosDNS') : _('WAN / normal mode'), _('dnsmasq remains the primary resolver'))
			]),
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Service Control')),
				E('p', { class: 'v2rayb-help' }, _('Start and stop the complete v2rayB solution. The service owns its temporary DNS and firewall state and rolls it back on stop.')),
				E('div', { class: 'v2rayb-toolbar' }, [
					actionButton(this, _('Start'), 'start', 'cbi-button-apply'), actionButton(this, _('Restart'), 'restart', 'cbi-button-action'),
					actionButton(this, _('Stop'), 'stop', 'cbi-button-negative')
				])
			]),
			table([ _('Property'), _('Current value') ], [
				[ _('Engine'), status.active_engine || '-' ], [ _('Proxy mode'), status.proxy_mode || '-' ],
				[ _('Watchdog'), status.watchdog_enabled === '1' ? _('Enabled') : _('Disabled') ],
				[ _('MosDNS listener'), status.mosdns_listen || '-' ], [ _('V2Ray DNS listener'), status.v2ray_dns_listen || '-' ]
			], _('No status data available.'))
		];

		let profileTable, nodeTable;
		const profileTableHeaders = [ _('ID'), _('Name'), _('Engine'), _('Primary node'), _('State'), _('Selected') ];
		const nodeTableHeaders = [ _('ID'), _('Name'), _('Protocol'), _('Server'), _('Port'), _('State') ];

		function profileTableRows() {
			return profiles.map(row => [ row[0], row[1], row[2], row[3] || E('span', { class: 'v2rayb-muted' }, _('No node')),
				row[4] === '1' ? _('Enabled') : _('Disabled'), row[0] === activeProfile ? E('strong', {}, _('Active')) : '' ]);
		}
		function nodeTableRows() {
			return nodes.map(row => [ row[0], row[1], row[2].toUpperCase(), row[3], row[4], row[5] === '1' ? _('Enabled') : _('Disabled') ]);
		}
		function refreshNodeTable() {
			const next = table(nodeTableHeaders, nodeTableRows(), _('No nodes configured.'));
			nodeTable.replaceWith(next);
			nodeTable = next;
		}
		function refreshProfileTable() {
			const next = table(profileTableHeaders, profileTableRows(), _('No profiles configured.'));
			profileTable.replaceWith(next);
			profileTable = next;
		}
		function refreshNodeCard() {
			enabledNodes = nodes.filter(row => row[5] === '1').length;
			nodesCard.querySelector('.v2rayb-card-value').textContent = `${enabledNodes} / ${nodes.length}`;
		}
		function refreshProfileCard() {
			enabledProfiles = profiles.filter(row => row[4] === '1').length;
			activeProfileCard.querySelector('.v2rayb-card-value').textContent = activeProfile || _('Not selected');
			activeProfileCard.querySelector('.v2rayb-card-help').textContent = `${enabledProfiles} ${_('enabled profile(s)')}`;
		}
		function refreshProfileNodeOptions() {
			while (profileNodeSelect.firstChild)
				profileNodeSelect.removeChild(profileNodeSelect.firstChild);
			profileNodeSelect.appendChild(E('option', { value: '' }, _('Select a primary node')));
			nodes.filter(row => row[5] === '1').forEach(row => profileNodeSelect.appendChild(E('option', { value: row[0] },
				`${row[1]} (${row[2].toUpperCase()} ${row[3]}:${row[4]})`)));
		}
		function refreshProfileOptions() {
			while (profileSelect.firstChild)
				profileSelect.removeChild(profileSelect.firstChild);
			profileSelect.appendChild(E('option', { value: '' }, _('Select a profile')));
			profiles.forEach(row => profileSelect.appendChild(E('option', {
				value: row[0], selected: row[0] === activeProfile
			}, `${row[1]} (#${row[0]})`)));
		}
		function onNodeSaved(result, node) {
			const id = String(result.node_id);
			const row = [ id, node.name, node.protocol, node.server, node.port, '1' ];
			const index = nodes.findIndex(item => item[0] === id || item[1] === node.name);
			if (index >= 0)
				nodes[index] = row;
			else
				nodes.push(row);
			refreshNodeTable();
			refreshNodeCard();
			refreshProfileNodeOptions();
			createProfileButton.disabled = !nodes.some(item => item[5] === '1');
		}
		const createProfileButton = E('button', {
			class: 'cbi-button cbi-button-apply',
			type: 'button',
			disabled: !nodes.some(row => row[5] === '1'),
			click: () => {
				const name = newProfileName.value.trim();
				if (!name || !profileNodeSelect.value) {
					ui.addNotification(null, E('p', {}, _('Enter a profile name and select a primary node.')), 'warning');
					return;
				}
				if (profiles.some(row => row[1] === name)) {
					ui.addNotification(null, E('p', {}, _('A profile with this name already exists.')), 'warning');
					return;
				}

				createProfileButton.disabled = true;
				return callAddProfile(name, profileNodeSelect.value)
					.then(result => {
						if (result && result.success) {
							const id = String(result.profile_id);
							const node = nodes.find(row => row[0] === profileNodeSelect.value);
							profiles.push([ id, name, 'v2ray', node ? node[1] : '', '1' ]);
							activeProfile = id;
							newProfileName.value = '';
							refreshProfileTable();
							refreshProfileCard();
							refreshProfileOptions();
						}
						notify(result, _('Profile created and selected.'));
					})
					.catch(error => showRequestError(error))
					.finally(() => { createProfileButton.disabled = false; });
			}
		}, _('Create profile'));
		nodeTable = table(nodeTableHeaders, nodeTableRows(), _('No nodes configured.'));
		profileTable = table(profileTableHeaders, profileTableRows(), _('No profiles configured.'));
		const nodesPane = [
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Proxy Nodes')),
				E('p', { class: 'v2rayb-help' }, _('Nodes are stored in the v2rayB database. Use the structured editor to describe the endpoint; v2rayB generates the protocol-specific outbound configuration internally.')),
				E('div', { class: 'v2rayb-toolbar' }, [ E('button', { class: 'cbi-button cbi-button-apply', type: 'button', click: () => showNodeModal(this, onNodeSaved) }, _('Add node')) ]),
				nodeTable
			]),
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Profiles')), profileTable,
				E('h4', {}, _('Create a profile')),
				E('p', { class: 'v2rayb-help' }, _('Create a profile from a saved node. The new profile will become the active profile.')),
				field(_('Profile name'), newProfileName),
				field(_('Primary node'), profileNodeSelect),
				E('div', { class: 'v2rayb-toolbar' }, [ createProfileButton ]),
				field(_('Active profile'), profileSelect),
				E('button', { class: 'cbi-button cbi-button-apply', type: 'button', click: () => {
					if (!profileSelect.value) {
						ui.addNotification(null, E('p', {}, _('Select a profile first.')), 'warning');
						return;
					}
					return callSelectProfile(profileSelect.value)
						.then(result => {
							if (result && result.success) {
								activeProfile = profileSelect.value;
								refreshProfileTable();
								refreshProfileCard();
								refreshProfileOptions();
							}
							notify(result, _('Profile selected.'));
						})
						.catch(error => showRequestError(error));
				} }, _('Select profile'))
			])
		];

		const runtimePane = [ E('div', { class: 'cbi-section' }, [
			E('h3', {}, _('DNS and Transparent Proxy')),
			E('p', { class: 'v2rayb-help' }, _('dnsmasq remains the public DNS service. These values are used by v2rayB when proxy mode is active and are restored on stop.')),
			field(_('Direct DNS upstream'), dnsInput, _('Used by the MosDNS direct branch, for example 223.5.5.5:53.')),
			E('button', { class: 'cbi-button cbi-button-apply', type: 'button', click: () => callSetSetting('direct_dns', dnsInput.value).then(result => notify(result, _('Direct DNS saved.'))) }, _('Save DNS setting')),
			field(_('Transparent TCP ports'), portsInput, _('Comma-separated ports, for example 80,443,8080,8443.')),
			E('button', { class: 'cbi-button cbi-button-apply', type: 'button', click: () => callSetSetting('transparent_proxy_ports', portsInput.value).then(result => notify(result, _('Proxy ports saved.'))) }, _('Save port setting'))
		]) ];

		const diagnosticsPane = [ E('div', { class: 'cbi-section' }, [
			E('h3', {}, _('Runtime Diagnostics')),
			E('p', { class: 'v2rayb-help' }, _('This is a read-only snapshot. It does not start services or change router configuration.')),
			E('pre', { class: 'v2rayb-code' }, outputOf(data[0]) || _('No diagnostic output available.'))
		]) ];

		return E('div', { class: 'cbi-map v2rayb-shell' }, [
			css(),
			E('div', { class: 'v2rayb-hero' }, [
				E('h2', {}, _('v2rayB unified proxy')),
				E('p', {}, _('A single control plane for V2Ray, DNS routing and transparent proxy rules.')),
				E('div', { class: 'v2rayb-hero-meta' }, [
					E('span', { class: 'v2rayb-chip' }, [ _('Current state:'), statusBadge(state) ]),
					E('span', { class: 'v2rayb-chip' }, `${_('Profile')}: ${activeProfile || _('none')}`),
					E('span', { class: 'v2rayb-chip' }, `${_('DNS')}: ${status.v2ray_dns_listen || '-'}`)
				])
			]),
			renderTabs([
				{ id: 'overview', title: _('Overview'), caption: _('Status and service control'), nodes: overview },
				{ id: 'nodes', title: _('Nodes and profiles'), caption: _('Database-backed proxy entries'), nodes: nodesPane },
				{ id: 'runtime', title: _('DNS and proxy'), caption: _('Runtime policy settings'), nodes: runtimePane },
				{ id: 'diagnostics', title: _('Diagnostics'), caption: _('Read-only runtime details'), nodes: diagnosticsPane }
			])
		]);
	}
});
