'use strict';
'require view';
'require form';
'require uci';
'require ui';
'require fs';
'require rpc';

return view.extend({
    load: function () {
        return Promise.all([
            uci.load('v2ray_adv'),
            fs.exec('/usr/libexec/v2ray-adv-config').then(function (res) {
                return res.stdout || null;
            }).catch(function (err) {
                console.error('V2Ray Config Error:', err);
                // Fallback to reading file if exec fails
                return fs.read('/var/etc/v2ray_adv/v2ray.json').catch(function () { return null; });
            })
        ]);
    },

    render: function (data) {
        var m, s, o;
        var config_content = data[1] || _('Configuration file not found or service not started.');

        m = new form.Map('v2ray_adv', _('Configuration File'),
            _('Here you can preview the generated V2Ray configuration and provide custom JSON snippets.'));

        var enabled = uci.get('v2ray_adv', 'main', 'enabled') === '1';
        if (!enabled) {
            s = m.section(form.NamedSection, 'main', 'global', _('Service Status'));
            o = s.option(form.DummyValue, '_status_warning');
            o.rawhtml = true;
            o.cfgvalue = function () {
                return E('div', { 'class': 'alert-message warning' }, [
                    E('b', {}, [_('Service is disabled!')]),
                    E('br'),
                    _('The configuration below might be stale. Please enable the service in Global Settings to regenerate.')
                ]);
            };
        }

        s = m.section(form.NamedSection, 'main', 'global', _('Generated Configuration (Read-only)'));

        o = s.option(form.DummyValue, '_config_preview', _('JSON Preview'));
        o.rawhtml = true;
        o.cfgvalue = function () {
            var formatted_json = config_content;
            try {
                formatted_json = JSON.stringify(JSON.parse(config_content), null, 4);
            } catch (e) { }
            return E('pre', { 'style': 'background:#f4f4f4; padding:10px; border:1px solid #ccc; max-height:400px; overflow:auto; white-space:pre-wrap; word-wrap:break-word;' }, [formatted_json]);
        };

        s = m.section(form.NamedSection, 'main', 'global', _('Custom Configuration'));

        o = s.option(form.Flag, 'override_config', _('Total Override'), _('If enabled, the custom JSON below will completely replace the generated configuration.'));
        o.rmempty = false;

        o = s.option(form.TextValue, 'custom_json', _('Custom JSON Snippet'), _('Enter valid JSON to be merged or used as override. Use with caution.'));
        o.rows = 15;
        o.wrap = 'off';
        o.validate = function (section_id, value) {
            if (!value) return true;
            try {
                JSON.parse(value);
                return true;
            } catch (e) {
                return _('Invalid JSON format: ') + e.message;
            }
        };

        return m.render();
    }
});
