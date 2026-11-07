// 送早餐、飲料（GIFT-FLIRT-1107，USER_WANTS X262；台詞 AA_710 4be26c44d）——不需要瀏覽器（D131）。
// 使用者 11-07 試玩：「買飲料 早餐 給別人」「也沒辦法送早餐飲料?」
// 檢查：
//   0. src/data/gift_lines.js 和 AA_710@4be26c44d 一致（tools/story/import_gifts.py --check）；七位都有飲料、早餐
//   1. 便利商店、2:30 AM 的點餐選單多「買一份帶走送人…」；買了扣錢、帶在身上；有的品項再選一次（熱可可加濃縮 +20 元）；最多 3 樣；隔天就沒了
//   2. 當面說話多「送她○○」（STORY.TALK_OPTS）；送了東西就不在身上；她的反應照階段（need 1／4）、好感照稿；朋友以下她的戀愛不加
//   3. 同一種一天第二次：她不收（no）、東西留著
//   4. 送到她喜歡的那一樣（芷若：熱可可加一份濃縮）第一次＝fav、記 REMEMBERED_HER；第二次照一般
//   5. 舊存檔（沒有 G.carry、G.flags.GIFT）不丟例外
// 修改前全部 FAIL（沒有 GIFT）。用法：node tests/gift_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const loadG=(f,names)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
const ok1=loadG('src/data/gift_lines.js',['GIFT_LINES']), ok2=loadG('src/gift3d.js',['GIFT']);
const said=()=>H.said.map(s=>s.t);
const stageOf={}; const DS=DATE.stageNum; DATE.stageNum=id=>stageOf[id]!=null?stageOf[id]:DS(id);
let money=0; GM.money=d=>{ H.G.money+=d; money+=d; };
const toasts=[]; GM.toast=t=>toasts.push(t);
(async()=>{
  { let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_gifts.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
    check('0. src/data/gift_lines.js 和 AA_710@4be26c44d 一致（import_gifts.py --check）',ok1&&ok2&&ok,out.trim().slice(0,200));
    const P=ok1?GIFT_LINES.people:{}; const ids=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
    check('0. 七位都有飲料、早餐（yes 從 need 1 開始、no 有句子）',ids.every(id=>P[id]&&['drink','breakfast'].every(c=>P[id][c]&&P[id][c].yes[0].need===1&&P[id][c].no.length)),JSON.stringify(Object.keys(P))); }
  if(!ok2){ H.done(); return; }
  const LN=GIFT_LINES.people;
  /* 1 買 */
  { const G=H.fresh('2025-09-16',9,'cvs'); G.money=500; money=0;
    const o=GIFT.shopOpt(G,'便利商店'); check('1. 便利商店：點餐選單多「買一份帶走送人…」',!!o&&o.t==='買一份帶走送人…'&&!o.dim,JSON.stringify(o));
    check('1. 2:30 AM 也有；麵店沒有',!!GIFT.shopOpt(G,'兩點半 Café')&&!GIFT.shopOpt(G,'公館燒臘'));
    H.picks=['熱可可','加一份濃縮']; H.said=[]; const c=await GIFT.buy(GM,'便利商店');
    check('1. 買熱可可、加一份濃縮：扣 70 元（50＋20）、帶在身上、品項名「熱可可（加一份濃縮）」',!!c&&c.n==='熱可可（加一份濃縮）'&&c.cat==='drink'&&money===-70&&G.carry.length===1,JSON.stringify({c,money,carry:G.carry}));
    H.picks=['三明治']; await GIFT.buy(GM,'便利商店'); H.picks=['拿鐵　55']; await GIFT.buy(GM,'便利商店');
    check('1. 最多 3 樣：第 4 樣灰掉',G.carry.length===3&&GIFT.shopOpt(G,'便利商店').dim===true,JSON.stringify(G.carry));
    G.day+=1; check('1. 隔天：帶著的東西沒了',GIFT.carry(G).length===0); }
  /* 2、3 送 */
  { const G=H.fresh('2025-09-16',9,'campus'); G.money=500; const id='heroine_01', who={name:'沈以安',charId:id}; stageOf[id]=2;
    H.picks=['拿鐵　55']; await GIFT.buy(GM,'便利商店'); H.picks=['豆漿']; await GIFT.buy(GM,'便利商店');
    const O=GIFT.talkOpts(G,id); check('2. 當面說話：帶著的每一樣一個「送她○○」',O.length===2&&O[0].t==='送她拿鐵'&&O[1].t==='送她豆漿',JSON.stringify(O.map(x=>x.t)));
    check('2. 掛在 STORY.TALK_OPTS（當面說話的選單）',STORY.TALK_OPTS.some(f=>{ try{ const r=f(G,id,GM)||[]; return r.some(x=>x.t==='送她拿鐵'); }catch(e){ return false; } }));
    const r0=Object.assign({},SOCIAL.rel(id)); H.said=[]; const res=await GIFT.give(GM,who,id,G.carry[0]); const y=LN[id].drink.yes.filter(q=>q.need<=2).slice(-1)[0], r1=SOCIAL.rel(id);
    check('2. 送了：照階段（2）那一格的句子、好感照稿、npcRom 不加（朋友以下）、東西不在身上',res==='yes'&&said().includes(y.lines[0])&&(r1.fam-(r0.fam||0))===(y.rel.fam|0)&&(r1.npcRom|0)===(r0.npcRom|0)&&G.carry.length===1&&G.carry[0].n==='豆漿',JSON.stringify({res,said:said(),carry:G.carry}));
    H.said=[]; const res2=await GIFT.give(GM,who,id,G.carry[0]);
    check('3. 同一天再送一樣飲料（豆漿）：她不收（no）、東西留著',res2==='no'&&said().includes(LN[id].drink.no[0])&&G.carry.length===1,JSON.stringify({res2,said:said()}));
    stageOf[id]=4; G.day+=1; G.carry=[]; H.picks=['拿鐵　55']; await GIFT.buy(GM,'便利商店'); H.said=[]; await GIFT.give(GM,who,id,G.carry[0]); const y4=LN[id].drink.yes.filter(q=>q.need<=4).slice(-1)[0];
    check('2. 熟了（階段 4）：need 4 那一格',y4.need===4&&said().includes(y4.lines[0]),JSON.stringify(said())); }
  /* 4 fav */
  { const G=H.fresh('2025-09-16',9,'campus'); G.money=500; const id='heroine_02', who={name:'林芷若',charId:id}; stageOf[id]=3; const FV=LN[id].drink.fav;
    H.picks=['熱可可','加一份濃縮']; await GIFT.buy(GM,'便利商店'); H.said=[]; const r=await GIFT.give(GM,who,id,G.carry[0]);
    check('4. 芷若第一次收到熱可可加一份濃縮：fav 那幾句、記 REMEMBERED_HER',FV.item==='熱可可（加一份濃縮）'&&r==='fav'&&said().includes(FV.lines[0])&&SOCIAL.has(id,'REMEMBERED_HER'),JSON.stringify({r,said:said()}));
    G.day+=1; G.carry=[]; H.picks=['熱可可','加一份濃縮']; await GIFT.buy(GM,'便利商店'); const r2=await GIFT.give(GM,who,id,G.carry[0]);
    check('4. 第二次送對：照一般（yes）',r2==='yes'); }
  /* 5 舊存檔 */
  { const G=H.fresh('2025-09-16',9,'campus'); delete G.carry; delete G.flags.GIFT; let err=null; try{ GIFT.talkOpts(G,'heroine_01'); GIFT.shopOpt(G,'便利商店'); }catch(e){ err=e; }
    check('5. 舊存檔（沒有 carry、GIFT）不丟例外',!err,String(err)); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
