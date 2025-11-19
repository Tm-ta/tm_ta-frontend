import { addDays, eachDayOfInterval, endOfMonth, format, nextSunday, startOfMonth } from 'date-fns';

export function toDateKey(d: Date){ return format(d, 'yyyy-MM-dd'); }

export function computeDatePreset(key:string){
  const today = new Date();
  if(key==='d+7'){
    const start = addDays(today, 1); const end = addDays(today, 7);
    return eachDayOfInterval({ start, end }).map(toDateKey);
  }
  if(key==='d+14'){
    const start = addDays(today, 1); const end = addDays(today, 14);
    return eachDayOfInterval({ start, end }).map(toDateKey);
  }
  if(key==='nextSun'){
    const end = nextSunday(today); const start = addDays(today, 1);
    return eachDayOfInterval({ start, end }).map(toDateKey);
  }
  if(key==='wkndThisMonth'){
    const start = startOfMonth(today); const end = endOfMonth(today);
    const days = eachDayOfInterval({ start, end });
    return days.filter(d => [0,6].includes(d.getDay())).map(toDateKey);
  }
  return [] as string[];
}
