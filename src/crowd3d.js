/* ===== 人流：公共場景隨時間改變（D55，使用者 2026-10-13；設計：docs/campus/PUBLIC_BUILDINGS_DESIGN.md 第 3 節）=====
   第一步：校園上公共建築的門口。第二步（2026-10-13）：教學館室內（共同、博雅、普通）每一間教室門口。
   - 共同教學館：上課前在門口等，開始時走進去；下課後從門口走出來，在門口聊一下，再走向椰林大道。
   - 大一女舍：早上出門、傍晚回來的人；晚上有人在門口等人或講電話；深夜沒有人。
   規則（使用者：「不要讓 NPC 隨玩家進出而任意生成和消失」「不要為了每個場景都熱鬧，而讓相同 NPC 同時出現在多個地方」）：
   - 每個地點（spot）有一天裡的時段（slots）；每個時段要幾個人、做什麼。
   - 同一天、同一個時段的那一群人是固定的（日期＋地點＋時段當亂數種子）：出去再進來，看到同一批人、站在同一些位置。
   - 時段開始：玩家看得到那裡 → 從門口（from）走出來；看不到 → 直接在那裡。
   - 時段結束：走向 to（走進門口或走上大路），走到了而且不在玩家眼前才移除。
   - 時間突然跳了（跳過時間、睡覺、讀檔、快速前往）：直接照新的時間重排，不慢慢走。
   - 路人沒有名字，不會是有名字的角色（有名字的人只照作息出現，見 story3d.js）。
   - 教學館室內：教室門口沒有等的人、聊天的人（CROWD-NO-DOOR-1103，使用者 2026-11-03「教室外面可以不要有一坨人嗎」，AA 選 (a)）——
     上課前同學從建築大門直接走進教室坐下、下課從座位直接走出建築（都在 classes3d.js 的 syncRooms：walkInSeat、walkOut）。
     原本 2026-10-13 起每一間教室門口有上課前 20 分鐘等的人（pre|，開始時走進去坐下）、下課後 10 分鐘聊天的人（post|），已拿掉；
     門口那幾段對話（AA_495 第 3、4 節）改成教室裡前一排或旁邊的同學說（下面 S.seatTalk…）。
   - 溫州街小公園（AA_283，S.parkSpots）：每個人各自的位置、坐的位子、繞圈的路線（spot.people）；點了說一句（PARK.bindTap）。測試：node tests/wz_park_people_unit.js
   - 路人分科系（AA_495，CROWD-DEPTS-1028）：校園、總圖、社科圖、體育館、公館的路人是「X系的學生」、點了聽一句；兩個人的對話；教學館教室裡通識、必修的對話（下面 S.dept…、S.seatTalk…，句子在 src/data/crowd_depts.js）。測試：node tests/crowd_depts_unit.js */
