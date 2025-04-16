d3.csv("Cleaned_Cricket_Match_Dataset@1.csv").then(data => {
  // Extract all unique teams from Team 1 and Team 2
  const teams = [...new Set(data.flatMap(d => [d["Team 1"], d["Team 2"]]))].sort();

  // Calculate wins for all teams
  const winCounts = d3.rollup(
    data.filter(d => d.Winner && d.Winner.trim() !== ""),
    v => v.length,
    d => d.Winner.trim()
  );

  // Create winData for all teams, including those with zero wins
  const winData = teams.map(team => ({
    team,
    wins: winCounts.get(team) || 0 // Use 0 if the team has no wins
  })).filter(d => d.team !== ""); // Remove any empty team names

  // SVG setup
  const width = 800;
  const height = 800;
  const radius = Math.min(width, height) / 2 - 75;

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

  // Centering group
  const g = svg.append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Tooltip
  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Pie and Arc generators
  const pie = d3.pie()
    .value(d => d.wins + 0.001) // Ensure teams with 0 wins are shown
    .sort(null);

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius - 20);

  const arcHover = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  const color = d3.scaleOrdinal()
    .domain(winData.map(d => d.team))
    .range(d3.schemeTableau10.concat(d3.schemeSet3).slice(0, winData.length));

  // Draw slices
  g.selectAll("path")
    .data(pie(winData))
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.team))
    .on("mouseover", function(event, d) {
      d3.select(this).transition().duration(200).attr("d", arcHover(d));
      tooltip
        .html(`<strong>${d.data.team}</strong><br>Wins: ${d.data.wins}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`)
        .transition().duration(200)
        .style("opacity", 0.9);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", function(event, d) {
      d3.select(this).transition().duration(200).attr("d", arc(d));
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // Labels and polylines
  const labelArc = d3.arc()
    .innerRadius(radius - 40)
    .outerRadius(radius + 20);

  g.selectAll("text")
    .data(pie(winData))
    .enter()
    .append("text")
    .attr("transform", d => {
      const pos = labelArc.centroid(d);
      const angle = Math.atan2(pos[1], pos[0]);
      const x = Math.cos(angle) * (radius + 30);
      const y = Math.sin(angle) * (radius + 30);
      return `translate(${x},${y})`;
    })
    .attr("text-anchor", d => {
      const [x] = labelArc.centroid(d);
      return x >= 0 ? "start" : "end";
    })
    .attr("dy", ".35em")
    .style("font-size", "10px")
    .text(d => d.data.team);

  g.selectAll("polyline")
    .data(pie(winData))
    .enter()
    .append("polyline")
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("fill", "none")
    .attr("points", d => {
      const pos = labelArc.centroid(d);
      const angle = Math.atan2(pos[1], pos[0]);
      const x = Math.cos(angle) * (radius + 30);
      const y = Math.sin(angle) * (radius + 30);
      const inner = arc.centroid(d);
      return [inner, pos, [x, y]];
    });

  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("3. Total Wins by Team");

  return svg.node();
});
