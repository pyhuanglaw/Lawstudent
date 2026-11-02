"""CC（帳號 A）11-02：第五批 10 張 ADV 2D 底圖（開發分支 63f00030＝第 1～5 張、78ebf658＝第 6～10 張）在遊戲裡的畫面——
  ① 對話框（字幕框）有沒有擋到底圖的重點；② 直向（390×844）、橫向（844×390）手機模擬的裁切。
探針只「客觀記錄＋截圖」：好不好看、重點有沒有被擋，由人看截圖判斷（不寫死「全部通過」）。
check 只有三種：事件真的演出來（遊戲的 OUT.go／EVENTS.run／JP.playStop 收到那一件，而且畫面到了那一張底圖、對話框開著）、
  背景是那張圖（#advBg 實際算出來的 background-image＝assets/bg/<id>.webp、#adv 是 image 不是 dark）、截圖檔存在。

底圖怎麼顯示（src/adv3d.js）：#adv（position:fixed; inset:0）裡的 #advBg，background-size:cover、background-position:center——
  原圖 1672×941（16:9）。橫向 844×390 寬度貼滿、上下各裁一點；直向 390×844 高度貼滿、左右裁掉很多（只看得到中間大約四分之一寬）。
  探針照 #advBg 實際的 computed style 和圖的原始尺寸算：看得到原圖的哪一塊（百分比）、對話框（#dlg）／選項（#choices）／地點字幕（#caption）／
  立繪（#advL／#advR）蓋住畫面幾 %、蓋在原圖的哪個範圍（百分比）。印成 note，也寫進 <輸出資料夾>/cc_bg5_measure.json。

每一張底圖、每一個方向的截圖：
  NN_<id>_<land|port>_first_dlg.png    到了那一張底圖、第一句對話開著（真的在事件裡）
  NN_<id>_<land|port>_first_bgonly.png 同一刻，暫時把網頁上其他元素（對話框、選項、字幕、立繪、HUD、紀錄／略過鍵）設成透明＝只有底圖【捷徑：只為比較】
  NN_<id>_<land|port>_first_bgbox.png  只有底圖＋虛線框標出剛才對話框／選項／立繪／字幕的位置（框上寫蓋住畫面幾 %）
  <id>_<land|port>_first_cropmap.png   示意圖（不是遊戲截圖）：用量到的數字畫在原圖上——暗掉的是被裁掉看不到的部分，紅框＝對話框、黃＝立繪、藍＝選項、青＝字幕
  另外（有的話）：NN_<id>_<方向>_cap_dlg.png＝地點字幕還在的那一刻；NN_<id>_<方向>_spk_dlg.png＋cropmap＝往下點到第一句有人說話（立繪出來）的那一刻
  遊戲本身沒有「關掉對話框」的按鈕（#advTop 只有「紀錄」「略過對話」），所以只有底圖的那一張是暫時改 DOM 透明度拍的，拍完馬上還原。

直向、橫向：預設 ORIENT=both＝同一頁、同一句對話，先拍橫向，再 page.set_viewport_size 切到直向（等 1.8 秒＋兩個 animation frame 讓版面重排；
  #rotate.want 還在就拿掉，同 playlib.load_state），拍完切回橫向。ORIENT=land／port＝整個瀏覽器 context 一開始就是那個方向、只拍那個方向
  （要「直向、橫向各開一個 context」就跑兩次：ORIENT=land 一次、ORIENT=port 一次，輸出資料夾分開）。

怎麼讓事件演出來（每一張開一個新的瀏覽器）：
  【前置】最小存檔（GAME.defaults＋過了開場的旗標，同 cc_dl04b_probe.py 的 state_at；給第三個參數或 SAVE＝使用者存檔.json 就改用那份改日期）
    讀到那件事真實會發生的日期、時間、地點；出遊型的事件（9 張）把「已經約好的那一趟出遊」直接放進存檔的 G.outings
    （＝玩家之前已經回了「好」／答應了；id、時間、地點、車程照程式裡排出遊那一行原樣抄）。讀檔時條件事件、手機自動打開先關（QUIET=1，
    playlib quiet_events：避免別的事件搶先演；目標事件走 OUT.go／JP 據點，不經過 EVENTS.tick）。
  之後照玩家：等遊戲自己跳出「出發：……」→ 點（OUT.tick 的 S.prompt；日本據點是選單裡的「出發：……」）；別的對話點過去；別的選單不點。
    日本報到（jp_intl_office）不用點：JP.SCH g1_office 3/27 10:00 到了，據點自己演。
  【捷徑】PROMPT_S 秒內沒有自己開演（例：那天別的強制劇情、選單擋住 OUT.tick）→ void OUT.go(GAME,q)（日本：JP.goOut／JP.playStop）直接出發，
    印出原因與當時畫面上的選單。用 void＝不等 Promise（page.evaluate 會等 Promise）。
  到了以後：底圖換成那一張之前的對話（例：沛珊那趟先在台中車站接人）照玩家點過去；到了那一張、第一句打完字（連續兩次讀到同一句）就拍。

10 張（id：事件／程式；真實條件；探針的日期時間）：
  gym_pool       ev_sis16_swim（src/data/sis_b16_events.js:104；排程 src/sis_b16_3d.js:85-91 SISB16.SWIM_OUT）
                 真實：法律系、和學姊交往中，2029-05-11 21:00 學姊私訊、回「好。」→ 5/12（六）07:00 新體育館。探針：2029-05-12 06:36 宿舍＋那一趟出遊。
  ziqing_studio  ev_ziqing_studio_night（src/v6b_3d.js:221；V6B.zqPhone 205-216）
                 真實：2028-11-10（五）18:00 子晴私訊（法律系、在臺灣、ZQ_CONTRACT 有值、ZQ_Q15 沒值、沒交往、不是前任、朋友以上、有聯絡方式、她單身在臺北）
                 → 回「好」→ 21:00 工作室（late 0.25）。探針：2028-11-10 20:18 宿舍＋出遊；ZQ_STUDIO_GO:'yes'。
  tc_schoolroad  hometown_lines.js schoolroad（HV.play，src/hometown3d.js:63、74；出遊 ev_hv_ps，src/data/events.js:1405）
                 真實：寒暑假沛珊在台中（STORY.presence kind 'home'）→ 手機「我去台中找妳？」→ 排 10:30 那一趟；那天第二次以後（HV_N≥1）、
                 PS_SCHOOLROAD 有值且不是 'walked'（之前送行時她說過「下次來，我帶你去我國中走路上學那條路。」）→ 台中車站接人以後先走這條路。
                 探針：2026-07-21（大一暑假）09:18 宿舍＋出遊；HV_N.classmate_peishan=1、PS_SCHOOLROAD＝30 天前。先經過 tc_station 的接人兩句（照玩家點過去）。
  court_hall     ev_pool_zjw_court（src/pool3d.js:228-229；台詞 src/data/pool_story.js:127 court）
                 真實：大一下第 3～10 週平日早上在傅鐘，和曾靖雯（pool_7）有點熟、答應「我跟妳去。」→ POOL.courtDay：下一個 13:30～16:30 沒課的平日 14:00。
                 探針：大一下第 4 週週三（Y1S2 週三下午沒課）13:27 宿舍＋出遊。
  radio_room     ev_pool_jy_radio（src/pool_more3d.js:169、240 planRadio；台詞 src/data/pool_story_b2.js:77 radio）
                 真實：徐靜儀（pool_13）2-5，大二上第 10 週邀（椰林大道當面或手機 pool_jy_invite）→ 那週週四 20:00 廣播社的錄音間。探針：Y2S1 第 10 週週四 19:33。
  welfare_room   ev_pool_sce_tutor（src/pool_more3d.js:171、264-265 acceptSce；台詞 src/data/pool_story_b2.js:135 tutor）
                 真實：蘇維倫（pool_19；AA_527 1-7 由「蘇承恩」改名）4-3，大一下第 3～12 週在社科院圖書館答應 → 下一個週六 10:00 社福中心。探針：Y1S2 第 5 週週六 09:27。
  phil_cafe      ev_pool_lyx_cafe（src/pool_more3d.js:176、379 planCafe；台詞 src/data/pool_story_b4.js:90 cafe）
                 真實：廖芸萱（pool_15）3-3，大一下第 12～15 週文學院當面或手機邀 → 週四 19:00 文學院的教室。探針：Y1S2 第 13 週週四 18:33。
  psy_lab        ev_hxh_subject（src/sup519_3d.js:206；SUP519.hxhPhone 197-204）
                 真實：大二上第 8～12 週，和黃筱涵（npc_huangxh）有點熟＋有聯絡方式，週一 21:00 她私訊、回「好。」→ 週四 15:00 心理系實驗室。探針：Y2S1 第 9 週週四 14:36。
  jp_eatery      ev_jp_dinner（src/data/jp_events.js:63、137；JP.dinnerPhone src/jp3d.js:224-231）
                 真實：日本路線、人在日本，2028-06-09 21:00 以安私訊（交往中，或 FRIEND 以上且不是冷靜中）、回「好。」→ 6/10（六）18:30。
                 探針：2028-06-10 18:06 jp_hub（日本據點）＋出遊；EXCHANGE_ROUTE JP、JP_DEPARTED 3/25、AN_JP_DINNER_ASK yes。據點選單的「出發：……」照玩家點。
  jp_intl_office ev_jp_office（src/data/jp_events.js:26、133；JP.SCH g1_office src/jp3d.js:112）
                 真實：日本路線、人在日本，2028-03-27 10:00 到了據點自己演（JP.loop 的 dueStop）。探針：2028-03-27 10:00 jp_hub，等它自己演。
  （沒有交往的最小存檔：學姊游泳、日本兩件的「交往中」那幾句不會出；日本照「挽回中」那一版（jp3d.js rep＝!dat）。只看畫面，不驗台詞。）

不是 iPhone：Playwright 手機模擬（is_mobile、觸控、SwiftShader 1～4 fps），不用 ?turbo 也可以（要更快可以加）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> python3 cc_bg5_probe.py '<URL>/index.html' <輸出資料夾> [使用者存檔.json]
環境變數：ONLY=gym_pool,psy_lab（只跑這幾張）、ORIENT=both|land|port、QUIET=1（0＝讀檔不關條件事件）、SPK=1（0＝不拍有人說話那一句）、
  PROMPT_S（等遊戲自己開演，預設 90）、SCENE_S（開演後等到那一張底圖＋對話框，預設 150）、CASE_MAX（一張最多幾秒，預設 900）、RELAYOUT_MS（切方向後等多久，預設 1800）。
不要和別的瀏覽器測試同時跑（SwiftShader 搶 CPU）。"""
import os, sys, json, asyncio, time, copy, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
ROOT = os.path.dirname(os.path.abspath(os.environ['LW_TESTS']))   # 工作樹根目錄（畫 cropmap 用原圖）
SAVEF = sys.argv[3] if len(sys.argv) > 3 else os.environ.get('SAVE')
SAVE = None
if SAVEF:
    SAVE = json.load(open(SAVEF, encoding='utf-8')); SAVE = SAVE.get('G', SAVE)
