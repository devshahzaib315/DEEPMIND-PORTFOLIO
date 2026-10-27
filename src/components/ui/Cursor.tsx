import { useEffect, useRef } from "react";
import "../../styles/Cursor.css";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    // Fraction of the distance covered per frame (1 = no smoothing).
    const ease = reducedMotion ? 1 : 1 / 6;

    const mouse = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let seen = false; // true after the first real mouse move
    let iconsEl: HTMLElement | null = null; // icon column being hovered
    let rafId = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!seen) {
        // Start exactly under the pointer instead of flying in from (0, 0).
        seen = true;
        pos.x = mouse.x;
        pos.y = mouse.y;
        cursor.classList.add("cursor-ready");
      }
    };
    const onLeave = () => cursor.classList.remove("cursor-ready");
    const onEnter = () => {
      if (seen) cursor.classList.add("cursor-ready");
    };
    document.addEventListener("mousemove", onMouseMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    const loop = () => {
      let tx = mouse.x;
      let ty = mouse.y;
      if (iconsEl && iconsEl.isConnected) {
        // Fresh measurement every frame so the pill always sits on the icons.
        const rect = iconsEl.getBoundingClientRect();
        tx = rect.left;
        ty = rect.top;
        cursor.style.setProperty("--cursorH", `${rect.height}px`);
      }
      pos.x += (tx - pos.x) * ease;
      pos.y += (ty - pos.y) * ease;
      cursor.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    type Handler = { el: HTMLElement; over: EventListener; out: EventListener };
    const handlers: Handler[] = [];

    document.querySelectorAll<HTMLElement>("[data-cursor]").forEach((element) => {
      const over = () => {
        if (element.dataset.cursor === "icons") {
          cursor.classList.add("cursor-icons");
          iconsEl = element;
        }
        if (element.dataset.cursor === "disable") {
          cursor.classList.add("cursor-disable");
        }
      };
      const out = () => {
        cursor.classList.remove("cursor-disable", "cursor-icons");
        iconsEl = null;
      };
      element.addEventListener("mouseover", over);
      element.addEventListener("mouseout", out);
      handlers.push({ el: element, over, out });
    });

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(rafId);
      handlers.forEach(({ el, over, out }) => {
        el.removeEventListener("mouseover", over);
        el.removeEventListener("mouseout", out);
      });
    };
  }, []);

  return <div className="cursor-main" ref={cursorRef} aria-hidden="true"></div>;
};

export default Cursor;
