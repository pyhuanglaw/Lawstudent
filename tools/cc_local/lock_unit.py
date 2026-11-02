# -*- coding: utf-8 -*-
"""CC（帳號 A）：clear_stale_git_locks 單元測試（BB 21:06）。"""
import os, sys, tempfile, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import run_queue as R
fails = []
def check(ok, msg, extra=''):
    print(('PASS ' if ok else 'FAIL ') + msg + (('  ' + str(extra)) if extra else '')); (None if ok else fails.append(msg))
d = tempfile.mkdtemp(); g = os.path.join(d, '.git')
for sub in ['', 'worktrees/Lawstudent_cclocal', 'refs/heads/claude', 'objects/ab']:
    os.makedirs(os.path.join(g, sub), exist_ok=True)
now = time.time()
def mk(rel, age):
    f = os.path.join(g, rel); open(f, 'w').close(); os.utime(f, (now - age, now - age)); return f
old1 = mk('index.lock', 3600); old2 = mk('worktrees/Lawstudent_cclocal/index.lock', 900)
old3 = mk('refs/heads/claude/cc-local.lock', 700); new1 = mk('worktrees/Lawstudent_cclocal/HEAD.lock', 60)
obj = mk('objects/ab/tmp.lock', 9999)
gone = R.clear_stale_git_locks(g, now=now, running=False)
check(not os.path.exists(old1) and not os.path.exists(old2) and not os.path.exists(old3), '舊的 lock（60、15、11.7 分鐘）被刪', gone)
check(os.path.exists(new1), '新的 lock（1 分鐘）不刪')
check(os.path.exists(obj), 'objects 底下的不碰')
old4 = mk('index.lock', 3600)
gone = R.clear_stale_git_locks(g, now=now, running=True)
check(os.path.exists(old4) and gone == [], '有 git 在跑：舊的也不刪')
check(isinstance(R.git_running(), bool), 'git_running() 回傳 bool', R.git_running())
check(R.clear_stale_git_locks(os.path.join(d, 'nope'), now=now, running=False) == [], '沒有 .git 資料夾：不出錯')
print('ALL PASS' if not fails else 'FAILED %d' % len(fails)); sys.exit(1 if fails else 0)
