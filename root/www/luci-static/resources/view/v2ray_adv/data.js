'use strict';
'require view';
'require form';
'require uci';
'require rpc';
'require fs';
'require ui';

var callFsList = rpc.declare({
    object: 'file',
    method: 'list',
    params: ['path'],
    expect: { entries: [] }
});

var callUpdateScript = rpc.declare({
    object: 'file',
    method: 'exec',
    params: [ 'command', 'params' ],
    timeout: 600000 // 10 minutes
});

return view.extend({
    load: function () {
        return Promise.all([
            uci.load('v2ray_adv'),
            fs.stat('/usr/share/v2ray/geoip.dat').catch(function () { return null; }),
            fs.stat('/usr/share/v2ray/geosite.dat').catch(function () { return null; }),
            fs.stat('/etc/v2ray_adv/cn.ips').catch(function () { return null; }),
            fs.stat('/var/run/v2ray-adv-update.lock').catch(function () { return null; }),
            fs.read('/var/log/v2ray-adv-update.log').catch(function () { return null; })
        ]);
    },

    pollUpdate: function (btn, oldTitle) {
        var self = this;
        return Promise.all([
            fs.stat('/var/run/v2ray-adv-update.lock').catch(function () { return null; }),
            fs.read('/var/log/v2ray-adv-update.log').catch(function () { return null; })
        ]).then(function (results) {
            var st = results[0];
            var log = results[1];

            // Update log textarea if it exists
            var log_el = document.getElementById('update_log_content');
            if (log_el && log) {
                log_el.value = log;
                log_el.scrollTop = log_el.scrollHeight;
            }

            if (st) {
                // Still running, wait and poll again
                setTimeout(function () {
                    self.pollUpdate(btn, oldTitle);
                }, 3000);
            } else {
                // Finished
                ui.addNotification(null, E('p', [_('Update completed.')]), 'info');
                setTimeout(function() { window.location.reload(); }, 1000);
            }
        });
    },

    handleUpdate: function (type, optionName, section_id, ev) {
        console.log('v2ray_adv handleUpdate:', type, optionName, section_id, ev);
        var self = this;
        var btn = (ev && ev.currentTarget) ? ev.currentTarget : (ev && ev.target) ? ev.target : null;
        
        if (!btn || btn.nodeName !== 'BUTTON') {
             // Fallback: Try to find button by section_id if ev is lost or different
             btn = document.querySelector('.cbi-section[data-section-id="' + section_id + '"] button.cbi-button');
        }

        var oldTitle = (btn && btn.innerText) ? btn.innerText.trim() : _('Update Now');
        console.log('v2ray_adv button found:', btn, 'oldTitle:', oldTitle);

        if (btn) {
            btn.disabled = true;
            btn.innerText = _('Updating...');
        }

        // Get the current URL from UCI (or fallback to default)
        var url = uci.get('v2ray_adv', 'data', optionName);
        console.log('v2ray_adv update url:', url);

        if (!url) {
            ui.addNotification(null, E('p', [_('Update URL is empty. Please check your configuration.')]), 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerText = oldTitle;
            }
            return Promise.resolve();
        }

        // Trigger and don't wait for completion (async)
        return callUpdateScript('/usr/libexec/v2ray-adv-update', [type, url, '-b']).then(function(res) {
            console.log('v2ray_adv update RPC success:', res);
            ui.addNotification(null, E('p', [_('Update started in background.')]), 'info');
            
            // Give it a moment to create the lock file then start polling
            setTimeout(function () {
                self.pollUpdate(btn, oldTitle);
            }, 1000);
        }).catch(function(err) {
            console.error('v2ray_adv update RPC failed:', err);
            ui.addNotification(null, E('p', [_('Failed to trigger update: %s').format(err.message || _('Unknown error'))]), 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerText = oldTitle;
            }
        });
    },

    render: function (data) {
        var m, s, o;
        var stats = {
            'geoip': data[1],
            'geosite': data[2],
            'cn_ips': data[3],
            'is_updating': !!data[4]
        };

        m = new form.Map('v2ray_adv', _('Data Management'),
            _('Manage GeoIP, GeoSite, and CN IPSet data files. Keeping these updated ensures accurate routing and transparent proxying.'));

        s = m.section(form.NamedSection, 'data', 'data', _('Data Files'));
        s.anonymous = true;

        // --- GeoIP ---
        o = s.option(form.Value, 'geoip_url', _('GeoIP Update URL'));
        o.default = 'https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geoip.dat';

        o = s.option(form.DummyValue, '_geoip_info', _('GeoIP Version'));
        o.rawhtml = true;
        o.cfgvalue = function () {
            var st = stats['geoip'];
            if (!st) return E('em', { 'style': 'color:red;' }, [_('File not found')]);
            var date = new Date(st.mtime * 1000);
            return E('span', {}, [date.toLocaleString() + ' (' + (st.size / 1024 / 1024).toFixed(2) + ' MB)']);
        };

        o = s.option(form.Button, '_geoip_update', _('Update GeoIP'));
        o.inputstyle = 'apply';
        o.inputtitle = _('Update Now');
        o.onclick = L.bind(this.handleUpdate, this, 'geoip', 'geoip_url');

        // --- GeoSite ---
        o = s.option(form.Value, 'geosite_url', _('GeoSite Update URL'));
        o.default = 'https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geosite.dat';

        o = s.option(form.DummyValue, '_geosite_info', _('GeoSite Version'));
        o.rawhtml = true;
        o.cfgvalue = function () {
            var st = stats['geosite'];
            if (!st) return E('em', { 'style': 'color:red;' }, [_('File not found')]);
            var date = new Date(st.mtime * 1000);
            return E('span', {}, [date.toLocaleString() + ' (' + (st.size / 1024 / 1024).toFixed(2) + ' MB)']);
        };

        o = s.option(form.Button, '_geosite_update', _('Update GeoSite'));
        o.inputstyle = 'apply';
        o.inputtitle = _('Update Now');
        o.onclick = L.bind(this.handleUpdate, this, 'geosite', 'geosite_url');

        // --- CN IPSet ---
        o = s.option(form.Value, 'cn_ips_url', _('CN IPSet Update URL'));
        o.default = 'https://raw.githubusercontent.com/Loyalsoldier/geoip/release/text/cn.txt';

        o = s.option(form.DummyValue, '_cn_ips_info', _('CN IPSet Version'));
        o.rawhtml = true;
        o.cfgvalue = function () {
            var st = stats['cn_ips'];
            if (!st) return E('em', { 'style': 'color:red;' }, [_('File not found')]);
            var date = new Date(st.mtime * 1000);
            return E('span', {}, [date.toLocaleString() + ' (' + (st.size / 1024).toFixed(2) + ' KB)']);
        };

        o = s.option(form.Button, '_cn_ips_update', _('Update CN IPSet'));
        o.inputstyle = 'apply';
        o.inputtitle = _('Update Now');
        o.onclick = L.bind(this.handleUpdate, this, 'cn_ips', 'cn_ips_url');

        if (stats.is_updating) {
            m.description += '<br/><br/><em style="color:orange;">' + _('An update is currently in progress. Please wait...') + '</em>';
            s.render = function () {
                return form.NamedSection.prototype.render.apply(this, arguments).then(function(node) {
                    node.querySelectorAll('button').forEach(function (btn) { btn.disabled = true; });
                    return node;
                });
            };
            // Start polling if not already
            setTimeout(L.bind(this.pollUpdate, this, null, null), 5000);
        }

        var log_content = data[5];
        s = m.section(form.TypedSection, '_log_section', _('Update Log'));
        s.render = function() {
            return E('div', { 'class': 'cbi-section' }, [
                E('h3', [ _('Update Log') ]),
                E('textarea', {
                    'id': 'update_log_content',
                    'style': 'width:100%; height:300px; font-family:monospace; background:#000; color:#0f0; border:1px solid #333; padding:10px; border-radius: 4px;',
                    'readonly': 'readonly'
                }, [log_content || _('Waiting for log output...')])
            ]);
        };

        return m.render();
    }
});
