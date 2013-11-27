/********************************
Librerias Integradas de Evolucion
********************************/
function int(x){
	return parseInt(x);
}
function INTLINEAL(){
	var tipoExtra, x1, dx, y=[];;
	if(arguments.length>=4){
		tipoExtra=arguments[0];
		x1=arguments[1];
		dx=arguments[2];
		for(var i=3;i<arguments.length;i++){
			y.push(arguments[i]);
		}
	}
	function evalIntLineal(x){
		var y1;
		var x2=x1+(dx*(y.length-1));
		if(x<x1 || x>x2){
			switch(tipoExtra){
				case 0:		//ciclica
					if(x<x1){
						x=x2+((x-x2)%(x1-x2));
					}
					else if(x>x2){
						x=x1+((x-x1)%(x2-x1));
					}
					y1=evalIntLineal(x);
				break;
				case 1:		//nula
					y1=0;
				break;
				case 2:		//extremos
					if(x<x1){
						y1=y[0];
					}
					else if(x>x2){
						y1=y[y.length-1];
					}
				break;
			}
		}
		else{
			var xa, ya, xs, ys;
			var ind=int((x-x1)/dx);
			if(ind==y.length-1){
				ind--;
			}
			xa=ind*dx;
			xs=(ind+1)*dx;
			ya=y[ind];
			ys=y[ind+1];
			y1=((ys-ya)/(xs-xa))*(x-xa)+ya;
			//alert(x+'-'+xa+'-'+xs+'-'+ya+'-'+ys);
		}
		return y1;
	}
	return evalIntLineal;
}
function roundDec(num,dec){
    var fac=Math.pow(10,dec);
    return Math.round(num*fac)/fac;
}

/********************************
********************************/
var elementos=[];
var parametros=[], auxiliares=[], niveles=[], flujos=[], Multiplicadores=[];

