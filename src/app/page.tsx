'use client';
import { useState, useMemo } from 'react';
import ProgressBar from '@/components/ProgressBar';
import Calendar from '@/components/CalendarComponent';
import HourRangeWheel from '@/components/HourRangeWheel';
import QuickShortcuts from '@/components/QuickShortcuts';
import { Button } from '@/components/ButtonComponent';
import { useAppStore } from '@/lib/store';
import { format, isBefore, startOfDay } from 'date-fns';
import { useRouter } from 'next/navigation';
import WarningPopUpModal from '@/components/WarningPopUpModal';
import '@/styles/app.module.css';

export default function Home(){
const [step, setStep] = useState<1|2>(1);
const [dates, setDates] = useState<Date[]>([]);
const [time, setTime] = useState<{start:string,end:string}>({ start:'00:00', end:'24:00' });
const [activeShortcut, setActiveShortcut] = useState<string|null>(null);

// 워닝 모달 상태
const [warnOpen, setWarnOpen] = useState(false);
const [warnMsg, setWarnMsg] = useState('');

const createGroup = useAppStore(s=>s.createGroup);
const router = useRouter();

const title = step===1 ? '원하는 약속 날짜를' : '원하는 약속 시간을';

const hasPastDate = useMemo(()=>{
const today0 = startOfDay(new Date());
  return dates.some(d => isBefore(startOfDay(d), today0));
}, [dates]);

const openWarn = (msg: string, icon?: string) => {
  setWarnMsg(msg);
  setWarnOpen(true);
};

return (
  <div>
    <div className='backBtn'>
    {step===2 ? (
        <img src='/icons/left.png'onClick={()=>setStep(1)}  style={{height:'20px'}}/>
    ) : null}
    </div>
    <div className={step===1? 'step-date':'step-time'}>
      <ProgressBar totalSteps={2} current={step===1?1:2}/>
      <div className='headerTitle'>
        <span>{title} <br/> 선택해주세요</span>
      </div>
      <div className="section">
        {step===1 ? (
          <Calendar 
            value={dates} 
            onChange={(next) => {
              if (activeShortcut) setActiveShortcut(null); 
              setDates(next);
            }} 
          />
        ) : (
          <HourRangeWheel
            start={time.start}
            end={time.end}
            onChange={(s,e)=>{
              setTime({ start:s, end:e });
              console.log('[Wheel:onChange]', { start:s, end:e });
            }}
          />
        )}
      </div>
      <div className="section">
        <QuickShortcuts
          type={step===1? 'date':'time'}
          value={activeShortcut}
          onApply={(p:any)=>{
            if (p.clear) {
              setActiveShortcut(null);
              if (step===1) setDates([]);                  
              else setTime({ start:'00:00', end:'24:00' });
              return;
            }
            setActiveShortcut(p.key);
            if (step===1){
              const nextDates = p.range.map((k:string)=> new Date(k));
              setDates(nextDates);
              console.log('[Shortcut:date] 적용:', nextDates.map((d:any)=> format(d,'yyyy-MM-dd')));
            } else {
              setTime({ start:p.start, end:p.end });
              console.log('[Shortcut:time] 적용:', { start:p.start, end:p.end });
            }
          }}
        />
      </div>
      <div className="sticky-bottom scroll-bottom">
        {step===1 ? (
          <Button
            size='lg'
            shape='square'
            title='다음'
            onClick={()=>{
              if(dates.length === 0){
                openWarn('약속을 정할 기간을 선택해주세요', '/icons/warn-emoji.png');
                return;
              }
              if(hasPastDate){
                openWarn('날짜 선택에 문제가 발생했어요 \n 다시 시도해주세요', '/icons/warn-emoji.png');
                setDates([]);
                return;
              }
              console.log('선택된 날짜:', dates.map(d=> format(d,'yyyy-MM-dd')));
              setStep(2);
            }}
          />
        ) : (
          <Button
            size='lg'
            shape='square'
            title='완료'
            onClick={()=>{
              console.log('선택된 시간:', time);
              const groupId = createGroup(dates.map(d=>format(d,'yyyy-MM-dd')), time.start, time.end);
              router.push('/'+groupId);
            }}
          />
        )}
      </div>
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