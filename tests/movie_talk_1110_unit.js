// 南洋戲院每部片的情節、那一幕、散場聊什麼、和誰看多出來的（MOVIE-TALK-1110；使用者 X324，AA_745 三批）——不需要瀏覽器（D131）。
// 使用者 11-10 20:0x（對 AA）：「所有的電影……你要認真寫電影的情節，然後會影響劇情，跟誰看對誰有不同影響，但不要每個人都有，這樣會太像一個模板」
// 稿 AA_745_movie_plots_1～3.json（企劃線第二版 14536ff5e、77f5d0463、7c2de85b6；第一版 d94b6ae6d、c7152c522、4de16b994）→ src/data/movie_plots.js（tools/movie/import_movie_plots.py）；播放 src/movies3d.js。檢查：
//   0. 匯入：--check 一致；72 部；每一部的 plot、scene、talk、with 和白名單上那一版的稿一字不差；index.html 在片單之後、movies3d.js 之前載入
//   1. 和以安看《第十三號月台》（2025-10）：散場走出 1 廳以後她先問（q）→ 三個選項（照稿）→ 她的回答 → 效果（她的戀愛 +1）；接著 with.after 那一段（在道別以前）；
//      看過記在 G.flags.MOVIE_SEEN（她、me）、選了第幾個記在 MOVIE_TALK
//   2. 效果的規則：fr＝熟悉、信任、自在各 +n；love＝她的戀愛（可以攻略的對象，認識就算——ROM-PRIVATE-DATE-1110 以後的現行規則；交往中一樣）；男生朋友不加戀愛
//   3. 同一部片和同一個人第二次看：沒有 talk（沒有選項、沒有 q），一句旁白（不是喜劇＝「第二次看…」；喜劇片＝「她還是在同一個地方笑」）；一天一次
//   4. 一個人看（1 廳坐下）：solo 三句中間接兩部的那一幕、沒有選項；兩部都記看過（me）；海報牆「看這部在演什麼」看過以前第一句、看過以後全部
//   5. skip：子晴選到《黑白的城市》＝換同一段的另一部（聖誕快遞），她說稿上那兩句（見面前／約的時候），約好的那一筆存換過的片，好感不扣
//   6. 一定挑：子晴 2028-01《貓咪咖啡館的星期三》、2028-05《第八關》；芷若 2025-11《黑白的城市》（AA_708 那一場有指定片時照指定）
//   7. later：可昕《第三個證人》＝旗標＋隔天晚上的訊息；可昕《颱風夜的貨船》＝訊息有兩個選項（回了＝效果、KX_SHIP_REPORT）；
//      以安《沉默的書記官》＝接點還沒有（只記旗標、MOVIE_LATER_DUE）；以安《借據》＝下次在圖書館見面時說（之後就不再說）
//   8. note 的條件：芷若《起霧的城》第三個選項要和她看過《黑白的城市》、她那一句照當時選的換字；學姊《新年快樂，陌生人》第二句只在朋友以上、交往中換句
//   9. 看到一半：沒有第 N 場（一般句）＝演那部片的那一幕（scene）；和沛珊看《雪融之前》（with.mid）＝取代那一幕
//  10. 舊存檔（沒有 MOVIE_SEEN、MOVIE_TALK；或格式壞掉）：照常演、存檔 JSON 來回不壞
//  11. 下次見面說（AA 11-10 20:35、第二版）：語彤《m2605b》一盞茶屋；可昕《m2505b》考試以前；子晴《m2805b》她畢業以後；學姊《m2901b》朋友以上
//  12. 芷若《m2703b》（第二版）：出發那天（2027-09-02）她傳照片、兩個回覆——全部照稿，匯入工具沒有另外改句
//  13. talk 的選項順序每次洗（同一天同一部同一個人固定）；一次看電影她的戀愛最多 +2（talk＋with 的選項；扣的不限）
//  14. 資料不齊（沒有 re、沒有 fx、第二句 heroine_012、m2801b pick、q 是說明、壞資料）：不出空的框、不丟例外、不卡
//  15. with.kind pick、fx 0 和負的（SOCIAL.applyFx）；匯入工具：不認得的人列警告、不停
//  16. BB 11-10 瀏覽器測試：她指定的片本來就選到＝照說她那幾句、一般的答應句不說；稿上沒寫到她的片不出三個選項
//  第二版（AA_745 14536ff5e、77f5d0463、7c2de85b6；AA_730 7c2de85b6）重匯；可昕排球的開關拿掉（稿裡已經沒有）
//  片名不寫死（AA_730 可能改片名）：一律 MOVIES.film(id).title
// 修改前（e77ae86ac 以前，movies3d.js 沒有 AA_745）：FAIL。用法：node tests/movie_talk_1110_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const loadErr=[];
const loadG=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ vm.runInThisContext(fs.readFileSync(p,'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='),{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,200)); return false; } };
let LIGHTS=true; const lobbyZ={group:null,seats:[]}, hallZ={group:null,seats:[]};
global.NY3={houseLights(on){ LIGHTS=!!on; return true; }, lobby:{build(){ return lobbyZ; }}, hall:{build(){ return hallZ; }}};
global.Z3={ZONES:{xs_nanyang:NY3.lobby,xs_nanyang_hall:NY3.hall}};
for(const f of ['src/data/study_scenes.js','src/data/activity_scenes.js','src/studyn3d.js','src/data/nanyang_layout.js','src/nanyang_sys3d.js','src/data/nanyang_movies.js','src/data/movie_plots.js','src/movies3d.js','src/data/shop_npc.js','src/data/heroine_circle.js','src/whois3d.js','src/aa614_3d.js']) loadG(f);
const MV=()=>typeof MOVIES!=='undefined'?MOVIES:null, PL=()=>typeof MOVIE_PLOTS!=='undefined'?MOVIE_PLOTS:null;
const trace=[]; let sits=[];
GM.enter=async(z)=>{ H.entered.push(z); H.G.zone=z; GM.npc={}; E.npcs=[]; E.player.seat=null; E.zone=z==='xs_nanyang_hall'?{seats:(NANYANG_LAYOUT.hall.seats||[]).map(s=>({kind:'cinema',row:s.row,x:s.x,z:s.z,y:s.y,yaw:s.yaw,lv:0})),roomAt:()=>null}:{seats:[],roomAt:()=>null}; };
GM.spawnCharacter=(id,x,z,o)=>{ const n={id,charId:id,obj:{position:{x,y:0,z},rotation:{y:(o&&o.yaw)||0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
GM.sitAt=(ent,seat)=>{ ent.seat=seat; ent.pose='sit'; sits.push(seat); };
GM.standUp=ent=>{ ent.seat=null; ent.pose='idle'; };
E.placeAt=(ent,x,z)=>{ ent.obj.position.x=x; ent.obj.position.z=z; };
GM.say=async(who,t)=>{ const s=String(t).replace('{name}',H.G&&H.G.name||'祐廷'); H.said.push({who:who?(who.name||String(who)):null,t:s}); trace.push({t:s,zone:H.G.zone}); };
GM.money=d=>{ H.G.money+=d; };
/* 選項：想選的字（WANT）在這一組裡＝選它；不然第一個。記下每一組 */
let WANT=[], CH=[];
GM.choose=async o=>{ const T=o.map(q=>q.t||q.text); CH.push(T); for(const w of WANT){ const k=T.findIndex(t=>t===w); if(k>=0) return k; } return 0; };
/* SOCIAL.adjust 的每一次（看效果）*/
let ADJ=[]; { const a0=SOCIAL.adjust; SOCIAL.adjust=function(id,d,why){ ADJ.push([id,Object.assign({},d)]); return a0.apply(this,arguments); }; }
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone||'xs_nanyang'); G.invites=[]; G.msgs=G.msgs||[]; G.money=5000; G.visited={xs_nanyang:1,xs_nanyang_hall:1}; E.zone={seats:[],spawn:{x:0,z:5.2,yaw:Math.PI},roomAt:()=>null}; E.npcs=[]; E.player.seat=null; E.player.busy=false; INV._now=()=>Date.now()+1e9;
  trace.length=0; sits=[]; LIGHTS=true; WANT=[]; CH=[]; ADJ=[]; return G; };
const npc=id=>{ const n={id,charId:id,obj:{position:{x:0.5,y:0,z:4.6},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
const film=id=>PL().films[id];
const ttl=id=>MOVIES.film(id).title, dimOf=id=>'（燈暗下來，《'+ttl(id)+'》開始了。）';   /* 片名會改（AA_730）：一律從片單讀 */
const watch=async(id,film,h)=>{ const G=H.G; const iv=INV.accept(G,id,'xs_nanyang',G.day,h||19.5,{by:'player'}); if(film) iv.film=film; H.said=[]; trace.length=0; CH=[]; ADJ=[]; await INV.startTogether(GM,iv,npc(id)); return iv; };
const idx=t=>H.said.findIndex(s=>s.t===t);
const same=(a,b)=>J(a.slice().sort())===J(b.slice().sort());   /* talk 的三個選項每次順序不一樣：比內容不比順序 */
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };

(async()=>{
  await sec(0,async()=>{ let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/movie/import_movie_plots.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
    check('0. movie_plots.js 和白名單上的 AA_745 一致（import_movie_plots.py --check）、MOVIES 和 MOVIE_PLOTS 載得到',ok&&!!PL()&&!!MV()&&!loadErr.length,out.trim().slice(0,200)+' '+J(loadErr));
    if(!PL()) return;
    const allow=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>/AA_745_movie_plots_\d\.json$/.test(e.path)&&e.status==='approved');
    const raw={}; let bad=[];
    for(const e of allow){ try{ Object.assign(raw,JSON.parse(cp.execFileSync('git',['-C',H.ROOT,'show',e.sha+':'+e.path],{encoding:'utf8',maxBuffer:1<<26})).films); }catch(x){ bad.push(e.path+'@'+e.sha+'：git show 失敗（淺層 clone 先 git fetch origin claude/story-planning）'); } }
    const ids=Object.keys(PL().films); for(const id of ids){ if(J(raw[id])!==J(PL().films[id])) bad.push(id); }
    const all=[...new Set((fs.readFileSync(path.join(H.ROOT,'src/data/nanyang_movies.js'),'utf8').match(/m\d{4}[ab]/g)||[]))];
    check('0. 三批白名單、72 部（片單每一部都有）、plot／scene／talk／with 和稿一字不差',allow.length===3&&ids.length===72&&all.every(id=>ids.includes(id))&&Object.keys(raw).length===72&&!bad.length,J({allow:allow.length,n:ids.length,bad:bad.slice(0,5)}));
    const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), i=f=>html.indexOf('src="'+f);
    check('0. index.html：nanyang_movies.js → movie_plots.js → movies3d.js',i('src/data/movie_plots.js')>i('src/data/nanyang_movies.js')&&i('src/data/movie_plots.js')<i('src/movies3d.js')&&i('src/data/nanyang_movies.js')>0); });
  if(!MV()||!PL()){ check('（沒有載入：後面全部 FAIL）',false,J(loadErr)); H.done(); return; }

  await sec(1,async()=>{ const G=fresh('2025-10-18',19.4), id='heroine_01'; H.FRIEND(id);
    const T=film('m2509a').talk, o=T.opts[0]; WANT=[o.t];
    const iv=await watch(id); const qi=idx(T.q), ri=idx(o.re[id]), dim=idx(dimOf('m2509a'));
    const tk=CH.find(c=>same(c,T.opts.map(x=>x.t)));
    check('1. 片是《第十三號月台》；散場以後她先問、三個選項照稿、她的回答',iv.film==='m2509a'&&qi>dim&&!!tk&&ri>qi&&trace[qi].zone==='xs_nanyang'&&H.said[qi].who!==null,J({qi,ri,dim,CH,L:H.said.map(s=>s.t).slice(-12)}));
    check('1. 效果：她的戀愛 +1（fx love 1）',ADJ.some(([w,d])=>w===id&&d.npcRom===o.fx[id].love&&Object.keys(d).length===1),J(ADJ));
    const W=film('m2509a').with[id], wi=idx(W.lines[1]), C=W.choice.map(c=>c.t), ci=CH.findIndex(c=>J(c)===J(C));
    const by=ACTIVITY_SCENES.kinds.movie.people[id].scenes['1'].bye[0], bi=idx(STUDYN.text(G,by));
    check('1. with.after：talk 以後那一段＋兩個選項、在道別以前',wi>ri&&ci>=0&&(bi<0||bi>wi),J({wi,ri,bi,CH}));
    check('1. 看過（她、me）、選了第 0 個',MOVIES.seenDay(G,id,'m2509a')===G.day&&MOVIES.seenDay(G,'me','m2509a')===G.day&&G.flags.MOVIE_TALK[id].m2509a===0,J([G.flags.MOVIE_SEEN,G.flags.MOVIE_TALK])); });

  await sec(2,async()=>{ const G=fresh('2025-10-18',19); const a='heroine_01'; H.FAMILIAR(a);
    const r0=Object.assign({},SOCIAL.rel(a)); MOVIES.fx(G,a,{love:2}); MOVIES.fx(G,a,{fr:1}); const r1=SOCIAL.rel(a);
    check('2. 可以攻略的對象（有點熟）：love 2＝她的戀愛 +2；fr 1＝熟悉、信任、自在各 +1',r1.npcRom-r0.npcRom===2&&r1.fam-r0.fam===1&&r1.trust-r0.trust===1&&r1.comf-r0.comf===1&&(r1.rom|0)===(r0.rom|0),J([r0,r1]));
    H.FRIEND('classmate_bohan'); const b0=Object.assign({},SOCIAL.rel('classmate_bohan')); MOVIES.fx(G,'classmate_bohan',{love:2}); const b1=SOCIAL.rel('classmate_bohan');
    check('2. 男生朋友：love 不加',(b1.npcRom|0)===(b0.npcRom|0),J([b0,b1]));
    H.date('heroine_02'); const z0=SOCIAL.rel('heroine_02').npcRom|0; MOVIES.fx(G,'heroine_02',{love:3});
    check('2. 交往中：love 照加',(SOCIAL.rel('heroine_02').npcRom|0)-z0===3||SOCIAL.rel('heroine_02').npcRom===100,J(SOCIAL.rel('heroine_02'))); });

  await sec(3,async()=>{ const G=fresh('2025-10-18',19.4), id='heroine_01'; H.FRIEND(id); await watch(id);
    G.day+=1; G.hour=19.4; G.flags.NY_TICKET=null; G.flags.NY_WATCHED=null; const T=film('m2509a').talk;
    const iv=await watch(id,'m2509a');   /* 隔天 AA_708 是第 2 場（法庭片）會挑別部：這裡指定同一部（約的時候存的片照存檔演）*/
    check('3. 第二次和她看同一部：沒有 q、沒有那三個選項；一句「第二次看」旁白',iv.film==='m2509a'&&idx(T.q)<0&&!CH.some(c=>same(c,T.opts.map(x=>x.t)))&&idx(PL().again.other)>=0&&H.said[idx(PL().again.other)].who===null,J({film:iv.film,L:H.said.map(s=>s.t).slice(-8)}));
    check('3. 喜劇片的第二次＝「她還是在同一個地方笑」（聖誕快遞是動畫愛情喜劇）；其他＝第二次看',MOVIES.againLine('m2511a')===PL().again.comedy&&MOVIES.againLine('m2509a')===PL().again.other&&/喜劇/.test(MOVIES.film('m2511a').genre));
    const G2=fresh('2025-10-18',19.4); H.FRIEND(id); G2.daily={['mvTalk_'+id]:G2.day}; await watch(id);
    check('3. 同一個人一天一次：今天已經聊過＝不出 talk',idx(T.q)<0,J(H.said.map(s=>s.t).slice(-5))); });

  await sec(4,async()=>{ const G=fresh('2025-10-18',15,'xs_nanyang_hall'); G.stage='law'; G.flags.NY_TICKET=G.day; H.said=[]; CH=[];
    const pre=MOVIES.infoLines(G);
    await STORY.onSeat(GM,{kind:'cinema',row:3}); const L=H.said.map(s=>s.t), SL=MOVIES.soloLines(G), a=film('m2509a'), b=film('m2509b');
    check('4. 一個人看：solo 第一句、第一部的那一幕、第二句、第二部的那一幕、第三句；沒有選項',J(L.slice(0,5))===J([SL[0],a.scene,SL[1],b.scene,SL[2]])&&CH.length===0,J(L.slice(0,6)));
    check('4. 兩部都記看過（me），沒有記成和誰看過',MOVIES.seenWith(G,'me','m2509a')&&MOVIES.seenWith(G,'me','m2509b')&&Object.keys(G.flags.MOVIE_SEEN).length===1,J(G.flags.MOVIE_SEEN));
    const post=MOVIES.infoLines(G);
    check('4. 海報牆：看過以前只有第一句、看過以後全部',pre[0]==='《'+ttl('m2509a')+'》'+MOVIES.firstSentence(a.plot)&&pre[0]!=='《'+ttl('m2509a')+'》'+a.plot&&post[0]==='《'+ttl('m2509a')+'》'+a.plot&&post[1]==='《'+ttl('m2509b')+'》'+b.plot,J({pre,post}));
    fresh('2025-10-18',15); E.interactables=[]; NY3.lobby.build(E); const it=E.interactables.find(q=>q&&q.movieInfo); H.said=[]; const r=it?await STORY.interact(it,GM):false;
    check('4. 大廳的海報牆「看這部在演什麼」',!!it&&it.label==='看這部在演什麼'&&r===true&&H.said.length===2&&H.said[0].t.indexOf('《'+ttl('m2509a')+'》')===0,J({it,said:H.said})); });

  await sec(5,async()=>{ const G=fresh('2025-11-15',19.4), id='heroine_04'; H.FRIEND(id);
    const P=MOVIES.periodOf('m2511b'), a=MOVIES.pickAdj(P.bill,id,MOVIES.film('m2511b'),null), W=film('m2511b').with[id];
    check('5. 子晴選到《黑白的城市》＝換《聖誕快遞》、她說稿上的兩句',a.film.id==='m2511a'&&J(a.say)===J(W.lines),J(a));
    const pf=MOVIES.pickFrom; MOVIES.pickFrom=(bill)=>({film:bill.find(b=>b.id==='m2511b'),ok:true});
    let iv; try{ iv=INV.accept(G,id,'xs_nanyang',G.day,19.5,{by:'player'}); } finally { MOVIES.pickFrom=pf; }
    check('5. 約的那一筆存換過的片（m2511a）、標籤寫《聖誕快遞》、換片那一句排著',iv.film==='m2511a'&&iv.label.includes('看《'+ttl('m2511a')+'》')&&J(iv.filmSay)===J(W.lines),J([iv.film,iv.label,iv.filmSay]));
    H.said=[]; ADJ=[]; await INV.startTogether(GM,iv,npc(id)); const s0=idx(W.lines[0]), dim=idx(dimOf('m2511a'));
    check('5. 還沒說的換片那一句：見面時先說（燈暗以前）、之後不再說；好感一個都沒扣',s0>=0&&s0<dim&&!iv.filmSay&&H.said.filter(s=>s.t===W.lines[0]).length===1&&ADJ.every(([,d])=>Object.values(d).every(v=>v>=0)),J({s0,dim,ADJ})); });

  await sec(6,async()=>{ const G=fresh('2028-01-10',15); const id='heroine_04'; H.FRIEND(id); const c=MOVIES.choose(G,id);
    G.day=H.D('2028-05-20'); const d=MOVIES.choose(G,id);
    check('6. 子晴 2028-01＝《m2801b》（kind pick）、2028-05＝《m2805b》（with 裡 pick:true）',c&&c.id==='m2801b'&&d&&d.id==='m2805b'&&film('m2805b').with[id].pick===true,J([c,d]));
    const P=MOVIES.periodOf('m2511b'), f=MOVIES.pickAdj(P.bill,'heroine_02',MOVIES.film('m2511a'),null), g=MOVIES.pickAdj(P.bill,'heroine_02',MOVIES.film('m2511a'),{want:['anime']});
    check('6. 芷若 2025-11＝《黑白的城市》；AA_708 那一場有指定片＝照指定',f.film.id==='m2511b'&&!f.say&&g.film.id==='m2511a',J([f.film.id,g.film.id]));
    const P2=MOVIES.periodOf('m3007b'), h=MOVIES.pickAdj(P2.bill,id,MOVIES.film('m3007b'),null);
    check('6. 子晴 2030-07 選到黑白的《起霧的城》＝換另一部、說稿上那兩句',h.film.id==='m3007a'&&J(h.say)===J(film('m3007b').with[id].lines),J(h)); });

  await sec(7,async()=>{ const G=fresh('2024-10-05',19); G.stage='econ'; const k='kexin'; H.FRIEND(k); G.flags.dating_kexin=true;
    const GMx=Object.assign(Object.create(GM),{}); WANT=[];
    await MOVIES.after(GM,{place:'xs_nanyang',film:'m2409b',who:k,id:'ivx'},{name:'可昕',charId:k});
    const q=(PHONE.rec(G).q||[]).find(x=>x.tag==='mv745_m2409b_kexin'), W=film('m2409b').with[k];
    check('7. 可昕《第三個證人》：KX_SAW_THIRD_WITNESS、隔天 21:00 她的三則訊息（照稿）',G.flags.KX_SAW_THIRD_WITNESS===G.day&&!!q&&q.day===G.day+1&&q.h===21&&J(q.items.map(i=>i.text))===J(W.lines)&&q.items.every(i=>i.from===k),J(q));
    G.day=H.D('2026-09-20'); G.hour=19; G.stage='law'; ADJ=[];
    await MOVIES.after(GM,{place:'xs_nanyang',film:'m2609a',who:k,id:'ivy'},{name:'可昕',charId:k});
    G.day+=1; G.hour=21.2; PHONE.tick(G); const m=(G.msgs||[]).find(x=>x.tag==='mv745_m2609a_kexin'&&x.ask), C=film('m2609a').with[k].choice;
    G.flags.MOVIE_LOVE={}; G.flags.FX_CAP={}; const ans=m?PHONE.answer(G,m.ask.id,0):null;
    check('7. 可昕《颱風夜的貨船》：訊息有兩個選項；回第一個＝她的戀愛 +2、KX_SHIP_REPORT、她回稿上那一句',!!m&&J(m.ask.opts.map(o=>o.t))===J(C.map(c=>c.t))&&!!ans&&G.flags.KX_SHIP_REPORT===G.day&&ADJ.some(([w,d])=>w===k&&d.npcRom===2)&&(G.msgs||[]).some(x=>x.text===C[0].say[0]&&x.from===k),J({m:m&&m.ask,ADJ}));
    const G3=fresh('2026-04-10',19); const a='heroine_01'; H.FRIEND(a);
    await MOVIES.after(GM,{place:'xs_nanyang',film:'m2603b',who:a,id:'ivz'},{name:'以安',charId:a}); const W3=film('m2603b').with[a];
    const q3=(G3.flags.MOVIE_LATER||[]).slice(); H.said=[]; CH=[]; ADJ=[]; WANT=[W3.choice[0].t]; G3.day+=30; G3.flags.MOVIE_LOVE={}; G3.flags.FX_CAP={};
    const s0=await MOVIES.onSeated(GM,{who:'heroine_02',id:'ivo'},{name:'芷若',charId:'heroine_02'},INV.place('noodle'));
    const s1=await MOVIES.onSeated(GM,{who:a,id:'ivz2'},{name:'以安',charId:a},INV.place('noodle')); const said3=H.said.map(x=>x.t);
    const s2=await MOVIES.onSeated(GM,{who:a,id:'ivz3'},{name:'以安',charId:a},INV.place('noodle'));
    check('7. 以安《沉默的書記官》（AA 11-10 20:35：下一次見面）＝AN_MOM_ASKED、排進 MOVIE_LATER（不再只記 MOVIE_LATER_DUE）；三十天後在哪裡見面都說、只說一次、別人見面不說',
      G3.flags.AN_MOM_ASKED!=null&&!G3.flags.MOVIE_LATER_DUE&&q3.length===1&&s0===false&&s1===true&&s2===false&&J(said3.slice(0,3))===J(W3.lines)&&said3.includes(W3.choice[0].say[0])&&ADJ.some(([w,d])=>w===a&&d.npcRom===2),J({q3,s0,s1,s2,said3,ADJ,due:G3.flags.MOVIE_LATER_DUE}));
    WANT=[];
    const G4=fresh('2027-09-20',19); H.FRIEND(a);
    await MOVIES.after(GM,{place:'xs_nanyang',film:'m2709b',who:a,id:'ivw'},{name:'以安',charId:a});
    const Q=(G4.flags.MOVIE_LATER||[]).slice(); const W2=film('m2709b').with[a];
    H.said=[]; G4.day+=2; const r0=await MOVIES.onSeated(GM,{who:a,id:'iv9'},{name:'以安',charId:a},INV.place('noodle'));
    const r1=await MOVIES.onSeated(GM,{who:a,id:'iv10'},{name:'以安',charId:a},INV.place('library')); const said=H.said.map(s=>s.t);
    const r2=await MOVIES.onSeated(GM,{who:a,id:'iv11'},{name:'以安',charId:a},INV.place('library'));
    check('7. 以安《借據》：下次在圖書館見面時說（麵店不說）、選項、之後不再說',Q.length===1&&r0===false&&r1===true&&said[0]===W2.lines[0]&&CH.some(c=>J(c)===J(W2.choice.map(x=>x.t)))&&r2===false,J({Q,r0,r1,r2,said:said.slice(0,3)})); });

  await sec(8,async()=>{ const G=fresh('2030-07-10',19), z='heroine_02'; H.FRIEND(z); const o3=film('m3007b').talk.opts[2], full=o3.re[z];
    const T0=MOVIES.talkFor(G,z,'m3007b'); G.flags.MOVIE_SEEN={[z]:{m2511b:10}}; const Tn=MOVIES.talkFor(G,z,'m3007b');   /* 看過、可是那次沒有 talk 的紀錄 */
    const by=k=>{ G.flags.MOVIE_TALK={[z]:{m2511b:k}}; return MOVIES.talkFor(G,z,'m3007b').opts[2]; }, B=[by(0),by(1),by(2)], RB=o3.reBy, src=film('m2511b').talk.opts;
    const want=[RB['說過起雞皮疙瘩'][z],RB['說過喜歡翻報紙的聲音'][z],RB['說過蠻悶的'][z]];
    check('8. 芷若《m3007b》：沒和她看過《m2511b》＝兩個選項；看過＝三個；她的第一句照當時選的換（reBy 三句，一字不差），第二句「這部呢？」都一樣；當時沒有 talk 的紀錄＝照稿上原本的 re',
      T0.opts.length===2&&Tn.opts.length===3&&Tn.opts[2].t===o3.t&&J(Tn.opts[2].lines)===J([full,o3.re[z+'2']])&&full==='第二部。'&&B.every((o,k)=>J(o.lines)===J([want[k],o3.re[z+'2']]))&&new Set(want).size===3&&want.every(t=>typeof t==='string'&&t.indexOf('第二部。')===0&&t.length>4)
      &&/起雞皮疙瘩/.test(src[0].t)&&/翻報紙的聲音/.test(src[1].t)&&/蠻悶的/.test(src[2].t)&&/起雞皮疙瘩/.test(want[0])&&/翻報紙的聲音/.test(want[1])&&/很悶/.test(want[2])&&J(o3.reBy)===J(film('m3007b').talk.opts[2].reBy),J([T0.opts.map(o=>o.t),Tn.opts[2],B]));
    { const G8=fresh('2030-07-10',19); H.FRIEND(z); G8.flags.MOVIE_SEEN={[z]:{m2511b:10}}; G8.flags.MOVIE_TALK={[z]:{m2511b:1}}; WANT=[o3.t]; await MOVIES.after(GM,{place:'xs_nanyang',film:'m3007b',who:z,id:'ivr'},{name:'芷若',charId:z}); WANT=[];
      check('8. 實際演：選第三個＝她說「第二部。第一部你只記得翻報紙的聲音。」「這部呢？」',idx(want[1])>=0&&idx(o3.re[z+'2'])===idx(want[1])+1&&idx(full)<0,J(H.said.map(x=>x.t))); }
    const s='heroine_05', R=film('m2801a').talk.opts[0].re; fresh('2028-01-10',19); H.FAMILIAR(s); const A=MOVIES.talkFor(H.G,s,'m2801a').opts[0].lines; H.date(s); const C=MOVIES.talkFor(H.G,s,'m2801a').opts[0].lines;
    check('8. 學姊《m2801a》第二句：照稿；交往中換成「今年跟我看。不要去擠。」',J(A)===J([R.heroine_05,R.heroine_052])&&J(C)===J([R.heroine_05,'今年跟我看。不要去擠。']),J([A,C]));
    const an='heroine_01', R2=film('m2811b').talk.opts[1].re; fresh('2028-11-10',19); H.FRIEND(an); const D1=MOVIES.talkFor(H.G,an,'m2811b').opts, d1=D1[1].lines, d0=D1[0].lines; H.date(an); const d2=MOVIES.talkFor(H.G,an,'m2811b').opts[1].lines;
    check('8. 以安《m2811b》第二個選項的第二句（heroine_012）只在交往中說；第一個選項的第二句照常',J(d1)===J([R2.heroine_01])&&J(d2)===J([R2.heroine_01,R2.heroine_012])&&d0.length===2,J([d0,d1,d2]));
    fresh('2028-09-10',19); H.FAMILIAR(an); const n2=MOVIES.talkFor(H.G,an,'m2809a').opts.length; H.FRIEND(an); const n3=MOVIES.talkFor(H.G,an,'m2809a').opts.length;
    check('8. 《m2809a》「認識妳的那一天」朋友以上才有（不然只有兩個選項）',n2===2&&n3===3,J([n2,n3])); });
  await sec(9,async()=>{ const G=fresh('2025-11-15',19.4), id='heroine_04'; H.FRIEND(id); const iv=await watch(id);
    check('9. 子晴 2025-11（第 1 場對不上＝一般句）：看到一半演《聖誕快遞》的那一幕（旁白）',iv.film==='m2511a'&&idx(film('m2511a').scene)>idx(dimOf('m2511a'))&&H.said[idx(film('m2511a').scene)].who===null,J(H.said.map(s=>s.t).slice(0,12)));
    const L=MOVIES.midLines(G,{place:'xs_nanyang',film:'m2707b',who:'heroine_05'},null), L2=MOVIES.midLines(G,{place:'xs_nanyang',film:'m2707b',who:'heroine_05'},{k:2,mid:['x']}), L3=MOVIES.midLines(G,{place:'xs_nanyang',film:'m2707b',who:'kexin'},{rot:0});
    check('9. 學姊《m2707b》（with.mid）取代那一幕；AA_708 第 N 場＝照 AA_708（null）；別人輪換那一則＝那一幕',J(L)===J(film('m2707b').with.heroine_05.lines)&&L2===null&&J(L3)===J([film('m2707b').scene]),J([L,L2,L3])); });

  await sec(10,async()=>{ const G=fresh('2025-10-18',19.4), id='heroine_01'; H.FRIEND(id); delete G.flags.MOVIE_SEEN; delete G.flags.MOVIE_TALK;
    const old=JSON.parse(JSON.stringify(G)); H.G=old; SOCIAL.bind(old); INV.rec(old); H.FRIEND(id); const iv=await watch(id);
    check('10. 舊存檔（沒有 MOVIE_SEEN）：照常演、聊、記看過；JSON 來回不壞',iv.state==='done'&&idx(film('m2509a').talk.q)>=0&&JSON.parse(JSON.stringify(old)).flags.MOVIE_SEEN[id].m2509a===old.day,J(old.flags.MOVIE_SEEN));
    const G2=fresh('2025-10-18',19.4); H.FRIEND(id); G2.flags.MOVIE_SEEN=[1,2]; G2.flags.MOVIE_TALK='x'; const iv2=await watch(id);
    check('10. 格式壞掉的 MOVIE_SEEN／MOVIE_TALK：重建、照常演',iv2.state==='done'&&MOVIES.seenWith(G2,id,'m2509a')&&G2.flags.MOVIE_TALK[id].m2509a!=null,J([G2.flags.MOVIE_SEEN,G2.flags.MOVIE_TALK])); });

  /* ===== AA 11-10 20:35 的裁定、BB 11-10 20:38 的檢查、AA_745 v2（pick、0 和負的 fx）===== */
  const seat=async(w,pid)=>{ H.said=[]; CH=[]; ADJ=[]; return MOVIES.onSeated(GM,{who:w,id:'s'+Math.random()},{name:w,charId:w},INV.place(pid)); };
  const aft=async(w,f)=>{ H.said=[]; CH=[]; ADJ=[]; return MOVIES.after(GM,{place:'xs_nanyang',film:f,who:w,id:'a'+f+w},{name:w,charId:w}); };
  const noEmpty=()=>H.said.every(x=>typeof x.t==='string'&&x.t.trim()&&x.t!=='undefined'&&x.t!=='null')&&CH.every(c=>c.length>0&&c.every(t=>typeof t==='string'&&t.trim()));

  await sec(11,async()=>{ const yt='heroine_03', kx='kexin', zq='heroine_04', sis='heroine_05';
    let G=fresh('2026-05-10',19); H.FRIEND(yt); await aft(yt,'m2605b'); const Wy=film('m2605b').with[yt]; G.day+=20;
    const y0=await seat(yt,'noodle'), y1=await seat(yt,'teahouse'), saidY=H.said.map(x=>x.t), y2=await seat(yt,'teahouse');
    check('11. 語彤《m2605b》：下一次在一盞茶屋見面才說（別的地方不說、留著）、只說一次；YT_ASKED_SU_WALL 看完那天記',!!INV.place('teahouse')&&y0===false&&y1===true&&y2===false&&J(saidY)===J(Wy.lines)&&G.flags.YT_ASKED_SU_WALL!=null,J({y0,y1,y2,saidY}));
    G=fresh('2025-05-20',19); G.stage='econ'; H.FRIEND(kx); await aft(kx,'m2505b'); const Wk=film('m2505b').with[kx]; const setK=G.flags.KX_SAW_LAST_QUESTION; G.day=H.D('2025-07-10');
    const k1=await seat(kx,'noodle'), saidK=H.said.map(x=>x.t);
    G=fresh('2025-05-20',19); G.stage='econ'; H.FRIEND(kx); await aft(kx,'m2505b'); G.day=H.D('2025-07-11'); const k2=await seat(kx,'noodle'), left=(G.flags.MOVIE_LATER||[]).length;
    check('11. 可昕《m2505b》：考試（2025-07-11）以前的下一次見面說稿上那幾句；7/11 起不說、也不留著',setK!=null&&k1===true&&J(saidK)===J(Wk.lines)&&k2===false&&left===0,J({k1,k2,left,saidK}));
    const Wz=film('m2805b').with[zq], oz=film('m2805b').talk.opts.find(o=>o.set==='ZQ_LEVEL8');
    G=fresh('2028-05-20',19); H.FRIEND(zq); WANT=[film('m2805b').talk.opts.find(o=>!o.set).t]; await aft(zq,'m2805b'); const noF=(G.flags.MOVIE_LATER||[]).length;
    G=fresh('2028-05-20',19); H.FRIEND(zq); WANT=[oz.t]; await aft(zq,'m2805b'); const qz=(G.flags.MOVIE_LATER||[]).length, fz=G.flags.ZQ_LEVEL8; WANT=[Wz.choice[1].t];
    G.day=H.D('2028-06-20'); const z0=await seat(zq,'noodle'), keepz=(G.flags.MOVIE_LATER||[]).length; G.day=H.D('2028-07-05'); G.flags.MOVIE_LOVE={}; G.flags.FX_CAP={}; const z1=await seat(zq,'cafe'), saidZ=H.said.map(x=>x.t), negZ=ADJ.some(([w,d])=>w===zq&&d.npcRom===-1); WANT=[];
    check('11. 子晴《m2805b》（第二版：後續改當面）：選了記 ZQ_LEVEL8 的那個選項才有；她畢業以前（6 月）見面不說、留著；2028-07 起的下一次見面說、兩個選項（第二個＝她的戀愛 -1）',noF===0&&qz===1&&fz!=null&&z0===false&&keepz===1&&z1===true&&J(saidZ.slice(0,3))===J(Wz.lines)&&saidZ.includes(Wz.choice[1].say[0])&&negZ,J({noF,qz,z0,keepz,z1,saidZ,ADJ}));
    const Ws=film('m2901b').with[sis]; G=fresh('2029-01-20',19); H.FAMILIAR(sis); await aft(sis,'m2901b'); const lo=(G.flags.MOVIE_LATER||[]).length;
    G=fresh('2029-01-20',19); H.FRIEND(sis); await aft(sis,'m2901b'); G.day+=3; G.flags.MOVIE_LOVE={}; G.flags.FX_CAP={}; WANT=[Ws.choice[0].t]; const s1=await seat(sis,'noodle'), saidS=H.said.map(x=>x.t); WANT=[];
    check('11. 學姊《m2901b》（第二版：改當面）：朋友以上才有；下一次見面說、選第一個＝SIS_HEHUAN、她的戀愛 +2',lo===0&&s1===true&&J(saidS.slice(0,3))===J(Ws.lines)&&G.flags.SIS_HEHUAN!=null&&ADJ.some(([w,d])=>w===sis&&d.npcRom===2),J({lo,s1,saidS,ADJ})); });

  await sec(12,async()=>{ const z='heroine_02', W=film('m2703b').with[z], tag='mv745_m2703b_'+z, dep=H.D('2027-09-02');
    let G=fresh('2027-03-20',19); H.FRIEND(z); G.contacts={[z]:1}; await aft(z,'m2703b'); const q0=(PHONE.rec(G).q||[]).find(x=>x.tag===tag);
    G=fresh('2027-03-20',19); H.FRIEND(z); G.contacts={[z]:1}; G.flags.ZR_FOUR_WORDS=G.day; await aft(z,'m2703b'); const q=(PHONE.rec(G).q||[]).find(x=>x.tag===tag);
    check('12. 芷若《m2703b》（第二版）：要 ZR_FOUR_WORDS；出發那天（2027-09-02）她傳稿上那兩則（照片＋一句）；匯入工具沒有另外改句（override 空的）',
      !q0&&!!q&&q.day===dep&&J(q.items.map(i=>i.text))===J(W.lines)&&/^📷/.test(W.lines[0])&&q.items.every(i=>i.from===z)&&Object.keys(PL().override||{}).length===0&&!(G.flags.MOVIE_LATER_DUE),J({q0,q}));
    const run=async k=>{ const G=fresh('2027-03-20',19); H.FRIEND(z); G.contacts={[z]:1}; G.flags.ZR_FOUR_WORDS=G.day; await aft(z,'m2703b'); G.flags.MOVIE_LOVE={}; G.flags.FX_CAP={}; G.day=dep; G.hour=11.2; ADJ=[]; PHONE.tick(G); const m=(G.msgs||[]).find(x=>x.tag===tag&&x.ask); const a=m?PHONE.answer(G,m.ask.id,k):null;
      return {m:!!m,opts:m?m.ask.opts.map(o=>o.t):null,a:!!a,love:ADJ.filter(([w,d])=>w===z&&d.npcRom!=null).map(([,d])=>d.npcRom),re:(G.msgs||[]).filter(x=>x.from===z).map(x=>x.text).slice(-W.choice[k].say.length)}; };
    const r0=await run(0), r1=await run(1);
    check('12. 兩個回覆照稿、她照稿回；第一個 fx love 3＝一次看電影最多 +2（加 2）、第二個 +1',J(r0.opts)===J(W.choice.map(c=>c.t))&&r0.a&&J(r0.love)==='[2]'&&J(r0.re)===J(W.choice[0].say)&&r1.a&&J(r1.love)==='['+Math.min(2,W.choice[1].fx.love)+']'&&J(r1.re)===J(W.choice[1].say)&&W.choice[0].fx.love===3,J([r0,r1])); });

  await sec(13,async()=>{ const id='heroine_01', f='m2509a', T=film(f).talk, W=film(f).with[id];
    /* 順序：同一天同一部同一個人固定；不同天／不同人會變；三個都在 */
    const ord=(day,ff,w)=>MOVIES.shuffle([0,1,2],MOVIES.seedOf(day,ff,w)).join(''); const seen=new Set(); for(let d=1;d<=60;d++) seen.add(ord(d,f,id));
    let first=0, N=0; for(const ff of Object.keys(PL().films)) for(let d=100;d<110;d++){ N++; if(ord(d,ff,id)[0]==='0') first++; }
    check('13. talk 的三個選項順序：同一天同一部同一個人每次一樣（讀檔重來不變）；換一天會變（六種都出現過）；原本第一個排在第一個的比例大約三分之一',ord(5,f,id)===ord(5,f,id)&&seen.size===6&&first/N>0.2&&first/N<0.47,J({n:seen.size,p:first/N}));
    const G=fresh('2025-10-18',19.4); H.FRIEND(id); WANT=[T.opts[1].t]; await aft(id,f); const shown=CH.find(c=>same(c,T.opts.map(o=>o.t)));
    check('13. 畫面上的順序照洗過的；選了哪一個照稿上的編號記（MOVIE_TALK＝1）、她回的是那個選項的 re、效果是那個選項的 fx',J(shown)===J(MOVIES.shuffle(T.opts.map(o=>o.t),MOVIES.seedOf(G.day,f,id)))&&G.flags.MOVIE_TALK[id][f]===1&&(!T.opts[1].re||!T.opts[1].re[id]||idx(T.opts[1].re[id])>=0),J({shown,talk:G.flags.MOVIE_TALK}));
    /* 上限：一次看電影（talk＋with 的選項）她的戀愛最多 +2；扣的不限 */
    const F=PL().films, keep=JSON.stringify(F[f]); try{
      F[f].talk.opts[0].fx={[id]:{love:2,fr:1}}; F[f].with={[id]:{kind:'after',lines:['（假）多一段。'],choice:[{t:'（假）加三',say:['（假）好。'],fx:{love:3,fr:1}},{t:'（假）扣二',say:['（假）喔。'],fx:{love:-2}}]}};
      let G=fresh('2025-10-18',19.4); H.FRIEND(id); SOCIAL.adjust(id,{npcRom:20}); const r0=SOCIAL.rel(id).npcRom; ADJ=[]; WANT=[F[f].talk.opts[0].t,'（假）加三']; await aft(id,f); const up=SOCIAL.rel(id).npcRom-r0, fr=ADJ.filter(([w,d])=>w===id&&d.fam===1).length;
      check('13. 上限：talk +2、with 的選項再 +3＝這一次看電影她的戀愛一共只加 2；友情（fr）不受影響、照加兩次；記在 FX_CAP（movie:<片>，不清掉）',up===2&&fr===2&&MOVIES.loveGot(G,id,f)===2&&G.flags.FX_CAP[id]['movie:'+f].n===2&&G.flags.FX_CAP[id]['movie:'+f].k===1&&!G.flags.MOVIE_LOVE,J({up,fr,ml:G.flags.FX_CAP,ADJ}));
      G=fresh('2025-10-18',19.4); H.FRIEND(id); SOCIAL.adjust(id,{npcRom:20}); const r1=SOCIAL.rel(id).npcRom; WANT=[F[f].talk.opts[0].t,'（假）扣二']; await aft(id,f);
      check('13. 扣的不限、也不補回額度：+2 再 -2＝0',SOCIAL.rel(id).npcRom-r1===0&&MOVIES.loveGot(G,id,f)===2,J([SOCIAL.rel(id).npcRom-r1,G.flags.FX_CAP]));
      const old=fresh('2025-10-18',19.4); H.FRIEND(id); old.flags.MOVIE_LOVE='x'; old.flags.FX_CAP='y'; WANT=[F[f].talk.opts[0].t,'（假）加三']; await aft(id,f);
      check('13. 舊存檔（沒有、或壞掉的 MOVIE_LOVE／FX_CAP）：重建、照常',JSON.parse(J(old)).flags.FX_CAP[id]['movie:'+f].n===2,J(old.flags.FX_CAP));
      /* 舊存檔：這部片在 MOVIE_LOVE 已經記了 +1（改用共用上限以前）＝只剩 +1；已經記了 +2＝之後傳訊息的選項不再加；三十天後也還在（keep） */
      const o1=fresh('2025-10-18',19.4); H.FRIEND(id); SOCIAL.adjust(id,{npcRom:20}); o1.flags.MOVIE_LOVE={[id]:{[f]:1}}; const q0=SOCIAL.rel(id).npcRom; const dA=MOVIES.fxFilm(o1,id,f,{love:2}); o1.day+=30; SOCIAL.applyFx(o1,id,{love:1},{cap:'phone:'+o1.day}); const dB=MOVIES.fxFilm(o1,id,f,{love:2,fr:1});
      check('13. 舊存檔 MOVIE_LOVE 記的 +1 照算（只再 +1）；三十天後同一部片還是滿的（不清掉）、別的鍵照常',J(dA)===J({npcRom:1})&&J(dB)===J({fam:1,trust:1,comf:1})&&SOCIAL.rel(id).npcRom-q0===2&&o1.flags.FX_CAP[id]['movie:'+f].n===2&&o1.flags.MOVIE_LOVE[id][f]===1,J({dA,dB,cap:o1.flags.FX_CAP}));
    } finally { F[f]=JSON.parse(keep); WANT=[]; }
    let over=[]; for(const fid in PL().films){ const ff=PL().films[fid]; for(const w in (ff.with||{})){ const mt=Math.max(0,...ff.talk.opts.map(o=>((o.fx||{})[w]||{}).love|0)), mw=Math.max(0,...((ff.with[w].choice||[]).map(c=>(c.fx||{}).love|0))); if(mt+mw>2) over.push(fid+':'+w+'='+(mt+mw)); } }
    console.log('INFO 13. 稿上 talk＋with 最多可以超過 +2 的片×人（都被上限壓到 2）：'+over.length+' 組 '+over.join('、')); });

  await sec(14,async()=>{ const bad=[]; let n=0;
    const one=async(w,f,date)=>{ for(let k=0;k<3;k++){ const G=fresh(date,19); if(/kexin/.test(w)&&date<'2025-09') G.stage='econ'; H.FRIEND(w); const T=film(f).talk; WANT=[T.opts[k].t]; let r,e=null; try{ r=await aft(w,f); }catch(x){ e=String(x); }
        const want=[''].map(sfx=>T.opts[k].re&&T.opts[k].re[w+sfx]).filter(t=>typeof t==='string'), got=want.every(t=>idx(t)>=0); n++;   /* 第二、三句有的要條件（交往中…）：這裡只看第一句 */
        if(e||r!==true||!noEmpty()||!CH.some(c=>same(c,T.opts.map(o=>o.t)))||(G.flags.MOVIE_TALK||{})[w][f]!==k||!MOVIES.seenWith(G,w,f)||!got||E.player.busy) bad.push([w,f,k,e,H.said.map(x=>x.t)]); } WANT=[]; };
    await one('kexin','m2411b','2024-11-10'); await one('kexin','m2503b','2025-03-10'); await one('kexin','m2505a','2025-05-10'); await one('kexin','m2507b','2025-07-20');
    await one('heroine_03','m2807b','2028-07-10'); await one('heroine_04','m2807b','2028-07-10'); await one('heroine_01','m2811b','2028-11-10'); await one('kexin','m2803b','2028-03-10');
    check('14. 稿上沒寫到她（沒有 re）、沒有 fx、re 有第二句（heroine_012）：每個選項都演得完——沒有空的框、沒有例外、選項照出、記選了哪個、記看過（'+n+' 次）',n===24&&!bad.length,J(bad.slice(0,3)));
    fresh('2028-07-10',19); H.FRIEND('heroine_03'); await aft('heroine_03','m2807b');
    check('14. NOQ（q 是給程式的說明）第二版沒有了：《m2807b》的 q 照稿說',Array.isArray(PL().noQ)&&PL().noQ.length===0&&idx(film('m2807b').talk.q)>=0,J(H.said.map(x=>x.t)));
    { const keepQ=PL().noQ; PL().noQ=['m2807b']; try{ fresh('2028-07-10',19); H.FRIEND('heroine_03'); await aft('heroine_03','m2807b'); check('14. NOQ 表上的片：q 不說、選項照出',idx(film('m2807b').talk.q)<0&&CH.length===1&&noEmpty(),J(H.said.map(x=>x.t))); } finally { PL().noQ=keepQ; } }
    fresh('2028-11-10',19); H.FRIEND('heroine_01'); const o2=film('m2811b').talk.opts[0]; WANT=[o2.t]; await aft('heroine_01','m2811b'); WANT=[];
    check('14. 第二句的 key（heroine_012）：《m2811b》第一個選項以安說兩句',idx(o2.re.heroine_01)>=0&&idx(o2.re.heroine_012)===idx(o2.re.heroine_01)+1,J(H.said.map(x=>x.t)));
    { let n2=0, bad2=[]; for(const fid in PL().films) for(const o of PL().films[fid].talk.opts) for(const k in (o.re||{})){ const PP=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'], m=PP.includes(k)?null:/^(.+?)([23])$/.exec(k); if(m&&PP.includes(m[1])){ n2++; if(typeof (o.re||{})[m[1]]!=='string') bad2.push(fid+'.'+k); } }
      check('14. 稿上的第二、三句 key（'+n2+' 個）都留在資料裡、都有對應的第一句',n2>=40&&!bad2.length,J(bad2.slice(0,5))); }
    const G=fresh('2028-01-10',19), zq='heroine_04'; H.FRIEND(zq); const P=MOVIES.periodOf('m2801b'), other=P.bill.find(b=>b.id!=='m2801b'), a=MOVIES.pickAdj(P.bill,zq,other,null), r=await aft(zq,'m2801b');
    check('14. 《m2801b》（第二版 kind pick）：約子晴＝這部、她說那兩句；看完不演 with、不卡',film('m2801b').with[zq].kind==='pick'&&a.film.id==='m2801b'&&a.forced===true&&J(a.say)===J(film('m2801b').with[zq].lines)&&r===true&&noEmpty()&&!film('m2801b').with[zq].lines.some(t=>idx(t)>=0),J([a,H.said.map(x=>x.t)]));
    /* 壞資料（假的）：不認得的人、不認得的 kind、lines 不是陣列、空的 re、沒有字的選項、沒有 opts */
    const F=PL().films, keep=JSON.stringify(F.m2509a), id='heroine_01'; try{
      F.m2509a.with={heroine_099:{kind:'after',lines:['x']},[id]:{kind:'zzz',lines:['不該出現']}}; F.m2509a.talk.opts[0].re={[id]:'',heroine_099:'y'}; delete F.m2509a.talk.opts[0].fx; F.m2509a.talk.opts[1].t='';
      fresh('2025-10-18',19); H.FRIEND(id); WANT=[F.m2509a.talk.opts[0].t]; const r1=await aft(id,'m2509a'); const c1=CH.slice(), s1=H.said.map(x=>x.t), e1=noEmpty();
      F.m2509a.with={[id]:{kind:'after'}}; F.m2509a.talk.opts=[]; fresh('2025-10-18',19); H.FRIEND(id); const r2=await aft(id,'m2509a'), s2=H.said.length, c2=CH.length;
      delete F.m2509a.talk; fresh('2025-10-18',19); H.FRIEND(id); const r3=await aft(id,'m2509a');
      check('14. 壞資料：不認得的人和 kind 不演、空的 re 不說、沒有字的選項不出（剩兩個）、沒有選項＝不問；都不丟例外、不出空的框',r1===true&&e1&&c1.length===1&&c1[0].length===2&&!s1.includes('不該出現')&&!s1.includes('y')&&r2===true&&s2===0&&c2===0&&r3===true,J({r1,c1,s1,r2,s2,c2,r3}));
    } finally { F.m2509a=JSON.parse(keep); WANT=[]; } });

  await sec(15,async()=>{ const P0=PL(), F=P0.films, id='heroine_01', keepF=JSON.stringify(F.m2509a), keepP=JSON.stringify(P0.pick); try{
      /* AA_745 v2 的 pick（假的）：以安一定挑 m2509b */
      F.m2509b.with=Object.assign({},F.m2509b.with,{[id]:{kind:'pick',lines:['（假的）這部。','我想看這部。']}}); P0.pick.m2509b=Object.assign({},P0.pick.m2509b,{[id]:{mode:'force'}});
      const G=fresh('2025-10-18',19.4); H.FRIEND(id); const P=MOVIES.periodOf('m2509a'), a=MOVIES.pickAdj(P.bill,id,MOVIES.film('m2509a'),null), b=MOVIES.pickAdj(P.bill,id,MOVIES.film('m2509b'),null);
      const iv=INV.accept(G,id,'xs_nanyang',G.day,19.5,{by:'player'}); const r=await aft(id,'m2509b');
      check('15. with.kind pick（假資料）：選到另一部＝換成她挑的、她說 lines；本來就是這部＝也說；約好的那一筆存她挑的；看完不把 pick 的 lines 當 with 演',a.film.id==='m2509b'&&a.forced&&J(a.say)===J(F.m2509b.with[id].lines)&&b.film.id==='m2509b'&&J(b.say)===J(F.m2509b.with[id].lines)&&iv.film==='m2509b'&&J(iv.filmSay)===J(F.m2509b.with[id].lines)&&r===true&&idx('（假的）這部。')<0&&noEmpty(),J([a,b,iv.film,iv.filmSay,H.said.map(x=>x.t)]));
    } finally { const b=JSON.parse(keepF); delete F.m2509b.with; P0.pick=JSON.parse(keepP); }
    /* 0 和負的 fx */
    const G=fresh('2025-10-18',19); H.FRIEND(id); H.FRIEND('classmate_bohan'); SOCIAL.adjust(id,{npcRom:10}); const r0=Object.assign({},SOCIAL.rel(id));
    const z=SOCIAL.applyFx(G,id,{fr:0,love:0}), ng=SOCIAL.applyFx(G,id,{fr:-2,love:-3}), r1=Object.assign({},SOCIAL.rel(id)), bh=SOCIAL.applyFx(G,'classmate_bohan',{love:-2}), junk=[SOCIAL.applyFx(G,id,null),SOCIAL.applyFx(G,id,{fr:'x'}),SOCIAL.applyFx(G,null,{fr:1}),SOCIAL.applyFx(G,id,{})];
    SOCIAL.adjust(id,{fam:-100}); SOCIAL.applyFx(G,id,{fr:-5}); const fl=SOCIAL.rel(id).fam;
    check('15. SOCIAL.applyFx：0＝不動（null）；負的照扣（fr -2＝三項各 -2、love -3）；男生朋友 love 不算；壞的 fx＝null；不會扣到 0 以下',z===null&&J(ng)===J({fam:-2,trust:-2,comf:-2,npcRom:-3})&&r1.fam===r0.fam-2&&r1.trust===r0.trust-2&&r1.npcRom===r0.npcRom-3&&bh===null&&junk.every(x=>x===null)&&fl===0,J({z,ng,r0,r1,bh,junk,fl}));
    const keep=JSON.stringify(F.m2509a); try{ F.m2509a.talk.opts[0].fx={[id]:{love:-2,fr:-1}}; delete F.m2509a.with; fresh('2025-10-18',19); H.FRIEND(id); SOCIAL.adjust(id,{npcRom:10}); WANT=[F.m2509a.talk.opts[0].t]; await aft(id,'m2509a');
      check('15. talk 選項的 fx 是負的（假資料）：照扣',ADJ.some(([w,d])=>w===id&&d.npcRom===-2&&d.fam===-1&&d.trust===-1&&d.comf===-1),J(ADJ)); } finally { F.m2509a=JSON.parse(keep); WANT=[]; }
    /* 匯入工具：pick、0／負的 fx、不認得的人（列警告、不停）——拿第 1 批的稿改幾格、直接叫 build() */
    const py=`
import sys, json
sys.path.insert(0, 'tools/movie')
import import_movie_plots as M
allow = M.IG.load(M.ROOT)
B = M.load_batches(allow)
p, sha, d = B[0]
fid = sorted(d['films'])[0]
f = d['films'][fid]
f['talk']['opts'][0]['re'] = dict(f['talk']['opts'][0].get('re') or {}, heroine_099='x')
f['talk']['opts'][0]['fx'] = {'heroine_01': {'love': -2, 'fr': 0}, 'heroine_099': {'fr': 1}}
f['with'] = dict(f.get('with') or {}, heroine_04={'kind': 'pick', 'lines': ['x']}, nobody={'kind': 'after', 'lines': ['x']})
out = M.build(B)
print(json.dumps({'fid': fid, 'pick': out['pick'].get(fid), 'fx': out['films'][fid]['talk']['opts'][0]['fx'], 'warn': M.WARN, 'm2801b': out['pick'].get('m2801b')}, ensure_ascii=False))
`;
    let o=null, err=''; try{ o=JSON.parse(cp.execFileSync('python3',['-c',py],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']})); }catch(e){ err=String(e.stderr||e.message).slice(0,400); }
    check('15. 匯入工具：kind pick＝一定挑（force）、舊的 m2801b 照舊 force；fx 0 和負的收；不認得的人列進警告（3 項）、不停',!!o&&o.pick&&o.pick.heroine_04&&o.pick.heroine_04.mode==='force'&&o.m2801b.heroine_04.mode==='force'&&o.fx.heroine_01.love===-2&&o.warn.length===3&&o.warn.every(w=>/不認得的人/.test(w)),err||J(o)); });

  await sec(16,async()=>{ const zq='heroine_04', W=film('m2801b').with[zq];
    /* (1) 她指定的片、約的時候本來就選到這一部：她那兩句照說，一般的答應句不說 */
    const flow=async()=>{ const G=fresh('2028-01-10',15,'campus'); H.FRIEND(zq); G.contacts={[zq]:1}; const n=npc(zq); H.said=[]; CH=[]; WANT=['看電影、逛書店','南洋戲院','去南洋戲院看電影','今天','現在']; let e=null; try{ await INV.flow(GM,zq,n,false,{place:'xs_nanyang'}); }catch(x){ e=String(x&&x.stack||x).slice(0,300); } WANT=[]; return {e,L:H.said.map(x=>x.t),iv:(G.invites||[]).find(v=>v.who===zq&&v.place==='xs_nanyang')}; };
    const P=MOVIES.periodOf('m2801b'), a=MOVIES.pickAdj(P.bill,zq,MOVIES.film('m2801b'),null), c=(()=>{ fresh('2028-01-10',15); H.FRIEND(zq); return MOVIES.choose(H.G,zq); })();
    check('16. 子晴 2028-01：預設就選到《m2801b》（她指定的）＝pickAdj、choose 都帶她那兩句（forced）',a.forced===true&&J(a.say)===J(W.lines)&&c.id==='m2801b'&&c.forced===true&&J(c.say)===J(W.lines),J([a,c]));
    const pa=MOVIES.pickAdj; let gen; MOVIES.pickAdj=(bill,who,f)=>({film:f}); try{ gen=await flow(); } finally { MOVIES.pickAdj=pa; }
    const r=await flow(); const genOnly=gen.L.filter(t=>!r.L.includes(t));
    check('16. 當面約她看電影（INV.flow）：她說稿上那兩句、接在選完時間以後；一般的答應句（沒有指定片的時候會說的那一句）不說；約好的是這部、說過就不再存',!r.e&&!gen.e&&!!r.iv&&r.iv.film==='m2801b'&&W.lines.every(t=>r.L.includes(t))&&!r.iv.filmSay&&!r.iv.filmForced&&genOnly.length>=1&&!W.lines.some(t=>gen.L.includes(t)),J({r:r.L,gen:gen.L,genOnly,e:r.e||gen.e}));
    { const G=fresh('2028-01-10',15); H.FRIEND(zq); const iv=INV.accept(G,zq,'xs_nanyang',G.day,19.5,{by:'player'}); const sv=JSON.parse(J(iv));
      check('16. 電話／別的路徑約的：那兩句先存在約好的那一筆（filmSay、filmForced，存檔 JSON 沒問題），見面時說一次',J(sv.filmSay)===J(W.lines)&&sv.filmForced===true,J(sv));
      H.said=[]; await MOVIES.sayPick(GM,iv,{name:'子晴',charId:zq}); check('16. 說完就拿掉',J(H.said.map(x=>x.t))===J(W.lines)&&!iv.filmSay&&!iv.filmForced,J(iv)); }
    /* (2) 稿上完全沒寫到她的片：不出三個選項 */
    const none=MOVIES.noTalkPairs(), all=7*72;
    const pick=none.find(k=>!PL().films[k.split(':')[0]].with||!PL().films[k.split(':')[0]].with[k.split(':')[1]]), [nf,nw]=pick.split(':');
    const G=fresh('2026-03-10',19); H.FRIEND(nw); const tf=MOVIES.talkFor(G,nw,nf); const r2=await aft(nw,nf);
    check('16. 稿上沒寫到她的片（例 '+pick+'：三個選項都沒有她的 re、fx）：不問、不出選項、不卡，照記看過',tf===null&&r2===true&&CH.length===0&&idx(film(nf).talk.q)<0&&MOVIES.seenWith(G,nw,nf)&&noEmpty(),J({tf,CH,L:H.said.map(x=>x.t)}));
    const F=PL().films, keep=JSON.stringify(F[nf]); try{ F[nf].talk.opts[1].fx={[nw]:{fr:1}}; fresh('2026-03-10',19); H.FRIEND(nw); await aft(nw,nf); const c1=CH.length;
      F[nf]=JSON.parse(keep); F[nf].talk.opts[2].re=Object.assign({},F[nf].talk.opts[2].re,{[nw+'2']:'（假）第二句。'}); fresh('2026-03-10',19); H.FRIEND(nw); await aft(nw,nf); const c2=CH.length;
      F[nf]=JSON.parse(keep); F[nf].talk.opts[0].fx={[nw]:{fr:0,love:0}}; fresh('2026-03-10',19); H.FRIEND(nw); await aft(nw,nf); const c3=CH.length;
      check('16. 只要有一個選項有她的 fx 或 re（第二、三句也算）＝照常問三個選項；fx 是 0 不算',c1===1&&c2===1&&c3===0,J([c1,c2,c3])); } finally { F[nf]=JSON.parse(keep); }
    const by={}; for(const k of none){ const w=k.split(':')[1]; by[w]=(by[w]|0)+1; }
    console.log('INFO 16. 沒有 talk 的片×人（七位×72 部＝'+all+'）：'+none.length+' 組（有 talk '+(all-none.length)+' 組）；各人：'+J(by)); });

  /* 17. 沒有專屬回答時她怎麼回（AA_745_fallback；MOVIE-FALLBACK-1110）。現在關著（LAWWW 11-10：BB_311 審稿中）——機制用假的句子測，AA 的稿不匯 */
  await sec(17,async()=>{ const P=PL(), W=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'], KD=['feel','detail','self','joke','meh','ask'];
    const allow=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.some(e=>/AA_745_fallback\.json$/.test(e.path));
    const kinds=Object.values(P.films).every(f=>f.talk.opts.every(o=>KD.includes(o.kind)));
    check('17. 現在關著：MOVIES.CFG.fallback＝false、fallback 的稿不在白名單、movie_plots.js 沒有 fallback；每個選項的 kind 已經帶進來（關著的時候不讀）',MOVIES.CFG.fallback===false&&!allow&&P.fallback===undefined&&kinds,J({cfg:MOVIES.CFG,allow,fb:P.fallback!==undefined,kinds}));
    const none0=MOVIES.noTalkPairs(), pick=none0.find(k=>{ const [f,w]=k.split(':'); const F=P.films[f]; return (!F.with||!F.with[w])&&F.talk.opts.filter(o=>o.kind!=='ask').length>=2&&!(P.cond[f]||{}).opt; }), [nf,nw]=pick.split(':'), TK=film(nf).talk;
    const mk=tag=>{ const o={}; for(const k of ['feel','detail','self','joke','meh']) o[k]=[{re:'（假）'+tag+k+'一。',fx:{love:2}},{re:['（假）'+tag+k+'二。','（她笑了一下。）'],fx:{fr:1}},{re:'（假）'+tag+k+'三。'}]; return o; };
    const view=async(day)=>{ const G=H.G; G.day=day; CH=[]; H.said=[]; ADJ=[]; G.flags.MOVIE_SEEN={}; (G.daily||(G.daily={}))['mvTalk_'+nw]=null; return MOVIES.after(GM,{place:'xs_nanyang',film:nf,who:nw,id:'ivf'+day},{name:'她',charId:nw}); };
    try{
      /* 關著：有資料也不用（開關） */
      P.fallback={}; for(const w of W) P.fallback[w]=mk(w+'／');
      let G=fresh('2026-03-10',19); H.FRIEND(nw); const off=MOVIES.talkFor(G,nw,nf);
      check('17. 開關關著：就算有 fallback 的資料也不用——稿上沒寫到她＝不問（和原本一樣）',off===null&&MOVIES.noTalkPairs().length===none0.length,J(off));
      MOVIES.CFG.fallback=true;
      const o0=TK.opts.find(o=>o.kind!=='ask'), kd=o0.kind, T=MOVIES.talkFor(G,nw,nf), shown=T&&T.opts.map(o=>o.t), wantShown=TK.opts.filter(o=>o.kind!=='ask').map(o=>o.t);
      check('17. 開了：原本沒有 talk 的片×人（例 '+pick+'）有選項——ask 的不出、其他的都出；每個選項都有她的回答',!!T&&J(shown)===J(wantShown)&&T.opts.every(o=>o.lines.length>=1&&o.fb),J(T));
      const d0=G.day; SOCIAL.adjust(nw,{npcRom:20}); WANT=[o0.t];
      await view(d0); const s1=H.said.map(x=>x.t), a1=ADJ.slice(), n1=G.flags.MOVIE_FB[nw][kd], q1=idx(TK.q)>=0||/^（/.test(TK.q);
      await view(d0+1); const s2=H.said.map(x=>({w:x.who,t:x.t})), a2=ADJ.slice();
      await view(d0+2); const s3=H.said.map(x=>x.t), a3=ADJ.slice();
      await view(d0+3); const s4=H.said.map(x=>x.t);
      const pre='（假）'+nw+'／'+kd;
      check('17. 選了：她說 fallback 的那一句、算那一句的 fx（love 2）；記選了第幾個、計數往後',CH.length>=0&&s1.includes(pre+'一。')&&a1.some(([w,d])=>w===nw&&d.npcRom===2)&&n1===1&&G.flags.MOVIE_TALK[nw][nf]===TK.opts.indexOf(o0),J({s1,a1,fb:G.flags.MOVIE_FB}));
      check('17. 輪流：下一次看電影同一種選項＝第二句（幾句的陣列照順序、括號＝旁白、fx fr 1），再下一次第三句（沒有 fx＝不加），第四次回到第一句——同一句不會連續兩次',
        s2.some(x=>x.t===pre+'二。'&&x.w!==null)&&s2.some(x=>x.t==='（她笑了一下。）'&&x.w===null)&&!s2.some(x=>x.t===pre+'一。')&&a2.some(([w,d])=>w===nw&&J(d)===J({fam:1,trust:1,comf:1}))&&s3.includes(pre+'三。')&&!a3.some(([w])=>w===nw)&&s4.includes(pre+'一。')&&G.flags.MOVIE_FB[nw][kd]===4,J({s2,a2,s3,a3,s4}));
      const other=TK.opts.find(o=>o.kind!=='ask'&&o.kind!==kd); if(other){ const e=MOVIES.fbPeek(G,nw,other.kind); check('17. 計數每個人、每個 kind 各一個：別的 kind 還在第一句；別人也是',J(e.re)===J('（假）'+nw+'／'+other.kind+'一。')&&MOVIES.fbN(G,W.find(w=>w!==nw),kd)===0,J(e)); }
      const old=fresh('2026-03-10',19); H.FRIEND(nw); old.flags.MOVIE_FB='x'; WANT=[o0.t]; await view(old.day); const o1=H.said.some(x=>x.t===pre+'一。'); old.flags.MOVIE_FB={[nw]:{[kd]:'q'}}; await view(old.day+1);
      check('17. 舊存檔（沒有、壞掉的 MOVIE_FB）：從第一句開始、照常；存檔 JSON 來回不壞',o1&&H.said.some(x=>x.t===pre+'一。')&&JSON.parse(J(old)).flags.MOVIE_FB[nw][kd]===1,J(old.flags.MOVIE_FB));
      /* 專屬的照專屬的；ask 沒有專屬＝不出、有專屬＝照出 */
      const dd=Object.keys(P.films).map(f=>[f,W.find(w=>P.films[f].talk.opts.some(o=>o.re&&typeof o.re[w]==='string')&&!(P.cond[f]||{}).opt)]).find(x=>x[1]), [df,dw]=dd, DT=film(df).talk, G2=fresh('2028-03-10',19); H.CLOSE(dw);
      const T2=MOVIES.talkFor(G2,dw,df), okDed=DT.opts.every((o,k)=>{ const x=T2.opts.find(q=>q.k===k), own=o.re&&typeof o.re[dw]==='string'; if(own) return !!x&&!x.fb&&x.lines[0]===o.re[dw]&&J(x.fx||null)===J((o.fx||{})[dw]||null); if(o.kind==='ask') return !x; return !!x&&x.fb===o.kind&&/^（假）/.test(x.lines[0]); });
      check('17. 專屬的 re 照專屬的（句子、fx 都照稿）；同一部片她沒有專屬回答的選項才用 fallback（例 '+df+':'+dw+'）',okDed&&T2.opts.some(o=>!o.fb),J(T2));
      const af=Object.keys(P.films).find(f=>P.films[f].talk.opts.some(o=>o.kind==='ask')&&!(P.cond[f]||{}).opt), ao=film(af).talk.opts.findIndex(o=>o.kind==='ask'), has=W.find(w=>MOVIES.hasRe(film(af).talk.opts[ao],w)), not=W.find(w=>!MOVIES.hasRe(film(af).talk.opts[ao],w));
      const G3=fresh('2028-03-10',19); for(const w of W) H.CLOSE(w); const TA=has?MOVIES.talkFor(G3,has,af):null, TN=not?MOVIES.talkFor(G3,not,af):null;
      check('17. ask 的選項（例 '+af+' 第 '+ao+' 個）：有專屬回答的人照出；沒有的人不出這個選項（別的選項照出）',(!has||TA.opts.some(o=>o.k===ao&&!o.fb))&&(!not||(!!TN&&!TN.opts.some(o=>o.k===ao)&&TN.opts.length>=2)),J({has,not,TA:TA&&TA.opts.map(o=>o.k),TN:TN&&TN.opts.map(o=>o.k)}));
      /* 一次看電影 love 合計 +2 照舊（fallback 的 fx 也走同一個上限）；選項自己有她的 fx＝照選項的 */
      const G4=fresh('2026-03-10',19); H.FRIEND(nw); SOCIAL.adjust(nw,{npcRom:20}); MOVIES.fxFilm(G4,nw,nf,{love:1}); WANT=[o0.t]; await view(G4.day);
      check('17. fallback 的 love 也算在這一次看電影的 +2 裡（已經 +1＝只再 +1）',ADJ.some(([w,d])=>w===nw&&d.npcRom===1)&&!ADJ.some(([w,d])=>w===nw&&d.npcRom===2)&&MOVIES.loveGot(G4,nw,nf)===2,J(ADJ));
      /* 全部 504 組 */
      const none1=MOVIES.noTalkPairs(), G0={flags:{},day:0,hour:0}; let noRe=0, n2=0; for(const f of Object.keys(P.films)) for(const w of W){ const t=MOVIES.talkFor(G0,w,f); if(!t) continue; if(t.opts.length===2) n2++; for(const o of t.opts) if(!o.lines.length) noRe++; }
      const twoAsk=k=>P.films[k.split(':')[0]].talk.opts.filter(o=>o.kind==='ask').length>=2;
      check('17. 開了以後 7×72＝504 組：每個選項都有她的回答；還是沒有 talk 的只剩「那部片有兩個 ask 的選項、她都沒有專屬回答＝剩一個選項」（保險：剩不到兩個＝不問；現在的稿＝m2805b 六個人，待 AA 改稿）',none1.length<=6&&none1.every(twoAsk)&&noRe===0,J({none:none1.slice(0,8),n:none1.length,noRe}));
      if(none1.length) console.log('INFO 17. 還是沒有 talk 的：'+none1.join('、'));
      console.log('INFO 17. fallback 開著（假句子）：沒有 talk 的片×人 '+none1.length+'／504；只剩兩個選項的 '+n2+' 組（ask 不出；空存檔算，m2809a、m3007b 有條件的選項不算在內）');
      delete P.fallback[nw].meh; const part=MOVIES.talkFor(G,nw,nf), mehO=TK.opts.findIndex(o=>o.kind==='meh');
      check('17. 那個 kind 沒有 fallback 的句子（壞資料）：那個選項照出、她不多說（不丟例外、不出空的框）',!!part&&(mehO<0||part.opts.some(o=>o.k===mehO&&!o.lines.length)),J(part));
      P.fallback[nw]='x'; const badT=MOVIES.talkFor(G,nw,nf); check('17. 她的 fallback 整組壞掉＝當作沒有（照原本的規則：不問）',badT===null,J(badT));
    } finally { MOVIES.CFG.fallback=false; delete P.fallback; WANT=[]; }
    /* 匯入工具：fallback 的稿在白名單上才匯；格式 */
    const py=`
import sys, json
sys.path.insert(0, 'tools/movie')
import import_movie_plots as M
out = {}
out['none'] = M.load_fallback({'files': []})
fb = {'_meta': {'x': 1}, 'heroine_01': {'feel': [{'re': 'a', 'fx': {'love': 1}}, {'re': ['b', '（c）']}], 'meh': [{'re': 'd', 'fx': {'fr': -1}}]}}
out['ok'] = M.build_fallback(fb)
bad = []
for d in ({'nobody': {'feel': [{'re': 'a'}]}}, {'heroine_01': {'ask': [{'re': 'a'}]}}, {'heroine_01': {'feel': []}}, {'heroine_01': {'feel': [{'re': ''}]}}, {'heroine_01': {'feel': [{'re': 'a', 'fx': {'luv': 1}}]}}, {'heroine_01': {'feel': [{'re': 'a', 'zz': 1}]}}, {'heroine_01': {'feel': [{'re': '「a」'}]}}):
    try:
        M.build_fallback(d); bad.append(False)
    except SystemExit:
        bad.append(True)
out['bad'] = bad
src = open(M.__file__, encoding='utf-8').read()
out['gate'] = "FB_SRC for e in allow.get('files', [])" in src and 'src_sha(allow, FB_SRC)' in src
print(json.dumps(out, ensure_ascii=False))
`;
    let o=null, err=''; try{ o=JSON.parse(cp.execFileSync('python3',['-c',py],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']})); }catch(e){ err=String(e.stderr||e.message).slice(-400); }
    check('17. 匯入工具：fallback 的稿不在白名單＝不匯（None）、在白名單要 approved（src_sha）；{人:{kind:[{re, fx?}]}} 照帶；不認得的人、ask、空的、fx 寫錯、多的欄位、整句加「」＝停下來',
      !!o&&o.none===null&&J(o.ok)===J({heroine_01:{feel:[{re:'a',fx:{love:1}},{re:['b','（c）']}],meh:[{re:'d',fx:{fr:-1}}]}})&&o.bad.every(x=>x)&&o.gate,err||J(o)); });
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
