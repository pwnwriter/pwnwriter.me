type Sound = 'tap' | 'open' | 'close';
let audio:AudioContext|undefined;
let lastCardSound=-Infinity;
export function unlockUiSounds(){
 try{audio??=new AudioContext();if(audio.state==='suspended')void audio.resume().catch(()=>{});}catch{}
}
export function playUiSound(kind:Sound){
 if(!audio||audio.state!=='running'||document.hidden)return;
 const context=audio,now=context.currentTime;
 if(kind!=='tap'){if(now-lastCardSound<.22)return;lastCardSound=now;}
 const notes=kind==='open'?[659.25,987.77]:kind==='close'?[523.25,392]:[640];
 notes.forEach((frequency,index)=>{
  const start=now+index*.035,length=kind==='tap'?.065:.15;
  const oscillator=context.createOscillator(),gain=context.createGain();
  oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,start);
  oscillator.frequency.exponentialRampToValueAtTime(kind==='tap'?420:frequency*.985,start+length);
  gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(kind==='tap'?.018:kind==='open'?.012:.008,start+.009);gain.gain.exponentialRampToValueAtTime(.0001,start+length);
  oscillator.connect(gain);gain.connect(context.destination);oscillator.start(start);oscillator.stop(start+length+.01);
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
 });
}
