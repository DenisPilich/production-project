/**
 * Наблюдение за скелетоном в первые миллисекунды: когда именно появляется/исчезает.
 */
const { spawn } = require("child_process");
const http = require("http");
const crypto = require("crypto");
const net = require("net");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9350;
const BASE = "http://127.0.0.1:3000";

function wsConnect(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const key = crypto.randomBytes(16).toString("base64");
    const sock = net.connect(Number(u.port), u.hostname, () =>
      sock.write(`GET ${u.pathname} HTTP/1.1\r\nHost: ${u.host}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`));
    let hs=false,buf=Buffer.alloc(0);const handlers=[];
    const api={send(obj){const d=Buffer.from(JSON.stringify(obj)),len=d.length;let h;
      if(len<126)h=Buffer.from([0x81,0x80|len]);
      else if(len<65536){h=Buffer.alloc(4);h[0]=0x81;h[1]=0x80|126;h.writeUInt16BE(len,2);}
      else{h=Buffer.alloc(10);h[0]=0x81;h[1]=0x80|127;h.writeBigUInt64BE(BigInt(len),2);}
      const m=crypto.randomBytes(4),p=Buffer.alloc(len);
      for(let i=0;i<len;i++)p[i]=d[i]^m[i%4];
      sock.write(Buffer.concat([h,m,p]));},
      onMessage(fn){handlers.push(fn);},close(){sock.destroy();}};
    sock.on("data",(c)=>{buf=Buffer.concat([buf,c]);
      if(!hs){const i=buf.indexOf("\r\n\r\n");if(i===-1)return;
        if(!/101/.test(buf.slice(0,i).toString()))return reject(new Error("hs"));
        buf=buf.slice(i+4);hs=true;resolve(api);}
      for(;;){if(buf.length<2)break;const b0=buf[0],b1=buf[1];let len=b1&0x7f,off=2;
        if(len===126){if(buf.length<4)break;len=buf.readUInt16BE(2);off=4;}
        else if(len===127){if(buf.length<10)break;len=Number(buf.readBigUInt64BE(2));off=10;}
        if(buf.length<off+len)break;
        const pl=buf.slice(off,off+len);buf=buf.slice(off+len);
        if((b0&0x0f)===1)handlers.forEach(f=>f(pl.toString("utf8")));}});
    sock.on("error",reject);
  });
}
const getJSON=(p)=>new Promise((res,rej)=>{http.get({host:"127.0.0.1",port:PORT,path:p},(r)=>{let d="";r.on("data",c=>d+=c);r.on("end",()=>{try{res(JSON.parse(d));}catch(e){rej(e);}});}).on("error",rej);});
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));

(async () => {
  const udd = process.env.TEMP + "\\chrome-tl-" + Date.now();
  const chrome = spawn(CHROME, ["--headless=new","--disable-gpu","--no-sandbox","--no-first-run",
    "--no-default-browser-check","--disable-dev-shm-usage","--remote-debugging-port="+PORT,
    "--user-data-dir="+udd,"about:blank"], { stdio:["ignore","ignore","pipe"] });
  let v=null;
  for(let i=0;i<40;i++){try{v=await getJSON("/json/version");break;}catch{await sleep(500);}}
  if(!v){console.log("CHROME_FAILED");chrome.kill();process.exit(1);}
  const list=await getJSON("/json/list");
  const ws=await wsConnect(list.find(t=>t.type==="page").webSocketDebuggerUrl);
  let id=0;const pending=new Map();
  let respTime=null;
  ws.onMessage((t)=>{const m=JSON.parse(t);
    if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);return;}
    if(m.method==="Network.responseReceived" && /\/notifications/.test(m.params.response.url))
      respTime = Date.now();
  });
  const cmd=(method,params={})=>new Promise((res)=>{const mid=++id;pending.set(mid,res);ws.send({id:mid,method,params});});
  const js=async(e)=>{const r=await cmd("Runtime.evaluate",{returnByValue:true,expression:e});
    if(r.result&&r.result.exceptionDetails)return{__error:1};return r.result?.result?.value;};

  await cmd("Runtime.enable");await cmd("Page.enable");await cmd("Network.enable");
  await cmd("Emulation.setDeviceMetricsOverride",{width:1920,height:1080,deviceScaleFactor:1,mobile:false});
  await cmd("Page.navigate",{url:BASE+"/"});await sleep(4000);
  const user=JSON.stringify({id:"1",username:"admin",roles:["ADMIN"]});
  await cmd("Runtime.evaluate",{expression:`localStorage.setItem('user', ${JSON.stringify(user)}); 'ok'`});
  await cmd("Page.reload");
  await sleep(6000);

  // Устанавливаем в странице наблюдатель, который фиксирует появление скелетонов и данных
  await cmd("Runtime.evaluate",{expression:`
    window.__log = [];
    (function(){
      var t0 = performance.now();
      function sample(){
        var root = document.getElementById('root');
        var divs = root ? Array.from(root.querySelectorAll('div')) : [];
        var sk = divs.filter(function(d){ var r=d.getBoundingClientRect();
          return Math.round(r.height)===80 && r.width>150 && !d.textContent; }).length;
        var data = root ? /Новый комментарий|Статья опубликована/.test(root.innerText) : false;
        window.__log.push({ t: Math.round(performance.now()-t0), sk: sk, data: data });
        if (performance.now()-t0 < 15000) requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
    })();
    'armed'
  `});

  // открываем поповер
  await js(`(() => { const b=document.querySelectorAll('header button')[0]; if(b) b.click(); return 1; })()`);
  await sleep(6000);

  const log = await js(`window.__log`);
  // Найдём переходы
  let firstSkel=null, lastSkel=null, firstData=null, maxSkel=0;
  (log||[]).forEach(function(s){
    if (s.sk>0) { if(firstSkel===null) firstSkel=s.t; lastSkel=s.t; if(s.sk>maxSkel)maxSkel=s.sk; }
    if (s.data && firstData===null) firstData=s.t;
  });
  console.log("=== ХРОНОЛОГИЯ ===");
  console.log("первое появление скелетонов:", firstSkel, "мс");
  console.log("последнее появление скелетонов:", lastSkel, "мс");
  console.log("макс. кол-во скелетонов:", maxSkel);
  console.log("данные появились:", firstData, "мс");
  console.log("скелетоны видны, мс:", (firstSkel!==null&&lastSkel!==null)?(lastSkel-firstSkel):"n/a");

  // Первые 20 сэмплов
  console.log("\n=== первые сэмплы (t, скелетоны, данные) ===");
  (log||[]).slice(0,22).forEach(function(s){ console.log(s.t+"ms  sk="+s.sk+"  data="+s.data); });

  ws.close();chrome.kill();await sleep(400);process.exit(0);
})().catch(e=>{console.log("ERR:",e.message);process.exit(1);});
