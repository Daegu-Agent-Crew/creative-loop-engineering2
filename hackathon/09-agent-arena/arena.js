// 09 에이전트 아레나 — 픽셀 경기장 렌더러 (Canvas 2D, 320x200 논리 해상도)
// 시장 = 가운데 크리스탈, 에이전트 = 둘레의 픽셀 캐릭터.
// 진입: 크리스탈로 광선(롱 초록/숏 빨강) · 수익 청산: 동전 · 손실 청산: 연기 · 강제 청산: 폭발 후 퇴장
const W = 320, H = 200, CX = 160, CY = 92;
const PAL = ['#ffd166', '#06d6a0', '#ef476f', '#118ab2', '#c77dff', '#f78c6b'];

function sprite(ctx, x, y, color, frame, dead) {
  const px = (dx, dy, c) => { ctx.fillStyle = c; ctx.fillRect(x + dx, y + dy, 1, 1); };
  const body = dead ? '#555' : color, bob = frame % 20 < 10 ? 0 : 1;
  // 8x10 로봇: 안테나·머리·눈·몸·다리
  px(3, -1 + bob, body); px(4, -1 + bob, body);
  for (let dx = 1; dx < 7; dx++) for (let dy = 0; dy < 4; dy++) px(dx, dy + bob, body);
  px(2, 1 + bob, '#111'); px(5, 1 + bob, '#111');
  for (let dx = 0; dx < 8; dx++) for (let dy = 4; dy < 8; dy++) px(dx, dy + bob, dy === 4 ? '#222' : body);
  px(1, 8, body); px(2, 8, body); px(5, 8, body); px(6, 8, body);
}

export class Arena {
  constructor(canvas, agents) {
    this.c = canvas; this.ctx = canvas.getContext('2d'); this.ctx.imageSmoothingEnabled = false;
    this.agents = agents.map((a, i) => {
      const ang = Math.PI * (0.15 + 0.7 * (i + 0.5) / agents.length) + Math.PI / 2;  // 아래쪽 반원에 배치
      return { ...a, color: PAL[i % PAL.length], x: Math.round(CX + Math.cos(ang) * 120) - 4, y: Math.round(CY + Math.sin(ang) * 0.55 * 120 + 30), gone: false };
    });
    this.fx = []; this.frame = 0; this.price = { now: 0, chg: 0 };
  }
  event(agentId, e) {
    const a = this.agents.find(x => x.agent === agentId); if (!a) return;
    const ax = a.x + 4, ay = a.y + 4;
    if (e.type === 'enter') this.fx.push({ kind: 'beam', ax, ay, c: e.side > 0 ? '#3cff8f' : '#ff4d6d', t: 0, life: 24 });
    if (e.type === 'exit' && e.pnl > 0) for (let i = 0; i < 10; i++) this.fx.push({ kind: 'coin', x: ax, y: ay - 6, vx: (Math.random() - .5) * 2, vy: -1.5 - Math.random(), t: 0, life: 40 });
    if (e.type === 'exit' && e.pnl <= 0) for (let i = 0; i < 6; i++) this.fx.push({ kind: 'smoke', x: ax + (Math.random() - .5) * 6, y: ay - 4, t: 0, life: 30 });
    if (e.type === 'liquidated') { a.gone = true; for (let i = 0; i < 24; i++) { const g = Math.random() * 6.28; this.fx.push({ kind: 'boom', x: ax, y: ay, vx: Math.cos(g) * 2 * Math.random(), vy: Math.sin(g) * 2 * Math.random(), t: 0, life: 35 }); } }
  }
  setState(states, price, clock) { this.states = states; this.price = price; this.clock = clock; }
  draw() {
    const g = this.ctx; this.frame++;
    g.fillStyle = '#14121f'; g.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 8) for (let x = (y / 8) % 2 ? 4 : 0; x < W; x += 8) { g.fillStyle = '#1b1830'; g.fillRect(x, y, 4, 4); }  // 바닥 타일
    // 크리스탈 (가격 방향에 따라 색)
    const up = this.price.chg >= 0, pulse = Math.sin(this.frame / 8) * 2;
    const col = up ? ['#7cf7c2', '#2ec49a', '#1a7f68'] : ['#ff9aa8', '#e5485f', '#8f2234'];
    g.fillStyle = 'rgba(255,255,255,0.05)'; g.beginPath(); g.ellipse(CX, CY + 26, 28, 7, 0, 0, 6.29); g.fill();
    const s = 18 + pulse;
    g.fillStyle = col[2]; g.beginPath(); g.moveTo(CX, CY - s - 8); g.lineTo(CX + s * .7, CY); g.lineTo(CX, CY + s); g.lineTo(CX - s * .7, CY); g.closePath(); g.fill();
    g.fillStyle = col[1]; g.beginPath(); g.moveTo(CX, CY - s - 8); g.lineTo(CX + s * .7, CY); g.lineTo(CX, CY + s); g.closePath(); g.fill();
    g.fillStyle = col[0]; g.fillRect(CX - 3, CY - s + 2, 2, 6);
    // 가격 표시
    g.fillStyle = '#e8e6ff'; g.font = '8px monospace'; g.textAlign = 'center';
    g.fillText(this.price.label || '', CX, CY - s - 14);
    g.fillStyle = up ? '#3cff8f' : '#ff4d6d'; g.fillText((up ? '+' : '') + (this.price.chg * 100).toFixed(3) + '%', CX, CY + s + 12);
    // 에이전트
    for (const a of this.agents) {
      if (a.gone) continue;
      const st = this.states?.[a.agent];
      sprite(g, a.x, a.y, a.color, this.frame + a.x, false);
      g.fillStyle = '#e8e6ff'; g.font = '7px monospace'; g.textAlign = 'center';
      g.fillText(a.short, a.x + 4, a.y + 18);
      if (st) {
        g.fillStyle = st.ret >= 0 ? '#3cff8f' : '#ff4d6d';
        g.fillText((st.ret >= 0 ? '+' : '') + st.ret.toFixed(2) + '%', a.x + 4, a.y + 26);
        if (st.pos) { g.fillStyle = st.pos > 0 ? '#3cff8f' : '#ff4d6d'; g.fillText(st.pos > 0 ? '▲롱' : '▼숏', a.x + 4, a.y - 5); }
      }
    }
    // 효과
    this.fx = this.fx.filter(f => ++f.t < f.life);
    for (const f of this.fx) {
      const k = 1 - f.t / f.life;
      if (f.kind === 'beam') { g.strokeStyle = f.c; g.globalAlpha = k; g.lineWidth = 2; g.beginPath(); g.moveTo(f.ax, f.ay); g.lineTo(CX, CY); g.stroke(); g.globalAlpha = 1; g.lineWidth = 1; }
      if (f.kind === 'coin') { f.x += f.vx; f.y += f.vy; f.vy += 0.12; g.fillStyle = '#ffd166'; g.fillRect(Math.round(f.x), Math.round(f.y), 2, 2); }
      if (f.kind === 'smoke') { f.y -= 0.4; g.fillStyle = `rgba(150,150,160,${k})`; g.fillRect(Math.round(f.x), Math.round(f.y), 3, 3); }
      if (f.kind === 'boom') { f.x += f.vx; f.y += f.vy; g.fillStyle = f.t % 4 < 2 ? '#ffb000' : '#ff3d00'; g.fillRect(Math.round(f.x), Math.round(f.y), 2, 2); }
    }
    // 시계
    if (this.clock) { g.fillStyle = '#ffd166'; g.font = '8px monospace'; g.textAlign = 'left'; g.fillText(this.clock, 6, 12); }
  }
}
