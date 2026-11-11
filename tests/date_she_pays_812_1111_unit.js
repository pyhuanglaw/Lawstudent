// AA_812（2026-11-11，企劃線 f1fab0ec6；DLG-FULL-REVIEW-1110 小項，使用者 X324）：約會她請客（SHE_PAYS_add）、平分（SPLIT＝那個互動點祐廷那一份扣一半，AA 和 LAWWW 定）、懸著的承諾七格——不需要瀏覽器（D131）。
//   稿的數量（照稿數）：SHE_PAYS_add 17 個互動點 18 句（學姊 D22.fish 兩句；其中 7 句 AA_782 已經有）、SPLIT 11 個互動點 11 句；懸著的承諾＝改稿紀錄 5 格＋path_rows 2 格。
//   1. 白名單：AA_812 一筆＋改稿紀錄 date_rewrite/ 五筆（f1fab0ec6、approved、task DLG-FULL-REVIEW-1110）；兩支匯入工具重匯一致（import_date_lines.py --out、import_she_pays.py --check）
//   2. 懸著的承諾：改稿紀錄五格（f1fab0ec6 和 248c8e390 逐格比只差這五格）的新句在遊戲資料、格號那一格就是新句、她那個地點沒有舊句；path_rows 兩格是新句、舊句不在
//   3. 資料：S.SHE_PAYS 有稿的十八句、S.SPLIT＝稿的十一句（每一句在她那個互動點底下剛好一處、是她說的）；同一句不會兩邊都有；重複的不重複；S.sheSplits 只認人＋互動點＋整句
//   4. 逐格演她付全部（DATE.book → OUT.prompt 整趟；兩天一夜 S.dayRound）：演到那一句那一次，那個互動點祐廷那一份不扣；同一個互動點演別套照扣
//   5. 逐格演平分：那一次扣一半（Math.round）；同一套選另一個選項＝照「最後說的那一句」算（大多照扣）；別套照扣；祐廷選請客選項的那一份（extra，「（請她）」）照舊另外扣
//   6. 最後說的那一句算：學姊 D22.fish 第一次——她先說「這家我請」，選「那我請飲料。」她回「好。飯我請，飲料你請。」＝150（一半）；選「我們平分。」（她回「好。你堅持的話。」，不在 SPLIT）＝0
//   7. 子晴 D06.cafe remember：S.REMEMBER_IF 照舊（第一次選「我請妳。」有旗標＝新句「這家我來過兩次了。這次我請，你不要算。」、不扣；沒旗標＝備用句、照扣 160）；第一次選項的回覆是「好。下次我請。」
//   8. 程式：S.splitMark／S.takeSplit／S.halfOf；S.scene、S.dayRound 兩條路；行程物件、存檔不留 sheSplit；選單價錢照舊；快速約會照扣
//   可昕 D10.snack 的 dating 那一套（「這串我們一人一半。好，你多一口。」）資料有、S.sheSplits 認得，但 S.spotLine 不演可昕的 dating 套（id!=='kexin'）——第 5 節不演，印出來。
//   2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）：白名單 AA_812 換 633b7f7d6（history 留 f1fab0ec6；改稿紀錄 date_rewrite/ 五份照舊 f1fab0ec6）；SPLIT 學姊 D22.fish 多「好。你堅持的話。」、D30.stall「好。各付各的，最清楚。」拿掉＝SPLIT 11 句 10 個互動點；
//     第 6 節選「我們平分。」也扣一半、學姊 D30.stall 第一次選「我自己來。」照原價；第 7 節 S.REMEMBER_IF 拿掉子晴 D06.cafe 那一列＝沒旗標的人也聽新句、她請（上面第 2、5、6、7 行是 f1fab0ec6 那時的說法）。
// 用法：node tests/date_she_pays_812_1111_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const cp=require('child_process'), fs=require('fs'), path=require('path'), os=require('os');
const AN='heroine_01', ZR='heroine_02', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', PS='classmate_peishan', KX='kexin', SP='docs/story_planning/', SHA='f1fab0ec6', PREV='248c8e390', SHA812='633b7f7d6';   /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）：AA_812 這份稿換 633b7f7d6（SHA812）；改稿紀錄 date_rewrite/ 五份、path_rows 照舊 f1fab0ec6（SHA）。舊：AA_812 也是 SHA */
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const show=(ref,p)=>{ try{ return cp.execFileSync('git',['show',ref+':'+p],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<26}); }catch(e){ return null; } };
const read=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const DLp=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const NOW=DLp(read('src/data/date_lines.js'));
const leaves=(x,p,o)=>{ if(Array.isArray(x)) x.forEach((v,i)=>leaves(v,p+'/'+i,o)); else if(x&&typeof x==='object') for(const k in x) leaves(x[k],p+'/'+k,o); else o[p]=x; return o; };
const getAt=(o,p)=>p.split('/').slice(1).reduce((x,k)=>x==null?x:x[k],o);
/* 格號＝date_rewrite.py list 的順序（同 tests/date_she_pays_1111_unit.js 的 slots()）*/
const slots=(d,who)=>{ const out=[], L=d.lines[who], K4=['first','normal','remember','dating'];
  const block=b=>{ if(Array.isArray(b)) b.forEach(block); else if(b&&typeof b==='object'&&'lines' in b){ b.lines.forEach(x=>out.push(x.text)); (b.choice||[]).forEach(c=>{ out.push(c.t); (c.reply||[]).forEach(r=>out.push(r.text)); }); } };
  for(const part of ['arrive','closing']) for(const kind of ['first','normal','dating']) if(L[part]&&kind in L[part]) block(L[part][kind]);
  for(const hs in (L.hotspots||{})){ const X=L.hotspots[hs]; for(const kind of K4) if(kind in X) block(X[kind]); for(const k in X) if(!K4.includes(k)) block(X[k]); }
  const dl=(d.dislikeLine||{})[who]||{}; for(const hs in dl) out.push(dl[hs]); return out; };
