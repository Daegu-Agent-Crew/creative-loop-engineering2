#!/usr/bin/env node
// HL liquidation collector (laika liquidation order-dispersion research).
// The standalone 'liquidation' ws channel was removed from the public API.
// Instead we subscribe to 'trades' and keep fills where one counterparty is the
// HL liquidation vault address. Read-only, public endpoints.
// Usage: node collect_hl_liquidations.mjs [--seconds 300] [--coins BTC,ETH,SOL]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
function arg(name, dflt) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
}
const seconds = parseInt(arg("--seconds", "300"), 10);
const coins = arg("--coins", "BTC,ETH,SOL").split(",").map(s => s.trim()).filter(Boolean);
const LIQ_VAULTS = new Set([
  '0x5078c2fbea2b2ad61bc840bc023e35fce56bedb6', // HL liquidation vault
  '0x0000000000000000000000000000000000000000', // burner/dead address fills
]);
const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '..', '..', 'data', 'laika-collectors', 'hl-liquidations');
fs.mkdirSync(outDir, { recursive: true });
const day = new Date().toISOString().slice(0, 10);
const file = path.join(outDir, day + '.jsonl');

const ws = new WebSocket('wss://api.hyperliquid.xyz/ws');
let liq = 0, seen = 0, subbed = 0;
const out = fs.createWriteStream(file, { flags: 'a' });
ws.onopen = () => {
  for (const c of coins) {
    ws.send(JSON.stringify({ method: 'subscribe', subscription: { type: 'trades', coin: c } }));
  }
  setTimeout(() => { try { ws.close(); } catch (e) {} }, seconds * 1000);
};
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  const chan = msg.channel || '';
  if (chan === 'subscriptionResponse') { subbed += 1; console.log('SUB ok ' + subbed + '/' + coins.length); return; }
  if (chan !== 'trades') return;
  for (const t of msg.data || []) {
    seen += 1;
    const users = t.users || [];
    if (!users.some(u => LIQ_VAULTS.has(String(u).toLowerCase()))) continue;
    out.write(JSON.stringify({ ts: Date.now(), ...t }) + '\n');
    liq += 1;
  }
};
ws.onclose = () => {
  out.end(() => {
    console.log('OK trades_seen=' + seen + ' liquidations=' + liq + ' file=' + file);
    process.exit(0);
  });
};
ws.onerror = (e) => { console.error(String(e)); };
setTimeout(() => { try { ws.close(); } catch (e) {} }, (seconds + 10) * 1000);
