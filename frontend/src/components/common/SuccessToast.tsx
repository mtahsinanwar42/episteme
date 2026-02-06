import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessToastProps {
  message: string;
  visible: boolean;
  leaving: boolean;
}

export function SuccessToast({ message, visible, leaving }: SuccessToastProps) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (visible) {
      setEntered(false);
      const frame = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(frame);
    }
  }, [visible, message]);

  if (!visible) return null;

  const stateClass = leaving
    ? '-translate-x-full opacity-0'
    : entered
      ? 'translate-x-0 opacity-100'
      : '-translate-x-full opacity-0';

  return (
    <div
      className={`fixed bottom-24 right-4 z-[1000] max-w-[calc(100vw-2rem)] flex items-center gap-3 rounded-xl border border-emerald-300/60 bg-emerald-50 px-4 py-3 text-emerald-900 shadow-xl transition-all duration-300 ${stateClass}`}
      role="status"
      aria-live="polite"
    >
      <CheckCircle className="h-5 w-5 text-emerald-600" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
