"""橫向 ADV 選單太長時，第一排要點得到（BB_218 最後一節，10-22 02:23：當面約學姊的地點選單兩欄，第一排被擠到螢幕最上面、捲不到）。

不開遊戲：把 index.html 和 src/adv3d.js 的 CSS 抄進一個空白頁，放一個 #choices 和十個按鈕，量第一個按鈕的中心點得不得到。
用法：python3 tests/choices_landscape_css.py
"""
import re, sys, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
html = (ROOT / 'index.html').read_text(encoding='utf-8')
adv = (ROOT / 'src/adv3d.js').read_text(encoding='utf-8')
css_main = '\n'.join(re.findall(r'<style>(.*?)</style>', html, re.S))
m = re.search(r"css\.textContent=`(.*?)`", adv, re.S) or re.search(r'`([^`]*#advTop[^`]*)`', adv, re.S)
assert m, 'adv3d.js 找不到 CSS'
css_adv = m.group(1)

def page_html(n, dlg_hidden):
    btns = ''.join(f'<button>選項 {i+1}</button>' for i in range(n))
    return f'''<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>{css_main}</style><style>{css_adv}</style></head>
<body class="adv-on"><canvas id="c" style="position:fixed;inset:0;width:100%;height:100%"></canvas>
<div id="dlg" class="{'hide' if dlg_hidden else ''}"><div id="dlgText">對話</div></div>
<div id="choices">{btns}</div></body></html>'''

fails = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    for vw, vh, label in [(844, 390, '橫向'), (390, 844, '直向')]:
        for n in (4, 6, 10, 14):
            for dlg_hidden in (True, False):
                pg = b.new_page(viewport={'width': vw, 'height': vh})
                pg.set_content(page_html(n, dlg_hidden))
                r = pg.evaluate('''()=>{ const box=document.getElementById('choices'); box.scrollTop=0;
                  const b=box.querySelector('button'), r=b.getBoundingClientRect(), br=box.getBoundingClientRect();
                  const el=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2);
                  return {top:r.top, boxTop:br.top, hit:el===b, sh:box.scrollHeight, ch:box.clientHeight, disp:getComputedStyle(box).display}; }''')
                ok = r['hit'] and r['top'] >= r['boxTop'] - 1
                tag = f"{label} {vw}x{vh} {n} 項 {'沒有對話框' if dlg_hidden else '有對話框'}（{r['disp']}）"
                print(('OK  ' if ok else 'FAIL') + f" {tag}：第一個按鈕上緣 {r['top']:.0f}、選單上緣 {r['boxTop']:.0f}、點得到 {r['hit']}、scrollHeight {r['sh']} clientHeight {r['ch']}")
                if not ok: fails.append(tag)
                pg.close()
    b.close()
print('ALL PASS' if not fails else f'FAIL {len(fails)} 項')
sys.exit(1 if fails else 0)
