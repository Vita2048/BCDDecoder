import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(process.argv[2]);
const puppeteer=require('puppeteer-core');
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--allow-file-access-from-files']});
fs.mkdirSync('snapshots/review',{recursive:true});
try{
 const p=await browser.newPage();await p.setViewport({width:1920,height:1080});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(pathToFileURL(process.cwd()+'/player.html').href);await p.evaluate(async()=>{document.body.classList.add('qa');await document.fonts.ready;});
 const report=await p.evaluate(()=>{const samples=[],violations=[];for(const s of BCDTiming.scenes){for(const at of [1,s.duration/2,s.duration-1,...s.phraseStarts.map(x=>x+.3)]){const r=renderAt(s.start+at);if(r.violations.length)violations.push({id:s.id,t:at,items:r.violations});}samples.push({id:s.id,time:s.start+s.duration/2});}const a=renderAt(219),image=document.getElementById('diagram').toDataURL();renderAt(350);renderAt(219);const backwardSeekIdentical=image===document.getElementById('diagram').toDataURL();return {samples,violations,backwardSeekIdentical};});
 for(const s of report.samples){await p.evaluate(t=>renderAt(t),s.time);await p.screenshot({path:`snapshots/review/${s.id}.png`});}
 const extra=[['derive-final',246],['pla-active',352],['blanking',397]];for(const [name,t] of extra){await p.evaluate(t=>renderAt(t),t);await p.screenshot({path:`snapshots/review/${name}.png`});}
 const sheet=await browser.newPage();await sheet.setViewport({width:1920,height:1800});await sheet.goto(pathToFileURL(process.cwd()+'/player.html').href);await sheet.setContent('<body style="margin:0;background:#091321;display:grid;grid-template-columns:repeat(3,640px)">'+report.samples.map(s=>'<img style="width:640px;height:360px" src="'+pathToFileURL(process.cwd()+'/snapshots/review/'+s.id+'.png').href+'">').join('')+'</body>');await sheet.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));await sheet.screenshot({path:'snapshots/contact-sheet.png',fullPage:true});await sheet.close();
 fs.writeFileSync('verification-visuals.json',JSON.stringify({...report,errors},null,2));console.log(JSON.stringify({scenes:report.samples.length,violations:report.violations,backwardSeekIdentical:report.backwardSeekIdentical,errors},null,2));
 assert.equal(report.violations.length,0);assert.equal(report.backwardSeekIdentical,true);assert.deepEqual(errors,[]);
}finally{await browser.close();}
