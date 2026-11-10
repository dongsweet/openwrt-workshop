#!/usr/bin/ucode

'use strict';

const fs = require('fs');

let events = [];
let enabled = '0';

function read_result(file) {
	if (!fs.access(file))
		return '';
	return trim(fs.readfile(file));
}

const ctl_path = '/tmp/v2rayb-service-enabled-ctl';
const init_path = '/tmp/v2rayb-service-enabled-init';
const event_path = '/tmp/v2rayb-service-enabled-events';

function run(path, args) {
	push(events, path + ':' + join(',', args));
	return { code: 0, output: '' };
}

function ctl(args) {
	if (args[0] == 'set-setting' && args[1] == 'service_enabled')
		enabled = args[2];
	return run(ctl_path, args);
}

function failed(result) {
	return { success: false, error: result.output || 'command failed' };
}

function string_arg(request, key) {
	let value = request?.args?.[key];
	return type(value) == 'string' ? value : '';
}

const handlers = {
	set_service_enabled: {
		args: { enabled: '' },
		call: function(request) {
			let state = string_arg(request, 'enabled');
			if (!match(state, /^[01]$/))
				return { success: false, error: 'Invalid service enabled state' };

			if (state == '1') {
				let setting = ctl([ 'set-setting', 'service_enabled', '1' ]);
				if (setting.code != 0)
					return failed(setting);
				let boot = run(init_path, [ 'enable' ]);
				if (boot.code != 0)
					return failed(boot);
				let start = run(init_path, [ 'start' ]);
				return start.code == 0 ? { success: true } : failed(start);
			}

			let stop = run(init_path, [ 'stop' ]);
			if (stop.code != 0)
				return failed(stop);
			let setting = ctl([ 'set-setting', 'service_enabled', '0' ]);
			if (setting.code != 0)
				return failed(setting);
			let boot = run(init_path, [ 'disable' ]);
			return boot.code == 0 ? { success: true } : failed(boot);
		}
	}
};

let result = handlers.set_service_enabled.call({ args: { enabled: '1' } });
if (!result.success || enabled != '1' || join(',', events) !=
    ctl_path + ':set-setting,service_enabled,1,' +
    init_path + ':enable,' + init_path + ':start')
	exit(1);

events = [];
result = handlers.set_service_enabled.call({ args: { enabled: '0' } });
if (!result.success || enabled != '0' || join(',', events) !=
    init_path + ':stop,' + ctl_path + ':set-setting,service_enabled,0,' +
    init_path + ':disable')
	exit(1);

print('service enabled tests: ok\n');
