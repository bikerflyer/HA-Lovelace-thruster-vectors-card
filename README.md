# Thruster Vectors Card (Home Assistant)

A lightweight custom Lovelace card that visualizes **8 thruster commands** as vector arrows on a 2×2 grid (fore/aft) with per-thruster labels. Designed for ROV/ROV-like vehicles where each thruster is driven by a `-100…100` command.

![screenshot](docs/screenshot.png)

## Features
- 🧭 **8 thrusters** shown as two stacked 2×2 quads (T1–T4 top, T5–T8 bottom)
- ➡️ **Vector arrows** sized by command magnitude
- 🔵 **Blue = forward**, 🔴 **Red = reverse**
- 🔢 Per-thruster numeric labels (rounded)
- ⚡ Super small & fast (plain Canvas, no deps)

---

## Installation

1) **Save the card file**
- Copy `thruster-vectors-card.js` to your HA config:
  ```
  /config/www/thruster-vectors-card.js
  ```
  (Create the `www` folder if it doesn’t exist.)

2) **Add a resource**
- Settings → Dashboards → (⋮) → *Resources* → **Add resource**  
  - URL: `/local/thruster-vectors-card.js?v=1`  
  - Type: **Module**

3) **Hard-refresh** your browser  
   - Chrome/Edge: Ctrl+F5 (Cmd+Shift+R on macOS)

> Tip: When you edit the JS later, bump the `?v=` number to defeat cache.

---

## Usage

Add a card to your dashboard:

```yaml
type: custom:thruster-vectors-card
title: Thrusters
entities:
  - sensor.thruster_1_cmd
  - sensor.thruster_2_cmd
  - sensor.thruster_3_cmd
  - sensor.thruster_4_cmd
  - sensor.thruster_5_cmd
  - sensor.thruster_6_cmd
  - sensor.thruster_7_cmd
  - sensor.thruster_8_cmd
```

### Expected entity values
- Each entity should be a **number** in the range **-100…100**  
  (`-100` = full reverse, `0` = stop, `+100` = full forward)

If you’re publishing a combined MQTT JSON like:
```json
{"thr":[t1,t2,t3,t4,t5,t6,t7,t8]}
```
you can create 8 MQTT sensors in HA like:

```yaml
mqtt:
  sensor:
    - name: "Thruster 1 Cmd"
      state_topic: rov/thrusters/set
      value_template: "{{ (value_json.thr[0] | float(0)) | round(0) }}"
      unit_of_measurement: "%"
      expire_after: 3
    # repeat for thr[1]..thr[7]
```

---

## How it works (quick code tour)

```js
class ThrusterVectorsCard extends HTMLElement {
  setConfig(config) {
    this.config = config;
    this.attachShadow({ mode: 'open' });
    this.canvas = document.createElement('canvas');
    this.canvas.width = 400;   // <— canvas size (edit if you like)
    this.canvas.height = 500;
    this.shadowRoot.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  }

  set hass(hass) {
    if (!this.config.entities || this.config.entities.length !== 8) return;
    const values = this.config.entities.map(e => hass.states[e]?.state || 0);
    this.draw(values.map(v => parseFloat(v)));
  }

  // ... draw() renders two 2×2 grids with arrows & labels ...
}

customElements.define('thruster-vectors-card', ThrusterVectorsCard);
```

- **Angles** are hard-coded for each thruster (up-left, up-right, etc.)
- **Reversed thrusters** are handled by flipping selected indices

---

## Configuration / Customization

This first version keeps options simple (no YAML options yet). You can tweak behavior by editing the small arrays in `draw()`:

- **Thruster positions** (2×2 grids):
  ```js
  const origin1 = { x: c.width / 2 - squareSize / 2, y: 50  };
  const origin2 = { x: c.width / 2 - squareSize / 2, y: 250 };
  ```
  Move these or change `squareSize` to reposition the quads.

- **Per-thruster directions** (degrees → radians):
  ```js
  const angles = [-135, -45, 45, 135, 135, 45, 45, 135].map(d => d * Math.PI / 180);
  ```
  Adjust to match your physical thruster orientations.

- **Reverse certain thrusters**:
  ```js
  const reversedThrusters = [0, 2, 4, 6]; // 0-based indices (T1,T3,T5,T7)
  ```
  Add/remove indices to flip sign on any channel.

- **Arrow length & line width**:
  ```js
  const arrowLen = 40;    // scale for 100%
  ctx.lineWidth = 4;      // stroke width
  ```
  Tune to your display.

---

## Troubleshooting

- **Card says “Custom element doesn’t exist”**  
  → The resource isn’t loaded. Check **Settings → Dashboards → Resources** has  
  `/local/thruster-vectors-card.js?v=1` (type **Module**). Hard-refresh your browser.

- **Nothing renders**  
  → Ensure you pass **exactly 8 entities** and each resolves to a numeric state.  
  Unknown/unavailable states are treated as `0`.

- **Arrows point the “wrong” way**  
  → Update the `angles` array and/or the `reversedThrusters` list to match your layout.

- **Values look scaled weirdly**  
  → The card assumes `-100…100`. If your pipeline uses another range, normalize in HA (Template Sensor) or Node-RED before feeding the card.

---

## Roadmap / Ideas
- YAML options for angles, reversed indices, colors, sizes
- Auto-layout for 4, 6, or 8 thrusters
- Color themes (HA light/dark)
- Hover tooltips with exact values

---

## Development

- Edit `thruster-vectors-card.js` under `/config/www/`
- Keep DevTools open and enable **Disable cache**
- Bump the resource query string `?v=` to force reloads

---

## License

MIT — do what you like, attribution appreciated.

---

## Credits

Built for Home Assistant dashboards; inspired by typical ROV vector visualizers. PRs welcome!
