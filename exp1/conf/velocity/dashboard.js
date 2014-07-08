


var data = [];
var data_pie = [];

var counter = 0;

function add_data(cl, count, d) {
	
	if("ddc_" + ddclevel != d)
		return;
	
	counter++;
	if(counter > 10)
		return;
	var po = {frequency: count, letter: cl};
	data.push(po);
}

function add_data_pie(cl, count) {
	var po = {population: count, age: cl};
	data_pie.push(po);
}

function objsort(o1, o2) {
	// if(o1.letter > o2.letter)
	if(parseInt(o1.frequency) < parseInt(o2.frequency))
		return 1;
	else
		return -1;

}
  
function init(data) {

	data.sort(objsort);

	var margin = {top: 20, right: 20, bottom: 30, left: 40},
	    width = 400 - margin.left - margin.right,
	    height = 120 - margin.top - margin.bottom;

	var formatPercent = d3.format(".0%");

	var x = d3.scale.ordinal()
	    .rangeRoundBands([0, width], .1);

	var y = d3.scale.linear()
	    .range([height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
	    // .tickFormat(formatPercent);

	var svg = d3.select("#canvas").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  data.forEach(function(d) {
    d.frequency = +d.frequency;
  });

  x.domain(data.map(function(d) { return d.letter; }));
  y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
	  .text("")
      .call(xAxis);
	  
	  
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-0)")
	  .attr("x", 0)
      .attr("dx", "-0.5em")
	  .attr("font-weight", "bold")
	  .attr("font-size", "12")
	  
      .attr("y", 0)
      .attr("dy", "-0.5em")
      .style("text-anchor", "end")
      .text("Count");

  svg.append("g")
    .append("text")
	  .attr("x", 0)
      .attr("dx", "20em")
	  .attr("font-weight", "bold")
      .style("text-anchor", "end")
      .text("DDC " + ddclevel);


		  
  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.letter); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.frequency); })
      .attr("height", function(d) { return height - y(d.frequency); })
	  .on("mouseover", function(d) {      
		  
		  var ddd = d3.select("#tooltip");
		  ddd.transition()        
		  .duration(200)      
		  .style("opacity", .9);      						  
				
		  $.ajax({
		    // url: "#{url_for_solr}/admin/file?file=/velocity/dashboard.js"
			url: "http://www.google.com"
		  }).done(function ( data ) {
			  console.log("Got it" + data);
		  });
				
		ddd.html("Description here")			  
		  //ddd.html(document.URL+" " + ddclevel+" " + d.letter)  
			.style("left", (d3.event.pageX) + "px")     
			.style("top", (d3.event.pageY - 28) + "px");    

		})
	  .on("mouseout", function(d) {       
		  var ddd = d3.select("#tooltip");
	              ddd.transition()        
	                  .duration(500)      
	                  .style("opacity", 0);   
	          });					  
				  
				  
				       
	svg.selectAll(".bar")
	.on("click", function(d) { 
		window.open(document.URL + "&fq=ddc_" + ddclevel + ":" + d.letter, "_self");

   svg.append("g")
       // .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
       .attr("dy", ".35em")
       // .style("text-anchor", "middle")
       .text("AAA");
	});

}

function init_pie() {
	var width = 130,
	    height = 130,
	    radius = Math.min(width, height) / 2;

	var color = d3.scale.ordinal()
	    // .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
		.range(["#c09853", "#b94a48", "#3a87ad", "#468847", "#999999", "#444444"]);
		
	var arc = d3.svg.arc()
	    .outerRadius(radius - 10)
	    .innerRadius(0);

	var pie = d3.layout.pie()
	    .sort(null)
	    .value(function(d) { return d.population; });

	var svg = d3.select("#piecanvas").append("svg")
	    .attr("width", width)
	    .attr("height", height)
	  .append("g")
	    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


  	  data_pie.forEach(function(d) {
  	    d.population = +d.population;
  	  });
		   
	  var g = svg.selectAll(".arc")
	       .data(pie(data_pie))
	     .enter().append("g")
	       .attr("class", "arc");

	   g.append("path")
	       .attr("d", arc)
	       .style("fill", function(d) { return color(d.data.age); });

	   g.append("text")
	       .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
	       .attr("dy", ".35em")
	       .style("text-anchor", "middle")
	       .text(function(d) { return d.data.age; });

	// });	


}

function init_tooltip() {

	// $(document).tooltip();
	$(document).tooltip({
		items:'.ddc',
		tooltipClass:'preview-tip',
		// position: { my: "left+15 top", at: "right center" },
		track: true,
		content:function(callback) {

			var el = this;
			var ddc = el.getAttribute('ddc');
	
			jQuery.ajax({
				type:"GET",
				url:"http://mcd.ischool.drexel.edu/ahn/ddc.cgi?ddc=" + ddc,
				contentType: "jsonp",
				dataType:"jsonp",
				success : function(data) {
					callback(data);
				},
				complete : function(data) {},
	            error : function(xhr, status, error) {}
			});
	
			// callback('hi');
	          // $.get('http://mcd.ischool.drexel.edu/ahn/test.cgi', {
	          //     id:'abc'
	          // }, function(data) {
	          //     callback(data); //**call the callback function to return the value**
	          // });
	      },		  
	    });	

}