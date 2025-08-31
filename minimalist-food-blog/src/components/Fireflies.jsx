import React, { useEffect } from "react";

const NUM_FIREFLIES = 30;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function Fireflies() {
  useEffect(() => {
    const fireflies = [];

    for (let i = 0; i < NUM_FIREFLIES; i++) {
      const firefly = document.createElement("div");
      firefly.classList.add("firefly");
      firefly.style.width = `${random(5, 15)}px`;
      firefly.style.height = firefly.style.width;
      firefly.style.top = `${random(0, window.innerHeight)}px`;
      firefly.style.left = `${random(0, window.innerWidth)}px`;
      firefly.style.animationName = `move${i}`;
      firefly.style.animationDuration = `${random(4, 8)}s`;
      firefly.style.animationDelay = `${random(0, 5)}s`;
      firefly.style.animationDirection = Math.random() > 0.5 ? "normal" : "reverse";
      firefly.style.opacity = random(0.3, 0.9);

      // Add keyframes for this firefly
      const style = document.createElement("style");
      style.textContent = `
        @keyframes move${i} {
          0% {
            transform: translate(${random(-100, 100)}px, ${random(-100, 100)}px);
          }
          25% {
            transform: translate(${random(-100, 100)}px, ${random(-100, 100)}px);
          }
          50% {
            transform: translate(${random(-100, 100)}px, ${random(-100, 100)}px);
          }
          75% {
            transform: translate(${random(-100, 100)}px, ${random(-100, 100)}px);
          }
          100% {
            transform: translate(${random(-100, 100)}px, ${random(-100, 100)}px);
          }
        }
      `;
      document.head.appendChild(style);

      document.body.appendChild(firefly);
      fireflies.push(firefly);
    }

    return () => {
      fireflies.forEach(firefly => {
        if (firefly.parentNode) {
          firefly.parentNode.removeChild(firefly);
        }
      });
    };
  }, []);

  return null;
}

export default Fireflies;
