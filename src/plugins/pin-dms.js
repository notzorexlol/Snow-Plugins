// Pin DMs mobile port. Copyright 2024 Vendicated and contributors.
// SPDX-License-Identifier: GPL-3.0-or-later
import { ui } from '../runtime.js';
import { registerSection } from '../settings-section.js';
import { appendAction, patchLazySheet } from '../action-sheet.js';
import { createInboxAdapter } from './pin-dms-list.js';
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
            accessibilityState: { expanded: !section.collapsed }, style: { height: 48, paddingHorizontal: 12, justifyContent: 'center' },
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
    const adaptList = createInboxAdapter(r, { data, recent, selected, getChannel, Header });
    function menuChannel(props) {
        if (props?.message) return null;
        const channel = props?.channel || getChannel(props?.channelId);
        if (isDm(channel)) return channel;
        const userId = props?.userId || props?.user?.id;
        return userId ? recent().map(getChannel).find(c => c?.type === 1 && c.recipients?.includes(userId)) : null;
    }
    function menuItem(props) {
        const channel = menuChannel(props);
        if (!channel) return null;
        return { key: 'mime-pin-dms', label: 'Pin DMs', onPress: guard(() => r.open('channel-actions', ChannelActions, { channelId: channel.id })) };
    }
    function patchChannelMenu() {
        // Rain permissionviewer/jumptotop show this module returning a second component.
        // Wrap that returned element, retaining each opening's props and original actions.
        const module = r.byName('ChannelLongPressActionSheet', true);
        const wrappers = new WeakMap();
        return r.patch('after', module, 'default', (_args, element) => {
            if (!r.active || !React.isValidElement(element) || !menuItem(element.props)) return;
            const Original = element.type;
            if (typeof Original !== 'function' || Original.prototype?.isReactComponent) return;
            if (!wrappers.has(Original)) wrappers.set(Original, function WithPinActions(props) {
                const tree = Original(props), item = r.active ? menuItem(props) : null;
                if (!item) return tree;
                return appendAction(r, tree, { ...item, onPress: () => {
                    if (!r.active) return;
                    r.find('hideActionSheet')?.hideActionSheet();
                    item.onPress();
                } });
            });
            const ref = Object.getOwnPropertyDescriptor(element, 'ref')?.value || Object.getOwnPropertyDescriptor(element.props, 'ref')?.value;
            if (ref) return;
            return h(wrappers.get(Original), { ...element.props, key: element.key });
        });
    }
    function Settings({ close }) {
        useStores();
        return h(Page, { title: 'Pin DMs', close },
            h(Button, { text: 'Open pinned DMs', onPress: () => r.open('pins', PinsPage, {}, { scrollable: false }) }),
            h(Button, { text: `Order: ${store.pinOrder === 1 ? 'Custom' : 'Most recent message'}`, onPress: () => r.set('pinOrder', store.pinOrder === 1 ? 0 : 1) }),
            h(Toggle, { setting: 'canCollapseDmSection', label: 'Allow collapsing uncategorized DMs' }),
            h(Toggle, { setting: 'nativeList', label: 'Categories in compatible native DM lists' }),
            h(Text, { muted: true }, `Hold a DM to add a category or pin it. ${r.status.nativeList ? 'Categories are connected to your DM list.' : 'Open your DM list to connect categories; Open pinned DMs is also available.'}`));
    }
    function wrapDmRow(element, props = element.props) {
        const channel = props?.channel;
        if (!isDm(channel)) return;
        const open = guard(() => r.open('channel-actions', ChannelActions, { channelId: channel.id }));
        return h(RN.Pressable, {
            ...(element.key != null ? { key: element.key } : {}),
            onPress: event => { event?.stopPropagation?.(); if (props.onPress) props.onPress(event); else openDm(channel.id); },
            onLongPress: event => { event?.stopPropagation?.(); open(); },
            accessibilityActions: [{ name: 'pin-dms', label: 'Pin DMs' }],
            onAccessibilityAction: event => { if (event.nativeEvent.actionName === 'pin-dms') open(); },
        }, element);
    }
    return { Settings, PinsPage, ChannelActions, CategoryActions, Editor, data, sections, adaptList, start() {
        r.status.settingsEntry = registerSection(r, { name: 'Pin DMs', items: [{ key: 'MIME_PIN_DMS', title: () => 'Pinned DMs', render: async () => ({ default: PinsPage }) }] });
        r.status.channelMenu = !!patchChannelMenu();
        const lazyMenu = patchLazySheet(r, (_key, props) => menuItem(props));
        r.status.channelMenu = r.status.channelMenu || !!lazyMenu;
        r.hook(['FlatList', 'AnimatedFlatList', 'FlashList'], adaptList);
        // Bind by export identity as well as name: production component names can be minified.
        const FlashList = r.D.FlashList || r.find('FlashList')?.FlashList;
        if (FlashList) r.patch('after', React, 'createElement', (args, result) => args[0] === FlashList ? adaptList(result) : undefined);
        let rowModule;
        try { rowModule = r.B.metro.findByTypeName?.('MessagesItemChannelContent'); } catch {}
        const rowPatched = r.patch('after', rowModule, 'type', (args, result) => r.active && React.isValidElement(result) ? wrapDmRow(result, args[0]) : undefined);
        if (!rowPatched) r.hook(['MessagesItemChannelContent'], element => wrapDmRow(element));
    } };
}
PinDms.defaults = { pinOrder: 0, canCollapseDmSection: false, dmSectionCollapsed: false, userBasedCategoryList: {}, nativeList: true };
