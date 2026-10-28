// 法律系同學二十位（pool）：AA_498 共同做法、改名、第一批五位（企劃線 33189103b；任務 NPC-STORY-1028、USER_WANTS X119）——不需要瀏覽器。
//   0  稿：src/data/pool_story.js 每一句台詞、旁白、選項、手機訊息、人物頁、外觀描述都在 AA_498 稿裡（一字不差）；8-5「阿凱大二不住男一舍」拿掉的兩句照稿的規則
//   1  改名（第 1 節）：六位＋SQ16 借車名單兩個名字；src/、tests/ 沒有六個舊名；舊存檔讀檔換字（POOL.migrate；game3d.js migrate 叫）
//   2  地點表（第 3 節）：二十位都照表有地點；i%5 的 pick 拿掉；廖芸萱、嚴守誠、馬佳蓉（原本永遠不出現）在自己的地點、時段出現（真的生出來）；外觀描述和地點對得上
//   3  樣子（2-1）：每人固定一個路人底模、二十位不重複、性別對；同一個人換區域外觀不變（真的載 three.js／VRM 跑 CHAR.resolveModel，換三個區域）；
//      底模還沒下載完先藏起來、到了換上；無名路人不拿這一區同學的底模
//   4  第 9 節第 5 點的測試建議全部（曾靖雯、黃郁婷、林采潔、鄭元碩、邱家齊、舊存檔）
//   5  手機頻率上限（2-7）：沒交換聯絡方式不送；閒聊型一週一則（二十位加起來）、同一人一個月一則、考試週不送；劇情那幾則不算
//   6  關係上限（2-8）：做完順手的事、走完線到得了「朋友」，npcRom 沒加
//   7  2-9 兩個問題：ev_pool_greet 的地點、pool_greeted 用完清掉（「假裝看手機」不加熟悉）
//   8  其他：認識前「和〈外觀描述〉說話」、認識後名字；沒說過話的不進朋友頁；人物頁一句話／做過的事／personality；順手的事和店員的一起算 SIDEQ.MAX；新的互動點
// 修改前（開發分支 9b3a1f10a，2026-10-28 開工時；git archive 那一版、把這支測試放進去真的跑過）：PASS 2、FAIL 62（其中 12 節沒有 POOL、丟例外中斷）——
//   0 稿：沒有 src/data/pool_story.js、src/pool3d.js（FAIL）。
//   1 改名：六個舊名、SQ16 舊名單（第 2、5 個和 pool 撞名）都還在，沒有 POOL.migrate（FAIL）。
//   2 地點：i%5 的 pick 還在、二十位沒有作息；廖芸萱、嚴守誠、馬佳蓉都沒生出來；傅鐘、教室門口沒人；認識前叫「法律系一年級的女生」（FAIL）。
//   3 樣子：spec 沒有固定底模；同一個人換區域底模跟著輪換 npc_nf2 → nf3 → nf4 → nf5（FAIL）。只有「game3d.js 用 char3d.spec」本來就有（PASS）。
//   4 第一批五位：認識是舊的自我介紹＋沒有選項的「……你呢？」；沒有順手的事、訊息、房間物品（FAIL；七節丟例外）。
//   5、6、8 沒有 POOL（FAIL）。
//   7 2-9：曾靖雯的「你確定在教室看過」原句本來就對（PASS）；廖芸萱、邱家齊也說「教室」；pool_greeted 沒清，下一個人選「假裝看手機」也熟悉＋3（FAIL）。
// 修改後：ALL PASS（92 項）。
// 用法：node tests/aa498_pool_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const SRC='56ed354e9', DOCF='docs/story_planning/AA_498_法律系同學二十位_共同做法_改名_第一批五位.md';
const Z='pool_7', Y='pool_4', C='pool_1', YS='pool_6', Q='pool_3';
if(process.argv[2]==='child'){ child(); }
else main();

/* ---------- 第 3 節的一部分：真的載 three.js、VRM、ASSETS、CHAR（tools/dev_scratch/spring_sim/harness.js），在另一個 process 跑 ---------- */
function child(){
  const {ROOT,preload}=require('../tools/dev_scratch/spring_sim/harness.js');
  const ld=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|POOL|POOL_STORY)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
  const out={}; const M=ASSETS.manifest;
  if(typeof CHARACTERS==='undefined') try{ ld('src/data/characters.js'); }catch(e){ out.err='characters '+e; }   /* pg_harness（檔頭 require）已經載過就不再載 */
  /* STORY.extraSpec 的樣子（備用的程序化人物要用到頭髮、衣服）：pg_harness 載過 story3d.js 就用真的 */
  if(!(typeof STORY!=='undefined'&&STORY.extraSpec)) global.STORY={extraSpec:i=>{ const f=(i%2===0); return {id:'x'+i,name:'',height:f?1.6:1.72,build:'slim',sex:f?'f':'m',skin:'#efd0b3',hair:{color:'#2a1d16',style:f?'softMid':'shortClean'},face:{iris:'#3a2a22',brow:'soft',lash:f},outfit:{top:{type:'tee',color:'#123456',inner:'#ffffff'},bottom:{type:'jeans',color:'#4a5a78'},shoes:{type:'sneaker',color:'#f4f1ea',sole:'#ffffff'}},posture:{sway:0.02}}; }};
  try{ ld('src/data/pool_story.js'); ld('src/pool3d.js'); }catch(e){ out.err=(out.err||'')+' pool '+e; }
  const hasPool=typeof POOL!=='undefined';
  const OLD=['char.npc_m1','char.npc_m2','char.npc_f1','char.npc_f2'], ANON=Object.keys(M).filter(k=>M[k].anon);
  (async()=>{
    await preload(OLD);
    window.ASSET_DATA=window.ASSET_DATA||{}; for(const k of ANON) window.ASSET_DATA[M[k].url]=fs.readFileSync(path.join(ROOT,M[k].url)).toString('base64');
    const pid=Z, c=CHARACTERS[pid], spec=hasPool&&c.char3d&&c.char3d.spec?Object.assign({},c.char3d.spec,{name:c.name}):Object.assign(STORY.extraSpec(c.char3d.extra+40),{name:c.name});   /* game3d.js spawnCharacter 的 spec（修改前＝extraSpec(extra+40)，id 'x46'）*/
    const want=hasPool?POOL.modelOf(pid):null; out.want=want;
    /* 底模還沒下載完：建出來是藏起來的備用人物；POOL.modelWait 把人藏起來（按鈕也沒有）、開始下載；到了換上 */
    const n={charId:pid,obj:CHAR.build(spec)}; out.early={degraded:CHAR.isDegraded(n.obj)};
    if(hasPool){ POOL.modelWait(n,pid); out.early.hidden=!!n.hidden; await (ASSETS.status[want]||Promise.resolve()).catch(()=>{}); out.early.loaded=ASSETS.has(want); out.early.needs=CHAR.needsUpgrade(n.obj); const nh=CHAR.upgrade(n.obj); if(nh) n.obj=nh; POOL.modelWait(n,pid); out.early.after={key:n.obj.userData.key,hidden:!!n.hidden,degraded:CHAR.isDegraded(n.obj)}; }
    /* 換三個區域（路人池每次輪一格）：同一個人的底模一樣 */
    const lo=ASSETS.loadOne; const seq=[];
    for(const z of ['campus','classroom','library','gongguan']){ CHAR.anonPool.refresh(z); await Promise.all(ANON.filter(k=>ASSETS.status[k]&&!ASSETS.cache[k]).map(k=>ASSETS.status[k].catch(()=>{}))); seq.push(CHAR.resolveModel(spec).model); }
    out.seq=seq;
    /* 無名路人不拿這一區同學的底模（POOL.reserved；anonPool.choose 包一層）*/
    if(hasPool){ ASSETS.loadOne=()=>Promise.resolve(); CHAR.anonPool.size={f:8,m:8}; POOL.bind({G:{zone:'campus',day:10,hour:12,flags:{}}}); CHAR.anonPool.refresh('campus');
      const res=[...POOL.reserved()]; const picks=[]; for(let i=0;i<24;i++) picks.push(CHAR.anonPool.choose('x'+(900+i),i%2?'m':'f'));
      out.res=res; out.cur=CHAR.anonPool.cur.slice(); out.picks=picks; ASSETS.loadOne=lo; }
    console.log(JSON.stringify(out)); process.exit(0);
  })().catch(e=>{ console.log(JSON.stringify({error:String(e&&e.stack||e)})); process.exit(1); });
}

