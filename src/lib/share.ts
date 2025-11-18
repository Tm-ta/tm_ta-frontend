/* eslint-disable @typescript-eslint/no-explicit-any */
export async function shareUrl(title:string, text:string, url:string){
  if(typeof navigator !== 'undefined' && (navigator as any).share){
    try { await (navigator as any).share({ title, text, url }); return true; } catch { return false; }
  }
  try { await navigator.clipboard.writeText(url); alert('URL을 복사했어요'); return true; } catch {}
  return false;
}
