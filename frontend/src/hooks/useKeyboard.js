import { useEffect } from "react";

/**
 * useKeyboard — register a keyboard shortcut anywhere in the app.
 *
 * @example
 * useKeyboard("k", { meta: true }, () => openCommandPalette());
 */
export default function useKeyboard(key, modifiers = {}, callback) {
  useEffect(() => {
    const handler = (e) => {
      const metaOk  = !modifiers.meta  || e.metaKey  || e.ctrlKey;
      const shiftOk = !modifiers.shift || e.shiftKey;
      const altOk   = !modifiers.alt   || e.altKey;
      if (e.key.toLowerCase() === key.toLowerCase() && metaOk && shiftOk && altOk) {
        e.preventDefault();
        callback(e);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, modifiers, callback]);
}
