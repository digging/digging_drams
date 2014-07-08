var w = 600,
	h = 300,
	// fill = d3.scale.category20(),
	nodes = [],
	links = [];

var vis;

// var vis = d3.select("body").append("svg:svg")
// 	.attr("width", w)
// 	.attr("height", h);
// 
// vis.append("svg:rect")
// 	.attr("width", w)
// 	.attr("height", h);

// params
var R = 80;
var nodeColors = ["#c09853", "#b94a48", "#3a87ad", "#468847", "#999999", "#444444"];
var colorCounter = 0;
var xyz = [0,0,1];
var SHRINK_DURATION = 300;
var RIPPLE_DURATION = 500;

// temp data
var nodeid = 0;
var expanded_nodes = [];
var selectedQueryTerm;

function calcNodePosition(i, childConut, rootx, rooty, R) {
	var angle = i * 360 / childConut + 180;
	var radian = angle * (3.141592 / 180);

	var xpos = rootx + Math.sin(radian) * R;
	var ypos = rooty + Math.cos(radian) * R;

	return [xpos, ypos];
}

function hide_contextmenu() {
	$(".node-contextmenu").hide("fast");	
}

function init_circle() {
	if(vis != null)
		vis.remove();

	nodes = [];
	links = [];
	nodeid = 0;
	
	vis = d3.select("#circlecanvas").append("svg:svg")
		.attr("width", w)
		.attr("height", h)
		.attr("class", "zoomr")
		.on("zoom", function() {
			console.log(d3.event.translate[0]);
		});
		// .attr("pointer-events", "all")
		// .append("svg:g")
		// .attr("class","zoomr");
	vis.append("svg:rect")
		.attr("width", w)
		.attr("height", h)
		.attr("class", "rectt")
		.call(d3.behavior.zoom().on("zoom", function() {
			xyz[0]=d3.event.translate[0];
			xyz[1]=d3.event.translate[1];

			vis.selectAll(".node circle, .node text, #ripple, .link")
			.attr("transform", "translate("+xyz[0]+","+xyz[1]+")");

			// for(var i = 0; i < nodes.length; i++) {
			// 	nodes[i].x += xyz[0];
			// 	nodes[i].y += xyz[1];
			// }
			hide_contextmenu();


		}))
		.insert("svg:text").attr("x", 10).attr("y", 10).text(function(d) {return "---"});
		// 	.attr("class","rectr")
		// 			.call(d3.behavior.zoom([xyz[0],xyz[1],0]).on("zoom", function(){
		// 	xyz[0]=d3.event.translate[0];
		// 	xyz[1]=d3.event.translate[1];
		//  	vis.select(".zoomr").attr("transform",
		//       "translate("+xyz[0]+","+xyz[1]+")scale("+xyz[2]+")");
		// 	vis.select(".rectr").attr("transform",
		// 	  "translate(" + xyz[0]*-1+","+xyz[1]*-1+ ")");
		// }))
		
}

function getmax(tree) {
	var maxf = -1;
	
	for(var i = 0; i < tree.length; i++) {
		var val = parseInt(tree[i].freq);
		if(maxf < val)
			maxf = val;
	}
	
	return maxf;
}

function search_circle() {

	init_circle();

	var rootx = w / 2;
	var rooty = h / 2;
	var query_text = document.getElementById("q").value;
	// var query_text = "visualization";

    jQuery.ajax({
		// crossDomain: true,
          type:"GET",
		  // contentType: "application/json; charset=utf-8",
		  url:"http://mcd.ischool.drexel.edu/ahn/ddc_expand.cgi?q=" + query_text,
		  // data: {q:"scottish"},
		  contentType: "jsonp",
          dataType:"jsonp", // 옵션이므로 JSON으로 받을게 아니면 안써도 됨
          success : function(data) {
			  var json = data;
			  var tree = json.QueryExpand;
			  var counter = 0;
			  var childConut = tree.length;

			  var root = {x: rootx, y:rooty, term: json.Query, rootnode:null, cui:null, num:0, nodeid:nodeid++, shrunk:false, ratio:1.2, rippler:R};
			  nodes.push(root);

			  for(var i = 0; i < childConut; i++) {
				  var o = tree[i];
				  var maxf = getmax(tree);
			
				  pos = calcNodePosition(i, childConut, rootx, rooty, R);

				  var node = {x: pos[0], y: pos[1], term: o.term, rootnode:root, cui: o.cui, num:i+1, nodeid:nodeid++, shrunk:false, ratio:o.freq/maxf, rippler:R};
				  nodes.push(node);
				  links.push({source:root, target:node, path:false});
			  }
			  paint(rootx, rooty, R);
          },
          complete : function(data) {},
          error : function(xhr, status, error) { alert("Search server error");}
    });

	// get_pmpreview();	
	
	// d3.json("http://research.ischool.drexel.edu:8080/umls3/GetLabel?query="+query_text, function(json) {
	// d3.json("http://mcd.ischool.drexel.edu/ahn/ddc_expand.cgi?q=" + query_text, function(json) {

		// var tree = json.QueryExpand;
		// var counter = 0;
		// var childConut = tree.length;
		// 
		// var root = {x: rootx, y:rooty, term: json.Query, rootnode:null, cui:null, num:0, nodeid:nodeid++, shrunk:false, ratio:1.2, rippler:R};
		// nodes.push(root);
		// 
		// for(var i = 0; i < childConut; i++) {
		// 	var o = tree[i];
		// 	var maxf = getmax(tree);
		// 	
		// 	pos = calcNodePosition(i, childConut, rootx, rooty, R);
		// 	        console.log("cui1= " + o.cui);
		// 	var node = {x: pos[0], y: pos[1], term: o.term, rootnode:root, cui: o.cui, num:i+1, nodeid:nodeid++, shrunk:false, ratio:o.freq/maxf, rippler:R};
		// 	console.log(o.freq/maxf + " " + maxf + " " + o.freq);
		// 	nodes.push(node);
		// 	links.push({source:root, target:node, path:false});
		// }
		// paint(rootx, rooty, R);
	// });
}

