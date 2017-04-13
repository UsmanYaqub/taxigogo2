$(document).ready(function() {
	if(localStorage.length > 0)
	{
		if(localStorage.frommapsearch != '')
		{
			$('#frommapsearch').val(localStorage.getItem("frommapsearch"));
		}

		if(localStorage.tomapsearch != '')
		{
			$('#tomapsearch').val(localStorage.getItem("tomapsearch"));
		}
		$('#get_price').trigger('click');
	}
	$('.form-control').on('blur', function(event) {
	        var id = $(this).attr('id');
	        var value = $(this).val();
	        localStorage.setItem(id, value);
	        console.log(localStorage);
	    });

	$('#btn_city').click(function(){
		$.ajax({
			url: "json/cities.json",
			dataType: "json",
			success: function(result){
				//alert(JSON.stringify(result))
	        	//$("#div1").html(result);
	        	var obj = result.cities;
	        	/*var table ='<table cellpadding="0" cellspacing="0" width="100%">';
	        	if(obj){

	        		$.each(obj, function( index, value ) {
					  table += '<tr><td><a href="javascript:;" onclick="get_taxies(\''+index+'\')">'+index+'</a></td></tr>';	
					});
	        		
	        	}
	        	else{
	        		table += '<tr><td>No City found.</td></tr>';	
	        	}

	        	table += '</table>';

	        	$('#city_table').html(table).show();*/

	        	var chart = new CanvasJS.Chart("chartContainer", {
	        		title: {
	        			text: "Available Taxies"
	        		},
	        		data: [{
	        			type: "column",
	        			dataPoints: [
	        				{ y: obj.Leeds, label: "Leeds" },
	        				{ y: obj.Manchester, label: "Manchester" },
	        				{ y: obj.Huddersfield, label: "Huddersfield" },
	        				{ y: obj.Sheffield, label: "Sheffield" },
	        				{ y: obj.Rochdale, label: "Rochdale" },
	        				{ y: obj.Bradford, label: "Bradford" },
	        				{ y: obj.Blackburn, label: "Blackburn" },
	        				{ y: obj.Preston, label: "Preston" },
	        			]
	        		}]
	        	});
	        	chart.render();
	        	$('.canvasjs-chart-credit').css('display', 'none');
	        	$('#chartContainer').append('<div class="customdiv" style="height: 15px;width: 60px;background-color: white;position: relative;top: 96%;"></div>');

	    	}
		});
	});

});



function get_taxies(city){
	$.ajax({
		url: "json/cities.json",
		dataType: "json",
		success: function(result){  

        	//alert(JSON.stringify(result))
        	var obj = result.cities;

        	if(obj[city])
        		$('#taxis_result').html(obj[city]+ " taxis available").show();
        	else
        		$('#taxis_result').html("Right now no taxi available").show();
    	}
	});
}