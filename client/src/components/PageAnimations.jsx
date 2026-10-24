import { useLocation } from "react-router";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(useGSAP);

function PageAnimations() {
  const { pathname } = useLocation();

  useGSAP(
    (_, contextSafe) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const animatedElements = new WeakSet();

      const animateElements = contextSafe((root) => {
        const elements = [];

        if (
          root instanceof Element &&
          root.matches("[data-gsap='reveal'], [data-gsap='intro']")
        ) {
          elements.push(root);
        }

        if (root.querySelectorAll) {
          elements.push(
            ...root.querySelectorAll(
              "[data-gsap='reveal'], [data-gsap='intro']",
            ),
          );
        }

        elements.forEach((element) => {
          if (animatedElements.has(element)) return;
          animatedElements.add(element);

          const isIntro = element.dataset.gsap === "intro";
          const siblingIndex = Array.from(element.parentElement?.children ?? [])
            .filter((sibling) => sibling.matches("[data-gsap='reveal']"))
            .indexOf(element);

          gsap.fromTo(
            element,
            { autoAlpha: 0, y: isIntro ? 20 : 28 },
            {
              autoAlpha: 1,
              y: 0,
              duration: isIntro ? 0.7 : 0.65,
              delay: isIntro ? 0 : Math.min(siblingIndex, 4) * 0.06,
              ease: "power3.out",
              ...(isIntro
                ? {}
                : {
                    scrollTrigger: {
                      trigger: element,
                      start: "top 90%",
                      once: true,
                    },
                  }),
            },
          );
        });
      });

      animateElements(document.body);

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach(animateElements);
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });

      return () => observer.disconnect();
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}

export default PageAnimations;
