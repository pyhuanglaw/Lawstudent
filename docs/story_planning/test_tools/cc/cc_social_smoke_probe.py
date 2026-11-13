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
  invite_study  當面約念書（invite 選的不是念書時再約一次「念書」＝X207 那一組檢查）
  phone_date  【使用者 11-04「你也要測試用手機跟其他角色約會的對話」「還有實際約會進行」】平日 09:00 校園、關係朋友（可攻略第 5 階）、有聯絡方式：
          手機 朋友 →「訊息」→ 對話串「約」→ 照遊戲的選項選分類、地點、時間（PRED_JS 用 INV.decide 先算好她會答應／改期／沒空的組合）：
            ① 今天最近的時段（她會答應的）② 念書（總圖優先）——兩場都「整場實際進行」：回覆演完 → 時間快到（手機「今天」的跳過時間；不夠才改存檔時間，[前置／捷徑]）
            →「直接過去」（快速前往）→ 到場（G.zone＝約定的地點、她在場 ≤ 4 m）→ 見面那一場一路點到底 → 回到自由；再從「出發前」的存檔：
            「自己走過去」（走到通往那一區的門）一次、見面裡每一層每一個選項各重跑一次（DATE_BRANCH_MAX）；念書在總圖另跑 X207 兩個 CASE（STUDY_VARIANTS）：
            full＝【前置／捷徑】二樓（lv1）座位全設成有人坐 → 要真的走到三樓閱覽區；reload＝帶路途中（在總圖、還沒坐下）GAME.snapshot→applySave → 要接著帶到座位
          收尾各一次：她改期（答應她給的時間）、她沒空、我說「算了」、錢不夠（G.money＝0、出去玩的時間灰掉寫「錢不夠」）；可攻略再用手機約一次校外約會整場演完（含換分支）
          每一場約會記：遊戲時間、錢、SOCIAL.rel 與記憶前後、整段對話紀錄（<人>_<tag>_transcript.json：誰說的、說了什麼；畫面上每一句的立繪框）、
          截圖（出發、到場、中段、結束）；檢查空白句（FAIL）、名字顯示 id（FAIL）、同一句連續重複（INFO）、立繪框空（INFO）；結束後玩家起身、她 AFTER_S 秒內回到自己的行程（不黏在原地）
          X207（約念書坐下，INV-SIT-TOGETHER-1104）七點：① 開演那一刻兩人都坐著、同一桌（≤1.5 m 或同一組）、離門口 ≥3 m、總圖在 lv1 或 3F ② 帶路時她離玩家 ≤3 m；
            二樓滿了改去三樓（zone＝library）③ 途中時間有往前走 ④ 結束兩人起身、道別時在大廳門口附近或已經在校園、她回自己的行程 ⑤ 吃飯、咖啡、電影、書屋的開演點在座位或櫃台
            （玩家坐著或離出生點／門口 ≥3 m）⑥ 帶路途中讀檔接著帶 ⑦ 全程不卡住；走到門口就演完＝FAIL「使用者 11-04：約念書不能在門口結束，要一起坐下」；
            台詞逐字對 AA_649（企劃線 37daf8027）：帶路句、三樓旁白與句、坐下旁白、她的坐下句、中途一則、收書、道別
          名單：ROSTER=1（預設）先開一個瀏覽器，把所有人設成認識＋有聯絡方式，照 friendsHTML 同一個判斷列出「手機能約誰」
  shop    店內偶遇「一起坐」（src/data/shop_enc.js 有 join 的列；外帶窗口 wz_tea／wz_ice 不測）：掃到她會在店裡的時段 → 讀檔到那間店 →「和○○打招呼」→「一起坐」
  walk    自由出行偶遇「一起走一段」（ENC.JOIN 有她）：掃到她會出現的景點與時段 → 公館捷運站入口 → 景點 → 散步 → 偶遇 →「一起走一段」→ 一件事 → 回公館
          （偶遇沒有出現＝INFO，不判 FAIL；卡住照判）
  X207 驗收（INV-SIT-TOGETHER-1104，LAWWW 909c729a6／v9.10.20；對照 c2232eb6c；BB 11-04 02:16）——不在預設 STEPS，要用 STEPS 點名。共同前置：平日 09:00 校園、
          關係朋友（可攻略第 5 階）、有聯絡方式 → 手機約「去總圖一起念書」（她會答應的最近時段）→ 時間快到（手機跳過時間；不夠才改存檔時間，[前置／捷徑]）→「直接過去」。
          她帶路時玩家像真人一樣跟著走（L.go_to 點地面／搖桿，追她的位置；二樓坐滿改去三樓＝走到二樓東側樓梯間的門按互動）。
    study_x207          X207 七點（同上）＋開演位置取「（你們在長桌的一角坐下。…）」那一句的時候（沒有那句＝對照組，取見面第一句）
    study_f3            二樓（lv1）座位全滿 → 要走到三樓閱覽區坐下。【前置／捷徑】進總圖大廳就把 lv1 的 zone.seats 設 taken（遊戲自己的「有人坐」欄位：
                        classes3d.js 替身坐的位子、INV.pairSeats／seatBusy 都看它）
    study_reload_lead   帶路途中讀檔：iv.lead.ph＝go（她正走向座位）那一刻 GAME.snapshot→applySave【前置／捷徑】→ 讀回來 iv.lead 還在、接著帶路、兩個人坐下
    study_phone_reload  手機約好總圖念書以後「選單 → 回標題 → 繼續」（按不到才 snapshot→applySave）→ 約還在 → 照 X207 演完
    study_r2            風險 2：演完她解凍（n.frozen＝false）、起身（作息本來就在這裡坐著讀書的＝INFO），AFTER_S 秒內回自己的作息
    study_r3            風險 3：①帶路途中、②演完 30 秒內：手機 訊息 → 約 → 算了 → 手機不能自己再打開（game3d.js 回呼問 INV.phoneBack）；
                        ③改天：【前置／捷徑】INV.offer 讓她約你（明天 15:00 總圖）→ 手機按「改天」→ 一次照常（選算了）、一次【前置／捷徑：注入例外】INV.flow 回傳 rejected
                        promise → 兩次都不能有 unhandledrejection（CON_JS 的監聽記在 window.__CCE「rejection …」）
    study_r4            風險 4：【前置／捷徑：注入例外】GAME.sitAt 在「玩家坐下」那一次（原本的 sitAt 做完、兩個人都坐著）丟例外
                        → 兩個人都起身、她解凍、D.busyDepth 回 0、沒有淡出、那一筆約 cancelled、回到可以自由移動
    study_r6            風險 6：早到（約好時間前約 1 小時用手機「今天」→「前往」）→「約好的是 …，還早。」只出現一次（掛 GAME.toast 數）
    study_abandon       作罷三種（ABANDON＝leave,timeout,close 選）：帶路途中走出總圖／帶路超過 2 小時（真的等遊戲時間，約 5 分鐘；ABANDON_FAST=1＝
                        【前置／捷徑】讀檔到帶路開始後 1h55m）／閉館（優先約 20:30～21:45 的時段真的等到 22:00；約不到才【前置／捷徑】讀檔到 21:54）
                        → 那一筆 cancelled、G.msgs 多一則「……後來作罷了。」、不卡住（check_free）。也可以 STEPS=study_abandon_leave／_timeout／_close 單獨跑
    study_r3b           風險 3（phoneAuto）：STORY.phoneAuto 照遊戲原本開著。帶路途中（iv.lead 有值）【前置／捷徑】PHONE.post 一則要回覆的訊息（ask），玩家停下來 ≥3 秒
                        → 手機不能自己打開；演完以後馬上再放一則、停 5 秒 → 也不能打開；再等到演完 33 秒以後：手機應該打開（對照：證明 phoneAuto 真的有作用，不然上面的 PASS 不算數）
    study_seatMeet      她帶路坐下以後，玩家不走近她（leadTick 的 2 m），改走到她同一張桌子對面／斜對面有「坐下讀書」的空位，從離她 ≥2.15 m 的那一側按「坐下」
                        （S.seatMeet）→ 要開演，接著照 X207 檢查（這條路徑開演的位置照遊戲 2.3 m 規則：同一張桌子 ≤2.3 m 算同一桌）；避不開 leadTick＝INFO
    study_changed       她改約：【前置／捷徑】INV.change（遊戲自己的改約函式，events3d.js inviteChange 用的）把約改到晚 1.5 小時（太晚就隔天同一時間）
                        → 手機按「好」或「那就下次」（CHANGED_ANS＝ok,next）→ 舊的時間人在總圖大廳：不開演、沒有帶路；「好」＝新的時間照 X207 演完、坐下；「那就下次」＝cancelled
    study_r4 的注入點用 R4_AT 選（預設 sitAt,libStay；也可以 STEPS=study_r4_sitAt／study_r4_libStay）：libStay＝INV.libStay 丟例外（見面內容裡出錯）
    每一項另外記：INFO 7（她在大廳一樓 lv0 找座位、大廳各層座位數）、風險 5（兩個選單互搶：掛 GAME.choose，前一個還沒選完又開一個＝記 INFO，不判）

每一段結束都跑同一套「沒卡住」檢查（15 秒內要全部成立，不然 FAIL＋截圖＋G.zone、時間、對話、按鈕、D.busyWho、console 最後 30 行）：
  #dlg、#choices 隱藏、GAME.D.active＝false、D.busyDepth＝0、player.busy＝false、ADV.active＝false、EVENTS.running 空、鏡頭 follow、沒有淡出、
  手機／選單／大地圖沒開、遊戲沒暫停；然後實際試：搖桿推得動（≥0.3 m）、點地走得動（≥0.3 m）、HUD（手機、選單、小地圖）按得到也關得掉、
  遊戲時間有在走、GAME.walkFallbacks 沒增加、沒有新的 JS 例外（pageerror、window error、unhandledrejection）。

每一次說話前把 GAME.lastTalkError 清成 null、說完再讀（de38333d1 起的 GM.guardTalk：說話丟例外會收掉那一段並記在這裡）：有值＝FAIL「說話途中丟例外」；
  卡住時摘要寫「卡住的種類」：lastTalkError 有值＝例外；沒有 guardTalk 的版本（e1603907e）看 JS 例外；兩個都沒有＝await 卡住。
CASES（逗號分隔）：人物 id（heroine_01,zhe…）或群組 rom（可攻略 8 位）、friends（朋友 19 位）、pool（法律系不熟同學 20 位）、all（全部）。預設 rom。
環境變數：STEPS（預設 media,first,greet,up,ladder,menu,invite,invite_study,reload,date,phone,phone_date,shop,walk）、STUDY_ONLY（1＝invite／phone_date 只跑念書）、STUDY_VARIANTS、DATE_BRANCH_MAX、AFTER_S、ROSTER、LAD_TERMS（預設 Y1S1；舊序章系所的人自動 Y0S1；all＝她有資料的每一學期）、
  LAD_MAX（每學期最多測幾層，0＝全部）、LAD_CHOICES（1＝每個選項都點，0＝只點第一個）、MENU_MAX（預設 10）、WALK_S（走到他旁邊最多幾秒，預設 240）、
  STUCK_S（沒進展幾秒算卡住，預設 15）、DATE_WAIT_H（預設 0.4）、PLAY_S（一段最多幾秒，預設 900）、PHONE_AUTO（1＝不關自動打開手機）、QUICK（1＝沒卡住檢查只看狀態，不推搖桿、不點地、不按 HUD）。
