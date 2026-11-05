// AA_619 同弦樂器（吉他店）、加入吉他社要買吉他、吉他社社遊（企劃線 bf0efded8，AA-C 定稿 D109；任務 AA619-GUITAR-1104，src/guitar3d.js）——不需要瀏覽器。
//   0  接線：src/guitar3d.js 載得到、index.html 接在 GAME.boot() 前面；白名單 AA_619@bf0efded8 approved；classes3d.js 有 CLS.CLUB_IN；存檔預設 guitar:{items:{}}；GUITAR.rec 補／重設
//   0a 逐字對 AA_619@bf0efded8（git show，原稿）：S.L、2-1／偶遇／2-3 的對話、四個事件的每一句台詞和選項都在稿上；營業時間、價錢、九折、社遊的錢、偶遇的週次、老闆三句、
//      2-1 的旁白、2-4 兩句、宿舍兩句、報名表那一句從稿上抓出來比對；兩張 CG 的名稱、HEARD_HER_SONG 的面板名稱（暫用稿上那張 CG 的名稱）
//   1  營業：週二～週日 12:00～21:30、週一公休、颱風天（2027-10-13 週三）關；名稱「同弦樂器」；店門（exit.to＝xs_tongxian）營業時間外擋下來、寫開放時間；店裡的互動關門時寫開放時間
//   2  店裡：看看、試彈（去過社課才有）的旁白；買東西＝老闆一句（三句輪流、一次進店一句）＋選單（價錢、九折、小字、不用了）；買吉他扣錢、OWN_GUITAR、琴袋、調音那一句、時間 +0.15、
//      同一款不再列；錢不夠＝「錢不夠」不扣錢；小東西記數量、「買了○○」
//   3  真的區域 xs_tongxian（src/tongxian3d.js）：按鈕照 TX3.INTERACT()（吉他牆兩點「看看」、櫃台「買東西」；子晴 CG 的站位、烏克麗麗不放）、沒有 TX3／Z3＝不出錯也不加；
//      STORY.interact 分派；經濟系那一年藏；試彈＝坐上試琴椅 try_w／try_e（去過社課才有、打烊不演、木凳沒有）；打烊（21:30、週一）人在店裡＝請出來到 TX3.streetOut()；
//      2-3 有區域＝換到店裡（試琴椅、子晴的位置）、演完回原處。建 3D、按鈕走得到：tests/aa619_guitar_zone_unit.js
//   4  偶遇子晴：大一上第 6、10、14 週週六 15:00～16:00、人在店裡、認識她才有（一次）；其他週、週日、16:00、14:59、不認識、2-3 排過、店外都不演；三句照稿
//   5  2-1 第一次社課：初遇 → 社長學長那一段 → 兩個選項（「一定要買嗎？」接他那一句）→ 這次的旁白是鏽弦那一句（輪流的六句不往前）；第二次社課不再演；
//      舊存檔（以前去過社課、或初遇記過 guitarFirstDay）不補；第一次去已經有自己的琴＝不演
//   6  2-2 第 6 週週三社課結束：子晴三句、兩個選項；「好，禮拜六。」＝GUITAR_SHOP_WITH_ZQ＋出遊（第 6 週週六 15:00 同弦樂器）；「我自己去就好。」＝她一句、沒有出遊；
//      有琴、第一次社課、第 7 週（第 6 週過了＝舊存檔一樣）都不演
//   7  2-3 出遊：台詞、三個選項；三千八＝扣 3,420、OWN_GUITAR entry、調音那一句；六千五＝5,850；錢不夠＝變灰、「錢不夠」再選一次；我再想想＝不買；出來那一句（都說）；
//      CG 的登錄點；時間 15:00 → 15:45；之前自己買了琴＝出遊取消
//   8  2-4 之後的社課：有琴＝第 7 週起多一句（一學期一次、輪流不往前；大二阿凱不是室友＝沒有）；沒有琴＝偶爾第三弦那一句（照日期、不連續、輪流不往前）；不加數值
//   9  宿舍「彈吉他」：有琴才在房間物件裡；轉暗、30 分鐘、兩句之一；大二（阿凱不是室友）只有第二句
//  10  宜蘭兩天一夜：大一上第 11 週週一 21:00 群組報名表（成員、兩次以上社課才有；時間到才有）；報名＝扣 2,500、排出遊（11/22 08:00 校門口、只有出發）；錢不夠＝「下次吧。」、不扣錢；
//      不報名；兩天的時間（08:00 遊覽車 → 14:00 海邊 → 19:00 民宿 → 隔天 00:15 頂樓 → 15:00 回程 → 17:00）；各段台詞、BORROWED_ZQ_GUITAR、ZQ_ROOFTOP_TUNE、HEARD_HER_SONG；
//      和子晴交往中頂樓最後一句換；有自己的琴不記借琴；那段時間子晴的作息是「吉他社社遊」；同一天別的出遊照錯過處理
//  11  陽明山一日：大一下第 10 週週一 21:00 社長學長那一句＋報名、600；12:00 出發 → 14:00 擎天崗草原 → 19:30；有沒有 ZQ_ROOFTOP_TUNE 兩版、兩個選項
//  12  大一下「她在做的東西」（ev_ziqing_secret_game）：有 HEARD_HER_SONG 開頭多「宜蘭那首，我寫完了一半。」；沒有照舊
//  13  經濟系那一年：店、偶遇、2-1、社遊、房間都沒有
// 原稿用 git show bf0efded8 讀，不經 tests/alison.js（那支的換字表不改 AA_619 本身、只會在後面接別的稿；這裡要逐字比的是原稿）。
// 修改前（開發分支 ed7600ec5，暫時的 detached worktree 實跑）：沒有 src/guitar3d.js、index.html 沒接、白名單沒有 AA_619、沒有 CLS.CLUB_IN、存檔預設沒有 guitar、places.js 沒有同弦、
//   ev_ziqing_secret_game 沒有那一句、沒有同弦區域（src/tongxian3d.js）＝FAILED 28（0、0a～13 每一節都失敗或中斷；「不演」那幾項本來就成立的照樣 PASS）；
//   合併同弦區域（c028e2cc2）、還沒照真的區域接（沒有 S.buttons、還認 tongxian）＝FAILED 2（3-1、第 3 節中斷）。修改後 123 項 ALL PASS。
// 用法：node tests/aa619_guitar_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const loadErr=[];
const L=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'（沒有這個檔）'); return; } try{ let s=fs.readFileSync(p,'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e).slice(0,160)); } };
global.CG_REGISTRY=global.CG_REGISTRY||{};
L('src/data/tongxian_layout.js'); L('src/tongxian3d.js');   /* 真的同弦區域（LAWWW2-C，GUITAR-SHOP-ZONE-1105）：這裡只用它的配置、TX3.INTERACT／streetOut、TX3.zone（建 3D 的部分在 tests/aa619_guitar_zone_unit.js）*/
L('src/guitar3d.js');
const X=()=>typeof GUITAR!=='undefined'?GUITAR:null;
const ZQ='heroine_04', TD=(t,w,wd)=>STORY.termDay(t,w,wd), keyOf=d=>CALENDAR.dateOf(d).key, wd7=d=>CALENDAR.dateOf(d).wd%7;
const DOC=(()=>{ try{ return cp.execSync('git -c core.quotepath=false show bf0efded8:"docs/story_planning/AA_619_吉他店_買吉他_吉他社社遊.md"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){ return ''; } })();
const caps=[], toasts=[], memos=[];
GM.caption=(a,b)=>{ caps.push([b,H.G&&H.G.day,H.G&&+(+H.G.hour).toFixed(2)]); }; GM.toast=t=>{ toasts.push(t); }; GM.memo=t=>{ memos.push(t); };
GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
let fades=0; GM.fade=on=>{ if(on) fades++; return Promise.resolve(); };
const at=(d,h,zone)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wd7(d); if(zone) H.G.zone=zone; };
const fresh=(d,h,zone,flags)=>{ const G=H.fresh(keyOf(d),h,zone||'dorm',Object.assign({EXCHANGE_ROUTE:'TW'},flags||{})); G.outings=[]; G.acts={att:{}}; G.invites=[]; at(d,h,zone||'dorm');
  E.interactables=[]; caps.length=0; toasts.length=0; memos.length=0; fades=0; GM.enterN=0; ADV.active=false; delete global.Z3; return G; };
const use=G=>{ H.G=G; SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); return G; };   /* 換回前面那一局（EVENTS、SOCIAL 綁的是 H.fresh 那時候的 G）*/
const att=(G,...days)=>{ for(const d of days) G.acts.att['club_guitar@'+d]={h:19,end:'full'}; };
const said=()=>H.lines();
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const CLUB=()=>ACTIVITIES.list.find(a=>a.id==='club_guitar');
const evOf=id=>STORY_EVENTS.find(e=>e.id===id)||null;
/* 事件裡玩家看得到的字（台詞、旁白、選項）*/
const textsOf=lines=>{ const out=[]; for(const l of lines||[]){ if(l.text!=null) out.push(l.text); if(l.choice) for(const c of l.choice) out.push(c.text); } return out; };
(async()=>{
  check('0. 程式載得到（src/guitar3d.js）、有 GUITAR',!loadErr.length&&!!X(),loadErr.join(' | '));
  // ---------- 0 接線 ----------
  await sec(0,async()=>{
    const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), a=html.indexOf('src="src/guitar3d.js'), b=html.indexOf('GAME.boot()');
    check('0b. index.html 載入 src/guitar3d.js，在 story3d.js、classes3d.js、outings3d.js、phone3d.js 之後、GAME.boot() 之前',a>0&&b>a&&['src/story3d.js','src/classes3d.js','src/outings3d.js','src/phone3d.js','src/data/places.js'].every(f=>html.indexOf('src="'+f)>0&&html.indexOf('src="'+f)<a));
    const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')), f=(A.files||[]).find(x=>x.path==='docs/story_planning/AA_619_吉他店_買吉他_吉他社社遊.md');
    check('0c. 劇情匯入白名單：AA_619 bf0efded8 approved、有 approvedBy、任務 AA619-GUITAR-1104',!!f&&f.sha==='bf0efded8'&&f.status==='approved'&&!!f.approvedBy&&f.task==='AA619-GUITAR-1104',J(f&&{sha:f.sha,status:f.status}));
    const cls=fs.readFileSync(path.join(H.ROOT,'src/classes3d.js'),'utf8');
    check('0d. classes3d.js：社課開始的掛勾 CLS.CLUB_IN（陣列）、attendActivity 照它回傳的 {narr} 換掉這一次的旁白',Array.isArray(CLS.CLUB_IN)&&/for\(const f of S\.CLUB_IN\)/.test(cls)&&/cin&&cin\.narr!=null/.test(cls));
    const g3=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8'), line=g3.split('\n').find(l=>/function defaults\(/.test(l))||'';
    check('0e. 新遊戲的預設有 guitar:{items:{}}（舊存檔 migrate 照 defaults 補）',/guitar:\{items:\{\}\}/.test(line));
    const S=X(), g1={day:1}; S.rec(g1); const g2={day:1,guitar:[1]}; S.rec(g2); const g4={day:1,guitar:{items:'x',boss:-3,narrX:5,trip:[2]}}; S.rec(g4);
    check('0f. GUITAR.rec：舊存檔沒有＝補 {items:{}}；壞掉的欄位重設（items、boss、narrX、trip）',J(g1.guitar.items)==='{}'&&J(g2.guitar.items)==='{}'&&J(g4.guitar.items)==='{}'&&g4.guitar.boss===0&&J(g4.guitar.narrX)==='{}'&&J(g4.guitar.trip)==='{}');
    check('0g. 四個事件在 STORY_EVENTS（2-2、2-3、宜蘭、陽明山），id 不重複',['ev_guitar_zq_invite','ev_guitar_zq_shop','ev_guitar_trip_yilan','ev_guitar_trip_yms'].every(id=>STORY_EVENTS.filter(e=>e.id===id).length===1));
  });
  // ---------- 0a 對稿 ----------
  await sec('0a',async()=>{ const S=X();
    check('0a-0. 讀得到 AA_619@bf0efded8（新生南路版）',DOC.length>1000&&DOC.includes('新生南路有一家同弦，報吉他社打九折。')&&!DOC.includes('公館有一家同弦'));
    const all=[]; const push=(w,t)=>all.push([w,t]);
    for(const k of ['look','tryPlay','tuned','c21Narr','ownNarr','loanNarr','yilanPost','ymsPost','poor']) push('L.'+k,S.L[k]);
    for(const t of S.L.boss) push('L.boss',t); for(const t of S.L.dorm) push('L.dorm',t);
    for(const t of textsOf(S.D21)) push('D21',t); for(const t of textsOf(S.D_ENC)) push('D_ENC',t); for(const k in S.D_ZQPICK) for(const t of textsOf(S.D_ZQPICK[k])) push('D_ZQPICK',t);
    for(const o of S.PICK_OPTS) push('PICK',o.t);
    for(const e of S.EVENTS) for(const t of textsOf(e.dialogue)) push(e.id,t);
    const bad=all.filter(([w,t])=>!DOC.includes(t)).map(([w,t])=>w+'：'+t);
    check('0a-1. 程式裡每一句台詞、旁白、選項都在稿上（共 '+all.length+' 句）',all.length>=80&&!bad.length,bad.join(' ／ '));
    check('0a-2. 按鈕字「看看」「試彈」「買東西」「彈吉他」、報名表的「報名」「不報名」照稿',['看看','試彈','買東西'].every(t=>DOC.includes('「'+t+'」'))&&S.L.labels.look==='看看'&&S.L.labels.try==='試彈'&&S.L.labels.shop==='買東西'&&DOC.includes('「彈吉他」')&&S.L.dormLabel==='彈吉他'&&DOC.includes('選項報名／不報名')&&S.L.sign==='報名'&&S.L.noSign==='不報名');
    const pr=/民謠吉他 入門款 ([\d,]+)／面單款 ([\d,]+)；一包弦 (\d+)；Pick 一個 (\d+)；移調夾 (\d+)/.exec(DOC)||[], n=s=>+String(s).replace(/,/g,''), P=id=>S.ITEMS.find(q=>q.id===id);
    check('0a-3. 價錢照稿：入門款 3,800、面單款 6,500、一包弦 350、Pick 20、移調夾 300；品名「民謠吉他 入門款」「一包弦」「Pick」「移調夾」、面單款也是民謠吉他',pr.length===6&&P('entry').price===n(pr[1])&&P('solid').price===n(pr[2])&&P('strings').price===n(pr[3])&&P('pick').price===n(pr[4])&&P('capo').price===n(pr[5])&&P('entry').name==='民謠吉他 入門款'&&P('solid').name==='民謠吉他 面單款'&&P('strings').name==='一包弦'&&P('pick').name==='Pick'&&P('capo').name==='移調夾',J(pr.slice(1)));
    const d9=/九折（([\d,]+)／([\d,]+)）/.exec(DOC)||[];
    check('0a-4. 九折照稿（3,420／5,850）＝成員的價錢',d9.length===3&&S.price({flags:{CLUB_club_guitar:true}},'entry')===n(d9[1])&&S.price({flags:{CLUB_club_guitar:true}},'solid')===n(d9[2])&&S.price({flags:{}},'entry')===3800,J(d9.slice(1)));
    const bl=/老闆的話（輪流）：「([^」]+)」「([^」]+)」「([^」]+)」/.exec(DOC)||[];
    check('0a-5. 老闆三句照稿、照順序',bl.length===4&&J(S.L.boss)===J(bl.slice(1)));
    const c21=(/這次社課的旁白換成：「(（[^」]+）)」/.exec(DOC)||[])[1], own=(/多一句可以出現：「(（[^」]+）)」/.exec(DOC)||[])[1], loan=(/旁白偶爾換成「(（[^」]+）)」/.exec(DOC)||[])[1], dm=/旁白隨機一句：「(（[^」]+）)」「(（[^」]+）)」/.exec(DOC)||[];
    check('0a-6. 2-1 鏽弦那一句、2-4 有琴那一句、沒有琴那一句、宿舍兩句照稿',S.L.c21Narr===c21&&S.L.ownNarr===own&&S.L.loanNarr===loan&&J(S.L.dorm)===J(dm.slice(1)),J([c21,own,loan,dm.slice(1)]));
    check('0a-7. 營業 12:00～21:30、週一休；社遊 2,500（兩千五）、一日 600；偶遇第 6、10、14 週',/\*\*營業\*\*：12:00～21:30，週一休/.test(DOC)&&/錢：2,500 從玩家的錢扣/.test(DOC)&&/錢：一日 600/.test(DOC)&&/第 6、10、14 週/.test(DOC)&&S.TRIPS.y1s1.cost===2500&&S.TRIPS.y1s2.cost===600&&J(S.ENC_WEEKS)==='[6,10,14]'&&PLACES.hours.xs_tongxian.rules.week[1]===null&&J(PLACES.hours.xs_tongxian.rules.week[2])==='[12,21.5]');
    const post=(/群組貼報名表：「([^」]+)」/.exec(DOC)||[])[1], yms=(/社長學長：「(這學期社遊[^」]+)」/.exec(DOC)||[])[1];
    check('0a-8. 宜蘭報名表、陽明山社長學長那一句照稿',S.L.yilanPost===post&&S.L.ymsPost===yms,J([post,yms]));
    const cg=[...DOC.matchAll(/CG：「([^」]+)」/g)].map(m=>m[1]);
    check('0a-9. 兩張 CG（「同弦的試琴椅」「宜蘭民宿頂樓，子晴抱著吉他」）有登錄點；子晴的記憶 HEARD_HER_SONG 的面板名稱暫用稿上那張 CG 的名稱（一字照抄，稿上沒有面板名稱）',J(cg)===J(['同弦的試琴椅','宜蘭民宿頂樓，子晴抱著吉他'])&&S.CG.trial==='cg_tongxian_trial_heroine04'&&S.CG.roof==='cg_yilan_roof_heroine04'&&SOCIAL.MEMORY_LABEL.HEARD_HER_SONG===cg[1],J([cg,SOCIAL.MEMORY_LABEL.HEARD_HER_SONG]));
  });
  // ---------- 1 營業 ----------
  await sec(1,async()=>{ const S=X(), tue=TD('Y1S1',6,2), mon=TD('Y1S1',6,1)+7, sun=TD('Y1S1',6,7), ty=STORY.dayOfKey('2027-10-13');
    const o=(d,h)=>PLACES.isOpen('xs_tongxian',h,d);
    check('1-1. 週二～週日 12:00～21:30：12:00 開、11:59 沒開、21:29 開、21:30 關；週日也開',o(tue,12)&&!o(tue,11.98)&&o(tue,21.48)&&!o(tue,21.5)&&o(sun,15)&&PLACES.names.xs_tongxian==='同弦樂器');
    check('1-2. 週一公休（整天）',wd7(mon)===1&&!o(mon,12)&&!o(mon,15)&&!o(mon,20));
    check('1-3. 颱風天關（2027-10-13 週三；typhoonShops）',CALENDAR.typhoon(ty)&&wd7(ty)===3&&!o(ty,15)&&PLACES.typhoonShops.includes('xs_tongxian'));
    const G=fresh(tue,22,'xinsheng'); const r=await STORY.interact({exit:{to:'xs_tongxian'},label:'進同弦樂器（吉他行（二樓））'},GM);
    check('1-4. 新生南路的店門：22:00 擋下來、寫開放時間（PLACES.closedText；story3d.js 的 onInteract）',r===true&&toasts[0]===PLACES.closedText('xs_tongxian',22,tue)&&/同弦樂器 現在沒有開（今天 12:00–21:30）/.test(toasts[0]),J(toasts));
    at(ty,15,'xinsheng'); toasts.length=0; await STORY.interact({exit:{to:'xs_tongxian'}},GM); check('1-5. 颱風天的店門：「同弦樂器：颱風假，今天沒開。」',toasts[0]==='同弦樂器：颱風假，今天沒開。',J(toasts));
    at(tue,22,'xs_tongxian'); H.said=[]; caps.length=0; await S.look(GM); check('1-6. 人在店裡、已經打烊：看看＝寫開放時間（不演）',!H.said.length&&caps.length===1&&caps[0][0]===PLACES.closedText('xs_tongxian',22,tue));
    at(tue,15,'xs_tongxian'); check('1-7. 開門的時候 S.isOpen＝true',S.isOpen(G)); });
  // ---------- 2 店裡 ----------
  await sec(2,async()=>{ const S=X(), sat=TD('Y1S1',8,6);
    let G=fresh(sat,15,'xs_tongxian'); G.money=10000; H.said=[]; await S.look(GM);
    check('2-1. 看看＝稿的旁白一句',J(H.said)===J([{who:null,t:S.L.look}]));
    H.said=[]; const t0=await S.tryPlay(GM); check('2-2. 試彈：還沒去過吉他社社課＝沒有（稿：「社課教的 C 和弦」）',t0===false&&!H.said.length);
    att(G,TD('Y1S1',5,3)); H.said=[]; await S.tryPlay(GM); check('2-3. 去過一次社課：試彈＝稿的旁白一句',J(H.said)===J([{who:null,t:S.L.tryPlay}]));
    // 買東西：非成員、全價
    H.said=[]; H.opts=[]; H.picks=['不用了']; GM.enterN=5; await S.shop(GM);
    check('2-4. 買東西：老闆先說一句（第一句）→ 選單：五樣＋不用了、全價（不是成員沒有九折）',H.said.length===1&&H.said[0].who==='老闆'&&H.said[0].t===S.L.boss[0]&&J(H.opts[0])===J(['民謠吉他 入門款　3,800 元','民謠吉他 面單款　6,500 元','一包弦　350 元','Pick　20 元','移調夾　300 元','不用了']),J([H.said,H.opts]));
    H.said=[]; H.picks=['不用了']; await S.shop(GM); check('2-5. 同一次進店再按：老闆不再說',!H.said.length,J(H.said));
    GM.enterN=6; H.said=[]; H.picks=['不用了']; await S.shop(GM); GM.enterN=7; H.said.length=0; H.picks=['不用了']; await S.shop(GM); GM.enterN=8; H.picks=['不用了']; await S.shop(GM);
    check('2-6. 老闆三句輪流（每一次進店一句；第四次回到第一句）',G.guitar.boss===4&&H.said.map(s=>s.t).join('|')===[S.L.boss[2],S.L.boss[0]].join('|'),J(H.said));
    { H.said=[]; H.picks=['不用了']; await S.shop(GM); const s1=H.said.length; globalThis.LOADLOCKS['guitar3d:busy'](); H.said=[]; H.picks=['不用了']; await S.shop(GM);
      check('2-6b. 一次進店的記號不存檔：讀檔以後（enterN 從頭算，碰巧同一個數字）照樣說一句；輪流的位置存在 G.guitar.boss',s1===0&&H.said.length===1&&H.said[0].who==='老闆'&&H.said[0].t===S.L.boss[1]&&G.guitar.boss===5&&!('bossN' in G.guitar),J([s1,H.said,G.guitar])); }
    // 成員：九折＋小字
    G.flags.CLUB_club_guitar=true; let seen=null; const c0=GM.choose; GM.choose=async o=>{ seen=o; return c0(o); }; H.picks=['入門款']; const h0=G.hour, m0=G.money; H.said=[]; GM.enterN=9;
    await S.shop(GM); GM.choose=c0;
    check('2-7. 吉他社成員：九折（入門款 3,420、面單款 5,850、一包弦 315、Pick 18、移調夾 270），小字「九折」',!!seen&&J(seen.slice(0,5).map(q=>q.t))===J(['民謠吉他 入門款　3,420 元','民謠吉他 面單款　5,850 元','一包弦　315 元','Pick　18 元','移調夾　270 元'])&&seen.slice(0,5).every(q=>q.hint==='九折'),J(seen&&seen.map(q=>[q.t,q.hint])));
    check('2-8. 買入門款：扣 3,420、OWN_GUITAR＝entry、琴袋一個、調音（那天）、旁白「（老闆幫你調好音，把琴裝進琴袋。）」、時間 +0.15、日誌',m0-G.money===3420&&G.flags.OWN_GUITAR==='entry'&&G.guitar.items.entry===G.day&&G.guitar.items.case===1&&G.guitar.tuned===G.day&&H.said.some(s=>s.who===null&&s.t===S.L.tuned)&&Math.abs(G.hour-h0-0.15)<1e-6&&memos.includes('買了民謠吉他 入門款'),J([m0-G.money,G.flags.OWN_GUITAR,G.guitar,H.said]));
    H.opts=[]; H.picks=['不用了']; GM.enterN=10; await S.shop(GM); check('2-9. 買過的那一款不再列（入門款），面單款照列',!H.opts[0].some(t=>/入門款/.test(t))&&H.opts[0].some(t=>/面單款/.test(t)),J(H.opts[0]));
    G.money=100; const m1=G.money; toasts.length=0; seen=null; GM.choose=async o=>{ seen=o; return c0(o); }; H.picks=['面單款']; await S.shop(GM); GM.choose=c0;
    check('2-10. 錢不夠：選項變灰、選了＝「錢不夠」、不扣錢、沒有買',!!seen&&seen.find(q=>/面單款/.test(q.t)).dim===true&&toasts.includes('錢不夠')&&G.money===m1&&G.flags.OWN_GUITAR==='entry'&&!S.owns(G,'solid'),J([toasts,G.money]));
    G.money=1000; toasts.length=0; H.picks=['一包弦']; await S.shop(GM); H.picks=['一包弦']; await S.shop(GM); H.picks=['Pick']; await S.shop(GM); H.picks=['移調夾']; await S.shop(GM);
    check('2-11. 小東西：扣錢（九折）、記數量（弦 2、Pick 1、移調夾 1）、「買了○○」、OWN_GUITAR 不變',G.money===1000-315*2-18-270&&G.guitar.items.strings===2&&G.guitar.items.pick===1&&G.guitar.items.capo===1&&J(toasts)===J(['買了一包弦','買了一包弦','買了 Pick','買了移調夾'])&&G.flags.OWN_GUITAR==='entry',J([G.money,G.guitar.items,toasts]));
    G.money=9000; H.picks=['面單款']; await S.shop(GM); check('2-12. 再買面單款：OWN_GUITAR＝solid（最新的那把）、琴袋兩個',G.flags.OWN_GUITAR==='solid'&&G.guitar.items.solid===G.day&&G.guitar.items.case===2&&G.money===9000-5850);
    check('2-13. 資料層：S.buy 已經有＝owned、錢不夠＝poor',S.buy(G,'entry')==='owned'&&(()=>{ G.money=10; return S.buy(G,'capo')==='poor'&&G.money===10; })()); });
  // ---------- 3 區域接線（真的 xs_tongxian：src/tongxian3d.js 的 TX3）----------
  await sec(3,async()=>{ const S=X(), sat=TD('Y1S1',8,6), LY=TONGXIAN_LAYOUT.shop;
    check('3-1. 區域 id 只有 xs_tongxian（TX3.ZONE）；開放時間、名稱的鍵 xs_tongxian（places.js）；TX3.zone.build 已經包上（加按鈕）',J(S.ZONES)===J(['xs_tongxian'])&&TX3.ZONE==='xs_tongxian'&&S.PLACE==='xs_tongxian'&&!!PLACES.hours.xs_tongxian&&TX3.zone._guitar===true);
    let G=fresh(sat,15,'xs_tongxian'); const E1={interactables:[]}; const n=S.buttons(E1), ids=E1.interactables.map(i=>i.tongxian+':'+i.guitar+':'+i.label);
    const q=id=>LY.interact.find(x=>x.id===id), atPt=(it,id)=>it.x===q(id).x&&it.z===q(id).z;
    check('3-2. 按鈕照 TX3.INTERACT()：吉他牆 wall_n、wall_s＝「看看」、櫃台 buy＝「買東西」（半徑 0.9、位置照配置）；try（子晴 CG 的站位）、ukes（烏克麗麗，稿上沒有字）不放',n===3&&J(ids)===J(['wall_n:look:看看','wall_s:look:看看','buy:shop:買東西'])&&atPt(E1.interactables[0],'wall_n')&&atPt(E1.interactables[1],'wall_s')&&atPt(E1.interactables[2],'buy')&&E1.interactables.every(i=>i.radius===0.9&&(i.lv|0)===0)&&!E1.interactables.some(i=>i.tongxian==='try'||i.tongxian==='ukes'),J(E1.interactables));
    { const tx=globalThis.TX3; let err=null, r=null; delete globalThis.TX3; try{ r=S.buttons({interactables:[]}); E.interactables=[]; STORY.populate('xs_tongxian',GM); }catch(e){ err=e; } globalThis.TX3=tx;
      check('3-3. 沒有區域（TX3 不在）：不加按鈕、populate 不出錯',r===0&&!err&&!E.interactables.length,String(err)); }
    { let r='?'; try{ r=await S.outingStage(GM,{id:'x'},evOf('ev_guitar_zq_shop')); }catch(e){ r=e; } check('3-4. 遊戲沒有登記區域（Z3 不在）：2-3 不換場景（OUT.STAGE 回 null）',r===null,String(r)); }
    E.interactables=E1.interactables.concat([{x:LY.exit.x,z:LY.exit.z,label:LY.exit.label,exit:{to:'xinsheng'}}]); H.said=[]; await STORY.interact(E.interactables[0],GM);
    check('3-5.「看看」（STORY.interact 照 it.guitar 分派）＝稿的旁白一句',J(H.said)===J([{who:null,t:S.L.look}]));
    H.said=[]; H.opts=[]; H.picks=['不用了']; await STORY.interact(E.interactables[2],GM); check('3-6.「買東西」＝老闆一句＋選單',H.said.length===1&&H.said[0].who==='老闆'&&H.opts[0]&&H.opts[0].length===6,J([H.said,H.opts]));
    G.stage='econ'; STORY.populate('xs_tongxian',GM); const hid=E.interactables.filter(i=>i.guitar).every(i=>i.hidden===true)&&!E.interactables[3].hidden; G.stage='law'; STORY.populate('xs_tongxian',GM);
    check('3-7. 經濟系那一年：按鈕藏起來（出口不動）；法律系照常',hid&&E.interactables.filter(i=>i.guitar).every(i=>!i.hidden));
    // 試彈＝坐上試琴椅
    const seatOf=id=>{ const s=LY.seats.find(x=>x.id===id); return {x:s.x,z:s.z,yaw:s.yaw,lv:0}; };
    check('3-8. 配置的座位對得到 id（try_w、try_e、counter_stool）',S.seatId(seatOf('try_w'))==='try_w'&&S.seatId(seatOf('try_e'))==='try_e'&&S.seatId(seatOf('counter_stool'))==='counter_stool'&&S.seatId({x:9,z:9})===null);
    H.said=[]; await STORY.onSeat(GM,seatOf('try_w')); const s0=H.said.filter(x=>x.t===S.L.tryPlay).length;
    att(G,TD('Y1S1',5,3)); H.said=[]; await STORY.onSeat(GM,seatOf('try_w')); const s1=H.said.filter(x=>x.t===S.L.tryPlay).length; H.said=[]; await STORY.onSeat(GM,seatOf('try_e')); const s2=H.said.filter(x=>x.t===S.L.tryPlay).length;
    H.said=[]; await STORY.onSeat(GM,seatOf('counter_stool')); const s3=H.said.filter(x=>x.t===S.L.tryPlay).length;
    check('3-9. 試彈＝坐上試琴椅（try_w、try_e）：去過社課才有稿上那一句；還沒去過＝沒有；櫃台前的木凳沒有',s0===0&&s1===1&&s2===1&&s3===0,J([s0,s1,s2,s3]));
    at(sat,21.6); H.said=[]; await STORY.onSeat(GM,seatOf('try_w')); const s4=H.said.filter(x=>x.t===S.L.tryPlay).length; at(sat,15,'wancai'); H.said=[]; await STORY.onSeat(GM,seatOf('try_w')); const s5=H.said.filter(x=>x.t===S.L.tryPlay).length;
    check('3-10. 打烊以後、別的區域（座標碰巧一樣）坐下：沒有',s4===0&&s5===0,J([s4,s5]));
    // 打烊：請你出來
    at(sat,21.55,'xs_tongxian'); H.entered=[]; toasts.length=0; let stood=0; const su=GM.standUp; GM.standUp=()=>{ stood++; }; E.player.seat={x:1,z:1};
    const t=S.tick(GM); await new Promise(r=>setTimeout(r,5)); GM.standUp=su; E.player.seat=null; const so=TX3.streetOut();
    check('3-11. 21:33 人還在店裡：站起來、回到新生南路騎樓的樓梯口外面（TX3.streetOut）、寫開放時間',t===true&&stood===1&&H.entered[0]==='xinsheng'&&toasts[0]===PLACES.closedText('xs_tongxian',21.55,sat),J([H.entered,toasts,so]));
    at(TD('Y1S1',8,1),13,'xs_tongxian'); H.entered=[]; S.tick(GM); await new Promise(r=>setTimeout(r,5)); check('3-12. 週一（公休）讀檔在店裡：一樣請出來',H.entered[0]==='xinsheng');
    at(sat,15,'xs_tongxian'); H.entered=[]; const t2=S.tick(GM); check('3-13. 開門的時候不請人出來',t2===false&&!H.entered.length);
    // 2-3 有區域＝換到店裡（真的 TX3.zone）
    global.Z3={ZONES:{xs_tongxian:TX3.zone,campus:{}}}; G.zone='campus'; E.player.obj.position.x=5; E.player.obj.position.z=6; H.entered=[]; const spawned=[]; GM.spawnCharacter=(id,x,z)=>{ spawned.push([id,x,z]); return {obj:{}}; }; let sat2=null; GM.sitAt=(p,s)=>{ sat2=s; };
    const stg=await S.outingStage(GM,{id:'guitar_zq_shop'},evOf('ev_guitar_zq_shop')); const zq=LY.npc.ziqing_cg, tw=LY.seats.find(x=>x.id==='try_w');
    check('3-14. 有 xs_tongxian：2-3 演之前換到店裡（進門點）、坐上試琴椅 try_w、子晴站在 CG 的位置，S.staged',!!stg&&H.entered[0]==='xs_tongxian'&&J(spawned)===J([[ZQ,zq.x,zq.z]])&&!!sat2&&sat2.x===tw.x&&sat2.z===tw.z&&S.staged==='xs_tongxian',J([H.entered,spawned,sat2]));
    H.said=[]; await STORY.onSeat(GM,seatOf('try_w')); check('3-15. 換場景的時候（S.staged）不出試彈那一句',!H.said.some(x=>x.t===S.L.tryPlay));
    await stg.restore(); check('3-16. 演完回到原本的地方（campus）',H.entered[1]==='campus'&&S.staged===null,J(H.entered));
    const q2=await S.outingStage(GM,{id:'x'},evOf('ev_guitar_trip_yilan')); check('3-17. 別的出遊不換',q2===null);
    delete GM.spawnCharacter; GM.sitAt=()=>{}; delete global.Z3; });
  // ---------- 4 偶遇子晴 ----------
  await sec(4,async()=>{ const S=X();
    const ok=[], sats=[]; for(let w=1;w<=16;w++){ const d=TD('Y1S1',w,6); if(d==null) continue; const G=fresh(d,15.4,'xs_tongxian'); H.FRIEND(ZQ); sats.push(w); if(S.encDue(G)) ok.push(w); }
    check('4-1. 大一上週六 15:24 人在店裡、認識她：只有第 6、10、14 週',J(ok)==='[6,10,14]',J(ok));
    const d10=TD('Y1S1',10,6); let G=fresh(d10,15.4,'xs_tongxian');
    check('4-2. 不認識子晴＝沒有',!S.encDue(G));
    H.FRIEND(ZQ); at(d10,14.98); const a1=S.encDue(G); at(d10,16); const a2=S.encDue(G); at(d10+1,15.4); const a3=S.encDue(G); at(d10,15.4,'xinsheng'); const a4=S.encDue(G); at(TD('Y1S2',10,6),15.4,'xs_tongxian'); const a5=S.encDue(G);
    check('4-3. 14:59、16:00、週日、店外（新生南路）、大一下第 10 週都沒有',!a1&&!a2&&!a3&&!a4&&!a5,J([a1,a2,a3,a4,a5]));
    at(d10,15.4,'xs_tongxian'); H.said=[]; const t=S.tick(GM); await new Promise(r=>setTimeout(r,5));
    check('4-4. 演：她兩句、中間旁白一句（照稿）',t===true&&J(said())===J(['高子晴：你也來這家？……這家老闆不會一直推銷，我喜歡。','（她拿了一包弦就走。走到門口又回頭。）','高子晴：0.12 的。不要買太細的，你手會更痛。'])&&G.guitar.enc===d10,J(said()));
    at(TD('Y1S1',14,6),15.4); check('4-5. 一個存檔一次（第 14 週不再演）',!S.encDue(G));
    G=fresh(TD('Y1S1',14,6),15.4,'xs_tongxian'); H.FRIEND(ZQ); S.planZqShop(Object.assign(G,{day:TD('Y1S1',6,3)})); at(TD('Y1S1',14,6),15.4);
    check('4-6. 和她約過 2-3（同弦）＝不演（「你也來這家？」）',!!OUT.get(G,'guitar_zq_shop')&&!S.encDue(G)); });
  // ---------- 5 2-1 第一次社課 ----------
  await sec(5,async()=>{ const S=X(), a=CLUB(), w5=TD('Y1S1',5,3);
    let G=fresh(w5,19.05,'wancai'); H.said=[]; H.picks=[0,'一定要買嗎']; let optsSeen=[]; const c0=GM.choose; GM.choose=async o=>{ optsSeen.push(o.map(q=>q.t)); return c0(o); };
    await CLS.attendActivity(GM,a,{door:true}); GM.choose=c0;
    const L=said(), i0=L.indexOf('高子晴：今天系上有程式比賽，一半的人跑去了，所以人很少。'), i1=L.indexOf('（社長學長拍拍手。）');
    const want=['（社長學長拍拍手。）','社長學長：有自己吉他的舉手。','（一半的人舉手。你沒有。）','社長學長：沒有的先用社團的，前面那箱。前兩個禮拜先借，之後最好自己買一把。……不用貴，三四千就有好彈的。','社長學長：新生南路有一家同弦，報吉他社打九折。','社長學長：不買也可以啊，社團的琴一直都在。只是那箱弦有點鏽。',S.L.c21Narr];
    check('5-1. 第一次社課：子晴的初遇演完 → 社長學長那一段 →「一定要買嗎？」→ 他那一句 → 這次的旁白是鏽弦那一句（最後）',i0>=0&&i1>i0&&J(L.slice(i1))===J(want)&&J(optsSeen[1])===J(['「好。」','「一定要買嗎？」']),J([L,optsSeen]));
    check('5-2. 輪流的六句沒有往前（G.acts.narr 沒記）、記 c21、加入吉他社、出席',!((G.acts.narr||{})['club_guitar@Y1S1'])&&G.guitar.c21===w5&&G.flags.CLUB_club_guitar===true&&ACTIVITIES.attended(G,'club_guitar',w5),J([G.acts.narr,G.guitar]));
    const w6m=TD('Y1S1',6,3); at(w6m+0,19.05); H.said=[]; H.picks=['我自己去就好']; await CLS.attendActivity(GM,a,{door:true});
    check('5-3. 第二次社課：不再演 2-1；旁白是輪流的第一句',!said().includes('（社長學長拍拍手。）')&&said().includes(a.narr[0]),J(said()));
    // 「好。」
    G=fresh(w5,19.05,'wancai'); H.said=[]; H.picks=[0,'「好。」']; await CLS.attendActivity(GM,a,{door:true});
    check('5-4.「好。」：沒有他那一句、照樣是鏽弦旁白',!said().some(t=>/不買也可以啊/.test(t))&&said()[said().length-1]===S.L.c21Narr,J(said()));
    // 已經認識子晴（別的地方認識的）：沒有初遇事件，2-1 照演
    G=fresh(w5,19.05,'wancai'); H.FRIEND(ZQ); H.said=[]; H.picks=[0]; await CLS.attendActivity(GM,a,{door:true});
    check('5-5. 已經認識子晴（沒有初遇）：入座那一句 → 2-1 → 鏽弦旁白',said()[0]==='你輕輕坐下。「吉他社社課」已經開始了。'&&said()[1]==='（社長學長拍拍手。）'&&said()[said().length-1]===S.L.c21Narr,J(said()));
    // 舊存檔：以前去過
    G=fresh(TD('Y1S1',7,3),19.05,'wancai',{CLUB_club_guitar:true}); H.FRIEND(ZQ); att(G,w5); H.said=[]; await CLS.attendActivity(GM,a,{door:true});
    check('5-6. 舊存檔（以前去過社課，有出席紀錄）：不補 2-1',!said().includes('（社長學長拍拍手。）')&&G.guitar.c21==null,J(said()));
    G=fresh(TD('Y1S1',7,3),19.05,'wancai',{CLUB_club_guitar:true,guitarFirstDay:w5}); H.FRIEND(ZQ); H.said=[]; await CLS.attendActivity(GM,a,{door:true});
    check('5-7. 舊存檔（沒有出席紀錄、初遇記過 guitarFirstDay）：不補',!said().includes('（社長學長拍拍手。）'),J(said()));
    G=fresh(w5,19.05,'wancai',{OWN_GUITAR:'entry'}); G.guitar={items:{entry:w5-2}}; H.said=[]; H.picks=[0]; await CLS.attendActivity(GM,a,{door:true});
    check('5-8. 第一次去已經有自己的琴（稿是「你沒有」）：不演、記 own、沒有鏽弦旁白',!said().includes('（社長學長拍拍手。）')&&!said().includes(S.L.c21Narr)&&G.guitar.c21==='own',J(said())); });
  // ---------- 6 2-2 ----------
  await sec(6,async()=>{ const S=X(), a=CLUB(), w5=TD('Y1S1',5,3), w6=TD('Y1S1',6,3);
    const run=async(d,flags,picks,prep)=>{ const G=fresh(d,19.05,'wancai',Object.assign({CLUB_club_guitar:true},flags||{})); H.FRIEND(ZQ); att(G,w5); if(prep) prep(G); H.said=[]; H.picks=(picks||[]).slice(); await CLS.attendActivity(GM,a,{door:true}); return G; };
    let G=await run(w6,{},['好，禮拜六']); const L=said(), i=L.indexOf('高子晴：你還在用那箱的？');
    check('6-1. 第 6 週週三社課結束：子晴三句（照稿）',i>0&&J(L.slice(i,i+3))===J(['高子晴：你還在用那箱的？','高子晴：……禮拜六我要去同弦買弦。你要來就來。','高子晴：我陪你去，但我不幫你選。你自己彈彈看，你的手比我知道。'])&&L.indexOf(a.narr[0])<i,J(L));
    const q=OUT.get(G,'guitar_zq_shop');
    check('6-2.「好，禮拜六。」：GUITAR_SHOP_WITH_ZQ、出遊 第 6 週週六 15:00 同弦樂器（和子晴去同弦、走路 約 10 分鐘、到時間叫醒）',G.flags.GUITAR_SHOP_WITH_ZQ===true&&!!q&&q.day===TD('Y1S1',6,6)&&q.h===15&&q.place==='同弦樂器'&&q.title==='和子晴去同弦'&&q.travel==='走路 約 10 分鐘'&&q.alarm===true&&q.ev==='ev_guitar_zq_shop'&&!L.includes('高子晴：好。0.12 的弦，記得。'),J(q));
    G=await run(w6,{},['我自己去就好']);
    check('6-3.「我自己去就好。」：她一句、沒有出遊、沒有旗標',said().includes('高子晴：好。0.12 的弦，記得。')&&!OUT.get(G,'guitar_zq_shop')&&!G.flags.GUITAR_SHOP_WITH_ZQ,J(said()));
    G=await run(w6,{OWN_GUITAR:'entry'},[]); check('6-4. 已經有琴：不演',!said().some(t=>/你還在用那箱的/.test(t)));
    G=await run(w6,{},[],G=>{ G.acts.att={}; }); check('6-5. 這是第一次去社課（「你還在用那箱的？」）：不演',!said().some(t=>/你還在用那箱的/.test(t)));
    G=await run(TD('Y1S1',7,3),{},[]); check('6-6. 第 7 週（第 6 週過了；舊存檔一樣）：不演',!said().some(t=>/你還在用那箱的/.test(t)));
    G=await run(TD('Y1S1',6,3)+0,{},['好，禮拜六'],G=>{ G.events.done.ev_guitar_zq_invite=1; }); check('6-7. 演過一次就不再演（once）',!said().some(t=>/你還在用那箱的/.test(t))); });
  // ---------- 7 2-3 ----------
  await sec(7,async()=>{ const S=X(), sat=TD('Y1S1',6,6), w5=TD('Y1S1',5,3);
    const go=async(money,picks,prep)=>{ const G=fresh(TD('Y1S1',6,3),21,'campus',{CLUB_club_guitar:true}); H.FRIEND(ZQ); att(G,w5,TD('Y1S1',6,3)); G.money=money; S.planZqShop(G); if(prep) prep(G); at(sat,14.75,'campus'); const q=OUT.due(G); H.said=[]; H.cgs=[]; caps.length=0; toasts.length=0; H.picks=['出發'].concat(picks); let seen=[]; const c0=GM.choose; GM.choose=async o=>{ seen.push(o.map(x=>[x.t,!!x.dim])); return c0(o); }; if(q) await OUT.prompt(GM,q); GM.choose=c0; return {G,q,seen}; };
    let {G,q,seen}=await go(4000,['三千八']); const L=said();
    const head=['（子晴已經在樓梯口了，耳機掛在脖子上。）','高子晴：走。','（老闆看到子晴，點了一下頭。）','老闆：又來了。0.12？','高子晴：嗯。……他要買琴。','（你拿下兩把試。一把三千八，一把六千五。）','高子晴：彈 G。……換 C。……再彈一次 G。','高子晴：哪一把比較好按？'];
    check('7-1. 出發 → 稿的八句（地點字幕「同弦樂器」）→ 三個選項',!!q&&J(L.slice(0,8))===J(head)&&J(seen[1].map(x=>x[0]))===J(['「三千八那把。」','「六千五那把，聲音比較好聽。」','「我再想想。」'])&&caps.some(c=>c[0]==='同弦樂器'),J([L,seen]));
    check('7-2. 三千八那把：她那一句、扣 3,420（九折）、OWN_GUITAR entry、調音裝袋那一句、出來那一句（新生南路）',J(L.slice(8))===J(['高子晴：那就那把。……貴的你現在也彈不出差別。',S.L.tuned,'高子晴：有自己的琴以後，回家才會彈。……社團的琴你不會帶回家。'])&&G.money===4000-3420&&G.flags.OWN_GUITAR==='entry'&&G.guitar.items.case===1&&caps.some(c=>c[0]==='新生南路'),J([L.slice(8),G.money]));
    check('7-3. CG「同弦的試琴椅」的登錄點（cg_tongxian_trial_heroine04；CG_REGISTRY 有了才出）、出遊 done、15:00 到、演完 15:45、事件演過',J(H.cgs)===J(['cg_tongxian_trial_heroine04'])&&q.state==='done'&&Math.abs(G.hour-15.75)<1e-6&&G.day===sat&&!!G.events.done.ev_guitar_zq_shop,J([H.cgs,q.state,G.hour]));
    ({G,q,seen}=await go(9000,['六千五']));
    check('7-4. 六千五那把：她那一句、扣 5,850、OWN_GUITAR solid',said().includes('高子晴：嗯。你聽得出來，那就值得。')&&G.money===9000-5850&&G.flags.OWN_GUITAR==='solid',J([said(),G.money]));
    ({G,q,seen}=await go(9000,['我再想想']));
    check('7-5. 我再想想：她那一句、不買、出來那一句照說',said().includes('高子晴：好。不要讓別人幫你決定。我也是。')&&G.money===9000&&!G.flags.OWN_GUITAR&&!said().includes(S.L.tuned)&&said()[said().length-1]==='高子晴：有自己的琴以後，回家才會彈。……社團的琴你不會帶回家。',J(said()));
    ({G,q,seen}=await go(4000,['六千五','三千八']));
    check('7-6. 錢不夠（4,000）：六千五那把變灰、選了＝「錢不夠」再選一次、改三千八才買',seen[1][1][1]===true&&seen[1][0][1]===false&&toasts.includes('錢不夠')&&seen.length===3&&G.flags.OWN_GUITAR==='entry'&&G.money===580,J([seen,toasts,G.money]));
    ({G,q,seen}=await go(1000,['三千八','六千五','我再想想']));
    check('7-7. 兩把都買不起（1,000）：都變灰，最後只能「我再想想」、不扣錢',seen[1][0][1]&&seen[1][1][1]&&G.money===1000&&!G.flags.OWN_GUITAR&&said().includes('高子晴：好。不要讓別人幫你決定。我也是。'),J([seen,G.money]));
    { const G=fresh(TD('Y1S1',6,3),21,'xs_tongxian',{CLUB_club_guitar:true}); H.FRIEND(ZQ); att(G,w5); S.planZqShop(G); at(TD('Y1S1',6,4),15); G.money=9000; H.picks=['入門款']; await S.shop(GM); at(sat,14.75,'campus');
      check('7-8. 2-3 之前自己去買了琴：那個約取消（missed，不跳出發）',OUT.get(G,'guitar_zq_shop').state==='missed'&&!OUT.due(G)); } });
  // ---------- 8 2-4 ----------
  await sec(8,async()=>{ const S=X(), a=CLUB(), w5=TD('Y1S1',5,3);
    const days=[]; for(const [t,ws] of [['Y1S1',[6,7,10,11,12,13,14,15]]]) for(const w of ws) for(const wd of [1,3]){ const d=TD(t,w,wd); if(d!=null&&ACTIVITIES.on(a,d)) days.push(d); }
    // 有琴
    let G=fresh(days[0],19.05,'wancai',{CLUB_club_guitar:true,OWN_GUITAR:'entry'}); H.FRIEND(ZQ); att(G,w5); G.guitar={items:{entry:w5}}; const narrs=[];
    for(const d of days){ at(d,19.05); H.said=[]; await CLS.attendActivity(GM,a,{door:true}); narrs.push([CALENDAR.termOf(d).week,said().filter(t=>t===S.L.ownNarr||a.narr.includes(t)||t===S.L.loanNarr)[0]||'']); }
    const k=narrs.findIndex(x=>x[1]===S.L.ownNarr);
    check('8-1. 有自己的琴：第 7 週起第一次社課多一句「（你的琴放在宿舍床邊。阿凱說你半夜彈太大聲。）」，一學期一次；第 6 週沒有；沒有第三弦那一句',k>=0&&narrs[k][0]===7&&narrs.filter(x=>x[1]===S.L.ownNarr).length===1&&narrs.slice(0,k).every(x=>x[0]<7)&&!narrs.some(x=>x[1]===S.L.loanNarr),J(narrs));
    check('8-2. 輪流的六句不因為那一句往前（照順序 6 句、多一句一共 7 句）',J(narrs.filter(x=>a.narr.includes(x[1])).map(x=>a.narr.indexOf(x[1])))===J([0,1,2,3,4,5])&&narrs.filter(x=>x[1]).length===7,J(narrs));
    { const y2=TD('Y2S1',7,3); G=fresh(y2,19.05,'wancai',{CLUB_club_guitar:true,OWN_GUITAR:'entry',ROOM_Y2:true}); att(G,w5); G.guitar={items:{entry:w5}};
      check('8-3. 大二（阿凱不是室友了）：有琴那一句不出現',S.narrX(G,a)===null&&!STORY.kaiRoommate(G)); }
    { const y12=TD('Y1S2',7,3); G=fresh(y12,19.05,'wancai',{CLUB_club_guitar:true,OWN_GUITAR:'entry'}); att(G,w5); G.guitar={items:{entry:w5},narrX:{Y1S1:TD('Y1S1',7,3)}};
      check('8-4. 換學期（大一下第 7 週）再出一次',S.narrX(G,a)===S.L.ownNarr&&G.guitar.narrX.Y1S2===y12); }
    // 沒有琴
    G=fresh(days[0],19.05,'wancai',{CLUB_club_guitar:true}); H.FRIEND(ZQ); att(G,w5); const nn=[];
    for(const d of days){ at(d,19.05); H.said=[]; await CLS.attendActivity(GM,a,{door:true}); nn.push([d,said().filter(t=>t===S.L.loanNarr||a.narr.includes(t))[0]||'']); }
    const loanDays=nn.filter(x=>x[1]===S.L.loanNarr).map(x=>x[0]), want=[]; { let prev=null, last=null; for(const d of days){ const hit=S.loanRoll(d)&&last!==prev; if(hit) want.push(d); last=hit?d:last; prev=d; } }
    check('8-5. 沒有自己的琴：偶爾（照日期 S.loanRoll，約三分之一）換成「（社團那把吉他的第三弦又鬆了。學長幫你調了兩次。）」，上一堂剛出過的不連續',loanDays.length>=1&&loanDays.length<days.length/2&&J(loanDays)===J(want),J([loanDays,want]));
    check('8-6. 換成那一句的那幾次，輪流的六句不往前（還是照順序）',J(nn.filter(x=>a.narr.includes(x[1])).map(x=>a.narr.indexOf(x[1])))===J([0,1,2,3,4,5].slice(0,nn.filter(x=>a.narr.includes(x[1])).length)),J(nn));
    { const G7=fresh(TD('Y1S1',10,1),19.05,'wancai',{CLUB_club_guitar:true}); H.FRIEND(ZQ); att(G7,w5); const snap=()=>J([G7.money,SOCIAL.rel(ZQ),G7.flags,G7.stats,G7.acts.narr||null]); const s0=snap(); const outs=[];
      for(const d of days){ at(d,19.05); outs.push(S.narrX(G7,a)); } G7.flags.OWN_GUITAR='entry'; for(const d of days){ at(d,19.05); outs.push(S.narrX(G7,a)); } delete G7.flags.OWN_GUITAR;
      check('8-7. 兩種旁白都不加數值、不扣錢、不動旗標和輪流的紀錄（錢、子晴的關係、旗標、stats、G.acts.narr 都沒變）',snap()===s0&&outs.some(x=>x===S.L.loanNarr)&&outs.some(x=>x===S.L.ownNarr),J([s0,snap()])); }
    { G=fresh(w5,19.05,'wancai'); G.guitar={items:{},c21:w5}; check('8-8. 第一次社課那一天（2-1）不換第三弦那一句',S.narrX(G,a)===null); } });
  // ---------- 9 宿舍 ----------
  await sec(9,async()=>{ const S=X(), d=TD('Y1S1',8,4);
    let G=fresh(d,22,'dorm'); check('9-1. 沒有琴：房間物件沒有「彈吉他」',!STORY.roomItemList(G).some(r=>r[0]==='彈吉他'));
    G.flags.OWN_GUITAR='entry'; const row=STORY.roomItemList(G).find(r=>r[0]==='彈吉他');
    check('9-2. 有琴：房間物件多「彈吉他」（動作）',!!row&&typeof row[2]==='function');
    const r0=S.rand; S.rand=()=>0; H.said=[]; fades=0; const h0=G.hour; await row[2](GM);
    check('9-3. 彈吉他：轉暗、30 分鐘、旁白一句（第一句）',fades===1&&Math.abs(G.hour-h0-0.5)<1e-6&&J(H.said)===J([{who:null,t:S.L.dorm[0]}]),J([fades,G.hour,H.said]));
    S.rand=()=>0.99; H.said=[]; await row[2](GM); check('9-4. 隨機另一句（第二句）',H.said[0].t===S.L.dorm[1]);
    G=fresh(TD('Y2S1',4,4),22,'dorm',{OWN_GUITAR:'entry',ROOM_Y2:true}); S.rand=()=>0; H.said=[]; await STORY.roomItemList(G).find(r=>r[0]==='彈吉他')[2](GM);
    check('9-5. 大二（阿凱不是室友）：只有第二句',H.said[0].t===S.L.dorm[1]); S.rand=r0; });
  // ---------- 10 宜蘭 ----------
  await sec(10,async()=>{ const S=X(), A=S.annDay('y1s1'), D=S.tripDay('y1s1'), w5=TD('Y1S1',5,3), w6=TD('Y1S1',6,3);
    check('10-0. 日期：報名表 11/10（第 11 週週一）21:00、社遊 11/22（第 12 週週六）～11/23',keyOf(A)==='2025-11-10'&&keyOf(D)==='2025-11-22'&&wd7(A)===1&&wd7(D)===6);
    const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
    let G=fresh(A,20.9,'wancai',{CLUB_club_guitar:true}); att(G,w5,w6); rules(); const b0=!!PHONE.byAsk(G,'guitar_trip_y1s1');
    at(A,21.05); rules(); const m=PHONE.byAsk(G,'guitar_trip_y1s1');
    check('10-1. 20:54 還沒有；21:00 社課結束，群組（g:guitar，吉他社）社長學長貼報名表（照稿），兩個選項報名／不報名、回到出發為止',!b0&&!!m&&m.th==='g:guitar'&&PHONE.who(m)==='社長學長'&&m.text===S.L.yilanPost&&m.day===A&&m.h>=21&&m.h<=21.06&&J(m.ask.opts.map(o=>o.t))===J(['報名','不報名'])&&m.ask.until===D*24+8&&PHONE.inGroup(G,'guitar'),J(m));
    G=fresh(A,21.05,'wancai',{CLUB_club_guitar:true}); att(G,w5); rules(); const c1=!!PHONE.byAsk(G,'guitar_trip_y1s1');
    G=fresh(A,21.05,'wancai',{}); att(G,w5,w6); rules(); const c2=!!PHONE.byAsk(G,'guitar_trip_y1s1');
    G=fresh(A+2,21.05,'wancai',{CLUB_club_guitar:true}); att(G,w5,A+2); rules(); const m3=PHONE.byAsk(G,'guitar_trip_y1s1');
    check('10-2. 條件：只去過一次社課＝沒有；不是成員＝沒有；週三第二次去了＝那時候補上（時間照週一 21:00）',!c1&&!c2&&!!m3&&m3.day===A,J([c1,c2,!!m3]));
    // 報名
    G=fresh(A,21.05,'wancai',{CLUB_club_guitar:true}); att(G,w5,w6); rules(); G.money=3000; PHONE.answer(G,'guitar_trip_y1s1',0);
    const th=PHONE.thread(G,'g:guitar').map(x=>PHONE.who(x)+'：'+x.text), q=OUT.get(G,'guitar_trip_yilan');
    check('10-3. 報名：扣 2,500、群組裡你說「報名」、排出遊（11/22 08:00 校門口、宜蘭兩天一夜、只有出發、叫醒）',G.money===500&&th[th.length-1]==='你：報名'&&!!q&&q.day===D&&q.h===8&&q.place==='校門口'&&q.title==='宜蘭兩天一夜'&&q.must===true&&q.alarm===true&&q.travel==='走到校門口約 10 分鐘'&&G.guitar.trip.y1s1==='yes',J([G.money,th,q]));
    { const G2=fresh(A,21.05,'wancai',{CLUB_club_guitar:true}); att(G2,w5,w6); rules(); G2.money=2000; PHONE.answer(G2,'guitar_trip_y1s1',0); const t2=PHONE.thread(G2,'g:guitar').map(x=>PHONE.who(x)+'：'+x.text);
      check('10-4. 錢不夠（2,000）：報名的時候你說「下次吧。」、沒有報名、不扣錢、沒有出遊',G2.money===2000&&t2[t2.length-1]==='你：下次吧。'&&!t2.includes('你：報名')&&!OUT.get(G2,'guitar_trip_yilan')&&G2.guitar.trip.y1s1==='poor',J(t2)); }
    { const G3=fresh(A,21.05,'wancai',{CLUB_club_guitar:true}); att(G3,w5,w6); rules(); G3.money=9000; PHONE.answer(G3,'guitar_trip_y1s1',1); const t3=PHONE.thread(G3,'g:guitar').map(x=>PHONE.who(x)+'：'+x.text);
      check('10-5. 不報名：你說「不報名」、不扣錢、沒有出遊',G3.money===9000&&t3[t3.length-1]==='你：不報名'&&!OUT.get(G3,'guitar_trip_yilan')&&G3.guitar.trip.y1s1==='no'); }
    // 出發：兩天
    use(G); at(D-1,22); OUT.plan(G,{id:'t_other',ev:'ev_guitar_trip_yms',day:D,h:14,place:'x',title:'x'});
    at(D,7.8,'dorm'); const q1=OUT.due(G); let seen=[]; const c0=GM.choose; GM.choose=async o=>{ seen.push(o.map(x=>x.t)); return c0(o); };
    H.said=[]; caps.length=0; H.cgs=[]; H.picks=['出發','去跟子晴說話','彈社課教的那首','那是什麼歌','慢慢寫就好']; await OUT.prompt(GM,q1); GM.choose=c0;
    const L=said(), cap=k=>caps.find(c=>c[0]===k)||[];
    check('10-6. 只有「出發」（必去）',J(seen[0])===J(['出發：宜蘭兩天一夜']),J(seen[0]));
    check('10-7. 時間：08:00 遊覽車上 → 14:00 外澳海邊 → 19:00 宜蘭・民宿 → 隔天 00:15 民宿頂樓 → 15:00 回程遊覽車 → 17:00 回到首都帝大',J(cap('遊覽車上').slice(1))===J([D,8])&&J(cap('外澳海邊').slice(1))===J([D,14])&&J(cap('宜蘭・民宿').slice(1))===J([D,19])&&J(cap('民宿頂樓').slice(1))===J([D+1,0.25])&&J(caps.filter(c=>c[0]==='遊覽車上')[1].slice(1))===J([D+1,15])&&J(cap('回到首都帝大。').slice(1))===J([D+1,17])&&G.weekday===0,J(caps));
    const want=['（車上有人彈吉他，後面的人跟著唱。唱到一半，司機把收音機關了。）','（大家在沙灘上排成一圈彈唱。風很大，譜一直被吹走。）','子晴坐在圈子外面一點的地方，沒有彈，在看海。','高子晴：我在聽浪。……它的節奏一直在變。','（你彈錯了兩個地方。大家照樣拍手。）',
      '（十二點多，樓下還在唱歌。你上頂樓透氣，子晴已經在了，抱著吉他。）','（她彈了一段你沒聽過的旋律。很短，彈完就停了。）','高子晴：……沒有名字。我自己寫的。','高子晴：還沒寫完。你不要跟別人說。','高子晴：嗯。','（她把吉他收進琴袋）','高子晴：明天要早起，學長說要去吃卜肉。','（回程車上大家都睡了。你旁邊的子晴把耳機分了一邊給你，沒說是什麼歌。）'];
    check('10-8. 台詞照稿（海邊去跟子晴說話、彈社課教的那首、問了那是什麼歌、慢慢寫就好、回程分一邊耳機）',J(L)===J(want),J(L));
    check('10-9. 選項照稿（海邊、民宿、頂樓兩次）',J(seen.slice(1))===J([['「去跟子晴說話。」','「留在圈子裡唱。」'],['「彈社課教的那首。」','「我不彈，我幫大家拍照。」'],['「那是什麼歌？」','（不說話，坐在旁邊聽。）'],['「我覺得很好聽。」','「慢慢寫就好。」']]),J(seen));
    check('10-10. 沒有自己的琴、上台彈＝借子晴的（BORROWED_ZQ_GUITAR）；頂樓＝ZQ_ROOFTOP_TUNE、子晴的記憶 HEARD_HER_SONG；CG 登錄點；出遊 done',G.flags.BORROWED_ZQ_GUITAR===true&&G.flags.ZQ_ROOFTOP_TUNE===true&&SOCIAL.has(ZQ,'HEARD_HER_SONG')&&J(H.cgs)===J(['cg_yilan_roof_heroine04'])&&q1.state==='done');
    check('10-11. 同一天約好的別的出遊（11/22 14:00）：人在宜蘭，照錯過處理',(()=>{ OUT.expire(G); return OUT.get(G,'t_other').state==='missed'; })());
    // 另一條路：留在圈子、拍照、不說話、很好聽；有自己的琴；和子晴交往中
    G=fresh(D,7.8,'dorm',{CLUB_club_guitar:true,OWN_GUITAR:'entry',dating_heroine_04:true}); H.FRIEND(ZQ); S.planTrip(G,'y1s1'); H.said=[]; H.picks=['出發','留在圈子裡唱','彈社課教的那首','不說話','我覺得很好聽']; await OUT.prompt(GM,OUT.due(G));
    const L2=said();
    check('10-12. 留在圈子裡唱、不說話：稿的那幾句；有自己的琴＝不記借琴',L2.includes('（你唱了三首。子晴回來的時候，手機在錄浪的聲音。）')&&L2.includes('（她又彈了一次，彈到同一個地方停下來。）')&&L2.includes('高子晴：……這邊我一直寫不下去。')&&!G.flags.BORROWED_ZQ_GUITAR,J(L2));
    check('10-13. 和子晴交往中：頂樓最後一句換成「……你明天坐我旁邊。」（很好聽那一支：停一下之後）',L2.includes('高子晴：你又聽不出來好不好。')&&L2[L2.indexOf('（停一下）')+1]==='高子晴：……你明天坐我旁邊。'&&!L2.includes('高子晴：……謝了。'),J(L2));
    G=fresh(D,7.8,'dorm',{CLUB_club_guitar:true,dating_heroine_01:true}); H.FRIEND(ZQ); S.planTrip(G,'y1s1'); H.said=[]; H.picks=['出發',0,'我不彈',0,'我覺得很好聽']; await OUT.prompt(GM,OUT.due(G)); const L3=said();
    check('10-14. 在和別人交往：頂樓照演（「……謝了。」）；拍照那一支照稿、不記借琴',L3.includes('高子晴：……謝了。')&&L3.includes('（你拍了很多張。子晴那張，她剛好在笑。）')&&!G.flags.BORROWED_ZQ_GUITAR&&!L3.includes('高子晴：……你明天坐我旁邊。'),J(L3));
    { const ev=evOf('ev_guitar_trip_yilan'), last=ev.dialogue.slice(-2);
      check('10-15. 回程兩版：有 ZQ_ROOFTOP_TUNE＝分一邊耳機；沒有＝「（回程車上大家都睡了。）」',J(last.map(l=>[l.text,l.if,l.unless]))===J([['（回程車上大家都睡了。你旁邊的子晴把耳機分了一邊給你，沒說是什麼歌。）',{flags:['ZQ_ROOFTOP_TUNE']},undefined],['（回程車上大家都睡了。）',undefined,{flags:['ZQ_ROOFTOP_TUNE']}]])); }
    { const c=CHARACTERS[ZQ]; const G4=fresh(D,10,'campus'); const e1=S.sched(c,G4); at(D+1,9); const e2=S.sched(c,G4); at(D+1,17.5); const e3=S.sched(c,G4); at(D-1,10); const e4=S.sched(c,G4);
      check('10-16. 11/22 08:00～11/23 17:00 子晴的作息是「吉他社社遊」（不在校園、公館）；之前、之後照舊',!!e1&&e1.away==='吉他社社遊'&&e1.zone===null&&!!e2&&!e3&&!e4&&S.sched(CHARACTERS.heroine_01,G4)===null&&STORY.SCHED_X.includes(S.sched),J([e1,e2,e3,e4])); } });
  // ---------- 11 陽明山 ----------
  await sec(11,async()=>{ const S=X(), A=S.annDay('y1s2'), D=S.tripDay('y1s2'), w5=TD('Y1S1',5,3), w6=TD('Y1S1',6,3);
    check('11-0. 日期：大一下第 10 週週一 4/27 21:00、週六 5/2',keyOf(A)==='2026-04-27'&&keyOf(D)==='2026-05-02');
    let G=fresh(A,21.05,'wancai',{CLUB_club_guitar:true}); att(G,w5,w6); STORY.phoneRules(GM); PHONE.tick(G); const m=PHONE.byAsk(G,'guitar_trip_y1s2');
    check('11-1. 群組：社長學長「這學期社遊一天就好，陽明山野餐。」、報名／不報名（大一上去過兩次也算，條件同上）',!!m&&m.text===S.L.ymsPost&&PHONE.who(m)==='社長學長'&&J(m.ask.opts.map(o=>o.t))===J(['報名','不報名']),J(m));
    G.money=700; PHONE.answer(G,'guitar_trip_y1s2',0); const q=OUT.get(G,'guitar_trip_yms');
    check('11-2. 報名：扣 600、出遊 5/2 12:00 校門口（陽明山一日）',G.money===100&&!!q&&q.day===D&&q.h===12&&q.title==='陽明山一日'&&q.must===true,J(q));
    at(D,11.8,'dorm'); H.said=[]; caps.length=0; H.picks=['出發','陪她去旁邊走走']; await OUT.prompt(GM,OUT.due(G)); const L=said();
    check('11-3. 沒有聽過頂樓那首：「今天風好舒服。」；陪她走走＝稿的四句；14:00 擎天崗草原、19:30 回到學校',J(L)===J(['子晴這次在圈子裡彈。','高子晴：今天風好舒服。','（你們走到步道口。牛在遠一點的地方吃草。）','高子晴：我爸說彈吉他不能當飯吃。','高子晴：……我沒有要當飯吃。我只是想做一個東西出來。'])&&J((caps.find(c=>c[0]==='擎天崗草原')||[]).slice(1))===J([D,14])&&J((caps.find(c=>c[0]==='回到首都帝大。')||[]).slice(1))===J([D,19.5]),J([L,caps]));
    G=fresh(D,11.8,'dorm',{CLUB_club_guitar:true,ZQ_ROOFTOP_TUNE:true}); H.FRIEND(ZQ); S.planTrip(G,'y1s2'); H.said=[]; H.picks=['出發','留下來彈']; await OUT.prompt(GM,OUT.due(G));
    check('11-4. 有 ZQ_ROOFTOP_TUNE：「今天彈別人的歌。……我的還沒好。」；留下來彈＝那一句旁白',J(said())===J(['子晴這次在圈子裡彈。','高子晴：今天彈別人的歌。……我的還沒好。','（你們彈到太陽快下山。子晴說：「你換和弦比上學期快了。」）']),J(said()));
    { const c=CHARACTERS[ZQ], G5=fresh(D,13,'campus'); const e=S.sched(c,G5); at(D,20); check('11-5. 5/2 12:00～19:30 子晴的作息是「吉他社社遊」',!!e&&e.away==='吉他社社遊'&&S.sched(c,G5)===null); } });
  // ---------- 12 ev_ziqing_secret_game ----------
  await sec(12,async()=>{ const ev=evOf('ev_ziqing_secret_game'), d=TD('Y1S2',11,1);
    const play=async mem=>{ const G=fresh(d,19.5,'wancai'); H.FRIEND(ZQ); SOCIAL.remember(ZQ,'CONTEST_DAY',''); if(mem) SOCIAL.remember(ZQ,'HEARD_HER_SONG',''); H.said=[]; H.picks=[0,0,0,0]; await EVENTS.run(ev); return said(); };
    const a=await play(true), b=await play(false);
    check('12-1. 有 HEARD_HER_SONG：開頭多「宜蘭那首，我寫完了一半。」（AA_619 3-1）',a[0]==='高子晴：宜蘭那首，我寫完了一半。'&&a[1]==='高子晴：（把筆電轉過來）欸，你幫我玩一下，現在。',J(a.slice(0,2)));
    check('12-2. 沒有：照舊從「（把筆電轉過來）」開始',b[0]==='高子晴：（把筆電轉過來）欸，你幫我玩一下，現在。'&&!b.includes('高子晴：宜蘭那首，我寫完了一半。'),J(b.slice(0,2))); });
  // ---------- 13 經濟系那一年 ----------
  await sec(13,async()=>{ const S=X(), d=STORY.dayOfKey('2024-10-12');
    const G=fresh(d,15.4,'xs_tongxian',{CLUB_club_guitar:true,OWN_GUITAR:'entry'}); G.stage='econ'; H.FRIEND(ZQ); att(G,d-3,d-5); H.said=[];
    const r1=await S.shop(GM), r2=await S.look(GM); const room=STORY.roomItemList(G).some(r=>r[0]==='彈吉他');
    check('13-1. 經濟系那一年：店裡的看看、買東西不演、房間沒有彈吉他、社遊條件不成立、2-1 不演、偶遇不演',r1===false&&r2===false&&!H.said.length&&!room&&!S.tripOk(G)&&!S.c21Due(G)&&!S.encDue(G),J([r1,r2,room])); });
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
