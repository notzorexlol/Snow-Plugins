// Settings registration adapted from Rain's _core/settings (MPL-2.0).
// SPDX-License-Identifier: MPL-2.0
// Uses the same section/row contract and SETTING_RENDERER_CONFIG/createList surface.
export function registerSection(r, section) {
    // The guide explicitly exposes empty ui.settings/api.settings objects.
    // This is a Rain-derived runtime integration, not a Snow facade method.
    const constants = r.find('SETTING_RENDERER_CONFIG');
    const lists = r.find('createList');
    if (!constants || !lists || !r.api.patcher?.before) return false;
    const navigationRef = r.find('getRootNavigationRef');
    const navigation = r.common.NavigationNative;
    const routeName = 'MIME_PLUGIN_SETTINGS_PAGE';
    const canNavigate = navigationRef && navigation?.useRoute && navigation?.useNavigation;
    const key = Symbol.for('mime.snow.settingsSections.v2');
    let hub = constants[key];
    if (!hub) {
        const descriptor = Object.getOwnPropertyDescriptor(constants, 'SETTING_RENDERER_CONFIG');
        if (!descriptor?.configurable) return false;
        const entries = new Map();
        let value = constants.SETTING_RENDERER_CONFIG;
        function CustomPageRenderer() {
            const route = navigation.useRoute();
            const nav = navigation.useNavigation();
            r.React.useEffect(() => { nav.setOptions({ title: route.params.title, headerShown: route.params.headerShown !== false }); }, [nav, route.params.title, route.params.headerShown]);
            return route.params.render();
        }
        const get = () => {
            const base = descriptor.get ? descriptor.get.call(constants) : value;
            const extra = {};
            if (canNavigate) extra[routeName] = {
                type: 'route', useTitle: () => 'Plugin',
                screen: { route: routeName, getComponent: () => CustomPageRenderer },
            };
            for (const { runtime, section: s } of entries.values()) for (const row of s.items) {
                extra[row.key] = {
                    type: 'pressable', icon: row.icon,
                    IconComponent: row.IconComponent || (() => null),
                    useTitle: row.title, usePredicate: row.usePredicate,
                    useTrailing: row.useTrailing, withArrow: true,
                    onPress: row.onPress || (async () => {
                        try {
                            const page = await row.render();
                            if (!runtime.active) return;
                            if (canNavigate) {
                                const nav = navigationRef.getRootNavigationRef();
                                nav.navigate(routeName, { title: row.title(), headerShown: row.headerShown, owner: runtime.meta.id,
                                    render: () => runtime.active ? runtime.h(page.default, { close: () => nav.goBack() }) : null });
                            } else runtime.open(row.key, page.default, {}, { scrollable: false });
                        } catch (error) { if (runtime.active) runtime.error('Open settings page', error); }
                    }),
                    ...row.rawTabsConfig,
                };
            }
            return { ...base, ...extra };
        };
        Object.defineProperty(constants, 'SETTING_RENDERER_CONFIG', {
            configurable: true, enumerable: descriptor.enumerable, get,
            set: descriptor.set ? v => descriptor.set.call(constants, v) : v => { value = v; },
        });
        hub = { entries, close() {
            if (Object.getOwnPropertyDescriptor(constants, 'SETTING_RENDERER_CONFIG')?.get === get) {
                Object.defineProperty(constants, 'SETTING_RENDERER_CONFIG', descriptor.get ? descriptor : { ...descriptor, value });
            }
            delete constants[key];
        } };
        Object.defineProperty(constants, key, { value: hub, configurable: true });
    }
    const id = Symbol(section.name);
    hub.entries.set(id, { runtime: r, section });
    // Each plugin owns its own scoped list patch. A shared patch would be removed
    // by Snow when its first owner stops, even if another section still needs it.
    r.patch('before', lists, 'createList', args => {
        if (!r.active) return;
        const config = args[0];
        if (!config?.sections?.some(s => s.settings?.includes('ACCOUNT'))) return;
        const sections = config.sections.map(s => ({ ...s, settings: s.settings ? [...s.settings] : s.settings }));
        const keys = section.items.map(row => row.key);
        const existing = sections.find(s => s.label === section.name);
        if (existing) existing.settings = [...new Set([...(existing.settings || []), ...keys])];
        else sections.unshift({ label: section.name, title: section.name, settings: keys });
        args[0] = { ...config, sections };
    });
    r.own(() => {
        if (canNavigate) {
            const nav = navigationRef.getRootNavigationRef();
            const current = nav?.getCurrentRoute?.();
            if (current?.name === routeName && current.params?.owner === r.meta.id) nav.goBack();
        }
        hub.entries.delete(id);
        if (!hub.entries.size) hub.close();
    });
    return true;
}
