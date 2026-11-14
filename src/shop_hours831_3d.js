/* ===== 四間店的營業時間：關著的時候到門口的那一句（AA_831，企劃線 b84e779563；SHOP-STANDARD-BACKFILL-1112，CLAUDE.md §12 第 5 點）=====
   （AA_831 第二版 8e41821f4a）公館燒臘（noodle）每天 11:00～23:00；頁間書屋（bookstore）每天 10:00～21:30；禮貌生財（tz_limao）每天 19:00～23:30；草原超市（us_market）每天 08:00～22:00。
   - 字：src/data/shop_hours_aa831.js（SHOP_HOURS_AA831，tools/shops/import_shop_hours_aa831.py 匯入）——這裡不寫任何給玩家看的字。
   - 時間：src/data/places.js 的 PLACES.hours（手機地點、大地圖、邀約、客人、店員都讀同一份）。
   - 門口（S.door）：關著（還沒開、打烊以後、公休）按「進入」＝稿的那一句旁白＋開放時間（PLACES.closedText），不進去。
       公館燒臘、頁間書屋＝story3d.js 的 S.interact；草原超市＝us_life3d.js 的 S.interact；禮貌生財的門關著的時候沒有「進」（tingzhou3d.js：門的互動點變成「看」，字用這裡的 S.line('tz_limao')）。
       颱風假照原本的（story3d.js：PLACES.closedText 那一句），過年店休照原本的（noodle_closed3d.js，排在前面）。
   - 照常進得去（S.due）：那一天在這間店有約（答應的邀約：約的時間前一小時起；出遊的地點、標題寫這間店，或是走到這間店的出遊 goto）、那一天在這間店有班（JOBS.early：頁間書屋週六 10:00 的班，店 11:00 才開）。
       劇情直接帶進店裡的（GM.enter）不經過門口，照演。
   - 打烊人還在店裡：src/xs_close3d.js 的表（AA_700 那一句；有約、有班的時候不請出去；場景忙就等）。禮貌生財店裡沒有人（上師在騎樓的算命桌）＝不說那一句，只走出去、寫開放時間。
   - 店裡的店員（story3d.js）：關著、沒有約的時候不站人（S.staffed）。
   測試：node tests/shop_hours_aa831_1112_unit.js */
'use strict';
const SH831=(function(){
  const S={};
  const D=()=>typeof SHOP_HOURS_AA831!=='undefined'&&SHOP_HOURS_AA831?SHOP_HOURS_AA831.shops||{}:{};
  const hr=G=>(((+G.hour)||0)%24+24)%24;
  S.ZONES=['noodle','bookstore','tz_limao','us_market'];
  S.OUT_RE={noodle:/麵店|燒臘/,bookstore:/頁間書屋/};   /* 出遊的地點（文字）對到哪一間：只用來認，不顯示 */
  S.line=z=>{ const d=D()[z]; return d&&d.door?d.door:null; };
  S.LINE_X={};
  /* 禮貌生財（AA_1024 第 5 節，LIMAO-DOOR-HOURS-TEXT-1114）：還沒開（開門時間以前）／已收攤（關門時間以後）各一句、寫營業時間；其他沒開的日子（公休、上師不在）＝「今日不看」那一句 */
  S.LINE_X.tz_limao=G=>{ const L=typeof LIMAO_DOOR_AA1024!=='undefined'?LIMAO_DOOR_AA1024:null, d=D().tz_limao; if(!L||!d) return null; const h=hr(G);
    const off=typeof PLACES!=='undefined'&&PLACES.dayOff&&PLACES.dayOff('tz_limao',G.day); if(off) return L.off; return h<d.open?L.notOpen:h>=d.close?L.closed:L.off; };
  S.has=z=>S.ZONES.includes(z)&&typeof PLACES!=='undefined'&&!!PLACES.hours&&!!PLACES.hours[z];
  S.isOpen=(z,G)=>!S.has(z)||!PLACES.isOpen||PLACES.isOpen(z,hr(G),G.day);
  const zoneOfPlace=p=>{ try{ const P=typeof INV!=='undefined'&&INV.place?INV.place(p):null; return (P&&P.zone)||p; }catch(e){ return p; } };
  /* 那一天在這間店有約、有班＝門照常開、不請出去 */
  S.due=function(G,z){ if(!G) return false; const h=hr(G);
    try{ if((G.invites||[]).some(iv=>iv&&iv.day===G.day&&zoneOfPlace(iv.place)===z&&(iv.state==='accepted'||iv.state==='going'||(iv.accepted&&!iv.done))&&(iv.h==null||h>=iv.h-1))) return true; }catch(e){}
    try{ const re=S.OUT_RE[z], O=re&&typeof OUT!=='undefined'&&OUT.rec?OUT.rec(G):[]; if(O.some(q=>q&&q.day===G.day&&q.state==='planned'&&((q.goto&&q.goto.zone===z)||(re.test((q.place||'')+'｜'+(q.title||''))&&!/麵舖/.test((q.place||'')+(q.title||'')))))) return true; }catch(e){}
    try{ if(typeof JOBS!=='undefined'&&JOBS.early&&JOBS.early(G,z)) return true; }catch(e){}
    return false; };
  S.staffed=(z,G)=>S.isOpen(z,G)||S.due(G,z);
  /* 門口：回傳 true＝處理掉了（沒有進去）*/
  S.door=async function(GM,z){ const G=GM&&GM.G; if(!G||!S.has(z)||S.isOpen(z,G)||S.due(G,z)) return false;
    if(PLACES.typhoonClosed&&PLACES.typhoonClosed(z,G.day)) return false;   /* 颱風假：原本那一句（story3d.js）*/
    const t=(S.LINE_X[z]&&S.LINE_X[z](G))||S.line(z);   /* LINE_X：這一間這個時刻另外的一句（頁間書屋還沒開門＝AA_853 的 not_open，src/yejian_buy3d.js；沒有＝AA_831 那一句）*/
    if(t){ GM.sceneBegin(); try{ await GM.say(null,t); } finally { GM.sceneEnd(); } }
    if(GM.toast&&PLACES.closedText) GM.toast(PLACES.closedText(z,hr(G),G.day),4500);
    return true; };
  return S;
})();
if(typeof globalThis!=='undefined') globalThis.SH831=SH831;
