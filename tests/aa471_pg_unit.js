// AA_471 第 3～7 節（企劃線 763993620；任務 PG-FIX-471-473-1027）——不需要瀏覽器。第 1、2 節在 tests/pg_jpon_termkey_unit.js（f54a35ec4）。
//   3 國考放榜（麵店團）：2029-09-07 原句、2029-12-14、2030-09-06、2030-12-13 各一版（原本四次同樣三行）；接下來誰上了的那幾則不動
//   4 畢業以後的中秋（2029-09-22、2030-09-12）：住家裡的 20:00 家人群組照表（爸爸的照片＋媽媽一句；不發「蛋黃的 留給你」）；住在外面的照原本 FAM_DAYS；學期裡照舊
//   5 被當延畢、重修不到三堂：12/26（三）09:00 旁白兩句；2030-06-17（一）10:00 系辦領證書（手機「畢業證書已可領取。」）；6 月字卡改 06-18 起
//   6 芷若在英國，17:00 那一版的收尾三句輪（照順序、不跟上一週同一句）；美國那學期換字
//   7 交往中、2029 跨年的字卡換句（沒在交往的照原句）
// 每一節都逐字對稿（從 git 讀企劃線 763993620 的 AA_471）。修改前（243db0938）的結果見檔尾。用法：node tests/aa471_pg_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.CG_REGISTRY=global.CG_REGISTRY||{};
const NAMES=/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS|Y5|FD|MSG|MSG_POOL|MSG2_POOL|ZRUK)$/;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/noodle_closed3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/faildelay3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/zr_uk3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f);
const SHA='763993620', SRC='docs/story_planning/AA_471_大五讀一遍_日本路線家人群組不停_學期判斷過了220天_放榜四次.md';
let DOC=''; try{ DOC=cp.execFileSync('git',['-C',H.ROOT,'-c','core.quotepath=false','show',SHA+':'+SRC],{encoding:'utf8'}); }catch(e){ DOC=''; }
const sec=n=>{ const a=DOC.indexOf('\n## '+n+'.'), b=DOC.indexOf('\n## ',a+4); return a<0?'':DOC.slice(a,b<0?undefined:b); };
const row=(s,k)=>(s.split('\n').find(l=>l.startsWith('| '+k))||'').split('|').map(x=>x.trim());
const NAME={'阿哲':'zhe','Alison':'yu','爸爸':'dad','媽媽':'mom'};
const cellMsgs=c=>String(c||'').split('／').filter(Boolean).map(x=>{ const i=x.indexOf('：'); return [NAME[x.slice(0,i)]||x.slice(0,i),x.slice(i+1)]; });
const D=H.D, T=(k,h)=>D(k)*24+h;
const tsec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
/* 畢業後篇的存檔（6/2 撥穗、6/28 退宿回臺北的家）*/
const grad=(key,h,flags)=>{ const G=H.fresh(key,h==null?10:h,'dorm',Object.assign({GRADUATED:D('2029-06-02'),GRAD_DONE:true,MOVED_OUT:D('2029-06-28'),HOME_AFTER:'home',Y4_PATH:'other',PACKED_Y4:D('2029-06-01'),ROOM_Y2:true,ROOM_Y3:true,ROOM_Y4:true},flags||{}));
  G.acts={att:{}}; G.outings=[]; PG.rec(G).done.grad=1; for(const e of ['ev_grad_family','ev_grad_lunch','ev_grad_envelope','ev_y4_path','ev_move_out_y4']) G.events.done[e]=1; return G; };
const grpMsgs=(G,th)=>(G.msgs||[]).filter(m=>m.th===th).map(m=>[m.from||null,m.text]);

