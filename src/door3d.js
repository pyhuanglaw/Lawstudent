/* ===== 人物開門（ANIM-DOOR-OPEN-1027／USER_WANTS A21「人物動作要有開門」第一階段；LAWWW2-C 2026-10-27）=====
   玩家按「進入／離開／走出／出門…」這種有門的出入口：先轉向門、伸右手推門（約 0.45 秒），接著照舊變黑換區域；畫面全黑以後手放下。
   - 自動門（便利商店、美國的兩家超市、機場）：不伸手，只轉向門口。開放式的店面（阿鳳麵店）：不是門。
   - 樓梯、電梯、「往…」的路、搭車、過馬路、回到校園／公館這種戶外的路：不是門，照舊。
   - 出入口可以自己寫 exit.door：'push'（推門）、'auto'（自動門）、'none'（不是門）蓋過上面的判斷。
   - 騎腳踏車、劇情自己呼叫 GAME.enter（不是玩家按的）：不演。
   - 手的動作用 character3d.js 的疊加姿勢 u.overlay（羽球短片加的掛勾）：只動右手臂、胸口，腳照舊。門板本身不會動（第二階段：最常走的幾扇門把門板從模型分出來轉開）。*/
const DOOR=(function(){
  const S={};
  S.AUTO_ZONES=['cvs','us_market','us_asian_market','airport_dep','airport_arr'];
  S.OPEN_ZONES=['noodle'];   /* 店面整個是開的、沒有門（阿鳳麵店）：進出都不伸手。其他開放式的店照這樣加，或在出入口寫 exit.door:'none' */
  S.YES=/進入|離開|走出|出門|回公寓|回宿舍|回家|回房|回萬才館大廳/;
  S.NOT=/樓梯間|上樓|下樓|上 \d|下 \d|電梯|搭車|過馬路|^往|回到校園|回公館/;   /* 「走出去（大樓梯平台）」是門：只擋「樓梯間」*/
  S.POSE={RightArm:[0,1.25,-0.08],RightForeArm:[0,0.22,0],RightHand:[0,0,-0.45],Spine1:[0.06,0.12,0]};   /* 右手往前伸到胸口高、手肘微彎、手腕往後折（手掌朝前推）、身體微微往前 */
  S.T_REACH=0.25; S.T_HOLD=0.2;   /* 秒：伸手、推著；手放下見 watch */
  S.kind=function(it,fromZone){ const x=it&&it.exit; if(!x) return null; if(x.door) return x.door==='none'?null:x.door;
    let lb=''; try{ lb=String(it.label||''); }catch(e){}
    if(!S.YES.test(lb)||S.NOT.test(lb)||S.OPEN_ZONES.includes(x.to)||S.OPEN_ZONES.includes(fromZone)) return null;
    return (S.AUTO_ZONES.includes(x.to)||S.AUTO_ZONES.includes(fromZone))?'auto':'push'; };
  const raf=typeof requestAnimationFrame==='function'?requestAnimationFrame:(f=>setTimeout(()=>f(Date.now()),16));
  const now=()=>typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
  const sm=t=>{ t=Math.max(0,Math.min(1,t)); return t*t*(3-2*t); };
  /* 玩家按了有門的出入口：轉向門＋推門；回傳 Promise（演完才換區域）。不是門、騎車、沒有玩家：馬上回傳 null */
  S.open=function(GM,it){ const E=GM&&GM.E, P=E&&E.player; const G=GM&&GM.G; const k=S.kind(it,G&&G.zone);
    if(!k||!P||!P.obj||P.riding) return null;
    const o=P.obj, dx=it.x-o.position.x, dz=it.z-o.position.z, turn=Math.hypot(dx,dz)>0.3, y0=o.rotation.y; let y1=turn?Math.atan2(dx,dz):y0, d=y1-y0; d=Math.atan2(Math.sin(d),Math.cos(d)); y1=y0+d;
    const u=o.userData, push=k==='push';
    const total=(push?S.T_REACH+S.T_HOLD:0.2)*1000;
    return new Promise(res=>{ const t0=now(); const f=()=>{ const t=(now()-t0)/1000;
      if(turn) o.rotation.y=y0+d*sm(t/0.18);
      if(push&&u) u.overlay={bones:S.POSE,k:sm(t/S.T_REACH),door:true};
      if(now()-t0>=total){ if(push) watch(GM); res(k); return; } raf(f); }; raf(f); }); };
  /* 手什麼時候放下：換到新的區域（E.zone 換了）的第一格——那時候畫面還是黑的；換區域會卡住主執行緒，用計時器會晚 1～2 秒（新區域亮起來時手還伸著，10-27 瀏覽器實測）。
     沒有換成（出入口鎖著、讀取失敗）：4 秒後放下 */
  function watch(GM){ const E=GM&&GM.E, z0=E&&E.zone, t0=now(); const f=()=>{ const E2=GM&&GM.E; if(!E2||E2.zone!==z0||now()-t0>4000){ S.close(GM); return; } raf(f); }; raf(f); }
  /* 手放下（只清開門自己的疊加姿勢）*/
  S.close=function(GM){ const P=GM&&GM.E&&GM.E.player, u=P&&P.obj&&P.obj.userData; if(u&&u.overlay&&u.overlay.door) u.overlay=null; };
  return S;
})();
