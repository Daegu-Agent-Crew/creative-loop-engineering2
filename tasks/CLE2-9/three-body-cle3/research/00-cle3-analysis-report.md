# CLE3 시스템 분석 보고서 — 장기 연재 AI 만화 시스템 관점

> **대상 저장소**: `Daegu-Agent-Crew/creative-loop-engineering3`
> **분석일**: 2026-07-06
> **분석 관점**: (1) 파이프라인 구조적 결함 (2) 화풍·캐릭터 일관성이 무너지는 지점 (3) 피드백 루프의 실효성
> **부록**: 실제 저장소에서 검증 완료된 정합성 린트 스크립트 + CI 연동 가이드

---

## 1. 총평

골격은 상위 10% 수준입니다. Phase별 JSON Schema 검증, `state.json`의 개선 예산(총 15회, Phase당 5회)과 롤백 히스토리, 프롬프트 버전 관리(v1/v2), 그리고 화풍 정의 → 캐릭터 시트 → 배경 라이브러리 → 컷 조합으로 이어지는 4단계 이미지 워크플로우는 단순 자동화가 아닌 실제 "루프 엔지니어링"의 설계입니다. 특히 배경을 캐릭터 없이 단독 생성해 재사용하는 구조는 연재 일관성 문제에 정확히 맞는 접근입니다.

그러나 현재 상태로 연재를 지속하면 **EP003 전후로 일관성이 무너질 구조적 위험** 3가지가 존재합니다. 아래는 우선순위순 진단과 개선안이며, 개선안 1번(정합성 린트)은 본 문서 부록에 실행 가능한 스크립트로 첨부했습니다. 이 스크립트를 현재 저장소에 실제 실행한 결과 **FAIL 11건 / WARN 3건**이 검출되었습니다(§5 참조).

---

## 2. 치명적 약점 진단 (우선순위순)

### 약점 1 — 화풍 변경이 시스템을 오염시켰는데, 시스템은 그것을 모른다

2026-07-06 수채화풍 → 닥터슬럼프풍(토리야마) 전환 이후:

- `panels.json`은 여전히 `"style": "s1-watercolor"` 기준의 DRY RUN 데이터
- `qa.json`도 수채화풍 기준 더미 평가(정확히 통과선 42/50)
- `storyboard.json`은 `v1-formal` 버전으로 토리야마풍 구도 재검토 미반영
- STYLE_BLOCK이 `AGENTS.md`, `state.json`, `prompts/image/v2.md` **세 곳에 중복 정의** — 한 곳만 수정하면 드리프트 발생

더 근본적인 문제: **문화대혁명 비판 대회, 아버지의 죽음 장면을 "dramatic but playful" 닥터슬럼프풍으로 그리는 것은 삼체의 톤과 정면충돌**합니다. 원작의 무게감·철학적 긴장이 화풍 선택 단계에서 훼손될 위험이 있으나, 이를 검증하는 루브릭 항목("화풍이 이 장면의 감정 무게와 양립하는가")이 없습니다.

### 약점 2 — QA가 자기 채점이다

- 생성자와 평가자가 동일 파이프라인 → 점수 인플레이션이 구조적으로 발생 (현재 qa.json이 정확히 통과선 42점인 것이 그 징후)
- **완성된 PNG 이미지를 실제로 보고 평가하는 단계가 없음.** 루브릭에 "한글 렌더링 정확도" 항목이 있으나 gpt-image 계열의 한글 렌더링은 매우 불안정하며, 이를 검출할 비전 기반 평가가 부재
- `deploy.yml`은 `docs/**` 푸시만으로 발동 → "Phase 5 통과 후에만 배포" 규칙이 AGENTS.md 문서에만 존재하고 CI에서 강제되지 않음

### 약점 3 — 데이터 정합성이 '형식' 검증에 머문다

