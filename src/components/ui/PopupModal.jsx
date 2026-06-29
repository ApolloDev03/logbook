import { useEffect } from "react";

export default function PopupModal({
  open,
  onClose,
  children,
  maxWidth = "max-w-[700px]",
  className = "",
  bodyClassName = "",
}) {
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-gray-900/45 px-4 py-6 backdrop-blur-[1px] ${className}`}
      onClick={onClose}
    >
      <div
        className={`scrollbar-hide relative max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 sm:p-8 md:p-11 ${maxWidth} ${bodyClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}