J = lambda o: json.dumps(o, ensure_ascii=False)
ONLY = [x.strip() for x in os.environ.get('ONLY', '').split(',') if x.strip()]
ORIENT = os.environ.get('ORIENT', 'both').strip()
QUIET = os.environ.get('QUIET', '1') != '0'
SPK = os.environ.get('SPK', '1') != '0'
PROMPT_S = int(os.environ.get('PROMPT_S', '90'))
SCENE_S = int(os.environ.get('SCENE_S', '150'))
CASE_MAX = int(os.environ.get('CASE_MAX', '900'))
RELAYOUT_MS = int(os.environ.get('RELAYOUT_MS', '1800'))
SPK_TAPS = 6
VP = {'land': {'width': 844, 'height': 390}, 'port': {'width': 390, 'height': 844}}
ONAME = {'land': '橫向 844×390', 'port': '直向 390×844'}

# ---------------------------------------------------------------- 最小存檔（cc_dl04b_probe.py 的 state_at）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}   # 法律系、過了開場；GAME.defaults 的 dating_kexin:true 拿掉
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')
JPF = {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'X1_JP': ('DAY', '2028-02-20'), 'JP_DEPARTED': ('DAY', '2028-03-25'), 'AN_SENDOFF': 'together'}   # tests/jp_semester_unit.js inJapan()

