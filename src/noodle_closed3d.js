/* ===== 語彤家的麵店過年店休（AA_333，AA-C 56b6f64e；HOL-VA 最後一項 VA-08）=====
   除夕前 6 天到初三店休、初四開門：店休＝[初一−7, 初一+2]（初一照 calendar.js 的 LUNAR；這裡的四年和它一樣，AA_333 第 1 節的表）。法律系那四年（2026～2029）。
   A 店休第一天 21:00 麵店團群組兩則；D 初四 12:00 兩則（不在群組＝沒有）；兩則都照年份（AA_456 1-2）。
   B 店休時在麵店門口按「進入阿鳳麵店」＝鐵門的旁白、不能進去；在麵店團、和語彤 FRIEND 以上、10:00～17:00、那一年還沒演過＝她在裡面刷椅子腳
     （「我來幫忙。」熟悉 +1、滷蛋；「那我初四再來。」）；演過記 NOODLE_CLEAN_<年>。那一天在麵店有約（出遊、邀約）＝照常進去（劇情照演）。
   C 店休期間約語彤：答應的時候換成她那一句、時間排到 18:00 以後（invites3d.js）。
   AA_11 媽媽住院那一學期的版本：遊戲裡還沒有那一段，沒做。台詞照 AA_333 抄、不改字。測試：node tests/noodle_closed_unit.js */