async function main(){
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EAT|EAT_LINES|WZS|L118|LANE118_SHOPS|LANE118_LAYOUT|PARK|WZ_PARK_LAYOUT|SIDEQ|MSG|MSG_POOL|MSG2_POOL|SISY23|SISY23_LINES|SISY23_EVENTS|POOL|POOL_STORY)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/eat_lines.js','src/eat3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/lane118.js','src/data/wz_park_layout.js','src/wzpark3d.js','src/wzshops3d.js','src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js','src/sideq3d.js']) load(f);
let ok=true, err=''; try{ load('src/data/pool_story.js'); load('src/pool3d.js'); }catch(e){ ok=false; err=String(e); }
const P=()=>typeof POOL!=='undefined'?POOL:null, PS=()=>typeof POOL_STORY!=='undefined'?POOL_STORY:null;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const TD=(t,w,wd)=>STORY.termDay(t,w,wd);
const onDay=(a,from)=>{ for(let x=from;x<from+120;x++) if(ACTIVITIES.on(a,x,H.G)) return x; return null; };   /* 這一局那個活動的第一天（照 ACTIVITIES.on，新局、舊局日子不同）*/
const set=(day,h,zone)=>{ H.G.day=day; H.G.hour=h; H.G.weekday=wdOf(day); if(zone) H.G.zone=zone; };
const fresh=(day,h,zone,flags)=>{ const G=H.fresh(keyOf(day),h,zone||'campus',Object.assign({EXCHANGE_ROUTE:'TW',afternoonDone:true},flags||{})); G.outings=[]; set(day,h,zone||'campus'); G.weather='clear'; GM.npc={}; E.npcs=[]; E.interactables=[]; if(typeof SIDEQ!=='undefined') SIDEQ.roll=()=>0.99; if(P()) P().bind(GM); STORY._bindGM(GM); return G; };
const spawn=id=>{ const n={name:SOCIAL.npcName(id),charId:id,obj:{position:{x:0,y:0,z:0}},pose:'idle'}; n.talk=nn=>STORY.talkCharacter(id,nn); GM.npc[id]=n; E.npcs.push(n); return n; };
const said=()=>H.said.map(x=>(x.who?x.who+'：':'')+x.t), has=t=>H.said.some(x=>x.t===t), idx=t=>H.said.findIndex(x=>x.t===t), whoOf=t=>(H.said.find(x=>x.t===t)||{}).who;
const talk=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const n=GM.npc[id]||spawn(id); await STORY.talkCharacter(id,n); return n; };
const rel=(id,fam,trust)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; };
const meet=id=>SOCIAL.meet(id,H.G.zone);
const msgs=id=>(H.G.msgs||[]).filter(m=>m.th==='p:'+id).map(m=>m.text);
const ph=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const phAt=(day,h)=>{ set(day-1,22); ph(); set(day,h); ph(); };
const L=()=>PS().LINES;
let doc=''; try{ doc=cp.execSync('git -c core.quotepath=false show '+SRC+':"'+DOCF+'"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }

/* ---------- 0 稿 ---------- */
await sec(0,()=>{ check('0. pool_story.js、pool3d.js 載得到；第一批五位都有台詞',ok&&!!P()&&!!PS()&&[Z,Y,C,YS,Q].every(id=>PS().LINES[id]),err);
  const SKIP=new Set(['when','scene','bg','label','goto','speaker','meet','if','unless','set','from','id','until','place','model','props','zone','act','at','seat','seatAt','near','days','terms','weeks','dates','activity','door','desc']);
  const out=[]; const walk=(v,k)=>{ if(v==null||SKIP.has(k)) return; if(typeof v==='string'){ out.push(v); return; } if(Array.isArray(v)){ v.forEach(x=>walk(x,k)); return; } if(typeof v==='object') for(const kk in v) walk(v[kk],kk); };
  walk(PS().LINES,'');
  const DERIVED={'明天晚上交誼廳。我媽寄了文旦。你來吃。':['明天晚上交誼廳。我媽寄了文旦。你跟阿凱來吃。','跟阿凱'],'（文旦剝了一整桌。）':['（文旦剝了一整桌。阿凱把文旦皮戴在頭上。）','阿凱把文旦皮戴在頭上。']};   /* 8-5：阿凱大二不住男一舍的話拿掉的兩句 */
  const COMPOSED={'印了五本。我媽、書房老闆、你，還有兩本我自己留著。':['印了五本。','我媽、書房老闆、你，還有兩本我自己留著。']};   /* 6-5 沒認識郁婷：「那句換成」列名字的那一句（兩段都一字不差在稿裡）*/
  const bad=[...new Set(out)].filter(t=>doc.indexOf(t)<0&&!(DERIVED[t]&&doc.indexOf(DERIVED[t][0])>=0&&DERIVED[t][0].replace(DERIVED[t][1],'')===t)&&!(COMPOSED[t]&&COMPOSED[t].join('')===t&&COMPOSED[t].every(p=>doc.indexOf(p)>=0)));
  check('0. 每一句台詞、旁白、選項、手機訊息、人物頁一行都在 AA_498 稿裡（'+SRC+'，一字不差）',!!doc&&out.length>250&&!bad.length,out.length+' 句；不在稿裡：'+J(bad));
  const P3=PS().PEOPLE, ids=Object.keys(P3), rows=ids.map(id=>{ const p=P3[id]; return [id,p.card,p.personality].concat(p.where.map(e=>e.desc)).concat(p.cls?[p.cls.desc]:[]); });
  const badT=[]; for(const r of rows){ const id=r[0]; for(const t of r.slice(1)){ if(t&&doc.indexOf(t)<0) badT.push(id+':'+t); } }
  check('0. 第 3 節的表：二十位的外觀描述（每個地點各一句）、人物頁一句話、personality 都在稿裡',ids.length===20&&!badT.length,J(badT));
  check('0. personality：第一批五位＋蔡宗霖照表；寫「之後的批次寫」的先不填',[C,'pool_2',Q,Y,YS,Z].every(id=>P3[id].personality&&CHARACTERS[id].personality===P3[id].personality)&&ids.filter(id=>![C,'pool_2',Q,Y,YS,Z].includes(id)).every(id=>!P3[id].personality&&!CHARACTERS[id].personality)); });

/* ---------- 1 改名 ---------- */
const OLDN=['\u90b1\u67cf\u52f3','\u912d\u51f1\u6587','\u65bd\u51a0\u5b87','\u8a79\u54f2\u744b','\u56b4\u5b50\u5b89','\u675c\u5b87\u6046'];   /* 六個舊名（pool_3、6、12、16、18、19）：寫成 \u 跳脫，grep 舊名不會找到這個測試 */
await sec(1,()=>{ const NEW={pool_3:'邱家齊',pool_6:'鄭元碩',pool_12:'施孟儒',pool_16:'詹立群',pool_18:'嚴守誠',pool_19:'蘇承恩'};
  check('1. 六位改名（第 1 節）',Object.keys(NEW).every(id=>CHARACTERS[id].name===NEW[id]),J(Object.keys(NEW).map(id=>CHARACTERS[id].name)));
  check('1. 輪轉單車（SQ16）的借車名單：黃惠玲、鄭文彬（和 pool 撞名的兩個）',J(SIDEQ.LINES.SQ16.names)===J(['陳品叡','黃惠玲','張宇翔','劉思妤','鄭文彬']),J(SIDEQ.LINES.SQ16.names));
  const hits=[]; const scan=dir=>{ for(const f of fs.readdirSync(path.join(H.ROOT,dir))){ const p=path.join(dir,f), st=fs.statSync(path.join(H.ROOT,p)); if(st.isDirectory()){ if(!/node_modules|repro_/.test(f)) scan(p); continue; } if(!/\.(js|py|html|json)$/.test(f)||st.size>8e6) continue; const s=fs.readFileSync(path.join(H.ROOT,p),'utf8'); for(const n of OLDN) if(s.indexOf(n)>=0) hits.push(p+':'+n); } };
  scan('src'); scan('tests'); if(fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8').match(new RegExp(OLDN.join('|')))) hits.push('index.html');
  check('1. src/、tests/、index.html 沒有六個舊名（換字表寫成 \\u 跳脫）',!hits.length,J(hits));
  /* 舊存檔：手機訊息、回覆選項、排定的訊息、群組名、出遊、約、記憶備註、日誌、筆記、目標裡的舊名換新名；id、旗標不動；換過的再讀一次不變 */
  const old={msgs:[{th:'p:pool_6',text:OLDN[1]+'：洗出來再給你',ask:{opts:[{t:'問'+OLDN[0],say:[{text:OLDN[2]+'說好'}]}]}}],phone:{q:[{items:[{text:OLDN[3]+'的音響'}]}],groups:{g1:{name:OLDN[4]+'讀書會'}}},
    outings:[{title:'和'+OLDN[5]+'去社福中心',place:'社科院'}],invites:[{label:OLDN[0]+'的魚丸'}],social:{mem:{pool_3:[{tag:'FIRST_MET',note:'dorm_hall'},{tag:'ADJUST',note:'幫'+OLDN[0]+'領箱子'}]}},memo:[{t:'遇到'+OLDN[1]}],notes:[{title:OLDN[4],body:OLDN[4]+'的刑法筆記'}],goal:'找'+OLDN[3],flags:{}};
  const n1=P()?P().migrate(old):0, s1=J(old);
  check('1. 讀檔換字（POOL.migrate）：存下的舊名都換成新名',n1>=11&&!OLDN.some(t=>s1.indexOf(t)>=0)&&s1.indexOf('鄭元碩：洗出來再給你')>=0&&s1.indexOf('問邱家齊')>=0&&s1.indexOf('施孟儒說好')>=0&&s1.indexOf('詹立群的音響')>=0&&s1.indexOf('嚴守誠讀書會')>=0&&s1.indexOf('和蘇承恩去社福中心')>=0&&old.goal==='找詹立群',n1+' '+s1.slice(0,300));
  check('1. 換過的再讀一次不變；資料壞掉不丟例外',P().migrate(old)===0&&J(old)===s1&&P().migrate(null)===0&&P().migrate({msgs:{},phone:null,outings:[null],social:{mem:{pool_3:null}}})===0);
  const g=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8'), i=g.indexOf('function migrate(s)'), j=g.indexOf('function ls()');
  check('1. game3d.js 的 migrate（讀檔、匯入都走這裡）叫 POOL.migrate',i>0&&j>i&&g.slice(i,j).indexOf('POOL.migrate(s)')>0); });

/* ---------- 2 地點表 ---------- */
await sec(2,async()=>{ const st=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8');
  check('2. story3d.js：「五組、每組取前幾位」（i%5 的 pick）拿掉；schedFor 讓有作息的 B 層同學照作息出現',!/i%5===from/.test(st)&&!/const pick=\(from,n\)/.test(st)&&/c\.social_layer==='B'&&!\(c\.daily_schedule\|\|c\.poolClass\)/.test(st));
  const ids=Object.keys(CHARACTERS).filter(k=>/^pool_/.test(k));
  check('2. 二十位都照第 3 節排了地點（作息或必修課）',ids.length===20&&ids.every(id=>(CHARACTERS[id].daily_schedule||[]).length||CHARACTERS[id].poolClass),J(ids.filter(id=>!(CHARACTERS[id].daily_schedule||[]).length&&!CHARACTERS[id].poolClass)));
  /* 真的生出來：照 story3d.js refreshSchedule → populateSchedule（同一套 schedFor、spawnAt）*/
  const spawned=[]; GM.spawnCharacter=(id,x,z,o)=>{ if(GM.npc[id]) return GM.npc[id]; const n={charId:id,name:SOCIAL.npcName(id),obj:{position:{x,y:0,z}},seat:o&&o.seat,pose:o&&o.pose,lv:o&&o.lv}; GM.npc[id]=n; E.npcs.push(n); spawned.push([id,H.G.zone,+x.toFixed(2),+z.toFixed(2)]); return n; };
  GM.removeNPC=id=>{ const n=GM.npc[id]; delete GM.npc[id]; const k=E.npcs.indexOf(n); if(k>=0) E.npcs.splice(k,1); }; E.removeNPC=n=>{ for(const k in GM.npc) if(GM.npc[k]===n) delete GM.npc[k]; const i=E.npcs.indexOf(n); if(i>=0) E.npcs.splice(i,1); };
  const camSeats=[{x:-25,z:-12.94+0.0,yaw:0},{x:-50,z:-12.94,yaw:0},{x:-30,z:20.94,yaw:Math.PI}];
  const at=(day,h,zone,seats,wx)=>{ fresh(day,h,zone); if(wx) H.G.weather=wx; spawned.length=0; E.zone={seats:(seats||[]).map(s=>Object.assign({},s)),spawn:{x:0,z:0}}; E.player.obj.position={x:500,y:0,z:500}; STORY.refreshSchedule(GM); return spawned.slice(); };
  const wd=TD('Y1S1',5,2);   /* 大一上第 5 週週二 */
  let s=at(wd,14,'campus',camSeats); const lyx=s.find(q=>q[0]==='pool_15');
  check('2. 廖芸萱（原本永遠不出現）：平日 13～16 在文學院前的長椅（seatAt (−25,−12.94)）',!!lyx&&lyx[2]===-25&&Math.abs(lyx[3]+12.94)<0.01,J(s));
  s=at(wd,14,'library',[{x:5.6,z:-3.9,yaw:0},{x:-5.6,z:5.1,yaw:Math.PI},{x:0,z:0,yaw:0},{x:2,z:0,yaw:0},{x:4,z:0,yaw:0}]);
  check('2. 嚴守誠（原本永遠不出現）：平日 13～15 在總圖三樓（閱覽室）；洪珮瑜坐窗邊那一排',s.some(q=>q[0]==='pool_18')&&(s.find(q=>q[0]==='pool_9')||[])[3]===-3.9,J(s));
  const sat=(()=>{ for(let d=TD('Y1S1',3,6);d<TD('Y1S1',16,6);d+=7){ H.G.day=d; if(STORY.fafuDuty(H.G)) return d; } return null; })();
  s=at(sat,10,'wancai');
  check('2. 馬佳蓉（原本永遠不出現）：法服值班的週六 9～12 在萬才館一樓',!!sat&&s.some(q=>q[0]==='pool_20'&&q[2]===1.9),keyOf(sat)+' '+J(s));
  { fresh(TD('Y1S1',1,1),10,'campus'); const a=ACTIVITIES.list.find(x=>x.id==='club_expo_y1s1'); const d=a?onDay(a,TD('Y1S1',1,1)-14):null;   /* 這一局的社博那一天（ACTIVITIES.on：新局 9/6、舊局 9/30）*/
    s=d!=null?at(d,(a.t0+a.t1)/2,'campus',camSeats):[]; check('2. 馬佳蓉：社團博覽會那幾天在法服的攤位',s.some(q=>q[0]==='pool_20'&&q[2]===-50),(d!=null?keyOf(d):'')+' '+J(s)); }
  s=at(TD('Y1S1',4,1),6.75,'campus',camSeats); const zz=s.find(q=>q[0]===Z);
  check('2. 曾靖雯：平日 06:30～07:40 在傅鐘旁的長椅',!!zz&&zz[2]===-30&&zz[3]===20.94,J(s));
  { const a=at(TD('Y1S1',4,2),16.5,'campus',camSeats), b=at(TD('Y1S1',4,2),16.5,'campus',camSeats,'cloudy'), c=at(TD('Y1S1',4,2),16.5,'campus',camSeats,'rain');
    check('2. 鄭元碩：晴天 16:00～17:30 在椰林大道（虛線旁 (−10,0.8)）；陰天、雨天不在',a.some(q=>q[0]===YS&&q[2]===-10)&&!b.some(q=>q[0]===YS)&&!c.some(q=>q[0]===YS),J([a,b,c].map(x=>x.map(q=>q[0])))); }
  s=at(TD('Y1S1',4,1),9.5,'classroom',[0,1,2,3,4,5].flatMap(r=>[0,1,2,3,4,5,6,7].map(c=>({x:-5.25+c*1.5,z:-3.45+r*2.1,yaw:Math.PI,row:r,col:c}))));
  check('2. 必修課（大一上週一憲法，霖澤館 201）：曾靖雯第一排正中間、林采潔第三排、黃郁婷上課時坐最後一排',(s.find(q=>q[0]===Z)||[])[3]===-3.45&&(s.find(q=>q[0]===C)||[])[3]===0.75&&!!s.find(q=>q[0]===Y),J(s));
  { const G=fresh(TD('Y1S1',4,1),9+10/60-0.1,'classroom'); const e=STORY.schedEnt(CHARACTERS[Y],G); check('2. 黃郁婷：上課前 10 分鐘在教室門口（站著）',!!e&&e.act==='linger'&&e.door&&J(e.at)===J(P().DOOR.classroom),J(e)); }
  { const G=fresh(TD('Y1S1',4,1),14,'campus'); SOCIAL.meet(Q,'dorm_hall');
    const c0=[...new Set(Object.keys(CHARACTERS).filter(k=>/^pool_/.test(k)).map(id=>{ const w=STORY.whereIs(GM,id); return w&&w.zone; }).filter(Boolean))];
    check('2. 人物線索（STORY.whereIs）照新的作息：認識的邱家齊 21～23 在交誼廳',(()=>{ G.weekday=0; G.day=TD('Y1S1',4,7)+7; G.hour=21.5; const w=STORY.whereIs(GM,Q); return !!w&&w.zone==='dorm_hall'; })()); }
  { const G=fresh(TD('Y1S1',4,1),6.75,'campus'); spawn(Z); const a=SOCIAL.displayName(Z); set(TD('Y1S1',4,1),9.5,'classroom'); GM.npc={}; spawn(Z); const b=SOCIAL.displayName(Z);
    check('2. 外觀描述和地點對得上（2-2）：傅鐘「傅鐘旁邊吃早餐的人」、教室「坐第一排正中間的女生」',a==='傅鐘旁邊吃早餐的人'&&b==='坐第一排正中間的女生',a+' / '+b); } });

/* ---------- 3 樣子 ---------- */
await sec(3,()=>{ const ids=Object.keys(CHARACTERS).filter(k=>/^pool_/.test(k)), specs=ids.map(id=>CHARACTERS[id].char3d&&CHARACTERS[id].char3d.spec);
  check('3. 每人一個固定的 spec：id＝人物 id（不是 x＋數字＝不進輪換的無名路人池）、model＝LAWWW2 的路人底模、性別對',specs.every((s,i)=>s&&s.id===ids[i]&&!/^x\d+$/.test(s.id)&&ASSETS_OK(s.model,CHARACTERS[ids[i]].gender)),J(specs.map(s=>s&&[s.id,s.model])));
  check('3. 二十位的底模不重複',new Set(specs.map(s=>s&&s.model)).size===20);
  const g=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
  check('3. game3d.js spawnCharacter 用 char3d.spec（同一個人每次建出來一樣）',/if\(c\.char3d&&c\.char3d\.spec\)\{ if\(typeof c\.char3d\.spec==='string'\)/.test(g));
  const r=cp.spawnSync(process.execPath,[__filename,'child'],{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26,timeout:240000}); let o={}; try{ o=JSON.parse((r.stdout||'').trim().split('\n').pop()); }catch(e){ o={error:(r.stdout||'').slice(-600)+(r.stderr||'').slice(-600)}; }
  if(o.error||o.err) console.log('child:',o.error||o.err);
  check('3. 同一個人換區域（campus → classroom → library → gongguan，路人池每次輪一格）底模不變＝自己的那一個',Array.isArray(o.seq)&&o.seq.length===4&&o.seq.every(k=>k===o.want)&&!!o.want,J(o.seq)+' want '+o.want);
  const e=o.early||{};
  check('3. 底模還沒下載完：建出來的是藏起來的備用人物，POOL.modelWait 把人藏起來（沒有說話按鈕）；下載完換上、看得到',e.degraded===true&&e.hidden===true&&e.loaded===true&&e.needs===true&&e.after&&e.after.key===o.want&&!e.after.hidden&&!e.after.degraded,J(e));
  const res=o.res||[], picks=o.picks||[];
  check('3. 無名路人（x＋數字）分底模時不拿這一區（校園）有作息的同學的底模',res.length>=8&&picks.length===24&&picks.every(k=>!res.includes(k)),J({res,picks})); });
function ASSETS_OK(k,g){ try{ const src=fs.readFileSync(path.join(H.ROOT,'src/assets3d.js'),'utf8'); const m=new RegExp("'"+k.replace('.','\\.')+"':\\s*\\{[^}]*anon:true[^}]*sex:'"+(g==='f'?'f':'m')+"'").test(src); return m; }catch(e){ return false; } }

/* ---------- 4 第 9 節第 5 點 ---------- */
/* 曾靖雯：傅鐘認識選「剛好路過」；旁聽選「要看他做了什麼」；畢業典禮早上是 depends 版 */
await sec('4 曾靖雯',async()=>{ const d1=TD('Y1S1',4,2); fresh(d1,6.75,'campus'); spawn(Z);
  check('4. 曾靖雯：認識前的按鈕「和傅鐘旁邊吃早餐的人說話」',GM.npc[Z].name==='傅鐘旁邊吃早餐的人');
  await talk(Z,['剛好路過']);
  check('4. 曾靖雯 傅鐘認識：三句、選「……剛好路過。」→「六點半剛好路過傅鐘？……好，我不問。」；說出名字以前的說話人是外觀描述、之後是名字',has('六點半剛好路過傅鐘？……好，我不問。')&&whoOf('早安。')==='傅鐘旁邊吃早餐的人'&&whoOf('我叫曾靖雯。你這麼早起來做什麼？')==='曾靖雯'&&SOCIAL.has(Z,'FIRST_MET')&&!has('……你呢？'),J(said()));
  check('4. 曾靖雯：認識的那一場不加閒聊（第一次說話＝認識，2-3）；熟悉＋3、信任＋3（線的一段）',!H.said.some(x=>/^「/.test(x.t))&&SOCIAL.rel(Z).trust===3,J(SOCIAL.rel(Z)));
  /* 旁聽 */
  const d2=TD('Y1S2',3,2); set(d2,6.75,'campus'); rel(Z,25,3); GM.npc={}; spawn(Z); await talk(Z,[0]);
  const r=SIDEQ.get(H.G,'PQ_ZJW'), q=(H.G.outings||[]).find(x=>x.ev==='ev_pool_zjw_court');
  check('4. 曾靖雯 4-3：大一下第 3 週平日早上在傅鐘（有點熟）開口 →「我跟妳去。」＝加好友、掛「陪靖雯去旁聽」、排下一個下午沒課的平日 14:00 臺北地方法院（AA_498「實作時定的」第 3 點：大一下平日每天早上都有課）；她問「你哪天下午沒課？」',has('我想去地方法院旁聽。網站上說誰都可以進去，可是我一個人……有點不敢走進去。')&&has('好。那我們加一下好友。')&&!!r&&r.state==='open'&&INV.hasContact(H.G,Z)&&has('你哪天下午沒課？')&&!!q&&q.h===14&&q.place==='臺北地方法院'&&!CLS.dayItems(H.G,q.day).some(it=>it.t0<16.5&&(it.t1==null?it.t0+2:it.t1)>13.5)&&q.day-d2<=7&&/陪靖雯去旁聽/.test(SIDEQ.todayHTML(H.G)),J([said(),q&&keyOf(q.day)]));
  phAt(q.day-1,21.1); check('4. 曾靖雯：前一晚 21:00 她傳「明天兩點，法院門口。早安先說了，我明天會很緊張。」（她下午也說早安）',msgs(Z).includes('明天兩點，法院門口。早安先說了，我明天會很緊張。'),J(msgs(Z)));
  H.said=[]; H.picks=['要看他做了什麼']; set(q.day,13.7); await OUT.go(GM,q);
  check('4. 曾靖雯 旁聽（2D，court_hall 沒有圖＝深色底）：選「要看他做了什麼」→ ZJW_HELP depends；記 SHARED_SECRET；人物頁「陪她去過地方法院旁聽」；做完',has('你講話好像法官。……可是你說得對，我們連他做了什麼都還沒聽完。')&&H.G.flags.ZJW_HELP==='depends'&&SOCIAL.has(Z,'SHARED_SECRET')&&P().deeds(H.G,Z).includes('陪她去過地方法院旁聽')&&r.state==='done'&&OUT.bg('court_hall')==='dark',J(said()));
  /* 畢業典禮早上 */
  const gd=D('2029-06-02'); set(gd,6.4,'campus'); GM.npc={}; spawn(Z); await talk(Z,[]);
  check('4. 曾靖雯 4-6 畢業典禮早上（傅鐘）：depends 版「你說要看他做了什麼。…」，最後「好了。……再見。這次不說早安了。」',has('早安。……我多買了一個，猜你會來。')&&has('你說要看他做了什麼。我後來每一次旁聽，都先把那個人做了什麼聽完。……考上以後，我想去法扶。')&&!has('我還是不知道要幫誰。可是我會一直找下去。')&&has('好了。……再見。這次不說早安了。'),J(said()));
  set(gd,8.2); ph(); check('4. 曾靖雯：去了傅鐘就沒有 08:00 那張空長椅的照片',!msgs(Z).includes('（照片：空的長椅）')); });

/* 曾靖雯 4-7 錯過、不在：國外（照時差）、延畢（大五上第 1 週 06:30）*/
await sec('4 曾靖雯 不在',async()=>{ const RD=STORY.ROUTE_DATES.JP, dep=D(RD.dep); fresh(dep-3,12,'campus',{EXCHANGE_ROUTE:'JP'}); meet(Z); rel(Z,25,3); INV.addContact(H.G,Z);
  let got=null, at=null; for(let d=dep;d<dep+30&&!got;d++) for(let h=0;h<24&&!got;h+=0.5){ set(d,h); ph(); const m=(H.G.msgs||[]).find(x=>x.tag==='pool_zjw_abroad'); if(m){ got=m; at=[keyOf(d),h]; } }
  const tw=got?got.day*24+got.h-STORY.tzOffset(H.G,got.day):null;   /* 換回臺灣時間 */
  check('4. 曾靖雯 4-7：祐廷在國外（日本）＝出發後第三週的週一、臺灣早上六點（日本七點）傳「早安。你那邊幾點？我這邊六點。傅鐘的長椅換新的了。」',!!got&&got.text===L()[Z].abroad&&wdOf(Math.floor(tw/24))===1&&Math.abs(tw%24-6)<0.01&&Math.floor(tw/24)>=dep+14&&Math.floor(tw/24)<dep+21,J([got&&got.text,at]));
  const y5=CALENDAR.termDays('Y5S1'); fresh(y5.from-2,12,'campus',{FAIL_DELAY:true}); meet(Z); rel(Z,25,3); INV.addContact(H.G,Z); phAt(y5.from,6.6);
  const a=msgs(Z).includes(L()[Z].y5); fresh(y5.from-2,12,'campus'); meet(Z); INV.addContact(H.G,Z); phAt(y5.from,6.6);
  check('4. 曾靖雯 4-7：延畢（大四下被當）＝大五上第 1 週 06:30「早安。你今年還在學校，幫我看一下那張長椅還在不在。」；沒延畢不送',a&&!msgs(Z).includes(L()[Z].y5),keyOf(y5.from)); });

/* 黃郁婷：補給包答應、隔天霖澤館那一句；秘密選「不考司法官嗎？」、2029-10 那則多出來的一句 */
await sec('4 黃郁婷',async()=>{ const d0=TD('Y1S1',4,1); fresh(d0,9+10/60-0.1,'classroom'); spawn(Y);
  check('4. 黃郁婷：上課前在教室門口，認識前「和總是最後進教室的人說話」',GM.npc[Y].name==='總是最後進教室的人');
  await talk(Y,['下禮拜給']);
  check('4. 黃郁婷 認識：班費、選「下禮拜給。」→「大家都說下禮拜。我會再提醒你一次，就一次。」',has('我是黃郁婷，班代。下禮拜要收班費，一學期兩百。')&&has('大家都說下禮拜。我會再提醒你一次，就一次。'),J(said()));
  const mon=d0+7; phAt(mon,21.1); const fee=(H.G.msgs||[]).find(m=>m.tag==='pool_yt_fee');
  check('4. 黃郁婷：下週一 21:00 她私訊「班費。」（全班都會收到的那種，沒加好友也送），回「（轉帳）」→「收到。」',!!fee&&fee.text==='班費。'&&fee.ask&&fee.ask.opts[0].t==='（轉帳）'&&(PHONE.answer(H.G,fee.ask.id,0),msgs(Y).includes('收到。')),J(msgs(Y)));
  const w=P().yt1Day(); set(w,12.3,'classroom'); GM.npc={}; spawn(Y); await talk(Y,[0]);
  const r=SIDEQ.get(H.G,'PQ_YT1');
  check('4. 黃郁婷 5-3：期中考前一週的週三下課在教室門口 →「我去幫忙。」＝掛「考前補給包」（今天 19:00～21:00 萬才館一樓）',has('明天系學會要在霖澤館一樓發考前補給包。今天晚上要包八十包，人不夠。')&&!!r&&r.state==='open'&&r.step==='pack'&&/考前補給包/.test(SIDEQ.todayHTML(H.G)),J(said()));
  set(w,19.5,'wancai'); H.said=[]; GM.E.player.busy=false; const started=P().tick(GM); await new Promise(res=>setTimeout(res,20));
  check('4. 黃郁婷：當晚 19:30 到萬才館一樓＝包補給包那一場、加好友、做完',started&&has('我數一下。……八十。好，都在。')&&has('謝啦。我們加一下好友，以後缺人我直接找你。')&&r.state==='done'&&INV.hasContact(H.G,Y),J(said()));
  set(w+1,10,'linze'); E.interactables=[]; P().populate('linze',GM); const it=E.interactables.find(x=>x.poolAct==='ytTable'); H.said=[]; if(it&&!it.hidden) await STORY.interact(it,GM);
  check('4. 黃郁婷：隔天在霖澤館一樓「看補給的桌子」＝「（郁婷從桌子後面抽出一包…「第三題不會就先寫第四題。」）」；房間物品「考前補給包的小卡」',!!it&&has(L()[Y].tableYes)&&STORY.roomItemList(H.G).some(x=>x[0]==='考前補給包的小卡'),J(said()));
  /* 秘密 */
  const s1=TD('Y1S2',10,1); set(s1,9+10/60-0.1,'classroom'); rel(Y,25,10); GM.npc={}; spawn(Y); await talk(Y,['不考司法官嗎']);
  check('4. 黃郁婷 5-4 秘密（大一下第 10 週起、教室門口、有點熟）：選「不考司法官嗎？」→ YT_JUDGE',has('其實……書記官的考試科目，我偷偷查過了。你不要說出去。')&&has('大家都會這樣問。……我就是想坐在旁邊那個位子。')&&H.G.flags.YT_JUDGE===true&&SOCIAL.has(Y,'SHARED_SECRET'),J(said()));
  const pd=D('2029-10-19'); phAt(pd,18.2);
  check('4. 黃郁婷 5-6（2029-10 司法特考放榜，有聯絡方式）：「上了。四等書記官。」「榜單我數了三次。」＋多出來的一句（YT_JUDGE 版）',J(msgs(Y).slice(-3))===J(['上了。四等書記官。','榜單我數了三次。','你大一問我為什麼不考司法官。現在可以回答你了：我想坐的就是這個位子。']),J(msgs(Y).slice(-4))); });

/* 黃郁婷 5-5 報到桌（第 9 節第 5 點以外，順手的事 2 兩條路：有聯絡方式＝私訊、沒有＝霖澤館一樓當面）*/
await sec('4 黃郁婷 報到桌',async()=>{ const d1=TD('Y2S1',1,1); fresh(d1-2,12,'campus'); meet(Y); meet(Z); INV.addContact(H.G,Y);
  phAt(d1-1,21.1); const m=(H.G.msgs||[]).find(x=>x.tag==='pool_yt2_ask');
  check('4. 黃郁婷 5-5：有聯絡方式＝大二上第 1 週前一個週日 21:00 私訊「禮拜三早上迎新的報到桌缺一個人。…」，兩個回覆',!!m&&m.text===L()[Y].ask2&&!!m.ask&&m.ask.opts.length===2&&keyOf(m.day)===keyOf(d1-1),J(msgs(Y)));
  if(m) PHONE.answer(H.G,m.ask.id,0); const r=SIDEQ.get(H.G,'PQ_YT2'), q=(H.G.outings||[]).find(x=>x.ev==='ev_pool_yt_desk');
  check('4. 黃郁婷 5-5：回「好。」＝掛「迎新報到桌」、排大二上第 1 週週三 08:30 霖澤館一樓',!!r&&r.state==='open'&&!!q&&q.day===TD('Y2S1',1,3)&&q.h===8.5&&/迎新報到桌/.test(SIDEQ.todayHTML(H.G)),J([r,q]));
  H.said=[]; H.picks=['問旁邊那個班代']; set(q.day,8.3,'campus'); await OUT.go(GM,q);
  check('4. 黃郁婷 報到桌（2D）：選「問旁邊那個班代。」→「（頭也沒抬）要背。…」；認識靖雯＝七點半那句旁白；沒有 KV_HANDOVER＝沒有宜蓁；結尾「我數一下。……少一個。我去打電話。」；做完',has('（頭也沒抬）要背。我數過，比高中多。')&&has('（七點半，靖雯提著一袋早餐來，放在報到桌上：「早安。給工作人員的。」）')&&!has('（排在隊伍中間的，是宜蓁。她看到你，比你還緊張。）')&&has('我數一下。……少一個。我去打電話。')&&r.state==='done',J(said()));
  fresh(d1,10,'linze'); meet(Y); spawn(Y); await talk(Y,[1]); const r2=SIDEQ.get(H.G,'PQ_YT2');
  check('4. 黃郁婷 5-5 沒有聯絡方式：大二上第 1 週週一在霖澤館一樓當面問；「那天早上我有課。」→「好。我自己來。」＝婉拒（不扣數值）',has(L()[Y].ask2)&&has('好。我自己來。')&&!!r2&&r2.state==='declined'&&!(H.G.msgs||[]).some(x=>x.tag==='pool_yt2_ask'),J(said())); });

/* 林采潔：導覽認識；第三章選「不能用」、大二下文學獎那則是 law 版；大四下印好的書 */
await sec('4 林采潔',async()=>{ const a=ACTIVITIES.list.find(x=>x.id==='lib_tour_y1s1'); fresh(TD('Y1S1',1,1),15.5,'library_hall'); const d=onDay(a,TD('Y1S1',1,1)); set(d,15.5,'library_hall'); H.said=[]; H.picks=['法律系的課本']; await CLS.attendActivity(GM,a);
  check('4. 林采潔：總圖新生導覽走完 → 導覽版認識（「……這本的兇手，我猜到了。可是我還是要借。」…），選「法律系的課本算嗎？」',has('……這本的兇手，我猜到了。可是我還是要借。')&&has('算。兇手都寫在條文裡，只是要自己找。')&&SOCIAL.has(C,'FIRST_MET')&&whoOf('我叫林采潔。你看推理小說嗎？')==='林采潔',J(said()));
  const s0=TD('Y1S1',12,2); set(s0,14,'bookstore'); rel(C,25,6); GM.npc={}; spawn(C); await talk(C,[]);
  check('4. 林采潔 秘密（大一上第 12 週起、有點熟）：「其實……我在寫一篇推理小說。」接「我寫的那篇卡在第三章…」；不加選項；這時還不開口（第三章在大一下）',has('其實……我在寫一篇推理小說。')&&has('「我寫的那篇卡在第三章：兇手的動機，連我自己都不信。……法律系的課，會教怎麼判斷動機嗎？」')&&!H.opts.length&&!SIDEQ.get(H.G,'PQ_CJ'),J(said()));
  const s1=TD('Y1S2',3,2); set(s1,14,'bookstore'); GM.npc={}; spawn(C); await talk(C,[0]); const r=SIDEQ.get(H.G,'PQ_CJ');
  check('4. 林采潔 6-3（大一下第 2～12 週、舊路書房）：「好，我看看。」＝檔案傳給你、加好友、掛「第三章」',has('我的第三章卡住了。兇手被抓到以後，在警察局自白。可是我不確定那個自白在法庭上能不能用。')&&has('檔案傳給你。只看第三章，你不要往後翻……後面還沒寫，翻了也沒有。')&&!!r&&r.state==='open'&&INV.hasContact(H.G,C),J(said()));
  set(s1+1,14,'bookstore'); GM.npc={}; spawn(C); await talk(C,['不能用']);
  check('4. 林采潔：下一次在舊路書房說話＝讀完；選「整晚不讓他睡，這個自白大概不能用。」→「疲勞訊問」那幾句、CJ_ADVICE law、人物頁「讀過她的第三章」、做完',has('「疲勞訊問」。上課聽過這四個字，寫的時候完全沒想到。')&&H.G.flags.CJ_ADVICE==='law'&&r.state==='done'&&P().deeds(H.G,C).includes('讀過她的第三章'),J(said()));
  const aw=D('2027-05-21'); phAt(aw,22.2);
  check('4. 林采潔：大二下 5 月文學獎那則是 law 版（「法律細節很紮實…」「紮實的那一半，有你的份。」）',J(msgs(C).slice(-2))===J(['文學獎沒上。評審說「法律細節很紮實，可惜結局倉促」。','紮實的那一半，有你的份。']),J(msgs(C).slice(-3)));
  const b=TD('Y4S2',15,2); set(b,14,'bookstore'); GM.npc={}; spawn(C); SOCIAL.meet(Y,'classroom'); await talk(C,[]);
  check('4. 林采潔 6-5 大四下第 15 週，舊路書房：印好的書（認識郁婷＝「印了五本。…郁婷、你…」）；房間物品「采潔的《第三章》」看＝law 版',has('（她從布書袋裡拿出一本很薄的書，封面寫著《第三章》。）')&&has('印了五本。我媽、書房老闆、郁婷、你，最後一本我自己留著。')&&has('第一頁先不要看結局。')&&STORY.roomItemList(H.G).some(x=>x[0]==='采潔的《第三章》'&&x[1]==='（第三章裡，警察讓兇手睡了一晚。）'),J(said()));
  fresh(b,14,'bookstore'); meet(C); rel(C,25,6); spawn(C); await talk(C,[]);
  check('4. 林采潔 6-5 沒認識郁婷：列名字那一句換成「我媽、書房老闆、你，還有兩本我自己留著。」（「印了五本。」留著）；平常看房間物品＝「（你翻到最後一頁，又翻回來。）」',has('印了五本。我媽、書房老闆、你，還有兩本我自己留著。')&&!has('印了五本。我媽、書房老闆、郁婷、你，最後一本我自己留著。')&&STORY.roomItemList(H.G).some(x=>x[0]==='采潔的《第三章》'&&x[1]==='（你翻到最後一頁，又翻回來。）'),J(said())); });

/* 鄭元碩：背影→秘密選「你拍的那張背影」；當主角→展覽的旁白是你的版本 */
await sec('4 鄭元碩',async()=>{ const d=TD('Y1S1',6,3); fresh(d,16.5,'campus'); spawn(YS); await talk(YS,['可以給我看']);
  check('4. 鄭元碩 認識（椰林大道，晴天 16:00～17:30）：選「可以給我看嗎？」→ YS_PHOTO',has('我是鄭元碩，大三，法律系。系上活動的照片，十張裡有八張是我拍的。所以照片裡都沒有我。')&&has('洗出來再給你。底片的，要等。')&&H.G.flags.YS_PHOTO===true,J(said()));
  set(TD('Y1S2',8,3),16.5,'campus'); rel(YS,25,3); GM.npc={}; spawn(YS); await talk(YS,['那張背影']);
  check('4. 鄭元碩 秘密（大一下第 8 週起）：有 YS_PHOTO 才有「你拍的那張背影，我記得。」→ 照片、YS_REMEMBER、房間物品「元碩拍的背影」',(H.opts[0]||[]).includes('「你拍的那張背影，我記得。」')&&has('……那張洗出來了。我一直忘了給你。')&&H.G.flags.YS_REMEMBER===true&&STORY.roomItemList(H.G).some(x=>x[0]==='元碩拍的背影'),J(said()));
  set(TD('Y2S2',4,2),16.5,'campus'); GM.npc={}; spawn(YS); await talk(YS,[0]); const q=(H.G.outings||[]).find(x=>x.ev==='ev_pool_ys_day'), r=SIDEQ.get(H.G,'PQ_YS');
  check('4. 鄭元碩 7-3（大二下第 4～10 週）：「我可以。」＝加好友、掛「法律系的一天」、排下一個週六 07:00',!!r&&r.state==='open'&&INV.hasContact(H.G,YS)&&!!q&&q.h===7&&wdOf(q.day)===6,J(said()));
  H.said=[]; H.picks=[]; set(q.day,6.9); await OUT.go(GM,q);
  check('4. 鄭元碩：那一天（2D，四段）演完＝YS_MODEL、做完',has('（早上七點，傅鐘。你坐在長椅的一頭，他蹲在遠遠的地方。）')&&has('最後一張了。謝啦。')&&H.G.flags.YS_MODEL===true&&r.state==='done',J(said()));
  const ex=TD('Y2S2',15,1); set(ex,12.5,'campus'); GM.npc={}; spawn(YS); E.interactables=[]; P().populate('campus',GM); const it=E.interactables.find(x=>x.poolAct==='ysExpo'); H.said=[]; if(it&&!it.hidden) await STORY.interact(it,GM);
  check('4. 鄭元碩 7-4 展覽（大二下第 15 週週一，霖澤館穿堂「看穿堂的照片」）：你的版本＋最後一張大一的背影＋他在場的那一句',!!it&&has('（照片裡的人是你：傅鐘的早上、穿堂的中午、麵店的傍晚、總圖的晚上。每一張都只拍到你的背影或側臉。）')&&!has('（照片裡的人是邱家齊。每一張，他都在看鏡頭。）')&&has('（最後一張是大一那年，椰林大道下午四點，一個走進鏡頭的背影。）')&&has('展覽的照片，還是沒有我。……這樣剛好。'),J(said())); });

/* 邱家齊：魚丸；答應代收但週六沒去領 → 週日那一則、人物頁沒有那一行 */
await sec('4 邱家齊',async()=>{ const d=TD('Y1S1',5,7); fresh(d,21.5,'dorm_hall'); spawn(Q); await talk(Q,[1]);
  check('4. 邱家齊 認識（男一舍交誼廳，週日 21～23）：魚丸、QJQ_FISH、房間的冰箱多一包',has('學弟，你那層的冰箱還有位子嗎？……我媽又寄了。')&&has('虱目魚丸。我們台南的。……你沒吃過？那你今天先拿一包。')&&H.G.flags.QJQ_FISH===true&&STORY.roomItemList(H.G).some(x=>x[1]==='（虱目魚丸。袋子上用麥克筆寫著「家齊」。）'),J(said()));
  const th=TD('Y1S2',4,4); set(th-2,21.5,'dorm_hall'); rel(Q,25,3); GM.npc={}; spawn(Q); await talk(Q,[0]);
  check('4. 邱家齊 秘密（大一上第 10 週起、交誼廳、有點熟）：週二先聽秘密「其實……我很想家。」；同一場不開口代收',has('其實……我很想家。')&&SOCIAL.has(Q,'SHARED_SECRET')&&!SIDEQ.get(H.G,'PQ_QJQ'),J(said()));
  set(th,21.5,'dorm_hall'); GM.npc={}; spawn(Q); await talk(Q,[0]); const r=SIDEQ.get(H.G,'PQ_QJQ');
  check('4. 邱家齊 8-3（大一下第 4～10 週，交誼廳，週四晚上）：「我幫你領。」＝加好友、掛「代收媽媽的箱子」（週六 10～18 門廳）',has('這禮拜六我媽寄的箱子會到，可是我要回台南看阿公。')&&!!r&&r.state==='open'&&r.satDay===th+2&&INV.hasContact(H.G,Q),J(said()));
  set(th+2,11,'dorm_hall'); E.interactables=[]; P().populate('dorm_hall',GM); const pick=E.interactables.find(x=>x.poolAct==='qjqPick');
  check('4. 邱家齊：週六 10～18 男一舍門廳有「領包裹」（新的互動點）',!!pick&&!pick.hidden);
  set(th+3,21.3,'dorm_hall'); SIDEQ.lapse(H.G); ph();
  check('4. 邱家齊：答應了週六沒去領 → 過期（不扣數值）、週日 21:00「箱子退回去了。沒關係，我媽說下禮拜再寄。」、人物頁沒有「幫他領過媽媽寄的箱子」',r.state==='lapsed'&&msgs(Q).includes('箱子退回去了。沒關係，我媽說下禮拜再寄。')&&!msgs(Q).includes(L()[Q].sat)&&!P().deeds(H.G,Q).includes('幫他領過媽媽寄的箱子')&&pick.hidden===true,J(msgs(Q)));
  /* 領了的那一路（對照）：週六 20:00 那一則、週日桌上的紙條、人物頁那一行 */
  fresh(th,21.5,'dorm_hall'); SOCIAL.meet(Q,'dorm_hall'); rel(Q,25,3); SOCIAL.remember(Q,'SHARED_SECRET','我很想家'); spawn(Q); await talk(Q,[0]); const r2=SIDEQ.get(H.G,'PQ_QJQ'); set(th+2,11,'dorm_hall'); E.interactables=[]; P().populate('dorm_hall',GM);
  for(const k of ['qjqPick','qjqFridge']){ const x=E.interactables.find(q=>q.poolAct===k); if(x&&!x.hidden) await STORY.interact(x,GM); }
  phAt(th+2,20.2); set(th+3,18,'dorm_hall'); const note=E.interactables.find(x=>x.poolAct==='qjqNote'); H.said=[]; if(note&&!note.hidden) await STORY.interact(note,GM);
  check('4. 邱家齊（對照）：門廳「領包裹」→ 交誼廳「把箱子放進交誼廳的冰箱」＝做完；週六 20:00 他私訊；週日晚上桌上的紙條；人物頁「幫他領過媽媽寄的箱子」',r2.state==='done'&&msgs(Q).includes(L()[Q].sat)&&has('（「魚丸分你兩包。阿公好多了。——家齊」）')&&P().deeds(H.G,Q).includes('幫他領過媽媽寄的箱子'),J([r2,msgs(Q),said()]));
  /* 8-6 畢業那一週（大二下第 16 週）：週日 21～23 他在場＝那一場；週二不演；冰箱的紙條整週都看得到 */
  fresh(TD('Y2S2',16,2),21.5,'dorm_hall'); meet(Q); rel(Q,25,6); SOCIAL.remember(Q,'SHARED_SECRET','我很想家'); spawn(Q); await talk(Q,[0]); const tue=has('學弟，我要回台南了。之後來台南，早餐我帶你去吃。');
  E.interactables=[]; P().populate('dorm_hall',GM); const fr=E.interactables.find(x=>x.poolAct==='qjqFridgeNote'); const frOk=!!fr&&!fr.hidden;
  set(TD('Y2S2',16,7),21.5,'dorm_hall'); GM.npc={}; spawn(Q); await talk(Q,[0]);
  check('4. 邱家齊 8-6：畢業那一週的週日 21～23 在交誼廳＝「學弟，我要回台南了。…」→「一定去。」；週二不演；「看交誼廳的冰箱」那一週都在',!tue&&frOk&&has('學弟，我要回台南了。之後來台南，早餐我帶你去吃。')&&has('牛肉湯，五點半就開了。你起得來的話。'),J([tue,frOk,said()])); });

/* 舊存檔：說過舊三句、說過秘密的，不重問，後面照「沒選」那一版 */
await sec('4 舊存檔',async()=>{ const d=TD('Y1S2',12,2); fresh(d,6.75,'campus'); meet(Z); rel(Z,25,4);
  const OLD3=SMALLTALK[Z].map(e=>e.t); H.G.social.small={[Z]:{day:0,used:OLD3.slice(),last:OLD3[2],once:{[OLD3[0]]:true,[OLD3[1]]:true,[OLD3[2]]:true}}}; SOCIAL.remember(Z,'SHARED_SECRET','想當律師');
  const s=JSON.parse(J(H.G)); P().migrate(s); Object.assign(H.G.flags,s.flags); H.G.pool=s.pool;
  check('4. 舊存檔：說過秘密（舊的「其實……」）的記成「沒選」（ZJW_HELP none）',H.G.flags.ZJW_HELP==='none'&&H.G.pool.secret[Z]==='none',J([H.G.flags.ZJW_HELP,H.G.pool]));
  spawn(Z); const heard=[]; for(let k=0;k<4;k++){ set(d+k,6.75,'campus'); GM.npc={}; spawn(Z); await talk(Z,[]); heard.push(...H.said.map(x=>x.t)); }
  check('4. 舊存檔：說過的舊三句（原句）不再說，新的閒聊從沒說過的開始；秘密不重問（大一下第 12 週起在傅鐘也不演）',!heard.some(t=>OLD3.includes(t))&&!heard.includes('其實……我想當律師。可是我還不知道要幫誰。你呢？')&&heard.includes('「民總講到意思表示那天，我寫了三頁。回去看，只看得懂第一頁。」')===false&&heard.some(t=>/^「/.test(t)),J(heard));
  set(D('2029-06-02'),6.4,'campus'); GM.npc={}; spawn(Z); await talk(Z,[]);
  check('4. 舊存檔：畢業典禮早上照「沒選」那一版（「我還是不知道要幫誰。可是我會一直找下去。」）',has('我還是不知道要幫誰。可是我會一直找下去。')&&!has('畢業以後先考試。考上的話，我想去法扶。先說好，你不要笑。'),J(said())); });

/* ---------- 5 手機頻率上限 ---------- */
await sec(5,()=>{ const d=TD('Y2S1',3,2); fresh(d,12,'campus'); const A='pool_9', B='pool_11';
  check('5. 沒交換聯絡方式的人不送（閒聊型、劇情的都一樣）',!P().chatOK(H.G,A)&&!P().chat(H.G,A,['（測試）'],'t_a0')&&!P().story(H.G,Z,d,13,'（測試）','t_s0'));
  INV.addContact(H.G,A); INV.addContact(H.G,B); INV.addContact(H.G,Z);
  const a1=P().chat(H.G,A,['（測試一）'],'t_a1'); set(d+3,12); const b1=P().chat(H.G,B,['（測試二）'],'t_b1'); set(d+7,12); const b2=P().chat(H.G,B,['（測試三）'],'t_b2'); set(d+20,12); const a2=P().chat(H.G,A,['（測試四）'],'t_a2'); set(d+31,12); const a3=P().chat(H.G,A,['（測試五）'],'t_a3');
  check('5. 閒聊型：二十位加起來一週一則（第 3 天別人的不送、第 7 天可以）；同一個人一個月一則（第 20 天不送、第 31 天可以）',a1&&!b1&&b2&&!a2&&a3,J([a1,b1,b2,a2,a3]));
  INV.addContact(H.G,'pool_2'); set(d+50,12); const c1=P().chat(H.G,'pool_2',['（測試六）'],'t_c1'); const n0=P().rec(H.G).chat.length; const s1=P().story(H.G,Z,d+51,8,'（劇情）','t_story');
  check('5. 劇情那幾則（各人的表）不算在上限裡：今天別人才傳過閒聊，劇情照送、也不記進上限',c1&&s1&&P().rec(H.G).chat.length===n0&&!P().chatOK(H.G,B)&&(H.G.phone&&H.G.phone.q||[]).some(q=>q.tag==='t_story'));
  /* 考試週：另開一局（沒有傳過任何閒聊＝只剩考試週這個理由）*/
  fresh(d,12,'campus'); INV.addContact(H.G,B); const ex=(()=>{ for(let x=d;x<d+120;x++){ const t=CALENDAR.termOf(x); if(t&&t.exam) return x; } return null; })();
  set(ex-7,12); const okBefore=P().chatOK(H.G,B); set(ex,12); const okExam=P().chatOK(H.G,B); const sx=P().chat(H.G,B,['（考試週）'],'t_ex');
  check('5. 考試週（期中、期末）不送閒聊型的（前一週可以）',okBefore===true&&okExam===false&&!sx,keyOf(ex)+' '+J([okBefore,okExam,sx]));
  /* 第一批五位四年下來的手機：全部是劇情的（各人的表），沒有閒聊型 */
  check('5. 第一批五位的訊息都在各人的表（劇情），pool3d.js 沒有用 S.chat 送第一批的訊息',!/S\.chat\(G,/.test(fs.readFileSync(path.join(H.ROOT,'src/pool3d.js'),'utf8'))); });

/* ---------- 6 關係上限 ---------- */
await sec(6,async()=>{ const d=TD('Y1S1',4,2); fresh(d,6.75,'campus'); spawn(Z); await talk(Z,[0]);
  for(let k=1;k<=16;k++){ set(d+k,6.75,'campus'); GM.npc={}; spawn(Z); await talk(Z,[]); }   /* 閒聊照舊（一天熟悉＋2）*/
  const d2=TD('Y1S2',3,2); set(d2,6.75,'campus'); GM.npc={}; spawn(Z); await talk(Z,[0]); const q=(H.G.outings||[]).find(x=>x.ev==='ev_pool_zjw_court'); H.picks=[0]; set(q.day,9.2); await OUT.go(GM,q);
  const before=SOCIAL.stage(Z); for(const [k,h] of [[TD('Y2S1',1,1),6.5],[TD('Y3S1',10,3),21.2],[D('2029-06-02')-1,6.4]]){ set(k-1,22); ph(); set(k,h); ph(); set(k,h+0.2); ph(); }
  const yq=(H.G.msgs||[]).find(m=>m.tag==='pool_zjw_y3'); if(yq) PHONE.answer(H.G,yq.ask.id,0);
  set(D('2029-06-02'),6.4,'campus'); GM.npc={}; spawn(Z); await talk(Z,[]); SOCIAL.talkedTo(Z);
  const r=SOCIAL.rel(Z);
  check('6. 曾靖雯：做完順手的事、走完線（認識、旁聽＝秘密＋順手的事、法服、大三上、畢業前一天、畢業典禮早上）＝朋友；做完以前還不是',SOCIAL.stage(Z)==='FRIEND'&&before!=='FRIEND'&&SOCIAL.reveal(Z)==='FRIEND',SOCIAL.stage(Z)+' '+J(r)+' before '+before);
  check('6. 不會有戀愛：npcRom、rom 都沒加',r.npcRom===0&&r.rom===0);
  check('6. 升到朋友：人物頁照 personality（「想當律師，還不知道要幫誰」）',P().pageDesc(Z)==='想當律師，還不知道要幫誰'); });

/* ---------- 7 2-9 ---------- */
await sec(7,async()=>{ const ev=STORY_EVENTS.find(e=>e.id==='ev_pool_greet');
  const run=async(id,pick,zone,hr)=>{ fresh(TD('Y1S1',6,2),hr||14,zone||'campus'); GM.npc={}; const n=spawn(id); for(let i=0;i<3;i++) SOCIAL.noticed(id); H.said=[]; H.picks=[pick]; const f0=SOCIAL.rel(id).fam; await EVENTS.run(ev); return {f:SOCIAL.rel(id).fam-f0,t:H.said[0]&&H.said[0].t}; };
  let a=await run(Z,0); check('7. 在教室出現的人（曾靖雯）：「迎面走來一個人，你確定在教室看過。對方也放慢了一步。」（原句）',a.t==='迎面走來一個人，你確定在教室看過。對方也放慢了一步。',a.t);
  a=await run('pool_15',0); check('7. 不在教室出現的人（廖芸萱）：換成「在〈他的地點〉看過」＝「…你確定在文學院看過。…」',a.t==='迎面走來一個人，你確定在文學院看過。對方也放慢了一步。',a.t);
  a=await run(Q,0,'campus',12.5); check('7. 有兩個地點的人照現在那一筆（邱家齊平日中午在校園＝「…你確定在總圖門口看過。…」，不是交誼廳）',a.t==='迎面走來一個人，你確定在總圖門口看過。對方也放慢了一步。',a.t);
  fresh(TD('Y1S1',6,2),14,'campus'); GM.npc={}; spawn('pool_8'); for(let i=0;i<3;i++) SOCIAL.noticed('pool_8'); H.picks=[0]; await EVENTS.run(ev); const f1=H.G.flags.pool_greeted;
  GM.npc={}; spawn('pool_13'); for(let i=0;i<3;i++) SOCIAL.noticed('pool_13'); const f0=SOCIAL.rel('pool_13').fam; H.picks=[1]; H.G.events.last={}; await EVENTS.run(ev);
  check('7. pool_greeted 一次見面用完就清掉：上一個人點了頭，下一個人選「假裝看手機」不加熟悉',f1===undefined&&SOCIAL.rel('pool_13').fam===f0&&H.G.flags.greet_pool_13===true,J([f1,SOCIAL.rel('pool_13').fam,f0])); });

/* ---------- 8 其他 ---------- */
await sec(8,async()=>{ const g=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
  check('8. 沒說過話的人不進朋友頁（game3d.js knownIds：B 層＝ACQUAINTANCE／FRIEND；看過三次的 RECOGNIZABLE 不算）',/if\(c\.social_layer==='B'\) return \['ACQUAINTANCE','FRIEND'\]\.includes\(SOCIAL\.reveal\(id\)\);/.test(g));
  check('8. 人物頁：B 層用 POOL.pageDesc（一句話；朋友＝personality）＋做過的事（POOL.deedsHTML）',/POOL\.pageDesc\(id\)/.test(g)&&/POOL\.deedsHTML\(id,G\)/.test(g));
  fresh(TD('Y1S1',6,2),14,'bookstore'); meet(C); check('8. 人物頁一句話（認識以後、心事說出來以前）：中性的一句「常在舊路書房看推理小說的同學」（AA_498「實作時定的」第 4 點，照 AA_120）；說出來以後換回「在寫一篇兇手是律師的推理小說」',P().pageDesc(C)==='常在舊路書房看推理小說的同學'&&(SOCIAL.remember(C,'SHARED_SECRET',''),P().pageDesc(C)==='在寫一篇兇手是律師的推理小說'));
  check('8. 何宇軒、葉晨希、詹立群也是：說出來以前「常在總圖問助教問題的同學」「背吉他袋的學妹」「常幫人搬音響的同學」',['pool_10','pool_11','pool_16'].map(id=>P().pageDesc(id)).join('|')==='常在總圖問助教問題的同學|背吉他袋的學妹|常幫人搬音響的同學',['pool_10','pool_11','pool_16'].map(id=>P().pageDesc(id)).join('|'));
  check('8. 沒有回答選項的「……你呢？」不再出現（其他十五位照舊自我介紹）',!/。……你呢？」'\)/.test(fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8')));
  /* 順手的事和店員的一起算（SIDEQ.MAX）*/
  fresh(TD('Y1S2',3,2),6.75,'campus'); meet(Z); rel(Z,25,3); SIDEQ.rec(H.G).SQ01={state:'open',step:'wait',day:H.G.day,term:'Y1S2'}; SIDEQ.rec(H.G).SQ03={state:'open',step:'x',day:H.G.day,term:'Y1S2'}; spawn(Z); await talk(Z,[0]);
  check('8. 同時最多兩則（SIDEQ.MAX）跟店員的一起算：已經掛了兩則店員的，靖雯不開口',!SIDEQ.get(H.G,'PQ_ZJW')&&!has(L()[Z].ask[0].text),J(said()));
  delete SIDEQ.rec(H.G).SQ03; set(H.G.day+1,6.75); GM.npc={}; spawn(Z); await talk(Z,[0]);
  check('8. 少一則就開口；同學的順手的事也算在 SIDEQ.openIds（店員的那一則現在不能再出）',SIDEQ.openIds(H.G).includes('PQ_ZJW')&&SIDEQ.openIds(H.G).length===2&&(SIDEQ.Q.SQTEST={shop:'x',title:'x',avail:()=>true},!SIDEQ.canOffer(H.G,'SQTEST')),J(SIDEQ.openIds(H.G))); delete SIDEQ.Q.SQTEST;
  check('8. 新的互動點只有互動點（男一舍門廳「領包裹」、交誼廳的冰箱與紙條、霖澤館一樓「看補給的桌子」、穿堂「看穿堂的照片」）',['領包裹','把箱子放進交誼廳的冰箱','看交誼廳的冰箱','看桌上的紙條','看補給的桌子','看穿堂的照片'].every(t=>fs.readFileSync(path.join(H.ROOT,'src/pool3d.js'),'utf8').indexOf("label:'"+t+"'")>0));
  const ih=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), sc=[...ih.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
  /* heroine_asks.js → heroine_asks3d.js → bbpack_events.js 緊接（tests/heroine_asks_unit.js 查）：pool 的兩個檔放在 heroine_asks 前面（rom1016_3d.js 後面）*/
  const ix=f=>sc.indexOf(f);
  check('8. index.html：pool_story.js、pool3d.js（緊接）在 story3d.js、sideq3d.js、classes3d.js、outings3d.js 之後、bbpack_events.js 前面；heroine_asks3d.js 在 bbpack_events.js 前面（中間可以有 dorm203、heard）；bbpack3d.js 緊接 GAME.boot()（中間可以是 AA_497 的兩支）',ix('src/data/pool_story.js')>Math.max(ix('src/story3d.js'),ix('src/sideq3d.js'),ix('src/classes3d.js'),ix('src/outings3d.js'))&&ix('src/pool3d.js')===ix('src/data/pool_story.js')+1&&ix('src/pool3d.js')<ix('src/data/bbpack_events.js')&&ix('src/heroine_asks3d.js')>=0&&ix('src/heroine_asks3d.js')<ix('src/data/bbpack_events.js')&&/src\/bbpack3d\.js[^"]*"><\/script>\s*(<script src="src\/data\/sup497_lines\.js[^"]*"><\/script>\s*<script src="src\/sup497_3d\.js[^"]*"><\/script>\s*)?<script>GAME\.boot\(\);/.test(ih),J(sc.slice(-8))); });   /* 2026-10-28 改：bbpack3d.js 和 GAME.boot() 中間可以是 AA_497 的兩支（data/sup497_lines.js、sup497_3d.js；tests/aa497_supporting_unit.js）*/
H.done();
}
