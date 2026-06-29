export default function Checkbox({ checked, onChange, id, label }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center text-sm font-medium text-gray-700 select-none dark:text-gray-400">
      <div className="relative mr-3">
        <input type="checkbox" id={id} className="sr-only" checked={checked} onChange={onChange} />
        <div className={`flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] transition-colors
          ${checked ? 'border-brand-500 bg-brand-500' : 'border-gray-300 bg-transparent dark:border-gray-700'}`}>
          <span className={checked ? '' : 'opacity-0'}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11.67 3.5L5.25 9.92L2.33 7" stroke="white" strokeWidth="1.94" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </div>
      {label}
    </label>
  );
}