每個人跑完印「== 人物 名字 結果 PASS／FAIL（n）」，FAIL 先印摘要；最後 ALL PASS 或 FAILED n；exit 0／1。
用法：LW_TESTS=<wt>/tests [CASES=heroine_01,zhe] python3 cc_social_smoke_probe.py <url>/index.html <out>"""
import os, sys, json, asyncio, time, math, re, traceback
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
import cc_phone   # 快速前往分地區（12cb1426c 起）：先點地區
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
ROM = ['heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05', 'classmate_peishan', 'kexin', 'classmate_xinci']
FRIENDS = ['zhe', 'yu', 'classmate_bohan', 'classmate_mingxuan', 'classmate_youchen', 'kai', 'econ_zhengxun', 'econ_pinyu', 'econ_weilun', 'econ_tangrui', 'econ_jiahao',
           'jp_caizhen', 'jp_liheng', 'jp_yuheng', 'npc_fangyt', 'npc_huangxh', 'npc_ta_chen']
POOLS = ['pool_%d' % i for i in range(1, 21)]
ALL_STEPS = ['media', 'first', 'greet', 'up', 'ladder', 'menu', 'invite', 'invite_study', 'reload', 'date', 'phone', 'phone_date', 'shop', 'walk']


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
DATE_BRANCH_MAX = int(os.environ.get('DATE_BRANCH_MAX') or MENU_MAX)   # 一場約會換選項重跑最多幾次
STUDY_ONLY = (os.environ.get('STUDY_ONLY') or '0') == '1'
IVLOG = (os.environ.get('IVLOG') or '0') == '1'
MONEYSHOT = (os.environ.get('MONEYSHOT') or '0') == '1'
IVHOOK_JS = r"""(id=>{ const W=window.__IVH=window.__IVH||{log:[]}; const G=()=>GAME.G; const T=()=>({h:+(+G().hour).toFixed(3),d:G().day,z:G().zone});
  const iv=()=>(G().invites||[]).filter(v=>v.who===id).slice(-1)[0]||{}; const push=(k,x)=>{ W.log.push(Object.assign({k,ms:Math.round(performance.now())},T(),x||{})); if(W.log.length>4000) W.log.splice(0,1000); };
  push('load',{state:iv().state,goAsked:iv().goAsked||null,ivh:iv().h});
  if(!W.hooked&&typeof INV!=='undefined'){ W.hooked=1;
    const gp=INV.goPrompt; INV.goPrompt=async function(GM){ const g=GM&&GM.G, P=GM&&GM.E&&GM.E.player; const due=INV.goDue?INV.goDue(g):null;
      const why=!due?'goDue null':(P&&P.busy?'busy':((typeof OUT!=='undefined'&&OUT.due&&OUT.due(g))?'OUT.due':'')); const r=await gp.apply(this,arguments); if(due||W.log.filter(x=>x.k==='goPrompt').length<3||r) push('goPrompt',{r,why,due:due?due.id:null,goAsked:iv().goAsked||null}); return r; };
    const run=EVENTS.run; EVENTS.run=async function(ev){ push('ev.start',{id:ev&&ev.id}); try{ return await run.apply(this,arguments); } finally { push('ev.end',{id:ev&&ev.id}); } };
    let last=iv().state; setInterval(()=>{ const s=iv().state; if(s!==last){ push('state',{from:last,to:s,goAsked:iv().goAsked||null}); last=s; } },250); }
  return {hooked:!!W.hooked, iv:{state:iv().state,h:iv().h,goAsked:iv().goAsked||null}}; })"""   # CC-B 11-10（BB-B 00:54）：錢不夠那一條，每一層有灰的選項：存全文（innerText、title、aria）、截圖、點一下灰的看會不會跳原因   # CC-B 11-09：存檔那一刻、讀檔以後每秒記 iv（含 goAsked）、選單、事件（BB-B 23:44）
STUDY_SHIFT = float(os.environ.get('STUDY_SHIFT') or 0.45)   # 存檔點離約定幾小時（對照組用 2）
IVRAW_JS = r"""(id=>{ const G=GAME.G, $=x=>document.getElementById(x); const ch=[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,24)); const dv=$('dlg'); return {day:G.day, hour:+(+G.hour).toFixed(3), zone:G.zone, px:+GAME.E.player.obj.position.x.toFixed(1), pz:+GAME.E.player.obj.position.z.toFixed(1), iv:(G.invites||[]).filter(v=>v.who===id).map(v=>Object.assign({},v)), out:(typeof OUT!=='undefined'&&G.outings)?(G.outings||[]).slice(-2):null, choices:ch, dlg:dv&&getComputedStyle(dv).display!=='none'?(dv.textContent||'').trim().slice(0,40):'', phone:!!($('phone')&&!$('phone').classList.contains('hide')), evr:(typeof EVENTS!=='undefined'&&EVENTS.running)||null, cur:(typeof EVENTS!=='undefined'&&(EVENTS.current||EVENTS.cur))||null}; })"""             # 1＝invite／phone_date 只跑「念書」那幾場（STUDY_ctl／STUDY_fix）
ROSTER = (os.environ.get('ROSTER') or '1') == '1'                     # phone_date：先列「手機能約誰」的名單
AFTER_S = int(os.environ.get('AFTER_S') or 150)                       # 約會結束後等幾秒看她回到自己的行程
SLOT_OVERRIDE = (os.environ.get('SLOT_OVERRIDE') or '').strip()   # 'zone,hour,YYYY-MM-DD'：greet／up／menu／invite／reload 讀檔到這個時段（不掃）
STUDY_MSG = '使用者 11-04：約念書不能在門口結束，要一起坐下'
STUDY_VARIANTS = env_list('STUDY_VARIANTS', 'full,reload')   # X207 ②「二樓滿了改去三樓」、⑥「帶路途中讀檔」（reload＝iv.lead 有值的時候存讀檔）
ABANDON = env_list('ABANDON', 'leave,timeout,close')           # study_abandon：作罷三種
ABANDON_FAST = (os.environ.get('ABANDON_FAST') or '0') == '1'    # 1＝帶路超過 2 小時用【前置／捷徑】讀檔到 1h55m
ABANDON_WAIT_S = int(os.environ.get('ABANDON_WAIT_S') or 600)     # 作罷最多等幾秒（2 小時遊戲時間＝300 秒）
STUDY_WAIT_S = int(os.environ.get('STUDY_WAIT_S') or 420)         # 約念書每一段最多等幾秒（帶路、上樓）
R4_AT = env_list('R4_AT', 'sitAt,libStay')                       # study_r4 的注入點
CHANGED_ANS = env_list('CHANGED_ANS', 'ok,next')                   # study_changed：回改約的方式
STUDY_STEPS = ['study_r3b', 'study_seatMeet', 'study_changed', 'study_x207', 'study_f3', 'study_reload_lead', 'study_phone_reload', 'study_r2', 'study_r3', 'study_r4', 'study_r6', 'study_abandon']
# AA_649（企劃線 37daf8027）照抄：約念書在總圖的台詞（逐字比對；比對時去掉「」和空白）
AA649 = {
    'guide': '（小聲）二樓靠窗那排比較安靜。',
    'full_narr': '（二樓的長桌都坐滿了。）', 'full': '（小聲）去三樓好了。三樓沒有人講話。',
    'sit_narr': '（你們在長桌的一角坐下。她把書攤開，把手機翻過來蓋在桌上。）',
    'sit_gen': ['（小聲）我讀到六點。你呢？', '（小聲）手機先收起來。'],
    'mid': ['（她把一張便利貼推過來：「這一題你會嗎？」你在下面寫了答案推回去。她看了一眼，比了一個讚。）', '（小聲）……休息五分鐘。', '（小聲）你的筆借我。我的沒水了。', '（她讀到一半，把一顆喉糖放在你的書旁邊。）'],
    'pack': ['（閉館前十分鐘的廣播響了。）', '（她闔上書，伸了一個懶腰。）'], 'pack_say': '（小聲）走吧。',
    'bye_gen': ['今天讀得比我想的多。……下次再約。', '好累。……可是很好。'],
    'own': {'heroine_01': ('（小聲）我讀行政法，你讀你的。……不懂再問我。', '下次換你決定讀哪一科。'),
            'heroine_02': ('（小聲）我帶了兩支螢光筆，一支給你。', '……今天很安靜。我很喜歡。'),
            'heroine_03': ('（小聲）我讀民總。你讀什麼？', '謝謝你陪我讀。……下次我請你喝茶。'),
            'heroine_04': ('（小聲）圖書館的冷氣好冷。……你外套借我。', '我寫了一整頁的程式。你讀了幾頁？'),
            'heroine_05': ('（小聲）我寫我的報告，你有問題可以問我。', '讀得不錯。……下次我考你。'),
            'classmate_peishan': ('（小聲）我第一次在這裡讀書耶。', '下次我帶零食。……啊，圖書館不能吃。'),
            'kexin': ('（小聲）你們的總圖好大。', '我要趕車回外校了。……今天謝謝你。')}}
FULL_HOOK_JS = r"""(on=>{ clearInterval(window.__CCFULL); if(!on) return 0; window.__CCFULL=setInterval(()=>{ try{ const G=GAME.G, E=GAME.E; if(G.zone!=='library_hall'||!E.zone||!E.zone.seats) return; const P=E.player;
    for(const q of E.zone.seats){ if((q.lv|0)!==1) continue; if(P.seat===q) continue; if(!q.__cc){ q.__cc=1; q.taken=true; } } }catch(e){} },300); return 1; })"""
LEAD_JS = r"""(a=>{ const G=GAME.G, E=GAME.E, P=E.player, pp=P.obj.position; const L=(G.invites||[]).filter(v=>v.who===a.id); const iv=(a.iv&&L.find(v=>v.id===a.iv))||L[L.length-1]||null;
  let n=null; try{ n=(typeof INV!=='undefined'&&INV.npcOf)?INV.npcOf(GAME,a.id):null; }catch(e){} if(!n) n=(E.npcs||[]).find(q=>q&&q.charId===a.id&&q.obj)||null;
  const sk=s=>s?{x:+(+s.x).toFixed(2),z:+(+s.z).toFixed(2),lv:s.lv|0}:null; const ld=iv&&iv.lead;
  return {feat:typeof INV!=='undefined'&&typeof INV.leadTick==='function', zone:G.zone, hour:+(+G.hour).toFixed(4), day:G.day, plv:P.lv|0, px:+pp.x.toFixed(2), pz:+pp.z.toFixed(2), pseat:sk(P.seat),
    iv:iv?{id:iv.id,state:iv.state,place:iv.place,zone:iv.zone,day:iv.day,h:iv.h,early:!!iv.early,err:!!iv.err,opened:!!iv.opened,alt:!!iv.alt,noLead:!!iv.noLead,
      lead:ld?{ph:ld.ph||null,z:ld.z||null,her:sk(ld.her),me:sk(ld.me),look:sk(ld.look)}:null}:null,
    n:n&&n.obj?{x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2),lv:n.lv|0,seat:sk(n.seat),frozen:!!n.frozen,beh:n.beh||null,ivLead:n._ivLead||null,pose:n.pose||null}:null,
    nmsg:(G.msgs||[]).length}; })"""
NPCST_JS = r"""(id=>{ const G=GAME.G, E=GAME.E, P=E.player; let n=null; try{ n=(typeof INV!=='undefined'&&INV.npcOf)?INV.npcOf(GAME,id):null; }catch(e){} if(!n) n=(E.npcs||[]).find(q=>q&&q.charId===id&&q.obj)||null;
  let w=null; try{ w=STORY.whereIs(GAME,id); }catch(e){} const f=document.getElementById('fade');
  return {zone:G.zone, pseat:!!P.seat, depth:(GAME.D&&GAME.D.busyDepth)|0, npc:!!(n&&n.obj), nseat:!!(n&&n.seat), frozen:!!(n&&n.frozen), beh:n?n.beh||null:null, pose:n?n.pose||null:null, ivLead:n?n._ivLead||null:null,
    where:w?{zone:w.zone||null,act:w.act||'',away:w.away||null}:null, keep:!!(n&&n.seat&&w&&w.zone===G.zone&&['read','eat','sit','class'].includes(w.act)), fade:!!(f&&f.classList.contains('on'))}; })"""
EXIT_JS = "(z=>{ const it=(GAME.E.interactables||[]).find(i=>i.exit&&i.exit.to===z); return it?{x:+it.x.toFixed(2),z:+it.z.toFixed(2),lv:it.lv|0,label:it.label||''}:null; })"
MSGS_JS = "(a=>(GAME.G.msgs||[]).slice(a.n).filter(m=>m.who===a.id).map(m=>({day:m.day,h:m.h,text:m.text,iv:m.iv||null})))"
LIBSEATS_JS = "(()=>{ const s=(GAME.E.zone&&GAME.E.zone.seats)||[]; const o={}; for(const q of s){ if(q.label) continue; const k='lv'+(q.lv|0); o[k]=(o[k]||0)+1; } return o; })()"
MARK_JS = "(()=>({t:(window.__CCT||[]).length, x:(window.__CCX||[]).length, r:(window.__CCE||[]).filter(e=>String(e).startsWith('rejection')).length}))()"
# 掛 GAME.toast（數「還早」）和 GAME.choose（風險 5：前一個選單還沒選完又開一個）；只記錄，原本的函式照呼叫、回傳同一個 promise
HOOK2_JS = r"""(()=>{ if(window.__CCT) return true; const T=window.__CCT=[], C=window.__CCX=[];
  const t0=GAME.toast; if(typeof t0==='function') GAME.toast=function(t,ms){ try{ T.push({t:String(t),h:+(+GAME.G.hour).toFixed(3),ms:Date.now()}); if(T.length>800) T.splice(0,200); }catch(e){} return t0.apply(this,arguments); };
  const cp0=GAME.caption; if(typeof cp0==='function') GAME.caption=function(a,b){ try{ T.push({t:String(b!=null&&b!==''?b:a),k:'cap',h:+(+GAME.G.hour).toFixed(3),ms:Date.now()}); if(T.length>800) T.splice(0,200); }catch(e){} return cp0.apply(this,arguments); };
  window.__CCSM=[]; if(typeof INV!=='undefined'&&typeof INV.seatMeet==='function'){ const sm0=INV.seatMeet; INV.seatMeet=function(){ const p=sm0.apply(this,arguments); const W=window.__CCSM; W.push({call:1,ms:Date.now()}); Promise.resolve(p).then(v=>W.push({ok:!!v,ms:Date.now()}),e=>W.push({err:String(e)})); return p; }; }
  const c0=GAME.choose; let pend=0, cur=null; if(typeof c0==='function') GAME.choose=function(opts){ let o=[]; try{ o=(opts||[]).map(x=>String(x&&x.t!=null?x.t:x)).slice(0,6); }catch(e){}
    try{ if(pend>0) C.push({prev:cur,next:o,h:+(+GAME.G.hour).toFixed(3),zone:GAME.G.zone,ms:Date.now()}); }catch(e){} pend++; cur=o; let p;
    try{ p=c0.apply(this,arguments); }catch(e){ pend=Math.max(0,pend-1); throw e; }
    Promise.resolve(p).finally(()=>{ pend=Math.max(0,pend-1); }).catch(()=>{}); return p; };
  return true; })()"""
# 風險 4：玩家在見面那一刻坐下（原本的 sitAt 做完、兩個人都坐著）丟一次例外，之後換回原本的
INJ_SIT_JS = r"""(on=>{ const G0=window.__CCSIT0||(window.__CCSIT0=GAME.sitAt); if(!on){ GAME.sitAt=G0; return 0; } window.__CCINJ=0;
  GAME.sitAt=function(e,st){ const r=G0.apply(this,arguments); if(e===GAME.E.player&&!window.__CCINJ){ window.__CCINJ=1; GAME.sitAt=G0; throw new Error('CC 注入：見面時 GAME.sitAt（玩家坐下）丟例外'); } return r; }; return 1; })"""
# 風險 3：改天以後的 INV.flow 回傳 rejected promise 一次（之後換回原本的）
INJ_FLOW_JS = r"""(()=>{ const f0=INV.flow; window.__CCFLOW=0; INV.flow=function(){ INV.flow=f0; window.__CCFLOW=1; return Promise.reject(new Error('CC 注入：改天以後 INV.flow 失敗')); }; return 1; })()"""
OFFER_JS = r"""(id=>{ const G=GAME.G; let iv=null; try{ iv=INV.offer(G,id,'library',G.day+1,15,null); }catch(e){ return {err:String(e)}; } return iv?{id:iv.id,state:iv.state,day:iv.day,h:iv.h}:null; })"""
POSTASK_JS = r"""(a=>{ const m=PHONE.post(GAME.G,{th:'p:'+a.id,from:a.id,text:a.text,ask:{opts:[{t:'好'},{t:'等一下再說'}]}}); if(GAME.phoneBadge) GAME.phoneBadge();
  return m?{ask:m.ask&&m.ask.id,pending:PHONE.pending(GAME.G).length}:null; })"""
SEATPICK_JS = r"""(a=>{ const E=GAME.E, h=a.her, P=E.player; const occ=st=>!!st.taken||(E.npcs||[]).some(n=>n.seat&&Math.hypot(n.seat.x-st.x,n.seat.z-st.z)<0.35);
  const out=[]; for(const it of (E.interactables||[])){ const st=it.seat; if(!st||it.hidden) continue; if((st.lv|0)!==(h.lv|0)) continue; const d=Math.hypot(st.x-h.x,st.z-h.z); if(d<0.3||d>2.25||occ(st)) continue;
    const ux=(st.x-h.x)/d, uz=(st.z-h.z)/d; const same=(P.lv|0)===(st.lv|0);
    for(const r of [0.8,0.7,0.6]){ const px=st.x+ux*r, pz=st.z+uz*r; if(Math.hypot(px-h.x,pz-h.z)<2.15) continue; if(Math.hypot(px-it.x,pz-it.z)>(it.radius||1.8)-0.05) continue; if(same&&E.canStand&&!E.canStand(px,pz,0.3)) continue;
      out.push({sx:+st.x.toFixed(2),sz:+st.z.toFixed(2),px:+px.toFixed(2),pz:+pz.toFixed(2),wx:+(st.x+ux*1.2).toFixed(2),wz:+(st.z+uz*1.2).toFixed(2),lv:st.lv|0,d:+d.toFixed(2),label:it.label||''}); break; } }
  out.sort((p,q)=>p.d-q.d); return out; })"""
CHANGE_JS = r"""(a=>{ const G=GAME.G, iv=(G.invites||[]).find(v=>v.id===a.iv); if(!iv) return {err:'沒有那一筆'}; let to={day:iv.day,h:+(iv.h+1.5).toFixed(3)}; if(to.h>20.5) to={day:iv.day+1,h:iv.h};
  const r=INV.change(G,iv.id,to,null); return r?{id:r.id,state:r.state,to:r.to,prev:r.prev}:{err:'INV.change 回 null'}; })"""
INJ_LIBSTAY_JS = r"""(()=>{ const f0=INV.libStay; window.__CCINJ=0; if(typeof f0!=='function') return 0; INV.libStay=async function(){ INV.libStay=f0; window.__CCINJ=1; throw new Error('CC 注入：見面內容裡 INV.libStay 丟例外'); }; return 1; })()"""
CANCEL_RX = r'^(算了|返回|先不要|不約了|今天不去了)'
NZ = lambda t: re.sub(r'[「」\s]', '', t or '')
ID_RX = r'^(heroine_0\d|classmate_\w+|pool_\d+|econ_\w+|npc_\w+|jp_\w+|kexin|zhe|yu|kai|prof_\w+)$'

BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}   # 同 cc_an_smoke_probe.py（法律系開學以後、開場演完）
ECON0 = {'ECON_CAMP_OPEN': True, 'E15_BUS': 'nosleep', 'E15_WENT': True, 'ECON_CAMP_DONE': True, 'E01_DONE': True, 'E01_MORNING': True, 'KX_FIRST_MSG': True,
         'fundsV2': 1, 'Y0_STICKY': True, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}   # 同 cc_pe_aa644_probe.py（舊序章系所那一年）
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
  if(!a.phoneAuto&&typeof STORY!=='undefined'){ if(!window.__PA0) window.__PA0=STORY.phoneAuto; STORY.phoneAuto=()=>{}; } else if(a.phoneAuto&&typeof STORY!=='undefined'&&window.__PA0){ STORY.phoneAuto=window.__PA0; }
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
      for(let d=T.from; d<=T.to && out.length<a.max; d++){ if(a.days&&!a.days.includes(d)) continue; const t=CALENDAR.termOf(d); if(!t||t.id!==tm||(!a.days&&(t.week|0)<(a.wk0||3))) continue;
        for(const hr of a.hours){ const w=where(d,hr); if(!w) continue; if(w.zone==='classroom'||/上課|上班/.test(w.act||'')) continue; if(a.zone&&w.zone!==a.zone) continue; if(a.noZones&&a.noZones.includes(w.zone)) continue; if(a.wds&&!a.wds.includes(CALENDAR.dateOf(d).wd%7)) continue; const w2=where(d,hr+0.5); if(!w2||w2.zone!==w.zone) continue;
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
TG_JS = r"""(()=>{ const E=GAME.E, P=E.player.obj.position, out=[]; for(const r of [2.5,3.5,1.8]) for(let k=0;k<12;k++){ const a=k*Math.PI/6, x=P.x+Math.sin(a)*r, z=P.z+Math.cos(a)*r; if((!E.canStand||E.canStand(x,z,0.3))&&(!E.nav||!E.nav.path||E.nav.path(P.x,P.z,x,z))) out.push([+x.toFixed(2),+z.toFixed(2)]); } return out; })()"""   # CC-C 11-05：只挑找得到路的點（pool_17 那一次點到研究小間牆外、站得住但走不到的格子；BB-C 02:06 A／B：main 和 d3828 一樣＝TEST_BUG）
TRIPS_JS = "(id=>(GAME.G.trips||[]).filter(t=>t.who===id).map(t=>({trip:t.trip,day:t.day,depart:t.depart,back:t.back,status:t.status,locs:t.locs,kind:t.kind||null})))"
INVS_JS = "(id=>(GAME.G.invites||[]).filter(v=>v.who===id).map(v=>({id:v.id,state:v.state,place:v.place,zone:v.zone,day:v.day,h:v.h})))"
SAY_HOOK = r"""(()=>{ if(window.__CCS) return true; const W=window.__CCS=[]; const s0=GAME.say; if(typeof s0!=='function') return false;
  GAME.say=function(w,t){ try{ W.push({n:(w&&w.name)||(typeof w==='string'?w:''),c:(w&&w.charId)||null,t:String(t==null?'':t),h:+(+GAME.G.hour).toFixed(3),d:GAME.G.day,z:GAME.G.zone,adv:!!(typeof ADV!=='undefined'&&ADV.active)}); if(W.length>4000) W.splice(0,1000); }catch(e){} return s0.apply(this,arguments); };
  return true; })()"""
SLOTS_JS = "[...document.querySelectorAll('#adv .advSlot')].map(e=>({id:e.id, show:e.classList.contains('show'), img:!!((e.querySelector('img')||{}).src)}))"
REC_JS = r"""(id=>{ const G=GAME.G, r=SOCIAL.rel(id); let mem=[]; try{ mem=(SOCIAL.memories?SOCIAL.memories(id):[]).map(m=>m.tag); }catch(e){}
  return {day:G.day, hour:+(+G.hour).toFixed(4), t:+(G.day*24+(+G.hour)).toFixed(4), money:G.money|0, rel:{fam:r.fam|0,trust:r.trust|0,comf:r.comf|0,aff:r.aff|0,rom:r.rom|0,npcRom:r.npcRom|0}, nmem:mem.length, mem:mem.slice(-6), zone:G.zone}; })"""
SEAT_JS = r"""(id=>{ const E=GAME.E, P=E.player, G=GAME.G, AL={heroine_01:'an',heroine_05:'sis',zhe:'zhe',yu:'yu',kai:'kai'};
  let n=(E.npcs||[]).find(q=>q&&q.charId===id&&q.obj)||(GAME.npc&&GAME.npc[id])||(GAME.npc&&AL[id]&&GAME.npc[AL[id]])||(typeof EVENTS!=='undefined'&&EVENTS.npcOf?EVENTS.npcOf(id):null)||null;
  const ps=P.seat||null, ns=n&&n.seat||null, pp=P.obj.position; const grp=q=>q?(q.group!=null?q.group:(q.table!=null?q.table:null)):null;
  const doors=(E.interactables||[]).filter(i=>i.exit||i.enter).map(i=>+Math.hypot(i.x-pp.x,i.z-pp.z).toFixed(2)); const sp=E.zone&&E.zone.spawn;
  return {zone:G.zone, lv:P.lv|0, pseat:!!ps, nseat:!!ns, seatD:ps&&ns?+Math.hypot(ps.x-ns.x,ps.z-ns.z).toFixed(2):null, sameGroup:!!(ps&&ns&&grp(ps)!=null&&grp(ps)===grp(ns)),
    doorD:doors.length?Math.min(...doors):null, spawnD:sp&&sp.x!=null?+Math.hypot(sp.x-pp.x,sp.z-pp.z).toFixed(2):null, npc:!!(n&&n.obj), nD:n&&n.obj?+Math.hypot(n.obj.position.x-pp.x,n.obj.position.z-pp.z).toFixed(2):null,
    nbeh:n?n.beh||null:null, nleaving:!!(n&&n.leaving), nx:n&&n.obj?+n.obj.position.x.toFixed(2):null, nz:n&&n.obj?+n.obj.position.z.toFixed(2):null, p:[+pp.x.toFixed(2),+pp.z.toFixed(2)],
    ptable:ps?(ps.table!=null?ps.table:null):null, ntable:ns?(ns.table!=null?ns.table:null):null,
    others:ps?(E.npcs||[]).filter(q=>q&&q!==n&&q.seat&&((grp(ps)!=null&&grp(q.seat)===grp(ps))||Math.hypot(q.seat.x-ps.x,q.seat.z-ps.z)<1.2)).map(q=>q.id||q.charId||q.name||'?'):[],
    othersInfo:ps?(E.npcs||[]).filter(q=>q&&q!==n&&q.seat&&((grp(ps)!=null&&grp(q.seat)===grp(ps))||Math.hypot(q.seat.x-ps.x,q.seat.z-ps.z)<1.2)).map(q=>{ const p_=q.obj?q.obj.position:null; let key=null; if(q.obj) q.obj.traverse(o=>{ if(!key&&o.userData&&o.userData.driver) key=o.userData.key||o.userData.model||null; });
      return {id:q.id||null, charId:q.charId||null, crowdKey:q.crowdKey||null, crowdRole:q.crowdRole||null, model:key, isExtra:!!q.isExtra, beh:q.beh||null, pose:q.pose||null, seat:[+q.seat.x.toFixed(2),+q.seat.z.toFixed(2),q.seat.table!=null?q.seat.table:null], pos:p_?[+p_.x.toFixed(2),+p_.z.toFixed(2)]:null, sameAsHer:!!(n&&q===n)}; }):[]}; })"""
WHERE_JS = "(id=>{ let w=null; try{ w=STORY.whereIs(GAME,id); }catch(e){} return w?{zone:w.zone||null,away:w.away||null,act:w.act||''}:null; })"
PRED_JS = r"""(id=>{ const G=GAME.G, D=typeof INVITE_DATA!=='undefined'?INVITE_DATA:{places:[]}, out=[];
  for(const P of (D.places||[])){ if(INV.placeWhy(G,id,P)) continue; if(P.show&&!P.show(G,id)) continue; if(INV.neverAt&&INV.neverAt(id,P)) continue; if(P.when) continue;
    const cats=INV.catsOf(P), C=(INV.CATS||[]).find(x=>x.id===cats[0]);
    let T=[]; try{ T=INV.timeOptions(G,false,P); }catch(e){}
    for(const q of T){ if(q.now) continue; let r=null; try{ r=INV.personal(G,id,P,q.day,q.h,INV.decide(G,id,P.id,q.day,q.h)); }catch(e){ r={res:'err',why:String(e)}; }
      out.push({pid:P.id, zone:P.zone, name:P.name, verb:P.verb, cat:C?C.t:null, study:cats.includes('study'), t:q.t, day:q.day, h:q.h, res:r&&r.res, why:(r&&r.why)||null}); } }
  return out; })"""
ROSTER_JS = r"""(()=>{ const G=GAME.G, out=[]; for(const id of Object.keys(CHARACTERS||{})){ if(/^prof_/.test(id)) continue; let why='', can=false;
    try{ why=INV.whyNot?INV.whyNot(G,id):''; can=!why&&INV.hasContact(G,id)&&INV.canInvite(G,id); }catch(e){ why='err '+e; }
    out.push({id, name:(CHARACTERS[id]||{}).name, can, why, date:typeof DATE!=='undefined'&&DATE.HEROINES.includes(id)}); } return out; })()"""
SETALL_JS = r"""(ids=>{ const G=GAME.G; G.contacts=G.contacts||{}; for(const id of ids){ try{ if(id==='heroine_03') G.flags.YT_MET_JOB=true; SOCIAL.meet(id,G.zone); G.flags['met_'+id]=true; const R=SOCIAL.rel(id); const D=typeof DATE!=='undefined'&&DATE.HEROINES.includes(id);
    Object.assign(R,D?{fam:50,trust:35,comf:28,rom:35,npcRom:35}:{fam:45,trust:30,comf:25}); G.contacts[id]=G.day-30; }catch(e){} } (G.social||{}).fm120=true; return ids.length; })"""
SAMEZONE_JS = r"""(id=>{ const G=GAME.G, D=typeof INVITE_DATA!=='undefined'?INVITE_DATA:{places:[]}; const cat=P=>{ const c=INV.catsOf(P)[0]; const C=(INV.CATS||[]).find(x=>x.id===c); return C?C.t:null; };
  const L=(D.places||[]).filter(P=>!INV.placeWhy(G,id,P)&&!(P.show&&!P.show(G,id))&&!(INV.neverAt&&INV.neverAt(id,P)));
  const same=L.find(P=>P.zone===G.zone||(P.zone==='library_hall'&&G.zone==='library'))||null; const cafe=L.find(P=>P.zone==='cafe')||L[0]||null; const P=same||cafe;
  const st=L.find(P=>INV.catsOf(P).includes('study')&&(P.zone===G.zone||(P.zone==='library_hall'&&G.zone==='library')))||L.find(P=>INV.catsOf(P).includes('study')&&/^library/.test(P.zone||''))||L.find(P=>INV.catsOf(P).includes('study'))||null;
  const pk=P=>P?{id:P.id, zone:P.zone, name:P.name, verb:P.verb, cat:cat(P), same:P.zone===G.zone||(P.zone==='library_hall'&&G.zone==='library'), study:INV.catsOf(P).includes('study')}:null;
  return P?Object.assign(pk(P),{studyPlace:pk(st)}):null; })"""


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
        sig = tuple(T); prev = [m for m in menus if tuple(m['opts']) == sig]; seen = len(prev)
        if seen >= 7: return len(opts) - 1   # 同一個選單出現第 8 次：選最後一個（算了／返回／就這樣），不在灰掉的項目上打轉
        for i, t in enumerate(T):
            if t in END_TXT: return i
        tried = {m['pick'] for m in prev}   # CC-B 11-07（SOC_xinci_date_r3）：「換一天」回來的日期選單不要再選同一天（今天的時段全灰 → 換一天 → 又選今天，繞三圈）
        for i, o in enumerate(opts):
            if not o['dim'] and o['t'] not in CANCEL_TXT and i not in tried: return i
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


class SeqPlan(Plan):
    """照順序算第幾個選單：forced＝{第幾個: 選第幾個}（換分支重跑用：前面照第一次的選法、第 mi 個換成別的）；其他照 items／預設"""
    def __init__(self, forced=None, items=None, name=''):
        Plan.__init__(self, items, name); self.forced = dict(forced or {}); self.k = 0

    def __call__(self, opts, menus):
        i = self.k; self.k += 1
        sig = '|'.join((o if isinstance(o, str) else (o.get('t') or '')) for o in opts)
        fs = getattr(self, 'forced_sig', None)
        if fs is not None:   # CC 12:5x：照選單文字對（校園隨機偶遇「迎面走來一個人」會把選單往後推一格，照第幾個會選錯）
            if sig in fs and fs[sig] < len(opts): return fs[sig]
            return Plan.__call__(self, opts, menus)
        if i in self.forced and self.forced[i] < len(opts): return self.forced[i]
        return Plan.__call__(self, opts, menus)


def branch_list(menus, skip_rx):
    """第一次跑的選單 → 要重跑的 (mi, oi)：每一層每一個沒選過、沒灰掉的選項各一次"""
    out = []
    for mi, m in enumerate(menus):
        if any(re.search(skip_rx, t) for t in m['opts']): continue
        for oi, t in enumerate(m['opts']):
            if oi == m['pick'] or (m.get('dim') and m['dim'][oi]): continue
            out.append((mi, oi, t))
    return out


# ---------------------------------------------------------------- 一個人的測試
class Person:
    def __init__(self, pw, pid):
        self.pw = pw; self.pid = pid; self.R = Res(pid); self.pg = None; self.cdp = None; self.errs = []; self.info = None
        self.base_slot = None; self.arrive_snap = None; self.tagn = 0; self.tx = None; self.seat_pending = False; self.seat_sample = None; self.mid_tag = None; self.guide_on = None; self.guide = []; self.study_on = False; self.last_seat = None; self.mid_reload = False; self.mid_reloaded = False
        self.lead_iv = None; self.first_sample = None; self.sprep = {}; self.mk = {'t': 0, 'x': 0, 'r': 0}; self.close_short = False; self.pa_force = False; self.sinv = {}; self.study_reset()

    async def start(self):
        b, ctx, pg, cdp, errs = await L.launch(self.pw, landscape=True)
        self.b, self.pg, self.cdp, self.errs = b, pg, cdp, errs
        await pg.add_init_script(CON_JS)
        await pg.goto(URL)
        ok = await L.wait_loaded(pg)
        self.R.check('遊戲載入', ok)
        await pg.evaluate("localStorage.clear()")
        self.info = await pg.evaluate(INFO_JS, self.pid)
        await pg.evaluate(SAY_HOOK)
        await pg.evaluate(HOOK2_JS)
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
        pa = PHONE_AUTO or self.pa_force
        if not pa and not quiet: self.R.setup('關掉「要回覆的訊息自動打開手機」（STORY.phoneAuto；PHONE_AUTO=1 可以打開）')
        await self.pg.evaluate(LOAD_JS, {'st': st, 'snap': snap, 'quiet': quiet, 'phoneAuto': pa, 'fixWd': snap is None})
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
                self.phone_log.append({'zone': s['zone'], 'hour': s['hour'], 'where': 'drive', 't': time.time()})
                self.R.info('%s：手機自己打開（遊戲暫停），按「收起來」' % tag); await L.tap(pg, self.cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800); continue
            if s['menu'] or s['bigmap']:
                await L.close_panels(pg, self.cdp); continue
            if s['ch']:
                if MONEYSHOT and 'MONEY' in tag.upper().replace('錢不夠', 'MONEY') and any(o['dim'] for o in s['ch']) and not getattr(self, '_mshot', {}).get(tuple(o['t'] for o in s['ch'])):
                    self._mshot = getattr(self, '_mshot', {}); self._mshot[tuple(o['t'] for o in s['ch'])] = 1; nshot = len(self._mshot)
                    full = await pg.evaluate("(()=>[...document.querySelectorAll('#choices button')].map(b=>({text:b.innerText.replace(/\\s+/g,' ').trim(),title:b.title||null,aria:b.getAttribute('aria-label')||b.getAttribute('aria-disabled'),dim:b.classList.contains('dim')||b.disabled})))()")
                    await pg.screenshot(path=os.path.join(OUT, 'money_layer_%d.png' % nshot))
                    t0n = await pg.evaluate("(document.getElementById('toast')||{}).innerText||''")
                    kd = next(j for j, o in enumerate(s['ch']) if o['dim']); await self.tap_choice(kd); await pg.wait_for_timeout(1300)
                    t1n = await pg.evaluate("(document.getElementById('toast')||{}).innerText||''"); s2 = await self.st()
                    await pg.screenshot(path=os.path.join(OUT, 'money_layer_%d_tapdim.png' % nshot))
                    await pg.evaluate("(a=>{ window.__CCMONEY=(window.__CCMONEY||[]).concat(a); })", [x['text'] for x in full])
                    self.R.note('MONEYSHOT 第 %d 層（有灰的）：%s；點第一個灰的「%s」→ toast 前「%s」後「%s」、選單還在 %s' % (nshot, J(full), s['ch'][kd]['t'], t0n[:60], t1n[:80], bool(s2['ch'])))
                    continue
                k = plan(s['ch'], menus)
                menus.append({'opts': [o['t'] for o in s['ch']], 'dim': [o['dim'] for o in s['ch']], 'pick': k})
                self.R.note('%s 選單 %s → 選「%s」' % (tag, J([o['t'] + ('（灰）' if o['dim'] else '') for o in s['ch']]), s['ch'][k]['t'] if k < len(s['ch']) else k))
                await self.tap_choice(k); await pg.wait_for_timeout(800); continue
            if self.mid_reload == 'dlg' and str(s['zone']).startswith('library') and not s['seat'] and s['depth'] > 0 and not s['ch']:
                self.mid_reload = False; self.mid_reloaded = True
                self.R.setup('%s：X207 ⑥ 人在總圖、還沒坐下，GAME.snapshot→applySave（途中存檔再讀檔）' % tag)
                await self.load(snap=await pg.evaluate(SNAP_JS), why='帶路途中')
                last_t = time.time(); continue
            if self.guide_on and not s['seat'] and str(s['zone']) == str(self.guide_on):
                g = await pg.evaluate(SEAT_JS, self.pid)
                if g['nD'] is not None: self.guide.append(g['nD'])
            if s['dlg'] or s['dlgVis']:
                if self.study_on: self.last_seat = await pg.evaluate(SEAT_JS, self.pid)
                if self.seat_pending and s['depth'] > 0:
                    smp = await pg.evaluate(SEAT_JS, self.pid)
                    mz = getattr(self, 'meet_zone', None)
                    if not self.study_on and mz and smp.get('zone') and smp.get('zone') != mz:
                        pass   # CC 13:2x：約定地點以外的劇情（出發前校園隨機偶遇「迎面走來一個人」）不算開演，等到了約定那一區再取樣
                    elif not self.study_on:
                        self.seat_sample = smp; self.seat_pending = False
                        if smp.get('others'):   # CC-B 11-07（BB-B 06:47）：同桌有人＝開演那一刻從上面往下拍一張（BUG-AFAR-DATE-OCCUPIED）
                            try:
                                await pg.evaluate("((p)=>{ const E=GAME.E, c=E.camera, V=THREE.Vector3; E.paused=true; c.position.set(p[0],7.5,p[1]+0.01); c.lookAt(new V(p[0],0,p[1])); c.updateMatrixWorld(); E.render(); })", smp['p'])
                                await self.shot((self.mid_tag or 'date') + '_topdown_open')
                            finally:
                                await pg.evaluate("(()=>{ GAME.E.paused=false; })()")
                            self.R.note('開演那一刻同桌／1.2 m 內的人：%s' % J(smp.get('othersInfo')))
                    else:   # 約念書：開演＝坐下旁白那一句（909c729a6 在門口先演開場、帶路以後才坐下）；沒有那一句（對照組）＝見面第一句
                        if self.first_sample is None: self.first_sample = smp
                        t_ = NZ(s['text'])   # 對話框是打字效果：讀到的可能只有前半句
                        if len(t_) >= 6 and NZ(AA649['sit_narr']).startswith(t_): self.seat_sample = smp; self.seat_pending = False
                if self.tx is not None and s['text'] and (not self.tx or self.tx[-1]['text'] != s['text']):
                    self.tx.append({'name': s['name'], 'text': s['text'], 'slots': await pg.evaluate(SLOTS_JS), 'adv': s['adv']})
                    if self.mid_tag and len(self.tx) == 4: await self.shot(self.mid_tag + '_mid')
                await L.tap(pg, self.cdp, '#dlg'); await pg.wait_for_timeout(650); continue
            await pg.wait_for_timeout(500)
        return False, s, menus, lines

    # ---- 沒卡住的檢查
    async def check_free(self, tag, fb0=None, err0=None, quick=None):
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
        if QUICK or quick: return ok
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
            mv = 0.0; evhit = None
            for _ in range(16):
                await pg.wait_for_timeout(500); s1 = await self.st(); mv = math.hypot(s1['x'] - s0['x'], s1['z'] - s0['z'])
                if mv >= 0.3: break
                if s1['evr'] and not s0['evr']: evhit = s1['evr']; break   # 走進自動劇情的範圍、劇情接手（玩家停下來看劇情）
            if evhit and mv < 0.3: R.info('%s：點地以後走進了自動劇情 %s（劇情接手，走了 %.2f m；不判）' % (tag, evhit, mv), J(tapped))
            else: ok &= R.check('%s：點地走得動（≥0.3 m）' % tag, mv >= 0.3, '點 %s，走了 %.2f m' % (J(tapped), mv))
        else:
            R.info('%s：附近找不到能點的地面（不判）' % tag, '候選 %d 個' % len(pts))
        sE = await self.st()
        if sE['evr']:   # CC-C 11-05：搖桿、點地走進了自動劇情的範圍（pool_12 的 ev_sk01_soc「對面的舊系館」）＝劇情照常開始；照玩家點完再接著檢查（不是卡住）
            R.setup('%s：走路的時候走進了自動劇情 %s，照玩家點完再接著檢查' % (tag, sE['evr'])); await self.drive(lambda ch, menus: 0, tag + ' 走進的自動劇情', max_s=180)
        # 遊戲時間
        h0 = (await self.st())['hour']; await pg.wait_for_timeout(3000); h1 = (await self.st())['hour']
        ok &= R.check('%s：遊戲時間有在走' % tag, h1 > h0, '%.4f→%.4f' % (h0, h1))
        # HUD 實際按一次（打開、關掉）
        for btn, chk, close in (('#btnPhone', "!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())", '#btnPhoneClose'), ('#btnMenu', "!document.getElementById('menu').classList.contains('hide')", '#btnClose'),
                                ('#minimap', "!document.getElementById('bigmap').classList.contains('hide')", '#bmClose')):
            sB = await self.st()
            if sB['evr'] or not is_free(sB):   # CC 13:4x：等時間那 3 秒裡路人招呼（ev_pool_greet）開演＝HUD 照設計鎖住；照玩家點完再按（REL_soc_new_r2「她改期」誤判）
                R.setup('%s：按 %s 之前有劇情在演（%s），照玩家點完再按' % (tag, btn, sB['evr'] or why_not_free(sB))); await self.drive(lambda ch, menus: 0, tag + ' 按 HUD 前的劇情', max_s=180)
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

    async def talk(self, tag, plan, expect_label=None, dbl=False, quick=None):
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
        free = await self.check_free(tag, fb0, err0, quick=quick)
        return free, menus, lines, s

    # ---- 找時段＋讀檔＋走過去
    async def scratch(self):
        """掃描用的存檔：條件事件關閉、不留著用"""
        if self.info['econ']: d = await self.pg.evaluate("(()=>{ const T=CALENDAR.termDays('Y0S1'); return T?T.from+20:-300; })()")
        else: d = await self.pg.evaluate("STORY.dayOfKey('2025-10-01')")
        fl = None
        if self.pid == 'heroine_03':   # story3d.js schedEnt（fd8d447d2:408）：沒有 YT_MET_JOB 時語彤不在任何地方，whereIs 一律 null（掃到 []）
            fl = {'YT_MET_JOB': True}
            self.R.setup('【前置／捷徑】掃時段用的存檔加 flags.YT_MET_JOB＝true（語彤在一盞茶屋認識以後才有作息；正式步驟的 SETUP met 也會設）')
        await self.load(self.base(d, 12.0, 'campus', {'x': 30, 'z': 30, 'yaw': 0}, flags=fl), quiet=True, why='掃時段用')

    async def find_slot(self):
        if self.base_slot is not None: return self.base_slot
        if SLOT_OVERRIDE:   # SLOT_OVERRIDE='zone,hour,YYYY-MM-DD'：直接指定時段（不掃）
            z, hr, key = [x.strip() for x in SLOT_OVERRIDE.split(',')]
            o = await self.pg.evaluate("(k=>{ const d=STORY.dayOfKey(k); const t=CALENDAR.termOf(d)||{}; return {d, wd:CALENDAR.dateOf(d).wd%7, key:CALENDAR.dateOf(d).key, term:t.id||'', week:t.week|0}; })", key)
            o.update({'hr': float(hr), 'zone': z, 'act': 'SLOT_OVERRIDE'})
            self.R.setup('【前置／捷徑】SLOT_OVERRIDE 指定時段：%s' % J([o['key'], o['hr'], o['zone']]))
            self.base_slot = [o]
            return self.base_slot
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

    async def step_greetn(self):
        """CC-B 11-10（BB-B 01:01，BUG-GREET-NOCLASS-1110）：週日／同週週三／學期中的國定假日，各讀檔到她在 3D 的時段，連按招呼 GREET_N 次，記每一句原文；
        分類照新版 src/data/greet_classday.js（GREET_TXT＝那個檔的路徑：classDay／playerNoClass／nextClassDay＝講到上課的；add weekend／offDay＝週末放假的新句）
        r2（CC 帳號 A 11-10，BB 08:1x 第 2 項）：r1 新舊兩版都 FAILED 6、其實沒測到一般招呼——
          ①週日掃到 cafe＝第 1 次按下去演的是店內偶遇（SHOPENC「她坐在沙發那一區……你也來這裡。」），不是一般招呼；
          ②週三、國定假日掃到 library＝讀書區第一次只點頭（LIBQ.gate「（她抬頭看到你，點了一下頭。）」，之後的台詞加「（小聲）」）；
          ③每次說完 check_free 會推搖桿、點地走開（2～3 m），第 2 次她已經不在旁邊＝「旁邊沒有互動鍵」，舊版還按到柏翰、座位、研究小間。
          改法：掃時段先排除讀書區（LIBQ.ZONES）和她的店內偶遇那幾間店（找不到才退回不排除，log 寫明）；每一次按之前都重新走到她旁邊、確認互動鍵是她的；
          第 2 次以後的 check_free 只查「回到自由移動、沒有新例外、walkFallbacks 沒增加」（HUD／搖桿／點地第 1 次已經查過，log 標「簡查」）；
          台詞去掉「（小聲）」前綴再比對；點頭、店內偶遇那種不是招呼的回應記下來但不算招呼。標準（週末放假不講上課、至少一句新句；週三至少一句問上課）不變。"""
        R, pg = self.R, self.pg; N = int(os.environ.get('GREET_N') or 12)
        txt = open(os.environ.get('GREET_TXT') or os.path.join(os.path.dirname(os.path.abspath(__file__)), 'greet_classday_968bd311f.js'), encoding='utf-8').read(); C = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])
        cls = set(); [cls.update((C.get(k) or {}).get(self.pid) or []) for k in ('classDay', 'playerNoClass', 'nextClassDay')]
        add = [e['t'] for e in ((C.get('add') or {}).get(self.pid) or [])]
        R.note('greetn：講到上課的（AA_729 標記）%d 句、週末／放假新句 %d 句' % (len(cls), len(add)))
        await self.scratch()
        quiet = await pg.evaluate("(()=>typeof LIBQ!=='undefined'&&LIBQ.ZONES?Object.keys(LIBQ.ZONES):['library','library_hall','library_carrels','library_stacks','lawlib','soclib','soclib_2f','library_b1','us_lawlib_2f'])()")
        shops = sorted(set(r['spot'] for r in (self.info.get('shop') or [])))
        noz = list(quiet) + shops
        R.note('greetn：掃時段排除讀書區 %s（第一次只點頭）和她的店內偶遇 %s（第一次演偶遇，不是一般招呼）' % (J(quiet), J(shops)))

        async def scan(extra):
            a = dict({'id': self.pid, 'terms': ['Y1S1'], 'hours': HOURS, 'wk0': 3}, **extra)
            o = await pg.evaluate(SCAN_JS, dict(a, noZones=noz))
            o.sort(key=lambda q: 1 if '走' in (q.get('act') or '') else 0)   # r2 雲端試跑：校園「走走」她一直走動、很難走到旁邊＝坐著／站著的時段優先
            if o: return o
            o = await pg.evaluate(SCAN_JS, a)
            if o: R.info('greetn：%s 排除讀書區／店內偶遇以後掃不到，退回不排除（第一次可能是點頭或偶遇，照樣記下來）' % J({k: v for k, v in extra.items() if k != 'days'}), J(o[:1]))
            return o

        WDONLY = (os.environ.get('GREET_WD') or '').strip()   # BB 09:47：只補測平日（她坐著不走開的時段）。'auto'＝掃上課前在教室等的時段；或 'zone,hour,YYYY-MM-DD' 直接指定
        if WDONLY:
            if WDONLY == 'auto':
                cand = await pg.evaluate(r"""(a=>{ const id=a.id; const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday,zone:G.zone}, out=[]; const T=CALENDAR.termDays('Y1S1');
                  try{ for(let d=T.from; d<=T.to&&out.length<12; d++){ const t=CALENDAR.termOf(d); if(!t||(t.week|0)<3) continue; const wd=CALENDAR.dateOf(d).wd%7; if(wd<1||wd>5) continue; if(CALENDAR.kind&&CALENDAR.kind(d)==='holiday') continue;
                    for(let hr=7.5; hr<=18; hr+=0.25){ G.day=d; G.hour=hr; G.weekday=wd; let w=null; try{ w=STORY.whereIs(GAME,id); }catch(e){} if(!w||!w.zone||w.away) continue;
                      /* r1：她在作息裡沒有「上課前在 classroom 等」這種時段（掃到 0）→ 改成：平日、不是上課中、不是走動、不在讀書區／店內偶遇的店，30 分鐘後還在同一區；教室、系館優先 */
                      if(/上課|上班/.test(w.act||'')||/走/.test(w.act||'')||(a.noz||[]).includes(w.zone)) continue; G.hour=hr+0.5; let w2=null; try{ w2=STORY.whereIs(GAME,id); }catch(e){} G.hour=hr;
                      if(w2&&w2.zone===w.zone&&!/走/.test(w2.act||'')){ out.push({d, wd, key:CALENDAR.dateOf(d).key, hr, zone:w.zone, act:w.act||'', term:'Y1S1', week:t.week|0, pri:/classroom|linze|lawhall|wancai/.test(w.zone)?0:1}); break; } } } }
                  finally{ Object.assign(G,keep); } return out; })""", {'id': self.pid, 'noz': noz})
                cand.sort(key=lambda q: (q.get('pri', 1), 0 if q['wd'] == 3 else 1, q['d']))
                R.note('greetn 平日補測：平日她不走動、不上課、30 分鐘不換地方的時段（教室／系館優先）%s' % J(cand[:6]))
                if not cand:
                    R.check('greetn 平日補測：找得到平日她不走動的時段', False, ''); return
                sl0 = cand[0]
            else:
                z, hr, key = [x.strip() for x in WDONLY.split(',')]
                sl0 = await pg.evaluate("(k=>{ const d=STORY.dayOfKey(k); const t=CALENDAR.termOf(d)||{}; return {d, wd:CALENDAR.dateOf(d).wd%7, key:CALENDAR.dateOf(d).key, term:t.id||'', week:t.week|0}; })", key)
                sl0.update({'hr': float(hr), 'zone': z, 'act': 'GREET_WD'})
            R.setup('【前置／捷徑】greetn 平日補測時段：%s' % J(sl0))
            sun = []; targets = [('同一週平日（補測，週%d）' % sl0['wd'], sl0)]
        else:
            sun = await scan({'max': 6, 'wds': [0]})
            targets = []
        if sun:
            targets.append(('週日', sun[0]))
            d0 = sun[0]['d']; wd = await scan({'max': 10, 'days': [d0 - 4, d0 + 3, d0 - 5, d0 - 3, d0 - 6, d0 - 2, d0 + 1, d0 + 2, d0 + 4, d0 + 5]})
            wd.sort(key=lambda q: (1 if '走' in (q.get('act') or '') else 0, 0 if q['wd'] == 3 else 1, abs(q['d'] - d0)))
            if wd: targets.append(('同一週週三' if wd[0]['wd'] == 3 else '前後一週平日（週%d）' % wd[0]['wd'], wd[0]))
        hol = [] if WDONLY else await pg.evaluate("(()=>{ const out=[]; const T=CALENDAR.termDays('Y1S1'); for(let d=T.from; d<=T.to; d++){ const w=CALENDAR.dateOf(d).wd%7; if(w>=1&&w<=5&&CALENDAR.kind&&CALENDAR.kind(d)==='holiday') out.push(d); } return out; })()")
        hs = await scan({'max': 6, 'days': hol}) if hol else []
        R.note('greetn：學期中平日的國定假日 %s；她在 3D 的 %s' % (J(hol), J(hs[:3])))
        if hs: targets.append(('國定假日（平日）', hs[0]))
        if not sun and not WDONLY: R.check('greetn：找得到週日她在 3D 的時段', False, '')
        NOT_GREET = ('點了一下頭', '你也來這裡', '沒有注意到你')
        for name, sl in targets:
            tag = 'greetn %s %s' % (name, sl['key'])
            w = await self.go_slot(sl, {'met': True, 'rel': REL['FAMILIAR'], 'relUp': 4, 'ladEnd': True, 'noContact': True}, tag, '前置：認識、有點熟、門檻台詞說過、階梯走完')
            if not w: R.check('%s：走得到她旁邊' % tag, False, ''); continue
            info = await pg.evaluate("(d=>({kind:CALENDAR.kind?CALENDAR.kind(d):null, wd:CALENDAR.dateOf(d).wd%7, classDay:STORY.classDayOf?STORY.classDayOf(d):null}))", sl['d'])
            got = []; other = []; mine_ok = 0
            for i in range(N):
                t2 = '%s 第%d次' % (tag, i + 1)
                if i > 0:   # 上一次說完 check_free 推了搖桿、點了地（人走開了）＝走回她旁邊
                    w2 = await self.walk_to(t2)
                    if not w2: R.check('%s：走回她旁邊（上一次說完檢查移動時走開了）' % t2, False, J(await pg.evaluate(NPC_JS, self.pid))); break
                n = await pg.evaluate(NPC_JS, self.pid); lab = (await self.st())['interact'] or ''
                mine = bool(n) and bool(lab) and ((n['name'] and n['name'] in lab) or (n['label'] and lab == n['label']))
                if not R.check('%s：旁邊的互動鍵是她的' % t2, mine, J({'label': lab, 'npc': n})): break
                mine_ok += 1
                ok, menus, lines, s2 = await self.talk(t2, Plan([{'when': '^就這樣$', 'pick': '^就這樣$'}]), quick=(i > 0))
                if i == 1: R.note('%s：第 2 次以後的 check_free 是簡查（只查回到自由移動、沒有新例外、walkFallbacks 沒增加；HUD、搖桿、點地第 1 次查過）' % tag)
                ls = [l.split('｜', 1)[1] if '｜' in l else l for l in lines]
                ls = [x[len('（小聲）'):] if x.startswith('（小聲）') else x for x in ls]
                if any(any(k in x for k in NOT_GREET) for x in ls[:3]): other.append(ls[:2])
                got.append(ls[:2]); R.note('%s 原文：%s' % (t2, J(lines[:3])))
                if not ok: break
                await pg.wait_for_timeout(800)
            flat = [x for g in got for x in g]
            hit_cls = sorted(set(x for x in flat if x in cls)); hit_add = sorted(set(x for x in flat if x in add))
            R.note('%s（%s）：按了 %d 次；講到上課的 %s；週末放假新句 %s；不是一般招呼的回應（點頭／偶遇）%d 次' % (tag, J(info), len(got), J(hit_cls), J(hit_add), len(other)))
            if name.startswith(('同一週', '前後一週')):
                if info['classDay'] is False: R.info('%s：這一天不是上課日（%s），不判問上課' % (tag, J(info))); continue
                R.check('%s：問上課那幾句出現（≥1）' % tag, len(hit_cls) >= 1, J(hit_cls))
                if WDONLY:   # BB 09:47：第 1 次說話裡就要有問上課的句子；不能出現週末、放假的新句
                    first = got[0] if got else []
                    R.check('%s：第 1 次說話就有問上課的句子' % tag, any(x in cls for x in first), J(first))
                    R.check('%s：沒有出現週末／放假的新句' % tag, not hit_add, J(hit_add))
            else:
                R.check('%s：沒有講到今天上課的句子' % tag, not hit_cls, J(hit_cls))
                R.check('%s：週末／放假新句至少一句' % tag, len(hit_add) >= 1, J(hit_add))

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
        if STUDY_ONLY or (P.get('studyPlace') and not P.get('study')):
            sp = P.get('studyPlace')
            if sp and STUDY_ONLY: P = sp
            elif sp: self.study_next = sp
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
            await cc_phone.reveal(pg, self.cdp, v['zone'])
            if not await L.tap(pg, self.cdp, '[data-place^="%s|"]' % v['zone']):
                await L.close_panels(pg, self.cdp); return R.info('invite：手機地點頁沒有 %s 的「前往」，不測見面' % v['zone'])
        v = dict(v); v['study'] = bool(P.get('study'))
        n = await pg.evaluate(NPC_JS, self.pid)
        if v['state'] == 'going': R.check('invite：「現在一起過去」她跟著走（beh follow）', bool(n) and n.get('beh') == 'follow', J(n))
        await self.meet_go('invite 見面（%s）' % P['verb'], None, v, SeqPlan())

    async def step_invite_study(self):
        """當面約念書（使用者 11-04：要走到桌子旁邊一起坐下）：invite 選的不是念書時，回到她旁邊再約一次念書"""
        sp = getattr(self, 'study_next', None)
        if not sp or STUDY_ONLY: return
        R, pg = self.R, self.pg
        if not await self.back_to_arrival('invite 念書'): return R.info('invite 念書：回到她旁邊以後找不到她')
        items = [{'when': '^就這樣$', 'pick': r'^約.去'}, {'when': CAT_RX, 'pick': re.escape(sp['cat'] or '念書')}, {'when': re.escape(sp['verb']), 'pick': re.escape(sp['verb'])}, {'when': '現在一起過去', 'pick': '現在一起過去'}]
        ok, menus, lines, s = await self.talk('invite 約念書', Plan(items))
        live = [x for x in await pg.evaluate(INVS_JS, self.pid) if x['state'] in ('accepted', 'going') and x['place'] == sp['id']]
        if not live: return R.info('invite 念書：她沒有答應', J(lines[-3:]))
        v = dict(live[-1]); v['study'] = True
        if v['state'] == 'going' and v['zone'] != (await self.st())['zone']:
            await L.tap(pg, self.cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
            await L.tap(pg, self.cdp, '#phoneTabs [data-ptab="places"]'); await pg.wait_for_timeout(1200)
            await cc_phone.reveal(pg, self.cdp, v['zone'])
            if not await L.tap(pg, self.cdp, '[data-place^="%s|"]' % v['zone']): await L.close_panels(pg, self.cdp); return R.info('invite 念書：手機地點頁沒有 %s' % v['zone'])
        await self.meet_go('invite 念書（%s）' % sp['verb'], None, v, SeqPlan())

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

    async def date_go(self, tag, trip, forced=None, record=True, go_snap=None):
        """約好以後：等出發前的提醒 →「現在出發」→ 演完 → 回到 3D。第一次（record）做完整報告、記下每個選單，再從「提醒前」的存檔換選項重跑"""
        R, pg = self.R, self.pg
        if go_snap: await self.load(snap=go_snap, why='%s：出發前的提醒之前' % tag)
        s = await self.st(); now = s['day'] * 24 + s['hour']; dep = trip['day'] * 24 + trip['depart']
        if dep - 1 - now > DATE_WAIT_H:
            snap = json.loads(await pg.evaluate(SNAP_JS)); t = dep - 0.9
            snap['day'] = int(t // 24); snap['hour'] = round(t - snap['day'] * 24, 3)
            await pg.evaluate("(a=>{ a.s.weekday=CALENDAR.dateOf(a.s.day).wd%7; window.__CCSNAP=JSON.stringify(a.s); })", {'s': snap})
            await self.load(snap=await pg.evaluate("window.__CCSNAP"), why='%s：離出發還有 %.1f 小時，存檔的時間改到出發前 54 分鐘（玩家可以用手機「跳過時間」或睡覺做到）' % (tag, dep - now))
        go = await pg.evaluate(SNAP_JS)
        fb0, err0 = await self.base_marks(); rec0 = await pg.evaluate(REC_JS, self.pid); rec0['fb'] = fb0; rec0['err'] = err0
        say0 = await pg.evaluate("(window.__CCS||[]).length"); self.tx = [] if record else None; self.mid_tag = tag if record else None
        t0 = time.time(); got = False
        while time.time() - t0 < 420:
            s = await self.st()
            if s['ch'] and any(re.search('現在出發|^出發$', o['t']) for o in s['ch']): got = True; break
            if s['ch']:   # BB-B 01:15：等提醒時插進來別的自動事件（例 ev_pool_greet）＝像玩家一樣選第一個、記一行，繼續等
                R.info('%s：等提醒時插進來 %s（%s %.3f）選單 %s → 選第一個「%s」' % (tag, s.get('evr'), s.get('key'), s.get('hour') or 0, J([o['t'] for o in s['ch']]), s['ch'][0]['t']))
                await self.tap_choice(0); await pg.wait_for_timeout(1200); continue
            if s['dlg'] or s['dlgVis']: await L.tap(pg, self.cdp, '#dlg')
            if s['phone']: await L.tap(pg, self.cdp, '#btnPhoneClose')
            await pg.wait_for_timeout(1500)
        if not R.check('%s：出發前的提醒出來（「現在出發」或「出發」）' % tag, got, J({k: s[k] for k in ('key', 'hour', 'zone', 'text', 'ch', 'cap')}) + ' 行程 ' + J(trip)):
            if not is_free(s): await self.dump(tag + '_提醒', s)
            return
        await self.shot(tag + '_depart')
        plan = SeqPlan(forced, items=[{'when': '現在出發|^出發$', 'pick': '現在出發|^出發$'}, {'when': '^自己選$', 'pick': '^自己選$'}])
        ok, s, m, lines = await self.drive(plan, tag + ' 出發')
        R.note('%s 台詞（%d 句）：%s' % (tag, len(lines), J(lines[:6] + ['…'] + lines[-4:])))
        if not R.check('%s：出發、到場、互動點、收尾、結算一路點得完' % tag, ok, why_not_free(s)):
            await self.dump(tag + '_約會中', s); self.tx = None; return m
        await self.shot(tag + '_back')
        if record: await self.date_report(tag, rec0, say0, False, True, trip_id=trip['trip'])
        else: await self.check_free(tag + ' 回來以後', fb0, err0)
        self.tx = None; self.mid_tag = None
        tr = [x for x in await pg.evaluate(TRIPS_JS, self.pid) if x['trip'] == trip['trip']]
        R.check('%s：那一趟記成 done（或一個點都沒去＝cancelled）' % tag, bool(tr) and tr[0]['status'] in ('done', 'cancelled'), J(tr))
        if record and forced is None:
            br = branch_list(m, '現在出發|^出發$|到時間再說')[:DATE_BRANCH_MAX]
            R.note('%s：約會裡的選單 %d 個，換選項重跑 %d 次（DATE_BRANCH_MAX=%d）' % (tag, len(m), len(br), DATE_BRANCH_MAX))
            for mi, oi, t in br:
                fz = {j: m[j]['pick'] for j in range(mi)}; fz[mi] = oi
                await self.date_go('%s 分支%d-%d「%s」' % (tag, mi, oi, t[:8]), trip, forced=fz, record=False, go_snap=go)
        return m

    async def near_log(self, tag):
        """CC-B 11-07（LAWWW-B 要的重現資料）：日期、區域、時間；兩人的 SOCIAL.stage、INV.stageOf；她旁邊 3 m 內有誰"""
        q = await self.pg.evaluate("""((id)=>{ const G=GAME.G, E=GAME.E; const ents=(E&&E.npcs)||[]; const me=ents.find(e=>e&&e.charId===id&&e.obj);
          const st=x=>{ try{ return SOCIAL.stage?SOCIAL.stage(x):null; }catch(e){ return String(e); } }; const iv=x=>{ try{ return INV.stageOf?INV.stageOf(G,x):null; }catch(e){ return String(e); } };
          const near=me?ents.filter(e=>e&&e!==me&&e.obj&&Math.hypot(e.obj.position.x-me.obj.position.x,e.obj.position.z-me.obj.position.z)<=3).map(e=>({id:e.id,charId:e.charId||null,d:+Math.hypot(e.obj.position.x-me.obj.position.x,e.obj.position.z-me.obj.position.z).toFixed(2),stage:e.charId?st(e.charId):null})):null;
          return {key:CALENDAR.dateOf(G.day).key, day:G.day, zone:G.zone, h:+(+G.hour).toFixed(2), stage:st(id), invStage:iv(id), whyNot:INV.whyNot?INV.whyNot(G,id):null, near,
            canInvite:(()=>{ try{ return INV.canInvite(G,id); }catch(e){ return String(e); } })(),
            privOk:(()=>{ try{ return STORY.privOk?STORY.privOk(G,id,'invite',GAME,me):null; }catch(e){ return String(e); } })(),
            company:(()=>{ try{ return STORY.companyOf?STORY.companyOf(G,id,me,GAME):null; }catch(e){ return String(e); } })(),
            crowd:(()=>{ try{ return (typeof PRIVTALK!=='undefined'&&PRIVTALK.crowd)?PRIVTALK.crowd(G,id,PRIVTALK.byKey.invite,GAME):null; }catch(e){ return String(e); } })(),
            privWait:(()=>{ try{ const f=(G.flags||{}).PRIVTALK; return f?JSON.parse(JSON.stringify(f)):null; }catch(e){ return String(e); } })()}; })""", self.pid)
        self.R.note('%s 重現資料：%s' % (tag, J(q)))
        return q

    async def date_blocked(self, tag):
        """CC-B 11-07（BB-B 03:36 ④）：約之前先問遊戲 DATE.canAsk（當面＝face、手機）——V21R 沛珊、芯慈「約成一趟」FAIL 沒印為什麼。
        芯慈：XCROM.ON 關著（D116，芯慈的線先關）＝DATE.HEROINES 沒有她＝不能約是預期，記 SKIP。其他不給約的原因照實印、照舊 FAIL（BB 判）。"""
        q = await self.pg.evaluate("((id)=>{ const G=GAME.G; const r=o=>{ try{ return DATE.canAsk(G,id,o); }catch(e){ return {ok:null,why:String(e)}; } };"
                                   " return {invites:(G.invites||[]).filter(v=>v.who===id).map(v=>({id:v.id,place:v.place,day:v.day,h:v.h,state:v.state,by:v.by})), face:r({face:true}), phone:r(null), inHero:DATE.HEROINES.includes(id), xcrom:typeof XCROM!=='undefined'?!!XCROM.ON:null, stage:DATE.stageNum(id), key:CALENDAR.dateOf(G.day).key,"
                                   " partner:(typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].partner)||null}; })", self.pid)
        self.R.note('%s 約之前 DATE.canAsk：%s' % (tag, J(q)))
        if self.pid == 'classmate_xinci' and q['xcrom'] is False and not q['inHero']:
            self.R.skip(tag, '芯慈的戀愛線關著（XCROM.ON false，D116）＝不能約是預期')
            return True
        return False

    async def step_date(self):
        R, pg = self.R, self.pg
        if not self.info['date']: return R.skip('date', '不是可攻略的人（DATE.HEROINES 沒有他）')
        setup = {'met': True, 'rel': REL['POSSIBLE_ROMANTIC_INTEREST'], 'relUp': 4, 'ladEnd': True, 'contact': True}
        sl, w = await self.go_any(setup, '前置：第 5 階（POSSIBLE_ROMANTIC_INTEREST）、有聯絡方式', 'date')
        if w and await self.date_blocked('date 當面約'): return
        mkplan = lambda: Plan([{'when': '^就這樣$', 'pick': r'^約.去'}, {'when': '^出去玩', 'pick': '^出去玩'}, {'when': '^就這樣約$', 'pick': '^就這樣約$'}])   # 每次說話新的一份（舊的「約她去…」用過就丟，第 3 次會選「就這樣」）
        if w:
            n0 = len(await pg.evaluate(TRIPS_JS, self.pid)); trips = []; lines = []
            slots = await self.find_slot(); tried_sl = [sl]
            for si in range(3):   # CC-B 11-07（BB-B／LAWWW-B）：這個時段三次都沒有「約她去…」＝可能被事件取代／旁邊有她的圈子 → 換一個時段（不同天、不同地點優先）再試
                if si:
                    nxt = next((o for o in slots if all(o['zone'] != t['zone'] and o['d'] != t['d'] for t in tried_sl)), None) or next((o for o in slots if all(o['d'] != t['d'] for t in tried_sl)), None)
                    if not nxt: break
                    tried_sl.append(nxt); R.note('date 當面約：上一個時段沒有「約她去…」，換時段 %s' % J([nxt['key'], nxt['hr'], nxt['zone'], nxt.get('act')]))
                    if not await self.go_slot(nxt, setup, 'date 換時段', '前置：第 5 階、有聯絡方式'): continue
                await self.near_log('date 當面約 時段 %d' % (si + 1))
                saw_inv = False
                for k in range(3):   # 第一次說話可能被一句情境台詞／階梯台詞用掉（11-04 SOC_*_zr：「妳上完課都在這裡發呆？」那一段沒有約的選單）→ 再說一次
                    ok, menus, lines, s = await self.talk('date 當面約' + ('' if k == 0 and si == 0 else '（時段 %d 第 %d 次）' % (si + 1, k + 1)), mkplan())
                    saw_inv = saw_inv or any(re.search(r'^約.去', o) for x in menus if isinstance(x, dict) for o in x.get('opts', []))
                    trips = await pg.evaluate(TRIPS_JS, self.pid)
                    if len(trips) > n0: break
                    R.note('date 當面約：第 %d 次說話沒有約成（選單 %s；這個時段看過「約她去…」：%s），回到她旁邊再說一次' % (k + 1, J([x.get('opts') if isinstance(x, dict) else x for x in menus][:3]), saw_inv))
                    if not await self.walk_to('date 再說一次（不讀檔，剛才那句已經說過）'): break
                if len(trips) > n0 or saw_inv: break
            if not R.check('date 當面約：約成一趟（G.trips 多一筆，booked／現在出發的 done 都算）', len(trips) > n0 and trips[-1]['status'] in ('booked', 'going', 'done'), J(trips[-2:]) + ' ' + J(lines[-3:])): return
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
        s0 = await self.st()
        if s0['evr']:   # CC-C 11-05：讀檔點正好演起自動劇情（pool_12 2025-09-19 campus 的 ev_sk01_soc「對面的舊系館」）＝照玩家點完再開始（v20r_cloud2 pool3 那一次 FAIL 是探針沒點）
            R.setup('%s：讀檔點正好演自動劇情 %s，照玩家點完再開始' % (tag, s0['evr'])); await self.drive(lambda ch, menus: 0, tag + ' 讀檔點的自動劇情', max_s=180)
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
            if R.check('%s：約成一趟（booked；選了「現在出發」演完的 done 也算）' % tag, len(trips) > n0 and trips[-1]['status'] in ('booked', 'going', 'done'), J(trips[-2:])) and go and trips[-1]['status'] == 'booked':
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
        if self.info['date'] and not await self.date_blocked('phone 約出去玩'):
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


    # ================================================================ 約會實際進行（使用者 11-04：「還有實際約會進行」「約念書要一起坐下」）
    async def wait_busy(self, max_s, done=None):
        """等到有劇情開始（選單、對話、busy）或 done() 成立；回傳 True／False"""
        t0 = time.time()
        while time.time() - t0 < max_s:
            s = await self.st()
            if s['ch'] or s['dlg'] or s['dlgVis'] or s['depth'] or s['busy']: return True
            if done and await done(): return True
            if s['phone']:
                self.phone_log.append({'zone': s['zone'], 'hour': s['hour'], 'where': 'wait', 't': time.time()}); await L.tap(self.pg, self.cdp, '#btnPhoneClose')
            if self.guide_on and str(s['zone']) == str(self.guide_on) and not s['seat']:
                g = await self.pg.evaluate(SEAT_JS, self.pid)
                if g['nD'] is not None: self.guide.append(g['nD'])
            if self.study_on:   # 約念書：她帶路＝跟著走；一起走去三樓＝走到樓梯間的門（INV-SIT-TOGETHER-1104）
                r = await self.follow_lead(self.mid_tag or 'study')
                if r == 'busy': return True
                if r == 'gone': return bool(done and await done())
                if r == 'moved': continue
            await self.pg.wait_for_timeout(1200)
        return False

    async def run_scene(self, tag, plan, done=None, first_wait=300, phases=4):
        """一路演完一場：等開始 → 點到回到自由 → 還沒 done（例：提早到、還沒開演）就再等；回傳 (ok, menus, lines, s)"""
        menus, lines, s = [], [], await self.st()
        for ph in range(phases):
            if done and await done(): break
            if not await self.wait_busy(first_wait if ph == 0 else (STUDY_WAIT_S if self.study_on else 240), done):
                break
            if done and await done() and is_free(await self.st()): break
            ok, s, m, l = await self.drive(plan, tag)
            menus += m; lines += l
            if not ok: return False, menus, lines, s
        return True, menus, lines, s

    async def shift_to(self, tag, day, h):
        """把遊戲時間推到 day h：同一天先試手機「今天」的跳過時間（玩家的按鈕），剩下的差距大於 DATE_WAIT_H 才改存檔的時間（[前置／捷徑]）"""
        pg, R = self.pg, self.R; s = await self.st(); now = s['day'] * 24 + s['hour']; tgt = day * 24 + h
        if tgt - now <= 0.02: return
        if day == s['day']:
            await L.tap(pg, self.cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
            await L.tap(pg, self.cdp, '#phoneTabs [data-ptab="today"]'); await pg.wait_for_timeout(1200)
            sk = await pg.evaluate("(h=>{ const L=[...document.querySelectorAll('#phoneBody [data-skip]')].map(b=>+b.dataset.skip).filter(t=>t<=h).sort((a,b)=>b-a); return L.length?L[0]:null; })", h)
            if sk is not None:
                R.note('%s：手機「今天」→ 跳過時間到 %.2f' % (tag, sk))
                await L.tap(pg, self.cdp, '#phoneBody [data-skip="%.3f"]' % sk)
                ok, s2, m, l = await self.drive(Plan(), tag + ' 跳過時間', max_s=180)
                if not ok: R.check('%s：跳過時間沒有卡住' % tag, False, why_not_free(s2)); await self.dump(tag + '_skip', s2)
            else: await L.close_panels(pg, self.cdp)
            s = await self.st(); now = s['day'] * 24 + s['hour']
        if tgt - now > DATE_WAIT_H:
            snap = json.loads(await pg.evaluate(SNAP_JS)); snap['day'] = int(tgt // 24); snap['hour'] = round(tgt - snap['day'] * 24, 3)
            await pg.evaluate("(a=>{ a.s.weekday=CALENDAR.dateOf(a.s.day).wd%7; window.__CCSNAP=JSON.stringify(a.s); })", {'s': snap})
            await self.load(snap=await pg.evaluate("window.__CCSNAP"), why='%s：離約好的時間還有 %.1f 小時，存檔的時間改到 %s %.2f（手機的跳過時間只到固定時刻）' % (tag, tgt - now, int(tgt // 24), tgt % 24))

    def tx_checks(self, tag, say0):
        return say0   # 佔位：實際在 date_report 裡做

    async def date_report(self, tag, rec0, say0, study, meet_ok, place_zone=None, iv_id=None, trip_id=None, variant=None):
        """約會演完：時間、錢、關係、記憶前後；對話紀錄（空白句、名字是 id、同一句重複、立繪空）；念書要坐下；回到自由；她回到自己的行程"""
        R, pg = self.R, self.pg
        rec1 = await pg.evaluate(REC_JS, self.pid)
        say = (await pg.evaluate("(n=>(window.__CCS||[]).slice(n))", say0))
        dur = rec1['t'] - rec0['t']
        R.check('%s：約會中時間有往前走' % tag, dur > 0.01, '遊戲時間 %.2f 小時（%s %.2f → %s %.2f）' % (dur, rec0['day'], rec0['hour'], rec1['day'], rec1['hour']))
        R.info('%s：錢 %d → %d（%+d）' % (tag, rec0['money'], rec1['money'], rec1['money'] - rec0['money']))
        drel = {k: rec1['rel'][k] - rec0['rel'][k] for k in rec0['rel'] if rec1['rel'][k] != rec0['rel'][k]}
        if drel or rec1['nmem'] != rec0['nmem']: R.check('%s：關係或記憶有變化' % tag, True, J({'rel': drel, 'mem': '%d→%d %s' % (rec0['nmem'], rec1['nmem'], rec1['mem'][-3:])}))
        else: R.info('%s：關係、記憶都沒有變化（每天上限？）' % tag, J(rec1['rel']))
        blank = [x for x in say if not x['t'].strip()]
        idn = [x for x in say if x['n'] and re.match(ID_RX, x['n'])] + [{'n': x['name'], 't': x['text']} for x in (self.tx or []) if x['name'] and re.match(ID_RX, x['name'])]
        dup = [say[i]['t'] for i in range(1, len(say)) if say[i]['t'] == say[i - 1]['t'] and say[i]['n'] == say[i - 1]['n'] and say[i]['t'].strip()]
        noimg = [x['name'] + '｜' + x['text'][:20] for x in (self.tx or []) if x['adv'] and x['name'] and not x['name'].startswith('祐廷') and not any(sl['show'] and sl['img'] for sl in x['slots'])]
        R.check('%s：對話沒有空白的句子' % tag, not blank, J(blank[:3]))
        R.check('%s：說話的人名字不是 id' % tag, not idn, J(idn[:3]))
        if dup: R.info('%s：同一句連續出現兩次' % tag, J(dup[:3]))
        if noimg: R.info('%s：有名字的句子、ADV 開著、立繪框是空的（%d 句）' % (tag, len(noimg)), J(noimg[:4]))
        fn = os.path.join(OUT, '%s_%s_transcript.json' % (self.pid, re.sub(r'[^0-9A-Za-z_\-]+', '_', tag)[:40]))
        with open(fn, 'w', encoding='utf-8') as f:
            json.dump({'pid': self.pid, 'tag': tag, 'rec0': rec0, 'rec1': rec1, 'hours': dur, 'say': say, 'screen': self.tx, 'seat': self.seat_sample}, f, ensure_ascii=False, indent=1)
        R.note('%s：對話紀錄 %d 句 → %s' % (tag, len(say), fn))
        for x in say[:60]: print('    %s｜%s' % (x['n'] or '（旁白）', x['t']), flush=True)
        if study and iv_id:   # CC-B 11-07（BB-B 06:15）：「離門口 ≥ 3 m」只給約念書；喝咖啡（afar 這種）改查開演時兩個人都坐著
            isst = await self.pg.evaluate("((id)=>{ const iv=(GAME.G.invites||[]).find(v=>v.id===id); if(!iv) return null; try{ return typeof INV!=='undefined'&&INV.isStudy?!!INV.isStudy(iv):null; }catch(e){ return null; } })", iv_id)
            if isst is False:
                ss = self.seat_sample or {}
                R.check('%s：喝咖啡／吃飯的約會：開演時兩個人都坐著（不查離門口距離，那條只給約念書）' % tag, bool(ss.get('pseat') and ss.get('nseat')), J(ss))
                study = False
        if study:
            ss = self.seat_sample or {}
            lim = 2.3 if variant == 'seatmeet' else 1.5   # 座位選單坐下：INV.leadScene／seatMeet 認 2.3 m 內（同一張桌子對面 1.6 m、斜對面 1.9 m）
            okseat = bool(ss.get('pseat') and ss.get('nseat') and ((ss.get('seatD') is not None and ss['seatD'] <= lim) or ss.get('sameGroup')))
            far = ss.get('doorD') is None or ss['doorD'] >= 3.0
            libok = not str(ss.get('zone', '')).startswith('library') or ss.get('zone') == 'library' or (ss.get('zone') == 'library_hall' and ss.get('lv') == 1)
            R.check('%s：約念書開演時兩個人坐在同一張桌子（%s）' % (tag, STUDY_MSG), okseat, J(ss))
            R.check('%s：約念書開演的位置離門口 ≥ 3 m（%s）' % (tag, STUDY_MSG), far, J({'doorD': ss.get('doorD'), 'spawnD': ss.get('spawnD')}))
            R.check('%s：總圖要在二樓（lv1）長桌或 3F 閱覽區（%s）' % (tag, STUDY_MSG), libok, J({'zone': ss.get('zone'), 'lv': ss.get('lv')}))
            if not ss: R.check('%s：X207 走到門口就演完＝FAIL（%s）' % (tag, STUDY_MSG), False, '開演那一刻沒有取到位置（見面那一場沒有對話？）')
            gd = self.guide[2:] if len(self.guide) > 2 else self.guide
            if gd: R.check('%s：X207 ② 入口到座位她走在旁邊或前面（距離 ≤ 3 m）' % tag, max(gd) <= 3.0, '取樣 %d 次，最遠 %.2f m：%s' % (len(gd), max(gd), J(gd[:20])))
            else: R.info('%s：X207 ② 沒有取到帶路途中的距離（一進大廳就開演？）' % tag, J(self.guide))
            ls = self.last_seat or {}
            R.check('%s：X207 ④ 道別那一刻兩個人在大廳門口附近或已經在校園' % tag, ls.get('zone') == 'campus' or (ls.get('doorD') is not None and ls['doorD'] <= 5 and (ls.get('nD') or 99) <= 4),
                    J({k: ls.get(k) for k in ('zone', 'doorD', 'nD', 'pseat', 'nseat')}))
            if str(ss.get('zone', '')).startswith('library') or str(place_zone or '').startswith('library'):
                nz = lambda t: re.sub(r'[「」\s]', '', t or '')
                T = [nz(x['t']) for x in say]; her = [nz(x['t']) for x in say if x['c'] == self.pid or (x['n'] and x['n'] != '祐廷' and x['n'] != '')]
                has = lambda t, L=T: nz(t) in L
                own = AA649['own'].get(self.pid)
                R.check('%s：AA_649 帶路句「%s」' % (tag, AA649['guide']), has(AA649['guide'], her), '')
                if variant == 'full':
                    R.check('%s：AA_649 三樓旁白「%s」' % (tag, AA649['full_narr']), has(AA649['full_narr']), '')
                    R.check('%s：AA_649 三樓句「%s」' % (tag, AA649['full']), has(AA649['full'], her), '')
                R.check('%s：AA_649 坐下旁白' % tag, has(AA649['sit_narr']), AA649['sit_narr'])
                sitl = ([own[0]] if own else []) + AA649['sit_gen']
                R.check('%s：AA_649 坐下她的一句（她自己的或一般句）' % tag, any(has(t, her) for t in sitl), J(sitl))
                R.check('%s：AA_649 念書中途一則（小聲的要帶「（小聲）」）' % tag, any(has(t) for t in AA649['mid']), J(AA649['mid']))
                R.check('%s：AA_649 收書' % tag, any(has(t) for t in AA649['pack']) and (has(AA649['pack_say'], her) or has(AA649['pack'][0])), J(AA649['pack'] + [AA649['pack_say']]))
                byel = ([own[1]] if own else []) + AA649['bye_gen']
                R.check('%s：AA_649 道別（她自己的或一般句；大廳門外照平常說話、不加（小聲））' % tag, any(has(t, her) for t in byel), J(byel))
                loud = [x['t'] for x in say if (x['c'] == self.pid) and x['t'] and '（小聲）' not in x['t'] and nz(x['t']) not in [nz(t) for t in byel] and not x['t'].startswith('（')]
                if loud: R.info('%s：總圖裡她說的話沒有「（小聲）」的（道別以外）' % tag, J(loud[:5]))
        if not meet_ok: return
        fb0 = rec0.get('fb'); err0 = rec0.get('err')
        await self.check_free(tag + ' 結束', fb0, err0)
        if place_zone: R.check('%s：人在約定的地點（G.zone＝%s）' % (tag, place_zone), rec1['zone'] == place_zone or (place_zone == 'library_hall' and rec1['zone'] == 'library'), rec1['zone'])
        if iv_id is not None:
            ivs = await pg.evaluate(INVS_JS, self.pid)
            R.check('%s：那一筆約記成 done' % tag, any(x['state'] == 'done' for x in ivs if x['id'] == iv_id), J([x for x in ivs if x['id'] == iv_id]))
        s = await self.st()
        R.check('%s：結束後玩家起身了' % tag, not s['seat'], J({'seat': s['seat']}))
        if trip_id is None: await self.her_after(tag, study)

    async def her_after(self, tag, study):
        """她回到自己的行程：作息說她不在這一區＝AFTER_S 秒內要離開（不見、在走、或離開原地 2 m）；念書的要起身"""
        R, pg = self.R, self.pg
        a = await pg.evaluate(SEAT_JS, self.pid); t0 = time.time(); last = a; moved = False
        while time.time() - t0 < AFTER_S:
            await pg.wait_for_timeout(5000); last = await pg.evaluate(SEAT_JS, self.pid)
            if not last['npc'] or last['nleaving'] or (a['nx'] is not None and last['nx'] is not None and math.hypot(last['nx'] - a['nx'], last['nz'] - a['nz']) > 2): moved = True; break
        w = await pg.evaluate(WHERE_JS, self.pid); zone = (await self.st())['zone']
        if study: R.check('%s：約念書結束後她也起身（或走了）' % tag, (not last['nseat']) or moved, J(last))
        if w and w['zone'] == zone and not w['away']: R.info('%s：照作息她本來就在這一區（%s），不判黏在原地' % (tag, w['act']))
        else: R.check('%s：她回到自己的行程（%d 秒內離開，不黏在原地）' % (tag, AFTER_S), moved, J({'where': w, 'npc': last}))

    async def meet_go(self, tag, go_snap, iv, plan, walk=False, record=True, variant=None):
        """從「出發前」的存檔：等「直接過去／自己走過去」→ 到場 → 見面那一場一路演完；record＝做完整報告"""
        R, pg = self.R, self.pg
        if go_snap: await self.load(snap=go_snap, why='%s：約好、時間快到的那一刻' % tag)
        if IVLOG and go_snap:
            R.note('IVLOG 掛鉤：%s' % J(await pg.evaluate(IVHOOK_JS, self.pid)))
            t1 = time.time(); seen = None
            while time.time() - t1 < float(os.environ.get('IVLOG_S') or 150):
                r = await pg.evaluate(IVRAW_JS, self.pid); v = (r['iv'] or [{}])[-1]
                key2 = (round(r['hour'], 2), r['zone'], v.get('state'), v.get('goAsked'), tuple(r['choices']), r['dlg'][:12], str(r['evr'])[:30])
                if key2 != seen: R.note('IVLOG 讀檔後 %.0fs：%s' % (time.time() - t1, J({k: r[k] for k in ('hour', 'zone', 'px', 'pz', 'choices', 'dlg', 'phone', 'evr', 'cur')} | {'iv': {k: v.get(k) for k in ('state', 'h', 'goAsked', 'lead', 'waitSeat', 'zone')}}))); seen = key2
                if v.get('state') != 'accepted' or r['choices'] or r['dlg']: break
                await pg.wait_for_timeout(1000)
        fb0, err0 = await self.base_marks(); rec0 = await pg.evaluate(REC_JS, self.pid); rec0['fb'] = fb0; rec0['err'] = err0
        say0 = await pg.evaluate("(window.__CCS||[]).length"); self.tx = []; self.seat_sample = None; self.seat_pending = True; self.mid_tag = tag
        self.study_on = bool(iv.get('study')); self.guide_on = iv['zone'] if self.study_on else None; self.guide = []; self.last_seat = None; self.mid_reloaded = False
        if variant == 'full': R.setup('%s：X207 ② 二樓（lv1）的座位全部設成有人坐（seat.taken，進總圖大廳就設）' % tag); await pg.evaluate(FULL_HOOK_JS, True)
        self.study_reset(); self.lead_iv = iv.get('id'); self.first_sample = None; self.meet_zone = iv.get('zone'); await self.mark()
        if variant == 'reload': self.mid_reload = 'lead'
        if variant == 'reload_dlg': self.mid_reload = 'dlg'
        if variant == 'seatmeet': self.lead_mode = 'seat'
        sm0 = len(await pg.evaluate("window.__CCSM||[]"))
        await self.shot(tag + '_depart')
        done = lambda: self.iv_done(iv['id'])
        if walk:
            got = await self.wait_busy(240)
            s = await self.st(); t_w = time.time()
            while got and time.time() - t_w < 90 and not (s['ch'] and any('自己走過去' in o['t'] for o in s['ch'])):
                # CC 12:5x：出發前校園隨機偶遇（「迎面走來一個人」）先演——點掉、選第一個，再等「直接過去／自己走過去」（V25_social：沒等就把偶遇當成見面、選到「直接過去」）
                if s['ch']: R.note('%s：出發前先出現別的選單 %s → 選第一個（偶遇），再等「自己走過去」' % (tag, J([o['t'] for o in s['ch']]))); await self.tap_choice(0); await pg.wait_for_timeout(900)
                elif s['dlg'] or s['dlgVis']: await L.tap(pg, self.cdp, '#dlg'); await pg.wait_for_timeout(500)
                else: await pg.wait_for_timeout(800)
                s = await self.st()
            self.seat_sample = None; self.first_sample = None; self.tx = []
            if s['ch'] and any('自己走過去' in o['t'] for o in s['ch']):
                k = next(i for i, o in enumerate(s['ch']) if '自己走過去' in o['t']); await self.tap_choice(k); await pg.wait_for_timeout(1200)
                ex = await pg.evaluate("(z=>{ const it=(GAME.E.interactables||[]).find(i=>i.exit&&i.exit.to===z); return it?{x:it.x,z:it.z,label:it.label||''}:null; })", iv['zone'])
                if not ex: self.tx = None; return R.info('%s：這一區沒有直接通到 %s 的門，「自己走過去」不測' % (tag, iv['zone']))
                await L.go_to(pg, self.cdp, GoRun(R), ex['x'], ex['z'], 1.4, '往 %s 的門（%s）' % (iv['zone'], ex['label']), max_s=WALK_S)
                if (await self.st())['interact']: await L.tap(pg, self.cdp, '#interact'); await pg.wait_for_timeout(6000)
            else: R.info('%s：沒有出現「直接過去／自己走過去」的選單' % tag, J({k: s[k] for k in ('zone', 'hour', 'ch')}) if got else '等了 240 秒')
        ok, menus, lines, s = await self.run_scene(tag, plan, done=done, first_wait=STUDY_WAIT_S if self.study_on else 300, phases=12 if self.study_on else 4)
        arr = await self.st()
        if arr['zone'] == iv['zone'] or (iv['zone'] == 'library_hall' and arr['zone'] == 'library'): await self.shot(tag + '_arrive')
        if not R.check('%s：出發、到場、見面那一場一路點得完' % tag, ok, why_not_free(s)): await self.dump(tag, s); self.tx = None; return menus
        if not await self.iv_done(iv['id']):
            R.check('%s：到了約定的地方、見面那一場有開始' % tag, False, J({'zone': arr['zone'], 'hour': arr['hour'], 'iv': await pg.evaluate(INVS_JS, self.pid)}))
            if IVLOG: R.note('IVLOG 紀錄（goPrompt／事件／狀態）：%s' % J(await pg.evaluate('(window.__IVH||{log:[]}).log.slice(-120)')))
            self.tx = None; return menus
        if self.study_on and self.seat_sample is None and self.first_sample is not None:
            self.seat_sample = self.first_sample; R.note('%s：沒有看到 AA_649 的坐下旁白，開演位置用見面第一句那一刻' % tag)
        ss = self.seat_sample
        if ss is not None: R.check('%s：開演時她在場（離玩家 ≤ 4 m）' % tag, ss['npc'] and ss['nD'] is not None and ss['nD'] <= 4, J(ss))
        if ss is not None and not self.study_on:
            R.check('%s：X207 ⑤ 開演點在座位、桌子或櫃台，不在區域入口（玩家坐著，或離出生點／門口 ≥ 3 m）' % tag,
                    ss['pseat'] or ((ss['spawnD'] is None or ss['spawnD'] >= 3) and (ss['doorD'] is None or ss['doorD'] >= 3)), J(ss))
        if variant == 'full':
            await pg.evaluate(FULL_HOOK_JS, False)
            R.check('%s：X207 ② 二樓滿了→真的走到三樓閱覽區（開演時 zone＝library）' % tag, bool(ss) and ss['zone'] == 'library', J(ss))
        if variant == 'seatmeet':
            sm = (await pg.evaluate("window.__CCSM||[]"))[sm0:]
            if not self.lead_seen: R.check('%s：座位選單坐下開演（S.seatMeet）' % tag, False, '一直沒有帶路（iv.lead 沒有值；對照組沒有這個功能）')
            elif not self.seat_tapped: R.info('%s：沒有按到她旁邊的「坐下」（%s），這一場是走近開演（leadTick）' % (tag, self.seat_why or '避不開'), J(sm))
            else: R.check('%s：座位選單「坐下」以後開演（INV.seatMeet 回 true）' % tag, any(x.get('ok') for x in sm), J({'seatMeet': sm, 'seat': ss}))
        if variant in ('reload', 'reload_dlg'): R.check('%s：X207 ⑥ 帶路途中（iv.lead 有值）讀檔以後接著帶路、兩個人坐下' % tag, self.mid_reloaded and bool(ss) and ss['pseat'] and ss['nseat'],
                                                     J({'reloaded': self.mid_reloaded, 'seat': ss, 'lead': self.lead_log[-4:]}))
        await self.shot(tag + '_end')
        if record or self.study_on: await self.date_report(tag, rec0, say0, self.study_on, True, place_zone=iv['zone'], iv_id=iv['id'], variant=variant)
        else: await self.check_free(tag + ' 結束', fb0, err0)
        self.tx = None; self.seat_pending = False; self.study_on = False; self.guide_on = None; self.mid_reload = False; self.meet_zone = None
        return menus

    async def iv_done(self, ivid):
        ivs = await self.pg.evaluate(INVS_JS, self.pid)
        return any(x['state'] == 'done' for x in ivs if x['id'] == ivid)

    async def campus_date(self, tag, s0, opt, walk_variant=True):
        """手機約（或當面約好以後）的校園約會整場：從 s0（約之前）→ 手機約 → 回覆 → 時間快到 → 出發 → 演完；換分支重跑"""
        R, pg = self.R, self.pg
        await self.load(snap=s0, why='%s：約之前' % tag)
        iv = await self.phone_invite(tag + ' 約', opt)
        if not iv: return
        await self.shift_to(tag, iv['day'], iv['h'] - 0.45)
        go = await pg.evaluate(SNAP_JS)
        plan = SeqPlan(items=[{'when': '^直接過去', 'pick': '^直接過去'}])
        menus = await self.meet_go(tag, None, iv, plan)
        if walk_variant: await self.meet_go(tag + ' 自己走過去', go, iv, SeqPlan(), walk=True)
        if iv.get('study') and str(iv['zone']).startswith('library'):
            for vt in STUDY_VARIANTS:
                await self.meet_go('%s X207-%s' % (tag, {'full': '二樓滿了', 'reload': '帶路途中讀檔'}.get(vt, vt)), go, iv, SeqPlan(items=[{'when': '^直接過去', 'pick': '^直接過去'}]), variant=vt)
        br = branch_list(menus, '自己走過去|直接過去')[:DATE_BRANCH_MAX]
        R.note('%s：見面那一場的選單 %d 個，換選項重跑 %d 次' % (tag, len(menus), len(br)))
        for mi, oi, t in br:
            forced = {j: menus[j]['pick'] for j in range(mi)}; forced[mi] = oi
            sp = SeqPlan(forced, items=[{'when': '^直接過去', 'pick': '^直接過去'}])
            sp.forced_sig = {'|'.join(menus[j]['opts']): menus[j]['pick'] for j in range(mi)}; sp.forced_sig['|'.join(menus[mi]['opts'])] = oi
            await self.meet_go('%s 分支%d-%d「%s」' % (tag, mi, oi, t[:8]), go, iv, sp, record=False)

    async def phone_invite(self, tag, opt):
        """手機 朋友 → 訊息 → 約：照 opt（PRED_JS 的一列）選分類、地點、時間；改期＝答應那個時間。回傳那一筆約（accepted）或 None"""
        R, pg = self.R, self.pg
        fb0, err0 = await self.base_marks()
        if not await self.open_thread(tag): await L.close_panels(pg, self.cdp); return None
        if not await L.tap(pg, self.cdp, '#phoneBody [data-inv="%s"]' % self.pid):
            why = await pg.evaluate("(id=>INV.whyNot?INV.whyNot(GAME.G,id):'')", self.pid); await L.close_panels(pg, self.cdp)
            R.info('%s：對話串沒有「約」' % tag, why); return None
        await pg.wait_for_timeout(1200)
        i0 = {x['id'] for x in await pg.evaluate(INVS_JS, self.pid)}
        items = [{'when': '^' + re.escape(opt['cat']), 'pick': '^' + re.escape(opt['cat'])}] if opt.get('cat') else []
        items += [{'when': '^' + re.escape(opt['verb']) + '$', 'pick': '^' + re.escape(opt['verb']) + '$'}, {'when': re.escape(opt['t']), 'pick': re.escape(opt['t'])}, {'when': '^好，就', 'pick': '^好，就'}]
        ok, s, m, lines = await self.drive(Plan(items), tag)
        R.note('%s（%s %s，預期 %s）台詞：%s' % (tag, opt['verb'], opt['t'], opt['res'], J(lines[-5:])))
        self.last_invite_lines = list(lines)   # CC-C 11-04：答應的那一句在手機對話裡（「林芷若（手機）｜「afar？好。……」」），不在 GAME.G.msgs——給 GG_shops2 的答應句檢查用
        if not R.check('%s：手機約一路點得完' % tag, ok, why_not_free(s)): await self.dump(tag, s); return None
        await self.check_free(tag + ' 回覆之後', fb0, err0)
        new = [x for x in await pg.evaluate(INVS_JS, self.pid) if x['id'] not in i0]
        acc = [x for x in new if x['state'] == 'accepted']
        if not acc: R.info('%s：沒有約成（%s）' % (tag, J(new)), J(lines[-2:])); return None
        P = await pg.evaluate("(pid=>{ const P=INV.place(pid); return P?{study:INV.catsOf(P).includes('study'), zone:P.zone}:null; })", acc[-1]['place'])
        iv = dict(acc[-1]); iv['study'] = bool(P and P['study']); R.check('%s：約成（%s %s %.2f）' % (tag, iv['place'], iv['day'], iv['h']), True)
        return iv

    async def step_phone_date(self):
        """使用者 11-04：「你也要測試用手機跟其他角色約會的對話」「還有實際約會進行」"""
        R, pg = self.R, self.pg
        rel = REL['POSSIBLE_ROMANTIC_INTEREST'] if self.info['date'] else REL['FRIEND']
        setup = {'met': True, 'rel': rel, 'relUp': 4, 'ladEnd': True, 'contact': True}
        if self.info['econ']: d = await pg.evaluate("(()=>{ const T=CALENDAR.termDays('Y0S1'); for(let x=T.from+21;x<T.to;x++){ const w=CALENDAR.dateOf(x).wd%7; if(w>=1&&w<=5) return x; } return T.from+21; })()")
        else: d = await pg.evaluate("(()=>{ for(let x=STORY.dayOfKey('2025-10-07');;x++){ const w=CALENDAR.dateOf(x).wd%7; if(w>=1&&w<=5) return x; } })()")
        await self.load(self.base(d, 9.0, 'campus', {'x': 30, 'z': 30, 'yaw': 0}), why='phone_date：平日早上在校園（今天還有很多時段可以約）')
        await self.setup(setup, '前置：%s、有聯絡方式' % ('第 5 階' if self.info['date'] else '朋友（FRIEND）'))
        await self.reload_same('套用關係以後重讀')
        if not await self.check_free('phone_date 開始前'): return
        s0 = await pg.evaluate(SNAP_JS)
        pred = await pg.evaluate(PRED_JS, self.pid)
        R.note('phone_date：手機約得到的地點×時間（照 INV.decide 預測她的回答）%d 種：%s' % (len(pred), J([[p['verb'], p['t'], p['res']] for p in pred[:24]])))
        if not pred: return R.skip('phone_date', '手機約不到任何地點（%s）' % (await pg.evaluate("(id=>INV.whyNot?INV.whyNot(GAME.G,id):'')", self.pid)))
        acc = [p for p in pred if p['res'] == 'accept']
        near = sorted([p for p in acc if p['day'] == d], key=lambda p: p['h'])
        cases = []
        if near and not STUDY_ONLY: cases.append(('今天最近', near[0]))
        st = [p for p in acc if p['study']]
        st.sort(key=lambda p: (0 if str(p['zone']).startswith('library') else 1, p['day'], p['h']))
        if st and (not cases or st[0]['pid'] != cases[0][1]['pid']): cases.append(('念書', st[0]))
        elif not st: R.info('phone_date：沒有她會答應的「念書」地點×時間')
        if not cases and acc and not STUDY_ONLY: cases.append(('最近', sorted(acc, key=lambda p: (p['day'], p['h']))[0]))
        for lab, opt in cases:
            await self.campus_date('phone_date %s（%s）' % (lab, opt['verb']), s0, opt, walk_variant=(lab != '念書'))
        if STUDY_ONLY: return
        # 改期、她沒空、我說算了、錢不夠：各一次，只看收尾
        for res, lab in (('resched', '她改期'), ('decline', '她沒空')):
            o = next((p for p in pred if p['res'] == res), None)
            if not o: R.info('phone_date %s：預測不到會%s的地點×時間（不測）' % (lab, lab)); continue
            await self.load(snap=s0, why='phone_date %s' % lab)
            iv = await self.phone_invite('phone_date %s（%s %s）' % (lab, o['verb'], o['t']), o)
            if res == 'resched' and iv: R.check('phone_date 她改期：答應她給的時間以後約成', iv['state'] == 'accepted', J(iv))
        await self.load(snap=s0, why='phone_date 我說算了')
        if await self.open_thread('phone_date 我說算了') and await L.tap(pg, self.cdp, '#phoneBody [data-inv="%s"]' % self.pid):
            fb0, err0 = await self.base_marks()
            ok, s, m, l = await self.drive(Plan([{'when': '算了', 'pick': '^算了$'}]), 'phone_date 我說算了')
            if R.check('phone_date 我說算了：收尾正常', ok, why_not_free(s)): await self.check_free('phone_date 我說算了', fb0, err0)
            else: await self.dump('phone_date_算了', s)
        else: await L.close_panels(pg, self.cdp)
        if self.info['date']:
            await self.load(snap=s0, why='phone_date 錢不夠')
            await pg.evaluate("(()=>{ GAME.G.money=0; })()"); R.setup('phone_date 錢不夠：G.money＝0')
            if await self.open_thread('phone_date 錢不夠') and await L.tap(pg, self.cdp, '#phoneBody [data-inv="%s"]' % self.pid):
                fb0, err0 = await self.base_marks()
                ok, s, m, l = await self.drive(Plan([{'when': '^出去玩', 'pick': '^出去玩'}]), 'phone_date 錢不夠')
                seen = any('錢不夠' in x for mm in m for x in mm['opts']) or any('錢不夠' in x for x in l) or any('錢不夠' in x for x in (await pg.evaluate("(window.__CCMONEY||[])")))
                if R.check('phone_date 錢不夠：收尾正常', ok, why_not_free(s)): await self.check_free('phone_date 錢不夠', fb0, err0)
                else: await self.dump('phone_date_錢不夠', s)
                R.check('phone_date 錢不夠：選項看得到「錢不夠」的原因', seen, J([[o + ('（灰）' if d else '') for o, d in zip(mm['opts'], mm.get('dim') or [])] for mm in m]))
            else: await L.close_panels(pg, self.cdp)
            # 能出去玩的：手機約一次校外約會、整場演完
            await self.load(snap=s0, why='phone_date 出去玩')
            await self.phone_flow('phone_date 出去玩', setup, plan_date=True, go=True)

    # ================================================================ X207 驗收（INV-SIT-TOGETHER-1104，909c729a6／v9.10.20；對照 c2232eb6c；BB 11-04 02:16）
    def study_reset(self):
        self.lead_mode = 'follow'; self.lead_last = None; self.lead_log = []; self.f1_info = False; self.lead_phone = False; self.lead_phone_res = None
        self.phone_log = []; self.lead_seen = False; self.seats_noted = False; self.lead_reload_chk = None
        self.seat_try = 0; self.seat_tapped = False; self.seat_why = None; self.seat_at = None; self.lead_r3b = False; self.r3b_lead = None

    async def mark(self):
        self.mk = await self.pg.evaluate(MARK_JS)

    async def lead_q(self):
        return await self.pg.evaluate(LEAD_JS, {'id': self.pid, 'iv': self.lead_iv})

    async def iv_state(self, ivid):
        x = [v for v in await self.pg.evaluate(INVS_JS, self.pid) if v['id'] == ivid]
        return x[0]['state'] if x else None

    async def lead_note(self, q):
        """記帶路的每一個階段；INFO 7：她在大廳一樓（lv0）找座位（這一版只找二樓，不判 FAIL）"""
        iv = q.get('iv') or {}; L_ = iv.get('lead') or {}
        if q['zone'] == 'library_hall' and not self.seats_noted:
            self.seats_noted = True; self.R.note('總圖大廳的座位數（不含有名字的位子）：%s' % J(await self.pg.evaluate(LIBSEATS_JS)))
        if not L_: return
        self.lead_seen = True
        k = (q['zone'], L_.get('ph'), J(L_.get('her')))
        if k != self.lead_last:
            self.lead_last = k; self.lead_log.append({'zone': q['zone'], 'ph': L_.get('ph'), 'her': L_.get('her'), 'hour': q['hour']})
            self.R.note('帶路：%s' % J({'zone': q['zone'], 'ph': L_.get('ph'), 'her': L_.get('her'), 'me': L_.get('me'), 'look': L_.get('look'), 'n': q.get('n')}))
            if q['zone'] == 'library_hall' and L_.get('her') and (L_['her'].get('lv') or 0) == 0 and not self.f1_info:
                self.f1_info = True; self.R.info('INFO 7：她在總圖大廳一樓（lv0）找座位（大廳一樓有座位，這一版只找二樓；只記錄、不判 FAIL）', J(L_.get('her')))

    async def follow_lead(self, tag):
        """約念書她帶路（iv.lead）：玩家像真人一樣跟著走（L.go_to：點地面、走不動才推搖桿；追她現在的位置，她坐下以後走到她的位子旁邊）；
        二樓坐滿以後一起走去三樓（iv.state going、iv.zone＝library）：走到那一區的門（二樓東側樓梯間）按互動。
        回傳 'busy'（有劇情開始了）／'gone'（那一筆約已經不是 accepted／going）／'moved'／'idle'"""
        R, pg = self.R, self.pg
        s = await self.st()
        if s['ch'] or s['dlg'] or s['dlgVis'] or s['depth'] or s['busy']: return 'busy'
        if s['phone'] or s['menu'] or s['bigmap']:
            if s['phone']: self.phone_log.append({'zone': s['zone'], 'hour': s['hour'], 'where': 'follow', 't': time.time()})
            await L.close_panels(pg, self.cdp); return 'idle'
        q = await self.lead_q(); iv = q.get('iv')
        if not iv or iv['state'] not in ('accepted', 'going'): return 'gone'
        await self.lead_note(q)
        stop = lambda x: bool(x['dlg'] or x['choices'] or x['busy'])
        if iv['state'] == 'going' and iv['zone'] != q['zone']:
            if self.lead_mode == 'stay': return 'idle'
            ex = await pg.evaluate(EXIT_JS, iv['zone'])
            if not ex: return 'idle'
            R.note('%s：一起走去 %s：走到「%s」（lv%d）' % (tag, iv['zone'], ex['label'], ex['lv']))
            await L.go_to(pg, self.cdp, GoRun(R), ex['x'], ex['z'], 1.0, '往 %s 的門（%s）' % (iv['zone'], ex['label']), max_s=WALK_S, lv=ex['lv'], stop=stop)
            s = await self.st()
            if s['interact'] and not (s['dlg'] or s['ch'] or s['depth']):
                R.note('%s：按「%s」' % (tag, s['interact'])); await L.tap(pg, self.cdp, '#interact'); await pg.wait_for_timeout(6000)
            return 'moved'
        L_ = iv.get('lead')
        if not L_: return 'idle'
        if self.mid_reload == 'lead' and L_.get('ph') == 'go' and not self.mid_reloaded:
            self.mid_reloaded = True
            R.setup('%s：X207 ⑥ 帶路途中（iv.lead.ph＝go，她正走向座位）GAME.snapshot→applySave（＝存檔再讀檔）' % tag)
            await self.load(snap=await pg.evaluate(SNAP_JS), why='帶路途中')
            q2 = await self.lead_q(); iv2 = q2.get('iv') or {}
            self.lead_reload_chk = R.check('%s：X207 ⑥ 讀回來以後那一筆約還在帶路（iv.lead 有值、她在旁邊）' % tag, bool(iv2.get('lead')) and iv2.get('state') == 'accepted' and bool(q2.get('n')),
                                           J({'iv': iv2, 'n': q2.get('n')}))
            return 'moved'
        if self.lead_phone and self.lead_phone_res is None and L_.get('ph') in ('go', 'wait'):
            self.lead_phone_res = await self.phone_cancel_probe('%s 帶路途中' % tag)
            return 'moved'
        if self.lead_mode == 'stay': return 'idle'
        if self.lead_mode == 'seat': return await self.seat_approach(tag, q, L_, stop)
        if self.lead_r3b and self.r3b_lead is None and L_.get('ph') in ('go', 'wait'):
            self.r3b_lead = await self.auto_phone_check('%s 帶路途中' % tag); return 'moved'
        if self.lead_mode == 'leave':
            ex = await pg.evaluate(EXIT_JS, 'campus')
            if not ex: R.info('%s：找不到離開這一區的門' % tag); self.lead_mode = 'stay'; return 'idle'
            R.note('%s：帶路途中走出去（%s）' % (tag, ex['label']))
            await L.go_to(pg, self.cdp, GoRun(R), ex['x'], ex['z'], 1.0, ex['label'], max_s=WALK_S, lv=ex['lv'], stop=stop)
            s = await self.st()
            if s['interact'] and not (s['dlg'] or s['ch'] or s['depth']): await L.tap(pg, self.cdp, '#interact'); await pg.wait_for_timeout(6000)
            if (await self.st())['zone'] != q['zone']: self.lead_mode = 'stay'
            return 'moved'
        n = q.get('n')
        if not n: return 'idle'
        tx, tz, tlv = n['x'], n['z'], n['lv']
        if L_.get('ph') == 'wait' and L_.get('her'): tx, tz, tlv = L_['her']['x'], L_['her']['z'], L_['her']['lv']
        if q['plv'] == tlv and math.hypot(tx - q['px'], tz - q['pz']) <= 1.7: return 'idle'
        await L.go_to(pg, self.cdp, GoRun(R), tx, tz, 1.7, '跟著%s（%s）' % (self.info['name'], L_.get('ph')), max_s=45, lv=tlv, stop=stop)
        return 'moved'

    async def cancel_menus(self, tag, max_s=60):
        """手機的「約」打開的選單一路選「算了／返回」；回傳 {'reopened': 手機有沒有自己再打開, 'menus': [...]}"""
        pg = self.pg; out = {'reopened': None, 'menus': []}; t0 = time.time(); free_since = None
        await pg.wait_for_timeout(800)
        while time.time() - t0 < max_s:
            s = await self.st()
            if s['ch']:
                T = [o['t'] for o in s['ch']]; k = next((i for i, t in enumerate(T) if re.search(CANCEL_RX, t)), len(T) - 1)
                out['menus'].append({'opts': T, 'pick': k}); await self.tap_choice(k); await pg.wait_for_timeout(900); free_since = None; continue
            if s['dlg'] or s['dlgVis']: await L.tap(pg, self.cdp, '#dlg'); await pg.wait_for_timeout(650); free_since = None; continue
            if s['phone'] and s['depth'] == 0: out['reopened'] = True; break
            if is_free(s):
                if free_since is None: free_since = time.time()
                if time.time() - free_since >= 4: out['reopened'] = False; break
            await pg.wait_for_timeout(400)
        if (await self.st())['phone']: await L.close_panels(pg, self.cdp)
        return out

    async def phone_cancel_probe(self, tag):
        """手機 朋友 → 訊息 → 約 → 算了：game3d.js 的回呼會不會自己再打開手機（909c729a6：問 INV.phoneBack；對照組一律 openPhone('msg')）"""
        R, pg = self.R, self.pg
        pb = await pg.evaluate("(()=>{ try{ return (typeof INV!=='undefined'&&typeof INV.phoneBack==='function')?INV.phoneBack(GAME.G):'沒有 INV.phoneBack'; }catch(e){ return 'err '+e; } })()")
        out = {'phoneBack': pb, 'tapped': False, 'reopened': None}
        if not await self.open_thread(tag): await L.close_panels(pg, self.cdp); return out
        if not await L.tap(pg, self.cdp, '#phoneBody [data-inv="%s"]' % self.pid):
            out['why'] = await pg.evaluate("(id=>INV.whyNot?INV.whyNot(GAME.G,id):'')", self.pid); await L.close_panels(pg, self.cdp)
            R.note('%s：對話串沒有「約」%s' % (tag, J(out))); return out
        out['tapped'] = True; r = await self.cancel_menus(tag); out.update(r)
        R.note('%s：手機約 → 算了 %s' % (tag, J(out)))
        return out

    async def study_prep(self, late=False, shift=None, reload_after=False):
        if shift is None: shift = STUDY_SHIFT
        """共同前置：平日 09:00 校園 → 手機約總圖念書 →（reload_after：回標題 → 繼續）→ 時間快到；回傳 (iv, 出發前的存檔, 約之前的存檔)；同一個人同一組參數只做一次"""
        key = (late, shift, reload_after)
        if key in self.sprep: return self.sprep[key]
        R, pg = self.R, self.pg; self.sprep[key] = (None, None, None)
        rel = REL['POSSIBLE_ROMANTIC_INTEREST'] if self.info['date'] else REL['FRIEND']
        if self.info['econ']: d = await pg.evaluate("(()=>{ const T=CALENDAR.termDays('Y0S1'); for(let x=T.from+21;x<T.to;x++){ const w=CALENDAR.dateOf(x).wd%7; if(w>=1&&w<=5) return x; } return T.from+21; })()")
        else: d = await pg.evaluate("(()=>{ for(let x=STORY.dayOfKey('2025-10-07');;x++){ const w=CALENDAR.dateOf(x).wd%7; if(w>=1&&w<=5) return x; } })()")
        await self.load(self.base(d, 9.0, 'campus', {'x': 30, 'z': 30, 'yaw': 0}), why='study：平日早上在校園（手機約總圖念書）')
        await self.setup({'met': True, 'rel': rel, 'relUp': 4, 'ladEnd': True, 'contact': True}, '前置：%s、有聯絡方式' % ('第 5 階' if self.info['date'] else '朋友（FRIEND）'))
        await self.reload_same('套用關係以後重讀')
        if not await self.check_free('study 開始前'): return self.sprep[key]
        s0 = await pg.evaluate(SNAP_JS)
        pred = await pg.evaluate(PRED_JS, self.pid)
        st = [p for p in pred if p['res'] == 'accept' and p['study'] and str(p['zone']).startswith('library')]
        R.note('study：她會答應的總圖念書時段 %s' % J([[p['t'], p['h']] for p in st[:12]]))
        if late:
            lt = [p for p in st if 20.5 <= p['h'] <= 21.75]
            self.close_short = not lt
            if lt: st = lt
            else: R.info('study 閉館：約不到 20:30～21:45 的總圖念書（改用【前置／捷徑】讀檔到接近閉館）', J([p['h'] for p in st[:12]]))
        st.sort(key=lambda p: (0 if p['day'] == d else 1, p['day'], p['h']))
        if not st: R.info('study：沒有她會答應的總圖念書時段', J(pred[:8])); return self.sprep[key]
        opt = st[0]
        iv = await self.phone_invite('study 手機約念書（%s %s）' % (opt['verb'], opt['t']), opt)
        if not iv: return self.sprep[key]
        self.sinv[key] = await pg.evaluate(SNAP_JS)   # 約好以後、還沒跳時間（study_changed 從這裡改約）
        if reload_after:
            used = await self.title_continue('study_phone_reload')
            ivs = await pg.evaluate(INVS_JS, self.pid)
            if not R.check('study_phone_reload：讀回來（%s）以後約還在（accepted）' % used, any(x['id'] == iv['id'] and x['state'] == 'accepted' for x in ivs), J(ivs)): return self.sprep[key]
            if not await self.check_free('study_phone_reload 讀回來'): return self.sprep[key]
        await self.shift_to('study', iv['day'], iv['h'] - shift)
        if IVLOG: R.note('IVLOG 存檔那一刻（shift %.2f h）：%s' % (shift, J(await pg.evaluate(IVRAW_JS, self.pid))))
        go = await pg.evaluate(SNAP_JS)
        self.sprep[key] = (iv, go, s0)
        return self.sprep[key]

    async def title_continue(self, tag):
        """像玩家：選單 → 回標題 → 繼續；按不到才用 GAME.snapshot→applySave（印出來）。回傳用了哪一種"""
        pg = self.pg; used = 'title'
        await L.tap(pg, self.cdp, '#btnMenu'); await pg.wait_for_timeout(1200)
        if await L.tap(pg, self.cdp, '#btnTitle'):
            await pg.wait_for_timeout(2500)
            if await pg.evaluate("!document.getElementById('titleScreen').classList.contains('hide')") and await L.tap(pg, self.cdp, '#btnContinue'): await pg.wait_for_timeout(9000)
            else: used = None
        else: used = None
        if not used:
            await L.close_panels(pg, self.cdp); await self.reload_same('%s：選單「回標題」→「繼續」按不到，改用 GAME.snapshot→applySave（同「繼續」）' % tag); used = 'snapshot'
        await L.close_panels(pg, self.cdp)
        self.R.note('%s：讀回來（%s）' % (tag, '標題「繼續」' if used == 'title' else 'snapshot→applySave'))
        return used

    async def study_load(self, tag, iv, go):
        await self.load(snap=go, why='%s：約好、時間快到的那一刻' % tag)
        self.study_reset(); self.lead_iv = iv['id']; self.study_on = True; self.guide_on = None; self.mid_tag = tag; self.seat_pending = False; self.tx = None
        await self.mark()

    def study_off(self):
        self.study_on = False; self.lead_mode = 'follow'; self.lead_phone = False; self.mid_reload = False

    async def study_tail(self, tag):
        """每一項最後：風險 5（兩個選單互搶，還沒修：只記錄）"""
        x = await self.pg.evaluate("(n=>(window.__CCX||[]).slice(n))", self.mk.get('x', 0))
        if x: self.R.info('%s：風險 5（兩個選單互搶，還沒修，只記錄）前一個選單還沒選完又開了一個 %d 次' % (tag, len(x)), J(x[:4]))
        else: self.R.note('%s：風險 5：這一段沒有看到兩個選單同時開（GAME.choose 沒有重疊）' % tag)
        self.study_off()

    async def study_scene(self, tag, iv, done=None):
        """從 study_load 以後：等「直接過去」→ 到場 → 跟著她 → 演完（done 成立）；回傳 run_scene 的結果"""
        plan = SeqPlan(items=[{'when': '^直接過去', 'pick': '^直接過去'}])
        return await self.run_scene(tag, plan, done=done or (lambda: self.iv_done(iv['id'])), first_wait=STUDY_WAIT_S, phases=12)

    async def study_go(self, step, variant=None, **kw):
        iv, go, s0 = await self.study_prep(**kw)
        if not iv: return self.R.skip(step, '手機約不到總圖念書（見上面的 INFO）')
        await self.meet_go('%s 總圖念書' % step, go, iv, SeqPlan(items=[{'when': '^直接過去', 'pick': '^直接過去'}]), variant=variant)
        await self.study_tail(step)

    async def step_study_x207(self):
        await self.study_go('study_x207')

    async def step_study_f3(self):
        await self.study_go('study_f3', 'full')

    async def step_study_reload_lead(self):
        await self.study_go('study_reload_lead', 'reload')

    async def step_study_phone_reload(self):
        await self.study_go('study_phone_reload', None, reload_after=True)

    async def step_study_r2(self):
        """風險 2：演完她解凍、回到原本的作息"""
        R, pg, tag = self.R, self.pg, 'study_r2'
        iv, go, s0 = await self.study_prep()
        if not iv: return R.skip(tag, '手機約不到總圖念書')
        await self.study_load(tag, iv, go); fb0, err0 = await self.base_marks()
        ok, m, l, s = await self.study_scene(tag, iv)
        if not R.check('%s：見面一路演完' % tag, ok and await self.iv_done(iv['id']), why_not_free(s) + ' ' + J(await pg.evaluate(INVS_JS, self.pid))): await self.dump(tag, s); return self.study_off()
        await pg.wait_for_timeout(3000); r = await pg.evaluate(NPCST_JS, self.pid)
        # 11-13 BB-C（BB_255）：演完她已經離開這一區（npc 不在場、作息在別處）＝已經走了＝PASS，不是 FAIL
        gone = (not r['npc']) and isinstance(r.get('where'), dict) and r['where'].get('zone') not in (None, r.get('zone'))
        R.check('%s：演完她解凍（n.frozen＝false，不再停在劇情狀態；人已經走了也算）' % tag, gone or (r['npc'] and not r['frozen']), J(r))
        if r['nseat'] and r['keep']: R.info('%s：她還坐著，但作息本來就在這裡（%s），S.release 照舊讓她坐' % (tag, J(r['where'])))
        else: R.check('%s：演完她起身（不黏在座位上；人已經走了也算）' % tag, gone or (r['npc'] and not r['nseat']), J(r))
        await self.check_free(tag + ' 結束', fb0, err0)
        await self.her_after(tag, True)
        await self.study_tail(tag)

    async def step_study_r3(self):
        """風險 3：帶路途中、演完 30 秒內，手機不會自己打開；改天不丟沒接住的 promise rejection"""
        R, tag = self.R, 'study_r3'
        iv, go, s0 = await self.study_prep()
        if not iv: return R.skip(tag, '手機約不到總圖念書')
        await self.study_load(tag, iv, go); self.lead_phone = True
        ok, m, l, s = await self.study_scene(tag, iv)
        t_end = time.time()
        if not R.check('%s：見面一路演完' % tag, ok and await self.iv_done(iv['id']), why_not_free(s)): await self.dump(tag, s)
        else:
            r2 = await self.phone_cancel_probe('%s 演完 30 秒內' % tag); dt = time.time() - t_end
            if not r2['tapped']: R.info('%s：演完以後手機對話串沒有「約」，改看 INV.phoneBack' % tag, J(r2)); R.check('%s：演完 30 秒內 INV.phoneBack＝false（手機不自己打開）' % tag, r2['phoneBack'] is False, J(r2))
            elif dt > 30: R.info('%s：演完到按完「算了」花了 %.0f 秒（超過 30 秒，不判）' % (tag, dt), J(r2))
            else: R.check('%s：演完 30 秒內手機約 → 算了，手機不會自己再打開（%.0f 秒）' % (tag, dt), r2['reopened'] is False, J(r2))
        a = self.lead_phone_res
        if a is None: R.check('%s：帶路途中手機約 → 算了，手機不會自己再打開' % tag, False, '沒有看到帶路（iv.lead 一直沒有值；對照組沒有這個功能）%s' % J(self.lead_log))
        elif not a['tapped']: R.check('%s：帶路途中 INV.phoneBack＝false（手機不自己打開）' % tag, a['phoneBack'] is False, J(a))
        else: R.check('%s：帶路途中手機約 → 算了，手機不會自己再打開' % tag, a['reopened'] is False, J(a))
        if self.phone_log: R.info('%s：途中手機自己打開過 %d 次（STORY.phoneAuto 照設定關著：PHONE_AUTO=%s）' % (tag, len(self.phone_log), PHONE_AUTO), J(self.phone_log[:4]))
        await self.study_tail(tag)
        await self.resched(tag, s0)

    async def resched(self, tag, s0):
        """她約你 → 手機按「改天」→ INV.flow（自己選時間）：照常一次、注入例外一次；都不能有沒接住的 promise rejection"""
        R, pg = self.R, self.pg
        for inj in (False, True):
            t = '%s 改天%s' % (tag, '（注入例外）' if inj else '')
            await self.load(snap=s0, why='%s：約之前' % t)
            o = await pg.evaluate(OFFER_JS, self.pid)
            R.setup('%s：INV.offer 讓她約你明天 15:00 去總圖念書（遊戲給事件用的 API）→ %s' % (t, J(o)))
            if not o or o.get('err'): R.info('%s：INV.offer 沒有成功，不測' % t, J(o)); return
            fb0, err0 = await self.base_marks(); mk = await pg.evaluate(MARK_JS)
            await L.tap(pg, self.cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
            sel = '#phoneBody [data-ans="%s|later"]' % o['id']; hit = False
            for opener in ('thread', 'msg'):
                if opener == 'thread':
                    await L.tap(pg, self.cdp, '#phoneTabs [data-ptab="friends"]'); await pg.wait_for_timeout(1200); await L.tap(pg, self.cdp, '#phoneBody [data-msg="%s"]' % self.pid)
                else:
                    await L.tap(pg, self.cdp, '#phoneTabs [data-ptab="msg"]'); await pg.wait_for_timeout(1200)
                await pg.wait_for_timeout(1200)
                if await pg.evaluate("(s=>!!document.querySelector(s))", sel): hit = True; break
            if not hit:
                R.info('%s：手機裡找不到這一筆的「改天」按鈕' % t, (await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''"))[:300]); await L.close_panels(pg, self.cdp); return
            if inj:
                R.setup('%s：【前置／捷徑：注入例外】INV.flow 下一次呼叫回傳 rejected promise（測 game3d.js 改天那一條有沒有 .catch）' % t); await pg.evaluate(INJ_FLOW_JS)
            await L.tap(pg, self.cdp, sel)
            r = await self.cancel_menus(t)
            await pg.wait_for_timeout(2000)
            if (await self.st())['phone']: await L.close_panels(pg, self.cdp)
            mk2 = await pg.evaluate(MARK_JS)
            rej = await pg.evaluate("(n=>(window.__CCE||[]).filter(e=>String(e).startsWith('rejection')).slice(n))", mk['r'])
            called = await pg.evaluate("window.__CCFLOW||0") if inj else None
            if inj and not called: R.info('%s：按「改天」以後沒有呼叫 INV.flow（noFlow？）注入沒觸發' % t, J(r))
            R.check('%s：沒有沒接住的 promise rejection（unhandledrejection）' % t, mk2['r'] == mk['r'], J({'rejection': rej, 'menus': r.get('menus'), 'flow': called}))
            await self.check_free(t, fb0, None)

    async def step_study_r4(self):
        for at in R4_AT: await self.study_r4_one(at)

    async def step_study_r4_sitAt(self):
        await self.study_r4_one('sitAt')

    async def step_study_r4_libStay(self):
        await self.study_r4_one('libStay')

    async def study_r4_one(self, at):
        """風險 4：見面時出錯 → 兩個人都起身、D.busyDepth 回 0、這一次約會 cancelled（at：sitAt＝開演坐下那一刻；libStay＝見面內容裡）"""
        R, pg, tag = self.R, self.pg, 'study_r4_%s' % at
        iv, go, s0 = await self.study_prep()
        if not iv: return R.skip(tag, '手機約不到總圖念書')
        await self.study_load(tag, iv, go)
        if at == 'libStay':
            has = await pg.evaluate(INJ_LIBSTAY_JS)
            R.setup('%s：【前置／捷徑：注入例外】INV.libStay（兩個人坐下、坐下旁白和她的一句以後，S.meet 裡一起讀書的那一段）丟例外%s' % (tag, '' if has else '——這一版沒有 INV.libStay（對照組），注入不會觸發'))
        else:
            await pg.evaluate(INJ_SIT_JS, True)
            R.setup('%s：【前置／捷徑：注入例外】GAME.sitAt 在「玩家坐下」那一次（原本的 sitAt 做完、兩個人都坐著）丟例外。909c729a6：S.leadScene 的第二個 GM.sitAt（玩家坐她旁邊），'
                '在 S.meet 把約記成 done 以前、在 S.leadGo 的 .catch(S.unwind) 保護範圍內；對照組 c2232eb6c：S.startTogether 的 GM.sitAt(P,pr.me)，外面是 S.autoStart 的 .catch(console.warn)' % tag)
        fb0, err0 = await self.base_marks()
        endst = ('cancelled', 'done', 'missed')
        async def ended():
            return (await self.iv_state(iv['id'])) in endst and is_free(await self.st())
        ok, m, l, s = await self.study_scene(tag, iv, done=ended)
        inj = await pg.evaluate("window.__CCINJ||0"); await pg.evaluate(INJ_SIT_JS, False)
        if not R.check('%s：注入的例外有觸發（%s）' % (tag, '玩家在見面那一刻坐下' if at == 'sitAt' else '見面內容裡的 INV.libStay'), bool(inj), J({'lead': self.lead_log[-4:], 'iv': await pg.evaluate(INVS_JS, self.pid)})): return self.study_off()
        t0 = time.time(); r = await pg.evaluate(NPCST_JS, self.pid)
        while time.time() - t0 < STUCK_S and (r['depth'] or r['pseat'] or r['nseat'] or r['fade']):
            await pg.wait_for_timeout(700); r = await pg.evaluate(NPCST_JS, self.pid)
        st = await self.iv_state(iv['id'])
        con = [x for x in await pg.evaluate("(window.__CCC||[]).slice(-60)") if 'CC 注入' in x or 'INV.' in x][-4:]
        R.note('%s：出錯以後 %s；console：%s' % (tag, J(r), J(con)))
        R.check('%s：出錯以後玩家起身' % tag, not r['pseat'], J(r))
        R.check('%s：出錯以後她起身、解凍（不坐著、frozen＝false）' % tag, not r['nseat'] and not r['frozen'], J(r))
        R.check('%s：出錯以後 D.busyDepth 回到 0、沒有停在淡出' % tag, r['depth'] == 0 and not r['fade'], J(r))
        R.check('%s：這一次約會記成 cancelled' % tag, st == 'cancelled', J(await pg.evaluate(INVS_JS, self.pid)))
        await self.check_free(tag + ' 出錯之後', fb0, None)
        await self.study_tail(tag)

    async def auto_phone_check(self, tag, still_s=5.0):
        """【前置／捷徑】PHONE.post 一則要回覆的訊息（ask）→ 玩家停下來不動 still_s 秒 → 手機有沒有自己打開（STORY.phoneAuto：停 1.5 秒就會開）"""
        R, pg = self.R, self.pg; t0 = time.time(); s = await self.st()
        while time.time() - t0 < 15 and s['path']:   # 先等人物停下來（路線走完）
            await pg.wait_for_timeout(500); s = await self.st()
        if s['ch'] or s['dlg'] or s['dlgVis'] or s['depth']: return {'skipped': '要放訊息的時候已經有劇情開始了'}
        pb = await pg.evaluate("(()=>{ try{ return (typeof INV!=='undefined'&&typeof INV.phoneBack==='function')?INV.phoneBack(GAME.G):'沒有 INV.phoneBack'; }catch(e){ return 'err '+e; } })()")
        m = await pg.evaluate(POSTASK_JS, {'id': self.pid, 'text': '（CC 測試訊息）你現在在哪？'})
        R.setup('%s：PHONE.post 一則她傳來、要回覆的訊息（ask）→ %s；接著玩家停著不動 %.0f 秒' % (tag, J(m), still_s))
        opened = False; t1 = time.time(); why = ''
        while time.time() - t1 < still_s:
            s = await self.st()
            if s['phone']: opened = True; break
            if s['ch'] or s['dlg'] or s['dlgVis'] or s['depth']: why = '停著的時候有劇情開始了'; break
            await pg.wait_for_timeout(400)
        out = {'opened': opened, 'still': round(time.time() - t1, 1), 'phoneBack': pb, 'post': m, 'zone': s['zone'], 'hour': s['hour']}
        if why: out['why'] = why
        if opened: await L.close_panels(pg, self.cdp)
        R.note('%s：%s' % (tag, J(out)))
        return out

    async def step_study_r3b(self):
        """風險 3（phoneAuto）：phoneAuto 照遊戲原本開著；帶路途中、演完 30 秒內，有要回覆的訊息、玩家停著不動，手機也不能自己打開"""
        R, pg, tag = self.R, self.pg, 'study_r3b'
        iv, go, s0 = await self.study_prep()
        if not iv: return R.skip(tag, '手機約不到總圖念書')
        self.pa_force = True
        try:
            await self.study_load(tag, iv, go)
            R.note('%s：STORY.phoneAuto 照遊戲原本開著（這一項不關）' % tag)
            self.lead_r3b = True; fb0, err0 = await self.base_marks()
            ok, m, l, s = await self.study_scene(tag, iv)
            t_end = time.time()
            if not R.check('%s：見面一路演完' % tag, ok and await self.iv_done(iv['id']), why_not_free(s)): await self.dump(tag, s)
            else:
                b = await self.auto_phone_check('%s 演完以後' % tag); dt = time.time() - t_end
                if b.get('skipped') or b.get('why'): R.info('%s：演完以後沒辦法停著觀察' % tag, J(b))
                else:
                    R.check('%s：演完 30 秒內有要回覆的訊息、停著 ≥3 秒，手機不會自己打開（演完後 %.0f 秒）' % (tag, dt), not b['opened'] and dt <= 30, J(b))
                    if not b['opened']:   # 對照：30 秒以後 phoneAuto 應該照常打開（不然上面的 PASS 只是 phoneAuto 沒作用）
                        opened = False
                        while time.time() - t_end < 45:
                            s = await self.st()
                            if s['phone']: opened = True; break
                            if s['ch'] or s['dlg'] or s['depth']: break
                            await pg.wait_for_timeout(500)
                        R.check('%s：對照：演完 30 秒以後同一則訊息會讓手機打開（phoneAuto 有作用，上面那一項才算數）' % tag, opened, '演完後 %.0f 秒' % (time.time() - t_end))
                        if opened: await L.close_panels(pg, self.cdp)
            a = self.r3b_lead
            if a is None: R.check('%s：帶路途中有要回覆的訊息、停著 ≥3 秒，手機不會自己打開' % tag, False, '沒有看到帶路（iv.lead 一直沒有值；對照組沒有這個功能）%s' % J(self.lead_log))
            elif a.get('skipped') or a.get('why'): R.info('%s：帶路途中沒辦法停著觀察' % tag, J(a))
            else: R.check('%s：帶路途中有要回覆的訊息、停著 ≥3 秒，手機不會自己打開' % tag, not a['opened'], J(a))
            await self.check_free(tag + ' 結束', fb0, None)
        finally:
            self.pa_force = False
        await self.study_tail(tag)

    async def seat_approach(self, tag, q, L_, stop):
        """study_seatMeet：她坐下以後不走近她（leadTick 2 m），走到同一張桌子對面／斜對面有「坐下讀書」的空位，從離她 ≥2.15 m 的那一側按「坐下」（S.seatMeet）"""
        R, pg = self.R, self.pg
        her = L_.get('her')
        if not her or self.seat_tapped: return 'idle'
        if self.seat_try >= 3:
            self.seat_why = self.seat_why or '換了 3 個位子都按不到「坐下」'; self.lead_mode = 'follow'; return 'idle'
        if self.seat_at is None:
            c = await pg.evaluate(SEATPICK_JS, {'her': her})
            if not c:
                self.seat_why = '她 2.25 m 內沒有能從 ≥2.15 m 外按「坐下」的空位'; self.lead_mode = 'follow'; R.info('%s：%s' % (tag, self.seat_why), J(her)); return 'idle'
            self.seat_at = c[min(self.seat_try, len(c) - 1)]
            R.note('%s：座位選單：選她 %.2f m 外的空位 %s，先走到外側再進來' % (tag, self.seat_at['d'], J(self.seat_at)))
            await L.go_to(pg, self.cdp, GoRun(R), self.seat_at['wx'], self.seat_at['wz'], 0.6, '空位外側', max_s=WALK_S, lv=self.seat_at['lv'], stop=stop)
            return 'moved'
        c = self.seat_at
        if q['plv'] != c['lv'] or math.hypot(q['px'] - c['px'], q['pz'] - c['pz']) > 0.45:
            await L.go_to(pg, self.cdp, GoRun(R), c['px'], c['pz'], 0.35, '空位旁邊（離她 ≥2.15 m）', max_s=90, lv=c['lv'], stop=stop)
            return 'moved'
        if L_.get('ph') != 'wait': return 'idle'   # 她還沒坐下
        s = await self.st()
        if s['interact'] and '坐' in s['interact']:
            R.note('%s：按「%s」（離她 %.2f m）' % (tag, s['interact'], math.hypot(q['px'] - her['x'], q['pz'] - her['z'])))
            self.seat_tapped = True; await L.tap(pg, self.cdp, '#interact'); await pg.wait_for_timeout(1500); return 'moved'
        R.note('%s：互動鍵是「%s」，換一個位子' % (tag, s['interact'])); self.seat_try += 1; self.seat_at = None
        return 'moved'

    async def step_study_seatMeet(self):
        await self.study_go('study_seatMeet', 'seatmeet')

    async def step_study_changed(self):
        """她改約（state changed）→ 手機按「好」／「那就下次」→ 舊的時間不開演、沒有帶路；「好」＝新的時間照 X207 演完"""
        R, pg, tag = self.R, self.pg, 'study_changed'
        iv, go, s0 = await self.study_prep()
        snv = self.sinv.get((False, 0.45, False))
        if not iv or not snv: return R.skip(tag, '手機約不到總圖念書')
        for ans in CHANGED_ANS:
            t = '%s %s' % (tag, ans)
            await self.load(snap=snv, why='%s：手機約好以後（還沒到時間）' % t)
            self.study_reset(); self.lead_iv = iv['id']; await self.mark()
            c = await pg.evaluate(CHANGE_JS, {'iv': iv['id']})
            R.setup('%s：INV.change（遊戲自己的改約函式，events3d.js 的 inviteChange 用它）她問能不能改時間 → %s' % (t, J(c)))
            if not c or c.get('err') or not c.get('to'): R.info('%s：改約沒有成功，不測' % t, J(c)); continue
            await L.tap(pg, self.cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
            sel = '#phoneBody [data-ans="%s|c:%s"]' % (iv['id'], ans); hit = False
            for opener in ('thread', 'msg'):
                if opener == 'thread':
                    await L.tap(pg, self.cdp, '#phoneTabs [data-ptab="friends"]'); await pg.wait_for_timeout(1200); await L.tap(pg, self.cdp, '#phoneBody [data-msg="%s"]' % self.pid)
                else:
                    await L.tap(pg, self.cdp, '#phoneTabs [data-ptab="msg"]')
                await pg.wait_for_timeout(1500)
                if await pg.evaluate("(s=>!!document.querySelector(s))", sel): hit = True; break
            if not R.check('%s：手機看得到改約的「%s」按鈕' % (t, '好' if ans == 'ok' else '那就下次'), hit, (await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''"))[:300]):
                await L.close_panels(pg, self.cdp); continue
            await L.tap(pg, self.cdp, sel); await pg.wait_for_timeout(1500)
            if (await self.st())['phone']: await L.close_panels(pg, self.cdp)
            v = next((x for x in await pg.evaluate(INVS_JS, self.pid) if x['id'] == iv['id']), None)
            want = ('accepted', c['to']['day'], c['to']['h']) if ans == 'ok' else ('cancelled',)
            got = (v['state'], v['day'], v['h']) if (v and ans == 'ok') else ((v['state'],) if v else None)
            R.check('%s：回了以後那一筆約是 %s' % (t, '新的時間 accepted' if ans == 'ok' else 'cancelled'), got == want, J({'iv': v, 'to': c['to']}))
            # 舊的時間：人在總圖大廳等，看會不會開演、帶路
            await L.tap(pg, self.cdp, '#btnPhone'); await pg.wait_for_timeout(1000); await L.tap(pg, self.cdp, '#phoneTabs [data-ptab="places"]'); await pg.wait_for_timeout(1200)
            await cc_phone.reveal(pg, self.cdp, 'library_hall')
            went = await L.tap(pg, self.cdp, '[data-place^="library_hall|"]'); await pg.wait_for_timeout(8000); await L.close_panels(pg, self.cdp)
            s = await self.st()
            if s['ch'] or s['dlg'] or s['depth']: ok, s, mm, ll = await self.drive(Plan(), t + ' 路上')
            if s['zone'] != 'library_hall': R.info('%s：沒有走到總圖大廳（手機「地點」%s），舊時間的檢查不做' % (t, '按了' if went else '沒有這個按鈕'), s['zone']); continue
            await self.shift_to(t, iv['day'], iv['h'] - 0.3)
            lead_old = False; done_old = False; t0 = time.time(); seen = []
            while time.time() - t0 < 400:
                s = await self.st()
                if s['day'] * 24 + s['hour'] >= iv['day'] * 24 + iv['h'] + 0.6: break
                q = await self.lead_q(); x = q.get('iv') or {}
                if x.get('lead'): lead_old = True
                if x.get('state') == 'done': done_old = True
                if s['ch'] or s['dlg'] or s['dlgVis'] or s['depth']:
                    seen.append(s['text'][:30]); ok, s, mm, ll = await self.drive(Plan(), t + ' 舊的時間')
                    x = (await self.lead_q()).get('iv') or {}
                    if x.get('state') == 'done': done_old = True
                    continue
                await pg.wait_for_timeout(2000)
            R.check('%s：舊的時間（%s %.2f）到了，在總圖大廳不會開演、也沒有帶路' % (t, iv['day'], iv['h']), not lead_old and not done_old,
                    J({'lead': lead_old, 'done': done_old, 'iv': x, 'dialog': seen[:4], 'hour': s['hour']}))
            if ans == 'ok':
                ivd = dict(iv); ivd['day'] = c['to']['day']; ivd['h'] = c['to']['h']; ivd['study'] = True
                await self.shift_to(t, ivd['day'], ivd['h'] - 0.45)
                await self.meet_go('%s 新的時間' % t, None, ivd, SeqPlan(items=[{'when': '^直接過去', 'pick': '^直接過去'}]))
            else:
                R.check('%s：那就下次＝沒有新的時間、約保持 cancelled' % t, await self.iv_state(iv['id']) == 'cancelled', J(await pg.evaluate(INVS_JS, self.pid)))
            await self.study_tail(t)

    async def step_study_r6(self):
        """風險 6：早到時「約好的是 …，還早。」只出現一次"""
        R, pg, tag = self.R, self.pg, 'study_r6'
        iv, go, s0 = await self.study_prep(shift=1.0)
        if not iv: return R.skip(tag, '手機約不到總圖念書')
        await self.study_load(tag, iv, go); fb0, err0 = await self.base_marks()
        await L.tap(pg, self.cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
        await L.tap(pg, self.cdp, '#phoneTabs [data-ptab="today"]'); await pg.wait_for_timeout(1200)
        went = await L.tap(pg, self.cdp, '#phoneBody [data-invgo="%s"]' % iv['id'])
        R.note('%s：手機「今天」→「前往」%s' % (tag, '按了' if went else '沒有這個按鈕（改等「直接過去」的提醒）'))
        await pg.wait_for_timeout(8000); await L.close_panels(pg, self.cdp)
        a = await self.st(); early = a['zone'] == iv['zone'] and a['hour'] < iv['h'] - 0.25
        R.note('%s：到的時候 %s %.2f（約 %.2f）' % (tag, a['zone'], a['hour'], iv['h']))
        ok, m, l, s = await self.study_scene(tag, iv)
        T = await pg.evaluate("(n=>(window.__CCT||[]).slice(n))", self.mk.get('t', 0))
        E_ = [x for x in T if '還早' in x['t']]
        if not R.check('%s：見面一路演完' % tag, ok and await self.iv_done(iv['id']), why_not_free(s)): await self.dump(tag, s)
        if early or E_: R.check('%s：早到提示（toast「約好的是 …，還早。」或 b85e1afc1 起的旁白字幕「（約好的是 …。還早。…）」）只出現一次' % tag, len(E_) == 1, J({'early_toasts': E_, 'arrive': [a['zone'], a['hour']], 'iv_h': iv['h']}))
        else: R.info('%s：沒有早到（到的時候 %s %.2f），不判' % (tag, a['zone'], a['hour']), J(T[-6:]))
        await self.check_free(tag + ' 結束', fb0, err0)
        await self.study_tail(tag)

    async def step_study_abandon(self):
        for k in ABANDON: await self.study_abandon_one(k)

    async def step_study_abandon_leave(self):
        await self.study_abandon_one('leave')

    async def step_study_abandon_timeout(self):
        await self.study_abandon_one('timeout')

    async def step_study_abandon_close(self):
        await self.study_abandon_one('close')

    async def study_abandon_one(self, kind):
        """作罷三種：走出那一區（leave）、帶路超過 2 小時（timeout）、閉館（close）→ 那一筆 cancelled、跳一則訊息、不卡住"""
        R, pg = self.R, self.pg; tag = 'study_abandon %s' % kind
        iv, go, s0 = await self.study_prep(late=(kind == 'close'))
        if not iv: return R.skip(tag, '手機約不到總圖念書')
        await self.study_load(tag, iv, go)
        self.lead_mode = 'leave' if kind == 'leave' else 'stay'
        fb0, err0 = await self.base_marks(); nmsg0 = (await self.lead_q())['nmsg']
        plan = SeqPlan(items=[{'when': '^直接過去', 'pick': '^直接過去'}])
        t0 = time.time(); short = False; zone0 = None
        while time.time() - t0 < ABANDON_WAIT_S:
            st = await self.iv_state(iv['id'])
            if st not in ('accepted', 'going'): break
            s = await self.st()
            if s['ch'] or s['dlg'] or s['dlgVis'] or s['depth']:
                ok, s, mm, ll = await self.drive(plan, tag, max_s=300)
                if not ok: R.check('%s：途中的對話沒有卡住' % tag, False, why_not_free(s)); await self.dump(tag, s); break
                continue
            q = await self.lead_q(); L_ = (q.get('iv') or {}).get('lead')
            if L_:
                await self.lead_note(q)
                if zone0 is None: zone0 = q['zone']
            if L_ and not short and ((kind == 'timeout' and ABANDON_FAST) or (kind == 'close' and self.close_short)):
                short = True; snap = json.loads(await pg.evaluate(SNAP_JS))
                ivh = next((v.get('h') for v in snap.get('invites', []) if v.get('id') == iv['id']), None)
                if kind == 'timeout':
                    nh = round(float(ivh) + 1.92, 3); why = '帶路開始（iv.h＝%.3f）後 1h55m：存檔的時間改到 %.3f' % (ivh, nh)
                else:
                    nh = 21.9; why = '接近閉館：存檔的時間改到 21:54、那一筆約的 iv.h 改成 21.85（不然先碰到「超過 2 小時」）'
                    for v in snap.get('invites', []):
                        if v.get('id') == iv['id']: v['h'] = 21.85
                snap['hour'] = nh
                R.setup('%s：【前置／捷徑】帶路途中 %s' % (tag, why))
                await self.load(snap=json.dumps(snap), why=why); continue
            r = await self.follow_lead(tag)
            if r == 'gone': break
            if r != 'moved': await pg.wait_for_timeout(2000)
        st = await self.iv_state(iv['id']); a = await self.st()
        if st in ('accepted', 'going'):   # 時間到了還沒作罷：把剩下的對話點完，免得影響下一項
            R.note('%s：等了 %d 秒還是 %s（%s %.2f）' % (tag, ABANDON_WAIT_S, st, a['zone'], a['hour']))
        msgs = [m for m in await pg.evaluate(MSGS_JS, {'n': nmsg0, 'id': self.pid}) if '作罷' in (m.get('text') or '')]
        T = [x for x in await pg.evaluate("(n=>(window.__CCT||[]).slice(n))", self.mk.get('t', 0)) if '作罷' in x['t']]
        R.check('%s：帶路途中作罷（那一筆約 cancelled）' % tag, self.lead_seen and st == 'cancelled',
                J({'lead_seen': self.lead_seen, 'state': st, 'zone': a['zone'], 'hour': a['hour'], 'lead_zone': zone0, 'lead': self.lead_log[-3:]}) + ('' if self.lead_seen else '（一直沒有帶路：對照組沒有這個功能，到了就直接開演）'))
        R.check('%s：跳一則訊息（G.msgs 多一則「……後來作罷了。」）' % tag, bool(msgs), J(msgs))
        has_t = await pg.evaluate("(()=>{ try{ return typeof INV.leadDrop==='function'&&/toast/.test(String(INV.leadDrop)); }catch(e){ return false; } })()")
        if has_t: R.check('%s：畫面上有提示（toast「……後來作罷了。」）' % tag, bool(T), J(T))   # 03713452b 起 INV.leadDrop 會 toast＋phoneBadge
        elif T: R.info('%s：畫面上也有提示' % tag, J(T))
        else: R.info('%s：畫面上沒有提示（這一版 INV.leadDrop 只寫進 G.msgs，沒有 toast；只記錄）' % tag)
        r = await pg.evaluate(NPCST_JS, self.pid)
        if r['npc']: R.info('%s：她作罷以後的狀態' % tag, J(r))
        s = await self.st()
        if s['ch'] or s['dlg'] or s['dlgVis'] or s['depth']:
            ok, s, mm, ll = await self.drive(Plan(), tag + ' 之後')
        await self.check_free(tag + ' 之後', fb0, err0)
        await self.study_tail(tag)

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


async def roster(pw, people):
    """手機「朋友」→「約」看得到誰（照 game3d.js friendsHTML 同一個判斷：INV.whyNot 空、有聯絡方式、INV.canInvite）；前置：全部的人認識、朋友（可攻略的第 5 階）、有聯絡方式"""
    b, ctx, pg, cdp, errs = await L.launch(pw, landscape=True)
    try:
        await pg.goto(URL)
        if not await L.wait_loaded(pg): print('ROSTER：遊戲沒載入'); return
        d = await pg.evaluate("STORY.dayOfKey('2025-10-08')")
        st = {'name': '祐廷', 'flags': dict(BASEF), 'day': d, 'hour': 9.0, 'zone': 'campus', 'pos': {'x': 30, 'z': 30, 'yaw': 0}, 'weather': 'clear', 'stage': 'law', 'money': 30000}
        print('  [前置／捷徑] ROSTER：讀檔 2025-10-08 09:00 校園，條件事件關閉；所有人設成認識、朋友（可攻略第 5 階）、有聯絡方式', flush=True)
        await pg.evaluate(LOAD_JS, {'st': st, 'quiet': True, 'phoneAuto': False, 'fixWd': True}); await pg.wait_for_timeout(5000)
        await pg.evaluate(SETALL_JS, [i for i in await pg.evaluate("Object.keys(CHARACTERS)") if not i.startswith('prof_')])
        rows = await pg.evaluate(ROSTER_JS)
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200); await L.tap(pg, cdp, '#phoneTabs [data-ptab="friends"]'); await pg.wait_for_timeout(1500)
        ui = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-msg]')].map(b=>b.dataset.msg)")
        can = [r for r in rows if r['can']]
        print('ROSTER 手機能約（%d 人）：%s' % (len(can), J([[r['id'], r['name'], '可出去玩' if r['date'] else ''] for r in can])), flush=True)
        print('ROSTER 不能約：%s' % J([[r['id'], r['name'], r['why']] for r in rows if not r['can']]), flush=True)
        print('ROSTER 朋友頁有「訊息」的 %d 人；這次 CASES 不在能約名單的：%s' % (len(ui), J([p for p in people if p not in [r['id'] for r in can]])), flush=True)
    finally:
        await b.close()


async def main():
    os.makedirs(OUT, exist_ok=True)
    people = cases(); results = []
    print('CASES=%s STEPS=%s LAD_TERMS=%s LAD_MAX=%s MENU_MAX=%s STUCK_S=%s QUICK=%s PHONE_AUTO=%s' % (J(people), J(STEPS), J(LAD_TERMS), LAD_MAX, MENU_MAX, STUCK_S, QUICK, PHONE_AUTO), flush=True)
    async with async_playwright() as pw:
        if 'phone_date' in STEPS and ROSTER:
            await roster(pw, people)
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