/* 扣錢、選單（同 tests/date_she_pays_1111_unit.js）*/
const CH=[], HINT={}; GM.money=(d,l)=>{ H.G.money+=d; CH.push([l,d]); };
{ const ch0=GM.choose; let n=0; GM.choose=async o=>{ if(++n>200) throw new Error('選單一直重來：'+J(o.map(x=>x.t||x.text))); const T=o.map(x=>x.t||x.text||''); for(const x of o) if(x&&x.hint) HINT[x.t||x.text]=x.hint;
    if(H.picks[0]==='自己選'&&!T.includes('自己選')) H.picks.shift();
    const w=H.picks[0]; if(typeof w==='string'&&!T.some(t=>t.includes(w))&&!o.some(x=>(x.sub||[]).some(y=>y.includes(w)))){ H.opts.push(T); return 0; }
    return ch0(o); }; GM._reset=()=>{ n=0; }; }
const nameOf=id=>(CHARACTERS.find?CHARACTERS.find(c=>c.id===id):(CHARACTERS[id]||null)||{}).name||id;
const setup=(key,who,o)=>{ o=o||{}; const G=H.fresh(key,9,'dorm',o.flags||{}); G.money=50000; G.outings=[]; G.contacts=G.contacts||{}; H.CLOSE(who); G.contacts[who]=1; if(o.rom!=null) SOCIAL.rel(who).npcRom=o.rom; GM._reset(); return G; };
const go=async(who,loc,picks,o)=>{ o=o||{}; const G=H.G, dep=o.depart||10; CH.length=0; GM._reset(); const tr=o.tr||(DATE.loc(loc).transport||[])[0].mode;
  const b=DATE.book(G,{who,locs:[loc],transport:tr,day:G.day,depart:dep}); if(!b.ok) return {b,said:[],ch:[],L:[],spent:0};
  const q=OUT.get(G,'date_'+b.trip); G.hour=dep; H.said=[]; H.opts=[]; H.picks=['出發'].concat(picks); const m0=G.money; await OUT.prompt(GM,q); if(H.picks.length) throw new Error(loc+' 這一趟沒選到：'+J(H.picks)+'；選單 '+J(H.opts));
  return {b,t:DATE.trip(G,b.trip),said:H.said.filter(s=>s.who===nameOf(who)).map(s=>s.t),L:H.lines(),ch:CH.slice(),spent:m0-G.money,opts:H.opts.map(x=>x.slice())}; };
const ovGo=async(who,loc,picks)=>{ const G=H.G; G.hour=20; const day=G.day+1, tr=(DATE.loc(loc).transport||[])[0].mode, b=DATE.book(G,{who,locs:[loc],transport:tr,day,depart:9,kind:'overnight',by:'player'}); if(!b.ok) return {b,ch:[],said:[]};
  const q=OUT.get(G,'date_'+b.trip); G.day=day; G.weekday=(G.weekday+1)%7; G.hour=9; CH.length=0; GM._reset(); H.said=[]; H.opts=[]; H.picks=['出發'].concat(picks);
  await OUT.prompt(GM,q); if(H.picks.length) throw new Error(loc+' 兩天一夜沒選到：'+J(H.picks)+'；選單 '+J(H.opts));
  return {b,t:DATE.trip(G,b.trip),ch:CH.slice(),said:H.said.filter(s=>s.who===nameOf(who)).map(s=>s.t)}; };
