'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TimeTable, { type Slot } from '@/components/TimeTableComponent';
import { Button } from '@/components/ButtonComponent';
import WarningPopUpModal from '@/components/WarningPopUpModal';
import { fetchUserAvail, putUserAvail, fetchTable } from '@/lib/serverApi';
import { timeToHalf, halfToTime } from '@/lib/timeConv';

type UserAvailable = {
  availableDateTime: { date: string; availableTime: string }[];
};

export default function EditPage() {
  const { groupId, userId } = useParams<{ groupId: string; userId: string }>();
  const router = useRouter();

  const [warnOpen, setWarnOpen] = useState(false);
  const [warnMsg, setWarnMsg] = useState('');
  const openWarn = (msg: string) => { 
    setWarnMsg(msg); 
    setWarnOpen(true); 
  };

  // 축/날짜 유추
  const [dateObjs, setDateObjs] = useState<Date[]>([]);
  const [startHour, setStartHour] = useState<number>(0);
  const [endHour, setEndHour] = useState<number>(24);

  // 선택 슬롯
  const [slotKeysSet, setSlotKeysSet] = useState<Set<string>>(new Set());
  const selectedSlots = useMemo<Slot[]>(() => {
    const out: Slot[] = [];
    slotKeysSet.forEach((k) => {
      const [dateKey, halfStr] = k.split('|');
      const halfHour = Number(halfStr);
      if (!dateKey || Number.isNaN(halfHour)) return;
      out.push({ dateKey, halfHour });
    });
    return out;
  }, [slotKeysSet]);

  const [original, setOriginal] = useState<UserAvailable | null>(null);

  // 초기 데이터 로드
  useEffect(()=>{
    if (!groupId) return;
    (async ()=>{
      const raw = await fetchTable(groupId, { minUsers:1, minConsecutiveHours:1 });
      const dset = new Set<string>();
      let minHalf = Number.POSITIVE_INFINITY;
      let maxHalf = Number.NEGATIVE_INFINITY;

      raw.forEach(row=>{
        dset.add(row.date);
        const s = timeToHalf(row.startTime);
        const e = timeToHalf(row.endTime);
        minHalf = Math.min(minHalf, s);
        maxHalf = Math.max(maxHalf, e);
      });

      const ds = Array.from(dset).sort();
      setDateObjs(ds.map(x => new Date(x)));

      if (Number.isFinite(minHalf) && Number.isFinite(maxHalf)) {
        setStartHour(Math.floor(minHalf/2));
        setEndHour(Math.min(24, Math.ceil(maxHalf/2)));
      }
    })();
  }, [groupId]);

  // 유저 가용 시간 로드
  useEffect(()=>{
    if (!groupId || !userId) return;
    (async ()=>{
      const data = await fetchUserAvail(groupId, Number(userId));
      setOriginal(data);
      const keys = new Set<string>();
      data.availableDateTime.forEach(({date, availableTime})=>{
        keys.add(`${date}|${timeToHalf(availableTime)}`);
      });
      setSlotKeysSet(keys);
    })();
  }, [groupId, userId]);

  const dateKeys = useMemo(()=> dateObjs.map(d => d.toISOString().slice(0,10)), [dateObjs]);

  function addSlot(slot: Slot) {
    const key = `${slot.dateKey}|${slot.halfHour}`;
    setSlotKeysSet((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  }
  function removeSlot(slot: Slot) {
    const key = `${slot.dateKey}|${slot.halfHour}`;
    setSlotKeysSet((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }

  return (
    <div className="mobile-frame">
      <div className='stickyTop' style={{paddingBottom:'10px'}}>
        <button onClick={()=> router.push(`/${groupId}`)} style={{ backgroundColor:'white', border:'none', width:'40px', height:'40px', padding: 0, display:'flex', justifyContent:'left'}}>
          <img src='/icons/left.png' style={{height:'20px'}}/>
        </button>
        <div style={{fontSize:'28px', marginBottom: 8}}>
          내 일정 수정
        </div>
      </div>
      
      <div className='body-area'>
        <TimeTable
          mode="edit"
          dates={dateObjs}
          startHour={startHour}
          endHour={endHour}
          activeSlots={selectedSlots}
          onAddSlot={addSlot}
          onRemoveSlot={removeSlot}
        />
      </div>

      <div className="sticky-bottom">
        <Button
          size="lg"
          shape="rounded"
          title="완료"
          onClick={async () => {
            const body: UserAvailable = {
              availableDateTime: Array.from(slotKeysSet).map(k=>{
                const [date, halfStr] = k.split('|');
                return { date, availableTime: halfToTime(Number(halfStr)) };
              })
            };
            if (original && JSON.stringify(body) === JSON.stringify(original)) {
              console.log('[EDIT] same payload as original');
            }
            await putUserAvail(groupId!, Number(userId!), body);
            router.push(`/${groupId}`);
          }}
        />
      </div>

      <WarningPopUpModal
        open={warnOpen}
        type="big"
        message={warnMsg}
        autoCloseMs={1500} 
        onClose={()=> setWarnOpen(false)}
      />
    </div>
  );
}
