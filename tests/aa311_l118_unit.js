// AA_311 118 巷每間店的故事（企劃線 580ed6302；第 5 節的改法優先；任務 LANE118-SHOP-STORY-1020／USER_WANTS X66）：熟客三段招呼＋考試週、H2～H9——不需要瀏覽器。
// AA_480（企劃線 be47f6341，回實作後的六題）：老樣子不帶菜名那一句、118 巷九間和 AA_329 合併、H7 兩個選項留到選了為止、阿哲輪流家常菜改好家、H9 的路（約她去 Pasta 118 吃午餐）。
//   0  稿：第 1 節店員的稱呼、第 2 節熟客表（認得你／老樣子／考試週）逐格一樣；H2～H9 每一句台詞、旁白、選項都在稿裡（一字不差、說話的人對）；
//      第 5 節：舊名→Alison、以安不說「理由：」；H2b 作廢（沒有「好久不見。一樣嗎？」）；AA_480 的句子（不帶菜名的老樣子、「（不說話）」、「自助餐 我需要吃菜」）
//   1  熟客（一個人來）：第 1～2 次照 AA_280；第 3 次起「認得你」；第 8 次起「老樣子」→「好」直接點上次那一樣（不出選單、照樣扣錢）／「看一下菜單」照常點；
//      一天最多記一次；說了菜名的「老樣子」上次點別的＝不帶菜名那一句（AA_480 第 1 節）；茶飲換上次點的；沒點東西不算；
//      考試週（期中第 8、9 週、期末第 16 週；大四下第 15 週）有那一句的三間換那一句、其他店照舊；和人一起來照舊「幾位？」；舊存檔沒有 G.l118 不壞
//   2  H2 蛋包飯研究所 × 沛珊（大二下週三中午、之前一起吃過；交往中照演；一次）
//   3  H3 慢讀咖啡 × 以安（大一上週三中午、她在、REPORT_PARTNER；代替「幾位？」；一次）
//   4  H4 六張犁麵舖 × 阿哲（輪流的四間 noodle2、dian、korea、self 都一起吃過以後在麵舖吃完；舊存檔吃過家常菜的也算；好家那一場柏翰不另外演；ZHE_118_RANK；
//      阿哲揪午餐的輪流 noodle2 → dian → korea → self、那一週「自助餐 我需要吃菜」，選過的從下一週起由它開始）
//   5  H5 韓食小廚 × Alison（每次）；大二上 12/19 起三個人（一次）
//   6  H6 好家自助餐 × 柏翰（第三次一起吃、12:39 以後還沒吃完：代替他吃完那一句；一次；一天只記一次）
//   7  H7 巷口家常菜 × 芯慈（每次的招呼；第三次吃完多一句；之後老闆娘那句以後馬上兩個選項「她今天要換。」／「（不說話）」，選到以前每次都出；選過照舊；舊存檔 v9.10.13 記了 H7b 的照樣出到選了為止）
//   8  H8 滇香小館 × 語彤（大二上起一起吃過以後、別天自己來；AA_410 老闆娘說她點法的那兩句排在之後、不同一天）
//   9  H9 Pasta 118：交往中用手機約她「去 Pasta 118 吃午餐」（邀約的吃飯那一類；週三休、平日中午）→ 見面＝在店裡和她一起點餐：第一次「兩位嗎？窗邊有位子。」＋吃完的旁白、
//      之後「幾位？」沒有旁白；時間只走一次；沒交往不列；不在條件裡的（週六、晚上、三個人）不演
//  10  AA_329 第 3 節和熟客合併（118 巷九間）：不說第 5 次那一句；選單「老樣子」第 5 次起照樣有、回答的說話人照 AA_311 第 1 節；店員主動問過（第 8 次起）就不加；考試週、和人一起來照樣有；其他店照舊
// 修改前（開發分支 d5ce20a40）：L118 沒有 STAFF、REG、H2～H9——第 0～6、8、9 節丟例外中斷、第 7 節 4 項 FAIL，FAILED 13。用法：node tests/aa311_l118_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EAT|EAT_LINES|WZS|L118|LANE118_SHOPS|LANE118_LAYOUT|PARK|WZ_PARK_LAYOUT|SIDEQ|MSG|MSG_POOL|MSG2_POOL|FAV|FOOD_FAV_LINES|INVITE_REPLIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/invite_replies.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/eat_lines.js','src/eat3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/lane118.js',
  'src/data/wz_park_layout.js','src/wzpark3d.js','src/wzshops3d.js','src/sideq3d.js','src/data/food_fav_lines.js','src/foodfav3d.js']) load(f);
const AN='heroine_01', YT='heroine_03', PS='classmate_peishan', BH='classmate_bohan', XC='classmate_xinci';
const keyOf=d=>CALENDAR.dateOf(d).key, td=(t,w,wd)=>STORY.termDay(t,w,wd), DK=k=>STORY.dayOfKey(k);   /* td 的 wd：1＝週一…7＝週日 */
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const said=()=>H.said.map(x=>(x.who?x.who+'：':'')+x.t);
const has=t=>H.said.some(x=>x.t===t), idx=t=>H.said.findIndex(x=>x.t===t), whoOf=t=>(H.said.find(x=>x.t===t)||{}).who;
const seq=a=>a.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(a[i-1])));
let notes=[]; GM.addNote=(id,t)=>{ if(notes.some(n=>n.id===id)) return false; notes.push({id,t}); return true; }; GM.hasNote=id=>notes.some(n=>n.id===id);
GM.money=d=>{ H.G.money+=d; };
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; };
const fresh=(d,h,zone,flags)=>{ const G=H.fresh(keyOf(d),h,zone||'lane118',Object.assign({EXCHANGE_ROUTE:'TW'},flags||{})); G.outings=[]; G.notes=[]; notes=[]; at(d,h); if(typeof SIDEQ!=='undefined') SIDEQ.roll=()=>1; return G; };   /* 順手的事不開口（只測 AA_311）*/
const here=id=>{ if(GM.npc[id]) return GM.npc[id]; const n={name:SOCIAL.displayName(id),charId:id,obj:{position:{x:0,y:0,z:0}}}; GM.npc[id]=n; E.npcs.push(n); return n; };
const gone=id=>{ const n=GM.npc[id]; delete GM.npc[id]; E.npcs=E.npcs.filter(x=>x!==n); };
const met=id=>SOCIAL.remember(id,'FIRST_MET','');
const order=async(shop,picks,d,h)=>{ if(d!=null) at(d,h); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await L118.order(GM,shop); return said(); };
const lunch=(shop,w)=>{ H.G.flags.L118_LUNCH={day:H.G.day,shop,with:w||['zhe','yu']}; };   /* 【前置／捷徑】阿哲週一揪的午餐回了「走。」（lane118_unit 第 5 節測過手機那一段）*/
const L=()=>L118, menuShown=()=>H.opts.some(o=>o.some(t=>/　\d+ 元$/.test(t)));
const rec=()=>L118.rec(H.G);

