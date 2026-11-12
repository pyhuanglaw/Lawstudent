// AA_311 118 巷每間店的故事（企劃線 580ed6302；第 5 節的改法優先；任務 LANE118-SHOP-STORY-1020／USER_WANTS X66）：熟客三段招呼＋考試週、H2～H9——不需要瀏覽器。
// AA_480（企劃線 be47f6341，回實作後的六題）：老樣子不帶菜名那一句、118 巷九間和 AA_329 合併、H7 兩個選項留到選了為止、阿哲輪流家常菜改好家、H9 的路（約她去義大麵屋吃午餐）。
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
//   7  H7 五湖四海 × 芯慈（每次的招呼；第三次吃完多一句；之後老闆娘那句以後馬上兩個選項「她今天要換。」／「（不說話）」，選到以前每次都出；選過照舊；舊存檔 v9.10.13 記了 H7b 的照樣出到選了為止）
//   8  H8 滇香小館 × 語彤（大二上起一起吃過以後、別天自己來；AA_410 老闆娘說她點法的那兩句排在之後、不同一天）
//   9  H9 Pasta 118：交往中用手機約她「去義大麵屋吃午餐」（邀約的吃飯那一類；週三休、平日中午）→ 見面＝在店裡和她一起點餐：第一次「兩位嗎？窗邊有位子。」＋吃完的旁白、
//      之後「幾位？」沒有旁白；時間只走一次；沒交往不列；不在條件裡的（週六、晚上、三個人）不演
//  10  AA_329 第 3 節和熟客合併（118 巷九間）：不說第 5 次那一句；選單「老樣子」第 5 次起照樣有、回答的說話人照 AA_311 第 1 節；店員主動問過（第 8 次起）就不加；考試週、和人一起來照樣有；其他店照舊
// 修改前（開發分支 d5ce20a40）：L118 沒有 STAFF、REG、H2～H9——第 0～6、8、9 節丟例外中斷、第 7 節 4 項 FAIL，FAILED 13。用法：node tests/aa311_l118_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
if(typeof CLS!=='undefined'&&CLS) CLS.afterSlot=async()=>false;   /* 這支測見面本身走了多少時間（40 分鐘）；見面用完時段跳到下一個時段（ACTION-BUDGET-1107）另外在 tests/action_budget_1107_unit.js 測 */
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EAT|EAT_LINES|WZS|L118|LANE118_SHOPS|L118_REDO|LANE118_LAYOUT|PARK|WZ_PARK_LAYOUT|SIDEQ|MSG|MSG_POOL|MSG2_POOL|FAV|FOOD_FAV_LINES|INVITE_REPLIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/invite_replies.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/eat_lines.js','src/eat3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/data/l118_redo772.js','src/lane118.js',
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
/* 2026-11-11（L118-SHOPS-REDO-1111，使用者 X338：118 巷九間店改版，故事照 AA_772 搬）：稿是改版以前寫的——讀進來以後照白名單上的 AA_772 換成現在的字（fix 列＋舊店名→現在的店名）再比，AA_772 新寫的句子（熟客新表、H3 新三句…）也算稿（tests/l118_redo772_expect.js；不手抄）。舊期望：直接和舊稿比 */
const R772=require('./l118_redo772_expect.js');
doc=R772.doc(doc)+'\n'+R772.corpus(); d480=R772.doc(d480);
const part=(a,b)=>{ const i=doc.indexOf(a), j=b?doc.indexOf(b,i+1):-1; return i<0?'':doc.slice(i,j<0?undefined:j); };
const part480=(a,b)=>{ const i=d480.indexOf(a), j=b?d480.indexOf(b,i+1):-1; return i<0?'':d480.slice(i,j<0?undefined:j); };
const cellOne=c=>{ const m=/「([^」]+)」/.exec(c||''); return m?m[1]:null; };
/* ---- 0 稿 ---- */
await sec(0,()=>{ const s1=part('## 1.','## 2.'), s2=part('## 2.','## 3.'), s3=part('## 3.','## 4.'), s5=part('## 5.');
  check('0. 稿讀得到（580ed6302，第 1、2、3、5 節）',!!s1&&!!s2&&!!s3&&!!s5);
  /* 2026-11-11（L118-SHOPS-REDO-1111，使用者 X338：118 巷九間店改版，店員跟著他的故事走；AA_772）改期望——
     舊期望：店員的稱呼＝AA_311 第 1 節的表（九間）、熟客表＝AA_311 第 2 節（九間）、usual2＝AA_480 第 1 節（五間）。
     新期望：這三張表都換成 AA_772 的 staff（十一間）、regular_greets（十一間）、regular_greets.usual2（六間）——從白名單上的 AA_772 讀（tests/l118_redo772_expect.js 的 R772.d），不手抄 */
  const A772=R772.d, staff={}; for(const r of A772.staff) staff[r.shop]=String(r.staff).split(/[（(]/)[0].trim();
  check('0. 店員的稱呼（AA_772 staff，十一間）＝L118.STAFF',Object.keys(staff).length===11&&J(staff)===J(Object.fromEntries(Object.keys(staff).map(k=>[k,L().STAFF[k]]))),J([staff,L().STAFF]));
  const cell=c=>{ const out=[]; const re=/(?:([^「」（）\s：]+)：)?「([^」]+)」|（([^）]+)）/g; let m; while((m=re.exec(c))) out.push(m[3]!=null?[null,'（'+m[3]+'）']:[m[1]||'@',m[2]]); return out; };
  const bad=[]; let n=0; for(const r of A772.regular_greets.rows){ n++; const id=r.shop, Q=L().REG[id]||{};
    const kn=[['@',r.know]].concat(r.knowNarr?[[null,r.knowNarr]]:[]);
    if(J(kn)!==J(Q.known)) bad.push([id,'認得你',kn,Q.known]);
    if(r.usual!==Q.usual) bad.push([id,'老樣子',r.usual,Q.usual]);
    if((r.exam||undefined)!==Q.exam) bad.push([id,'考試週',r.exam,Q.exam]);
    if((r.item||undefined)!==Q.item||(r.item&&!L().shop(id).menu.some(m=>m[0]===r.item))) bad.push([id,'老樣子的那一樣',r.item,Q.item]);
    if(r.who&&r.who!==L().STAFF[id]) bad.push([id,'說話的人',r.who,L().STAFF[id]]); }
  check('0. 熟客表（AA_772 regular_greets，十一間）逐格＝L118.REG（認得你、老樣子、考試週、老樣子的那一樣在菜單上；說話的人＝店員的稱呼）',n===11&&!bad.length,J(bad));
  check('0. 「老樣子」的選項照稿：「好」「看一下菜單」',J(L().USUAL_OPTS)===J(['好','看一下菜單'])&&s2.indexOf('選「好」')>=0&&s2.indexOf('選「看一下菜單」')>=0);
  const out=[], who=[]; const NM={[AN]:'以安',zhe:'阿哲',[BH]:'柏翰',[XC]:'芯慈'};
  for(const k of ['H2','H3','H4','H5','H6','H7','H8','H9']){ const Hk=L()[k]; const walk=(arr)=>{ for(const [w,t] of arr||[]){ out.push(t); if(w!=null) who.push([NM[w]||w,t]); } };
    walk(Hk.lines); walk(Hk.three); walk(Hk.third); if(Hk.done) out.push(Hk.done); for(const o of Hk.opts||[]){ out.push(o.t); walk(o.say); } }
  const segs=t=>String(t).split(/[（）「」]/).map(x=>x.replace(/^[。，：、]+|[。，：]+$/g,'').trim()).filter(x=>x.length>=2);
  const a3=part480('## 3.','## 4.');
  const miss=[...new Set(out)].filter(t=>segs(t).some(x=>s3.indexOf(x)<0&&s5.indexOf(x)<0&&a3.indexOf(x)<0));
  check('0. H2～H9 每一句台詞、旁白、選項都在稿裡（AA_311 第 3、5 節；H7 的「（不說話）」在 AA_480 第 3 節；一字不差）',out.length>=35&&!miss.length&&!!a3,out.length+' '+J(miss));
  /* 2026-11-11 AA 定案：木曜日一律「老闆」——H3（AA_772 搬到木曜日演）說話的人從稿上的「店長」改成「老闆」，台詞沒改字；對稿時這一句照「店長」找。舊期望：遊戲裡也是店長 */
  { const h3=who.find(([w,t])=>t==='窗邊那張有插座。她幫你留了。'); check('0. H3 說話的人是「老闆」（木曜日）',!!h3&&h3[0]==='老闆',J(h3)); if(h3&&h3[0]==='老闆') h3[0]='店長'; }
  const wb=who.filter(([w,t])=>![w+'：「'+t+'」',w+'「'+t+'」',w+'第一句換成「'+t+'」',w+'的招呼換成「'+t+'」',w+'：「理由：'+t+'」'].some(x=>s3.indexOf(x)>=0||s5.indexOf(x)>=0||a3.indexOf(x)>=0));   /* 以安那句：第 3 節的「理由：」第 5 節拿掉 */
  check('0. 說話的人照稿（店員、店長、老闆、老闆娘、阿哲、以安、柏翰、芯慈）',who.length>=24&&!wb.length,J(wb));
  const all=J([L().REG,L().H2,L().H3,L().H4,L().H5,L().H6,L().H7,L().H8,L().H9]);
  check('0. 第 5 節：沒有「小語」（Alison：「Alison 又帶朋友來了。小菜多一盤。」「你被 Alison 洗腦了。」）、以安不說「理由：」',!/小語/.test(all)&&!/理由：/.test(all)&&L().H5.lines[0][1]==='Alison 又帶朋友來了。小菜多一盤。'&&s5.indexOf('「'+L().H5.lines[0][1]+'」')>=0&&L().H3.lines[2][1]==='你的筆電電池撐不過一節課。'&&s5.indexOf('「你的筆電電池撐不過一節課。」')>=0);
  const src=fs.readFileSync(path.join(H.ROOT,'src/lane118.js'),'utf8');
  check('0. H2b 作廢（AA_334 第 2 節）：沒有做（遊戲裡沒有「好久不見。一樣嗎？」）',doc.indexOf('好久不見。一樣嗎？')>=0&&src.indexOf('好久不見')<0&&!L().H2b);
  /* AA_480 */
  const u2=Object.assign({},A772.regular_greets.usual2||{}); delete u2.note;
  const ub=Object.keys(u2).filter(id=>!(L().REG[id]&&L().REG[id].item&&L().REG[id].usual2===u2[id]));
  check('0. 「老樣子」有菜名的六間，上次點別的那一句（AA_772 regular_greets.usual2；原本 AA_480 第 1 節五間）＝L118.REG 的 usual2；沒有菜名的五間沒有',Object.keys(u2).length===6&&!ub.length&&Object.keys(L().REG).filter(id=>!u2[id]).every(id=>!L().REG[id].usual2&&!L().REG[id].item),J([u2,ub]));
  const a4=part480('## 4.','## 5.');
  /* 舊期望：AA_480 第 4 節 home 換好家（S.LUNCH_FIX、「自助餐 我需要吃菜」）、輪流 noodle2→dian→korea→self。AA_772 第 14 列把它拿掉（五湖四海週一有開）*/
  { const row14=A772.fix.find(r=>r.file==='src/lane118.js'&&r.new==='（拿掉）')||{};
    check('0. AA_480 第 4 節的換店拿掉了（AA_772）：沒有 S.LUNCH_FIX、程式裡沒有那一句；輪流照 AA_280＝korea→dian→tea→home',!!row14.old&&a4.indexOf('「'+row14.old+'」')>=0&&L().LUNCH_FIX===undefined&&src.indexOf(row14.old)<0&&J(L().baseRotation())===J(LANE118_SHOPS.lunch.rotation)&&J(LANE118_SHOPS.lunch.rotation)===J(['korea','dian','tea','home']),J(L().baseRotation())); }
  check('0. AA_480 第 3 節：H7 兩個選項「她今天要換。」「（不說話）」',J(L().H7.opts.map(o=>o.t))===J(['「她今天要換。」','（不說話）'])&&a3.indexOf('「她今天要換。」')>=0&&a3.indexOf('（不說話）')>=0);
  check('0. AA_480 第 5 節：邀約的吃飯那一類（kind meal）多義大麵屋（舊期望：店名 Pasta 118；AA_772 第 15 列只換店名）、平日中午',L().INVITE.kind==='meal'&&L().INVITE.name===L().shop('pasta').name&&L().INVITE.verb===R772.line('去 Pasta 118 吃午餐')&&J(L().INVITE.days)===J([1,2,3,4,5].filter(d=>!L().shop('pasta').hours.closed.includes(d)))&&J(L().INVITE.days)===J([2,3,4,5])&&part480('## 5.','## 6.').indexOf('「'+L().shop('pasta').name+'」')>=0   /* 平日扣掉公休日：義大麵屋週一休＝週二～五（舊期望 週一、二、四、五）*/&&!!INV.place('pasta118')); });

/* ---- 1 熟客 ---- */
/* 2026-11-11（L118-SHOPS-REDO-1111，使用者 X338；AA_772 regular_greets）改期望——測的事不變（第 1～2 次照 AA_280、第 3 次起認得你、第 8 次起老樣子、上次點別的、認得你兩行、{上次點的}、考試週、和人一起來、舊存檔），
   店、句子、品名、價錢都從資料讀（L118.REG＝AA_772、L118.shop 的菜單），不寫死。
   舊期望：麵舖＝noodle2（大碗喔？／大碗加蛋喔。／乾麵＋滷蛋 75）、有菜名的＝滇香（酸辣河粉／椒麻雞飯）＋好家、慢讀、Pasta、韓食四間、認得你兩行＝好家自助餐、{上次點的}＝一一八茶飲 tea（檸檬綠）、
           考試週三間（自助餐、茶飲、慢讀「今天人多，窗邊滿了。吧檯可以嗎？」）。
   新期望：麵店老闆在 korea、有菜名的六間（dian 另外走一遍流程）、認得你兩行＝cafe2（阿姨搬去大學食堂）、{上次點的}＝drink_a、考試週兩間（cafe2、drink_a；慢讀那一句跟著慢讀搬走，118 巷沒有了）*/
await sec(1,async()=>{ const RG=L().REG, M=id=>L().shop(id).menu, wdOf=d=>CALENDAR.dateOf(d).wd%7, ST=id=>L().STAFF[id];
  const days=[1,2,3,4,5,6].map(w=>td('Y1S1',3,w)).concat([1,2,3,4,5,6].map(w=>td('Y1S1',4,w)));   /* 大一上第 3、4 週週一～六（清州刀削麵週日休）*/
  const NS='korea', own=M(NS)[3][0], own2=M(NS)[1][0], greet=L().shop(NS).greet.text;
  fresh(days[0],12.5,'l118_'+NS); const G=H.G; const g=[];
  for(let i=0;i<7;i++){ await order(NS,[own],days[i],12.5); g.push(H.said[0]&&H.said[0].who+'：'+H.said[0].t); if(i===0){ await order(NS,[own2],days[0],13.4); g.push('同一天：'+(H.said[0]&&H.said[0].t)); } }
  const kn=RG[NS].known[0][1];
  check('1. 麵店第 1、2 次：照 AA_280 的招呼；同一天再點不算第二次；第 3～7 次：「認得你」那一句',J(g)===J([ST(NS)+'：'+greet,'同一天：'+greet,ST(NS)+'：'+greet,ST(NS)+'：'+kn,ST(NS)+'：'+kn,ST(NS)+'：'+kn,ST(NS)+'：'+kn,ST(NS)+'：'+kn])&&rec().n[NS]===7&&kn!==greet,J([g,rec().n]));
  const m0=G.money; await order(NS,['好'],days[7],12.5);
  check('1. 第 8 次：「老樣子」那一句 →「好」「看一下菜單」→ 選「好」直接點上次那一樣（不出選單、扣那一樣的錢）',J(H.opts[0])===J(['好','看一下菜單'])&&H.said[0].t===RG[NS].usual&&H.said[0].who===ST(NS)&&has('（你點了'+own+'。）')&&!menuShown()&&G.money===m0-M(NS)[3][1],J([said(),H.opts,m0-G.money]));
  await order(NS,['看一下菜單',M(NS)[0][0]],days[8],12.5);
  check('1. 選「看一下菜單」：照常出選單、點別的',menuShown()&&has('（你點了'+M(NS)[0][0]+'。）'),J([said(),H.opts]));
  await order(NS,['看一下菜單','不用了'],days[9],12.5); const n10=rec().n[NS]; await order(NS,['看一下菜單','不用了'],days[10],12.5);
  check('1. 沒點東西（看一下菜單 → 不用了）不算一次',n10===9&&rec().n[NS]===9,J(rec().n));
  /* 說了菜名的老樣子（118牛排）：上次點別的＝不帶菜名那一句（usual2，不倒回「認得你」）；上次點那一樣＝有菜名那一句。118牛排週二休：跳過週二 */
  { const id='dian', it=RG[id].item, other=M(id).map(m=>m[0]).find(n=>n!==it), dd=days.filter(d=>!L().shop(id).hours.closed.includes(wdOf(d)));
    fresh(dd[0],12.5,'l118_'+id); for(let k=0;k<7;k++) await order(id,[other],dd[k],12.5); await order(id,['好'],dd[7],12.5);
    const a=said(), oa=H.opts.slice(); await order(id,['看一下菜單',it],dd[8],12.5); await order(id,['好'],dd[9],12.5); const b=said();
    check('1. 118牛排第 8 次、上次點別的：老闆娘說不帶菜名那一句（不說有菜名的、不倒回「認得你」）→「好」＝上次那一樣；上次點那一樣：有菜名那一句 →「好」＝那一樣',
      dd.length>=10&&!!it&&!!RG[id].usual2&&a[0]===ST(id)+'：'+RG[id].usual2&&J(oa[0])===J(['好','看一下菜單'])&&a.includes('（你點了'+other+'。）')&&!a.includes(ST(id)+'：'+RG[id].usual)&&!a.includes(ST(id)+'：'+RG[id].known[0][1])&&b[0]===ST(id)+'：'+RG[id].usual&&b.includes('（你點了'+it+'。）'),J([a,b])); }
  const u2=Object.keys(RG).filter(id=>RG[id].item&&id!=='dian').map(id=>{ const it=RG[id].item, menu=M(id).map(m=>m[0]), other=menu.find(n=>n!==it);
    fresh(days[0],12,'l118_'+id); const R=rec(); R.n[id]=7; R.d[id]=days[0]-1; R.last[id]=other; const x=L().stage(H.G,id); R.last[id]=it; const y=L().stage(H.G,id);
    return [id,!!RG[id].usual2&&!!x&&x.lines[0][1]===RG[id].usual2&&x.usual===menu.indexOf(other)&&!!y&&y.lines[0][1]===RG[id].usual&&y.usual===menu.indexOf(it)]; });
  check('1. 其他有菜名的五間第 8 次：上次點別的＝不帶菜名那一句（「好」點上次那一樣）；上次就是那一樣＝有菜名那一句',u2.length===5&&u2.every(x=>x[1]),J(u2));
  /* 認得你兩行（一句＋旁白）：AA_772 的表上有 knowNarr 的那一間（大學食堂的阿姨）；{上次點的}：喝不喝咖啡 */
  { const id=Object.keys(RG).find(k=>RG[k].known.length===2), it=M(id)[0][0];
    fresh(days[0],12,'l118_'+id); for(let k=0;k<2;k++) await order(id,[it],days[k],12); await order(id,[it],days[2],12);
    check('1. 第 3 次、認得你兩行的那一間：店員一句＋旁白一句（旁白沒有說話的人）',id==='cafe2'&&seq([RG[id].known[0][1],RG[id].known[1][1]])&&whoOf(RG[id].known[0][1])===ST(id)&&whoOf(RG[id].known[1][1])==null&&RG[id].known[1][0]===null,J(said())); }
  { const id=Object.keys(RG).find(k=>/\{上次點的\}/.test(RG[k].usual)&&L().isDrink(k)&&k==='drink_a'), it=M(id)[2][0];
    fresh(days[0],15,'lane118'); for(let k=0;k<7;k++) await order(id,[it],days[k],15); await order(id,['好'],days[7],15);
    check('1. 喝不喝咖啡第 8 次：店員把上次點的說出來（「○○，對吧。」）→「好」＝那一杯',H.said[0].t===RG[id].usual.replace('{上次點的}',it)&&!/\{/.test(H.said[0].t)&&H.said[0].who===ST(id)&&has('（你點了'+it+'。）'),J(said())); }
  /* 考試週 */
  const ex=async(shop,d,h)=>{ fresh(d,h,L().isTakeout(shop)?'lane118':'l118_'+shop); await order(shop,[M(shop)[0][0]]); return H.said[0]?H.said[0].who+'：'+H.said[0].t:''; };
  const EXS=Object.keys(RG).filter(id=>RG[id].exam), GR=id=>ST(id)+'：'+L().shop(id).greet.text, EX=id=>ST(id)+'：'+RG[id].exam;
  const r={c8:await ex('cafe2',td('Y1S1',8,2),12),d9:await ex('drink_a',td('Y1S1',9,3),15),y4s2w15:await ex('cafe2',td('Y4S2',15,2),12),
    y4s2w14:await ex('cafe2',td('Y4S2',14,2),12),c7:await ex('cafe2',td('Y1S1',7,2),12),c10:await ex('cafe2',td('Y1S1',10,2),12),n8:await ex(NS,td('Y1S1',8,2),12.5),d16:await ex('drink_a',td('Y1S1',16,3),15)};
  check('1. 考試週（第一次來也算）：有考試週那一句的兩間（大學食堂、喝不喝咖啡）第 8、9、16 週、大四下第 15 週換那一句；第 7、10 週、大四下第 14 週照舊；麵店（沒有考試週那句）照舊',
    J(EXS.slice().sort())===J(['cafe2','drink_a'])&&r.c8===EX('cafe2')&&r.d9===EX('drink_a')&&r.d16===EX('drink_a')&&r.y4s2w15===EX('cafe2')&&r.y4s2w14===GR('cafe2')&&r.c7===GR('cafe2')&&r.c10===GR('cafe2')&&r.n8===GR(NS),J(r));
  /* 考試週蓋過老樣子 */
  fresh(days[0],12,'l118_cafe2'); rec().n.cafe2=9; rec().d.cafe2=days[0]-1; rec().last.cafe2=RG.cafe2.item; at(td('Y1S1',9,2),12); await order('cafe2',[M('cafe2')[0][0]]);
  check('1. 考試週＋第 10 次：考試週那句、不問老樣子那一句、照常出選單',H.said[0].t===RG.cafe2.exam&&!has(RG.cafe2.usual)&&menuShown(),J(said()));
  /* 和人一起來：照舊「幾位？」（熟客只有一個人的招呼）*/
  fresh(td('Y1S1',5,1),12.5,'l118_'+NS); rec().n[NS]=9; rec().d[NS]=td('Y1S1',5,1)-1; rec().last[NS]=M(NS)[0][0]; met('zhe'); here('zhe'); await order(NS,[M(NS)[0][0]]);
  check('1. 和阿哲一起來（第 10 次）：「幾位？……那邊那張可以坐。」，不說熟客那句',H.said[0].t===LANE118_SHOPS.groupGreet&&!has(RG[NS].usual)&&!has(RG[NS].known[0][1]),J(said()));
  /* 舊存檔 */
  let err=null; fresh(td('Y1S1',5,2),12,'l118_self'); delete H.G.l118; try{ await order('self',[M('self')[0][0]]); }catch(e){ err=e; } const ok1=!err&&H.G.l118&&H.G.l118.n.self===1;
  fresh(td('Y1S1',5,2),12,'l118_self'); H.G.l118=[1,2]; err=null; try{ await order('self',[M('self')[0][0]]); }catch(e){ err=e; }
  check('1. 舊存檔沒有 G.l118（或壞掉）：點餐不壞、從 0 開始記',ok1&&!err&&H.G.l118.n.self===1,String(err)); });

/* ---- 2 H2 ---- */
/* 2026-11-11（L118-SHOPS-REDO-1111；AA_772 moves：H2 留在 omu，現在是奈良咖哩）：點的東西從菜單讀（舊期望寫死 咖哩蛋包飯、番茄醬蛋包飯）；H2 的句子照 L118.H2（AA_772 第 8、9 列換過）*/
await sec(2,async()=>{ const wed=td('Y2S2',3,3), H2=L().H2, OM=L().shop('omu').menu;
  const setup=(flags)=>{ fresh(td('Y1S1',3,3),12.5,'l118_omu',flags); met(PS); here(PS); };
  setup(); await order('omu',[OM[0][0],'（就這樣）']); const ate=!!L().ateWith(H.G,PS,'omu'); gone(PS);
  await order('omu',[OM[3][0],'「她最近比較忙。」'],wed,12.5);
  check('2. H2 大二下週三 12:30、之前和沛珊在蛋包飯研究所一起吃過：店員「那個每次都點可樂餅咖哩的女生，這學期都沒來耶。」→「她最近比較忙。」→「喔。那你跟她說，靠牆那個位子我幫她留著。」',
    ate&&seq(['（你點了'+OM[3][0]+'。）',H2.lines[0][1],'喔。那你跟她說，靠牆那個位子我幫她留著。'])&&whoOf(H2.lines[0][1])==='店員'&&J(H.opts[H.opts.length-1])===J(['「她最近比較忙。」','「……我也不知道。」']),J([said(),H.opts]));
  await order('omu',[OM[3][0]],wed,12.6); const s1=!has(H2.lines[0][1]); await order('omu',[OM[3][0]],wed+7,12.5); const s2=!has(H2.lines[0][1]);
  check('2. H2 只一次',s1&&s2);
  setup(); await order('omu',[OM[0][0],'（就這樣）']); gone(PS); await order('omu',[OM[0][0],'「……我也不知道。」'],wed,12.2);
  check('2. 選「……我也不知道。」→（店員點點頭，沒有再問。）；12:12 點也算',seq([H2.lines[0][1],'（店員點點頭，沒有再問。）'])&&!has('喔。那你跟她說，靠牆那個位子我幫她留著。'),J(said()));
  const neg=async(d,h,o)=>{ o=o||{}; if(o.noMeal){ fresh(d,h,'l118_omu'); } else { setup(); await order('omu',[OM[0][0],'（就這樣）']); gone(PS); } await order('omu',[OM[0][0]],d,h); return !has(H2.lines[0][1]); };
  const r={noMeal:await neg(wed,12.5,{noMeal:true}),thu:await neg(wed+1,12.5),late:await neg(wed,13.05),early:await neg(wed,12.1),y2s1:await neg(td('Y2S1',3,3),12.5),y3:await neg(td('Y3S1',3,3),12.5)};
  check('2. H2 不演：沒和她一起吃過、週四、13:03、12:06、大二上（她還在）、大三',Object.values(r).every(x=>x),J(r));
  setup(); await order('omu',[OM[0][0],'（就這樣）']); gone(PS); H.date(PS); await order('omu',[OM[0][0]],wed,12.5);
  check('2. 和她交往中照演、選項一樣（第 5 節）',has(H2.lines[0][1])&&J(H.opts[H.opts.length-1])===J(['「她最近比較忙。」','「……我也不知道。」']),J(said()));
  fresh(wed,12.5,'l118_omu'); H.G.fav={know:{[PS]:td('Y1S1',3,3)},right:{}}; await order('omu',[OM[0][0]]);
  check('2. 舊存檔（沒有一起吃的次數，AA_410 記過她那一句）也算一起吃過',has(H2.lines[0][1]),J(said())); });

/* ---- 3 H3 ---- */
/* 2026-11-11（L118-SHOPS-REDO-1111；AA_772 slowread_to_mokuyobi.H3）改期望——
   舊期望：H3 大一上週三 12:30 在慢讀咖啡（l118_cafe2）和以安一起點餐時演（店長「窗邊那張有插座。她幫你留了。」…以安「你的筆電電池撐不過一節課。」代替「幾位？」），只一次；沒有 REPORT_PARTNER、大一下、以安不在、週四不演。
   新期望：搬到木曜日——大一下起週六 14:00～17:00 她在木曜日念書（常客那一筆）、玩家有 REPORT_PARTNER、只演一次；在木曜日點她的時候演（SLOWREAD.h3，代替那一次的當面招呼），
           三句照 AA_772 的稿（老闆、旁白、以安；從白名單上的 AA_772 讀）；118 巷（大學食堂）不再演 */
load('src/slowread3d.js');
await sec(3,async()=>{ const sat=td('Y1S2',5,6), H3L=R772.d.slowread_to_mokuyobi.H3.lines, SR=globalThis.SLOWREAD||SLOWREAD, HI=SR.REGULARS.find(r=>r.id===AN).hi;
  const setup=(d,h,o)=>{ o=o||{}; fresh(d,h,o.zone||'wz_mokuyobi'); met(AN); if(o.partner!==false) SOCIAL.remember(AN,'REPORT_PARTNER','民總'); const n=here(AN); H.said=[]; return n; };
  const talk=async n=>{ H.said=[]; return SR.greet(GM,n,AN); };
  check('3. 稿：H3 新三句（老闆、旁白、以安）；遊戲的資料 L118_REDO.h3 一字不差',H3L.length===3&&H3L[0][0]==='老闆'&&H3L[1][0]===null&&H3L[2][0]===AN&&J(L118_REDO.h3.lines)===J(H3L),J(L118_REDO.h3));
  let n=setup(sat,15); const nmAN=n.name; const g1=await talk(n);
  check('3. H3 大一下週六 15:00、以安在木曜日念書、民總報告同一組：在木曜日點她＝老闆那一句 →（以安把她的包…）→ 以安那一句（代替那一次的當面招呼）；記 G.l118.once.H3',
    g1===true&&J(said())===J(['老闆：'+H3L[0][1],H3L[1][1],nmAN+'：'+H3L[2][1]])&&!has(HI)&&H.G.l118.once.H3===sat&&!said().some(t=>/理由：/.test(t)),J(said()));
  at(sat+14,15); n=here(AN); const g2=await talk(n);   /* 隔兩週的週六（隔一週那個週六是連假，她不在）*/
  check('3. H3 只一次（之後的週六照舊是她的當面招呼）',g2===true&&!has(H3L[0][1])&&J(H.said.map(x=>x.t))===J([HI]),J(said()));
  const neg=async(d,h,o)=>{ const m=setup(d,h,o); if(o&&o.once){ H.G.l118={once:{H3:1}}; } await talk(m); return !has(H3L[0][1])&&!has(H3L[2][1]); };
  const r={noPartner:await neg(sat,15,{partner:false}),y1s1:await neg(td('Y1S1',5,6),15),wed:await neg(sat-3,15),late:await neg(sat,18),other:await neg(sat,15,{zone:'cafe'}),oldSave:await neg(sat,15,{once:true})};
  check('3. H3 不演：沒有 REPORT_PARTNER、大一上（她還沒有這一筆作息）、週三、17:00 以後、不在木曜日、在慢讀演過的舊存檔（once.H3）',Object.values(r).every(x=>x),J(r));
  /* 118 巷不再演：大一上週三 12:30 在大學食堂、以安在旁邊、有 REPORT_PARTNER——照一般的「幾位？」 */
  const wed=td('Y1S1',5,3); fresh(wed,12.5,'l118_cafe2'); met(AN); SOCIAL.remember(AN,'REPORT_PARTNER','民總'); here(AN); const o=L().withScene(H.G,'cafe2',[AN],12.5);
  check('3. 118 巷不再演 H3：在大學食堂（cafe2）和以安一起＝沒有特別的招呼（L118.withScene＝null）、不記 once.H3',o===null&&!(H.G.l118&&H.G.l118.once&&H.G.l118.once.H3!=null)); });

/* ---- 4 H4 ---- */
/* 2026-11-11（L118-SHOPS-REDO-1111；AA_772 moves：H4 搬到清州刀削麵 korea、四間＝阿哲輪流的 korea／dian／tea／home、S.LUNCH_FIX 拿掉）改期望——
   舊期望：四間＝麵舖 noodle2、滇香 dian、韓食 korea、好家 self（家常菜 home 也算那一間）；H4 在麵舖演；選項「滇緬那間。」；輪流 noodle2→dian→korea→self、第 5 週阿哲傳「自助餐 我需要吃菜」；
           週一約在好家時柏翰那一桌不另外演（S.LUNCH_ONLY＝['self']）；「這間第一。」記 noodle2、「韓式。」記 korea。
   新期望：四間和輪流都照資料（LANE118_SHOPS.lunch.rotation）；H4 在輪流的第一間（阿哲的麵店）演；選項和回話照 L118.H4（AA_772 第 10、11 列）；沒有換店那一句；
           輪流的店裡沒有柏翰那一間（H6 在大學食堂）＝S.LUNCH_ONLY 空的；舊存檔的次數、ZHE_118_RANK 由讀檔的遷移搬（L118.migrate）；「這間第一。」記 korea、「韓式。」記 tea */
await sec(4,async()=>{ const H4=L().H4, ROT=LANE118_SHOPS.lunch.rotation.slice(), NS=ROT[0], M=id=>L().shop(id).menu, it=id=>M(id)[0][0], WK=LANE118_SHOPS.lunch.weekly;
  const zheLine=LANE118_SHOPS.regulars.find(r=>r.id==='zhe'&&r.shop===NS).line, O=k=>H4.opts[k];
  check('4. 四間＝阿哲輪流的四間（資料）；H4 在第一間（他的麵店）演；輪流裡沒有柏翰那一間（H6 的店），S.LUNCH_ONLY 是空的',J(H4.shops)===J(ROT)&&ROT.length===4&&NS==='korea'&&J(L().LUNCH_ONLY)===J([])&&!ROT.includes('cafe2')&&!ROT.some(x=>LANE118_SHOPS.regulars.some(r=>r.id===BH&&r.shop===x)),J([H4.shops,ROT,L().LUNCH_ONLY]));
  /* 週一阿哲約的午餐：一起吃的是阿哲、Alison */
  fresh(td('Y1S1',3,1),12.5,'l118_'+ROT[3]); met('zhe'); met('yu'); lunch(ROT[3]); const cs=L().companions(GM,ROT[3]); await order(ROT[3],[it(ROT[3])]); const s0=said();
  check('4. 週一阿哲約在輪流的店：一起吃的是阿哲、Alison，記他們一起吃',J(cs)===J(['zhe','yu'])&&!!L().ateWith(H.G,'zhe',ROT[3])&&!!L().ateWith(H.G,'yu',ROT[3]),J([cs,s0]));
  at(td('Y1S1',4,1),12.5); lunch(ROT[1]); await order(ROT[1],[it(ROT[1])]); at(td('Y1S1',5,1),12.5); lunch(ROT[2]); await order(ROT[2],[it(ROT[2])]);
  at(td('Y1S1',5,3),12.5); H.G.flags.L118_LUNCH=null; here('zhe'); await order(NS,[it(NS)]); const first=!has(H4.lines[0][1]);
  check('4. 前提：四間（三間週一約好的午餐、麵店週三常客）都和阿哲一起吃過；第四間剛好是麵店的那一次不演',ROT.every(x=>(L().ateWith(H.G,'zhe',x)||{}).n>=1)&&first,J([rec().w,said()]));
  await order(NS,[it(NS),O(1).t],td('Y1S1',7,3),12.5);
  check('4. H4 之後在麵店吃完：阿哲那一句之後「欸，118 巷四間都吃過了。」「我的排名：這間第一。……你的呢？」→ 三選一 → 第二個（AA_772：「牛排那間。」）→ 他的回話；記 ZHE_118_RANK＝dian',
    O(1).t===R772.line('「滇緬那間。」')&&O(1).say[0][1]===R772.line('辣的喔……好，下禮拜去那間。')&&O(1).rank==='dian'&&seq([zheLine,H4.lines[0][1],H4.lines[1][1],O(1).say[0][1]])&&whoOf(H4.lines[0][1])===GM.npc.zhe.name&&J(H.opts[H.opts.length-1])===J(H4.opts.map(o=>o.t))&&H.G.flags.ZHE_118_RANK==='dian',J([said(),H.opts]));
  await order(NS,[it(NS)],td('Y1S1',7,3)+5,12.5); check('4. H4 只一次',!has(H4.lines[0][1]));
  const T=w=>CALENDAR.termOf(td('Y1S1',w,1)), ls=(t,w)=>L().lunchShop(CALENDAR.termOf(td(t,w,1)),H.G), none={flags:{}};
  const got=[ls('Y1S1',8),ls('Y1S1',9),ls('Y1S1',10),ls('Y1S1',11),ls('Y1S1',12),ls('Y1S2',2),ls('Y1S2',3)], base=[2,3,4,5,6].map(w=>L().lunchShop(T(w),none)), R2=['dian'].concat(ROT.filter(x=>x!=='dian'));
  check('4. 輪流：沒選過＝照資料的順序（第 2 週起）；選了牛排那間＝從下一週（第 8 週）起它排第一，下學期第 2 週也是它（沒選過的第 8 週是輪到的那一間）',
    J(base)===J([ROT[0],ROT[1],ROT[2],ROT[3],ROT[0]])&&J(got)===J([R2[0],R2[1],R2[2],R2[3],R2[0],R2[0],R2[1]])&&L().lunchShop(T(8),none)===ROT[(8-2)%4],J([base,got]));
  const ph=async(w,rank)=>{ fresh(td('Y1S1',w,1),11.9,'campus'); PHONE.join(H.G,'noodle_team','桌遊團'); H.G.flags.L118_FIRST_SENT=true; if(rank){ H.G.flags.ZHE_118_RANK=rank; rec().rankAt={term:'Y1S1',week:w}; } met('zhe');
    for(let h=11.95;h<=12.1;h+=0.05){ H.G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(H.G); } const m=(H.G.msgs||[]).filter(x=>x.th==='g:noodle_team').map(x=>x.text); return [m,(H.G.flags.L118_PICK||'')]; };
  const [p5]=await ph(5), [p8]=await ph(8,'dian'), gone14=(R772.d.fix.find(r=>r.file==='src/lane118.js'&&r.new==='（拿掉）')||{}).old;
  check('4. 手機：第 5 週（輪到第四間）阿哲傳資料裡那一間的那一句、沒有 AA_480 換店的那一句；選過牛排那間的第 8 週傳牛排那一句',p5.includes(WK[ROT[3]])&&!!gone14&&!p5.includes(gone14)&&p8.includes(WK.dian),J([p5,p8]));
  { fresh(td('Y1S1',5,1),11.9,'campus'); PHONE.join(H.G,'noodle_team','桌遊團'); H.G.flags.L118_FIRST_SENT=true; met('zhe'); for(let h=11.95;h<=12.1;h+=0.05){ H.G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(H.G); }
    PHONE.answer(H.G,'l118_lunch_'+H.G.day,0); STORY.phoneRules(GM); const q=OUT.get(H.G,'l118_lunch_'+H.G.day);
    check('4. 回「走。」：12:15 出遊到那一間門口（goto 118 巷）、約好的午餐在那一間（標題是現在的店名）',!!q&&q.goto&&q.goto.zone==='lane118'&&H.G.flags.L118_LUNCH&&H.G.flags.L118_LUNCH.shop===ROT[3]&&(q.title||'').includes(L().shop(ROT[3]).name),J([q&&q.title,H.G.flags.L118_LUNCH])); }
  /* 舊存檔：改版以前和阿哲在舊的四間（麵舖 noodle2、滇香 dian、韓食 korea、好家 self）吃過——讀檔的遷移照故事搬以後，四間都算吃過、在麵店演 H4 */
  fresh(td('Y1S1',6,3),12.5,'l118_'+NS); met('zhe'); here('zhe'); H.G.l118={n:{},d:{},last:{},once:{},w:{}}; for(const x of ['noodle2','dian','korea','self']) H.G.l118.w['zhe@'+x]={n:1,d0:H.G.day-9,d:H.G.day-9};
  L().migrate(H.G); const mw=ROT.every(x=>(L().ateWith(H.G,'zhe',x)||{}).n>=1); await order(NS,[it(NS)]);
  check('4. 舊存檔（和阿哲在舊的四間吃過）讀進來：一起吃的次數照故事搬、四間都算吃過，在麵店演 H4',mw&&!L().ateWith(H.G,'zhe','noodle2')&&!L().ateWith(H.G,'zhe','self')&&has(H4.lines[0][1]),J([rec().w,said()]));
  const other=async(k)=>{ fresh(td('Y1S1',7,3),12.5,'l118_'+NS); met('zhe'); here('zhe'); for(const x of ROT) rec().w['zhe@'+x]={n:1,d0:H.G.day-3,d:H.G.day-3}; await order(NS,[it(NS),O(k).t]); return [said(),H.G.flags.ZHE_118_RANK]; };   /* 【前置／捷徑】四間的次數直接寫進存檔 */
  const [a,ra]=await other(0), [b,rb]=await other(2);
  check('4. 「這間第一。」→ 他的回話、記這一間（korea）；「韓式。」→「你被 Alison 洗腦了。」、記韓食老闆現在那一間（tea）',O(0).t==='「這間第一。」'&&a.some(t=>t.endsWith('：'+O(0).say[0][1]))&&ra===NS&&O(2).t==='「韓式。」'&&O(2).say[0][1]==='你被 Alison 洗腦了。'&&b.some(t=>t.endsWith('：你被 Alison 洗腦了。'))&&rb==='tea',J([a,b])); });

/* ---- 5 H5 ---- */
/* 2026-11-11（L118-SHOPS-REDO-1111；AA_772 moves：H5 跟著韓食老闆搬到辛亥韓食 tea，台詞不變）：舊期望在韓食小廚 l118_korea（石鍋拌飯、海苔飯捲）；店和品名改從資料讀 */
await sec(5,async()=>{ const H5=L().H5, HS=LANE118_SHOPS.regulars.find(r=>r.id==='yu').shop, MT=L().shop(HS).menu;
  check('5. Alison 常去的那一間＝辛亥韓食（tea），清州刀削麵（korea）不演 H5',HS==='tea'&&(fresh(td('Y1S1',3,2),12.5,'l118_korea'),L().withScene(H.G,'korea',['yu'],12.5))===null);
  fresh(td('Y1S1',3,2),12.5,'l118_'+HS); met('yu'); here('yu'); await order(HS,[MT[0][0]]); const a=said(); await order(HS,[MT[1][0]],td('Y1S1',3,4),12.5); const b=said();
  check('5. H5 和 Alison 在韓食小廚（週二、四）：老闆「Alison 又帶朋友來了。小菜多一盤。」代替「幾位？」（每次）；吃完她那一句照舊',a[0]==='老闆：'+H5.lines[0][1]&&b[0]==='老闆：'+H5.lines[0][1]&&!a.includes('老闆：幾位？……那邊那張可以坐。')&&a.some(t=>t.endsWith('欸，下次換你選！我都選韓式。')),J([a,b]));
  fresh(td('Y1S1',5,1),12.5,'l118_'+HS); met('zhe'); met('yu'); lunch(HS); await order(HS,[MT[0][0]]); const c=said();
  const mon=td('Y2S2',4,1); fresh(mon,12.5,'l118_'+HS); met('zhe'); met('yu'); lunch(HS); await order(HS,[MT[0][0]]); const d=said(); at(mon+7,12.5); lunch(HS); await order(HS,[MT[0][0]]); const e=said();
  check('5. 阿哲、Alison 交往以前（大一）三個人＝每次那一句；大二上 12/19 起三個人：老闆「三位？」（他看了一下阿哲和 Alison 坐的位子。）「……兩位加一位。小菜一樣多一盤。」（一次，之後照每次那一句）',
    c[0]==='老闆：'+H5.lines[0][1]&&!c.includes('老闆：三位？')&&J(d.slice(0,3))===J(['老闆：三位？','（他看了一下阿哲和 Alison 坐的位子。）','老闆：……兩位加一位。小菜一樣多一盤。'])&&e[0]==='老闆：'+H5.lines[0][1]&&!e.includes('老闆：三位？'),J([c,d,e])); });

/* ---- 6 H6 ---- */
/* 2026-11-11（AA_772 moves：H6 跟著自助餐的阿姨搬到大學食堂 cafe2，台詞不變）：舊期望在好家自助餐 l118_self（加滷蛋）；店、品名、柏翰那一句改從資料讀 */
await sec(6,async()=>{ const H6=L().H6, d0=td('Y1S1',3,1), BS=LANE118_SHOPS.regulars.find(r=>r.id===BH), MC=L().shop(BS.shop).menu;
  fresh(d0,12.2,'l118_'+BS.shop); met(BH); here(BH); const r=[];
  await order(BS.shop,[MC[0][0]],d0,12.2); r.push(said()); await order(BS.shop,[MC[0][0]],d0,12.3); r.push(said());   /* 同一天兩次＝一次 */
  await order(BS.shop,[MC[0][0]],d0+1,12.2); r.push(said()); await order(BS.shop,[MC[0][0]],d0+2,12.2); r.push(said()); await order(BS.shop,[MC[0][0]],d0+3,12.2); r.push(said());
  check('6. 柏翰常去的那一間＝大學食堂（cafe2）',BS.shop==='cafe2'&&L().h6Due(Object.assign({},H.G,{}),'self',[BH],12.9)===false);
  const nm=GM.npc[BH].name, L0=nm+'：'+BS.line, Wt=[nm+'：'+H6.lines[0][1],nm+'：'+H6.lines[1][1]];
  check('6. H6 和柏翰一起吃：第 1、2 次（同一天兩次算一次）他「十二點四十了。我先回總圖。」；第三次：「十二點四十了。」「……今天等你五分鐘。」代替那一句；第 4 次照舊',
    r[0].includes(L0)&&r[1].includes(L0)&&r[2].includes(L0)&&!r[3].includes(L0)&&r[3].indexOf(Wt[0])>=0&&r[3].indexOf(Wt[1])===r[3].indexOf(Wt[0])+1&&r[4].includes(L0)&&!r[4].includes(Wt[1]),J(r)); });

/* ---- 7 H7 ---- */
/* 2026-11-11（AA_772 moves：H7 留在 home，現在是五湖四海；老闆娘、芯慈那兩句照 AA_772 第 12、13 列）：自己點的東西改從菜單讀（舊期望寫死 排骨飯、雞腿便當）*/
await sec(7,async()=>{ const MH=L().shop('home').menu; const H7=L().H7, tues=[3,4,5,6,7,8].map(w=>td('Y1S1',w,2)), O=['「她今天要換。」','（不說話）'];
  fresh(tues[0],12.5,'l118_home'); met(XC); here(XC); const nm=GM.npc[XC].name, r=[];
  for(let i=0;i<3;i++){ await order('home',[MH[0][0]],tues[i],12.5); r.push(said()); }
  const g0=['老闆娘：妹妹今天也是高麗菜的？',nm+'：……一樣。'];
  check('7. H7 和芯慈在家常菜（每次）：老闆娘「妹妹今天也是高麗菜的？」→ 芯慈「……一樣。」代替「幾位？」；第三次吃完，她那一句之後多「我發現我每次都點一樣的。……下次我想換。你幫我記著。」（第 1、2 次沒有）',
    r.every(x=>J(x.slice(0,2))===J(g0))&&!r[0].includes(nm+'：'+H7.third[0][1])&&!r[1].includes(nm+'：'+H7.third[0][1])&&r[2].indexOf(nm+'：'+H7.third[0][1])===r[2].indexOf(nm+'：下禮拜也來這間嗎？我先記一下。')+1,J(r));
  await order('home',['（不說話）',MH[0][0]],tues[3],12.5); const s4=said(), o4=H.opts.slice();
  check('7. 下一次一起來：老闆娘那句以後馬上兩個選項「她今天要換。」「（不說話）」（不在點餐選單裡）；選「（不說話）」→ 芯慈「……一樣。」',
    s4[0]==='老闆娘：妹妹今天也是高麗菜的？'&&J(o4[0])===J(O)&&s4[1]===nm+'：……一樣。'&&!o4.slice(1).some(o=>o.includes(O[0])),J([s4,o4]));
  await order('home',['「她今天要換。」',MH[1][0]],tues[4],12.5); const s5=said(), o5=H.opts.slice();
  check('7. 沒選的下一次還會再出：選「她今天要換。」→ 芯慈「……韭菜的。」老闆娘「喔！難得！」→ 再點自己的（雞腿便當）；她沒有說「……一樣。」',
    J(o5[0])===J(O)&&J(s5.slice(0,3))===J(['老闆娘：妹妹今天也是高麗菜的？',nm+'：……韭菜的。','老闆娘：喔！難得！'])&&s5.includes('（你點了'+MH[1][0]+'。）')&&!s5.includes(nm+'：……一樣。'),J([s5,o5]));
  await order('home',[MH[0][0]],tues[5],12.5);
  check('7. 選過以後照舊：老闆娘「妹妹今天也是高麗菜的？」→ 芯慈「……一樣。」，沒有那兩個選項',J(said().slice(0,2))===J(g0)&&!H.opts.some(o=>o.includes(O[0])),J([said(),H.opts]));
  /* 舊存檔（v9.10.13：選項出過一次就記 H7b，沒有記選了什麼）：沒有 H7c＝下一次照樣出那兩個選項，選了才記 H7c、之後不再出 */
  fresh(tues[2],12.5,'l118_home'); met(XC); here(XC); rec().w[XC+'@home']={n:4,d0:tues[0],d:tues[1]}; rec().once.H7a=tues[0]; rec().once.H7b=tues[1];   /* 【前置／捷徑】舊存檔的 G.l118 直接寫 */
  await order('home',['（不說話）',MH[0][0]],tues[2],12.5); const q1=H.opts.slice(), c1=rec().once.H7c;
  await order('home',['「她今天要換。」',MH[0][0]],tues[3],12.5); const q2=H.opts.slice(), s2=said();
  await order('home',[MH[0][0]],tues[4],12.5); const q3=H.opts.slice();
  check('7. 舊存檔（v9.10.13 記了 H7b、沒有 H7c）：下一次照樣出那兩個選項；「（不說話）」不記，下一次再出；選「她今天要換。」記 H7c，之後不出',
    J(q1[0])===J(O)&&c1==null&&J(q2[0])===J(O)&&s2[1]===nm+'：……韭菜的。'&&rec().once.H7c===tues[3]&&!q3.some(o=>o.includes(O[0])),J([q1,q2,s2,q3,rec().once])); });

/* ---- 8 H8 ---- */
/* 2026-11-11（AA_772 moves：H8 留在 dian，現在是 118牛排、老闆娘同一個人，台詞不變）：118牛排週二休——「別天自己來」那幾天從週二～四改成週三～五；自己點的東西從菜單讀（舊期望寫死 椒麻雞飯）*/
await sec(8,async()=>{ const MD=L().shop('dian').menu; const H8=L().H8, mon=td('Y2S1',3,1), know=FOOD_FAV_LINES[YT].know[0][1];
  fresh(mon,12.5,'l118_dian'); met(YT); here(YT); await order('dian',[MD[0][0],'（就這樣）']); gone(YT);
  await order('dian',[MD[0][0]],mon,13.5); const same=!has(H8.lines[0][1]);
  await order('dian',[MD[0][0],'「她問什麼？」'],mon+2,12.5); const s1=said();
  check('8. H8 大二上和語彤在滇香一起吃過以後，同一天再來＝沒有；別天自己來：老闆娘「上次跟你一起來的那個妹妹，…」「問了兩個小時，…」→「她是社會系的。」／「她問什麼？」→「問我為什麼開在這裡。……」',
    same&&seq([H8.lines[0][1],H8.lines[1][1],'問我為什麼開在這裡。……我說房租便宜啊。她寫了一整頁。'])&&whoOf(H8.lines[0][1])==='老闆娘'&&J(H.opts[H.opts.length-1])===J(['「她是社會系的。」','「她問什麼？」']),J([s1,H.opts]));
  check('8. AA_410 老闆娘說她點法的那兩句：H8 那一天不說',!s1.some(t=>t.endsWith(know))&&!FAV.know(H.G,YT),J(s1));
  await order('dian',[MD[0][0]],mon+3,12.5); const s2=said(); await order('dian',[MD[0][0]],mon+4,12.5); const s3=said();
  check('8. 再下一次（別天）：老闆娘說她的點法（AA_410），H8 不再演；之後都沒有',s2.some(t=>t.endsWith(know))&&!s2.some(t=>t.endsWith(H8.lines[0][1]))&&!s3.some(t=>t.endsWith(know))&&!s3.some(t=>t.endsWith(H8.lines[0][1])),J([s2,s3]));
  fresh(mon,12.5,'l118_dian'); met(YT); here(YT); await order('dian',[MD[0][0],'（就這樣）']); gone(YT); await order('dian',[MD[0][0],'「她是社會系的。」'],mon+2,12.5);
  check('8. 選「她是社會系的。」→「難怪。她問的我都沒想過。」',seq([H8.lines[1][1],'難怪。她問的我都沒想過。']),J(said()));
  fresh(mon+2,12.5,'l118_dian'); met(YT); await order('dian',[MD[0][0]]); const n1=!has(H8.lines[0][1]);
  fresh(mon,12.5,'l118_dian'); met(YT); here(YT); await order('dian',[MD[0][0],'（就這樣）']); await order('dian',[MD[0][0],'（就這樣）'],mon+7,12.5); const n2=!has(H8.lines[0][1]);
  check('8. H8 不演：沒和她一起吃過；和她一起來（不是自己來）',n1&&n2);
  /* 舊存檔：只有 AA_410 記的 ytWith（沒有一起吃的次數）；老闆娘說她點法那兩句已經演過、而且是今天＝H8 等到別天 */
  fresh(mon+3,12.5,'l118_dian'); met(YT); H.G.fav={know:{[YT]:mon+3},right:{},ytWith:mon}; SOCIAL.remember(YT,'KNOW_FAV_YT',''); await order('dian',[MD[0][0]]); const o1=!has(H8.lines[0][1]);
  await order('dian',[MD[0][0]],mon+4,12.5); const o2=has(H8.lines[0][1])&&!said().some(t=>t.endsWith(know));
  check('8. 舊存檔（只有 AA_410 的 ytWith）：老闆娘說她點法的那一天不演 H8，別天自己來演 H8',o1&&o2,J(said())); });

/* ---- 9 H9 ---- */
/* 2026-11-11（AA_772 moves：H9 留在 pasta，只換店名；AA_280 義大麵屋公休改週一）：店名、動詞、品名、價錢、公休日都從資料讀。舊期望：Pasta 118、白醬雞肉麵 130、週三休 */
await sec(9,async()=>{ const H9=L().H9, tue=td('Y2S1',4,2), PV=L().INVITE.verb, PN=L().INVITE.name, MP=L().shop('pasta').menu, IT=MP[1][0], CW=L().shop('pasta').hours.closed.find(d=>d>=1&&d<=5), otherLine=LANE118_SHOPS.regulars.find(r=>r.id===AN).line;
  check('9. 邀約的字照資料：「去'+PN+'吃午餐」＝AA_772 第 15 列；公休日是平日的其中一天',PV===R772.line('去 Pasta 118 吃午餐')&&PN===L().shop('pasta').name&&CW!=null,J([PV,PN,CW]));
  /* 約：交往中用手機約她（INV.flow，沒有 n＝手機）；見面：約好的時間她在 Pasta 118（INV.entryFor）、你也進來＝INV.startTogether（遊戲裡是 INV.autoStart 叫的）*/
  const invite=async(id,d,picks)=>{ at(d,10); H.G.zone='campus'; H.said=[]; H.opts=[]; H.picks=picks.slice(); const iv=await INV.flow(GM,id,null,false); return {iv,list:((H.opts[0]&&H.opts[0].all)||H.opts[0]||[]).slice(),said:said()}; };   /* all：分層的一類展開（INVITE-MENU-1030：Pasta 118 在「吃飯…」裡）*/
  const meet=async(iv,pick)=>{ at(iv.day,iv.h); H.G.zone='l118_pasta'; GM.npc={}; E.npcs=[]; const n=here(iv.who); const m0=H.G.money, h0=H.G.hour; H.said=[]; H.opts=[]; H.picks=[pick||IT];
    await INV.startTogether(GM,iv,n); return {said:said(),paid:m0-H.G.money,mins:Math.round((H.G.hour-h0)*60)}; };
  fresh(tue,10,'campus'); H.FRIEND(AN); H.date(AN); INV.addContact(H.G,AN);
  const A=await invite(AN,tue,[PV,'今天 12:10']);
  check('9. 交往中、平日用手機約以安：地點多「去義大麵屋吃午餐」→ 今天 12:10 → 她答應（照現有的答應句，不另寫）→ 約好 12:10 Pasta 118',
    A.list.includes(PV)&&!!A.iv&&A.iv.place==='pasta118'&&A.iv.state==='accepted'&&Math.abs(A.iv.h-(12+10/60))<1e-3&&A.said.some(t=>t.endsWith('約好 今天 12:10，'+PN+'。')),J([A.list,A.said,A.iv]));
  const e=INV.entryFor(Object.assign({},H.G,{day:A.iv.day,hour:12.1}),AN);
  check('9. 約好的時間她在 Pasta 118 吃（作息的覆寫：l118_pasta、eat）',!!e&&e.zone==='l118_pasta'&&e.act==='eat',J(e&&{zone:e.zone,act:e.act}));
  const M1=await meet(A.iv);
  check('9. 見面＝在店裡和她一起點餐：老闆「兩位嗎？窗邊有位子。」→ 點自己的（扣錢）→ 吃完（窗外的巷子有人牽著腳踏車經過。你們都沒有急著走。）；時間只走一次（40 分鐘）；約好的事做完、記一起吃飯',
    M1.said.includes('老闆：'+H9.lines[0][1])&&!M1.said.includes('老闆：幾位？……那邊那張可以坐。')&&M1.said.indexOf(H9.done)>M1.said.indexOf('（你點了'+IT+'。）')&&M1.paid===MP[1][1]&&M1.mins===40&&A.iv.state==='done'&&SOCIAL.has(AN,'SHARED_MEAL')&&!M1.said.some(t=>t.endsWith(otherLine)),J(M1));
  const B=await invite(AN,tue+7,[PV,'今天 12:10']); const M2=await meet(B.iv);
  check('9. H9 只一次：下一次約來照一般的「幾位？……那邊那張可以坐。」、沒有那句旁白（她別間店的那一句也不說）',!!B.iv&&M2.said.includes('老闆：幾位？……那邊那張可以坐。')&&!M2.said.includes(H9.done)&&!M2.said.includes('老闆：'+H9.lines[0][1])&&!M2.said.some(t=>t.endsWith(otherLine)),J(M2));
  const wed=td('Y2S1',5,CW), P=INV.place('pasta118'), dw=INV.decide(H.G,AN,'pasta118',wed,12+10/60);   /* wed＝公休的那一天（現在是週一；變數名照舊）*/
  check('9. 公休日不行：改天，改的那天不是公休日、是 12:10',dw.res==='resched'&&!!dw.alt&&CALENDAR.dateOf(dw.alt.day).wd%7!==CW&&Math.abs(dw.alt.h-(12+10/60))<1e-3&&INV.timeOptions(H.G,false,P).every(q=>Math.abs(q.h-(12+10/60))<1e-3),J(dw));
  fresh(tue,10,'campus'); H.FRIEND(AN); INV.addContact(H.G,AN); H.said=[]; H.opts=[]; H.picks=['算了']; await INV.flow(GM,AN,null,false);
  const notDating=!(H.opts[0]||[]).includes(PV);
  fresh(tue,10,'campus'); H.FRIEND('kexin'); H.date('kexin'); H.said=[]; H.opts=[]; H.picks=['算了']; await INV.flow(GM,'kexin',null,false); const kx=!(H.opts[0]||[]).includes(PV);
  check('9. 沒交往＝地點沒有 Pasta 118；可昕（政大，手機只約一起運動、去校外）也沒有',notDating&&kx);
  /* 【前置／捷徑】H9 的條件本身（L118.withScene）：用約好午餐的資料放人進店 */
  const setup=(d,h,o)=>{ o=o||{}; fresh(d,h,'l118_pasta'); met(AN); met('zhe'); if(o.date!==false) H.date(AN); lunch('pasta',o.with||[AN]); };
  const neg=async(d,h,o)=>{ setup(d,h,o); await order('pasta',[IT]); return !has(H9.lines[0][1])&&!has(H9.done); };
  const r={notDating:await neg(tue,12.5,{date:false}),sat:await neg(tue+4,12.5),night:await neg(tue,18.5),three:await neg(tue,12.5,{with:[AN,'zhe']})};
  check('9. H9 不演：沒交往、週六、晚上、三個人',Object.values(r).every(x=>x),J(r)); });

/* ---- 10 AA_329 第 3 節和熟客合併（AA_480 第 2 節）---- */
/* 2026-11-11（L118-SHOPS-REDO-1111；AA_772 eat_lines）：店員認得你那一套的字換成十一間新店的（EAT_LINES.staff 的 key＝現在的店名）——店名、品名、句子都從資料讀。
   舊期望：麵舖 noodle2（六張犁麵舖／牛肉麵）、滇香小館（椒麻雞飯、酸辣河粉）、好家自助餐的考試週、說話的人照 AA_311 第 1 節 */
await sec(10,async()=>{ const days=[1,2,3,4,5].map(w=>td('Y1S1',3,w)), ES=EAT_LINES.staff, mo=()=>H.opts.find(o=>o.some(t=>/　\d+ 元$/.test(t)))||[];
  const RG=L().REG, ST=id=>L().STAFF[id], NM=id=>L().shop(id).name, M=id=>L().shop(id).menu, NS='korea';
  fresh(days[0],12.5,'l118_'+NS); H.G.eat={n:{[NM(NS)]:4},last:{[NM(NS)]:M(NS)[0][0]}}; await order(NS,['老樣子']); const a=said(), oa=mo().slice();
  fresh(days[0],12.5,'l118_dian'); H.G.eat={n:{[NM('dian')]:4},last:{[NM('dian')]:M('dian')[0][0]}}; await order('dian',['老樣子']); const b=said();
  check('10. 118 巷第 5 次：不說 AA_329 那一句（line5）；選單照樣有「老樣子」，選了店員回 same 那句，說話的人照店員的稱呼（118牛排＝老闆娘，不是「店員」）',
    !!ES[NM(NS)]&&!!ES[NM('dian')]&&!a.includes(ST(NS)+'：'+ES[NM(NS)].line5)&&oa.includes('老樣子')&&a.includes(ST(NS)+'：'+ES[NM(NS)].same)&&!b.some(t=>t.endsWith(ES[NM('dian')].line5))&&ST('dian')==='老闆娘'&&b.includes('老闆娘：'+ES[NM('dian')].same)&&!b.includes('店員：'+ES[NM('dian')].same),J([a,oa,b]));
  { const it=RG.dian.item, other=M('dian').map(m=>m[0]).find(n=>n!==it);
    fresh(days[0],12.5,'l118_dian'); const R=rec(); R.n.dian=7; R.d.dian=days[0]-1; R.last.dian=it; H.G.eat={n:{[NM('dian')]:7},last:{[NM('dian')]:it}}; await order('dian',['看一下菜單',other]); const c=said(), oc=mo().slice();
    check('10. 第 8 次：店員主動問過（有菜名的老樣子那一句）→ 選「看一下菜單」的選單沒有「老樣子」',c[0]===ST('dian')+'：'+RG.dian.usual&&oc.length>0&&!oc.includes('老樣子')&&c.includes('（你點了'+other+'。）'),J([c,oc])); }
  fresh(td('Y1S1',8,2),12,'l118_cafe2'); const R2=rec(); R2.n.cafe2=9; R2.d.cafe2=H.G.day-1; R2.last.cafe2=M('cafe2')[0][0]; H.G.eat={n:{[NM('cafe2')]:9},last:{[NM('cafe2')]:M('cafe2')[0][0]}}; await order('cafe2',[M('cafe2')[0][0]]); const d=said(), od=mo().slice();
  fresh(td('Y1S1',5,1),12.5,'l118_'+NS); const R3=rec(); R3.n[NS]=9; R3.d[NS]=H.G.day-1; R3.last[NS]=M(NS)[0][0]; H.G.eat={n:{[NM(NS)]:9},last:{[NM(NS)]:M(NS)[0][0]}}; met('zhe'); here('zhe'); await order(NS,[M(NS)[0][0]]); const f=said(), of=mo().slice();
  check('10. 店員沒有主動問的時候照樣有「老樣子」：考試週（第 10 次也是考試週那句）、和人一起來（「幾位？」）',d[0]===ST('cafe2')+'：'+RG.cafe2.exam&&od.includes('老樣子')&&f[0]===ST(NS)+'：'+LANE118_SHOPS.groupGreet&&of.includes('老樣子'),J([d,od,f,of]));
  fresh(days[0],12,'noodle'); H.G.eat={n:{'阿鳳麵店':4},last:{'阿鳳麵店':'乾麵'}}; H.said=[]; H.opts=[]; H.picks=['老樣子']; const names=['乾麵','餛飩湯'], k=await EAT.choose(GM,'阿鳳麵店',names.map(t=>({t})).concat([{t:'不用了'}]),names,[50,40]);
  check('10. 其他店（公館燒臘）照 AA_329：第 5 次阿姨那一句、老樣子、阿姨回',has(ES['阿鳳麵店'].line5)&&whoOf(ES['阿鳳麵店'].line5)==='阿姨'&&k===0&&has(ES['阿鳳麵店'].same),J(said())); });

H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
