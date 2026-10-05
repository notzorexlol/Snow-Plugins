// Mobile menu surface identified from Rain viewraw (MPL-2.0).
// SPDX-License-Identifier: MPL-2.0
export function mapTree(React, node, transform) {
    const replacement = transform(node);
    if (replacement !== undefined) return replacement;
    if (Array.isArray(node)) return node.map(child => mapTree(React, child, transform));
    if (!React.isValidElement(node) || node.props.children == null) return node;
    return React.cloneElement(node, {}, mapTree(React, node.props.children, transform));
}

export function appendAction(r, tree, item) {
    let inserted = false;
    const name = node => node?.type?.displayName || node?.type?.name || node?.type?.type?.name;
    const result = mapTree(r.React, tree, node => {
        if (inserted || !Array.isArray(node)) return;
        const sample = node.find(n => name(n) === 'ButtonRow' || name(n) === 'ActionSheetRow');
        if (!sample || node.some(n => n?.key === item.key)) return;
        inserted = true;
        const Row = name(sample) === 'ButtonRow' ? (r.D.Forms?.FormRow || r.C.Forms?.FormRow || sample.type) : sample.type;
        return [...node, r.h(Row, { key: item.key, label: item.label, onPress: item.onPress, ...(item.icon ? { icon: item.icon, leading: item.icon } : {}) })];
    });
    return inserted ? result : tree;
}

export function patchLazySheet(r, getItem) {
    const sheets = r.find('openLazy', 'hideActionSheet');
    if (!sheets || !r.api.patcher?.before) return false;
    // Wrap this opening's component promise, never patch a shared module with a stale message.
    return r.patch('before', sheets, 'openLazy', args => {
        const [pending, key, props] = args;
        const item = getItem(key, props);
        if (!item || !pending?.then) return;
        args[0] = pending.then(module => {
            if (!r.active || typeof module?.default !== 'function' || module.default.prototype?.isReactComponent) return module;
            const Original = module.default;
            function WithAction(screenProps) {
                const tree = Original(screenProps);
                const current = r.active ? getItem(key, screenProps?.message || screenProps?.channel ? screenProps : props) : null;
                if (!current) return tree;
                return appendAction(r, tree, { ...current, onPress: () => {
                    if (!r.active) return;
                    sheets.hideActionSheet();
                    Promise.resolve().then(() => current.onPress()).catch(error => { if (r.active) r.error(current.label, error); });
                } });
            }
            return { ...module, default: WithAction };
        });
    });
}
