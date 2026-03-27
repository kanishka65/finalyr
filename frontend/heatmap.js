// heatmap.js
window.renderHeatmap = function (selector, matrix) {
  // Clear previous heatmap
  d3.select(selector).selectAll('*').remove();

  const container = d3.select(selector);
  const containerWidth = container.node().clientWidth || 400;

  const rows = matrix.length;
  const cols = matrix[0].length;

  const margins = { top: 20, right: 10, bottom: 40, left: 45 };
  // Responsive cell size
  const cellSize = Math.floor((containerWidth - margins.left - margins.right) / cols);

  const width = (cellSize * cols) + margins.left + margins.right;
  const height = (cellSize * rows) + margins.top + margins.bottom;

  const svg = container
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('max-width', '100%')
    .style('height', 'auto');

  const g = svg.append('g').attr('transform', `translate(${margins.left},${margins.top})`);

  // Neon Color scale for Dark Mode
  const maxVal = Math.max(...matrix.flat()) || 1;
  const color = d3.scaleLinear()
    .domain([0, maxVal * 0.3, maxVal * 0.6, maxVal])
    .range(['#1e293b', '#4f46e5', '#818cf8', '#2dd4bf']);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Tooltip setup (Ensures singleton)
  let tooltip = d3.select('.heatmap-tooltip');
  if (tooltip.empty()) {
    tooltip = d3.select('body').append('div')
      .attr('class', 'heatmap-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(15, 23, 42, 0.95)')
      .style('color', '#fff')
      .style('padding', '8px 14px')
      .style('border', '1px solid #334155')
      .style('border-radius', '8px')
      .style('font-size', '12px')
      .style('box-shadow', '0 10px 15px -3px rgba(0,0,0,0.5)')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('opacity', 0);
  }

  // Draw cells
  matrix.forEach((row, r) => {
    row.forEach((val, c) => {
      g.append('rect')
        .attr('x', c * cellSize)
        .attr('y', r * cellSize)
        .attr('width', cellSize - 2)
        .attr('height', cellSize - 2)
        .attr('rx', 3)
        .attr('fill', color(val))
        .on('mouseover', function (event) {
          d3.select(this).attr('stroke', '#818cf8').attr('stroke-width', 2);
          tooltip.transition().duration(100).style('opacity', 1);
          tooltip.html(`<strong>${days[r]} at ${c}:00</strong><br>Spend Density: ${val}`)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 35) + 'px');
        })
        .on('mousemove', function (event) {
          tooltip.style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 35) + 'px');
        })
        .on('mouseout', function () {
          d3.select(this).attr('stroke', 'none');
          tooltip.transition().duration(300).style('opacity', 0);
        });
    });
  });

  // Hour labels (bottom)
  const hours = [0, 6, 12, 18, 23];
  g.selectAll('.hour-label')
    .data(hours)
    .enter().append('text')
    .attr('x', d => d * cellSize + cellSize / 2)
    .attr('y', rows * cellSize + 24)
    .attr('text-anchor', 'middle')
    .style('font-size', '11px')
    .style('font-weight', '500')
    .style('fill', '#94a3b8')
    .text(d => d + ':00');

  // Day labels (left)
  g.selectAll('.day-label')
    .data(days)
    .enter().append('text')
    .attr('x', -12)
    .attr('y', (d, i) => i * cellSize + cellSize / 2 + 4)
    .attr('text-anchor', 'end')
    .style('font-size', '11px')
    .style('font-weight', '500')
    .style('fill', '#94a3b8')
    .text(d => d);
};