(async()=>{
check('0. 讀得到企劃線 '+SHA+' 的 AA_471',DOC.length>1000&&DOC.includes('## 3. 國考放榜'));

/* ======================= 3. 國考放榜（麵店團）======================= */
await tsec(3,async()=>{ const S3=sec(3), want={};
  for(const k of ['2029-12-14','2030-09-06','2030-12-13']) want[k]=cellMsgs(row(S3,k)[2]);
  want['2029-09-07']=[['yu','一試放榜了。'],[null,'（群組安靜了三秒。）'],['zhe','宵夜。']];   /* 原句（稿：「原句」）*/
  check('3. 稿：三個日子各一版（阿哲／Alison）',['2029-12-14','2030-09-06','2030-12-13'].every(k=>want[k].length>=2&&want[k].every(x=>x[0]==='zhe'||x[0]==='yu'))&&/Alison：一試放榜了。/.test(S3),J(want));
  /* 考兩年的玩家（2029 一試不到 12 題、2030 再考）：四次都在群組 */
  const G=grad('2029-09-07',14.6,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:5}); PHONE.join(G,'noodle_team','麵店團');
  const got={}; let n0=0; const at=(k,h)=>{ H.at(k,h); H.tick(); };
  for(const [k,h] of [['2029-09-07',15.02],['2029-12-14',15.02],['2030-09-06',15.02],['2030-12-13',15.02]]){ at(k,h-0.4); n0=(G.msgs||[]).length; at(k,h); got[k]=(G.msgs||[]).slice(n0).filter(m=>m.th==='g:noodle_team'&&(m.tag||'').startsWith('pg_r')).map(m=>[m.from||null,m.text]); }
  check('3. 考兩年：2029 一試沒過、2030 再考（S.sits）',PG.sits(G,2030)&&PG.retaker(G));
  for(const k of ['2029-09-07','2029-12-14','2030-09-06','2030-12-13'])
    check('3. '+k+' 15:00 麵店團：'+want[k].map(x=>(x[0]||'旁白')+'「'+x[1]+'」').join(''),J(got[k])===J(want[k]),J(got[k]));
  const all=grpMsgs(G,'g:noodle_team').map(x=>x[1]);
  check('3. 原本那一版（「國考放榜了。」）不再出現；「（群組安靜了三秒。）」只在 2029-09-07 一次',!all.includes('國考放榜了。')&&all.filter(t=>t==='（群組安靜了三秒。）').length===1,J(all));
  /* 接下來誰上了的那幾則照舊（2030-12-13 阿哲、Alison）*/
  H.at('2030-12-13',15.3); H.tick(); const after=grpMsgs(G,'g:noodle_team').map(x=>x[1]), zw=PG.zhe2030(G).map(m=>m.text);
  check('3. 2030-12-13 後面的阿哲「'+zw.join('」「')+'」、Alison「司法官還是沒上。……」照舊，接在放榜那兩行後面',J(after.slice(-1-zw.length))===J(zw.concat([POSTGRAD_LINES.Y2030.yu]))&&after.indexOf('最後一次宵夜。')<after.indexOf(zw[0]),J(after.slice(-6)));
  /* 只考 2029 一年的：只有前兩次 */
  const G2=grad('2029-12-14',14.6,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:14,BAR_STAGE_2029:'lawyer'}); PHONE.join(G2,'noodle_team','麵店團'); H.tick(); H.at('2029-12-14',15.02); H.tick();
  check('3. 只考 2029：12/14 那一版',J(grpMsgs(G2,'g:noodle_team').filter(x=>/放榜|洗澡|洗完/.test(x[1])))===J(want['2029-12-14']),J(grpMsgs(G2,'g:noodle_team'))); });