JSON Schema는 필드 형식만 검증할 뿐, 산출물 **간** 정합성은 아무도 확인하지 않습니다:

| 불일치 | 실측값 |
|---|---|
| 페이지 수 | script.md **28p** vs storyboard **18p** vs panels **6개 패널** |
| 미정의 인물 | storyboard에 등장하는 `예원제_아버지`, `홍위병`이 characters.json에 없음 |
| 위키↔명세 단절 | 위키에는 뤄지(2부 주인공) 상세 설정 존재, characters.json에는 부재 — 연동 규칙 미정의 |
| 시대별 시트 부재 | 예원제 22세(1967)/60대(2007) 두 시대가 한 에피소드에 공존하나 시대별 캐릭터 시트 체계 없음 |

장기 연재에서 가장 먼저 무너지는 곳이 바로 이 지점입니다.

### 약점 4 (부차) — 학습이 에피소드를 넘지 못한다

개선 예산과 롤백은 에피소드 **내부** 루프입니다. EP001의 QA 지적사항이 EP002의 프롬프트 개선으로 이어지는 자동화된 경로가 없어, 현재 구조는 "반복 실행"이지 "반복 개선"이 아닙니다.

---

## 3. 개선안 (효과 대비 비용순)

1. **정합성 린트 도입** (반나절) — 부록 스크립트를 저장소에 추가하고 CI에서 실패 시 배포 차단. 약점 1·3을 즉시 완화.
2. **평가자 분리 + 비전 QA** (1~2일) — QA를 생성 파이프라인과 다른 프롬프트/모델(critic 역할)로 분리. 완성 패널 PNG를 비전 모델에 입력해 ① 캐릭터 시트와 대조 ② 한글 오탈자 검출 ③ STYLE_BLOCK 준수 확인. Phase 5에 사람 확인 체크포인트 1개 명시.
3. **캐릭터 바이블 구조화** (1일) — `styles/characters/{이름}/{시대}.png` 체계로 시대별 시트를 버전 관리. 모든 패널 생성 시 `codex -i {해당 시대 시트}` 참조를 image/v3.md에 규칙으로 명문화. 엑스트라(홍위병 등)도 최소 1장의 군중 스타일 시트 확보.
4. **STYLE_BLOCK 단일 출처화** (1시간) — `state.json`의 `art_style.style_block`을 유일한 원본으로 삼고, 프롬프트 템플릿에서는 참조만 하도록 변경. 문서에는 "state.json 참조"로 표기.
5. **화풍-톤 양립성 루브릭 항목 추가** — Phase 3·4 루브릭에 "화풍이 해당 장면의 감정 무게와 양립하는가(비극 장면의 과도한 playful 연출 감점)" 항목 신설. 무거운 장면에서는 STYLE_BLOCK에 톤 오버라이드(`somber palette, heavy shadows, no comedic exaggeration`)를 허용하는 규칙 추가 권장.
6. **에피소드 회고 단계(Phase 7) 신설** — QA 지적사항 → 프롬프트 diff 제안 → 사람 승인 → v(n+1) 반영. 이것이 도입되어야 비로소 "반복할수록 좋아지는" Creative Loop가 완성됩니다.

---

## 4. 부록 A — 정합성 린트 스크립트

저장 위치 제안: `tools/check_consistency.py`

검사 항목:

- **C1 화풍 정합성**: 산출물의 style/prompt_version이 state.json 현재 화풍과 일치하는가
- **C2 캐릭터 참조**: storyboard의 `characters_in_frame`이 모두 characters.json에 정의되어 있는가
- **C3 패널 커버리지**: storyboard의 모든 패널이 panels.json에 존재하고 이미지 파일이 실재하는가
- **C4 분량 동기화**: script/storyboard 간 페이지 수가 일치하는가
- **C5 QA 게이트**: qa.json이 DRY RUN이 아닌 실제 결과이며 통과 점수(≥42)를 만족하는가

