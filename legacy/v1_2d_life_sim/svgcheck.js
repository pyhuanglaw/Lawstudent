const fs=require('fs'); const vm=require('vm');
const code=fs.readFileSync(__dirname+'/all.js','utf8'); const store={};
const el={innerHTML:'', textContent:'', classList:{toggle(){},add(){},remove(){}}, value:'', select(){}, remove(){}};
const ctx={ console, setInterval:()=>0, clearInterval(){}, setTimeout:()=>0, clearTimeout(){}, Math, Date, JSON, Object, Array, String, Number,
  document:{ getElementById:()=>el, querySelector:()=>null, createElement:()=>({...el}), body:{appendChild(){}} },
  localStorage:{ getItem:k=>store[k]==null?null:store[k], setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];} },
  navigator:{ clipboard:{ writeText:()=>Promise.resolve() } }, window:{}, event:{} }; ctx.window=ctx; vm.createContext(ctx); vm.runInContext(code,ctx);
const S=ctx; S.newGame({name:'測試',look:{skin:1,hair:0,hairStyle:2,top:0},bg:'family'});
const scenes=['dorm','library','classroom','campus','cafe','street','home','park','store','firm','myfirm','court','chambers','prosec','meeting','apt','restaurant','abroadClass','abroadHome','abroadStreet','abroadTravel'];
const out=[]; for(const sc of scenes) for(const pose of ['stand','sit','read','type','walk','sleep','coffee']) out.push(S.sceneSVG(sc,pose,{with:'an'}));
out.push(S.avatarSVG('you',40)); out.push(S.avatarSVG('an',40));
fs.writeFileSync('svgs.txt',out.join('\n@@\n'));
console.log('generated',out.length);
