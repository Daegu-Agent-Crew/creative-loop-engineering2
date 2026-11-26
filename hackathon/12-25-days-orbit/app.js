const RAW = 'https://raw.githubusercontent.com/Daegu-Agent-Crew/agent_builder_public/main/three-body-daily';

const milestones = new Map([
  [1, ['첫 신호', '하루 한 장의 궤도가 시작됐다.']],
  [7, ['첫 일주일', '반복이 우연을 넘어 리듬이 됐다.']],
  [15, ['The Star', '비교 실험 뒤 SF 오리지널로 방향을 틀었다.']],
  [16, ['The Machine Stops', '새 제작 규칙이 두 번째 작품에서도 작동했다.']],
  [20, ['스무 번째 증거', '이미지·완료 기록·일지가 함께 도착했다.']],
  [24, ['과학의 경계', '연재가 첫 큰 전환점을 향해 수렴했다.']],
  [25, ['답신하지 마라', '인류가 첫 답신을 받고 궤도의 방향이 바뀌었다.']]
]);

const pad = n => String(n).padStart(3, '0');

export const episodes = Array.from({ length: 25 }, (_, index) => {
  const day = index + 1;
  const [title, note] = milestones.get(day) || [`DAY ${pad(day)}`, '매일 한 장, 다음 장을 위한 증거.'];
  return {
    day,
    id: pad(day),
    title,
    note,
    image: `${RAW}/three-body-daily-${pad(day)}.png`
  };
});

export function chapterFor(day) {
  if (day <= 7) return '신호';
  if (day <= 16) return '변이';
  return '접촉';
}

function render() {
  const orbit = document.querySelector('#orbit');
  const support = document.querySelector('#support');
  const dialog = document.querySelector('#viewer');
  const full = dialog.querySelector('img');
  const caption = dialog.querySelector('figcaption');

  support.textContent = CSS.supports('animation-timeline: view()')
    ? 'SCROLL-TIMELINE · LIVE'
    : 'STATIC FALLBACK · LIVE';

  episodes.forEach((episode, index) => {
    const article = document.createElement('article');
    article.className = `episode side-${index % 2 ? 'right' : 'left'}`;
    article.dataset.day = episode.id;
    article.innerHTML = `
      <div class="axis-dot" aria-hidden="true"></div>
      <button class="frame" type="button" aria-label="${episode.id}편 크게 보기">
        <span class="chapter">${chapterFor(episode.day)} · ${episode.id}/025</span>
        <img src="${episode.image}" alt="삼체 데일리 ${episode.id}편" loading="lazy" decoding="async">
        <span class="copy">
          <strong>${episode.title}</strong>
          <small>${episode.note}</small>
        </span>
      </button>`;
    article.querySelector('button').addEventListener('click', () => {
      full.src = episode.image;
      full.alt = `삼체 데일리 ${episode.id}편 원본`;
      caption.textContent = `${episode.id}/025 · ${episode.title}`;
      dialog.showModal();
    });
    orbit.append(article);
  });

  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
}

if (typeof document !== 'undefined') render();
