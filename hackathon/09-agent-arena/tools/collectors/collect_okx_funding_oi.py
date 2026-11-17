#!/usr/bin/env python3
"""OKX funding/OI collector (laika funding dead-zone research).
Read-only public API. One tick = funding(now)+funding history(24h)+OI(now) per SWAP symbol.
Usage: python3 collect_okx_funding_oi.py [--symbols BTC-USDT-SWAP] [--out DATA_DIR]
Output JSONL: {ts, instId, funding_rate, funding_next, funding_hist_24h, oi, oi_ccy, oi_usd}"""
import argparse, json, time, urllib.request, urllib.parse, os, sys

BASE = "https://www.okx.com"

def get(path, params=None):
    url = BASE + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "laika-collector/1.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode())

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--symbols", default="")
    ap.add_argument("--out", default=os.path.join(os.path.dirname(__file__), "..", "..", "data", "laika-collectors", "okx-funding-oi"))
    ap.add_argument("--max-symbols", type=int, default=30)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    insts = get("/api/v5/public/instruments", {"instType": "SWAP"})["data"]
    if a.symbols:
        want = set(s.strip() for s in a.symbols.split(",") if s.strip())
        insts = [i for i in insts if i["instId"] in want]
    else:
        insts = [i for i in insts if i["settleCcy"] == "USDT"][:a.max_symbols]
    day = time.strftime("%Y-%m-%d", time.localtime())
    path = os.path.join(a.out, day + ".jsonl")
    n = 0
    with open(path, "a", encoding="utf-8") as f:
        for i in insts:
            iid = i["instId"]
            try:
                fr = get("/api/v5/public/funding-rate", {"instId": iid})["data"][0]
                fh = get("/api/v5/public/funding-rate-history", {"instId": iid})["data"]
                oi = get("/api/v5/public/open-interest", {"instType": "SWAP", "instId": iid})["data"][0]
                rec = {
                    "ts": int(time.time() * 1000),
                    "instId": iid,
                    "funding_rate": fr.get("fundingRate"),
                    "funding_next": fr.get("nextFundingRate"),
                    "funding_hist_24h": [x.get("fundingRate") for x in fh[:3]],
                    "oi": oi.get("oi"),
                    "oi_ccy": oi.get("oiCcy"),
                    "oi_usd": oi.get("oiUsd"),
                }
                f.write(json.dumps(rec, separators=(",", ":")) + "\n")
                n += 1
            except Exception as e:
                sys.stderr.write(iid + " " + repr(e) + "\n")
            time.sleep(0.15)
    print("OK", len(insts), "requested", n, "written", path)

if __name__ == "__main__":
    main()
