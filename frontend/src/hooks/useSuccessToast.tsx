import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { SuccessToast } from "@/components/common/SuccessToast";

interface SuccessToastState {
  message: string;
  visible: boolean;
  leaving: boolean;
}

interface SuccessToastContextValue {
  showSuccessToast: (message: string) => void;
}

const SuccessToastContext = createContext<SuccessToastContextValue | null>(null);

export function SuccessToastProvider({
  children,
  duration = 3000,
}: {
  children: React.ReactNode;
  duration?: number;
}) {
  const [toast, setToast] = useState<SuccessToastState>({
    message: "",
    visible: false,
    leaving: false,
  });

  const timers = useRef<{ hide?: number; remove?: number }>({});

  const clearTimers = () => {
    if (timers.current.hide) {
      window.clearTimeout(timers.current.hide);
    }
    if (timers.current.remove) {
      window.clearTimeout(timers.current.remove);
    }
    timers.current = {};
  };

  const showSuccessToast = (message: string) => {
    clearTimers();
    setToast({ message, visible: true, leaving: false });
  };

  useEffect(() => {
    if (!toast.visible) return;

    timers.current.hide = window.setTimeout(() => {
      setToast((prev) => ({ ...prev, leaving: true }));
    }, duration);

    timers.current.remove = window.setTimeout(() => {
      setToast({ message: "", visible: false, leaving: false });
    }, duration + 300);

    return clearTimers;
  }, [toast.visible, toast.message, duration]);

  return (
    <SuccessToastContext.Provider value={{ showSuccessToast }}>
      {children}
      {createPortal(
        <SuccessToast
          message={toast.message}
          visible={toast.visible}
          leaving={toast.leaving}
        />,
        document.body,
      )}
    </SuccessToastContext.Provider>
  );
}

export function useSuccessToast() {
  const ctx = useContext(SuccessToastContext);
  if (!ctx) {
    throw new Error("useSuccessToast must be used within SuccessToastProvider");
  }
  return ctx;
}
