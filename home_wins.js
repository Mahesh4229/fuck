d3.csv("Cleaned_Cricket_Match_Dataset@1.csv").then(data => {
  const homeWins = data.filter(d => d.Winner && d.Host_Country && d.Winner.trim() === d.Host_Country.trim());
  const counts = d3.rollup(homeWins, v => v.length, d => d.Winner.trim());
  const dataset = Array.from(counts, ([team, wins]) => ({ team, wins })).sort((a, b) => b.wins - a.wins);

  const margin = { top: 40, right: 20, bottom: 100, left: 60 },
        width = 960 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#homeWins")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().domain(dataset.map(d => d.team)).range([0, width]).padding(0.1);
  const y = d3.scaleLinear().domain([0, d3.max(dataset, d => d.wins)]).nice().range([height, 0]);

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  svg.append("g")
    .selectAll("rect")
    .data(dataset)
    .enter().append("rect")
    .attr("x", d => x(d.team))
    .attr("y", d => y(d.wins))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.wins))
    .attr("fill", "steelblue")
    .on("mouseover", function(event, d) {
      tooltip.transition().duration(200).style("opacity", .9);
      tooltip.html(`${d.team} Wins: ${d.wins}`)
        .style("left", `${event.pageX + 5}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", function(d) {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g").call(d3.axisLeft(y));

  // Add labels
  svg.selectAll("text.label")
    .data(dataset)
    .enter().append("text")
    .attr("x", d => x(d.team) + x.bandwidth() / 2)
    .attr("y", d => y(d.wins) - 5)
    .attr("text-anchor", "middle")
    .text(d => d.wins)
    .style("fill", "#fff")
    .style("font-size", "12px");
});
