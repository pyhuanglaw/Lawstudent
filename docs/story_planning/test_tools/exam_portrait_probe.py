"""BB（帳號 A）2026-10-21：TEST-01（考試真實上課→交卷，直向截圖）＋BUG-08（考試中直向畫面露出「離開教室」）。
開發分支的 tests/flow_exam_terms.py 原封不動地跑，只換兩件事（不改那支測試、不改遊戲）：
  ① 手機模擬改直向 390×844（playlib.launch 一律 landscape=False）；
  ② 每次點對話（playlib.tap）之前，找畫面上「看得到」的「離開教室」：元素本身看得到（display／visibility／opacity／大小），
     而且在畫面範圍內、中心點最上層就是它（沒被對話框蓋住）；記下當時的對話（題目 n／5 那一句）、busy、對話中。
     考試題目顯示中（對話有「／5」）看得到 → BUG-08 重現：截圖 BUG08_<學期>_<n>，最後判定失敗。
另外每一題（1／5～5／5）各截一張直向截圖（q<n>_port），交卷後一張。
[前置／捷徑] 和 flow_exam_terms.py 一樣：讀檔到那一科期末考那天 07:40 宿舍（GAME.applySave；旗標只放開場已經演過的那幾個）。不用 ?turbo。
不是 iPhone：Playwright＋SwiftShader 的手機模擬（is_mobile、觸控、iPhone UA）。
用法：LW_TESTS=<開發分支>/tests python3 exam_portrait_probe.py '<URL>/index.html' <輸出資料夾>"""
import os, sys, json, runpy
T = os.environ['LW_TESTS']; sys.path.insert(0, T)
import playlib as L

_launch, _tap, _finish, _shot, _init, _setup = L.launch, L.tap, L.Run.finish, L.Run.shot, L.Run.__init__, L.Run.setup
RUN = {'run': None, 'term': '', 'seen': set()}
HITS, LOG = [], []
LEAVE = """(()=>{ const out=[]; const D=GAME.D||{}; const dt=(document.querySelector('#dlg')||{}).textContent||'';
  for(const e of document.querySelectorAll('body *')){ if(e.children.length>1) continue; const t=(e.textContent||'').trim(); if(!t.includes('離開教室')) continue;
    const cs=getComputedStyle(e), r=e.getBoundingClientRect(); if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0||r.width<2||r.height<2) continue;
    let hidden=false; for(let p=e.parentElement;p;p=p.parentElement){ const c=getComputedStyle(p); if(c.display==='none'||c.visibility==='hidden'||+c.opacity===0){ hidden=true; break; } } if(hidden) continue;
    const cx=r.x+r.width/2, cy=r.y+r.height/2; if(cx<0||cy<0||cx>innerWidth||cy>innerHeight) continue;
    const top=document.elementFromPoint(cx,cy); const onTop=!!top&&(top===e||e.contains(top)||top.contains(e));
    out.push({id:e.id||'', cls:(e.className&&e.className.baseVal===undefined?e.className:'')+'', txt:t.slice(0,24), rect:[r.x|0,r.y|0,r.width|0,r.height|0], onTop}); }
  return {hits:out, dtext:dt.trim().slice(0,50), dlg:!!D.active, busy:!!(GAME.E&&GAME.E.player&&GAME.E.player.busy), zone:GAME.G&&GAME.G.zone}; })()"""


async def launch(p, landscape=True):
    return await _launch(p, landscape=False)


def init(self, *a, **k):
    RUN['run'] = self; return _init(self, *a, **k)


def setup(self, s):
    if s[:1] == 'Y' and s[1:2].isdigit(): RUN['term'] = s.split()[0]   # flow_exam_terms：「Y1S1 讀檔到 …」
    return _setup(self, s)


async def shot(self, pg, name):
    RUN['run'] = self
    return await _shot(self, pg, name)


async def tap(pg, cdp, sel):
    run = RUN['run']
    try:
        v = await pg.evaluate(LEAVE)
    except Exception as e:
        v = None; LOG.append('LEAVE 查詢失敗：' + str(e)[:80])
    if v:
        dt = v['dtext']; term = RUN['term']
        if '／5' in dt and run:
            n = dt[dt.index('／5') - 1] if dt.index('／5') > 0 else '?'
            key = term + n
            if key not in RUN['seen']:
                RUN['seen'].add(key); await _shot(run, pg, '%s_q%s_port' % (term or 'T', n))
        vis = [h for h in v['hits'] if h['onTop']]
        if vis:
            rec = {'term': term, 'dtext': dt, 'dlg': v['dlg'], 'busy': v['busy'], 'zone': v['zone'], 'hits': vis}
            HITS.append(rec); print('   ! 看得到「離開教室」', json.dumps(rec, ensure_ascii=False), flush=True)
            if '／5' in dt and run and len([h for h in HITS if '／5' in h['dtext']]) <= 3:
                await _shot(run, pg, 'BUG08_%s_%d' % (term or 'T', len(HITS)))
    return await _tap(pg, cdp, sel)


def finish(self):
    during = [h for h in HITS if '／5' in h['dtext']]
    self.check('BUG-08：考試題目顯示中（對話有「n／5」），直向畫面沒有看得到的「離開教室」', not during, json.dumps(during[:3], ensure_ascii=False))
    other = [h for h in HITS if '／5' not in h['dtext']]
    print('   考試以外看得到「離開教室」的時刻（下課、走出教室時本來就該有，只列出來看）：%d' % len(other), json.dumps(other[:6], ensure_ascii=False), flush=True)
    for x in LOG[:5]: print('   ' + x, flush=True)
    return _finish(self)


L.launch, L.tap, L.Run.finish, L.Run.shot, L.Run.__init__, L.Run.setup = launch, tap, finish, shot, init, setup
sys.argv = [os.path.join(T, 'flow_exam_terms.py')] + sys.argv[1:]
runpy.run_path(os.path.join(T, 'flow_exam_terms.py'), run_name='__main__')