```python
#!/usr/bin/env python3
"""
CLE3 정합성 린트 스크립트 (cross-artifact consistency check)
사용법: python3 check_consistency.py [저장소_루트] [에피소드_ID]
예:     python3 check_consistency.py . EP001

종료 코드: 0 = 통과, 1 = FAIL 존재 (CI에서 배포 차단용)
"""
import json
import re
import sys
from pathlib import Path

FAIL, WARN = [], []


def fail(code, msg):
    FAIL.append(f"[FAIL {code}] {msg}")


def warn(code, msg):
    WARN.append(f"[WARN {code}] {msg}")


def load_json(path: Path):
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        fail("PARSE", f"{path}: JSON 파싱 실패 — {e}")
        return None


def norm_name(name: str) -> str:
    """'예원제 (叶文洁)' → '예원제' 처럼 괄호 병기를 제거해 비교."""
    return re.sub(r"\s*[(（].*?[)）]", "", name).strip()


def main():
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
    ep = sys.argv[2] if len(sys.argv) > 2 else None

    state = load_json(root / "state.json")
    if state is None:
        fail("STATE", "state.json을 읽을 수 없습니다.")
        return report()

    ep = ep or state.get("current_episode")
    ep_dir = root / "episodes" / ep
    current_style = state.get("art_style", {}).get("name", "")
    print(f"에피소드: {ep} / 현재 화풍: {current_style}\n")

    characters = load_json(ep_dir / "characters" / "characters.json")
    storyboard = load_json(ep_dir / "storyboard" / "storyboard.json")
    panels = load_json(ep_dir / "panels" / "panels.json")
    qa = load_json(ep_dir / "qa" / "qa.json")

    # ── C1. 화풍 정합성 ─────────────────────────────────────────
    style_token = current_style.split("-")[0] if current_style else ""
    for name, doc in [("characters", characters), ("storyboard", storyboard),
                      ("panels", panels), ("qa", qa)]:
        if doc is None:
            continue
        pv = doc.get("prompt_version", "")
        if "dryrun" in pv.lower():
            warn("C1", f"{name}.json prompt_version='{pv}' — 더미(DRY RUN) 산출물입니다.")
        if name == "panels":
            stale = {p.get("style") for p in doc.get("panels", [])
                     if p.get("style") and style_token not in p.get("style", "")}
            if stale:
                fail("C1", f"panels.json에 현재 화풍({current_style})과 다른 style 존재: {sorted(stale)}")

    # ── C2. 캐릭터 참조 무결성 ──────────────────────────────────
    defined = set()
    if characters:
        for c in characters.get("characters", []):
            defined.add(norm_name(c.get("name", "")))
    if storyboard and characters:
        referenced = set()
        for page in storyboard.get("pages", []):
            for panel in page.get("panels", []):
                for ch in panel.get("characters_in_frame", []):
                    referenced.add(norm_name(ch))
        missing = sorted(referenced - defined)
        if missing:
            fail("C2", f"storyboard에 등장하지만 characters.json에 디자인이 없는 인물: {missing}")

    # ── C3. 패널 커버리지 + 이미지 실재 ────────────────────────
    if storyboard and panels:
        sb_ids = {p["panel_id"] for pg in storyboard.get("pages", [])
                  for p in pg.get("panels", [])}
        pn_ids = {p["panel_id"] for p in panels.get("panels", [])}
        uncovered = sorted(sb_ids - pn_ids)
        orphaned = sorted(pn_ids - sb_ids)
        if uncovered:
            fail("C3", f"storyboard 패널 중 panels.json에 없는 것 {len(uncovered)}개: "
                       f"{uncovered[:8]}{' ...' if len(uncovered) > 8 else ''}")
        if orphaned:
            warn("C3", f"storyboard에 없는 고아 패널: {orphaned}")
        for p in panels.get("panels", []):
            img = root / p.get("image_path", "")
            if not img.exists():
                fail("C3", f"이미지 파일 없음: {p.get('image_path')}")

    # ── C4. 분량 동기화 ────────────────────────────────────────
    if storyboard:
        sb_pages = len(storyboard.get("pages", []))
        script_md = ep_dir / "script" / "script.md"
        if script_md.exists():
            m = re.search(r"페이지\s*수\s*\|\s*(\d+)", script_md.read_text(encoding="utf-8"))
            if m and int(m.group(1)) != sb_pages:
                fail("C4", f"페이지 수 불일치: script.md={m.group(1)}p vs storyboard={sb_pages}p")

    # ── C5. QA 게이트 ──────────────────────────────────────────
    if qa:
        score = qa.get("overall_score", 0)
        is_dry = any("DRY RUN" in (i.get("notes") or "") for i in qa.get("items", []))
        if is_dry:
            fail("C5", "qa.json이 DRY RUN 결과입니다 — 실제 QA 미수행. 배포 불가.")
        if score < 42:
            fail("C5", f"QA 점수 {score}/50 < 통과 기준 42. 배포 불가.")

    return report()


def report():
    for w in WARN:
        print(w)
    for f in FAIL:
        print(f)
    print(f"\n결과: FAIL {len(FAIL)}건 / WARN {len(WARN)}건")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
```

