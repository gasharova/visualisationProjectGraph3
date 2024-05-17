<script>
    import { onMount } from 'svelte';
  
    let canvas;
  
    const width = 400;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 150;
    const axisLength = radius + 50; // Extend the axis beyond the pentagon
  
    onMount(() => {
      drawPentagonGraph();
    });
  
    function drawPentagonGraph() {
      const ctx = canvas.getContext('2d');
  
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
  
      // Draw Pentagon
      ctx.beginPath();
      for (let i = 0; i <= 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 + Math.PI / 2; // Adjust angle for upside down
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
  
      // Draw Axis Lines
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 + Math.PI / 2; // Adjust angle for upside down
        const x = centerX + axisLength * Math.cos(angle);
        const y = centerY + axisLength * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  </script>
  
  <canvas bind:this={canvas} width={width} height={height}></canvas>
  
  <style>
    canvas {
      border: 1px solid black;
    }
  </style>
  