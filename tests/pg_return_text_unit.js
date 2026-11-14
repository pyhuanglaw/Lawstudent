// BUG-PG-RETURN-TEXT-1021：畢業以後的出遊演完（6/9 典禮、K26、麵店、固定格……沒寫 back 的）都出「回到台大。」——退宿住家裡的玩家不是回台大。不需要瀏覽器。
//   1 OUT.backText：退宿（MOVED_OUT）住家裡＝「回到家。」、住公館的套房（HOME_AFTER gongguan）＝「回到公館的套房。」、還沒退宿＝「回到台大。」
//   2 實際演一趟沒寫 back 的出遊（學姊 2030 看海寫了「回到臺北。」不算；用一趟沒寫 back 的出遊；原本借可昕 6/9 的典禮，AA_919 4-2 拿掉了）：字幕照上面
//   3 日本路線 2/20 退宿以後住家裡（JP.homeOn）＝「回到家。」（BB-B 11-07 19:4x）
// 修改前（開發分支 1b639d68）：1、2 的退宿那幾項 FAIL；3 在 aa2a719bf 以前 FAIL。用法：node tests/pg_return_text_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H;
const caps=[]; GM.caption=(a,b)=>{ caps.push(b); };
const D=H.D;
{ const fs=require('fs'), vm=require('vm'), path=require('path'); for(const f of ['src/data/jp_events.js','src/jp3d.js']){ try{ vm.runInThisContext(fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='),{filename:f}); }catch(e){ console.log('NOTE 載入 '+f+' 失敗：'+String(e&&e.message||e).slice(0,160)); } } }   /* 第 3 節：日本路線（JP.homeOn）*/
const grad=(key,h,flags)=>{ const G=H.fresh(key,h==null?10:h,'dorm',Object.assign({GRADUATED:D('2029-06-02'),GRAD_DONE:true,Y4_PATH:'other',PACKED_Y4:D('2029-06-01')},flags||{})); PG.rec(G).done.grad=1; return G; };
(async()=>{
  const bt=fl=>{ const G=grad('2029-07-10',10,fl); return typeof OUT.backText==='function'?OUT.backText(G):'（沒有 OUT.backText）'; };
  const home=bt({MOVED_OUT:D('2029-06-28'),HOME_AFTER:'home'}), suite=bt({MOVED_OUT:D('2029-06-28'),HOME_AFTER:'gongguan'}), dorm=bt({});
  check('1. 退宿住家裡＝「回到家。」；住公館的套房＝「回到公館的套房。」；還沒退宿＝「回到首都帝大。」',home==='回到家。'&&suite==='回到公館的套房。'&&dorm==='回到首都帝大。',JSON.stringify([home,suite,dorm]));
  for(const [lab,fl,want] of [['退宿住家裡',{MOVED_OUT:D('2029-06-08'),HOME_AFTER:'home'},'回到家。'],['還沒退宿',{},'回到首都帝大。']]){
    const G=grad('2029-06-09',15.5,fl); if(typeof STORY_EVENTS!=='undefined'&&!STORY_EVENTS.some(e=>e.id==='ev_back_t')) STORY_EVENTS.push({id:'ev_back_t',title:'公館',participants:[],location:'any',trigger:'outing',background:'dark',hours:1,dialogue:[]}); OUT.plan(G,{id:'pg_back_t',ev:'ev_back_t',day:D('2029-06-09'),h:16,late:0.5,place:'公館',title:'公館',travel:'走過去約 15 分鐘',travelH:0.25}); const q=OUT.get(G,'pg_back_t'); caps.length=0; H.said=[]; H.picks=[0,0,0];
    if(q) await OUT.go(GM,q); check('2. 出遊沒寫 back 演完：'+lab+'＝「'+want+'」',!!q&&!q.back&&caps.includes(want)&&!caps.includes(want==='回到家。'?'回到首都帝大。':'回到家。'),JSON.stringify(caps)); }
  /* 3（BB-B 11-07 19:4x）：日本路線 2/20 退宿以後住家裡（JP.homeOn：出發前、回來以後）＝「回到家。」；人在日本、還沒退宿照舊 */
  { const jp=(key,fl)=>{ const G=H.fresh(key,21,'gongguan',Object.assign({EXCHANGE_ROUTE:'JP',EXCH_RULE:1},fl||{})); return [typeof JP!=='undefined'&&JP.homeOn?JP.homeOn(G):'（沒有 JP.homeOn）',OUT.backText(G)]; };
    const pre=jp('2028-03-23',{X1_JP:D('2028-02-20')}), back=jp('2028-08-20',{X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25'),JP_RETURNED:D('2028-08-05')}), inJ=jp('2028-05-10',{X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25')}), y4=jp('2028-09-10',{X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25'),JP_RETURNED:D('2028-08-05'),ROOM_Y4:D('2028-09-03')}), dorm=jp('2028-02-10',{});
    check('3. 日本路線住家裡：3/23（出發前）、8/20（回來以後）＝「回到家。」',pre[0]===true&&pre[1]==='回到家。'&&back[0]===true&&back[1]==='回到家。',JSON.stringify({pre,back}));
    check('3. 日本路線人在日本、搬進 409 以後、還沒退宿（2/10）：照舊「回到首都帝大。」',inJ[1]==='回到首都帝大。'&&y4[1]==='回到首都帝大。'&&dorm[1]==='回到首都帝大。',JSON.stringify({inJ,y4,dorm})); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
