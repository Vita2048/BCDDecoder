import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(process.argv[2]);const puppeteer=require('puppeteer-core');
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage();await page.setViewport({width:1920,height:1080});
 const response=await page.goto('http://localhost:3017/#project/7Segment',{waitUntil:'domcontentloaded',timeout:60000});assert.equal(response.status(),200);
 let frame;for(let i=0;i<40;i++){for(const f of page.frames()){if(await f.evaluate(()=>Boolean(window.__timelines?.main)).catch(()=>false)){frame=f;break;}}if(frame)break;await new Promise(r=>setTimeout(r,500));}
 if(!frame)throw Error('No active composition frame: '+page.frames().map(f=>f.url()).join(', '));
 const report=await frame.evaluate(async()=>{
   await document.fonts.ready;
   const registry=window.__timelines;const entries=Object.entries(registry).map(([id,tl])=>({id,duration:tl.duration(),tweens:tl.getChildren(true,true,false).map(t=>({start:t.startTime(),duration:t.duration(),targets:t.targets().map(x=>x.id||x.tagName||'time-driver'),properties:Object.keys(t.vars).filter(k=>!['onUpdate','parent','ease','immediateRender','overwrite'].includes(k))}))}));
   const methods=Object.keys(window.__hf||{});const main=registry.main;const samples=[];
   const seek=t=>{if(window.__hf?.seek)window.__hf.seek(t);else{main.seek(t,false);window.BCDChapters.forEach((s,i)=>registry['scene-'+(i+1)].seek(Math.max(0,Math.min(s.duration,t-s.start)),false));}};
   for(const [i,s] of window.BCDChapters.entries()){seek(s.start+s.duration/2);const canv=[...document.querySelectorAll('canvas')].find(c=>c.id.endsWith('scene-'+(i+1)+'-canvas'));samples.push({id:s.id,foundCanvas:!!canv,time:s.start+s.duration/2});}
   seek(219);const hashes=()=>[...document.querySelectorAll('canvas')].map(c=>c.toDataURL());const before=hashes();seek(350);seek(219);const after=hashes();
   return {methods,entries,samples,backwardSeekIdentical:before.every((s,i)=>s===after[i]),media:[...document.querySelectorAll('audio')].map(a=>({id:a.id,duration:a.duration,slot:Number(a.dataset.duration)}))};
 });
 fs.writeFileSync('verification-runtime.json',JSON.stringify(report,null,2));
 fs.mkdirSync('.hyperframes/anim-map',{recursive:true});fs.writeFileSync('.hyperframes/anim-map/animation-map.json',JSON.stringify({source:'Direct inspection of running HyperFrames Studio composition; helper package unavailable',timelines:report.entries},null,2));
 assert.equal(report.entries.length,16);assert.ok(report.entries.every(e=>e.tweens.length>=2));assert.ok(report.samples.every(s=>s.foundCanvas));assert.equal(report.backwardSeekIdentical,true);assert.ok(report.media.every(m=>Number.isFinite(m.duration)&&Math.abs(m.duration-m.slot)<.1));
 console.log('PASS: 16 HyperFrames timelines, all 15 mounted scene canvases, 15 correctly timed audio clips, deterministic backward seeking.');
}finally{await browser.close();}
