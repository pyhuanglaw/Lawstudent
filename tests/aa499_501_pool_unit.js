// 法律系同學第二～四批十五位（AA_499、AA_500、AA_501，企劃線 4545c239e、d043110ae、17d57eff3；任務 NPC-STORY-1028、USER_WANTS X119）——不需要瀏覽器。
//   0  稿（雙向、一字不差）：src/data/pool_story_b2.js、b3.js、b4.js 的每一句台詞、旁白、選項、手機訊息、人物頁一行、personality 都在稿裡；
//      稿上的每一句（對話、旁白、選項、閒聊表、之後的招呼、他的線表上的訊息、「」引的句子）都在遊戲裡——例外逐條寫原因（EXC）
//   1  接線：十五位都有自己那一套（POOL.owns）、載入順序、社會圖（AA_499 第 6 節第 2 點）、personality（AA_501 第 5 節第 5 點的表）、新的 2D 場景沒有圖＝深色底、
//      作息加的時段用 AA_498 第 3 節同一句外觀描述
//   2～16 十五位各自：認識（地點、時段、年級、說名字以前外觀描述、之後名字；沒有那裡的版本＝不給說話按鈕）、秘密、順手的事（開口的時段、答應／婉拒、做完）、
//      邀你、他的線（手機）、畢業（日本路線改私訊）；三份稿「給 LAWWW」的測試建議全部（AA_499 第 6 節第 5 點、AA_500 第 7 節第 5 點、AA_501 第 5 節第 6 點）
//   17 女主角的圈子介紹（src/hcircle3d.js）：晏如、晨希（子晴的吉他社）、芸萱（沛珊）＝走同一套認識（FIRST_MET、他那條線「認識」那一段、名字換掉、
//      說話按鈕回來、之後不再演他自己的認識那一場）
//   18 共同的：晨希的錄音（閒聊型：一個月最多一則）、關係上限（朋友、沒有戀愛）、順手的事和店員的一起算、舊存檔（說過秘密的不重問、記成沒選；改過的原句照算說過）
// 修改前（開發分支 e7614e335，2026-10-28 開工時；git archive 那一版、把這支測試放進去真的跑過）：見檔尾 RESULT_BEFORE。
// 用法：node tests/aa499_501_pool_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const DOCS={B2:['AA_499','4545c239e','docs/story_planning/AA_499_法律系同學第二批_何宇軒_徐靜儀_詹立群_蘇承恩_馬佳蓉.md'],
  B3:['AA_500','d043110ae','docs/story_planning/AA_500_法律系同學第三批_大二六位_蔡宗霖_劉晏如_楊書豪_葉晨希_游振宇_蕭乃文.md'],
  B4:['AA_501','17d57eff3','docs/story_planning/AA_501_法律系同學第四批_大三四位_洪珮瑜_施孟儒_廖芸萱_嚴守誠.md']};
const DOC498=['56ed354e9','docs/story_planning/AA_498_法律系同學二十位_共同做法_改名_第一批五位.md'];
const HX='pool_10', JY='pool_13', LQ='pool_16', SC='pool_19', M='pool_20', TZ='pool_2', LY='pool_5', SH='pool_8', CX='pool_11', ZY='pool_14', NW='pool_17', PY='pool_9', MR='pool_12', YX='pool_15', YS='pool_18', ZJW='pool_7';
const ALL15=[HX,JY,LQ,SC,M,TZ,LY,SH,CX,ZY,NW,PY,MR,YX,YS];
const BH='classmate_bohan', PS='classmate_peishan', YC='classmate_youchen';

/* ---------- 載入（和 index.html 同一個順序；第二～四批的檔案修改前不存在＝記下來，各節 FAIL）---------- */
const RE=/^(EAT|EAT_LINES|WZS|L118|LANE118_SHOPS|LANE118_LAYOUT|PARK|WZ_PARK_LAYOUT|SIDEQ|MSG|MSG_POOL|MSG2_POOL|SISY23|SISY23_LINES|SISY23_EVENTS|POOL|POOL_STORY|POOL_STORY_B2|POOL_STORY_B3|POOL_STORY_B4|POOL_MORE|HCIRCLE|HCIRCLE_DATA|PRACTICE|R2Y4A_EVENTS|R2Y4B_EVENTS|R2Y3A_EVENTS|Y2B|Y2B_EVENTS|GROUP|GROUP_EVENTS|Y2R2|R2Y4A|R2Y4B|R2Y3A)$/;
const errs=[];
const load=f=>{ if(!fs.existsSync(path.join(H.ROOT,f))){ errs.push('沒有 '+f); return; } try{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); s=s.replace(/^const (\w+)\s*=/mg,(m,n)=>RE.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(s,{filename:f}); }catch(e){ errs.push(f+'：'+String(e&&e.message||e).slice(0,200)); } };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/eat_lines.js','src/eat3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/lane118.js','src/data/wz_park_layout.js','src/wzpark3d.js','src/wzshops3d.js','src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js','src/sideq3d.js',
  'src/data/y2b_events.js','src/y2b3d.js','src/data/group_events.js','src/group3d.js','src/y2r2_3d.js','src/data/r2y3a_events.js','src/data/r2y4a_events.js','src/data/r2y4b_events.js','src/practice3d.js',
  'src/data/pool_story.js','src/pool3d.js','src/data/pool_story_b2.js','src/data/pool_story_b3.js','src/data/pool_story_b4.js','src/pool_more3d.js','src/data/heroine_circle.js','src/hcircle3d.js']) load(f);
const P=()=>typeof POOL!=='undefined'?POOL:null, PM=()=>typeof POOL_MORE!=='undefined'&&POOL_MORE.SRC?POOL_MORE:null;
const L=id=>(P()&&P().LINES[id])||{};
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ').slice(0,400)); } };
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const TD=(t,w,wd)=>STORY.termDay(t,w,wd);
const set=(day,h,zone)=>{ H.G.day=day; H.G.hour=h; H.G.weekday=wdOf(day); if(zone) H.G.zone=zone; };
const fresh=(day,h,zone,flags)=>{ const G=H.fresh(keyOf(day),h,zone||'campus',Object.assign({EXCHANGE_ROUTE:'TW',afternoonDone:true},flags||{})); G.outings=[]; set(day,h,zone||'campus'); G.weather='clear';
  GM.npc={}; E.npcs=[]; E.interactables=[]; E.player.obj.position={x:0,y:0,z:0}; G.bike=null; if(typeof SIDEQ!=='undefined') SIDEQ.roll=()=>0.99; if(P()) P().bind(GM); STORY._bindGM(GM); if(typeof HCIRCLE!=='undefined'&&HCIRCLE.bind) HCIRCLE.bind(GM); return G; };
