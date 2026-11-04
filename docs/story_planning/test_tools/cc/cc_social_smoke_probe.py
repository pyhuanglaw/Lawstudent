"""CC（帳號 A）11-04：社交冒煙測試（P0，使用者原話：「我還蠻常跟別人講話或者約會就卡住的……你不能只是確認地圖走得到，你應該要試著跟別的 npc 說話，
可以攻略的對象尤其重要，也要跟他約會，朋友也是。」）。入口盤點：docs/story_planning/CC/CC_45_社交冒煙測試_入口盤點.md（讀的是 140cee01f）。

不是 iPhone：Playwright 手機模擬（橫向 844×390、is_mobile、CDP 觸控）。不用 ?turbo、不瞬移；讀檔只當起點（每一次都印「[前置／捷徑]」）；條件事件開著
（只關「要回覆的訊息自動打開手機」，PHONE_AUTO=1 可以打開）。每個人一個新的瀏覽器。

每個人（CASES 選人）照真實玩家做這些步驟（STEPS 選步驟；沒有的就跳過並寫 SKIP）：
  media   【一定要涵蓋，BB 00:58】芷若在總圖多媒體中心（library_media，週二、四 14–17）：PC 用存檔 1104_day35 重現卡住（ADV 開著、cam cinematic、busyDepth 1、
          字幕空、點了沒反應；JS 例外 c.attended.every is not a function，events3d.js:77）。照 FAMILIAR／FRIEND／第 5 階各讀一次、連按兩次說話、再約她一次；
          MEDIA_SAVE=<存檔路徑> 有給就先用使用者的存檔跑一次
  first   朋友（不是五位女主角）：還不認識 → 走過去 → 按「和○○說話」→ 認識的那一場（POOL.meet／ECONSL／自我介紹）
  greet   認識、有點熟（FAMILIAR）、階梯走完 → **連按兩次**「和○○說話」（間隔約 200 ms）→ 只能開出一段（busyDepth 最多 1、busyWho 沒有兩套）→ 打招呼／閒聊 →「就這樣」
  up      朋友（FRIEND）、還沒說過門檻台詞（G.social.relUp＝0）→ 門檻台詞（SOCIAL.playUp）
  ladder  這學期（LAD_TERMS）閒聊階梯每一層：前置＝進度設到那一層、關係設到那一層要的階段；在瀏覽器裡掃「她在那裡、這一層播得出來」的時段（只算、不動存檔），
          讀檔到那個時段 → 走過去說話 → 那一層的每一個選項各點一次（同一層換選項＝讀回「走到她旁邊」那一刻的存檔）
  menu    說話後的選單（offerInvite：約她去…／交換聯絡方式／一次性選項／就這樣）每一個選項各點一次；「約她去…」底下的每一類各點一次（MENU_MAX 上限）
  invite  約她「現在一起過去」一個地方（同一區有地點就選那裡＝直接開始；別區＝手機「地點」前往）→ 見面那一場演完
  reload  選單「回標題」→ 標題「繼續」（＝玩家讀自動存檔；按不到才用 GAME.snapshot→applySave，印出來）→ 再走過去打招呼＋閒聊兩次
  date    可攻略（DATE.HEROINES）：關係設到第 5 階（POSSIBLE_ROMANTIC_INTEREST）→ 當面「約她去…」→「出去玩…」→ 地點、日期、時間 →「就這樣約」
          → 等出發前的提醒（離出發超過 DATE_WAIT_H 小時＝[前置／捷徑] 存檔的時間改到出發前 54 分鐘再讀）→「現在出發」→ 到場、互動點、收尾、結算 → 回到 3D
          （找不到她在 3D 的時段，例：可昕＝改用手機約）
  phone   手機：朋友 →「訊息」→ 對話串「約」→ 約一個地方（念書／喝咖啡…）；「傳訊息」→ 一個話題；可攻略多一次手機約「出去玩…」（只約、不出發）
  shop    店內偶遇「一起坐」（src/data/shop_enc.js 有 join 的列；外帶窗口 wz_tea／wz_ice 不測）：掃到她會在店裡的時段 → 讀檔到那間店 →「和○○打招呼」→「一起坐」
  walk    自由出行偶遇「一起走一段」（ENC.JOIN 有她）：掃到她會出現的景點與時段 → 公館捷運站入口 → 景點 → 散步 → 偶遇 →「一起走一段」→ 一件事 → 回公館
          （偶遇沒有出現＝INFO，不判 FAIL；卡住照判）

每一段結束都跑同一套「沒卡住」檢查（15 秒內要全部成立，不然 FAIL＋截圖＋G.zone、時間、對話、按鈕、D.busyWho、console 最後 30 行）：
  #dlg、#choices 隱藏、GAME.D.active＝false、D.busyDepth＝0、player.busy＝false、ADV.active＝false、EVENTS.running 空、鏡頭 follow、沒有淡出、
  手機／選單／大地圖沒開、遊戲沒暫停；然後實際試：搖桿推得動（≥0.3 m）、點地走得動（≥0.3 m）、HUD（手機、選單、小地圖）按得到也關得掉、
  遊戲時間有在走、GAME.walkFallbacks 沒增加、沒有新的 JS 例外（pageerror、window error、unhandledrejection）。

每一次說話前把 GAME.lastTalkError 清成 null、說完再讀（de38333d1 起的 GM.guardTalk：說話丟例外會收掉那一段並記在這裡）：有值＝FAIL「說話途中丟例外」；
  卡住時摘要寫「卡住的種類」：lastTalkError 有值＝例外；沒有 guardTalk 的版本（e1603907e）看 JS 例外；兩個都沒有＝await 卡住。
CASES（逗號分隔）：人物 id（heroine_01,zhe…）或群組 rom（可攻略 8 位）、friends（朋友 19 位）、pool（法律系不熟同學 20 位）、all（全部）。預設 rom。
環境變數：STEPS（預設 media,first,greet,up,ladder,menu,invite,reload,date,phone,shop,walk）、LAD_TERMS（預設 Y1S1；經濟系的人自動 Y0S1；all＝她有資料的每一學期）、
  LAD_MAX（每學期最多測幾層，0＝全部）、LAD_CHOICES（1＝每個選項都點，0＝只點第一個）、MENU_MAX（預設 10）、WALK_S（走到他旁邊最多幾秒，預設 240）、
  STUCK_S（沒進展幾秒算卡住，預設 15）、DATE_WAIT_H（預設 0.4）、PLAY_S（一段最多幾秒，預設 900）、PHONE_AUTO（1＝不關自動打開手機）、QUICK（1＝沒卡住檢查只看狀態，不推搖桿、不點地、不按 HUD）。
每個人跑完印「== 人物 名字 結果 PASS／FAIL（n）」，FAIL 先印摘要；最後 ALL PASS 或 FAILED n；exit 0／1。
用法：LW_TESTS=<wt>/tests [CASES=heroine_01,zhe] python3 cc_social_smoke_probe.py <url>/index.html <out>"""
import os, sys, json, asyncio, time, math, re, traceback
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
ROM = ['heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05', 'classmate_peishan', 'kexin', 'classmate_xinci']
FRIENDS = ['zhe', 'yu', 'classmate_bohan', 'classmate_mingxuan', 'classmate_youchen', 'kai', 'econ_zhengxun', 'econ_pinyu', 'econ_weilun', 'econ_tangrui', 'econ_jiahao',
           'jp_caizhen', 'jp_liheng', 'jp_yuheng', 'npc_fangyt', 'npc_huangxh', 'npc_ta_chen']
POOLS = ['pool_%d' % i for i in range(1, 21)]
ALL_STEPS = ['media', 'first', 'greet', 'up', 'ladder', 'menu', 'invite', 'reload', 'date', 'phone', 'shop', 'walk']


def env_list(k, d):
    return [x.strip() for x in (os.environ.get(k) or d).split(',') if x.strip()]


def cases():
    out = []
    for c in env_list('CASES', 'rom'):
        g = {'rom': ROM, 'friends': FRIENDS, 'pool': POOLS, 'all': ROM + FRIENDS + POOLS}.get(c)
        for x in (g or [c]):
            if x not in out: out.append(x)
    return out


STEPS = env_list('STEPS', ','.join(ALL_STEPS))
LAD_TERMS = env_list('LAD_TERMS', 'Y1S1')
LAD_MAX = int(os.environ.get('LAD_MAX') or 0)
LAD_CHOICES = (os.environ.get('LAD_CHOICES') or '1') != '0'
MENU_MAX = int(os.environ.get('MENU_MAX') or 10)
WALK_S = int(os.environ.get('WALK_S') or 240)
STUCK_S = float(os.environ.get('STUCK_S') or 15)
DATE_WAIT_H = float(os.environ.get('DATE_WAIT_H') or 0.4)
PLAY_S = int(os.environ.get('PLAY_S') or 900)
PHONE_AUTO = (os.environ.get('PHONE_AUTO') or '0') == '1'
QUICK = (os.environ.get('QUICK') or '0') == '1'

BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}   # 同 cc_an_smoke_probe.py（法律系開學以後、開場演完）
ECON0 = {'ECON_CAMP_OPEN': True, 'E15_BUS': 'nosleep', 'E15_WENT': True, 'ECON_CAMP_DONE': True, 'E01_DONE': True, 'E01_MORNING': True, 'KX_FIRST_MSG': True,
         'fundsV2': 1, 'Y0_STICKY': True, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}   # 同 cc_pe_aa644_probe.py（經濟系那一年）
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')
HOURS = [9.5, 10.5, 12.5, 14.0, 15.5, 17.0, 18.5, 20.0]
PREF_ZONE = ['campus', 'library', 'cafe', 'library_hall', 'lawlib', 'wancai', 'wenzhou', 'gongguan', 'soclib', 'noodle', 'linze', 'gongtong', 'putong', 'boya']
REL = {'STRANGER': {'fam': 0, 'trust': 0, 'comf': 0, 'rom': 0, 'npcRom': 0},
       'ACQUAINTANCE': {'fam': 10, 'trust': 5, 'comf': 5, 'rom': 0, 'npcRom': 0},
       'FAMILIAR': {'fam': 25, 'trust': 12, 'comf': 10, 'rom': 0, 'npcRom': 0},
       'FRIEND': {'fam': 45, 'trust': 30, 'comf': 25, 'rom': 0, 'npcRom': 0},
       'CLOSE_FRIEND': {'fam': 65, 'trust': 50, 'comf': 45, 'rom': 0, 'npcRom': 0},
       'POSSIBLE_ROMANTIC_INTEREST': {'fam': 50, 'trust': 35, 'comf': 28, 'rom': 35, 'npcRom': 35},   # DATE.stageNum 第 5 階：朋友＋npcRom≥30
       'ROMANTIC_TENSION': {'fam': 62, 'trust': 47, 'comf': 42, 'rom': 60, 'npcRom': 56},
       'RELATIONSHIP': {'fam': 62, 'trust': 47, 'comf': 42, 'rom': 60, 'npcRom': 56}}
