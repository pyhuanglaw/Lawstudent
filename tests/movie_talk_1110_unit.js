// 南洋戲院每部片的情節、那一幕、散場聊什麼、和誰看多出來的（MOVIE-TALK-1110；使用者 X324，AA_745 三批）——不需要瀏覽器（D131）。
// 使用者 11-10 20:0x（對 AA）：「所有的電影……你要認真寫電影的情節，然後會影響劇情，跟誰看對誰有不同影響，但不要每個人都有，這樣會太像一個模板」
// 稿 AA_745_movie_plots_1～3.json（企劃線 d94b6ae6d、c7152c522、4de16b994）→ src/data/movie_plots.js（tools/movie/import_movie_plots.py）；播放 src/movies3d.js。檢查：
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
const watch=async(id,film,h)=>{ const G=H.G; const iv=INV.accept(G,id,'xs_nanyang',G.day,h||19.5,{by:'player'}); if(film) iv.film=film; H.said=[]; trace.length=0; CH=[]; ADJ=[]; await INV.startTogether(GM,iv,npc(id)); return iv; };
const idx=t=>H.said.findIndex(s=>s.t===t);
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
    const iv=await watch(id); const qi=idx(T.q), ri=idx(o.re[id]), dim=idx('（燈暗下來，《第十三號月台》開始了。）');
    const tk=CH.find(c=>J(c)===J(T.opts.map(x=>x.t)));
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
    check('3. 第二次和她看同一部：沒有 q、沒有那三個選項；一句「第二次看」旁白',iv.film==='m2509a'&&idx(T.q)<0&&!CH.some(c=>J(c)===J(T.opts.map(x=>x.t)))&&idx(PL().again.other)>=0&&H.said[idx(PL().again.other)].who===null,J({film:iv.film,L:H.said.map(s=>s.t).slice(-8)}));
    check('3. 喜劇片的第二次＝「她還是在同一個地方笑」（聖誕快遞是動畫愛情喜劇）；其他＝第二次看',MOVIES.againLine('m2511a')===PL().again.comedy&&MOVIES.againLine('m2509a')===PL().again.other&&/喜劇/.test(MOVIES.film('m2511a').genre));
    const G2=fresh('2025-10-18',19.4); H.FRIEND(id); G2.daily={['mvTalk_'+id]:G2.day}; await watch(id);
    check('3. 同一個人一天一次：今天已經聊過＝不出 talk',idx(T.q)<0,J(H.said.map(s=>s.t).slice(-5))); });

  await sec(4,async()=>{ const G=fresh('2025-10-18',15,'xs_nanyang_hall'); G.stage='law'; G.flags.NY_TICKET=G.day; H.said=[]; CH=[];
    const pre=MOVIES.infoLines(G);
    await STORY.onSeat(GM,{kind:'cinema',row:3}); const L=H.said.map(s=>s.t), SL=MOVIES.soloLines(G), a=film('m2509a'), b=film('m2509b');
    check('4. 一個人看：solo 第一句、第一部的那一幕、第二句、第二部的那一幕、第三句；沒有選項',J(L.slice(0,5))===J([SL[0],a.scene,SL[1],b.scene,SL[2]])&&CH.length===0,J(L.slice(0,6)));
    check('4. 兩部都記看過（me），沒有記成和誰看過',MOVIES.seenWith(G,'me','m2509a')&&MOVIES.seenWith(G,'me','m2509b')&&Object.keys(G.flags.MOVIE_SEEN).length===1,J(G.flags.MOVIE_SEEN));
    const post=MOVIES.infoLines(G);
    check('4. 海報牆：看過以前只有第一句、看過以後全部',pre[0]==='《第十三號月台》'+MOVIES.firstSentence(a.plot)&&pre[0]!=='《第十三號月台》'+a.plot&&post[0]==='《第十三號月台》'+a.plot&&post[1]==='《三份證詞》'+b.plot,J({pre,post}));
    fresh('2025-10-18',15); E.interactables=[]; NY3.lobby.build(E); const it=E.interactables.find(q=>q&&q.movieInfo); H.said=[]; const r=it?await STORY.interact(it,GM):false;
    check('4. 大廳的海報牆「看這部在演什麼」',!!it&&it.label==='看這部在演什麼'&&r===true&&H.said.length===2&&H.said[0].t.indexOf('《第十三號月台》')===0,J({it,said:H.said})); });

  await sec(5,async()=>{ const G=fresh('2025-11-15',19.4), id='heroine_04'; H.FRIEND(id);
    const P=MOVIES.periodOf('m2511b'), a=MOVIES.pickAdj(P.bill,id,MOVIES.film('m2511b'),null), W=film('m2511b').with[id];
    check('5. 子晴選到《黑白的城市》＝換《聖誕快遞》、她說稿上的兩句',a.film.id==='m2511a'&&J(a.say)===J(W.lines),J(a));
    const pf=MOVIES.pickFrom; MOVIES.pickFrom=(bill)=>({film:bill.find(b=>b.id==='m2511b'),ok:true});
    let iv; try{ iv=INV.accept(G,id,'xs_nanyang',G.day,19.5,{by:'player'}); } finally { MOVIES.pickFrom=pf; }
    check('5. 約的那一筆存換過的片（m2511a）、標籤寫《聖誕快遞》、換片那一句排著',iv.film==='m2511a'&&/看《聖誕快遞》/.test(iv.label)&&J(iv.filmSay)===J(W.lines),J([iv.film,iv.label,iv.filmSay]));
    H.said=[]; ADJ=[]; await INV.startTogether(GM,iv,npc(id)); const s0=idx(W.lines[0]), dim=idx('（燈暗下來，《聖誕快遞》開始了。）');
    check('5. 還沒說的換片那一句：見面時先說（燈暗以前）、之後不再說；好感一個都沒扣',s0>=0&&s0<dim&&!iv.filmSay&&H.said.filter(s=>s.t===W.lines[0]).length===1&&ADJ.every(([,d])=>Object.values(d).every(v=>v>=0)),J({s0,dim,ADJ})); });

  await sec(6,async()=>{ const G=fresh('2028-01-10',15); const id='heroine_04'; H.FRIEND(id); const c=MOVIES.choose(G,id);
    G.day=H.D('2028-05-20'); const d=MOVIES.choose(G,id);
    check('6. 子晴 2028-01＝《貓咪咖啡館的星期三》、2028-05＝《第八關》',c&&c.id==='m2801b'&&d&&d.id==='m2805b',J([c,d]));
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
    const ans=m?PHONE.answer(G,m.ask.id,0):null;
    check('7. 可昕《颱風夜的貨船》：訊息有兩個選項；回第一個＝她的戀愛 +2、KX_SHIP_REPORT、她回稿上那一句',!!m&&J(m.ask.opts.map(o=>o.t))===J(C.map(c=>c.t))&&!!ans&&G.flags.KX_SHIP_REPORT===G.day&&ADJ.some(([w,d])=>w===k&&d.npcRom===2)&&(G.msgs||[]).some(x=>x.text===C[0].say[0]&&x.from===k),J({m:m&&m.ask,ADJ}));
    const G3=fresh('2026-04-10',19); const a='heroine_01'; H.FRIEND(a);
    await MOVIES.after(GM,{place:'xs_nanyang',film:'m2603b',who:a,id:'ivz'},{name:'以安',charId:a});
    check('7. 以安《沉默的書記官》（下一次刑法、民法下課：接點還沒有）＝只記 AN_MOM_ASKED、MOVIE_LATER_DUE',G3.flags.AN_MOM_ASKED===G3.day&&G3.flags.MOVIE_LATER_DUE['m2603b:'+a]===G3.day&&!(G3.flags.MOVIE_LATER||[]).length,J(G3.flags.MOVIE_LATER_DUE));
    const G4=fresh('2027-09-20',19); H.FRIEND(a);
    await MOVIES.after(GM,{place:'xs_nanyang',film:'m2709b',who:a,id:'ivw'},{name:'以安',charId:a});
    const Q=(G4.flags.MOVIE_LATER||[]).slice(); const W2=film('m2709b').with[a];
    H.said=[]; G4.day+=2; const r0=await MOVIES.onSeated(GM,{who:a,id:'iv9'},{name:'以安',charId:a},INV.place('noodle'));
    const r1=await MOVIES.onSeated(GM,{who:a,id:'iv10'},{name:'以安',charId:a},INV.place('library')); const said=H.said.map(s=>s.t);
    const r2=await MOVIES.onSeated(GM,{who:a,id:'iv11'},{name:'以安',charId:a},INV.place('library'));
    check('7. 以安《借據》：下次在圖書館見面時說（麵店不說）、選項、之後不再說',Q.length===1&&r0===false&&r1===true&&said[0]===W2.lines[0]&&CH.some(c=>J(c)===J(W2.choice.map(x=>x.t)))&&r2===false,J({Q,r0,r1,r2,said:said.slice(0,3)})); });

  await sec(8,async()=>{ const G=fresh('2030-07-10',19), z='heroine_02'; H.FRIEND(z);
    const T0=MOVIES.talkFor(G,z,'m3007b'); G.flags.MOVIE_SEEN={[z]:{m2511b:10}}; G.flags.MOVIE_TALK={[z]:{m2511b:1}}; const T1=MOVIES.talkFor(G,z,'m3007b');
    const o3=film('m3007b').talk.opts[2];
    check('8. 芷若《起霧的城》：沒和她看過《黑白的城市》＝兩個選項；看過＝三個、她那一句照當時選的（第 2 個＝翻報紙的聲音）',T0.opts.length===2&&T1.opts.length===3&&T1.opts[2].t===o3.t&&T1.opts[2].lines[0]==='第二部。第一部你說喜歡翻報紙的聲音。'&&T1.opts[2].lines[1]===o3.re.heroine_022,J([T0.opts.map(o=>o.t),T1.opts[2]]));
    const s='heroine_05', R=film('m2801a').talk.opts[0].re; fresh('2028-01-10',19); H.FAMILIAR(s); const A=MOVIES.talkFor(H.G,s,'m2801a').opts[0].lines; H.FRIEND(s); const B=MOVIES.talkFor(H.G,s,'m2801a').opts[0].lines; H.date(s); const C=MOVIES.talkFor(H.G,s,'m2801a').opts[0].lines;
    check('8. 學姊《新年快樂，陌生人》第二句：有點熟不說、朋友照稿、交往中換成「今年跟我看。不要去擠。」',J(A)===J([R.heroine_05])&&J(B)===J([R.heroine_05,R.heroine_052])&&J(C)===J([R.heroine_05,'今年跟我看。不要去擠。']),J([A,B,C])); });

  await sec(9,async()=>{ const G=fresh('2025-11-15',19.4), id='heroine_04'; H.FRIEND(id); const iv=await watch(id);
    check('9. 子晴 2025-11（第 1 場對不上＝一般句）：看到一半演《聖誕快遞》的那一幕（旁白）',iv.film==='m2511a'&&idx(film('m2511a').scene)>idx('（燈暗下來，《聖誕快遞》開始了。）')&&H.said[idx(film('m2511a').scene)].who===null,J(H.said.map(s=>s.t).slice(0,12)));
    const L=MOVIES.midLines(G,{place:'xs_nanyang',film:'m2501a',who:'classmate_peishan'},null), L2=MOVIES.midLines(G,{place:'xs_nanyang',film:'m2501a',who:'classmate_peishan'},{k:2,mid:['x']}), L3=MOVIES.midLines(G,{place:'xs_nanyang',film:'m2501a',who:'kexin'},{rot:0});
    check('9. 沛珊《雪融之前》（with.mid）取代那一幕；AA_708 第 N 場＝照 AA_708（null）；別人輪換那一則＝那一幕',J(L)===J(film('m2501a').with.classmate_peishan.lines)&&L2===null&&J(L3)===J([film('m2501a').scene]),J([L,L2,L3])); });

  await sec(10,async()=>{ const G=fresh('2025-10-18',19.4), id='heroine_01'; H.FRIEND(id); delete G.flags.MOVIE_SEEN; delete G.flags.MOVIE_TALK;
    const old=JSON.parse(JSON.stringify(G)); H.G=old; SOCIAL.bind(old); INV.rec(old); H.FRIEND(id); const iv=await watch(id);
    check('10. 舊存檔（沒有 MOVIE_SEEN）：照常演、聊、記看過；JSON 來回不壞',iv.state==='done'&&idx(film('m2509a').talk.q)>=0&&JSON.parse(JSON.stringify(old)).flags.MOVIE_SEEN[id].m2509a===old.day,J(old.flags.MOVIE_SEEN));
    const G2=fresh('2025-10-18',19.4); H.FRIEND(id); G2.flags.MOVIE_SEEN=[1,2]; G2.flags.MOVIE_TALK='x'; const iv2=await watch(id);
    check('10. 格式壞掉的 MOVIE_SEEN／MOVIE_TALK：重建、照常演',iv2.state==='done'&&MOVIES.seenWith(G2,id,'m2509a')&&G2.flags.MOVIE_TALK[id].m2509a!=null,J([G2.flags.MOVIE_SEEN,G2.flags.MOVIE_TALK])); });
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