const spawn=(id,x,z)=>{ const n={name:SOCIAL.npcName(id),charId:id,obj:{position:{x:x||0,y:0,z:z||0}},pose:'idle'}; n.talk=nn=>STORY.talkCharacter(id,nn); GM.npc[id]=n; E.npcs.push(n); return n; };
const said=()=>H.said.map(x=>(x.who?x.who+'：':'')+x.t), has=t=>H.said.some(x=>x.t===t), whoOf=t=>(H.said.find(x=>x.t===t)||{}).who;
const T=x=>typeof x==='string'?x:(x&&x.text);
const hasL=x=>has(String(T(x)).replace('{name}','祐廷'));
const talk=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const n=GM.npc[id]||spawn(id); await STORY.talkCharacter(id,n); return n; };
const again=async(id,picks,day,h,zone)=>{ set(day,h,zone); GM.npc={}; E.npcs=[]; spawn(id); return talk(id,picks); };
const rel=(id,fam,trust)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; };
const meet=(id,z)=>SOCIAL.meet(id,z||H.G.zone);
const msgs=id=>(H.G.msgs||[]).filter(m=>m.th==='p:'+id).map(m=>m.text);
const tagged=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const ph=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const phAt=(day,h)=>{ set(day-1,22); ph(); set(day,h); ph(); };
const outing=ev=>(H.G.outings||[]).find(q=>q.ev===ev);
const go=async(ev,picks)=>{ const q=outing(ev); if(!q) return null; H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); set(q.day,q.h-0.3); await OUT.go(GM,q); return q; };
const ans=(tag,k)=>{ const m=(H.G.msgs||[]).find(x=>x.tag===tag&&x.ask); return m?PHONE.answer(H.G,m.ask.id,k):null; };
const quest=qid=>SIDEQ.get(H.G,qid)||{};
const deeds=id=>P().deeds(H.G,id);
const said1=(id)=>{ const S0=H.G.social.small||(H.G.social.small={}); return S0[id]||(S0[id]={day:0,used:[],last:null}); };
const markTalk=(id,keep)=>{ const r=said1(id); r.once=r.once||{}; for(const e of (L(id).talk||[])) if(e.when!==keep) r.once[e.t]=true; r.day=0; };   /* 閒聊表上別的句子都算說過（看某一句什麼時候解鎖）*/
const onDay=(a,from)=>{ for(let x=from;x<from+120;x++) if(ACTIVITIES.on(a,x,H.G)) return x; return null; };
const ofDoc=(sha,f)=>{ try{ return cp.execSync('git -c core.quotepath=false show '+sha+':"'+f+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } };
/* 白名單上那一筆的 commit（docs/handoff/story_import_allow.json；還沒登記＝任務給的 commit）*/
const ALLOW=(()=>{ try{ return JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files||[]; }catch(e){ return []; } })();
const shaOf=(f,def)=>{ const e=ALLOW.find(x=>x.path===f&&x.status==='approved'); return e?e.sha:def; };
const DOC={}; for(const k in DOCS) DOC[k]=ofDoc(shaOf(DOCS[k][2],DOCS[k][1]),DOCS[k][2]);

async function main(){
/* ---------- 0 稿（雙向）---------- */
await sec(0,()=>{ const B={B2:typeof POOL_STORY_B2!=='undefined'?POOL_STORY_B2:null,B3:typeof POOL_STORY_B3!=='undefined'?POOL_STORY_B3:null,B4:typeof POOL_STORY_B4!=='undefined'?POOL_STORY_B4:null};
  check('0. 三份資料（b2、b3、b4）、流程（pool_more3d.js）都載得到',!!(B.B2&&B.B3&&B.B4&&PM())&&!errs.length,J(errs));
  check('0. 三份稿讀得到（git show 白名單上那一筆的 commit）',Object.values(DOC).every(d=>d.length>8000),J(Object.keys(DOC).map(k=>k+':'+DOC[k].length)));
  /* 遊戲裡的字（場景的 scene／bg、label、goto、條件、旗標、說話的人不算；{meet} 物件不算，meet 那一場算）*/
  const SKIP=new Set(['when','scene','bg','label','goto','speaker','meet','if','unless','set','from','id']);
  const strs=b=>{ const out=[]; const walk=(v,k)=>{ if(v==null||(SKIP.has(k)&&(typeof v!=='object'||['if','unless','set'].includes(k)))) return; if(typeof v==='string'){ out.push(v); return; } if(typeof v==='function') return; if(Array.isArray(v)){ v.forEach(x=>walk(x,k)); return; } if(typeof v==='object') for(const kk in v) walk(v[kk],kk); };
    walk(b.LINES,''); if(b.PERSONALITY) walk(b.PERSONALITY,''); return out; };
  /* 遊戲 → 稿：每一句都在稿裡（一字不差）。DERIVED＝稿上沒有另外寫的房間物品「看」的句子：用那個人說過的那一句加引號（裡面那一句一字不差在稿裡）*/
  const DERIVED={'「這條比你資深。對它好一點。」':'AA_499 5-4 房間物品「法服的延長線」：稿沒有寫「看」的句子，用她交給你時說的那一句',
    '「週五以前還我。」':'AA_500 6-1 房間物品「乃文學姊的民總筆記」：稿沒有寫「看」的句子，用她借你時說的那一句'};
  for(const k of ['B2','B3','B4']){ if(!B[k]){ check('0. '+DOCS[k][0]+'：資料檔不存在',false); continue; } const G=[...new Set(strs(B[k]))], d=DOC[k];
    const bad=G.filter(t=>d.indexOf(t)<0&&!(DERIVED[t]&&d.indexOf(t.replace(/^「|」$/g,''))>=0));
    check('0. 遊戲 → 稿：'+DOCS[k][0]+' 的每一句台詞、旁白、選項、手機訊息、人物頁一行'+(k==='B4'?'、personality':'')+'都在稿裡（一字不差；例外：房間物品兩句，寫在 DERIVED）',G.length>150&&!bad.length,G.length+' 句；不在稿裡：'+J(bad)); }
  /* 稿 → 遊戲：抽出稿上的每一句 */
  const NOTE=/（(?:原句[^）]*|後[一兩]句是原句|接原句[^）]*|認識[^）]{1,12}|有 `[^）]*|沒有[^）]*)）\s*$/;
  const stripN=t=>{ let s=t.trim(); for(let i=0;i<3;i++){ const m=s.match(NOTE); if(!m) break; s=s.slice(0,m.index).trim(); } return s; };
  const SPK=/^([^（「：\s*]{1,12})：(.+)$/;
  const units=doc=>{ const U=[]; const lines=doc.split('\n'); let mode='head';
    for(let i=0;i<lines.length;i++){ const raw=lines[i];
      if(/^## /.test(raw)){ mode='profile'; continue; } if(/^### /.test(raw)){ mode='body'; continue; } if(mode!=='body') continue;   /* 各人開頭的事實、記號、手機、和誰（說明，不是台詞）不抽 */
      const bq=raw.match(/^\s*>\s?(.*)$/);
      if(bq){ let t=bq[1].trim(); if(!t||/^- /.test(t)) continue; t=stripN(t); const sp=t.match(SPK); U.push(sp?{k:'bq',sp:sp[1],t:sp[2].trim(),i}:{k:'bq',t,i}); continue; }
      if(/^\|/.test(raw)){ const cells=raw.split('|').slice(1,-1).map(c=>c.trim()); if(cells.length<2||/^-+$/.test(cells[0])||cells[0]==='解鎖'||cells[0]==='時候'||/^id$/.test(cells[0])) continue; const c=cells[cells.length-1];
        if(/^pool_\d+ /.test(cells[0])){ U.push({k:'pers',t:c,i}); continue; }
        for(const piece of c.split('<br>')){ const p=stripN(piece.trim()); const sp=p.match(SPK); if(sp){ U.push({k:'row',sp:sp[1],t:stripN(sp[2]),i}); continue; } for(const m of p.matchAll(/「([^「」]*(?:『[^』]*』[^「」]*)*)」/g)) U.push({k:'rowq',t:'「'+m[1]+'」',i}); } continue; }
      const bl=raw.match(/^(\s*)- (.*)$/);
      if(bl){ const t=bl[2].trim(); if(/^法律：/.test(t)) continue;
        const opt=t.match(/^(「[^」]*」|（[^）]*）)(?:（[^）]*）)?\s*→/); if(opt){ U.push({k:'opt',t:opt[1],i}); continue; }
        if(/^(「[^」]*」|（[^）]*）)$/.test(stripN(t))){ U.push({k:'greet',t:stripN(t),i}); continue; }
        for(const m of stripN(t).matchAll(/「([^「」]*)」/g)) U.push({k:'q',t:m[1],i}); } }
    return U; };
  const norm=s=>s.replace(/^「(.*)」$/,'$1');
  const lit=f=>{ try{ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/\/\*[\s\S]*?\*\//g,''); const o=[]; for(const m of s.matchAll(/'((?:[^'\\\n]|\\.)*)'/g)) if(/[一-鿿]/.test(m[1])) o.push(m[1]); return o; }catch(e){ return []; } };
  const SRCALL=(()=>{ let s=''; const walk=d=>{ for(const f of fs.readdirSync(path.join(H.ROOT,d))){ const p=path.join(d,f); if(fs.statSync(path.join(H.ROOT,p)).isDirectory()) walk(p); else if(/\.js$/.test(f)) s+=fs.readFileSync(path.join(H.ROOT,p),'utf8'); } }; walk('src'); return s; })();
  const MORE=lit('src/pool_more3d.js');   /* 房間物品的名字（介面的字）在流程那一份 */
  /* 例外：稿上有、遊戲裡沒有的（逐條原因）*/
  const EXC={'（說明會的第三排，靖雯和承恩坐在一起。靖雯說了一聲「早安」，承恩小聲回了一聲「……早安」。）':'AA_499 4-5：遊戲裡沒有大三上的實習說明會那一場（沒有地方接；回報列出）',
    '拍手／記分／送水':'AA_501 2-4：指系籃比賽現有的三個選項（ev_zhe_game_* 的 choice），不是台詞'};
  for(const k of ['B2','B3','B4']){ if(!B[k]) continue; const G=strs(B[k]), all=G.concat(MORE).join('\n'), S1=new Set(G), SN=new Set(G.map(norm)); const U=units(DOC[k]); const miss=[], used=new Set();
    for(const u of U){ let ok;
      if(EXC[u.t]){ used.add(u.t); continue; }
      if(u.k==='q') ok=all.indexOf(u.t)>=0||SRCALL.indexOf(u.t)>=0;   /* 段落裡「」引的：遊戲裡哪裡都可以（人物頁、房間物品、引別的事件的題目）*/
      else if(u.k==='opt'||u.k==='greet'||u.k==='rowq') ok=S1.has(u.t)||SN.has(norm(u.t));   /* 選項：手機的回覆沒有引號 */
      else if(u.k==='pers') ok=S1.has(u.t);
      else ok=S1.has(u.t)||S1.has(norm(u.t))||(u.t.indexOf('／')>0&&u.t.split('／').every(x=>S1.has(x)));   /* 「一行三樣，分三則」*/
      if(!ok) miss.push((u.i+1)+' ['+u.k+'] '+(u.sp?u.sp+'：':'')+u.t); }
    check('0. 稿 → 遊戲：'+DOCS[k][0]+' 上的每一句（對話、旁白、選項、閒聊表、之後的招呼、他的線表上的訊息、「」引的句子）都在遊戲裡（例外寫在 EXC）',U.length>200&&!miss.length,U.length+' 句；遊戲裡沒有：'+J(miss)); }
  check('0. 例外都還用得到（稿改了就拿掉）',Object.keys(EXC).every(t=>Object.values(DOC).some(d=>d.indexOf(t)>=0)),J(Object.keys(EXC)));
  /* pool_more3d.js 沒有自己寫的台詞：只有一般的「其實……」（story3d.js 原本那一句，AA_120 定稿）和找位子用的「（全場笑。）」*/
  const sayLit=MORE.filter(t=>/^[「（].*[」）]$/.test(t)&&!/^（[一二三四五六日]）/.test(t));
  check('0. 流程那一份（pool_more3d.js）沒有自己編的台詞（只有找插入位置的「（全場笑。）」；一般的「其實……」照 story3d.js 原本的句型）',J(sayLit)===J(['（全場笑。）'])&&/'「其實……'\+/.test(fs.readFileSync(path.join(H.ROOT,'src/pool_more3d.js'),'utf8')),J(sayLit)); });

/* ---------- 1 接線 ---------- */
await sec(1,()=>{ check('1. 十五位都有自己那一套（POOL.owns；認識的版本、流程、閒聊表）',!!PM()&&ALL15.every(id=>P().owns(id)&&P().LINES[id]&&(P().LINES[id].talk||[]).length>=5&&(P().LINES[id].greet||[]).length===3&&Array.isArray(P().FLOW[id])),J(ALL15.filter(id=>!(P()&&P().owns(id)))));
  const ih=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), sc=[...ih.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]), ix=f=>sc.indexOf(f);
  check('1. index.html：pool3d.js → pool_story_b2.js → b3 → b4 → pool_more3d.js 緊接；女主角圈子（hcircle3d.js）在後面',ix('src/pool3d.js')>0&&ix('src/data/pool_story_b2.js')===ix('src/pool3d.js')+1&&ix('src/data/pool_story_b3.js')===ix('src/pool3d.js')+2&&ix('src/data/pool_story_b4.js')===ix('src/pool3d.js')+3&&ix('src/pool_more3d.js')===ix('src/pool3d.js')+4&&ix('src/hcircle3d.js')>ix('src/pool_more3d.js'),J(sc.slice(ix('src/pool3d.js')-1,ix('src/pool3d.js')+6)));
  const E2=(a,b)=>SOCIAL_GRAPH.find(x=>(x.a===a&&x.b===b)||(x.a===b&&x.b===a));
  const want=[[HX,'npc_ta_chen'],[HX,BH],[JY,YC],[JY,'pool_1'],[LQ,YC],[SC,'heroine_03'],[SC,ZJW],[M,BH],[M,ZJW],[M,'heroine_03']];
  check('1. 社會圖（AA_499 第 6 節第 2 點）：語彤—佳蓉改 referral；宇軒—陳助教 highschool；加的十條都在（立群—宥辰原本的 dj_crew 照舊）',(E2('heroine_03',M)||{}).type==='referral'&&(E2(HX,'npc_ta_chen')||{}).type==='highschool'&&(E2(LQ,YC)||{}).type==='dj_crew'&&want.every(([a,b])=>!!E2(a,b)),J(want.filter(([a,b])=>!E2(a,b))));
  /* personality：AA_501 第 5 節第 5 點的表 */
  const tb={}; for(const m of DOC.B4.matchAll(/^\| (pool_\d+) \S+ \| ([^|]+?) \|$/mg)) tb[m[1]]=m[2];
  check('1. personality：AA_501 第 5 節第 5 點的表（十五位）照填（蔡宗霖原本「修太多學分的人」換表上那一句）',Object.keys(tb).length===15&&Object.keys(tb).every(id=>CHARACTERS[id].personality===tb[id]),J(Object.keys(tb).filter(id=>CHARACTERS[id].personality!==tb[id]).map(id=>[id,CHARACTERS[id].personality])));
  const BG=['radio_room','putong_empty','welfare_room','law_courtyard','boya_201','phil_cafe'];
  check('1. 新的 2D 場景（AA_499 第 6 節第 3 點、AA_500 第 7 節第 4 點、AA_501 第 5 節第 4 點）：沒有背景圖＝深色底（OUT.BG 登記 image:null，BB 跟使用者要）',BG.every(k=>OUT.BG[k]&&OUT.BG[k].image===null&&OUT.bg(k)==='dark'),J(BG.map(k=>[k,OUT.BG[k]])));
  /* 作息加的時段（各人那條線要的）：外觀描述照 AA_498 第 3 節（同一個人的那一句）*/
  const d498=ofDoc(DOC498[0],DOC498[1]), bad=[]; for(const id in (P().WHERE_MORE||{})) for(const e of P().WHERE_MORE[id]){ const base=(POOL_STORY.PEOPLE[id].where||[]).map(x=>x.desc); if(!base.includes(e.desc)||d498.indexOf(e.desc)<0) bad.push(id+':'+e.desc); }
  check('1. 作息加的時段（蟑螂、畢業、值班結束、推甄、期末前、打拍子）用 AA_498 第 3 節同一個人的外觀描述',Object.keys(P().WHERE_MORE||{}).length>=7&&!bad.length,J(bad)); });

/* ---------- 2 何宇軒（AA_499 第 1 節）---------- */
await sec('2 何宇軒',async()=>{ const d=TD('Y1S1',4,2); fresh(d,14.5,'library'); spawn(HX);
  check('2. 何宇軒：認識前「和常跟助教說話的男生說話」（總圖，平日 14～16）',GM.npc[HX].name==='常跟助教說話的男生',GM.npc[HX].name);
  await talk(HX,['那你現在在問什麼']);
  check('2. 何宇軒 1-1 認識（總圖，陳助教旁邊那一桌）：「你也是大一的？宇軒，你同學。」→ 他說名字（名字以後才叫何宇軒）；選「那你現在在問什麼？」→ 無效和得撤銷',hasL(L(HX).meet[1])&&whoOf(T(L(HX).meet[3]))==='何宇軒'&&has('民法為什麼要分「無效」和「得撤銷」。兩個結果都是不算，為什麼要分？')&&has('（沒有抬頭）回去看第七十一條到第九十二條。')&&!has('不會打擾。學長本來就不太理我。')&&SOCIAL.has(HX,'FIRST_MET')&&P().rec(H.G).mv[HX]==='meet',J(said()));
  fresh(TD('Y2S1',4,2),14.5,'library'); const n2=spawn(HX); P().syncTalk(H.G,HX,n2);
  check('2. 何宇軒：稿上說「你也是大一的？」＝祐廷大一才演；大二才遇到＝沒有認識的版本、先不給說話按鈕（和第一批鄭元碩、邱家齊同一套）',P().meetVersion(H.G,HX)===null&&n2.talk===null);
  /* 秘密 → 放榜（AA_499 第 6 節第 5 點）*/
  fresh(TD('Y1S2',5,2),14.5,'library'); meet(HX); rel(HX,25,3); spawn(HX); await talk(HX,[]); const w5=SOCIAL.has(HX,'SHARED_SECRET');
  await again(HX,['你想研究什麼'],TD('Y1S2',6,2),14.5,'library');
  check('2. 何宇軒 秘密（大一下第 6 週起、有點熟、總圖；第 5 週還沒有）：選「你想研究什麼？」→ HYX_WHAT',!w5&&hasL(L(HX).secret[0])&&has('我想知道法官為什麼這樣判。對錯以外的那一部分。')&&H.G.flags.HYX_WHAT===true&&SOCIAL.has(HX,'SHARED_SECRET'),J(said()));
  INV.addContact(H.G,HX); phAt(D('2028-11-23'),16.1);
  check('2. 何宇軒 1-6 放榜（2028-11-23，柏翰放榜同一天）：「上了。」＋秘密選「你想研究什麼？」那一則',J(msgs(HX))===J([L(HX).pass,L(HX).passWhat]),J(msgs(HX)));
  /* 1-3 研究室 → 1-4、1-5 一百份判決 */
  const d3=TD('Y2S1',4,1); fresh(d3,14.5,'library'); meet(HX); rel(HX,25,3); SOCIAL.remember(HX,'SHARED_SECRET',''); spawn(HX); await talk(HX,['我陪你去']);
  const r1=quest('PQ_HYX1'), q1=outing('ev_pool_hyx_office');
  check('2. 何宇軒 1-3 陪他去研究室（大二上第 3～8 週、總圖、有點熟）：開口兩句；「我陪你去。」＝交換聯絡方式、掛事、排那個週三 15:00（霖澤館）',hasL(L(HX).ask[0])&&hasL(L(HX).ask[1])&&r1.state==='open'&&INV.hasContact(H.G,HX)&&!!q1&&q1.day===TD('Y2S1',4,3)&&q1.h===15,J([r1,q1&&[keyOf(q1.day),q1.h]]));
  await go('ev_pool_hyx_office',[]);
  check('2. 何宇軒 研究室（2D，周教授研究室門口）：「（小聲）……你敲。」、周教授「進來。」、走廊那兩句；HYX_OFFICE、人物頁「陪他去敲過周老師的門」、做完',has('（小聲）……你敲。')&&has('進來。')&&has('換我被問「為什麼」了。……原來是這種感覺。')&&H.G.flags.HYX_OFFICE===true&&deeds(HX).includes('陪他去敲過周老師的門')&&r1.state==='done',J(said()));
  markTalk(HX,'hyxOffice'); await again(HX,[],TD('Y2S1',5,1),14.5,'library');
  check('2. 何宇軒：去過研究室＝大二上閒聊多「周老師的研究室很小，書疊到天花板。…」',has('「周老師的研究室很小，書疊到天花板。他說那些書他都看過。……我不敢問是不是真的。」'),J(said()));
  phAt(TD('Y3S1',3,1),21.1); const m3=tagged('pool_hyx_y3').find(m=>m.ask);
  check('2. 何宇軒 1-4 大三上第 3 週（有聯絡方式）週一 21:00 兩則＋回覆（「好。」／「我那幾天都很忙。」）',J(msgs(HX).slice(-2))===J(L(HX).y3)&&!!m3&&J(m3.ask.opts.map(o=>o.t))===J(L(HX).y3Opts),J(msgs(HX)));
  ans('pool_hyx_y3',0); const r2=quest('PQ_HYX2'), q2=outing('ev_pool_hyx_cases');
  check('2. 何宇軒 回「好。」＝順手的事 2：那個週四 19:00～21:00 總圖 B1 討論室',r2.state==='open'&&!!q2&&q2.day===TD('Y3S1',3,4)&&q2.h===19,J([r2,q2&&keyOf(q2.day)]));
  await go('ev_pool_hyx_cases',['法官看到的樣子']);
  check('2. 何宇軒 一百份判決（2D，B1）：「態度良好」那一題選「法官看到的樣子。」→ 那兩句；人物頁「幫他讀過判決」；做完',has('法官看到的樣子……那就不只是被告的事了。')&&has('（他在筆記本上寫了很長一段。）')&&deeds(HX).includes('幫他讀過判決')&&r2.state==='done',J(said()));
  /* 婉拒：大二上第 10 週以後多一句 */
  fresh(d3,14.5,'library'); meet(HX); rel(HX,25,3); SOCIAL.remember(HX,'SHARED_SECRET',''); spawn(HX); await talk(HX,['你自己去比較好']);
  const dec=has('……為什麼？')&&has('不用回答。我知道為什麼。')&&quest('PQ_HYX1').state==='declined'&&!INV.hasContact(H.G,HX);
  set(TD('Y2S1',9,1),14.5); const w9=P().WHEN.hyxSelf(H.G); markTalk(HX,'hyxSelf'); await again(HX,[],TD('Y2S1',10,1),14.5,'library');
  check('2. 何宇軒「你自己去比較好。」→ 那兩句、婉拒（不交換聯絡方式、不扣）；大二上第 10 週以後閒聊多「我自己去敲周老師的門了。…」（第 9 週還沒有）',dec&&!w9&&has('「我自己去敲周老師的門了。站了五分鐘才敲。」'),J(said()));
  /* 1-6 推甄（2028-10-26，霖澤館一樓，柏翰也在）*/
  fresh(D('2028-10-26'),9,'linze'); meet(HX); rel(HX,25,3); SOCIAL.remember(HX,'SHARED_SECRET',''); spawn(HX); spawn(BH);
  const iv=STORY_EVENTS.find(e=>e.id==='ev_push_interview'), ok0=EVENTS.check(PM().PUSH_EV);
  check('2. 何宇軒 1-6：柏翰推甄面試那一場（ev_push_interview）演完接宇軒那一場（next_event）；柏翰那天早上也在霖澤館一樓',!!iv&&iv.next_event==='ev_pool_hyx_push'&&ok0&&(CHARACTERS[BH].daily_schedule||[]).some(e=>e.poolPush&&e.zone==='linze'&&STORY.inDates({day:D('2028-10-26')},e.dates)));
  await talk(HX,[]);
  check('2. 何宇軒 推甄那天第一次找他＝長椅那四句（柏翰「我問過了。…」）；記下、不重演',has('柏翰說，面試一個人十二分鐘。……為什麼是十二？')&&has('我問過了。前面兩分鐘自我介紹，十分鐘問問題。')&&has('那我只有十分鐘可以被問「為什麼」。')&&P().did(H.G,'hyxPush')&&!EVENTS.check(PM().PUSH_EV),J(said()));
  await talk(HX,[]); check('2. 何宇軒：同一天再找他不重演',!has('柏翰說，面試一個人十二分鐘。……為什麼是十二？'));
  fresh(D('2028-10-26'),9,'linze'); meet(HX); rel(HX,25,3); const pd1=PM().pushDue(H.G); SOCIAL.rel(HX).fam=0; const pd2=PM().pushDue(H.G);
  fresh(D('2028-10-26'),9,'linze',{EXCHANGE_ROUTE:'US'}); meet(HX); rel(HX,25,3); const pd3=PM().pushDue(H.G);
  check('2. 何宇軒：推甄那天要有點熟、認識；美國路線（8/2～12/23 在美國）那天不在臺灣＝不演',pd1&&!pd2&&!pd3,J([pd1,pd2,pd3])); });

/* ---------- 3 徐靜儀（AA_499 第 2 節）---------- */
await sec('3 徐靜儀',async()=>{ const d=TD('Y1S1',4,1); fresh(d,12.5,'campus'); spawn(JY);
  check('3. 徐靜儀：認識前「和聲音很好聽的女生說話」（椰林大道，平日 12～13）',GM.npc[JY].name==='聲音很好聽的女生',GM.npc[JY].name);
  await talk(JY,['可以不要錄嗎']);
  check('3. 徐靜儀 2-1 認識：「同學，可以錄嗎？…」選「……可以不要錄嗎？」→ JY_ANS no；說名字以前外觀描述、之後「徐靜儀」',whoOf(T(L(JY).meet[1]))==='聲音很好聽的女生'&&has('可以。（她把錄音筆放下來）那我們用講的就好。……你哪一系的？法律？我也是。')&&whoOf('我叫徐靜儀。法律系，跟你同班。……你上課都坐後面，所以你沒看過我。')==='徐靜儀'&&H.G.flags.JY_ANS==='no'&&SOCIAL.has(JY,'FIRST_MET'),J(said()));
  await again(JY,[],d+4,12.5,'campus'); const four=has(L(JY).airedNo);
  await again(JY,[],d+7,12.5,'campus');
  check('3. 徐靜儀 一週以後（沒有聯絡方式＝下一次在椰林大道當面）：「節目上了。沒有你，可是…」（第 4 天還沒有）',!four&&has(L(JY).airedNo)&&P().did(H.G,'jyAired'),J(said()));
  /* 2-3 新聞：「一起查」→ 秘密在那裡 → 2030 checked 版（AA_499 第 6 節第 5 點）*/
  const d2=TD('Y1S2',4,2); set(d2,12.5,'campus'); rel(JY,25,3); GM.npc={}; spawn(JY); await talk(JY,['一起查']);
  check('3. 徐靜儀 2-3 新聞裡的一句話（大一下第 3～10 週，椰林大道，有點熟）：選「我不確定。我們一起查。」→ JY_NEWS checked；秘密在這裡說；交換聯絡方式；當場做完',hasL(L(JY).news[0])&&has('無罪，是檢察官沒有證明到讓法官確信。……這跟「沒做」差很遠。')&&H.G.flags.JY_NEWS==='checked'&&SOCIAL.has(JY,'SHARED_SECRET')&&INV.hasContact(H.G,JY)&&quest('PQ_JY').state==='done',J(said()));
  set(D('2030-09-30'),22); ph(); set(D('2030-10-01'),8.1); ph(); const nw=tagged('pool_jy_news2030')[0]; phAt(D('2030-10-02'),21.1);
  check('3. 徐靜儀 2-7：2030-10-01 08:00 新聞（通知）；隔天 21:00 她私訊＝一起查過（checked）那一則',!!nw&&nw.text===L(JY).news2030&&nw.th==='sys'&&msgs(JY).includes(L(JY).title)&&!msgs(JY).includes(L(JY).titleNo),J([nw&&nw.th,msgs(JY)]));
  /* 「無罪就是沒做吧。」*/
  fresh(d2,12.5,'campus'); meet(JY); rel(JY,25,3); spawn(JY); await talk(JY,['無罪就是沒做吧']);
  const w0=!SOCIAL.has(JY,'SHARED_SECRET')&&H.G.flags.JY_NEWS==='wrong'&&quest('PQ_JY').state==='done'&&!INV.hasContact(H.G,JY)&&has('好。（她照抄了。）');
  await again(JY,[],d2+7,12.5,'campus'); const later=has(L(JY).newsLater);
  await again(JY,[],d2+8,12.5,'campus'); const gl=PM().genericLine(JY);
  check('3. 徐靜儀「無罪就是沒做吧。」→「好。（她照抄了。）」（秘密不在這裡說、不交換聯絡方式）；一週以後她更正；之後秘密照一般的「其實……」（不加選項）',w0&&later&&!!gl&&has(gl)&&SOCIAL.has(JY,'SHARED_SECRET'),J([gl,said()]));
  /* 2-5 廣播社錄音（大二上第 10 週）*/
  fresh(TD('Y2S1',10,1)-2,21,'campus'); meet(JY); rel(JY,25,3); INV.addContact(H.G,JY); meet(LQ); phAt(TD('Y2S1',10,1),21.1);
  check('3. 徐靜儀 2-5 大二上第 10 週週一 21:00（有聯絡方式）私訊邀你上節目（邀你去社團）',msgs(JY).includes(L(JY).invite)&&tagged('pool_jy_invite').some(m=>m.ask),J(msgs(JY)));
  ans('pool_jy_invite',0); const qr=outing('ev_pool_jy_radio');
  check('3. 徐靜儀 回「好。」＝那個週四 20:00 廣播社的錄音間',!!qr&&qr.day===TD('Y2S1',10,4)&&qr.h===20,J(qr&&[keyOf(qr.day),qr.h]));
  await go('ev_pool_jy_radio',['用唱的背']);
  check('3. 徐靜儀 錄音（2D，錄音間，沒有圖＝深色底）：認識詹立群多一個選項「我們班有一個人用唱的背。」→ JY_LQ；人物頁「上過她的節目」',(H.opts[0]||[]).length===3&&has('……用唱的？那下一集我要找他。')&&H.G.flags.JY_LQ===true&&deeds(JY).includes('上過她的節目'),J([H.opts,said()]));
  phAt(qr.day+7,21.1); const ep=tagged('pool_jy_episode')[0];
  check('3. 徐靜儀：之後一週她傳那一集（「（語音 9:58）」點開是一句旁白）',!!ep&&ep.text==='（語音 9:58）'&&J(ep.fold)===J(L(JY).episode.fold),J(ep));
  set(TD('Y2S1',12,5),12.5,'gongguan'); markTalk(LQ,'Y2S1jyLq'); rel(LQ,25,3); GM.npc={}; spawn(LQ); SOCIAL.remember(LQ,'SHARED_SECRET',''); await talk(LQ,[]);
  check('3. 徐靜儀 選了「用唱的背」＝詹立群大二上多一句「靜儀叫我去廣播社唱民總。…」',has('「靜儀叫我去廣播社唱民總。我唱到一半就跑出來了。……她有錄到。」'),J(said()));
  fresh(TD('Y2S1',10,4),19.5,'campus'); H.said=[]; H.opts=[]; await EVENTS.runLines(L(JY).radio,{id:'t',participants:[JY]});
  check('3. 徐靜儀：沒認識詹立群＝錄音只有兩個選項',(H.opts[0]||[]).length===2,J(H.opts));
  /* 2-6 宥辰那一集：2026-11-20（地下室那場 11/14 之後一週的週五）*/
  fresh(D('2026-11-19'),12,'campus'); meet(JY); INV.addContact(H.G,JY); meet(YC); phAt(D('2026-11-20'),21.1);
  check('3. 徐靜儀 2-6（認識宥辰）：2026-11-20 21:00 那一集（語音＋兩則）',msgs(JY).length===3&&msgs(JY)[0]==='（語音 12:30）'&&msgs(JY)[2]===L(JY).yc[2],J(msgs(JY))); });

/* ---------- 4 詹立群（AA_499 第 3 節）---------- */
await sec('4 詹立群',async()=>{ const d=TD('Y1S1',4,5); fresh(d,21,'gongguan'); spawn(LQ);
  check('4. 詹立群：認識前「和幫人搬音響的男生說話」（公館，週五 20～24）',GM.npc[LQ].name==='幫人搬音響的男生',GM.npc[LQ].name);
  await talk(LQ,[]);
  check('4. 詹立群 3-1 認識：一邊走一邊唱、音響差點掉下去；說名字（之後叫詹立群）',hasL(L(LQ).meet[0])&&has('你、你有聽到嗎？……你是法律系的對不對。民總坐我前面那個。')&&whoOf('詹立群。我九點暖場，宥辰十一點。……剛剛那個，你就當沒聽到。')==='詹立群'&&SOCIAL.has(LQ,'FIRST_MET'),J(said()));
  fresh(TD('Y2S1',4,5),21,'gongguan'); check('4. 詹立群：稿沒有說年級＝大二在公館遇到也是這一場',P().meetVersion(H.G,LQ)==='meet');
  fresh(TD('Y1S1',9,5),21,'gongguan'); meet(LQ); rel(LQ,25,3); spawn(LQ); await talk(LQ,[]); const w9=SOCIAL.has(LQ,'SHARED_SECRET');
  await again(LQ,['我也想學'],TD('Y1S1',10,5),21,'gongguan');
  check('4. 詹立群 秘密（大一上第 10 週起、有點熟；第 9 週還沒有）：「其實……我背法條是配節奏的。」接原句、再三個選項；「我也想學。」→ LQ_SONG',!w9&&has('其實……我背法條是配節奏的。')&&has('「我背法條是配節奏的。……你不要叫我唱，我會害羞。」')&&has('真的？那我寫一首給你。……你不能笑。')&&H.G.flags.LQ_SONG===true&&SOCIAL.has(LQ,'SHARED_SECRET'),J(said()));
  await again(LQ,['我來'],TD('Y1S2',11,5),21,'gongguan'); const r=quest('PQ_LQ'), q=outing('ev_pool_lq_teach');
  check('4. 詹立群 3-3 試教（大一下第 11～13 週、有點熟）：開口三句；「我來。」＝交換聯絡方式、掛事、排下週四 19:00 普通教學館的空教室',hasL(L(LQ).ask[2])&&r.state==='open'&&INV.hasContact(H.G,LQ)&&!!q&&q.h===19&&wdOf(q.day)===4&&q.day>H.G.day,J([r,q&&keyOf(q.day)]));
  await go('ev_pool_lq_teach',['假裝睡覺']);
  check('4. 詹立群 試教（2D，空教室）：選「（假裝睡覺）」→ LQ_STU sleep；人物頁「當過他的國中生」；做完',has('起來。……我剛剛那樣可以嗎？會不會太兇？')&&H.G.flags.LQ_STU==='sleep'&&deeds(LQ).includes('當過他的國中生')&&r.state==='done',J(said()));
  phAt(TD('Y1S2',15,3),21.1);
  check('4. 詹立群 甄選結果（大一下第 15 週）：「上了！！！教育學程！！！」＋假裝睡覺那一則（AA_499 第 6 節第 5 點）',J(msgs(LQ).slice(-2))===J([L(LQ).result,L(LQ).resSleep]),J(msgs(LQ)));
  PHONE.join(H.G,'law_class','法律系'); meet(PS); const pre0=STORY.presence; phAt(TD('Y3S1',8,3),22.1); const g0=tagged('pool_lq_grp').map(m=>[m.from,m.text]);
  phAt(D('2029-09-03'),18.1);
  check('4. 詹立群 2029-09 教育實習：兩則（LQ_STU sleep 多「有一個學生假裝睡覺」）',J(msgs(LQ).slice(-2))===J([L(LQ).y2029,L(LQ).y2029Sleep]),J(msgs(LQ)));
  fresh(TD('Y3S1',8,1),12,'campus'); PHONE.join(H.G,'law_class','法律系'); meet(PS);
  STORY.presence=(id,G)=>id===PS?{here:true}:pre0(id,G); let g=[]; try{ phAt(TD('Y3S1',8,3),22.1); g=tagged('pool_lq_grp'); } finally { STORY.presence=pre0; }
  check('4. 詹立群 3-4 大三：班級群組大三上第 8 週（宥辰傳立群唱的刑訴）；沛珊大二暑假以後在台南（presence）＝不回；認識沛珊、沛珊在臺北的話＝她回「這個比我的筆記好記。」',J(g0)===J([[YC,L(LQ).grp]])&&g.length===2&&g[0].from===YC&&g[0].text===L(LQ).grp&&g[1].from===PS&&g[1].text===L(LQ).grpPs,J([g0,g.map(m=>[m.from,m.text])]));
  fresh(TD('Y1S2',12,5),21,'gongguan'); meet(LQ); rel(LQ,25,3); SOCIAL.remember(LQ,'SHARED_SECRET',''); spawn(LQ); await talk(LQ,['我那幾天有事']);
  check('4. 詹立群「我那幾天有事。」→「好。我找宥辰。他會一直睡，剛好練習。」；不交換聯絡方式（甄選結果不會傳）',has('好。我找宥辰。他會一直睡，剛好練習。')&&quest('PQ_LQ').state==='declined'&&!INV.hasContact(H.G,LQ)); });

/* ---------- 5 蘇承恩（AA_499 第 4 節）---------- */
await sec('5 蘇承恩',async()=>{ const d=TD('Y1S1',4,2); fresh(d,10.5,'soclib'); spawn(SC);
  check('5. 蘇承恩：認識前「和講話很小聲的男生說話」（社科院，平日 10～12）',GM.npc[SC].name==='講話很小聲的男生',GM.npc[SC].name);
  await talk(SC,['我也想旁聽別的系']);
  check('5. 蘇承恩 4-1 認識：「……你也是法律系的。民總，你坐我斜前面。」；選「我也想旁聽別的系。」→ SCE_AUDIT',has('……你也是法律系的。民總，你坐我斜前面。')&&whoOf('我叫蘇承恩。我在看社工系有什麼課可以旁聽。……嗯，對，法律系的跑來旁聽社工。')==='蘇承恩'&&has('……那你可以先來這一堂。週二下午，老師人很好，不會趕人。')&&H.G.flags.SCE_AUDIT===true,J(said()));
  fresh(TD('Y2S1',4,2),10.5,'soclib'); check('5. 蘇承恩：「民總，你坐我斜前面」＝祐廷大一才演',P().meetVersion(H.G,SC)===null);
  const d2=TD('Y1S2',3,2); fresh(d2,10.5,'soclib'); meet(SC); rel(SC,25,3); spawn(SC); await talk(SC,['好，我去']);
  const r=quest('PQ_SCE'), q=outing('ev_pool_sce_tutor');
  check('5. 蘇承恩 4-3 週六的課輔（大一下第 3～12 週、社科院、有點熟；邀你去活動）：「好，我去。」＝交換聯絡方式、掛事、排這個週六 10:00 社福中心',hasL(L(SC).ask[0])&&r.state==='open'&&INV.hasContact(H.G,SC)&&!!q&&q.day===TD('Y1S2',3,6)&&q.h===10,J([r,q&&keyOf(q.day)]));
  await go('ev_pool_sce_tutor',['有人幫忙','法律系也能站在那一邊']);
  check('5. 蘇承恩 課輔（2D，社福中心）：「法律可以保護我嗎？」選「有時候可以，有時候要有人幫忙。」→ SCE_KID help；走出中心＝秘密（「法律系也能站在那一邊。」→ SCE_LAW）；做完、人物頁',has('法律可以保護我嗎？')&&has('（你看向承恩。承恩小聲說：「我們。」）')&&H.G.flags.SCE_KID==='help'&&has('其實我家以前也被社工幫過。所以我想站在另一邊看看。')&&H.G.flags.SCE_LAW===true&&SOCIAL.has(SC,'SHARED_SECRET')&&r.state==='done'&&deeds(SC).includes('陪他去過週六的課輔'),J(said()));
  phAt(TD('Y2S2',2,1),21.1); const dbl=J(msgs(SC).slice(-2))===J(L(SC).double);
  phAt(D('2029-09-10'),21.1);
  check('5. 蘇承恩 大二下第 2 週「雙主修社工上了。」；4-6 結局（2029-09）：課輔答「要有人幫忙」＝help 版（AA_499 第 6 節第 5 點）',dbl&&msgs(SC).includes(L(SC).endHelp)&&!msgs(SC).includes(L(SC).endYes),J(msgs(SC)));
  /* 婉拒＝下個月第一週再問一次（只再問一次）*/
  fresh(d2,10.5,'soclib'); meet(SC); rel(SC,25,3); SOCIAL.remember(SC,'SHARED_SECRET',''); spawn(SC); await talk(SC,['我週六有事']);
  const re=P().rec(H.G).sceRe, no1=has('嗯，對。沒關係。……下個月還缺。')&&quest('PQ_SCE').state==='declined';
  await again(SC,['我週六有事'],re-1,10.5,'soclib'); const early=has(L(SC).ask[0].text);
  await again(SC,['我週六有事'],re,10.5,'soclib'); const ask2=has(L(SC).ask[0].text);
  const n2=S0=>CALENDAR.dateOf(S0); const nm=CALENDAR.dateOf(re), d0=CALENDAR.dateOf(d2);
  set(re+30,10.5); const third=(P().FLOW[SC][1].toString(),null); GM.npc={}; spawn(SC); await talk(SC,[]); const ask3=has(L(SC).ask[0].text);
  check('5. 蘇承恩「我週六有事。」→「……下個月還缺。」；下個月第一週（第一個週一）再問一次，只再問一次',no1&&!early&&ask2&&!ask3&&nm.wd===1&&nm.m===(d0.m%12)+1&&nm.d<=7,J([keyOf(re),early,ask2,ask3]));
  /* 4-5 大四下法律實習（AA_441）：實習那一句之後三次輪流 */
  const days=['2029-02-20','2029-02-27','2029-03-06','2029-03-20','2029-03-27','2029-04-10','2029-04-17','2029-04-24','2029-05-08','2029-05-15','2029-05-22','2029-05-29'];
  const run=async(met)=>{ fresh(D(days[0]),9,'campus'); if(met) meet(SC); const got=[]; for(const k of days){ set(D(k),9,'campus'); H.said=[]; const it={c:{id:'legal_practice',name:'法律實習'},key:'lp_'+k,room:{name:'法扶',bg:null},day:D(k),t0:9,t1:12}; await CLS.goOffsite(GM,it); const p=H.said.map(x=>x.t).find(t=>L(SC).practice.includes(t)); got.push(p?L(SC).practice.indexOf(p)+1:0); } return got; };
  const a=await run(true), b=await run(false);
  check('5. 蘇承恩 4-5 大四下法律實習：每週那一句之後，一學期三次輪流多一句承恩（第 3、7、11 次出席）；沒認識承恩不加',J(a)===J([0,0,1,0,0,0,2,0,0,0,3,0])&&b.every(x=>x===0),J([a,b])); });

/* ---------- 6 馬佳蓉（AA_499 第 5 節）---------- */
await sec('6 馬佳蓉',async()=>{ fresh(TD('Y1S1',1,1),10,'campus'); const a=ACTIVITIES.list.find(x=>x.id==='club_expo_y1s1'), ed=a?onDay(a,TD('Y1S1',1,1)-14):null;
  fresh(ed,(a.t0+a.t1)/2,'campus'); spawn(M);
  check('6. 馬佳蓉：認識前「和法服攤位那個人說話」（社團博覽會，法服的攤位）',GM.npc[M].name==='法服攤位那個人',GM.npc[M].name);
  await talk(M,[]);
  check('6. 馬佳蓉 5-1 認識（社團博覽會）：延長線、「……亮了。好。」、她說名字',has('同學，可以幫我拉一下嗎？插座在那棵樹後面，我一個人拉不到。')&&has('……亮了。好。')&&whoOf('馬佳蓉，法服管器材的。這條延長線比我資深。')==='馬佳蓉'&&SOCIAL.has(M,'FIRST_MET'),J(said()));
  const sat=(()=>{ for(let x=TD('Y1S1',3,6);x<TD('Y1S1',16,6);x+=7){ H.G.day=x; if(STORY.fafuDuty(H.G)) return x; } return null; })();
  fresh(sat,10,'wancai'); check('6. 馬佳蓉：值班的週六在萬才館＝稿沒有那裡的認識版本（不給說話按鈕）',!!P().ent(H.G,M)&&P().meetVersion(H.G,M)===null);
  /* 5-3 影印機（大一下第 12～15 週，值班的週六 12:00）*/
  const s=(()=>{ for(let x=TD('Y1S2',12,6);x<=TD('Y1S2',15,6);x+=7){ H.G.day=x; if(STORY.fafuDuty(H.G)) return x; } return null; })();
  fresh(s,12.1,'wancai'); meet(M); rel(M,25,3); const e=P().ent(H.G,M); spawn(M); await talk(M,['我幫妳搬']);
  check('6. 馬佳蓉 5-3 影印機（大一下第 12～15 週，值班的週六 12:00 在萬才館一樓）：開口；「我幫妳搬。」＝交換聯絡方式、搬（2D 法學院前庭）、人物頁、當場做完',!!e&&e.label==='萬才館一樓，值班結束'&&hasL(L(M).ask[0])&&has('……它活了。')&&H.G.flags.JR_COPIER===true&&INV.hasContact(H.G,M)&&deeds(M).includes('幫她搬過影印機')&&quest('PQ_JR').state==='done',J([e&&e.label,said()]));
  /* 法服值班時的旁白（三次一句）*/
  const tx=[]; for(let k=0;k<4;k++){ set(s+14*(k+1),9,'wancai'); H.said=[]; await PM().fafuExtra(GM,false); tx.push(H.said.length?H.said[0].t:''); }
  check('6. 馬佳蓉：搬過影印機＝之後法服值班偶爾旁白「（新的影印機在角落嗡嗡響。…）」（三次一句）；值班的包裝（STORY.fafuWatch、fafuShift）有接',J(tx)===J([L(M).copierDuty,'','',L(M).copierDuty])&&STORY._poolFafu===true,J(tx));
  fresh(s,12.1,'wancai'); meet(M); rel(M,25,3); meet(BH); spawn(M); await talk(M,['我等一下有事']);
  const no=has('好。我找柏翰。他會先算重量才肯搬。')&&quest('PQ_JR').state==='declined';
  set(s+2,12,'campus'); GM.npc={}; spawn(BH); await talk(BH,[]);
  check('6. 馬佳蓉「我等一下有事。」→ 她找柏翰；之後柏翰多一句閒聊「影印機二十七公斤。…」（大一下，一次）',no&&has(L(M).bhCopier),J(said()));
  /* 5-4 交接（大二下第 15 週，法服的）：「讓靖雯接吧。」→ 曾靖雯那一句閒聊（AA_499 第 6 節第 5 點）*/
  const hs=TD('Y2S2',15,6); fresh(hs,10,'wancai',{lawclub:true}); meet(M); rel(M,25,3); meet(ZJW); spawn(M); await talk(M,['讓靖雯接']);
  check('6. 馬佳蓉 5-4 交接（大二下第 15 週，祐廷是法服的，值班的週六）：「其實……當幹部是抽籤抽到的。…」（秘密）；認識曾靖雯多一個選項，選「讓靖雯接吧。」',STORY.fafuDuty(H.G)&&has('其實……當幹部是抽籤抽到的。可是我現在不想交出去了。')&&(H.opts[0]||[]).length===3&&has('靖雯……好。她倒水倒得很好，拉線應該也可以。')&&H.G.flags.JR_TO_ZJW===true&&SOCIAL.has(M,'SHARED_SECRET'),J([H.opts,said()]));
  set(TD('Y3S1',4,2),6.75,'campus'); rel(ZJW,25,3); SOCIAL.remember(ZJW,'SHARED_SECRET',''); markTalk(ZJW,'zjwHand'); GM.npc={}; spawn(ZJW); await talk(ZJW,[]);
  check('6. 馬佳蓉「讓靖雯接吧。」＝曾靖雯多一句閒聊「佳蓉學姊把器材組交給我了。延長線比我資深。」',has(L(M).zjwHand),J(said()));
  /* 「我接。」：房間物品、值班的旁白 */
  fresh(hs,10,'wancai',{lawclub:true}); meet(M); rel(M,25,3); spawn(M); await talk(M,['我接']); const items=STORY.roomItemList(H.G).map(x=>x[0]), took=has('（把一捆灰色的延長線放在你手上）這條比你資深。對它好一點。');
  const cd=[]; for(let k=0;k<4;k++){ set(TD('Y3S1',3,6)+14*k,9,'wancai'); H.said=[]; await PM().fafuExtra(GM,true); cd.push(H.said.length?H.said[0].t:''); }
  check('6. 馬佳蓉「我接。」→ 延長線放在你手上；房間物品「法服的延長線」；之後值班偶爾旁白「（你把延長線拉到插座，插好。）」',took&&H.G.flags.JR_HANDOVER===true&&items.includes('法服的延長線')&&cd[0]===L(M).cordDuty&&cd[3]===L(M).cordDuty&&cd[1]==='',J([items,cd]));
  /* 不是法服的：大二下第 15 週私訊；她畢業；2030 */
  fresh(hs-2,12,'campus'); meet(M); rel(M,25,3); INV.addContact(H.G,M); phAt(hs,20.1); const hm=J(msgs(M))===J(L(M).handMsg);
  phAt(TD('Y3S2',16,6),20.1); const gm=J(msgs(M).slice(-2))===J(L(M).grad); H.G.flags.JR_HANDOVER=true; phAt(D('2030-06-02'),20.1);
  check('6. 馬佳蓉：不是法服的＝大二下第 15 週私訊交接；她畢業那一週照片；2030 那兩則（JR_HANDOVER 多「延長線還在嗎？」）',hm&&gm&&J(msgs(M).slice(-3))===J(L(M).y2030.concat([L(M).y2030Cord])),J(msgs(M)));
  fresh(TD('Y2S2',9,2),12,'wancai'); meet(M); rel(M,25,3); spawn(M); await talk(M,[]); const gl=PM().genericLine(M);
  check('6. 馬佳蓉：沒到交接的（不是法服的）大二下第 8 週起秘密照一般的「其實……」（不加選項）',!!gl&&has(gl)&&SOCIAL.has(M,'SHARED_SECRET'),J(said())); });

/* ---------- 7 蔡宗霖（AA_500 第 1 節）---------- */
await sec('7 蔡宗霖',async()=>{ const d=TD('Y1S1',4,3); fresh(d,11,'library_hall'); spawn(TZ);
  check('7. 蔡宗霖：認識前「和常在圖書館的男生說話」（總圖二樓自習區，平日 10～17）',GM.npc[TZ].name==='常在圖書館的男生',GM.npc[TZ].name);
  await talk(TZ,[]);
  check('7. 蔡宗霖 1-1 認識：「學弟，你是大一的？……你看得懂這個嗎？」→ 說名字、「財金系的報告都在算錢…」',has('學弟，你是大一的？……你看得懂這個嗎？（他指著數字那一份）')&&whoOf('沒關係，我也看不太懂。蔡宗霖，大二，雙主修財金。')==='蔡宗霖'&&has('財金系的報告都在算錢，法律系的報告都在算誰要賠錢。差不多。'),J(said()));
  fresh(TD('Y2S1',4,3),11,'library_hall'); check('7. 蔡宗霖：「學弟，你是大一的？」＝祐廷大一才演',P().meetVersion(H.G,TZ)===null);
  fresh(TD('Y1S2',3,3),11,'library_hall'); meet(TZ); rel(TZ,25,3); spawn(TZ); await talk(TZ,[]); const w3=SOCIAL.has(TZ,'SHARED_SECRET');
  await again(TZ,['為什麼是日本'],TD('Y1S2',4,3),11,'library_hall');
  check('7. 蔡宗霖 秘密（大一下第 4 週起、有點熟；第 3 週還沒有）：「其實……我想去日本交換。」選「為什麼是日本？」→ TZL_WHY',!w3&&has('其實……我想去日本交換。')&&has('高中的時候看過一部日劇，裡面有一間很小的事務所。我一直想去看看。')&&H.G.flags.TZL_WHY===true,J(said()));
  INV.addContact(H.G,TZ); phAt(D('2027-03-20'),21.1);
  check('7. 蔡宗霖 大二下他在日本（3 月）：照片＋「找到了。…」；秘密選「為什麼是日本」多一句（AA_500 第 7 節第 5 點）',J(msgs(TZ))===J(L(TZ).jp1.concat([L(TZ).jp1Why])),J(msgs(TZ)));
  /* 1-3 二手書（大二上第 12～15 週，錄取交換以後）*/
  fresh(TD('Y2S1',12,3),11,'library_hall'); meet(TZ); rel(TZ,25,3); SOCIAL.remember(TZ,'SHARED_SECRET',''); meet('pool_1'); spawn(TZ); await talk(TZ,['我幫你搬']);
  const r=quest('PQ_TZL'), q=outing('ev_pool_tzl_books');
  check('7. 蔡宗霖 1-3 二手書（大二上第 12～15 週，總圖）：「我幫你搬。」＝交換聯絡方式、掛事、排這個週六 14:00 舊路書房',hasL(L(TZ).ask[0])&&r.state==='open'&&INV.hasContact(H.G,TZ)&&!!q&&wdOf(q.day)===6&&q.h===14,J([r,q&&keyOf(q.day)]));
  await go('ev_pool_tzl_books',[]);
  check('7. 蔡宗霖 寄賣（2D，舊路書房）：老闆寫價錢；認識林采潔＝采潔那四句；人物頁「幫他把書搬去寄賣」；做完',has('民總那本，我要。……裡面有畫線嗎？')&&has('那我更要。')&&H.G.flags.TZL_BOOKS===true&&deeds(TZ).includes('幫他把書搬去寄賣')&&r.state==='done',J(said()));
  fresh(TD('Y2S1',11,3),11,'library_hall'); meet(TZ); rel(TZ,25,3); SOCIAL.remember(TZ,'SHARED_SECRET',''); spawn(TZ); await talk(TZ,[]);
  check('7. 蔡宗霖：第 11 週還不問（第 12～15 週）',!quest('PQ_TZL').state&&!has(T(L(TZ).ask[0])));
  /* 畢業：臺灣當面、日本路線私訊 */
  fresh(TD('Y3S2',16,2),11,'library_hall'); meet(TZ); rel(TZ,25,3); SOCIAL.remember(TZ,'SHARED_SECRET',''); H.G.flags.TZL_CALC=true; spawn(TZ); await talk(TZ,[]);
  check('7. 蔡宗霖 1-5 畢業（2028-06 那一週，總圖）：最後一次在這張桌子；TZL_CALC 多「你大一說來得及。…」',has('最後一次在這張桌子。算一下，四年。')&&has('你大一說來得及。是來得及，只是最後一學期很慘。')&&P().did(H.G,'tzlGrad'),J(said()));
  fresh(TD('Y3S2',16,1),12,'campus',{EXCHANGE_ROUTE:'JP'}); meet(TZ); rel(TZ,25,3); INV.addContact(H.G,TZ); for(let x=TD('Y3S2',16,1);x<=TD('Y3S2',16,7);x++){ set(x,9); ph(); set(x,21.5); ph(); }
  check('7. 蔡宗霖 畢業：日本路線（祐廷在日本）＝私訊兩則',J(msgs(TZ))===J(L(TZ).gradJP),J(msgs(TZ))); });

/* ---------- 8 劉晏如（AA_500 第 2 節）---------- */
await sec('8 劉晏如',async()=>{ const d=TD('Y1S1',4,3); fresh(d,14,'cafe'); spawn(LY);
  check('8. 劉晏如：認識前「和抱著一疊講義的女生說話」（兩點半 Café，11～17）',GM.npc[LY].name==='抱著一疊講義的女生',GM.npc[LY].name);
  await talk(LY,[]);
  check('8. 劉晏如 2-1 Café 版：洋芋片、「劉晏如，大二。吉他社。我負責零食。」',has('學弟！你是法律系的對不對？你要不要吃？……我們吉他社的零食買太多了。')&&whoOf('劉晏如，大二。吉他社。我負責零食。')==='劉晏如'&&P().rec(H.G).mv[LY]==='meetCafe',J(said()));
  fresh(d,19.5,'wancai'); const v0=P().MEETV[LY](H.G,{}); ACTIVITIES.rec(H.G).att['club_guitar@'+d]={h:19,end:'in'}; const v1=P().MEETV[LY](H.G,{}); set(TD('Y2S1',4,1),19.5); const v2=P().MEETV[LY](H.G,{});
  check('8. 劉晏如 吉他社版（祐廷去過吉他社社課＝萬才館那一場是「新的！吃這個。…」）；沒去過的不演；大二不演（稿寫「大二」）',v0===null&&v1==='meetClub'&&v2===null,J([v0,v1,v2]));
  /* 2-3 蟑螂（大一下第 3～10 週，吉他社社課那天 18:45）*/
  const r3=TD('Y1S2',5,1); fresh(r3,18.8,'wancai'); meet(LY); rel(LY,25,3); meet(CX); const e=P().ent(H.G,LY); spawn(LY); await talk(LY,['我也怕']);
  check('8. 劉晏如 2-3 蟑螂（大一下、社課那天 18:45 萬才館一樓走廊、有點熟）：她背貼著牆、秘密在這裡說；選「我也怕蟑螂。」→ 晨希來開門（AA_500 第 7 節第 5 點）；記 LYR_ROACH',!!e&&e.label==='萬才館一樓走廊'&&has('其實我很怕蟑螂。子晴說她不怕，可是她在練團，叫不出來。')&&SOCIAL.has(LY,'SHARED_SECRET')&&has('（你們在走廊站了二十分鐘。最後是晨希來，直接開門走進去，出來的時候說：「沒有了。」）')&&H.G.flags.LYR_ROACH===true&&H.G.flags.LYR_CX===true,J(said()));
  fresh(r3,18.8,'wancai'); meet(LY); rel(LY,25,3); spawn(LY); await talk(LY,['我進去','出去了']);
  check('8. 劉晏如「我進去。」→ 2D 一場、「出去了。」→「這包給你。碎的。」；交換聯絡方式（「下次再有，我直接傳給你。」）；人物頁「幫她趕過社辦的蟑螂」；做完',has('這包給你。碎的。')&&has('下次再有，我直接傳給你。')&&INV.hasContact(H.G,LY)&&deeds(LY).includes('幫她趕過社辦的蟑螂')&&quest('PQ_LYR').state==='done'&&H.G.flags.LYR_ROACH===true,J(said()));
  phAt(TD('Y2S1',4,1),18.9);
  check('8. 劉晏如 大二上某一天 18:50 私訊（一次）：「又有一隻！！！」三則',J(msgs(LY))===J(L(LY).again),J(msgs(LY)));
  fresh(TD('Y1S2',5,2),18.8,'wancai'); meet(LY); rel(LY,25,3); check('8. 劉晏如：不是社課那天（週二）不在走廊等你',!P().ent(H.G,LY));
  /* 成發兩次的旁白 */
  const s1=STORY_EVENTS.find(x=>x.id==='ev_ziqing_show'), s2=STORY_EVENTS.find(x=>x.id==='ev_ziqing_show2');
  fresh(TD('Y1S2',14,6),14,'campus'); meet(LY); H.said=[]; H.picks=[]; await EVENTS.runLines(s1.dialogue,s1); const a1=has(L(LY).show1)&&idx('（全場笑。）')<idx(L(LY).show1);
  fresh(TD('Y2S2',14,6),14,'campus'); meet(LY); H.said=[]; H.picks=[]; await EVENTS.runLines(s2.dialogue,s2); const a2=has(L(LY).show2);
  fresh(TD('Y2S2',14,6),14,'campus'); H.said=[]; H.picks=[]; await EVENTS.runLines(s2.dialogue,s2); const a3=!has(L(LY).show2);
  check('8. 劉晏如 成發：大一下「（台下最後一排，晏如在發餅乾。）」（全場笑之後）；大二下「（晏如坐在台下第一排，沒有發零食。她在看晨希。）」；沒認識的不加',a1&&a2&&a3);
  /* 畢業 */
  fresh(TD('Y3S2',16,3),19,'wancai'); meet(LY); rel(LY,25,3); SOCIAL.remember(LY,'SHARED_SECRET',''); spawn(LY); await talk(LY,[]);
  check('8. 劉晏如 2-5 畢業（2028-06，萬才館一樓）：「最後一次來社辦。…」「我長大了。」',has('最後一次來社辦。我把冰箱清乾淨了，每一個角落。')&&has('我長大了。')&&P().did(H.G,'lyrGrad'),J(said()));
  fresh(TD('Y3S2',16,1),12,'campus',{EXCHANGE_ROUTE:'JP'}); meet(LY); rel(LY,25,3); INV.addContact(H.G,LY); for(let x=TD('Y3S2',16,1);x<=TD('Y3S2',16,7);x++){ set(x,9); ph(); set(x,21.5); ph(); }
  check('8. 劉晏如 畢業：日本路線＝私訊三則',J(msgs(LY))===J(L(LY).gradJP),J(msgs(LY))); });
function idx(t){ return H.said.findIndex(x=>x.t===t); }

/* ---------- 9 楊書豪（AA_500 第 3 節）---------- */
await sec('9 楊書豪',async()=>{ const d=TD('Y1S1',4,2); fresh(d,12.3,'campus'); spawn(SH);
  check('9. 楊書豪：認識前「和走路很快的男生說話」（椰林大道，平日 12～13）',GM.npc[SH].name==='走路很快的男生',GM.npc[SH].name);
  await talk(SH,[]);
  check('9. 楊書豪 3-1 認識：「學弟，現在幾點？…」→ 說名字、「下次辯論賽我當計時。…」',has('學弟，現在幾點？……十二點十四。好，我還有六分鐘。')&&whoOf('楊書豪，大二，辯論社。我去占位子，下午的比賽我計時。')==='楊書豪'&&has('下次辯論賽我當計時。……對，我每次都當計時。'),J(said()));
  const d2=TD('Y1S2',9,2); fresh(d2,12.3,'campus'); meet(SH); rel(SH,25,3); meet('yu'); H.G.flags.met_yu=true; spawn(SH); await talk(SH,['我去']);
  const r=quest('PQ_YSH'), q=outing('ev_pool_ysh_debate');
  check('9. 楊書豪 3-3 第一次上台（大一下第 8～12 週，椰林大道，有點熟）：二辯感冒、秘密在這裡說；「我去。」＝排這個週六 14:00 博雅 201',has('其實……我很怕上台。所以我一直當計時。')&&SOCIAL.has(SH,'SHARED_SECRET')&&r.state==='open'&&!!q&&wdOf(q.day)===6&&q.h===14&&!INV.hasContact(H.G,SH),J([r,q&&keyOf(q.day)]));
  await go('ev_pool_ysh_debate',['慢一點']);
  check('9. 楊書豪 社內賽（2D，博雅 201，沒有圖＝深色底）：選「（比一個「慢一點」的手勢）」→ YSH_UP slow；下台以後那兩句；交換聯絡方式、人物頁「看過他第一次上台」',has('（他放慢了。三分鐘講完，剛好。計時器響的時候，他已經坐下了。）')&&has('可是我講完了。')&&H.G.flags.YSH_UP==='slow'&&INV.hasContact(H.G,SH)&&deeds(SH).includes('看過他第一次上台')&&r.state==='done'&&OUT.bg('boya_201')==='dark',J(said()));
  phAt(TD('Y2S1',2,1),21.1); const ch=msgs(SH).includes(L(SH).chair);
  phAt(PM().yuQuitDay(),21.6);
  check('9. 楊書豪：大二上當社長那一則；Alison 退社那天（認識 Alison、有聯絡方式）兩則',ch&&J(msgs(SH).slice(-2))===J(L(SH).yuQuit),J(msgs(SH)));
  set(TD('Y3S2',16,2),12.5,'campus'); GM.npc={}; spawn(SH); await talk(SH,[]);
  check('9. 楊書豪 3-5 畢業（2028-06，博雅門口）：計時器交給學弟、「…四年，時間到。」；選「慢一點」的那一句（AA_500 第 7 節第 5 點）',has('辯論社的計時器，我交給學弟了。')&&has('慢一點。我後來每一場都這樣跟自己說。')&&!has('你那時候點頭，我現在上台前都會想到。')&&P().ent(H.G,SH).label==='博雅門口',J(said()));
  fresh(d2,12.3,'campus'); meet(SH); rel(SH,25,3); spawn(SH); await talk(SH,['那天我有事']);
  check('9. 楊書豪「那天我有事。」→「好。我自己去。」（秘密照樣說了）',has('好。我自己去。')&&SOCIAL.has(SH,'SHARED_SECRET')&&quest('PQ_YSH').state==='declined'); });

/* ---------- 10 葉晨希（AA_500 第 4 節）---------- */
await sec('10 葉晨希',async()=>{ const d=TD('Y1S1',4,1); fresh(d,19.5,'campus'); spawn(CX);
  check('10. 葉晨希：認識前「和背吉他袋的女生說話」（萬才館旁邊，週一、三 19～21）',GM.npc[CX].name==='背吉他袋的女生',GM.npc[CX].name);
  await talk(CX,[]);
  check('10. 葉晨希 4-1 認識：一直彈同兩個和弦、「……很難聽嗎？」→ 說名字、「……除了你。」',has('……很難聽嗎？')&&whoOf('葉晨希，大二。吉他社。萬才館那邊晚上很安靜，彈錯也沒人聽到。')==='葉晨希'&&has('……除了你。'),J(said()));
  /* 秘密「我幫妳打拍子。」→ 接 4-3；三個晚上 → YCX_BEAT → 兩次成發（AA_500 第 7 節第 5 點）*/
  fresh(TD('Y1S2',3,1),19.5,'campus'); meet(CX); rel(CX,25,3); spawn(CX); await talk(CX,['我幫妳打拍子','好']);
  const r=quest('PQ_YCX');
  check('10. 葉晨希 秘密「其實……我到現在還不會換和弦。」選「我幫妳打拍子。」→ 接 4-3 打拍子：「好。」＝掛事（週一、三 21:00 以後萬才館旁邊，三次）',has('其實……我到現在還不會換和弦。')&&hasL(L(CX).ask[1])&&r.state==='open'&&SOCIAL.has(CX,'SHARED_SECRET'),J(said()));
  const nights=[]; let x=TD('Y1S2',3,3); for(let k=0;k<6&&nights.length<3;k++,x+=(wdOf(x)===1?2:5)){ set(x,21.2,'campus'); GM.npc={}; const e=P().ent(H.G,CX); spawn(CX); await talk(CX,[]); if(H.said.some(s=>L(CX).beats.some(b=>b.some(l=>T(l)===s.t)))) nights.push([keyOf(x),!!e]); }
  check('10. 葉晨希 打拍子三個晚上（她在萬才館旁邊等）：第一次交換聯絡方式；三次做完＝YCX_BEAT、人物頁「幫她打過拍子」',nights.length===3&&nights.every(n=>n[1])&&INV.hasContact(H.G,CX)&&H.G.flags.YCX_BEAT===true&&r.state==='done'&&deeds(CX).includes('幫她打過拍子'),J(nights));
  const s1=STORY_EVENTS.find(e=>e.id==='ev_ziqing_show'), s2=STORY_EVENTS.find(e=>e.id==='ev_ziqing_show2');
  H.said=[]; await EVENTS.runLines(s1.dialogue,s1); const b1=has(L(CX).show1Beat[0])&&has(L(CX).show1Beat[1])&&!has(L(CX).show1No);
  H.said=[]; await EVENTS.runLines(s2.dialogue,s2); const b2=has(L(CX).show2Beat)&&!has(L(CX).show2No);
  H.said=[]; H.picks=[2]; await EVENTS.runLines(s1.dialogue,s1); const b3=H.G.flags.ZQ_SHOW==='half'&&!has(L(CX).show1Beat[0]);
  check('10. 葉晨希 兩次成發都是 YCX_BEAT 版（大一下「節目單的最後一個，是晨希。」、大二下「她沒有低頭看手。」）；成發先走的不看到',b1&&b2&&b3);
  fresh(TD('Y1S2',14,6),14,'campus'); meet(CX); H.said=[]; await EVENTS.runLines(s1.dialogue,s1); const n1=has(L(CX).show1No);
  fresh(TD('Y2S2',14,6),14,'campus'); meet(CX); H.said=[]; await EVENTS.runLines(s2.dialogue,s2);
  check('10. 葉晨希 沒打拍子的版本（節目單上沒有她／她低頭看了一下手）',n1&&has(L(CX).show2No));
  fresh(TD('Y3S2',16,1),19.5,'campus'); meet(CX); rel(CX,25,3); SOCIAL.remember(CX,'SHARED_SECRET',''); spawn(CX); await talk(CX,['好']);
  check('10. 葉晨希 4-4 畢業（她畢業那一週，萬才館旁邊）：她自己寫的歌、「……再一次？」',has('這首是我自己寫的。和弦，我現在都換得過去了。')&&has('（她從頭彈了一次。）')&&P().did(H.G,'ycxGrad'),J(said())); });

/* ---------- 11 游振宇（AA_500 第 5 節）---------- */
await sec('11 游振宇',async()=>{ const d=TD('Y1S1',4,2); fresh(d,10,'campus'); spawn(ZY);
  check('11. 游振宇：認識前「和騎腳踏車超快的男生說話」',GM.npc[ZY].name==='騎腳踏車超快的男生',GM.npc[ZY].name);
  await talk(ZY,[]); const walk=has('學弟！你的鞋帶掉了。')&&!has('學弟！你的車鈴掉了，在後面那邊。');
  fresh(d,10,'campus'); H.G.bike={zone:'campus',x:1,z:1}; spawn(ZY); await talk(ZY,[]);
  check('11. 游振宇 5-1 認識：祐廷騎車來的（車在旁邊）「學弟！你的車鈴掉了，…」；沒騎車的「學弟！你的鞋帶掉了。」；「……我先走了！」、三秒後騎回來',walk&&has('學弟！你的車鈴掉了，在後面那邊。')&&whoOf('游振宇，大二，腳踏車社。……我先走了！')==='游振宇'&&has('從校門騎到總圖，我的紀錄是一分四十秒。不要學，很危險。'),J(said()));
  /* 5-3 河堤夜騎（大一上第 8～15 週；沒有聯絡方式＝在校園當面）*/
  fresh(TD('Y1S1',8,2),10,'campus'); meet(ZY); spawn(ZY); await talk(ZY,['我去']); const q=outing('ev_pool_yzy_river');
  check('11. 游振宇 5-3 河堤夜騎（大一上第 8～15 週，邀你去社團；沒有聯絡方式＝在校園當面）：「我去。」＝這個週六 19:00',has('這週六晚上腳踏車社騎河堤！七點校門集合！來的話記得帶水')&&has('＊帶水跟外套 晚上很冷')&&!!q&&wdOf(q.day)===6&&q.h===19,J([said(),q&&keyOf(q.day)]));
  await go('ev_pool_yzy_river',[]);
  check('11. 游振宇 夜騎（2D，河濱）：「他沒有先走。…等最後一個人。」；YZY_RIDE、人物頁「跟腳踏車社騎過一次河堤」',has('（他沒有先走。他騎到橋頭，停下來，等最後一個人。）')&&H.G.flags.YZY_RIDE===true&&deeds(ZY).includes('跟腳踏車社騎過一次河堤'),J(said()));
  rel(ZY,25,3); await again(ZY,['我問你，你答'],TD('Y1S2',6,2),10,'campus');
  check('11. 游振宇 秘密（大一下第 6 週起）：「其實……我讀書很快，可是都記不住。」選「我問你，你答。」',has('其實……我讀書很快，可是都記不住。')&&H.G.flags.YZY_ASKME===true,J(said()));
  await again(ZY,['好'],TD('Y2S1',15,2),10,'campus'); const r=quest('PQ_YZY');
  check('11. 游振宇 5-4 問我問題（大二上期末前一週；選過「我問你，你答」在校園也開口）：「好。」→ 一個小時、「我會記得一輩子」；YZY_QUIZ；當場做完',has('……你剛剛問的那幾題，我會記得一輩子。')&&H.G.flags.YZY_QUIZ===true&&r.state==='done',J(said()));
  phAt(TD('Y2S1',15,3),21.1);
  check('11. 游振宇 考完那天晚上私訊兩則（含更正「＊考了三題」）（AA_500 第 7 節第 5 點）',J(msgs(ZY))===J(L(ZY).quizMsg),J(msgs(ZY)));
  /* 「這次不行。」＝下個月再邀一次（只再邀一次）*/
  fresh(TD('Y1S1',8,2),10,'campus'); meet(ZY); INV.addContact(H.G,ZY); phAt(TD('Y1S1',8,4),21.1); const m1=tagged('pool_yzy_ride_1').find(m=>m.ask);
  ans('pool_yzy_ride_1',1); const re=P().rec(H.G).yzyRe; let m2=null; for(let x=re;x<re+7&&!m2;x++){ if(wdOf(x)!==4) continue; phAt(x,21.1); m2=tagged('pool_yzy_ride_re').find(m=>m.ask); }
  ans('pool_yzy_ride_re',1); let m3=null; for(let x=re+7;x<re+40&&!m3;x++){ if(wdOf(x)!==4) continue; phAt(x,21.1); m3=(H.G.msgs||[]).filter(m=>/^pool_yzy_ride/.test(m.tag||'')).length>4; }
  check('11. 游振宇（有聯絡方式）週四 21:00 私訊邀；「這次不行。」→「好！下次！」；下個月再邀一次，只再邀一次',!!m1&&!!m2&&msgs(ZY).includes(L(ZY).rideNo)&&!m3,J(msgs(ZY)));
  fresh(TD('Y3S2',16,2),10,'campus'); meet(ZY); rel(ZY,25,3); SOCIAL.remember(ZY,'SHARED_SECRET',''); spawn(ZY); const e=P().ent(H.G,ZY); await talk(ZY,[]);
  check('11. 游振宇 5-5 畢業（2028-06，校門口，他牽著車）',!!e&&e.label==='校門口，牽著車'&&has('最後一次從校門騎到總圖。我沒有計時。')&&has('……好啦，我有計。比一分四十秒慢很多。我想慢慢騎。'),J(said())); });

/* ---------- 12 蕭乃文（AA_500 第 6 節）---------- */
await sec('12 蕭乃文',async()=>{ const d=TD('Y1S1',4,2); fresh(d,20,'library_b1'); spawn(NW);
  check('12. 蕭乃文：認識前「和筆記借人看的人說話」（總圖 B1，平日 19～22）',GM.npc[NW].name==='筆記借人看的人',GM.npc[NW].name);
  await talk(NW,['謝謝學姊']); const due=P().rec(H.G).nw&&P().rec(H.G).nw.due;
  check('12. 蕭乃文 6-1 認識：拍筆記、「週五以前還我。」、說名字；「謝謝學姊。」＝借到筆記（房間物品「乃文學姊的民總筆記」、有聯絡方式）、週五以前要還',has('我拍一下。……好。借你。週五以前還我。')&&whoOf('（在一本小本子上寫下你的名字和日期）蕭乃文，大二。')==='蕭乃文'&&INV.hasContact(H.G,NW)&&due===TD('Y1S1',4,5)&&STORY.roomItemList(H.G).some(x=>x[0]==='乃文學姊的民總筆記'),J([said(),due&&keyOf(due)]));
  phAt(due+1,9.1);
  check('12. 蕭乃文 晚還：週六 09:00 那三則（AA_500 第 7 節第 5 點）',J(msgs(NW))===J(L(NW).late),J(msgs(NW)));
  await again(NW,[],due+3,20,'library_b1');
  check('12. 蕭乃文：之後在 B1 還＝「下次準時，我會比較好睡。」；筆記不在房間了',has(L(NW).backLate)&&!has(L(NW).back)&&!STORY.roomItemList(H.G).some(x=>x[0]==='乃文學姊的民總筆記'),J(said()));
  /* 秘密（大一下第 8 週起，B1）*/
  rel(NW,25,3); await again(NW,['陪妳去散步'],TD('Y1S2',8,2),20,'library_b1');
  check('12. 蕭乃文 秘密：「其實……我很容易焦慮。」接原句「考前我都睡不著。…」、再三個選項（「我陪妳去散步？」→ NW_WALK）',has('其實……我很容易焦慮。')&&has('「考前我都睡不著。所以才一直寫筆記，寫下來比較不怕。」')&&H.G.flags.NW_WALK===true&&SOCIAL.has(NW,'SHARED_SECRET'),J(said()));
  /* 6-3 網拍（大二上第 5～9 週，週二 23:10）：選「阿凱」→ 一週以後那三則 */
  meet('kai'); let x=TD('Y2S1',5,2); phAt(x,23.2); const m=tagged('pool_nw_sold').find(q=>q.ask);
  check('12. 蕭乃文 6-3 筆記被拿去賣（大二上第 5 週週二 23:10，焦慮的時候一次傳很多則）：六則；回覆三個（認識阿凱多「阿凱也很常問這個。」）',J(msgs(NW).slice(-6))===J(L(NW).sold)&&!!m&&m.ask.opts.length===3,J(msgs(NW).slice(-6)));
  ans('pool_nw_sold',2); const after=msgs(NW).slice(-4);
  phAt(x+7,21.1);
  check('12. 蕭乃文 回「阿凱也很常問這個。」→ 她笑了；一週以後那三則（下架、學弟道歉、送他筆記）',H.G.flags.NW_SOLD==='laugh'&&after.includes('好，我笑了。我比較睡得著了。明天再處理。')&&J(msgs(NW).slice(-3))===J(L(NW).week),J(msgs(NW).slice(-7)));
  /* 6-4 畢業的登記簿 */
  fresh(TD('Y3S2',16,2),20,'library_b1'); meet(NW); rel(NW,25,3); SOCIAL.remember(NW,'SHARED_SECRET',''); H.G.flags.NW_WALK=true; spawn(NW); await talk(NW,[]);
  check('12. 蕭乃文 6-4 畢業（2028-06，B1）：登記簿第三本給你；NW_WALK 多「去總圖外面繞一圈」；房間物品「乃文學姊的借閱登記簿」',has('登記簿第三本。前兩本我留著，這本給你。')&&has('還有，考前睡不著的話，去總圖外面繞一圈。有用。')&&STORY.roomItemList(H.G).some(x=>x[0]==='乃文學姊的借閱登記簿'&&J(x[1])===J(L(NW).bookLook)),J(said()));
  fresh(TD('Y3S2',16,1),12,'campus',{EXCHANGE_ROUTE:'JP'}); meet(NW); rel(NW,25,3); INV.addContact(H.G,NW); for(let y=TD('Y3S2',16,1);y<=TD('Y3S2',16,7);y++){ set(y,9); ph(); set(y,21.5); ph(); }
  const jp=J(msgs(NW))===J(L(NW).gradJP); set(D('2028-08-10'),20,'library_b1'); const back=EVENTS.check(PM().COUNTER_EV); H.said=[]; if(back) await EVENTS.run(PM().COUNTER_EV);
  check('12. 蕭乃文 日本路線：畢業私訊兩則；回國以後第一次到 B1＝櫃台的登記簿（旁白），房間物品',jp&&back&&has(L(NW).counter)&&H.G.flags.NW_BOOK===true&&!EVENTS.check(PM().COUNTER_EV),J([msgs(NW),said()])); });

/* ---------- 13 洪珮瑜（AA_501 第 1 節）---------- */
await sec('13 洪珮瑜',async()=>{ const d=TD('Y1S1',4,2); fresh(d,14,'library'); spawn(PY);
  check('13. 洪珮瑜：認識前「和坐窗邊的人說話」（總圖三樓窗邊，平日 13～17）',GM.npc[PY].name==='坐窗邊的人',GM.npc[PY].name);
  await talk(PY,[]);
  check('13. 洪珮瑜 1-1 認識：「學弟，你要坐這裡嗎？……很曬喔。…」→ 說名字',has('學弟，你要坐這裡嗎？……很曬喔。窗邊這個位子下午很曬，可是我還是會坐這裡。')&&whoOf('洪珮瑜，大三。你在找位子的話，旁邊那個不曬。')==='洪珮瑜',J(said()));
  const d2=TD('Y1S2',4,3); fresh(d2,14,'library'); meet(PY); rel(PY,25,3); spawn(PY); await talk(PY,['說吧','錢呢']);
  check('13. 洪珮瑜 1-3 當一次她媽媽（大一下第 3～8 週，總圖三樓，秘密在這裡說）：「好。……說吧。」→ 2D 總圖外面的長椅；選「錢呢？」→ 算好的紙、「我存了一半。…」；交換聯絡方式、人物頁、當場做完',SOCIAL.has(PY,'SHARED_SECRET')&&has('（她拿出一張紙，上面算好了學費和生活費。你看了一下，比你想的多。）')&&has('週末講完，我跟你說結果。')&&H.G.flags.HPY_MOM==='money'&&INV.hasContact(H.G,PY)&&deeds(PY).includes('幫她練習怎麼跟媽媽說')&&quest('PQ_HPY').state==='done',J(said()));
  let sun=d2; while(wdOf(sun)!==0) sun++; phAt(sun,22.1);
  check('13. 洪珮瑜 週日 22:00：「講了。」＋money 版（AA_501 第 5 節第 6 點）',J(msgs(PY))===J([L(PY).told,L(PY).toldMoney]),J(msgs(PY)));
  phAt(D('2027-03-12'),21.1); const ad=msgs(PY).includes(L(PY).admit);
  phAt(D('2027-12-10'),1.1); const uk=tagged('pool_hpy_uk'), q1=uk.find(m=>m.ask);
  check('13. 洪珮瑜 2027-03「上了！英國」；2027-12 英國下午（臺灣凌晨一點）：沒有芷若的版本＝一則、回覆只有照片那一個',ad&&uk.length===1&&uk[0].text===L(PY).uk&&!!q1&&q1.ask.opts.length===1&&q1.ask.opts[0].t===L(PY).ukOpts[1][0],J(uk.map(m=>m.text)));
  /* 芷若在英國（條件：認識、朋友以上、她那時候在英國）*/
  const zr0=PM().zrUK; PM().zrUK=()=>true; fresh(D('2027-12-08'),12,'campus'); meet(PY); rel(PY,25,3); INV.addContact(H.G,PY); meet('heroine_02'); H.G.flags.met_heroine_02=true; H.FRIEND('heroine_02'); phAt(D('2027-12-10'),1.1); PM().zrUK=zr0;
  const uk2=tagged('pool_hpy_uk'), q2=uk2.find(m=>m.ask);
  check('13. 洪珮瑜 芷若在英國的那一則（認識芷若、朋友以上、芷若那時候在英國）：多兩則、回覆多「那是芷若。」',uk2.length===3&&uk2[1].text===L(PY).ukZr[0]&&!!q2&&q2.ask.opts.length===2&&q2.ask.opts[0].t==='那是芷若。',J(uk2.map(m=>m.text)));
  /* 「我演不好啦。」：沒有聯絡方式＝下一次在總圖當面 */
  fresh(d2,14,'library'); meet(PY); rel(PY,25,3); spawn(PY); await talk(PY,['我演不好啦']); const no=has('……嗯。那我對著鏡子練。')&&!INV.hasContact(H.G,PY);
  let s2=d2; while(wdOf(s2)!==0) s2++; await again(PY,[],s2+1,14,'library');
  check('13. 洪珮瑜「我演不好啦。」→ 她對著鏡子練；週日以後下一次在總圖當面「講了。她第一句問：那裡冷不冷。」',no&&has(L(PY).toldNo),J(said()));
  fresh(TD('Y2S2',16,2),14,'library'); meet(PY); rel(PY,25,3); SOCIAL.remember(PY,'SHARED_SECRET',''); spawn(PY); await talk(PY,[]);
  check('13. 洪珮瑜 1-5 畢業（2027-06，總圖三樓）：「這個位子，留給你。……很曬喔。」',has('這個位子，留給你。……很曬喔。')&&P().did(H.G,'hpyGrad'),J(said())); });

/* ---------- 14 施孟儒（AA_501 第 2 節）---------- */
await sec('14 施孟儒',async()=>{ const d=TD('Y1S1',4,5); fresh(d,17.5,'campus'); spawn(MR);
  check('14. 施孟儒：認識前「和總是穿系服的人說話」（醉月湖東側的籃球場，週五 17～19）',GM.npc[MR].name==='總是穿系服的人',GM.npc[MR].name);
  await talk(MR,[]);
  check('14. 施孟儒 2-1 認識：「學弟，你來看球的？……水夠嗎？拿一瓶。」→ 說名字',has('學弟，你來看球的？……水夠嗎？拿一瓶。')&&whoOf('施孟儒，大三，系籃經理。系籃的水是我買的，毛巾是我洗的，比分是我記的。球是他們打的。')==='施孟儒',J(said()));
  /* 秘密「我幫你佔一次。」→ 2-3 早上六點的球場 → 阿哲那一句（AA_501 第 5 節第 6 點）*/
  const d2=TD('Y1S2',4,5); fresh(d2,17.5,'campus'); meet(MR); rel(MR,25,3); spawn(MR); await talk(MR,['我幫你佔一次','好']);
  const r=quest('PQ_SMR');
  check('14. 施孟儒 秘密（大一下第 4 週起，球場）：「其實……我常常翹課。」選「我幫你佔一次。」→ 接 2-3：「好。」＝掛事（下週五早上六點）',has('其實……我常常翹課。')&&has('……真的？那這週五早上六點。')&&r.state==='open'&&r.day0===d2+7&&SOCIAL.has(MR,'SHARED_SECRET'),J([r,said()]));
  H.G.flags.ZHE_CALLS_GE=true; set(r.day0,6.1,'campus'); E.player.obj.position={x:-4,y:0,z:-112}; GM.npc={}; const ev=P().AUTO.map(f=>f(GM)).find(Boolean);
  H.said=[]; if(ev) await EVENTS.run(ev);
  check('14. 施孟儒 那個週五 06:00～06:30 到球場（醉月湖東側）＝早上六點的球場：系服外套、七點阿哲「哥……你六點就在這裡？」（ZHE_CALLS_GE）；交換聯絡方式、做完、時間到 07:00',!!ev&&ev.id==='ev_pool_smr_court'&&has('哥……你六點就在這裡？')&&!has('……你六點就在這裡？')&&INV.hasContact(H.G,MR)&&r.state==='done'&&deeds(MR).includes('幫系籃佔過一次早上的球場')&&H.G.hour>6.99,J([ev&&ev.id,said(),H.G.hour]));
  set(r.day0,12.1); ph();
  check('14. 施孟儒 考完那天中午：一行三樣、分三則',J(msgs(MR))===J(L(MR).courtMsg),J(msgs(MR)));
  /* 系籃三場各選一次不同的選項 */
  const games=['ev_zhe_game_y1','ev_zhe_game_y2','ev_zhe_game_y2s2'].map(id=>STORY_EVENTS.find(e=>e.id===id)), got=[];
  for(let k=0;k<3;k++){ H.said=[]; H.picks=[k]; await EVENTS.runLines(games[k].dialogue,games[k]); got.push(['clap','score','water'].find(x=>has(L(MR).game[x]))||null); }
  H.said=[]; H.picks=[0]; await EVENTS.runLines(games[0].dialogue,games[0]); const agn=has(L(MR).gameAgain);
  check('14. 施孟儒 2-4 系籃比賽三場（大一下、大二上、大二下）各選一次不同的選項：拍手、記分、送水他各多一句；同一個選項第二次＝比讚',J(got)===J(['clap','score','water'])&&agn,J(got));
  /* 畢業「我拿。」→ 記分板物品、之後的「記分」旁白 */
  set(TD('Y2S2',16,5),17.5,'campus'); GM.npc={}; spawn(MR); await talk(MR,['我拿']); const items=STORY.roomItemList(H.G).map(x=>x[0]), gl=has('經理的東西，總要交給一個人。')&&has('（把記分板放在你手上）少一個「7」。你自己想辦法。');
  const y4=STORY_EVENTS.find(e=>e.id==='ev_last_game_y4'); const si=y4.dialogue.findIndex(l=>l&&l.label==='s'); H.said=[]; H.picks=[]; await EVENTS.runLines(y4.dialogue.slice(si),y4);
  check('14. 施孟儒 2-5 畢業（2027-06 那一週的週五，球場）：「經理的東西，總要交給一個人。」選「我拿。」→ SMR_BOARD、房間物品「系籃的記分板」；大四下那一場「記分」的旁白換成「（你翻出那塊記分板。7 還是貼著紙。）」',gl&&H.G.flags.SMR_BOARD===true&&items.includes('系籃的記分板')&&has(L(MR).boardGame)&&y4.dialogue.some(l=>l&&l.text===L(MR).gameY4),J([items,said()]));
  set(D('2027-12-10'),22); PHONE.join(H.G,'noodle_team','麵店團'); meet('zhe'); phAt(D('2027-12-11'),21.1); const g=tagged('pool_smr_grp');
  check('14. 施孟儒 2027-12 麵店團群組：阿哲轉貼孟儒學長的照片（三則）',g.length===3&&g.every(m=>m.from==='zhe'&&m.th==='g:noodle_team')&&g[1].text===L(MR).grp[1],J(g.map(m=>m.text)));
  const cap=STORY_EVENTS.find(e=>e.id==='ev_zhe_captain'); fresh(D('2027-09-10'),18,'campus'); H.G.flags.SMR_TO='zhe'; H.said=[]; H.picks=[0]; await EVENTS.runLines(cap.dialogue,cap);
  check('14. 施孟儒 畢業選「交給阿哲吧。」＝哲 3（2027-09-10 當上隊長）阿哲多一句',has(L(MR).zheCaptain),J(said().slice(0,6))); });

/* ---------- 15 廖芸萱（AA_501 第 3 節）---------- */
await sec('15 廖芸萱',async()=>{ const d=TD('Y1S1',4,2); fresh(d,14,'campus'); meet(PS); spawn(YX,-25,-12.94); spawn(PS,-24,-12.94);
  await talk(YX,['先問為什麼']);
  check('15. 廖芸萱 3-1 沛珊介紹的認識（認識沛珊、週二／四下午沛珊在旁邊）：「……啊，祐廷。這是芸萱學姊，我們同一堂哲學課。」→「你好。那如果……」；「先問為什麼。」→「……你很適合來旁聽。」；說名字',has('……啊，祐廷。這是芸萱學姊，我們同一堂哲學課。')&&has('你好。那如果……我問你一個問題，你會先回答，還是先問我為什麼問？')&&has('……你很適合來旁聽。')&&has('廖芸萱，大三。在哲學系旁聽。')&&P().rec(H.G).mv[YX]==='meetPS',J(said()));
  fresh(TD('Y1S1',4,1),14,'campus'); spawn(YX,-25,-12.94); check('15. 廖芸萱：認識前「和很會問問題的女生說話」',GM.npc[YX].name==='很會問問題的女生',GM.npc[YX].name);
  await talk(YX,['看是什麼問題']);
  check('15. 廖芸萱 沒有沛珊的：「學弟。那如果……」→「法律系的回答。」',has('學弟。那如果……我問你一個問題，你會先回答，還是先問我為什麼問？')&&has('法律系的回答。')&&!has('……啊，祐廷。這是芸萱學姊，我們同一堂哲學課。')&&P().rec(H.G).mv[YX]==='meetAlone',J(said()));
  rel(YX,25,3); await again(YX,['那就轉啊'],TD('Y1S2',10,2),14,'campus');
  check('15. 廖芸萱 秘密（大一下第 10 週起，文學院）：「其實……我想過要轉去哲學系。」選「那就轉啊。」→ LYX_GO',has('其實……我想過要轉去哲學系。')&&H.G.flags.LYX_GO===true,J(said()));
  await again(YX,['我去'],TD('Y1S2',12,2),14,'campus'); const q=outing('ev_pool_lyx_cafe');
  check('15. 廖芸萱 3-3 哲學咖啡館（大一下第 12～15 週，沒有聯絡方式＝文學院當面）：三句、「我去。」＝週四 19:00 文學院的教室',has('這週的題目是：如果規定本身錯了，你還要遵守嗎？')&&!!q&&wdOf(q.day)===4&&q.h===19,J([said(),q&&keyOf(q.day)]));
  meet(PS); await go('ev_pool_lyx_cafe',['要遵守']);
  check('15. 廖芸萱 哲學咖啡館（2D，沒有圖＝深色底）：認識沛珊、沛珊在臺北＝旁白多「（沛珊坐在你的斜對面，…）」；選「要遵守，然後用規定的方法去改它。」；LYX_CAFE、交換聯絡方式、人物頁',has('（沛珊坐在你的斜對面，每個人講完，她都在本子上寫一行。）')&&has('（安靜了五秒。她看起來很開心。）')&&H.G.flags.LYX_CAFE===true&&INV.hasContact(H.G,YX)&&deeds(YX).includes('跟她去過哲學咖啡館'),J(said()));
  set(TD('Y2S2',16,2),14,'campus'); GM.npc={}; spawn(YX,-25,-12.94); await talk(YX,[]); const items=STORY.roomItemList(H.G).map(x=>x[0]);
  check('15. 廖芸萱 3-4 畢業（2027-06，文學院長椅）：「我最後沒轉系。」＋LYX_GO 那一句；房間物品「芸萱學姊的轉系申請表」（AA_501 第 5 節第 6 點）',has('我最後沒轉系。')&&has('你叫我轉。我差一點就轉了。申請表還夾在講義裡，送你。')&&items.includes('芸萱學姊的轉系申請表'),J([items,said()]));
  phAt(D('2028-04-12'),21.1); check('15. 廖芸萱 2028-04（有聯絡方式）兩則',J(msgs(YX).slice(-2))===J(L(YX).y2028),J(msgs(YX)));
  fresh(TD('Y1S2',12,1),20,'campus'); meet(YX); rel(YX,25,3); INV.addContact(H.G,YX); phAt(TD('Y1S2',12,3),21.1);
  check('15. 廖芸萱 有聯絡方式＝週三 21:00 私訊三則邀你',J(msgs(YX).slice(-3))===J(L(YX).invite)&&tagged('pool_lyx_invite').some(m=>m.ask),J(msgs(YX))); });

/* ---------- 16 嚴守誠（AA_501 第 4 節）---------- */
await sec('16 嚴守誠',async()=>{ const d=TD('Y1S1',4,2); fresh(d,14,'library'); spawn(YS);
  check('16. 嚴守誠：認識前「和愛睡覺的男生說話」（總圖三樓，平日 13～15）',GM.npc[YS].name==='愛睡覺的男生',GM.npc[YS].name);
  await talk(YS,[]);
  check('16. 嚴守誠 4-1 認識：外套下面「……學弟，幾點了？」、「還早。我晚上才開機。」→ 說名字',has('……學弟，幾點了？')&&has('還早。我晚上才開機。')&&whoOf('嚴守誠，大三。早上的課我都坐最後一排。前二十分鐘，我還在開機。')==='嚴守誠',J(said()));
  /* 4-3 半夜的讀書會 →「誰講給你聽？」→ 期末前一晚 → 2027-12 多一則（AA_501 第 5 節第 6 點）*/
  await again(YS,['我去'],TD('Y1S1',14,2),14,'library'); const q=outing('ev_pool_ysc_night');
  check('16. 嚴守誠 4-3 半夜的刑法讀書會（大一上第 14～16 週；沒有聯絡方式＝總圖當面）：「我去。」＝今天 23:00 總圖 B1',has('我今天晚上十一點在 B1 講刑法。不收錢。想來就來')&&!!q&&q.day===TD('Y1S1',14,2)&&q.h===23,J([said(),q&&q.h]));
  await go('ev_pool_ysc_night',['對乙未遂','誰講給你聽']);
  check('16. 嚴守誠 讀書會（2D，B1）：咖啡下藥那一題；講到凌晨一點、秘密在這裡說；選「那你考試那天，誰講給你聽？」→ YSC_RETURN；交換聯絡方式、人物頁',has('……好。你會。')&&has('其實……大家說我刑法很強。可是我每次考前都怕得要命。')&&SOCIAL.has(YS,'SHARED_SECRET')&&H.G.flags.YSC_RETURN===true&&INV.hasContact(H.G,YS)&&deeds(YS).includes('去過他半夜的刑法讀書會'),J(said()));
  const eve=TD('Y1S2',16,1)-1; phAt(eve,23.1); const m=tagged('pool_ysc_ret').find(x=>x.ask);
  check('16. 嚴守誠 4-4 大一下期末前一晚 23:00：「明天考刑法分則」「學弟，你來 B1 聽我講一次」',J(msgs(YS).slice(-2))===J(L(YS).ret)&&!!m,J(msgs(YS)));
  ans('pool_ysc_ret',0); await go('ev_pool_ysc_listen',[]);
  check('16. 嚴守誠 換你聽他講（2D，B1）：「學弟，你剛剛有一半在打瞌睡。」；YSC_LISTENED',has('學弟，你剛剛有一半在打瞌睡。')&&H.G.flags.YSC_LISTENED===true,J(said()));
  set(TD('Y2S2',16,2),14,'library'); E.interactables=[]; P().populate('library',GM); const it=E.interactables.find(x=>x.label==='看桌上的紙條'&&x.poolAct==='yscNote');
  const vis=!!it&&!it.hidden; H.said=[]; if(it) await STORY.interact(it,GM); set(TD('Y2S2',15,2),14); const hid=!!it&&it.hidden;
  check('16. 嚴守誠 4-5 畢業那一週（2027-06），總圖三樓那張桌子上的紙條（看）；別週沒有',vis&&has(L(YS).note)&&hid,J(said()));
  phAt(D('2027-12-17'),20.1);
  check('16. 嚴守誠 2027-12 國考放榜：「上了」兩則＋聽過他講的多一則',J(msgs(YS).slice(-3))===J(L(YS).exam.concat([L(YS).examListened])),J(msgs(YS)));
  fresh(TD('Y1S1',14,1),20,'library'); meet(YS); INV.addContact(H.G,YS); phAt(TD('Y1S1',14,1),23.1);
  check('16. 嚴守誠 有聯絡方式＝週一 23:00 私訊邀（兩則）',J(msgs(YS).slice(-2))===J(L(YS).invite)&&tagged('pool_ysc_invite').some(x=>x.ask),J(msgs(YS))); });

/* ---------- 17 女主角的圈子介紹 ---------- */
await sec('17 圈子',async()=>{ const R=id=>HCIRCLE.row(id);
  const find=(r,zone,h)=>{ const T0=CALENDAR.termDays('Y1S1'); for(let x=T0.from;x<=T0.to;x++){ fresh(x,h,zone); if(HCIRCLE.on(r,H.G,zone)) return x; } return null; };
  /* 吉他社（c503_7_1）：子晴、晏如、晨希 */
  const r=R('c503_7_1'), d=find(r,'wancai',19.5);
  fresh(d,19.5,'wancai'); H.FRIEND('heroine_04'); SOCIAL.meet('heroine_04','wancai'); const zq=spawn('heroine_04',-3,3.6), yr=spawn(LY,-2.1,3.6), cx=spawn(CX,-3.9,3.6); E.player.obj.position={x:-3,y:0,z:5};
  P().syncTalk(H.G,LY,yr); const hid0=yr.talk===null, nm0=SOCIAL.npcName(LY);
  H.said=[]; H.picks=[]; await HCIRCLE.before(GM,'heroine_04',zq); P().syncTalk(H.G,LY,yr);
  check('17. 子晴的吉他社（AA_503 7-1）：晏如、晨希被介紹＝認識（FIRST_MET）、他那條線「認識」那一段（熟悉＋3）、名字從外觀描述換成名字、晏如原本沒有那裡的認識版本（沒有按鈕）→ 按鈕回來',!!d&&hid0&&nm0!=='劉晏如'&&SOCIAL.has(LY,'FIRST_MET')&&SOCIAL.has(CX,'FIRST_MET')&&(P().rec(H.G).seg[LY]||{}).meet===d&&(P().rec(H.G).seg[CX]||{}).meet===d&&SOCIAL.npcName(LY)==='劉晏如'&&!!yr.talk,J({d:d&&keyOf(d),hid0,nm0,seg:P().rec(H.G).seg}));
  await talk(LY,[]); const a=said(); await talk(CX,[]); const b=said();
  check('17. 之後找晏如、晨希：不再演他們自己的認識那一場（沒有「新的！吃這個。…」「……很難聽嗎？」），直接閒聊',!a.some(s=>/新的！吃這個|劉晏如，大二/.test(s))&&!b.some(s=>/很難聽嗎|葉晨希，大二/.test(s))&&a.some(s=>s.includes('「社辦的吉他有一把斷了一根弦，大家都假裝沒看到。」'))&&b.some(s=>s.includes('「吉他袋很重。可是背著它走在路上，會覺得自己很會彈。」')),J([a,b]));
  /* 沛珊（c503_10_1）：芸萱 */
  const r2=R('c503_10_1'), d2=find(r2,'campus',14);
  fresh(d2,14,'campus'); H.FRIEND(PS); SOCIAL.meet(PS,'campus'); const ps=spawn(PS,-24,-12.94), yx=spawn(YX,-25,-12.94); E.player.obj.position={x:-24,y:0,z:-11};
  H.said=[]; H.picks=[]; await HCIRCLE.before(GM,PS,ps); P().syncTalk(H.G,YX,yx);
  check('17. 沛珊（AA_503 10-1）：芸萱被介紹＝認識、他那條線「認識」那一段、名字',!!d2&&SOCIAL.has(YX,'FIRST_MET')&&(P().rec(H.G).seg[YX]||{}).meet===d2&&SOCIAL.npcName(YX)==='廖芸萱'&&!!yx.talk,J({d2:d2&&keyOf(d2)}));
  await talk(YX,[]);
  check('17. 之後找芸萱：不演沛珊介紹的那一場、也不演自己的那一場（沒有「那如果……我問你一個問題」），直接閒聊',!H.said.some(s=>/我問你一個問題|廖芸萱，大三/.test(s.t))&&has('「哲學系的課上了一學期，我學到的是：問題比答案多。」'),J(said())); });

/* ---------- 18 共同的 ---------- */
await sec('18 共同',async()=>{ /* 晨希的錄音（閒聊型）：一個月最多一則、考試週不送 */
  const d0=TD('Y1S2',12,1); fresh(d0,21.5,'campus'); meet(CX); INV.addContact(H.G,CX); H.G.flags.YCX_BEAT=true; P().rec(H.G).ycxBeat=d0;
  for(let x=d0;x<d0+150;x++){ const w=wdOf(x); if(w!==1&&w!==3) continue; set(x,21.5); ph(); set(x,22.2); ph(); }
  const rec=(H.G.msgs||[]).filter(m=>m.th==='p:'+CX&&m.text==='（錄音 0:40）'), days=rec.map(m=>m.day);
  check('18. 葉晨希的錄音（打拍子以後偶爾一段，沒有字）：閒聊型（AA_498 2-7）——一個月最多一則、二十位加起來一週一則、考試週不送',rec.length>=2&&days.every((x,i)=>i===0||x-days[i-1]>=30)&&rec.every(m=>J(m.fold)===J(L(CX).rec.fold))&&days.every(x=>{ const t=CALENDAR.termOf(x); return !(t&&t.exam); }),J(days.map(keyOf)));
  /* 關係上限：何宇軒走完線＝朋友、沒有戀愛、人物頁照 personality */
  const d=TD('Y1S1',4,2); fresh(d,14.5,'library'); spawn(HX); await talk(HX,[0]);
  for(let k=1;k<=10;k++){ set(d+k*7,14.5,'library'); GM.npc={}; spawn(HX); await talk(HX,[]); }
  await again(HX,['你想研究什麼'],TD('Y1S2',6,2),14.5,'library'); const before=SOCIAL.stage(HX);
  await again(HX,['我陪你去'],TD('Y2S1',4,1),14.5,'library'); await go('ev_pool_hyx_office',[]);
  phAt(TD('Y3S1',3,1),21.1); ans('pool_hyx_y3',0); await go('ev_pool_hyx_cases',[0]);
  set(D('2028-10-26'),9,'linze'); GM.npc={}; spawn(HX); spawn(BH); await talk(HX,[]); phAt(D('2028-11-23'),16.1); ph(); SOCIAL.talkedTo(HX);
  const r=SOCIAL.rel(HX);
  check('18. 關係上限（AA_498 2-8）：何宇軒做完兩件順手的事、走完線＝朋友；做完以前還不是；不會有戀愛（npcRom、rom 都沒加）；升到朋友＝人物頁照 personality',SOCIAL.stage(HX)==='FRIEND'&&before!=='FRIEND'&&r.npcRom===0&&r.rom===0&&P().pageDesc(HX)==='什麼都要問為什麼，想做研究',SOCIAL.stage(HX)+' '+J(r)+' before '+before);
  /* 順手的事和店員的一起算（SIDEQ.MAX）*/
  fresh(TD('Y2S1',4,1),14.5,'library'); meet(HX); rel(HX,25,3); SOCIAL.remember(HX,'SHARED_SECRET',''); SIDEQ.rec(H.G).SQ01={state:'open',step:'wait',day:H.G.day,term:'Y2S1'}; SIDEQ.rec(H.G).SQ03={state:'open',step:'x',day:H.G.day,term:'Y2S1'}; spawn(HX); await talk(HX,[0]);
  check('18. 同時最多兩則（SIDEQ.MAX）跟店員的一起算：已經掛了兩則，宇軒不開口',!SIDEQ.get(H.G,'PQ_HYX1')&&!hasL(L(HX).ask[0]),J(said()));
  /* 舊存檔：說過秘密（舊的「其實……」）的第二～四批＝不重問、記成「沒選」；改過的原句照算說過 */
  const old={social:{mem:{pool_13:[{tag:'SHARED_SECRET',note:''}],pool_18:[{tag:'FIRST_MET',note:''},{tag:'SHARED_SECRET',note:''}]}},flags:{}};
  const n=P().migrate(old);
  check('18. 舊存檔（AA_498 2-10）：說過秘密的第二～四批（徐靜儀、嚴守誠）記成「沒選」（不重問）',n===2&&old.pool.secret.pool_13==='none'&&old.pool.secret.pool_18==='none',J(old.pool));
  const NEWL='「週五我在那間暖場，也幫宥辰搬音響。」'; fresh(TD('Y1S1',6,5),21,'gongguan'); meet(LQ); said1(LQ).once={'「有人說我混音太吵。他說得對，可是我不改。」':true}; const n1=(P().nextLine(H.G,LQ)||{}).t;
  said1(LQ).once['「週五晚上公館那間，我偶爾去幫忙搬音響。」']=true; const n2=(P().nextLine(H.G,LQ)||{}).t;
  check('18. 舊存檔：詹立群改過的那一句（AA_499 3-2，原句「週五晚上公館那間…」改成「週五我在那間暖場…」）——新局照說新的；舊存檔說過舊的＝照算說過（不再說新的那一句）',n1===NEWL&&n2!==NEWL,J([n1,n2])); });
H.done();
}
main();
