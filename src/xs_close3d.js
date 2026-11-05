/* 新生南路的山嵐書店、南洋戲院：打烊時人還在店裡＝一句旁白、走出店門站到門口外面（AA_695 第 4 節，企劃線 491357209）。
   - 只在進門時擋營業時間的兩間（山嵐 xs_shanlan、南洋 xs_nanyang／xs_nanyang_hall）；其他店各自的系統（gg2shops3d、ggshops_sys3d、offbeat、mokuyobi）照舊。
   - 正在坐地板看書、坐著轉暗的那一個小時不打斷：場景忙（sceneFree 假）就等，結束後才出這一句。
   - 每 0.5 秒（STORY.TICKS）看一次；不存檔、不加旗標。 */
const XSCLOSE=(function(){
  const S={};
  const NY='（大廳的燈全亮了。工作人員站在門口說：「今天的場次都結束了，謝謝光臨。」你走了出去。）';
  /* lines：[說話的人（null＝旁白）, 字]；AA_699（企劃線 0e112816a）：大步、好拍、新生運動廣場也一樣（BB-C 06:18 決定） */
  S.ZONES={ xs_shanlan:{place:'xs_shanlan',lines:[[null,'（店裡的廣播說，今天的營業時間快結束了。燈先暗了一半。你走出店門。）']],out:()=>typeof SH3!=='undefined'&&SH3.streetOut&&SH3.streetOut()},
            xs_nanyang:{place:'xs_nanyang',lines:[[null,NY]],out:()=>typeof NY3!=='undefined'&&NY3.streetOut&&NY3.streetOut()},
            xs_nanyang_hall:{place:'xs_nanyang',lines:[[null,NY]],out:()=>typeof NY3!=='undefined'&&NY3.streetOut&&NY3.streetOut()},
            xs_dabu:{place:'xs_dabu',lines:[[null,'（店裡的音樂停了。店員把試穿的鞋一雙一雙收回鞋盒。你走出店門。）']],out:()=>typeof XSS!=='undefined'&&XSS.streetOut&&XSS.streetOut('dabu')},
            xs_haopai:{place:'xs_haopai',lines:[[null,'（老闆把穿線機的燈關掉，鐵門拉下一半。）'],['老闆','明天再來。'],[null,'（你走了出去。）']],out:()=>typeof XSS!=='undefined'&&XSS.streetOut&&XSS.streetOut('haopai')},
            xs_xsports:{place:'xs_xsports',lines:[[null,'（店員在門口把特價籃推進店裡。）'],['店員','我們要打烊了喔。'],[null,'（你走出店門。）']],out:()=>typeof XP3!=='undefined'&&XP3.streetOut&&XP3.streetOut()} };
  S.lineOf=z=>{ const C=S.ZONES[z]; return C?C.lines.map(l=>l[1]).join(''):null; };
  const sceneFree=GM=>{ if(typeof INV!=='undefined'&&INV.sceneFree) return INV.sceneFree(GM); const E=GM&&GM.E, D=GM&&GM.D; return !(E&&E.player&&E.player.busy)&&!(D&&(D.active||(D.busyDepth|0)>0)); };
  S.isOpen=(k,G)=>typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen(k,G.hour,G.day);
  S.outSpawn=z=>{ const C=S.ZONES[z], s=C&&C.out&&C.out(); return s?Object.assign({},s):null; };
  S.closeOut=async function(GM){ const G=GM.G, z=G.zone, C=S.ZONES[z], P=GM.E&&GM.E.player;
    GM.sceneBegin(); try{ if(P&&P.seat&&GM.standUp) GM.standUp(P); for(const [w,t] of C.lines) await GM.say(w?{name:w}:null,t); } finally { GM.sceneEnd(); }
    await GM.enter('xinsheng',S.outSpawn(z)||undefined); return 'close'; };
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['xs_close3d:busy']=()=>{ busy=false; };   /* 讀檔時放開 */
  S.tick=function(GM){ const G=GM&&GM.G; if(!G||!S.ZONES[G.zone]||busy||GM.titleIdle||!sceneFree(GM)) return false;
    if(S.isOpen(S.ZONES[G.zone].place,G)) return false;
    busy=true; S.closeOut(GM).catch(e=>console.warn('XSCLOSE.tick',e)).finally(()=>{ busy=false; }); return true; };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.TICKS)&&!STORY.TICKS.includes(S.tick)) STORY.TICKS.push(S.tick);
  return S;
})();
if(typeof globalThis!=='undefined') globalThis.XSCLOSE=XSCLOSE;
