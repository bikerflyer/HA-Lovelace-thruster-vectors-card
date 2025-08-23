class ThrusterVectorsCard extends HTMLElement {
  setConfig(config) {
    this.config = config;
    this.attachShadow({ mode: 'open' });
    this.canvas = document.createElement('canvas');
    this.canvas.width = 400;
    this.canvas.height = 500;
    this.shadowRoot.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  }

  set hass(hass) {
    if (!this.config.entities || this.config.entities.length !== 8) return;
    const values = this.config.entities.map(e => hass.states[e]?.state || 0);
    this.draw(values.map(v => parseFloat(v)));
  }

  draw(thrusterVals) {
    const ctx = this.ctx;
    const c = this.canvas;
    ctx.clearRect(0, 0, c.width, c.height);

    const squareSize = 160;
    const spacing = 60;
    const origin1 = { x: c.width / 2 - squareSize / 2, y: 50 };
    const origin2 = { x: c.width / 2 - squareSize / 2, y: 250 };
    const arrowLen = 40;

    const positions = [
      [origin1.x, origin1.y],                          // T1
      [origin1.x + squareSize, origin1.y],             // T2
      [origin1.x + squareSize, origin1.y + squareSize],// T3
      [origin1.x, origin1.y + squareSize],             // T4
      [origin2.x, origin2.y],                          // T5
      [origin2.x + squareSize, origin2.y],             // T6
      [origin2.x + squareSize, origin2.y + squareSize],// T7
      [origin2.x, origin2.y + squareSize]              // T8
    ];

    // Define angles for each thruster in radians
    const angles = [
      -135, // T1: up-left
      -45,  // T2: up-right
      45,   // T3: down-right
      135,  // T4: down-left
      135,  // T5: down-left
      45,   // T6: down-right
      45,   // T7: down-right
      135   // T8: down-left
    ].map(deg => deg * Math.PI / 180); // convert degrees to radians

    const reversedThrusters = [0, 2, 4, 6]; // T1, T3, T5, T7 (T2 removed)

    for (let i = 0; i < 8; i++) {
      let power = thrusterVals[i];
      if (reversedThrusters.includes(i)) power *= -1;

      const [baseX, baseY] = positions[i];
      const angle = angles[i];

      // Draw thruster dot
      ctx.beginPath();
      ctx.arc(baseX, baseY, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#888';
      ctx.fill();

      // Draw thrust arrow
      const length = (power / 100) * arrowLen;
      const endX = baseX + Math.cos(angle) * length;
      const endY = baseY + Math.sin(angle) * length;

      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = power >= 0 ? 'blue' : 'red';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Label power
      ctx.fillStyle = '#000';
      ctx.font = '12px sans-serif';
      ctx.fillText(`T${i + 1}: ${Math.round(thrusterVals[i])}`, baseX + 10, baseY - 10);
    }
  }

  getCardSize() {
    return 4;
  }
}

customElements.define('thruster-vectors-card', ThrusterVectorsCard);