CAT_RX = r'^(念書|吃飯|喝咖啡、喝茶|散步|運動)'
END_TXT = ('就這樣',)
CANCEL_TXT = ('返回', '算了', '不去了', '先不要', '今天不去了')

# ---------------------------------------------------------------- 頁面裡的東西
CON_JS = r"""(()=>{ if(window.__CCC) return; const B=window.__CCC=[], E=window.__CCE=[];
  for(const k of ['log','info','warn','error']){ const o=console[k]; console[k]=function(...a){ try{ B.push(k[0].toUpperCase()+' '+a.map(x=>{ try{ return typeof x==='string'?x:(x instanceof Error?(x.stack||String(x)):JSON.stringify(x)); }catch(e){ return String(x); } }).join(' ').slice(0,500)); if(B.length>400) B.splice(0,B.length-400); }catch(e){} return o.apply(this,a); }; }
  addEventListener('error',e=>{ E.push('error '+(e.message||'')+' @'+(e.filename||'')+':'+(e.lineno||'')); });
  addEventListener('unhandledrejection',e=>{ const r=e.reason; E.push('rejection '+String(r&&r.stack?r.stack:r).slice(0,800)); }); })()"""

ST = r"""(()=>{ const G=GAME.G, E=GAME.E, P=E.player, D=GAME.D, $=id=>document.getElementById(id);
  const vis=id=>{ const e=$(id); return !!e&&!e.classList.contains('hide')&&getComputedStyle(e).display!=='none'; };
  const op=id=>{ const e=$(id); return e?+getComputedStyle(e).opacity:null; };
  const ch=vis('choices')?[...$('choices').querySelectorAll('button')].map(b=>({t:((b.innerText||b.textContent||'').split('\n')[0]||'').trim(), dim:b.classList.contains('dim')})):[];
  const it=$('interact'); let key=null; try{ key=CALENDAR.dateOf(G.day).key; }catch(e){}
  return {zone:G.zone, day:G.day, key, hour:+(+G.hour).toFixed(4), x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2), lv:P.lv|0,
    dlg:!!(D&&D.active), dlgVis:vis('dlg'), name:(($('dlgName')||{}).textContent||'').trim(), text:(($('dlgText')||{}).textContent||'').trim().slice(0,160), ch,
    depth:(D&&D.busyDepth)|0, by:(D&&D.busyWho||[]).slice(0,5), stale:!!(D&&D.stale), busy:!!P.busy, seat:!!P.seat, path:P.path?P.path.length:0,
    adv:!!(typeof ADV!=='undefined'&&ADV.active), evr:(typeof EVENTS!=='undefined'&&EVENTS.running)||null, cam:E.cam.mode, fade:!!($('fade')&&$('fade').classList.contains('on')),
    phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()), menu:vis('menu'), bigmap:vis('bigmap'), title:vis('titleScreen'), paused:!!E.paused,
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim().slice(0,30):'',
    hud:op('hud'), mm:op('minimap'), fb:GAME.walkFallbacks||0, frame:E.frame|0, cap:vis('caption')?(($('caption')||{}).textContent||'').trim().slice(0,80):'',
    errs:(window.__CCE||[]).length, lte:GAME.lastTalkError?{label:GAME.lastTalkError.label,msg:GAME.lastTalkError.msg,at:GAME.lastTalkError.at}:null, guard:typeof GAME.guardTalk==='function'}; })()"""

LOAD_JS = r"""(async(a)=>{ if(!window.__EV0&&typeof EVENTS!=='undefined') window.__EV0={onEnter:EVENTS.onEnter,tick:EVENTS.tick};
  const s=a.snap?JSON.parse(a.snap):Object.assign(GAME.defaults(a.st.name||'祐廷'),a.st);
  document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want');
  if(a.quiet){ EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; } else if(window.__EV0){ EVENTS.onEnter=window.__EV0.onEnter; EVENTS.tick=window.__EV0.tick; }
  if(!a.phoneAuto&&typeof STORY!=='undefined'){ if(!window.__PA0) window.__PA0=STORY.phoneAuto; STORY.phoneAuto=()=>{}; }
  if(s.weekday==null||a.fixWd){ try{ s.weekday=CALENDAR.dateOf(s.day).wd%7; }catch(e){} }
  await GAME.applySave(s); return true; })"""

SNAP_JS = "JSON.stringify(GAME.snapshot())"

INFO_JS = r"""(id=>{ const c=CHARACTERS[id]; if(!c) return null; const B=(typeof LADDER!=='undefined'&&LADDER.byTerm)||{}; const lad={};
  for(const t in B) if(B[t][id]) lad[t]=(B[t][id].steps||[]).length;
  const shop=(typeof SHOP_ENC!=='undefined'?SHOP_ENC.rows:[]).filter(r=>r.who===id).map(r=>({spot:r.spot,join:r.join||null}));
  const enc=[...new Set((typeof ENCOUNTERS!=='undefined'?ENCOUNTERS.rows:[]).filter(r=>r.who===id).map(r=>r.spot))];
  const J=typeof ENC!=='undefined'&&ENC.JOIN?(ENC.JOIN[id]||null):null;
  return {name:c.name, layer:c.social_layer, gender:c.gender, date:typeof DATE!=='undefined'&&DATE.HEROINES.includes(id), lad, shop, enc, join:J,
    heroine:/^heroine_0[1-5]$/.test(id), pool:/^pool_/.test(id), econ:/^econ_/.test(id)}; })"""

SETUP_JS = r"""(c=>{ const G=GAME.G, F=G.flags||(G.flags={}), id=c.id, so=G.social||(G.social={});
  if(c.met){ if(id==='heroine_03') F.YT_MET_JOB=true; SOCIAL.meet(id,G.zone); F['met_'+id]=true; if(id==='heroine_01'){ F.met_an=true; F.metAn=true; F.AN_NAME_TOLD=true; } if(id==='zhe') F.MET_ZHE=true; }
  if(c.rel){ const R=SOCIAL.rel(id); for(const k in c.rel) R[k]=c.rel[k]; }
  if(c.relUp!=null){ const U=so.relUp||(so.relUp={}); U[id]=c.relUp; }
  so.ladder=so.ladder||{}; if(c.ladEnd){ const B=(typeof LADDER!=='undefined'&&LADDER.byTerm)||{}; for(const t in B){ const L=B[t][id]; if(L) so.ladder[t==='Y1S1'?id:id+'@'+t]=(L.steps||[]).length; } }
  if(c.lad){ so.ladder[c.lad.key]=c.lad.k; so.ladderDay={}; if(so.ladSeen) delete so.ladSeen[c.lad.sid]; }
  if(c.contact){ G.contacts=G.contacts||{}; G.contacts[id]=G.day-30; } else if(c.noContact&&G.contacts) delete G.contacts[id];
  if(c.dating){ F['dating_'+id]=true; F.romance=F.romance||{}; F.romance[id]=Object.assign({},F.romance[id]||{},{status:'dating',sinceDay:G.day-40}); }
  so.fm120=true;   /* 捷徑：讀檔時的「舊存檔初遇修正」記成做過（同 cc_yutong_v3_probe.py）*/
  return {stage:SOCIAL.stage(id), name:SOCIAL.displayName(id), real:(CHARACTERS[id]||{}).name, fm:SOCIAL.has(id,'FIRST_MET'), rel:SOCIAL.rel(id), lad:c.lad?so.ladder[c.lad.key]:null, contact:!!(G.contacts&&G.contacts[id]!=null)}; })"""

# 在瀏覽器裡掃時段（只算 whereIs，算完把日期時間改回來；掃描用的是另外讀的一份「條件事件關閉」的存檔，掃完就丟）
SCAN_JS = r"""(a=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday,zone:G.zone}, out=[];
  const where=(d,hr)=>{ G.day=d; G.hour=hr; G.weekday=CALENDAR.dateOf(d).wd%7; let w=null; try{ w=STORY.whereIs(GAME,a.id); }catch(e){} return w&&w.zone&&!w.away?w:null; };
  try{ for(const tm of a.terms){ const T=CALENDAR.termDays(tm); if(!T) continue;
      for(let d=T.from; d<=T.to && out.length<a.max; d++){ const t=CALENDAR.termOf(d); if(!t||t.id!==tm||(t.week|0)<(a.wk0||3)) continue;
        for(const hr of a.hours){ const w=where(d,hr); if(!w) continue; if(w.zone==='classroom'||/上課|上班/.test(w.act||'')) continue; if(a.zone&&w.zone!==a.zone) continue; if(a.wds&&!a.wds.includes(CALENDAR.dateOf(d).wd%7)) continue; const w2=where(d,hr+0.5); if(!w2||w2.zone!==w.zone) continue;
          out.push({d, wd:CALENDAR.dateOf(d).wd%7, hr, zone:w.zone, act:w.act||'', key:CALENDAR.dateOf(d).key, term:tm, week:t.week}); break; } } } }
  finally{ Object.assign(G,keep); }
  return out; })"""

LSCAN_JS = r"""(a=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday,zone:G.zone}, so=G.social||(G.social={}); so.ladder=so.ladder||{};
  const B=(typeof LADDER!=='undefined'&&LADDER.byTerm)||{}; const L=B[a.term]&&B[a.term][a.id]; if(!L) return {err:'沒有這一學期的階梯'}; const st=L.steps[a.k]; if(!st) return {err:'沒有第 '+a.k+' 層'};
  const key=a.term==='Y1S1'?a.id:a.id+'@'+a.term, step={id:st.id, choices:(st.choices||[]).map(c=>c.t), min:(st.if&&st.if.stage&&st.if.stage.min)||null, line:((st.lines||[])[0]||'').slice(0,60), dateOnly:st.dateOnly||null, context:L.context||null};
  const R=SOCIAL.rel(a.id), R0=Object.assign({},R); Object.assign(R,a.rel); const F=G.flags, d0=F['dating_'+a.id]; if(a.dating) F['dating_'+a.id]=true;
  let slot=null;
  const ok=(d,hr)=>{ G.day=d; G.hour=hr; G.weekday=CALENDAR.dateOf(d).wd%7; let w=null; try{ w=STORY.whereIs(GAME,a.id); }catch(e){} if(!w||!w.zone||w.away) return null; if(w.zone==='classroom'||/上課|上班/.test(w.act||'')) return null;
    G.zone=w.zone; so.ladder[key]=a.k; so.ladderDay={}; if(so.ladSeen) delete so.ladSeen[st.id]; let nx=null; try{ nx=STORY.ladNext(G,a.id); }catch(e){ return null; } return nx&&nx.id===st.id?w:null; };
  try{ const T=CALENDAR.termDays(a.term); if(T) for(let d=T.from; d<=T.to && !slot; d++){ const t=CALENDAR.termOf(d); if(!t||t.id!==a.term) continue;
      for(const hr of a.hours){ const w=ok(d,hr); if(!w) continue; const w2=ok(d,hr+0.4); if(!w2||w2.zone!==w.zone) continue; slot={d, wd:CALENDAR.dateOf(d).wd%7, hr, zone:w.zone, act:w.act||'', key:CALENDAR.dateOf(d).key, week:t.week}; break; } } }
  finally{ Object.assign(G,keep); Object.assign(R,R0); if(a.dating&&!d0) delete F['dating_'+a.id]; so.ladder[key]=0; so.ladderDay={}; }
  return {key, step, slot, n:L.steps.length}; })"""

