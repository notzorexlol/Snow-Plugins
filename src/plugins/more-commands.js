import { ui } from '../runtime.js';
import { sendFavoriteGif } from './gif-roulette.js';

const faces = [
    ['dissatisfaction', ' ＞﹏＜'], ['smug', 'ಠ_ಠ'], ['happy', 'ヽ(´▽`)/'], ['crying', 'ಥ_ಥ'],
    ['angry', 'ヽ(｀Д´)ﾉ'], ['anger', 'ヽ(ｏ`皿′ｏ)ﾉ'], ['joy', '<(￣︶￣)>'], ['blush', '૮ ˶ᵔ ᵕ ᵔ˶ ა'],
    ['confused', '(•ิ_•ิ)?'], ['sleeping', '(ᴗ_ᴗ)'], ['laughing', 'o(≧▽≦)o'], ['giving', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧'],
    ['peace', '✌(◕‿-)✌'], ['ending1', 'Ꮺ ָ࣪ ۰ ͙⊹'], ['uwu', '(>⩊<)'], ['comfy', '(─‿‿─)♡'],
    ['lovehappy', '(*≧ω≦*)'], ['loveee', '(⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)'], ['give', '(ノ= ⩊ = )ノ'],
    ['lovegive', 'ღゝ◡╹)ノ♡'], ['music', '(￣▽￣)/♫•¨•.¸¸♪'], ['stars', '.𖥔 ݁ ˖๋ ࣭ ⭑'],
    ['lovegiving', '⸜(｡˃ ᵕ ˂ )⸝♡'],
];

const freakyMap = {
    q: '𝓺', w: '𝔀', e: '𝓮', r: '𝓻', t: '𝓽', y: '𝔂', u: '𝓾', i: '𝓲', o: '𝓸', p: '𝓹',
    a: '𝓪', s: '𝓼', d: '𝓭', f: '𝓯', g: '𝓰', h: '𝓱', j: '𝓳', k: '𝓴', l: '𝓵', z: '𝔃',
    x: '𝔁', c: '𝓬', v: '𝓿', b: '𝓫', n: '𝓷', m: '𝓶', Q: '𝓠', W: '𝓦', E: '𝓔', R: '𝓡',
    T: '𝓣', Y: '𝓨', U: '𝓤', I: '𝓘', O: '𝓞', P: '𝓟', A: '𝓐', S: '𝓢', D: '𝓓', F: '𝓕',
    G: '𝓖', H: '𝓗', J: '𝓙', K: '𝓚', L: '𝓛', Z: '𝓩', X: '𝓧', C: '𝓒', V: '𝓥', B: '𝓑',
    N: '𝓝', M: '𝓜',
};
const morseMap = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---',
    K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
    U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
    0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.', ' ': '/',
};
const endings = ['rawr x3', 'OwO', 'UwU', ':3', 'nyaa~~', '^^', '🥺', 'XD', '(ˆ ﻌ ˆ)♡'];
const replacements = [['small', 'smol'], ['cute', 'kawaii'], ['love', 'luv'], ['stupid', 'baka'], ['hello', 'hewwo']];

function arg(args, name, fallback) {
    const found = (args || []).find(item => item && item.name === name);
    return found && found.value != null ? found.value : fallback;
}
function mock(input) {
    return [...String(input)].map((char, i) => i % 2 ? char.toUpperCase() : char.toLowerCase()).join('');
}
function freaky(text, extra) {
    const mapped = [...String(text || 'freaky')].map(char => freakyMap[char] || char).join('');
    return extra ? mapped + (Math.random() < 0.25 ? ' 👅' : ' ❤️') : mapped;
}
function toMorse(text) { return String(text).toUpperCase().split('').map(char => morseMap[char] ?? '').join(' '); }
function fromMorse(text) {
    const reversed = Object.fromEntries(Object.entries(morseMap).map(([k, v]) => [v, k]));
    const raw = String(text).split(' ').map(code => reversed[code] ?? '').join('').toLowerCase();
    return raw.charAt(0).toUpperCase() + raw.slice(1);
}
function uwuify(message) {
    const words = String(message).match(/\S+|\s+/g);
    if (!words) return '';
    let out = '';
    for (const word of words) {
        if (word.startsWith('https://') || [...word].every(char => char === word[0])) { out += word; continue; }
        let replaced = word;
        for (const [from, to] of replacements) replaced = replaced.replace(new RegExp('\\b' + from + '\\b', 'gi'), to);
        out += replaced === word ? word.replace(/n(?=[aeo])/g, 'ny').replace(/l|r/g, 'w') : replaced;
    }
    return out + ' ' + endings[Math.floor(Math.random() * endings.length)];
}