# ---------------------------------------------------------------- 10 張（q＝存檔裡已經約好的出遊，照程式排出遊那一行原樣抄；{d}＝那一天的 day）
CASES = [
    dict(k='gym_pool', kind='outing', ev='ev_sis16_swim', when='2029-05-12', load_h=6.6, zone='dorm', match='游泳',
         q=dict(id='sisb16_swim', ev='ev_sis16_swim', h=7, late=0.5, place='新體育館', title='新體育館（學姊游泳）', travel='走路 約 10 分鐘', travelH=1 / 6, hours=1.5, alarm=True),
         flags={}, src='src/sis_b16_3d.js:86 SISB16.SWIM_OUT'),
    dict(k='ziqing_studio', kind='outing', ev='ev_ziqing_studio_night', when='2028-11-10', load_h=20.3, zone='dorm', match='工作室',
         q=dict(id='v6b_zq_studio', ev='ev_ziqing_studio_night', h=21, late=0.25, place='子晴的工作室', title='子晴的工作室：試玩新關卡', travel='捷運＋公車 約 30 分鐘', travelH=0.5, alarm=True),
         flags={'ZQ_STUDIO_GO': 'yes'}, src='src/v6b_3d.js:215 V6B.zqPhone 的 OUT.plan'),
    dict(k='tc_schoolroad', kind='outing', ev='ev_hv_ps', hv=True, when='2026-07-21', load_h=9.3, zone='dorm', match='台中',
         q=dict(id='hv_classmate_peishan_{d}', ev='ev_hv_ps', h=10.5, late=1, place='台中', title='去台中找沛珊', travel='高鐵約一小時', travelH=1, back='回到臺北。', hv={'id': 'classmate_peishan', 'keep': False}),
         flags={'HV_N': {'classmate_peishan': 1}, 'PS_SCHOOLROAD': ('REL', -30)}, src='src/hometown3d.js:46 HV.ask 的 OUT.plan（travel／travelH 照 hometown_lines.js classmate_peishan）'),
    dict(k='court_hall', kind='outing', ev='ev_pool_zjw_court', when=['Y1S2', 4, 3], load_h=13.45, zone='dorm', match='旁聽',
         q=dict(id='pool_court_{d}', ev='ev_pool_zjw_court', h=14, late=0.5, place='臺北地方法院', title='陪靖雯去旁聽（臺北地方法院 14:00）', travel='捷運 約 20 分鐘', travelH=1 / 3),
         flags={}, src='src/pool3d.js:228 POOL.acceptZjw'),
    dict(k='radio_room', kind='outing', ev='ev_pool_jy_radio', when=['Y2S1', 10, 4], load_h=19.55, zone='dorm', match='廣播社',
         q=dict(id='pool_jy_radio', ev='ev_pool_jy_radio', h=20, late=0.5, place='廣播社的錄音間', title='徐靜儀：廣播社錄音（地下室的錄音間 20:00）', travel='走過去約 10 分鐘', travelH=0.25),
         flags={}, src='src/pool_more3d.js:240 POOL_MORE.planRadio（planOut 預設 late 0.5、走過去約 10 分鐘）'),
    dict(k='welfare_room', kind='outing', ev='ev_pool_sce_tutor', when=['Y1S2', 5, 6], load_h=9.45, zone='dorm', match='課輔',
         q=dict(id='pool_sce_tutor_{d}', ev='ev_pool_sce_tutor', h=10, late=0.5, place='社福中心', title='蘇維倫：週六的課輔（社福中心 10:00）', travel='公車 約 20 分鐘', travelH=1 / 3),
         flags={}, src='src/pool_more3d.js:265 POOL_MORE.acceptSce'),
    dict(k='phil_cafe', kind='outing', ev='ev_pool_lyx_cafe', when=['Y1S2', 13, 4], load_h=18.55, zone='dorm', match='哲學咖啡館',
         q=dict(id='pool_lyx_cafe_{d}', ev='ev_pool_lyx_cafe', h=19, late=0.5, place='文學院', title='廖芸萱：哲學咖啡館（文學院的教室 19:00）', travel='走過去約 10 分鐘', travelH=0.25),
         flags={}, src='src/pool_more3d.js:379 POOL_MORE.planCafe'),
    dict(k='psy_lab', kind='outing', ev='ev_hxh_subject', when=['Y2S1', 9, 4], load_h=14.6, zone='dorm', match='受試者',
         q=dict(id='aa519_hxh', ev='ev_hxh_subject', h=15, late=0.5, place='心理系實驗室', title='當受試者（筱涵）', travel='走過去約 10 分鐘', travelH=1 / 6),
         flags={}, src='src/sup519_3d.js:199 SUP519.hxhPhone 的 OUT.plan'),
    dict(k='jp_eatery', kind='outing', ev='ev_jp_dinner', when='2028-06-10', load_h=18.1, zone='jp_hub', match='小餐館',
         q=dict(id='jp_g7_dinner', ev='ev_jp_dinner', h=18.5, late=0.5, place='日本・學校後面的小餐館', title='和以安：學校後面的小餐館（日本 18:30）', travel='走路約 10 分鐘', travelH=1 / 6),
         flags=dict(JPF, AN_JP_DINNER_ASK='yes'), src='src/jp3d.js:231 JP.dinnerPhone 的 OUT.plan'),
    dict(k='jp_intl_office', kind='jpstop', ev='ev_jp_office', stop='g1_office', when='2028-03-27', load_h=10.0, zone='jp_hub', match='',
         q=None, flags=dict(JPF), src='src/jp3d.js:112 JP.SCH g1_office（2028-03-27 10:00，據點自己演）'),
]

