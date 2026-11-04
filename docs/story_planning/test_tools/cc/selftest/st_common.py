# -*- coding: utf-8 -*-
"""CC TEST-TRACE-1104 自測探針的共用部分（只給 selftest/ 底下的 st_*.py 用，不是遊戲測試）。
頁面：預設用 set_content 放一個極小的頁（按鈕＋文字）；ENV ST_PAGE=game 改開 runner 給的網址（遊戲 index.html），等 GAME 出現。
用法：python3 st_xxx.py <url> <out>（run_queue 的 probe kind 會經 gpu_wrap.py 呼叫）"""
import os, sys, json

URL = sys.argv[1] if len(sys.argv) > 1 else 'about:blank'
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.getcwd(), 'st_out')
os.makedirs(OUT, exist_ok=True)
GAME = os.environ.get('ST_PAGE', '') == 'game'
FAILS = []

HTML = """<!doctype html><meta charset="utf-8"><title>CC selftest</title>
<style>body{font:20px sans-serif;background:#eef;padding:20px} button{font-size:22px;padding:10px 18px}</style>
<h1 id="title">CC 自測頁</h1><input id="name" placeholder="名字"><button id="go">按我</button><p id="msg">還沒按</p>
<script>document.getElementById('go').onclick=()=>{document.getElementById('msg').textContent='按過了：'+document.getElementById('name').value;};</script>"""


def check(name, ok, info='', src=None):
    """src：斷言比對的值從哪裡來（BB-C 11-04 TEST-TRACE V2）——'game'＝從遊戲狀態讀出來的值、'probe'＝探針自己的常數；None＝看不出來（runner 照舊判 UNKNOWN）"""
    if src in ('game', 'probe'):
        info = '[src=%s] %s' % (src, info)
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok:
        FAILS.append(name)
    return ok


def finish():
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)


async def open_page(p):
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={'width': 640, 'height': 400})
    pg = await ctx.new_page()
    if GAME:
        print('  [前置／捷徑] 開遊戲頁 %s（自測：只開頁、不玩）' % URL, flush=True)
        await pg.goto(URL)
        for _ in range(360):
            if await pg.evaluate("typeof GAME!=='undefined'"):
                break
            await pg.wait_for_timeout(500)
    else:
        await pg.set_content(HTML)
    return b, ctx, pg


async def act(pg):
    """幾個看得到的操作，讓 trace 有時間軸（遊戲頁：只截圖）"""
    if GAME:
        await pg.wait_for_timeout(1500); return
    await pg.fill('#name', '祐廷')
    await pg.click('#go')
    await pg.wait_for_timeout(300)
