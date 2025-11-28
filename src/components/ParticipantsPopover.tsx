'use client';
import { useEffect, useRef, useState } from 'react';

export default function ParticipantsPopover({
  names,
  onEdit
}:{ names:string[]; onEdit:(name:string)=>void }){
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement|null>(null);

  useEffect(()=>{
    function onDoc(e:MouseEvent){
      if(!boxRef.current) return;
      if(!boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    if(open) document.addEventListener('mousedown', onDoc);
    return ()=> document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div style={{ position:'relative', alignItems:'center'}}>
      <button className="underline" style={{border: 'none', backgroundColor: '#fff', display:'flex', alignItems:'center', fontSize:'14px', fontWeight:'700', color:'black'}} onClick={()=>setOpen(v=>!v)}>
        <span>{names.length}{'명 참여'}</span>
        <img src={'/icons/edit.png'} style={{width:'16px', height:'16px', bottom:0, marginLeft:4}}/>
      </button>
      {open && (
        <div ref={boxRef} style={{ position:'absolute', zIndex:10, top:'150%', right:0, width:260, maxHeight:300, overflow:'auto', background:'#fff', border:'1px solid #eee', borderRadius:12, padding:12}}>
          {names.length===0 && <div className="caption">아직 참여자가 없어요.</div>}
          {names.map(n => (
            <div key={n} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0' }}>
              <span>{n}</span>
              <button onClick={()=>onEdit(n)} style={{ border:'1px solid var(--gray-300)', background:'#fff', borderRadius:6, padding:'4px 8px' }}>수정</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
