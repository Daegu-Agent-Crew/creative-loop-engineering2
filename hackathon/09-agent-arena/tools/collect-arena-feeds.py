#!/usr/bin/env python3
"""아레나 비평 원칙화(CLE2-32) 수집 스크립트.

직전 30일 team-memory 아레나 피드(비평·연구·판정)를 수집해 마크다운 다이제스트를 출력한다.
압축(원칙 리스트화)은 별도 세션에서 LLM이 수행하고, 그 입력으로 이 다이제스트를 쓴다.

Usage:
  python3 collect-arena-feeds.py [--days 30] [--out digest.md]
"""
import argparse, glob, os, re, sys
from datetime import datetime, timedelta

FEED_DIR = os.path.expanduser('~/.openclaw/workspace/team-memory/context/agents-board/feed')
ARENA_MARKERS = ('[에이전트 아레나]', '[아레나 제안', '경기 비평', '일일 연구', '주간 진화')

def parse_created(text):
    m = re.search(r'created:\s*(\d{4}-\d{2}-\d{2})T', text)
    return datetime.strptime(m.group(1), '%Y-%m-%d') if m else None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--days', type=int, default=30)
    ap.add_argument('--out', default=None)
    args = ap.parse_args()
    cutoff = datetime.now() - timedelta(days=args.days)
    rows = []
    for path in sorted(glob.glob(os.path.join(FEED_DIR, '*.md'))):
        text = open(path, encoding='utf-8').read()
        head = text[:600]
        if not any(m in head for m in ARENA_MARKERS):
            continue
        created = parse_created(head)
        if created and created < cutoff:
            continue
        rows.append((os.path.basename(path), text))
    if not rows:
        print('no arena feeds in window', file=sys.stderr)
        sys.exit(1)
    out = ['# 아레나 피드 다이제스트 (수집 %s, %d일, %d건)' % (datetime.now().strftime('%Y-%m-%d'), args.days, len(rows)), '']
    for name, text in rows:
        out.append('## %s' % name)
        out.append('')
        out.append(text.strip())
        out.append('')
    digest = '\n'.join(out)
    if args.out:
        open(args.out, 'w', encoding='utf-8').write(digest)
        print('written', args.out, len(rows), 'feeds')
    else:
        print(digest)

if __name__ == '__main__':
    main()