# ---------------------------------------------------------------- 頁面裡的小工具
CLEARP = "(()=>{ if(typeof CLS!=='undefined'&&CLS.clearPending){ CLS.clearPending(); return true; } return false; })()"
HOOK = r"""(()=>{ if(window.__BG5H) return 'again'; window.__BG5H=1; const Lg=window.__BG5=[];
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key,h:+(+GAME.G.hour).toFixed(3),z:GAME.G.zone}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at(),{ms:Math.round(performance.now())}); Lg.push(o); if(Lg.length>4000) Lg.splice(0,1500); }catch(e){} };
  const bgs=b=>typeof b==='string'?b:JSON.stringify(b||null);
  if(typeof OUT!=='undefined'&&OUT.go){ const g0=OUT.go; OUT.go=function(GM,q){ push({k:'out',t:String((q&&q.id)||''),ev:String((q&&q.ev)||'')}); return g0.apply(this,arguments); }; }   /* S.prompt 叫的是 S.go＝同一個物件的屬性：包得到 */
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const r0=EVENTS.run; EVENTS.run=function(ev){ push({k:'ev',t:String((ev&&ev.id)||'')}); return r0.apply(this,arguments); }; }
  if(typeof JP!=='undefined'&&JP.playStop){ const p0=JP.playStop; JP.playStop=function(GM,s,w){ push({k:'stop',t:String((s&&s.k)||''),w:String(w||'')}); return p0.apply(this,arguments); }; }
  if(typeof HV!=='undefined'&&HV.play){ const h0=HV.play; HV.play=function(GM,q){ push({k:'hv',t:String((q&&q.id)||'')}); return h0.apply(this,arguments); }; }
  if(typeof ADV!=='undefined'){
    if(ADV.begin){ const b0=ADV.begin; ADV.begin=function(o){ push({k:'begin',t:bgs(o&&o.background)}); return b0.apply(this,arguments); }; }
    if(ADV.setBg){ const s0=ADV.setBg; ADV.setBg=function(m){ push({k:'setbg',t:bgs(m)}); return s0.apply(this,arguments); }; } }
  const y0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),t:String(t==null?'':t)}); return y0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>((x.t||x.text)||'')).join('｜')}); return c0.apply(this,arguments); };
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(n,t){ push({k:'cap',t:String(t==null?'':t)}); return p0.apply(this,arguments); }; }
  return 'ok'; })()"""
STARTED_JS = r"""(c=>{ const Lg=window.__BG5||[]; const hit=e=>(!!c.qid&&(e.k==='out'||e.k==='hv')&&e.t===c.qid)||(!!c.ev&&e.k==='ev'&&e.t===c.ev)||(!!c.stop&&e.k==='stop'&&e.t===c.stop);
  const f=Lg.filter(hit); return f.length?f.map(e=>({k:e.k,t:e.t,d:e.d,h:e.h})):null; })"""
BGNOW_JS = r"""(k=>{ const a=document.getElementById('adv'), b=document.getElementById('advBg'); if(!a||!b) return {active:false,cls:'',bg:'',target:false};
  const bi=getComputedStyle(b).backgroundImage||'', cls=a.className||'';
  return {active:!!(typeof ADV!=='undefined'&&ADV.active), cls, bg:bi.slice(0,160), target:bi.indexOf('/assets/bg/'+k+'.webp')>=0&&/\bimage\b/.test(cls)&&!/\bdark\b/.test(cls)}; })"""
CAP_JS = r"""(()=>{ const e=document.getElementById('caption'); return (!!e&&!e.classList.contains('hide')&&e.style.opacity!=='0')?(e.textContent||'').trim():''; })()"""
MEASURE_JS = r"""async (k)=>{
  const vis=el=>{ if(!el) return false; if(el.classList&&el.classList.contains('hide')) return false; const c=getComputedStyle(el); if(c.display==='none'||c.visibility==='hidden'||+c.opacity<0.02) return false; const r=el.getBoundingClientRect(); return r.width>1&&r.height>1; };
  const adv=document.getElementById('adv'), bgEl=document.getElementById('advBg'); if(!adv||!bgEl) return {err:'沒有 #adv／#advBg',boxes:[]};
  const VW=innerWidth, VH=innerHeight, cs=getComputedStyle(bgEl), R=bgEl.getBoundingClientRect();
  const m=/url\(["']?([^"')]+)["']?\)/.exec(cs.backgroundImage||''), url=m?m[1]:null, file=url?decodeURI(url.replace(/^.*?\/assets\//,'assets/')):null;
  let nat=null; if(url) nat=await new Promise(res=>{ const i=new Image(); i.onload=()=>res([i.naturalWidth,i.naturalHeight]); i.onerror=()=>res(null); i.src=url; });
  const rot=document.getElementById('rotate');
  const out={vw:VW,vh:VH,orient:VW>VH?'land':'port',advCls:adv.className,file,target:!!file&&file==='assets/bg/'+k+'.webp'&&/\bimage\b/.test(adv.className)&&!/\bdark\b/.test(adv.className),
    cg:/\bcg\b/.test(adv.className),night:/\bnight\b/.test(adv.className),bgSize:cs.backgroundSize,bgPos:cs.backgroundPosition,bgFilter:cs.filter,
    advBg:[R.left,R.top,R.width,R.height].map(v=>+v.toFixed(1)),nat,boxes:[],rotate:!!rot&&getComputedStyle(rot).display!=='none',
    dlgName:((document.getElementById('dlgName')||{}).textContent||'').trim(),dlgText:((document.getElementById('dlgText')||{}).textContent||'').trim().slice(0,80)};
  if(!nat||!R.width||!R.height) return out;
  const iw=nat[0], ih=nat[1], W=R.width, H=R.height, size=String(cs.backgroundSize||'').trim();
  const s=size==='contain'?Math.min(W/iw,H/ih):Math.max(W/iw,H/ih); out.sizeNote=(size==='cover'||size==='contain')?size:'不是 cover／contain（'+size+'），照 cover 算';
  const dw=iw*s, dh=ih*s;
  const pp=(t,free)=>{ if(t==null||t==='center') return free/2; if(/%$/.test(t)) return free*parseFloat(t)/100; if(/px$/.test(t)) return parseFloat(t); if(t==='left'||t==='top') return 0; if(t==='right'||t==='bottom') return free; return free/2; };
  const tk=String(cs.backgroundPosition||'50% 50%').split(',')[0].trim().split(/\s+/);
  const ox=R.left+pp(tk[0],W-dw), oy=R.top+pp(tk.length>1?tk[1]:'center',H-dh);
  const cl=(v,a)=>Math.max(0,Math.min(a,v)), r1=v=>+(+v).toFixed(1);
  const toImg=(x0,y0,x1,y1)=>{ const p=[cl((x0-ox)/s,iw),cl((y0-oy)/s,ih),cl((x1-ox)/s,iw),cl((y1-oy)/s,ih)]; return {px:p.map(v=>Math.round(v)),pct:[p[0]/iw*100,p[1]/ih*100,p[2]/iw*100,p[3]/ih*100].map(r1)}; };
  const V=toImg(0,0,VW,VH);
  out.cover={s:+s.toFixed(4),dw:r1(dw),dh:r1(dh),ox:r1(ox),oy:r1(oy),vis:V,visArea:r1((V.px[2]-V.px[0])*(V.px[3]-V.px[1])/(iw*ih)*100),cut:{left:V.pct[0],right:r1(100-V.pct[2]),top:V.pct[1],bottom:r1(100-V.pct[3])}};
  const add=(label,el)=>{ if(!vis(el)) return; const r=el.getBoundingClientRect(); const x0=cl(r.left,VW), y0=cl(r.top,VH), x1=cl(r.right,VW), y1=cl(r.bottom,VH); if(x1-x0<1||y1-y0<1) return;
    out.boxes.push({label,rect:[r.left,r.top,r.width,r.height].map(r1),view:[x0,y0,x1,y1].map(r1),img:toImg(x0,y0,x1,y1),coverPct:r1((x1-x0)*(y1-y0)/(VW*VH)*100)}); };
  add('dlg',document.getElementById('dlg')); add('choices',document.getElementById('choices')); add('caption',document.getElementById('caption')); add('advTop',document.getElementById('advTop'));
  for(const [lab,sel] of [['spriteL','#advL.show img'],['spriteR','#advR.show img'],['spriteL','#advL.show .ph'],['spriteR','#advR.show .ph']]) for(const el of document.querySelectorAll(sel)) add(lab,el);   /* 立繪：img 元素的框（object-fit:contain，實際畫的人比框窄）*/
  if(out.cg) add('cg',document.getElementById('advCg'));
  for(const id of ['title3','letterT','letterB']) add(id,document.getElementById(id));
  const N=48, bx=out.boxes.filter(b=>b.label!=='advTop'); let hit=0, hitD=0;   /* 合計（取樣，重疊不重複算）：對話框＋選項＋字幕＋立繪…（紀錄／略過鍵不算）*/
  for(let i=0;i<N;i++) for(let j=0;j<N;j++){ const x=(i+0.5)*VW/N, y=(j+0.5)*VH/N; if(bx.some(b=>x>=b.view[0]&&x<b.view[2]&&y>=b.view[1]&&y<b.view[3])) hit++; }
  out.coverAllPct=r1(hit/(N*N)*100);
  return out; }"""
