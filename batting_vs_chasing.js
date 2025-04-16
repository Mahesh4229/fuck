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

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  svg.selectAll(".batting").data(dataset).enter().append("rect")
    .attr("x", d => x(d.team))
    .attr("y", d => y(d.battingFirst))
    .attr("width", x.bandwidth() / 2)
    .attr("height", d => height - y(d.battingFirst))
    .attr("fill", "orange")
    .on("mouseover", function(event, d) {
      tooltip.transition().duration(200).style("opacity", .9);
      tooltip.html(`${d.team} Batting First Wins: ${d.battingFirst}`)
        .style("left", `${event.pageX + 5}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", function(d) {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  svg.selectAll(".chasing").data(dataset).enter().append("rect")
    .attr("x", d => x(d.team) + x.bandwidth() / 2)
    .attr("y", d => y(d.chasing))
    .attr("width", x.bandwidth() / 2)
    .attr("height", d => height - y(d.chasing))
    .attr("fill", "green")
    .on("mouseover", function(event, d) {
      tooltip.transition().duration(200).style("opacity", .9);
      tooltip.html(`${d.team} Chasing Wins: ${d.chasing}`)
        .style("left", `${event.pageX + 5}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", function(d) {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x)).selectAll("text").attr("transform", "rotate(-45)").style("text-anchor", "end");
  svg.append("g").call(d3.axisLeft(y));

  // Add labels
  svg.selectAll("text.label")
    .data(dataset)
    .enter().append("text")
    .attr("x", d => x(d.team) + x.bandwidth() / 4)
    .attr("y", d => y(d.battingFirst) - 5)
    .attr("text-anchor", "middle")
    .text(d => d.battingFirst)
    .style("fill", "#fff")
    .style("font-size", "10px");

  svg.selectAll("text.chasingLabel")
    .data(dataset)
    .enter().append("text")
    .attr("x", d => x(d.team) + x.bandwidth() * 3 / 4)
    .attr("y", d => y(d.chasing) - 5)
    .attr("text-anchor", "middle")
    .text(d => d.chasing)
    .style("fill", "#fff")
    .style("font-size", "10px");
});