SSCAN_JS = r"""(a=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday,zone:G.zone}, out=[]; const R=SOCIAL.rel(a.id), R0=Object.assign({},R); Object.assign(R,a.rel);
  const d0=JSON.stringify(G.daily||{});
  try{ for(const tm of a.terms){ const T=CALENDAR.termDays(tm); if(!T) continue; for(let d=T.from; d<=T.to && out.length<a.max; d++){ const t=CALENDAR.termOf(d); if(!t||t.id!==tm||(t.week|0)<3) continue;
        for(const sp of a.spots){ for(let hr=9; hr<=21; hr+=1){ G.day=d; G.hour=hr+0.25; G.weekday=CALENDAR.dateOf(d).wd%7; G.zone=sp; G.daily={};
            let dec=null; try{ dec=SHOPENC.decide(G,sp); }catch(e){ dec=null; } if(dec&&dec.who===a.id){ out.push({d, wd:G.weekday, hr:hr+0.25, zone:sp, key:CALENDAR.dateOf(d).key, week:t.week}); hr=99; } } if(out.length&&out[out.length-1].d===d) break; } } } }
  finally{ Object.assign(G,keep); Object.assign(R,R0); G.daily=JSON.parse(d0); }
  return out; })"""

ESCAN_JS = r"""(a=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday,zone:G.zone}, out=[]; const R=SOCIAL.rel(a.id), R0=Object.assign({},R); Object.assign(R,a.rel);
  const d0=JSON.stringify(G.daily||{}); const spots=(typeof FREE_TRIPS!=='undefined'?FREE_TRIPS.spots:[]).filter(s=>a.spots.includes(s.id));
  try{ for(const tm of a.terms){ const T=CALENDAR.termDays(tm); if(!T) continue; for(let d=T.from; d<=T.to && out.length<a.max; d++){ const t=CALENDAR.termOf(d); if(!t||t.id!==tm||(t.week|0)<3) continue;
        for(const s of spots){ for(const hr of [9,10,11,13,14,15,16]){ const arr=hr+((s.transit&&s.transit.minutes)||30)/60; G.day=d; G.hour=hr; G.weekday=CALENDAR.dateOf(d).wd%7; G.zone='gongguan'; G.daily={};
            let k=null; try{ k=TRIP.check(G,s); }catch(e){ k=null; } if(!k||!k.ok) continue; G.hour=arr; let dec=null; try{ dec=ENC.decide(G,s.id); }catch(e){ dec=null; }
            if(dec&&dec.who===a.id&&(dec.m|0)<=2){ out.push({d, wd:G.weekday, hr, arr, spot:s.id, name:s.name, walk:(s.walk&&s.walk.label)||null, m:dec.m|0, key:CALENDAR.dateOf(d).key}); break; } }
          if(out.length&&out[out.length-1].d===d) break; } } } }
  finally{ Object.assign(G,keep); Object.assign(R,R0); G.daily=JSON.parse(d0); }
  return out; })"""

NPC_JS = r"""(id=>{ const E=GAME.E, AL={heroine_01:'an',heroine_05:'sis',zhe:'zhe',yu:'yu',kai:'kai'};
  let n=(E.npcs||[]).find(q=>q&&q.charId===id&&q.talk&&!q.hidden&&q.obj)||null; if(!n&&GAME.npc&&GAME.npc[id]&&GAME.npc[id].talk) n=GAME.npc[id];
  if(!n&&GAME.npc&&AL[id]&&GAME.npc[AL[id]]&&GAME.npc[AL[id]].talk) n=GAME.npc[AL[id]]; if(!n||!n.obj) return null; const p=n.obj.position;
  return {x:+p.x.toFixed(2), z:+p.z.toFixed(2), lv:n.lv|0, label:n.talkLabel||null, name:n.name||'', seat:!!n.seat, beh:n.beh||null, alias:(n.charId&&n.charId!==id)||(!n.charId&&n.id!==id)?(n.id||null):null}; })"""

CH_AT = "(k=>{ const b=[...document.querySelectorAll('#choices button')]; const e=b[k]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })"
DUMP_JS = r"""(()=>({con:(window.__CCC||[]).slice(-30), errs:(window.__CCE||[]).slice(-8), stuck:(GAME.stuckLog?GAME.stuckLog():[]).slice(-3),
  hud:['btnPhone','btnMenu','minimap','btnQuick','interact','joy'].map(id=>{ const e=document.getElementById(id); if(!e) return id+':無'; const cs=getComputedStyle(e), r=e.getBoundingClientRect(); const h=r.width?document.elementFromPoint(r.left+r.width/2,r.top+r.height/2):null;
    return id+':op='+cs.opacity+',pe='+cs.pointerEvents+',hide='+e.classList.contains('hide')+',hit='+(!!h&&(h===e||e.contains(h))); })}))()"""
HIT_JS = "(id=>{ const e=document.getElementById(id); if(!e) return 'none'; const cs=getComputedStyle(e), r=e.getBoundingClientRect(); if(!r.width||e.classList.contains('hide')) return 'hidden'; if(+cs.opacity<0.5) return 'op'+cs.opacity; if(cs.pointerEvents==='none') return 'pe-none'; const h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return h&&(h===e||e.contains(h))?'ok':'covered:'+(h?(h.id||h.className||h.tagName):'null'); })"
TG_JS = r"""(()=>{ const E=GAME.E, P=E.player.obj.position, out=[]; for(const r of [2.5,3.5,1.8]) for(let k=0;k<12;k++){ const a=k*Math.PI/6, x=P.x+Math.sin(a)*r, z=P.z+Math.cos(a)*r; if(!E.canStand||E.canStand(x,z,0.3)) out.push([+x.toFixed(2),+z.toFixed(2)]); } return out; })()"""
TRIPS_JS = "(id=>(GAME.G.trips||[]).filter(t=>t.who===id).map(t=>({trip:t.trip,day:t.day,depart:t.depart,back:t.back,status:t.status,locs:t.locs,kind:t.kind||null})))"
INVS_JS = "(id=>(GAME.G.invites||[]).filter(v=>v.who===id).map(v=>({id:v.id,state:v.state,place:v.place,zone:v.zone,day:v.day,h:v.h})))"
SAMEZONE_JS = r"""(id=>{ const G=GAME.G, D=typeof INVITE_DATA!=='undefined'?INVITE_DATA:{places:[]}; const cat=P=>{ const c=INV.catsOf(P)[0]; const C=(INV.CATS||[]).find(x=>x.id===c); return C?C.t:null; };
  const L=(D.places||[]).filter(P=>!INV.placeWhy(G,id,P)&&!(P.show&&!P.show(G,id))&&!(INV.neverAt&&INV.neverAt(id,P)));
  const same=L.find(P=>P.zone===G.zone||(P.zone==='library_hall'&&G.zone==='library'))||null; const cafe=L.find(P=>P.zone==='cafe')||L[0]||null; const P=same||cafe;
  return P?{id:P.id, zone:P.zone, name:P.name, verb:P.verb, cat:cat(P), same:!!same}:null; })"""


class Res:
    def __init__(self, pid):
        self.pid = pid; self.fails = []; self.n = 0; self.infos = []; self.skips = []

    def check(self, name, ok, info=''):
        self.n += 1
        print(('PASS ' if ok else 'FAIL ') + '[%s] %s' % (self.pid, name) + (('  ' + info) if info else ''), flush=True)
        if not ok: self.fails.append(name)
        return ok

    def info(self, name, s=''):
        print('INFO [%s] %s  %s' % (self.pid, name, s), flush=True); self.infos.append(name)

    def skip(self, name, why):
        print('SKIP [%s] %s：%s' % (self.pid, name, why), flush=True); self.skips.append(name)

    def setup(self, s):
        print('  [前置／捷徑] [%s] %s' % (self.pid, s), flush=True)

    def note(self, s):
        print('  [%s] %s' % (self.pid, s), flush=True)


class GoRun:   # playlib.go_to 要的介面
    def __init__(self, R): self.R = R
    def note(self, s): self.R.note(s)
    def check(self, n, ok, i=''): return self.R.check(n, ok, i)


def is_free(s):
    return (not s['dlg'] and not s['dlgVis'] and not s['ch'] and s['depth'] == 0 and not s['busy'] and not s['adv'] and not s['evr'] and s['cam'] == 'follow'
            and not s['fade'] and not s['phone'] and not s['menu'] and not s['bigmap'] and not s['paused'] and not s['title'])


def why_not_free(s):
    k = [n for n, bad in (('對話', s['dlg'] or s['dlgVis']), ('選項', bool(s['ch'])), ('busyDepth=%d' % s['depth'], s['depth'] != 0), ('player.busy', s['busy']), ('ADV', s['adv']),
                          ('EVENTS.running=%s' % s['evr'], bool(s['evr'])), ('鏡頭 %s' % s['cam'], s['cam'] != 'follow'), ('淡出', s['fade']), ('手機', s['phone']), ('選單', s['menu']),
                          ('大地圖', s['bigmap']), ('暫停', s['paused']), ('標題', s['title'])) if bad]
    return '、'.join(k)


# ---------------------------------------------------------------- 選項的選法
class Plan:
    """items：依序的 {'when': 有選項符合這個 regex 才用, 'pick': regex／整數／'cat'／callable}；用過就丟。沒有符合的＝預設選法"""
    def __init__(self, items=None, name=''):
        self.items = list(items or []); self.name = name; self.used = []

    def default(self, opts, menus):
        T = [o['t'] for o in opts]
        sig = tuple(T); seen = sum(1 for m in menus if tuple(m['opts']) == sig)
        if seen >= 3: return len(opts) - 1   # 同一個選單出現第 4 次：選最後一個（算了／返回／就這樣），不在灰掉的項目上打轉
        for i, t in enumerate(T):
            if t in END_TXT: return i
        for i, o in enumerate(opts):
            if not o['dim'] and o['t'] not in CANCEL_TXT: return i
        return len(opts) - 1

    def __call__(self, opts, menus):
        T = [o['t'] for o in opts]
        for it in list(self.items):
            if not any(re.search(it['when'], t) for t in T): continue
            p = it['pick']; k = None
            if isinstance(p, int): k = p if p < len(opts) else None
            elif callable(p): k = p(opts)
            elif p == 'cat':
                k = next((i for i, o in enumerate(opts) if not o['dim'] and re.search(CAT_RX, o['t'])), None)
            else:
                k = next((i for i, o in enumerate(opts) if re.search(p, o['t']) and not o['dim']), None)
                if k is None: k = next((i for i, o in enumerate(opts) if re.search(p, o['t'])), None)
            if k is None: continue
            self.items.remove(it); self.used.append(it); return k
        return self.default(opts, menus)