function search2(d) {
	var rootx = d.x;
	var rooty = d.y;
	var query = d.term.substring(0, 3);
	// d.term = "";

	jQuery.ajax({
		type:"GET",
		url:"http://mcd.ischool.drexel.edu/ahn/ddc_expand.cgi?q=ddc:" + query,
		contentType: "jsonp",
		dataType:"jsonp", // 옵션이므로 JSON으로 받을게 아니면 안써도 됨
		success : function(data) {

			d.rootnode = null;
			shrink(d, d.x, d.y); 

			var json = data;
			var tree = json.QueryExpand;
			var counter = 0;
			var childConut = tree.length;

			var root = d;
			nodes.push(root);

			for(var i = 0; i < childConut; i++) {
				var o = tree[i];
				var maxf = getmax(tree);
			
				pos = calcNodePosition(i, childConut, rootx, rooty, R);

				var node = {x: pos[0], y: pos[1], term: o.term, rootnode:root, cui: o.cui, num:i+1, nodeid:nodeid++, shrunk:false, ratio:o.freq/maxf, rippler:R};
				nodes.push(node);
				// links.push({source:root, target:node, path:false});
				links.push({source:root, target:node});
			}
			// vis.selectAll(".node circle, .node text, #ripple, .link")
// 			.attr("transform", "translate("+xyz[0]+","+xyz[1]+")");
			
			paint(rootx, rooty, R);
			offsetx = w/2-rootx;
			offsety = h/2-rooty;
			vis.selectAll(".node circle, .node text, #ripple, .link")
			.attr("transform", "translate("+offsetx+","+offsety+")");
		},
		complete : function(data) {},
		error : function(xhr, status, error) { alert("Search server error");}
	});

/*	
	d3.json(url, function(json) {
		if(json == null) {
			alert("No search result found.");
			return;
		}
		d.rootnode = null;
		shrink(d, d.x, d.y); 
		var tree = json.QueryExpand;
		var counter = 0;
		var childConut = tree.length;
		//console.log("childCount= " + childConut);
		
		// var root = {x: rootx, y:rooty, term: query};
		// nodes.push(root);
		var root = d;
		
		for(var i = 0; i < childConut; i++) {
			var o = tree[i];
			var maxf = getmax(tree);

			pos = calcNodePosition(i, childConut, rootx, rooty, R);

			var node = {x: pos[0], y: pos[1], term: o.term, rootnode:root, cui: o.cui, num:i+1, nodeid:nodeid++, shrunk:false, ratio:o.freq/maxf, rippler:R};
			nodes.push(node);
			links.push({source:root, target:node});
		}
		paint(rootx, rooty, R);
	});
*/
}

