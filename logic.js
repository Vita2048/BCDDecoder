(function(scope){
  const terms=[['I1'],['I3'],['I0','I2'],['nI0','nI2'],['nI2'],['I0','I1'],['nI0','nI1'],['I0'],['I2'],['nI1'],['I1','nI0'],['I1','nI2'],['I0','I2','nI1'],['I2','nI0'],['I2','nI1']];
  const outputs={a:[0,1,2,3],b:[4,5,6],c:[7,8,9],d:[1,10,11,3,12],e:[10,3],f:[1,13,14,6],g:[1,11,13,14]};
  const glyphs=['1111110','0110000','1101101','1111001','0110011','1011011','1011111','1110000','1111111','1111011'];
  const order=[0,1,3,2];
  const groups=[{label:'I₁',cells:[2,3,6,7,10,11,14,15],color:'#77edcc'}, {label:'I₃',cells:[8,9,10,11,12,13,14,15],color:'#ffc878'}, {label:'I₂·I₀',cells:[5,7,13,15],color:'#aab6ff'}, {label:'¬I₂·¬I₀',cells:[0,2,8,10],color:'#ffa8be'}];
  function evaluate(n){
    const v={};for(let i=0;i<4;i++){v['I'+i]=(n>>i)&1;v['nI'+i]=1-v['I'+i];}
    const product=terms.map(t=>+t.every(k=>v[k]));
    const raw=Object.values(outputs).map(ids=>+ids.some(i=>product[i]));
    const valid=+(!v.I3||(!v.I2&&!v.I1));
    return {n,v,product,raw,valid,out:raw.map(x=>x*valid)};
  }
  scope.BCD={terms,outputs,glyphs,order,groups,evaluate};
})(globalThis);
