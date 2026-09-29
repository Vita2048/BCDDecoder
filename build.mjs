import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {scenes} from './scenes.mjs';

const ffmpeg=process.argv[2];
if(!ffmpeg)throw Error('Usage: node build.mjs <ffmpeg.exe>');
const voice=JSON.parse(fs.readFileSync('assets/voice-metadata.json','utf8'));
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const run=args=>{const r=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y',...args],{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr||String(r.error));};
const stamp=t=>{let ms=Math.round(t*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`;};
fs.mkdirSync('compositions',{recursive:true});fs.mkdirSync('assets/narration',{recursive:true});
let start=0;const allCues=[];const all=[];
for(const [index,s] of scenes.entries()){
 const v=voice.find(x=>x.id===s.id);let length=0;const wordPositions=v.words.map(w=>{const p=length;length+=norm(w.text).length;return {...w,pos:p};});
 const expected=norm(s.speech.join(' ')),received=v.words.map(w=>norm(w.text)).join('');
 if(expected!==received)throw Error('Word alignment mismatch: '+s.id+'\n'+expected+'\n'+received);
 const starts=s.speech.map((p,i)=>{const pos=norm(s.speech.slice(0,i).join(' ')).length;return wordPositions.find(w=>w.pos>=pos)?.start??0;});
 const cuts=starts.map((x,i)=>i===0?0:(wordPositions.filter(w=>w.start<x).at(-1).end+x)/2);cuts.push(v.duration);
 const head=.8,tail=2.1;let extra=Math.max(0,s.min-head-tail-v.duration);const gaps=s.speech.map((_,i)=>i===0?0:extra/(s.speech.length-1));
 if(s.special==='simulation'){gaps.fill(0);const speechCount=cuts[2]-cuts[1];gaps[2]=Math.max(0,22-speechCount);}
 let offset=head;const pieces=[],localWords=[],phraseStarts=[];
 for(let k=0;k<s.speech.length;k++){
   offset+=gaps[k];const from=cuts[k],to=cuts[k+1];pieces.push({from,to,at:offset});phraseStarts.push(offset+starts[k]-from);
   localWords.push(...v.words.filter(w=>w.start>=from&&w.start<to).map(w=>({...w,start:w.start-from+offset,end:w.end-from+offset,phrase:k})));
   offset+=to-from;
 }
 const duration=Math.ceil(Math.max(s.min,offset+tail)*30)/30;
 const meta={id:s.id,index,title:s.title,chapter:s.chapter,takeaway:s.takeaway,start,duration,phraseStarts,words:localWords};
 if(s.special==='simulation'){meta.countStart=phraseStarts[1];meta.invalidStart=phraseStarts[2];meta.invalidEnd=duration-1;}
 const audioPath=`assets/narration/${s.id}.mp3`;
 const filter=pieces.map((p,i)=>`[0:a]atrim=start=${p.from}:end=${p.to},asetpts=PTS-STARTPTS,adelay=${Math.round(p.at*1000)}:all=1[p${i}]`).join(';')+';'+pieces.map((_,i)=>`[p${i}]`).join('')+`amix=inputs=${pieces.length}:normalize=0:duration=longest,asetpts=N/SR/TB,apad=pad_dur=${duration},atrim=duration=${duration},asetpts=N/SR/TB[out]`;
 run(['-i',`assets/voice-parts/${s.id}.mp3`,'-filter_complex',filter,'-map','[out]','-c:a','libmp3lame','-b:a','160k',audioPath]);
 for(let k=0;k<s.speech.length;k++){
   const words=localWords.filter(w=>w.phrase===k);const count=Math.ceil(words.map(w=>w.text).join(' ').length/82);
   for(let j=0;j<count;j++){const part=words.slice(Math.round(j*words.length/count),Math.round((j+1)*words.length/count));allCues.push({start:start+part[0].start,end:start+Math.min(part.at(-1).end+.16,duration),text:part.map(w=>w.text).join(' ')+(j===count-1?'.':'')});}
 }
 const id='scene-'+(index+1);
 const html=`<!doctype html><html lang="en"><body><template>
 <style>@font-face{font-family:'Teaching Sans';src:url('assets/teaching-sans.ttf')}@font-face{font-family:'Teaching Mono';src:url('assets/teaching-mono.ttf')}#root{position:absolute;inset:0;width:100%;height:100%;background:#091321;color:#edf4fc;font-family:'Teaching Sans',sans-serif}#root .scene-wrap{width:100%;height:100%;position:relative}#root .kicker{position:absolute;left:64px;top:43px;font-size:23px;letter-spacing:2px;color:#77edcc}#root .number{position:absolute;right:64px;top:43px;font-size:23px;color:#a8b9cd}#root h1{position:absolute;left:64px;top:91px;margin:0;font-size:60px;font-weight:400;letter-spacing:-1.5px;max-width:1780px}#root .diagram{position:absolute;left:64px;top:208px;width:1792px;height:640px}#root .takeaway{position:absolute;left:64px;right:64px;top:869px;border-top:1px solid #33495e;padding-top:19px;font-size:30px;margin:0;color:#edf4fc}#root .section-progress{position:absolute;left:64px;top:188px;width:1792px;height:3px;background:#77edcc;transform-origin:left center}</style>
 <div id="root" data-composition-id="${id}" data-width="1920" data-height="1080" data-duration="${duration}"><div class="scene-wrap" id="${id}-wrap"><div class="kicker">${esc(s.chapter)}</div><div class="number">${String(index+1).padStart(2,'0')} / 15</div><h1>${esc(s.title)}</h1><canvas class="diagram" id="${id}-canvas" width="1792" height="640" aria-label="${esc(s.title)}"></canvas><p class="takeaway">${esc(s.takeaway)}</p><div class="section-progress" id="${id}-progress"></div></div></div>
 <script>(function(){const meta=${JSON.stringify(meta)};const canvas=document.getElementById('${id}-canvas');const ctx=canvas.getContext('2d');const driver={t:0};const tl=gsap.timeline({paused:true});const draw=()=>{const violations=BCDRender.paint(ctx,${index},driver.t,${duration},meta);window.BCDSceneState=window.BCDSceneState||{};window.BCDSceneState['${id}']={t:driver.t,violations};};tl.to(driver,{t:${duration},duration:${duration},ease:'none',onUpdate:draw},0);tl.fromTo('#${id}-progress',{scaleX:0},{scaleX:1,duration:${duration},ease:'none'},0);tl.fromTo('#${id}-wrap',{opacity:.15,y:8},{opacity:1,y:0,duration:.45,ease:'power2.out'},0);draw();window.__timelines=window.__timelines||{};window.__timelines['${id}']=tl;})();</script>
 </template></body></html>`;
 fs.writeFileSync(`compositions/${s.id}.html`,html);
 fs.writeFileSync(`compositions/${s.id}.motion.json`,JSON.stringify({duration,assertions:[{kind:'appearsBy',selector:`#${id}-canvas`,bySec:.6},{kind:'staysInFrame',selector:`#${id}-canvas`}]},null,2));
 all.push(meta);start+=duration;
}
for(let i=0;i<allCues.length-1;i++)allCues[i].end=Math.min(allCues[i].end,allCues[i+1].start);
const total=Math.round(start*30)/30;
const fonts=`@font-face{font-family:'Teaching Sans';src:url('assets/teaching-sans.ttf')}@font-face{font-family:'Teaching Mono';src:url('assets/teaching-mono.ttf')}`;
const style=`${fonts}*{box-sizing:border-box}html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#091321;color:#edf4fc;font-family:'Teaching Sans',sans-serif}#root{width:100%;height:100%;position:relative}.clip{position:absolute;inset:0;width:100%;height:100%}#captions{position:absolute;left:140px;right:140px;top:950px;min-height:82px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:29px;line-height:1.32;padding:8px 28px;color:#edf4fc;background:#152438;border-radius:10px;z-index:100}#progress{position:absolute;bottom:0;left:0;width:100%;height:4px;background:#77edcc;transform-origin:left center;z-index:110}`;
const main=`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Design a BCD to Seven-Segment Decoder</title><script src="assets/gsap.min.js"></script><style>${style}</style></head><body><div id="root" data-composition-id="main" data-width="1920" data-height="1080" data-duration="${total}" data-fps="30">
${all.map((s,i)=>`<div class="clip" id="mount-${i+1}" data-composition-id="scene-${i+1}" data-composition-src="compositions/${s.id}.html" data-start="${s.start}" data-duration="${s.duration}" data-track-index="0" data-width="1920" data-height="1080"></div>`).join('\n')}
${all.map(s=>`<audio id="voice-${s.id}" src="assets/narration/${s.id}.mp3" data-start="${s.start}" data-duration="${s.duration}" data-volume="1" data-track-index="1"></audio>`).join('\n')}
<div id="captions" data-layout-allow-caption-zone></div><div id="progress"></div></div>
<script>${fs.readFileSync('logic.js','utf8')}\n${fs.readFileSync('visuals.js','utf8')}</script>
<script>window.BCDChapters=${JSON.stringify(all.map(({words,...s})=>s))};window.captionCues=${JSON.stringify(allCues)};const driver={t:0};const tl=gsap.timeline({paused:true});tl.to(driver,{t:${total},duration:${total},ease:'none',onUpdate:()=>{const cue=window.captionCues.find(c=>driver.t>=c.start&&driver.t<c.end);const el=document.getElementById('captions');const text=cue?cue.text:'';if(el.textContent!==text)el.textContent=text;el.style.opacity=cue?'1':'0';}},0);tl.fromTo('#progress',{scaleX:0},{scaleX:1,duration:${total},ease:'none'},0);window.__timelines=window.__timelines||{};window.__timelines.main=tl;</script></body></html>`;
fs.writeFileSync('index.html',main);fs.writeFileSync('timing.json',JSON.stringify({duration:total,scenes:all,captions:allCues},null,2));
fs.writeFileSync('assets/voice.vtt','WEBVTT\n\n'+allCues.map(c=>`${stamp(c.start)} --> ${stamp(c.end)}\n${c.text}`).join('\n\n')+'\n');
fs.writeFileSync('script.txt',scenes.map((s,i)=>`${String(i+1).padStart(2,'0')}. ${s.title}\n\n${s.speech.join('\n\n')}`).join('\n\n---\n\n'));
fs.writeFileSync('STORYBOARD.md','# Approved BCD decoder storyboard\n\nApproved in chat; revised opening included. Narration timings measured from edge-tts.\n\n'+all.map((s,i)=>`## Frame ${i+1}\n\nstatus: animated\nsrc: compositions/${s.id}.html\nstart: ${s.start}\nduration: ${s.duration}\nrules: dynamic-content-sequencing; stat-bars-and-fills; deterministic signal and group highlighting\n\n${s.title}\n\n${scenes[i].speech.join(' ')}\n\nOn screen: ${s.takeaway}`).join('\n\n'));
fs.writeFileSync('design.md','# Visual design\n\nA digital-logic teaching bench: a requirement becomes a regular, inspectable circuit.\n\n1920x1080. Background #091321, panel #101f30, text #edf4fc, secondary text #a8b9cd, active #77edcc, teaching focus #ffc878. Supplemental group colors #aab6ff and #ffa8be. Gray + numerical 0 for inactive signals.\n\nTeaching Sans: locally embedded Segoe UI. Teaching Mono: locally embedded Consolas for bits and expressions. Title 60 px, body 29–40 px, matrix labels 22–24 px to fit all fifteen rows at 1080p. Diagrams occupy x64..1856, y208..848. Takeaway y869..925; captions y950..1032.\n\nHard scene cuts with a 0.45-second inner opacity rise; no camera motion during reading. Measured speech phrases trigger highlights. Scene progress establishes pacing. Shared PLA is the focal element in the last third; no free-form wire fanout.\n');
fs.writeFileSync('assets/narration/concat.txt',all.map(s=>`file '${s.id}.mp3'`).join('\n'));
run([...all.flatMap(s=>['-i',`assets/narration/${s.id}.mp3`]),'-filter_complex',all.map((s,i)=>`[${i}:a]atrim=duration=${s.duration},asetpts=PTS-STARTPTS[a${i}]`).join(';')+';'+all.map((_,i)=>`[a${i}]`).join('')+`concat=n=${all.length}:v=0:a=1[out]`,'-map','[out]','-c:a','libmp3lame','-b:a','160k','assets/voice.mp3']);
console.log(`Built ${all.length} scenes; ${total.toFixed(3)} seconds; ${allCues.length} caption cues.`);
