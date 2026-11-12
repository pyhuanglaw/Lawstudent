"""CC-C 11-12：一次性工作 NOODLE-NAME-PURGE-1112（使用者選「也改掉」，BB-C 04:16 轉）——不是遊戲探針，是給電腦 runner 跑的維護工作。
把 claude/cc-local 的 docs/story_planning/CC/local_out 底下文字檔（.log .txt .json .md .jsonl .csv）裡的舊群組名換成「桌遊團」；
圖片和其他二進位不動。用 bytes 直接換（兩個詞 UTF-8 都是 9 bytes，不解碼、不改換行、不改編碼）。
runner 每一項只 commit 自己的輸出資料夾，所以這支自己把改到的檔 git add＋commit（只加改到的檔，分批 50 個）；推上去照 runner 正常流程（這一項結束後的 push）。
用法（runner KIND py：python oneoff_noodle_rename.py <url 不用> <od＝local_out/<ID>>）；DRY=1＝只數不改、不 commit。
報告：<out>/rename_report.json（改了哪些檔、每檔幾處、跳過的、commit 結果）。"""
import os, sys, json, subprocess

OLD = bytes.fromhex('e9bab5e5ba97e59c98')   # 舊名（用跳脫字寫，這支檔案本身不留舊名）
NEW = '桌遊團'.encode('utf-8')
EXTS = ('.log', '.txt', '.json', '.md', '.jsonl', '.csv')
OUT = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else sys.argv[1])
os.makedirs(OUT, exist_ok=True)
DRY = os.environ.get('DRY') == '1'


def find_root(p):
    q = p
    for _ in range(6):
        if os.path.basename(q) == 'local_out': return q
        q = os.path.dirname(q)
    return None


def main():
    assert len(OLD) == len(NEW) == 9
    root = find_root(OUT)
    rep = {'root': root, 'dry': DRY, 'changed': [], 'skipped_binary_ext': 0, 'errors': [], 'commit': None}
    if not root:
        rep['errors'].append('找不到 local_out（OUT=%s）' % OUT); print(json.dumps(rep, ensure_ascii=False)); write(rep); sys.exit(1)
    own = os.path.join(root, os.path.relpath(OUT, root).replace('\\', '/').split('/')[0])   # 這一項自己的資料夾 local_out/<ID>（runner KIND py 給 <ID>、probe 給 <ID>/out，兩種都對）
    total = 0
    for dp, dn, fn in os.walk(root):
        if os.path.abspath(dp) == own or os.path.abspath(dp).startswith(own + os.sep): continue
        dn[:] = [d for d in dn if d != '.git']
        for f in fn:
            fp = os.path.join(dp, f)
            if not f.lower().endswith(EXTS): rep['skipped_binary_ext'] += 1; continue
            try:
                b = open(fp, 'rb').read()
            except Exception as e:
                rep['errors'].append('%s 讀不到：%r' % (fp, e)); continue
            n = b.count(OLD)
            if not n: continue
            total += n; rep['changed'].append([os.path.relpath(fp, root).replace('\\', '/'), n])
            if not DRY:
                try:
                    with open(fp, 'wb') as fh: fh.write(b.replace(OLD, NEW))
                except Exception as e:
                    rep['errors'].append('%s 寫不進去：%r' % (fp, e))
    rep['files'] = len(rep['changed']); rep['occurrences'] = total
    # 驗：改完再掃一次＝0
    left = 0
    if not DRY:
        for dp, dn, fn in os.walk(root):
            dn[:] = [d for d in dn if d != '.git']
            for f in fn:
                if f.lower().endswith(EXTS):
                    try: left += open(os.path.join(dp, f), 'rb').read().count(OLD)
                    except Exception: pass
    rep['left_after'] = left
    if not DRY and rep['changed']:
        work = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(root))))   # local_out → CC → story_planning → docs → 工作樹
        files = [os.path.join(root, r) for r, _ in rep['changed']]
        try:
            subprocess.run(['git', '-C', work, 'reset', '-q'], check=False)
            for i in range(0, len(files), 50):
                subprocess.run(['git', '-C', work, 'add', '--'] + files[i:i + 50], check=False)
            r = subprocess.run(['git', '-C', work, 'commit', '-q', '-m', 'CC-local: NOODLE-NAME-PURGE-1112 一次性：local_out 文字檔 %d 個、%d 處換成桌遊團（使用者、BB-C 04:16）' % (len(files), total)], capture_output=True, text=True)
            rep['commit'] = {'rc': r.returncode, 'out': (r.stdout + r.stderr)[-300:], 'work': work}
        except Exception as e:
            rep['commit'] = {'error': repr(e)}
    write(rep)
    print('改了 %d 個檔、%d 處；剩 %d 處；commit %s；錯誤 %d' % (rep['files'], total, left, rep['commit'] and rep['commit'].get('rc'), len(rep['errors'])), flush=True)
    print('ALL PASS' if not rep['errors'] and left == 0 and (DRY or not rep['changed'] or (rep['commit'] or {}).get('rc') == 0) else 'FAILED', flush=True)


def write(rep):
    open(os.path.join(OUT, 'rename_report.json'), 'w', encoding='utf-8').write(json.dumps(rep, ensure_ascii=False, indent=1))


main()
