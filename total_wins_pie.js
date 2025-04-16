d3.csv("Cleaned_Cricket_Match_Dataset@1.csv").then(data => {
  // Prepare the data by counting wins for each team
  const teams = [...new Set(data.flatMap(d => [d["Team 1"], d["Team 2"]]))].filter(Boolean);
  const winCounts = d3.rollup(data.filter(d => d.Winner), v => v.length, d => d.Winner.trim());
  const dataset = teams.map(team => ({
    team,
    wins: winCounts.get(team) || 0
  }));

  // Set up chart dimensions and radius
  const width = 600, height = 600, radius = Math.min(width, height) / 2;
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // Create pie and arc generators
  const pie = d3.pie().value(d => d.wins);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);

  // Create the SVG container
  const svg = d3.select("#totalWins")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Create pie chart arcs
  const arcs = pie(dataset);

  // Append arcs (pie slices)
  const slices = svg.selectAll("path")
    .data(arcs)
    .enter().append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.team))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1);

  // Add labels for each slice (team names and win counts)
  svg.selectAll("text")
    .data(arcs)
    .enter().append("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(d => `${d.data.team}: ${d.data.wins}`)
    .style("font-size", "12px")
    .style("fill", "#000");
});
