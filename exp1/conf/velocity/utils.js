function setDashboardWidth() {

	// var parent = document.getElementById('rightspan');
	var width = $("#rightspan").width();
	$("#dashtabs").width(width);
	$("#sig").width(width - 40);
	
	// var docheight = getDocHeight();
	// var canvas = document.getElementById("chart");
	// var newheight = docheight - 80;
	// canvas.style.height = newheight.toString() + "px";
}


function show_tooltip(obj, e, ddc) {
    // get mouse position

    var IE = document.all?true:false

    if(IE) {
        var posX = e.x+document.body.scrollLeft;
        var posY = e.y+document.body.scrollTop;
    }
    else {
        var posX = e.pageX;
        var posY = e.pageY;
    }

    posX += 10;
    posY += 5;
	
	var el = document.getElementById('ddc_tooltip');
    el.style.left = posX + "px";
    el.style.top = posY + "px";

	el.style.visibility = "visible";
	document.getElementById('ddc_tooltip').innerHTML = 'Loading...';
	jQuery.ajax({
		type:"GET",
		url:"http://mcd.ischool.drexel.edu/ahn/ddc.cgi?ddc=" + ddc,
		contentType: "jsonp",
		dataType:"jsonp",
		success : function(data) {
			document.getElementById('ddc_tooltip').innerHTML = data;
		},
		complete : function(data) {
		},
	        error : function(xhr, status, error) {}
	});
	save_log({"action":"show_tooltip", "value":ddc, "other":data});

}

function hide_tooltip() {
	var el = document.getElementById('ddc_tooltip');
    if(el.style.visibility == "hidden")
        return true;
    else
        el.style.visibility = "hidden";	

		save_log({"action":"hide_tooltip"});
}

// function show_tooltip(current, e, title, description, docid) {
// 
// }

function save_log(logitem) {
	var jsons = JSON.stringify(logitem);

	jQuery.ajax({
		type:"GET",
		url:"http://mcd.ischool.drexel.edu/ahn/save_log.cgi?system=exp1&logstring=" + jsons,
		contentType: "jsonp",
		dataType:"jsonp",
		success : function(data) {
			console.log("Log success" + jsons);
		},
		complete : function(data) {
		},
		error : function(xhr, status, error) {
			console.log("Log error " + error);
		}
	});
	
	
}