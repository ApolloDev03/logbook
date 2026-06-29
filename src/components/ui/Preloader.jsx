export default function Preloader({ show }) {
  if (!show) return null;

  return (
    <div className="fixed left-0 top-0 z-[999999] flex h-screen w-screen items-center justify-center bg-white dark:bg-gray-900">
      <div className="h-[64px] w-[64px] animate-spin rounded-full border-[4px] border-brand-500 border-r-transparent border-b-transparent" />
    </div>
  );
}