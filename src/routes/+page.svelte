<script>
    import { onMount } from 'svelte';
  
    let currentYear = 2024;
  
    export let data;
    let averageDaysLate = data.averageDaysLate;
  
    let canvas;
    let tooltip = '';
    let tooltipX = 0;
    let tooltipY = 0;
  
    const width = 800;
    const height = 800;
    const centerX = width / 2;
    const centerY = width / 2;
    const radius = 250;
    const axisLength = radius + 100; // Extend the axis beyond the pentagon
  
    const triangles = [];
  
    onMount(() => {
      drawPentagonGraph();
      canvas.addEventListener('mousemove', handleMouseMove);
    });
  
    function handleMouseMove(event) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      tooltip = '';
      for (const triangle of triangles) {
        if (isPointInTriangle({ x, y }, triangle)) {
          tooltip = triangle.address;
          tooltipX = x;
          tooltipY = y;
          break;
        }
      }
      drawPentagonGraph(); // Redraw the graph to update tooltip
    }
  
    function drawPentagonGraph() {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      triangles.length = 0;
  
      // Draw Pentagon and triangles
      drawPentagon(ctx, centerX, centerY, radius);
  
      // Draw Axis Lines
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2; // Adjust angle for right side up
        const x = centerX + axisLength * Math.cos(angle);
        const y = centerY + axisLength * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
        ctx.lineTo(x, y);
        ctx.stroke();
      }
  
      // Fill triangles with names and store their coordinates and addresses
      for (let i = 0; i < data.distributionCenters.length; i++) {
        const angle1 = (i * 2 * Math.PI) / 5 - Math.PI / 2; // Start angle
        const angle2 = ((i + 1) * 2 * Math.PI) / 5 - Math.PI / 2; // End angle
        const x1 = centerX + radius * Math.cos(angle1);
        const y1 = centerY + radius * Math.sin(angle1);
        const x2 = centerX + radius * Math.cos(angle2);
        const y2 = centerY + radius * Math.sin(angle2);
  
        const address = `${data.distributionCenters[i].PlantStreet}, ${data.distributionCenters[i].PlantCity}, ${data.distributionCenters[i].PlantPostalCode}`;
        triangles.push({ x1, y1, x2, y2, cx: centerX, cy: centerY, address });
  
        drawLabelInTriangle(ctx, centerX, centerY, x1, y1, x2, y2, data.distributionCenters[i].PlantName);
        let plantKey = data.distributionCenters[i].PlantKey;
        let daysLateRecord = averageDaysLate.find(record => record.plantKey === plantKey);
  
        let avgDiffReceiptDate = daysLateRecord?.averageDaysLateForThisPlant[currentYear]?.avgDiffReceiptDate || 0;
        let avgDiffDateYard = daysLateRecord?.averageDaysLateForThisPlant[currentYear]?.avgDiffDateYard || 0;
        let avgDiffVendorShipment = daysLateRecord?.averageDaysLateForThisPlant[currentYear]?.avgDiffVendorShipment || 0;
  
        // Draw bars outside the pentagon sides
        drawBars(ctx, x1, y1, x2, y2, angle1, i, avgDiffReceiptDate, avgDiffDateYard, avgDiffVendorShipment);
      }
  
      // Draw tooltip
      if (tooltip) {
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.fillText(tooltip, tooltipX + 10, tooltipY + 10);
      }
    }
  
    function drawPentagon(ctx, centerX, centerY, radius) {
      ctx.beginPath();
      for (let i = 0; i <= 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2; // Adjust angle for right side up
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
    }
  
    function drawLabelInTriangle(ctx, centerX, centerY, x1, y1, x2, y2, text) {
      // Draw the triangle (optional, can be commented out)
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.stroke();
  
      // Calculate the centroid of the triangle
      const centroidX = (centerX + x1 + x2) / 3;
      const centroidY = (centerY + y1 + y2) / 3;
  
      // Draw the text at the centroid
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, centroidX, centroidY);
    }
  
    function drawBars(ctx, x1, y1, x2, y2, angle, axisIndex, avgDiffReceiptDate, avgDiffDateYard, avgDiffVendorShipment) {
      const coefficient = 20; // for scaling purposes
      const barLengths = {
        goodsReceiptDateBar: avgDiffReceiptDate * coefficient,
        arrivalDateBar: avgDiffDateYard * coefficient,
        vendorShipmentDateBar: avgDiffVendorShipment * coefficient
      };
      const barColors = {
        goodsReceiptDateBar: 'green',
        arrivalDateBar: 'blue',
        vendorShipmentDateBar: 'red'
      };
      const barSpacing = 15; // Spacing between bars
      const barWidth = 50; // Width of each bar
  
      // Calculate the angle perpendicular to the pentagon side
      const sideAngle = Math.atan2(y2 - y1, x2 - x1);
      const perpAngle = sideAngle + Math.PI / 2;
  
      // Draw each bar
      let offset = -((Object.keys(barLengths).length - 1) * (barSpacing + barWidth)) / 2; // Center the bars on the side
      for (const [barName, length] of Object.entries(barLengths)) {
        const startX = (x1 + x2) / 2 + offset * Math.cos(sideAngle);
        const startY = (y1 + y2) / 2 + offset * Math.sin(sideAngle);
        const endX = startX - length * Math.cos(perpAngle); // Change direction to outward
        const endY = startY - length * Math.sin(perpAngle); // Change direction to outward
  
        const path = new Path2D();
        path.moveTo(startX, startY);
        path.lineTo(endX, endY);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.lineWidth = barWidth;
        ctx.strokeStyle = barColors[barName];
        ctx.stroke();
        ctx.lineWidth = 1; // Reset line width
        ctx.strokeStyle = 'black'; // Reset stroke color
  
        // Project the bar length to the nearest axis
        const projAngle = angle; // Use the original angle for projection
        const projX = centerX + (radius + length) * Math.cos(projAngle);
        const projY = centerY + (radius + length) * Math.sin(projAngle);
  
        // Draw the projected line
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(projX, projY);
        ctx.strokeStyle = 'gray';
        ctx.stroke();
        ctx.strokeStyle = 'black'; // Reset stroke color
  
        // Label the axis at the intersection point
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(length / coefficient + ' d', projX, projY);
  
        // Update offset for next bar
        offset += barSpacing + barWidth;
      }
    }
  
    function isPointInTriangle(pt, tri) {
      const { x1, y1, x2, y2, cx, cy } = tri;
      const d1 = sign(pt, { x: x1, y: y1 }, { x: x2, y: y2 });
      const d2 = sign(pt, { x: x2, y: y2 }, { x: cx, y: cy });
      const d3 = sign(pt, { x: cx, y: cy }, { x: x1, y: y1 });
  
      const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
      const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
  
      return !(hasNeg && hasPos);
    }
  
    function sign(p1, p2, p3) {
      return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    }
  
    function setYear(year) {
      currentYear = year;
      drawPentagonGraph();
    }
  </script>
  
  <h2> Average delay time by Delivery Centre for {currentYear}</h2>
  <div class="year-buttons">
    <button class:active={currentYear === 2024} on:click={() => setYear(2024)}>2024</button>
    <button class:active={currentYear === 2023} on:click={() => setYear(2023)}>2023</button>
    <button class:active={currentYear === 2022} on:click={() => setYear(2022)}>2022</button>
  </div>
  <canvas bind:this={canvas} width={width} height={height}></canvas>
  {#if tooltip}

  {/if}
  <div class="legend">
    <div class="legend-item">
      <span class="legend-color" style="background-color: green;"></span>
      Goods Receipt Planned and Actual Date Average Difference for {currentYear}
    </div>
    <div class="legend-item">
      <span class="legend-color" style="background-color: blue;"></span>
      Yard Arrival Planned and Actual Date Average Difference for {currentYear}
    </div>
    <div class="legend-item">
      <span class="legend-color" style="background-color: red;"></span>
      Vendor Shipment Planned and Actual Date Average Difference for {currentYear}
    </div>
  </div>
  
  <style>
    canvas {
      border: 1px solid black;
    }
  
    h2 {
      font-family: Verdana, Geneva, Tahoma, sans-serif;
    }
  
    .legend {
      margin-top: 20px;
      font-family: Verdana, Geneva, Tahoma, sans-serif;
      font-size: 14px;
    }
  
    .legend-item {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
    }
  
    .legend-color {
      display: inline-block;
      width: 20px;
      height: 20px;
      margin-right: 10px;
    }
  
    .year-buttons {
      margin-bottom: 20px;
    }
  
    .year-buttons button {
      margin-right: 10px;
      padding: 10px;
      font-size: 16px;
    }
  
    .year-buttons button.active {
      background-color: #4CAF50; /* Green background */
      color: white; /* White text */
    }
  

  </style>
  