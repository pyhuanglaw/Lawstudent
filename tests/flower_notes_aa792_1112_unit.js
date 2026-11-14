// 花序 Flower Notes 接 AA 的稿（FLOWER-NOTES-1110，USER_WANTS X325；AA_792 企劃線 8475a3b85）——不需要瀏覽器（D131）。
// 稿一律用 git show 8475a3b85 讀來逐字比（不寫死台詞）；讀不到（淺層 clone）＝「逐字對稿」那幾項跳過（印 SKIP），其他照跑。
//   0. 檔案在、index.html 的載入順序；匯入工具 --check；白名單有 AA_792@8475a3b85
//   1. 逐字對稿：店名、note、十樣商品（名字、價錢、line、love、no）、花藝師（who、greet、closed、hours、buy）、13 區的「看」
//   2. replace 四列：old 不在 gift_holiday.js、new 在；原本兩樣的 id、價錢、love、no 沒動；匯入工具對不上就停下來
//   3. 店裡賣十樣（GIFTH.sells、買禮物清單的名字和價錢）；每一樣：花藝師 greet → 扣稿上的價錢、放進包包（shop gg_flower）→ 那一樣的 buy 句子 → 「你買了…」；不扣時段；錢不夠不扣
//   4. 營業時間 10:00～21:00（PLACES.hours.flower_notes）：沒開＝公館門口演 closed、不進去；櫃檯不賣；開著＝門照常；打烊人還在店裡＝XSCLOSE（花藝師）
//   5. 「看」：稿的 13 個 key 每一個都有互動點、look＝稿的那一句、key 是配置有的 kind；按鈕是原本就有的字；配置的中央展示台（稿沒有）不放；櫃檯原本暫用的那一句拿掉了
//   6. 舊存檔：包包裡原本的一束花、向日葵讀得進來、節日送得出去（學姊收一束花＝love）；新的八樣沒有喜好＝照對方的 ok 那一格（不另外寫反應）
// 2026-11-12 STALE-SOURCES-1112：AA 改了源稿（4021747069，11-12 04:07 回 LAWWW-C 六問，_meta.lawww_1112），白名單換版。這支測試的舊期望（8475a3b85）改了這幾處，原因都是稿改了：
//   0／1  SHA 8475a3b85 → 4021747069；白名單 approvedBy 多一段、history 有舊版；staff 多 closeLine／notOpen／typhoonOff；「看」13 句 → 14 句（多 plinth_center）；多 lookButtons 14 個
//   4     門口：舊＝10:00～21:00 以外一律演 closed；新＝開門以前（清晨 6 點到 10:00）演 not_open（稿 ④「不演今日已打烊」）、打烊以後到清晨 6 點演 closed、颱風天只寫開放時間（稿 ⑥）
//   5     舊＝按鈕用原本就有的字（配置的那幾個、其他的「看看」）、中央展示台稿沒有句子＝不放；新＝按鈕字照稿的 look_buttons（②）、中央展示台有句子＝放在配置原本排好的位置（①）
//   6     舊＝八樣新花送出去演各人通用的 ok 句；新＝演稿的 give_ok_flower 那一句（⑤；芯慈稿沒寫＝照舊 ok；原本兩樣不變）；好感照舊算 ok
// 用法：node tests/flower_notes_aa792_1112_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const SHA='335301d353'/* 2026-11-12 再換：芯慈收花補一句（舊 4021747069）*/, OLD_SHA='8475a3b85', DOC='docs/story_planning/AA_792_flower_notes.json';
const J=JSON.stringify;
const read=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); return true; };
const FILES=['src/data/fest_events.js','src/fest3d.js','src/xs_close3d.js','src/data/flower_notes_layout.js','src/data/gift_holiday.js','src/gifthol3d.js','src/data/flower_notes_text.js','src/flower_notes_sys3d.js'];
let missing=[], err=''; try{ for(const f of FILES) if(!load(f)) missing.push(f); }catch(e){ err=String(e&&e.stack||e); }
let DOCJ=null, docErr=''; try{ DOCJ=JSON.parse(cp.execFileSync('git',['-C',H.ROOT,'show',SHA+':'+DOC],{encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:1<<24})); }catch(e){ docErr=String(e.stderr||e.message).trim().split('\n').pop(); }
const skip=name=>console.log('SKIP '+name+'　讀不到稿（git show '+SHA+'：'+docErr+'）——只跳過逐字對稿');
const vs=(name,f)=>{ if(!DOCJ) return skip(name); let r; try{ r=f(DOCJ); }catch(e){ r=[false,String(e)]; } check(name,!!r[0],r[1]); };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（中斷這一節）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const D=k=>H.D(k);
let toasts=[]; GM.toast=t=>toasts.push(t);
GM.money=n=>{ H.G.money+=n; };
const lv=(id,n)=>{ const r=SOCIAL.rel(id); Object.assign(r,{fam:n>=4?65:(n>=3?45:(n>=2?25:10)),trust:n>=4?50:(n>=3?30:0),comf:n>=4?45:0,npcRom:n>=6?60:(n>=5?35:0),rom:n>=6?35:0}); SOCIAL.remember(id,'FIRST_MET',''); };
const setup=(key,h,o)=>{ o=o||{}; const G=H.fresh(key,h,o.zone||'flower_notes',o.flags||{}); G.outings=[]; G.contacts=G.contacts||{}; G.money=o.money!=null?o.money:5000;
  for(const [id,n] of Object.entries(o.lv||{})) lv(id,n); if(STORY._bindGM) STORY._bindGM(GM); if(typeof FNS!=='undefined') FNS._reset(); return G; };
