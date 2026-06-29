export default function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer" onClick={() => onChange(!checked)}>
      <div className={`w-11 h-6 rounded-full transition-colors duration-300 ${checked ? 'bg-blue-400' : 'bg-gray-300'}`} />
      <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300"
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(0px)' }} />
    </label>
  );
}
