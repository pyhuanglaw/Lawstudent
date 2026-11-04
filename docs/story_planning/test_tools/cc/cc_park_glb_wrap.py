"""CC-C（帳號 C）11-04：PARK_glb_r3（BB-C 14:0x）——跑開發分支的 tests/campus_glb_integration.py，但效能那一項量之前**也把停著的腳踏車 parked_bikes 藏起來**
（像路人、騎腳踏車的路人一樣；每次讀檔停的車不一樣＝量測雜訊，PARK_glb_groups 兩輪 parked_bikes calls 17→12），「一般網址」和「改之前」兩輪都一樣藏。
不改測試本身：讀原始碼，只換掉 DRAW 那一段 JS（多藏 parked_bikes、量完放回去）和截圖輸出路徑 OUT＝out 參數，其他照原樣執行（測試原本的【前置／捷徑】照舊）。
用法：LW_TESTS=<wt>/tests python3 cc_park_glb_wrap.py <url> <out>"""
import os, re, sys
wt_tests = os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests')
src_path = os.path.join(wt_tests, 'campus_glb_integration.py')
url, out = sys.argv[1], sys.argv[2]
src = open(src_path, encoding='utf-8').read()
_line = "OUT = %r" % os.path.abspath(out)   # 替換值用函式（re 不會再處理反斜線；Windows 路徑，同 cc_qa_w1_wrap.py）
new, n1 = re.subn(r"^OUT = .*$", lambda m: _line, src, count=1, flags=re.M)
OLD = "hid.forEach(a=>a[1].remove(a[0]));"
ADD = OLD + " const __pb=E.zone&&E.zone.group&&E.zone.group.getObjectByName('parked_bikes'), __pbv=__pb?__pb.visible:null; if(__pb) __pb.visible=false;"
n2 = new.count(OLD)
new = new.replace(OLD, ADD, 1)
OLD2 = "hid.forEach(a=>a[1].add(a[0])); return out;"
n3 = new.count(OLD2)
new = new.replace(OLD2, "hid.forEach(a=>a[1].add(a[0])); if(__pb) __pb.visible=__pbv; return out;", 1)
if n1 != 1 or n2 != 1 or n3 != 1:
    print('FAIL campus_glb_integration.py 改版了：OUT＝ %d 處、DRAW 移出 %d 處、放回 %d 處（各要 1 處）' % (n1, n2, n3)); sys.exit(1)
print('  [CC 包裝] 效能那一項量的時候多藏 parked_bikes（一般網址、改之前兩輪都一樣）；截圖輸出到 %s' % os.path.abspath(out), flush=True)
os.makedirs(out, exist_ok=True)
sys.argv = [src_path, url]
sys.path.insert(0, wt_tests)
g = {'__name__': '__main__', '__file__': src_path}
exec(compile(new, src_path, 'exec'), g)