const paid=(r,name)=>r.ch.filter(([l])=>l===name).map(([,d])=>-d);
const PT=pid=>DATE.points(pid.slice(0,3)).find(p=>p.id===pid);
/* key：<互動點>.<first|normal|remember|dating>[#第幾套][.choice[i]]（匯入工具 cells812 的 key）*/
const PART=k=>{ const m=/^(D\d\d\.\w+)\.(\w+)(?:#(\d+))?(?:\.choice\[(\d+)\])?$/.exec(k); return {pid:m[1],kind:m[2],k:m[3]==null?null:+m[3],ci:m[4]==null?null:+m[4]}; };
const HS=(who,pid)=>NOW.loc[pid.slice(0,3)].lines[who].hotspots[pid];
const setOf=(who,pid,kind,k)=>{ const s=HS(who,pid)[kind]; return k==null?s:s[k]; };
/* 讓 S.spotLine 演指定的那一套：first＝沒去過；remember＝上一次點過（第二次去）；normal#k＝去過兩次、上一次沒點、前面幾套剛用過（輪替記憶 recent）*/
const force=(G,who,loc,pid,kind,k)=>{ const m=DATE.mem(G,who,loc), Lg=DATE.log(G,who);
  if(kind==='first'){ m.picks=[]; m.last=[]; m.recent=[]; Lg.byLoc[loc]=0; }
  else if(kind==='remember'){ m.picks=[pid]; m.last=[pid]; m.recent=[]; Lg.byLoc[loc]=1; }
  else { m.picks=[pid]; m.last=[]; m.recent=Array.from({length:k},(_,i)=>pid+'.normal#'+i); Lg.byLoc[loc]=2; } };
const OV=loc=>(DATE.loc(loc).kinds||[]).includes('overnight')&&!(DATE.loc(loc).kinds||[]).includes('half');
const depOf=(who,loc)=>{ const K=DATE.loc(loc).kinds||[]; return K.includes('half')?(who===ZQ?15:10):K.includes('day')?9:K.includes('evening')?18:10; };
/* 一趟：who 去 pid 那個地點、演 kind#k 那一套（ci＝選第幾個選項）；回傳那一趟 */
const trip=async(who,pid,kind,k,ci,o)=>{ o=o||{}; const loc=pid.slice(0,3), P=PT(pid), ov=OV(loc), s=setOf(who,pid,kind,k), hi=ov||(s&&s.tier==='high')||o.hi;
  setup(ov?(who===PS?'2026-03-20':'2026-03-27'):'2026-03-28',who,Object.assign(hi?{rom:60}:{},{flags:Object.assign(who===KX?{dating_kexin:true}:{},o.flags||{})}));   /* 沛珊隔週回台中：兩天一夜改 3/21 出發；可昕：交往中（沒交往＝分開以後那幾套）*/
  force(H.G,who,loc,pid,kind,k); if(o.taste) DATE.mem(H.G,who,loc).taste=o.taste;
  const pk=ci==null?[]:[DATE.optText(s.choice[ci].t).replace(/[「」]/g,'')];
  return ov?ovGo(who,loc,[P.name].concat(pk)):go(who,loc,['自己選',P.name].concat(pk,['差不多了']),{depart:depOf(who,loc)}); };
/* 演那一套（＋選的那個選項的回話）她說的句子裡，最後一句是請客／平分的哪一種（S.playSet 的規則：最後說的那一句算）*/
const lastSaid=(who,pid,s,ci)=>{ let st=null; const her=(s.lines||[]).filter(x=>x.who===who).map(x=>x.text).concat(ci==null?[]:((s.choice[ci].reply||[]).filter(x=>x.who===who).map(x=>x.text)));
  for(const t of her){ if(DATE.shePays(who,pid,t)) st='pays'; else if(DATE.sheSplits(who,pid,t)) st='split'; } return st; };
const want=(st,c)=>st==='pays'?0:st==='split'?Math.round(c/2):c;
const D=SHE_PAYS_DATA, C812=D.cells812||[], PAYS=C812.filter(c=>c.kind==='pays'), SPL=C812.filter(c=>c.kind==='split');
const A812=JSON.parse(show(SHA812,SP+'AA_812_date_pays_promises.json')||'null');   /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）。舊期望：show(SHA,…)（f1fab0ec6） */
const REC=[
  {rec:'sis_D06',who:SIS,loc:'D06',n:45,old:'上次你請的。這次我請。',new:'這次我請。你坐著就好。'},
  {rec:'zq_D06',who:ZQ,loc:'D06',n:45,old:'我說過要請你吃滷味，等一下去，我知道一間。',new:'這家我來過兩次了。這次我請，你不要算。'},
  {rec:'peishan_D15',who:PS,loc:'D15',n:43,old:'上次說宵夜算我的，我記得喔，今天兌現。',new:'今天宵夜算我的。上次就想請了。'},
  {rec:'peishan_D21',who:PS,loc:'D21',n:20,old:'你要吃什麼？我請你，上次是你請的。',new:'你要吃什麼？這攤我請。'},
  {rec:'kx_D15',who:KX,loc:'D15',n:10,old:'宵夜下次我請。我已經挑好了。',new:'宵夜我請。我已經挑好了，在山下。'}];
const PATHS=[
  {at:'/loc/D06/lines/heroine_04/hotspots/D06.cafe/first/choice/1/reply/0/text',old:'好。下次我請你吃滷味。',new:'好。下次我請。'},
  {at:'/loc/D10/lines/heroine_03/hotspots/D10.boat/remember/lines/0/text',old:'上次坐完，我跟我媽說了。她說「有穿救生衣嗎」。',new:'上次坐完，我跟我媽說了。她說「有穿救生衣嗎」。這次船票我請。'}];

(async()=>{
  await sec(1,async()=>{ const A=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
    const e812=A.filter(x=>x.path===SP+'AA_812_date_pays_promises.json'), eRec=A.filter(x=>x.path.startsWith(SP+'date_rewrite/'));
    /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）：白名單 AA_812 換 633b7f7d6、f1fab0ec6 留在 history。舊期望：sha＝f1fab0ec6、沒有 history */
    check('1. 白名單 AA_812_date_pays_promises.json 一筆：'+SHA812+'（history 有 '+SHA+'）、approved、有 approvedBy、task DLG-FULL-REVIEW-1110',e812.length===1&&e812[0].sha===SHA812&&(e812[0].history||[]).some(h=>h.sha===SHA)&&e812[0].status==='approved'&&!!e812[0].approvedBy&&e812[0].task==='DLG-FULL-REVIEW-1110',J(e812.map(x=>[x.sha,x.status,(x.history||[]).map(h=>h.sha)])));
    check('1. 白名單改稿紀錄 date_rewrite/ 剛好五筆（kx_D15、peishan_D15、peishan_D21、sis_D06、zq_D06）：都是 '+SHA+'、approved、approvedBy 寫著 AA_812 懸著的承諾',J(eRec.map(x=>x.path.slice((SP+'date_rewrite/').length)).sort())===J(['kx_D15.json','peishan_D15.json','peishan_D21.json','sis_D06.json','zq_D06.json'])&&eRec.every(x=>x.sha===SHA&&x.status==='approved'&&/f1fab0ec6（AA 11-11 AA_812 懸著的承諾）/.test(x.approvedBy||'')&&x.task==='DLG-FULL-REVIEW-1110'),J(eRec.map(x=>[x.path,x.sha])));
    /* 2026-11-11 19:03 起 D01～D33 再換 52c3ee258（AA 加選項 fx，X324；只多 fx、字和 248c8e390 一樣）：那一版也算，248c8e390 要在 history */
    check('1. 白名單 date_system/lines/D01～D33 還是 '+PREV+'（或之後只加 fx 的 '+require('./date_src_sha.js').ALLOW_SHA+'、'+PREV+' 在 history）（AA_812 沒有改源稿 Dxx.json；改稿紀錄是另外一層）',A.filter(x=>/date_system\/lines\/D\d\d\.json$/.test(x.path)).every(x=>x.sha===PREV||(x.sha===require('./date_src_sha.js').ALLOW_SHA&&(x.history||[]).some(h=>h.sha===PREV)))&&A.filter(x=>/date_system\/lines\/D\d\d\.json$/.test(x.path)).length===33);
    const sp=cp.spawnSync('python3',[path.join(H.ROOT,'tools/date/import_she_pays.py'),'--check'],{encoding:'utf8',timeout:120000});
    check('1. src/data/she_pays.js 和重匯一致（tools/date/import_she_pays.py --check）；來源寫 AA_782＋AA_812',sp.status===0&&D.src.endsWith('＋'+SP+'AA_812_date_pays_promises.json@'+SHA812),   /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）。舊期望：@'+SHA（f1fab0ec6） */(sp.stdout||sp.stderr||'').slice(-200));
    const out=path.join(os.tmpdir(),'date_lines_812_'+process.pid+'.js'); const r=cp.spawnSync('python3',[path.join(H.ROOT,'tools/date/import_date_lines.py'),'--out',out],{encoding:'utf8',timeout:300000});
    const same=r.status===0&&fs.existsSync(out)&&fs.readFileSync(out,'utf8')===read('src/data/date_lines.js'); try{ fs.unlinkSync(out); }catch(e){}
    check('1. src/data/date_lines.js 和重匯一致（tools/date/import_date_lines.py --out；AA_812 那一步：改稿紀錄 5 格＋path_rows 2 列，換了 7 格）',same&&/AA_812@633b7f7d6：懸著的「下次我請」——改稿紀錄 5 格.*換了 7 格/.test(r.stdout||'')   /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）：匯入工具印 AA_812@633b7f7d6。舊期望：AA_812@f1fab0ec6 */,(r.stderr||'').slice(-300));
    /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）：來源 AA_812@633b7f7d6，五份改稿紀錄照舊 @f1fab0ec6。舊期望：六份都 @f1fab0ec6 */
    check('1. date_lines.js 的來源寫著 AA_812（@'+SHA812+'）和五份改稿紀錄（@'+SHA+'）',NOW.source.includes('＋AA_812_date_pays_promises.json@'+SHA812)&&!NOW.source.includes('AA_812_date_pays_promises.json@'+SHA)&&['kx_D15.json','peishan_D15.json','peishan_D21.json','sis_D06.json','zq_D06.json'].every(f=>NOW.source.includes('＋'+f+'@'+SHA))); });

  await sec(2,async()=>{
    for(const x of REC){ const sl=slots(NOW.loc[x.loc],x.who), her=leaves(NOW.loc[x.loc].lines[x.who],'',{});
      check('2. 改稿紀錄 '+x.rec+'：'+nameOf(x.who)+' '+x.loc+' 第 '+x.n+' 格是新句「'+x.new+'」；她在這個地點沒有舊句「'+x.old+'」',sl[x.n-1]===x.new&&!Object.values(her).includes(x.old)&&Object.values(her).filter(v=>v===x.new).length===1,J([sl[x.n-1]]));
      const a=show(PREV,SP+'date_rewrite/'+x.rec+'.json'), b=show(SHA,SP+'date_rewrite/'+x.rec+'.json');
      if(a&&b){ const A=JSON.parse(a)[x.loc], B=JSON.parse(b)[x.loc], d=A.map((v,i)=>v===B[i]?null:[i+1,v,B[i]]).filter(Boolean);
        check('2. 改稿紀錄 '+x.rec+'：'+PREV+' → '+SHA+' 只差第 '+x.n+' 格（舊句→新句，AA_812 這一次）；格數＝遊戲她在 '+x.loc+' 的格數',J(d)===J([[x.n,x.old,x.new]])&&B.length===sl.length,J(d)); }
      else console.log('（這份 checkout 讀不到企劃線的 date_rewrite/'+x.rec+'.json：不比改稿紀錄）'); }
    for(const x of PATHS) check('2. path_rows：'+x.at+' 是新句「'+x.new+'」、整份 date_lines.js 沒有舊句',getAt(NOW,x.at)===x.new&&!Object.values(leaves(NOW,'',{})).includes(x.old),J(getAt(NOW,x.at)));
    if(A812){ const pr=A812.path_rows.map(r=>({path:r.path,old:r.old,new:r.new}));
      check('2. 稿 AA_812@'+SHA812+' 的 path_rows 兩列＝上面兩格（舊句、新句一字不差；633b7f7d6 沒動 path_rows）',pr.length===2&&pr.every((r,i)=>r.old===PATHS[i].old&&r.new===PATHS[i].new)&&/D06\.cafe/.test(pr[0].path)&&/D10\.boat/.test(pr[1].path),J(pr)); }
    else console.log('（這份 checkout 讀不到企劃線的 AA_812：不比稿）'); });

  await sec(3,async()=>{ const all=leaves(NOW,'',{});
    /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）：SPLIT 學姊 D22.fish 多一句「好。你堅持的話。」、D30.stall 那一句拿掉＝還是 11 句、互動點 10 個。舊期望：平分 11 句（11 個互動點） */
    check('3. 稿的數量：她付全部 18 句（17 個互動點）、平分 11 句（10 個互動點：學姊 D22.fish 兩句）；cells812＝18＋11 列',PAYS.length===18&&new Set(PAYS.map(c=>c.who+' '+c.pid)).size===17&&SPL.length===11&&new Set(SPL.map(c=>c.who+' '+c.pid)).size===10,J([PAYS.length,SPL.length,new Set(SPL.map(c=>c.who+' '+c.pid)).size]));
    if(A812){ const flat=X=>[].concat(...Object.keys(X).map(w=>[].concat(...Object.keys(X[w]).map(p=>X[w][p].map(t=>[w,p,t])))));
      check('3. cells812 和稿 AA_812@'+SHA812+' 的 SHE_PAYS_add、SPLIT 一字不差、同樣的順序',J(PAYS.map(c=>[c.who,c.pid,c.text]))===J(flat(A812.SHE_PAYS_add))&&J(SPL.map(c=>[c.who,c.pid,c.text]))===J(flat(A812.SPLIT))); }
    const bad=[];
    for(const c of C812){ const h=HS(c.who,c.pid), L=leaves(h,'',{}), at=Object.keys(L).filter(p=>L[p]===c.text);
      if(at.length!==1) bad.push(c.who+' '+c.pid+' 「'+c.text+'」在她那個互動點底下 '+at.length+' 處');
      else { if(!/^\/(first|normal|remember|dating)(\/\d+)?(\/lines|\/choice\/\d+\/reply)\/\d+\/text$/.test(at[0])) bad.push(c.key+' 位置 '+at[0]); if(getAt(h,at[0].replace(/\/text$/,'/who'))!==c.who) bad.push(c.key+' 不是她說的'); if(c.at!=='/loc/'+c.loc+'/lines/'+c.who+'/hotspots/'+c.pid+at[0]) bad.push(c.key+' at '+c.at); }
      if(slots(NOW.loc[c.loc],c.who)[c.n-1]!==c.text) bad.push(c.who+' '+c.loc+'#'+c.n+' 格號那一格不是這一句'); }
    check('3. 每一句：在 date_lines.js 她那個互動點底下剛好一處、是某一套她說的台詞或選項的回話（不是選項的字）、格號那一格就是這一句',bad.length===0,J(bad));
    check('3. S.SHE_PAYS 認得她付全部的十八句、S.SPLIT 認得平分的十一句；同一句不會兩邊都有（S.shePays 和 S.sheSplits 不會同時是 true）',PAYS.every(c=>DATE.shePays(c.who,c.pid,c.text)&&!DATE.sheSplits(c.who,c.pid,c.text))&&SPL.every(c=>DATE.sheSplits(c.who,c.pid,c.text)&&!DATE.shePays(c.who,c.pid,c.text)));
    const nS=o=>Object.values(o).reduce((a,x)=>a+Object.values(x).reduce((b,v)=>b+v.length,0),0);
    check('3. 重複的不重複：S.SHE_PAYS 一共 21 句（以安手寫 3＋AA_782 留下的 7＋AA_812 新的 11；2026-11-11 18:58 AA 拿掉沛珊 D31.egg（照 AA_812「只多買一顆蛋的不算」），舊期望 22／8；AA_812 和 AA_782 重複的 7 句標 dup）；S.SPLIT 11 句',nS(DATE.SHE_PAYS)===21&&nS(DATE.SPLIT)===11&&PAYS.filter(c=>c.dup).length===7&&PAYS.filter(c=>c.dup).every(c=>/^AA_782 /.test(c.dup)),J([nS(DATE.SHE_PAYS),nS(DATE.SPLIT)]));
    /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）：學姊 D30.stall「好。各付各的，最清楚。」從 SPLIT 拿掉（祐廷照原價），兩邊都有的剩 D22.fish；D22.fish 的 SPLIT 是第一次兩個選項的回話。舊期望：學姊 D22.fish、D30.stall 兩個 */
    check('3. 同一個人同一個互動點兩邊都有的只有學姊 D22.fish（不同的句子：第一次那一套的第一句「這家我請」和兩個選項的回話）',J(Object.keys(DATE.SPLIT).flatMap(w=>Object.keys(DATE.SPLIT[w]).filter(p=>(DATE.SHE_PAYS[w]||{})[p]).map(p=>w+' '+p)))===J([SIS+' D22.fish']),J(Object.keys(DATE.SPLIT).flatMap(w=>Object.keys(DATE.SPLIT[w]).filter(p=>(DATE.SHE_PAYS[w]||{})[p]).map(p=>w+' '+p))));
    check('3. 學姊的 S.SPLIT 只有 D22.fish 兩句（「好。飯我請，飲料你請。」「好。你堅持的話。」＝第一次兩個選項的回話）；D30.stall 不在 S.SPLIT、「好。各付各的，最清楚。」S.sheSplits 不認（AA_812@'+SHA812+'）',J(DATE.SPLIT[SIS])===J({'D22.fish':['好。飯我請，飲料你請。','好。你堅持的話。']})&&J(HS(SIS,'D22.fish').first.choice.map(c=>c.reply[0].text))===J(['好。飯我請，飲料你請。','好。你堅持的話。'])&&!DATE.sheSplits(SIS,'D30.stall','好。各付各的，最清楚。')&&!DATE.shePays(SIS,'D30.stall','好。各付各的，最清楚。')&&HS(SIS,'D30.stall').first.choice[1].reply[0].text==='好。各付各的，最清楚。',J(DATE.SPLIT[SIS]));
    const ss=DATE.sheSplits;
    check('3. S.sheSplits 只認「那個人＋那個互動點＋整句」：別人說同一句、別的互動點、沒有互動點、多一個字都不算',SPL.every(c=>ss(c.who,c.pid,c.text)&&!ss(c.who===AN?ZR:AN,c.pid,c.text)&&!ss(c.who,null,c.text)&&!ss(c.who,c.pid,c.text+'。'))&&!ss(KX,'D05.lawn','這裡的蛋糕很貴，一人一半就還好。'));
    check('3. 稿「不列」的不在：沛珊 D27 雞肉飯、可昕 D22.fish、學姊／可昕 closing 的「晚餐我請」——S.SPLIT、S.SHE_PAYS 都沒有可昕 D22.fish；可昕 D15 收尾那一句（「宵夜我請。…」，收尾不在互動點）兩邊都沒有',!((DATE.SHE_PAYS[KX]||{})['D22.fish'])&&!((DATE.SPLIT[KX]||{})['D22.fish'])&&!Object.values(DATE.SHE_PAYS[KX]||{}).flat().includes('宵夜我請。我已經挑好了，在山下。')); });

  await sec(4,async()=>{
    for(const c of PAYS){ const {pid,kind,k,ci}=PART(c.key), P=PT(pid), cost=P.cost|0, w='4. '+nameOf(c.who)+' '+c.key+'（'+P.name+' cost '+cost+(OV(c.loc)?'；兩天一夜':'')+'）';
      const o=c.who===ZQ&&pid==='D06.cafe'?{flags:{ZQ_D06_TREAT:1}}:c.who===KX&&pid==='D13.drink'?{taste:Object.keys(DATE.TASTE_WORD)[0]}:{};
      /* {lastDrink} 的那一套：S.TASTE_WORD 還沒有字（AA 還沒給 TASTE 的說法）＝setUsable 跳過那一套、演不到（可昕 D13.drink remember）——資料有、S.shePays 認得（第 3 節）；等有字了這裡就照一般的格演 */
      if(/\{lastDrink\}/.test(c.text)&&!Object.keys(DATE.TASTE_WORD).length){ const r=await trip(c.who,pid,kind,k,ci,o);
        console.log('（'+w+'：S.TASTE_WORD 還是空的，這一套演不到——這一次她說的是「'+r.said.filter(x=>!/^(我沒來過|走吧)/.test(x)).join('｜')+'」，'+P.name+'照扣 '+J(paid(r,P.name))+'）');
        check(w+'：{lastDrink} 那一套現在演不到（S.TASTE_WORD 空的）——沒說這一句、照扣 '+cost+'（不是匯錯：等 AA 給 TASTE 的說法）',!!r.b.ok&&!r.said.some(x=>/這次換我幫你點/.test(x))&&J(paid(r,P.name))===J([cost]),J([r.b.why,r.ch,r.said])); continue; }
      /* 那一套有選項、這一句不是選項的回話：選一個回話不會再說平分的選項（學姊 D22.fish 第一次選「我們平分。」；選「那我請飲料。」的在第 6 節）*/
      const S0=setOf(c.who,pid,kind,k), cc=ci!=null?ci:((S0.choice||[]).length?S0.choice.findIndex((_,i)=>lastSaid(c.who,pid,S0,i)==='pays'):null);
      /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）：學姊 D22.fish 第一次兩個選項的回話都在 SPLIT（「好。你堅持的話。」加進去了）——這一套找不到「最後說的是請客」的選項（cc＝-1）：每個選項都演一次，「這家我請」照說、最後說的是平分＝扣一半。
         舊期望：選「我們平分。」（那時不在 SPLIT）＝最後是「這家我請」＝不扣 */
      if(cc===-1){ const half=[]; for(let i=0;i<S0.choice.length;i++){ const r=await trip(c.who,pid,kind,k,i,o); half.push([S0.choice[i].t,lastSaid(c.who,pid,S0,i),!!r.b.ok&&r.said.includes(c.text)&&J(paid(r,P.name))===J([Math.round(cost/2)])&&!r.ch.some(([l])=>/（請她）/.test(l))&&!('shePaid' in (r.t||{}))&&!('sheSplit' in (r.t||{})),r.ch]); }
        check(w+'：這一套每個選項的回話都是平分（只有學姊 D22.fish 第一次，AA_812@'+SHA812+'）——演到「'+c.text+'」、不管選哪一個（'+S0.choice.map(x=>x.t).join('、')+'），最後說的都是平分＝'+P.name+'扣一半 '+Math.round(cost/2),c.who===SIS&&c.key==='D22.fish.first'&&half.length===2&&half.every(h=>h[1]==='split'&&h[2]),J(half)); }
      else { const a=await trip(c.who,pid,kind,k,cc,o), st=lastSaid(c.who,pid,S0,cc), heard=c.text.includes('{lastDrink}')?a.said.some(x=>x.startsWith(c.text.split('{lastDrink}')[0])&&x.endsWith(c.text.split('{lastDrink}')[1])):a.said.includes(c.text);
      check(w+'：演到「'+c.text+'」那一次'+(cc!=null?'（選「'+S0.choice[cc].t+'」）':'')+'——'+P.name+'不扣'+(cost?'':'（這個互動點本來就 0 元）')+'；行程物件上沒有留下 shePaid／sheSplit',!!a.b.ok&&heard&&st==='pays'&&J(paid(a,P.name))==='[]'&&!('shePaid' in (a.t||{}))&&!('sheSplit' in (a.t||{})),J([a.b.why,a.ch,a.said.slice(0,5)])); }
      /* 別套：first、remember、選項回話的格＝normal 第一套；normal#k＝第一套（k＝0 的演第二套）——那一套沒有請客／平分的句子 */
      const j=kind==='normal'&&k===0?1:0, alt=setOf(c.who,pid,'normal',j), sa=lastSaid(c.who,pid,alt,null);
      if(sa){ check(w+'：別套 normal#'+j+' 自己也有請客／平分的句子，不比',false,J(alt)); continue; }
      const b=await trip(c.who,pid,'normal',j,null), other=(alt.lines||[]).filter(x=>x.who===c.who).map(x=>x.text);
      check(w+'：同一個互動點演別套（normal 第 '+(j+1)+' 套「'+other.join('')+'」）——照扣 '+cost,!!b.b.ok&&other.length>0&&other.every(x=>b.said.includes(x))&&!b.said.includes(c.text)&&J(paid(b,P.name))===(cost?J([cost]):'[]'),J([b.b.why,b.ch,b.said.slice(0,5)])); } });

  await sec(5,async()=>{
    for(const c of SPL){ const {pid,kind,k,ci}=PART(c.key), P=PT(pid), cost=P.cost|0, w='5. '+nameOf(c.who)+' '+c.key+'（'+P.name+' cost '+cost+(OV(c.loc)?'；兩天一夜':'')+'）';
      if(c.who===KX&&kind==='dating'){ console.log('（'+w+'：S.spotLine 不演可昕的 dating 套（id!==\'kexin\'），這一句「'+c.text+'」演不到——資料有、S.sheSplits 認得（第 3 節）；不演）'); continue; }
      const s=setOf(c.who,pid,kind,k), a=await trip(c.who,pid,kind,k,ci), st=lastSaid(c.who,pid,s,ci), tr=ci!=null&&DATE.isTreat(s.choice[ci].t)&&(P.extra|0)>0;
      /* 2026-11-11 18:58 AA：選「我請」＝他付兩個人的（自己那一份照扣＋「（請她）」那一份），不再套平分；沒選「我請」才扣一半。舊期望：選了「我請」也扣一半 */
      check(w+'：演到「'+c.text+'」那一次——'+(tr?P.name+'照扣 '+cost+'（選的是請客選項「'+s.choice[ci].t+'」＝不套平分）、「（請她）」'+P.extra+' 另外扣':P.name+'扣一半 '+Math.round(cost/2)+'（'+cost+' 的一半）')+'；行程物件上沒有留下 sheSplit',
        !!a.b.ok&&a.said.includes(c.text)&&st==='split'&&J(paid(a,P.name))===J([tr?cost:Math.round(cost/2)])&&J(paid(a,P.name+'（請她）'))===(tr?J([P.extra|0]):'[]')&&!('sheSplit' in (a.t||{}))&&!('shePaid' in (a.t||{})),J([a.b.why,a.ch,a.said.slice(0,5)]));
      if(ci!=null){ const cj=ci===0?1:0, b=await trip(c.who,pid,kind,k,cj), sb=lastSaid(c.who,pid,s,cj), trb=DATE.isTreat(s.choice[cj].t)&&(P.extra|0)>0;
        check(w+'：同一套選另一個選項「'+s.choice[cj].t+'」（她回「'+((s.choice[cj].reply||[]).map(x=>x.text).join(''))+'」）——照最後說的那一句算：'+(sb==='pays'?'不扣':sb==='split'?'扣一半':'照扣 '+cost)+(trb?'；請客選項的「（請她）」'+P.extra+' 照舊':''),
          !!b.b.ok&&!b.said.includes(c.text)&&J(paid(b,P.name))===((trb&&sb==='split'?cost:want(sb,cost))?J([trb&&sb==='split'?cost:want(sb,cost)]):'[]')&&J(paid(b,P.name+'（請她）'))===(trb?J([P.extra|0]):'[]'),J([b.b.why,b.ch,b.said.slice(0,5)])); }
      const j=kind==='normal'&&k===0?1:0, alt=setOf(c.who,pid,'normal',j);
      if(lastSaid(c.who,pid,alt,null)){ check(w+'：別套 normal#'+j+' 自己也有請客／平分的句子，不比',false,J(alt)); continue; }
      const d=await trip(c.who,pid,'normal',j,null), other=(alt.lines||[]).filter(x=>x.who===c.who).map(x=>x.text);
      check(w+'：同一個互動點演別套（normal 第 '+(j+1)+' 套「'+other.join('')+'」）——照扣 '+cost,!!d.b.ok&&other.length>0&&other.every(x=>d.said.includes(x))&&!d.said.includes(c.text)&&J(paid(d,P.name))===J([cost]),J([d.b.why,d.ch,d.said.slice(0,5)])); } });

  await sec(6,async()=>{ const P=PT('D22.fish');
    const a=await trip(SIS,'D22.fish','first',null,0), b=await trip(SIS,'D22.fish','first',null,1);
    check('6. 學姊 D22.fish 第一次：她先說「（活魚料理）這家我請。你不要搶。」，選「那我請飲料。」她回「好。飯我請，飲料你請。」——最後說的是平分＝活魚料理扣 150（300 的一半）',!!a.b.ok&&a.said.includes('（活魚料理）這家我請。你不要搶。')&&a.said.includes('好。飯我請，飲料你請。')&&P.cost===300&&J(paid(a,'活魚料理'))===J([150])&&!a.ch.some(([l])=>/（請她）/.test(l)),J([a.b.why,a.ch]));
    /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）：「好。你堅持的話。」加進 SPLIT＝選「我們平分。」最後說的也是平分，活魚料理扣一半 150。舊期望：那一句不在 SPLIT，最後說的請客句是「這家我請」＝不扣 */
    check('6. 同一套選「我們平分。」（她回「好。你堅持的話。」，AA_812@'+SHA812+' 列進 SPLIT）——最後說的是平分＝活魚料理扣 150（300 的一半）',!!b.b.ok&&b.said.includes('（活魚料理）這家我請。你不要搶。')&&b.said.includes('好。你堅持的話。')&&J(paid(b,'活魚料理'))===J([150])&&!b.ch.some(([l])=>/（請她）/.test(l)),J([b.b.why,b.ch]));
    /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）新加：學姊 D30.stall 第一次選「我自己來。」她回「好。各付各的，最清楚。」——從 SPLIT 拿掉了，祐廷照原價付（兩天一夜 S.dayRound）。舊期望：在 SPLIT＝扣一半（第 5 節逐格） */
    const P30=PT('D30.stall'), c30=await trip(SIS,'D30.stall','first',null,1);
    check('6. 學姊 D30.stall 第一次選「我自己來。」（她回「好。各付各的，最清楚。」，AA_812@'+SHA812+' 從 SPLIT 拿掉）——'+P30.name+'照原價 '+P30.cost+'、沒有「（請她）」',!!c30.b.ok&&c30.said.includes('好。各付各的，最清楚。')&&P30.cost>0&&J(paid(c30,P30.name))===J([P30.cost])&&!c30.ch.some(([l])=>/（請她）/.test(l)),J([c30.b.why,c30.ch,c30.said.slice(0,5)])); });

  await sec(7,async()=>{ const P=PT('D06.cafe'), RI=DATE.REMEMBER_IF.find(r=>r.who===ZQ&&r.pid==='D06.cafe');
    const a=await trip(ZQ,'D06.cafe','remember',null,null,{flags:{ZQ_D06_TREAT:1}}), b=await trip(ZQ,'D06.cafe','remember',null,null);
    check('7. 子晴 D06.cafe 再訪，有旗標（第一次選了「我請妳。」）：她說「這家我來過兩次了。這次我請，你不要算。」——咖啡廳不扣',!!a.b.ok&&a.said.includes('這家我來過兩次了。這次我請，你不要算。')&&J(paid(a,P.name))==='[]',J([a.b.why,a.ch,a.said.slice(0,4)]));
    /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）：S.REMEMBER_IF 拿掉子晴 D06.cafe 那一列＝沒旗標（第一次選了另一個）的人再訪也聽新句、她請（咖啡廳不扣）；PICK_FLAG 照記。
       舊期望：S.REMEMBER_IF 照舊換成備用句「這家的位子我記得，靠牆那桌插座最近。」——咖啡廳照扣 160 */
    check('7. 沒旗標（第一次選了另一個）：S.REMEMBER_IF 沒有 D06.cafe 那一列（AA_812@'+SHA812+'），一樣聽「這家我來過兩次了。這次我請，你不要算。」——咖啡廳不扣；聽不到 AA_775 的備用句',!RI&&!DATE.REMEMBER_IF.some(r=>r.loc==='D06'||r.pid==='D06.cafe')&&!!b.b.ok&&b.said.includes('這家我來過兩次了。這次我請，你不要算。')&&!b.said.includes('這家的位子我記得，靠牆那桌插座最近。')&&J(paid(b,P.name))==='[]'&&!('shePaid' in (b.t||{})),J([b.b.why,b.ch,b.said.slice(0,4)]));
    const f=await trip(ZQ,'D06.cafe','first',null,1);
    check('7. 第一次選「我請妳。」她回「好。下次我請。」（path_rows；滷味拿掉了）、記 ZQ_D06_TREAT；咖啡廳照扣 160（這一次是祐廷請）',!!f.b.ok&&f.said.includes('好。下次我請。')&&!f.said.some(x=>/滷味/.test(x))&&H.G.flags.ZQ_D06_TREAT!=null&&J(paid(f,P.name))===J([P.cost]),J([f.b.why,f.ch,f.said.slice(0,4)])); });

  await sec(8,async()=>{ const code=read('src/date3d.js').replace(/\/\*[\s\S]*?\*\//g,''), n=s=>code.split(s).length-1;
    check('8. 程式：S.scene、S.dayRound 兩條路都在 S.spotLine 演完的當下 S.takeSplit、S.takeShePaid 各看一次，S.halfOf(free?0:S.pointCost(p,t),half) 扣；S.spotLine 一開始兩個都清；只有 S.playSet 演到她那一句才記（S.splitMark）；快速約會那一段沒有 half',
      n('half=S.takeSplit(t,p.id)&&t.treated!==p.id, free=S.takeShePaid(t,p.id); delete t.treated;')===2&&n('const c=S.halfOf(free?0:S.pointCost(p,t),half); if(c) await S.pay(GM,t,c,p.name);')===2&&n('delete t.shePaid; delete t.sheSplit;')===1&&n('S.splitMark(t,id,pid,ln.text);')===1&&/for\(const p of qk\)\{[^}]*\{ const c=S\.pointCost\(p,t\); if\(c\) await S\.pay\(GM,t,c,p\.name\)/.test(code)   /* 2026-11-11：扣錢走 S.pay（錢不夠＝她付，AA 18:58）；選「我請」不套平分（t.treated）*/);
    const t={sheSplit:'D22.fish'}, a=DATE.takeSplit(t,'D22.lawn'), t2={sheSplit:'D22.fish'}, b=DATE.takeSplit(t2,'D22.fish');
    check('8. S.takeSplit：看一次就清掉——不是那個互動點＝false（也清掉），是＝true；沒有這個欄位＝false',a===false&&!('sheSplit' in t)&&b===true&&!('sheSplit' in t2)&&DATE.takeSplit({},'D22.fish')===false&&DATE.takeSplit(null,'D22.fish')===false);
    check('8. S.halfOf：扣一半四捨五入到整數（300→150、130→65、35→18、10→5、0→0），沒平分＝原價',DATE.halfOf(300,true)===150&&DATE.halfOf(130,true)===65&&DATE.halfOf(35,true)===18&&DATE.halfOf(10,true)===5&&DATE.halfOf(0,true)===0&&DATE.halfOf(300,false)===300);
    const m={}; DATE.splitMark(m,SIS,'D22.fish','（活魚料理）這家我請。你不要搶。'); const m1=J(m); m.shePaid='D22.fish'; DATE.splitMark(m,SIS,'D22.fish','好。飯我請，飲料你請。'); const m2=J(m); DATE.splitMark(m,SIS,'D22.fish','魚湯好鮮。'); const m3=J(m);
    check('8. S.splitMark：說到平分那一句＝記 sheSplit、清 shePaid；說到請客那一句＝清 sheSplit（shePaid 由 S.playSet 記）；別的句子不動',m1==='{}'&&m2===J({sheSplit:'D22.fish'})&&m3===m2,J([m1,m2,m3]));
    const G=setup('2026-03-28',SIS); const r=await trip(SIS,'D22.fish','first',null,0);
    check('8. 選單上的價錢照舊（「活魚料理」那一列寫 300 元）；行程物件、存檔都沒有 sheSplit／shePaid',/300 元/.test(HINT['活魚料理']||'')&&!!r.t&&!('sheSplit' in r.t)&&!J(H.G).includes('sheSplit')&&!J(H.G).includes('shePaid'),J([HINT['活魚料理']]));
    /* 快速約會（同一個地點第三次以後，不演台詞）＝她沒說平分＝照扣：以安 D22（活魚料理她喜歡；第一次選「我們都吃。」她回「一人一半。」＝平分）直接結算 */
    const G2=setup('2026-03-28',AN); const mm=DATE.mem(G2,AN,'D22'); mm.picks=['D22.fish']; mm.last=[]; DATE.log(G2,AN).byLoc.D22=2;
    const q=await go(AN,'D22',['快速約會']);
    check('8. 快速約會不演台詞＝照扣：以安 D22 做的互動點有活魚料理（她的平分格），扣原價 300；她沒說「一人一半。」（'+J(q.t&&q.t.spots)+'）',!!q.b.ok&&(q.t.spots||[]).includes('D22.fish')&&J(paid(q,'活魚料理'))===J([300])&&!q.said.includes('一人一半。')&&q.t.spots.every(p=>J(paid(q,PT(p).name))===J([PT(p).cost|0].filter(Boolean))),J([q.b.why,q.t&&q.t.spots,q.ch])); });

  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
