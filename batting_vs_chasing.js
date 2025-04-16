d3.csv("Cleaned_Cricket_Match_Dataset@1.csv").then(data => {
  const teamWins = d3.rollup(
    data,
    v => ({
      battingFirst: v.filter(d =>
        (d.Winner === d["Team 1"] && d.Innings_Team1 === "First") || 
        (d.Winner === d["Team 2"] && d.Innings_Team2 === "First")
      ).length,
      chasing: v.filter(d =>
        (d.Winner === d["Team 1"] && d.Innings_Team1 === "Second") || 
        (d.Winner === d["Team 2"] && d.Innings_Team2 === "Second")
      ).length
    }),
    d => d.Winner
  );

  const dataset = Array.from(teamWins, ([team, stats]) => ({ team, ...stats }));
  const margin = { top: 40, right: 20, bottom: 100, left: 60 },
        width = 960 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#battingChasing")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().domain(dataset.map(d => d.team)).range([0, width]).padding(0.2);
  const y = d3.scaleLinear().domain([0, d3.max(dataset, d => Math.max(d.battingFirst, d.chasing))]).nice().range([height, 0]);

  svg.selectAll(".batting").data(dataset).enter().append("rect")
    .attr("x", d => x(d.team))
    .attr("y", d => y(d.battingFirst))
    .attr("width", x.bandwidth() / 2)
    .attr("height", d => height - y(d.battingFirst))
    .attr("fill", "orange");

  svg.selectAll(".chasing").data(dataset).enter().append("rect")
    .attr("x", d => x(d.team) + x.bandwidth() / 2)
    .attr("y", d => y(d.chasing))
    .attr("width", x.bandwidth() / 2)
    .attr("height", d => height - y(d.chasing))
    .attr("fill", "green");

  svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x)).selectAll("text").attr("transform", "rotate(-45)").style("text-anchor", "end");
  svg.append("g").call(d3.axisLeft(y));
});