function anaElem(elemAna, tipo){
	var elem = new Object();
	elemAna.find('id').each(function(){
		elem.id = $(this).text();
	});
	elemAna.find('def').each(function(){
		elem.def = $(this).text();
	});
	elemAna.find('des').each(function(){
		elem.des = $(this).text();
	});
	elemAna.find('flujos').each(function(){
		$(this).find('entran').each(function(){
			elem.flujosIng=[];
			$(this).find('ing').each(function(){
				elem.flujosIng.push($(this).text());
			});
		});
		$(this).find('salen').each(function(){
			elem.flujosSal=[];
			$(this).find('sal').each(function(){
				elem.flujosSal.push($(this).text());
			});
		});
	});
	elemAna.find('conexiones').each(function(){
		$(this).find('entran').each(function(){
			elem.conexIng=[];
			$(this).find('ing').each(function(){
				elem.conexIng.push($(this).text());
			});
		});
		$(this).find('salen').each(function(){
			elem.conexSal=[];
			$(this).find('sal').each(function(){
				elem.conexSal.push($(this).text());
			});
		});
	});
	elem.tipo = tipo;
	var div;
	switch(tipo){
		case 'parametro':
			parametros.push(elem);
			div = '#divParametros';
		break;
		case 'auxiliar':
			auxiliares.push(elem);
			div = '#divAuxiliares';
		break;
		case 'nivel':
			niveles.push(elem);
			div = '#divNiveles';
		break;
		case 'flujo':
			flujos.push(elem);
			div = '#divFlujos';
		break;
		case 'multiplicador':
			Multiplicadores.push(elem);
			div = '#divMultiplicadores';
		break;
		
	}
	$('<div class="campo"></div>').html('<label for="'+elem.id+'"><input type="checkbox" id="'+elem.id+'_cb"/>'+elem.id+': </label><input id="'+elem.id+'" type="text" value="'+elem.def+'">').appendTo(div);
};
function estaElementos(){
	for(var i=0;i<parametros.length;i++){
		elementos.push(parametros[i]);
	}
	for(var i=0;i<auxiliares.length;i++){
		elementos.push(auxiliares[i]);
	}
	for(var i=0;i<niveles.length;i++){
		elementos.push(niveles[i]);
	}
	for(var i=0;i<flujos.length;i++){
		elementos.push(flujos[i]);
	}
	for(var i=0;i<Multiplicadores.length;i++){
		elementos.push(Multiplicadores[i]);
	}
};
function esAdmitido(conexIng, pilaAdm){
	var esAdmAct=false;
	var esAdmAnt;
	for(var i=0;i<conexIng.length;i++){
		esAdmAnt=esAdmAct;
		esAdmAct=false;
		for(var j=0;j<pilaAdm.length;j++){
			if(conexIng[i] == elementos[pilaAdm[j]].id){
				if(i!=0){
					if(!esAdmAnt){
						return false;
					}
				}
				esAdmAct=true;
				j=pilaAdm.length;
			}
		}
	}
	return esAdmAct;
};
function estaPrioridad(){
	var pilaAdm=[], pilaEsp=[];
	for(var i=0; i<elementos.length; i++){
		pilaEsp.push(i);
	}	
	while(pilaAdm.length<elementos.length){
		for(var i=0; i<pilaEsp.length; i++){
			if(!elementos[pilaEsp[i]].conexIng){
				pilaAdm.push(pilaEsp[i]);
				pilaEsp.splice(i,1);
				i--;
			}
			else if(elementos[pilaEsp[i]].conexIng.length == 0){
				pilaAdm.push(pilaEsp[i]);
				pilaEsp.splice(i,1);
				i--;
			}
			else if(esAdmitido(elementos[pilaEsp[i]].conexIng,pilaAdm)){
				pilaAdm.push(pilaEsp[i]);
				pilaEsp.splice(i,1);
				i--;
			}
		}
	}
	return pilaAdm;
};
function genCodigo(pri){
	var codigo=
	'\n'+'var t_serie=[];'+
	'\n'+'var ti='+ti+';'+
	'\n'+'var tf='+tf+';'+
	'\n'+'var dt='+dt+';'+
	'\n'+'var t=ti;'+
	'\n';
	for(var i=0; i<pri.length;i++){	
		if(elementos[pri[i]].tipo=='parametro'||elementos[pri[i]].tipo=='nivel'){
			codigo+=
			'\n'+'var '+elementos[pri[i]].id+'='+elementos[pri[i]].def+';';
		}
		else if(elementos[pri[i]].tipo=='multiplicador'){
			codigo+=
			'\n'+'var '+elementos[pri[i]].id+'_func='+elementos[pri[i]].def+';';
		}
		else{
			codigo+=
			'\n'+'var '+elementos[pri[i]].id+';';
		}
		if($("#"+elementos[pri[i]].id+'_cb').is(':checked')){
			codigo+=
			'\n'+'var '+elementos[pri[i]].id+'_serie=[];';
		}
	}

	codigo+=
	'\n'+
	'\n'+'while(t<=tf){'+
	'\n\t'+'t_serie.push(roundDec(t,2));';
	for(var i=0; i<pri.length;i++){
		if(elementos[pri[i]].tipo=='parametro'){
			if($("#"+elementos[pri[i]].id+'_cb').is(':checked')){
				codigo+=
				'\n\t'+elementos[pri[i]].id+'_serie.push(roundDec('+elementos[pri[i]].id+',4));';
			}
		}
		if(elementos[pri[i]].tipo=='auxiliar'){
			codigo+=
			'\n\t'+elementos[pri[i]].id+'='+elementos[pri[i]].def+';';
			if($("#"+elementos[pri[i]].id+'_cb').is(':checked')){
				codigo+=
				'\n\t'+elementos[pri[i]].id+'_serie.push(roundDec('+elementos[pri[i]].id+',4));';
			}
		}
		else if(elementos[pri[i]].tipo=='flujo'){
			codigo+=
			'\n\t'+elementos[pri[i]].id+'='+elementos[pri[i]].def+';';
			if($("#"+elementos[pri[i]].id+'_cb').is(':checked')){
				codigo+=
				'\n\t'+elementos[pri[i]].id+'_serie.push(roundDec('+elementos[pri[i]].id+',4));';
			}
		}
		else if(elementos[pri[i]].tipo=='multiplicador'){
			codigo+=
			'\n\t'+elementos[pri[i]].id+'='+elementos[pri[i]].id+'_func('+elementos[pri[i]].conexIng[0]+');';
			if($("#"+elementos[pri[i]].id+'_cb').is(':checked')){
				codigo+=
				'\n\t'+elementos[pri[i]].id+'_serie.push(roundDec('+elementos[pri[i]].id+',4));';
			}
		}
		
	}
	for(var i=0; i<pri.length;i++){
		if(elementos[pri[i]].tipo=='nivel'){
			
			if($("#"+elementos[pri[i]].id+'_cb').is(':checked')){
				codigo+=
				'\n\t'+elementos[pri[i]].id+'_serie.push(roundDec('+elementos[pri[i]].id+',4));';
			}
			
			codigo+=			
			'\n\t'+elementos[pri[i]].id+'='+elementos[pri[i]].id+'+(';
			
			var flujosIng=elementos[pri[i]].flujosIng;
			var flujosSal=elementos[pri[i]].flujosSal;
			for(var j=0; j<flujosIng.length-1;j++){
				codigo+=
				flujosIng[j]+'+';
			}
			if(flujosIng.length>0){
				codigo+=
				flujosIng[flujosIng.length-1];
			}
			for(var j=0; j<flujosSal.length;j++){
				codigo+=
				'-'+flujosSal[j];
			}
			codigo+=
			')*dt;';
		}
	}
	codigo+=
	'\n\t'+'t=t+dt;'+
	'\n'+'}';
	return codigo;
}
var chart;
function simular(){
	var codigo=genCodigo(pri);
	var elementos_series, tiempo_serie;
	$('#codigo').empty();
	$('<pre id="modEcu" class="code" lang="js"></pre>').appendTo('#codigo');
	$('#modEcu').text('//Modelo en lenguaje de ecuaciones:'+codigo);
	jQuery.globalEval(codigo);
	
	tiempo_serie=eval('t_serie');
	elementos_series=[];
	
	for(var i=0; i<elementos.length;i++){
		if($("#"+elementos[i].id+"_cb").is(':checked')){
			elementos_series.push({                
				name: elementos[i].id,                               
				data: eval(elementos[i].id+'_serie')               
			});
		}	
	}        
	chart = new Highcharts.Chart({            
		chart: {                
			renderTo: 'visualizador',                
			type: 'line'            
		},            
		title: {                
			text: 'Juego de la epidemia'            
		},            
		xAxis: {                
			categories: tiempo_serie            
		},            
		yAxis: {                
			title: {                    
				text: 'Valor'                
			}           
		},            
		tooltip: {                
			crosshairs: true,                
			shared: true            
		},            
		series: elementos_series        
	});
	$('#modEcu').highlight({source:1, zebra:1, indent:'space', list:'ol'});	
}
function camDef(idArg, valArg){
	for(var i=0; i<elementos.length;i++){
		if(elementos[i].id==idArg){
			elementos[i].def=valArg;
			i=elementos.length;
		}
	}
}

