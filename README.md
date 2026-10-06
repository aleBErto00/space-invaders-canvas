# Retro Space Invaders - HTML5 Canvas

A classic 2D arcade shooter built from scratch using modern Vanilla JavaScript, CSS, and the native HTML5 Canvas API, without external frameworks or dependencies.

[Live Demo](https://aleBErto00.github.io/space-invaders-canvas/)

---

## Overview

The game reinterprets classic arcade mechanics focusing on clean component separation, collision physics, and modular state management in the browser.

### Key Highlights

- **Native Canvas Rendering:** Direct raster manipulation via 2D Canvas context with requestAnimationFrame loop.
- **Modular Architecture:** Split responsibilities across dedicated modules:
  - `entities.js`: Object models for player, enemies, projectiles, and asteroids.
  - `mechanics.js`: Collision detection (AABB), scoring algorithms, and difficulty scaling.
  - `script.js`: Main loop, input handling, and audio effects synchronization.
- **Audio & Visual Assets:** Integrated sprite mapping and responsive sound triggering using the HTML5 Audio API.

---

## Controls

| Action | Key / Input |
|---|---|
| Move Left | Left Arrow / A |
| Move Right | Right Arrow / D |
| Shoot | Spacebar |
| Restart | Enter / R |

---

## Project Structure

```text
├── images/           # Sprites (aliens, ship, projectiles, asteroids)
├── sounds/           # Audio effects (.wav)
├── color_typo.css    # Typography and color schemes
├── layout.css        # Canvas alignment and UI wrappers
├── entities.js       # Game entities definitions
├── mechanics.js      # Collision rules and game mechanics
├── script.js         # Game loop and event listeners
└── index.html        # Entry point