(async()=>{
let doc='', d480=''; try{ doc=cp.execSync('git show 580ed6302:"docs/story_planning/AA_311_118巷每間店的故事.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }   /* alison.js：舊稿的舊名照匯入的規則換成 Alison */
try{ d480=cp.execSync('git show be47f6341:"docs/story_planning/AA_480_回LAWWW_118巷六題.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ d480=''; }
const part=(a,b)=>{ const i=doc.indexOf(a), j=b?doc.indexOf(b,i+1):-1; return i<0?'':doc.slice(i,j<0?undefined:j); };
const part480=(a,b)=>{ const i=d480.indexOf(a), j=b?d480.indexOf(b,i+1):-1; return i<0?'':d480.slice(i,j<0?undefined:j); };
const cellOne=c=>{ const m=/「([^」]+)」/.exec(c||''); return m?m[1]:null; };
/* ---- 0 稿 ---- */
await sec(0,()=>{ const s1=part('## 1.','## 2.'), s2=part('## 2.','## 3.'), s3=part('## 3.','## 4.'), s5=part('## 5.');
  check('0. 稿讀得到（580ed6302，第 1、2、3、5 節）',!!s1&&!!s2&&!!s3&&!!s5);
  const staff={}; for(const ln of s1.split('\n')){ const c=ln.split('|').map(x=>x.trim()); if(c.length>4&&/^[a-z0-9]+$/.test(c[1])) staff[c[1]]=c[3].replace(/（.*?）/g,''); }
  check('0. 第 1 節店員的稱呼（九間）＝L118.STAFF',Object.keys(staff).length===9&&J(staff)===J(Object.fromEntries(Object.keys(staff).map(k=>[k,L().STAFF[k]]))),J([staff,L().STAFF]));
  const cell=c=>{ const out=[]; const re=/(?:([^「」（）\s：]+)：)?「([^」]+)」|（([^）]+)）/g; let m; while((m=re.exec(c))) out.push(m[3]!=null?[null,'（'+m[3]+'）']:[m[1]||'@',m[2]]); return out; };
  const bad=[]; let n=0; for(const ln of s2.split('\n')){ const c=ln.split('|').map(x=>x.trim()); if(c.length<6||!/^[a-z0-9]+$/.test(c[1])) continue; n++; const id=c[1], Q=L().REG[id]||{};
    const kn=cell(c[2]).map(([w,t])=>[w!=null&&w!=='@'&&w===L().STAFF[id]?'@':w,t]), us=cell(c[3]), ex=c[4]==='—'?null:cell(c[4]);
    if(J(kn)!==J(Q.known)) bad.push([id,'認得你',kn,Q.known]);
    if(us.length!==1||us[0][1]!==Q.usual||(us[0][0]!=='@'&&us[0][0]!==L().STAFF[id])) bad.push([id,'老樣子',us,Q.usual]);
    if((ex?ex[0][1]:undefined)!==Q.exam||(ex&&ex[0][0]!=='@'&&ex[0][0]!==L().STAFF[id])) bad.push([id,'考試週',ex,Q.exam]); }
  check('0. 第 2 節熟客表九間逐格＝L118.REG（認得你、老樣子、考試週；說話的人＝第 1 節的店員）',n===9&&!bad.length,J(bad));
  check('0. 「老樣子」的選項照稿：「好」「看一下菜單」',J(L().USUAL_OPTS)===J(['好','看一下菜單'])&&s2.indexOf('選「好」')>=0&&s2.indexOf('選「看一下菜單」')>=0);
  const out=[], who=[]; const NM={[AN]:'以安',zhe:'阿哲',[BH]:'柏翰',[XC]:'芯慈'};
  for(const k of ['H2','H3','H4','H5','H6','H7','H8','H9']){ const Hk=L()[k]; const walk=(arr)=>{ for(const [w,t] of arr||[]){ out.push(t); if(w!=null) who.push([NM[w]||w,t]); } };
    walk(Hk.lines); walk(Hk.three); walk(Hk.third); if(Hk.done) out.push(Hk.done); for(const o of Hk.opts||[]){ out.push(o.t); walk(o.say); } }
  const segs=t=>String(t).split(/[（）「」]/).map(x=>x.replace(/^[。，：、]+|[。，：]+$/g,'').trim()).filter(x=>x.length>=2);
  const a3=part480('## 3.','## 4.');
  const miss=[...new Set(out)].filter(t=>segs(t).some(x=>s3.indexOf(x)<0&&s5.indexOf(x)<0&&a3.indexOf(x)<0));
  check('0. H2～H9 每一句台詞、旁白、選項都在稿裡（AA_311 第 3、5 節；H7 的「（不說話）」在 AA_480 第 3 節；一字不差）',out.length>=35&&!miss.length&&!!a3,out.length+' '+J(miss));
  const wb=who.filter(([w,t])=>![w+'：「'+t+'」',w+'「'+t+'」',w+'第一句換成「'+t+'」',w+'的招呼換成「'+t+'」',w+'：「理由：'+t+'」'].some(x=>s3.indexOf(x)>=0||s5.indexOf(x)>=0||a3.indexOf(x)>=0));   /* 以安那句：第 3 節的「理由：」第 5 節拿掉 */
  check('0. 說話的人照稿（店員、店長、老闆、老闆娘、阿哲、以安、柏翰、芯慈）',who.length>=24&&!wb.length,J(wb));
  const all=J([L().REG,L().H2,L().H3,L().H4,L().H5,L().H6,L().H7,L().H8,L().H9]);
  check('0. 第 5 節：沒有「小語」（Alison：「Alison 又帶朋友來了。小菜多一盤。」「你被 Alison 洗腦了。」）、以安不說「理由：」',!/小語/.test(all)&&!/理由：/.test(all)&&L().H5.lines[0][1]==='Alison 又帶朋友來了。小菜多一盤。'&&s5.indexOf('「'+L().H5.lines[0][1]+'」')>=0&&L().H3.lines[2][1]==='你的筆電電池撐不過一節課。'&&s5.indexOf('「你的筆電電池撐不過一節課。」')>=0);
  const src=fs.readFileSync(path.join(H.ROOT,'src/lane118.js'),'utf8');
  check('0. H2b 作廢（AA_334 第 2 節）：沒有做（遊戲裡沒有「好久不見。一樣嗎？」）',doc.indexOf('好久不見。一樣嗎？')>=0&&src.indexOf('好久不見')<0&&!L().H2b);
  /* AA_480 */
  const t1=part480('## 1.','## 2.'), u2={}; for(const ln of t1.split('\n')){ const c=ln.split('|').map(x=>x.trim()); const m=/^([a-z0-9]+) /.exec(c[1]||''); if(m&&c.length>4) u2[m[1]]=[cellOne(c[2]),cellOne(c[3])]; }
  const ub=Object.keys(u2).filter(id=>!(L().REG[id]&&L().REG[id].usual===u2[id][0]&&L().REG[id].usual2===u2[id][1]));
  check('0. AA_480 第 1 節：「老樣子」有菜名的五間，上次點別的那一句（滇香、好家、慢讀、Pasta、韓食）＝L118.REG 的 usual2；其他四間沒有',Object.keys(u2).length===5&&!ub.length&&['tea','home','omu','noodle2'].every(id=>!L().REG[id].usual2),J([u2,ub]));
  const a4=part480('## 4.','## 5.');
  check('0. AA_480 第 4 節：阿哲輪流 home 換好家，那一週「自助餐 我需要吃菜」（資料檔照 AA_280，程式換）',a4.indexOf('「'+L().LUNCH_FIX.text+'」')>=0&&J(L().baseRotation())===J(['noodle2','dian','korea','self'])&&J(LANE118_SHOPS.lunch.rotation)===J(['noodle2','dian','korea','home']),J(L().baseRotation()));
  check('0. AA_480 第 3 節：H7 兩個選項「她今天要換。」「（不說話）」',J(L().H7.opts.map(o=>o.t))===J(['「她今天要換。」','（不說話）'])&&a3.indexOf('「她今天要換。」')>=0&&a3.indexOf('（不說話）')>=0);
  check('0. AA_480 第 5 節：邀約的吃飯那一類（kind meal）多「Pasta 118」，週三休（週一、二、四、五）、平日中午',L().INVITE.kind==='meal'&&L().INVITE.name==='Pasta 118'&&J(L().INVITE.days)===J([1,2,4,5])&&part480('## 5.','## 6.').indexOf('「Pasta 118」')>=0&&!!INV.place('pasta118')); });

/* ---- 1 熟客 ---- */
await sec(1,async()=>{ const days=[1,2,3,4,5,6].map(w=>td('Y1S1',3,w)).concat([1,2,3,4,5,6].map(w=>td('Y1S1',4,w)));   /* 大一上第 3、4 週週一～六（麵舖週日休）*/
  fresh(days[0],12.5,'l118_noodle2'); const G=H.G; const g=[];
  for(let i=0;i<7;i++){ await order('noodle2',['乾麵＋滷蛋'],days[i],12.5); g.push(H.said[0]&&H.said[0].who+'：'+H.said[0].t); if(i===0){ await order('noodle2',['餛飩湯'],days[0],13.4); g.push('同一天：'+(H.said[0]&&H.said[0].t)); } }
  check('1. 第 1、2 次：老闆「大碗小碗？」（AA_280）；同一天再點不算第二次；第 3～7 次：老闆「大碗喔？」',J(g)===J(['老闆：大碗小碗？','同一天：大碗小碗？','老闆：大碗小碗？','老闆：大碗喔？','老闆：大碗喔？','老闆：大碗喔？','老闆：大碗喔？','老闆：大碗喔？'])&&rec().n.noodle2===7,J([g,rec().n]));
  const m0=G.money; await order('noodle2',['好'],days[7],12.5);
  check('1. 第 8 次：老闆「大碗加蛋喔。」→「好」「看一下菜單」→ 選「好」直接點上次那一樣（乾麵＋滷蛋，不出選單、扣 75）',J(H.opts[0])===J(['好','看一下菜單'])&&H.said[0].t==='大碗加蛋喔。'&&H.said[0].who==='老闆'&&has('（你點了乾麵＋滷蛋。）')&&!menuShown()&&G.money===m0-75,J([said(),H.opts,m0-G.money]));
  await order('noodle2',['看一下菜單','牛肉麵'],days[8],12.5);
  check('1. 選「看一下菜單」：照常出選單、點別的（牛肉麵）',menuShown()&&has('（你點了牛肉麵。）'),J([said(),H.opts]));
  await order('noodle2',['看一下菜單','不用了'],days[9],12.5); const n10=rec().n.noodle2; await order('noodle2',['看一下菜單','不用了'],days[10],12.5);
  check('1. 沒點東西（看一下菜單 → 不用了）不算一次',n10===9&&rec().n.noodle2===9,J(rec().n));
  /* 說了菜名的老樣子（滇香「一樣椒麻雞？」）：上次點別的＝不帶菜名那一句（AA_480 第 1 節，不倒回「認得你」）；上次點椒麻雞飯＝老樣子 */
  fresh(days[0],12.5,'l118_dian'); for(let i=0;i<7;i++) await order('dian',['酸辣河粉'],days[i],12.5); await order('dian',['好'],days[7],12.5);
  const a=said(), oa=H.opts.slice(); await order('dian',['看一下菜單','椒麻雞飯'],days[8],12.5); await order('dian',['好'],days[9],12.5); const b=said();
  check('1. 滇香第 8 次、上次點酸辣河粉：老闆娘「跟上次一樣？」（不說「一樣椒麻雞？」、不倒回「認得你」）→「好」＝酸辣河粉；上次點椒麻雞飯：「一樣椒麻雞？」→「好」＝椒麻雞飯',
    a[0]==='老闆娘：跟上次一樣？'&&J(oa[0])===J(['好','看一下菜單'])&&a.includes('（你點了酸辣河粉。）')&&!a.some(t=>/一樣椒麻雞|又來了喔/.test(t))&&b[0]==='老闆娘：一樣椒麻雞？'&&b.includes('（你點了椒麻雞飯。）'),J([a,b]));
  const u2=[['self','加滷蛋','一樣那幾樣？','自助餐（三菜一肉）','一樣三菜一肉？'],['cafe2','拿鐵','一樣的？','美式咖啡','一樣美式？'],['pasta','番茄海鮮麵','跟上次一樣？','白醬雞肉麵','一樣白醬？'],['korea','海苔飯捲','一樣的？','石鍋拌飯','一樣拌飯？']].map(([id,other,l2,item,l1])=>{
    fresh(days[0],12,'l118_'+id); const R=rec(); R.n[id]=7; R.d[id]=days[0]-1; R.last[id]=other; const x=L().stage(H.G,id); R.last[id]=item; const y=L().stage(H.G,id);
    const menu=L().shop(id).menu.map(m=>m[0]); return [id,x&&x.lines[0][1]===l2&&x.usual===menu.indexOf(other)&&y&&y.lines[0][1]===l1&&y.usual===menu.indexOf(item)]; });
  check('1. 其他四間第 8 次：上次點別的＝好家「一樣那幾樣？」、慢讀「一樣的？」、Pasta「跟上次一樣？」、韓食「一樣的？」（「好」點上次那一樣）；上次就是那一樣＝有菜名那一句',u2.every(x=>x[1]),J(u2));
  /* 好家自助餐：認得你兩行（阿姨一句＋旁白）；一一八茶飲 {上次點的} */
  fresh(days[0],12,'l118_self'); for(let i=0;i<2;i++) await order('self',['加滷蛋'],days[i],12); await order('self',['加滷蛋'],days[2],12);
  check('1. 好家自助餐第 3 次：阿姨「同學，自己夾喔。」＋（她多看了你一眼。）',seq(['同學，自己夾喔。','（她多看了你一眼。）'])&&whoOf('同學，自己夾喔。')==='阿姨'&&whoOf('（她多看了你一眼。）')==null,J(said()));
  fresh(days[0],15,'l118_tea'); for(let i=0;i<7;i++) await order('tea',['檸檬綠'],days[i],15); await order('tea',['好'],days[7],15);
  check('1. 一一八茶飲第 8 次：店員「檸檬綠，對吧。」→「好」＝檸檬綠',H.said[0].t==='檸檬綠，對吧。'&&H.said[0].who==='店員'&&has('（你點了檸檬綠。）'),J(said()));
  /* 考試週 */
  const ex=async(shop,d,h,item)=>{ fresh(d,h,'l118_'+shop); await order(shop,[item]); return H.said[0]?H.said[0].who+'：'+H.said[0].t:''; };
  const r={self8:await ex('self',td('Y1S1',8,2),12,'加滷蛋'),tea9:await ex('tea',td('Y1S1',9,3),15,'紅茶拿鐵'),cafe16:await ex('cafe2',td('Y1S1',16,3),15,'拿鐵'),y4s2w15:await ex('self',td('Y4S2',15,2),12,'加滷蛋'),
    y4s2w14:await ex('self',td('Y4S2',14,2),12,'加滷蛋'),self7:await ex('self',td('Y1S1',7,2),12,'加滷蛋'),self10:await ex('self',td('Y1S1',10,2),12,'加滷蛋'),noodle8:await ex('noodle2',td('Y1S1',8,2),12.5,'餛飩湯'),y0:await ex('tea',td('Y0S1',16,3),15,'紅茶拿鐵')};
  check('1. 考試週（第一次來也算）：自助餐第 8 週、茶飲第 9 週、慢讀第 16 週、大四下第 15 週換那一句；第 7、10 週、大四下第 14 週照舊；麵舖（沒有考試週那句）照舊',
    r.self8==='阿姨：考試喔？多夾一點，不加錢。'&&r.tea9==='店員：考試週喔。……今天幫你多加一點冰塊，醒腦。'&&r.cafe16==='店長：今天人多，窗邊滿了。吧檯可以嗎？'&&r.y4s2w15==='阿姨：考試喔？多夾一點，不加錢。'&&
    r.y4s2w14==='阿姨：自己夾，夾好拿過來算。'&&r.self7==='阿姨：自己夾，夾好拿過來算。'&&r.self10==='阿姨：自己夾，夾好拿過來算。'&&r.noodle8==='老闆：大碗小碗？',J(r));
  /* 考試週蓋過老樣子 */
  fresh(days[0],12,'l118_self'); rec().n.self=9; rec().d.self=days[0]-1; rec().last.self='自助餐（三菜一肉）'; at(td('Y1S1',9,2),12); await order('self',['加滷蛋']);
  check('1. 考試週＋第 10 次：考試週那句、不問「一樣三菜一肉？」、照常出選單',H.said[0].t==='考試喔？多夾一點，不加錢。'&&!has('一樣三菜一肉？')&&menuShown(),J(said()));
  /* 和人一起來：照舊「幾位？」（熟客只有一個人的招呼）*/
  fresh(td('Y1S1',5,1),12.5,'l118_noodle2'); rec().n.noodle2=9; rec().d.noodle2=td('Y1S1',5,1)-1; rec().last.noodle2='牛肉麵'; met('zhe'); here('zhe'); await order('noodle2',['牛肉麵']);
  check('1. 和阿哲一起來（第 10 次）：老闆「幾位？……那邊那張可以坐。」，不說熟客那句',H.said[0].t==='幾位？……那邊那張可以坐。'&&!has('大碗加蛋喔。')&&!has('大碗喔？'),J(said()));
  /* 舊存檔 */
  let err=null; fresh(td('Y1S1',5,2),12,'l118_self'); delete H.G.l118; try{ await order('self',['加滷蛋']); }catch(e){ err=e; } const ok1=!err&&H.G.l118&&H.G.l118.n.self===1;
  fresh(td('Y1S1',5,2),12,'l118_self'); H.G.l118=[1,2]; err=null; try{ await order('self',['加滷蛋']); }catch(e){ err=e; }
  check('1. 舊存檔沒有 G.l118（或壞掉）：點餐不壞、從 0 開始記',ok1&&!err&&H.G.l118.n.self===1,String(err)); });

/* ---- 2 H2 ---- */
await sec(2,async()=>{ const wed=td('Y2S2',3,3), H2=L().H2;
  const setup=(flags)=>{ fresh(td('Y1S1',3,3),12.5,'l118_omu',flags); met(PS); here(PS); };
  setup(); await order('omu',['咖哩蛋包飯','（就這樣）']); const ate=!!L().ateWith(H.G,PS,'omu'); gone(PS);
  await order('omu',['番茄醬蛋包飯','「她最近比較忙。」'],wed,12.5);
  check('2. H2 大二下週三 12:30、之前和沛珊在蛋包飯研究所一起吃過：店員「那個每次都點番茄醬蛋包飯的女生，這學期都沒來耶。」→「她最近比較忙。」→「喔。那你跟她說，本所幫她留位子。」',
    ate&&seq(['（你點了番茄醬蛋包飯。）',H2.lines[0][1],'喔。那你跟她說，本所幫她留位子。'])&&whoOf(H2.lines[0][1])==='店員'&&J(H.opts[H.opts.length-1])===J(['「她最近比較忙。」','「……我也不知道。」']),J([said(),H.opts]));
  await order('omu',['番茄醬蛋包飯'],wed,12.6); const s1=!has(H2.lines[0][1]); await order('omu',['番茄醬蛋包飯'],wed+7,12.5); const s2=!has(H2.lines[0][1]);
  check('2. H2 只一次',s1&&s2);
  setup(); await order('omu',['咖哩蛋包飯','（就這樣）']); gone(PS); await order('omu',['咖哩蛋包飯','「……我也不知道。」'],wed,12.2);
  check('2. 選「……我也不知道。」→（店員點點頭，沒有再問。）；12:12 點也算',seq([H2.lines[0][1],'（店員點點頭，沒有再問。）'])&&!has('喔。那你跟她說，本所幫她留位子。'),J(said()));
  const neg=async(d,h,o)=>{ o=o||{}; if(o.noMeal){ fresh(d,h,'l118_omu'); } else { setup(); await order('omu',['咖哩蛋包飯','（就這樣）']); gone(PS); } await order('omu',['咖哩蛋包飯'],d,h); return !has(H2.lines[0][1]); };
  const r={noMeal:await neg(wed,12.5,{noMeal:true}),thu:await neg(wed+1,12.5),late:await neg(wed,13.05),early:await neg(wed,12.1),y2s1:await neg(td('Y2S1',3,3),12.5),y3:await neg(td('Y3S1',3,3),12.5)};
  check('2. H2 不演：沒和她一起吃過、週四、13:03、12:06、大二上（她還在）、大三',Object.values(r).every(x=>x),J(r));
  setup(); await order('omu',['咖哩蛋包飯','（就這樣）']); gone(PS); H.date(PS); await order('omu',['咖哩蛋包飯'],wed,12.5);
  check('2. 和她交往中照演、選項一樣（第 5 節）',has(H2.lines[0][1])&&J(H.opts[H.opts.length-1])===J(['「她最近比較忙。」','「……我也不知道。」']),J(said()));
  fresh(wed,12.5,'l118_omu'); H.G.fav={know:{[PS]:td('Y1S1',3,3)},right:{}}; await order('omu',['咖哩蛋包飯']);
  check('2. 舊存檔（沒有一起吃的次數，AA_410 記過她那一句）也算一起吃過',has(H2.lines[0][1]),J(said())); });

/* ---- 3 H3 ---- */
await sec(3,async()=>{ const wed=td('Y1S1',5,3), H3=L().H3;
  const setup=(d,h,o)=>{ o=o||{}; fresh(d,h,'l118_cafe2'); met(AN); if(o.partner!==false) SOCIAL.remember(AN,'REPORT_PARTNER','民總'); if(o.here!==false) here(AN); };
  setup(wed,12.5); await order('cafe2',['美式咖啡']); const nmAN=GM.npc[AN].name;
  check('3. H3 大一上週三 12:30、以安在慢讀咖啡、民總報告同一組：店長「窗邊那張有插座。她幫你留了。」→（以安把她的包…）→ 以安「你的筆電電池撐不過一節課。」代替「幾位？」→ 點餐 → 她那句「這間週二休息，我查過了。」',
    J(said().slice(0,3))===J(['店長：'+H3.lines[0][1],H3.lines[1][1],nmAN+'：'+H3.lines[2][1]])&&!has('幾位？……那邊那張可以坐。')&&seq([H3.lines[2][1],'（你點了美式咖啡。）','這間週二休息，我查過了。'])&&!said().some(t=>/理由：/.test(t)),J(said()));
  await order('cafe2',['美式咖啡'],wed+7,12.5); check('3. H3 只一次（下週三照舊「幾位？」）',H.said[0].t==='幾位？……那邊那張可以坐。'&&!has(H3.lines[0][1]),J(said()));
  const neg=async(d,h,o)=>{ setup(d,h,o); await order('cafe2',['美式咖啡']); return !has(H3.lines[0][1]); };
  const r={noPartner:await neg(wed,12.5,{partner:false}),y1s2:await neg(td('Y1S2',5,3),12.5),alone:await neg(wed,12.5,{here:false}),thu:await neg(wed+1,12.5)};
  check('3. H3 不演：沒有 REPORT_PARTNER、大一下、以安不在、週四',Object.values(r).every(x=>x),J(r)); });

/* ---- 4 H4 ---- */
await sec(4,async()=>{ const H4=L().H4;
  /* 好家：週一阿哲約的午餐（柏翰那天也在好家，AA_480 第 4 節：阿哲那一場優先，柏翰那一桌不另外演）*/
  fresh(td('Y1S1',3,1),12.5,'l118_self'); met('zhe'); met('yu'); met(BH); here(BH); lunch('self'); const cs=L().companions(GM,'self'); await order('self',['加滷蛋']); const s0=said(); gone(BH);
  check('4. 週一阿哲約在好家：一起吃的是阿哲、Alison（柏翰不算這一桌：沒有他那一句、不記他一起吃）',J(cs)===J(['zhe','yu'])&&!s0.some(t=>/十二點四十了/.test(t))&&!L().ateWith(H.G,BH,'self')&&!!L().ateWith(H.G,'zhe','self'),J([cs,s0]));
  at(td('Y1S1',4,1),12.5); lunch('dian'); await order('dian',['椒麻雞飯']); at(td('Y1S1',5,1),12.5); lunch('korea'); await order('korea',['石鍋拌飯']);
  at(td('Y1S1',5,3),12.5); H.G.flags.L118_LUNCH=null; here('zhe'); await order('noodle2',['牛肉麵']); const first=!has(H4.lines[0][1]);
  check('4. 前提：好家、滇香、韓食（週一約好的午餐）、麵舖（週三常客）都和阿哲一起吃過；第四間剛好是麵舖的那一次不演',['self','dian','korea','noodle2'].every(s=>(L().ateWith(H.G,'zhe',s)||{}).n>=1)&&first,J([rec().w,said()]));
  await order('noodle2',['牛肉麵','「滇緬那間。」'],td('Y1S1',7,3),12.5);
  check('4. H4 之後在麵舖吃完：阿哲那一句之後「欸，118 巷四間都吃過了。」「我的排名：這間第一。……你的呢？」→ 三選一 →「滇緬那間。」→「辣的喔……好，下禮拜去那間。」；記 ZHE_118_RANK＝dian',
    seq(['這間我給八十分。上次那間七十。',H4.lines[0][1],H4.lines[1][1],'辣的喔……好，下禮拜去那間。'])&&whoOf(H4.lines[0][1])===GM.npc.zhe.name&&J(H.opts[H.opts.length-1])===J(['「這間第一。」','「滇緬那間。」','「韓式。」'])&&H.G.flags.ZHE_118_RANK==='dian',J([said(),H.opts]));
  await order('noodle2',['牛肉麵'],td('Y1S1',7,3)+5,12.5); check('4. H4 只一次',!has(H4.lines[0][1]));
  const T=w=>CALENDAR.termOf(td('Y1S1',w,1)), ls=(t,w)=>L().lunchShop(CALENDAR.termOf(td(t,w,1)),H.G), none={flags:{}};
  const got=[ls('Y1S1',8),ls('Y1S1',9),ls('Y1S1',10),ls('Y1S1',11),ls('Y1S1',12),ls('Y1S2',2),ls('Y1S2',3)], base=[2,3,4,5,6].map(w=>L().lunchShop(T(w),none));
  check('4. 輪流（AA_480 第 4 節）：沒選過＝麵舖 → 滇香 → 韓食 → 好家 → 麵舖；選了滇香＝從下一週（第 8 週）起滇香 → 麵舖 → 韓食 → 好家，下學期第 2 週也是滇香（沒選過的第 8 週是韓食）',
    J(base)===J(['noodle2','dian','korea','self','noodle2'])&&J(got)===J(['dian','noodle2','korea','self','dian','dian','noodle2'])&&L().lunchShop(T(8),none)==='korea',J([base,got]));
  const ph=async(w,rank)=>{ fresh(td('Y1S1',w,1),11.9,'campus'); PHONE.join(H.G,'noodle_team','麵店團'); H.G.flags.L118_FIRST_SENT=true; if(rank){ H.G.flags.ZHE_118_RANK=rank; rec().rankAt={term:'Y1S1',week:w}; } met('zhe');
    for(let h=11.95;h<=12.1;h+=0.05){ H.G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(H.G); } const m=(H.G.msgs||[]).filter(x=>x.th==='g:noodle_team').map(x=>x.text); return [m,(H.G.flags.L118_PICK||'')]; };
  const [p5]=await ph(5), [p8]=await ph(8,'dian');
  check('4. 手機：第 5 週（輪到好家）阿哲傳「自助餐 我需要吃菜」；選過滇香的第 8 週傳「今天換一間 我想吃滇緬」',p5.includes('自助餐 我需要吃菜')&&!p5.some(t=>/家常菜/.test(t))&&p8.includes('今天換一間 我想吃滇緬'),J([p5,p8]));
  { fresh(td('Y1S1',5,1),11.9,'campus'); PHONE.join(H.G,'noodle_team','麵店團'); H.G.flags.L118_FIRST_SENT=true; met('zhe'); for(let h=11.95;h<=12.1;h+=0.05){ H.G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(H.G); }
    PHONE.answer(H.G,'l118_lunch_'+H.G.day,0); STORY.phoneRules(GM); const q=OUT.get(H.G,'l118_lunch_'+H.G.day);
    check('4. 回「走。」：12:15 出遊到好家門口（goto 118 巷）、約好的午餐在好家',!!q&&q.goto&&q.goto.zone==='lane118'&&H.G.flags.L118_LUNCH&&H.G.flags.L118_LUNCH.shop==='self'&&/好家自助餐/.test(q.title||''),J([q&&q.title,H.G.flags.L118_LUNCH])); }
  /* 舊存檔：和阿哲吃過家常菜（週日坐過去一起吃，AA_320 L1）也算那一間 */
  fresh(td('Y1S1',3,7),12.5,'l118_home'); met('zhe'); met('yu'); here('zhe'); await order('home',['排骨飯','坐過去一起吃']); const hm=!!L().ateWith(H.G,'zhe','home'); gone('zhe');
  at(td('Y1S1',4,1),12.5); lunch('dian'); await order('dian',['椒麻雞飯']); at(td('Y1S1',5,1),12.5); lunch('korea'); await order('korea',['石鍋拌飯']);
  at(td('Y1S1',5,3),12.5); H.G.flags.L118_LUNCH=null; here('zhe'); await order('noodle2',['牛肉麵']); await order('noodle2',['牛肉麵'],td('Y1S1',6,3),12.5);
  check('4. 舊存檔和阿哲吃過家常菜（週日坐過去一起吃）＝算那一間：沒去好家也演 H4',hm&&!L().ateWith(H.G,'zhe','self')&&has(H4.lines[0][1]),J([rec().w,said()]));
  const other=async(pick)=>{ fresh(td('Y1S1',7,3),12.5,'l118_noodle2'); met('zhe'); here('zhe'); for(const s of ['noodle2','dian','korea','self']) rec().w['zhe@'+s]={n:1,d0:H.G.day-3,d:H.G.day-3}; await order('noodle2',['牛肉麵',pick]); return [said(),H.G.flags.ZHE_118_RANK]; };   /* 【前置／捷徑】四間的次數直接寫進存檔 */
  const [a,ra]=await other('「這間第一。」'), [b,rb]=await other('「韓式。」');
  check('4. 「這間第一。」→「英雄所見略同。老闆，他也是大碗。」（noodle2）；「韓式。」→「你被 Alison 洗腦了。」（korea）',a.some(t=>t.endsWith('：英雄所見略同。老闆，他也是大碗。'))&&ra==='noodle2'&&b.some(t=>t.endsWith('：你被 Alison 洗腦了。'))&&rb==='korea',J([a,b])); });

/* ---- 5 H5 ---- */
await sec(5,async()=>{ const H5=L().H5;
  fresh(td('Y1S1',3,2),12.5,'l118_korea'); met('yu'); here('yu'); await order('korea',['石鍋拌飯']); const a=said(); await order('korea',['海苔飯捲'],td('Y1S1',3,4),12.5); const b=said();
  check('5. H5 和 Alison 在韓食小廚（週二、四）：老闆「Alison 又帶朋友來了。小菜多一盤。」代替「幾位？」（每次）；吃完她那一句照舊',a[0]==='老闆：'+H5.lines[0][1]&&b[0]==='老闆：'+H5.lines[0][1]&&!a.includes('老闆：幾位？……那邊那張可以坐。')&&a.some(t=>t.endsWith('欸，下次換你選！我都選韓式。')),J([a,b]));
  fresh(td('Y1S1',5,1),12.5,'l118_korea'); met('zhe'); met('yu'); lunch('korea'); await order('korea',['石鍋拌飯']); const c=said();
  const mon=td('Y2S2',4,1); fresh(mon,12.5,'l118_korea'); met('zhe'); met('yu'); lunch('korea'); await order('korea',['石鍋拌飯']); const d=said(); at(mon+7,12.5); lunch('korea'); await order('korea',['石鍋拌飯']); const e=said();
  check('5. 阿哲、Alison 交往以前（大一）三個人＝每次那一句；大二上 12/19 起三個人：老闆「三位？」（他看了一下阿哲和 Alison 坐的位子。）「……兩位加一位。小菜一樣多一盤。」（一次，之後照每次那一句）',
    c[0]==='老闆：'+H5.lines[0][1]&&!c.includes('老闆：三位？')&&J(d.slice(0,3))===J(['老闆：三位？','（他看了一下阿哲和 Alison 坐的位子。）','老闆：……兩位加一位。小菜一樣多一盤。'])&&e[0]==='老闆：'+H5.lines[0][1]&&!e.includes('老闆：三位？'),J([c,d,e])); });

/* ---- 6 H6 ---- */
await sec(6,async()=>{ const H6=L().H6, d0=td('Y1S1',3,1);
  fresh(d0,12.2,'l118_self'); met(BH); here(BH); const r=[];
  await order('self',['加滷蛋'],d0,12.2); r.push(said()); await order('self',['加滷蛋'],d0,12.3); r.push(said());   /* 同一天兩次＝一次 */
  await order('self',['加滷蛋'],d0+1,12.2); r.push(said()); await order('self',['加滷蛋'],d0+2,12.2); r.push(said()); await order('self',['加滷蛋'],d0+3,12.2); r.push(said());
  const nm=GM.npc[BH].name, L0=nm+'：十二點四十了。我先回總圖。', Wt=[nm+'：'+H6.lines[0][1],nm+'：'+H6.lines[1][1]];
  check('6. H6 和柏翰一起吃：第 1、2 次（同一天兩次算一次）他「十二點四十了。我先回總圖。」；第三次：「十二點四十了。」「……今天等你五分鐘。」代替那一句；第 4 次照舊',
    r[0].includes(L0)&&r[1].includes(L0)&&r[2].includes(L0)&&!r[3].includes(L0)&&r[3].indexOf(Wt[0])>=0&&r[3].indexOf(Wt[1])===r[3].indexOf(Wt[0])+1&&r[4].includes(L0)&&!r[4].includes(Wt[1]),J(r)); });

/* ---- 7 H7 ---- */
await sec(7,async()=>{ const H7=L().H7, tues=[3,4,5,6,7,8].map(w=>td('Y1S1',w,2)), O=['「她今天要換。」','（不說話）'];
  fresh(tues[0],12.5,'l118_home'); met(XC); here(XC); const nm=GM.npc[XC].name, r=[];
  for(let i=0;i<3;i++){ await order('home',['排骨飯'],tues[i],12.5); r.push(said()); }
  const g0=['老闆娘：妹妹今天也是番茄炒蛋？',nm+'：……一樣。'];
  check('7. H7 和芯慈在家常菜（每次）：老闆娘「妹妹今天也是番茄炒蛋？」→ 芯慈「……一樣。」代替「幾位？」；第三次吃完，她那一句之後多「我發現我每次都點一樣的。……下次我想換。你幫我記著。」（第 1、2 次沒有）',
    r.every(x=>J(x.slice(0,2))===J(g0))&&!r[0].includes(nm+'：'+H7.third[0][1])&&!r[1].includes(nm+'：'+H7.third[0][1])&&r[2].indexOf(nm+'：'+H7.third[0][1])===r[2].indexOf(nm+'：下禮拜也來這間嗎？我先記一下。')+1,J(r));
  await order('home',['（不說話）','排骨飯'],tues[3],12.5); const s4=said(), o4=H.opts.slice();
  check('7. 下一次一起來：老闆娘那句以後馬上兩個選項「她今天要換。」「（不說話）」（不在點餐選單裡）；選「（不說話）」→ 芯慈「……一樣。」',
    s4[0]==='老闆娘：妹妹今天也是番茄炒蛋？'&&J(o4[0])===J(O)&&s4[1]===nm+'：……一樣。'&&!o4.slice(1).some(o=>o.includes(O[0])),J([s4,o4]));
  await order('home',['「她今天要換。」','雞腿便當'],tues[4],12.5); const s5=said(), o5=H.opts.slice();
  check('7. 沒選的下一次還會再出：選「她今天要換。」→ 芯慈「……排骨飯。」老闆娘「喔！難得！」→ 再點自己的（雞腿便當）；她沒有說「……一樣。」',
    J(o5[0])===J(O)&&J(s5.slice(0,3))===J(['老闆娘：妹妹今天也是番茄炒蛋？',nm+'：……排骨飯。','老闆娘：喔！難得！'])&&s5.includes('（你點了雞腿便當。）')&&!s5.includes(nm+'：……一樣。'),J([s5,o5]));
  await order('home',['排骨飯'],tues[5],12.5);
  check('7. 選過以後照舊：老闆娘「妹妹今天也是番茄炒蛋？」→ 芯慈「……一樣。」，沒有那兩個選項',J(said().slice(0,2))===J(g0)&&!H.opts.some(o=>o.includes(O[0])),J([said(),H.opts]));
  /* 舊存檔（v9.10.13：選項出過一次就記 H7b，沒有記選了什麼）：沒有 H7c＝下一次照樣出那兩個選項，選了才記 H7c、之後不再出 */
  fresh(tues[2],12.5,'l118_home'); met(XC); here(XC); rec().w[XC+'@home']={n:4,d0:tues[0],d:tues[1]}; rec().once.H7a=tues[0]; rec().once.H7b=tues[1];   /* 【前置／捷徑】舊存檔的 G.l118 直接寫 */
  await order('home',['（不說話）','排骨飯'],tues[2],12.5); const q1=H.opts.slice(), c1=rec().once.H7c;
  await order('home',['「她今天要換。」','排骨飯'],tues[3],12.5); const q2=H.opts.slice(), s2=said();
  await order('home',['排骨飯'],tues[4],12.5); const q3=H.opts.slice();
  check('7. 舊存檔（v9.10.13 記了 H7b、沒有 H7c）：下一次照樣出那兩個選項；「（不說話）」不記，下一次再出；選「她今天要換。」記 H7c，之後不出',
    J(q1[0])===J(O)&&c1==null&&J(q2[0])===J(O)&&s2[1]===nm+'：……排骨飯。'&&rec().once.H7c===tues[3]&&!q3.some(o=>o.includes(O[0])),J([q1,q2,s2,q3,rec().once])); });

/* ---- 8 H8 ---- */
await sec(8,async()=>{ const H8=L().H8, mon=td('Y2S1',3,1), know=FOOD_FAV_LINES[YT].know[0][1];
  fresh(mon,12.5,'l118_dian'); met(YT); here(YT); await order('dian',['椒麻雞飯','（就這樣）']); gone(YT);
  await order('dian',['椒麻雞飯'],mon,13.5); const same=!has(H8.lines[0][1]);
  await order('dian',['椒麻雞飯','「她問什麼？」'],mon+1,12.5); const s1=said();
  check('8. H8 大二上和語彤在滇香一起吃過以後，同一天再來＝沒有；別天自己來：老闆娘「上次跟你一起來的那個妹妹，…」「問了兩個小時，…」→「她是社會系的。」／「她問什麼？」→「問我為什麼開在這裡。……」',
    same&&seq([H8.lines[0][1],H8.lines[1][1],'問我為什麼開在這裡。……我說房租便宜啊。她寫了一整頁。'])&&whoOf(H8.lines[0][1])==='老闆娘'&&J(H.opts[H.opts.length-1])===J(['「她是社會系的。」','「她問什麼？」']),J([s1,H.opts]));
  check('8. AA_410 老闆娘說她點法的那兩句：H8 那一天不說',!s1.some(t=>t.endsWith(know))&&!FAV.know(H.G,YT),J(s1));
  await order('dian',['椒麻雞飯'],mon+2,12.5); const s2=said(); await order('dian',['椒麻雞飯'],mon+3,12.5); const s3=said();
  check('8. 再下一次（別天）：老闆娘說她的點法（AA_410），H8 不再演；之後都沒有',s2.some(t=>t.endsWith(know))&&!s2.some(t=>t.endsWith(H8.lines[0][1]))&&!s3.some(t=>t.endsWith(know))&&!s3.some(t=>t.endsWith(H8.lines[0][1])),J([s2,s3]));
  fresh(mon,12.5,'l118_dian'); met(YT); here(YT); await order('dian',['椒麻雞飯','（就這樣）']); gone(YT); await order('dian',['椒麻雞飯','「她是社會系的。」'],mon+1,12.5);
  check('8. 選「她是社會系的。」→「難怪。她問的我都沒想過。」',seq([H8.lines[1][1],'難怪。她問的我都沒想過。']),J(said()));
  fresh(mon+1,12.5,'l118_dian'); met(YT); await order('dian',['椒麻雞飯']); const n1=!has(H8.lines[0][1]);
  fresh(mon,12.5,'l118_dian'); met(YT); here(YT); await order('dian',['椒麻雞飯','（就這樣）']); await order('dian',['椒麻雞飯','（就這樣）'],mon+7,12.5); const n2=!has(H8.lines[0][1]);
  check('8. H8 不演：沒和她一起吃過；和她一起來（不是自己來）',n1&&n2);
  /* 舊存檔：只有 AA_410 記的 ytWith（沒有一起吃的次數）；老闆娘說她點法那兩句已經演過、而且是今天＝H8 等到別天 */
  fresh(mon+2,12.5,'l118_dian'); met(YT); H.G.fav={know:{[YT]:mon+2},right:{},ytWith:mon}; SOCIAL.remember(YT,'KNOW_FAV_YT',''); await order('dian',['椒麻雞飯']); const o1=!has(H8.lines[0][1]);
  await order('dian',['椒麻雞飯'],mon+3,12.5); const o2=has(H8.lines[0][1])&&!said().some(t=>t.endsWith(know));
  check('8. 舊存檔（只有 AA_410 的 ytWith）：老闆娘說她點法的那一天不演 H8，別天自己來演 H8',o1&&o2,J(said())); });

/* ---- 9 H9 ---- */
await sec(9,async()=>{ const H9=L().H9, tue=td('Y2S1',4,2), PV='去 Pasta 118 吃午餐';
  /* 約：交往中用手機約她（INV.flow，沒有 n＝手機）；見面：約好的時間她在 Pasta 118（INV.entryFor）、你也進來＝INV.startTogether（遊戲裡是 INV.autoStart 叫的）*/
  const invite=async(id,d,picks)=>{ at(d,10); H.G.zone='campus'; H.said=[]; H.opts=[]; H.picks=picks.slice(); const iv=await INV.flow(GM,id,null,false); return {iv,list:((H.opts[0]&&H.opts[0].all)||H.opts[0]||[]).slice(),said:said()}; };   /* all：分層的一類展開（INVITE-MENU-1030：Pasta 118 在「吃飯…」裡）*/
  const meet=async(iv,pick)=>{ at(iv.day,iv.h); H.G.zone='l118_pasta'; GM.npc={}; E.npcs=[]; const n=here(iv.who); const m0=H.G.money, h0=H.G.hour; H.said=[]; H.opts=[]; H.picks=[pick||'白醬雞肉麵'];
    await INV.startTogether(GM,iv,n); return {said:said(),paid:m0-H.G.money,mins:Math.round((H.G.hour-h0)*60)}; };
  fresh(tue,10,'campus'); H.FRIEND(AN); H.date(AN); INV.addContact(H.G,AN);
  const A=await invite(AN,tue,[PV,'今天 12:10']);
  check('9. 交往中、平日用手機約以安：地點多「去 Pasta 118 吃午餐」→ 今天 12:10 → 她答應（照現有的答應句，不另寫）→ 約好 12:10 Pasta 118',
    A.list.includes(PV)&&!!A.iv&&A.iv.place==='pasta118'&&A.iv.state==='accepted'&&Math.abs(A.iv.h-(12+10/60))<1e-3&&A.said.some(t=>t.endsWith('約好 今天 12:10，Pasta 118。')),J([A.list,A.said,A.iv]));
  const e=INV.entryFor(Object.assign({},H.G,{day:A.iv.day,hour:12.1}),AN);
  check('9. 約好的時間她在 Pasta 118 吃（作息的覆寫：l118_pasta、eat）',!!e&&e.zone==='l118_pasta'&&e.act==='eat',J(e&&{zone:e.zone,act:e.act}));
  const M1=await meet(A.iv);
  check('9. 見面＝在店裡和她一起點餐：老闆「兩位嗎？窗邊有位子。」→ 點自己的（扣錢）→ 吃完（窗外的巷子有人牽著腳踏車經過。你們都沒有急著走。）；時間只走一次（40 分鐘）；約好的事做完、記一起吃飯',
    M1.said.includes('老闆：'+H9.lines[0][1])&&!M1.said.includes('老闆：幾位？……那邊那張可以坐。')&&M1.said.indexOf(H9.done)>M1.said.indexOf('（你點了白醬雞肉麵。）')&&M1.paid===130&&M1.mins===40&&A.iv.state==='done'&&SOCIAL.has(AN,'SHARED_MEAL')&&!M1.said.some(t=>t.endsWith('這間週二休息，我查過了。')),J(M1));
  const B=await invite(AN,tue+7,[PV,'今天 12:10']); const M2=await meet(B.iv);
  check('9. H9 只一次：下一次約來照一般的「幾位？……那邊那張可以坐。」、沒有那句旁白（她別間店的那一句也不說）',!!B.iv&&M2.said.includes('老闆：幾位？……那邊那張可以坐。')&&!M2.said.includes(H9.done)&&!M2.said.includes('老闆：'+H9.lines[0][1])&&!M2.said.some(t=>t.endsWith('這間週二休息，我查過了。')),J(M2));
  const wed=td('Y2S1',5,3), P=INV.place('pasta118'), dw=INV.decide(H.G,AN,'pasta118',wed,12+10/60);
  check('9. 週三（Pasta 118 休息）不行：改天，改的那天不是週三、是 12:10',dw.res==='resched'&&!!dw.alt&&CALENDAR.dateOf(dw.alt.day).wd!==3&&Math.abs(dw.alt.h-(12+10/60))<1e-3&&INV.timeOptions(H.G,false,P).every(q=>Math.abs(q.h-(12+10/60))<1e-3),J(dw));
  fresh(tue,10,'campus'); H.FRIEND(AN); INV.addContact(H.G,AN); H.said=[]; H.opts=[]; H.picks=['算了']; await INV.flow(GM,AN,null,false);
  const notDating=!(H.opts[0]||[]).includes(PV);
  fresh(tue,10,'campus'); H.FRIEND('kexin'); H.date('kexin'); H.said=[]; H.opts=[]; H.picks=['算了']; await INV.flow(GM,'kexin',null,false); const kx=!(H.opts[0]||[]).includes(PV);
  check('9. 沒交往＝地點沒有 Pasta 118；可昕（政大，手機只約一起運動、去校外）也沒有',notDating&&kx);
  /* 【前置／捷徑】H9 的條件本身（L118.withScene）：用約好午餐的資料放人進店 */
  const setup=(d,h,o)=>{ o=o||{}; fresh(d,h,'l118_pasta'); met(AN); met('zhe'); if(o.date!==false) H.date(AN); lunch('pasta',o.with||[AN]); };
  const neg=async(d,h,o)=>{ setup(d,h,o); await order('pasta',['白醬雞肉麵']); return !has(H9.lines[0][1])&&!has(H9.done); };
  const r={notDating:await neg(tue,12.5,{date:false}),sat:await neg(tue+4,12.5),night:await neg(tue,18.5),three:await neg(tue,12.5,{with:[AN,'zhe']})};
  check('9. H9 不演：沒交往、週六、晚上、三個人',Object.values(r).every(x=>x),J(r)); });

/* ---- 10 AA_329 第 3 節和熟客合併（AA_480 第 2 節）---- */
await sec(10,async()=>{ const days=[1,2,3,4,5].map(w=>td('Y1S1',3,w)), ES=EAT_LINES.staff, mo=()=>H.opts.find(o=>o.some(t=>/　\d+ 元$/.test(t)))||[];
  fresh(days[0],12.5,'l118_noodle2'); H.G.eat={n:{'六張犁麵舖':4},last:{'六張犁麵舖':'牛肉麵'}}; await order('noodle2',['老樣子']); const a=said(), oa=mo().slice();
  fresh(days[0],12.5,'l118_dian'); H.G.eat={n:{'滇香小館':4},last:{'滇香小館':'椒麻雞飯'}}; await order('dian',['老樣子']); const b=said();
  check('10. 118 巷第 5 次：不說 AA_329 那一句（麵舖「大碗？」、滇香「又是你。…」）；選單照樣有「老樣子」，選了店員回 AA_329 最右欄那句，說話的人照 AA_311 第 1 節（滇香＝老闆娘，不是「店員」）',
    !a.includes('老闆：'+ES['六張犁麵舖'].line5)&&oa.includes('老樣子')&&a.includes('老闆：'+ES['六張犁麵舖'].same)&&!b.some(t=>t.endsWith(ES['滇香小館'].line5))&&b.includes('老闆娘：'+ES['滇香小館'].same)&&!b.includes('店員：'+ES['滇香小館'].same),J([a,oa,b]));
  fresh(days[0],12.5,'l118_dian'); const R=rec(); R.n.dian=7; R.d.dian=days[0]-1; R.last.dian='椒麻雞飯'; H.G.eat={n:{'滇香小館':7},last:{'滇香小館':'椒麻雞飯'}}; await order('dian',['看一下菜單','酸辣河粉']); const c=said(), oc=mo().slice();
  check('10. 第 8 次：店員主動問過（「一樣椒麻雞？」）→ 選「看一下菜單」的選單沒有「老樣子」',c[0]==='老闆娘：一樣椒麻雞？'&&oc.length>0&&!oc.includes('老樣子')&&c.includes('（你點了酸辣河粉。）'),J([c,oc]));
  fresh(td('Y1S1',8,2),12,'l118_self'); const R2=rec(); R2.n.self=9; R2.d.self=H.G.day-1; R2.last.self='加滷蛋'; H.G.eat={n:{'好家自助餐':9},last:{'好家自助餐':'加滷蛋'}}; await order('self',['加滷蛋']); const d=said(), od=mo().slice();
  fresh(td('Y1S1',5,1),12.5,'l118_noodle2'); const R3=rec(); R3.n.noodle2=9; R3.d.noodle2=H.G.day-1; R3.last.noodle2='牛肉麵'; H.G.eat={n:{'六張犁麵舖':9},last:{'六張犁麵舖':'牛肉麵'}}; met('zhe'); here('zhe'); await order('noodle2',['牛肉麵']); const f=said(), of=mo().slice();
  check('10. 店員沒有主動問的時候照樣有「老樣子」：考試週（第 10 次也是考試週那句）、和人一起來（「幾位？」）',d[0]==='阿姨：考試喔？多夾一點，不加錢。'&&od.includes('老樣子')&&f[0]==='老闆：幾位？……那邊那張可以坐。'&&of.includes('老樣子'),J([d,od,f,of]));
  fresh(days[0],12,'noodle'); H.G.eat={n:{'阿鳳麵店':4},last:{'阿鳳麵店':'乾麵'}}; H.said=[]; H.opts=[]; H.picks=['老樣子']; const names=['乾麵','餛飩湯'], k=await EAT.choose(GM,'阿鳳麵店',names.map(t=>({t})).concat([{t:'不用了'}]),names,[50,40]);
  check('10. 其他店（阿鳳麵店）照 AA_329：第 5 次阿姨那一句、老樣子、阿姨回',has(ES['阿鳳麵店'].line5)&&whoOf(ES['阿鳳麵店'].line5)==='阿姨'&&k===0&&has(ES['阿鳳麵店'].same),J(said())); });

H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
