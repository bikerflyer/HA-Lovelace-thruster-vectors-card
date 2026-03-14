class ThrusterVectorsCard extends HTMLElement {
  setConfig(config) {
    this.config = config;
    this.attachShadow({ mode: 'open' });

    this.canvas = document.createElement('canvas');
    this.canvas.width = 420;
    this.canvas.height = 520;
    this.shadowRoot.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
  }

  set hass(hass) {
    if (!this.config.entities || this.config.entities.length !== 8) return;

    const values = this.config.entities.map(e => {
      const s = hass.states[e];
      return s ? parseFloat(s.state) || 0 : 0;
    });

    this.draw(values);
  }

  draw(thrusterVals) {
    const ctx = this.ctx;
    const c = this.canvas;
    ctx.clearRect(0, 0, c.width, c.height);

    const squareSize = 160;
    const topOrigin = { x: c.width / 2 - squareSize / 2, y: 60 };
    const bottomOrigin = { x: c.width / 2 - squareSize / 2, y: 290 };
    const arrowLen = 42;

    const positions = [
      [topOrigin.x, topOrigin.y],                                   // T1 FP
      [topOrigin.x + squareSize, topOrigin.y],                      // T2 FS
      [topOrigin.x + squareSize, topOrigin.y + squareSize],         // T3 RS
      [topOrigin.x, topOrigin.y + squareSize],                      // T4 RP

      [bottomOrigin.x, bottomOrigin.y],                             // T5 FP vertical
      [bottomOrigin.x + squareSize, bottomOrigin.y],                // T6 FS vertical
      [bottomOrigin.x + squareSize, bottomOrigin.y + squareSize],   // T7 RS vertical
      [bottomOrigin.x, bottomOrigin.y + squareSize]                 // T8 RP vertical
    ];

    // EXHAUST direction for POSITIVE command
    //
    // Horizontal thrusters all face the same way:
    // positive thrust direction:
    //   T1 = forward-left
    //   T2 = forward-right
    //   T3 = forward-right
    //   T4 = forward-left
    //
    // But this card shows EXHAUST, so arrows are reversed:
    //   T1 = rear-right
    //   T2 = rear-left
    //   T3 = rear-left
    //   T4 = rear-right
    //
    // Vertical thrusters:
    // positive/forward = UP thrust
    // exhaust therefore points DOWN
    const angles = [
      135,   // T1 exhaust rear-right
      45,  // T2 exhaust rear-left
      135,  // T3 exhaust rear-left
      45,   // T4 exhaust rear-right
      90,   // T5 exhaust down
      90,   // T6 exhaust down
      90,   // T7 exhaust down
      90    // T8 exhaust down
    ].map(deg => deg * Math.PI / 180);

    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Horizontal Thrusters (T1-T4)', topOrigin.x - 10, 30);
    ctx.fillText('Vertical Thrusters (T5-T8)', bottomOrigin.x - 10, 260);

    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(topOrigin.x, topOrigin.y, squareSize, squareSize);
    ctx.strokeRect(bottomOrigin.x, bottomOrigin.y, squareSize, squareSize);

    ctx.fillStyle = '#000';
    ctx.font = '12px sans-serif';
    ctx.fillText('BOW', topOrigin.x + squareSize / 2 - 16, topOrigin.y - 12);
    ctx.fillText('BOW', bottomOrigin.x + squareSize / 2 - 16, bottomOrigin.y - 12);

    for (let i = 0; i < 8; i++) {
      const power = thrusterVals[i];
      const [baseX, baseY] = positions[i];
      const angle = angles[i];

      ctx.beginPath();
      ctx.arc(baseX, baseY, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#666';
      ctx.fill();

      const length = (power / 100) * arrowLen;
      const endX = baseX + Math.cos(angle) * length;
      const endY = baseY + Math.sin(angle) * length;

      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = power >= 0 ? '#1565c0' : '#c62828';
      ctx.lineWidth = 4;
      ctx.stroke();

      const headLen = 8;
      const drawAngle = power >= 0 ? angle : angle + Math.PI;
      const a1 = drawAngle + Math.PI / 7;
      const a2 = drawAngle - Math.PI / 7;

      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - headLen * Math.cos(a1), endY - headLen * Math.sin(a1));
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - headLen * Math.cos(a2), endY - headLen * Math.sin(a2));
      ctx.stroke();

      ctx.fillStyle = '#000';
      ctx.font = '12px sans-serif';
      ctx.fillText(`T${i + 1}: ${Math.round(thrusterVals[i])}`, baseX + 10, baseY - 10);
    }

    ctx.fillStyle = '#1565c0';
    ctx.fillRect(20, c.height - 40, 16, 4);
    ctx.fillStyle = '#000';
    ctx.font = '12px sans-serif';
    ctx.fillText('Positive command exhaust', 45, c.height - 34);

    ctx.fillStyle = '#c62828';
    ctx.fillRect(230, c.height - 40, 16, 4);
    ctx.fillStyle = '#000';
    ctx.fillText('Negative command exhaust', 255, c.height - 34);
  }

  getCardSize() {
    return 5;
  }
}

customElements.define('thruster-vectors-card', ThrusterVectorsCard);
