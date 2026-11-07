// 告白第一次失敗、再約幾次還能告白（AA_723 confess fca9bcb69；AA723-CONFESS-PS-1107；使用者 11-07 Q2）——不需要瀏覽器（D131）。
// 檢查：1 heart＝她 AA_719 key 決定的分數（值@說法+信任；沒演到、late＝0）；2 第一次：heart ≥1 成功、≤-1 失敗、0 看當時信任
//       3 期末回家路上告白（termend3d.js 接 CF723.termDecide）：失敗演 fail、記 CONF_FAIL、階段好感不降；4 下一次見面她先說 normal（一次）
//       5 失敗以後正式約會 2 次＋14 天：約會結尾她說 ready、出現告白選項，告訴她＝second＋原本告白那一場（這一次一定 yes）；條件沒到不出現；先不說＝下一次約會結尾再問
//       6 期末回家路上：說過 ready＝second（接著照原本答應）
// 修改前全部 FAIL。用法：node tests/confess723_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm');
const loadG=(f,names)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
loadG('src/data/decide_rules.js',['DECIDE_RULES']); loadG('src/decide3d.js',['DECIDE']);
const ok0=loadG('src/data/aa723.js',['AA723'])&&loadG('src/confess723_3d.js',['CF723']);
if(!ok0){ check('0. src/data/aa723.js、src/confess723_3d.js 存在',false); H.done(); return; }
const L=AA723.confess.lines;
const rec=(G,who,key,o)=>{ const D=G.flags.DECIDE||(G.flags.DECIDE={}); (D[who]||(D[who]={}))[key]=Object.assign({day:G.day},o); };
(async()=>{
  { const G=H.fresh('2026-03-01',10,'campus');
    rec(G,'heroine_04','summer',{v:'game',stance:'space',rule:2}); const a=CF723.heart(G,'heroine_04');
    G.flags.DECIDE.heroine_04.summer={v:'intern',stance:'tease',rule:4}; const b=CF723.heart(G,'heroine_04');
    G.flags.DECIDE.heroine_04.summer={v:'game',stance:'tease',rule:3}; const c=CF723.heart(G,'heroine_04');
    G.flags.DECIDE.heroine_04.summer={v:'game',stance:'tease',rule:3,hi:false}; const d=CF723.heart(G,'heroine_04');
    G.flags.DECIDE.heroine_04.summer={v:'game',stance:'space',rule:2,late:true}; const e=CF723.heart(G,'heroine_04');
    check('1. heart：game@space 1、intern -1、game@tease（規則 hi）1、紀錄 hi:false＝0、late＝0',J([a,b,c,d,e])===J([1,-1,1,0,0]),J([a,b,c,d,e]));
    rec(G,'heroine_01','grad',{v:'alone',stance:'space',rule:3}); rec(G,'heroine_01','jp_tell',{v:'first',stance:'support',rule:0});
    check('1. 以安：AN-1 first＋1、AN-2 alone@space+lo −1＝0',CF723.heart(G,'heroine_01')===0,String(CF723.heart(G,'heroine_01'))); }
  { const G=H.fresh('2026-03-01',10,'campus'); const tr=DECIDE.trustHi;
    rec(G,'heroine_04','summer',{v:'game',stance:'space',rule:2}); const a=CF723.first(G,'heroine_04');
    G.flags.DECIDE.heroine_04.summer={v:'intern',stance:'tease',rule:4}; const b=CF723.first(G,'heroine_04');
    delete G.flags.DECIDE.heroine_04.summer; DECIDE.trustHi=()=>true; const c=CF723.first(G,'heroine_04'); DECIDE.trustHi=()=>false; const d=CF723.first(G,'heroine_04'); DECIDE.trustHi=tr;
    check('2. 第一次：heart 1＝yes、-1＝fail、0＋信任高＝yes、0＋信任低＝fail',J([a,b,c,d])===J(['yes','fail','yes','fail']),J([a,b,c,d])); }
  const said=[], run=async(GM,who,arr)=>{ for(const t of arr) said.push(t); };
  { const G=H.fresh('2026-06-20',21,'campus'); H.CLOSE('heroine_04'); const rel0=J(SOCIAL.rel('heroine_04'));
    rec(G,'heroine_04','summer',{v:'intern',stance:'tease',rule:4}); said.length=0; const r=await CF723.termDecide(GM,'heroine_04',run); const cf=CF723.get(G,'heroine_04');
    check('3. 期末告白第一次 heart -1：演 fail（照 AA_723）、記 CONF_FAIL（那天、那時的約會次數）、好感不降',r==='fail'&&J(said)===J(L.heroine_04.fail)&&!!cf&&cf.day===G.day&&J(SOCIAL.rel('heroine_04'))===rel0,J({r,said,cf}));
    const src=fs.readFileSync(path.join(H.ROOT,'src/termend3d.js'),'utf8');
    check('3. termend3d.js 期末回家路上告白接 CF723.termDecide（fail＝這一次結束、yes／second＝照原本答應）',/CF723\.termDecide\(GM,who,run\)/.test(src)&&/if\(cf==='fail'\|\|cf==='pending'\)\{ R\.result=cf==='fail'\?'fail723':'pending723'; return R\.result; \}/.test(src)&&/if\(!cf&&h\.decideYes/.test(src));
    H.said=[]; const s0=await CF723.normalSay(GM,{name:'子晴',charId:'heroine_04'},'heroine_04');
    G.day+=1; H.said=[]; const s1=await CF723.normalSay(GM,{name:'子晴',charId:'heroine_04'},'heroine_04'); const got=H.said.map(x=>x.t);
    H.said=[]; const s2=await CF723.normalSay(GM,{name:'子晴',charId:'heroine_04'},'heroine_04');
    check('4. 失敗那天不說；隔天見面先說 normal（照 AA_723）、只說一次',!s0&&s1&&J(got)===J(L.heroine_04.normal.map(t=>t.replace(/^「|」$/g,'')))&&!s2||(!s0&&s1&&L.heroine_04.normal.every(t=>got.some(g=>t.indexOf(g)>=0||g.indexOf(t)>=0))&&!s2),J({s0,s1,s2,got}));
    check('4. 掛在約好的見面開場（INV.meetOpen）和當面說話前（STORY.PRE_TALK）',!!INV.meetOpen._cf723&&STORY.PRE_TALK.includes(CF723.normalSay));
    /* 5 再告白 */
    const t={who:'heroine_04'}; const ch0=GM.choose; let asked=0; GM.choose=async()=>{ asked++; return 0; }; const C0=DATE.confess; let confessCall=null; DATE.confess=async(GM2,id,c,tt)=>{ confessCall={id,ok:c.ok,dec:DATE.confessDecide(G,id)}; return 'yes'; };
    const lg=DATE.log(G,'heroine_04'); lg.count=(cf.cnt|0)+1; G.day=cf.day+20; H.said=[]; const r1=await CF723.retryOffer(GM,t);
    lg.count=(cf.cnt|0)+2; G.day=cf.day+10; const r2=await CF723.retryOffer(GM,t);
    G.day=cf.day+15; H.said=[]; asked=0; const r3=await CF723.retryOffer(GM,t); const got3=H.said.map(x=>x.t);
    check('5. 條件沒到（只約 1 次、或沒過 14 天）＝不出現',r1===null&&r2===null,J([r1,r2]));
    check('5. 第 2 次約會、過 14 天：她說 ready → 選項「告訴她」→ second → 原本告白那一場（這一次一定 yes）',r3==='yes'&&asked===1&&L.heroine_04.ready.concat(L.heroine_04.second).every(x=>got3.some(g=>x.indexOf(g)>=0||g.indexOf(x)>=0))&&!!confessCall&&confessCall.dec==='yes'&&CF723.get(G,'heroine_04').done===G.day,J({r3,asked,got3,confessCall}));
    check('5. DATE.confessOffer 包過（約會結尾先看再告白）',!!DATE.confessOffer._cf723);
    GM.choose=ch0; DATE.confess=C0; }
  { const G=H.fresh('2026-06-20',21,'campus'); CF723.rec(G).kexin={day:G.day-30,cnt:0,ready:G.day-3}; said.length=0; const r=await CF723.termDecide(GM,'kexin',run);
    const G2=H.fresh('2026-06-20',21,'campus'); CF723.rec(G2).kexin={day:G2.day-3,cnt:0}; said.length=0; const r2=await CF723.termDecide(GM,'kexin',run);
    check('6. 期末回家路上：說過 ready＝second（接著照原本答應）；剛失敗、條件沒到＝pending（她說 AA_723 的 pending，不會直接答應）',r==='second'&&r2==='pending'&&J(said)===J(L.kexin.pending),J([r,r2,said])); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