---

## 5. 부록 B — 현재 저장소 실행 결과 (2026-07-06 실측)

```
에피소드: EP001 / 현재 화풍: dr-slump-toriyama

[WARN C1] panels.json prompt_version='v1-dryrun' — 더미(DRY RUN) 산출물입니다.
[WARN C1] qa.json prompt_version='v1-dryrun' — 더미(DRY RUN) 산출물입니다.
[WARN C3] storyboard에 없는 고아 패널: ['p1-2', 'p2-4', 'p3-6']
[FAIL C1] panels.json에 현재 화풍(dr-slump-toriyama)과 다른 style 존재: ['s1-watercolor']
[FAIL C2] storyboard에 등장하지만 characters.json에 디자인이 없는 인물: ['예원제_아버지', '홍위병']
[FAIL C3] storyboard 패널 중 panels.json에 없는 것 27개: ['p10-17', 'p11-18', ...]
[FAIL C3] 이미지 파일 없음: episodes/EP001/panels/p1-1.png (외 5건)
[FAIL C4] 페이지 수 불일치: script.md=28p vs storyboard=18p
[FAIL C5] qa.json이 DRY RUN 결과입니다 — 실제 QA 미수행. 배포 불가.

결과: FAIL 11건 / WARN 3건
```

§2에서 진단한 약점 1·3이 전부 자동 검출됨을 확인했습니다.

---

## 6. 부록 C — CI 연동 (배포 게이트)

`.github/workflows/deploy.yml`의 deploy job 앞에 린트 단계를 추가하면 "QA 통과 전 배포 금지" 규칙이 문서가 아닌 CI에서 강제됩니다:

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Consistency lint (배포 게이트)
        run: python3 tools/check_consistency.py . 

  deploy:
    needs: lint   # 린트 FAIL 시 배포 차단
    runs-on: ubuntu-latest
    # ... 기존 deploy 단계 유지
```

---

## 7. 실행 로드맵 요약

| 순서 | 작업 | 예상 소요 | 해소되는 약점 |
|---|---|---|---|
| 1 | 린트 스크립트 추가 + CI 게이트 | 반나절 | 1, 3 |
| 2 | STYLE_BLOCK 단일 출처화 | 1시간 | 1 |
| 3 | 평가자 분리 + 비전 QA | 1~2일 | 2 |
| 4 | 시대별 캐릭터 바이블 | 1일 | 3 |
| 5 | 화풍-톤 양립성 루브릭 항목 | 1시간 | 1 |
| 6 | Phase 7 회고 루프 | 1일 | 4 |