HIDE_JS = r"""(on=>{ const adv=document.getElementById('adv'); if(!adv) return false;
  if(on){ const h=el=>{ if(!el||!el.style||el.dataset.bg5o!==undefined) return; el.dataset.bg5o=el.style.opacity||'-'; el.style.opacity='0'; };
    for(const el of document.body.children){ if(el!==adv&&el.tagName!=='SCRIPT'&&el.tagName!=='STYLE'&&el.id!=='bg5ol') h(el); } for(const el of adv.children){ if(el.id!=='advBg') h(el); } }
  else for(const el of document.querySelectorAll('[data-bg5o]')){ el.style.opacity=el.dataset.bg5o==='-'?'':el.dataset.bg5o; delete el.dataset.bg5o; }
  return true; })"""
OUTLINE_JS = r"""(boxes=>{ let o=document.getElementById('bg5ol'); if(o) o.remove(); if(!boxes||!boxes.length) return 0;
  o=document.createElement('div'); o.id='bg5ol'; o.style.cssText='position:fixed;inset:0;z-index:2147483000;pointer-events:none';
  const C={dlg:'#ff3030',choices:'#3c78ff',caption:'#00d8d8',spriteL:'#ffd000',spriteR:'#ffd000',advTop:'#cccccc',cg:'#ff00ff',title3:'#ff8800',letterT:'#888888',letterB:'#888888'};
  for(const b of boxes){ const d=document.createElement('div'), c=C[b.label]||'#ffffff';
    d.style.cssText='position:absolute;box-sizing:border-box;left:'+b.view[0]+'px;top:'+b.view[1]+'px;width:'+(b.view[2]-b.view[0])+'px;height:'+(b.view[3]-b.view[1])+'px;border:2px dashed '+c+';background:'+c+'22';
    const t=document.createElement('span'); t.textContent=b.label+' '+b.coverPct+'%'; t.style.cssText='position:absolute;left:2px;top:2px;font:11px/1.2 monospace;color:#fff;background:'+c+'cc;padding:1px 4px'; d.appendChild(t); o.appendChild(d); }
  document.body.appendChild(o); return boxes.length; })"""
FALLBACK_JS = r"""(c=>{ const G=GAME.G, notes=[]; if(typeof EVENTS!=='undefined'&&EVENTS.running) notes.push('（注意：別的事件正在演 EVENTS.running='+EVENTS.running+'，EVENTS.run 會直接 return）');
  try{
    if(c.kind==='outing'){ const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,c.qid):null; if(!q) return notes.concat(['存檔裡找不到出遊 '+c.qid]).join('');
      notes.push('出遊原本 state='+q.state); q.state='planned'; q.ask=null;
      if(typeof JP!=='undefined'&&JP.inJapan&&JP.inJapan(G)&&JP.goOut){ void JP.goOut(GAME,q,false); notes.push('；void JP.goOut(GAME,q,false)'); } else { void OUT.go(GAME,q); notes.push('；void OUT.go(GAME,q)'); } }
    else if(c.kind==='jpstop'){ const s=typeof JP!=='undefined'&&JP.SCH?JP.SCH.find(x=>x.k===c.stop):null;
      if(s){ void JP.playStop(GAME,s,'jp'); notes.push('void JP.playStop(GAME,'+c.stop+',jp)'); } else { const ev=STORY_EVENTS.find(e=>e.id===c.ev); if(ev){ void EVENTS.run(ev); notes.push('void EVENTS.run('+c.ev+')'); } else notes.push('找不到 '+c.ev); } }
  }catch(e){ notes.push('例外 '+e.message); }
  return notes.join(''); })"""
EXITS = ('不用了', '算了', '就這樣', '先不要', '先這樣', '沒事', '離開', '取消')
SUMMARY = {}


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


async def resolve(pg, v, d):
    if isinstance(v, tuple) and v and v[0] == 'DAY': return (await P.day_of(pg, v[1]))['d']
    if isinstance(v, tuple) and v and v[0] == 'REL': return d + v[1]
    return v


