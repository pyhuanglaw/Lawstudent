"""BB-B 10-24：讓 runner.sh 跑 tests/release_suite.sh（docs/TESTING.md 第五節）。runner 傳 URL（帶 ?turbo）、輸出資料夾；LW_TESTS＝工作樹的 tests。
在工作樹（乾淨 checkout）裡執行 bash tests/release_suite.sh <URL 不帶參數> <輸出資料夾>；先檢查工作樹沒有改過的檔案。"""
import os, sys, subprocess
URL = sys.argv[1].split('?')[0]; OUT = sys.argv[2]; W = os.path.dirname(os.environ['LW_TESTS'].rstrip('/'))
dirty = subprocess.run(['git', '-C', W, 'status', '--porcelain'], capture_output=True, text=True).stdout.strip()
sha = subprocess.run(['git', '-C', W, 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()
print('工作樹 %s @ %s；改過的檔案：%s' % (W, sha, dirty or '（沒有）'), flush=True)
if dirty: print('FAIL 工作樹不是乾淨的 checkout，不跑', flush=True); sys.exit(2)
# SCEN＝「<sha>:<版本字樣>」（佇列第三欄）：先把工作樹換到這個 commit（乾淨的才換），deploy_check 再檢查版本字樣（BB-B 10-24 18:2x，候選改成 55eed589e）
CO, VER = (os.environ.get('SCEN', '') + ':').split(':')[:2]
if CO:
    subprocess.run(['git', '-C', W, 'checkout', '-q', '--detach', CO], check=True)
    sha = subprocess.run(['git', '-C', W, 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()
    print('換到 %s；deploy_check 預期版本字樣：%s' % (sha, VER or '（不檢查）'), flush=True)
os.makedirs(OUT, exist_ok=True)
r = subprocess.run(['bash', 'tests/release_suite.sh', URL, OUT] + ([VER] if VER else []), cwd=W)
print(open(os.path.join(OUT, 'SUMMARY.txt')).read() if os.path.exists(os.path.join(OUT, 'SUMMARY.txt')) else '（沒有 SUMMARY.txt）', flush=True)
sys.exit(r.returncode)
