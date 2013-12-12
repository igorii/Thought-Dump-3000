var height = 400;
var width  = 1000;

var yPad = 50;
var xPad = 200;

var radius = 5;

/* Format data */
function getSeries (data, label) {
    var series = [];
    for (var o in data[label])
        if (typeof data[label][o] === 'string')
            series.push([o, data[label][o]]);
        else if (typeof data[label][o] === 'object')
            for (var i = 0, j = data[label][o]; i < j.length; ++i)
                series.push([o, j[i]]);
    return series;
}

/* Create series */
var schoolSeries   = getSeries(ResumeData, "Carleton University");
var profSeries     = getSeries(ResumeData, "Professional Experience");
var personalSeries = getSeries(ResumeData, "Personal");

/* Create svg canvas */
var svg = d3.select("#experience")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

function createScale (series, index, pad, maxPx) {
    var domain = [],
        i, j;

    for (i = 0; i < series.length; ++i)
        for (j = 0; j < series[i].length; ++j)
            domain.push(series[i][j][index]);
   
    return d3.scale.ordinal()
             .domain(domain)
             .rangePoints([pad, maxPx - pad]);
}

/* Create x and y scales */
var xScale = createScale([schoolSeries, profSeries, personalSeries], 1, xPad, width);
var yScale = createScale([schoolSeries, profSeries, personalSeries], 0, yPad, height);
var aggrScale = d3.scale.linear()
    .domain([5, 0])
    .range([yPad, height - yPad]);

/* Create x and y axes */
var xAxis = d3.svg.axis()
              .scale(xScale)
              .orient('bottom');

/* Append x axis */
svg.append('g')
   .attr('transform', 'translate(0, ' + (height - yPad + 20) + ')')
   .attr('font-size', '11px')
   .call(xAxis);

/* Create x and y axes */
var yAxis = d3.svg.axis()
              .scale(yScale)
              .orient('left');

/* Append y axis */
svg.append('g')
   .attr('transform', 'translate(' + (xPad - 20) + ', 0)')
   .attr('font-size', '10px')
   .call(yAxis);
  
var aggrAxis = d3.svg.axis()
   .scale(aggrScale)
   .orient('right')
   .ticks(4)
   .tickFormat(d3.format("d"))
   .tickSubdivide(0);;

svg.append('g')
   .attr('transform', 'translate(' + (20 + width - xPad) + ', 0)')
   .attr('font-size', '10px')
   .call(aggrAxis);

svg.selectAll('.domain')
   .attr('fill', 'none')
   .attr('stroke', '#222222')
   .attr('shape-rendering', 'crispEdges');

/* Draw sums  */
function drawSums (series, colour) {

    svg.selectAll('rect' + this.calls)
        .data(series)
        .enter()
        .append('rect')
        .attr('width', 4)
        .attr('height', function (d, i) { return (height - yPad) - aggrScale(d.Count); })
        .attr('x', function (d, i) { console.log(d); return xScale(d.Language) - 2; })
        .attr("y", function (d, i) { return aggrScale(d.Count); })
        .attr('fill-opacity', 0.3)
        .attr('fill', colour);
}
drawSums.calls = 0;

/* Draw circles for data points */
function drawPoints (series, colour) {
    svg.selectAll("circle" + this.calls++)
       .data(series)
       .enter()
       .append("circle")
       .attr("cx", function (d, i) { return xScale(d[1]); })
       .attr("cy", function (d, i) { return yScale(d[0]); })
       .attr("r", function (d, i)  { return radius; })
       .attr('fill', 'white')
       .attr('fill-opacity', 0.6)
       .attr("stroke", colour)
       .attr("stroke-width", "1.5px");
}
drawPoints.calls = 0;

drawSums(countsArray, '#DF4E33');
drawPoints(schoolSeries, '#1f77b4');
drawPoints(profSeries, '#9467bd');
drawPoints(personalSeries, '#2ca02c');