async def build_state(pg, c):
    """最小存檔（或使用者存檔）改到那一天、那個時間、那一區；出遊型的把約好的那一趟放進 G.outings。回傳 (存檔, 日期資訊, 出遊)"""
    d = await P.day_of(pg, c['when'])
    if SAVE is not None:
        st = copy.deepcopy(SAVE); st.pop('_stuck', None); st.pop('_busy', None)
        st['invites'] = [v for v in st.get('invites', []) if v.get('state') != 'going']
        st['outings'] = [v for v in (st.get('outings') or []) if isinstance(v, dict) and v.get('state') != 'planned']   # 別的約好的出遊拿掉（不然可能先跳別的「出發」）
        F = st.setdefault('flags', {})
    else:
        st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'outings': []}
        F = st['flags'] = dict(BASEF)
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    for fk, fv in (c.get('flags') or {}).items(): F[fk] = await resolve(pg, fv, d['d'])
    st.update(day=d['d'], weekday=d['wd'], hour=c['load_h'], zone=c['zone'], pos=None, weather='clear', stage='law')
    st['money'] = max(st.get('money') or 0, 30000)
    v = st.get('visited') if isinstance(st.get('visited'), dict) else {}
    for z in VISITED: v.setdefault(z, True)
    st['visited'] = v
    q = None
    if c.get('q'):
        q = copy.deepcopy(c['q']); q['id'] = q['id'].format(d=d['d']); q['day'] = d['d']; q.setdefault('state', 'planned'); q.setdefault('ask', None)
        st['outings'] = [x for x in st.get('outings', []) if x.get('id') != q['id']] + [q]
    return st, d, q


async def ts(pg):
    return await P.ts(pg)


async def wait_line(pg, max_s=20):
    """等這一句打完字（連續兩次讀到同一句）或出選項"""
    t0 = time.time(); last = None
    while time.time() - t0 < max_s:
        s = await ts(pg)
        if s['ch']: return s
        if s['dlg'] and s['txt']:
            if s['txt'] == last: return s
            last = s['txt']
        await pg.wait_for_timeout(600)
    return await ts(pg)


async def trigger(pg, cdp, run, c, q):
    """等事件自己開演：出遊＝遊戲跳出「出發：……」→ 點；日本停點＝據點自己演。PROMPT_S 秒內沒有＝【捷徑】直接出發。回傳 (怎麼開演的, STARTED 紀錄)"""
    cinfo = {'qid': q and q['id'], 'ev': c['ev'], 'stop': c.get('stop'), 'kind': c['kind']}
    t0 = time.time(); menus = []; tapped = False; lines = []
    while time.time() - t0 < PROMPT_S:
        st = await pg.evaluate(STARTED_JS, cinfo)
        if st: return ('prompt' if tapped else 'self'), st, menus, lines
        s = await ts(pg)
        if s['phone'] and not s['ch'] and not s['dlg']: await L.phone_away(pg, cdp); continue
        if s['ch']:
            opts = [o['t'] for o in s['ch']]
            kk = next((i for i, o in enumerate(s['ch']) if not o['dim'] and o['t'].startswith('出發') and (not c['match'] or c['match'] in o['t'])), None)
            if kk is not None and not tapped:
                run.note('%s：遊戲自己跳出選單 %s → 點「%s」（像玩家）' % (c['k'], J(opts), opts[kk]))
                await P.tap_choice(pg, cdp, kk); tapped = True; await pg.wait_for_timeout(1500); continue
            if opts not in menus: menus.append(opts); run.note('%s：畫面上有別的選單（不點，等）：%s' % (c['k'], J(opts)))
        elif s['dlg'] and s['txt']:
            if not lines or lines[-1] != [s['name'], s['txt']]: lines.append([s['name'], s['txt']])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue   # 別的對話：照玩家點過去
        await pg.wait_for_timeout(1000)
    s = await ts(pg)
    if s['ch']:
        kk = next((i for i, o in enumerate(s['ch']) if not o['dim'] and o['t'].startswith(EXITS)), None)
        if kk is not None:
            run.setup('【捷徑】的前一步：畫面上的選單 %s 先點「%s」關掉' % (J([o['t'] for o in s['ch']]), s['ch'][kk]['t']))
            await P.tap_choice(pg, cdp, kk); await pg.wait_for_timeout(1500)
    r = await pg.evaluate(FALLBACK_JS, cinfo)
    run.setup('【捷徑】%s：%d 秒內沒有自己開演（%s；遊戲時間 %s）→ %s' % (c['k'], PROMPT_S, '點過「出發」' if tapped else '沒看到「出發」', J(await P.clock(pg)), r))
    await pg.wait_for_timeout(2500)
    return 'fallback', await pg.evaluate(STARTED_JS, cinfo), menus, lines


async def wait_scene(pg, cdp, run, c):
    """開演以後等到底圖換成那一張、第一句打完字（或出選項）。之前的對話（例：台中車站接人）照玩家點過去。回傳 (到了沒, ts, bgnow, 之前點過的句子)"""
    t0 = time.time(); last = None; pre = []; s = None; g = None
    while time.time() - t0 < SCENE_S:
        g = await pg.evaluate(BGNOW_JS, c['k']); s = await ts(pg)
        if g['target']:
            if s['ch']: return True, s, g, pre
            if s['dlg'] and s['txt']:
                if s['txt'] == last: return True, s, g, pre
                last = s['txt']
            await pg.wait_for_timeout(600); continue
        if s['ch']:
            k2, _ = P.pick_of(s['ch'], c.get('picks', ()), decline=False)
            pre.append(['［選項］', J([o['t'] for o in s['ch']]) + ' → ' + s['ch'][k2]['t']]); await P.tap_choice(pg, cdp, k2); await pg.wait_for_timeout(1000); continue
        if s['dlg'] and s['txt']:
            if not pre or pre[-1] != [s['name'], s['txt']]: pre.append([s['name'], s['txt']])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        if s['phone']: await L.phone_away(pg, cdp); continue
        await pg.wait_for_timeout(700)
    return False, s, g, pre


async def set_orient(pg, run, o):
    if pg.viewport_size != VP[o]:
        await pg.set_viewport_size(VP[o]); await pg.wait_for_timeout(RELAYOUT_MS)
    if await pg.evaluate("(()=>{ const r=document.getElementById('rotate'); if(r&&r.classList.contains('want')){ r.classList.remove('want'); return true; } return false; })()"):
        run.setup('[前置] 直向的「請把手機轉成橫向」（#rotate.want）還在 → 拿掉（同 playlib.load_state；玩家點一下就關）')
    await pg.evaluate("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(1))))")


