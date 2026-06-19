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

  const computeStyle = useCallback(() => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    const margin = 8;
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    const spaceBelow = vh - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const flipUp = spaceBelow < 200 && spaceAbove > spaceBelow;

    const maxHeight = Math.max(120, flipUp ? spaceAbove : spaceBelow);

    let left = rect.left;
    if (left + rect.width > vw - margin) {
      left = Math.max(margin, vw - rect.width - margin);
    }

    const base = {
      position: "fixed",
      left,
      width: rect.width,
      maxHeight,
      overflowY: "auto",
      zIndex: 99999,
    };
    if (flipUp) {
      base.bottom = vh - rect.top + 2;
    } else {
      base.top = rect.bottom + 2;
    }
    return base;
  }, []);

  const openDropdown = useCallback(() => {
    const s = computeStyle();
    if (s) setStyle(s);
    setOpen(true);
  }, [computeStyle]);

  useEffect(() => {
    if (!open) return;
    const update = () => {
      const s = computeStyle();
      if (s) setStyle(s);
    };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, computeStyle]);

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
