export async function captureElementToBlob(selector:string): Promise<Blob|null>{
  if(typeof window === 'undefined') return null;
  const el = document.querySelector(selector) as HTMLElement | null; if(!el) return null;
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale:2 });
  return await new Promise<Blob|null>(res => canvas.toBlob(b => res(b), 'image/png'));
}
