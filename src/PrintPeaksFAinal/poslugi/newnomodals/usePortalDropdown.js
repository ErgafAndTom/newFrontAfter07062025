import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Хук для dropdown що рендериться через portal (position: fixed).
 * Вирішує проблему overflow:hidden у батьківських контейнерах.
 */
export function usePortalDropdown() {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  const triggerRef = useRef(null);
  const portalRef = useRef(null);

  const openDropdown = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setStyle({
        position: "fixed",
        top: rect.bottom + 2,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
      });
    }
    setOpen(true);
  }, []);

  const toggle = useCallback(() => {
    if (open) {
      setOpen(false);
    } else {
      openDropdown();
    }
  }, [open, openDropdown]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const inTrigger = triggerRef.current?.contains(e.target);
      const inPortal = portalRef.current?.contains(e.target);
      if (!inTrigger && !inPortal) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return { open, setOpen, style, toggle, triggerRef, portalRef };
}
