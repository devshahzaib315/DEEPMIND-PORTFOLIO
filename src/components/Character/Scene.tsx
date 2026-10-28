import { useEffect, useRef } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../ui/Loading";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  useEffect(() => {
    const container = canvasDiv.current;
    if (!container) return;

    const isMobile = window.innerWidth <= 1024;

    if (isMobile) {
      container.style.height = "100vh";
      container.style.minHeight = "100svh";
    }

    const rect = container.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height =
      rect.height || (isMobile ? window.innerHeight : window.innerHeight);
    const aspect = width / height;
    const scene = sceneRef.current;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild(renderer.domElement);

    const onContextLost = (e: Event) => e.preventDefault();
    const onContextRestored = () =>
      renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);
    renderer.domElement.addEventListener(
      "webglcontextrestored",
      onContextRestored
    );

    const camera = new THREE.PerspectiveCamera(
      isMobile ? 24 : 14.5,
      aspect,
      0.1,
      1000
    );

    if (isMobile) {
      // Camera thoda peeche aur upar — pura face + body dikhe
      camera.position.set(0, 12.8, 22);
      camera.zoom = 0.82;
    } else {
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
    }
    camera.updateProjectionMatrix();

    let headBone: THREE.Object3D | null = null;
    let screenLight: THREE.Mesh | null = null;
    let mixer: THREE.AnimationMixer | undefined;
    let loadedCharacter: THREE.Object3D | null = null;
    let hoverCleanup: (() => void) | void;

    const clock = new THREE.Clock();
    const light = setLighting(scene);
    const progress = setProgress((value) => setLoading(value));
    const { loadCharacter } = setCharacter(renderer, scene, camera);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let mouse = { x: 0, y: 0 };
    let interpolation = { x: 0.1, y: 0.2 };
    let touchDebounce: number | undefined;
    let touchMoveHandler: ((e: TouchEvent) => void) | null = null;
    let touchMoveTarget: HTMLElement | null = null;

    const onMouseMove = (event: MouseEvent) => {
      handleMouseMove(event, (x, y) => (mouse = { x, y }));
    };

    const onTouchStart = (event: TouchEvent) => {
      const element = event.target as HTMLElement;
      touchDebounce = window.setTimeout(() => {
        touchMoveHandler = (e: TouchEvent) =>
          handleTouchMove(e, (x, y) => (mouse = { x, y }));
        touchMoveTarget = element;
        element.addEventListener("touchmove", touchMoveHandler);
      }, 200);
    };

    const onTouchEnd = () => {
      if (touchMoveHandler && touchMoveTarget) {
        touchMoveTarget.removeEventListener("touchmove", touchMoveHandler);
        touchMoveHandler = null;
        touchMoveTarget = null;
      }
      handleTouchEnd((x, y, interpolationX, interpolationY) => {
        mouse = { x, y };
        interpolation = { x: interpolationX, y: interpolationY };
      });
    };

    document.addEventListener("mousemove", onMouseMove);
    const landingDiv = document.getElementById("landingDiv");
    if (landingDiv) {
      landingDiv.addEventListener("touchstart", onTouchStart);
      landingDiv.addEventListener("touchend", onTouchEnd);
    }

    let resizeTimer: number | undefined;
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;
        if (loadedCharacter) {
          handleResize(renderer, camera, canvasDiv, loadedCharacter);
        }
      }, 150);
    };
    window.addEventListener("resize", onResize);

    let isVisible = true;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { rootMargin: "100px" }
    );
    io.observe(container);

    loadCharacter()
      .then((gltf) => {
        if (!gltf) return null;
        try {
          const animations = setAnimations(gltf);
          if (hoverDivRef.current) {
            hoverCleanup = animations.hover(hoverDivRef.current);
          }
          mixer = animations.mixer;
          const character = gltf.scene;
          loadedCharacter = character;
          scene.add(character);
          headBone = character.getObjectByName("spine006") || null;
          const sl = character.getObjectByName("screenlight");
          screenLight = (sl as THREE.Mesh) || null;
          return animations;
        } catch {
          return null;
        }
      })
      .catch(() => null)
      .then((animations) => {
        progress.loaded().then(() => {
          setTimeout(
            () => {
              light.turnOnLights();
              if (animations && !reducedMotion) animations.startIntro();
            },
            reducedMotion ? 0 : 2500
          );
        });
      });

    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (!isVisible) return;
      if (headBone) {
        handleHeadRotation(
          headBone,
          mouse.x,
          mouse.y,
          interpolation.x,
          interpolation.y,
          THREE.MathUtils.lerp
        );
        if (screenLight) light.setPointLight(screenLight);
      }
      const delta = Math.min(clock.getDelta(), 0.1);
      if (mixer) mixer.update(delta);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      progress.cancel();
      if (touchDebounce) clearTimeout(touchDebounce);
      if (resizeTimer) clearTimeout(resizeTimer);
      io.disconnect();

      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      if (landingDiv) {
        landingDiv.removeEventListener("touchstart", onTouchStart);
        landingDiv.removeEventListener("touchend", onTouchEnd);
      }
      if (touchMoveHandler && touchMoveTarget) {
        touchMoveTarget.removeEventListener("touchmove", touchMoveHandler);
      }
      if (typeof hoverCleanup === "function") hoverCleanup();

      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const material = mesh.material;
          if (Array.isArray(material)) {
            material.forEach((m) => disposeMaterial(m));
          } else if (material) {
            disposeMaterial(material);
          }
        }
      });
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        onContextRestored
      );
      light.dispose();
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [setLoading]);

  return (
    <div className="character-container" aria-hidden="true">
      <div className="character-model" ref={canvasDiv}>
        <div className="character-rim"></div>
        <div className="character-hover" ref={hoverDivRef}></div>
      </div>
    </div>
  );
};

function disposeMaterial(material: THREE.Material) {
  const m = material as THREE.MeshStandardMaterial;
  m.map?.dispose();
  m.normalMap?.dispose();
  m.roughnessMap?.dispose();
  m.metalnessMap?.dispose();
  m.emissiveMap?.dispose();
  m.aoMap?.dispose();
  material.dispose();
}

export default Scene;