export default function MoreCommands(r) {
    const { Page, Text, Toggle } = ui(r);
    const opt = (name, description, extra = {}) => ({ name, description, type: 3, required: false, ...extra });
    function cmd(name, description, options, execute) {
        r.command({ name, description, options: options || [], execute });
    }
    return {
        start() {
            cmd('systeminfo', 'Show device information', [], () => {
                const n = globalThis.navigator || {};
                const s = globalThis.screen || {};
                return { content: [
                    `> **Platform**: ${r.RN.Platform?.OS || n.platform || 'unknown'}`,
                    `> **CPU cores**: ${n.hardwareConcurrency || 'N/A'}`,
                    `> **Screen**: ${s.width || '?'}x${s.height || '?'}`,
                    `> **Languages**: ${(n.languages || []).join(', ') || n.language || 'N/A'}`,
                    `> **Online**: ${n.onLine === false ? 'no' : 'yes'}`,
                ].join('\n') };
            });
            cmd('getuptime', 'Show app uptime', [], () => {
                const seconds = Math.floor((performance?.now?.() || 0) / 1000);
                return { content: `> **Uptime**: ${Math.floor(seconds / 60)} minutes` };
            });
            cmd('gettime', 'Show the current time', [], () => ({ content: `> **Current time**: ${new Date().toLocaleString()}` }));
            cmd('choose', 'Pick a random choice', [opt('choices', 'Comma-separated choices', { required: true })], args => {
                const choices = String(arg(args, 'choices', '')).split(',').map(item => item.trim()).filter(Boolean);
                return { content: choices.length ? 'I choose: ' + choices[Math.floor(Math.random() * choices.length)] : 'Give me some choices.' };
            });
            cmd('rolldice', 'Roll a die', [opt('sides', 'Number of sides', { type: 4 })], args => {
                const sides = Number(arg(args, 'sides', 6));
                if (!Number.isSafeInteger(sides) || sides < 2 || sides > 1000) return { content: 'Choose a whole number from 2 to 1000.' };
                return { content: `Rolled ${1 + Math.floor(Math.random() * sides)} on a ${sides}-sided die.` };
            });
            cmd('flipcoin', 'Flip a coin', [], () => ({ content: Math.random() < 0.5 ? 'Heads' : 'Tails' }));
            cmd('ask', 'Ask a yes/no question', [opt('question', 'Your question', { required: true })], args => {
                const answers = ['Yes', 'No', 'Maybe', 'Ask again later', 'Definitely', 'I would not count on it'];
                return { content: `**${arg(args, 'question', '')}**\n${answers[Math.floor(Math.random() * answers.length)]}` };
            });
            cmd('randomanimal', 'Random cat or dog image', [opt('animal', 'cat or dog')], async args => {
                const kind = String(arg(args, 'animal', Math.random() < 0.5 ? 'cat' : 'dog')).toLowerCase();
                const url = kind === 'dog' ? 'https://dog.ceo/api/breeds/image/random' : 'https://api.thecatapi.com/v1/images/search';
                const data = (await r.request(url)).json();
                const image = Array.isArray(data) ? data[0]?.url : data?.message || data?.url;
                return { content: image || 'No image returned.' };
            });
            cmd('randomnumber', 'Random number', [opt('min', 'Minimum', { type: 4 }), opt('max', 'Maximum', { type: 4 })], args => {
                const min = Number(arg(args, 'min', 1)), max = Number(arg(args, 'max', 100));
                if (![min, max].every(Number.isFinite) || min > max) return { content: 'Provide a valid min and max.' };
                return { content: String(min + Math.floor(Math.random() * (max - min + 1))) };
            });
            cmd('transform', 'Transform text', [opt('text', 'Text', { required: true }), opt('transformation', 'toLowerCase, toUpperCase, reverse')], args => {
                const text = String(arg(args, 'text', ''));
                const mode = String(arg(args, 'transformation', 'toLowerCase'));
                const out = mode === 'toUpperCase' ? text.toUpperCase() : mode === 'reverse' ? [...text].reverse().join('') : text.toLowerCase();
                return { content: out };
            });
            cmd('wordcount', 'Count words', [opt('message', 'Text', { required: true })], args => {
                const text = String(arg(args, 'message', '')).trim();
                const words = text ? text.split(/\s+/).length : 0;
                return { content: `${words} words, ${text.length} characters` };
            });
            cmd('countdown', 'Count down locally', [opt('number', 'Start from', { type: 4 })], async (args, ctx) => {
                let n = Number(arg(args, 'number', 3));
                if (!Number.isSafeInteger(n) || n < 1 || n > 10) n = 3;
                for (let i = n; i >= 0; i--) {
                    r.local(r.channelId(ctx), i === 0 ? '🎉 Go! 🎉' : i + '...');
                    if (i) await r.wait(1000);
                }
            });
            cmd('nekos', 'Send a neko image', [], async () => {
                const data = (await r.request('https://nekos.best/api/v2/neko')).json();
                return { content: data?.results?.[0]?.url || 'No image returned.' };
            });
            cmd('anime-boys', 'Send cute anime boys', [{ name: 'cat', description: 'Cat boys', type: 5, required: false }], async args => {
                const sub = arg(args, 'cat') === true || arg(args, 'cat') === 'true' ? 'animecatboys' : 'cuteanimeboys';
                const data = (await r.request('https://www.reddit.com/r/' + sub + '/random.json')).json();
                const url = data?.[0]?.data?.children?.[0]?.data?.url || data?.data?.children?.[0]?.data?.url;
                return { content: url || 'No image returned.' };
            });
            cmd('ping', 'Local pong', [], (_a, ctx) => { r.local(r.channelId(ctx), 'Pong!'); });
            cmd('echo', 'Show text locally', [opt('message', 'Text')], (args, ctx) => { r.local(r.channelId(ctx), String(arg(args, 'message', ''))); });
            cmd('lenny', 'Send a lenny face', [opt('message', 'Prefix')], args => ({ content: arg(args, 'message', '') + ' ( ͡° ͜ʖ ͡°)' }));
            cmd('mock', 'mOcK tExT', [opt('message', 'Text', { required: true })], args => ({ content: mock(arg(args, 'message', '')) }));
            cmd('slap', 'Slap someone', [opt('victim', 'Who to slap', { required: true })], args => {
                const me = r.byStore('UserStore')?.getCurrentUser?.();
                return { content: `<@${me?.id || 'me'}> slaps ${arg(args, 'victim', 'the void')} around a bit with a large trout` };
            });
            cmd('freaky', 'Make text freaky', [opt('message', 'Text', { required: true })], args => ({ content: freaky(arg(args, 'message', ''), r.store.addFreakyEnding) }));
            cmd('morse', 'To or from Morse', [opt('text', 'Text', { required: true })], args => {
                const input = String(arg(args, 'text', ''));
                return { content: /^[.\-/ ]+$/.test(input) ? fromMorse(input) : toMorse(input) };
            });
            cmd('uwuify', 'uwuify text', [opt('message', 'Text', { required: true })], args => ({ content: uwuify(arg(args, 'message', '')) }));
            cmd('more-gifroulette', 'Send a random favorite GIF', [], (_a, ctx) => sendFavoriteGif(r, ctx));
            for (const [name, face] of faces) {
                cmd(name, face, [opt('message', 'Prefix')], args => ({ content: (arg(args, 'message', '') + ' ' + face).trim() }));
            }
        },
        Settings() {
            r.useRefresh();
            return r.h(Page, { title: 'MoreCommands' },
                r.h(Toggle, { setting: 'addFreakyEnding', label: 'Add a random ending to /freaky' }),
                r.h(Text, { muted: true }, 'Snow sends returned command results once. /more-gifroulette uses your starred GIFs and can coexist with GifRoulette.'));
        },
    };
}
MoreCommands.defaults = { addFreakyEnding: true };
