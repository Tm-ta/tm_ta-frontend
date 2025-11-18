import type { WheelPickerOption } from "@/components/wheel-picker";
import { WheelPicker, WheelPickerWrapper } from "@/components/wheel-picker";

// 범위(inclusive)로 시각 옵션 생성: from~to (예: 0~24)
function createHourOptions(from = 0, to = 24): WheelPickerOption[] {
  return Array.from({ length: to - from + 1 }, (_, i) => {
    const h = from + i;                
    const HH = String(h).padStart(2, '0');
    const t = `${HH}:00`;
    return { label: t, value: t };
  });
}

const startOptions = createHourOptions(0, 23);  // 00:00 ~ 23:00
const endOptions   = createHourOptions(1, 24);  // 01:00 ~ 24:00

export function WheelPickerDemo() {
  return (
    <div className="w-56">
      <WheelPickerWrapper>
        <WheelPicker options={startOptions} defaultValue="0" infinite />
        <WheelPicker options={endOptions} defaultValue="24" infinite />
      </WheelPickerWrapper>
    </div>
  );
}
