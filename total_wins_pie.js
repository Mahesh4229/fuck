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
  const outerArc = d3.arc().innerRadius(radius + 10).outerRadius(radius + 10);

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

  // Add tooltip functionality
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  slices.on("mouseover", function(event, d) {
    tooltip.transition().duration(200).style("opacity", .9);
    tooltip.html(`${d.data.team} Wins: ${d.data.wins}`)
      .style("left", `${event.pageX + 5}px`)
      .style("top", `${event.pageY - 28}px`);
  }).on("mouseout", function(d) {
    tooltip.transition().duration(500).style("opacity", 0);
  });

  // Add labels for each slice (team names)
  svg.selectAll("text")
    .data(arcs)
    .enter().append("text")
    .attr("transform", d => `translate(${outerArc.centroid(d)})`)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(d => d.data.team)
    .style("font-size", "12px")
    .style("fill", "#fff");

  // Add lines connecting the labels to the pie slices
  svg.selectAll("polyline")
    .data(arcs)
    .enter().append("polyline")
    .attr("points", function(d) {
      const pos = outerArc.centroid(d);
      const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      const lineX = radius * Math.cos(midAngle);
      const lineY = radius * Math.sin(midAngle);
      return [arc.centroid(d), [lineX, lineY], pos];
    })
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .attr("fill", "none");
});