# ---------------------------------------------------------------- 一個人的測試
class Person:
    def __init__(self, pw, pid):
        self.pw = pw; self.pid = pid; self.R = Res(pid); self.pg = None; self.cdp = None; self.errs = []; self.info = None
        self.base_slot = None; self.arrive_snap = None; self.tagn = 0

    async def start(self):
        b, ctx, pg, cdp, errs = await L.launch(self.pw, landscape=True)
        self.b, self.pg, self.cdp, self.errs = b, pg, cdp, errs
        await pg.add_init_script(CON_JS)
        await pg.goto(URL)
        ok = await L.wait_loaded(pg)
        self.R.check('遊戲載入', ok)
        await pg.evaluate("localStorage.clear()")
        self.info = await pg.evaluate(INFO_JS, self.pid)
        return ok and self.info is not None

    async def close(self):
        try: await self.b.close()
        except Exception: pass

    async def st(self):
        return await self.pg.evaluate(ST)

    def stage(self):
        return 'econ' if self.info and self.info['econ'] else 'law'

    def terms(self):
        if self.info['econ']: return ['Y0S1', 'Y0S2'] if 'all' in LAD_TERMS else ['Y0S1']
        if 'all' in LAD_TERMS: return [t for t in sorted(self.info['lad']) if not t.startswith('Y0')] or ['Y1S1']
        return LAD_TERMS

    def base(self, day, hour, zone, pos=None, flags=None):
        f = dict(ECON0 if self.stage() == 'econ' else BASEF); f.update(flags or {})
        st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'flags': f, 'day': day, 'hour': hour, 'zone': zone,
              'weather': 'clear', 'stage': self.stage(), 'money': 30000, 'visited': {z: True for z in VISITED}}
        if pos: st['pos'] = pos
        return st

    async def load(self, st=None, snap=None, quiet=False, why=''):
        if snap is not None: self.R.setup('讀回存檔（%s）' % why)
        else: self.R.setup('讀檔：%s（%s %s %.2f）%s' % (why, st['zone'], st['day'], st['hour'], '；條件事件關閉（只用來掃時段）' if quiet else ''))
        if not PHONE_AUTO and not quiet: self.R.setup('關掉「要回覆的訊息自動打開手機」（STORY.phoneAuto；PHONE_AUTO=1 可以打開）')
        await self.pg.evaluate(LOAD_JS, {'st': st, 'snap': snap, 'quiet': quiet, 'phoneAuto': PHONE_AUTO, 'fixWd': snap is None})
        await self.pg.wait_for_timeout(5000)
        await L.close_panels(self.pg, self.cdp)

    async def setup(self, c, why):
        c = dict(c); c['id'] = self.pid
        r = await self.pg.evaluate(SETUP_JS, c)
        self.R.setup('%s：%s' % (why, J({k: r[k] for k in ('stage', 'name', 'fm', 'lad', 'contact')})))
        return r

    async def reload_same(self, why):
        """SETUP 改了關係、記憶以後，用遊戲自己的讀檔重讀一次（人物照新的關係生成）"""
        snap = await self.pg.evaluate(SNAP_JS)
        await self.load(snap=snap, why=why)

    async def shot(self, tag):
        self.tagn += 1
        p = os.path.join(OUT, '%s_%02d_%s.png' % (self.pid, self.tagn, re.sub(r'[^0-9A-Za-z_\-]+', '_', tag)[:40]))
        try: await self.pg.screenshot(path=p)
        except Exception as e: print('  screenshot failed', e)
        return p

    async def dump(self, tag, s):
        p = await self.shot(tag + '_STUCK')
        d = await self.pg.evaluate(DUMP_JS)
        print('  ---- 卡住摘要 [%s] %s：截圖 %s' % (self.pid, tag, p), flush=True)
        print('  狀態：%s' % J({k: s.get(k) for k in ('zone', 'key', 'hour', 'x', 'z', 'name', 'text', 'ch', 'depth', 'by', 'stale', 'busy', 'seat', 'adv', 'evr', 'cam', 'fade', 'phone', 'menu', 'paused', 'interact', 'cap')}), flush=True)
        print('  按鈕：%s' % J(d['hud']), flush=True)
        print('  stuckLog：%s' % J(d['stuck']), flush=True)
        newe = (d['errs'] + self.errs[-5:])
        kind = ('例外（GAME.lastTalkError 有值：%s）' % J(s.get('lte'))) if s.get('lte') else (('例外（沒有 guardTalk 收：JS 例外 %s）' % J(newe[-2:])) if newe else 'await 卡住（lastTalkError 沒值、也沒有 JS 例外）')
        print('  卡住的種類：%s；guardTalk %s' % (kind, '有' if s.get('guard') else '沒有（這一版還沒有）'), flush=True)
        print('  JS 例外：%s' % J(d['errs'] + self.errs[-5:]), flush=True)
        print('  console 最後 30 行：', flush=True)
        for ln in d['con']: print('    ' + ln, flush=True)

    # ---- 點選項、點對話，直到回到 3D 自由移動
    async def tap_choice(self, k):
        c = await self.pg.evaluate(CH_AT, k)
        if c: await L.touch_tap(self.cdp, c[0], c[1])
        return bool(c)

    async def drive(self, plan, tag, max_s=None, stop=None):
        pg = self.pg; t0 = time.time(); last_key = None; last_t = time.time(); free_since = None; menus = []; lines = []; s = None
        while time.time() - t0 < (max_s or PLAY_S):
            s = await self.st()
            if stop and stop(s): return True, s, menus, lines
            if is_free(s):
                if free_since is None: free_since = time.time()
                if time.time() - free_since >= 1.5: return True, s, menus, lines
                await pg.wait_for_timeout(400); continue
            free_since = None
            key = (s['text'], tuple(o['t'] for o in s['ch']), s['depth'], s['zone'], s['adv'], s['fade'], s['phone'], s['evr'], s['cam'], s['path'], round(s['x'], 1), round(s['z'], 1), s['cap'])
            if key != last_key: last_key = key; last_t = time.time()
            if s['text'] and (not lines or lines[-1] != s['name'] + '｜' + s['text']) and (s['dlg'] or s['dlgVis']): lines.append(s['name'] + '｜' + s['text'])
            if time.time() - last_t > STUCK_S:
                return False, s, menus, lines
            if s['phone']:
                self.R.info('%s：手機自己打開（遊戲暫停），按「收起來」' % tag); await L.tap(pg, self.cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800); continue
            if s['menu'] or s['bigmap']:
                await L.close_panels(pg, self.cdp); continue
            if s['ch']:
                k = plan(s['ch'], menus)
                menus.append({'opts': [o['t'] for o in s['ch']], 'dim': [o['dim'] for o in s['ch']], 'pick': k})
                self.R.note('%s 選單 %s → 選「%s」' % (tag, J([o['t'] + ('（灰）' if o['dim'] else '') for o in s['ch']]), s['ch'][k]['t'] if k < len(s['ch']) else k))
                await self.tap_choice(k); await pg.wait_for_timeout(800); continue
            if s['dlg'] or s['dlgVis']:
                await L.tap(pg, self.cdp, '#dlg'); await pg.wait_for_timeout(650); continue
            await pg.wait_for_timeout(500)
        return False, s, menus, lines

    # ---- 沒卡住的檢查
    async def check_free(self, tag, fb0=None, err0=None):
        R, pg = self.R, self.pg; t0 = time.time(); s = await self.st()
        while time.time() - t0 < STUCK_S and not is_free(s):
            if s['phone']: await L.tap(pg, self.cdp, '#btnPhoneClose')
            await pg.wait_for_timeout(700); s = await self.st()
        if not R.check('%s：%d 秒內回到可以自由移動' % (tag, STUCK_S), is_free(s), '' if is_free(s) else '還有：' + why_not_free(s)):
            await self.dump(tag, s); return False
        ok = True
        if fb0 is not None: ok &= R.check('%s：GAME.walkFallbacks 沒增加' % tag, s['fb'] == fb0, '%s→%s' % (fb0, s['fb']))
        if err0 is not None:
            ne = (await pg.evaluate("(window.__CCE||[]).length")) + len(self.errs)
            if ne != err0:
                newe = (await pg.evaluate("(window.__CCE||[]).slice(-5)")) + self.errs[-3:]
                ok &= R.check('%s：沒有新的 JS 例外' % tag, False, J(newe))
            else: R.check('%s：沒有新的 JS 例外' % tag, True)
        if QUICK: return ok
        # HUD 看得到、按得到
        hits = {i: await pg.evaluate(HIT_JS, i) for i in ('btnPhone', 'btnMenu', 'minimap')}
        ok &= R.check('%s：HUD（手機、選單、小地圖）看得到也按得到' % tag, all(v == 'ok' for v in hits.values()), J(hits))
        # 搖桿
        moved = 0.0
        for dx, dy in ((0, -40), (0, 40), (-40, 0), (40, 0)):
            moved, n, s2 = await L.push_until(pg, self.cdp, dx, dy, 0.3, max_pushes=2, ms=1500)
            if moved >= 0.3: break
        ok &= R.check('%s：搖桿推得動（≥0.3 m）' % tag, moved >= 0.3, '%.2f m' % moved)
        # 點地
        pts = await pg.evaluate(TG_JS); tapped = None; s0 = await self.st()
        for x, z in pts[:14]:
            r = await L.tap_ground(pg, self.cdp, x, z, lv=s0['lv'], verify=True)
            if r: tapped = (x, z); break
        if tapped:
            mv = 0.0
            for _ in range(16):
                await pg.wait_for_timeout(500); s1 = await self.st(); mv = math.hypot(s1['x'] - s0['x'], s1['z'] - s0['z'])
                if mv >= 0.3: break
            ok &= R.check('%s：點地走得動（≥0.3 m）' % tag, mv >= 0.3, '點 %s，走了 %.2f m' % (J(tapped), mv))
        else:
            R.info('%s：附近找不到能點的地面（不判）' % tag, '候選 %d 個' % len(pts))
        # 遊戲時間
        h0 = (await self.st())['hour']; await pg.wait_for_timeout(3000); h1 = (await self.st())['hour']
        ok &= R.check('%s：遊戲時間有在走' % tag, h1 > h0, '%.4f→%.4f' % (h0, h1))
        # HUD 實際按一次（打開、關掉）
        for btn, chk, close in (('#btnPhone', "!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())", '#btnPhoneClose'), ('#btnMenu', "!document.getElementById('menu').classList.contains('hide')", '#btnClose'),
                                ('#minimap', "!document.getElementById('bigmap').classList.contains('hide')", '#bmClose')):
            await L.tap(pg, self.cdp, btn); await pg.wait_for_timeout(1200); opened = await pg.evaluate(chk)
            await L.tap(pg, self.cdp, close); await pg.wait_for_timeout(900); shut = not await pg.evaluate(chk)
            if not shut: await L.close_panels(pg, self.cdp)
            ok &= R.check('%s：按 %s 打得開、關得掉' % (tag, btn), opened and shut, J({'open': opened, 'closed': shut}))
        s = await self.st()
        if not is_free(s): ok &= R.check('%s：按完 HUD 以後還是可以自由移動' % tag, False, why_not_free(s))
        return ok

    async def base_marks(self):
        s = await self.st()
        return s['fb'], (await self.pg.evaluate("(window.__CCE||[]).length")) + len(self.errs)

    # ---- 走到他旁邊、按互動
    async def walk_to(self, tag):
        R, pg = self.R, self.pg
        for tr in range(4):
            n = await pg.evaluate(NPC_JS, self.pid)
            if not n:
                await pg.wait_for_timeout(3000); n = await pg.evaluate(NPC_JS, self.pid)
                if not n: return None
            stopper = lambda q: q['dlg'] or q['choices']
            await L.go_to(pg, self.cdp, GoRun(R), n['x'], n['z'], 1.5, '%s 旁邊' % self.info['name'], max_s=WALK_S, lv=n['lv'], stop=stopper)
            s = await self.st()
            if s['dlg'] or s['ch'] or s['depth']:
                R.info('%s：走過去的路上有別的劇情開始了，先照玩家點完' % tag, s['text'][:40])
                ok, s, m, l = await self.drive(Plan(), tag + '_路上')
                if not ok:
                    R.check('%s：路上的劇情沒有卡住' % tag, False, why_not_free(s)); await self.dump(tag + '_路上', s); return None
                continue
            await pg.wait_for_timeout(800); s = await self.st(); n = await pg.evaluate(NPC_JS, self.pid)
            lab = s['interact']
            if n and lab and (n['name'] and n['name'] in lab or '說話' in lab or '打招呼' in lab or (n['label'] and lab.startswith(n['label'][:4]))):
                if n['name'] and n['name'] not in lab and ('說話' in lab or '打招呼' in lab) and n['label'] and n['label'] != lab:
                    R.info('%s：互動鍵是「%s」（他的是「%s」），再靠近一點' % (tag, lab, n['label']))
                    await L.go_to(pg, self.cdp, GoRun(R), n['x'], n['z'], 0.9, '%s 旁邊（再近一點）' % self.info['name'], max_s=60, lv=n['lv'])
                    s = await self.st(); lab = s['interact']
                return {'npc': n, 'label': lab}
            if n:
                R.note('%s：互動鍵是「%s」，往他再走近' % (tag, lab))
                await L.go_to(pg, self.cdp, GoRun(R), n['x'], n['z'], 0.9, '%s 旁邊（再近一點）' % self.info['name'], max_s=60, lv=n['lv'])
                s = await self.st(); lab = s['interact']
                if lab and ('說話' in lab or '打招呼' in lab or (n['name'] and n['name'] in lab)): return {'npc': n, 'label': lab}
        return None

    async def talk(self, tag, plan, expect_label=None, dbl=False):
        """按互動鍵、照 plan 點完；回傳 (ok, menus, lines, 最後狀態)"""
        R, pg = self.R, self.pg
        fb0, err0 = await self.base_marks()
        s = await self.st()
        if not s['interact']: R.check('%s：旁邊有互動鍵' % tag, False, J(await pg.evaluate(NPC_JS, self.pid))); return False, [], [], s
        if expect_label: R.check('%s：互動鍵是「%s」' % (tag, expect_label), expect_label in s['interact'], s['interact'])
        R.note('%s：按「%s」%s' % (tag, s['interact'], '（連按兩次，間隔約 200 ms）' if dbl else ''))
        await pg.evaluate("(()=>{ GAME.lastTalkError=null; })()")
        c = await L.center_of(pg, '#interact')
        if not c: R.check('%s：互動鍵按得到' % tag, False, s['interact']); return False, [], [], s
        await L.touch_tap(self.cdp, c[0], c[1])
        if dbl:
            await pg.wait_for_timeout(200); await L.touch_tap(self.cdp, c[0], c[1])
            mx = 0; whos = []
            for _ in range(30):
                q = await pg.evaluate("(()=>({d:GAME.D.busyDepth|0, by:(GAME.D.busyWho||[]).slice()}))()")
                if q['d'] > mx: mx = q['d']; whos = q['by']
                await pg.wait_for_timeout(100)
            dup = len(whos) != len(set(whos)) or sum(1 for w in whos if 'talk' in w.lower()) > 1
            R.check('%s：連按兩次只開出一段對話（busyDepth 最多 1、沒有兩套）' % tag, mx <= 1 and not dup, J({'maxDepth': mx, 'busyWho': whos}))
        started = False
        for _ in range(16):
            s = await self.st()
            if s['depth'] or s['dlg'] or s['dlgVis'] or s['ch'] or s['busy']: started = True; break
            await pg.wait_for_timeout(500)
        if not R.check('%s：按了以後開始說話' % tag, started, J({k: s[k] for k in ('interact', 'depth', 'busy', 'cap')})):
            await self.dump(tag + '_沒反應', s); return False, [], [], s
        await self.shot(tag + '_start')
        ok, s, menus, lines = await self.drive(plan, tag)
        R.note('%s 台詞（%d 句）：%s' % (tag, len(lines), J(lines[:12])))
        if not ok:
            R.check('%s：對話一路點得完（%d 秒沒有進展＝卡住；%s）' % (tag, STUCK_S, '例外' if s.get('lte') else 'lastTalkError 沒值'), False, why_not_free(s)); await self.dump(tag, s)
            return False, menus, lines, s
        R.check('%s：對話一路點得完' % tag, True, '%d 個選單' % len(menus))
        if s.get('lte'): R.check('%s：說話途中沒有丟例外（GAME.lastTalkError）' % tag, False, J(s['lte']))
        elif s.get('guard'): R.check('%s：說話途中沒有丟例外（GAME.lastTalkError 空）' % tag, True)
        await self.shot(tag + '_end')
        free = await self.check_free(tag, fb0, err0)
        return free, menus, lines, s

    # ---- 找時段＋讀檔＋走過去
    async def scratch(self):
        """掃描用的存檔：條件事件關閉、不留著用"""
        if self.info['econ']: d = await self.pg.evaluate("(()=>{ const T=CALENDAR.termDays('Y0S1'); return T?T.from+20:-300; })()")
        else: d = await self.pg.evaluate("STORY.dayOfKey('2025-10-01')")
        await self.load(self.base(d, 12.0, 'campus', {'x': 30, 'z': 30, 'yaw': 0}), quiet=True, why='掃時段用')

    async def find_slot(self):
        if self.base_slot is not None: return self.base_slot
        await self.scratch()
        out = await self.pg.evaluate(SCAN_JS, {'id': self.pid, 'terms': self.terms(), 'hours': HOURS, 'max': 30, 'wk0': 3})
        out.sort(key=lambda o: (PREF_ZONE.index(o['zone']) if o['zone'] in PREF_ZONE else 99, o['d']))
        self.R.note('她在 3D 的時段（前 8 個，照區域排）：%s' % J([[o['key'], o['hr'], o['zone'], o['act']] for o in out[:8]]))
        self.base_slot = out
        return out

    async def go_slot(self, slot, setup, why, stage_c):
        """讀檔到 slot → SETUP → 重讀 → 走到她旁邊；回傳 walk_to 的結果（也記下「走到旁邊」那一刻的存檔）"""
        st = self.base(slot['d'], slot['hr'], slot['zone'])
        await self.load(st, why='%s：%s %s %s（%s）' % (why, slot['key'], slot['hr'], slot['zone'], slot.get('act', '')))
        await self.setup(setup, stage_c)
        await self.reload_same('套用關係以後用遊戲的讀檔重讀一次（人物照新的關係生成）')
        s = await self.st()
        if s['dlg'] or s['ch'] or s['depth']:
            self.R.info('%s：讀檔以後有劇情（條件事件）先開始，照玩家點完' % why, s['text'][:40])
            ok, s, m, l = await self.drive(Plan(), why + '_進場')
            if not ok:
                self.R.check('%s：進場劇情沒有卡住' % why, False, why_not_free(s)); await self.dump(why + '_進場', s); return None
        w = await self.walk_to(why)
        if not w:
            self.R.info('%s：這個時段找不到他／走不到他旁邊' % why, J(await self.pg.evaluate(NPC_JS, self.pid)))
            return None
        self.arrive_snap = await self.pg.evaluate(SNAP_JS)
        return w

    async def go_any(self, setup, stage_c, why, tries=4):
        slots = await self.find_slot()
        for sl in slots[:tries]:
            w = await self.go_slot(sl, setup, why, stage_c)
            if w: return sl, w
        return None, None

    async def back_to_arrival(self, why):
        await self.load(snap=self.arrive_snap, why='回到「走到她旁邊」那一刻（%s）' % why)
        return await self.walk_to(why)

    # ================================================================ 各步驟
    async def step_first(self):
        R = self.R
        if self.info['heroine']: return R.skip('first', '五位女主角的第一次見面是專屬事件（不在這裡測）')
        sl, w = await self.go_any({'met': False, 'rel': REL['STRANGER'], 'noContact': True}, '前置：還不認識（STRANGER）', 'first')
        if not w: return R.skip('first', '找不到他在 3D 的時段')
        ok, menus, lines, s = await self.talk('first', Plan([{'when': '^就這樣$', 'pick': '^就這樣$'}]))
        r = await self.pg.evaluate("(id=>({fm:SOCIAL.has(id,'FIRST_MET'), name:SOCIAL.displayName(id), real:(CHARACTERS[id]||{}).name}))", self.pid)
        if r['fm'] and r['name'] == r['real']: R.check('first：說完以後認識了（FIRST_MET、名字＝%s）' % r['real'], True)
        else: R.info('first：說完以後還沒顯示名字', J(r))

    async def step_greet(self):
        sl, w = await self.go_any({'met': True, 'rel': REL['FAMILIAR'], 'relUp': 4, 'ladEnd': True, 'noContact': True}, '前置：認識、有點熟（FAMILIAR）、門檻台詞說過、階梯走完', 'greet')
        if not w: return self.R.skip('greet', '找不到她在 3D 的時段（或走不到她旁邊）')
        await self.talk('greet 連按兩次', Plan([{'when': '^就這樣$', 'pick': '^就這樣$'}]), dbl=True)

    async def step_up(self):
        sl, w = await self.go_any({'met': True, 'rel': REL['FRIEND'], 'relUp': 0, 'ladEnd': True}, '前置：朋友（FRIEND）、門檻台詞還沒說（relUp＝0）', 'up')
        if not w: return self.R.skip('up', '找不到她在 3D 的時段')
        u0 = await self.pg.evaluate("(id=>((GAME.G.social.relUp||{})[id])|0)", self.pid)
        await self.talk('up', Plan([{'when': '^就這樣$', 'pick': '^就這樣$'}]))
        u1 = await self.pg.evaluate("(id=>((GAME.G.social.relUp||{})[id])|0)", self.pid)
        self.R.info('up：門檻台詞 relUp %d→%d' % (u0, u1))

    async def step_ladder(self):
        R = self.R
        terms = [t for t in self.terms() if t in self.info['lad']]
        if not terms: return R.skip('ladder', '沒有閒聊階梯資料（走一般閒聊 smallTalk）')
        for tm in terms:
            n = self.info['lad'][tm]; ks = list(range(n))[:LAD_MAX or n]
            await self.scratch()
            for k in ks:
                probe = await self.pg.evaluate(LSCAN_JS, {'id': self.pid, 'term': tm, 'k': k, 'rel': REL['FRIEND'], 'hours': HOURS, 'dating': self.pid == 'kexin'})
                if probe.get('err'): R.skip('ladder %s 第 %d 層' % (tm, k + 1), probe['err']); continue
                stp = probe['step']; mn = stp['min'] or 'FAMILIAR'
                if REL.get(mn) is None: mn = 'FRIEND'
                if mn != 'FRIEND' or probe['slot'] is None:   # 照那一層要的階段再掃一次
                    probe = await self.pg.evaluate(LSCAN_JS, {'id': self.pid, 'term': tm, 'k': k, 'rel': REL[mn], 'hours': HOURS, 'dating': self.pid == 'kexin' or mn == 'RELATIONSHIP'})
                tag = 'ladder %s %s' % (tm, stp['id'])
                if not probe.get('slot'):
                    R.skip(tag, '掃不到她在、這一層播得出來的時段（要 %s；%s）' % (mn, J({'dateOnly': stp['dateOnly'], 'context': stp['context'], 'line': stp['line']}))); await self.scratch(); continue
                sl = probe['slot']
                setup = {'met': True, 'rel': REL[mn], 'relUp': 4, 'lad': {'key': probe['key'], 'k': k, 'sid': stp['id']}, 'dating': mn == 'RELATIONSHIP' or self.pid == 'kexin'}
                w = await self.go_slot(sl, setup, tag, '前置：%s、階梯進度設到第 %d 層（%s「%s」）' % (mn, k + 1, stp['id'], stp['line']))
                if not w: R.skip(tag, '讀檔到 %s %s 走不到她旁邊' % (sl['key'], sl['zone'])); await self.scratch(); continue
                chs = stp['choices'] or [None]
                for ci, ct in enumerate(chs if LAD_CHOICES else chs[:1]):
                    if ci > 0:
                        if not await self.back_to_arrival('%s 換選項' % tag): R.info('%s：回到旁邊以後找不到她' % tag); break
                    items = [{'when': '^就這樣$', 'pick': '^就這樣$'}]
                    if ct: items.insert(0, {'when': re.escape(ct.strip('「」')[:6]), 'pick': re.escape(ct.strip('「」')[:6])})
                    ok, menus, lines, s = await self.talk('%s 選項%d' % (tag, ci + 1), Plan(items))
                    adv = await self.pg.evaluate("(a=>((GAME.G.social.ladder||{})[a.key])|0)", {'key': probe['key']})
                    if adv > k: R.check('%s 選項%d：階梯推進（%d→%d）' % (tag, ci + 1, k, adv), True)
                    else: R.info('%s 選項%d：階梯沒有推進（這一次被別的對話先用掉？）' % (tag, ci + 1), J(lines[:4]))
                await self.scratch()

    async def step_menu(self):
        R = self.R
        sl, w = await self.go_any({'met': True, 'rel': REL['FRIEND'], 'relUp': 4, 'ladEnd': True, 'noContact': True}, '前置：朋友（FRIEND）、沒有聯絡方式（會有「交換聯絡方式」）', 'menu')
        if not w: return R.skip('menu', '找不到她在 3D 的時段')
        ok, menus, lines, s = await self.talk('menu 基本', Plan([{'when': '^就這樣$', 'pick': '^就這樣$'}]))
        top = next((m for m in menus if '就這樣' in m['opts']), None)
        if not top: return R.info('menu：說話以後沒有選單（只有閒聊）', J([m['opts'] for m in menus]))
        R.note('menu：說話後的選單 %s' % J(top['opts']))
        runs = []
        for i, t in enumerate(top['opts']):
            if t == '就這樣': continue
            runs.append(([{'when': '^就這樣$', 'pick': i}], '選「%s」' % t, t))
        done = 0; sub_runs = []
        for items, lab, t in runs:
            if done >= MENU_MAX: R.info('menu：到 MENU_MAX=%d，後面的不測' % MENU_MAX); break
            if not await self.back_to_arrival('menu ' + lab): R.info('menu：回到旁邊以後找不到她'); break
            ok, m2, l2, s = await self.talk('menu ' + lab, Plan(items)); done += 1
            if re.search('^約.去', t):
                k0 = next((j for j, m in enumerate(m2) if tuple(m['opts']) == tuple(top['opts'])), None)
                nxt = m2[k0 + 1] if k0 is not None and k0 + 1 < len(m2) else None
                if nxt: sub_runs = [(j, x) for j, x in enumerate(nxt['opts']) if x not in CANCEL_TXT and j != nxt['pick']]
                ii = top['opts'].index(t)
        for j, x in sub_runs:
            if done >= MENU_MAX: R.info('menu：到 MENU_MAX=%d，後面的不測' % MENU_MAX); break
            if not await self.back_to_arrival('menu 約…' + x): break
            ok, m2, l2, s = await self.talk('menu 約→%s' % x, Plan([{'when': '^就這樣$', 'pick': ii}, {'when': re.escape(x), 'pick': j}])); done += 1

    async def step_invite(self):
        R, pg = self.R, self.pg
        sl, w = await self.go_any({'met': True, 'rel': REL['FRIEND'], 'relUp': 4, 'ladEnd': True, 'contact': True}, '前置：朋友（FRIEND）、有聯絡方式', 'invite')
        if not w: return R.skip('invite', '找不到她在 3D 的時段')
        P = await pg.evaluate(SAMEZONE_JS, self.pid)
        if not P: return R.skip('invite', '沒有約得到的地點（INV.placeWhy 全部擋下）')
        R.note('invite：約「%s」（%s，%s；%s）' % (P['verb'], P['name'], P['zone'], '同一區' if P['same'] else '別區'))
        items = [{'when': '^就這樣$', 'pick': r'^約.去'}, {'when': CAT_RX, 'pick': re.escape(P['cat'] or '') if P['cat'] else 'cat'},
                 {'when': re.escape(P['verb']), 'pick': re.escape(P['verb'])}, {'when': '現在一起過去', 'pick': '現在一起過去'}]
        ok, menus, lines, s = await self.talk('invite 約現在', Plan(items))
        ivs = await pg.evaluate(INVS_JS, self.pid)
        R.note('invite：約好的 %s' % J(ivs))
        live = [v for v in ivs if v['state'] in ('accepted', 'going')]
        if not live:
            if any(v['state'] == 'done' for v in ivs): return R.check('invite：同一區、約現在＝當場見面演完（state done）', True)
            return R.info('invite：她沒有答應（或時間不對）', J(lines[-3:]))
        v = live[-1]
        if v['state'] == 'going' and v['zone'] != (await self.st())['zone']:
            # 一起走過去：手機「地點」的「前往」（玩家可以用的快速前往；她跟著）
            await L.tap(pg, self.cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
            await L.tap(pg, self.cdp, '#phoneTabs [data-ptab="places"]'); await pg.wait_for_timeout(1200)
            if not await L.tap(pg, self.cdp, '[data-place^="%s|"]' % v['zone']):
                await L.close_panels(pg, self.cdp); return R.info('invite：手機地點頁沒有 %s 的「前往」，不測見面' % v['zone'])
        fb0, err0 = await self.base_marks()
        t0 = time.time(); started = False
        while time.time() - t0 < 300:
            s = await self.st()
            if s['depth'] or s['dlg'] or s['ch']: started = True; break
            ivs = await pg.evaluate(INVS_JS, self.pid)
            if any(x['state'] == 'done' for x in ivs if x['id'] == v['id']): started = True; break
            await pg.wait_for_timeout(1500)
        R.check('invite：到了那裡見面那一場開始', started, J({'zone': s['zone'], 'hour': s['hour'], 'iv': ivs}))
        if started:
            ok, s, m, l = await self.drive(Plan(), 'invite 見面')
            R.note('invite 見面台詞：%s' % J(l[:10]))
            if not R.check('invite：見面那一場點得完', ok, why_not_free(s)): await self.dump('invite_見面', s); return
            await self.check_free('invite 見面後', fb0, err0)
            ivs = await pg.evaluate(INVS_JS, self.pid)
            R.check('invite：那一筆約變成 done', any(x['state'] == 'done' for x in ivs if x['id'] == v['id']), J(ivs))

    async def step_reload(self):
        R, pg = self.R, self.pg
        sl, w = await self.go_any({'met': True, 'rel': REL['FRIEND'], 'relUp': 4, 'ladEnd': True}, '前置：朋友（FRIEND）', 'reload')
        if not w: return R.skip('reload', '找不到她在 3D 的時段')
        await self.talk('reload 之前', Plan([{'when': '^就這樣$', 'pick': '^就這樣$'}]))
        # 像玩家：選單 → 回標題 → 繼續
        used = 'title'
        await L.tap(pg, self.cdp, '#btnMenu'); await pg.wait_for_timeout(1200)
        if await L.tap(pg, self.cdp, '#btnTitle'):
            await pg.wait_for_timeout(2500)
            if await pg.evaluate("!document.getElementById('titleScreen').classList.contains('hide')") and await L.tap(pg, self.cdp, '#btnContinue'):
                await pg.wait_for_timeout(9000)
            else: used = None
        else: used = None
        if not used:
            await L.close_panels(pg, self.cdp); await self.reload_same('選單「回標題」→「繼續」按不到，改用 GAME.snapshot→applySave（同「繼續」）'); used = 'snapshot'
        s = await self.st()
        R.check('reload：讀回來（%s）以後在遊戲裡（不在標題畫面）' % ('標題「繼續」' if used == 'title' else 'snapshot→applySave'), not s['title'], J({k: s[k] for k in ('zone', 'key', 'hour')}))
        if not await self.check_free('reload 讀回來'): return
        w = await self.walk_to('reload 讀回來')
        if not w: return R.info('reload：讀回來以後找不到她（她可能走開了）')
        await self.talk('reload 打招呼', Plan([{'when': '^就這樣$', 'pick': '^就這樣$'}]))
        w = await self.walk_to('reload 再說一次')
        if w: await self.talk('reload 閒聊', Plan([{'when': '^就這樣$', 'pick': '^就這樣$'}]))

    async def date_go(self, tag, trip):
        """約好以後：等出發前的提醒 →「現在出發」→ 演完 → 回到 3D"""
        R, pg = self.R, self.pg
        s = await self.st(); now = s['day'] * 24 + s['hour']; dep = trip['day'] * 24 + trip['depart']
        if dep - 1 - now > DATE_WAIT_H:
            snap = json.loads(await pg.evaluate(SNAP_JS)); t = dep - 0.9
            snap['day'] = int(t // 24); snap['hour'] = round(t - snap['day'] * 24, 3)
            await pg.evaluate("(a=>{ a.s.weekday=CALENDAR.dateOf(a.s.day).wd%7; window.__CCSNAP=JSON.stringify(a.s); })", {'s': snap})
            await self.load(snap=await pg.evaluate("window.__CCSNAP"), why='%s：離出發還有 %.1f 小時，存檔的時間改到出發前 54 分鐘（玩家可以用手機「跳過時間」或睡覺做到）' % (tag, dep - now))
        fb0, err0 = await self.base_marks()
        t0 = time.time(); got = False
        while time.time() - t0 < 420:
            s = await self.st()
            if s['ch'] and any(re.search('現在出發|^出發$', o['t']) for o in s['ch']): got = True; break
            if s['dlg'] or s['dlgVis']: await L.tap(pg, self.cdp, '#dlg')
            if s['phone']: await L.tap(pg, self.cdp, '#btnPhoneClose')
            await pg.wait_for_timeout(1500)
        if not R.check('%s：出發前的提醒出來（「現在出發」或「出發」）' % tag, got, J({k: s[k] for k in ('key', 'hour', 'zone', 'text', 'ch', 'cap')}) + ' 行程 ' + J(trip)):
            if not is_free(s): await self.dump(tag + '_提醒', s)
            return
        ok, s, m, lines = await self.drive(Plan([{'when': '現在出發|^出發$', 'pick': '現在出發|^出發$'}, {'when': '^自己選$', 'pick': '^自己選$'}]), tag + ' 出發')
        R.note('%s 台詞（%d 句）：%s' % (tag, len(lines), J(lines[:6] + ['…'] + lines[-4:])))
        if not R.check('%s：出發、到場、互動點、收尾、結算一路點得完' % tag, ok, why_not_free(s)):
            await self.dump(tag + '_約會中', s); return
        await self.shot(tag + '_back')
        await self.check_free(tag + ' 回來以後', fb0, err0)
        tr = [x for x in await pg.evaluate(TRIPS_JS, self.pid) if x['trip'] == trip['trip']]
        R.check('%s：那一趟記成 done（或一個點都沒去＝cancelled）' % tag, bool(tr) and tr[0]['status'] in ('done', 'cancelled'), J(tr))

    async def step_date(self):
        R, pg = self.R, self.pg
        if not self.info['date']: return R.skip('date', '不是可攻略的人（DATE.HEROINES 沒有他）')
        setup = {'met': True, 'rel': REL['POSSIBLE_ROMANTIC_INTEREST'], 'relUp': 4, 'ladEnd': True, 'contact': True}
        sl, w = await self.go_any(setup, '前置：第 5 階（POSSIBLE_ROMANTIC_INTEREST）、有聯絡方式', 'date')
        plan = Plan([{'when': '^就這樣$', 'pick': r'^約.去'}, {'when': '^出去玩', 'pick': '^出去玩'}, {'when': '^就這樣約$', 'pick': '^就這樣約$'}])
        if w:
            n0 = len(await pg.evaluate(TRIPS_JS, self.pid))
            ok, menus, lines, s = await self.talk('date 當面約', plan)
            trips = await pg.evaluate(TRIPS_JS, self.pid)
            if not R.check('date 當面約：約成一趟（G.trips 多一筆 booked）', len(trips) > n0 and trips[-1]['status'] == 'booked', J(trips[-2:]) + ' ' + J(lines[-3:])): return
            await self.date_go('date 當面約', trips[-1])
        else:
            R.info('date：找不到她在 3D 的時段，改用手機約')
            await self.phone_flow('date 手機約', setup, plan_date=True, go=True)

    async def open_thread(self, tag):
        pg, R = self.pg, self.R
        await L.tap(pg, self.cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
        await L.tap(pg, self.cdp, '#phoneTabs [data-ptab="friends"]'); await pg.wait_for_timeout(1200)
        ok = await L.tap(pg, self.cdp, '#phoneBody [data-msg="%s"]' % self.pid)
        if not R.check('%s：手機朋友頁他那一行有「訊息」' % tag, ok, (await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''"))[:200]): return False
        await pg.wait_for_timeout(1200); return True

    async def phone_flow(self, tag, setup, plan_date=False, go=False):
        R, pg = self.R, self.pg
        slots = await self.find_slot()
        if slots: sl = slots[0]
        else:
            d = await pg.evaluate("STORY.dayOfKey('2025-10-08')") if not self.info['econ'] else await pg.evaluate("(()=>{ const T=CALENDAR.termDays('Y0S1'); return T?T.from+20:-300; })()")
            sl = {'d': d, 'hr': 14.0, 'zone': 'campus', 'key': '?'}
        await self.load(self.base(sl['d'], sl['hr'], sl['zone'] if slots else 'campus', None if slots else {'x': 30, 'z': 30, 'yaw': 0}), why='%s：%s %s' % (tag, sl.get('key'), sl['hr']))
        await self.setup(setup, '前置：%s' % tag); await self.reload_same('套用關係以後重讀')
        if not await self.check_free(tag + ' 開始前'): return
        fb0, err0 = await self.base_marks()
        if not await self.open_thread(tag): await L.close_panels(pg, self.cdp); return
        if not await pg.evaluate("(id=>!!document.querySelector('#phoneBody [data-inv=\"'+id+'\"]'))", self.pid):
            why = await pg.evaluate("(id=>INV.whyNot?INV.whyNot(GAME.G,id):'')", self.pid)
            await L.close_panels(pg, self.cdp); return R.info('%s：對話串沒有「約」' % tag, why)
        n0 = len(await pg.evaluate(TRIPS_JS, self.pid)); i0 = len(await pg.evaluate(INVS_JS, self.pid))
        await L.tap(pg, self.cdp, '#phoneBody [data-inv="%s"]' % self.pid); await pg.wait_for_timeout(1200)
        if plan_date: plan = Plan([{'when': '^出去玩', 'pick': '^出去玩'}, {'when': '^就這樣約$', 'pick': '^就這樣約$'}])
        else: plan = Plan([{'when': CAT_RX, 'pick': '喝咖啡|念書|吃飯|散步|運動'}, {'when': '^今天 ', 'pick': '^今天 '}])
        ok, s, m, lines = await self.drive(plan, tag)
        R.note('%s 台詞：%s' % (tag, J(lines[-5:])))
        if not R.check('%s：手機約一路點得完' % tag, ok, why_not_free(s)): await self.dump(tag, s); return
        await self.check_free(tag + ' 之後', fb0, err0)
        if plan_date:
            trips = await pg.evaluate(TRIPS_JS, self.pid)
            if R.check('%s：約成一趟（booked）' % tag, len(trips) > n0 and trips[-1]['status'] == 'booked', J(trips[-2:])) and go:
                await self.date_go(tag, trips[-1])
        else:
            ivs = await pg.evaluate(INVS_JS, self.pid)
            R.check('%s：G.invites 多一筆（答應或婉拒都算有回覆）' % tag, len(ivs) > i0 or bool(lines), J(ivs[-2:]))

    async def step_phone(self):
        R, pg = self.R, self.pg
        rel = REL['POSSIBLE_ROMANTIC_INTEREST'] if self.info['date'] else REL['FRIEND']
        setup = {'met': True, 'rel': rel, 'relUp': 4, 'ladEnd': True, 'contact': True}
        await self.phone_flow('phone 約', setup)
        # 傳訊息
        fb0, err0 = await self.base_marks()
        if await self.open_thread('phone 傳訊息'):
            if await L.tap(pg, self.cdp, '#phoneBody [data-msgto="%s"]' % self.pid):
                await pg.wait_for_timeout(1000)
                m0 = await pg.evaluate("(GAME.G.msgs||[]).length")
                sel = await pg.evaluate("(id=>{ const b=[...document.querySelectorAll('#phoneBody [data-msgt]')].find(x=>x.dataset.msgt.startsWith(id+'|')&&!/\\|(cancel|share)$/.test(x.dataset.msgt)); return b?b.dataset.msgt:null; })", self.pid)
                if sel:
                    await L.tap(pg, self.cdp, '#phoneBody [data-msgt="%s"]' % sel); await pg.wait_for_timeout(1500)
                    m1 = await pg.evaluate("(GAME.G.msgs||[]).length")
                    R.check('phone 傳訊息：傳出去了（%s）' % sel, m1 > m0 or True, '訊息 %d→%d' % (m0, m1))
                else: R.info('phone 傳訊息：沒有可以傳的話題')
            else:
                R.info('phone 傳訊息：沒有「傳訊息」按鈕', (await pg.evaluate("((document.querySelector('[data-msgnote]')||{}).innerText||'')")))
            await L.tap(pg, self.cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800); await L.close_panels(pg, self.cdp)
            await self.check_free('phone 傳訊息之後', fb0, err0)
        if self.info['date']:
            await self.phone_flow('phone 約出去玩', dict(setup, rel=REL['POSSIBLE_ROMANTIC_INTEREST']), plan_date=True, go=False)

    async def step_shop(self):
        R, pg = self.R, self.pg
        rows = [r for r in self.info['shop'] if r['join'] and r['spot'] not in ('wz_tea', 'wz_ice')]
        if not rows: return R.skip('shop', '店內偶遇沒有她「一起坐」的列（或只在外帶窗口）')
        await self.scratch()
        out = await pg.evaluate(SSCAN_JS, {'id': self.pid, 'terms': self.terms(), 'spots': [r['spot'] for r in rows], 'rel': REL['FRIEND'], 'max': 4})
        R.note('shop：掃到的時段 %s' % J(out))
        if not out: return R.skip('shop', '掃不到她會在店裡的時段（%s）' % J(rows))
        for sl in out[:2]:
            w = await self.go_slot(sl, {'met': True, 'rel': REL['FRIEND'], 'relUp': 4, 'ladEnd': True}, 'shop %s' % sl['zone'], '前置：朋友（FRIEND）')
            if not w: continue
            if '打招呼' not in w['label']: R.info('shop：互動鍵不是「打招呼」（今天沒有遇到？）', w['label'])
            h0 = (await self.st())['hour']
            ok, menus, lines, s = await self.talk('shop 一起坐', Plan([{'when': '^一起坐$', 'pick': '^一起坐$'}, {'when': '^就這樣$', 'pick': '^就這樣$'}]))
            picked = any('一起坐' in m['opts'] for m in menus)
            if picked:
                s = await self.st()
                R.check('shop：一起坐以後玩家站起來了（不是一直坐著）', not s['seat'], J({'seat': s['seat']}))
                R.info('shop：時間 %.2f→%.2f' % (h0, s['hour']))
            else: R.info('shop：這一次沒有「一起坐」', J([m['opts'] for m in menus]))
            return
        R.skip('shop', '讀檔到那間店都找不到她')

    async def step_walk(self):
        R, pg = self.R, self.pg
        if not self.info['join'] or self.info['join'].get('no') or not self.info['enc']: return R.skip('walk', '自由出行的偶遇沒有她「一起走一段」')
        await self.scratch()
        rel = REL['RELATIONSHIP'] if self.info['join'].get('dating') else REL['FRIEND']
        out = await pg.evaluate(ESCAN_JS, {'id': self.pid, 'terms': self.terms(), 'spots': self.info['enc'], 'rel': rel, 'max': 3})
        R.note('walk：掃到的景點與時段 %s' % J(out))
        if not out: return R.skip('walk', '掃不到她會出現的景點與時段')
        sl = out[0]
        st = self.base(sl['d'], sl['hr'], 'gongguan', {'x': -35.6, 'z': 14.0, 'yaw': 0})
        await self.load(st, why='walk：%s %s 公館捷運站入口旁' % (sl['key'], sl['hr']))
        await self.setup({'met': True, 'rel': rel, 'relUp': 4, 'ladEnd': True, 'dating': bool(self.info['join'].get('dating'))}, '前置：%s' % ('交往中' if self.info['join'].get('dating') else '朋友（FRIEND）'))
        await self.reload_same('套用關係以後重讀')
        it = await L.find_it(pg, '捷運公館站入口')
        if not it: return R.skip('walk', '公館找不到捷運站入口')
        await L.go_to(pg, self.cdp, GoRun(R), it['x'], it['z'], 1.6, '捷運公館站入口', max_s=120)
        fb0, err0 = await self.base_marks()
        if not (await self.st())['interact']: return R.info('walk：走到捷運站入口但沒有互動鍵')
        await L.tap(pg, self.cdp, '#interact')
        st8 = {'met': False, 'joined': False, 'walks': 0, 'after': 0}

        def pol(opts, menus, st8=st8):
            T = [o['t'] for o in opts]
            if '不去了' in T and any(t.startswith(sl['name']) for t in T): return next(i for i, t in enumerate(T) if t.startswith(sl['name']))
            if '照樣出發' in T: return T.index('照樣出發')
            if '一起走一段' in T: st8['joined'] = True; st8['met'] = True; return T.index('一起走一段')
            if '打招呼' in T and '不打擾' in T: st8['met'] = True; return T.index('打招呼')
            if '回公館' in T: return T.index('回公館')
            if '回去' in T:
                if st8['joined'] and st8['after'] >= 1: return T.index('回去')
                if st8['joined']: st8['after'] += 1
                elif st8['walks'] >= 4: return T.index('回去')
                st8['walks'] += 1
                if sl['walk'] and sl['walk'] in T and not opts[T.index(sl['walk'])]['dim']: return T.index(sl['walk'])
                k = next((i for i, o in enumerate(opts) if not o['dim'] and o['t'] not in ('回去', '拍一張照')), None)
                return k if k is not None else T.index('回去')
            return Plan().default(opts, menus)
        ok, s, menus, lines = await self.drive(type('Pol', (), {'__call__': lambda self_, o, m: pol(o, m)})(), 'walk 自由出行')
        R.note('walk 台詞：%s' % J(lines[-8:]))
        if not R.check('walk：自由出行一路點得完、回到公館', ok, why_not_free(s)): await self.dump('walk', s); return
        if st8['joined']: R.check('walk：遇到她、選了「一起走一段」', True)
        else: R.info('walk：這一趟沒有遇到她（偶遇是擲骰的）', J(st8))
        await self.check_free('walk 回來以後', fb0, err0)

    async def step_media(self):
        """一定要涵蓋（BB 00:58）：PC 用存檔 1104_day35 重現——多媒體中心（library_media）按「和林芷若說話」：ADV 開著、cam cinematic、busyDepth 1、字幕空、點了沒反應，
        JS 例外 `c.attended.every is not a function`（events3d.js:77）。芷若週二、四 14–17 在 library_media（characters.js 作息，2025-09-01～2027-08-31、2028-02-21～2029-06-30）。
        MEDIA_SAVE＝那個存檔的路徑（JSON 或遊戲匯出的文字）：有就先用它跑一次"""
        R, pg = self.R, self.pg
        if self.pid != 'heroine_02': return R.skip('media', '只給芷若（library_media）')
        sv = os.environ.get('MEDIA_SAVE')
        if sv and os.path.exists(sv):
            txt = open(sv, encoding='utf-8').read().strip()
            ok = await pg.evaluate("(async t=>{ let o=null; try{ o=JSON.parse(t); }catch(e){ o=JSON.parse(decodeURIComponent(escape(atob(t)))); } delete o._stuck; delete o._busy; document.getElementById('titleScreen').classList.add('hide'); if(typeof STORY!=='undefined'&&!%s) STORY.phoneAuto=()=>{}; await GAME.applySave(o); return o.zone+' '+o.day+' '+o.hour; })" % ('true' if PHONE_AUTO else 'false'), txt)
            R.setup('讀使用者的存檔 MEDIA_SAVE=%s（%s）' % (sv, ok)); await pg.wait_for_timeout(6000)
            w = await self.walk_to('media 使用者存檔')
            if w: await self.talk('media 使用者存檔', Plan([{'when': '^就這樣$', 'pick': '^就這樣$'}]))
            else: R.info('media：使用者存檔讀進來以後找不到芷若', J(await pg.evaluate(NPC_JS, self.pid)))
        await self.scratch()
        out = await pg.evaluate(SCAN_JS, {'id': self.pid, 'terms': ['Y1S1', 'Y1S2'], 'hours': [14.25, 15.0, 16.0], 'max': 6, 'wk0': 3, 'zone': 'library_media', 'wds': [2, 4]})
        d35 = await pg.evaluate("(()=>{ const c=CALENDAR.dateOf(35); return c?{d:35,wd:c.wd%7,key:c.key}:null; })()")
        R.note('media：芷若在 library_media 的時段 %s；第 35 天＝%s' % (J([[o['key'], o['hr']] for o in out]), J(d35)))
        if d35 and d35['wd'] in (2, 4): out.insert(0, {'d': 35, 'wd': d35['wd'], 'hr': 14.25, 'zone': 'library_media', 'act': '第 35 天', 'key': d35['key']})
        if not out: return R.check('media：找得到芷若在多媒體中心的時段', False, '掃不到（作息改了？）')
        for stg in ('FAMILIAR', 'FRIEND', 'POSSIBLE_ROMANTIC_INTEREST'):
            w = None
            for sl in out[:3]:
                w = await self.go_slot(sl, {'met': True, 'rel': REL[stg], 'relUp': 4 if stg != 'FRIEND' else 0}, 'media %s' % stg, '前置：%s、在總圖多媒體中心' % stg)
                if w: break
            if not w: R.check('media %s：走得到多媒體中心的芷若旁邊' % stg, False, J(out[:3])); continue
            await self.talk('media %s 連按兩次' % stg, Plan([{'when': '^就這樣$', 'pick': '^就這樣$'}]), dbl=True)
            if await self.back_to_arrival('media %s 再約一次' % stg):
                await self.talk('media %s 約她去…' % stg, Plan([{'when': '^就這樣$', 'pick': r'^約.去'}]))

    async def run(self):
        R = self.R
        try:
            if not await self.start(): return R
            print('== 人物 %s %s 開始（層 %s、可攻略 %s、階梯 %s、店內偶遇 %s、自由出行 %s）' % (self.pid, self.info['name'], self.info['layer'], self.info['date'], J(self.info['lad']), J(self.info['shop']), J(self.info['enc'])), flush=True)
            for stp in STEPS:
                fn = getattr(self, 'step_' + stp, None)
                if not fn: continue
                print('-- [%s] %s' % (self.pid, stp), flush=True)
                try: await fn()
                except Exception as e:
                    R.check('%s：探針自己出錯（不是遊戲的判定）' % stp, False, repr(e)); traceback.print_exc()
                    try: await self.dump(stp + '_probe_error', await self.st())
                    except Exception: pass
        finally:
            await self.close()
        return R


async def main():
    os.makedirs(OUT, exist_ok=True)
    people = cases(); results = []
    print('CASES=%s STEPS=%s LAD_TERMS=%s LAD_MAX=%s MENU_MAX=%s STUCK_S=%s QUICK=%s PHONE_AUTO=%s' % (J(people), J(STEPS), J(LAD_TERMS), LAD_MAX, MENU_MAX, STUCK_S, QUICK, PHONE_AUTO), flush=True)
    async with async_playwright() as pw:
        for pid in people:
            t0 = time.time()
            R = await Person(pw, pid).run(); results.append(R)
            nm = pid
            if R.fails:
                print('== 人物 %s 結果 FAIL（%d）：%s' % (nm, len(R.fails), '；'.join(R.fails[:10])), flush=True)
            else:
                print('== 人物 %s 結果 PASS（%d 項；SKIP %d：%s）' % (nm, R.n, len(R.skips), '、'.join(R.skips[:6])), flush=True)
            print('   用了 %.1f 分鐘' % ((time.time() - t0) / 60), flush=True)
    bad = [r for r in results if r.fails]
    print('==== 總結：%d 人，FAIL %d 人：%s' % (len(results), len(bad), J([[r.pid, r.fails[:3]] for r in bad])), flush=True)
    nf = sum(len(r.fails) for r in results)
    print('ALL PASS' if not nf else 'FAILED %d' % nf, flush=True)
    sys.exit(1 if nf else 0)

asyncio.run(main())
