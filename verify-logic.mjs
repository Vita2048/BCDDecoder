import assert from 'node:assert/strict';
import fs from 'node:fs';
import './logic.js';
const expected=['1111110','0110000','1101101','1111001','0110011','1011011','1011111','1110000','1111111','1111011'];
const report=[];
for(let n=0;n<16;n++){const s=BCD.evaluate(n);assert.equal(s.out.join(''),expected[n]??'0000000',`input ${n}`);assert.equal(s.valid,+(n<10));report.push({input:n,bits:n.toString(2).padStart(4,'0'),output:s.out.join(''),valid:s.valid});}
for(const g of BCD.groups){assert.ok([1,2,4,8,16].includes(g.cells.length));assert.ok(g.cells.every(n=>n>=10||expected[n][0]==='1'));}
for(let n=0;n<10;n++)assert.equal(+BCD.groups.some(g=>g.cells.includes(n)),Number(expected[n][0]),`K-map coverage ${n}`);
assert.equal(BCD.terms.length,15);
const timing=JSON.parse(fs.readFileSync('timing.json','utf8'));
for(const s of timing.scenes){assert.ok(s.words.every(w=>w.start>=0&&w.end<=s.duration));assert.ok(s.phraseStarts.every((v,i,a)=>!i||v>a[i-1]));}
assert.ok(timing.captions.every((c,i,a)=>c.start<c.end&&(!i||c.start>=a[i-1].end)));
fs.writeFileSync('verification-logic.json',JSON.stringify({passed:true,inputs:report,kmapGroups:BCD.groups,sceneCount:timing.scenes.length,duration:timing.duration},null,2));
console.log('PASS: all 16 inputs; all K-map groups and required cells; 15 product terms; caption order and narration bounds.');