function paint(rootx, rooty, R) {
	console.log(">>>");
	console.log(vis);
	
	var tooltip = d3.select("body")
		.append("div")
		.style("position", "absolute")
		.style("z-index", "10")
		.style("visibility", "hidden")
		.style("background", "white")
		.style("border", "2px solid #b9f")
		.style("opacity", 0.8)
		.text("");	
	
	vis.append("svg:circle")
		.attr("id", "ripple")
		.attr("cx", rootx)
		.attr("cy", rooty)
		.attr("r", 1e-6)
		.style("stroke", d3.scale.category20c(1))
		.style("stroke-width", 3)
		.style("stroke-opacity", 1)
		.style("fill", "none")
		.attr("transform", "translate("+xyz[0]+","+xyz[1]+")")
		.transition()
		.duration(RIPPLE_DURATION)
		.ease(Math.sqrt)
		.attr("r", R)
		.style("stroke-opacity", 0.5);
		// .remove();	
	
	vis.selectAll("line.link")
		.data(links)
		.enter().insert("svg:line", "circle.node")
		.attr("class", "link")
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; })
		.style("opacity", 1e-6)
		.attr("transform", "translate("+xyz[0]+","+xyz[1]+")")
		.transition()
		.duration(1000)
		.ease(Math.sqrt)	
		.style("opacity", 1);

	$(".node-contextmenu .contextmenu-item")
		.on("click", function() {
			var box = this.getAttribute( 'data-box' );
			// alert(box);
			console.log(box + " " + selectedQueryTerm);
			
			// d3.select(".node-contextmenu")
			// .style('display', 'none');
			
			hide_contextmenu();
			
			document.getElementById("querybox-" + box).value = selectedQueryTerm;
			get_pmpreview();
		})

	vis.selectAll(".node")
		.data(nodes)
		.enter().insert("svg:g")
		.attr("class", "node")
		.on("click", function(d) {search2(d)})
		// .on("mouseover", function(d) {console.log("noidid:" + d.nodeid)})

		.on("mouseover", function(d){tooltip.text(d.term); return tooltip.style("visibility", "visible");})
		.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
		.on("mouseout", function(){return tooltip.style("visibility", "hidden");})
 
		.on("contextmenu", function(data, index) {
			d3.select(".node-contextmenu")
	      	.style('position', 'absolute')
	      	.style('left', d3.event.pageX + "px")
	      	.style('top', d3.event.pageY + "px");
			$(".node-contextmenu").show(200);
			
			d3.event.preventDefault();
			selectedQueryTerm = data.term;
		})
		.call(function(n, d) {

			// label
			n.insert("svg:text")
			.attr("x", function(d) {return d.x;})
			.attr("y", function(d) {
				console.log("-------");
				console.log(d.nodeid);
				
				if(d.nodeid == "2" || d.nodeid == "3") 
					return d.y + 22; 
				else
					return d.y - 12;
			})
			.text(function(d) {
				// not root node
				if(d.rootnode != null) {
					return d.term;//.substring(0, 3);
				}
				// root node
				else {
					if(/^[ a-z]+$/i.test(d.term.substring(0, 1))) {
						return d.term;
					}
					else {
						return d.term.substring(0,3);
					}
				}
			}) // show ddc number only
			.attr("font-size", 32)
			.style("opacity", 1e-6)
			.attr("transform", "translate("+xyz[0]+","+xyz[1]+")")
			.transition()
			.duration(1000)
			.ease(Math.sqrt)	
			.style("opacity", 1);

			// node shape
			n.insert("svg:circle")
			.attr("r", 10)
			.attr("cx", function(d) {return d.x;})
			.attr("cy", function(d) {return d.y;})
			.style("opacity", 1e-6)
			.style("fill", function(d) {return nodeColors[d.num % 6]})
			.attr("transform", "translate("+xyz[0]+","+xyz[1]+")")
			.transition()
			.duration(1000)
			.ease(Math.sqrt)	
			.style("opacity", 1)
			.attr("r", function(d) {return Math.max(5, d.ratio * 10)});
			})
			
}

function newpos(d) {
	if(d.rootnode == null)
		return [d.x, d.y];
		
	var rx = d.rootnode.x, ry = d.rootnode.y;
	var oldr = d.rootnode.rippler;

	pos = calcNodePosition(d.num-1, 5, rx, ry, oldr);
	d.x = pos[0]; d.y = pos[1];
	return pos;
}

