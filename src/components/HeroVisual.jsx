import { lazy, Suspense, useEffect, useState } from "react";

// Yahan apne purane 3D component ka path likho
const Model3D = lazy(() => import("./Model3D"));

function useIsDesktop() {
  const query = "(min-width: 1024px)";
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

export default function HeroVisual() {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <Suspense fallback={null}>
        <Model3D />
      </Suspense>
    );
  }

  return (
    <img
      className="hero-photo"
      src="/shahzaib.jpeg"
      alt="Shahzaib Ahmed"
      width="600"
      height="704"
      fetchpriority="high"
    />
  );
}
