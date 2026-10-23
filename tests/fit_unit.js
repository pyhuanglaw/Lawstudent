// 健身與體態的其餘部分（D14-T10；AA_126 第 6 節；USER_WANTS D40）——不需要瀏覽器。
//   1  走路、騎車加成照體能階段（+4／+8／+12%、+5／+10／+15%）；跑步不變（engine3d.js 兩條移動路徑都乘）
//   2  騎腳踏車每 2 公里 +1、每週最多 +3
//   3  體育課 +1（CLS.attend 上完才算）；系籃、登山社活動 +2
//   4  升一階以後第一次見到阿哲：「你最近有在練喔？下次系籃缺人找你。」每一階一次
//   5  辦過卡、8 週沒運動：起床後一句「你很久沒去健身房了。卡還在錢包裡。」一學期一次；沒辦卡不說
// 修改前（開發分支 0c22e9423）：沒有 src/fit3d.js——FAIL。用法：node tests/fit_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(FIT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ load('src/fit3d.js'); }catch(e){ ok=false; err=String(e); }
const X=()=>typeof FIT!=='undefined'?FIT:null;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const gym=()=>{ H.G.daily=H.G.daily||{}; return H.G.daily.gym=H.G.daily.gym||{}; };

(async()=>{
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), en=fs.readFileSync(path.join(H.ROOT,'src/engine3d.js'),'utf8'), bk=fs.readFileSync(path.join(H.ROOT,'src/bike3d.js'),'utf8');
  check('0. src/fit3d.js 載得到、index.html 接在 honor3d.js 後面',ok&&!!X()&&/honor3d\.js\?v=[^"]+"><\/script>\n<script src="src\/fit3d\.js/.test(html),err);
  check('0. engine3d.js：點地走路、搖桿兩條路徑都乘 fitWalk／fitBike，跑步不乘',(en.match(/E\.SPD\.walk\*\(E\.fitWalk\|\|1\)|spdWalk\*\(E\.fitWalk\|\|1\)/g)||[]).length===2&&(en.match(/E\.bikeSp\(\)\*\(E\.fitBike\|\|1\)/g)||[]).length===2&&!/SPD\.run\*\(E\.fit/.test(en)&&!/spdRun\*\(E\.fit/.test(en));
  check('0. bike3d.js 每一格的距離交給 FIT.bike',/FIT\.bike\(GM\.G,d\)/.test(bk)); });
if(!X()){ H.done(); return; }

await sec(1,()=>{ H.fresh('2026-03-02',10,'campus'); const r=[]; for(const f of [0,24,25,50,75,100]){ gym().fit=f; X().sync(GM); r.push([E.fitWalk,E.fitBike]); }
  check('1. 0、24＝1；25＝1.04／1.05；50＝1.08／1.10；75、100＝1.12／1.15',J(r)===J([[1,1],[1,1],[1.04,1.05],[1.08,1.1],[1.12,1.15],[1.12,1.15]]),J(r)); });

await sec(2,()=>{ H.fresh('2026-03-02',10,'campus'); gym().fit=0; for(let i=0;i<5000;i+=10) X().bike(H.G,10);
  check('2. 騎 5 公里：+2',gym().fit===2,gym().fit); for(let i=0;i<10000;i+=10) X().bike(H.G,10);
  check('2. 同一週再騎 10 公里：最多到 +3',gym().fit===3,gym().fit);
  H.G.day+=7; for(let i=0;i<2000;i+=10) X().bike(H.G,10); check('2. 下一週重新算',gym().fit===4,gym().fit); });

await sec(3,()=>{ H.fresh('2026-03-02',10,'campus'); gym().fit=10; X().pe(H.G,{id:'pe_y1s2'}); X().pe(H.G,{id:'chinese_y1_2'});
  check('3. 體育課 +1、別的課不算',gym().fit===11,gym().fit);
  X().act(H.G,{id:'dept_basketball'}); X().act(H.G,{id:'club_hiking'}); X().act(H.G,{id:'club_guitar'}); check('3. 系籃、登山 +2，吉他社不算',gym().fit===15,gym().fit);
  check('3. CLS.attend、CLS.attendActivity 包了一層',!!CLS.attend._fit&&!!CLS.attendActivity._fit); });

await sec(4,async()=>{ H.fresh('2026-03-02',10,'campus'); gym().fit=10; await X().preTalk(GM,{name:'阿哲'},'zhe'); check('4. 普通：阿哲沒說',!H.said.length);
  gym().fit=30; await X().preTalk(GM,{name:'阿哲'},'zhe'); check('4. 升到有在運動：「你最近有在練喔？下次系籃缺人找你。」',H.has('你最近有在練喔？下次系籃缺人找你。'));
  const n=H.said.length; await X().preTalk(GM,{name:'阿哲'},'zhe'); check('4. 同一階第二次沒有',H.said.length===n);
  gym().fit=55; await X().preTalk(GM,{name:'阿哲'},'zhe'); check('4. 再升一階：再一次',H.said.length===n+1);
  await X().preTalk(GM,{name:'以安'},'heroine_01'); check('4. 別人不說（等 AA 定稿）',H.said.length===n+1); });

await sec(5,async()=>{ const d0=STORY.dayOfKey('2026-03-02'); H.fresh('2026-03-02',8,'dorm'); gym().card=d0; gym().fitDay=d0;
  H.G.day=d0+55; check('5. 55 天：還不說',!X().idleDue(H.G));
  H.G.day=d0+56; H.G.hour=8; check('5. 56 天、早上 8 點在宿舍：要說',X().idleDue(H.G));
  H.G.hour=13; check('5. 下午不說',!X().idleDue(H.G)); H.G.hour=8;
  X().tick(GM); await new Promise(r=>setTimeout(r,10)); check('5. 「你很久沒去健身房了。卡還在錢包裡。」',H.has('你很久沒去健身房了。卡還在錢包裡。'));
  check('5. 同一學期不再說',!X().idleDue(H.G)&&(H.G.day+=3,!X().idleDue(H.G)));
  H.fresh('2026-03-02',8,'dorm'); gym().fitDay=d0; H.G.day=d0+70; check('5. 沒辦卡：不說',!X().idleDue(H.G)); });

H.done();
})();
