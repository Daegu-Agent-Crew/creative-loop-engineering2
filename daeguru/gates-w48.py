#!/data/data/com.termux/files/usr/bin/python3
"""2026-W48 게이트 러너 — 백업 스냅샷+검증 개선 (GATES-2026-W48.md)
사용: python3 daeguru/gates-w48.py   (워크스페이스·phone 로컬, /tmp 금지 — ~/.cache 픽스처)
"""
import datetime as dt, hashlib, json, os, shutil, subprocess, sys

HOME = os.path.expanduser("~")
WS = HOME + "/.openclaw/workspace"
CLE2 = HOME + "/.openclaw/workspace/creative-loop-engineering2"
FIX = HOME + "/.cache/ws-bk-fixture"
results = []

def mark(gid, name, ok, detail):
    results.append((gid, name, ok, detail))
    print(("PASS " if ok else "FAIL ") + gid + " " + name + " · " + detail)

def run(cmd, env_extra=None, cwd=None):
    env = dict(os.environ)
    if env_extra:
        env.update(env_extra)
    p = subprocess.run(cmd, capture_output=True, text=True, env=env, cwd=cwd, timeout=300)
    return p.returncode, p.stdout + p.stderr

# --- G2: 스냅샷 생성(이미 1회 실행됨) → manifest·내용·멱등성 ---
bk = HOME + "/.openclaw/backups/workspace-snapshots"
man = json.load(open(bk + "/manifest-latest.json", encoding="utf-8"))
arc = bk + "/" + man["archive"]
mark("G2", "manifest 필드", all(k in man for k in ("time", "sha256", "bytes", "files")) and man["bytes"] > 0 and man["files"] > 200, str(man))
import tarfile
names = tarfile.open(arc).getnames()
mark("G2", "내용(핵심 파일)", ("memory/promises.md" in names) and any(n.startswith("skills/") for n in names) and ("scripts/self-check" in names) and ("scripts/backup-workspace" in names), f"names={len(names)}")
mark("G2", "아카이브 권한 0600", (os.stat(arc).st_mode & 0o777) == 0o600, oct(os.stat(arc).st_mode & 0o777))

# --- G2b: 보존 한도(픽스처 16개 낡은 아카이브 + 신규 1 = 17 → 14 초과분 삭제) ---
shutil.rmtree(FIX, ignore_errors=True)
os.makedirs(FIX, exist_ok=True)
for i in range(16):
    open(FIX + "/ws-202001" + str(10 + i) + "-000000.tar.gz", "wb").write(b"old")
rc, out = run(["python3", WS + "/scripts/backup-workspace"], {"DG_WS_BKDIR": FIX})
left = sorted(x for x in os.listdir(FIX) if x.endswith(".tar.gz"))
mark("G2", "보존 한도 14", rc == 0 and len(left) == 14 and "ws-2026" in left[-1], f"exit={rc} 남은={len(left)} 최신={left[-1]}")

# --- G3: 무결성 — 정품 일치·변조 탐지 ---
real_sha = hashlib.sha256(open(arc, "rb").read()).hexdigest()
mark("G3", "sha256 일치", real_sha == man["sha256"], real_sha[:12])
FIX2 = HOME + "/.cache/ws-bk-tamper"
shutil.rmtree(FIX2, ignore_errors=True)
os.makedirs(FIX2, exist_ok=True)
shutil.copy(arc, FIX2 + "/" + man["archive"])
man2 = dict(man)
open(FIX2 + "/" + man["archive"], "ab").write(b"x")  # 변조
json.dump(man2, open(FIX2 + "/manifest-latest.json", "w"))
rc, out = run(["python3", WS + "/scripts/self-check"], {"DG_SELFCHK_BKDIR": FIX2})
mark("G3", "변조 탐지", rc == 1 and "FAIL backup" in out and "sha256" in out, out.strip().splitlines()[4][:80])

# --- G4: self-check 양성(실경로)·음성 3종 ---
rc, out = run(["python3", WS + "/scripts/self-check"])
lines = [l for l in out.splitlines() if l[:4] in ("OK  ", "FAIL") or l.startswith("ALL")]
mark("G4", "양성 5항목 ALL OK", rc == 0 and out.strip().endswith("ALL OK") and len([l for l in lines if l.startswith("OK  ")]) == 5, "; ".join(lines))
EMPTY = HOME + "/.cache/ws-bk-empty"
shutil.rmtree(EMPTY, ignore_errors=True)
os.makedirs(EMPTY, exist_ok=True)
rc, out = run(["python3", WS + "/scripts/self-check"], {"DG_SELFCHK_BKDIR": EMPTY})
mark("G4", "음성·manifest 누락", rc == 1 and "FAIL backup: manifest 없음" in out, out.strip().splitlines()[-2][:60])
FIX3 = HOME + "/.cache/ws-bk-stale"
shutil.rmtree(FIX3, ignore_errors=True)
os.makedirs(FIX3, exist_ok=True)
shutil.copy(arc, FIX3 + "/" + man["archive"])
stale = dict(man)
stale["time"] = (dt.datetime.now().astimezone() - dt.timedelta(hours=72)).isoformat(timespec="seconds")
json.dump(stale, open(FIX3 + "/manifest-latest.json", "w"))
rc, out = run(["python3", WS + "/scripts/self-check"], {"DG_SELFCHK_BKDIR": FIX3})
mark("G4", "음성·48h 경과", rc == 1 and "FAIL backup" in out and "경과" in out, out.strip().splitlines()[4][:60])
FIX4 = HOME + "/.cache/ws-bk-missing-arc"
shutil.rmtree(FIX4, ignore_errors=True)
os.makedirs(FIX4, exist_ok=True)
ghost = dict(man)
ghost["archive"] = "ws-ghost.tar.gz"
json.dump(ghost, open(FIX4 + "/manifest-latest.json", "w"))
rc, out = run(["python3", WS + "/scripts/self-check"], {"DG_SELFCHK_BKDIR": FIX4})
mark("G4", "음성·아카이브 누락", rc == 1 and "FAIL backup" in out and "누락" in out, out.strip().splitlines()[4][:60])

# --- G5: 기존 4항목 무변경(기준선 2026-11-23 10:00 전부 OK) ---
rc, out = run(["python3", WS + "/scripts/self-check"])
ok4 = all(s in out for s in ("android-patch", "cron-timer", "promises", "arena"))
no_other_fail = out.count("FAIL") == 0
mark("G5", "①-④ 동일·무실패", rc == 0 and ok4 and no_other_fail, "①-④ OK 유지")
rc, out = run(["git", "-C", WS, "diff", "--stat", "scripts/self-check"])
mark("G5", "diff 범위 한정", "scripts/self-check" in out and out.count("file changed") <= 1 and "backup-workspace" not in out, out.strip())

bad = [r for r in results if not r[2]]
print("GATES " + ("ALL PASS" if not bad else "FAILED " + str(len(bad))))
sys.exit(1 if bad else 0)
