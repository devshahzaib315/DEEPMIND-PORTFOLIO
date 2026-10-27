
import { SplitText } from "gsap/SplitText";
import gsap from "gsap";
import { getSmoother } from "./smootherRegistry";

export function initialFX() {
  document.body.style.overflowY = "auto";
  getSmoother()?.paused(false);
  document.querySelector("main")?.classList.add("main-active");

  gsap.to("body", {
    backgroundColor: getComputedStyle(document.documentElement)
      .getPropertyValue("--backgroundColor")
      .trim(),
    duration: 0.5,
    delay: 1,
    onComplete: () => {
      gsap.set("body", { clearProps: "backgroundColor" });
    },
  });

  const landingText = new SplitText(
    [".landing-info h3", ".landing-intro h2", ".landing-intro h1"],
    {
      type: "chars,lines",
      linesClass: "split-line",
    }
  );

  gsap.fromTo(
    landingText.chars,
    { opacity: 0, y: 80, filter: "blur(5px)" },
    {
      opacity: 1,
      duration: 1.2,
      filter: "blur(0px)",
      ease: "power3.inOut",
      y: 0,
      stagger: 0.025,
      delay: 0.3,
    }
  );

  gsap.fromTo(
    ".landing-info-h2",
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power1.inOut",
      y: 0,
      delay: 0.8,
    }
  );

  gsap.fromTo(
    [".header", ".icons-section", ".nav-fade"],
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power1.inOut",
      delay: 0.1,
    }
  );

  startWordRotation();
}

function startWordRotation() {
  const words = [
    "Designer",
    "Engineer",
    "Coder",
    "Frontend",
    "Developer",
  ];

  const targets = [
    ".landing-h2-1",
    ".landing-h2-2",
    ".landing-h2-info-1",
  ];

  targets.forEach((selector) => {
    const elements = document.querySelectorAll(selector);

    elements.forEach((element) => {
      const el = element as HTMLElement;

      if (el.dataset.rotationReady === "true") return;
      el.dataset.rotationReady = "true";

      let index = 0;
      el.textContent = words[index];

      const rotate = () => {
        const nextIndex = (index + 1) % words.length;

        gsap.to(el, {
          y: -12,
          opacity: 0,
          duration: 0.25,
          ease: "power2.in",
          onComplete: () => {
            index = nextIndex;
            el.textContent = words[index];

            gsap.fromTo(
              el,
              { y: 12, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.35,
                ease: "power2.out",
              }
            );
          },
        });
      };

      gsap.delayedCall(5, function tick() {
        rotate();
        gsap.delayedCall(5, tick);
      });
    });
  });
}