def describe(m):
    """量到的數字 → 一行中文"""
    if not m or m.get('err'): return '量不到：%s' % (m and m.get('err'))
    cv = m.get('cover')
    if not cv: return '底圖 %s 沒有原始尺寸（圖沒載入？）class=%s' % (m.get('file'), m.get('advCls'))
    v = cv['vis']['pct']; ct = cv['cut']
    s = '%s：#advBg %s／%s，原圖 %s，縮放 %.3f；看得到原圖 x %.1f%%～%.1f%%、y %.1f%%～%.1f%%（原圖面積的 %.1f%%；裁掉 左 %.1f%%、右 %.1f%%、上 %.1f%%、下 %.1f%%）' % (
        ONAME.get(m['orient'], m['orient']), m.get('bgSize'), m.get('bgPos'), 'x'.join(map(str, m.get('nat') or [])), cv['s'], v[0], v[2], v[1], v[3], cv['visArea'], ct['left'], ct['right'], ct['top'], ct['bottom'])
    for b in m.get('boxes') or []:
        ip = b['img']['pct']
        s += '；%s 蓋住畫面 %.1f%%（原圖 x %.1f%%～%.1f%%、y %.1f%%～%.1f%%）' % (b['label'], b['coverPct'], ip[0], ip[2], ip[1], ip[3])
    s += '；合計（不含紀錄／略過鍵、重疊不重複算）%.1f%%' % m.get('coverAllPct', 0)
    if m.get('night'): s += '；#adv.night（白天的圖調暗當晚上）'
    if m.get('cg'): s += '；CG 模式（#advCg 蓋在底圖上）'
    if m.get('rotate'): s += '；（#rotate 提示蓋著）'
    s += '；那一句［%s］%s' % (m.get('dlgName') or '旁白', m.get('dlgText') or '')
    return s


def crop_map(k, m, path):
    """示意圖：用量到的數字畫在原圖上（不是遊戲截圖）。暗＝被裁掉看不到；綠框＝看得到的範圍；紅＝對話框、黃＝立繪、藍＝選項、青＝字幕"""
    try:
        from PIL import Image, ImageDraw
    except Exception as e:
        return 'PIL 不能用：%r' % e
    try:
        src = os.path.join(ROOT, 'assets', 'bg', k + '.webp')
        im = Image.open(src).convert('RGBA'); iw, ih = im.size
        nat = m.get('nat') or [iw, ih]; fx, fy = iw / float(nat[0]), ih / float(nat[1])
        sc = lambda p: [int(round(p[0] * fx)), int(round(p[1] * fy)), int(round(p[2] * fx)), int(round(p[3] * fy))]
        ov = Image.new('RGBA', im.size, (0, 0, 0, 0)); dr = ImageDraw.Draw(ov)
        v = sc(m['cover']['vis']['px'])
        for r in ((0, 0, iw, v[1]), (0, v[3], iw, ih), (0, v[1], v[0], v[3]), (v[2], v[1], iw, v[3])):
            if r[2] - r[0] > 0 and r[3] - r[1] > 0: dr.rectangle(r, fill=(0, 0, 0, 165))
        dr.rectangle(v, outline=(0, 255, 0, 255), width=5); dr.text((v[0] + 8, v[1] + 6), 'VISIBLE %s' % m.get('orient'), fill=(0, 255, 0, 255))
        col = {'dlg': (255, 48, 48), 'choices': (60, 120, 255), 'caption': (0, 216, 216), 'spriteL': (255, 208, 0), 'spriteR': (255, 208, 0), 'cg': (255, 0, 255), 'title3': (255, 136, 0)}
        for b in m.get('boxes') or []:
            if b['label'] not in col: continue
            p = sc(b['img']['px']); c = col[b['label']]
            if p[2] - p[0] < 2 or p[3] - p[1] < 2: continue
            dr.rectangle(p, fill=c + (70,), outline=c + (255,), width=4); dr.text((p[0] + 6, p[1] + 4), '%s %.1f%%' % (b['label'].upper(), b['coverPct']), fill=c + (255,))
        Image.alpha_composite(im, ov).convert('RGB').save(path)
        return path
    except Exception as e:
        return '畫不出來：%r' % e


async def shoot_set(pg, run, c, o, tag, rec, bgonly=True):
    """這一個方向：量 → 截圖（對話框開著）→（bgonly）暫時只留底圖拍一張、加虛線框再拍一張 → 還原 → 畫 cropmap"""
    k = c['k']
    await set_orient(pg, run, o)
    m = await pg.evaluate(MEASURE_JS, k)
    await pg.wait_for_timeout(300)
    out = {'measure': m, 'dlg': await run.shot(pg, '%s_%s_%s_dlg' % (k, o, tag))}
    if bgonly:
        try:
            await pg.evaluate(HIDE_JS + '(true)'); await pg.wait_for_timeout(400)
            out['bgonly'] = await run.shot(pg, '%s_%s_%s_bgonly' % (k, o, tag))
            await pg.evaluate(OUTLINE_JS, (m or {}).get('boxes') or []); await pg.wait_for_timeout(250)
            out['bgbox'] = await run.shot(pg, '%s_%s_%s_bgbox' % (k, o, tag))
        finally:
            await pg.evaluate(OUTLINE_JS, None); await pg.evaluate(HIDE_JS + '(false)'); await pg.wait_for_timeout(250)
    if m and m.get('cover'): out['cropmap'] = crop_map(k, m, os.path.join(OUT, '%s_%s_%s_cropmap.png' % (k, o, tag)))
    run.note('%s［%s・%s］%s' % (k, ONAME[o], tag, describe(m)))
    rec.setdefault('shots', {}).setdefault(tag, {})[o] = out
    return out


def exists(p):
    return bool(p) and os.path.exists(p) and os.path.getsize(p) > 0