'use strict';
const NOODLE_CLOSED=(function(){
  const CNY={2026:'2026-02-17',2027:'2027-02-06',2028:'2028-01-26',2029:'2029-02-13'};
  const L={ a:{2026:['這週店休，到初三。','阿姨說要大掃除。想吃麵的，初四以後。'],2027:['店休，到初三。','阿姨說今年要把招牌擦乾淨。初四見。'],2028:['這週店休，初四開。','阿姨回老家三天。'],2029:['這週店休，到初三。','你們今年過年還在臺北嗎。']},   /* A、D 照年份（AA_456 1-2，企劃線 71f260ecc：原本四年一字不差；2026 是原句）*/
    door:'（鐵門拉下來一半，門上貼著阿姨寫的紙：「過年休息，初四見。」）',
    inside:'（裡面有聲音。語彤蹲在地上刷椅子腳，看到你，把手套拔下來。）', offer:'店休。……你要吃的話，冰箱有昨天的滷蛋。',
    opts:[{t:'「我來幫忙。」',say:['好。抹布在那邊。你刷這一排。'],narr:'（刷完一排椅子，阿姨塞給你一袋滷蛋。）',fam:1},{t:'「那我初四再來。」',say:['嗯。初四見。']}],
    invite:'店休這週我比較有空。……下午要大掃除，約晚上。',
    out:{year:2027,offer:['店休。……說好要出去的。','刷完這一排就走。'],narr:'（刷完椅子，你們去河濱走了一圈。）',opt2:{t:'「我在外面等妳。」',say:['嗯。……很快。'],narr:'（她鎖好鐵門出來。你們去河濱走了一圈。）'}},   /* AA_524 Y3：2026 情人節說了「下次店休也出來。」（YT_CLOSED_OUT）——2027 店休那一場她的第一句換這兩句、「我來幫忙。」後面多一句旁白；AA_526 Y3：第二個選項換 opt2（「那我初四再來。」＝不出去，對不上）*/
    d:{2026:['開了。','阿姨說，今天第一碗加蛋。'],2027:['開了。','招牌真的擦了。很亮。'],2028:['開了。','阿姨從老家帶了一箱橘子，吃麵送一顆。'],2029:['開了。','第一碗加蛋。今年也是。']} };
  const S={L,CNY};
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const law=G=>!!G&&(G.stage||'law')==='law';
  /* 那一天是不是店休：回傳 {year, from, to, open}（from～to 店休、open＝初四），不是＝null */
  S.window=function(day){ for(const y in CNY){ const c=DK(CNY[y]); if(c==null) continue; if(day>=c-7&&day<=c+2) return {year:+y,from:c-7,to:c+2,open:c+3}; } return null; };
  S.closed=(G,day)=>law(G)&&!!S.window(day==null?G.day:day);
  const inGroup=G=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,'noodle_team');
  const friend=G=>typeof SOCIAL!=='undefined'&&!!SOCIAL.friendLevel&&['FRIEND','CLOSE_FRIEND'].includes(SOCIAL.friendLevel('heroine_03'));
  /* 那一天在麵店有約：出遊（地點寫麵店）、答應的邀約（地點是麵店）——劇情照演，門照常開 */
  S.storyDue=function(G){ const OUTS=typeof OUT!=='undefined'&&OUT.rec?OUT.rec(G):[]; if(OUTS.some(q=>q.day===G.day&&q.state==='planned'&&/麵店/.test(q.place||'')&&!/麵舖/.test(q.place||''))) return true;
    return (G.invites||[]).some(iv=>iv.day===G.day&&iv.accepted&&!iv.done&&/noodle/.test(iv.place||'')); };
  /* A、D：群組訊息（STORY.PHONE_RULES）*/
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined'||!inGroup(G)) return; const W=S.window(G.day)||S.window(G.day-1)||S.window(G.day-3);
    if(!W) return; const y=W.year, at=(d,x)=>G.day>d||(G.day===d&&G.hour>=x);
    const Y=t=>({th:'g:noodle_team',from:'heroine_03',text:t});
    if(at(W.from,21)&&G.day<=W.to&&!PHONE.sent(G,'noodle_closed_a_'+y)) PHONE.at(G,W.from,21,(L.a[y]||L.a[2026]).map(Y),'noodle_closed_a_'+y);
    if(at(W.open,12)&&G.day<=W.open+1&&!PHONE.sent(G,'noodle_closed_d_'+y)) PHONE.at(G,W.open,12,(L.d[y]||L.d[2026]).map(Y),'noodle_closed_d_'+y); };   /* tag 照舊（noodle_closed_a_／d_＋年），已經收過的舊存檔不重發 */
  /* B：麵店門口（story3d.js S.interact 的 exit noodle）。回傳 true＝處理掉了（沒有進去）*/
  S.door=async function(GM){ const G=GM.G, F=G.flags; if(!S.closed(G)||S.storyDue(G)) return false; const W=S.window(G.day), y=W.year, hr=G.hour%24, yt={name:typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName('heroine_03'):'語彤',charId:'heroine_03'};
    GM.sceneBegin(); try{ await GM.say(null,L.door);
      if(inGroup(G)&&friend(G)&&hr>=10&&hr<17&&!F['NOODLE_CLEAN_'+y]){ F['NOODLE_CLEAN_'+y]=true;
        const out=!!F.YT_CLOSED_OUT&&L.out&&y===L.out.year;   /* AA_524 Y3 */
        await GM.say(null,L.inside); for(const t of (out?L.out.offer:[L.offer])) await GM.say(yt,t);
        const OP=out?[L.opts[0],L.out.opt2]:L.opts; const k=await GM.choose(OP.map(o=>({t:o.t}))); const o=OP[k]||OP[1];
        for(const t of o.say) await GM.say(yt,t); if(o.narr) await GM.say(null,o.narr); if(out&&o.fam) await GM.say(null,L.out.narr);   /* 「我來幫忙。」：原本的旁白之後接河濱那一句；第二個選項 opt2 的旁白自己就是河濱（AA_526 Y3）*/
        if(o.fam&&typeof SOCIAL!=='undefined'&&SOCIAL.rel){ const r=SOCIAL.rel('heroine_03'); r.fam=(r.fam||0)+o.fam; } } }
    finally{ GM.sceneEnd(); } return true; };
  /* C：店休期間約語彤（invites3d.js 選完時間以後）：時間排到 18:00 以後、答應的那一句換掉 */
  S.inviteAdjust=function(G,id,W){ if(id!=='heroine_03'||!W||W.now||!S.closed(G,W.day)) return null; return {h:Math.max(W.h,18),line:L.invite}; };
  if(typeof STORY!=='undefined'&&STORY.PHONE_RULES) STORY.PHONE_RULES.push(G=>S.phone(G));
  return S;
})();
