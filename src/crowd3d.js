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
   - 教學館室內：時段照那一間教室今天的課（CLS.dayItems）和演講（ACTIVITIES）。上課前 20 分鐘在門口等，開始時走進教室、找空位坐下
     （變成那堂課的同學，下課時和大家一起走出去，classes3d.js syncRooms）；下課後 10 分鐘有人從教室出來、在門口聊一下，再走向出口。
   - 溫州街小公園（AA_283，S.parkSpots）：每個人各自的位置、坐的位子、繞圈的路線（spot.people）；點了說一句（PARK.bindTap）。測試：node tests/wz_park_people_unit.js
   - 路人分科系（AA_495，CROWD-DEPTS-1028）：校園、總圖、社科圖、體育館、公館的路人是「X系的學生」、點了聽一句；兩個人的對話；教學館門口通識、必修的對話（下面 S.dept…，句子在 src/data/crowd_depts.js）。測試：node tests/crowd_depts_unit.js */
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
  S.FDORM_LINES={ week1:['（一個女生拖著兩個行李箱，在門口打電話）「媽，我到了。……對，有電梯。」'], eve:['「她說五分鐘。……我數到第三個五分鐘了。」'],
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
  /* 教學館室內的等候點（layout 的 waitSpots）：door＝教室門裡面一點（下課的人從這裡出來）、road＝建築出口（從這裡進來、走出去）、seatRoom＝走進去坐的那一間 */
  function insideDoor(r){ if(r.kind==='lecture'&&r.door){ const d=r.door, m=(d.a0+d.a1)/2; return d.wall==='W'?[d.x+0.9,m]:(d.wall==='E'?[d.x-0.9,m]:[m,d.z]); }
    if(r.doorFront){ const dz=r.doorZ!=null?r.doorZ:-0.4, ins=(r.z0+r.z1)/2<dz?-1:1; return [(r.doorFront[0]+r.doorFront[1])/2,dz+ins*0.9]; } return [(r.x0+r.x1)/2,(r.z0+r.z1)/2]; }
  S.indoorSpots=function(){ const out=[]; const Ls=[typeof GONGTONG_LAYOUT!=='undefined'?GONGTONG_LAYOUT:null,typeof BOYA_LAYOUT!=='undefined'?BOYA_LAYOUT:null,typeof PUTONG_LAYOUT!=='undefined'?PUTONG_LAYOUT:null].filter(Boolean);
    for(const L of Ls) for(const w of (L.waitSpots||[])){ const r=L.rooms.find(q=>q.id===w.room); if(!r) continue; const ex=L.entrance.exit;
      out.push({ id:L.id+'_'+w.room, zone:L.id, lv:w.lv|0, label:L.name+' '+w.room+' 門口', c:[w.x,w.z], spread:[1.0,0.45], door:insideDoor(r), doorLv:r.lv|0, road:[ex.x,ex.z-0.7], roadLv:0, seatRoom:w.room, mix:true,
        slots(G){ const o=[]; if(typeof CLS!=='undefined') for(const it of CLS.dayItems(G)){ if(it.room.zone!==this.zone||it.room.room!==this.seatRoom) continue;
            o.push({key:'pre|'+it.key,cls:it.key,t0:it.t0-1/3,t1:it.t0,n:[2,4],pose:'idle',talk:0.5,enter:'road',leave:'seat',course:it.c}); o.push({key:'post|'+it.key,t0:it.t1,t1:it.t1+1/6,n:[2,4],pose:'talk',talk:0.8,enter:'door',leave:'road',course:it.c}); }   /* course：AA_495 第 3、4 節（通識、法律系必修的門口）*/
          if(typeof ACTIVITIES!=='undefined') for(const a of ACTIVITIES.list){ if(a.zone!==this.zone||a.room!==this.seatRoom||!ACTIVITIES.on(a,G.day,G)) continue; const k='act:'+a.id+':'+G.day;
            o.push({key:'pre|'+k,cls:k,t0:a.t0-0.25,t1:a.t0,n:[3,6],pose:'talk',talk:0.6,enter:'road',leave:'seat'}); o.push({key:'post|'+k,t0:a.t1,t1:a.t1+0.25,n:[3,6],pose:'talk',talk:0.8,enter:'door',leave:'road'}); }
          return o.sort((p,q)=>p.t0-q.t0); } }); }
    return out; };
  S.SPOTS.push(...S.indoorSpots());
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
     - B1：服務櫃台後面的櫃台阿姨（「去健身房」那幾句是她說的：gym3d.js 的 SAY_DESK）；跑步機上原地跑、深蹲架、啞鈴架前站著、重訓椅上坐著、墊子上拉筋。
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
        return out; },G=>{ const w=wk(G); return daySlots(G,[[0,0],[2,4],[2,4],[4,6]],w?9:12,w?17:21).filter(s=>s.n[1]>0); });
    /* ---- 1F 球場：體育課（玩家自己的體育課上課中）---- */
    const pe=mkSpot('pe','gym',[0,-6],D1,function(G,slot,r){ const sp=specs(r,7,this.ix), out=[]; const c=slot.course;
        out.push(mk(this,slot,0,{x:0,z:-7.9,yaw:0,spec:Object.assign({},(typeof CLS!=='undefined'&&CLS.teacherSpec&&c)?CLS.teacherSpec(c):STORY.extraSpec(sp[0])),role:'pe_teacher',name:(typeof CLS!=='undefined'&&CLS.teacherName&&c)?CLS.teacherName(c):'體育老師',rawSpec:true}));
        [-4.2,-3.0,-1.8,1.8,3.0,4.2].forEach((x,k)=>out.push(mk(this,slot,k+1,{x,z:-6.0+(k%2?0.25:0),yaw:Math.PI,spec:sp[k+1],role:'pe_student',pose:k%3===1?'talk':'idle'})));
        return out; },G=>{ if(typeof CLS==='undefined'||!CLS.dayItems) return []; return CLS.dayItems(G).filter(it=>it.room&&it.room.door==='gym').map(it=>({key:'pe|'+it.key,t0:it.t0-0.5,t1:it.t1,n:[7,7],fixed:true,pose:'idle',talk:0,enter:'door',leave:'door',course:it.c})); });
    /* ---- B1 ---- */
    const TM=eq('GYM_TREADMILL'), SQ=eq('GYM_SQUAT_RACK'), DBR=eq('GYM_DB_RACK'), BN=eq('GYM_BENCH'), MAT=eq('GYM_MAT');
    const fit=[].concat(TM.filter((q,i)=>i%2===0).map(q=>({x:q[0],z:12.2,y:0.18,yaw:0,pose:'run',idlePose:'run',fixed:true,role:'treadmill'})),   /* 跑步機上原地跑（皮帶 0.18 m 高）*/
      SQ.map(q=>({x:q[0],z:+(q[1]-1.2).toFixed(2),yaw:0,role:'rack'})), DBR.map(q=>({x:+(q[0]-0.5).toFixed(2),z:+(q[1]-1.0).toFixed(2),yaw:0,role:'dumbbell'})),
      BN.slice(1,2).map(q=>({x:q[0],z:q[1],yaw:Math.PI/2,role:'bench',seat:{x:q[0],z:q[1],yaw:Math.PI/2}})), MAT.slice(0,2).map(q=>({x:q[0],z:q[1],yaw:0,role:'mat',pose:'talk'})));
    const b1=mkSpot('b1','gym_b1',[-6,9],DB,function(G,slot,r){ const n=cnt(r,slot), sp=specs(r,n+1,this.ix), out=[];
        out.push(mk(this,slot,0,{x:B.desk.staff.x,z:B.desk.staff.z,yaw:0,spec:sp[0]&~1,role:'desk_b1',name:'櫃台阿姨',fixed:true}));   /* 櫃台後面，面向客人（偶數＝女生）*/
        const pick=shuffle(fit,r).slice(0,n); pick.forEach((q,k)=>out.push(mk(this,slot,k+1,Object.assign({spec:sp[k+1]},q))));
        return out; },G=>daySlots(G,[[2,3],[3,4],[2,4],[4,6]]));
    /* ---- 3F 主球場 ---- */
    const HOOP=A.court&&A.court.hoops?A.court.hoops[0]:[0,-14.43];
    const arena=mkSpot('arena','gym_arena',[0,-10],DA,function(G,slot,r){ const n=cnt(r,slot), sp=specs(r,n,this.ix), out=[], np=Math.max(2,n-2);
        for(let k=0;k<np;k++){ const wp=shuffle([[-4.2,-12.2],[4.0,-12.6],[-2.2,-8.4],[2.4,-8.2],[0,-10.6],[-5.0,-9.2],[5.2,-9.6],[0.8,-12.8]],r).slice(0,4).map(q=>[q[0],q[1],0]);
          out.push(mk(this,slot,k,{x:wp[0][0],z:wp[0][1],spec:sp[k],role:'basketball',beh:'route',waypoints:wp,ri:0,walkSpeed:2.8,run:true,pauseAt:true,faceYaw:face([wp[0][0],wp[0][1]],HOOP)})); }
        const REST=[[9.6,-16.8,'talk'],[10.5,-16.2,'idle'],[-9.4,-17.2,'idle']]; for(let k=np;k<n;k++){ const q=REST[(k-np)%REST.length]; out.push(mk(this,slot,k,{x:q[0],z:q[1],yaw:face([q[0],q[1]],[(k-np)===0?10.5:9.6,(k-np)===0?-16.2:-16.8]),spec:sp[k],role:'rest',pose:q[2]})); }
        return out; },G=>{ if(typeof GY3!=='undefined'&&GY3.ceremonyDay&&GY3.ceremonyDay(G)) return []; return daySlots(G,[[2,3],[4,5],[3,5],[6,8]]); });
    for(const sp of [lobby,court,pe,b1,arena]) sp.bind=S.gymBind;
    return [lobby,court,pe,b1,arena]; };
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
  S.gymHearKind=(spot,role)=>spot&&spot.gym==='b1'&&['treadmill','rack','dumbbell','bench','mat'].includes(role)?'fit':(spot&&spot.gym==='lobby'&&role!=='desk_1f'?null:role);
  let gymVisit=null;
  S.gymBind=function(GM,n,p){ const G=GM&&GM.G; if(!G||!n) return; const k=S.gymHearKind(this,p&&p.role), H=k&&S.GYM_HEAR[k]; if(!H){ if(S.deptGymOne) S.deptGymOne(GM,this,n,p); return; }   /* 大廳散步的人、長椅上的人：AA_495 的系 */
    const vk=(GM.enterN|0)+':'+G.zone; if(!gymVisit||gymVisit.key!==vk) gymVisit={key:vk,used:{},start:{}};
    const F=G.flags||(G.flags={}), R=F.gymHear||(F.gymHear={}); if(gymVisit.start[k]==null){ gymVisit.start[k]=R[k]|0; R[k]=((R[k]|0)+1)%H.L.length; }   /* 這一次從第幾句開始；下一次從下一句 */
    const u=gymVisit.used[k]|0; if(u>=H.L.length) return; gymVisit.used[k]=u+1;
    const i=(gymVisit.start[k]+u)%H.L.length, t=H.L[i], w=H.W&&H.W[i], who=w||(k==='pe_teacher'&&n.name?n.name:(k==='desk_b1'&&n.name?n.name:H.who));
    if(w){ n.name=w; n.dept=w.replace(/系的學生$/,''); }   /* AA_495 那三句：說的人是那個系的學生 */
    n.hear={who,t}; n.talkLabel='聽一句'; n.talk=()=>S.overhear(GM,n,[{who,t}]); };
  S.SPOTS.push(...S.gymSpots());
  /* ===== 系籃練球的球場（BBALL-PRESENT-1030；使用者 2026-10-30「系藍練團時間到 根本球場空的」）=====
     校園籃球場（醉月湖東側，zones3d.js 的 bballCourt：半場 15×14、籃框在北邊 (−4,−120.85)；活動點 (3.3,−112.7) 在東邊兩張長椅中間）。
     時段＝系籃練球（activities.js 的 dept_basketball）那一天、那一段：ACTIVITIES.on 成立（大一上第 5～7、10～15 週的週五 17:30～19:00；國定假日照 ACTIVITIES 的規則停練＝沒有人、也沒有參加點），
     做法同體育館 3F 主球場（arena）：6～8 個人在籃框那半場照路線跑一段、停一下、面向籃框；2～3 個人在場邊（記分、送水）。同一天同一批人（日期＋時段當種子），時段結束走到南邊的路走掉。
     路人沒有名字；打球的人點了聽一句（體育館籃球場那一組句子裡沒有指定說話的人那幾句：S.GYM_HEAR.basketball），場邊的人不說話。
     有名字的人（阿哲在場邊、明軒在場上）照作息（characters.js 的 dept_basketball 那一筆），路線不經過他們站的地方、不經過活動點。測試：node tests/bball_present_unit.js */
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
     - 教學館教室門口（第 3、4 節；indoorSpots 的 pre|、post|）：通識（courses.js kind:'general'）各系混著，法律系必修（kind:'required'，經濟系那一年的必修除外）都是法律系；
       最後走進教室的兩個（三個）人出那一段（等的人照順序走進去：S.goTime）。霖澤館 201、萬才館的教室門口沒有等的人（indoorSpots 只有共同、博雅、普通），那裡的第 4 節還沒有。
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
    for(let u=0;u<list.length;u++){ const c=list[(st+u)%list.length], id=pre+c.n; if(used.includes(id)||H[id]===G.day) continue; used.push(id); return c; } return null; };
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
  S.DEPT_SIT={library_hall:1,library:1,soclib:1,gym:1};   /* 一起坐的對話放在哪些區域：總圖大廳（2F 自習區）、總圖 3F 閱覽區、社科圖、體育館 1F。B1 自習室、5F 書庫、研究小間有自己的人（LB1、LUP）和討論室的劇情站位，不放 */
  S.deptSeatPair=function(GM,zone,stand){ const E=GM.E, G=GM.G, seats=(E.zone&&E.zone.seats)||[], N=seats.length; if(!N) return null; const near=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z), keep=(S.DEPT_KEEP[zone]||[]).map(i=>seats[i]);
    const busy=st=>!!st.taken||E.npcs.some(n=>{ const q=n.seat||n.seatTarget||(n.obj&&n.obj.position); return !!q&&(n.lv|0)===(st.lv|0)&&near(q,st)<0.45; })||!!(E.player&&E.player.seat&&near(E.player.seat,st)<0.45);
    const ok=st=>(zone!=='gym'||st.z<11)&&!keep.includes(st)&&!st.label&&!busy(st)&&!!S.seatSide(E,st), yd=(a,b)=>Math.abs(Math.atan2(Math.sin((b.yaw||0)-(a.yaw||0)),Math.cos((b.yaw||0)-(a.yaw||0))));
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
  /* crowd3d 的一群人（S.giveLines 之後）：教學館門口＝第 3、4 節；校園的門口（共同教學館）＝一人一句。自己有句子的地點（女舍、法服、小公園、體育館）不加 */
  S.deptGroup=function(GM,spot,slot,npcs){ const D=DP(); if(!D||!GM||!GM.G||spot.lines||spot.people||!npcs.length) return; const G=GM.G;
    if(spot.seatRoom){ S.deptDoor(GM,spot,slot,npcs); return; }
    if(!S.deptPlace(spot.zone)) return;
    npcs.forEach((n,k)=>{ const d=S.deptPick(G,spot.zone,spot.id+'|'+slot.key,n.deptK!=null?n.deptK:k); if(d) S.deptOne(GM,n,d,n.deptSex,{yield:true}); }); };
  S.deptDoor=function(GM,spot,slot,npcs){ const D=DP(), G=GM.G, c=slot.course, T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; if(!D||!c||!T) return;
    const ph=/^pre\|/.test(slot.key)?'pre':'post', ge=c.kind==='general', law=c.kind==='required'&&!/^Y0/.test(T.id); if(!ge&&!law) return;   /* 經濟系那一年的必修、選修、演講：照舊 */
    const pool=D.DEPTS.filter(d=>!d.mainLib); npcs.forEach((n,k)=>{ const id=law?'法律':S.deptPick(G,spot.zone+'|door',spot.id+'|'+slot.key,n.deptK!=null?n.deptK:k,pool).id; n.dept=id; n.name=S.deptName(id); });   /* 通識各系混著、必修都是法律系 */
    const conv=S.deptTalkPick(GM,(law?'law:':'ge:')+ph,S.deptDoorTalks(G,c,ph,law?D.LAW:D.GE,T),law?'l':'g'); if(!conv) return;
    const k=S.deptSpeakers(conv.d); if(npcs.length<k) return; const ppl=npcs.slice(-k);   /* 最後走進教室的那幾個 */
    S.deptPairTalk(GM,ppl,conv,(law?'l':'g')+conv.n,law?ppl.map(()=>S.deptName('法律')):conv.who.map(S.deptName)); };
  /* 體育館大廳散步的人、長椅上的人（S.gymBind）：體的系 */
  S.deptGymOne=function(GM,spot,n,p){ if(!DP()||!spot||spot.gym!=='lobby'||!p||(p.role!=='walker'&&p.role!=='bench')) return; const ks=String(p.key||'').split('|'), d=S.deptPick(GM.G,spot.zone,spot.id+'|'+(ks[1]||''),+ks[2]||0);
    if(d) S.deptOne(GM,n,d,typeof p.spec==='number'?(p.spec%2===0?'f':'m'):S.npcSex(n),{yield:true}); };
  S.slotAt=function(G,spot,h){ h=h==null?hr(G):h; return spot.slots(G).find(s=>h>=s.t0-1e-6&&h<s.t1)||null; };
  /* 這一天、這個時段的那一群人：人數、位置、朝向、姿勢、外觀（路人編號）都由種子決定（spot.people：每個人的位置由那個地點自己排，小公園）*/
  S.group=function(G,spot,slot){ const r=prng(hash(spot.id+'|'+slot.key+'|'+G.day)); if(spot.people) return spot.people(G,slot,r); const n=Math.round((slot.n[0]+Math.floor(r()*(slot.n[1]-slot.n[0]+1)))*(slot.fixed?1:((typeof STORY!=='undefined'&&STORY.CROWD_X)||1)));   /* 使用者 2026-10-17 P0：路人加倍（STORY.CROWD_X）；fixed：攤位的社員這種固定人數的不加倍 */ const out=[]; const base=1000+Math.floor(r()*500);
    for(let k=0;k<n;k++){ const x=spot.c[0]+(r()-0.5)*2*spot.spread[0], z=spot.c[1]+(r()-0.5)*2*spot.spread[1]; let spec=base+k*(spot.female?2:1); if(spot.female&&spec%2) spec++;   /* extraSpec：偶數＝女生 */
      out.push({x:+x.toFixed(2),z:+z.toFixed(2),spec,pose:r()<slot.talk?'talk':slot.pose}); }
    /* 聊天的人轉向彼此（找最近的另一個人），其他的面向門口或馬路 */
    for(const p of out){ let best=null, bd=1e9; for(const q of out){ if(q===p) continue; const d=Math.hypot(q.x-p.x,q.z-p.z); if(d<bd){ bd=d; best=q; } }
      const tgt=(p.pose==='talk'&&best&&bd<3.2)?[best.x,best.z]:(slot.leave==='door'?spot.door:spot.road); p.yaw=Math.atan2(tgt[0]-p.x,tgt[1]-p.z); }
    return out; };
  // ---------- 遊戲裡 ----------
  const live={};   // spot.id → {slotKey, npcs:[...]}
  let lastH=null, tAcc=0, zoneNow=null;
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
  function spawnPeople(GM,spot,slot,fromDoor){ const E=GM.E, G=GM.G, lv=spot.lv|0, npcs=[]; const grp=S.group(G,spot,slot); const route=slot.pass?S.passRoute(E,spot):null;
    grp.forEach((p,k)=>{ const st=p.seat||null; let d=0;
      if(p.pass){ if(!route) return; d=passD(GM,slot,p,k,fromDoor); if(d>=route.len) return; }   /* 已經走過去了 */
      else if(st){ if(!S.seatSide(E,st)) return; } else if(!p.fixed&&!E.canStand(p.x,p.z,0.3,lv)) return;   /* fixed：照位置放（跑步機上、櫃台後面：導航擋住的地方，人不走動）*/
      const spec=p.rawSpec?Object.assign({},p.spec):STORY.extraSpec(p.spec); if(p.height) spec.height=p.height; if(st&&st.surf!=null) st.lift=Math.max(0,+(st.surf-0.47*(spec.height||1.7)/1.75).toFixed(3));   /* 鞦韆：坐姿的屁股（身高 1.75 m＝0.47 m）抬到座面 */
      const o=CHAR.build(spec); const start=fromDoor&&!p.pass?spot.door:(st?[st.x,st.z]:[p.x,p.z]); o.position.set(start[0],0,start[1]); o.rotation.y=p.yaw||0;
      const n=E.addNPC({obj:o,name:p.name||'',beh:'idle',pose:'idle',idlePose:'idle',isExtra:true,crowd:spot.id,crowdSpot:spot.id,crowdKey:p.key,crowdRole:p.role,frozen:true,walkSpeed:p.walkSpeed||1.15,lv});
      const settle=()=>{ if(st){ sitNPC(GM,n,st); return; } if(p.beh){ n.beh=p.beh; n.waypoints=p.waypoints; n.ri=p.ri|0; n.pauseAt=!!p.pauseAt; n.run=!!p.run; n.frozen=false; n.pose=n.idlePose=p.pose||'idle'; n.timer=0; if(p.faceYaw!=null) n.faceYaw=p.faceYaw; return; }   /* run：跑步（打球）；pauseAt：每一段跑完停 1～4 秒；faceYaw：停下來面向網子、籃框 */
        if(p.fixed){ n.fixedPos=true; if(E.placeAt) E.placeAt(n,p.x,p.z,lv); else n.obj.position.set(p.x,0,p.z); if(p.y) n.obj.position.y+=p.y; }   /* 跑步機的皮帶、櫃台後面（小動作不動他們）*/
        n.frozen=true; n.pose=n.idlePose=p.pose||'idle'; if(p.idlePose) n.idlePose=p.idlePose; n.obj.rotation.y=p.yaw||0; };   /* 跑步機上：pose、idlePose 都是 run（原地跑；引擎停下來時回到 idlePose）*/
      if(p.pass){ const arrive=()=>{ n.passing=false; n.leaving=true; n.arrived=true; }, go=()=>{ n.hidden=false; n.frozen=false; n.passing=true; n.pose='walk'; if(!E.moveTo(n,route.to[0],route.to[1],arrive,lv)) arrive(); };
        if(d>=0){ const q=along(route.pts,d); E.placeAt(n,q[0],q[1],lv); go(); }
        else { E.placeAt(n,route.pts[0][0],route.pts[0][1],lv); n.hidden=true; n.passing=true; pend.push({n,h:slot.t0+(k*PASS_GAP)/passMph(GM,p),go}); } }   /* 還沒輪到他出發：先藏在起點 */
      else if(fromDoor){ const tgt=st?S.seatSide(E,st):[p.x,p.z]; n.frozen=false; n.pose='walk'; if(!E.moveTo(n,tgt[0],tgt[1],settle,lv)){ E.placeAt(n,tgt[0],tgt[1],lv); settle(); } }
      else settle();
      if(spot.bind) spot.bind(GM,n,p);
      npcs.push(n); });
    live[spot.id]={slotKey:slot.key,npcs}; }
  function runPend(GM){ const h=hr(GM.G); for(const q of pend.slice()){ if(h<q.h-1e-9) continue; dropPend(q.n); if(GM.E.npcs.includes(q.n)) q.go(); } }
  function spawnGroup(GM,spot,slot,fromDoor){ if(spot.people) return spawnPeople(GM,spot,slot,fromDoor); const E=GM.E; const grp=S.group(GM.G,spot,slot); const npcs=[]; const lv=spot.lv|0; const h=hr(GM.G);
    for(let k=0;k<grp.length;k++){ const p=grp[k]; if(slot.cls&&h>=S.goTime(slot,k,grp.length)) continue;   /* 已經過了他走進教室的時間（CROWD-CLASS-ARRIVE-1027）：人在教室裡了（classes3d.js 的 syncRooms 照時間坐好），門口不放 */
      if(!E.canStand(p.x,p.z,0.3,lv)) continue; const o=CHAR.build(STORY.extraSpec(p.spec)); const byDoor=slot.enter==='door'; const start=fromDoor?(byDoor?(spot.door2&&p.x>spot.c[0]?spot.door2:spot.door):spot.road):[p.x,p.z];
      const slv=fromDoor?(byDoor?(spot.doorLv|0):(spot.roadLv!=null?spot.roadLv:lv)):lv;   /* 室內：從教室門口（教室那一層）或建築出口（一樓）出來 */
      o.position.set(start[0],0,start[1]); o.rotation.y=p.yaw; const n=E.addNPC({obj:o,name:'',beh:'idle',pose:p.pose,idlePose:p.pose,isExtra:true,crowd:spot.id,crowdSpot:spot.id,frozen:!fromDoor,walkSpeed:1.25,lv:slv,home:{x:p.x,z:p.z,yaw:p.yaw,pose:p.pose}});
      if(slot.cls){ n.crowdCls=slot.cls; n.crowdIdx=k; }   /* 等這一堂課的人：classes3d.js 的 syncRooms 把他算進這堂課的人數（不會多排人從大門進來）；第 k 個人照 S.goTime 走進教室 */
      n.deptK=k; n.deptSex=p.spec%2===0?'f':'m';   /* AA_495：這一群人的第幾個、性別（extraSpec 偶數＝女生）*/
      if(fromDoor){ n.frozen=false; n.pose='walk'; E.moveTo(n,p.x,p.z,()=>{ n.frozen=true; n.pose=p.pose; n.idlePose=p.pose; n.obj.rotation.y=p.yaw; },lv); }
      npcs.push(n); }
    S.giveLines(GM,spot,slot,npcs);
    try{ S.deptGroup(GM,spot,slot,npcs); }catch(e){ console.warn('CROWD.deptGroup',e); }   /* AA_495：路人的系、教室門口的對話 */
    live[spot.id]={slotKey:slot.key,npcs,n:grp.length}; }
  /* 點了可以聽一句的路人（spot.lines(G,slot)＝這個時段的句子；一句給一個人，allTalk＝每個人都是同一串）*/
  S.giveLines=function(GM,spot,slot,npcs){ if(!spot.lines) return []; const L=spot.lines(GM.G,slot)||[]; const out=[];
    npcs.forEach((n,k)=>{ const sc=spot.allTalk?L[0]:L[k]; if(!sc) return; n.talkLabel=spot.talkLabel||'聽一句'; n.talk=()=>S.overhear(GM,n,sc); out.push(n); }); return out; };
  /* 走進教室、找空位坐下（室內的「上課前在門口等」）：坐下以後就是那堂課的同學（clsStudent），下課時 classes3d.js 讓大家一起走出去 */
  function freeSeat(E,room,used){ const seats=(E.zone&&E.zone.seats||[]).filter(q=>q.room===room&&(q.kind==='class'||q.kind==='lecture'));
    for(const q of seats){ if(used.has(q)||q.taken) continue;   /* taken：替身坐的位子 */ if(E.npcs.some(n=>n.seat&&Math.hypot(n.seat.x-q.x,n.seat.z-q.z)<0.35)) continue; const P=E.player; if(P&&P.seat&&Math.hypot(P.seat.x-q.x,P.seat.z-q.z)<0.35) continue; return q; } return null; }
  S.seatSide=function(E,st){ const yaw=st.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw), lv=st.lv|0;   /* 坐下前站的位置（和 GAME.seatApproach 同一組候選，不看玩家的位置）*/
    if(st.ap&&E.canStand(st.ap[0],st.ap[1],0.3,lv)) return [st.ap[0],st.ap[1]];   /* 座位指定的走近點（Café 的沙發）*/
    for(const [dx,dz] of [[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[fx*0.5,fz*0.5],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]]){ const x=st.x+dx, z=st.z+dz; if(!E.canStand(x,z,0.3,lv)) continue; if(st.y!=null&&Math.abs(E.heightAt(x,z,lv)-st.y)>0.2) continue; return [x,z]; } return null; };
  function sitDown(n,st){ const o=n.obj.position; o.set(st.x,st.y!=null?st.y:o.y,st.z); n.obj.rotation.y=st.yaw||0; n.seat=st; n.pose='sit'; n.idlePose='sit'; n.frozen=true; n.path=null; }
  /* 走進教室、找空位坐下（成為那堂課的同學：clsStudent、clsKey）；沒有空位或走不到＝false */
  function toSeat(GM,spot,cls,n,used){ const E=GM.E; const st=freeSeat(E,spot.seatRoom,used), ap=st&&S.seatSide(E,st); if(!st||!ap) return false; used.add(st);
    n.frozen=false; n.pose='walk'; n.lookAt=null; n.faceYaw=null; n.crowd=null; n.clsStudent=true; n.clsKey=cls; n.seat=st;
    if(E.moveTo(n,ap[0],ap[1],()=>sitDown(n,st),st.lv|0)) return true; n.seat=null; n.clsStudent=false; return false; }
  /* 走出建築（或走去門口、馬路）：走開的人不能再點、不再東張西望 */
  function walkAwayCrowd(GM,spot,n,leave){ const E=GM.E; const toRoad=leave==='road'||leave==='seat';   /* 'seat' 走到這裡＝沒有空位：走出建築（2026-10-18 使用者「博雅 101 有人看起來很可怕」：開始上課同學已經坐滿，等在門口的人全部走到教室門口那一點停下來疊成一團）*/
    const tgt=toRoad?spot.road:(spot.door2&&n.obj.position.x>spot.c[0]?spot.door2:spot.door), tlv=toRoad?(spot.roadLv!=null?spot.roadLv:(spot.lv|0)):(spot.doorLv!=null?spot.doorLv:(spot.lv|0)); n.frozen=false; n.leaving=true; n.pose='walk'; n.clsStudent=false; n.lookAt=null; n.faceYaw=null;
    if(!E.moveTo(n,tgt[0],tgt[1],()=>{ n.arrived=true; },tlv)) n.arrived=true; }
  function leaveGroup(GM,spot,instant){ const E=GM.E, L=live[spot.id]; if(!L) return; delete live[spot.id]; const used=new Set();
    for(const n of L.npcs){ if(!E.npcs.includes(n)) continue; n.talk=null; n.talkLabel=null; if(instant){ dropPend(n); E.removeNPC(n); continue; }   /* 走開的人不能再點（D7、D9）*/
      if(spot.people){ if(n.hidden){ dropPend(n); E.removeNPC(n); continue; } if(n.passing) continue; if(n.seat) standNPC(E,n); n.beh='idle'; n.waypoints=null; n.held=false; n.lookAt=null; n.run=false; n.faceYaw=null; n.idlePose='idle'; }   /* 打球的不再跑、跑步機上的不再原地跑（體育館）*/   /* 小公園：還沒出發的課輔班拿掉、正在走的照走；坐著的先站起來、繞圈和走動的停下來，再走出公園 */
      if(L.leave==='seat'&&toSeat(GM,spot,L.cls,n,used)) continue;
      walkAwayCrowd(GM,spot,n,L.leave); } }
  /* ---------- 上課前 10 分鐘起，門口等的人分批走進教室（CROWD-CLASS-ARRIVE-1027；使用者 2026-10-27「博雅上課門口為什麼一坨人都不會動 開始上課教室突然出現更多人已經坐在位置上?」）----------
     原本全部等到開始上課那一刻才一起走進去。改成：一群 n 個人，第 k 個在「開始前 10 分鐘＋(k＋½)×10 分鐘／n」走進教室找空位坐下（和 classes3d.js 的 arriveFrac 同一段時間：開始前 10 分鐘起陸續進來）；
     到了開始上課還在門口的（同一時間到的）照舊一起進去；沒有空位走出建築。 */
  S.GO_LEAD=1/6;
  S.goTime=(slot,k,n)=>slot.t1-S.GO_LEAD+(k+0.5)*S.GO_LEAD/Math.max(1,n);
  function goIn(GM,spot,slot,L){ const h=hr(GM.G), E=GM.E; let used=null;
    for(const n of L.npcs.slice()){ if(n.crowdIdx==null||h<S.goTime(slot,n.crowdIdx,L.n||L.npcs.length)) continue; L.npcs.splice(L.npcs.indexOf(n),1); if(!E.npcs.includes(n)) continue; n.talk=null; n.talkLabel=null; if(n.deptPair) S.deptUntalk(n);   /* AA_495：一起說話的人有一個走進去了，那一段就不能點 */
      used=used||new Set(); if(toSeat(GM,spot,slot.cls,n,used)) continue; walkAwayCrowd(GM,spot,n,'seat'); } }
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
      if(L&&(!slot||slot.key!==L.slotKey)){ const old=spot.slots(G).find(s=>s.key===L.slotKey)||{}; L.leave=old.leave||'road'; L.cls=old.cls; leaveGroup(GM,spot,instant); }
      if(slot&&!live[spot.id]){ const vis=!instant&&inView(E,{x:spot.c[0],z:spot.c[1]})&&Math.hypot(spot.c[0]-E.player.obj.position.x,spot.c[1]-E.player.obj.position.z)<45; spawnGroup(GM,spot,slot,vis); }
      else if(slot&&slot.cls&&live[spot.id]&&!instant) goIn(GM,spot,slot,live[spot.id]); } }   /* 上課前 10 分鐘起分批走進教室 */
  /* 進到區域（story3d.js 的 populate 最後呼叫）：照現在的時間直接排好 */
  S.enter=function(GM,zoneId){ for(const k in live) delete live[k]; pend.length=0; zoneNow=zoneId; lastH=GM.G.hour; sync(GM,true);
    try{ S.deptEnter(GM,zoneId); }catch(e){ console.warn('CROWD.deptEnter',e); } };   /* AA_495：story3d.js 生好的路人（走路的人）一人一句、兩個人的對話 */
  /* 玩家坐著上完課、聽完演講（classes3d.js 的 keepCrowd）：時間是待在這裡過完的，不算「時間跳了」——正在走出去的同學照樣走完（2026-10-13 審查：原本下一次 tick 會把他們一起拿掉）*/
  S.keep=function(G){ lastH=G.hour; };
  /* 轉暗、時間過去以後（classes3d.js：提早坐下上課，先等到上課時間）：照新的時間直接重排門口的人（和「時間跳了」一樣；玩家在黑畫面裡沒看到中間那段）*/
  S.resync=function(GM){ const G=GM.G, E=GM.E; if(!G||G.zone!==zoneNow) return; for(const n of E.npcs.slice()) if(n.crowd&&n.crowd!=='cls') E.removeNPC(n); for(const k in live) delete live[k]; pend.length=0; lastH=G.hour; sync(GM,true); };
  S.tick=function(GM,dt){ const G=GM.G; if(!G||G.zone!==zoneNow) return; if(pend.length) runPend(GM); tAcc+=dt; if(tAcc<1.5) return; tAcc=0;   /* 課輔班輪到的人出發（每一格看）*/
    const jump=lastH!=null&&Math.abs(G.hour-lastH)>0.2; lastH=G.hour;   /* 時間突然跳了：直接重排 */
    if(jump){ const E=GM.E; for(const n of E.npcs.slice()) if(n.crowd) E.removeNPC(n); for(const k in live) delete live[k]; pend.length=0; sync(GM,true); }   /* 正在走開的人也一起拿掉（玩家沒有看到中間那段時間）*/
    else sync(GM,false);
    fidget(GM,1.5); sweep(GM); };
  S.live=live; S.pend=pend;
  return S;
})();