async def case_run(p, run, c):
    k = c['k']; rec = SUMMARY.setdefault(k, {'ev': c['ev'], 'kind': c['kind'], 'src': c['src']})
    orients = ['land', 'port'] if ORIENT == 'both' else [ORIENT]
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=(orients[0] == 'land'))
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    try:
        await pg.goto(URL); loaded = await L.wait_loaded(pg)
        if not loaded: run.note('%s：遊戲沒有在時間內載入完（照樣往下）' % k)
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        st, d, q = await build_state(pg, c)
        rec.update(day=d, q=q, load_h=c['load_h'], zone=c['zone'])
        await L.load_state(pg, st, quiet_events=QUIET, quiet_phone=True); await pg.evaluate(CLEARP)
        run.setup('[前置] %s：%s存檔讀到 %s（%s 第 %s 週，星期%s%s）%s %s%s%s；%s' % (
            k, '使用者' if SAVE is not None else '最小', d['key'], d.get('term'), d.get('week'), '日一二三四五六'[d['wd'] % 7], '，假日' if d.get('hol') else '', hm(c['load_h']), c['zone'],
            ('；存檔裡已經約好的出遊 %s（%s %s，%s；照 %s）' % (q['id'], d['key'], hm(q['h']), q['place'], c['src'])) if q else '；' + c['src'],
            ('；旗標 %s' % J(st['flags'] and {fk: st['flags'].get(fk) for fk in (c.get('flags') or {})})) if c.get('flags') else '',
            '條件事件、手機自動打開先關（QUIET）' if QUIET else '條件事件照常'))
        await pg.wait_for_timeout(2500); await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
        how, started, menus, lines = await trigger(pg, cdp, run, c, q)
        rec.update(how=how, started=started, menus_seen=menus, lines_before=lines)
        ok, s, g, pre = await wait_scene(pg, cdp, run, c)
        rec.update(scene_ok=ok, lines_in_event_before_bg=pre, bg_now=g)
        if pre: run.note('%s：到那一張底圖以前點過的：%s' % (k, J(pre)[:1200]))
        how_t = {'prompt': '遊戲自己跳出「出發」→ 點', 'self': '到了時間自己演', 'fallback': '【捷徑】直接出發'}.get(how, how)
        run.check('%s：事件演出（%s；%s）' % (k, c['ev'], how_t), bool(started) and ok,
                  J({'started': started, 'bg': g and g.get('bg'), 'adv': g and g.get('cls'), 'line': s and [s.get('name'), s.get('txt')], 'choices': s and s.get('ch')})[:700])
        if not ok:
            await run.shot(pg, '%s_noscene' % k)
            log = await pg.evaluate("(window.__BG5||[]).slice(-40)"); rec['log_tail'] = log
            run.note('%s：沒到那一張底圖。最後的紀錄：%s' % (k, J(log)[:1500]))
            for o in orients: run.check('%s［%s］：背景是 assets/bg/%s.webp' % (k, ONAME[o], k), False, '沒到那一張底圖')
            for o in orients: run.check('%s［%s］：截圖存在（對話框開著／只有底圖）' % (k, ONAME[o]), False, '沒拍')
            return
        first_named = bool(s.get('name'))
        cap = await pg.evaluate(CAP_JS)
        if cap:   # 地點字幕還在（場景開頭 2.4 秒）：先拍一張，再等它收掉
            await shoot_set(pg, run, c, orients[0], 'cap', rec, bgonly=False)
            for _ in range(10):
                if not await pg.evaluate(CAP_JS): break
                await pg.wait_for_timeout(500)
        for o in orients:
            sh = await shoot_set(pg, run, c, o, 'first', rec)
            m = sh['measure'] or {}
            run.check('%s［%s］：背景是 assets/bg/%s.webp' % (k, ONAME[o], k), bool(m.get('target')), J({'file': m.get('file'), 'adv': m.get('advCls'), 'nat': m.get('nat'), 'bgSize': m.get('bgSize'), 'bgPos': m.get('bgPos')}))
            run.check('%s［%s］：截圖存在（對話框開著／只有底圖）' % (k, ONAME[o]), exists(sh.get('dlg')) and exists(sh.get('bgonly')), J([sh.get('dlg'), sh.get('bgonly'), sh.get('bgbox')]))
        if SPK and not first_named and not s.get('ch'):   # 往下點到第一句有人說話（立繪出來）
            if pg.viewport_size != VP[orients[0]]: await set_orient(pg, run, orients[0])
            got = None
            for i in range(SPK_TAPS):
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700)
                s2 = await wait_line(pg); g2 = await pg.evaluate(BGNOW_JS, k)
                if not g2['target']: run.note('%s：往下點第 %d 句，底圖換掉了（%s）——不拍說話那一句' % (k, i + 1, g2.get('bg'))); break
                if s2['ch'] or (s2['dlg'] and s2['name']): got = s2; break
            if got:
                run.note('%s：往下點到 %s' % (k, J(got.get('ch') or [got.get('name'), got.get('txt')])[:300]))
                for o in orients: await shoot_set(pg, run, c, o, 'spk', rec, bgonly=False)
            else: run.note('%s：%d 句內沒有人說話（或底圖換掉）——沒拍說話那一句' % (k, SPK_TAPS))
    finally:
        rec['pageerrors'] = errs[:5]
        if errs: run.note('%s：頁面 JS 例外（只記）%s' % (k, J(errs[:3])))
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


async def main():
    run = L.Run('bg5', OUT); os.makedirs(OUT, exist_ok=True)
    cases = [c for c in CASES if not ONLY or c['k'] in ONLY]
    if ORIENT not in ('both', 'land', 'port'): run.check('ORIENT 認得', False, ORIENT); sys.exit(run.finish())
    print('==== cc_bg5_probe（SHA %s；%d 張；ORIENT=%s；QUIET=%s）====' % (os.environ.get('SHA', '?'), len(cases), ORIENT, QUIET), flush=True)
    async with async_playwright() as p:
        for c in cases:
            print('---- %s（%s）----' % (c['k'], c['ev']), flush=True)
            try:
                await asyncio.wait_for(case_run(p, run, c), CASE_MAX)
            except asyncio.TimeoutError:
                run.check('%s：事件演出（%s）' % (c['k'], c['ev']), False, '超過 CASE_MAX %d 秒' % CASE_MAX)
            except Exception as e:
                run.check('%s：跑完（沒有探針例外）' % c['k'], False, repr(e)[:500]); traceback.print_exc()
            try:
                with open(os.path.join(OUT, 'cc_bg5_measure.json'), 'w', encoding='utf-8') as f: json.dump({'sha': os.environ.get('SHA', '?'), 'url': URL, 'orient': ORIENT, 'cases': SUMMARY}, f, ensure_ascii=False, indent=1)
            except Exception as e: print('measure.json 寫不出來', e, flush=True)
    print('SHA', os.environ.get('SHA', '?'), '量測：', os.path.join(OUT, 'cc_bg5_measure.json'), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
