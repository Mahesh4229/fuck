d3.csv("Cleaned_Cricket_Match_Dataset@1.csv").then(data => {
  const teams = [...new Set(data.flatMap(d => [d["Team 1"], d["Team 2"]]))].filter(Boolean);
  const winCounts = d3.rollup(data.filter(d => d.Winner), v => v.length, d => d.Winner.trim());
  const dataset = teams.map(team => ({ team, wins: winCounts.get(team) || 0 }));

  const width = 500, height = 500, radius = Math.min(width, height) / 2;
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const pie = d3.pie().value(d => d.wins);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);

  const svg = d3.select("#totalWins")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const arcs = pie(dataset);
  svg.selectAll("path")
    .data(arcs)
    .enter().append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.team));

  svg.append("text")
    .attr("x", 0)
    .attr("y", -height / 2 + 20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("3. Total Wins by Team");
});
