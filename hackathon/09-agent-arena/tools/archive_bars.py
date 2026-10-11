"""백테스트용 5초봉 만들기 — data.binance.vision 일별 aggTrades(zip) → bars/<SYM>-<DATE>.json
사용: python3 archive_bars.py SOLUSDT 2026-10-05 2026-10-10   (시작·끝 날짜 포함)
캐시: ~/.cache/arena-bars (리포에 커밋하지 않음)"""
import csv, datetime as dt, io, json, os, sys, urllib.request, zipfile
OUT = os.path.expanduser("~/.cache/arena-bars"); os.makedirs(OUT, exist_ok=True)
MS = 5000
def day_bars(sym, day):
    fn = os.path.join(OUT, f"{sym}-{day}.json")
    if os.path.exists(fn): return fn
    url = f"https://data.binance.vision/data/futures/um/daily/aggTrades/{sym}/{sym}-aggTrades-{day}.zip"
    raw = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "curl/8"}), timeout=120).read()
    z = zipfile.ZipFile(io.BytesIO(raw)); f = io.TextIOWrapper(z.open(z.namelist()[0]))
    bars = {}; 
    for row in csv.reader(f):
        if not row[0].isdigit(): continue          # 헤더
        p, q, T, m = float(row[1]), float(row[2]), int(row[5]), row[6].strip().lower() == "true"
        t = T // MS * MS; b = bars.get(t)
        if b is None: bars[t] = b = [p, p, p, p, 0.0, 0.0]
        b[1] = max(b[1], p); b[2] = min(b[2], p); b[3] = p
        b[5 if m else 4] += p * q
    d0 = int(dt.datetime.strptime(day, "%Y-%m-%d").replace(tzinfo=dt.timezone.utc).timestamp() * 1000)
    out, c = [], None
    for t in range(d0, d0 + 86400000, MS):
        b = bars.get(t)
        if b: out.append({"t": t, "o": b[0], "h": b[1], "l": b[2], "c": b[3], "bv": round(b[4]), "sv": round(b[5])}); c = b[3]
        elif c is not None: out.append({"t": t, "o": c, "h": c, "l": c, "c": c, "bv": 0, "sv": 0})
    json.dump(out, open(fn, "w"), separators=(",", ":")); return fn
if __name__ == "__main__":
    sym, a, b = sys.argv[1:4]
    d = dt.date.fromisoformat(a)
    while d <= dt.date.fromisoformat(b):
        print(day_bars(sym, d.isoformat()), flush=True); d += dt.timedelta(days=1)
