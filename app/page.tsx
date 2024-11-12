'use client'
import { useState } from "react";

const PIANO_KEY_RATIOS: Record<string, string> = {
  "1:1": "c",
  "2:1": "c",
  "16:15": "c#",
  "9:8": "d",
  "6:5": "d#",
  "5:4": "e",
  "4:3": "f",
  "45:32": "f#",
  "3:2": "g",
  "8:5": "g#",
  "5:3": "a",
  "9:5": "a#",
  "15:8": "b"
};

const DivInfo: Record<number, string> = {
  1: " bg-white h-[14.5rem]",
  2: " bg-[#ffff00] h-[14rem]",
  3: " bg-[#4aff59] h-[13.5rem]",
  4: " bg-[#ffa500] h-[13rem]",
  5: " bg-[#7b98ff] h-[12.5rem]",
  6: " bg-[#ff7b7b] h-[12rem]",
  7: " bg-[#ff7bff] h-[11.5rem]",
  8: " bg-[#7bffff] h-[11rem]",
  9: " bg-[#ffff7b] h-[10.5rem]",
  10: " bg-[#ff7b7b] h-[10rem]" ,
  11: " bg-[#7bff7b] h-[9.5rem]",
  12: " bg-[#7b7bff] h-[9rem]",
}

//eslint-disable-next-line
const keyboardLetters: string[][] = [
	['q','w','e','r','t','y','u','i','o','p','[',']','\\'],
	['a','s','d','f','g','h','j','k','l',';','\''],
	['z','x','c','v','b','n','m',',','.','/']
];

interface KeyType {
  octave: number,
  divisor: number,
  instance: number,
  rootFrequency: number
}

/* 
ocatve - the current octave of the note
divisor - divide this octave into this many equal parts (2 = divide into halves, 3 = thirds, etc)
instance - the number of divisors to count (2 = 2nd quarter, 3 = 3rd quarter, etc) (this cant be equal or greater to the divisor, otherwise you're just entering a new octave)
*/
function KeyButton({
  octave, divisor, instance=1, rootFrequency=60
} : {
  octave: number, divisor: number, instance: number, rootFrequency: number
}) {
  if (instance > divisor) throw 'instance cannot be greater than divisor';

  const ratio = divisor===1?1:((divisor+instance)/divisor);
  const octaveOffset = Math.pow(2, octave);
  const frequency = rootFrequency * octaveOffset * ratio; 

  return (
    <div 
      className={`rounded-lg opacity-80 hover:opacity-100 text-black \
                  cursor-pointer text-xs text-center px-3 pt-14 ${DivInfo[divisor]} `}
      onClick={() => {playTone(frequency)}}
    >
    oct {octave}<br />
    {instance}/{divisor}<br />
    {ratio.toFixed(2)}<br />
    {frequency.toFixed(0)}Hz<br />
    {PIANO_KEY_RATIOS[(divisor+instance)+":"+divisor]||''}<br />
  </div>
  )
} 

function playTone(frequency:number) {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.frequency.value = frequency;
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();

  // Start with full volume
  gainNode.gain.setValueAtTime(1, audioContext.currentTime);

  // Fade out over 100 milliseconds 
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1);

  setTimeout(function () {
      oscillator.stop();
  }, 1000);
} 

function KedBoard({
  octaves, divisions, rootFreq
} : {
  octaves: number, divisions: number, rootFreq: number
}) {
  let pianoKeys:React.ReactNode[] = []

  const keysToAdd:KeyType[] = [];

  for (let o = 0; o < octaves; o++) {
    for (let divisor = 1; divisor <= divisions; divisor++) {
      keysToAdd.push({octave: o, divisor: divisor, instance: 1, rootFrequency: rootFreq});
        for (let instance = 2; instance < divisor; instance++) {
        //if the ratio can be simplified, don't add it
        if (divisor % instance === 0) continue;
            keysToAdd.push({octave: o, divisor: divisor, instance: instance, rootFrequency: rootFreq});
        }
    }
  }

  //sort keys by octave then ratio
  keysToAdd.sort((a,b) => {
    if (a.octave === b.octave) {
      // if this is the root note (1:1), put it first
      if (a.divisor === 1) return -1;
      if (b.divisor === 1) return 1;
      
      return a.instance/a.divisor - b.instance/b.divisor;
    } else {
      return a.octave - b.octave;
    }
  });

  pianoKeys = keysToAdd.map((keyData, i) => <KeyButton key={i} {...keyData} rootFrequency={rootFreq} />);

  return (
    <div className="bg-black flex flex-row rounded-2xl min-w-full w-max mt-12 m-4 p-4 gap-x-0.5">{pianoKeys}</div>
  )
}

export default function Home() {
  const [rootFreq, setRootFreq] = useState('60');
  const [octaves, setOctaves] = useState('5');
  const [divisions, setDivisions] = useState('5');

  return (
    <main>
          <div className="p-2 fixed top-0 left-0 right-0 flex items-center gap-2">
            <p>Oct0 Root Freq:</p>
            <input
              className="rounded-md text-[#bcbcbc] bg-[#070707] p-1"
              type="number"
              min={1} max={10000}
              value={rootFreq}
              onChange={e => setRootFreq(e.target.value)}/>
            <p>Octaves:</p>
            <input
              className="rounded-md text-[#bcbcbc] bg-[#070707] p-1"
              type="number"
              min={1} max={12}
              value={octaves}
              onChange={e => setOctaves(e.target.value)}/>
            <p>Divisions:</p>
            <input
              className="rounded-md text-[#bcbcbc] bg-[#070707] p-1"
              type="number"
              min={1} max={12}
              value={divisions}
              onChange={e => setDivisions(e.target.value)}/>
          </div>
          <KedBoard octaves={Number(octaves)} divisions={Number(divisions)} rootFreq={Number(rootFreq)}/>
    </main>
  );
}


