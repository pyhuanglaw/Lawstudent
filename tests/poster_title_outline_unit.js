// 海報片名在淺色底也看得到（BB 11-10 19:15 P2：白字在 m2801b、m2809b、m3007b 等淺色海報上幾乎看不見）——不需要瀏覽器。
// 檢查：S.drawPoster 先用深色描邊（strokeText）再填白字（fillText），位置一樣；沒有片名就不畫字。修改前：1 FAIL。
const fs=require('fs'), path=require('path'), vm=require('vm');
let fail=0; const check=(n,ok,x)=>{ console.log((ok?'PASS ':'FAIL ')+n+(x&&!ok?'　'+x:'')); if(!ok) fail++; };
const calls=[]; const ctx=new Proxy({},{ get:(o,k)=>{ if(k in o) return o[k]; if(['drawImage','fillText','strokeText'].includes(k)) return (...a)=>calls.push([k,a.slice(0,3)]); if(k==='measureText') return t=>({width:String(t).length*30}); return undefined; }, set:(o,k,v)=>{ o[k]=v; calls.push(['set:'+String(k),[v]]); return true; } });
const sandbox={ console, document:{ createElement:()=>({ getContext:()=>ctx }) }, THREE:{}, setTimeout, Promise };
sandbox.globalThis=sandbox; vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','src','movies3d.js'),'utf8')+'\n;globalThis.__M=MOVIES;',sandbox,{filename:'movies3d.js'});
const S=sandbox.__M;
check('0 找得到 drawPoster',!!S&&typeof S.drawPoster==='function');
if(S){ S.drawPoster({},'律師不在');
  const st=calls.findIndex(c=>c[0]==='strokeText'), fi=calls.findIndex(c=>c[0]==='fillText');
  const lw=calls.filter(c=>c[0]==='set:lineWidth').map(c=>c[1][0]).pop(), ss=calls.filter(c=>c[0]==='set:strokeStyle').map(c=>c[1][0]).pop();
  check('1 先深色描邊再填白字、同一個位置',st>=0&&fi>st&&JSON.stringify(calls[st][1])===JSON.stringify(calls[fi][1]),JSON.stringify(calls.filter(c=>/Text/.test(c[0]))));
  check('1 描邊夠粗、是深色',lw>=4&&/rgba\(0,0,0,0\.[6-9]/.test(String(ss)),JSON.stringify({lw,ss}));
  calls.length=0; S.drawPoster({},''); check('2 沒有片名：不畫字',!calls.some(c=>/Text$/.test(c[0])));
}
console.log(fail?`FAILED ${fail}`:'ALL PASS'); process.exit(fail?1:0);
