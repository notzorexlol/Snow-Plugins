// Pin DMs mobile port. Copyright 2024 Vendicated and contributors.
// SPDX-License-Identifier: GPL-3.0-or-later
import { ui } from '../runtime.js';
import { registerSection } from '../settings-section.js';
import { patchLazySheet } from '../action-sheet.js';
import { createPinData, sectionsFor, DEFAULT_COLOR, SWATCHES } from './pin-dms-data.js';

export default function PinDms(r) {
    const { h, React, RN, store } = r, { Page, Text, Input, Button, Toggle } = ui(r);
    const data = createPinData(r);
    const channelStore = () => r.byStore('ChannelStore');
    const isDm = channel => channel && [1, 3].includes(channel.type);
    const getChannel = id => channelStore()?.getChannel?.(id);
    const recent = () => r.byStore('PrivateChannelSortStore')?.getPrivateChannelIds?.() || [];
    const selected = () => r.byStore('SelectedChannelStore')?.getChannelId?.();
    const sections = () => sectionsFor(data.categories(), store, recent(), selected(), id => isDm(getChannel(id)));
    const title = id => {
        const channel = getChannel(id);
        return channel?.name || channel?.recipients?.map(id => {
            const user = r.byStore('UserStore')?.getUser?.(id);
            return user?.globalName || user?.global_name || user?.username || 'Unknown user';
        }).join(', ') || 'Direct Message';
    };
    function openDm(id, close) {
        const navigation = r.find('transitionToChannel');
        if (!isDm(getChannel(id)) || !navigation) return r.toast('This DM is unavailable.');
        close?.(); navigation.transitionToChannel(id, {});
    }
    function guard(action, owner = data.userId()) { return async () => {
        if (!r.active) return;
        try {
            if (owner !== data.userId()) throw new Error('Account changed. Reopen this menu.');
            await action();
        } catch (e) { if (r.active) r.error('Pin DMs', e); }
    }; }
    function useStores() {
        r.useRefresh();
        React.useEffect(() => {
            if (!r.active) return;
            const stores = ['UserStore', 'ChannelStore', 'PrivateChannelSortStore', 'SelectedChannelStore', 'ReadStateStore'].map(name => r.byStore(name)).filter(Boolean);
            const update = () => { if (r.active) r.changed(); };
            for (const s of stores) s.addChangeListener?.(update);
            let disposed = false;
            const cleanup = () => { if (disposed) return; disposed = true; for (const s of stores) s.removeChangeListener?.(update); };
            r.own(cleanup);
            return cleanup;
        }, []);
    }
    function Editor({ categoryId, channelId, close }) {
        const category = data.categories().find(c => c.id === categoryId);
        const [name, setName] = React.useState(category?.name || `Pin Category ${data.categories().length + 1}`);
        const [color, setColor] = React.useState(`#${(category?.color ?? DEFAULT_COLOR).toString(16).padStart(6, '0')}`);
        const owner = React.useRef(data.userId());
        const [saving, setSaving] = React.useState(false);
        const pending = React.useRef(false);
        const savedId = React.useRef(categoryId);
        return h(Page, { title: categoryId ? 'Edit Category' : 'New Category', close },
            h(Text, null, 'Name'), h(Input, { value: name, onChange: setName }),
            h(Text, null, 'Color (#RRGGBB)'), h(Input, { value: color, onChange: setColor, autoCapitalize: 'none' }),
            h(RN.View, { style: { flexDirection: 'row', flexWrap: 'wrap' } }, ...SWATCHES.map(c => {
                const hex = '#' + c.toString(16).padStart(6, '0');
                return h(RN.Pressable, { key: c, accessibilityRole: 'button', accessibilityLabel: `Color ${hex}`, onPress: () => setColor(hex), style: { width: 32, height: 32, margin: 4, backgroundColor: hex, borderWidth: color === hex ? 3 : 0, borderColor: '#fff' } });
            })),
            h(Button, { text: saving ? 'Saving…' : 'Save', disabled: saving || !name.trim() || !/^#[0-9a-f]{6}$/i.test(color), onPress: guard(async () => {
                if (pending.current) return;
                if (owner.current !== data.userId()) throw new Error('Account changed. Reopen the category editor.');
                pending.current = true; setSaving(true);
                try {
                    // Retain the new ID while retrying a failed flush, rather than creating twice.
                    savedId.current = data.save(savedId.current, name, parseInt(color.slice(1), 16), channelId);
                    await r.api.storage.flush();
                    if (r.active && owner.current === data.userId()) close?.();
                } finally { pending.current = false; if (r.active) setSaving(false); }
            }) }));
    }
    function CategoryActions({ categoryId, close }) {
        useStores();
        const list = data.categories(), index = list.findIndex(c => c.id === categoryId), category = list[index];
        if (!category) return h(Page, { title: 'Category no longer exists', close });
        return h(Page, { title: category.name, close },
            h(Button, { text: 'Edit category', onPress: guard(() => { close?.(); r.open('category-edit', Editor, { categoryId }); }) }),
            h(Button, { text: category.collapsed ? 'Expand category' : 'Collapse category', onPress: guard(() => data.collapse(categoryId)) }),
            h(Button, { text: 'Move up', disabled: index === 0, onPress: guard(() => data.moveCategory(categoryId, -1)) }),
            h(Button, { text: 'Move down', disabled: index === list.length - 1, onPress: guard(() => data.moveCategory(categoryId, 1)) }),
            h(Button, { text: 'Delete category', onPress: guard(() => { data.remove(categoryId); close?.(); }) }));
    }
    function ChannelActions({ channelId, close }) {
        useStores();
        const category = data.categories().find(c => c.channels.includes(channelId));
        const index = category?.channels.indexOf(channelId) ?? -1;
        return h(Page, { title: title(channelId), close },
            category ? h(Button, { text: 'Unpin DM', onPress: guard(() => { data.unpin(channelId); close?.(); }) }) : null,
            category && store.pinOrder === 1 ? h(RN.View, null,
                h(Button, { text: 'Move up', disabled: index <= 0, onPress: guard(() => data.moveChannel(channelId, -1)) }),
                h(Button, { text: 'Move down', disabled: index >= category.channels.length - 1, onPress: guard(() => data.moveChannel(channelId, 1)) })) : null,
            ...data.categories().filter(c => c.id !== category?.id).map(c => h(Button, { key: c.id, text: `Pin in ${c.name}`, onPress: guard(() => { data.pin(channelId, c.id); close?.(); }) })),
            h(Button, { text: 'New category', onPress: guard(() => { close?.(); r.open('category-edit', Editor, { channelId }); }) }));
    }
    function Header({ section }) {
        const uncategorized = section.id === 'uncategorized';
        return h(RN.Pressable, {
            accessibilityRole: 'button', accessibilityLabel: section.name,
            accessibilityState: { expanded: !section.collapsed }, style: { padding: 12 },
            onPress: guard(() => uncategorized ? store.canCollapseDmSection && r.set('dmSectionCollapsed', !store.dmSectionCollapsed) : data.collapse(section.id)),
            onLongPress: uncategorized ? undefined : () => r.open('category-actions', CategoryActions, { categoryId: section.id }),
        }, h(Text, { heading: true, style: section.color != null ? { color: '#' + section.color.toString(16).padStart(6, '0') } : undefined }, `${section.collapsed ? '▸' : '▾'} ${section.name}`));
    }
    function DmRow({ id, close }) {
        const read = r.byStore('ReadStateStore');
        const unread = !!read?.hasUnread?.(id), count = read?.getMentionCount?.(id) || 0;
        const label = `${title(id)}${count ? ` (${count})` : ''}${unread ? ' •' : ''}`;
        const onPress = () => openDm(id, close), onLongPress = () => r.open('channel-actions', ChannelActions, { channelId: id });
        // TableRow does not declare onLongPress. Use the native Pressable contract.
        return h(RN.Pressable, { onPress, onLongPress, accessibilityRole: 'button',
            accessibilityState: { selected: id === selected() }, style: { padding: 12 } }, h(Text, null, label));
    }
    function PinsPage({ close }) {
        useStores();
        const list = sections();
        return h(RN.View, { style: { height: Math.max(420, (RN.Dimensions?.get('window')?.height || 640) * 0.75) } },
            h(Text, { heading: true }, 'Pin DMs'),
            h(Text, { muted: true }, 'Tap a category to collapse it. Hold a category or DM to edit, pin or reorder.'),
            h(Button, { text: 'New category', onPress: () => r.open('category-edit', Editor) }),
            RN.SectionList ? h(RN.SectionList, { sections: list, keyExtractor: id => id, renderItem: ({ item }) => h(DmRow, { id: item, close }), renderSectionHeader: ({ section }) => h(Header, { section }), stickySectionHeadersEnabled: false })
                : h(RN.ScrollView || RN.View, null, ...list.map(s => h(RN.View, { key: s.id }, h(Header, { section: s }), ...s.data.map(id => h(DmRow, { key: id, id, close }))))),
            close ? h(Button, { text: 'Close', onPress: close }) : null);
    }
    // Only adapt lists whose complete dataset consists of actual private-channel store records.
    // Unknown list representations are left alone and remain available through the settings page.
    function NativeList({ original }) {
        useStores();
        const props = original.props;
        const recordId = value => typeof value === 'string' ? value : value?.channel?.id || value?.id;
        const values = new Map(props.data.map(value => [recordId(value), value]));
        const list = sectionsFor(data.categories(), store, [...values.keys()], selected(), id => values.has(id));
        const originalIndices = new Map(props.data.map((v, i) => [recordId(v), i]));
        const rows = list.flatMap(s => [{ header: s, key: `mime-pins-${s.id}` }, ...s.data.map(id => ({ id,
            key: props.keyExtractor ? props.keyExtractor(values.get(id), originalIndices.get(id)) : id }))]);
        if (!r.active || !store.nativeList) return original;
        return React.cloneElement(original, {
            data: rows, extraData: store.userBasedCategoryList, getItemLayout: undefined,
            keyExtractor: item => item.key,
            renderItem: info => info.item.header ? h(Header, { section: info.item.header })
                : props.renderItem({ ...info, item: values.get(info.item.id), index: originalIndices.get(info.item.id) }),
            onViewableItemsChanged: undefined, initialScrollIndex: undefined,
        });
    }
    function adaptList(element) {
        const props = element.props;
        if (!store.nativeList || !Array.isArray(props?.data) || !props.data.length || typeof props.renderItem !== 'function') return;
        // Do not reinterpret arbitrary lists or search results.
        if (Object.getOwnPropertyDescriptor(props, 'ref')?.value || Object.getOwnPropertyDescriptor(element, 'ref')?.value || props.onViewableItemsChanged || props.viewabilityConfigCallbackPairs || props.initialScrollIndex != null || props.getItemLayout || props.searchQuery) return;
        if (!props.data.every(value => {
            const id = typeof value === 'string' ? value : value?.channel?.id || value?.id;
            const channel = getChannel(id);
            return isDm(channel) && (typeof value === 'string' || value === channel || value.channel === channel);
        })) return;
        const ids = new Set(props.data.map(value => typeof value === 'string' ? value : value.channel?.id || value.id));
        const inbox = recent().filter(id => isDm(getChannel(id)));
        if (ids.size !== inbox.length || !inbox.every(id => ids.has(id))) return;
        r.status.nativeList = true;
        return h(NativeList, { original: element });
    }
    function Settings({ close }) {
        useStores();
        return h(Page, { title: 'Pin DMs', close },
            h(Button, { text: 'Open pinned DMs', onPress: () => r.open('pins', PinsPage, {}, { scrollable: false }) }),
            h(Button, { text: `Order: ${store.pinOrder === 1 ? 'Custom' : 'Most recent message'}`, onPress: () => r.set('pinOrder', store.pinOrder === 1 ? 0 : 1) }),
            h(Toggle, { setting: 'canCollapseDmSection', label: 'Allow collapsing uncategorized DMs' }),
            h(Toggle, { setting: 'nativeList', label: 'Categories in compatible native DM lists' }),
            h(Text, { muted: true }, `Settings entry: ${r.status.settingsEntry ? 'registered' : 'unavailable'} · Native list: ${r.status.nativeList ? 'matched' : 'not yet matched; use Open pinned DMs'}`));
    }
    return { Settings, PinsPage, ChannelActions, CategoryActions, Editor, data, sections, adaptList, start() {
        r.status.settingsEntry = registerSection(r, { name: 'Pin DMs', items: [{ key: 'MIME_PIN_DMS', title: () => 'Pinned DMs', render: async () => ({ default: PinsPage }) }] });
        r.status.channelMenu = patchLazySheet(r, (_key, props) => isDm(props?.channel) && !props?.message
            ? { key: 'mime-pin-dms', label: 'Pin DMs', onPress: () => r.open('channel-actions', ChannelActions, { channelId: props.channel.id }) } : null);
        r.hook(['FlatList', 'AnimatedFlatList'], adaptList);
        // This documented mobile row exists even when the surrounding list format changes.
        r.hook(['MessagesItemChannelContent'], element => {
            const channel = element.props?.channel;
            if (!isDm(channel)) return;
            return h(RN.Pressable, { onLongPress: () => r.open('channel-actions', ChannelActions, { channelId: channel.id }) }, element);
        });
    } };
}
PinDms.defaults = { pinOrder: 0, canCollapseDmSection: false, dmSectionCollapsed: false, userBasedCategoryList: {}, nativeList: true };
