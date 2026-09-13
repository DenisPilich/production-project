/**
 * Наблюдение за поповером уведомлений во времени: панель, скелетоны, данные.
 */
const { spawn } = require("child_process");
const http = require("http");
const crypto = require("crypto");
const net = require("net");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9349;
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
  const udd = process.env.TEMP + "\\chrome-obs-" + Date.now();
  const chrome = spawn(CHROME, ["--headless=new","--disable-gpu","--no-sandbox","--no-first-run",
    "--no-default-browser-check","--disable-dev-shm-usage","--remote-debugging-port="+PORT,
    "--user-data-dir="+udd,"about:blank"], { stdio:["ignore","ignore","pipe"] });
  let v=null;
  for(let i=0;i<40;i++){try{v=await getJSON("/json/version");break;}catch{await sleep(500);}}
  if(!v){console.log("CHROME_FAILED");chrome.kill();process.exit(1);}
  const list=await getJSON("/json/list");
  const ws=await wsConnect(list.find(t=>t.type==="page").webSocketDebuggerUrl);
  let id=0;const pending=new Map();
  const apiUrls=[];
  ws.onMessage((t)=>{const m=JSON.parse(t);
    if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);return;}
    if(m.method==="Network.requestWillBeSent"){
      const u=m.params.request.url;
      if(/localhost:8000/.test(u)) apiUrls.push(u.replace('http://localhost:8000',''));
    }
  });
  const cmd=(method,params={})=>new Promise((res)=>{const mid=++id;pending.set(mid,res);ws.send({id:mid,method,params});});
  const js=async(e)=>{const r=await cmd("Runtime.evaluate",{returnByValue:true,expression:e});
    if(r.result&&r.result.exceptionDetails)return{__error:JSON.stringify(r.result.exceptionDetails).slice(0,200)};
    return r.result?.result?.value;};

  await cmd("Runtime.enable");await cmd("Page.enable");await cmd("Network.enable");
  await cmd("Emulation.setDeviceMetricsOverride",{width:1920,height:1080,deviceScaleFactor:1,mobile:false});
  await cmd("Page.navigate",{url:BASE+"/"});await sleep(4000);
  const user=JSON.stringify({id:"1",username:"admin",roles:["ADMIN"]});
  await cmd("Runtime.evaluate",{expression:`localStorage.setItem('user', ${JSON.stringify(user)}); 'ok'`});
  // ВАЖНО: перезагружаем, чтобы приложение подняло авторизацию из localStorage
  await cmd("Page.reload");
  await sleep(6000);

  // Смотрим иконки в шапке, чтобы найти колокольчик
  const icons = await js(`(() => {
    const btns = Array.from(document.querySelectorAll('header button'));
    return btns.map(function(b,i){
      const s = b.querySelector('svg');
      const paths = s ? Array.from(s.querySelectorAll('path')).map(p=>(p.getAttribute('d')||'').slice(0,25)) : [];
      return { i: i, hasSvg: !!s, paths: paths, text: (b.textContent||'').trim().slice(0,15) };
    });
  })()`);
  console.log("=== кнопки в шапке ===");
  console.log(JSON.stringify(icons, null, 2));

  // Кликаем по первой кнопке с svg (кандидат — колокольчик)
  const label = 'клик по кнопке #0';
  await js(`(() => { const b=document.querySelectorAll('header button')[0]; if(b) b.click(); return 1; })()`);
  console.log("\n=== " + label + " ===");

  const probe = `(() => {
    const root = document.getElementById('root');
    const divs = Array.from(root.querySelectorAll('div'));
    const sk = divs.filter(function(d){ const r=d.getBoundingClientRect(); return Math.round(r.height)===80 && r.width>150; })
      .map(function(d){ const r=d.getBoundingClientRect(); const s=getComputedStyle(d);
        return { w:Math.round(r.width), h:Math.round(r.height), x:Math.round(r.x), y:Math.round(r.y), shadow:s.boxShadow.slice(0,45) }; });
    const t = root.innerText.replace(/\\s+/g,' ');
    return { skeletons80: sk,
             hasData: /Новый комментарий|Статья опубликована|Добро пожаловать/.test(t),
             textNearBell: t.slice(0, 180) };
  })()`;

  for (const ms of [300, 900, 2000, 4000]) {
    await sleep(ms === 300 ? 300 : ms - (ms === 900 ? 300 : ms === 2000 ? 900 : 2000));
    console.log(`\n--- через ~${ms}мс ---`);
    console.log(JSON.stringify(await js(probe)));
  }

  console.log("\n=== запросы к API ===");
  console.log(apiUrls.join("\n") || "(нет)");

  ws.close();chrome.kill();await sleep(400);process.exit(0);
})().catch(e=>{console.log("ERR:",e.message);process.exit(1);});
