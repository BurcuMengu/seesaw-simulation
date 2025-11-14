# Seesaw Simulation

This seesaw simulation project was build with plain HTML, CSS, and vanilla JavaScript.
When the canvas gets clicked, a weight between 1 and 10 kg is spawned and its torque is
added to the relevant side, tilting the plank up to +/-30 degrees. The whole state is kept
inside `localStorage`, so page refreshes do not reset anything unless the reset button gets
pressed.

---

## Features & Requirement Coverage
- Torque per side is calculated as `weight * distance`, and the final angle is clamped to +/-30 deg.
- The pivot is fixed in the middle of a 400 px plank, keeping both arms visually balanced.
- Each click results in a ball being spawned at that exact point, staying attached to the board.
- Live stats are shown for total left/right weight, the upcoming random weight, and the tilt angle.
- A reset button is provided so that arrays, DOM balls, log, and saved state are cleared.
- No frameworks or extra libraries are included

---

## Core Logic
On each click the pointer position is projected onto the current plank axis to obtain a signed
distance from the pivot. By doing that, the side and the distance of the new weight are known.
Four arrays are maintained: `leftWeightList`, `rightWeightList`, `leftDistanceList`, `rightDistanceList`.
After every drop the torque is recalculated as shown here:

```
torqueLeft  = sum(weight_i * distance_i)
torqueRight = sum(weight_j * distance_j)
angle       = clamp((torqueRight - torqueLeft) / 10, -30, 30)
```

The plank is rotated to `angle`, and every existing ball is repositioned according to its saved signed
distance. This way no drifting appears when the board tilts or when the window resize happens.

---

## Visualization & Interaction
- `index.html` provides the layout for stats, the seesaw container, the pivot, the plank, and controls.
- `main.css` supplies colors, draws the pivot triangle, and applies the subtle "fall" transition to balls.
- Each ball is rendered as an absolutely positioned circle whose color and size depend on its weight, so heavy drops feel heavier.

---

## Persistence
For every drop, a snapshot containing the weights, distances, current angle, next weight, log HTML, and ball
metadata is written into `localStorage`. During the next load this snapshot is read again, the arrays are rebuilt,
ball elements are created, and the board angle is restored so the previous state is still visible.

---

## Design Decisions & Trade-offs
- **Ball state management.** Raw x/y coordinates were stored first, but drifting happened once the plank rotated.
  The signed distance option was adopted, keeping the balls glued to the board even when the window gets resized.
- **CSS transforms.** Combined `translate` and `rotate` usage on the plank and its invisible click layer caused confusion.
  A single source of truth, `currentAngle`, was introduced and other values are re-computed using it.
- **AI assistance.** Guidance from ChatGPT was requested while reorganising the ball state and the transform calculations.
  The code was rewritten manually afterwards and some hints are added as comments to make it more understandable for the reader.

---

## Running Locally
1. The repository can be cloned or downloaded.
2. `index.html` should be opened in any modern browser.
3. The plank can be clicked around, stats can be observed, and reset can be pressed to start over.

---

## Future Ideas
- Easing could be added to the plank rotation to make it move more smoother.
- The clickable zone might be made tighter around the board surface to reduce accidental drops.
- A small sound or particle effect could be played when a weight lands.
- A subtle grid might be drawn to show the distance from the pivot.
