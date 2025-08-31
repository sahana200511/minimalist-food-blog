import React, { useEffect } from "react";

const ingredients = [
  "🍅", "🥕", "🌶️", "🍄", "🥦", "🍆", "🥔", "🧄", "🧅", "🌽"
];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function FallingIngredients() {
  useEffect(() => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.pointerEvents = "none";
    container.style.zIndex = "0";
    document.body.appendChild(container);

    const drops = [];

    for (let i = 0; i < 30; i++) {
      const drop = document.createElement("div");
      drop.textContent = ingredients[Math.floor(Math.random() * ingredients.length)];
      drop.style.position = "absolute";
      drop.style.fontSize = `${random(16, 32)}px`;
      drop.style.left = `${random(0, window.innerWidth)}px`;
      drop.style.top = `${random(-100, -40)}px`;
      drop.style.opacity = random(0.5, 0.9);
      drop.style.animation = `fall ${random(5, 10)}s linear infinite`;
      container.appendChild(drop);
      drops.push(drop);
    }

    const style = document.createElement("style");
    style.textContent = `
      @keyframes fall {
        0% {
          transform: translateY(0);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      drops.forEach(drop => container.removeChild(drop));
      if (container.parentNode) container.parentNode.removeChild(container);
      if (style.parentNode) style.parentNode.removeChild(style);
    };
  }, []);

  return null;
}

export default FallingIngredients;
