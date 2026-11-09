#!/bin/sh
set -eu

test_dir=$(mktemp -d /tmp/v2rayB-ucode-probe.XXXXXX)
trap 'rm -rf "$test_dir"' EXIT

cat > "$test_dir/probe.uc" <<'UCODE'
'use strict';
import { popen } from 'fs';

function shell_quote(value) {
	return "'" + replace('' + value, /'/g, "'\\''") + "'";
}

function run(args) {
	let command = '/usr/libexec/v2rayB/v2rayBctl';
	for (let i = 0; i < length(args); i++)
		command += ' ' + shell_quote(args[i]);
	let pipe = popen(command + ' 2>&1', 'r');
	if (!pipe)
		return { code: -1, output: 'Unable to start command' };
	let output = pipe.read('all') || '';
	let code = pipe.close();
	return { code: code, output: replace(output, /^\s+|\s+$/g, '') };
}

let data_json = '{"settings":{"vnext":[{"address":"proxy.example.com","port":443,"users":[{"id":"00000000-0000-4000-8000-000000000000","encryption":"none","level":1}]}]},"streamSettings":{"network":"h2","security":"tls","tlsSettings":{"allowInsecure":false,"serverName":"proxy.example.com"},"httpSettings":{"path":"/probe","host":["proxy.example.com"]}},"mux":{"enabled":true,"concurrency":8}}';
let node = run([ 'add-node', 'probe-node', 'vless', 'proxy.example.com', '443', data_json ]);
printf('NODE code=%s output=%s\n', node.code, node.output);
if (node.code == 0 && match(node.output, /^[0-9]+$/)) {
	let profile = run([ 'add-profile', 'probe-profile', node.output ]);
	printf('PROFILE code=%s output=%s\n', profile.code, profile.output);
	let nodes = run([ 'list-nodes' ]);
	let profiles = run([ 'list-profiles' ]);
	printf('NODES %s\nPROFILES %s\n', nodes.output, profiles.output);
}
UCODE

export V2RAYB_DB="$test_dir/db"
export V2RAYB_SCHEMA=/etc/v2rayB/schema.sql
export V2RAYB_STATE_DIR="$test_dir/state"
export V2RAYB_RULE_DIR="$test_dir/rules"
export V2RAYB_SQLITE3=/usr/bin/sqlite3
/usr/libexec/v2rayB/v2rayBctl init-db
ucode "$test_dir/probe.uc"