'use strict';
const CROWD=(function(){
  const S={};
  const hr=G=>G.hour%24;
  const prng=seed=>{ let s=(seed>>>0)%2147483646+1; return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; }; };
  const hash=str=>{ let h=2166136261; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; };
  const termDay=G=>typeof CALENDAR!=='undefined'&&CALENDAR.kind(G.day)==='term'&&!CALENDAR.weekend(G.day);
  const schoolDay=G=>typeof CALENDAR==='undefined'||CALENDAR.kind(G.day)!=='holiday';   /* 宿舍：學期與寒暑假都有人（寒暑假少一點），國定假日也有，只是時段不同——這裡先只排除不住宿的長假（之後照宿舍規定） */
  const BLOCKS=[[9+10/60,12+10/60],[13+20/60,15+10/60],[15.5,17+20/60]];   /* 和 classes3d.js 的節次一樣 */
  // ---------- 地點與時段 ----------
  S.SPOTS=[
    { id:'gongtong', zone:'campus', label:'共同教學館門口', c:[2,20.2], spread:[4.2,1.6], door:[2,23.1], road:[0,6.5], mix:true,   /* door：門廊前面站得住的地方（走到這裡＝走進館裡）；road：椰林大道 */
      /* 上課日：每一節開始前 20 分鐘有人在門口等（開始時走進去）；下課後 10 分鐘有人從門口出來、站著聊一下，再走去椰林大道 */
      slots(G){ if(!termDay(G)) return []; const out=[]; for(const [a,b] of BLOCKS){ out.push({key:'pre'+a.toFixed(2),t0:a-1/3,t1:a,n:[3,6],pose:'idle',talk:0.4,enter:'road',leave:'door'}); out.push({key:'post'+b.toFixed(2),t0:b,t1:b+1/6,n:[2,5],pose:'talk',talk:0.7,enter:'door',leave:'road'}); } return out; } },
    { id:'fdorm', zone:'campus', label:'大一女舍門口', c:[-93,57.6], spread:[9,1.6], door:[-108,59.3], door2:[-78,57.3], road:[-93,47], female:true,   /* door：A 棟（傳達室）、door2：B 棟；road：舟山路 */
      /* 平日早上出門（07:40–08:50）、傍晚回來（17:20–19:00）、晚上在門口等人或講電話（20:00–22:30）；週末白天零星；深夜沒有人 */
      slots(G){ if(!schoolDay(G)) return []; const wk=typeof CALENDAR!=='undefined'&&CALENDAR.weekend(G.day);
        return wk?[{key:'wkday',t0:10.5,t1:17.5,n:[1,2],pose:'idle',talk:0.3,enter:'door',leave:'road'},{key:'wkeve',t0:19.5,t1:22,n:[1,3],pose:'talk',talk:0.6,enter:'road',leave:'door'}]
                 :[{key:'am',t0:7+40/60,t1:8+50/60,n:[2,4],pose:'idle',talk:0.3,enter:'door',leave:'road'},{key:'eve',t0:17+20/60,t1:19,n:[2,5],pose:'talk',talk:0.6,enter:'road',leave:'door'},{key:'night',t0:20,t1:22.5,n:[1,3],pose:'idle',talk:0.2,enter:'door',leave:'door'}]; },   /* night 原本是 read（坐姿），門口沒有座位＝坐在空中（LAWWW2 10-14 C13 回報）：改站著 */
      talkLabel:'聽一句', lines(G,slot){ return S.fdormLines(G,slot); } },   /* BB_105 D7 宿舍的人們：點了聽一句（下面 S.FDORM_LINES）*/
    /* BB_105 D9 新一屆的大一女生（企劃線 BB_105@68a8479e，AA-C 2026-10-18 補台詞；V1-B105-D2）：法律系大二以後，法服在大一女舍外的路邊擺攤招生（社員輪班；語彤不在法服）。
       日子是 LAWWW 定的：大二、大三、大四上學期第 1～2 週的平日 12:00～17:00（給 AA 的問題）。攤位的桌子、傳單還沒有（場景，D108 歸 LAWWW2）：現在是兩位社員站在路邊，點了「看法服的攤位」。fixed＝人數不加倍 */
    { id:'fdorm_fafu', zone:'campus', label:'法服的攤位（大一女舍外的路）', c:[-89.4,50.5], spread:[0.8,0.3], door:[-93,47], road:[-93,47], mix:true,
      slots(G){ const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; if(G.stage==='econ'||!T||!/^Y[234]S1$/.test(T.id)||T.week>2||!termDay(G)) return []; return [{key:'fafu',t0:12,t1:17,n:[2,2],fixed:true,pose:'idle',talk:0.5,enter:'road',leave:'road'}]; },
      talkLabel:'看法服的攤位', allTalk:true, lines(){ return [S.FAFU_LINES]; } } ];
  /* BB_105 D7 宿舍的人們（企劃線 BB_105@68a8479e 5-3，AA-C 2026-10-18 寫；V1-B105-D2）：大一女舍門口的路人，照時段輪流——開學第一週白天、傍晚、晚上（兩句）、考試週。
     一群人裡一句給一個人（點了聽那一句）；那個時段沒有句子＝不能點。D8 臨時取消是另一件（V3-B105） */
  S.FDORM_LINES={ week1:['（一個女生拖著兩個行李箱，在門口打電話）「媽，我到了。……沒有電梯啦，我爬上來的。五樓。」'], eve:['「她說五分鐘。……我數到第三個五分鐘了。」'],
    night:['（提著兩袋宵夜的人）「鹹酥雞到了，誰下來拿？」','（在門口講電話）「沒有啦，我只是想打給你。」'], exam:['（抱著一疊書的人）「總圖還有位子嗎？……那我去社科圖。」'] };
  S.fdormLines=function(G,slot){ const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, k=slot&&slot.key;
    if(T&&T.exam) return S.FDORM_LINES.exam;   /* 期中、期末考週 */
    if(T&&T.week===1&&(k==='am'||k==='wkday')) return S.FDORM_LINES.week1;   /* 開學第一週白天 */
    if(k==='eve') return S.FDORM_LINES.eve; if(k==='night'||k==='wkeve') return S.FDORM_LINES.night; return []; };
  /* BB_105 D9：點了攤位（舞台說明改旁白＋社員一句）*/
  S.FAFU_LINES=[{t:'（攤位上一疊傳單，法服的社員在喊：「法律服務社！免費法律諮詢的那個！」）'},{who:'法服的社員',t:'新生可以來旁聽喔。……你是學長？那你也可以來。'}];
  /* 點了路人：一句（或一串）旁白／台詞；在劇情、對話裡不演 */
  S.overhear=async function(GM,n,script){ if(!GM||(GM.D&&GM.D.active)) return; const L=[].concat(script).map(x=>typeof x==='string'?{t:x}:x); GM.sceneBegin();
    try{ if(GM.face&&GM.E&&GM.E.player&&n&&n.obj) GM.face(GM.E.player,n.obj.position.x,n.obj.position.z); for(const x of L) await GM.say(x.who?{name:x.who,obj:n&&n.obj}:null,x.t); } finally { GM.sceneEnd(); } };
  /* 教學館室內的教室門口（layout 的 waitSpots）：原本上課前等的人、下課後聊天的人站的地方（CROWD-NO-DOOR-1103 起不再放人）。
     現在只用來認「哪幾間教室有 AA_495 第 3、4 節的對話」（共同、博雅、普通的每一間；霖澤館 201、萬才館照舊沒有）：S.seatTalkRoom */
  const TEACH_LAYOUTS=()=>[typeof GONGTONG_LAYOUT!=='undefined'?GONGTONG_LAYOUT:null,typeof BOYA_LAYOUT!=='undefined'?BOYA_LAYOUT:null,typeof PUTONG_LAYOUT!=='undefined'?PUTONG_LAYOUT:null].filter(Boolean);
  S.seatTalkRoom=(zone,room)=>TEACH_LAYOUTS().some(L=>L.id===zone&&(L.waitSpots||[]).some(w=>w.room===room));
  /* ===== 溫州街小公園的路人（AA_283 第 1 節，企劃線 8b312c12，AA-C 定稿；DL-13／AA283-PARK-1021）=====
     誰在、幾點在：PARK.groups(G)（src/wzpark3d.js：平日的表、週末與國定假日、寒暑假、下雨一個人都沒有）。這裡照 WZ_PARK_LAYOUT 決定每個人在哪裡、做什麼：
     晨運＝環狀步道東側、健身器材前站著；遛狗、散步＝繞老樹的環狀步道走（beh route）；象棋＝涼亭兩張石凳對坐＋旁邊站著看；
     上班族、一家人的大人、晚上的情侶＝樹下圓椅（玩家的三個位子以外；北邊是貓）；孩子＝坐鞦韆、在遊戲場旁邊跑來跑去（beh wander），帶孫子的阿嬤坐「看孩子玩」的長椅；
     課輔班＝排成一排從入口 B 走到入口 A（老師在最後面；S.passRoute）；晚上：一個人坐東邊的鞦韆（西邊的留給玩家，AA_171 第 4 節）、一個站在旁邊、一對坐樹下圓椅。
     人數照表（fixed，不乘 CROWD_X）；同一天同一時段同一批人（和其他地點一樣用日期當種子）。點了說一句：PARK.bindTap。
     孩子還沒有自己的模型：先用路人底模縮到 1.2～1.35 m；阿伯阿嬤、狗、野餐墊、便當也還沒有（美術缺口）*/
  S.parkSpots=function(){ const L=typeof WZ_PARK_LAYOUT!=='undefined'?WZ_PARK_LAYOUT:null; if(!L||typeof PARK==='undefined'||!PARK.groups) return [];
    const item=k=>L.items.find(i=>i.kind===k), ring=item('ring_bench'), pav=item('pavilion'), sw=item('swings'), pg=item('playground'), A=L.area; if(!ring||!pav||!sw||!pg||!A) return [];
    const C=[ring.x,ring.z], rad=a=>a*Math.PI/180, rp=(r,a)=>[+(C[0]+r*Math.sin(rad(a))).toFixed(2),+(C[1]+r*Math.cos(rad(a))).toFixed(2)], face=(p,q)=>+Math.atan2(q[0]-p[0],q[1]-p[1]).toFixed(4);
    /* 樹下圓椅：座位半徑 1.30（WZ_PARK_LAYOUT 的 seats）、面向外。玩家的三個位子在 90°、180°、270°（東、南、西），貓在 0°（北）：路人坐在中間（30° 一格）；ap＝走近、起身站的地方（環狀步道上）*/
    const ringSeat=a=>{ const p=rp(1.3,a); return {x:p[0],z:p[1],yaw:+rad(a).toFixed(4),ap:rp(2.45,a)}; };
    const loop=(r,ccw)=>{ const o=[]; for(let k=0;k<12;k++) o.push(rp(r,((ccw?-k:k)*30+360)%360)); return o; };   /* 環狀步道（寬 1.6：半徑 2.4～4.0）繞一圈的 12 個點；用半徑 2.5（2.6 以上，西北邊 300°～330° 那一段會繞到樹下暖燈的另一邊）*/
    const seats=L.seats||[], stools=seats.filter(s=>/涼亭的石凳/.test(s.label||'')), swings=seats.filter(s=>s.kind==='swing').sort((a,b)=>a.x-b.x), gma=seats.find(s=>/看孩子玩/.test(s.label||''));
    const seatOf=(s,o)=>Object.assign({x:s.x,z:s.z,yaw:s.yaw},o||{});
    const swingSeat=s=>seatOf(s,{surf:0.48,ap:[s.x,+(sw.z-1.4).toFixed(2)]});   /* 鞦韆的座面 0.48 m（ART-PARK2）：坐上去的高度照身高算（spawnPeople 的 lift）；從架子前面走近（和 zones3d.js 同一點）*/
    const fits=L.items.filter(i=>/^fitness_/.test(i.kind)).map(i=>({x:+(i.x-1.05).toFixed(2),z:i.z,to:[i.x,i.z]}));   /* 健身器材前面站著（器材面向西）*/
    const ea=A.entranceA, eb=A.entranceB, A_OUT=[(ea.x0+ea.x1)/2,ea.z-2.0], A_IN=[(ea.x0+ea.x1)/2,ea.z+0.8], LANE=[40,2.0];   /* 入口 A 外面的主巷；LANE＝主巷往東（走遠了）*/
    const B_OUT=[+(eb.x-2.2).toFixed(2),(eb.z0+eb.z1)/2], B_IN=[+(eb.x+0.6).toFixed(2),(eb.z0+eb.z1)/2];   /* 入口 B 外面的北巷、裡面 */
    const PG_E=[+(pg.x+pg.w/2+0.7).toFixed(2),+(pg.z-0.4).toFixed(2)];   /* 遊戲場東邊 */
    const pgAround=[[pg.x-2.0,pg.z+pg.d/2+0.6],[pg.x,pg.z+pg.d/2+0.6],[pg.x+2.0,pg.z+pg.d/2+0.6],[pg.x+pg.w/2+0.7,pg.z+1.1],[pg.x+pg.w/2+0.7,pg.z-0.4]].map(q=>[+q[0].toFixed(2),+q[1].toFixed(2)]);   /* 遊戲場北邊、東邊（遊戲場本身是導航阻擋）*/
    const cnt=(r,slot)=>slot.n[0]+Math.floor(r()*(slot.n[1]-slot.n[0]+1));
    /* 路人編號（STORY.extraSpec：偶數＝女生）：每一群人各用一段（2000 起、一群 200 個），同時在公園裡的人不會拿到同一個編號（同一個編號＝同一個底模、一模一樣的人）*/
    const specs=(r,sexes,ix)=>{ const base=2000+(ix|0)*200+Math.floor(r()*90)*2; return sexes.map((s,k)=>base+k*2+((s==='any'?(r()<0.5?'f':'m'):s)==='m'?1:0)); };
    const KID_H=k=>+(1.2+(k%4)*0.05).toFixed(2);
    const mk=(sp,slot,k,o)=>Object.assign({key:sp.id+'|'+slot.key+'|'+k,pose:'idle',yaw:0},o);
    let IX=0; const mkSpot=(id,c,people,extra)=>Object.assign({id:'wzpark_'+id,zone:'wenzhou',label:'溫州街小公園',park:id,ix:IX++,c,spread:[1,1],door:A_OUT,road:LANE,people,
      slots(G){ return PARK.groups(G).filter(g=>g.spot===id).map(g=>({key:g.key,t0:g.t0,t1:g.t1,n:g.n,fixed:true,pose:'idle',talk:0,enter:'door',leave:'door',pass:!!g.pass,row:g.id})); },
      bind(GM,n,p){ if(PARK.bindTap) PARK.bindTap(GM,n,p); }},extra||{});
    const AM=[{p:rp(3.3,100)},fits[1],{p:rp(3.3,60)},fits[0],{p:rp(3.3,140)},fits[2]].filter(Boolean);
    return [
      /* 06:00～08:00 晨運的阿伯阿嬤（甩手、太極）4～6：環狀步道東側面向老樹、健身器材前 */
      mkSpot('am',[31.0,20.5],function(G,slot,r){ const n=cnt(r,slot), s0=r()<0.5?0:1, sx=[]; for(let k=0;k<n;k++) sx.push((k+s0)%2?'m':'f'); const sp=specs(r,sx,this.ix);
        return sx.map((s,k)=>{ const q=AM[k%AM.length], p=q.p||[q.x,q.z]; return mk(this,slot,k,{x:p[0],z:p[1],yaw:face(p,q.to||C),spec:sp[k],role:s==='f'?'am_f':'am_m'}); }); }),
      /* 07:00～09:00 遛狗的人 1～2：繞環狀步道（反方向）*/
      mkSpot('dog',C,function(G,slot,r){ const n=cnt(r,slot), sp=specs(r,['any','any'],this.ix), lp=loop(2.5,true), st=Math.floor(r()*12);
        return Array.from({length:n},(_,k)=>{ const i=(st+k*6)%12; return mk(this,slot,k,{x:lp[i][0],z:lp[i][1],spec:sp[k],role:'dog',beh:'route',waypoints:lp,ri:i,walkSpeed:1.0}); }); }),
      /* 08:00～11:00 下象棋的阿伯（AA_171 第 3 節那幾位）：兩張石凳對坐下棋＋旁邊站著看 1～2 */
      mkSpot('chess',[pav.x,pav.z],function(G,slot,r){ const n=cnt(r,slot), sp=specs(r,['m','m','m','m'],this.ix), T=[pav.x,pav.z], watch=[[pav.x+1.35,pav.z-0.65],[pav.x-1.35,pav.z+0.65]].map(q=>[+q[0].toFixed(2),+q[1].toFixed(2)]);
        const out=stools.slice(0,2).map((s,k)=>mk(this,slot,k,{x:s.x,z:s.z,yaw:s.yaw,spec:sp[k],role:'chess_play',seat:seatOf(s)}));
        for(let k=out.length;k<n;k++){ const w=watch[(k-out.length)%watch.length]; out.push(mk(this,slot,k,{x:w[0],z:w[1],yaw:face(w,T),spec:sp[k],role:'chess_watch'})); } return out; }),
      /* 12:00～13:00 平日：上班族坐樹下圓椅吃便當（兩個，第 2 節）；週末、國定假日：一家人在樹下野餐（大人坐圓椅、孩子在旁邊跑）*/
      mkSpot('noon',C,function(G,slot,r){ const n=cnt(r,slot);
        if(slot.key==='office'){ const sp=specs(r,['m','m'],this.ix); return [120,150].slice(0,n).map((a,k)=>{ const st=ringSeat(a); return mk(this,slot,k,{x:st.x,z:st.z,yaw:st.yaw,spec:sp[k],role:'office',seat:st}); }); }
        const sp=specs(r,['m','f','any','any'],this.ix), wp=[195,215,235,255].map(a=>rp(3.1,a)); const out=[210,240].map((a,k)=>{ const st=ringSeat(a); return mk(this,slot,k,{x:st.x,z:st.z,yaw:st.yaw,spec:sp[k],role:'family',seat:st}); });
        for(let k=2;k<n;k++){ const p=wp[(k*2)%wp.length]; out.push(mk(this,slot,k,{x:p[0],z:p[1],spec:sp[k],role:'family',height:KID_H(k),beh:'wander',waypoints:wp,walkSpeed:1.3})); } return out; }),
      /* 放學的孩子＋帶孫子的阿嬤 3～5（平日 15:30～17:30；週末 10:00～17:30；寒暑假 09:00～11:00、15:00～17:00）：阿嬤坐長椅；孩子坐兩個鞦韆、在遊戲場旁邊跑 */
      mkSpot('kids',[24.0,22.0],function(G,slot,r){ const n=cnt(r,slot), sp=specs(r,['f','any','any','any','any'],this.ix), out=[];
        if(gma) out.push(mk(this,slot,0,{x:gma.x,z:gma.z,yaw:gma.yaw,spec:sp[0],role:'grandma',seat:seatOf(gma)}));
        for(let k=out.length;k<n;k++){ const j=(k-1+4)%4, base={spec:sp[k],role:'kid',height:KID_H(k)};
          if((j===0||j===2)&&swings[j/2]){ const st=swingSeat(swings[j/2]); out.push(mk(this,slot,k,Object.assign(base,{x:st.x,z:st.z,yaw:st.yaw,seat:st}))); }
          else { const p=pgAround[j===1?1:4]; out.push(mk(this,slot,k,Object.assign(base,{x:p[0],z:p[1],beh:'wander',waypoints:pgAround,walkSpeed:1.4}))); } }
        return out; }),
      /* 週二、週四 17:00～17:20 課輔班的孩子跟著老師穿過公園（入口 B 走到入口 A；老師不取名、走在最後面）6～8 */
      mkSpot('tutor',[24.0,12.0],function(G,slot,r){ const n=cnt(r,slot), sp=specs(r,Array.from({length:n},()=>'any'),this.ix);
        return sp.map((s,k)=>mk(this,slot,k,Object.assign({x:B_OUT[0],z:B_OUT[1],spec:s,role:k===n-1?'tutor':'tutor_kid',pass:true,walkSpeed:0.85},k===n-1?{}:{height:KID_H(k)}))); },{passPts:{bOut:B_OUT,bIn:B_IN,aIn:A_IN,aOut:A_OUT,alt:PG_E}}),
      /* 18:00～20:00 散步的人 2～4：繞老樹走（她）*/
      mkSpot('walk',C,function(G,slot,r){ const n=cnt(r,slot), sp=specs(r,['f','f','f','f'],this.ix), lp=loop(2.5,false), st=Math.floor(r()*12);
        return Array.from({length:n},(_,k)=>{ const i=(st+Math.round(k*12/n))%12; return mk(this,slot,k,{x:lp[i][0],z:lp[i][1],spec:sp[k],role:'walker',beh:'route',waypoints:lp,ri:i,walkSpeed:1.05}); }); }),
      /* 20:00～22:00 學生、情侶 2～4：東邊的鞦韆坐一個、旁邊站一個；樹下圓椅一對（不能點，只有旁白）*/
      mkSpot('night',[30.5,23.5],function(G,slot,r){ const n=cnt(r,slot), sp=specs(r,r()<0.5?['f','m','m','f']:['m','f','f','m'],this.ix), sB=swings[swings.length-1], out=[]; if(!sB) return out;
        const st=swingSeat(sB), by=[+(sB.x-0.5).toFixed(2),+(sw.z-1.5).toFixed(2)];
        out.push(mk(this,slot,0,{x:st.x,z:st.z,yaw:st.yaw,spec:sp[0],role:'night',seat:st}),mk(this,slot,1,{x:by[0],z:by[1],yaw:face(by,[sB.x,sB.z]),pose:'talk',spec:sp[1],role:'night'}));
        [30,60].forEach((a,j)=>{ const rs=ringSeat(a); out.push(mk(this,slot,2+j,{x:rs.x,z:rs.z,yaw:rs.yaw,spec:sp[2+j],role:'night',seat:rs})); });
        return out.slice(0,n); }) ]; };
  /* 課輔班的路線：入口 B 外面（北巷）→ 入口 A 外面（主巷）。入口 B 走不進主園區的時候（現在是這樣：遊戲場的導航阻擋把 B 步道整段擋住，從 B 只能繞北巷、主巷才到 A），
     改從遊戲場東邊出發，不讓一排小孩走進入口 B 又轉身出去；B 步道打通以後自動改回從入口 B 進來（每次排人都先試一次）*/
  S.passRoute=function(E,spot){ const P=spot.passPts; if(!P||!E||!E.pathTo) return null; const inside=(x,z)=>typeof PARK==='undefined'||!PARK.inPark||PARK.inPark(x,z);
    const via=E.pathTo(P.bIn[0],P.bIn[1],0,P.aIn[0],P.aIn[1],0), viaB=!!(via&&via.length&&via.every(q=>inside(q[0],q[1])));
    const from=viaB?P.bOut:P.alt, path=E.pathTo(from[0],from[1],0,P.aOut[0],P.aOut[1],0); if(!path||!path.length) return null;
    const pts=[[from[0],from[1]]].concat(path.map(q=>[q[0],q[1]])); let len=0; for(let i=1;i<pts.length;i++) len+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);
    return {pts,len,viaB,to:P.aOut}; };
  S.SPOTS.push(...S.parkSpots());
  /* ===== 體育館三層的人（GYM-CROWD-1027；使用者 2026-10-27「然後體育館最詭異的是不管哪裡都沒有人」）=====
     開館時間照 gym3d.js（平日 08:00～22:00、週六 09:00～22:00、週日 09:00～18:00、每月第四個星期一休館；國定假日、寒暑假照開、人少一點）：
     - 1F 大廳：服務台的工讀生、走過大廳的人（大廳 ⇄ 球場兩側的開口、樓梯口）、長椅坐一個；
       1F 球場：兩面羽球場有人打球（平日 12:00 起、週末 09:00～17:00；中間那面留給玩家的「打羽球」、中圈留給體育課）；
       玩家自己的體育課（課表的體育課，門口 gym）上課中：中圈北邊一位體育老師（名字＝課堂上的稱呼）面向一排同學（6 個）。
     - B1：服務櫃台後面的櫃台阿姨（「去健身房」那幾句是她說的：gym3d.js 的 SAY_DESK）；跑步機上原地跑、深蹲架前深蹲、啞鈴架前彎舉、臥推椅上肩推、飛輪、划船機、墊子上拉筋（每個人都在用器材，GYM-USE-1103）。
     - 3F 主球場：北邊的籃框半場有人打球（跑一段、停一下、面向籃框）、場邊站著休息聊天；典禮的日子（gym3d.js ceremonyDay：開學、畢業典禮的布置打開）不打球。
     人數照時段（午休、傍晚以後、週末多；早上、寒暑假、國定假日少），一層最多約 12 個完整人物（手機效能：教室 16 個的同一個量級；人數固定，不乘 CROWD_X）。
     玩家的劇情場景不站人：服務台、販賣機、直飲台前面、中圈「體育課集合」、中間那面羽球場的「打羽球」、進門的地方（羽球邀約的朋友在那裡等）、B1 櫃台前面、3F 入口通道。
     同一天同一時段同一批人（日期＋時段當種子，D55）；沒有名字、不能搭話。測試：node tests/gym_crowd_unit.js */
  S.gymHours=G=>{ if(typeof CALENDAR==='undefined') return null; const d=CALENDAR.dateOf(G.day); if(d.wd===1&&d.d>=22&&d.d<=28) return null; return d.wd===7?[9,18]:(d.wd===6?[9,22]:[8,22]); };   /* 第四個星期一休館（和 gym3d.js 的 fourthMonday 同一個判斷）*/
  S.gymSpots=function(){ const L=typeof GYM_LAYOUT!=='undefined'?GYM_LAYOUT:null; if(!L||!L.b1||!L.arena) return [];
    const quiet=G=>typeof CALENDAR!=='undefined'&&CALENDAR.kind(G.day)!=='term', wk=G=>typeof CALENDAR!=='undefined'&&CALENDAR.weekend(G.day);
    const specs=(r,n,ix)=>{ const base=3000+(ix|0)*200+Math.floor(r()*90)*2; return Array.from({length:n},(_,k)=>base+k*2+(r()<0.5?1:0)); };   /* 路人編號（偶數＝女生）：每一群一段，同一層不會撞到同一個人 */
    const cnt=(r,slot)=>slot.n[0]+Math.floor(r()*(slot.n[1]-slot.n[0]+1));
    const mk=(sp,slot,k,o)=>Object.assign({key:sp.id+'|'+slot.key+'|'+k,pose:'idle',yaw:0},o);
    const face=(p,q)=>+Math.atan2(q[0]-p[0],q[1]-p[1]).toFixed(4);
    const shuffle=(a,r)=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
    /* 一天分幾段（每段一群人；段落交界時這一群走掉、下一群走進來）：busy＝[早上, 午休, 下午, 傍晚以後] 的人數範圍 */
    const daySlots=(G,busy,from,to)=>{ const H=S.gymHours(G); if(!H) return []; const a=Math.max(H[0],from==null?H[0]:from), b=Math.min(H[1],to==null?H[1]:to); if(b<=a) return [];
      const q=quiet(G)||(typeof CALENDAR!=='undefined'&&!!CALENDAR.holiday(G.day)), w=wk(G); const cuts=[[a,12,0],[12,14,1],[14,17.5,2],[17.5,b,3]];
      return cuts.map(([t0,t1,i])=>({t0:Math.max(t0,a),t1:Math.min(t1,b),i})).filter(c=>c.t1-c.t0>0.05).map(c=>{ let n=busy[c.i].slice(); if(w) n=[Math.max(n[0],busy[3][0]-1),Math.max(n[1],busy[3][1]-1)]; if(q) n=[Math.max(0,n[0]-1),Math.max(1,n[1]-1)];
        return {key:'g'+c.i,t0:c.t0,t1:c.t1,n,fixed:true,pose:'idle',talk:0,enter:'door',leave:'door'}; }); };
    /* 玩家的體育課（課表的體育課，門口 gym）：[開始前 30 分鐘, 下課, 那一堂]；swim＝游泳週在 B1 上的（CLS.peSwim，AA_644）、false＝在 1F 球場上的 */
    const peWin=(G,swim)=>{ if(typeof CLS==='undefined'||!CLS.dayItems) return []; return CLS.dayItems(G).filter(it=>it.room&&it.room.door==='gym'&&!!(CLS.peSwim&&CLS.peSwim(G,it))===!!swim).map(it=>[it.t0-0.5,it.t1,it]); };
    /* 把一天的時段切開：和體育課重疊的那一段 pe:true（沒切到的時段 key 不變：同一天同一時段同一批人）*/
    const cutPE=(slots,W)=>{ if(!W.length) return slots; const out=[]; for(const s of slots){ let segs=[[s.t0,s.t1,false]];
        for(const [a,b] of W){ const nx=[]; for(const [p,q,f] of segs){ if(f||b<=p||a>=q){ nx.push([p,q,f]); continue; } if(a>p) nx.push([p,a,false]); nx.push([Math.max(p,a),Math.min(q,b),true]); if(b<q) nx.push([b,q,false]); } segs=nx; }
        segs.forEach(([p,q,f],i)=>{ if(q-p>0.05) out.push(Object.assign({},s,{key:s.key+(segs.length>1?'_'+i:''),t0:p,t1:q,pe:f})); }); } return out; };
    let IX=0; const mkSpot=(id,zone,c,door,people,slots,extra)=>Object.assign({id:'gym_'+id,zone,label:'體育館',gym:id,ix:IX++,c,spread:[1,1],door,road:door,people,slots,fidget:true},extra||{});   /* fidget：站著的人（器材旁、場邊、體育課的同學）也有小動作 */
    const D1=[0,17.9], DB=[18,7.6], DA=[0,24.8];   /* 進出的地方：1F 大門、B1 上樓的樓梯、3F 入口通道 */
    const B=L.b1, A=L.arena, eq=n=>(B.equipment.find(e=>e.node===n)||{at:[]}).at;
    /* ---- 1F 大廳 ---- */
    const WALK=[[[-2.8,16.4],[-9.8,13.4],[-10,9.4],[-10.4,5.6],[-10,9.4],[-9.8,13.4]],[[3.2,16.6],[9.8,13.2],[10,9.4],[13.2,6.6],[10,9.4],[9.8,13.2]],[[-3.6,14.2],[-13.8,14.2],[-15.2,16.4],[-13.8,14.2],[3.6,14.0],[14.0,14.0],[15.0,16.6],[14.0,14.0]]];
    const lobby=mkSpot('lobby','gym',[0,15],D1,function(G,slot,r){ const n=cnt(r,slot), sp=specs(r,n+1,this.ix), out=[];
        out.push(mk(this,slot,0,{x:11,z:16.45,yaw:Math.PI,spec:sp[0],role:'desk_1f',fixed:true}));   /* 服務台後面的工讀生（面向大廳）*/
        const rs=shuffle(WALK,r); for(let k=1;k<n;k++){ const w=rs[(k-1)%rs.length], i=Math.floor(r()*w.length); out.push(mk(this,slot,k,{x:w[i][0],z:w[i][1],spec:sp[k],role:'walker',beh:'route',waypoints:w.map(q=>[q[0],q[1],0]),ri:i,walkSpeed:1.1+r()*0.3})); }
        if(n>=3) out.push(mk(this,slot,n,{x:-5.4,z:15.34,yaw:Math.PI,spec:sp[n],role:'bench',seat:{x:-5.4,z:15.34,yaw:Math.PI}}));   /* 長椅坐一個（另外三個位子留給玩家）*/
        return out; },G=>daySlots(G,[[2,3],[3,4],[2,4],[3,5]]));
    /* ---- 1F 球場：羽球（兩面，跑一段停一下、停下來面向網子）---- */
    const COURTS=[[-8.6,-11.2],[8.6,3.2],[8.6,-11.2]];
    const court=mkSpot('court','gym',[0,-4],D1,function(G,slot,r){ const nc=Math.min(COURTS.length,Math.max(1,Math.round(cnt(r,slot)/2))), sp=specs(r,nc*2,this.ix), out=[];
        for(let c=0;c<nc;c++){ const [cx,cz]=COURTS[c]; for(const sd of [-1,1]){ const k=out.length, z0=cz+sd*3.0, wp=[[cx-1.2,z0+sd*0.5],[cx+1.1,z0-sd*0.6],[cx+0.5,z0+sd*1.4],[cx-0.8,z0-sd*0.9]].map(q=>[+q[0].toFixed(2),+q[1].toFixed(2),0]);
          out.push(mk(this,slot,k,{x:wp[0][0],z:wp[0][1],spec:sp[k],role:'badminton',beh:'route',waypoints:wp,ri:Math.floor(r()*wp.length),walkSpeed:2.6,run:true,pauseAt:true,faceYaw:face([cx,z0],[cx,cz])})); } }
        return out; },G=>{ const w=wk(G); return cutPE(daySlots(G,[[0,0],[2,4],[2,4],[4,6]],w?9:12,w?17:21),peWin(G,false)).filter(s=>s.n[1]>0&&!s.pe); });   /* 玩家的體育課在球場上的時候（AA_644：整個球場是那一班的）兩面羽球場不打 */
    /* ---- 1F 球場：體育課（玩家自己的體育課上課中）----
       AA_644 第 1 節：老師在中圈北邊、面向南（面向學生）；同學在南邊排成半圈，大約 10 人（路人底模；運動服的外觀還沒有：LAWWW2）。
       半圈的圓心 (0, −6.8)、半徑 4.2 m：最南邊那一格（0, −2.6）是玩家（CLS.PE_IN_GYM），兩側各 5 格（每格 20°，相隔約 1.46 m）、面向老師；序號 1、2＝玩家左右兩邊，越大越遠。
       有修這堂、在場的朋友由 CLS.peCast 換掉序號最小的幾個（換掉的位子記在 CLS.peTakenKey，人群重排時空著）。
       游泳週（CLS.peSwim：B1 開著）這裡沒有人，整班在 B1 游泳池（gym_pe_pool）*/
    S.PE_RING={c:[0,-6.8],r:4.2,step:20,teacher:[0,-7.0]};
    const ringAt=k=>{ const R=S.PE_RING, j=Math.ceil(k/2), sd=k%2?1:-1, a=sd*j*R.step*Math.PI/180; return [+(R.c[0]+R.r*Math.sin(a)).toFixed(2),+(R.c[1]+R.r*Math.cos(a)).toFixed(2)]; };   /* k＝1…10 */
    S.peRingAt=ringAt;
    const taken=key=>typeof CLS!=='undefined'&&CLS.peTakenKey&&CLS.peTakenKey(key);
    const tName=c=>(typeof CLS!=='undefined'&&CLS.teacherName&&c)?CLS.teacherName(c):'體育老師', tSpec=(c,sp)=>Object.assign({},(typeof CLS!=='undefined'&&CLS.teacherSpec&&c)?CLS.teacherSpec(c):STORY.extraSpec(sp));
    const peSlots=(G,swim)=>peWin(G,swim).map(([t0,t1,it])=>({key:'pe|'+it.key,t0,t1,n:[11,11],fixed:true,pose:'idle',talk:0,enter:'door',leave:'door',course:it.c}));
    const pe=mkSpot('pe','gym',[0,-6],D1,function(G,slot,r){ const sp=specs(r,11,this.ix), out=[]; const c=slot.course, T=S.PE_RING.teacher;
        out.push(mk(this,slot,0,{x:T[0],z:T[1],yaw:0,spec:tSpec(c,sp[0]),role:'pe_teacher',name:tName(c),rawSpec:true}));
        for(let k=1;k<=10;k++){ const q=ringAt(k), o=mk(this,slot,k,{x:q[0],z:q[1],yaw:face(q,T),spec:sp[k],role:'pe_student',pose:k%3===1?'talk':'idle'}); if(!taken(o.key)) out.push(o); }
        return out; },G=>peSlots(G,false));
    /* ---- B1 ---- */
    const TM=eq('GYM_TREADMILL'), SQ=eq('GYM_SQUAT_RACK'), DBR=eq('GYM_DB_RACK'), BN=eq('GYM_BENCH'), MAT=eq('GYM_MAT');
    const BK=eq('GYM_BIKE'), RW=eq('GYM_ROWER');
    /* GYM-USE-1103（使用者 11-03「你就設計健身房真的有人在用很難嗎」；之前「都不太會動 更詭異」BUG-GYM-CROWD-STIFF-1103 先拿掉了站著不動的人）：
       健身中心的每一個人都在用器材，動作在 character3d.js（gymIK：gym_squat、gym_curl、gym_press、gym_bike、gym_row、gym_stretch；一個循環一個循環地動、每個人速度相位不同）：
       跑步機原地跑（皮帶 0.18 m）、深蹲架前面深蹲（面向鏡子）、啞鈴架前面彎舉（面向鏡子）、臥推椅坐著肩推、飛輪、划船機、墊子上拉筋。
       坐在器材上的人：人物原點＝器材原點、朝向＝器材的 ry（器材正面 +z＝使用的人面向的方向，gym_layout.js noteFacing）。全部 fixed（照位置放、不走動、小動作不動他們）；
       沒有站著不動的人（S.GYM_STAND_FIT 拿掉）。挑幾個人照舊由 daySlots 的人數決定 */
    const G_=(q,o)=>Object.assign({x:+q[0].toFixed(2),z:+q[1].toFixed(2),yaw:0,fixed:true},o);
    const fit=[].concat(TM.filter((q,i)=>i%2===0).map(q=>({x:q[0],z:12.2,y:0.18,yaw:0,pose:'run',idlePose:'run',fixed:true,role:'treadmill'})),   /* 跑步機上原地跑（皮帶 0.18 m 高）*/
      SQ.map(q=>G_([q[0],q[1]+1.15],{pose:'gym_squat',role:'rack'})),   /* 深蹲架（前面的立柱在 +0.56、槓在 +0.61）前面 1.15 m、面向鏡子 */
      DBR.length?[-0.55,0.55].map(dx=>G_([DBR[0][0]+dx,DBR[0][1]-0.95],{pose:'gym_curl',role:'dumbbell'})):[],   /* 啞鈴架（靠著鏡牆）前面、面向鏡子 */
      [BN[0],BN[2]].filter(Boolean).map(q=>G_(q,{pose:'gym_press',role:'bench'})),   /* 臥推椅的座墊上（中間那張空著）*/
      BK.filter((q,i)=>i%2===0).map(q=>G_(q,{pose:'gym_bike',role:'bike'})),
      RW.map(q=>G_(q,{yaw:Math.PI/2,pose:'gym_row',role:'rower'})),   /* 划船機 ry π/2：使用的人面向 +x */
      [MAT[0],MAT[2]].filter(Boolean).map(q=>G_([q[0],q[1]-0.55],{pose:'gym_stretch',role:'mat'})));   /* 坐在墊子靠南那一端、腿往北伸 */
    for(const q of fit) q.yieldPlayer=true;   /* 玩家站在那裡（GYM-FIT-1107：用完器材站回 stand＝深蹲架、史密斯機、啞鈴架的 use）＝這一段不放人（spawnPeople）*/
    const b1=mkSpot('b1','gym_b1',[-6,9],DB,function(G,slot,r){ const n=cnt(r,slot), sp=specs(r,n+1,this.ix), out=[];
        out.push(mk(this,slot,0,{x:B.desk.staff.x,z:B.desk.staff.z,yaw:0,spec:sp[0]&~1,role:'desk_b1',name:'櫃台阿姨',fixed:true}));   /* 櫃台後面，面向客人（偶數＝女生）*/
        const pick=shuffle(fit,r).slice(0,n); pick.forEach((q,k)=>out.push(mk(this,slot,k+1,Object.assign({spec:q.role==='mat'?(sp[k+1]|1):sp[k+1]},q))));   /* BUG-GYM-SKIRT-1103（BB／CC 11-03）：墊子上拉筋＝坐在地上，女生路人底模有四套長裙（nf10／14／17／19），裙子後片掛在臀部、坐地就穿進地板 0.33～0.50 m——墊子上的人用男生底模（奇數 spec）*/
        return out; },G=>daySlots(G,[[2,3],[3,4],[2,4],[4,6]]));
    /* ---- B1 游泳池（BUG-GYM-POOL-EMPTY-1103；使用者 11-03 截圖：「游泳池完全沒人？」）：池邊救生員高椅旁站著的救生員（面向池子）、池邊長椅坐著休息的人。
       水裡游泳的人要游泳的動作和泳裝模型（LAWWW2：ART-GYM-POOL-SWIMMERS-1103），還沒有；池子導航整個擋住，人不會走進水裡 */
    const LG=(B.entryProps.find(e=>e.node==='GYM2_LIFEGUARD')||{at:[[14.2,-12]]}).at[0], PB=B.poolBenches||[];
    const pool=mkSpot('pool','gym_b1',[0,-2],DB,function(G,slot,r){ const n=cnt(r,slot), sp=specs(r,n,this.ix), out=[];
        out.push(mk(this,slot,0,{x:+(LG[0]-1.0).toFixed(2),z:LG[1],yaw:-Math.PI/2,spec:sp[0],role:'lifeguard',name:'救生員',fixed:true}));   /* 高椅西邊、面向池子（-x）*/
        if(slot.pe) return out;   /* 游泳週的體育課（AA_644）：長椅給那一班，池邊只有救生員 */
        const bs=shuffle(PB,r); for(let k=1;k<n&&k-1<bs.length;k++){ const q=bs[k-1]; out.push(mk(this,slot,k,{x:q[0],z:+(q[1]-0.1).toFixed(2),yaw:Math.PI,spec:sp[k],role:'pool_bench',seat:{x:q[0],z:+(q[1]-0.1).toFixed(2),yaw:Math.PI}})); }   /* 長椅四張：至少空一張給玩家（n 最多 3）*/
        return out; },G=>cutPE(daySlots(G,[[2,3],[2,3],[2,3],[3,3]]),peWin(G,true)));   /* 放假、國定假日少一個：至少救生員＋一個人 */
    /* ---- B1 游泳池：游泳週的體育課（AA_644 第 1 節：整班改到 B1 游泳池，老師站池邊，同學坐在池邊的長椅）----
       東側兩張長椅一張坐三個（面向池子）、旁邊站兩個；老師站在長椅和池子中間、面向長椅；玩家站在長椅西邊（CLS.PE_POOL）。序號越小離玩家越近（CLS.peCast 先換那幾個）*/
    S.PE_POOL_CAST={teacher:[19.8,-3.4],seats:[[17.95,-1.1],[18.6,-1.1],[19.25,-1.1],[20.35,-1.1],[21.0,-1.1],[21.65,-1.1]],stand:[[22.8,-1.7],[22.7,-2.7]]};
    const pePool=mkSpot('pe_pool','gym_b1',[19.8,-2.2],DB,function(G,slot,r){ const sp=specs(r,9,this.ix), out=[], C=S.PE_POOL_CAST, c=slot.course;
        out.push(mk(this,slot,0,{x:C.teacher[0],z:C.teacher[1],yaw:0,spec:tSpec(c,sp[0]),role:'pe_swim_teacher',name:tName(c),rawSpec:true}));
        C.seats.forEach((q,i)=>{ const o=mk(this,slot,i+1,{x:q[0],z:q[1],yaw:Math.PI,spec:sp[i+1],role:'pe_swim',seat:{x:q[0],z:q[1],yaw:Math.PI}}); if(!taken(o.key)) out.push(o); });
        C.stand.forEach((q,i)=>{ const k=C.seats.length+1+i, o=mk(this,slot,k,{x:q[0],z:q[1],yaw:face(q,C.teacher),spec:sp[k],role:'pe_swim'}); if(!taken(o.key)) out.push(o); });
        return out; },G=>peSlots(G,true));
    /* ---- 3F 主球場 ---- */
    const HOOP=A.court&&A.court.hoops?A.court.hoops[0]:[0,-14.43];
    S.ARENA_HOOPS=S.ARENA_HOOPS!==false;   /* 11-07 LAWWW2-B ART-ARENA-HOOPS-1105 籃架接上（gym_arena.glb 的 SET_HOOPS）：預設 true；設 false 回到場邊等 */    /* 籃架接上（LAWWW2 ART-ARENA-HOOPS-1105）改 true：打球的人回到籃框半場跑 */
    const arena=mkSpot('arena','gym_arena',[0,-10],DA,function(G,slot,r){ const n=cnt(r,slot), sp=specs(r,n,this.ix), out=[], np=Math.max(2,n-2);
        /* ARENA-NOHOOP-1105（使用者 11-05 07:1x「主球場一群人跑來跑去 連籃框都沒有 還有人穿裙子打籃球??」）：gym_arena.glb 還沒有籃架（LAWWW2：ART-ARENA-HOOPS-1105）、
           路人也還沒有運動服——籃架接上以前（S.ARENA_HOOPS false），打球的人不上場跑：站在東側場邊等（面向球場），而且只用男生底模（奇數 spec：長裙那四套不上場，同 BUG-GYM-SKIRT-1103）*/
        if(!S.ARENA_HOOPS){ const WAIT=[[8.7,-12.6],[8.9,-11.6],[8.6,-10.5],[9.0,-9.5],[8.7,-8.4],[9.1,-13.6]];
          for(let k=0;k<np;k++){ const q=WAIT[k%WAIT.length]; out.push(mk(this,slot,k,{x:q[0],z:q[1],yaw:face(q,[0,q[1]]),spec:sp[k]|1,role:'basketball',pose:k%2?'idle':'talk'})); } }
        else for(let k=0;k<np;k++){ const wp=shuffle([[-4.2,-12.2],[4.0,-12.6],[-2.2,-8.4],[2.4,-8.2],[0,-10.6],[-5.0,-9.2],[5.2,-9.6],[0.8,-12.8]],r).slice(0,4).map(q=>[q[0],q[1],0]);
          out.push(mk(this,slot,k,{x:wp[0][0],z:wp[0][1],spec:sp[k]|1,role:'basketball',beh:'route',waypoints:wp,ri:0,walkSpeed:2.8,run:true,pauseAt:true,faceYaw:face([wp[0][0],wp[0][1]],HOOP)})); }
        const REST=[[9.6,-16.8,'talk'],[10.5,-16.2,'idle'],[-9.4,-17.2,'idle']]; for(let k=np;k<n;k++){ const q=REST[(k-np)%REST.length]; out.push(mk(this,slot,k,{x:q[0],z:q[1],yaw:face([q[0],q[1]],[(k-np)===0?10.5:9.6,(k-np)===0?-16.2:-16.8]),spec:sp[k],role:'rest',pose:q[2]})); }
        return out; },G=>{ if(typeof GY3!=='undefined'&&GY3.ceremonyDay&&GY3.ceremonyDay(G)) return []; return daySlots(G,[[2,3],[4,5],[3,5],[6,8]]); });
    for(const sp of [lobby,court,pe,b1,pool,pePool,arena]) sp.bind=S.gymBind;
    return [lobby,court,pe,b1,pool,pePool,arena]; };
  /* 體育館路人「聽一句」（AA_489 第 4 節，AA-C 2026-10-27 定稿，句子照抄；使用者 X108「體育館不管哪裡都沒有人」）：
     每個人一句；同一次進來（GM.enterN＋區域）不重複，一種人的句子用完了其他人就不說；照區域輪（下一次進來從下一句開始：G.flags.gymHear＝{種類: 從第幾句}）。
     散步的人、1F 長椅上的人：AA_489 沒寫句子；AA_495（路人分科系）起是「體」的系（電機、醫學），說那個系的句子（S.deptGymOne）。B1 健身房的人（跑步機、深蹲架、啞鈴、重訓椅、墊子）＝運動的人；體育老師說話時用課堂上的稱呼。
     AA_495「體育館加三句」（AA-C 2026-10-28，句子照抄）跟這 13 句一起輪：羽球場、籃球場、場邊各多一句，說的人是那個系的學生（W：那一句的說話的人；空的＝照 who）。*/
  S.GYM_HEAR={ desk_1f:{who:'工讀生',L:['學生證給我刷一下。','羽球場現場的只剩晚上那一面，要的話先登記。']},
    badminton:{who:'打球的人',L:['剛剛那顆是界內吧？','再一局就好，我十點有課。','剛剛那顆，我們系的規則是界內。'],W:[null,null,'外文系的學生']},
    pe_student:{who:'同學',L:['老師說期末要考發球。','我的拍線斷了，誰有多一支？']},
    pe_teacher:{who:'老師',L:['熱身兩圈，跑完到網子這邊集合。']},
    desk_b1:{who:'櫃台阿姨',L:['毛巾自己帶，器材用完擦一下。']},
    fit:{who:'運動的人',L:['你還要用嗎？我輪一組。','今天練腿。明天走樓梯會很好笑。']},
    basketball:{who:'打球的人',L:['三對三，輸的下場。','傳球啦！','明天系盃。我們只求不要輸太多。'],W:[null,null,'化學系的學生']},   /* 化學系的學生（系隊外套：外觀給 LAWWW2）*/
    rest:{who:'看球的人',L:['我們系明天比賽，先來看場地。','我們系每次比賽都來好多人，加油的比打球的多。'],W:[null,'醫學系的學生']} };
  S.gymHearKind=(spot,role)=>spot&&spot.gym==='b1'&&['treadmill','rack','dumbbell','bench','mat','bike','rower'].includes(role)?'fit':(spot&&spot.gym==='lobby'&&role!=='desk_1f'?null:role);
  let gymVisit=null;
  S.gymBind=function(GM,n,p){ const G=GM&&GM.G; if(!G||!n) return; const k=S.gymHearKind(this,p&&p.role), H=k&&S.GYM_HEAR[k]; if(!H){ if(S.deptGymOne) S.deptGymOne(GM,this,n,p); return; }   /* 大廳散步的人、長椅上的人：AA_495 的系 */
    const vk=(GM.enterN|0)+':'+G.zone; if(!gymVisit||gymVisit.key!==vk) gymVisit={key:vk,used:{},start:{}};
    const F=G.flags||(G.flags={}), R=F.gymHear||(F.gymHear={}); if(gymVisit.start[k]==null){ gymVisit.start[k]=R[k]|0; R[k]=((R[k]|0)+1)%H.L.length; }   /* 這一次從第幾句開始；下一次從下一句 */
    const u=gymVisit.used[k]|0; if(u>=H.L.length) return; gymVisit.used[k]=u+1;
    const i=(gymVisit.start[k]+u)%H.L.length, t=H.L[i], w=H.W&&H.W[i], who=w||(k==='pe_teacher'&&n.name?n.name:(k==='desk_b1'&&n.name?n.name:H.who));
    if(w){ n.name=w; n.dept=w.replace(/系的學生$/,''); }   /* AA_495 那三句：說的人是那個系的學生 */
    n.hear={who,t}; n.talkLabel='聽一句'; n.talk=()=>S.overhear(GM,n,[{who,t}]); };
  S.SPOTS.push(...S.gymSpots());
  /* ===== B1 游泳池水道裡游泳的人（ART-GYM-POOL-SWIMMERS-1103；使用者 11-03 截圖「游泳池完全沒人？」X169 後半；泳客模型、動作：LAWWW2 980fdb24e）=====
     開館時間（S.gymHours，和健身中心、救生員同一個）水道裡 2～4 個人來回游：模型 char.swim_sm1／sm2／sf1／sf2（manifest lazy，進 B1 才下載）、姿勢 swim_free（自由式）或 swim_breast（蛙式）。
     - 水道：GYM_LAYOUT.b1.pool.basin（7 道、每道 2.5 m）；中線 z＝basin.z0＋2.5×(i＋0.5)，挑不相鄰的水道、每人一道；每人速度 0.9～1.2 m/s、起始時間不同（不同步）。
     - 每一格：q＝CHAR.swimLap(時間＋偏移, 23.4, 速度)（25 m 扣兩頭各 0.8 m；到池邊停 1.4 秒轉身）；人物 (池中線 x＋q.x, 0, 水道中線)、朝向 q.yaw；趴到水面的高度由 character3d.js 的 C.GYM.swim 處理。
     - 泳客的 VRM 還沒載好、載入失敗＝那個人不放進水裡（備用人物沒有游泳的動作，會直挺挺站在水裡：GYM_FALL）。進場時（換區域的黑幕裡，包括黑幕裡才載好的：game3d.js enter 等這一區的 VRM 載好才淡入）照現在的時間直接放；
       之後才載好的，等他在畫面外、或游到池邊轉身的那一刻才放（不在玩家眼前憑空出現在水道中間）。關館：在畫面外、或游到池邊時拿掉；時間跳了（睡覺、跳時間、讀檔）直接拿掉。
     - 同一天同一批人（日期當種子，D55）；人數照畫質（低 2、中 3、高 4 個以內，同 story3d 路人的 qf）、B1 一層最多 16 個完整人物（gym_crowd_unit 的上限；放不下就少放，不擠掉別人）。
     - 不是 E3 的導航、碰撞（池子的導航本來整個擋住；泳客不走導航，每一格直接設位置）、沒有 talk＝不能點、只在 gym_b1。不改任何台詞。測試：node tests/pool_swimmers_wire_unit.js */
  S.SWIM={zone:'gym_b1', L:23.4, v:[0.9,1.2], models:['char.swim_sm1','char.swim_sm2','char.swim_sf1','char.swim_sf2'], poses:['swim_free','swim_breast'], cap:{low:2,medium:3,high:4}, layerCap:16};
  S.swimBasin=()=>{ const L=typeof GYM_LAYOUT!=='undefined'?GYM_LAYOUT:null; return (L&&L.b1&&L.b1.pool&&L.b1.pool.basin)||null; };
  S.swimOpen=G=>{ const H=G?S.gymHours(G):null; if(!H) return false; const h=hr(G); return h>=H[0]&&h<H[1]; };
  /* 這一天的泳客（開著才有）：[{key, model, lane, x0（池中線）, z（水道中線）, pose, v, off}] */
  let swimPC=null;   /* 每一格都要：同一天、同一個畫質算一次 */
  S.swimPlan=function(G,qLevel){ const B=S.swimBasin(), W=S.SWIM; if(!B||!S.swimOpen(G)) return []; const ck=G.day+'|'+qLevel+'|'+B.x0+','+B.z0; if(swimPC&&swimPC.k===ck) return swimPC.v; const r=prng(hash('swim|'+G.day));
    const nl=B.lanes||7, lw=(B.z1-B.z0)/nl; let n=2+Math.floor(r()*3); n=Math.min(n,W.cap[qLevel]||W.cap.medium,W.models.length,Math.ceil(nl/2));
    const combos=[]; const pick=(from,acc)=>{ if(acc.length===n){ combos.push(acc.slice()); return; } for(let i=from;i<nl;i++){ acc.push(i); pick(i+2,acc); acc.pop(); } }; pick(0,[]);   /* 不相鄰的水道 */
    const lanes=combos.length?combos[Math.floor(r()*combos.length)]:[]; const ms=W.models.slice(); for(let i=ms.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [ms[i],ms[j]]=[ms[j],ms[i]]; }
    swimPC={k:ck,v:lanes.map((ln,k)=>({key:'swim|'+k,model:ms[k],lane:ln,x0:+((B.x0+B.x1)/2).toFixed(3),z:+(B.z0+lw*(ln+0.5)).toFixed(3),pose:W.poses[r()<0.5?0:1],v:+(W.v[0]+r()*(W.v[1]-W.v[0])).toFixed(3),off:+(r()*60).toFixed(2)}))}; return swimPC.v; };
  const swimLive={}, swimLoad=new Map(); let swimT=0, swimLastH=null;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['crowd3d:swimLoad']=()=>{ swimLoad.clear(); };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：下載中的記號清掉（下一次照 ASSETS 的快取重新判斷，不會重複下載）*/
  S.swimLive=swimLive; S.swimClock=()=>swimT;
  const swimReady=key=>typeof CHAR!=='undefined'&&(CHAR.canVRM?CHAR.canVRM({model:key}):(typeof ASSETS!=='undefined'&&!!ASSETS.has&&ASSETS.has(key)));
  /* 下載泳客的 VRM（和它的動作檔）：一次；失敗就不放那個人（不重試）*/
  S.swimFetch=function(key){ if(swimLoad.has(key)||typeof ASSETS==='undefined'||!ASSETS.loadOne||!ASSETS.manifest||!ASSETS.manifest[key]) return false; const m=ASSETS.manifest[key]; swimLoad.set(key,'loading');
    const rq=ASSETS._req; ASSETS._req=null; const ks=[key].concat(m.anims&&ASSETS.manifest[m.anims]?[m.anims]:[]), pr=Promise.all(ks.map(k=>{ try{ return ASSETS.loadOne(k); }catch(e){ return Promise.reject(e); } })); ASSETS._req=rq;   /* 不算進進場要等的清單（ASSETS._req）：泳客 VRM 約 6.5 MB，不能讓第一次進 B1 的黑畫面變長；載好了在池邊轉身時才放 */
    pr.then(()=>{ swimLoad.set(key,'ok'); }).catch(()=>{ swimLoad.set(key,'fail'); }); return true; };
  S.swimAt=p=>{ const q=CHAR.swimLap(swimT+p.off,S.SWIM.L,p.v); return {x:p.x0+q.x,z:p.z,yaw:q.yaw,turn:q.turn}; };
  S.swimTick=function(GM,dt,instant){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.npcs) return; swimT+=dt>0?dt:0;
    if(swimLastH!=null&&Math.abs(G.hour-swimLastH)>0.2) instant=true; swimLastH=G.hour;   /* 時間跳了：直接照新的時間 */
    if(GM.isEntering&&GM.isEntering()) instant=true;   /* 換區域還在黑幕裡（game3d.js enter：等這一區的正式模型載好才淡入，泳客的 VRM 也在等的清單裡）：載好就直接放進水道 */
    for(const k in swimLive) if(!E.npcs.includes(swimLive[k].n)) delete swimLive[k];   /* 換區域、別的地方拿掉了 */
    const plan=G.zone===S.SWIM.zone&&typeof CHAR!=='undefined'&&CHAR.swimLap?S.swimPlan(G,E.q&&E.q.level):[], want={}; for(const p of plan) want[p.key]=p;
    for(const k in swimLive){ const L=swimLive[k], p=want[k]&&want[k].model===L.p.model&&want[k].lane===L.p.lane?want[k]:null; if(p) continue;   /* 關館（或換了一天）：畫面外、游到池邊才拿掉 */
      const a=S.swimAt(L.p); if(instant||a.turn>0||!inView(E,{x:a.x,y:-0.5,z:a.z})){ E.removeNPC(L.n); delete swimLive[k]; } }
    let room=S.SWIM.layerCap-E.npcs.length;   /* B1 一層最多 16 個完整人物（泳客也算）*/
    for(const p of plan){ if(swimLive[p.key]) continue; if(!swimReady(p.model)){ S.swimFetch(p.model); continue; } if(room<=0) continue;   /* 還沒載好：先不放（不讓備用人物站在水裡）*/
      const a=S.swimAt(p); if(!instant&&!(a.turn>0)&&inView(E,{x:a.x,y:-0.5,z:a.z})) continue;   /* 後來才載好：等在畫面外、或游到池邊再放 */
      const m=(typeof ASSETS!=='undefined'&&ASSETS.manifest&&ASSETS.manifest[p.model])||{}, o=CHAR.build({id:'swim_'+p.model.replace(/^char\./,''),model:p.model,height:m.height,sex:m.sex});
      o.position.set(a.x,0,a.z); o.rotation.y=a.yaw;
      const n=E.addNPC({obj:o,name:'',beh:'idle',pose:p.pose,idlePose:p.pose,isExtra:true,swimmer:true,swimKey:p.key,frozen:true,fixedPos:true,lv:0});
      n.obj.position.y=0; swimLive[p.key]={n,p}; room--; }
    for(const k in swimLive){ const L=swimLive[k], o=L.n.obj, a=S.swimAt(L.p); o.position.set(a.x,0,a.z); o.rotation.y=a.yaw; L.n.pose=L.n.idlePose=L.p.pose; } };   /* 每一格照 swimLap 擺（模型換過 n.obj 也照樣）*/
  /* ===== 系籃練球的球場（BBALL-PRESENT-1030；使用者 2026-10-30「系藍練團時間到 根本球場空的」）=====
     校園籃球場（醉月湖東側，zones3d.js 的 bballCourt：半場 15×14、籃框在北邊 (−4,−120.85)；活動點 (3.3,−112.7) 在東邊兩張長椅中間）。
     時段＝系籃練球（activities.js 的 dept_basketball）那一天、那一段：ACTIVITIES.on 成立（大一上第 5～7、10～15 週的週五 17:30～19:00；國定假日照 ACTIVITIES 的規則停練＝沒有人、也沒有參加點），
     做法同體育館 3F 主球場（arena）：6～8 個人在籃框那半場照路線跑一段、停一下、面向籃框；2～3 個人在場邊（記分、送水）。同一天同一批人（日期＋時段當種子），時段結束走到南邊的路走掉。
     路人沒有名字；打球的人點了聽一句（體育館籃球場那一組句子裡沒有指定說話的人那幾句：S.GYM_HEAR.basketball），場邊的人不說話。
     有名字的人（阿哲在場邊、明軒在場上）照作息（characters.js 的 dept_basketball 那一筆），路線不經過他們站的地方、不經過活動點。測試：node tests/bball_present_unit.js
     下雨的週五（BBALL-RAIN-1030）：照 17:30 的天氣一次定整場（ACTIVITIES.rainy），下雨場改到新體育館一樓走廊——球場沒有人（slots 回空的）；測試：node tests/bball_rain_unit.js */
  S.BBALL={ act:'dept_basketball', c:[-4,-114.5], hoop:[-4,-119.7], door:[4,-100.5], road:[32,-98],
    RUN:[[-4.2,-118.4],[-1.4,-117.8],[-7.0,-117.6],[-2.4,-115.6],[-5.6,-115.8],[-9.0,-115.2],[0.4,-114.8],[-8.2,-112.6],[-4.6,-113.0],[-1.0,-112.6]],   /* 籃框那半場（z ≤ −112.2、x ≤ 0.6）：離明軒 (−4,−110.6)、阿哲 (1.6,−111)、活動點都 1.5 m 以上 */
    SIDE:[[-7.5,-105.6,'scorer','idle',[-7.5,-112]],[-12.0,-112.0,'water','talk',[-4,-112]],[-12.0,-114.4,'water','idle',[-4,-114.4]]] };   /* 場邊：南邊中線外記分、西邊場外送水（面向場內）*/
  S.bballSpot=function(){ const B=S.BBALL, face=(p,q)=>+Math.atan2(q[0]-p[0],q[1]-p[1]).toFixed(4);
    const shuffle=(a,r)=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
    return { id:'bball_practice', zone:'campus', label:'系籃練球（籃球場）', c:B.c, spread:[1,1], door:B.door, road:B.road, fidget:true, bball:true,
      slots(G){ if(typeof ACTIVITIES==='undefined'||!ACTIVITIES.list) return []; const a=ACTIVITIES.list.find(q=>q.id===B.act); if(!a||!ACTIVITIES.on(a,G.day,G)) return [];
        if(ACTIVITIES.rainy&&ACTIVITIES.rainy(a,G)) return [];   /* 下雨的週五（BBALL-RAIN-1030，AA 10-30）：系籃改到新體育館走廊——球場沒有人、路人也不打球（17:30 的天氣一次定整場：ACTIVITIES.rainy）*/
        return [{key:'practice',t0:a.t0,t1:a.t1,n:[8,11],fixed:true,pose:'idle',talk:0,enter:'door',leave:'road'}]; },
      people(G,slot,r){ const n=slot.n[0]+Math.floor(r()*(slot.n[1]-slot.n[0]+1)), side=n>=10?3:2, np=n-side, base=5000+Math.floor(r()*90)*2, out=[];
        const mk=(k,o)=>Object.assign({key:this.id+'|'+slot.key+'|'+k,pose:'idle',yaw:0,spec:base+k*2+(r()<0.7?1:0)},o);   /* 路人編號（偶數＝女生）：5000 起一段，不和體育館（3000）、小公園（2000）撞 */
        for(let k=0;k<np;k++){ const wp=shuffle(B.RUN,r).slice(0,4).map(q=>[q[0],q[1],0]); out.push(mk(k,{x:wp[0][0],z:wp[0][1],role:'bball_run',beh:'route',waypoints:wp,ri:0,walkSpeed:2.8,run:true,pauseAt:true,faceYaw:face(wp[0],B.hoop)})); }
        for(let k=0;k<side;k++){ const q=B.SIDE[k]; out.push(mk(np+k,{x:q[0],z:q[1],yaw:face(q,q[4]),role:q[2],pose:q[3]})); }
        return out; },
      bind(GM,n,p){ S.bballBind(GM,n,p); } }; };
  /* 打球的人「聽一句」：體育館籃球場那一組（S.GYM_HEAR.basketball）裡沒有指定說話的人的句子（W 空的；「明天系盃」那句是化學系的學生，不在法律系的練球說）；
     同一次進來不重複、用完了就不說、下一次從下一句開始（G.flags.bballHear；輪法同體育館）。點了不擋活動點、阿哲明軒（yieldIt）*/
  let bballVisit=null;
  S.bballLines=()=>{ const H=S.GYM_HEAR.basketball; return H.L.filter((t,i)=>!(H.W&&H.W[i])); };
  S.bballBind=function(GM,n,p){ const G=GM&&GM.G; if(!G||!n||!p||p.role!=='bball_run') return; const L=S.bballLines(); if(!L.length) return;
    n.yieldIt=true; n.talkLabel='聽一句';
    n.talk=()=>{ const vk=(GM.enterN|0)+':'+G.zone; if(!bballVisit||bballVisit.key!==vk){ const F=G.flags||(G.flags={}); bballVisit={key:vk,used:0,start:F.bballHear|0}; F.bballHear=((F.bballHear|0)+1)%L.length; }
      if(bballVisit.used>=L.length) return; const t=L[(bballVisit.start+bballVisit.used)%L.length]; bballVisit.used++; const who=S.GYM_HEAR.basketball.who; n.hear={who,t}; return S.overhear(GM,n,[{who,t}]); }; };
  S.SPOTS.push(S.bballSpot());
  /* ===== 店裡的客人（SHOP-DINERS-1103，USER_WANTS X187；使用者 2026-11-03 附 10/18 週六 18:22 巷子裡定食的截圖：「店內都沒有人 幾乎所有店」「好詭異」）=====
     進得去的店（兩點半 Café 以外：Café 照舊用 story3d.js 的 S.cafeCustomers，X71、芷若 Z3 那一套不動）營業時間內有沒有名字的客人：
     - 吃飯的店（阿鳳麵店、林家乾麵、巷子裡定食、118 巷的七間餐廳）坐在位子上吃，一桌兩個人的會轉頭看對方（聊天）；半熟（早午餐）、一盞（茶屋）坐著；
       慢讀咖啡：一個人的看書（read）、用筆電（坐著＋腿上的筆電 laptop_lap）、發呆；一一八茶飲：高腳椅坐一個、櫃台前等飲料的一個。
     - 書店站在書架前看書、便利商店逛貨架和排隊結帳、影印店站在櫃台和文具架前（都面向架子、櫃台）。
     - 人數照時段：午餐 11:30～13:30、晚餐 17:30～19:30 坐滿四到六成，下午、晚上一到兩成；早午餐、咖啡、茶屋照自己的尖峰；打烊（places.js、118 巷資料的營業時間、颱風假、麵店過年店休）沒有人。
       週末：吃飯的店少一點（學生回家）、早午餐咖啡茶屋多一點；寒暑假學區的店少四成（便利商店少兩成）；考試週影印店、咖啡多。
     - 每一桌（兩個位子一組：面對面的兩張、或吧台相鄰的兩張；剩下的一個位子一組）一天的客人照（店＋桌＋日期）當種子排好：幾點來、坐多久、幾個人、做什麼——
       同一天同一時間出去再進來是同一批人坐同一些位子（D55）；時間跳了照新的時間直接排（和其他地點一樣）；一桌一桌各自進出，不會整間店同時起身。
     - 玩家的位子：每天留一組兩人座整天不排客人（約好一起來、和她坐一桌：invites3d.js 的 pairSeats），玩家沒坐下時店裡至少留兩個空位、坐下以後至少一個；
       有名字的人（常客、桌遊團、照作息來的同學）後來才走進來、空位不夠時，離門口最近的那一桌客人吃完先走（S.shopTrim）；客人不坐有人坐的位子（玩家、劇情的人）。
       劇情的位子不排：阿鳳麵店中間那張桌（玩家和阿哲、桌遊團）、桌遊團常客的日子 17:30～19:00 麵店整段不排（他們自己的固定客人，story3d.js noodleRegulars）。
       有人跟著你（companion）、今天約好在這間店：客人少一半。
     - 一間店同時最多 S.SHOP_CAP（10）位完整人物（手機效能；室內 7 m 外自動換遠距離版本 PERF-CROWD-LOD）。路人底模（STORY.extraSpec，6000 起一段，不和體育館、小公園撞）、坐姿照現有的 sit／read。
     - 點了不會說話（沒有台詞：台詞歸 AA）。碗盤、茶杯還沒有放在桌上（每張桌子的高度不一樣，要美術給桌面高度：LAWWW2）。
     測試：node tests/shop_diners_unit.js */
  S.SHOP_CAP=10;
  const ramp=(pts,h)=>{ if(h<=pts[0][0]) return pts[0][1]; for(let i=1;i<pts.length;i++){ const a=pts[i-1], b=pts[i]; if(h<=b[0]) return a[1]+(b[1]-a[1])*(h-a[0])/Math.max(1e-6,b[0]-a[0]); } return pts[pts.length-1][1]; };
  /* 一天的客人比例（坐滿幾成；[時刻, 比例]，中間線性）、坐多久（小時）、一組兩個人一起來的機會（面對面／吧台相鄰）、一個人來的在做什麼 */
  S.SHOP_KIND={
    /* cap：這一種店同時最多幾位（沒寫＝S.SHOP_CAP）：書店、便利商店、影印店、茶飲站著的人不要擠成一團 */
    meal:{L:[[10,0.15],[11.25,0.2],[11.6,0.85],[13.4,0.85],[13.8,0.22],[14.5,0.14],[16.5,0.14],[17.25,0.25],[17.6,0.85],[19.4,0.85],[19.8,0.2],[21,0.12],[24,0.1]],dur:[0.45,0.85],face:0.6,side:0.3},
    brunch:{L:[[7.5,0.22],[9,0.35],[10.5,0.45],[11.6,0.6],[13.4,0.55],[14,0.22],[15,0.12]],dur:[0.6,1.2],face:0.7,side:0.3,alone:[['read',0.25]]},
    cafe:{L:[[9,0.18],[11,0.22],[11.6,0.45],[13.4,0.45],[14,0.4],[16.5,0.45],[17.5,0.2],[18,0.15]],dur:[0.8,1.8],face:0.35,side:0.15,alone:[['read',0.45],['laptop',0.3]]},
    tea:{L:[[12,0.2],[13.5,0.3],[14.5,0.4],[16.5,0.4],[17.5,0.25],[20,0.15]],dur:[0.7,1.4],face:0.6,side:0.4},
    drink:{L:[[10,0.2],[11.6,0.5],[13.4,0.5],[14,0.3],[17,0.45],[19,0.45],[20,0.2],[21,0.1]],dur:[0.15,0.35],face:0.3,side:0.3,standDur:[0.08,0.15],cap:3},
    book:{L:[[10,0.15],[12,0.25],[13,0.25],[14,0.2],[17,0.35],[20,0.35],[21.5,0.15]],dur:[0.12,0.35],cap:6},
    cvs:{L:[[0,0.15],[2,0.05],[6,0.05],[7.5,0.45],[9,0.3],[11.6,0.55],[13.4,0.5],[14,0.25],[17.5,0.5],[19.5,0.45],[22,0.3],[24,0.15]],dur:[0.1,0.25],payDur:[0.06,0.12],cap:6},
    print:{L:[[9,0.3],[12,0.55],[13,0.5],[17,0.45],[22,0.2]],dur:[0.15,0.4],cap:2},
    /* SHOP-CROWD-NEW-1105（使用者 11-05 06:5x 附日常失速週二 17:29 的截圖：「店裡都沒人??」）新加的店：
       bistro＝日常失速（吃飯、聊天、桌遊；13:00～01:00，晚上最多）；study＝木曜日（很多人念書；一個人的大多看書、用筆電）；study24＝大口漢堡二樓自習區（24 小時，晚上、半夜念書的人多）；
       bookseat＝山嵐書店的長椅、閱讀桌（坐著看書）；shop＝吉他行、球鞋、運動用品店（站著看的人）；cinema＝南洋戲院大廳（10:00／13:00／16:00／19:30 開演前等的人）*/
    bistro:{L:[[0,0.3],[1,0.2],[13,0.3],[15,0.35],[17,0.45],[18,0.7],[20.5,0.7],[22,0.55],[24,0.35]],dur:[0.8,1.8],face:0.6,side:0.35},
    /* snack＝洋洋鹹酥雞（宵夜，17:00～01:00；YANGYANG-IN-1107）：晚餐以後到半夜最多、坐得比吃飯的店短；店的種類照舊算 meal（seatact3d.js：吃飯的店），這一組照 snack 的時段（sk）*/
    snack:{L:[[0,0.4],[1,0.25],[17,0.25],[18,0.4],[19.5,0.5],[21,0.65],[23,0.6],[24,0.5]],dur:[0.35,0.75],face:0.6,side:0.35},
    study:{L:[[13,0.35],[15,0.5],[17,0.5],[18,0.4],[19.5,0.55],[21.5,0.45],[22,0.3]],dur:[1.0,2.5],face:0.35,side:0.15,alone:[['read',0.6],['laptop',0.3]]},
    study24:{L:[[0,0.35],[3,0.15],[6,0.06],[9,0.1],[12,0.2],[15,0.3],[19,0.45],[22,0.55],[24,0.45]],dur:[1.0,2.5],face:0.3,side:0.15,alone:[['read',0.6],['laptop',0.3]]},
    bookseat:{L:[[11,0.15],[13,0.3],[15,0.35],[17,0.4],[20,0.4],[22,0.2],[23,0.1]],dur:[0.3,0.9],face:0.25,side:0.3,alone:[['read',0.85]],cap:8},
    shop:{L:[[11,0.15],[13,0.25],[15,0.3],[17,0.4],[20,0.4],[21.5,0.2],[22,0.1]],dur:[0.15,0.4],face:0,side:0.4,cap:4},
    cinema:{L:[[9.5,0.12],[9.7,0.6],[10.05,0.6],[10.3,0.1],[12.5,0.12],[12.7,0.65],[13.05,0.65],[13.3,0.1],[15.5,0.12],[15.7,0.65],[16.05,0.65],[16.3,0.1],[19,0.15],[19.2,0.75],[19.55,0.75],[19.8,0.1],[24,0.06]],dur:[0.15,0.35],face:0,side:0.6,cap:8} };
  /* 這一天、這個時刻坐滿幾成（0～0.85）*/
  /* 公館燒臘的晚餐比學生餐廳拖得晚（GG-SHAOLA-FIX-1112；BB_379 11-12：20:30 進去 0 位客人）：客人的時段照舊 11:00～14:00、17:00～21:00（LAWWW：14:00 沒有人照設計），
     但共用的 meal 那一條 19:24 就開始掉、19:48 只剩兩成——20:30 四桌都沒人的日子超過一半（2026-10 連看 28 天有 17 天）。這一間自己的一條（def.L）：晚餐那一段坐到 20:40，之後到 21:00 收掉；白天和 meal 一樣 */
  S.NOODLE_L=[[10,0.15],[11.25,0.2],[11.6,0.85],[13.4,0.85],[13.8,0.22],[14.5,0.14],[16.5,0.14],[17.25,0.25],[17.6,0.85],[20.65,0.85],[20.95,0.25],[21,0.12],[24,0.1]];
  S.shopLoad=function(def,G,h,kind){ const k=kind||def.kind, K=S.SHOP_KIND[k]; if(!K) return 0; let L=ramp(!kind&&def.L?def.L:K.L,h);   /* def.L：這一間自己的時段比例（公館燒臘）*/ const C=typeof CALENDAR!=='undefined'?CALENDAR:null; if(!C) return Math.min(0.85,L);
    const kd=C.kind(G.day), wk=C.weekend(G.day)||kd==='holiday', T=C.termOf?C.termOf(G.day):null;
    if(kd!=='term') L*=k==='cvs'?0.8:0.6;   /* 寒暑假：學區的店（台大附近）少四成；便利商店少兩成 */
    if(wk) L*=k==='meal'?0.85:(k==='brunch'||k==='cafe'||k==='tea'||k==='book'||k==='bookseat'||k==='shop'||k==='cinema'?1.35:(k==='bistro'?1.2:1));   /* 週末、國定假日：吃飯的店學生少一點，早午餐、咖啡、茶屋、書店多一點 */
    if(T&&T.exam&&(k==='print'||k==='cafe'||k==='study'||k==='study24')) L*=1.7;   /* 考試週：影印、咖啡店念書的人多；木曜日、大口漢堡二樓（AA_621：考試那兩週是大家念書的地方）也是 */
    return Math.max(0,Math.min(0.85,L)); };
  /* 營業時段（[[開, 關], …]；不開＝[]）：places.js 有營業時間的照 places.js（溫州街的店）、118 巷照它的資料（L118.isOpen：公休、老闆開刀那兩週）；
     阿鳳麵店、書店沒有寫營業時間（門整天開著）：客人只在 11:00～14:00、17:00～21:00（麵店）、11:00～21:00（書店）；便利商店 24 小時 */
  const typhoon=(zone,G)=>typeof CALENDAR!=='undefined'&&!!CALENDAR.typhoon&&!!CALENDAR.typhoon(G.day)&&zone!=='cvs'&&zone!=='xs_dakou';   /* 24 小時的店（便利商店、大口漢堡）颱風天照開 */
  S.shopWindows=function(def,G){ if(typhoon(def.zone,G)) return []; const z=def.zone;
    if(/^l118_/.test(z)){ const id=z.slice(5), s=typeof L118!=='undefined'&&L118.shop?L118.shop(id):null; if(!s||!s.hours) return []; return s.hours.open.filter(([a,b])=>L118.isOpen(id,Object.assign({},G,{hour:(a+b)/2}))).map(w=>w.slice()); }
    if((z==='noodle'||z==='bookstore')&&typeof PLACES!=='undefined'&&PLACES.hours&&PLACES.hours[z]&&PLACES.windowsOf&&!PLACES.windowsOf(z,G.day)) return [];   /* 公休日沒有客人（AA_831：公館燒臘週一）*/
    if(z==='noodle') return typeof NOODLE_CLOSED!=='undefined'&&NOODLE_CLOSED.closed&&NOODLE_CLOSED.closed(G)?[]:[[11,14],[17,21]];
    if(z==='bookstore') return [[11,21]]; if(z==='cvs'||z==='xs_dakou') return [[0,24]]; if(z==='aoki') return [[11,21]];   /* 青木茶室（GG-SHOPS-REDO-1104）：稿上沒有營業時間，門整天開著；客人只排 11:00～21:00 */
    if(typeof PLACES!=='undefined'&&PLACES.windowsOf){ if(PLACES.typhoonClosed&&PLACES.typhoonClosed(z,G.day)) return []; const ws=PLACES.windowsOf(z,G.day); if(ws) return ws.map(w=>[w[0],Math.min(24,w[1])]);
      const o=PLACES.hours&&PLACES.hours[z]; if(o&&!o.rules&&typeof o.open==='number'&&typeof o.close==='number'){ const out=[]; if(o.close>24) out.push([0,o.close-24]); out.push([o.open,Math.min(24,o.close)]); return out; }   /* 每天一樣的 open／close（日常失速 13:00～01:00：跨午夜那一段算在隔天的 0:00～1:00）*/
      if(!o) return def.kind==='meal'?[[11,14],[17,21]]:[[11,21]];
      if(!o.rules&&typeof o.open!=='number') return [[0,24]];   /* 只寫了「24 小時」的店（洗樂洗衣坊）*/   /* places.js 沒有寫營業時間的店（門整天開著；SHOP-LIFE-AUDIT-1112：客居雲南）：照麵店、書店的做法，客人只排吃飯的時段／白天到晚上 */
      return []; }
    return []; };
  /* 有人跟著你、今天約好在這間店（邀約的地點）：客人少一半（劇情、約會的那一桌旁邊不要太擠）*/
  const INV_PLACE={tz_taimi:'tz_taimi',noodle:'noodle',wz_brunch:'brunch',wz_teahouse:'teahouse',wz_mokuyobi:'mokuyobi',wz_offbeat:'offbeat'};
  S.shopCalm=function(G,zone){ const F=G.flags||{}; if(F.companion) return true; const p=INV_PLACE[zone]; return !!p&&(G.invites||[]).some(iv=>iv&&iv.day===G.day&&iv.accepted&&!iv.done&&(iv.place===p||(zone==='wz_mokuyobi'&&iv.place==='slowread'))); };   /* 木曜日有兩個邀約地點：mokuyobi（坐坐）、slowread（念書；AA_772 從慢讀咖啡搬來）*/
  /* 位子分組：面對面的兩張（同一張桌子）、吧台相鄰的兩張；剩下的一個人一組。seats＝[{x,z,yaw,table,bar}] */
  S.pairUnits=function(seats){ const used=new Set(), out=[]; const dyaw=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
    seats.forEach((s,i)=>{ if(used.has(i)) return; let best=-1, bs=1e9, kind='one';
      seats.forEach((q,j)=>{ if(j===i||used.has(j)) return; if(s.table!=null&&q.table!=null&&s.table!==q.table) return; if((s.lv|0)!==(q.lv|0)) return; const d=Math.hypot(q.x-s.x,q.z-s.z), dy=dyaw(s.yaw,q.yaw); let sc=null, k=null;
        if(dy>2.6&&d<1.8&&((q.x-s.x)*Math.sin(s.yaw)+(q.z-s.z)*Math.cos(s.yaw))>0.5){ sc=d; k='face'; }   /* 對面那一張（在他前面）*/
        else if(dy<0.3&&d<1.0){ sc=d+2; k='side'; }   /* 旁邊那一張（同一個方向：吧台、長桌）*/
        if(sc!=null&&sc<bs){ bs=sc; best=j; kind=k; } });
      used.add(i); if(best>=0){ used.add(best); out.push({seats:[s,seats[best]],kind}); } else out.push({seats:[s],kind:'one'}); });
    return out; };
  /* 站著的地方：架子、櫃台前面（[x, z, 面向]）*/
  const standUnits=(pts,kind,o)=>pts.map(p=>Object.assign({stand:[+p[0].toFixed(2),+p[1].toFixed(2),+(+p[2]).toFixed(4)],kind:kind||'stand'},p[3]?{lv:p[3]|0}:{},o||{}));   /* p[3]＝哪一層（兩層的店）；o：sk（這一組用另一種店的時段，見 shopPlan）*/
  /* 架子前面每 1.6 m 站一個人（shelfWall／goodsWall：x, z, 轉向, 長度, 站哪一邊 [1／−1]；離架子中線 0.75 m，面向架子；和 zones3d.js 擺架子的同一組數字）*/
  const shelfPts=list=>{ const out=[]; for(const [x,z,r,len,sides] of list){ const nx=Math.sin(r), nz=Math.cos(r), ax=Math.cos(r), az=-Math.sin(r), n=Math.max(1,Math.floor(len/1.6));
      for(const s of sides) for(let i=0;i<n;i++){ const a=(i+0.5)*len/n-len/2, px=x+nx*s*0.75+ax*a, pz=z+nz*s*0.75+az*a; out.push([px,pz,Math.atan2(-nx*s,-nz*s)]); } } return out; };
  S.shopDefs=function(){ const out=[]; const WZ=typeof WZ_SHOPS_LAYOUT!=='undefined'?WZ_SHOPS_LAYOUT:null, LS=typeof L118_SHOP_LAYOUTS!=='undefined'?L118_SHOP_LAYOUTS:null;
    const seatsOf=(arr,lv)=>(arr||[]).map(s=>Object.assign({x:+s.x,z:+s.z,yaw:+s.yaw||0,table:Array.isArray(s.table)?s.table.join(','):s.table,bar:!!s.lift},(s.lv!=null||lv!=null)?{lv:(s.lv!=null?s.lv:lv)|0}:{}));   /* 118 巷的 table 是桌子中心 [x, z]；lv：兩層的店（木曜日在二樓、山嵐、大口漢堡）*/
    const lvUnits=(units,o)=>units.map(u=>Object.assign(u,u.seats&&u.seats[0].lv?{lv:u.seats[0].lv}:{},o||{}));   /* 一組位子在哪一層（S.shopSpots 的 spot.lv）*/
    const add=(zone,kind,door,units,o)=>{ if(units.length) out.push(Object.assign({zone,kind,door,units,ix:out.length},o||{})); };
    /* 公館：阿鳳麵店（中間那張桌留給玩家、阿哲、桌遊團：只排東西兩張）、日日便利、舊路書房 */
    { const SL=typeof SHAOLA_LAYOUT!=='undefined'&&SHAOLA_LAYOUT.shop?SHAOLA_LAYOUT.shop:null;   /* 燒臘店 v7（SHAOLA-WIRE-1105）：五張桌子裡第 3 張留給玩家、阿哲、桌遊團（和舊麵店中間那張一樣），客人坐另外四張 */
      if(SL) add('noodle','meal',[0,3.4],S.pairUnits(seatsOf(SL.seats.filter(q=>q.table!==3))),{noKeep:true,L:S.NOODLE_L});
      else add('noodle','meal',[0,3.5],S.pairUnits([{x:-3,z:-0.3,yaw:0},{x:-3,z:1.3,yaw:Math.PI},{x:3,z:-0.3,yaw:0},{x:3,z:1.3,yaw:Math.PI}]),{noKeep:true}); }
    /* 公館三間新室內（GG-SHOPS-REDO-1104）：配置有載入＝照新的貨架、書牆（CVS_LAYOUT／YEJIAN_LAYOUT；站的點離家具 0.75 m、面向架子），青木茶室坐配置的座位；沒有＝舊的室內 */
    const CV=typeof CVS_LAYOUT!=='undefined'&&CVS_LAYOUT.shop?CVS_LAYOUT.shop:null, YJ=typeof YEJIAN_LAYOUT!=='undefined'?YEJIAN_LAYOUT:null, AK=typeof AOKI_LAYOUT!=='undefined'?AOKI_LAYOUT:null, P=Math.PI;
    /* 日和便利店：貨架中間的走道只有 0.8 m（一條走道站一個人）：一號貨架西邊兩個、一二號之間一個、二三號之間兩個、三號東邊一個（面向貨架）；西牆壁架北段一個；冷藏櫃前兩個（面向北）；排隊結帳：收銀機南邊、面向櫃台 */   /* 排隊結帳：原本 (1.45, 2.15)＝收銀機南邊、就站在「包裹暫取」「看熱食櫃」的按鈕上（AA_653 接了那兩個點）；往西退一步站 (0.85, 1.4)，還是面向櫃台 */   /* 配置 v4（模型 v2b，BB 61a107016）：貨架移到 x −3.7、−1.7、0.3，走道 1.05～1.2 m——站的點改在走道中間（西牆和一號之間 x −4.6、一二號之間 −2.7、三號和櫃台之間 1.3）*/
    if(CV) add('cvs','cvs',[CV.spawn.x,CV.spawn.z],standUnits([[-4.6,-2.7,P/2],[-4.6,-0.5,P/2],[-2.7,-1.6,P/2],[-0.8,-2.6,P/2],[-0.8,-0.4,P/2],[1.3,-2.8,-P/2],[-4.6,-3.6,-P/2],[2.3,-4.3,P],[4.1,-4.3,P]]).concat(standUnits([[0.85,1.4,P/2]],'pay')));
    else add('cvs','cvs',[0,3.5],standUnits(shelfPts([[-3.75,-4.2,0,4.5,[1]],[4.5,-4.2,0,3,[1]],[-2,0,Math.PI/2,5,[1,-1]],[2,0,Math.PI/2,5,[-1]]])).concat(standUnits([[4.6,-0.55,Math.PI]],'pay')));
    if(YJ) add('bookstore','book',[YJ.spawn.x,YJ.spawn.z],standUnits([[-2.3,-4.0,P],[2.3,-4.0,P],[-0.6,1.55,0],[3.0,1.55,0]]));   /* 北牆書牆前兩個（西段是買法律書的互動點、梯子東邊 (0.3,−3.95) 是法律系同學「找書的女生」的位子 src/data/pool_story.js）、窗前兩座斜面書架北邊（書架面向北）*/
    else add('bookstore','book',[0,4],standUnits(shelfPts([[0,-4.7,0,11,[1]],[-5.7,0,Math.PI/2,8,[1]],[5.7,0,Math.PI/2,8,[-1]],[-2,0,Math.PI/2,5,[1,-1]],[2,0,Math.PI/2,5,[1,-1]]])));
    /* afar café（咖啡）、Daybreak（早午餐）（GG-SHOPS2-1104）：配置的座位；營業時間照 places.js */
    for(const [zk,kind,L] of [['afar','cafe',typeof AFAR_LAYOUT!=='undefined'?AFAR_LAYOUT:null],['daybreak','brunch',typeof DAYBREAK_LAYOUT!=='undefined'?DAYBREAK_LAYOUT:null]]){ if(L) add(zk,kind,[L.exit.at.x,+(L.d/2-2).toFixed(2)],S.pairUnits(seatsOf(L.seats))); }
    /* 洋洋鹹酥雞（YANGYANG-IN-1107）：配置的座位（四人桌 4、兩人桌 3；四人桌四南側那兩張玩家坐不到、路人照坐）；營業時間照 places.js（17:00～01:00：跨午夜那一段 shopWindows 只排到 24:00）*/
    { const YY=typeof YANGYANG_LAYOUT!=='undefined'&&YANGYANG_LAYOUT.shop?YANGYANG_LAYOUT.shop:null; if(YY) add('yangyang','meal',[YY.exit.at.x,+(YY.d/2-1.4).toFixed(2)],S.pairUnits(seatsOf(YY.seats)).map(u=>Object.assign(u,{sk:'snack'}))); }
    /* 轉角唱片（CORNER-IN-1107）：站在唱片箱、唱片牆前面翻（shop：站著看的人；避開翻唱片、試聽的按鈕）；休息區兩張沙發坐著（bookseat 的時段）。試聽的高腳椅留給玩家（試聽、約來的兩個人）*/
    { const CRL=typeof CORNER_LAYOUT!=='undefined'&&CORNER_LAYOUT.corner?CORNER_LAYOUT.corner:null;
      if(CRL) add('corner_records','shop',[CRL.front.door.x,+(CRL.d/2-1.5).toFixed(2)],standUnits([[-0.3,3.0,P/2],[-0.35,0.3,-P/2],[-0.3,-1.45,-P/2],[-3.0,-0.6,-P/2],[2.9,-1.3,P/2]]).concat(S.pairUnits(seatsOf(CRL.seats.filter(q=>q.kind==='armchair'))).map(u=>Object.assign(u,{sk:'bookseat'}))),{noKeep:true}); }
    if(AK) add('aoki','tea',[AK.spawn.x,AK.spawn.z],S.pairUnits(seatsOf(AK.seats.map(q=>q.seatH>0.6?Object.assign({},q,{lift:+(q.seatH-((typeof CHAR!=='undefined'&&CHAR.SIT_TOP)||0.45)).toFixed(2)}):q))));   /* 吧台高腳椅（seatH 0.72）＝bar */
    /* 溫州街：半熟、一盞、林家乾麵、巷子裡定食（配置檔的座位；打工的、阿芃的位子不算）、阿德影印（櫃台前、文具架前、自助影印旁邊站著）*/
    if(WZ){ for(const [k,kind] of [['brunch','brunch'],['teahouse','tea'],['lin','meal'],['teishoku','meal']]){ const L=WZ[k]; if(!L||!L.spawn) continue;
        add('wz_'+k,kind,[L.spawn.x,L.spawn.z],S.pairUnits(seatsOf((L.seats||[]).filter(s=>!s.npcOnly&&!/打工/.test(s.label||'')))));   /* 走不進去的位子在配置寫 npcOnly（小路 v4 起；原本的 Z3.wzNoSit 拿掉）*/ }
      /* 阿德影印 v1c（ade_layout v3，CC 5977272dc；BB_257、CC_49 v1c）：站著的三點讀配置的 stands（原本寫死 (−1.55,1.95)、(1.15,3.25)、(0.25,1.95)，新配置前後兩點在自助影印機、長桌裡）；
         自助電腦那四張椅子客人可以坐（LAWWW 07:16 決定：等印東西時坐；原本影印店只有站著的客人）——同時最多 2 位照舊（SHOP_KIND.print.cap）。櫃台後面的辦公椅（打工）、阿芃的凳子（npcOnly）不算 */
      if(WZ.print&&WZ.print.spawn){ const LP=WZ.print, st=(LP.stands&&LP.stands.length?LP.stands:[[-1.55,1.95,Math.PI],[1.15,3.25,Math.PI/2],[0.25,1.95,Math.PI]]);
        add('wz_print','print',[LP.spawn.x,LP.spawn.z],S.pairUnits(seatsOf((LP.seats||[]).filter(s=>!s.npcOnly&&!/打工/.test(s.label||'')))).concat(standUnits(st))); } }
    /* 118 巷有室內的店（L118_SHOP_LAYOUTS，LAWWW2-C）。哪一種店照店家資料（src/data/lane118_shops.js 的 drink：外帶飲料店＝drink、其他＝吃飯 meal；L118-SHOPS-REDO-1111，使用者 2026-11-11 九間店換類型——
       原本寫死 tea＝飲料店、cafe2＝咖啡店；現在 tea 是辛亥韓食、cafe2 是大學食堂，都是吃飯的店，118 巷沒有咖啡店了）。飲料店：櫃台前多一個等飲料的；
       只有兩個位子以下的店（原本的茶飲店那一間：兩張高腳椅）不替玩家留一組空位（noKeep，照座位數算、不照店 id）。沒有載入店家資料（測試）＝都當吃飯的店 */
    if(LS) for(const id of Object.keys(LS)){ const L=LS[id]; if(!L||!L.spawn) continue; const SD=typeof LANE118_SHOPS!=='undefined'&&Array.isArray(LANE118_SHOPS.shops)?LANE118_SHOPS.shops.find(q=>q.id===id):null, kind=SD&&SD.drink?'drink':'meal';   /* 和 L118.kindOf 同一個判斷；這裡在載入時就算（lane118.js 比這個檔晚載入），直接讀資料檔 */
      let units=S.pairUnits(seatsOf(L.seats)); if(kind==='drink'&&L.order) units=units.concat(standUnits([[L.order.x+0.7,L.order.z+0.1,Math.PI]],'wait'));
      add('l118_'+id,kind,[L.spawn.x,L.spawn.z],units,{noKeep:(L.seats||[]).length<=2}); }
    /* ===== SHOP-CROWD-NEW-1105：後來才進得去的店（使用者 11-05 06:5x：日常失速「店裡都沒人??」）=====
       門口＝各區域真正的進門位置（zones3d／各店 *3d.js 的 IN）；兩層的店 doorLv 0、每一組有自己的 lv；劇情、玩家按鈕的位子不排（各段註解）。
       兩點半 Café 照舊是 story3d.js 的 S.cafeCustomers（不在這裡）；南洋戲院 1 廳不排（只有每排靠走道那一張能坐，看電影是玩家的事件）。*/
    const OB=typeof DAILY_OFFBEAT_LAYOUT!=='undefined'?DAILY_OFFBEAT_LAYOUT:null;
    /* 日常失速：八人長桌（table 1）不排——桌遊、期末聚餐把朋友排在長桌（offbeat_sys3d.js 的 S.stage、S.finalSeat）；店長（貓）的椅子不是座位 */
    if(OB&&OB.spawn) add('wz_offbeat','bistro',[OB.spawn.x,OB.spawn.z],S.pairUnits(seatsOf((OB.seats||[]).filter(s=>s.table!==1&&!s.npcOnly))));
    /* 木曜日（二樓；樓梯第五、六階進門 MOK3.IN）：24 席都可以讀書；老闆在吧檯後面（不是座位）*/
    const MK=typeof MOKUYOBI_LAYOUT!=='undefined'?MOKUYOBI_LAYOUT:null;
    if(MK&&MK.seats) add('wz_mokuyobi','study',[-3.75,5.4],lvUnits(S.pairUnits(seatsOf(MK.seats.map(q=>q.seatH>0.6?Object.assign({},q,{lift:1}):q),1))),{doorLv:0});
    /* 同弦樂器：試琴椅（「試彈」、子晴的 CG）、櫃台前的木凳不排；站在吉他牆、烏克麗麗牆、西牆書架前看（避開「看看」「買東西」的按鈕）*/
    const TX=typeof TONGXIAN_LAYOUT!=='undefined'&&TONGXIAN_LAYOUT.shop?TONGXIAN_LAYOUT.shop:null;
    if(TX){ const IN=TX.enterAt||TX.spawn; add('xs_tongxian','shop',[IN.x,IN.z],standUnits([[2.3,-4.0,P/2],[2.3,-1.7,P/2],[-2.35,-1.9,-P/2],[-2.45,-0.05,-P/2]]),{noKeep:true}); }
    /* 南洋戲院大廳：右牆四張長椅坐著等開演；爆米花櫃檯前排隊兩個、看海報、看今日放映（站著）*/
    const NY=typeof NANYANG_LAYOUT!=='undefined'&&NANYANG_LAYOUT.lobby?NANYANG_LAYOUT.lobby:null;
    if(NY){ const IN=NY.enterAt||NY.spawn; add('xs_nanyang','cinema',[IN.x,IN.z],S.pairUnits(seatsOf(NY.seats)).concat(standUnits([[-2.6,-1.75,-P/2],[-2.6,-1.05,-P/2],[2.95,-0.45,P/2],[-0.7,-5.5,P]])),{noKeep:true}); }
    /* 山嵐書店（兩層）：一樓靠窗長椅、二樓長椅和兩張閱讀桌坐著看書（bookseat）；站在雜誌牆、島架、新書平台、二樓書架中間（book）。
       坐地板看書的十個位置（floorSit）是玩家的按鈕，不排、站的點離它們 0.8 m 以上 */
    const SL=typeof SHANLAN_LAYOUT!=='undefined'?SHANLAN_LAYOUT:null;
    if(SL&&SL.seats){ const IN=SL.enterAt||SL.spawn;
      add('xs_shanlan','book',[IN.x,IN.z],lvUnits(S.pairUnits(seatsOf(SL.seats))).map(u=>Object.assign(u,{sk:'bookseat'})).concat(
        standUnits([[6.0,-0.8,P/2],[-3.5,-4.6,0],[-0.8,-5.4,P],[2.2,4.9,0]]),
        standUnits([[-3.6,-4.0,-P/2,1],[-0.8,-6.0,-P/2,1],[2.8,-5.5,P/2,1],[4.8,-6.5,-P/2,1]])),{doorLv:0}); }
    /* 大口漢堡（24 小時，兩層）：一樓吃東西（meal 的時段）、點餐櫃檯前排隊（pay，便利商店的時段）；二樓學生自習區（study24：考試週多）。
       整間店算 cafe（seatact3d.js：坐著的人可以用筆電、念書；每一組照 sk 的時段）*/
    const DK=typeof DAKOU_LAYOUT!=='undefined'&&DAKOU_LAYOUT.shop?DAKOU_LAYOUT.shop:null;
    if(DK&&DK.floor1){ const hi=q=>q.high?Object.assign({},q,{lift:1}):q;
      add('xs_dakou','cafe',[0,6.4],S.pairUnits(seatsOf(DK.floor1.seats.map(hi),0)).map(u=>Object.assign(u,{sk:'meal'})).concat(standUnits([[-2.6,-2.3,P],[-0.4,-2.3,P]],'pay',{sk:'cvs'}),
        lvUnits(S.pairUnits(seatsOf((DK.floor2&&DK.floor2.seats)||[],1))).map(u=>Object.assign(u,{sk:'study24'}))),{doorLv:0}); }
    /* 大步球鞋：試穿長凳 B（長凳 A 是「試穿」的按鈕、店員蹲著按鞋頭）坐著試穿；兩面鞋牆、新品展示桌前站著（避開阿哲、店員的站位）*/
    const DB=typeof DABU_LAYOUT!=='undefined'?DABU_LAYOUT:null;
    if(DB&&DB.seats){ add('xs_dabu','shop',[DB.front.door.x,+(DB.d/2-1.6).toFixed(2)],S.pairUnits(seatsOf(DB.seats.filter(q=>q.bench===2).map(q=>Object.assign({},q,{table:'b2'})))).concat(standUnits([[-2.6,2.3,-P/2],[2.6,-2.8,P/2],[2.6,-0.5,P/2],[-0.6,1.85,0]])),{noKeep:true}); }
    /* 好拍運動：等穿線的兩張凳子是劇情（柏翰）、玩家的「坐著等穿線」，不排；站在球拍牆前、後段鐵架前 */
    const HP=typeof HAOPAI_LAYOUT!=='undefined'&&HAOPAI_LAYOUT.haopai?HAOPAI_LAYOUT.haopai:null;
    if(HP) add('xs_haopai','shop',[HP.front.door.x,+(HP.d/2-1.6).toFixed(2)],standUnits([[1.4,5.6,P/2],[0.5,-3.0,P/2],[-0.05,-5.2,-P/2]]),{noKeep:true});
    /* 新生運動廣場（兩層）：一樓試穿椅只有一張、二樓圓凳是店員的，不排；一樓球架、衣架、水壺架、東邊鞋牆、夾層下貨架，二樓系隊球衣牆、衣架前站著 */
    const XP=typeof XINSHENG_SPORTS_LAYOUT!=='undefined'?XINSHENG_SPORTS_LAYOUT:null;
    if(XP) add('xs_xsports','shop',[XP.front.door.x,+(XP.d/2-1.6).toFixed(2)],standUnits([[-3.15,6.6,-P/2],[-1.9,3.2,P/2],[1.75,2.6,-P/2],[5.85,3.0,P/2],[-0.1,-3.5,-P/2],[-2.6,-2.9,P,1],[-6.0,-1.0,-P/2,1]]),{noKeep:true,doorLv:0});
    /* ===== SHOP-LIFE-AUDIT-1112（使用者 11-12：「你要每一家店都看他有沒有店員、有沒有安排客人在裡面」；盤點表 docs/handoff/SHOP_LIFE_AUDIT_1112.md）=====
       盤點出來一個路人客人都沒有的店（都排在最後面：前面每一間的 ix 不變＝原本那些店的客人長相不變）：
       汀州路吃飯的店（配置 TZ_SHOPS_LAYOUT 有 tables 的：泰米村食、越好吃小館、客居雲南……之後新加的同一類自動算進來）＝配置的座位、吃飯的店的時段（meal）；
       印得好（自助電腦兩張椅子＋影印機前、櫃台前）、洗樂洗衣坊（三張「坐著等」的塑膠椅＋洗衣機、烘衣機前）＝影印店的時段、同時最多 2 位（print 的 cap：洗樂三張椅子一定留一張給玩家）；
       安泰藥局、汀州鮮果、榮恩典文具社、東南大聯商行、汀州聯通、花序（一樓）、慢輪單車＝站在貨架、展示前面看（shop：同時最多 4 位）。
       站的點是在 Node 建出真正的區域量的（站得住、走得到、前面 0.75 m 是家具或牆、離每一個按鈕 0.95 m 以上、離出口 1.6 m 以上；tests/shop_life_audit_1112_unit.js 每一點都再驗一次）。
       禮貌生財不排（上師的命理館，不是一般的店）。人數上限照舊（S.SHOP_CAP 10、各種店的 cap），沒有新增任何一句話。*/
    { const TZL=typeof TZ_SHOPS_LAYOUT!=='undefined'?TZ_SHOPS_LAYOUT:null;
      const tzSeats=L=>seatsOf((L.seats||[]).map(q=>Object.assign({},q,{table:L.id+'_t'+q.table})));   /* 區域的座位（tz_shops3d.js）table＝'<店>_t<桌號>' */
      const STAND={ yindehao:[[-2.0,-0.5,-P/2],[0.5,-0.75,P/2]], xile:[[-1.75,0.5,-P/2],[1.5,-1.5,P/2]],
        antai:[[-1.0,-1.0,-P/2],[0.75,0.0,P/2],[3.25,-1.5,-P/2],[-3.5,1.5,-P/2]], xianguo:[[-2.25,3.0,-P/2],[0.25,-0.25,P],[1.75,-0.5,P]], rongendian:[[-3.5,-1.75,-P/2],[-1.0,-1.5,-P/2],[2.0,0.0,0],[3.25,1.0,P/2]],
        dongnan:[[-3.0,-0.75,-P/2],[-0.5,-2.25,-P/2],[0.75,-3.75,P],[1.75,-1.5,-P/2]], liantong:[[-1.5,1.25,-P/2],[-1.5,-1.0,P]] };   /* 東南大聯商行、汀州聯通（開發分支 11-12 才進來的兩間）；汀州聯通櫃台前的兩張圓凳留給玩家，只排站著看的 */
      const KIND={yindehao:'print',xile:'print',antai:'shop',xianguo:'shop',rongendian:'shop',dongnan:'shop',liantong:'shop'};
      if(TZL) for(const id of Object.keys(TZL)){ const L=TZL[id]; if(!L||!L.zone||!L.spawn||out.some(d=>d.zone===L.zone)) continue;
        if(Array.isArray(L.tables)&&L.tables.length&&L.counter&&(L.seats||[]).length>=8) add(L.zone,'meal',[L.spawn.x,L.spawn.z],S.pairUnits(tzSeats(L)));   /* 吃飯的店：有桌子、有櫃台、八個位子以上 */
        else if(KIND[id]) add(L.zone,KIND[id],[L.spawn.x,L.spawn.z],(KIND[id]==='print'?S.pairUnits(tzSeats(L)):[]).concat(standUnits(STAND[id]||[])),{noKeep:true}); }
      const FN=typeof FLOWER_NOTES_LAYOUT!=='undefined'?FLOWER_NOTES_LAYOUT:null;
      if(FN&&FN.spawn) add('flower_notes','shop',[FN.spawn.x,FN.spawn.z],standUnits([[-4.0,2.5,-P/2],[-2.5,2.75,P/2],[0.75,4.75,P]]),{noKeep:true,doorLv:0});
      const BK=typeof BIKE_LAYOUT!=='undefined'&&BIKE_LAYOUT.bike?BIKE_LAYOUT.bike:null;
      if(BK&&BK.spawn) add('bikeshop','shop',[BK.spawn.x,BK.spawn.z],standUnits([[-3.25,-0.5,P],[1.75,0.25,P/2],[0.5,-1.25,-P/2]]),{noKeep:true}); }
    return out; };
  S.SHOPS=S.shopDefs(); S.SHOP_ZONES={}; for(const d of S.SHOPS) S.SHOP_ZONES[d.zone]=d;
  /* 這一天這間店每一組位子的客人（一天算一次，照日期＋店＋組當種子）：一組空著的時候，照那個時刻的比例 L 決定接下來 D 小時有沒有人（有＝來坐 D 小時），
     長期下來坐滿的比例≈L。一組兩個位子：兩個人一起來的機會照 face／side。留給玩家的那一組（keep）整天不排；同時在店裡的人超過 S.SHOP_CAP 的那一組不排。 */
  const planCache=new Map();
  S.shopPlan=function(def,G){ const calm=S.shopCalm(G,def.zone), key=def.zone+'|'+G.day+'|'+(calm?1:0)+'|'+(G.stage||''); const c=planCache.get(def.zone); if(c&&c.key===key) return c.plan;
    const K0=S.SHOP_KIND[def.kind], wins=S.shopWindows(def,G), U=def.units, r0=prng(hash('shopkeep|'+def.zone+'|'+G.day));
    const pairs=U.map((u,i)=>i).filter(i=>U[i].kind==='face'); const keep=def.noKeep||!pairs.length?-1:pairs[Math.floor(r0()*pairs.length)];   /* 留給玩家（和她）的兩人座 */
    const ndl=def.zone==='noodle'&&typeof STORY!=='undefined'&&STORY.noodleDay&&STORY.noodleDay(G.day);   /* 桌遊團常客的日子：17:30～19:00 那一段是他們（noodleRegulars）*/
    const cand=[];
    U.forEach((u,ui)=>{ if(ui===keep) return; const r=prng(hash('shopu|'+def.zone+'|'+ui+'|'+G.day)); let vix=0; const stand=!!u.stand;
      const K=u.sk&&S.SHOP_KIND[u.sk]?S.SHOP_KIND[u.sk]:K0;   /* sk：這一組照另一種店的時段、坐多久（大口漢堡二樓自習區、山嵐的座位）*/
      const dur=u.kind==='pay'&&K.payDur?K.payDur:(stand&&K.standDur?K.standDur:K.dur);
      for(const [a,b] of wins){ let t=a+r()*0.25;
        while(t<b-0.2){ const D=dur[0]+r()*(dur[1]-dur[0]); let L=S.shopLoad(def,G,t+D/2,u.sk); if(calm) L*=0.5; if(u.kind==='pay') L*=0.7;
          if(r()<L){ const t1=Math.min(b-0.05,t+D); if(t1-t>=0.1&&!(ndl&&t<19&&t1>17.5)){ const n=stand?1:(u.seats.length>1&&r()<(u.kind==='face'?K.face:K.side)?2:1);
              const who=[]; for(let k=0;k<n;k++){ let pose='sit', prop=null; if(stand) pose='idle'; else if(n===1&&K.alone){ let q=r(); for(const [ps,pr] of K.alone){ if(q<pr){ pose=ps; break; } q-=pr; } }
                if(pose==='laptop'){ pose='sit'; prop='laptop_lap'; } who.push({sex:r()<0.5?'f':'m',pose,prop}); }
              cand.push({ui,vix:vix++,t0:+t.toFixed(4),t1:+t1.toFixed(4),n,who,cap:K.cap}); }
            t+=D+0.05+r()*0.15; }
          else t+=D*(0.5+r()); } } });
    cand.sort((p,q)=>p.t0-q.t0||p.ui-q.ui); const acc=[], units=U.map(()=>[]);
    for(const v of cand){ let busy=0; for(const a of acc) if(a.t0<=v.t0&&a.t1>v.t0) busy+=a.n; if(busy+v.n>Math.min(S.SHOP_CAP,v.cap||S.SHOP_CAP)) continue; acc.push(v);
      units[v.ui].push({key:'v'+v.vix+'@'+v.t0.toFixed(2),t0:v.t0,t1:v.t1,n:[v.n,v.n],fixed:true,pose:'idle',talk:0,enter:'door',leave:'door',who:v.who,vix:v.vix}); }
    const plan={keep,units,wins}; planCache.set(def.zone,{key,plan}); return plan; };
  /* 這一組位子這個時段的客人（spot.people）：座位用區域真正的座位（E.zone.seats：坐墊、高腳椅的高度、走近點都在那裡）；站著的離出口、點餐這些按鈕太近就不站 */
  S.shopPeople=function(def,ui,spot,G,slot,E){ const u=def.units[ui], out=[], seats=(E&&E.zone&&E.zone.seats)||[];
    const zs=q=>{ let b=null, bd=0.12; for(const s of seats){ const d=Math.hypot(s.x-q.x,s.z-q.z); if(d<bd&&(s.lv|0)===(q.lv|0)&&!s.npcOnly){ bd=d; b=s; } } return b; };   /* 同一層（兩層的店）；店員的位子（npcOnly）不坐 */
    (slot.who||[]).forEach((w,k)=>{ const spec=6000+def.ix*400+ui*16+((slot.vix*2+k)%8)*2+(w.sex==='m'?1:0), base={key:spot.id+'|'+slot.key+'|'+k,spec,pose:'idle',role:u.stand?'shop_'+u.kind:'diner'};
      if(u.stand){ const [x,z,yaw]=u.stand; if(E&&E.interactables&&E.interactables.some(i=>!i.seat&&!i.hidden&&Math.hypot(i.x-x,i.z-z)<(i.exit?1.0:0.45))) return; if(S.shopStandReserved(def.zone,x,z,G)) return;   /* 店內偶遇的朋友站在這裡（SHOPENC，shopStandTake）*/ out.push(Object.assign(base,{x,z,yaw})); return; }
      const q=u.seats[k], st=q&&zs(q); if(!st) return;
      out.push(Object.assign(base,{x:st.x,z:st.z,yaw:st.yaw||0,seat:st,sitPose:w.pose!=='sit'?w.pose:null,prop:w.prop,props:w.prop?[w.prop]:null})); });
    return out; };
  S.shopSpots=function(){ const out=[]; for(const def of S.SHOPS) def.units.forEach((u,ui)=>{ const c=u.stand?[u.stand[0],u.stand[1]]:[(u.seats[0].x+u.seats[u.seats.length-1].x)/2,(u.seats[0].z+u.seats[u.seats.length-1].z)/2];
      out.push({ id:'shop_'+def.zone+'_'+ui, zone:def.zone, lv:u.lv|0, doorLv:def.doorLv!=null?def.doorLv:(u.lv|0), label:((typeof PLACES!=='undefined'&&PLACES.names[def.zone])||def.zone)+'的客人', shop:def.zone, unit:ui, c, spread:[1,1], door:def.door, road:def.door, pairTalk:u.kind==='face'||u.kind==='side',
        slots(G){ return S.shopPlan(def,G).units[ui]; },
        people(G,slot,r,E){ return S.shopPeople(def,ui,this,G,slot,E); } }); }); return out; };
  S.SPOTS.push(...S.shopSpots());
  /* 有人坐（或正走過去要坐）的位子：玩家、劇情的人、其他客人、替身（taken）*/
  /* 預約位子（給之後的「朋友偶遇」AA_632 這種有名字的人用）：CROWD.shopSeatTake(zone, seat[, {day, until}]) 把這間店的一個位子留下來，路人不坐、不走過去；
     seat＝區域的座位（E.zone.seats 的一個、或 {x,z}、或 E.zone.seats 的編號）；預約只算當天（day，預設今天），until＝幾點以後自動失效（小時，可以不寫）。
     現在人就在這間店、那個位子已經有客人：那一桌客人起身走出去（instant：直接拿掉，進門前用）；玩家、有名字的人坐著＝不能預約（回傳 false）。
     CROWD.shopSeatFree(zone, seat)：取消；不寫 seat＝這間店的全部取消。CROWD.shopSeatPick(GM)：這間店現在一個可以給有名字的人坐的空位（不是留給玩家那一組）。*/
  S.shopRes={};
  const resKey=(zone,seat)=>{ let s=seat; if(typeof s==='number'){ const E=typeof E3!=='undefined'?E3:null; s=E&&E.zone&&E.zone.seats&&G0()&&G0().zone===zone?E.zone.seats[s]:null; } return s&&typeof s.x==='number'?(+s.x).toFixed(2)+','+(+s.z).toFixed(2)+','+(s.lv|0):null; };
  const G0=()=>typeof GAME!=='undefined'&&GAME.G?GAME.G:null;
  S.shopReserved=function(zone,st,G){ const R=S.shopRes[zone]; if(!R||!st) return false; const k=resKey(zone,st); const r=k&&R[k]; if(!r) return false; G=G||G0();
    if(G&&r.day!=null&&r.day!==G.day){ delete R[k]; return false; } if(G&&r.until!=null&&G.hour>=r.until){ delete R[k]; return false; } return true; };
  S.shopSeatTake=function(zone,seat,o){ o=o||{}; const G=o.G||G0(), k=resKey(zone,seat); if(!zone||!k) return false; const E=o.E||(typeof E3!=='undefined'?E3:null);
    const here=!!E&&!!G&&G.zone===zone&&!!E.zone&&Array.isArray(E.zone.seats), st=here?E.zone.seats.find(q=>resKey(zone,q)===k)||null:null;
    if(st){ const near=q=>!!q&&(q.lv|0)===(st.lv|0)&&Math.hypot(q.x-st.x,q.z-st.z)<0.4; if(E.player&&near(E.player.seat)) return false;
      if((E.npcs||[]).some(m=>m&&!(typeof m.crowd==='string'&&/^shop_/.test(m.crowd))&&m!==o.who&&(near(m.seat)||near(m.seatTarget)))) return false;   /* 有名字的人（或別的路人系統的人）坐著 */
      const GM=o.GM||(typeof GAME!=='undefined'?GAME:null);
      for(const id of Object.keys(live)){ if(id.indexOf('shop_'+zone+'_')!==0) continue; const L=live[id]; if(!L.npcs.some(n=>n&&(near(n.seat)||near(n.seatTarget)))) continue;   /* 坐在那裡的那一桌：一起走 */
        const sp=S.SPOTS.find(q=>q.id===id); for(const n of L.npcs){ if(!E.npcs.includes(n)) continue; if(o.instant||!GM||!GM.E){ E.removeNPC(n); continue; } n.lookAt=null; if(n.seat) standNPC(E,n); n.seatTarget=null; walkAwayCrowd(GM,sp,n,'door'); } L.npcs=[]; L.yielded=true; } }
    const R=S.shopRes[zone]||(S.shopRes[zone]={}); R[k]={day:o.day!=null?o.day:(G?G.day:null),until:o.until!=null?o.until:null,who:o.who&&o.who.id||o.whoId||null}; return st||true; };
  /* 站的地方（店內偶遇的朋友站在書架、貨架、櫃台前面；SHOPENC）：CROWD.shopStandTake(zone,[x,z],{day,until}) 那一點 0.45 m 內路人不站；隔天、until 以後自動失效 */
  S.shopStandRes={};
  S.shopStandTake=function(zone,p,o){ o=o||{}; if(!zone||!p) return false; const G=o.G||G0(); const R=S.shopStandRes[zone]||(S.shopStandRes[zone]={}); R[(+p[0]).toFixed(2)+','+(+p[1]).toFixed(2)]={x:+p[0],z:+p[1],day:o.day!=null?o.day:(G?G.day:null),until:o.until!=null?o.until:null,who:o.whoId||null}; return true; };
  S.shopStandReserved=function(zone,x,z,G){ const R=S.shopStandRes[zone]; if(!R) return false; G=G||G0(); for(const k of Object.keys(R)){ const r=R[k]; if(G&&((r.day!=null&&r.day!==G.day)||(r.until!=null&&G.hour>=r.until))){ delete R[k]; continue; } if(Math.hypot(r.x-x,r.z-z)<0.45) return true; } return false; };
  S.shopSeatFree=function(zone,seat){ const R=S.shopRes[zone]; if(!R) return false; if(seat==null){ delete S.shopRes[zone]; return true; } const k=resKey(zone,seat); if(!k||!R[k]) return false; delete R[k]; return true; };
  /* 留給約好一起來的人的那一組兩人座（keep）：照作息進店的有名字的人（story3d populateSchedule）也先不坐（BB 11-03：沛珊、阿哲 12:30 坐掉一個）*/
  S.shopKeepSeats=function(G){ const def=G&&S.SHOP_ZONES[G.zone]; if(!def) return []; const pl=S.shopPlan(def,G), u=pl.keep>=0?def.units[pl.keep]:null; return (u&&u.seats)||[]; };
  S.shopSeatPick=function(GM){ const E=GM&&GM.E, G=GM&&GM.G, def=G&&S.SHOP_ZONES[G.zone]; if(!E||!E.zone||!Array.isArray(E.zone.seats)) return null; let keep=[];
    if(def){ const pl=S.shopPlan(def,G), u=pl.keep>=0?def.units[pl.keep]:null; if(u&&u.seats) keep=u.seats; }
    const free=E.zone.seats.filter(st=>!st.label&&!S.seatBusy(E,st)), notKeep=free.filter(st=>!keep.some(q=>Math.hypot(q.x-st.x,q.z-st.z)<0.12));
    return notKeep[0]||free[0]||null; };
  /* 有名字的人要進門就坐好（118 巷約好的午餐、常客；L118.populateShop）：空位不夠 need 個，靠門口那一桌客人直接拿掉（進門前、玩家沒看到）*/
  S.shopMakeRoom=function(GM,need){ const E=GM&&GM.E, G=GM&&GM.G; if(!E||!G||!S.SHOP_ZONES[G.zone]||!entering||G.zone!==zoneNow) return 0;   /* 只在進門那一刻（S.enter 以後、第一次 tick 以前）：待在店裡時不在眼前把人拿掉 */ const def=S.SHOP_ZONES[G.zone]; let k=0;
    const dd=id=>{ const sp=S.SPOTS.find(q=>q.id===id); return sp?Math.hypot(sp.c[0]-def.door[0],sp.c[1]-def.door[1]):0; };
    while(S.shopFree(E)<need){ const ids=Object.keys(live).filter(id=>id.indexOf('shop_'+G.zone+'_')===0&&live[id].npcs.some(n=>(n.seat||n.seatTarget)&&E.npcs.includes(n))).sort((a,b)=>dd(a)-dd(b)); if(!ids.length) break;
      const L=live[ids[0]]; for(const n of L.npcs) if(E.npcs.includes(n)) E.removeNPC(n); L.npcs=[]; L.yielded=true; k++; }
    return k; };
  /* 指定的位子上的路人客人讓位（整組離開；118 巷午餐邀約要和同行的人坐同一桌，l118_lunch3d.js S.seatParty）。和 shopMakeRoom 一樣只在進門那一刻；回傳離開的組數 */
  S.shopYield=function(GM,seats){ const E=GM&&GM.E, G=GM&&GM.G; if(!E||!G||!S.SHOP_ZONES[G.zone]||!entering||G.zone!==zoneNow||!Array.isArray(seats)||!seats.length) return 0; let k=0;
    const on=n=>[n.seat,n.seatTarget].some(q=>q&&seats.some(st=>q===st||Math.hypot(q.x-st.x,q.z-st.z)<0.35));
    for(const id of Object.keys(live)){ if(id.indexOf('shop_'+G.zone+'_')!==0) continue; const L=live[id]; if(!L.npcs.some(n=>E.npcs.includes(n)&&on(n))) continue; for(const n of L.npcs) if(E.npcs.includes(n)) E.removeNPC(n); L.npcs=[]; L.yielded=true; k++; }
    return k; };
  S.seatBusy=function(E,st,self){ if(!st) return false; if(st.taken) return true; { const G=G0(); if(G&&S.shopRes[G.zone]&&S.shopReserved(G.zone,st,G)) return true; }   /* 預約的位子（shopSeatTake）*/ const near=q=>!!q&&(q.lv|0)===(st.lv|0)&&Math.hypot(q.x-st.x,q.z-st.z)<0.4; const P=E&&E.player; if(P&&near(P.seat)) return true;
    return !!E&&(E.npcs||[]).some(m=>m&&m!==self&&(near(m.seat)||near(m.seatTarget))); };
  /* 玩家坐著的那一桌（DATE-SEAT-AFAR-1105，使用者 11-05：和學姊在 afar 坐下，四人桌對面有人）：路人不來坐（同一桌＝invites3d.js INV.tableMates：四個位子以內的桌子整桌、長桌 1.8 m 內）*/
  /* 玩家那一桌（DATE-SEAT-AFAR-1105）＋約會已經選好的那一桌（BUG-AFAR-DATE-OCCUPIED-1107，BB-B 11-07：約念書、約會她先坐好、你還沒坐下的那一段，
     店裡新來的客人坐進同一桌——原本只看玩家自己坐的位子）：她坐的位子、帶路選好的兩個位子（iv.lead.her／me）、和你一起來的人坐著的位子都算 */
  S.dateSeats=function(E){ const out=[]; const P=E&&E.player; if(P&&P.seat) out.push(P.seat); const G=G0();
    if(G&&Array.isArray(G.invites)) for(const iv of G.invites){ if(iv&&iv.lead&&iv.state==='accepted'&&iv.day===G.day){ if(iv.lead.her) out.push(iv.lead.her); if(iv.lead.me) out.push(iv.lead.me); } }
    for(const m of (E&&E.npcs)||[]){ if(m&&(m._ivLead||m.beh==='follow')&&(m.seat||m.seatTarget)) out.push(m.seat||m.seatTarget); }
    return out; };
  S.playerTable=function(E,st){ if(!st) return false; const L=S.dateSeats(E); if(!L.length) return false; const tm=(a,b)=>typeof INV!=='undefined'&&INV.tableMates?INV.tableMates(E,a,b):((a.lv|0)===(b.lv|0)&&Math.hypot(a.x-b.x,a.z-b.z)<1.8); return L.some(q=>tm(q,st)); };
  S.shopFree=E=>((E&&E.zone&&E.zone.seats)||[]).filter(st=>!S.seatBusy(E,st)).length;
  S.shopNeed=E=>E&&E.player&&E.player.seat?1:Math.min(2,Math.max(1,((E&&E.zone&&E.zone.seats)||[]).length-1));   /* 玩家還沒坐：至少兩個空位（自己＋一起來的人；一一八茶飲只有兩張高腳椅＝一個）；坐下了：一個 */
  S.shopCount=(E,zone)=>((E&&E.npcs)||[]).filter(n=>n&&typeof n.crowd==='string'&&n.crowd.indexOf('shop_'+zone+'_')===0&&!n.leaving).length;
  /* 有名字的人後來才走進來（常客、桌遊團、照作息的同學）、空位不夠的時候：離門口最近的那一桌客人吃完先走（同一桌一起走；那一段時間不再排他們）*/
  S.shopTrim=function(GM){ const E=GM.E, G=GM.G, def=G&&S.SHOP_ZONES[G.zone]; if(!def||!E.zone||!(E.zone.seats||[]).length) return 0; if(S.shopFree(E)>=S.shopNeed(E)) return 0;
    const ids=Object.keys(live).filter(id=>id.indexOf('shop_'+G.zone+'_')===0&&live[id].npcs.some(n=>n.seat&&!n.leaving&&E.npcs.includes(n)));
    if(!ids.length) return 0; const dd=id=>{ const sp=S.SPOTS.find(q=>q.id===id); return sp?Math.hypot(sp.c[0]-def.door[0],sp.c[1]-def.door[1]):0; }; ids.sort((a,b)=>dd(a)-dd(b));
    const id=ids[0], L=live[id], sp=S.SPOTS.find(q=>q.id===id); for(const n of L.npcs){ if(!E.npcs.includes(n)) continue; n.lookAt=null; if(n.seat) standNPC(E,n); walkAwayCrowd(GM,sp,n,'door'); } L.npcs=[]; L.yielded=true; return 1; };
  /* ===== 路人分科系（AA_495，AA-C 2026-10-28 定稿，句子照抄；CROWD-DEPTS-1028、USER_WANTS X120；句子在 src/data/crowd_depts.js）=====
     使用者 10-28：「路人也是 一堆 上課坐在後排的 路上遇到的 有必要嗎 都沒有別的系的學生 當台大只有法律系嗎」。
     - 一個人一句（第 1 節）：校園（椰）、總圖和社科圖（圖）、體育館（體）、公館（館）的路人生出來時照地點抽一個系（同一群人先把那個地點的系輪一遍再重複；同一天同一群人是同一些系），
       名字＝「電機系的學生」（說話的人的名字，和體育館的「打球的人」同一種寫法；遊戲沒有頭上的名牌，點了以後對話框上的名字）。
       點了聽一句：照時段選欄（考試 → 開學 → 寒暑假 → 晚上 → 平常；那個系沒寫的欄用平常；寒暑假只出寫了「寒暑假」的系）；
       輪法照 AA_489 第 4 節（體育館）：同一次進來（GM.enterN＋區域）同一個系同一欄的句子不重複、用完了其他人就不說；下一次進來從下一句開始（G.flags.deptHear）。
       旁白寫「他」「她」的句子只給男生、女生（extraSpec：偶數＝女生）。旁白先出、再出那一句（第 0-3 節）。走路的人點了先停下來、面向你，說完再繼續走（第 5 節）。
       誰：story3d.js 用 GM.spawnExtra 生的走路的人（進區域時，S.enter 的最後）、共同教學館門口（校園）的人、體育館大廳散步的人和長椅上的人。
       這些人在按鈕上最後才算（yieldIt，engine3d.js nearestInteractable）：旁邊有別的互動點（出口、座位、公告欄）或別的人（有名字的同學）時不擋——路人很多，不能讓「進入○○」「和小安說話」變成「聽一句」。
     - 兩個人的對話（第 2 節）：一個地點同時只放一組、一段一天聽一次（G.flags.deptTalkDay）；點了照順序出整段，說話的人是那一個。
       椰、館＝兩個走路的人一起走（第二個人跟著第一個：beh buddy）；圖＝相鄰的兩個空位一起坐（總圖大廳 2F、3F 閱覽區、社科圖，開館時；第 15 組：工讀的人站在座位旁邊）；
       體＝1F 場邊的長椅一起坐（開館時、不是典禮的日子、一層 16 個人放得下）。
       那個時段沒有對話的地點用「平常」那幾段（寒暑假除外）。
     - 教學館的課（第 3、4 節，原本是教室門口的對話；CROWD-NO-DOOR-1103 起在教室裡，下面 S.seatTalk…）：通識（courses.js kind:'general'）各系混著，法律系必修（kind:'required'，經濟系那一年的必修除外）都是法律系；
       坐在玩家前一排或旁邊（同一排）的兩個（三個）同學說那一段。共同、博雅、普通的教室才有（S.seatTalkRoom）；霖澤館 201、萬才館照舊沒有。
     - 經濟系那一年（Y0）照同一套。沒有載入 crowd_depts.js（測試）＝照舊。測試：node tests/crowd_depts_unit.js */
  const DP=()=>typeof CROWD_DEPTS!=='undefined'?CROWD_DEPTS:null;
  S.deptPlace=zone=>{ const D=DP(); return (D&&D.ZONES[zone])||null; };
  S.deptName=id=>id+'系的學生';
  S.npcSex=n=>{ const u=n&&n.obj&&n.obj.userData, sp=u&&(u.buildSpec||u.spec); return (sp&&sp.sex)||null; };
  /* 時段（第 0-2 節）：exam＝期中、期末週；open＝學期第 1～2 週；brk＝沒有學期；eve＝18:00 以後（到清晨 6 點）*/
  S.deptFlags=function(G){ const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, h=hr(G); return {T,exam:!!(T&&T.exam),open:!!(T&&T.week<=2),brk:!T,eve:h>=18||h<6,rain:G.weather==='rain'||G.weather==='typhoon'}; };
  S.deptCol=function(G){ const f=S.deptFlags(G); return f.exam?'考試':(f.open?'開學':(f.brk?'寒暑假':(f.eve?'晚上':'平常'))); };
  /* 這個地點、這個時段會出現的系（圖資只在總圖；寒暑假只有寫了寒暑假那一欄的）*/
  S.deptPool=function(G,zone){ const D=DP(), pl=S.deptPlace(zone); if(!D||!pl) return []; const brk=S.deptCol(G)==='寒暑假';
    return D.DEPTS.filter(d=>d.at.includes(pl)&&(!d.mainLib||!!D.MAIN_LIB[zone])&&(!brk||!!d.L['寒暑假'])); };
  /* 一群人（salt）的第 k 個人的系：照日期＋區域＋salt 洗牌，先把各系輪一遍再重複 */
  S.deptPick=function(G,zone,salt,k,pool){ pool=pool||S.deptPool(G,zone); if(!pool.length) return null; const r=prng(hash('dept|'+zone+'|'+salt+'|'+G.day)), a=pool.slice();
    for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a[(k|0)%a.length]; };
  /* 稿上的一句 → 旁白（開頭的括號）＋那一句（「」裡面）；旁白寫「他」「她」＝只給男生／女生 */
  S.deptSteps=function(raw,who){ const m=String(raw).match(/^(（[^）]*）)?「([\s\S]*)」$/); if(!m) return [{who:null,t:String(raw)}]; const out=[]; if(m[1]) out.push({who:null,t:m[1]}); out.push({who,t:m[2]}); return out; };
  S.deptSex=raw=>/^（他/.test(raw)?'m':(/^（她/.test(raw)?'f':null);
  /* 對話那一格（A：…／B：…）→ 一句一句；by＝第幾個人（A＝0）*/
  S.deptTalkSteps=function(d,names){ return String(d).split('／').map(s=>{ const m=s.match(/^([ABC])：([\s\S]*)$/), i=m?'ABC'.indexOf(m[1]):-1; return m?{by:i,who:(names&&names[i])||null,t:m[2]}:{by:-1,who:null,t:s}; }); };
  S.deptSpeakers=d=>Math.max(...S.deptTalkSteps(d,[]).map(s=>s.by))+1;
  /* 同一次進來（AA_489 第 4 節的輪法）：start＝這一次每一種從第幾句開始（第一次用到時讀 G.flags.deptHear、往下推一句），used＝這一次用過的 */
  let deptVisit=null;
  const dVisit=GM=>{ const vk=(GM.enterN|0)+':'+GM.G.zone; if(!deptVisit||deptVisit.key!==vk) deptVisit={key:vk,start:{},used:{}}; return deptVisit; };
  const dStart=(GM,key,len)=>{ const V=dVisit(GM), F=GM.G.flags||(GM.G.flags={}), R=F.deptHear||(F.deptHear={}); if(V.start[key]==null){ V.start[key]=(R[key]|0)%len; R[key]=((R[key]|0)+1)%len; } return V.start[key]; };
  /* 這個系的人（性別 sex）這一次說哪一句：照時段選欄；同一欄這一次用過的不再用、旁白的性別要對；都用完了＝null（這個人不說）*/
  S.deptLine=function(GM,d,sex){ const c0=S.deptCol(GM.G), col=d.L[c0]?c0:'平常', L=d.L[col]||[]; if(!L.length) return null; const key=d.id+':'+col, st=dStart(GM,key,L.length), V=dVisit(GM), used=V.used[key]||(V.used[key]=[]);
    for(let u=0;u<L.length;u++){ const i=(st+u)%L.length; if(used.includes(i)) continue; const sx=S.deptSex(L[i]); if(sx&&sx!==sex) continue; used.push(i); return L[i]; } return null; };
  /* 點了：走路的人先停下來、面向你（照原本的路線點，說完往同一個點繼續走）；一起走的人一起停 */
  S.deptHold=function(GM,n,on){ const E=GM.E; if(!n||!n.obj) return;
    if(on){ n._dHold={face:n.faceYaw}; if(n.beh==='route'){ if(n.path&&n.path.length){ n.path=null; n.onArrive=null; const w=n.waypoints; if(w&&w.length) n.ri=((n.ri|0)-1+w.length)%w.length; } n.timer=1e9; }
      n.speed=0; if(n.pose==='walk'||n.pose==='run') n.pose=n.idlePose||'idle'; const P=E&&E.player&&E.player.obj&&E.player.obj.position; if(P&&!n.frozen&&!n.seat) n.faceYaw=Math.atan2(P.x-n.obj.position.x,P.z-n.obj.position.z); }
    else if(n._dHold){ const h=n._dHold; n._dHold=null; if(n.beh==='route') n.timer=0.3; n.faceYaw=h.face==null?null:h.face; } };
  S.deptHear=async function(GM,ppl,steps){ if(!GM||!GM.G||(GM.D&&GM.D.active)) return false; const hold=[];
    for(const m of ppl){ if(!m) continue; if(m.beh==='buddy'&&m.buddy&&!hold.includes(m.buddy)) hold.push(m.buddy); if(!hold.includes(m)) hold.push(m); }
    for(const m of hold) S.deptHold(GM,m,true);
    try{ GM.sceneBegin(); try{ const E=GM.E, P=E&&E.player, f=steps.find(s=>s.obj)||{obj:ppl[0]&&ppl[0].obj}; if(GM.face&&P&&f.obj) GM.face(P,f.obj.position.x,f.obj.position.z);
        for(const s of steps) await GM.say(s.who?{name:s.who,obj:s.obj}:null,s.t); } finally { GM.sceneEnd(); } }
    finally { for(const m of hold) S.deptHold(GM,m,false); }
    return true; };
  /* 一個人一句：名字＝那個系的學生；這一次輪到句子才能點（聽一句）。o.yield：旁邊有互動點時不擋 */
  S.deptOne=function(GM,n,d,sex,o){ if(!n||!d) return null; const nm=S.deptName(d.id); n.dept=d.id; n.name=nm; if(o&&o.yield) n.yieldIt=true; const raw=S.deptLine(GM,d,sex); if(!raw) return n;
    const st=S.deptSteps(raw,nm); n.deptLine=raw; n.hear={who:nm,t:st[st.length-1].t}; n.talkLabel='聽一句'; n.talk=()=>S.deptHear(GM,[n],st.map(s=>({who:s.who,t:s.t,obj:s.who?n.obj:null}))); return n; };
  /* 兩個（三個）人的對話：點誰都是整段；聽完了這一天不再出（一段一天一次），兩個人都不能再點 */
  S.deptUntalk=n=>{ for(const m of (n&&n.deptPair)||[n]){ if(m){ m.talk=null; m.talkLabel=null; } } };
  S.deptPairTalk=function(GM,ppl,conv,id,names){ ppl.forEach((m,i)=>{ m.name=names[i]; m.dept=names[i].replace(/系的學生$/,''); m.deptTalk=id; m.deptPair=ppl; m.talkLabel='聽一句';
      m.talk=async()=>{ const steps=S.deptTalkSteps(conv.d,names).map(s=>({who:s.who,t:s.t,obj:s.by>=0&&ppl[s.by]?ppl[s.by].obj:null})); const done=await S.deptHear(GM,ppl,steps);
        if(done){ const G=GM.G, F=G.flags||(G.flags={}); (F.deptTalkDay||(F.deptTalkDay={}))[id]=G.day; S.deptUntalk(m); } }; }); };
  /* 選一段：照輪的順序（G.flags.deptHear 的 talk:…），這一次放過的、今天聽過的跳過 */
  S.deptTalkPick=function(GM,key,list,pre){ if(!list||!list.length) return null; const G=GM.G, H=(G.flags&&G.flags.deptTalkDay)||{}, k='talk:'+key, st=dStart(GM,k,list.length), V=dVisit(GM), used=V.used[k]||(V.used[k]=[]);
    for(let u=0;u<list.length;u++){ const c=list[(st+u)%list.length], id=pre+c.n; if(used.includes(id)||H[id]===G.day) continue; if(S.WEEKLY_TALK.includes(id)&&H[id]!=null&&S.weekStart(H[id])===S.weekStart(G.day)) continue; used.push(id); return c; } return null; };
  /* 每週最多一次的段落（AA 11-03：法律系必修課前的「平常」l2 只有一段，每天聽到會變成背景噪音）：同一週（週一到週日）聽過就不再演 */
  S.WEEKLY_TALK=['l2'];
  S.weekStart=d=>{ if(typeof CALENDAR==='undefined'||!CALENDAR.dateOf) return Math.floor(d/7); return d-(CALENDAR.dateOf(d).wd-1); };
  S.closingSoon=(G,zone)=>{ if(typeof PLACES==='undefined'||!PLACES.isOpen||!PLACES.hours||!PLACES.hours[zone]) return false; const h=hr(G); return PLACES.isOpen(zone,h,G.day)&&!PLACES.isOpen(zone,h+0.5,G.day); };
  /* 第 2 節：這個地點、這個時段的對話（圖資的只在總圖）；沒有就用「平常」那幾段（寒暑假除外）*/
  S.deptTalksAt=function(G,place,zone){ const D=DP(); if(!D) return []; const f=S.deptFlags(G), col=S.deptCol(G);
    const ok=w=>w==='考試、晚上'?(f.exam&&f.eve):(w==='晚上（閉館前 30 分鐘）'?(f.eve&&S.closingSoon(G,zone)):(w==='平常（下雨）'?(col==='平常'&&f.rain):w===col));
    const at=D.TALKS.filter(c=>c.at===place&&(!c.who.includes('圖資')||!!D.MAIN_LIB[zone]));
    const L=at.filter(c=>ok(c.when)); return L.length||col==='寒暑假'?L:at.filter(c=>c.when==='平常'); };
  /* 第 3、4 節：這一堂課、上課前／下課後的對話；有特別寫的週次（第 1 週、第 6～7 週、考試、第 13 週以後、最後一週、考試前一週）先用，沒有就用「平常」*/
  S.deptDoorTalks=function(G,c,ph,list,T){ const w=T.week; const ok=x=>{ switch(x.when){ case '第 1 週': return w===1; case '第 6～7 週': return w>=6&&w<=7; case '考試': return !!T.exam; case '第 13 週以後': return w>=13; case '最後一週': return T.exam==='final';
        case '考試前一週': { const T7=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day+7):null; return !T.exam&&!!(T7&&T7.id===T.id&&T7.exam); } } return false; };
    const L=list.filter(x=>x.ph===ph&&(!x.course||x.course==='通識'||x.course===c.id)), sp=L.filter(x=>x.when!=='平常'&&ok(x)); return sp.length?sp:L.filter(x=>x.when==='平常'); };
  /* 椰、館：兩個走路的人一起走（第一個照原本的路線，其他人跟著；站得住的位置放在旁邊）*/
  S.deptWalkPair=function(GM,walkers,k){ const E=GM.E, L=walkers[0]; if(!L||walkers.length<k) return null; const P=L.obj.position, lv=L.lv|0, spots=[];
    for(let i=1;i<k;i++){ const s=1+0.5*(i-1); let p=null; for(const [dx,dz] of [[0.85,0],[-0.85,0],[0,0.85],[0,-0.85],[0.6,0.6],[-0.6,-0.6],[0.6,-0.6],[-0.6,0.6]]){ const x=+(P.x+dx*s).toFixed(2), z=+(P.z+dz*s).toFixed(2); if(E.canStand&&!E.canStand(x,z,0.3,lv)) continue; p=[x,z]; break; } if(!p) return null; spots.push(p); }
    const out=walkers.slice(0,k); out.slice(1).forEach((f,i)=>{ const p=spots[i]; if(E.placeAt) E.placeAt(f,p[0],p[1],lv); else f.obj.position.set(p[0],f.obj.position.y,p[1]);
      f.beh='buddy'; f.buddy=L; f.side=i%2?-1:1; f.followOff=0.85+0.45*Math.floor(i/2); f.waypoints=null; f.path=null; f.onArrive=null; f.frozen=false; f.pose=f.idlePose='idle'; }); return out; };
  /* 圖、體：相鄰的兩個空位（同一排、同一個方向、隔 0.8～1.75 m）；stand＝一個位子＋旁邊站的地方（第 15 組）。體育館只用 1F 球場這邊的位子（大廳的長椅留給玩家）。
     從座位表後面往前找（劇情用的固定位子都在前面）；劇情寫死的位子不坐（DEPT_KEEP：總圖大廳 0、1＝小安「總圖的下午」，library3d.js；社科圖 16＝r3_3d.js SK12）；
     坐下的人有 seat：作息（populateSchedule）、約出去（INV.pairSeats）、樓上的自習區都會避開 */
  S.DEPT_KEEP={library_hall:[0,1],soclib:[16]};
  S.DEPT_SIT={library_hall:1,library:1,soclib:1,soclib_2f:1,gym:1};   /* 一起坐的對話放在哪些區域：總圖大廳（2F 自習區）、總圖 3F 閱覽區、社科圖、體育館 1F。B1 自習室、5F 書庫、研究小間有自己的人（LB1、LUP）和討論室的劇情站位，不放。
     soclib_2f（社科圖東側館，SOCLIB-2F-1104 接線 patch）：CROWD_DEPTS.ZONES 還沒有 soclib_2f（AA 的資料）＝現在不會放；放了也不坐老位子（seat.old，AA_669 第 6 節，下面 ok 的 !st.old）*/
  S.deptSeatPair=function(GM,zone,stand){ const E=GM.E, G=GM.G, seats=(E.zone&&E.zone.seats)||[], N=seats.length; if(!N) return null; const near=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z), keep=(S.DEPT_KEEP[zone]||[]).map(i=>seats[i]);
    const busy=st=>!!st.taken||E.npcs.some(n=>{ const q=n.seat||n.seatTarget||(n.obj&&n.obj.position); return !!q&&(n.lv|0)===(st.lv|0)&&near(q,st)<0.45; })||!!(E.player&&E.player.seat&&near(E.player.seat,st)<0.45);
    const ok=st=>(zone!=='gym'||st.z<11)&&!keep.includes(st)&&!st.label&&!st.old&&!busy(st)&&!!S.seatSide(E,st), yd=(a,b)=>Math.abs(Math.atan2(Math.sin((b.yaw||0)-(a.yaw||0)),Math.cos((b.yaw||0)-(a.yaw||0))));
    const o=Math.floor(prng(hash('dseat|'+zone+'|'+G.day))()*Math.max(1,Math.floor(N/2)));   /* 照日期換一點位置（都在後半段開始找）*/
    for(let u=0;u<N;u++){ const a=seats[((N-1-o-u)%N+N)%N]; if(!ok(a)) continue; if(stand) return [a,S.seatSide(E,a)];
      const fx=Math.sin(a.yaw||0), fz=Math.cos(a.yaw||0), b=seats.find(b=>b!==a&&(b.lv|0)===(a.lv|0)&&yd(a,b)<0.1&&near(a,b)>0.8&&near(a,b)<1.75&&Math.abs((b.x-a.x)*fx+(b.z-a.z)*fz)<0.15&&ok(b)); if(b) return [a,b]; }
    return null; };
  S.deptSpawn=function(GM,spec,x,z,lv,yaw,pose,seat){ const E=GM.E; if(typeof CHAR==='undefined'||typeof STORY==='undefined'||!STORY.extraSpec||!E.addNPC) return null; const o=CHAR.build(STORY.extraSpec(spec)); o.position.set(x,0,z); o.rotation.y=yaw||0;
    return E.addNPC({obj:o,name:'',beh:'idle',pose,idlePose:pose,frozen:true,isExtra:true,lv:lv|0,seat:seat||undefined,deptSeat:true}); };
  /* 進區域（S.enter 的最後；story3d.js 的路人都生好了）：兩個人的對話、走路的人一人一句 */
  S.deptEnter=function(GM,zone){ const D=DP(), E=GM&&GM.E, G=GM&&GM.G; if(!D||!E||!G||!E.npcs) return; const pl=D.ZONES[zone]; if(!pl) return; const h=hr(G);
    const walkers=E.npcs.filter(n=>n&&n.isExtra&&n.beh==='route'&&!n.crowd&&!n.name&&!n.talk&&!n.clerk&&!n.fairCrowd);   /* GM.spawnExtra 的走路的人（社博的新生、店員、有名字的人不算）*/
    let used=[]; const open=pl==='圖'?(!!S.DEPT_SIT[zone]&&(typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen(zone,h,G.day))):(pl==='體'?(zone==='gym'&&E.npcs.length+2<=16&&(()=>{ const H=S.gymHours(G); return !!H&&h>=H[0]&&h<H[1]&&!(typeof GY3!=='undefined'&&GY3.ceremonyDay&&GY3.ceremonyDay(G)); })()):true);   /* 體育館一層最多 16 個完整人物（手機效能，gym_crowd_unit）：放不下兩個人就不放 */
    const conv=open?S.deptTalkPick(GM,pl,S.deptTalksAt(G,pl,zone),'t'):null;
    if(conv){ const id='t'+conv.n, names=conv.who.map(S.deptName);
      if(pl==='椰'||pl==='館'){ const ppl=S.deptWalkPair(GM,walkers,conv.who.length); if(ppl){ used=ppl; ppl.forEach(m=>{ m.yieldIt=true; }); S.deptPairTalk(GM,ppl,conv,id,names); } }
      else { const stand=conv.who.includes('圖資'), sp=S.deptSeatPair(GM,zone,stand); if(sp){ const base=900+((G.day*7)%30)*2, pose=pl==='體'?'sit':'read', mk=(st,i)=>S.deptSpawn(GM,base+i*3,st.x,st.z,st.lv,st.yaw,pose,{x:st.x,z:st.z,yaw:st.yaw||0,lv:st.lv|0});
          const ppl=stand?[S.deptSpawn(GM,base,sp[1][0],sp[1][1],sp[0].lv,Math.atan2(sp[0].x-sp[1][0],sp[0].z-sp[1][1]),'idle',null),mk(sp[0],1)]:[mk(sp[0],0),mk(sp[1],1)];   /* 第 15 組：A（圖資，工讀）站在座位旁邊、面向 B */
          if(ppl.every(Boolean)) S.deptPairTalk(GM,ppl,conv,id,names); } } }
    walkers.filter(n=>!used.includes(n)).forEach((n,k)=>{ const d=S.deptPick(G,zone,'walk',k); if(d) S.deptOne(GM,n,d,S.npcSex(n),{yield:true}); }); };
  /* crowd3d 的一群人（S.giveLines 之後）：校園的門口（共同教學館）＝一人一句。自己有句子的地點（女舍、法服、小公園、體育館）不加 */
  S.deptGroup=function(GM,spot,slot,npcs){ const D=DP(); if(!D||!GM||!GM.G||spot.lines||spot.people||!npcs.length) return; const G=GM.G;
    if(!S.deptPlace(spot.zone)) return;
    npcs.forEach((n,k)=>{ const d=S.deptPick(G,spot.zone,spot.id+'|'+slot.key,n.deptK!=null?n.deptK:k); if(d) S.deptOne(GM,n,d,n.deptSex,{yield:true}); }); };
  /* ===== 教室裡的對話（AA_495 第 3、4 節；CROWD-NO-DOOR-1103）=====
     使用者 2026-11-03 試玩：「教室外面可以不要有一坨人嗎」。AA 選 (a)：教室門口不再有人等、有人聊天；原本門口那幾段對話搬進教室，
     由坐在玩家前一排或旁邊（同一排）的同學說，字照舊；第 6 組（三個人）＝同一排的三個人。
     - 什麼時候（classes3d.js 的 S.attend）：上課前（pre）＝提早坐下、轉暗等到上課時間、回來以後老師開口以前（和原本一樣：開始以後才進來的人聽不到上課前的那一段）；
       下課後（post）＝下課轉暗回來（「下課了。」）以後。玩家坐在那一間的位子上才有；門口上課（研討室、法圖櫃台…）沒有。
     - 哪一段：照舊（S.deptDoorTalks 照週次、S.deptTalkPick 照輪的順序，這一次放過的、今天聽過的跳過；輪的紀錄 G.flags.deptHear 的 talk:ge:pre…、聽過 G.flags.deptTalkDay 的 g3、l2…，存檔格式不變）。
     - 誰說：前一排（玩家前面最近的那一排）離玩家最近的 k 個位子；前一排湊不到 k 個，用玩家這一排、玩家旁邊的 k 個位子（左右 3.2 m 以內）；
       兩個人的還湊不到：前一排一個、旁邊一個。上課前說過話的人（已經有系的名字）下課後不再用（名字不會變）。
       位子上已經坐著的同學（沒有名字的路人）直接說；空的位子在轉暗的時候（玩家看不到）從同一堂課坐比較遠的同學裡挪一個過來，沒有就補一個人——不在玩家眼前出現在座位上。
       有名字的人、替身（taken）、玩家坐的位子不用。
     - seatTalkPrep 在轉暗的時候叫（排好位子、決定說哪一段），seatTalkPlay 在亮了以後叫（照順序說、記一天一次）。說話的人在說完以前標 seatTalk（syncRooms 不叫他們走）。測試：node tests/crowd_seat_talk_unit.js */
  S.SEAT_TALK_NEAR=3.2;   /* 左右最遠 3.2 m：普通、共同的平面教室兩人一張桌、中間走道 2.4 m，第 6 組的三個人會隔著走道（同一排）*/
  const seatRel=(p,q)=>{ const fx=Math.sin(p.yaw||0), fz=Math.cos(p.yaw||0), dx=q.x-p.x, dz=q.z-p.z; return {f:dx*fx+dz*fz,l:dx*fz-dz*fx}; };   /* f：往前（老師那一邊）多遠；l：左右 */
  const sameYaw=(a,b)=>Math.abs(Math.atan2(Math.sin((a.yaw||0)-(b.yaw||0)),Math.cos((a.yaw||0)-(b.yaw||0))))<0.1;
  const seatWho=(E,st)=>E.npcs.find(n=>{ const q=n.seat||n.seatTarget; return !!q&&Math.hypot(q.x-st.x,q.z-st.z)<0.35&&((q.lv|0)===(st.lv|0)); })||null;
  /* 坐在玩家前一排／旁邊的 k 個位子（同一排）；用不到的位子：替身坐的、有名字的人、不是這一堂課的人 */
  S.seatTalkSeats=function(E,me,k,key){ const seats=((E.zone&&E.zone.seats)||[]).filter(q=>q!==me&&q.room===me.room&&(q.lv|0)===(me.lv|0)&&(q.kind==='class'||q.kind==='lecture')&&sameYaw(q,me));
    const ok=q=>{ if(q.taken) return false; const n=seatWho(E,q); return !n||(n.isExtra&&!n.name&&!n.leaving&&!n.charId&&n.clsStudent&&n.clsKey===key); };
    const R=seats.map(q=>({q,r:seatRel(me,q)}));
    const ahead=R.filter(x=>x.r.f>0.3), fr=ahead.length?Math.min(...ahead.map(x=>x.r.f)):null;
    const rows=[]; if(fr!=null) rows.push(R.filter(x=>Math.abs(x.r.f-fr)<0.3)); rows.push(R.filter(x=>Math.abs(x.r.f)<0.3));   /* 前一排、玩家這一排 */
    const cand=row=>row.filter(x=>ok(x.q)&&Math.abs(x.r.l)<=S.SEAT_TALK_NEAR).sort((a,b)=>Math.abs(a.r.l)-Math.abs(b.r.l));
    for(const row of rows){ const c=cand(row); if(c.length>=k) return c.slice(0,k).sort((a,b)=>a.r.l-b.r.l).map(x=>x.q); }
    if(k===2&&rows.length===2){ const a=cand(rows[0])[0], b=cand(rows[1])[0]; if(a&&b) return [a.q,b.q]; }   /* 前一排一個、旁邊一個 */
    return null; };
  S.seatTalkPrep=function(GM,it,ph){ const D=DP(), E=GM&&GM.E, G=GM&&GM.G, P=E&&E.player, me=P&&P.seat; if(!D||!G||!me||!it||!it.c||!it.room) return null;
    if(!E.zone||G.zone!==it.room.zone||me.room!==it.room.room||!S.seatTalkRoom(it.room.zone,it.room.room)) return null;
    const c=it.c, T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; if(!T) return null;
    const ge=c.kind==='general', law=c.kind==='required'&&!/^Y0/.test(T.id); if(!ge&&!law) return null;   /* 經濟系那一年的必修、選修、演講：沒有 */
    const conv=S.deptTalkPick(GM,(law?'law:':'ge:')+ph,S.deptDoorTalks(G,c,ph,law?D.LAW:D.GE,T),law?'l':'g'); if(!conv) return null;
    const k=S.deptSpeakers(conv.d), sts=S.seatTalkSeats(E,me,k,it.key); if(!sts) return null;
    const names=law?sts.map(()=>S.deptName('法律')):conv.who.map(S.deptName), ppl=[], used=new Set(sts);
    for(const st of sts){ let n=seatWho(E,st);
      if(n){ if(n.seatTarget||!n.seat){ n.seatTarget=null; if(GM.sitAt) GM.sitAt(n,st); n.seat=st; } }   /* 正走過去的：直接坐好（轉暗中）*/
      else { const far=E.npcs.filter(m=>m.isExtra&&!m.name&&!m.charId&&m.clsStudent&&m.clsKey===it.key&&m.seat&&!m.leaving&&!m.seatTalk&&!sts.includes(m.seat)&&!used.has(m.seat))
          .sort((a,b)=>Math.hypot(b.seat.x-me.x,b.seat.z-me.z)-Math.hypot(a.seat.x-me.x,a.seat.z-me.z))[0];   /* 同一堂課坐最遠的那一個挪過來 */
        if(far){ n=far; used.add(far.seat); n.path=null; n.onArrive=null; n.lv=st.lv|0; if(GM.sitAt) GM.sitAt(n,st); else { n.obj.position.set(st.x,st.y||0,st.z); n.obj.rotation.y=st.yaw||0; } n.seat=st; }
        else if(typeof CHAR!=='undefined'&&typeof STORY!=='undefined'&&STORY.extraSpec&&E.addNPC){ const o=CHAR.build(STORY.extraSpec(300+((hash(it.key)+ppl.length*7)%97))); o.position.set(st.x,st.y||0,st.z); o.rotation.y=st.yaw||0;
          n=E.addNPC({obj:o,name:'',beh:'idle',pose:'sit',idlePose:'sit',frozen:true,isExtra:true,seat:st,lv:st.lv|0,clsStudent:true,clsKey:it.key}); } }
      if(!n) return null; n.pose='sit'; n.idlePose='sit'; n.frozen=true; ppl.push(n); }
    ppl.forEach((n,i)=>{ n.name=names[i]; n.dept=names[i].replace(/系的學生$/,''); n.deptTalk=(law?'l':'g')+conv.n; n.seatTalk=true; });
    return {id:(law?'l':'g')+conv.n,conv,ppl,names,ph}; };
  /* BUG-SEATTALK-FADE-1103（BB 11-03，cc_x161_door_probe）：第一句說出來時畫面還是暗的（#fade 還開著或還在淡出）＝看不到誰在講。等全亮了再說（最多 1.5 秒）*/
  S.waitLit=async function(maxMs){ const d=typeof document!=='undefined'?document:null, f=d&&d.getElementById?d.getElementById('fade'):null; if(!f) return true; const t0=Date.now(), lim=maxMs==null?1500:maxMs;
    for(;;){ const on=f.classList&&f.classList.contains('on'); let op=0; try{ op=typeof getComputedStyle==='function'?parseFloat(getComputedStyle(f).opacity)||0:(on?1:0); }catch(e){ op=on?1:0; }
      if(!on&&op<0.05) return true; if(Date.now()-t0>=lim) return false; await new Promise(r=>setTimeout(r,50)); } };
  S.seatTalkPlay=async function(GM,p){ if(!p||!GM||!GM.G) return false; const G=GM.G; await S.waitLit();
    try{ for(const s of S.deptTalkSteps(p.conv.d,p.names)) await GM.say(s.who?{name:s.who,obj:s.by>=0&&p.ppl[s.by]?p.ppl[s.by].obj:null}:null,s.t);
      const F=G.flags||(G.flags={}); (F.deptTalkDay||(F.deptTalkDay={}))[p.id]=G.day; return true; }   /* 一段一天一次 */
    finally { for(const n of p.ppl) n.seatTalk=false; } };
  /* 體育館大廳散步的人、長椅上的人（S.gymBind）：體的系 */
  S.deptGymOne=function(GM,spot,n,p){ if(!DP()||!spot||spot.gym!=='lobby'||!p||(p.role!=='walker'&&p.role!=='bench')) return; const ks=String(p.key||'').split('|'), d=S.deptPick(GM.G,spot.zone,spot.id+'|'+(ks[1]||''),+ks[2]||0);
    if(d) S.deptOne(GM,n,d,typeof p.spec==='number'?(p.spec%2===0?'f':'m'):S.npcSex(n),{yield:true}); };
  S.slotAt=function(G,spot,h){ h=h==null?hr(G):h; return spot.slots(G).find(s=>h>=s.t0-1e-6&&h<s.t1)||null; };
  /* 這一天、這個時段的那一群人：人數、位置、朝向、姿勢、外觀（路人編號）都由種子決定（spot.people：每個人的位置由那個地點自己排，小公園）*/
  S.group=function(G,spot,slot,E){ const r=prng(hash(spot.id+'|'+slot.key+'|'+G.day)); if(spot.people) return spot.people(G,slot,r,E); const n=Math.round((slot.n[0]+Math.floor(r()*(slot.n[1]-slot.n[0]+1)))*(slot.fixed?1:((typeof STORY!=='undefined'&&STORY.CROWD_X)||1)));   /* 使用者 2026-10-17 P0：路人加倍（STORY.CROWD_X）；fixed：攤位的社員這種固定人數的不加倍 */ const out=[]; const base=1000+Math.floor(r()*500);
    for(let k=0;k<n;k++){ const x=spot.c[0]+(r()-0.5)*2*spot.spread[0], z=spot.c[1]+(r()-0.5)*2*spot.spread[1]; let spec=base+k*(spot.female?2:1); if(spot.female&&spec%2) spec++;   /* extraSpec：偶數＝女生 */
      out.push({x:+x.toFixed(2),z:+z.toFixed(2),spec,pose:r()<slot.talk?'talk':slot.pose}); }
    /* 聊天的人轉向彼此（找最近的另一個人），其他的面向門口或馬路 */
    for(const p of out){ let best=null, bd=1e9; for(const q of out){ if(q===p) continue; const d=Math.hypot(q.x-p.x,q.z-p.z); if(d<bd){ bd=d; best=q; } }
      const tgt=(p.pose==='talk'&&best&&bd<3.2)?[best.x,best.z]:(slot.leave==='door'?spot.door:spot.road); p.yaw=Math.atan2(tgt[0]-p.x,tgt[1]-p.z); }
    return out; };
  // ---------- 遊戲裡 ----------
  const live={};   // spot.id → {slotKey, npcs:[...]}
  let lastH=null, tAcc=0, zoneNow=null, entering=false;
  function inView(E,p){ const cam=E.camera; if(!cam||!THREE.Vector3.prototype.project) return true; const v=new THREE.Vector3(p.x,(p.y||0)+1.0,p.z).project(cam); return v.z<1&&Math.abs(v.x)<1.05&&Math.abs(v.y)<1.05; }
  /* ---------- 小公園（spot.people）：每個人照自己的安排放 ----------
     seat：坐在那個位子（時段開始時玩家看得到＝從入口走過來、走到 seat.ap 再坐下）；beh route／wander：繞圈、在附近走動；其他：站著。
     pass（課輔班）：排成一排走 S.passRoute 那條路，一個一個隔 PASS_GAP 公尺出發（還沒輪到的先藏在起點：pend）；進區域時照已經過了多久，放在走到一半的地方 */
  const PASS_GAP=1.1, pend=[];
  const along=(pts,d)=>{ for(let i=1;i<pts.length;i++){ const a=pts[i-1], b=pts[i], l=Math.hypot(b[0]-a[0],b[1]-a[1]); if(d<=l){ const t=l>0?d/l:0; return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]; } d-=l; } return pts[pts.length-1]; };
  const dropPend=n=>{ const i=pend.findIndex(q=>q.n===n); if(i>=0) pend.splice(i,1); };
  function sitNPC(GM,n,st){ if(GM.sitAt){ GM.sitAt(n,st); return; } const E=GM.E, o=n.obj.position; o.set(st.x,(st.y!=null?st.y:E.heightAt(st.x,st.z,n.lv|0))+(st.lift||0),st.z); n.obj.rotation.y=st.yaw||0; n.seat=st; n.pose='sit'; n.idlePose='sit'; n.frozen=true; n.path=null; }
  function standNPC(E,n){ const st=n.seat; if(!st) return; const ap=S.seatSide(E,st); if(ap) E.placeAt(n,ap[0],ap[1],n.lv|0); n.seat=null; n.pose='idle'; n.idlePose='idle'; n.frozen=false; if(n.obj&&n.obj.userData){ n.obj.userData.sitFeet=false; n.obj.userData.sitFloor=0; } }
  /* 課輔班第 k 個人現在走到哪裡（公尺；負的＝還沒出發）：遊戲時間一小時走 walkSpeed／hourRate 公尺 */
  const passMph=(GM,p)=>(p.walkSpeed||0.85)/(GM.hourRate||1/150);
  const passD=(GM,slot,p,k,fromDoor)=>(fromDoor?0:Math.max(0,hr(GM.G)-slot.t0)*passMph(GM,p))-k*PASS_GAP;
  function spawnPeople(GM,spot,slot,fromDoor){ const E=GM.E, G=GM.G, lv=spot.lv|0, npcs=[]; const grp=S.group(G,spot,slot,E); const route=slot.pass?S.passRoute(E,spot):null;
    if(spot.shop){ const ns=grp.filter(p=>p.seat).length;   /* 店裡的客人（SHOP-DINERS-1103）：坐下以後空位不夠玩家（S.shopNeed）、或店裡已經 S.SHOP_CAP 位：這一組這一段不來 */
      if(grp.some(p=>p.seat&&(S.seatBusy(E,p.seat)||S.playerTable(E,p.seat)))||(ns&&S.shopFree(E)-ns<S.shopNeed(E))||S.shopCount(E,spot.shop)+grp.length>S.SHOP_CAP){ live[spot.id]={slotKey:slot.key,npcs:[]}; return; } }   /* playerTable：玩家坐著的那一桌不來（DATE-SEAT-AFAR-1105）*/
    grp.forEach((p,k)=>{ const st=p.seat||null; let d=0;
      if(p.pass){ if(!route) return; d=passD(GM,slot,p,k,fromDoor); if(d>=route.len) return; }   /* 已經走過去了 */
      else if(st){ if(!S.seatSide(E,st)||S.seatBusy(E,st)) return; }   /* 有人坐了（玩家、劇情的人）不坐上去 */ else if(!p.fixed&&!E.canStand(p.x,p.z,0.3,lv)) return;   /* fixed：照位置放（跑步機上、櫃台後面：導航擋住的地方，人不走動）*/
      if(p.yieldPlayer&&E.player&&E.player.obj&&(E.player.lv|0)===lv&&Math.hypot(E.player.obj.position.x-p.x,E.player.obj.position.z-p.z)<0.5) return;   /* 健身房器材：玩家站在那一台（GYM-FIT-1107）＝不放在玩家身上 */
      const spec=p.rawSpec?Object.assign({},p.spec):STORY.extraSpec(p.spec); if(p.height) spec.height=p.height; if(p.props) spec.props=p.props.slice(); if(st&&st.surf!=null) st.lift=Math.max(0,+(st.surf-(CHAR.sitButtOf?CHAR.sitButtOf(spec):0.47*(spec.height||1.7)/1.75)).toFixed(3));   /* 鞦韆：坐姿的大腿底部抬到座面（SIT-HEIGHT-1104：坐下以後大腿底部離座位地面 CHAR.sitButtOf＝0.465；表裡沒有的模型照舊 0.47×身高比例）*/
      const o=CHAR.build(spec); if(p.prop){ const u=o.userData||(o.userData={}); (u.propOn=u.propOn||{})[p.prop]=true; if(CHAR.setProp) CHAR.setProp(o,p.prop,true); }   /* 腿上的筆電（慢讀咖啡）：坐下才看得到（PROPS laptop_lap sit:'only'）；模型還在載入時先記在 propOn，換上正式模型時照它打開 */ const start=fromDoor&&!p.pass?spot.door:(st?[st.x,st.z]:[p.x,p.z]); o.position.set(start[0],0,start[1]); o.rotation.y=p.yaw||0;
      const n=E.addNPC({obj:o,name:p.name||'',beh:'idle',pose:'idle',idlePose:'idle',isExtra:true,crowd:spot.id,crowdSpot:spot.id,crowdKey:p.key,crowdRole:p.role,frozen:true,walkSpeed:p.walkSpeed||1.15,lv:fromDoor&&!p.pass&&spot.doorLv!=null?spot.doorLv|0:lv});   /* 從門口進來：門口那一層（兩層的店：門在一樓、位子在二樓）*/
      const settle=()=>{ if(st){ n.seatTarget=null; if(S.seatBusy(E,st,n)){ n.pose=n.idlePose='idle'; walkAwayCrowd(GM,spot,n,'door'); return; } sitNPC(GM,n,st); if(p.sitPose){ n.pose=n.idlePose=p.sitPose; } return; }   /* 走到了位子被坐走（玩家先坐了）：走出去；sitPose：坐著看書（read）*/ if(p.beh){ n.beh=p.beh; n.waypoints=p.waypoints; n.ri=p.ri|0; n.pauseAt=!!p.pauseAt; n.run=!!p.run; n.frozen=false; n.pose=n.idlePose=p.pose||'idle'; n.timer=0; if(p.faceYaw!=null) n.faceYaw=p.faceYaw; return; }   /* run：跑步（打球）；pauseAt：每一段跑完停 1～4 秒；faceYaw：停下來面向網子、籃框 */
        if(p.fixed){ n.fixedPos=true; if(E.placeAt) E.placeAt(n,p.x,p.z,lv); else n.obj.position.set(p.x,0,p.z); if(p.y) n.obj.position.y+=p.y; }   /* 跑步機的皮帶、櫃台後面（小動作不動他們）*/
        n.frozen=true; n.pose=n.idlePose=p.pose||'idle'; if(p.idlePose) n.idlePose=p.idlePose; n.obj.rotation.y=p.yaw||0; };   /* 跑步機上：pose、idlePose 都是 run（原地跑；引擎停下來時回到 idlePose）*/
      if(p.pass){ const arrive=()=>{ n.passing=false; n.leaving=true; n.arrived=true; }, go=()=>{ n.hidden=false; n.frozen=false; n.passing=true; n.pose='walk'; if(!E.moveTo(n,route.to[0],route.to[1],arrive,lv)) arrive(); };
        if(d>=0){ const q=along(route.pts,d); E.placeAt(n,q[0],q[1],lv); go(); }
        else { E.placeAt(n,route.pts[0][0],route.pts[0][1],lv); n.hidden=true; n.passing=true; pend.push({n,h:slot.t0+(k*PASS_GAP)/passMph(GM,p),go}); } }   /* 還沒輪到他出發：先藏在起點 */
      else if(fromDoor){ const tgt=st?S.seatSide(E,st):[p.x,p.z]; n.frozen=false; n.pose='walk'; if(st) n.seatTarget=st;   /* 走過去的路上這個位子算有人（GAME.freeSeat、有名字的人不坐）*/ if(!E.moveTo(n,tgt[0],tgt[1],settle,lv)){ E.placeAt(n,tgt[0],tgt[1],lv); settle(); } }
      else settle();
      if(spot.bind) spot.bind(GM,n,p);
      npcs.push(n); });
    if(spot.pairTalk&&npcs.length===2){ npcs[0].lookAt=npcs[1].obj.position; npcs[1].lookAt=npcs[0].obj.position; }   /* 一桌兩個人：轉頭看對方（聊天）*/
    if(spot.shop&&typeof SHOPENC!=='undefined'&&SHOPENC.bindDiners){ try{ SHOPENC.bindDiners(GM,spot,npcs,slot); }catch(e){ console.warn('SHOPENC.bindDiners',e); } }   /* 店裡的客人點了聽一句（AA_640，src/shopenc3d.js）*/
    live[spot.id]={slotKey:slot.key,npcs}; }
  function runPend(GM){ const h=hr(GM.G); for(const q of pend.slice()){ if(h<q.h-1e-9) continue; dropPend(q.n); if(GM.E.npcs.includes(q.n)) q.go(); } }
  function spawnGroup(GM,spot,slot,fromDoor){ if(spot.people) return spawnPeople(GM,spot,slot,fromDoor); const E=GM.E; const grp=S.group(GM.G,spot,slot); const npcs=[]; const lv=spot.lv|0; const h=hr(GM.G);
    for(let k=0;k<grp.length;k++){ const p=grp[k];
      if(!E.canStand(p.x,p.z,0.3,lv)) continue; const o=CHAR.build(STORY.extraSpec(p.spec)); const byDoor=slot.enter==='door'; const start=fromDoor?(byDoor?(spot.door2&&p.x>spot.c[0]?spot.door2:spot.door):spot.road):[p.x,p.z];
      const slv=fromDoor?(byDoor?(spot.doorLv|0):(spot.roadLv!=null?spot.roadLv:lv)):lv;   /* 室內：從教室門口（教室那一層）或建築出口（一樓）出來 */
      o.position.set(start[0],0,start[1]); o.rotation.y=p.yaw; const n=E.addNPC({obj:o,name:'',beh:'idle',pose:p.pose,idlePose:p.pose,isExtra:true,crowd:spot.id,crowdSpot:spot.id,frozen:!fromDoor,walkSpeed:1.25,lv:slv,home:{x:p.x,z:p.z,yaw:p.yaw,pose:p.pose}});
      n.deptK=k; n.deptSex=p.spec%2===0?'f':'m';   /* AA_495：這一群人的第幾個、性別（extraSpec 偶數＝女生）*/
      if(fromDoor){ n.frozen=false; n.pose='walk'; E.moveTo(n,p.x,p.z,()=>{ n.frozen=true; n.pose=p.pose; n.idlePose=p.pose; n.obj.rotation.y=p.yaw; },lv); }
      npcs.push(n); }
    S.giveLines(GM,spot,slot,npcs);
    try{ S.deptGroup(GM,spot,slot,npcs); }catch(e){ console.warn('CROWD.deptGroup',e); }   /* AA_495：路人的系 */
    live[spot.id]={slotKey:slot.key,npcs,n:grp.length}; }
  /* 點了可以聽一句的路人（spot.lines(G,slot)＝這個時段的句子；一句給一個人，allTalk＝每個人都是同一串）*/
  S.giveLines=function(GM,spot,slot,npcs){ if(!spot.lines) return []; const L=spot.lines(GM.G,slot)||[]; const out=[];
    npcs.forEach((n,k)=>{ const sc=spot.allTalk?L[0]:L[k]; if(!sc) return; n.talkLabel=spot.talkLabel||'聽一句'; n.talk=()=>S.overhear(GM,n,sc); out.push(n); }); return out; };
  S.seatSide=function(E,st){ const yaw=st.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw), lv=st.lv|0;   /* 坐下前站的位置（和 GAME.seatApproach 同一組候選，不看玩家的位置）*/
    if(st.ap&&E.canStand(st.ap[0],st.ap[1],0.3,lv)) return [st.ap[0],st.ap[1]];   /* 座位指定的走近點（Café 的沙發）*/
    for(const [dx,dz] of [[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[fx*0.5,fz*0.5],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]]){ const x=st.x+dx, z=st.z+dz; if(!E.canStand(x,z,0.3,lv)) continue; if(st.y!=null&&Math.abs(E.heightAt(x,z,lv)-st.y)>0.2) continue; return [x,z]; } return null; };
  /* 走出建築（或走去門口、馬路）：走開的人不能再點、不再東張西望 */
  function walkAwayCrowd(GM,spot,n,leave){ const E=GM.E; const toRoad=leave==='road';
    const tgt=toRoad?spot.road:(spot.door2&&n.obj.position.x>spot.c[0]?spot.door2:spot.door), tlv=toRoad?(spot.roadLv!=null?spot.roadLv:(spot.lv|0)):(spot.doorLv!=null?spot.doorLv:(spot.lv|0)); n.frozen=false; n.leaving=true; n.pose='walk'; n.clsStudent=false; n.lookAt=null; n.faceYaw=null;
    if(!E.moveTo(n,tgt[0],tgt[1],()=>{ n.arrived=true; },tlv)) n.arrived=true; }
  function leaveGroup(GM,spot,instant){ const E=GM.E, L=live[spot.id]; if(!L) return; delete live[spot.id];
    for(const n of L.npcs){ if(!E.npcs.includes(n)) continue; n.talk=null; n.talkLabel=null; if(instant){ dropPend(n); E.removeNPC(n); continue; }   /* 走開的人不能再點（D7、D9）*/
      if(spot.people){ if(n.hidden){ dropPend(n); E.removeNPC(n); continue; } if(n.passing) continue; if(n.seat) standNPC(E,n); n.beh='idle'; n.waypoints=null; n.held=false; n.lookAt=null; n.run=false; n.faceYaw=null; n.idlePose='idle'; }   /* 打球的不再跑、跑步機上的不再原地跑（體育館）*/   /* 小公園：還沒出發的課輔班拿掉、正在走的照走；坐著的先站起來、繞圈和走動的停下來，再走出公園 */
      walkAwayCrowd(GM,spot,n,L.leave); } }
  /* 教室門口等的人分批走進教室（CROWD-CLASS-ARRIVE-1027 的 S.goTime、goIn）：CROWD-NO-DOOR-1103 起教室門口沒有等的人，拿掉了；同學從大門陸續走進教室照 classes3d.js 的 arriveFrac（syncRooms）*/
  /* ---------- 等的人、聊天的人的小動作（CROWD-CLASS-ARRIVE-1027：「一坨人都不會動」）----------
     每個人每 4～10 秒（真實時間）換一個小動作，只用現有的動畫：轉頭看旁邊的人／和他聊兩句（talk）、手插口袋／拿出來、轉身換個方向（慢慢轉）、偶爾走一兩步再站好（離原本的位置 0.8 m 以內）、回到原本的樣子。
     站著、沒在走的人才動；坐著的、走開的、小公園（spot.people 有自己的安排）不動。每 1.5 秒看一次、一次一群（便宜：不是每一格）。滑手機的動作沒有現成的動畫（要的話是美術缺口）*/
  S.FIDGET=[4,10];
  function fidget(GM,dt){ const E=GM.E;
    for(const id in live){ const L=live[id], spot=S.SPOTS.find(q=>q.id===id); if(!spot||(spot.people&&!spot.fidget)) continue;   /* 小公園的人照 AA 的安排（不加）；體育館站著的人（fidget）也有小動作 */
      const ppl=L.npcs.filter(n=>!n.leaving&&!n.seat&&!n.clsStudent&&!n.fixedPos&&n.beh!=='route'&&n.beh!=='wander'&&!(n.path&&n.path.length)&&E.npcs.includes(n));   /* fixedPos：櫃台後面、跑步機上的人不動；繞路線、走動的人本來就在動 */
      for(const n of ppl){ if(!n.home) n.home={x:n.obj.position.x,z:n.obj.position.z,yaw:n.obj.rotation.y,pose:n.idlePose||'idle'};
        if(n.fidT==null){ n.fidT=S.FIDGET[0]+Math.random()*(S.FIDGET[1]-S.FIDGET[0]); continue; } n.fidT-=dt; if(n.fidT>0) continue; n.fidT=S.FIDGET[0]+Math.random()*(S.FIDGET[1]-S.FIDGET[0]);
        const P=n.obj.position, r=Math.random(); let near=null, bd=1e9; for(const m of ppl){ if(m===n) continue; const d=Math.hypot(m.obj.position.x-P.x,m.obj.position.z-P.z); if(d<bd){ bd=d; near=m; } }
        n.fid=(n.fid|0)+1;
        if(r<0.3&&near&&bd<3.5){ n.lookAt=near.obj.position; n.pose=n.idlePose=(n.pose==='talk'?'idle':'talk'); n.frozen=false; n.faceYaw=Math.atan2(near.obj.position.x-P.x,near.obj.position.z-P.z); }   /* 轉頭看旁邊的人、聊兩句（或停下來聽）*/
        else if(r<0.5){ n.pockets=!n.pockets; }   /* 手插口袋／拿出來 */
        else if(r<0.72){ n.lookAt=null; n.frozen=false; n.faceYaw=n.home.yaw+(Math.random()-0.5)*1.6; }   /* 轉身換個方向（引擎慢慢轉過去）*/
        else if(r<0.88){ const a=Math.random()*Math.PI*2, d=0.3+Math.random()*0.5, x=n.home.x+Math.cos(a)*d, z=n.home.z+Math.sin(a)*d, lv=n.lv|0;   /* 走一兩步（離原本的位置 0.8 m 以內）*/
          if(E.canStand(x,z,0.3,lv)&&E.moveTo&&E.moveTo(n,x,z,()=>{ n.pose=n.idlePose||'idle'; n.faceYaw=n.home.yaw+(Math.random()-0.5)*0.8; },lv)){ n.frozen=false; n.lookAt=null; } }
        else { n.lookAt=null; n.pose=n.idlePose=n.home.pose||n.idlePose||'idle'; n.frozen=false; n.faceYaw=n.home.yaw; } } } }   /* 回到原本的樣子 */
  S.fidget=fidget;   /* 測試用 */
  /* 走到門口或馬路的人：不在玩家眼前就移除（走進建築、走遠了）*/
  function sweep(GM){ const E=GM.E, now=Date.now(); for(const n of E.npcs.slice()){ if(!n.leaving||!n.arrived) continue; if(!inView(E,n.obj.position)||Math.hypot(n.obj.position.x-E.player.obj.position.x,n.obj.position.z-E.player.obj.position.z)>40){ E.removeNPC(n); continue; }
      /* 走到門口、玩家看得到：不要一直站在那一點（好幾個人走到同一點會疊在一起）——3 秒後繼續走出建築，還是走不了就移除 */
      if(!n.arrT) n.arrT=now; else if(now-n.arrT>3000){ const sp=S.SPOTS.find(q=>q.id===n.crowdSpot); if(sp&&!n.toRoad){ n.toRoad=true; n.arrived=false; n.arrT=0; if(!E.moveTo(n,sp.road[0],sp.road[1],()=>{ n.arrived=true; },sp.roadLv!=null?sp.roadLv:(sp.lv|0))) E.removeNPC(n); } else E.removeNPC(n); } } }
  function sync(GM,instant){ const G=GM.G, E=GM.E; for(const spot of S.SPOTS){ if(spot.zone!==G.zone) continue; const slot=S.slotAt(G,spot); const L=live[spot.id];
      if(L&&(!slot||slot.key!==L.slotKey)){ const old=spot.slots(G).find(s=>s.key===L.slotKey)||{}; L.leave=old.leave||'road'; leaveGroup(GM,spot,instant); }
      if(slot&&!live[spot.id]){ const vis=!instant&&inView(E,{x:spot.c[0],z:spot.c[1]})&&Math.hypot(spot.c[0]-E.player.obj.position.x,spot.c[1]-E.player.obj.position.z)<45; spawnGroup(GM,spot,slot,vis); } } }
  /* 進到區域（story3d.js 的 populate 最後呼叫）：照現在的時間直接排好 */
  S.enter=function(GM,zoneId){ for(const k in live) delete live[k]; pend.length=0; zoneNow=zoneId; entering=true; lastH=GM.G.hour; sync(GM,true);
    try{ S.swimTick(GM,0,true); }catch(e){ console.warn('CROWD.swimTick',e); }   /* 游泳池的泳客（ART-GYM-POOL-SWIMMERS-1103）：進場照現在的時間直接放（VRM 已經載好的）*/
    try{ S.deptEnter(GM,zoneId); }catch(e){ console.warn('CROWD.deptEnter',e); } };   /* AA_495：story3d.js 生好的路人（走路的人）一人一句、兩個人的對話 */
  /* 玩家坐著上完課、聽完演講（classes3d.js 的 keepCrowd）：時間是待在這裡過完的，不算「時間跳了」——正在走出去的同學照樣走完（2026-10-13 審查：原本下一次 tick 會把他們一起拿掉）*/
  S.keep=function(G){ lastH=G.hour; };
  /* 轉暗、時間過去以後（classes3d.js：提早坐下上課，先等到上課時間）：照新的時間直接重排門口的人（和「時間跳了」一樣；玩家在黑畫面裡沒看到中間那段）*/
  S.resync=function(GM){ const G=GM.G, E=GM.E; if(!G||G.zone!==zoneNow) return; for(const n of E.npcs.slice()) if(n.crowd&&n.crowd!=='cls') E.removeNPC(n); for(const k in live) delete live[k]; pend.length=0; lastH=G.hour; sync(GM,true); };
  S.tick=function(GM,dt){ const G=GM.G; if(!G||G.zone!==zoneNow) return; entering=false; try{ S.swimTick(GM,dt); }catch(e){ console.warn('CROWD.swimTick',e); }   /* 泳客每一格照 swimLap 游 */ if(pend.length) runPend(GM); tAcc+=dt; if(tAcc<1.5) return; tAcc=0;   /* 課輔班輪到的人出發（每一格看）*/
    const jump=lastH!=null&&Math.abs(G.hour-lastH)>0.2; lastH=G.hour;   /* 時間突然跳了：直接重排 */
    if(jump){ const E=GM.E; for(const n of E.npcs.slice()) if(n.crowd) E.removeNPC(n); for(const k in live) delete live[k]; pend.length=0; sync(GM,true); }   /* 正在走開的人也一起拿掉（玩家沒有看到中間那段時間）*/
    else sync(GM,false);
    if(S.SHOP_ZONES[G.zone]){ try{ S.shopTrim(GM); }catch(e){ console.warn('CROWD.shopTrim',e); } }   /* 店裡：有名字的人走進來、空位不夠時一桌客人先走 */
    fidget(GM,1.5); sweep(GM); };
  S.live=live; S.pend=pend;
  return S;
})();