const run=async(fn,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); H.entered=[]; toasts=[]; const r=await fn(); return {r,S:H.said.slice(),L:H.said.map(s=>s.t),O:H.opts.slice()}; };
const COUNTER={kind:'gg_flower',label:'買花',fnCounter:true}, DOOR={fnDoor:true,label:'進入花序',exit:{to:'flower_notes',spawn:{x:0,z:6.1}}};

(async()=>{
  /* ======================= 0 檔案、匯入工具 ======================= */
  const ready=!missing.length&&!err&&typeof FNS!=='undefined'&&typeof FLOWER_NOTES_TEXT!=='undefined'&&typeof GIFTH!=='undefined';
  check('0. 載入 gift_holiday.js、gifthol3d.js、flower_notes_text.js、flower_notes_sys3d.js',ready,(missing.length?'沒有 '+missing.join('、')+' ':'')+err.slice(0,300));
  { const html=read('index.html'), at=f=>html.indexOf('src="'+f+'?v=');
    check('0. index.html 載入 flower_notes_text.js、flower_notes_sys3d.js（在 gifthol3d.js、flower_notes3d.js、xs_close3d.js、places.js 後面）',
      at('src/data/flower_notes_text.js')>0&&at('src/flower_notes_sys3d.js')>at('src/data/flower_notes_text.js')&&at('src/data/flower_notes_text.js')>at('src/gifthol3d.js')&&at('src/gifthol3d.js')>at('src/flower_notes3d.js')&&at('src/flower_notes_sys3d.js')>at('src/xs_close3d.js')&&at('src/xs_close3d.js')>at('src/data/places.js')); }
  { let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/gift/import_gift_holiday.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out)&&out.includes(DOC+'@'+SHA); }catch(e){ out=String(e.stderr||e.message); }
    check('0. 匯入工具 --check：gift_holiday.js、flower_notes_text.js 和白名單上的稿（含 AA_792@'+SHA+'）一致',ok,out.trim().split('\n').pop().slice(0,200));
    const A=JSON.parse(read('docs/handoff/story_import_allow.json')).files.filter(e=>e.path===DOC);
    check('0. 白名單：AA_792 一筆、sha '+SHA+'、approved、approvedBy 開頭「AA（FLOWER-NOTES-1110）」；舊版 '+OLD_SHA+' 在 history',A.length===1&&A[0].sha===SHA&&A[0].status==='approved'&&A[0].approvedBy.indexOf('AA（FLOWER-NOTES-1110）')===0&&(A[0].history||[]).some(h=>h.sha===OLD_SHA),J(A.map(e=>[e.sha,e.status,e.approvedBy]))); }
  if(!ready){ console.log('FAILED '+H.fails); process.exit(1); }
  const X=GIFT_HOLIDAY, T=FLOWER_NOTES_TEXT, SHOP=X.shops.gg_flower, IDS=SHOP.items;

  /* ======================= 1 逐字對稿 ======================= */
  vs('1. 店：代號 gg_flower、店名、note、十樣的順序和稿一樣',d=>[d.shop.id==='gg_flower'&&SHOP.name===d.shop.name&&SHOP.note===d.shop.note&&J(IDS)===J(d.shop.items)&&IDS.length===10,J([SHOP.name,IDS])]);
  vs('1. 十樣商品：名字、價錢、line、love、no、shop 和稿逐字一樣',d=>{ const bad=d.shop.items.filter(g=>{ const a=X.items[g], b=d.items[g]; return !a||a.name!==b.name||a.price!==b.price||a.line!==b.line||J(a.love)!==J(b.love)||J(a.no)!==J(b.no)||a.shop!=='gg_flower'||b.shop!=='gg_flower'; }); return [!bad.length&&Object.keys(d.items).length===10,bad.join('、')]; });
  vs('1. 花藝師：who、greet 三句、closed、hours、十樣的 buy 句子和稿逐字一樣',d=>[J(T.staff)===J({who:d.staff.who,greet:d.staff.greet,closed:d.staff.closed,hours:d.staff.hours,buy:d.staff.buy,closeLine:d.staff.closed_line,notOpen:d.staff.not_open,typhoonOff:true})&&d.staff.typhoon==='照公館其他店：颱風天休息。'&&T.staff.closeLine===XSCLOSE.LINE&&/^（.*）$/.test(T.staff.notOpen)&&T.staff.notOpen!==T.staff.closed&&T.staff.greet.length===3&&J(Object.keys(T.staff.buy))===J(d.shop.items),J(Object.keys(T.staff))]);
  vs('1. 「看」14 句和稿逐字一樣（舊 13 句；多店中央展示台 plinth_center）',d=>[J(T.looks)===J(d.looks)&&Object.keys(T.looks).length===14&&typeof T.looks.plinth_center==='string',Object.keys(T.looks).length+' 句']);
  vs('1. 按鈕字 lookButtons 14 個和稿的 look_buttons 逐字一樣、key 和 looks 一模一樣',d=>[J(Object.keys(T.lookButtons||{}).sort())===J(Object.keys(T.looks).sort())&&Object.keys(d.look_buttons).every(k=>T.lookButtons[k]===d.look_buttons[k])&&Object.keys(d.look_buttons).length===14,J(T.lookButtons)]);
  vs('1. 八樣新花的收禮句 GIFT_HOLIDAY.flowerOk：items＝g_fn_* 八樣、lines＝稿的 give_ok_flower 八位逐字（2026-11-12 335301d353 補了芯慈；舊期望七位、芯慈沒有）',d=>{ const F=X.flowerOk||{}, want=Object.assign({},d.give_ok_flower); delete want.note; return [J(F.items)===J(IDS.filter(g=>/^g_fn_/.test(g)))&&F.items.length===8&&J(Object.keys(F.lines).sort())===J(Object.keys(want).sort())&&Object.keys(want).every(k=>F.lines[k]===want[k]||F.lines[k]===require('./aa959_map.js').map(want[k],'gift_holiday.js',k)/* RC2-PORT-DEV-1114：AA_959 第 435 列（芯慈那一句），稿上的字照表換完再比 */)&&Object.keys(want).length===8&&!!F.lines.classmate_xinci,J(Object.keys(F.lines||{}))]; });
  check('1. 資料記了來源：GIFT_HOLIDAY.srcFlower、FLOWER_NOTES_TEXT.src＝AA_792@'+SHA,X.srcFlower===DOC+'@'+SHA&&T.src===DOC+'@'+SHA,J([X.srcFlower,T.src]));

  /* ======================= 2 replace、原本兩樣 ======================= */
  { const js=read('src/data/gift_holiday.js');
    vs('2. replace 四列：old 不在 gift_holiday.js 了、new 在（各一次）',d=>{ const bad=d.replace.filter(r=>r.file!=='src/data/gift_holiday.js'||js.includes(r.old)||js.split(r.new).length!==2); return [d.replace.length===4&&!bad.length,bad.map(r=>r.at).join('、')]; });
    check('2. 花攤時期的字不在了（「公館站口花攤」「牛皮紙」「玻璃紙」）',!/公館站口花攤|包裝紙是牛皮紙|用玻璃紙包著/.test(js)); }
  check('2. 原本兩樣沒動：g_bouquet 450（學姊 love、以安 no）、g_sunflower 120（沛珊 love）；排在最前面',X.items.g_bouquet.price===450&&J(X.items.g_bouquet.love)===J(['heroine_05'])&&J(X.items.g_bouquet.no)===J(['heroine_01'])&&X.items.g_sunflower.price===120&&J(X.items.g_sunflower.love)===J(['classmate_peishan'])&&J(X.items.g_sunflower.no)==='[]'&&IDS[0]==='g_bouquet'&&IDS[1]==='g_sunflower',J([X.items.g_bouquet,X.items.g_sunflower]));
  check('2. 新的八樣代號 g_fn_*、love／no 都是空的（X325 不替角色設定新的花卉喜好）、沒有人的反應表單獨寫這八樣',IDS.slice(2).length===8&&IDS.slice(2).every(g=>/^g_fn_/.test(g)&&!X.items[g].love.length&&!X.items[g].no.length&&GIFTH.PEOPLE.every(p=>!X.react[p].item[g])),IDS.slice(2).join(' '));
  if(DOCJ){ const py=code=>{ try{ cp.execFileSync('python3',['-c',code],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); return 'ran'; }catch(e){ return String(e.stderr||''); } };
    const pre="import sys,json,subprocess;sys.path.insert(0,'tools/gift');sys.path.insert(0,'tools/story');import import_gift_holiday as M;g=lambda s,p:json.loads(subprocess.check_output(['git','show',s+':'+p]).decode());"
      +"mk=lambda:M.build(g('5acf44bbc',M.P1),g('1edb14888',M.P2),g('246ef6735',M.P3),['a','b','c']);d=g('"+SHA+"',M.P792);K=M.layout_kinds();";
    const ok=py(pre+"M.overlay_792(mk(),d,'x',K)");
    const e1=py(pre+"d['replace'][2]['old']='沒有這一句';M.overlay_792(mk(),d,'x',K)");
    const e2=py(pre+"D=mk();D['items']['g_card']['line']=d['replace'][3]['old'];M.overlay_792(D,d,'x',K)");
    const e3=py(pre+"d['items']['g_bouquet']['price']=500;M.overlay_792(mk(),d,'x',K)");
    const e4=py(pre+"d['items']['g_fn_rose']['love']=['heroine_01'];M.overlay_792(mk(),d,'x',K)");
    const e5=py(pre+"d['looks']['no_such_kind']='x';M.overlay_792(mk(),d,'x',K)");
    check('2. 匯入工具：照稿跑得過；old 對不上、old 出現兩次、原本的價錢被改、新商品有 love、「看」的 key 配置沒有 → 停下來',ok==='ran'&&/不是 old/.test(e1)&&/出現 2 次/.test(e2)&&/g_bouquet/.test(e3)&&/X325/.test(e4)&&/no_such_kind/.test(e5),[ok,e1,e2,e3,e4,e5].map(s=>s.split('\n').filter(Boolean).pop()).join(' | ').slice(0,400));
    /* 4021747069 多的欄位 */
    const f0=py(pre+"d=g('"+OLD_SHA+"',M.P792);r=M.overlay_792(mk(),d,'x',K);assert 'lookButtons' not in r and 'closeLine' not in r['staff'] and len(r['looks'])==13");
    const f1=py(pre+"del d['look_buttons']['plant_big'];M.overlay_792(mk(),d,'x',K)");
    const f2=py(pre+"d['look_buttons']['no_such']='看看';M.overlay_792(mk(),d,'x',K)");
    const f3=py(pre+"d['staff']['closed_line']='我們要關門了。';M.overlay_792(mk(),d,'x',K)");
    const f4=py(pre+"d['staff']['typhoon']='（鐵門拉下來了。）';M.overlay_792(mk(),d,'x',K)");
    const f5=py(pre+"d['give_ok_flower']['zhe']='謝啦。';M.overlay_792(mk(),d,'x',K)");
    const f6=py(pre+"M.overlay_792(mk(),d,'x',K-{'plinth_center'})");
    const f7=py(pre+"d['staff']['sold_out']='x';M.overlay_792(mk(),d,'x',K)");
    const f8=py(pre+"d['staff']['not_open']='還沒開。';M.overlay_792(mk(),d,'x',K)");
    const f9=py(pre+"D=mk();r=M.overlay_792(D,d,'x',K);assert r['_noFlowerOk']==[] and len(D['flowerOk']['items'])==8 and 'plinth_center' in K");
    check('2. 匯入工具（4021747069 多的欄位）：舊稿 '+OLD_SHA+' 照樣跑得過（沒有新欄位）；look_buttons 少一個／多一個、closed_line 和 AA_700 不一樣、typhoon 不是那一句規則、give_ok_flower 有不認得的人、配置沒有中央展示台、staff 多了不認得的欄位、not_open 不是旁白 → 停下來；芯慈沒寫到＝印提醒',
      f0==='ran'&&/look_buttons：key 要和 looks 一模一樣/.test(f1)&&/look_buttons：key 要和 looks 一模一樣/.test(f2)&&/和 AA_700 的打烊句/.test(f3)&&/staff\.typhoon：只認規則/.test(f4)&&/give_ok_flower：不認得的人/.test(f5)&&/plinth_center/.test(f6)&&/不認得的欄位/.test(f7)&&/要是旁白/.test(f8)&&f9==='ran',[f0,f1,f2,f3,f4,f5,f6,f7,f8,f9].map(s=>s.split('\n').filter(Boolean).pop().slice(0,60)).join(' | ')); }
  else skip('2. 匯入工具對不上就停下來');

  /* ======================= 3 買 ======================= */
  await sec(3,async()=>{ const G=setup('2025-10-15',15);
    check('3. 店裡賣十樣（GIFTH.sells）、選項是原本的「買禮物…」、包包和送禮選單的店名＝花序 Flower Notes',J(GIFTH.sells(G,'gg_flower'))===J(IDS)&&GIFTH.shopOpt(G,'gg_flower').t==='買禮物…'&&GIFTH.shopName('gg_flower')===SHOP.name,J(GIFTH.sells(G,'gg_flower')));
    const r0=await run(()=>STORY.interact(COUNTER,GM),['算了']);
    check('3. 櫃檯：花藝師先說 greet 第一句，清單＝十樣「名字　價錢 元」＋「算了」；選算了不扣錢',r0.r===true&&r0.S[0].who===T.staff.who&&r0.S[0].t===T.staff.greet[0]&&J(Array.from(r0.O[0]))===J(IDS.map(g=>X.items[g].name+'　'+X.items[g].price+' 元').concat(['算了']))&&G.money===5000&&r0.S.length===1,J(r0.O[0]));
    const bad=[]; let n=1;
    for(const gid of IDS){ const it=X.items[gid], G2=setup('2025-10-15',15,{money:5000}); FNS._reset(); for(let k=0;k<n;k++) FNS.greet(); const r=await run(()=>STORY.interact(COUNTER,GM),[it.name+'　']);
      const want=[T.staff.greet[n%3]].concat(T.staff.buy[gid]).concat(['你買了'+it.name+'，放進包包。']), bag=GIFTH.bag(G2);
      const whoOk=r.S.every((s,i)=>i===r.S.length-1?s.who===null:(/^（/.test(s.t)?s.who===null:s.who===T.staff.who));
      if(!(J(r.L)===J(want)&&whoOk&&G2.money===5000-it.price&&bag.length===1&&bag[0].id===gid&&bag[0].shop==='gg_flower'&&G2.hour===15)) bad.push(gid+' '+J(r.L)+' 錢 '+G2.money); n++; }
    check('3. 十樣每一樣：greet（輪流）→ 那一樣的 buy 句子（（）開頭＝旁白、其他＝花藝師）→「你買了…，放進包包。」；扣稿上的價錢、進包包（shop gg_flower）、不扣時段',!bad.length,bad.join(' ／ ').slice(0,400));
    const G3=setup('2025-10-15',15,{money:100}); const r3=await run(()=>STORY.interact(COUNTER,GM),[X.items.g_fn_dome.name]);
    check('3. 錢不夠（100 元買 1680 的玻璃罩）：不扣錢、不進包包、不演 buy 句子',G3.money===100&&!GIFTH.bag(G3).length&&!r3.L.some(t=>T.staff.buy.g_fn_dome.includes(t))&&toasts.includes('錢不夠'),J([r3.L,toasts]));
    const G4=setup('2025-10-15',15); for(let k=0;k<GIFTH.MAX;k++) GIFTH.rec(G4).bag.push({id:'g_card',day:G4.day,shop:'cvs'}); const r4=await run(()=>STORY.interact(COUNTER,GM),[]);
    check('3. 包包滿了：不出清單、原本那一句提示',r4.r===true&&!r4.O.length&&toasts.length===1&&toasts[0]===GIFTH.shopOpt(G4,'gg_flower').hint&&G4.money===5000,J([r4.O,toasts])); });

  /* ======================= 4 營業時間 ======================= */
  await sec(4,async()=>{ const hs=FNS.hours(), P=PLACES.hours.flower_notes;
    check('4. 營業時間照稿 '+T.staff.hours+'：登記在 PLACES.hours.flower_notes（店家、每天）',J(hs)==='[10,21]'&&T.staff.hours==='10:00～21:00'&&!!P&&P.shop===true&&P.rules.week.length===7&&P.rules.week.every(w=>J(w)==='[10,21]'),J(P));
    /* 舊期望：10:00～21:00 以外一律演 closed。4021747069（稿 ④）：開門以前（清晨 6 點到 10:00）演 not_open、不演「今日已打烊」；打烊以後到清晨 6 點照舊演 closed */
    const res=[]; for(const h of [3,5.9,6,8,9.99,10,15,20.99,21,23.5]){ const G=setup('2025-10-15',h,{zone:'gongguan'}); const r=await run(()=>STORY.interact(DOOR,GM),[]); res.push([h,FNS.open(G),PLACES.isOpen('flower_notes',h,G.day),J(r.S.map(x=>[x.who,x.t])),r.r===true||r.r==='closed',H.entered.length]); }
    const want={3:'c',5.9:'c',6:'n',8:'n',9.99:'n',10:true,15:true,20.99:true,21:'c',23.5:'c'}, lineOf={c:T.staff.closed,n:T.staff.notOpen};
    check('4. 公館門口：打烊以後（21:00 到清晨 6 點）＝closed 那一句；開門以前（6:00 到 10:00）＝not_open 那一句（不演「今日已打烊」）；都是旁白、只演一句、不進去；營業中不演（門照原本的走）',res.every(([h,o,po,said,stop,ent])=>{ const w=want[h]; return w===true?(o&&po&&said==='[]'):(!o&&!po&&said===J([[null,lineOf[w]]])&&stop&&ent===0); })&&!/今日已打烊/.test(T.staff.notOpen),J(res));
    { let ty=null; for(let d=1;d<1500&&ty==null;d++) if(CALENDAR.typhoon&&CALENDAR.typhoon(d)) ty=d;
      if(ty==null) check('4. 颱風天（日曆上找不到颱風假）',false); else for(const h of [8,15,22]){ const G=setup('2025-10-15',h,{zone:'gongguan'}); G.day=ty; const r=await run(()=>STORY.interact(DOOR,GM),[]);
        check('4. 颱風天 '+h+' 點（稿 ⑥ 照公館其他店休）：不進去、不演 closed／not_open，只寫「…颱風假，今天沒開。」',!FNS.open(G)&&PLACES.typhoonShops.includes('flower_notes')&&T.staff.typhoonOff===true&&r.S.length===0&&H.entered.length===0&&toasts.length===1&&toasts[0]===PLACES.closedText('flower_notes',h,ty)&&/颱風假/.test(toasts[0]),J([r.S,toasts])); } }
    check('4. 21:00 人還在店裡（稿 ③）：稿的 staff.closed_line＝AA_700 那一句（XSCLOSE.LINE）、花藝師說、走到公館門外',T.staff.closeLine===XSCLOSE.LINE&&XSCLOSE.ZONES.flower_notes.who===T.staff.who&&XSCLOSE.ZONES.flower_notes.to==='gongguan');
    { const G=setup('2025-10-15',22,{zone:'gongguan'}); const r=await run(()=>STORY.interact(DOOR,GM),[]); check('4. 沒開的時候：closed 是旁白（沒有說話的人）、只演這一句；另外照其他店寫開放時間（PLACES.closedText）',r.S.length===1&&r.S[0].who===null&&r.S[0].t===T.staff.closed&&toasts.length===1&&toasts[0]===PLACES.closedText('flower_notes',22,G.day)&&toasts[0].includes(SHOP.name),J([r.S,toasts])); }
    { const G=setup('2025-10-15',21.2); const r=await run(()=>STORY.interact(COUNTER,GM),[X.items.g_bouquet.name]); check('4. 打烊以後人還在櫃檯前：不賣（不出清單、不扣錢）、也沒有原本暫用的「看」',r.r===true&&!r.O.length&&!r.L.length&&G.money===5000&&!GIFTH.bag(G).length,J([r.L,r.O])); }
    const C=XSCLOSE.ZONES.flower_notes; const Go=setup('2025-10-15',20.5), Gc=setup('2025-10-15',21.1);
    check('4. 打烊人還在店裡照 AA_700（XSCLOSE）：說話的人＝花藝師、出去到公館；21:00 以後算打烊那一刻',!!C&&C.who===T.staff.who&&C.to==='gongguan'&&C.place==='flower_notes'&&XSCLOSE.whoOf('flower_notes')===T.staff.who&&XSCLOSE.placeOpen('flower_notes',Go)&&!XSCLOSE.placeOpen('flower_notes',Gc)&&XSCLOSE.closingMoment('flower_notes',Gc)&&XSCLOSE.finalClose('flower_notes',Gc),J(C));
    check('4. gifthol3d.js 原本花攤的時間（09:00 起）不再用：GIFTH.flowerOpen 照花序的時間',(()=>{ const G=setup('2025-10-15',9.5); const a=GIFTH.flowerOpen(G); G.hour=10.5; return !a&&GIFTH.flowerOpen(G); })()); });

  /* ======================= 5 「看」 ======================= */
  await sec(5,async()=>{ const L=FLOWER_NOTES_LAYOUT, PTS=FNS.lookPoints(L), kinds=new Set(['counter']); if(L.display) kinds.add('plinth_center');   /* 中央橢圓展示台＝配置的 display */ for(const it of L.items0.concat(L.items1)) kinds.add(it.kind+(it.kind==='plinth'?'_'+it.top:''));
    const keys=Object.keys(T.looks), miss=keys.filter(k=>!PTS.some(p=>p.kind===k)), unk=keys.filter(k=>!kinds.has(k));
    check('5. 稿的 14 個 key 都是配置有的 kind、每一個都有「看」的位置（舊 13 個）',keys.length===14&&!miss.length&&!unk.length,'沒有位置：'+miss.join(' ')+'；配置沒有：'+unk.join(' '));
    /* 真的建區域（假的 E）：互動點的 look＝稿的那一句 */
    const IT=[]; let built=false; if(typeof Z3==='undefined'){ globalThis.Z3={ZONES:{flower_notes:{build(E){ built=true; return {}; }}}}; FNS.hookZone(); Z3.ZONES.flower_notes.build({interactables:IT}); }
    const bad=IT.filter(i=>!i.fnLook||i.look!==T.looks[i.fnLook]||!(i.radius>0)||i.lv==null);
    check('5. 區域建好以後：每個「看」的互動點 look＝稿的那一句（game3d.js 原本的「看」顯示）、標了樓層；14 個 key 都有',built&&IT.length===PTS.length&&!bad.length&&keys.every(k=>IT.some(i=>i.fnLook===k)),IT.length+' 個；'+bad.map(i=>i.fnLook).join(' '));
    /* 舊期望：按鈕的字都是原本就有的（配置的「看永生花」那幾個、其他「看看」）。4021747069（稿 ②）：14 個點各一個按鈕字，照稿 */
    check('5. 按鈕的字照稿的 look_buttons（每個點＝它那個 key 的字；大盆栽兩個點同一個字）；沒有「看看」了；區域建出來的互動點也是',PTS.every(p=>p.label===T.lookButtons[p.kind])&&IT.every(i=>i.label===T.lookButtons[i.fnLook])&&!PTS.some(p=>p.label==='看看')&&new Set(PTS.map(p=>p.label)).size===14,J([...new Set(PTS.map(p=>p.label))]));
    { const B=FLOWER_NOTES_TEXT.lookButtons; delete FLOWER_NOTES_TEXT.lookButtons; const P0=FNS.lookPoints(L); FLOWER_NOTES_TEXT.lookButtons=B;
      check('5. 資料沒有 lookButtons（舊的資料檔）＝照舊用配置的字和「看看」，不壞',P0.length===PTS.length&&P0.find(p=>p.kind==='preserved_shelf').label===L.looks.find(q=>q.id==='preserved').label&&P0.find(p=>p.kind==='counter').label==='看看'); }
    /* 舊期望：配置的「看中央展示台」稿沒有句子＝不放。4021747069（稿 ①）補了 looks.plinth_center：放在配置原本排好的位置（looks 的 id display），就在展示台（配置 display、模型有做）旁邊 */
    { const q=L.looks.find(x=>x.id==='display'), d=L.display, pc=PTS.filter(p=>p.kind==='plinth_center'), p0=pc[0]||{}, dx=Math.max(d.x-d.w/2-p0.x,0,p0.x-(d.x+d.w/2)), dz=Math.max(d.z-d.d/2-p0.z,0,p0.z-(d.z+d.d/2)), gap=Math.hypot(dx,dz);
      check('5. 中央展示台（稿 ①）：一個互動點、位置＝配置 looks 的 display（沒有另外編座標）、在展示台外面 1 m 以內（'+gap.toFixed(2)+' m）、一樓、look＝稿的那一句',!!d&&!!q&&pc.length===1&&p0.x===q.x&&p0.z===q.z&&p0.r===q.r&&p0.lv===0&&gap>0.2&&gap<=1.0&&IT.some(i=>i.fnLook==='plinth_center'&&i.look===T.looks.plinth_center&&i.label===T.lookButtons.plinth_center),J([p0,gap]));
      check('5. 模型裡真的有中央展示台（tools/blender/env_second/flower_notes_interior.py 照配置的 display 做）',/L\[['"]display['"]\]|\bdisplay\b/.test(read('tools/blender/env_second/flower_notes_interior.py'))&&/中央展示台/.test(read('tools/blender/env_second/flower_notes_interior.py'))); }
    check('5. 二樓的都在第 1 層（黑板、示範桌、花器層架、矮櫃）',['blackboard','demo_table','vase_shelf','low_cabinet'].every(k=>PTS.filter(p=>p.kind===k).every(p=>p.lv===1)));
    const f3=read('src/flower_notes3d.js'); check('5. 櫃檯原本暫用的「看」那一句拿掉了（flower_notes3d.js 的買花互動點沒有 look）；櫃檯的「看」在包裝那一頭',!/look:'花序 Flower Notes 的包裝收銀櫃檯。'/.test(f3)&&/kind:'gg_flower',fnCounter:true\}/.test(f3)&&PTS.some(p=>p.kind==='counter'&&p.x===L.counter.wrapAt.x&&p.z===L.counter.wrapAt.z)); });

  /* ======================= 6 舊存檔、送出去 ======================= */
  await sec(6,async()=>{ const SIS='heroine_05', AN='heroine_01', who=id=>({name:SOCIAL.displayName(id),charId:id}), flat=a=>a.join(''), play=(G,ls)=>ls.map(t=>GIFTH.text(G,t)).join('');
    const G=setup('2025-12-24',15,{zone:'campus',lv:{[SIS]:3,[AN]:3}}); G.flags.GIFTH={bag:[{id:'g_bouquet',day:D('2025-11-10'),shop:'gg_flower'},{id:'g_sunflower',day:D('2025-11-10'),shop:'gg_flower'}]};   /* 花攤時期的存檔：只有 bag */
    const bag=GIFTH.bag(G); check('6. 舊存檔（花攤時期買的一束花、向日葵）讀得進來；物品分頁寫新的店名和新的說明',bag.length===2&&GIFTH.bagHTML(G).includes(SHOP.name)&&GIFTH.bagHTML(G).includes(X.items.g_bouquet.line)&&!/花攤/.test(GIFTH.bagHTML(G)),J(bag));
    const o=GIFTH.talkOpts(G,SIS)[0]; const r=await run(()=>o.run(GM,who(SIS)),[X.items.g_bouquet.name]);
    check('6. 聖誕節把舊的一束花送學姊：送得出去、love（包包少一樣、記送過）',!!o&&!o.dim&&GIFTH.cat(SIS,'g_bouquet')==='love'&&GIFTH.bag(G).length===1&&GIFTH.givenTo(G,SIS,'g_bouquet')&&r.L[0]==='你把'+X.items.g_bouquet.name+'遞給'+SOCIAL.displayName(SIS)+'。',J(r.L.slice(0,3)));
    /* 新的八樣：沒有喜好＝ok 那一格 */
    const cats=IDS.slice(2).map(g=>GIFTH.PEOPLE.map(p=>GIFTH.cat(p,g))).flat(); check('6. 新的八樣對八位都是 ok（沒有 love、no）',cats.length===64&&cats.every(c=>c==='ok'));
    const G2=setup('2025-12-24',15,{zone:'campus',lv:{[AN]:3}}); GIFTH.rec(G2).bag.push({id:'g_fn_rose',day:G2.day,shop:'gg_flower'}); const band=GIFTH.band(G2,AN), a=Object.assign({},SOCIAL.rel(AN));
    const r2=await run(()=>GIFTH.talkOpts(G2,AN)[0].run(GM,who(AN)),[X.items.g_fn_rose.name]); const R=X.react[AN], b=SOCIAL.rel(AN);
    /* 舊期望：open＋她通用的 ok 那一格。4021747069（稿 ⑤ give_ok_flower）：八樣新花＝open＋稿寫給她的那一句；好感照舊算 ok（信任 +2） */
    check('6. 一支玫瑰送以安（第 3 階聖誕）：演她原本的 open＋稿的 give_ok_flower 那一句（不是通用的 ok 句）、信任 +2、不加她的戀愛、不記「她喜歡」',
      flat(r2.L)==='你把'+X.items.g_fn_rose.name+'遞給'+SOCIAL.displayName(AN)+'。'+play(G2,R.open.xmas[band])+play(G2,[X.flowerOk.lines[AN]])&&play(G2,R.ok[band])!==play(G2,[X.flowerOk.lines[AN]])&&(b.trust|0)-(a.trust|0)===2&&(b.npcRom|0)===(a.npcRom|0)&&!GIFTH.bag(G2).length&&!(SOCIAL.memories(AN)||[]).some(m=>m&&m.tag==='GIFT_LOVE_'+AN),J([band,r2.L]).slice(0,300));
    { const bad=[]; let n=0; const giveTo=async(pid,gid)=>{ const Gx=setup('2025-12-24',15,{zone:'campus',lv:{[pid]:3},flags:pid==='classmate_xinci'?{}:{}}); GIFTH.rec(Gx).bag.push({id:gid,day:Gx.day,shop:'gg_flower'}); const o=GIFTH.talkOpts(Gx,pid)[0]; if(!o||o.dim) return null; const bd=GIFTH.band(Gx,pid); const r=await run(()=>o.run(GM,who(pid)),[X.items[gid].name]); return {L:flat(r.L),bd,G:Gx}; };
      const head=(pid,gid,x)=>'你把'+X.items[gid].name+'遞給'+SOCIAL.displayName(pid)+'。'+play(x.G,X.react[pid].open.xmas[x.bd]);
      for(const pid of Object.keys(X.flowerOk.lines)) for(const gid of X.flowerOk.items){ const x=await giveTo(pid,gid); n++; if(!x||x.L!==head(pid,gid,x)+play(x.G,[X.flowerOk.lines[pid]])) bad.push(pid+' '+gid); }
      check('6. 八樣新花 × 稿有寫的人（'+n+' 次；這個環境送得到的）：聖誕節送出去＝她的 open＋稿的 give_ok_flower 那一句（每一樣都一樣）',n>=56&&bad.filter(x=>!/^classmate_xinci /.test(x)).length===0/* 芯慈要線開了才送得到，下面另外驗 */,bad.slice(0,6).join('；'));
      const XC0=globalThis.XCROM; globalThis.XCROM=Object.assign({},XC0||{},{ON:true}); const xc=GIFTH.canGet&&GIFTH.PEOPLE.includes('classmate_xinci')?await giveTo('classmate_xinci','g_fn_rose'):null; globalThis.XCROM=XC0;
      if(xc) check('6. 芯慈（335301d353 補了一句）：演稿的 give_ok_flower 那一句（舊期望：通用的 ok 那一格）',xc.L===head('classmate_xinci','g_fn_rose',xc)+play(xc.G,[X.flowerOk.lines.classmate_xinci]),xc.L.slice(0,120)); else console.log('SKIP 6. 芯慈（這個測試環境送不到她：線沒開）——資料上 flowerOk.lines 沒有她＝照舊 ok（第 1 節查過）');
      const z=await giveTo('heroine_02','g_sunflower'); check('6. 原本的兩樣（向日葵送芷若，她沒有喜好）不是新花：照舊演她通用的 ok 那一格，不演 give_ok_flower',!!z&&GIFTH.cat('heroine_02','g_sunflower')==='ok'&&z.L===head('heroine_02','g_sunflower',z)+play(z.G,X.react.heroine_02.ok[z.bd]),z&&z.L.slice(0,120));
      const F0=GIFT_HOLIDAY.flowerOk; delete GIFT_HOLIDAY.flowerOk; const y=await giveTo(AN,'g_fn_rose'); GIFT_HOLIDAY.flowerOk=F0; check('6. 資料沒有 flowerOk（舊的資料檔）＝照舊演通用的 ok 那一格，不壞',!!y&&y.L===head(AN,'g_fn_rose',y)+play(y.G,X.react[AN].ok[y.bd])); }
    const G3=setup('2025-10-15',15,{zone:'campus'}); delete G3.flags.GIFTH; check('6. 沒有 G.flags.GIFTH 的舊存檔：包包空的、花序照樣買得到（沒有新的必填欄位）',GIFTH.bag(G3).length===0&&!!GIFTH.shopOpt(G3,'gg_flower')&&!('FNS' in G3.flags)&&Object.keys(G3.flags.GIFTH).every(k=>['bag','recv','given','fest','sent','got','mail','sl','hint','third'].includes(k)),J(Object.keys(G3.flags.GIFTH))); });

  console.log(H.fails?('FAILED '+H.fails):'ALL PASS'); process.exit(H.fails?1:0);
})();
