// BUG-PG-RETURN-TEXT-1021：畢業以後的出遊演完（6/9 典禮、K26、麵店、固定格……沒寫 back 的）都出「回到台大。」——退宿住家裡的玩家不是回台大。不需要瀏覽器。
//   1 OUT.backText：退宿（MOVED_OUT）住家裡＝「回到家。」、住公館的套房（HOME_AFTER gongguan）＝「回到公館的套房。」、還沒退宿＝「回到台大。」
//   2 實際演一趟沒寫 back 的出遊（學姊 2030 看海寫了「回到臺北。」不算；用可昕的典禮 pg_kx_grad）：字幕照上面
// 修改前（開發分支 1b639d68）：1、2 的退宿那幾項 FAIL。用法：node tests/pg_return_text_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H;
const caps=[]; GM.caption=(a,b)=>{ caps.push(b); };
const D=H.D;
const grad=(key,h,flags)=>{ const G=H.fresh(key,h==null?10:h,'dorm',Object.assign({GRADUATED:D('2029-06-02'),GRAD_DONE:true,Y4_PATH:'other',PACKED_Y4:D('2029-06-01')},flags||{})); PG.rec(G).done.grad=1; return G; };
(async()=>{
  const bt=fl=>{ const G=grad('2029-07-10',10,fl); return typeof OUT.backText==='function'?OUT.backText(G):'（沒有 OUT.backText）'; };
  const home=bt({MOVED_OUT:D('2029-06-28'),HOME_AFTER:'home'}), suite=bt({MOVED_OUT:D('2029-06-28'),HOME_AFTER:'gongguan'}), dorm=bt({});
  check('1. 退宿住家裡＝「回到家。」；住公館的套房＝「回到公館的套房。」；還沒退宿＝「回到首都帝大。」',home==='回到家。'&&suite==='回到公館的套房。'&&dorm==='回到首都帝大。',JSON.stringify([home,suite,dorm]));
  for(const [lab,fl,want] of [['退宿住家裡',{MOVED_OUT:D('2029-06-08'),HOME_AFTER:'home'},'回到家。'],['還沒退宿',{},'回到首都帝大。']]){
    const G=grad('2029-06-09',15.5,fl); H.FRIEND('kexin'); H.date('kexin'); PG.planKx(G); const q=OUT.get(G,'pg_kx_grad'); caps.length=0; H.said=[]; H.picks=[0,0,0];
    if(q) await OUT.go(GM,q); check('2. 可昕的典禮（6/9，出遊沒寫 back）演完：'+lab+'＝「'+want+'」',!!q&&!q.back&&caps.includes(want)&&!caps.includes(want==='回到家。'?'回到首都帝大。':'回到家。'),JSON.stringify(caps)); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