function shrink(d, dx, dy) {
	
	// 
	// vis.selectAll(".node circle, .node text, #ripple, .link")
	// .transition()
	// .duration(500)
	// .attr("transform", function(d) {var ts = "translate(" + (500 - dx) + "," + (400 - dy) + ")"; console.log(ts); return ts })
	// .call(function(dd) {
	// 	console.log("here");
	// 	console.log("..>T..." + dx);
	// });
	// 
	
	// node shape 
	vis.selectAll(".node circle")
	.filter(function(ds, i) {
		var ans = true;

		// do not shrink
		if(ds.nodeid == d.nodeid) // || ds.rootnode == null || ds.shrunk)
			ans = false;
			
		return ans;
	})
	.call(function (d) {
		d.shrunk = true;
	})
	.transition()
	.duration(SHRINK_DURATION)
	.filter(function(d) {
		if(d.rootnode != null)
			return true;
	})
	.style("opacity", 0.0)
	.attr("cx", function(d) {return newpos(d)[0]})
	.attr("cy", function(d) {return newpos(d)[1]});

	// node label
	vis.selectAll(".node text")
	.filter(function(ds, i) {
		var ans = true;

		if(ds.nodeid == d.nodeid || ds.shunk || ds.rootnode == null) 
			ans = false;
			
		return ans;
	})
	.transition()
	.duration(SHRINK_DURATION)
	.style("font-size", 8)
	.style("opacity", 0.0)
	.attr("x", function(d) {return newpos(d)[0]})
	.attr("y", function(d) {return newpos(d)[1] - 8});

	// path
	vis.selectAll('.link')
	.filter(function(dl, i) {
		if(dl.source == d || dl.target == d || dl.path) {
			dl.path = true;
			return true;
		}
		return false;
	})
	.style("stroke", "#666")
	.style("stroke-width", 5);
	
	// links
	vis.selectAll('line.link')
	.filter(function(dl, i) {
		if(dl.source == d || dl.target == d || dl.path) {
			return false;
		}
		
		// dl.x1 = newpos(dl.source)[0];
		//  		dl.y1 = newpos(dl.target)[1];
		// dl.x2 = newpos(dl.source)[0];
		// dl.y2 = newpos(dl.target)[1];
		return true;
	})
	.each(function (dl) {
		dl.x1 = 0;
		dl.y1 = 0;
	})
	.transition()
	.attr("x1", 10)
	.attr("y1", 10)
	.attr("x2", 10)
	.attr("y2", 10)
	
	;
	

	// .duration(SHRINK_DURATION)
	//todo:fix by embeding new pos to the nodes (?)
	// .attr("x1", function(d) {return newpos(d.source)[0]})
	// .attr("y1", function(d) {return newpos(d.source)[1]})
	// .attr("x2", function(d) {return newpos(d.target)[0]})
	// .attr("y2", function(d) {return newpos(d.target)[1]});
	// .attr("x1", 0)
	// .attr("y1", 0)
	// .attr("x2", 0)
	// .attr("y2", 0);
;
	// ripple
	vis.selectAll("#ripple")
	.transition()
	.duration(SHRINK_DURATION)
	.attr("r", function() {
		var oldr = d3.select(this).attr("r");
		return oldr * 0.8;
	})
	.style("stroke-opacity", 0.0);


	//
	vis.selectAll(".node circle")
	.filter(function(ds, i) {if(ds.rootnode == null && ds != d) return true})
	.each(function(ds) {
		var oldr = ds.rippler;
		ds.rippler = oldr*0.8;
	});	
}
function enter_pressed(e){
var keycode;
if (window.event) keycode = window.event.keyCode; 
else if (e) keycode = e.which; 
else return false; 
return (keycode == 13); 
}

var extid = 1;

function openext(id) {
	
	var labels = ['', 'PubMed', 'Healthline', 'WebMed', 'Google'];
	
	var redv = document.getElementById("querybox-red").value;
	var greenv = document.getElementById("querybox-green").value;
	var bluev = document.getElementById("querybox-blue").value;

	
	if(id != 0) {
		extid = id;
		document.getElementById("extbutton").innerHTML = labels[id];
	}
	
	switch(extid) {
		case 1:
			openpubmed(redv, greenv, bluev);
			break;
		case 2:
			openhealthline(redv, greenv, bluev);
			break;
		case 3:
			openwebmed(redv, greenv, bluev);
			break;
		case 4:
			opengoogle(redv, greenv, bluev);
			break;
	}
	
}

function openpubmed(q1, q2, q3) {

// http://www.ncbi.nlm.nih.gov/pubmed?cmd=Search&db=pubmed&term=(photographs+by+picture-taking+technique)(aerial+photographs)(astrophotographs)&dispmax=40

	var q = "http://www.ncbi.nlm.nih.gov/pubmed?cmd=Search&db=pubmed&dispmax=40&term=" + "("+q1+")("+q2+")("+q3+")";
	
	window.open(q);
}

function openhealthline(q1, q2, q3) {

	var q = "http://www.healthline.com/search?q1=" +q1+" "+q2+" "+q3;
	window.open(q);
}

function openwebmed(q1, q2, q3) {

	var q = "https://google.com?q=" +q1+" "+q2+" "+q3;	
	window.open(q);
}	



function opengoogle(q1, q2, q3) {

	var q = "https://google.com?q=" +q1+" "+q2+" "+q3;	
	window.open(q);
}