$(document).ready(
function(){
	$.ajax({
		type: 'GET',
		url: 'http://localhost/modelo_evolucion?file=juego',
		dataType: ($.browser.msie && parseInt($.browser.version, 10) < 9) ? 'text' : 'xml',
		dataType: 'xml',
		cache: false,
		timeout: 2000,
		error: function(data){
			alert('Error occurred loading the XML');
		},
		success: function(data){
			var xml;
			if(typeof data == 'string'){
				xml = new ActiveXObject('Microsoft.XMLDOM');
				xml.async = false;
				xml.loadXML(data);
			} else {
				xml = data;
			}
			$(xml).find('forrester').each(function(){
				$(this).find('parametro').each(function(){ 
					anaElem($(this), 'parametro');
				});
				$(this).find('auxiliar').each(function(){ 
					anaElem($(this), 'auxiliar');
				});
				$(this).find('nivel').each(function(){ 
					anaElem($(this), 'nivel');
				});
				$(this).find('flujo').each(function(){ 
					anaElem($(this), 'flujo');
				});
				$(this).find('multiplicador').each(function(){ 
					anaElem($(this), 'multiplicador');
				});
			});
		}
	});
});
var pri, ti=0, tf=30, dt=1;

$(document).ajaxComplete(function(e, x) {
	estaElementos();
	pri=estaPrioridad();
	simular();
	
	$("#accordion").accordion({ header: "h3" });
	$("#accordion").css('margin-bottom','5px');
	for(var i=0;i<elementos.length;i++){
		if(elementos[i].tipo=='parametro'){
			$("#"+elementos[i].id).spinner({step: 0.01});
			$("#"+elementos[i].id).addClass('ui-widget-content');
		}
		/*$("#"+elementos[i].id+"_cb").change(function(){
			simular();
		});
		$("#"+elementos[i].id).change(function(){
			camDef($(this).attr('id'), $(this).val());
			simular();
		});*/
	};
	$("#ti").spinner({step: 1});
	$("#tf").spinner({step: 1});
	$("#dt").spinner({step: 0.1});
	$("#ti").addClass('ui-widget-content');
	$("#tf").addClass('ui-widget-content');
	$("#dt").addClass('ui-widget-content');
	$("#ti").val(ti);
	$("#tf").val(tf);
	$("#dt").val(dt);
	/*$("#ti").change(function(){
		ti=$("#ti").val();
		simular();
	});
	$("#tf").change(function(){
		tf=$("#tf").val();
		simular();
	});
	$("#dt").change(function(){
		dt=$("#dt").val();
		if(dt==0){
			dt=1;
		}
		simular();
	});*/
	for(var i=0;i<auxiliares.length;i++){
		$("#"+auxiliares[i].id).addClass('ui-widget-content');
	};
	for(var i=0;i<niveles.length;i++){
		$("#"+niveles[i].id).addClass('ui-widget-content');
	};
	for(var i=0;i<flujos.length;i++){
		$("#"+flujos[i].id).addClass('ui-widget-content');
	};
	for(var i=0;i<Multiplicadores.length;i++){
		$("#"+Multiplicadores[i].id).addClass('ui-widget-content');
	};
});