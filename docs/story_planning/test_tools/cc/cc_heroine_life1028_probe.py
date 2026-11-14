"""CC-C 11-14：HEROINE-LIFE-1028 實玩驗收（BB_468 0fbb6cda94，BB-C 10:24；USER_WANTS X122★「女主角感覺都沒有自己的生活」）。判定歸 BB，這支照規格逐列量、抄字、截圖。Windows＋GPU ≠ iPhone。
PARTS：
  HL1 圈子（src/hcircle3d.js、src/data/heroine_circle.js；days 0＝週日＝G.weekday，hcircle3d.js S.timeOk 用 G.weekday 比）五列 ROWS：
      c503_4_2 以安＋Alison（yu）campus 週一三 18:00～18:50（always）／c503_5_2 芷若＋老闆（hc_boss）cafe 週一三五 11～15／c503_6_2 語彤＋蘇姨（wz_su）wz_teahouse 週六日 13～17／
      c503_7_1 子晴＋晏如（pool_5）＋晨希（pool_11）wancai 週一三 19～21／c503_4_n1 以安一個人 cafe 每天 14～18（只有旁白、不配對）。
      每一列：在 Y1S1 照遊戲自己的 HCIRCLE.on(列, G, 區) 掃日子（每 15 分鐘；沒寫一定同框的列＝遊戲自己那天擲的 70% 也要成立）→【前置／捷徑】讀使用者存檔到那天那時那區（條件事件關掉）、
      認識她和同伴、給她聯絡方式 → FAIL_SETUP：真的在那一區、HCIRCLE.on 還成立 →
      ① 她在、看得到；② 同伴（列的 speakers，沒有就 with）每一位都在她 3.2 m 內（HCIRCLE.together 也記）；照玩家走到她 3 m 外（5 m 內）→
      ③ 字幕（GAME.caption 包一層記下來）照 heard 一句一句出，誰、字和資料（HCIRCLE.row(id).lines）一字不差、順序一樣；
      ④ 同伴在旁邊的時候找她說話：記 STORY.companyOf、選單裡沒有「約她去…」（選「就這樣」離開，不約）；一個人的那一列只記選單（照規格：同伴走開以後才出現「約她去…」，這支不另外把同伴弄走）。
      每一列兩張圖：她和同伴在一起那一刻（遊戲鏡頭）、字幕出來那一刻。
  HL2 動態牆（src/feed3d.js）：Y1S1、Y1S2、Y2S1 各兩天（第 3 週週三、第 12 週週六，21:00）——【前置／捷徑】讀使用者存檔到那學期第 1 週，五位女主角＋沛珊＋可昕給聯絡方式、很熟（同 cc_heroine_life_probe 的 PREP），
      【捷徑：跳日子】每天 23:00 叫 FEED.tick（遊戲睡過、跳時間照原本時間補的同一套）到那天 21:00 → 記 FEED.visible(G) 全部（誰、日期、照片、一句前 30 字以上全文），打開手機動態頁截圖。
      檢查：動態的日期不晚於遊戲日期；每位女主角（heroine_01～05）那一學期至少有一則動態（到那天為止貼出來的）。「講她自己的事」的內容判斷歸 BB（全文都抄）。
  HL3 私訊：不在這支，用 random_play_sim.js --dump-msgs（種子 1、2，2025-09-01～2026-01-31）。
CC-B 11-14：④ 認 PRIVTALK.PLACE_EXCEPT；在走的人跟著走再聽；找日子從 day −400 起（遊戲的 day 0＝2025-09-16，大一上第 1、2 週是負的；HL2 Y1S1 找不到第 1 週）；字幕掛鉤在讀檔前裝；④ 走近 1 m 再看互動鍵。
CC_02 清單 2026-11-14：1✓（日子照遊戲自己的 HCIRCLE.on 掃、動態照 FEED.tick） 2✓（列、句子、同伴、動態全從遊戲資料讀，不寫死句子） 3✓（每一列一個日子：第一個成立的，記下來） 4✓（找她說話照互動鍵、選單照字選「就這樣」） 5✓（go_to 走到她 3 m 外，走不到記下來） 6✓（字幕等 18 秒收齊；讀檔等 6 秒） 7✓（lint） 8✓（字幕用包 GAME.caption 記，不靠輪詢） 9✓（每一列兩張、每一天手機一張） 10✓（讀檔關條件事件、認識同伴） 11✓（SHA 40 碼） 12✓（FAIL_SETUP：區域、HCIRCLE.on、她在） 13✓（走路分段：go_to，途中有對話就停）
用法：LW_TESTS=<wt>/tests SHA=<sha> [PARTS=HL1,HL2] [ROWS=c503_4_2,...] [FIX=tests/fixtures/user_save_day51_1110.json] python3 cc_heroine_life1028_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
FIX = os.environ.get('FIX') or 'tests/fixtures/user_save_day51_1110.json'
PARTS = (os.environ.get('PARTS') or 'HL1,HL2').split(',')
ROWS = [r for r in (os.environ.get('ROWS') or 'c503_4_2,c503_5_2,c503_6_2,c503_7_1,c503_4_n1').split(',') if r]
TERMS = [t for t in (os.environ.get('TERMS') or 'Y1S1,Y1S2,Y2S1').split(',') if t]
HER = ['heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05']
R = L.Run('heroine_life1028', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)

APPLY = r"""(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; await GAME.applySave(s); })"""
ROWINFO = r"""((id)=>{ const r=HCIRCLE.row(id); if(!r) return null; return {id:r.id, who:r.who, with:r.with||[], alone:!!r.alone, always:!!r.always, zone:r.zone||null, act:r.act||null, days:r.days||null, from:r.from, to:r.to, terms:r.terms||null,
  speakers:HCIRCLE.speakers(r), lines:(r.lines||[]).map(l=>({id:l.id||null, who:l.id?HCIRCLE.nameOf(l.id):null, label:l.label||null, t:l.t})), heard:r.heard||null}; })"""
FINDROW = r"""((a)=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday,zone:G.zone}; const r=HCIRCLE.row(a.id); if(!r) return {err:'沒有這一列'}; let tried=0;
  try{ for(let d=-400; d<2600; d++){ const T=CALENDAR.termOf(d); if(!T||T.id!==a.term||(a.w0&&T.week<a.w0)) continue; const wd=CALENDAR.dateOf(d).wd%7; if(r.days&&!r.days.includes(wd)) continue;
      for(let h=(r.from!=null?r.from:8)+0.25; h<(r.to!=null?r.to:22)-0.2; h+=0.25){ G.day=d; G.weekday=wd; G.hour=h; G.zone=r.zone||G.zone; tried++; let ok=false; try{ ok=HCIRCLE.on(r,G,r.zone); }catch(e){}
        if(ok){ const e=HCIRCLE.heroEnt(r,G); return {day:d, key:CALENDAR.dateOf(d).key, wd, h:+h.toFixed(2), week:T.week, zone:(e&&e.zone)||r.zone, act:e&&e.act||null, tried}; } } } }
  finally{ Object.assign(G,keep); } return {none:true, tried}; })"""
PREP1 = r"""((a)=>{ const G=GAME.G; G.flags=G.flags||{}; G.contacts=G.contacts||{}; const ids=[a.who].concat(a.with||[]);
  for(const id of ids){ if(typeof CHARACTERS==='undefined'||!CHARACTERS[id]) continue; G.flags['met_'+id]=true; try{ SOCIAL.meet(id,G.zone); }catch(e){} }
  if(G.contacts[a.who]==null) G.contacts[a.who]=G.day-20; try{ const r=SOCIAL.rel(a.who); r.fam=Math.max(r.fam,40); r.trust=Math.max(r.trust,30); r.comf=Math.max(r.comf,25); }catch(e){}
  const r=HCIRCLE.row(a.id); return {on:!!(r&&HCIRCLE.on(r,G,G.zone)), zone:G.zone, key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(2), wd:G.weekday, stage:(()=>{ try{ return SOCIAL.stage(a.who); }catch(e){ return null; } })()}; })"""
CAPHOOK = r"""(()=>{ if(!window.__ccCapW){ const c0=GAME.caption; GAME.caption=function(w,t){ try{ (window.__ccCap=window.__ccCap||[]).push({w:String(w||''),t:String(t),ms:Math.round(performance.now())}); }catch(e){} return c0.apply(this,arguments); }; window.__ccCapW=true; } window.__ccCap=[]; return true; })()"""
NPCPOS = r"""((a)=>{ const out={}; for(const id of a.ids){ let n=null; try{ n=HCIRCLE.npcOf(GAME,id); }catch(e){} if(!n) n=(GAME.npc&&GAME.npc[id])||(GAME.E.npcs||[]).find(q=>q&&q.charId===id)||null;
    out[id]=n&&n.obj?{x:+n.obj.position.x.toFixed(2), z:+n.obj.position.z.toFixed(2), lv:n.lv|0, vis:n.obj.visible!==false&&!n.hidden, pose:n.pose||null, seat:!!n.seat, leaving:!!n.leaving, name:n.name||null}:null; }
  let tog=null; try{ const r=HCIRCLE.row(a.row), hn=HCIRCLE.npcOf(GAME,a.who); tog=hn?!!HCIRCLE.together(GAME,r,hn):null; }catch(e){ tog='ERR '+e.message; }
  let comp=null; try{ const hn=HCIRCLE.npcOf(GAME,a.who); comp=STORY.companyOf?STORY.companyOf(GAME.G,a.who,hn,GAME):null; }catch(e){ comp='ERR '+e.message; }
  const P=GAME.E.player&&GAME.E.player.obj; return {pos:out, together:tog, company:comp, player:P?{x:+P.position.x.toFixed(2), z:+P.position.z.toFixed(2)}:null, heard:((GAME.G.flags||{}).HCIRCLE||{}).heard||null}; })"""
DAYOF = r"""((a)=>{ for(let d=-400; d<2600; d++){ const T=CALENDAR.termOf(d); if(T&&T.id===a.term&&T.week===a.week&&CALENDAR.dateOf(d).wd===a.wd) return {day:d, key:CALENDAR.dateOf(d).key}; } return null; })"""
PREP2 = r"""((a)=>{ const G=GAME.G, H=(typeof DATE!=='undefined'&&DATE.HEROINES)||['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
  G.contacts=G.contacts||{}; G.flags=G.flags||{}; for(const id of H){ G.flags['met_'+id]=true; if(G.contacts[id]==null) G.contacts[id]=a.d0-30; const r=SOCIAL.rel(id); r.fam=Math.max(r.fam,70); r.trust=Math.max(r.trust,55); r.comf=Math.max(r.comf,50); }
  delete G.flags.FEED; const R=FEED.rec(G); R.start=a.d0; return {heroines:H}; })"""
STEP = r"""((a)=>{ const G=GAME.G; let err=null; for(let d=a.d0; d<=a.d1; d++){ G.day=d; G.weekday=CALENDAR.dateOf(d).wd%7; G.hour=(d===a.d1?a.h:23); try{ FEED.tick(G); }catch(e){ err=String(e).slice(0,200); break; } }
  const R=FEED.rec(G), posted=Object.keys(R.done).filter(k=>R.done[k]==='p'), by={}; for(const pid of posted){ const p=FEED.post(pid,G); if(!p) continue; (by[p.who]=by[p.who]||[]).push({id:pid, pic:FEED.txt(p.pic,'no'), say:FEED.txt(p.say,'no')}); }
  return {err, posted:posted.length, by}; })"""
VIS = r"""(()=>{ const G=GAME.G; return FEED.visible(G).map(i=>{ const p=FEED.post(i.id,G)||{}; return {id:i.id, who:i.who, name:FEED.name(G,i.who), day:i.day, date:CALENDAR.dateOf(i.day).key, h:i.h, pic:FEED.txt(p.pic,i.v), say:FEED.txt(p.say,i.v)}; }); })()"""
PHONE_TXT = "(()=>{ const p=document.getElementById('phone')||document.querySelector('.phone'); return p?(p.innerText||'').replace(/\\s+/g,' ').slice(0,3000):''; })()"


async def close_panels(pg):   # 受測版本的 tests/playlib.py（main）沒有 close_panels：照畫面上的關閉鍵點掉手機、地圖、選單
    for _ in range(3):
        n = await pg.evaluate("(()=>{ let n=0; for(const id of ['btnPhoneClose','btnMapClose','btnMenuClose','btnCloseMenu']){ const b=document.getElementById(id); if(b&&b.offsetParent){ b.click(); n++; } } return n; })()")
        if not n: break
        await pg.wait_for_timeout(500)


async def load(pg, cdp, sv0, day, hour, zone):
    sv = json.loads(json.dumps(sv0)); sv['day'] = day; sv['hour'] = hour; sv['zone'] = zone; sv.pop('pos', None); sv['weather'] = 'clear'
    sv['weekday'] = (await pg.evaluate("((d)=>CALENDAR.dateOf(d).wd)", day)) % 7
    await pg.evaluate(APPLY, sv); await pg.wait_for_timeout(6000); await close_panels(pg)
    return await D.st(pg)


async def talk_menu(pg, cdp, tag, who_name):
    """照玩家找她說話：互動鍵要有她的名字；對話一句一句點；出選單就記下來，選「就這樣」離開（不約）"""
    q = await D.st(pg)
    if who_name and who_name not in (q.get('interact') or ''):
        R.note('%s 互動鍵是「%s」，不是她（%s）——不按（記下來）' % (tag, q.get('interact'), who_name)); return None
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(900)
    menus = []; lines = []
    for _ in range(40):
        s = await D.st(pg)
        if s.get('choices'):
            menus.append(s['choices'])
            k = next((i for i, t in enumerate(s['choices']) if t.startswith('就這樣')), None)
            if k is None: k = next((i for i, t in enumerate(s['choices']) if not t.startswith('約')), 0)
            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (k + 1)); await pg.wait_for_timeout(900); continue
        if s.get('dlg'):
            t = await pg.evaluate("(document.getElementById('dlgText')||{}).textContent||''")
            if not lines or lines[-1] != t: lines.append(t)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if not s.get('busy'): break
        await pg.wait_for_timeout(400)
    return {'menus': menus, 'lines': lines}


async def part_hl1(pg, cdp, sv0, res):
    for rid in ROWS:
        tag = '[HL1 %s]' % rid; out = res.setdefault('hl1', {}).setdefault(rid, {})
        info = await pg.evaluate(ROWINFO, rid); out['row'] = info
        if not R.check('FAIL_SETUP 檢查：%s 遊戲資料有這一列' % tag, bool(info), ''): continue
        f = await pg.evaluate(FINDROW, {'id': rid, 'term': 'Y1S1', 'w0': 2}); out['find'] = f
        R.note('%s 列：%s；找日子 %s' % (tag, J({k: info[k] for k in ('who', 'with', 'alone', 'always', 'zone', 'act', 'days', 'from', 'to')}), J(f)))
        if not R.check('FAIL_SETUP 檢查：%s Y1S1 照 HCIRCLE.on 找得到成立的日子時段' % tag, bool(f and f.get('day') is not None), J(f)): continue
        await pg.evaluate(CAPHOOK)   # CC-B 11-14（HL1_CIRCLE_1028 第一次跑 ③ 少前幾句）：讀檔等 6 秒那段她們就開始說了——掛鉤要在讀檔之前裝
        s = await load(pg, cdp, sv0, f['day'], f['h'], f['zone'])
        pr = await pg.evaluate(PREP1, {'id': rid, 'who': info['who'], 'with': info['with']}); out['prep'] = pr
        R.setup('%s 【前置／捷徑】讀使用者存檔到 %s（週%s）%.2f %s（條件事件關掉）；認識她和同伴、給她聯絡方式' % (tag, f['key'], f['wd'], f['h'], f['zone']))
        if not R.check('FAIL_SETUP 檢查：%s 讀檔以後在 %s、這一列成立（HCIRCLE.on）' % (tag, f['zone']), s['zone'] == f['zone'] and pr['on'], J([s.get('zone'), pr])): continue
        await pg.wait_for_timeout(2500)
        comp = info['speakers'] or info['with']
        for w_ in range(30):   # CC-B 11-14（HL1 r3b c503_8_1：學姊和陳助教 vis false＝底模還沒下載完先藏著，pool3d.js；原本只等 2.5 秒）：等到她看得到，最多 30 秒
            np0 = await pg.evaluate(NPCPOS, {'ids': [info['who']] + comp, 'who': info['who'], 'row': rid})
            if (np0['pos'].get(info['who']) or {}).get('vis'): break
            hh_ = np0['pos'].get(info['who'])
            if w_ == 6 and hh_:   # 6 秒還看不到：遠的人不顯示（HL1 r4b：學姊在公館邊走、走過去會卡住、她們會走出區域）——【捷徑】把玩家放到她 8 m 內、站得住的點
                pl8 = await pg.evaluate("""((a)=>{ const E=GAME.E; for(const D of [8,7,9,6,10]) for(let k=0;k<12;k++){ const t=k*Math.PI/6, x=a.x+Math.sin(t)*D, z=a.z+Math.cos(t)*D; if(E.canStand(x,z,0.3,a.lv|0)){ const P=E.player.obj; P.position.set(x,P.position.y,z); E.player.path=null; return {x:+x.toFixed(2),z:+z.toFixed(2),d:D}; } } return null; })""", hh_)
                R.setup('%s 【捷徑】她 6 秒還看不到，玩家放到她 %s m 內（%s）' % (tag, pl8 and pl8['d'], J(pl8)))
            await pg.wait_for_timeout(1000)
        out['pos0'] = np0; out['vis_wait_s'] = w_
        if not (np0['pos'].get(info['who']) or {}).get('vis'):   # CC-B 11-14（HL1 r5 學姊×陳助教 放到 8 m 內還是 hidden、站著不動）：看 hcircle3d.js S.modelWait——模型還在等（_hcWait）、降級模型、ASSETS 有沒有載到
            dg_ = await pg.evaluate("""((ids)=>ids.map(id=>{ let n=null; try{ n=HCIRCLE.npcOf(GAME,id); }catch(e){} if(!n) n=(GAME.npc&&GAME.npc[id])||null; if(!n) return {id, npc:null};
              const m=n.hcModel||null; let deg=null; try{ deg=CHAR.isDegraded?CHAR.isDegraded(n.obj):null; }catch(e){}
              return {id, hidden:!!n.hidden, objVisible:n.obj?n.obj.visible:null, hcWait:!!n._hcWait, model:m, degraded:deg, assetHas:m&&ASSETS.has?ASSETS.has(m):null, loading:!!(m&&HCIRCLE._loading&&HCIRCLE._loading[m]), failed:!!(m&&HCIRCLE._failed&&HCIRCLE._failed[m]), status:m&&ASSETS.status?ASSETS.status[m]:null}; }))""", [info['who']] + comp)
            out['hidden_diag'] = dg_; R.note('%s ① 看不到的原因（hcircle3d.js S.modelWait）：%s' % (tag, J(dg_)))
        h = np0['pos'].get(info['who'])
        await D.shot(pg, 'hl1_%s_together' % rid, judge_black=False)
        if not R.check('%s ① 她在、看得到' % tag, bool(h and h['vis']), J(np0)): continue
        dists = {c: (round(math.hypot(p['x'] - h['x'], p['z'] - h['z']), 2) if p else None) for c, p in np0['pos'].items() if c != info['who']}
        out['dist0'] = dists
        if not info['alone']:
            R.check('%s ② 同伴每一位都在她 3.2 m 內（%s；HCIRCLE.together=%s）' % (tag, '、'.join(comp), np0['together']), bool(dists) and all(v is not None and v < 3.2 for v in dists.values()), J({'dist': dists, 'pos': np0['pos']}))
        tgt = None
        for rr in (3.0, 3.6, 2.4, 4.2):
            for a in range(0, 360, 30):
                x, z = h['x'] + math.sin(math.radians(a)) * rr, h['z'] + math.cos(math.radians(a)) * rr
                if await pg.evaluate("(([x,z,lv])=>{ try{ return !!GAME.E.canStand(x,z,0.3,lv); }catch(e){ return false; } })", [x, z, h['lv']]): tgt = (x, z); break
            if tgt: break
        if not R.check('FAIL_SETUP 檢查：%s 她旁邊 5 m 內找得到站得住的點' % tag, bool(tgt), J(h)): continue
        if h.get('pose') != 'walk':   # CC-B 11-14（HL1 r4：在走的人先走到原位置會跟丟——她們 18:50 前會走出校園被收掉），在走的直接跳到下面「背後 15 m」
            await L.go_to(pg, cdp, R, tgt[0], tgt[1], 0.4, '%s 走到她旁邊（%.1f m）' % (tag, math.hypot(tgt[0] - h['x'], tgt[1] - h['z'])), max_s=150, lv=h['lv'])
        if h.get('pose') == 'walk':   # CC-B 11-14（HL1 r2 c503_4_2 兩人邊走邊講；BB-B 13:22）：【捷徑】玩家放到她背後 15 m，用正常走路（點地面，不跑、不傳送）跟上去，看聽不聽得完——聽不完＝遊戲的事（BB 報 AA／LAWWW）
            pl_ = await pg.evaluate("""((a)=>{ const E=GAME.E, n=HCIRCLE.npcOf(GAME,a.who)||(GAME.npc&&GAME.npc[a.who]); if(!n||!n.obj) return null; const o=n.obj.position, ry=n.obj.rotation.y, fx=Math.sin(ry), fz=Math.cos(ry);
              for(const D of [15,14,16,13,17,12]){ const x=o.x-fx*D, z=o.z-fz*D; if(E.canStand(x,z,0.3,n.lv|0)){ const P=E.player.obj; P.position.set(x,P.position.y,z); P.rotation.y=Math.atan2(o.x-x,o.z-z); E.player.path=null; return {x:+x.toFixed(2),z:+z.toFixed(2),d:D,run:!!(E.player.run||GAME.G.run)}; } } return null; })""", {'who': info['who']})
            await pg.evaluate("window.__ccCap=[]")
            R.setup('%s 【捷徑】玩家放到她背後 %s m（%s），字幕重新收' % (tag, pl_ and pl_['d'], J(pl_)))
            fol_ = []; t0_ = time.time()
            for k_ in range(20):
                if len(await pg.evaluate("(window.__ccCap||[])")) >= len(info['lines']) or time.time() - t0_ > 180: break
                h2 = (await pg.evaluate(NPCPOS, {'ids': [info['who']], 'who': info['who'], 'row': rid}))['pos'].get(info['who'])
                if not h2 or not h2.get('vis'):
                    fol_.append({'k': k_ + 1, 'gone': h2})
                    if sum(1 for x in fol_ if isinstance(x, dict) and 'gone' in x) >= 3: break
                    await pg.wait_for_timeout(1500); continue
                sp_ = await pg.evaluate("(()=>{ const P=GAME.E.player; return {x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2), run:!!(P.run||(GAME.G&&GAME.G.run))}; })()")
                fol_.append({'k': k_ + 1, 'her': [h2['x'], h2['z']], 'me': [sp_['x'], sp_['z']], 'd': round(math.hypot(h2['x'] - sp_['x'], h2['z'] - sp_['z']), 1), 'run': sp_['run']})
                dd_ = math.hypot(h2['x'] - sp_['x'], h2['z'] - sp_['z']); st_ = min(max(dd_ - 2.5, 0.5), 14.0)   # CC-B 11-14（HL1 r3：點地面超過 16 m 遊戲會自動跑，engine3d.js P.run＝距離>16）：每次只點 14 m 內＝走路
                tx_, tz_ = sp_['x'] + (h2['x'] - sp_['x']) / (dd_ or 1) * st_, sp_['z'] + (h2['z'] - sp_['z']) / (dd_ or 1) * st_
                await L.go_to(pg, cdp, R, tx_, tz_, 1.0, '%s 走路跟著她（第 %d 輪）' % (tag, k_ + 1), max_s=20, lv=h2['lv'], stop=lambda st_: False)
            out['follow'] = fol_; R.note('%s 跟著走：%s' % (tag, J(fol_)))
            got_ = await pg.evaluate("(window.__ccCap||[])")
            ran_ = any(isinstance(x, dict) and x.get('run') for x in fol_)
            R.check('FAIL_SETUP 檢查：%s ③b 跟的時候都是走路（沒有自動跑）' % tag, not ran_, J(fol_))
            R.check('%s ③b 正常走路從 15 m 外跟上去，聽得完 %d 句（聽不完＝遊戲：她們走太快／聽的距離不夠，交 BB）' % (tag, len(info['lines'])), len(got_) >= len(info['lines']), J({'got': [c['t'] for c in got_], 'follow': fol_}))
        caps = []; shot_cap = False
        for _ in range(36):
            caps = await pg.evaluate("window.__ccCap||[]")
            if caps and not shot_cap: await D.shot(pg, 'hl1_%s_caption' % rid, judge_black=False); shot_cap = True
            if len(caps) >= len(info['lines']): break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(1500); caps = await pg.evaluate("window.__ccCap||[]")
        np1 = await pg.evaluate(NPCPOS, {'ids': [info['who']] + comp, 'who': info['who'], 'row': rid}); out['pos1'] = np1; out['caps'] = caps
        want = [l['t'] for l in info['lines']]; got = [c['t'] for c in caps]
        R.note('%s 字幕（誰｜字）%s；資料 heard 拆開 %s' % (tag, J([[c['w'], c['t']] for c in caps]), J([[l['who'] or l['label'] or '（旁白）', l['t']] for l in info['lines']])))
        R.check('%s ③ 字幕照 heard 一句一句出、字一字不差、順序一樣（%d 句）' % (tag, len(want)), got[:len(want)] == want, J({'want': want, 'got': got}))
        nm_ = (np1['pos'].get(info['who']) or h).get('name') or h.get('name') or ''
        for k_ in range(3):   # CC-B 11-14（同上 ④）：站 3 m 是為了「聽」；說話要走近——每輪重看她在哪，走到 1 m、互動鍵出現她的名字就停
            h1 = (await pg.evaluate(NPCPOS, {'ids': [info['who']], 'who': info['who'], 'row': rid}))['pos'].get(info['who'])
            if not h1 or not h1.get('vis'): break
            await L.go_to(pg, cdp, R, h1['x'], h1['z'], 1.0, '%s 走近她說話（第 %d 輪）' % (tag, k_ + 1), max_s=60, lv=h1['lv'], stop=lambda st_, w_=nm_: bool(w_) and w_ in (st_.get('interact') or ''))
            if nm_ and nm_ in ((await D.st(pg)).get('interact') or ''): break
        tm = await talk_menu(pg, cdp, tag, (h.get('name') or '').strip() or None)
        out['talk'] = tm; out['company_at_talk'] = np1.get('company')
        await D.shot(pg, 'hl1_%s_after_talk' % rid, judge_black=False)
        if tm is None and info.get('act') == 'barista':   # CC-B 11-14（BB-B 13:22 HL1 r2 5_2）：吧檯班的她走不進吧檯，「找她說話」＝到吧檯點餐那一條（story3d.js n.staff==='cafe'）；把那條一路的選單印出來，沒有「約她去…」＝PASS
            bar_ = await pg.evaluate("(()=>{ const E=GAME.E, lab=i=>String(typeof i.label==='function'?i.label():i.label||''); const it=(E.interactables||[]).filter(i=>!i.hidden&&/點餐/.test(lab(i)))[0]; return it?{x:it.x,z:it.z,lv:it.lv|0,label:lab(it)}:null; })()")
            if R.check('FAIL_SETUP 檢查：%s 吧檯班：找得到「點餐」互動點' % tag, bool(bar_), J(bar_)):
                await L.go_to(pg, cdp, R, bar_['x'], bar_['z'], 0.9, '%s 走到吧檯點餐點' % tag, max_s=60, lv=bar_['lv'], stop=lambda st_, w_=(h.get('name') or '@@'): '點餐' in (st_.get('interact') or '') or w_ in (st_.get('interact') or ''))
                q_ = await D.st(pg); menus_ = []; lines_ = []
                if '點餐' in (q_.get('interact') or '') or (h.get('name') or '@@') in (q_.get('interact') or ''):   # CC-B 11-14（HL1 r3）：走到吧檯點，鍵是「和林芷若說話」＝她本人；照樣按、把選單印出來
                    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(900)
                    for _ in range(40):
                        s_ = await D.st(pg)
                        if s_.get('choices'):
                            menus_.append(s_['choices'])
                            k_ = next((i_ for i_, t_ in enumerate(s_['choices']) if any(w_ in t_ for w_ in ('就這樣', '算了', '不點', '不用', '離開', '先不要'))), None)
                            if k_ is None: R.note('%s 吧檯選單沒有「就這樣／算了／不點」可以離開，停在這一層（只記）：%s' % (tag, J(s_['choices']))); break
                            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (k_ + 1)); await pg.wait_for_timeout(900); continue
                        if s_.get('dlg'): lines_.append(s_.get('dtext') or ''); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
                        break
                R.note('%s 吧檯點餐那一條：互動鍵「%s」；選單 %s；對話 %s' % (tag, q_.get('interact'), J(menus_), J(lines_[:10])))
                inv_ = [t_ for m_ in menus_ for t_ in m_ if t_.startswith('約')]
                R.check('%s ④ 吧檯班（點餐那一條）：選單沒有「約她去…」（她在上班）' % tag, bool(menus_) and not inv_, J({'menus': menus_, 'inv': inv_}))
            continue
        if tm is None:
            R.check('%s ④ 找得到她說話（互動鍵是她）' % tag, False, J(np1)); continue
        inv = [t for m in tm['menus'] for t in m if t.startswith('約')]
        R.note('%s 找她說話：旁邊的人（STORY.companyOf）%s；選單 %s；對話 %s' % (tag, J(np1.get('company')), J(tm['menus']), J(tm['lines'][:12])))
        if info['alone']:
            R.note('%s ④ 一個人的那一列：選單裡「約…」%s（只記，照規格同伴不在＝可以出現）' % (tag, J(inv)))
        else:
            near1 = {c: (round(math.hypot(p['x'] - np1['pos'][info['who']]['x'], p['z'] - np1['pos'][info['who']]['z']), 2) if p and np1['pos'].get(info['who']) else None) for c, p in np1['pos'].items() if c != info['who']}
            exc_ = await pg.evaluate("((a)=>{ try{ const L=(typeof PRIVTALK!=='undefined'&&PRIVTALK.PLACE_EXCEPT)||[]; const z=GAME.G.zone; const r=L.find(q=>q.who===a.who&&q.zone===z); return r?r.except:[]; }catch(e){ return []; } })", {'who': info['who']})
            if exc_ and all(c in exc_ for c in near1):   # CC-B 11-14（HL1 r2 c503_6_2）：PRIVTALK.PLACE_EXCEPT（AA_627 P-18／AA_679）——語彤在茶屋、旁邊只有蘇姨＝不算有人，「約她去…」照設計會出
                R.check('%s ④ 旁邊只有 %s（PRIVTALK.PLACE_EXCEPT 不算有人）：選單有「約她去…」＝對（BB-B 13:22）' % (tag, J(exc_)), bool(inv), J({'menus': tm['menus'], 'inv': inv}))
            elif all(v is not None and v < 3.2 for v in near1.values()):
                R.check('%s ④ 同伴在她 3.2 m 內的時候，選單沒有「約她去…」' % tag, not inv, J({'menus': tm['menus'], 'company': np1.get('company'), 'dist': near1}))
            else:
                R.note('%s ④ 找她說話那時同伴已經不在 3.2 m 內 %s——這一次不判（記下選單 %s）' % (tag, J(near1), J(tm['menus'])))


PREP3 = r"""((a)=>{ const G=GAME.G, H=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05'];
  G.msgs=[]; G.phone=null; PHONE.rec(G); const F=G.flags=G.flags||{}; for(const k of ['dpN','dpPick','dpDay','dpLast','dpDayOf']) delete F[k];
  G.contacts=G.contacts||{}; for(const id of H){ F['met_'+id]=true; G.contacts[id]=a.d0-1; try{ SOCIAL.meet(id,'campus'); }catch(e){} const r=SOCIAL.rel(id); Object.assign(r,{fam:25,trust:10,comf:10,rom:0,npcRom:0}); r.seen=Math.max(r.seen||0,20); r.talked=Math.max(r.talked||0,20); delete F['dating_'+id]; }   /* 剛好 FAMILIAR（social3d.js S.stage：fam≥20、不到 FRIEND 的 fam40／trust25）——子晴 dp_zq_f1／f2 要 stage===FAMILIAR */
  PHONE.join(G,'family_law','法律系家族'); PHONE.join(G,'guitar','吉他社');
  return {stages:Object.fromEntries(H.map(id=>[id,SOCIAL.stage(id)])), groups:Object.keys(PHONE.rec(G).groups)}; })"""
STEP3 = r"""((a)=>{ const G=GAME.G; let err=null; const HS=[7.5,9,12,15,17.5,19,21,22.5,23.9];
  for(let d=a.d0; d<=a.d1; d++){ G.day=d; G.weekday=CALENDAR.dateOf(d).wd%7; G.weather=(a.rain&&((d-a.r0)%a.rain===0))?'rain':'clear'; for(const h of HS){ G.hour=h; try{ STORY.phoneRules(GAME); PHONE.tick(G,false); }catch(e){ if(!err) err=CALENDAR.dateOf(d).key+' '+h+'：'+String(e).slice(0,160); } } }
  const H=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05'];
  return (G.msgs||[]).filter(m=>H.includes(m.from)).map(m=>({day:m.day, date:CALENDAR.dateOf(m.day).key, h:+(+m.h||0).toFixed(2), from:m.from, th:m.th, tag:m.tag||null, text:String(m.text||m.img||'').slice(0,120)})).concat(err?[{err}]:[]); })"""
HL3B_WANT = {'heroine_01': ['dp_a118_y1s1_an_row', 'dp_a118_y1s1_an_notice'], 'heroine_03': ['dp_a118_y1s1_yt_dish', 'dp_a118_y1s1_yt_rain'], 'heroine_02': ['dp_zhiruo_latte'], 'heroine_04': ['dp_zq_f1', 'dp_zq_f2', 'dp_ziqing_five']}


async def keyof(pg, d):
    try: return await pg.evaluate("(d=>CALENDAR.dateOf(d).key)", d)
    except Exception: return d


async def part_hl3b(pg, cdp, sv0, res):
    """BB-B 13:39（BB_468 HL3b）：五位都認識、給聯絡方式、FAMILIAR、加 family_law／guitar 群組，快轉大一上 9/1～1/15，收她們主動傳的每一則"""
    tag = '[HL3b]'; out = res.setdefault('hl3b', {})
    d0 = (await pg.evaluate(DAYOF, {'term': 'Y1S1', 'week': 1, 'wd': 1}) or {}).get('day')
    d1 = await pg.evaluate("(k=>STORY.dayOfKey(k))", os.environ.get('HL3B_TO') or '2026-01-15')
    if not R.check('FAIL_SETUP 檢查：%s 找得到 9/1（第 1 週週一）和結束日' % tag, d0 is not None and d1 is not None, J([d0, d1])): return
    s = await load(pg, cdp, sv0, d0, 7.0, 'dorm')
    pr = await pg.evaluate(PREP3, {'d0': d0}); out['prep'] = pr
    R.setup('%s 【前置／捷徑】讀使用者存檔到 %s、清掉手機（訊息、群組、每日小事的紀錄）＝當成新的一學期；五位女主角認識＋給聯絡方式＋關係設成剛好 FAMILIAR（fam 25、trust 10、comf 10）；加 family_law、guitar 群組：%s' % (tag, (await keyof(pg, d0)), J(pr)))
    if not R.check('FAIL_SETUP 檢查：%s 五位都剛好 FAMILIAR、兩個群組都在' % tag, all(v == 'FAMILIAR' for v in pr['stages'].values()) and {'family_law', 'guitar'} <= set(pr['groups']), J(pr)): return
    R.setup('%s 【捷徑：跳日子】%d → %d 每天 7:30～23:54 九個時間點叫 STORY.phoneRules＋PHONE.tick（遊戲每天的手機小事、到時間送出）；天氣【捷徑】每 5 天下雨一天、其他晴天（快轉不跑遊戲的天氣；語彤 yt_rain 要雨天）' % (tag, d0, d1))
    msgs = []
    for a in range(d0, d1 + 1, 15):
        b = min(d1, a + 14); part = await pg.evaluate(STEP3, {'d0': a, 'd1': b, 'rain': 5, 'r0': d0}); msgs += [m for m in part if 'err' not in m]
        for m in part:
            if 'err' in m: R.note('%s 例外：%s' % (tag, m['err']))
    out['msgs'] = msgs
    seen = {}
    for m in msgs: seen.setdefault(m['from'], []).append(m)
    R.note('%s 收到 %d 則：%s' % (tag, len(msgs), J({k: len(v) for k, v in seen.items()})))
    for who, L_ in sorted(seen.items()):
        R.note('%s %s：%s' % (tag, who, J([[m['date'], m['th'], m['tag'], m['text']] for m in L_])))
    for who, tags in HL3B_WANT.items():
        for t in tags:
            got = [m for m in msgs if (m['tag'] or '').startswith(t + '_')]
            R.check('%s %s 收到 %s（至少一次）' % (tag, who, t), bool(got), J(got[:2]))
    R.note('%s 學姊（只記不判）：%d 則 %s' % (tag, len(seen.get('heroine_05', [])), J([[m['date'], m['tag'], m['text']] for m in seen.get('heroine_05', [])][:20])))
    days = sorted(set(m['day'] for m in msgs)); gaps = [(days[i + 1] - days[i] - 1, days[i], days[i + 1]) for i in range(len(days) - 1)]
    if days: gaps = [(days[0] - d0, d0 - 1, days[0])] + gaps + [(d1 - days[-1], days[-1], d1 + 1)]
    g = max(gaps) if gaps else None
    out['gap'] = g; out['first'] = {k: v[0]['date'] for k, v in seen.items()}
    R.note('%s 一學期裡連續沒有任何女主角訊息最長 %s 天（%s）；每位第一則：%s' % (tag, g and g[0], g and J([(await keyof(pg, g[1])), (await keyof(pg, g[2]))]), J(out['first'])))
    await pg.evaluate("(h=>{ GAME.G.hour=h; })", 21.0); await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    await pg.evaluate("(()=>{ const t=[...document.querySelectorAll('#phone button, .phone button')].find(b=>/訊息/.test(b.textContent||'')); if(t) t.click(); })()"); await pg.wait_for_timeout(1000)
    await D.shot(pg, 'hl3b_msg_list', judge_black=False)
    th_ = await pg.evaluate("(()=>{ const r=document.querySelector('.chatRow[data-th=\"p:heroine_01\"]')||document.querySelector('.chatRow[data-th^=\"p:heroine\"]'); if(!r) return null; r.scrollIntoView({block:'center'}); return r.dataset.th; })()"); await pg.wait_for_timeout(600)   # CC-B 11-14（HL3B_r1 第二張和第一張一樣：點到的是「傳訊息給」的名字按鈕）：對話串是 game3d.js 的 .chatRow[data-th]
    await D.shot(pg, 'hl3b_msg_threads', judge_black=False)
    if th_: await L.tap(pg, cdp, '.chatRow[data-th="%s"]' % th_); await pg.wait_for_timeout(1200)
    R.note('%s 打開的對話串：%s' % (tag, th_))
    await D.shot(pg, 'hl3b_thread_an', judge_black=False)
    await close_panels(pg)


async def part_hl2(pg, cdp, sv0, res):
    for term in TERMS:
        tag = '[HL2 %s]' % term
        w1 = await pg.evaluate(DAYOF, {'term': term, 'week': 1, 'wd': 1})
        days = [await pg.evaluate(DAYOF, {'term': term, 'week': 3, 'wd': 3}), await pg.evaluate(DAYOF, {'term': term, 'week': 12, 'wd': 6})]
        if not R.check('FAIL_SETUP 檢查：%s 找得到第 1 週、第 3 週週三、第 12 週週六' % tag, bool(w1 and all(days)), J([w1] + days)): continue
        s = await load(pg, cdp, sv0, w1['day'], 9.0, 'dorm')
        pp = await pg.evaluate(PREP2, {'d0': w1['day']})
        R.setup('%s 【前置／捷徑】讀使用者存檔到 %s（第 1 週）宿舍；%s 給聯絡方式、很熟；條件事件關掉' % (tag, w1['key'], '、'.join(pp['heroines'])))
        d0 = w1['day']; out = res.setdefault('hl2', {}).setdefault(term, {})
        for x in days:
            R.setup('%s 【捷徑：跳日子】%s → %s 每天 23:00 叫 FEED.tick，那天停在 21:00' % (tag, d0, x['key']))
            stp = await pg.evaluate(STEP, {'d0': d0, 'd1': x['day'], 'h': 21})
            if stp.get('err'): R.check('%s FEED.tick 沒有例外' % tag, False, stp['err'])
            d0 = x['day'] + 1
            vis = await pg.evaluate(VIS); now = await pg.evaluate("GAME.G.day")
            out[x['key']] = {'visible': vis, 'posted_by': stp['by']}
            R.note('%s %s 21:00 動態（FEED.visible）%d 則：%s' % (tag, x['key'], len(vis), J([[v['name'], v['date'], v['pic'], v['say']] for v in vis])))
            R.check('%s %s 動態的日期都不晚於遊戲日期' % (tag, x['key']), all(v['day'] <= now for v in vis), J([[v['id'], v['date']] for v in vis if v['day'] > now]))
            await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
            sel = '[data-ptab="feed"]'
            if await pg.evaluate("(s=>{ const b=document.querySelector(s); return !!(b&&b.offsetParent!==null); })", sel):
                await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1000)
            await D.shot(pg, 'hl2_%s_%s_feed' % (term, x['key']), judge_black=False)
            out[x['key']]['screen'] = await pg.evaluate(PHONE_TXT)
            R.note('%s %s 手機動態頁畫面上的字：%s' % (tag, x['key'], out[x['key']]['screen'][:1500]))
            await close_panels(pg)
        cnt = {h: len(stp['by'].get(h) or []) for h in HER}
        R.check('%s 五位女主角這學期（到第 12 週週六）每人至少貼了一則動態（內容是不是她自己的事 BB 判）' % tag, all(v >= 1 for v in cnt.values()), J(cnt))
        for h in HER: R.note('%s %s 這學期貼的動態（抄給 BB）：%s' % (tag, h, J([[p['id'], p['pic'], p['say']] for p in (stp['by'].get(h) or [])])))


async def main():
    print('CC HEROINE-LIFE-1028（BB_468）：SHA %s；PARTS %s；ROWS %s；TERMS %s；Windows＋GPU ≠ iPhone' % (SHA or '?', ','.join(PARTS), ','.join(ROWS), ','.join(TERMS)), flush=True)
    res = {'sha': SHA}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        sv0 = await pg.evaluate("fetch(%s).then(r=>r.ok?r.json():null)" % J(FIX))
        if not R.check('FAIL_SETUP 檢查：讀得到使用者存檔 %s' % FIX, bool(sv0), ''): await b.close(); sys.exit(1)
        if not R.check('FAIL_SETUP 檢查：這個版本有 FEED、HCIRCLE', await pg.evaluate("typeof FEED!=='undefined'&&typeof HCIRCLE!=='undefined'"), ''): await b.close(); sys.exit(1)
        for part, fn in (('HL1', part_hl1), ('HL2', part_hl2), ('HL3B', part_hl3b)):
            if part not in PARTS: continue
            try: await fn(pg, cdp, sv0, res)
            except Exception as e: R.check('[%s] 沒有中斷' % part, False, repr(e)[:300])
            open(os.path.join(OUT, 'heroine_life1028.json'), 'w', encoding='utf-8').write(J(res))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
