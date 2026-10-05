// Native list adapter for Pin DMs. SPDX-License-Identifier: GPL-3.0-or-later
import { sectionsFor } from './pin-dms-data.js';

export function createInboxAdapter(r, { data, recent, selected, getChannel, Header }) {
    const { React, h, store } = r;
    const recordId = value => {
        const id = typeof value === 'string' ? value : value?.channel?.id || value?.channelId || value?.id;
        const channel = getChannel(id);
        if (![1, 3].includes(channel?.type)) return null;
        if (typeof value === 'string' || value === channel || value?.channel === channel || value?.channelId === id || value?.type === channel.type) return id;
        return null;
    };
    function inspect(props) {
        if (!Array.isArray(props?.data) || !props.data.length || typeof props.renderItem !== 'function'
            || props.horizontal || props.numColumns > 1 || props.searchQuery || props.stickyHeaderIndices?.length || props.inverted) return null;
        const ids = props.data.map(recordId), dmIds = ids.filter(Boolean), inbox = recent().filter(id => [1, 3].includes(getChannel(id)?.type));
        if (!dmIds.length || new Set(dmIds).size !== dmIds.length || dmIds.length !== inbox.length || !inbox.every(id => dmIds.includes(id))) return null;
        const first = ids.findIndex(Boolean), last = ids.length - 1 - [...ids].reverse().findIndex(Boolean);
        if (ids.slice(first, last + 1).some(id => !id)) return null;
        return { ids, first, last };
    }
    function NativeInbox({ original }) {
        r.useRefresh();
        React.useEffect(() => {
            const stores = ['UserStore', 'ChannelStore', 'PrivateChannelSortStore', 'SelectedChannelStore'].map(name => r.byStore(name)).filter(Boolean);
            const update = () => { if (r.active) r.changed(); };
            if (!r.active) return;
            stores.forEach(s => s.addChangeListener?.(update));
            let done = false;
            const stop = () => { if (done) return; done = true; stores.forEach(s => s.removeChangeListener?.(update)); };
            r.own(stop); return stop;
        }, []);
        const props = original.props, shape = inspect(props), current = React.useRef(null);
        const sourceRef = Object.getOwnPropertyDescriptor(props, 'ref')?.value || Object.getOwnPropertyDescriptor(original, 'ref')?.value;
        const rows = [], indexMap = new Map();
        if (shape) {
            const entries = props.data.map((item, index) => ({ item, index, id: shape.ids[index], key: String(props.keyExtractor ? props.keyExtractor(item, index) : item?.key ?? item?.id ?? index) }));
            const byId = new Map(entries.filter(e => e.id).map(e => [e.id, e]));
            const sections = sectionsFor(data.categories(), store, shape.ids.filter(Boolean), selected(), id => byId.has(id));
            rows.push(...entries.slice(0, shape.first));
            for (const section of sections) {
                const headerIndex = rows.length;
                rows.push({ header: section, key: `mime-pin-header:${section.id}` });
                // Imperative navigation to a collapsed DM lands on its category header.
                for (const id of section.id === 'uncategorized' ? [...byId.keys()].filter(id => !data.categories().some(c => c.channels.includes(id))) : section.channels) {
                    if (byId.has(id)) indexMap.set(byId.get(id).index, headerIndex);
                }
                rows.push(...section.data.map(id => byId.get(id)));
            }
            rows.push(...entries.slice(shape.last + 1));
            rows.forEach((row, index) => { if (!row.header) indexMap.set(row.index, index); });
        }
        const enabled = !!shape && r.active && store.nativeList;
        current.current = { rows, indexMap, enabled, props };
        const bridgeRef = React.useMemo(() => node => {
            const value = node && new Proxy(node, { get(target, key) {
                if (key === 'scrollToIndex') return options => {
                    const state = current.current;
                    return target.scrollToIndex({ ...options, index: state.enabled ? state.indexMap.get(options.index) ?? options.index : options.index });
                };
                if (key === 'scrollToItem') return options => {
                    const state = current.current;
                    const item = state.enabled ? state.rows.find(row => row.item === options.item) : options.item;
                    if (item) return target.scrollToItem({ ...options, item });
                    const index = state.props.data.indexOf(options.item);
                    if (index >= 0) return target.scrollToIndex({ ...options, index: state.indexMap.get(index) });
                };
                const member = Reflect.get(target, key, target);
                return typeof member === 'function' ? member.bind(target) : member;
            } });
            if (typeof sourceRef === 'function') return sourceRef(value);
            if (sourceRef) sourceRef.current = value;
        }, [sourceRef]);
        const remapViews = callback => payload => {
            if (!current.current.enabled) return callback(payload);
            const convert = tokens => tokens.filter(t => t.item && !t.item.header).map(t => ({ ...t, item: t.item.item, index: t.item.index, key: t.item.key }));
            return callback({ ...payload, viewableItems: convert(payload.viewableItems), changed: convert(payload.changed) });
        };
        const onViewableItemsChanged = React.useMemo(() => props.onViewableItemsChanged && remapViews(props.onViewableItemsChanged), [props.onViewableItemsChanged]);
        const viewabilityConfigCallbackPairs = React.useMemo(() => props.viewabilityConfigCallbackPairs?.map(pair => ({ ...pair, onViewableItemsChanged: remapViews(pair.onViewableItemsChanged) })), [props.viewabilityConfigCallbackPairs]);
        if (!enabled) return React.cloneElement(original, { ...(sourceRef ? { ref: bridgeRef } : {}), onViewableItemsChanged, viewabilityConfigCallbackPairs });
        return React.cloneElement(original, {
            data: rows, ...(sourceRef ? { ref: bridgeRef } : {}), extraData: { host: props.extraData, pins: store.userBasedCategoryList, order: store.pinOrder, collapsed: store.dmSectionCollapsed },
            keyExtractor: row => row.key,
            renderItem: info => info.item.header ? h(Header, { section: info.item.header }) : props.renderItem({ ...info, item: info.item.item, index: info.item.index }),
            getItemType: row => row.header ? 'mime-pin-header' : props.getItemType?.(row.item, row.index, props.extraData) ?? 'mime-original-row',
            overrideItemLayout: props.overrideItemLayout ? (layout, row, _index, maxColumns) => row.header ? Object.assign(layout, { size: 48, span: 1 }) : props.overrideItemLayout(layout, row.item, row.index, maxColumns, props.extraData) : undefined,
            getItemLayout: props.getItemLayout ? (_data, index) => {
                const length = row => row.header ? 48 : props.getItemLayout(props.data, row.index).length;
                const gap = (row, next) => {
                    if (row.header || next?.header || row.index + 1 >= props.data.length) return 0;
                    const here = props.getItemLayout(props.data, row.index), after = props.getItemLayout(props.data, row.index + 1);
                    return Math.max(0, after.offset - here.offset - here.length);
                };
                return { index, length: length(rows[index]), offset: rows.slice(0, index).reduce((sum, row, i) => sum + length(row) + gap(row, rows[i + 1]), props.getItemLayout(props.data, 0).offset || 0) };
            } : undefined,
            initialScrollIndex: props.initialScrollIndex == null ? undefined : indexMap.get(props.initialScrollIndex),
            onViewableItemsChanged, viewabilityConfigCallbackPairs,
            ItemSeparatorComponent: props.ItemSeparatorComponent ? info => info.leadingItem?.header || info.trailingItem?.header ? null : h(props.ItemSeparatorComponent, { ...info, leadingItem: info.leadingItem?.item, trailingItem: info.trailingItem?.item }) : undefined,
        });
    }
    return element => {
        if (!store.nativeList || !inspect(element?.props)) return;
        r.status.nativeList = true;
        return h(NativeInbox, { ...(element.key != null ? { key: element.key } : {}), original: element });
    };
}
