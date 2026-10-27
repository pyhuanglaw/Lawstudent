// AA_311 118 巷每間店的故事（企劃線 580ed6302；第 5 節的改法優先；任務 LANE118-SHOP-STORY-1020／USER_WANTS X66）：熟客三段招呼＋考試週、H2～H9——不需要瀏覽器。
//   0  稿：第 1 節店員的稱呼、第 2 節熟客表（認得你／老樣子／考試週）逐格一樣；H2～H9 每一句台詞、旁白、選項都在稿裡（一字不差、說話的人對）；
//      第 5 節：小語→Alison、以安不說「理由：」；H2b 作廢（沒有「好久不見。一樣嗎？」）
//   1  熟客（一個人來）：第 1～2 次照 AA_280；第 3 次起「認得你」；第 8 次起「老樣子」→「好」直接點上次那一樣（不出選單、照樣扣錢）／「看一下菜單」照常點；
//      一天最多記一次；說了菜名的「老樣子」上次點別的＝「認得你」；茶飲換上次點的；沒點東西不算；
//      考試週（期中第 8、9 週、期末第 16 週；大四下第 15 週）有那一句的三間換那一句、其他店照舊；和人一起來照舊「幾位？」；舊存檔沒有 G.l118 不壞
//   2  H2 蛋包飯研究所 × 沛珊（大二下週三中午、之前一起吃過；交往中照演；一次）
//   3  H3 慢讀咖啡 × 以安（大一上週三中午、她在、REPORT_PARTNER；代替「幾位？」；一次）
//   4  H4 六張犁麵舖 × 阿哲（四間都一起吃過以後在麵舖吃完；家常菜可以是週日「坐過去一起吃」；ZHE_118_RANK；阿哲揪午餐的輪流從下一週起由選的那間開始）
//   5  H5 韓食小廚 × Alison（每次）；大二上 12/19 起三個人（一次）
//   6  H6 好家自助餐 × 柏翰（第三次一起吃、12:39 以後還沒吃完：代替他吃完那一句；一次；一天只記一次）
//   7  H7 巷口家常菜 × 芯慈（每次的招呼；第三次吃完多一句；下一次選單多「她今天要換。」，只有那一次）
//   8  H8 滇香小館 × 語彤（大二上起一起吃過以後、別天自己來；AA_410 老闆娘說她點法的那兩句排在之後、不同一天）
//   9  H9 Pasta 118（平日中午、只和交往中的那一位：招呼、吃完的旁白；一次）【前置／捷徑】遊戲裡還沒有和交往對象一起去 118 巷吃午餐的路（只能用約好午餐的資料放她進來）
// 修改前（開發分支 d5ce20a40）：L118 沒有 STAFF、REG、H2～H9——各節丟例外中斷，FAILED（見提交說明）。用法：node tests/aa311_l118_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EAT|EAT_LINES|WZS|L118|LANE118_SHOPS|LANE118_LAYOUT|PARK|WZ_PARK_LAYOUT|SIDEQ|MSG|MSG_POOL|MSG2_POOL|FAV|FOOD_FAV_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/eat_lines.js','src/eat3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/lane118.js',
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
let doc=''; try{ doc=cp.execSync('git show 580ed6302:"docs/story_planning/AA_311_118巷每間店的故事.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }   /* alison.js：舊稿的「小語」照匯入的規則換成 Alison */
const part=(a,b)=>{ const i=doc.indexOf(a), j=b?doc.indexOf(b,i+1):-1; return i<0?'':doc.slice(i,j<0?undefined:j); };
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
    walk(Hk.lines); walk(Hk.three); walk(Hk.third); walk(Hk.swap); if(Hk.done) out.push(Hk.done); if(Hk.ask) out.push(Hk.ask); for(const o of Hk.opts||[]){ out.push(o.t); walk(o.say); } }
  const segs=t=>String(t).split(/[（）「」]/).map(x=>x.replace(/^[。，：、]+|[。，：]+$/g,'').trim()).filter(x=>x.length>=2);
  const miss=[...new Set(out)].filter(t=>segs(t).some(x=>s3.indexOf(x)<0&&s5.indexOf(x)<0));
  check('0. H2～H9 每一句台詞、旁白、選項都在稿第 3、5 節（一字不差）',out.length>=35&&!miss.length,out.length+' '+J(miss));
  const wb=who.filter(([w,t])=>![w+'：「'+t+'」',w+'「'+t+'」',w+'第一句換成「'+t+'」',w+'的招呼換成「'+t+'」',w+'：「理由：'+t+'」'].some(x=>s3.indexOf(x)>=0||s5.indexOf(x)>=0));   /* 以安那句：第 3 節的「理由：」第 5 節拿掉 */
  check('0. 說話的人照稿（店員、店長、老闆、老闆娘、阿哲、以安、柏翰、芯慈）',who.length>=24&&!wb.length,J(wb));
  const all=J([L().REG,L().H2,L().H3,L().H4,L().H5,L().H6,L().H7,L().H8,L().H9]);
  check('0. 第 5 節：沒有「小語」（Alison：「Alison 又帶朋友來了。小菜多一盤。」「你被 Alison 洗腦了。」）、以安不說「理由：」',!/小語/.test(all)&&!/理由：/.test(all)&&L().H5.lines[0][1]==='Alison 又帶朋友來了。小菜多一盤。'&&s5.indexOf('「'+L().H5.lines[0][1]+'」')>=0&&L().H3.lines[2][1]==='你的筆電電池撐不過一節課。'&&s5.indexOf('「你的筆電電池撐不過一節課。」')>=0);
  const src=fs.readFileSync(path.join(H.ROOT,'src/lane118.js'),'utf8');
  check('0. H2b 作廢（AA_334 第 2 節）：沒有做（遊戲裡沒有「好久不見。一樣嗎？」）',doc.indexOf('好久不見。一樣嗎？')>=0&&src.indexOf('好久不見')<0&&!L().H2b); });

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
  /* 說了菜名的老樣子（滇香「一樣椒麻雞？」）：上次點別的＝認得你；上次點椒麻雞飯＝老樣子 */
  fresh(days[0],12.5,'l118_dian'); for(let i=0;i<7;i++) await order('dian',['酸辣河粉'],days[i],12.5); await order('dian',['酸辣河粉'],days[7],12.5);
  const a=said(); await order('dian',['椒麻雞飯'],days[8],12.5); await order('dian',['好'],days[9],12.5); const b=said();
  check('1. 滇香第 8 次、上次點酸辣河粉：老闆娘「又來了喔。今天的椒麻雞我放少一點辣。」（不問「一樣椒麻雞？」）；上次點椒麻雞飯：「一樣椒麻雞？」→「好」＝椒麻雞飯',
    a[0]==='老闆娘：又來了喔。今天的椒麻雞我放少一點辣。'&&!a.includes('老闆娘：一樣椒麻雞？')&&b[0]==='老闆娘：一樣椒麻雞？'&&b.includes('（你點了椒麻雞飯。）'),J([a,b]));
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
  fresh(td('Y1S1',3,7),12.5,'l118_home'); met('zhe'); met('yu'); here('zhe');   /* 週日 12:30：阿哲照作息在家常菜吃（AA_320 L1）＝坐過去一起吃 */
  await order('home',['排骨飯','坐過去一起吃']); const h1=!!L().ateWith(H.G,'zhe','home'); gone('zhe');
  at(td('Y1S1',4,1),12.5); lunch('dian'); await order('dian',['椒麻雞飯']); at(td('Y1S1',5,1),12.5); lunch('korea'); await order('korea',['石鍋拌飯']);
  at(td('Y1S1',5,3),12.5); H.G.flags.L118_LUNCH=null; here('zhe'); await order('noodle2',['牛肉麵']); const first=!has(H4.lines[0][1]);
  check('4. 前提：家常菜（週日坐過去一起吃）、滇香、韓食（週一約好的午餐）、麵舖（週三常客）都和阿哲一起吃過；第四間剛好是麵舖的那一次不演',h1&&H4.shops.every(s=>(L().ateWith(H.G,'zhe',s)||{}).n>=1)&&first,J([rec().w,said()]));
  await order('noodle2',['牛肉麵','「滇緬那間。」'],td('Y1S1',7,3),12.5);
  check('4. H4 之後在麵舖吃完：阿哲那一句之後「欸，118 巷四間都吃過了。」「我的排名：這間第一。……你的呢？」→ 三選一 →「滇緬那間。」→「辣的喔……好，下禮拜去那間。」；記 ZHE_118_RANK＝dian',
    seq(['這間我給八十分。上次那間七十。',H4.lines[0][1],H4.lines[1][1],'辣的喔……好，下禮拜去那間。'])&&whoOf(H4.lines[0][1])===GM.npc.zhe.name&&J(H.opts[H.opts.length-1])===J(['「這間第一。」','「滇緬那間。」','「韓式。」'])&&H.G.flags.ZHE_118_RANK==='dian',J([said(),H.opts]));
  await order('noodle2',['牛肉麵'],td('Y1S1',7,3)+5,12.5); check('4. H4 只一次',!has(H4.lines[0][1]));
  const T=w=>CALENDAR.termOf(td('Y1S1',w,1)), ls=(t,w)=>L().lunchShop(CALENDAR.termOf(td(t,w,1)),H.G);
  const got=[ls('Y1S1',8),ls('Y1S1',9),ls('Y1S1',10),ls('Y1S1',11),ls('Y1S1',12),ls('Y1S2',2),ls('Y1S2',3)];
  check('4. 之後阿哲揪午餐：從下一週（第 8 週）起由滇香開始，滇香 → 麵舖 → 韓食 → 家常菜；下學期第 2 週也是滇香（沒選過＝第 8 週韓食）',
    J(got)===J(['dian','noodle2','korea','home','dian','dian','noodle2'])&&L().lunchShop(T(8),{flags:{}})==='korea',J(got));
  fresh(td('Y1S1',8,1),11.9,'campus'); PHONE.join(H.G,'noodle_team','麵店團'); H.G.flags.L118_FIRST_SENT=true; H.G.flags.ZHE_118_RANK='dian'; rec().rankAt={term:'Y1S1',week:8}; met('zhe');
  for(let h=11.95;h<=12.1;h+=0.05){ H.G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(H.G); }
  check('4. 手機：那個週一阿哲傳「今天換一間 我想吃滇緬」',(H.G.msgs||[]).some(m=>m.th==='g:noodle_team'&&m.text==='今天換一間 我想吃滇緬'),J((H.G.msgs||[]).filter(m=>m.th==='g:noodle_team').map(m=>m.text)));
  const other=async(pick)=>{ fresh(td('Y1S1',7,3),12.5,'l118_noodle2'); met('zhe'); here('zhe'); for(const s of H4.shops){ const w=rec().w['zhe@'+s]={n:1,d0:H.G.day-3,d:H.G.day-3}; } await order('noodle2',['牛肉麵',pick]); return [said(),H.G.flags.ZHE_118_RANK]; };   /* 【前置／捷徑】四間的次數直接寫進存檔 */
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
await sec(7,async()=>{ const H7=L().H7, tues=[3,4,5,6,7].map(w=>td('Y1S1',w,2));
  fresh(tues[0],12.5,'l118_home'); met(XC); here(XC); const nm=GM.npc[XC].name, r=[];
  for(let i=0;i<3;i++){ await order('home',['排骨飯'],tues[i],12.5); r.push(said()); }
  const g0=['老闆娘：妹妹今天也是番茄炒蛋？',nm+'：……一樣。'];
  check('7. H7 和芯慈在家常菜（每次）：老闆娘「妹妹今天也是番茄炒蛋？」→ 芯慈「……一樣。」代替「幾位？」；第三次吃完，她那一句之後多「我發現我每次都點一樣的。……下次我想換。你幫我記著。」（第 1、2 次沒有）',
    r.every(x=>J(x.slice(0,2))===J(g0))&&!r[0].includes(nm+'：'+H7.third[0][1])&&!r[1].includes(nm+'：'+H7.third[0][1])&&r[2].indexOf(nm+'：'+H7.third[0][1])===r[2].indexOf(nm+'：下禮拜也來這間嗎？我先記一下。')+1,J(r));
  await order('home',['「她今天要換。」','雞腿便當'],tues[3],12.5); const o4=H.opts.slice(), s4=said();
  check('7. 下一次一起來：老闆娘問的時候，選單最後多「她今天要換。」→ 芯慈「……排骨飯。」老闆娘「喔！難得！」→ 再點自己的（雞腿便當）；她沒有說「……一樣。」',
    s4[0]==='老闆娘：妹妹今天也是番茄炒蛋？'&&o4[0][o4[0].length-1]==='「她今天要換。」'&&seq(['……排骨飯。','喔！難得！','（你點了雞腿便當。）'])&&whoOf('……排骨飯。')===nm&&whoOf('喔！難得！')==='老闆娘'&&!has('……一樣。')&&!o4[1].includes('「她今天要換。」'),J([s4,o4]));
  await order('home',['排骨飯'],tues[4],12.5); check('7. 之後照舊（沒有那個選項）',J(said().slice(0,2))===J(g0)&&!H.opts.some(o=>o.includes('「她今天要換。」')),J([said(),H.opts]));
  fresh(tues[0],12.5,'l118_home'); met(XC); here(XC); for(let i=0;i<3;i++) await order('home',['排骨飯'],tues[i],12.5); await order('home',['排骨飯'],tues[3],12.5); const s5=said(); await order('home',['排骨飯'],tues[4],12.5);
  check('7. 那一次沒選：她照舊「……一樣。」；再下一次就沒有那個選項（只有下一次）',s5.includes(nm+'：……一樣。')&&!s5.includes(nm+'：……排骨飯。')&&!H.opts.some(o=>o.includes('「她今天要換。」')),J(s5)); });

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
  check('8. H8 不演：沒和她一起吃過；和她一起來（不是自己來）',n1&&n2); });

