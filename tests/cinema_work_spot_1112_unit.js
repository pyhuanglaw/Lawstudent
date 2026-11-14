// SHOP-JOBS-1112（2026-11-12；BB FAIL SHIFT_SHOTS_72fc／_18a3）：南洋戲院上班站位不再躲在爆米花機後面。不需要瀏覽器。
//   修改前：S.workSpot 一律「店員旁邊 0.9 m」＝南洋 (−4.1,−3.7)，在爆米花機（z −4.7～−4.1）和紙桶（z −3.6～−2.8）後面，跟隨鏡頭只看得到頭頂。
//   修改後：S.WORK_FIX.cinema.on（LAWWW2 給的座標：飲料櫃北邊的空檯面後面）直接放；下班站回中間走道（站得住才用，站不住照原位）。
//   畫面沒有在瀏覽器看過（排使用者電腦：first／after_choice／after_shift 三張，BB 判）。用法：node tests/cinema_work_spot_1112_unit.js
const fs=require('fs'), path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','src','jobs3d.js'),'utf8');
let pass=0, fail=0; const check=(n,ok,x)=>{ if(ok){ pass++; console.log('PASS',n); } else { fail++; console.log('FAIL',n,x===undefined?'':x); } };
const cut=(a,b)=>{ const i=src.indexOf(a); if(i<0) return null; const j=src.indexOf(b,i); return j<0?null:src.slice(i,j); };
const body=cut('  S.WORK_FIX=','  S.workHeal=');
check('1. jobs3d.js 有 S.WORK_FIX、S.workSpot、S.workOn、S.workOff 這一段',!!body&&/S\.workSpot=function/.test(body)&&/S\.workOff=function/.test(body));
if(!body){ console.log('結果：FAIL'); process.exit(1); }
const ZONES={cinema:'xs_nanyang',yue:'tz_yuehaochi'};
const mk=new Function('shop','CHAR','SHOPLIFE','const S={ap3:k=>true};'+body+';return S;');
const S=mk(k=>({zone:ZONES[k]}),undefined,undefined);
const world=(zone,can)=>{ const P={obj:{position:{x:0.5,y:0,z:5.5},rotation:{y:0},userData:{}},lv:0}; const placed=[];
  const E={player:P,npcs:[{clerk:true,obj:{visible:true,position:{x:-4.1,z:-2.8},rotation:{y:Math.PI/2}},lv:0}],canStand:can,placeAt:(e,x,z,lv)=>{ e.obj.position.x=x; e.obj.position.z=z; e.lv=lv|0; placed.push([x,z]); }};
  return {GM:{E,G:{zone}},P,placed}; };
