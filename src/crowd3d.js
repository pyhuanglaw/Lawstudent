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
   - 溫州街小公園（AA_283，S.parkSpots）：每個人各自的位置、坐的位子、繞圈的路線（spot.people）；點了說一句（PARK.bindTap）。測試：node tests/wz_park_people_unit.js */
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
            o.push({key:'pre|'+it.key,cls:it.key,t0:it.t0-1/3,t1:it.t0,n:[2,4],pose:'idle',talk:0.5,enter:'road',leave:'seat'}); o.push({key:'post|'+it.key,t0:it.t1,t1:it.t1+1/6,n:[2,4],pose:'talk',talk:0.8,enter:'door',leave:'road'}); }
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
      else if(st){ if(!S.seatSide(E,st)) return; } else if(!E.canStand(p.x,p.z,0.3,lv)) return;
      const spec=STORY.extraSpec(p.spec); if(p.height) spec.height=p.height; if(st&&st.surf!=null) st.lift=Math.max(0,+(st.surf-0.47*(spec.height||1.7)/1.75).toFixed(3));   /* 鞦韆：坐姿的屁股（身高 1.75 m＝0.47 m）抬到座面 */
      const o=CHAR.build(spec); const start=fromDoor&&!p.pass?spot.door:(st?[st.x,st.z]:[p.x,p.z]); o.position.set(start[0],0,start[1]); o.rotation.y=p.yaw||0;
      const n=E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',isExtra:true,crowd:spot.id,crowdSpot:spot.id,crowdKey:p.key,crowdRole:p.role,frozen:true,walkSpeed:p.walkSpeed||1.15,lv});
      const settle=()=>{ if(st){ sitNPC(GM,n,st); return; } if(p.beh){ n.beh=p.beh; n.waypoints=p.waypoints; n.ri=p.ri|0; n.pauseAt=false; n.frozen=false; n.pose=n.idlePose=p.pose||'idle'; n.timer=0; return; } n.frozen=true; n.pose=n.idlePose=p.pose||'idle'; n.obj.rotation.y=p.yaw||0; };
      if(p.pass){ const arrive=()=>{ n.passing=false; n.leaving=true; n.arrived=true; }, go=()=>{ n.hidden=false; n.frozen=false; n.passing=true; n.pose='walk'; if(!E.moveTo(n,route.to[0],route.to[1],arrive,lv)) arrive(); };
        if(d>=0){ const q=along(route.pts,d); E.placeAt(n,q[0],q[1],lv); go(); }
        else { E.placeAt(n,route.pts[0][0],route.pts[0][1],lv); n.hidden=true; n.passing=true; pend.push({n,h:slot.t0+(k*PASS_GAP)/passMph(GM,p),go}); } }   /* 還沒輪到他出發：先藏在起點 */
      else if(fromDoor){ const tgt=st?S.seatSide(E,st):[p.x,p.z]; n.frozen=false; n.pose='walk'; if(!E.moveTo(n,tgt[0],tgt[1],settle,lv)){ E.placeAt(n,tgt[0],tgt[1],lv); settle(); } }
      else settle();
      if(spot.bind) spot.bind(GM,n,p);
      npcs.push(n); });
    live[spot.id]={slotKey:slot.key,npcs}; }
  function runPend(GM){ const h=hr(GM.G); for(const q of pend.slice()){ if(h<q.h-1e-9) continue; dropPend(q.n); if(GM.E.npcs.includes(q.n)) q.go(); } }
  function spawnGroup(GM,spot,slot,fromDoor){ if(spot.people) return spawnPeople(GM,spot,slot,fromDoor); const E=GM.E; const grp=S.group(GM.G,spot,slot); const npcs=[]; const lv=spot.lv|0;
    for(const p of grp){ if(!E.canStand(p.x,p.z,0.3,lv)) continue; const o=CHAR.build(STORY.extraSpec(p.spec)); const byDoor=slot.enter==='door'; const start=fromDoor?(byDoor?(spot.door2&&p.x>spot.c[0]?spot.door2:spot.door):spot.road):[p.x,p.z];
      const slv=fromDoor?(byDoor?(spot.doorLv|0):(spot.roadLv!=null?spot.roadLv:lv)):lv;   /* 室內：從教室門口（教室那一層）或建築出口（一樓）出來 */
      o.position.set(start[0],0,start[1]); o.rotation.y=p.yaw; const n=E.addNPC({obj:o,name:'',beh:'idle',pose:p.pose,idlePose:p.pose,isExtra:true,crowd:spot.id,crowdSpot:spot.id,frozen:!fromDoor,walkSpeed:1.25,lv:slv});
      if(fromDoor){ n.frozen=false; n.pose='walk'; E.moveTo(n,p.x,p.z,()=>{ n.frozen=true; n.pose=p.pose; n.idlePose=p.pose; n.obj.rotation.y=p.yaw; },lv); }
      npcs.push(n); }
    S.giveLines(GM,spot,slot,npcs);
    live[spot.id]={slotKey:slot.key,npcs}; }
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
  function leaveGroup(GM,spot,instant){ const E=GM.E, L=live[spot.id]; if(!L) return; delete live[spot.id]; const used=new Set();
    for(const n of L.npcs){ if(!E.npcs.includes(n)) continue; n.talk=null; n.talkLabel=null; if(instant){ dropPend(n); E.removeNPC(n); continue; }   /* 走開的人不能再點（D7、D9）*/
      if(spot.people){ if(n.hidden){ dropPend(n); E.removeNPC(n); continue; } if(n.passing) continue; if(n.seat) standNPC(E,n); n.beh='idle'; n.waypoints=null; n.held=false; n.lookAt=null; }   /* 小公園：還沒出發的課輔班拿掉、正在走的照走；坐著的先站起來、繞圈和走動的停下來，再走出公園 */
      if(L.leave==='seat'){ const st=freeSeat(E,spot.seatRoom,used), ap=st&&S.seatSide(E,st); if(st&&ap){ used.add(st); n.frozen=false; n.pose='walk'; n.crowd=null; n.clsStudent=true; n.clsKey=L.cls; n.seat=st;
          if(E.moveTo(n,ap[0],ap[1],()=>sitDown(n,st),st.lv|0)) continue; n.seat=null; } }
      /* 沒有空位或走不到：走出建築（2026-10-18 使用者「博雅 101 有人看起來很可怕」：開始上課同學已經坐滿（classes3d.js syncRoom full），等在門口的人全部走到教室門口那一點停下來疊成一團）*/
      const noSeat=L.leave==='seat';
      const tgt=(L.leave==='road'||noSeat?spot.road:(spot.door2&&n.obj.position.x>spot.c[0]?spot.door2:spot.door)), tlv=(L.leave==='road'||noSeat)?(spot.roadLv!=null?spot.roadLv:(spot.lv|0)):(spot.doorLv!=null?spot.doorLv:(spot.lv|0)); n.frozen=false; n.leaving=true; n.pose='walk'; n.clsStudent=false;
      if(!E.moveTo(n,tgt[0],tgt[1],()=>{ n.arrived=true; },tlv)) n.arrived=true; } }
  /* 走到門口或馬路的人：不在玩家眼前就移除（走進建築、走遠了）*/
  function sweep(GM){ const E=GM.E, now=Date.now(); for(const n of E.npcs.slice()){ if(!n.leaving||!n.arrived) continue; if(!inView(E,n.obj.position)||Math.hypot(n.obj.position.x-E.player.obj.position.x,n.obj.position.z-E.player.obj.position.z)>40){ E.removeNPC(n); continue; }
      /* 走到門口、玩家看得到：不要一直站在那一點（好幾個人走到同一點會疊在一起）——3 秒後繼續走出建築，還是走不了就移除 */
      if(!n.arrT) n.arrT=now; else if(now-n.arrT>3000){ const sp=S.SPOTS.find(q=>q.id===n.crowdSpot); if(sp&&!n.toRoad){ n.toRoad=true; n.arrived=false; n.arrT=0; if(!E.moveTo(n,sp.road[0],sp.road[1],()=>{ n.arrived=true; },sp.roadLv!=null?sp.roadLv:(sp.lv|0))) E.removeNPC(n); } else E.removeNPC(n); } } }
  function sync(GM,instant){ const G=GM.G, E=GM.E; for(const spot of S.SPOTS){ if(spot.zone!==G.zone) continue; const slot=S.slotAt(G,spot); const L=live[spot.id];
      if(L&&(!slot||slot.key!==L.slotKey)){ const old=spot.slots(G).find(s=>s.key===L.slotKey)||{}; L.leave=old.leave||'road'; L.cls=old.cls; leaveGroup(GM,spot,instant); }
      if(slot&&!live[spot.id]){ const vis=!instant&&inView(E,{x:spot.c[0],z:spot.c[1]})&&Math.hypot(spot.c[0]-E.player.obj.position.x,spot.c[1]-E.player.obj.position.z)<45; spawnGroup(GM,spot,slot,vis); } } }
  /* 進到區域（story3d.js 的 populate 最後呼叫）：照現在的時間直接排好 */
  S.enter=function(GM,zoneId){ for(const k in live) delete live[k]; pend.length=0; zoneNow=zoneId; lastH=GM.G.hour; sync(GM,true); };
  /* 玩家坐著上完課、聽完演講（classes3d.js 的 keepCrowd）：時間是待在這裡過完的，不算「時間跳了」——正在走出去的同學照樣走完（2026-10-13 審查：原本下一次 tick 會把他們一起拿掉）*/
  S.keep=function(G){ lastH=G.hour; };
  S.tick=function(GM,dt){ const G=GM.G; if(!G||G.zone!==zoneNow) return; if(pend.length) runPend(GM); tAcc+=dt; if(tAcc<1.5) return; tAcc=0;   /* 課輔班輪到的人出發（每一格看）*/
    const jump=lastH!=null&&Math.abs(G.hour-lastH)>0.2; lastH=G.hour;   /* 時間突然跳了：直接重排 */
    if(jump){ const E=GM.E; for(const n of E.npcs.slice()) if(n.crowd) E.removeNPC(n); for(const k in live) delete live[k]; pend.length=0; sync(GM,true); }   /* 正在走開的人也一起拿掉（玩家沒有看到中間那段時間）*/
    else sync(GM,false);
    sweep(GM); };
  S.live=live; S.pend=pend;
  return S;
})();