/* ======================= 4. 畢業以後的中秋（家人群組）======================= */
await tsec(4,async()=>{ const S4=sec(4), want={2029:cellMsgs(row(S4,'2029')[2]),2030:cellMsgs(row(S4,'2030')[2])};
  check('4. 稿：2029 兩則、2030 三則（爸爸先）',want[2029].length===2&&want[2030].length===3&&want[2029][0][0]==='dad'&&want[2030][2][0]==='mom',J(want));
  const famAt=(key,flags,hs)=>{ const G=grad(key,hs[0],flags); PHONE.join(G,'home','家人'); const out={}; for(const h of hs){ H.at(key,h); STORY.phoneRules(GM); PHONE.tick(G); out[h]=grpMsgs(G,'g:home').filter(x=>x[0]==='dad'||x[0]==='mom'); } return {G,out}; };
  for(const [y,key] of [[2029,'2029-09-22'],[2030,'2030-09-12']]){
    const {G,out}=famAt(key,{},[17.5,19.9,20.05,21.5,23.9]);
    check('4. '+key+' 中秋（住家裡）：20:00 以前沒有',out[19.9].length===0&&out[17.5].length===0,J(out[19.9]));
    check('4. '+key+' 20:00 家人群組：'+want[y].map(x=>x[1]).join('／'),J(out[20.05])===J(want[y]),J(out[20.05]));
    check('4. '+key+' 之後不再多（沒有 18:00 媽媽兩則、21:00 爸爸那一則、「蛋黃的 留給你」）；不用回',J(out[23.9])===J(want[y])&&!(G.msgs||[]).some(m=>m.th==='g:home'&&m.ask),J(out[23.9]));
    const m=(G.msgs||[]).find(x=>x.tag==='home_moon_pg_'+D(key)); check('4. '+key+' 那一則的時間是 20:00（那一天）、名字是爸爸／媽媽',!!m&&m.day===D(key)&&m.h>=20&&m.h<20.25&&(G.msgs||[]).filter(x=>x.tag==='home_moon_pg_'+D(key)).every(x=>x.name===(x.from==='dad'?'爸爸':'媽媽')),J(m)); }
  { const {out}=famAt('2029-09-22',{EXCHANGE_ROUTE:'JP'},[20.05]); check('4. 交換延畢（日本路線）大五上的中秋：一樣（住家裡）',J(out[20.05])===J(want[2029]),J(out[20.05])); }
  { const {out}=famAt('2029-09-22',{FAIL_DELAY:true,FAIL_DELAY_COURSES:['x']},[20.05]); check('4. 被當延畢：一樣（住家裡）',J(out[20.05])===J(want[2029]),J(out[20.05])); }
  { const {out}=famAt('2029-09-22',{HOME_AFTER:'gongguan',Y4_PATH:'bar'},[18.05,21.05]), F=HOME.FAM_DAYS;
    check('4. 還住在外面（公館的套房）：照原本 FAM_DAYS——18:00 媽媽兩則、21:00 爸爸一則',J(out[18.05])===J(F.moon)&&J(out[21.05])===J(F.moon.concat(F.moonDad)),J(out)); }
  { const {G,out}=famAt('2029-09-22',{},[20.05]); H.at('2029-09-24',1); STORY.phoneRules(GM); PHONE.tick(G);
    check('4. 第二天以後不再補發、不重複',grpMsgs(G,'g:home').filter(x=>x[0]==='dad'||x[0]==='mom').length===want[2029].length); }
  { const G=grad('2029-09-23',10,{}); PHONE.join(G,'home','家人'); STORY.phoneRules(GM); PHONE.tick(G);
    check('4. 睡過頭、隔天早上才讀檔：照 20:00 補（同學期裡的做法，兩天內）',J(grpMsgs(G,'g:home').filter(x=>x[0]==='dad'||x[0]==='mom'))===J(want[2029]),J(grpMsgs(G,'g:home'))); }
  { const G=H.fresh('2027-09-15',20.05,'dorm',{}); PHONE.join(G,'home','家人'); const d=D('2027-09-15'), fest=CALENDAR.fest(d); STORY.phoneRules(GM); H.at('2027-09-15',21.05); STORY.phoneRules(GM); PHONE.tick(G);
    check('4. 學期裡的中秋照舊（2027：FAM_MOON 那一年的句子，18:00 媽媽、21:00 爸爸）',fest!=='中秋'||J(grpMsgs(G,'g:home').filter(x=>x[0]==='dad'||x[0]==='mom').map(x=>x[1]))===J(HOME.FAM_MOON[2027].moon.concat(HOME.FAM_MOON[2027].moonDad).map(x=>x[1])),fest+' '+J(grpMsgs(G,'g:home'))); }
  { const G=grad('2029-09-22',20.05,{}); STORY.phoneRules(GM); PHONE.tick(G); check('4. 不在家人群組：不發',!(G.msgs||[]).some(m=>m.th==='g:home')); } });

H.done();
})();