/* ---- 9 H9 ---- */
await sec(9,async()=>{ const H9=L().H9, tue=td('Y2S1',4,2);
  const setup=(d,h,o)=>{ o=o||{}; fresh(d,h,'l118_pasta'); met(AN); met('zhe'); if(o.date!==false) H.date(AN); lunch('pasta',o.with||[AN]); };   /* 【前置／捷徑】 */
  setup(tue,12.5); await order('pasta',['白醬雞肉麵']); const a=said();
  check('9. H9 平日中午、只和交往中的以安一起來 Pasta 118：老闆「兩位嗎？窗邊有位子。」代替「幾位？」；吃完：（窗外的巷子有人牽著腳踏車經過。你們都沒有急著走。）；她不說別間店的那一句',
    a[0]==='老闆：'+H9.lines[0][1]&&!a.includes('老闆：幾位？……那邊那張可以坐。')&&a[a.length-1]===H9.done&&!a.some(t=>t.endsWith('這間週二休息，我查過了。')),J(a));
  at(tue+7,12.5); lunch('pasta',[AN]); await order('pasta',['白醬雞肉麵']); const b=said();
  check('9. H9 只一次（之後照舊「幾位？」）',b[0]==='老闆：幾位？……那邊那張可以坐。'&&!b.includes(H9.done),J(b));
  const neg=async(d,h,o)=>{ setup(d,h,o); await order('pasta',['白醬雞肉麵']); return !has(H9.lines[0][1])&&!has(H9.done); };
  const r={notDating:await neg(tue,12.5,{date:false}),sat:await neg(tue+4,12.5),night:await neg(tue,18.5),three:await neg(tue,12.5,{with:[AN,'zhe']})};
  check('9. H9 不演：沒交往、週六、晚上、三個人',Object.values(r).every(x=>x),J(r)); });

H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
