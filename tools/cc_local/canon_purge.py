"""CANON-NO-ECON-1112（D158）：cc-local 上已經推過的結果一次清掉舊序章、外校的字（CC-C 11-12；LAWWW-C 14:31 同意做法 (b)：一般 commit，不改寫歷史）。
在 cc-local 的 worktree 跑（PC runner 開跑、合併 cc-testing 以後，只跑一次；local_out/CANON_PURGED.txt 在就不再跑）：
  1. canon_purge_list.txt 列的結果資料夾（整個只測舊序章）→ 整個刪
  2. local_out 底下檔名、資料夾名帶那些字（含英文縮寫）的 → 刪
  3. 其他文字檔（.log .txt .json .jsonl .md .csv .html）→ 換成代號（tools/cc_local/canon_codes.py；OK 的寫法、講沛珊的那幾行不動）
  截圖（.png .jpg）、trace.zip 不打開；只在 1、2 裡的會一起刪。
用法：python3 canon_purge.py <cc-local worktree> [--apply] [--commit]
  沒有 --apply＝演練：只算數字、不動檔。--apply＝改檔；--commit＝再 git add -u（只動已追蹤的）＋寫 CANON_PURGED.txt＋commit（不 push，runner 照常推）。"""
import os, sys, shutil, subprocess, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import canon_codes as C   # noqa: E402
TEXT = ('.log', '.txt', '.json', '.jsonl', '.md', '.csv', '.html')
REL = os.path.join('docs', 'story_planning', 'CC', 'local_out')


def main():
    if len(sys.argv) < 2: print(__doc__); sys.exit(2)
    root = os.path.abspath(sys.argv[1]); apply = '--apply' in sys.argv; commit = '--commit' in sys.argv and apply
    lo = os.path.join(root, REL)
    marker = os.path.join(lo, 'CANON_PURGED.txt')
    if os.path.exists(marker): print('已經清過（%s），不再跑' % marker); return 0
    lst = [l.strip() for l in open(os.path.join(HERE, 'canon_purge_list.txt'), encoding='utf-8') if l.strip() and not l.startswith('#')]
    st = {'whole_dirs': [], 'name_hits': [], 'text_files': 0, 'text_hits': 0, 'files_scanned': 0, 'left': []}
    for d in lst:
        p = os.path.join(lo, d)
        if os.path.isdir(p):
            st['whole_dirs'].append(d)
            if apply: shutil.rmtree(p)
    for dp, dns, fns in os.walk(lo, topdown=True):
        for dn in list(dns):
            if C.bad_name(dn):
                st['name_hits'].append(os.path.relpath(os.path.join(dp, dn), lo) + '/'); dns.remove(dn)
                if apply: shutil.rmtree(os.path.join(dp, dn))
        for fn in fns:
            fp = os.path.join(dp, fn)
            if C.bad_name(fn):
                st['name_hits'].append(os.path.relpath(fp, lo))
                if apply: os.remove(fp)
                continue
            if not fn.lower().endswith(TEXT): continue
            st['files_scanned'] += 1
            try: s = open(fp, 'rb').read().decode('utf-8')
            except Exception: continue
            t, k = C.to_codes(s)
            if k:
                st['text_files'] += 1; st['text_hits'] += k
                if apply: open(fp, 'wb').write(t.encode('utf-8'))
            if apply and C.hits(t): st['left'].append(os.path.relpath(fp, lo))
    print(json.dumps({k: (v if not isinstance(v, list) else len(v)) for k, v in st.items()}, ensure_ascii=False))
    print('整個刪的資料夾：' + ' '.join(st['whole_dirs']))
    print('檔名帶字（前 20）：' + ' '.join(st['name_hits'][:20]))
    if commit:
        open(marker, 'w', encoding='utf-8').write('CANON-NO-ECON-1112：%s\n' % json.dumps({k: (v if not isinstance(v, list) else len(v)) for k, v in st.items()}, ensure_ascii=False))
        subprocess.run(['git', '-C', root, 'add', '-u', '--', REL], check=False)
        subprocess.run(['git', '-C', root, 'add', '--', marker], check=False)
        r = subprocess.run(['git', '-C', root, 'commit', '-q', '-m', 'CC-local: CANON-NO-ECON-1112 一次清舊結果（整個刪 %d 個資料夾、檔名帶字 %d 個、%d 檔 %d 處換代號）' % (len(st['whole_dirs']), len(st['name_hits']), st['text_files'], st['text_hits'])], check=False)
        print('commit 結束碼 %d' % r.returncode)
    return 0


if __name__ == '__main__':
    sys.exit(main())