const FX=S.WORK_FIX&&S.WORK_FIX.cinema;
check('2. 南洋有指定站位（on、off 都有 x、z、yaw、lv）',!!FX&&['on','off'].every(k=>FX[k]&&['x','z','yaw','lv'].every(q=>typeof FX[k][q]==='number')),JSON.stringify(FX));
{ const w=world('xs_nanyang',()=>false), sp=S.workSpot(w.GM,'cinema');
  check('3. 南洋：站位＝指定的那一點（櫃台後面導航整條擋住也照放），不是店員旁邊 0.9 m',!!sp&&sp.x===FX.on.x&&sp.z===FX.on.z&&sp.yaw===FX.on.yaw,JSON.stringify(sp));
  check('4. 那一點不在爆米花機（z −4.7～−4.1）、紙桶（z −3.6～−2.8）、飲料櫃（z −1.3～−0.5）那幾段，在空檯面（z −0.5～3.6）後面',!!sp&&sp.z>-0.5&&sp.z<3.6&&sp.x<-3.2&&sp.x>-4.46,JSON.stringify(sp));
  check('5. 離店員 (−4.1,−2.8) 至少 2 m',!!sp&&Math.hypot(sp.x+4.1,sp.z+2.8)>=2);
  check('6. 回傳的是複本（改它不會改到表）',(()=>{ const a=S.workSpot(w.GM,'cinema'); a.x=99; return S.WORK_FIX.cinema.on.x!==99; })()); }
{ const w=world('xs_nanyang',()=>true); S.workOn(w.GM,'cinema');
  check('7. workOn：人被放到指定站位、朝向照表',w.P.obj.position.x===FX.on.x&&w.P.obj.position.z===FX.on.z&&w.P.obj.rotation.y===FX.on.yaw&&!!w.P.jobWork,JSON.stringify(w.P.obj.position));
  S.workOff(w.GM);
  check('8. workOff：站回中間走道（off），不是原本那一點',w.P.obj.position.x===FX.off.x&&w.P.obj.position.z===FX.off.z&&w.P.obj.rotation.y===FX.off.yaw&&w.P.jobWork===null,JSON.stringify(w.P.obj.position)); }
{ const w=world('xs_nanyang',(x,z)=>!(x===FX.off.x&&z===FX.off.z)); S.workOn(w.GM,'cinema'); S.workOff(w.GM);
  check('9. off 那一點站不住：照原本的位置還原（不卡住）',w.P.obj.position.x===0.5&&w.P.obj.position.z===5.5,JSON.stringify(w.P.obj.position)); }
{ const w=world('xs_nanyang',()=>true); S.workOn(w.GM,'cinema'); w.P.obj.position.x=3; w.P.obj.position.z=3; S.workOff(w.GM,true);
  check('10. 讀檔還原（stay）：不搬人',w.P.obj.position.x===3&&w.P.obj.position.z===3&&w.P.jobWork===null); }
{ const w=world('tz_yuehaochi',()=>true), sp=S.workSpot(w.GM,'yue');
  check('11. 其他店（越好吃）照舊：店員旁邊 0.9 m',!!sp&&Math.abs(Math.hypot(sp.x+4.1,sp.z+2.8)-0.9)<0.02,JSON.stringify(sp));
  S.workOn(w.GM,'yue'); S.workOff(w.GM);
  check('12. 其他店下班：站回原本的位置',w.P.obj.position.x===0.5&&w.P.obj.position.z===5.5); }
{ const w=world('wenzhou',()=>true);
  check('13. 人不在南洋（別的區域）：不用指定站位',(()=>{ const sp=S.workSpot(w.GM,'cinema'); return !sp||sp.x!==FX.on.x||sp.z!==FX.on.z; })()); }
{ /* 11-12 BB 再判：上班期間鏡頭釘在客人那側、和頭同高；人面向客人（+x）；下班放開 */
  const calls=[]; global.THREE={Vector3:function(x,y,z){ this.x=x; this.y=y; this.z=z; }};
  const w=world('xs_nanyang',()=>true); w.GM.E.cam={mode:'follow'}; w.GM.E.cinematic=(p,l)=>{ calls.push(['cine',p,l]); w.GM.E.cam.mode='cinematic'; }; w.GM.E.endCinematic=()=>{ calls.push(['end']); w.GM.E.cam.mode='follow'; };
  S.workOn(w.GM,'cinema');
  check('14. 南洋上班：人面向客人（yaw＝π/2，+x）',Math.abs(w.P.obj.rotation.y-Math.PI/2)<1e-9,w.P.obj.rotation.y);
  const c=calls[0]; check('15. 上班：鏡頭釘在 (−1.2,1.6,0.8) 看 (−4.0,1.45,0.8)（在人的 +x 側、和頭同高、2.8 m）',!!c&&c[0]==='cine'&&c[1].x===-1.2&&c[1].y===1.6&&c[1].z===0.8&&c[2].x===-4.0&&c[2].y===1.45,JSON.stringify(calls));
  w.GM.E.cam.mode='follow'; const re=S.workCam(w.GM); check('16. 劇情演完拉回跟隨鏡頭以後：再釘回去',re===true&&calls.filter(x=>x[0]==='cine').length===2);
  const re2=S.workCam(w.GM); check('17. 鏡頭已經是劇情／釘著的：不搶',re2===false);
  S.workOff(w.GM); check('18. 下班：放開鏡頭（endCinematic）',calls.some(x=>x[0]==='end')&&w.GM.E.cam.mode==='follow');
  const w2=world('tz_yuehaochi',()=>true); w2.GM.E.cam={mode:'follow'}; let n2=0; w2.GM.E.cinematic=()=>{ n2++; }; S.workOn(w2.GM,'yue');
  check('19. 其他店上班：不釘鏡頭',n2===0); }
console.log(`\n結果：${fail?'FAIL':'ALL PASS'}（${pass}/${pass+fail}）`); process.exit(fail?1:0);
