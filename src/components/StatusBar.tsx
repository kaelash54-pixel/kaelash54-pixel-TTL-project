/** Fake iOS status bar shown at the top of every screen */
export function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 bg-white">
      <span className="text-[15px] font-semibold text-black tracking-tight">9:41</span>
      <div className="flex items-center gap-1.5">
        {/* Signal bars */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="black">
          <rect x="0" y="8" width="3" height="4" rx="0.5" />
          <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.5" />
          <rect x="9" y="3" width="3" height="9" rx="0.5" />
          <rect x="13.5" y="0.5" width="3" height="11.5" rx="0.5" opacity="0.3" />
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" fill="black"/>
          <path d="M3.5 6.5C4.9 5.1 6.35 4.4 8 4.4s3.1.7 4.5 2.1" stroke="black" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <path d="M0.5 3.5C2.8 1.3 5.25 0.2 8 0.2s5.2 1.1 7.5 3.3" stroke="black" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
        {/* Battery */}
        <div className="relative flex items-center">
          <div className="h-[12px] w-[25px] rounded-[3px] border border-black/60 p-[2px]">
            <div className="h-full w-full rounded-[1.5px] bg-black" />
          </div>
          <div className="absolute -right-[4px] h-[5px] w-[2px] rounded-r-sm bg-black/40" />
        </div>
      </div>
    </div>
  );
}
