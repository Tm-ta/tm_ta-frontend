'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore, NICKNAMES } from '@/lib/store';
import TimeTable, { type Slot } from '@/components/TimeTableComponent';
import { Button } from '@/components/ButtonComponent';
import NickNameModal from '@/components/NickNameModal';
import WarningPopUpModal from '@/components/WarningPopUpModal';

export default function AddPage() {
const { groupId } = useParams<{ groupId: string }>();
const router = useRouter();
const group = useAppStore((s) => s.groups[groupId]);
const addSchedule = useAppStore((s) => s.addSchedule);

const [showNameModal, setShowNameModal] = useState(true);
const [nickname, setNickname] = useState('');
const [count, setCount] = useState(0);

const [warnOpen, setWarnOpen] = useState(false);
const [warnMsg, setWarnMsg] = useState('');

const openWarn = (msg: string) => {
  setWarnMsg(msg);
  setWarnOpen(true);
};

// 선택 슬롯 세트 + 렌더 배열
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

useEffect(() => {
  if (!group) return;
  const used = new Set(group.participants);
  const candidate = NICKNAMES.find((n) => !used.has(n)) || `사용자${group.participants.length + 1}`;
  setNickname(candidate);
  setCount(candidate.length);
}, [group]);

if (!group) return <div>존재하지 않는 모임입니다.</div>;

const dates = group.selectedDates.map((k) => new Date(k));
const dateKeys = group.selectedDates; // 'yyyy-MM-dd'
const startHour = parseInt(group.start.slice(0, 2), 10);
const endHour = parseInt(group.end.slice(0, 2), 10);

// 유틸: 모든 가능한 슬롯 키 생성
function buildAllSlotKeys(): string[] {
  const keys: string[] = [];
  const startHalf = startHour * 2;          // inclusive
  const endHalf = endHour * 2;              // exclusive
  for (const dk of dateKeys) {
    for (let half = startHalf; half < endHalf; half++) {
      keys.push(`${dk}|${half}`);
    }
  }
  return keys;
}

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

const validName = nickname.length > 0 && nickname.length <= 10;

return (
  <div className="mobile-frame">
    {/* 닉네임 모달 */}
    <NickNameModal
      open={showNameModal}
      defaultName={nickname}
      onSubmit={(v) => {
      setNickname(v);
      setCount(v.length);
      setShowNameModal(false);
    }}
    />
    <div className='stickyTop' style={{paddingBottom:'10px'}}>
      <button onClick={()=> router.push(`/${groupId}`)} style={{ backgroundColor:'white', border:'none', width:'40px', height:'40px', padding: 0, display:'flex', justifyContent:'left'}}>
        <img src='/icons/left.png' style={{height:'20px'}}/>
      </button>
      <div style={{fontSize:'28px', fontWeight:800, marginBottom: 12}}>
        약속에 참여할 수 있는 <br/> 시간을 선택해주세요
      </div>

      {/* 전체 선택 / 전체 취소 버튼 */}
      <div style={{ display:'flex', gap:8 }}>
        <button
          className='blankBtn'
          style={{fontWeight:600}}
          onClick={()=>{
            const all = buildAllSlotKeys();
            setSlotKeysSet(new Set(all));
          }}
        >전체선택</button>
        <button
          className='blankBtn'
          style={{fontWeight:600}}
          onClick={()=> setSlotKeysSet(new Set())}
        >전체취소</button>
      </div>
    </div>

    <div className='body-area'>
      <TimeTable
        mode="add"
        dates={dates}
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
        title="다음"
        disabled={ !validName}
        onClick={() => {
          if (selectedSlots.length === 0) {
              openWarn('약속을 정할 기간을 선택해주세요');
              return;
          }
          const slotKeys = Array.from(slotKeysSet);
          addSchedule(groupId, nickname, slotKeys);
          router.push(`/${groupId}`);
        }}
      />
    </div>
      {/* 워닝 모달 */}
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