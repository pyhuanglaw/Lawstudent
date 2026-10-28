"""BB-C 10-28 02:3x：touch_flow_wenzhou「進入 Café」FAIL（v9.10.12 候選 562a5ead9；截圖：按「進入兩點半 Café」那一下手機自己打開了＝D103）的時間軸版。
做法：拿 <工作樹>/tests/touch_flow_wenzhou.py 原封不動，只在按 #interact 之前裝記錄（不改遊戲行為）：
  STORY.phoneAuto 真的打開手機（GAME.openPhone）、DOOR.open（A21 推門，v9.10.11 沒有）開始／演完、GAME.enter 開始、區域換好、畫面變黑，各記一個時間（performance.now）；
按完以後印出時間軸＋手機開著的時候 E.paused、P.busy、fade。用來分「手機剛好在按之前打開、蓋住按鈕（測試時間差）」和「推門／換區域途中手機打開、換區域卡住（遊戲的問題）」。
用法：python3 tfw_timeline.py <工作樹> <URL>　（不是 iPhone：Playwright 手機直向模擬）"""
import sys, os, re, subprocess, tempfile
wt, url = sys.argv[1], sys.argv[2]
src = open(os.path.join(wt, 'tests/touch_flow_wenzhou.py'), encoding='utf-8').read()
HOOK = r'''await pg.evaluate("""(()=>{ const T=window.__tl=[]; const t0=performance.now(); const L=(k,x)=>T.push([Math.round(performance.now()-t0),k,x||'',GAME.G.zone,!!GAME.E.paused,!!GAME.E.player.busy,document.getElementById('fade').classList.contains('on')]);
  const op=GAME.openPhone; if(op) GAME.openPhone=function(){ L('openPhone',[...arguments].join(',')); return op.apply(this,arguments); };
  if(typeof DOOR!=='undefined'){ const od=DOOR.open; DOOR.open=function(GM,it){ const r=od.apply(this,arguments); L('DOOR.open',(it&&it.label)+' → '+(r?'推門':'null')); if(r&&r.then) r.then(k=>L('DOOR 演完',k)); return r; }; }
  const oe=GAME.enter; if(oe) GAME.enter=function(z){ L('GAME.enter',z); const r=oe.apply(this,arguments); if(r&&r.then) r.then(()=>L('enter 結束',GAME.G.zone)); return r; };
  let lz=GAME.G.zone, lp=null, lf=null; const iv=setInterval(()=>{ const z=GAME.G.zone, p=!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()), f=document.getElementById('fade').classList.contains('on'); if(z!==lz){ L('zone',z); lz=z; } if(p!==lp){ L('phone',p?'開':'關'); lp=p; } if(f!==lf){ L('fade',f?'黑':'亮'); lf=f; } if(performance.now()-t0>30000) clearInterval(iv); },25);
  L('裝好記錄'); })()""")
        '''
DUMP = r'''
        tl = await pg.evaluate("window.__tl||[]"); print('  [時間軸] ms, 事件, 內容, zone, E.paused, P.busy, fade：'); [print('   ', x) for x in tl]
'''
# 只在 Café 門口那一次按 #interact 前後加
anchor = "        await t.tap_el('#interact')\n        # 換區域要載入 Café"
assert anchor in src, '找不到 Café 門口按 #interact 那一行（測試改過了）'
src = src.replace(anchor, "        " + HOOK.strip() + "\n" + anchor, 1)
a2 = "        st = await state(pg); check('進入 Café', st['zone'] == 'cafe', st)\n"
assert a2 in src
src = src.replace(a2, a2 + DUMP, 1)
fd, tmp = tempfile.mkstemp(suffix='.py', dir=os.path.join(wt, 'tests')); os.write(fd, src.encode('utf-8')); os.close(fd)
try:
    r = subprocess.run([sys.executable, tmp, url], cwd=wt, timeout=1500); sys.exit(r.returncode)
finally:
    os.unlink(tmp)
