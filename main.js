
// @since 02.11.2017


//****************************************
// GLOBALE VARIABLEN
//****************************************

var map;
var moaiMarkerCluster;
var volcanoMarkerCluster;
var ranoRarakuMarker = new L.FeatureGroup();


//****************************************
// FUNKTIONASAUFRUF WENN DOKUMENT VOLLSTÄNDIG GELADEN IST
//****************************************

jQuery(document).ready(function(){
    getMap();  										// Funktionsaufruf getMap()
	
	// REAKTION BEI KLICK AUF DEN BUTTON "Impressum"
    jQuery("#btnInformation").click(function(){ 
        document.getElementById('modalHeaderInformation').innerHTML = "<h4 class='modal-title'>Information zur Webanwendung</h4>";
        document.getElementById('modalBodyInformation').innerHTML =  "<div>Web-Projekt der Hochschule Mainz im Modul Interdisziplinäre Anwendungen raumbezogener Informationstechnik<br>M.Sc. Geoinformatik und Vermessung - WS 2017/2018<br><br>Verantwortlich für den Inhalt der Webseite:<br>Alexander Bär, Sandro Mertens, Thomas Müller, Alexander Rolwes</div>";
        jQuery("#modalInformation").modal();		// Aufruf des Bootstrap Modals
    });   
	
	// REAKTION BEI KLICK AUF DEN BUTTON "Osterinsel"
    jQuery("#btnOsterinsel").click(function(){ 
		getOsterinselInfo();
    });   
	
	// REAKTION BEI KLICK AUF DEN BUTTON "Rano Raraku"
    jQuery("#btnRanoRaraku").click(function(){ 
		getRanoRarakuInfo();
    });   
	
	// REAKTION BEI KLICK AUF DEN BUTTON "Moai Statuen"
    jQuery("#btnMoai").click(function(){
		getMoaiInfo();
    });  

	// CHECKBOX VULKAN-DATEN ANZEIGEN
	jQuery("#vulcans_check").on('change', function () {
		if (this.checked) {
			// Anzeige aller Vulkane auf der Karte	
			getVolcanos();
		} else {
			// Entfernen aller Vulkane auf der Karte
			volcanoMarkerCluster.clearLayers();
		}
	});
	
	// CHECKBOX RANO-RARAKU-DATEN ANZEIGEN
	jQuery("#ranoRaraku_check").on('change', function () {
		if (this.checked) {
			// Anzeige aller Rano-Raraku auf der Karte
			getRanoRaraku();
		} else {
			// Entfernen aller Rano-Raraku auf der Karte
			ranoRarakuMarker.clearLayers();
		}
	});
	
	// CHECKBOX MOAI-DATEN ANZEIGEN
	jQuery("#moai_check").on('change', function () {
		if (this.checked) {
			// Anzeige aller Moai auf der Karte
			getMoai();
		} else {
			// Entfernen aller Moai auf der Karte
			moaiMarkerCluster.clearLayers();
		}
	});
});


//****************************************
// PUBLIC METHODEN
//****************************************

// ERZEUGEN DER KARTE
function getMap(){
	// Attribue der Karte
    map = L.map('map', {
        center: [-27.12389, -109.34611],
        zoom: 12,
		minZoom: 3,
    });
	// Festlegung der Karte sowie der Urheberrechte
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors | &copy; IDARIT Gruppe 1'
    }).addTo(map);
	// Anzeige eines dynamischen Maßstabs 
	L.control.scale().addTo(map);
}

// ÖFFNEN DES LADEBALKENS
function displayProgressBar(){
	jQuery('body').css('pointer-events','none');	// Mausevents nicht zulassen
	document.getElementById('modalBodyProgress').innerHTML =  "<div> <br><img src='marker/progressBar.gif'><br><br>Bitte warten, die Daten werden geladen!<br></div>";
	jQuery("#modalProgressBar").modal({
		keyboard: false		// Tastaturevents nicht zulassen
	});
}

// SCHLIESSEN DES LADEBALKENS
function closeProgressBar(){
	jQuery("#modalProgressBar").modal('toggle');
	jQuery('body').css('pointer-events','auto');	// Mausevents wieder zulassen
}

// Abfrage der Osterinsel-Daten vom SPARQL-Endpoint zur Darstellung im Popup
function getOsterinselInfo(){
	var endpointUrl = 'https://dbpedia.org/sparql';
	var sparqlQuery = "PREFIX dbo: <http://dbpedia.org/ontology/>\n" +
		"PREFIX dbr: <http://dbpedia.org/resource/>\n" +
		"PREFIX foaf:  <http://xmlns.com/foaf/0.1/>\n" +
		"SELECT DISTINCT ?abstract ?countryname ?hauptstadtname ?language ?population ?waehrung ?flag ?tempJan ?tempFeb ?tempMar ?tempApr ?tempMay ?tempJun ?tempJul ?tempAug ?tempSep ?tempOct ?tempNov ?tempDec ?janPrecipitation ?febPrecipitation ?marPrecipitation ?aprPrecipitation ?mayPrecipitation ?junPrecipitation ?julPrecipitation ?augPrecipitation ?sepPrecipitation ?octPrecipitation ?novPrecipitation ?decPrecipitation WHERE {\n" +
			"dbr:Easter_Island dbo:abstract ?abstract.\n" +
			"dbr:Easter_Island dbo:country ?country.\n" +
			"?country foaf:name ?countryname.\n" +
			"dbr:Easter_Island dbp:seat ?hauptstadt.\n" +
			"?hauptstadt foaf:name ?hauptstadtname.\n" +
			"dbr:Easter_Island dbp:blank1InfoSec ?language.\n" +
			"dbr:Easter_Island dbo:populationTotal ?population.\n" +
			"dbr:Easter_Island dbp:blankInfoSec ?waehrung.\n" +
			"dbr:Easter_Island dbo:thumbnail ?flag.\n" +
			"FILTER langMatches(lang(?abstract), 'de')\n" +
			"dbr:Easter_Island dbp:janMeanC ?tempJan.\n" +
			"dbr:Easter_Island dbp:febMeanC ?tempFeb.\n" +
			"dbr:Easter_Island dbp:marMeanC ?tempMar.\n" +
			"dbr:Easter_Island dbp:aprMeanC ?tempApr.\n" +
			"dbr:Easter_Island dbp:mayMeanC ?tempMay.\n" +
			"dbr:Easter_Island dbp:junMeanC ?tempJun.\n" +
			"dbr:Easter_Island dbp:julMeanC ?tempJul.\n" +
			"dbr:Easter_Island dbp:augMeanC ?tempAug.\n" +
			"dbr:Easter_Island dbp:sepMeanC ?tempSep.\n" +
			"dbr:Easter_Island dbp:octMeanC ?tempOct.\n" +
			"dbr:Easter_Island dbp:novMeanC ?tempNov.\n" +
			"dbr:Easter_Island dbp:decMeanC ?tempDec.\n" +
			"dbr:Easter_Island dbp:janPrecipitationMm ?janPrecipitation.\n" +
			"dbr:Easter_Island dbp:febPrecipitationMm ?febPrecipitation.\n" +
			"dbr:Easter_Island dbp:marPrecipitationMm ?marPrecipitation.\n" +
			"dbr:Easter_Island dbp:aprPrecipitationMm ?aprPrecipitation.\n" +
			"dbr:Easter_Island dbp:mayPrecipitationMm ?mayPrecipitation.\n" +
			"dbr:Easter_Island dbp:junPrecipitationMm ?junPrecipitation.\n" +
			"dbr:Easter_Island dbp:julPrecipitationMm ?julPrecipitation.\n" +
			"dbr:Easter_Island dbp:augPrecipitationMm ?augPrecipitation.\n" +
			"dbr:Easter_Island dbp:sepPrecipitationMm ?sepPrecipitation.\n" +
			"dbr:Easter_Island dbp:octPrecipitationMm ?octPrecipitation.\n" +
			"dbr:Easter_Island dbp:novPrecipitationMm ?novPrecipitation.\n" +
			"dbr:Easter_Island dbp:decPrecipitationMm ?decPrecipitation.\n" +
		"}";	
		
	displayProgressBar();
	jQuery.ajax({
		type: 'GET',
		url: endpointUrl,
		headers: { Accept: 'application/sparql-results+json' },
		data: {query: sparqlQuery },
		success: function(data){ 
			closeProgressBar();
			document.getElementById('modalHeaderOsterinsel').innerHTML = "<h4 class='modal-title'>Osterinsel</h4>";
			document.getElementById('modalBodyOsterinsel').innerHTML =  "<div class='info_abstract'>" + data.results.bindings[0].abstract.value + "</div> <div class='info_flag'><img src='"+ data.results.bindings[0].flag.value + "' width='150px'></div> <div class='info_fakten'><b>Land: </b>" + data.results.bindings[0].countryname.value + "<br><b>Einwohnerzahl: </b>" + data.results.bindings[0].population.value + "<br><b>Hauptstadt: </b>" + data.results.bindings[0].hauptstadtname.value + "<br><b>Währung: </b>" + data.results.bindings[0].waehrung.value + "<br><b>Sprache: </b>" + data.results.bindings[0].language.value + "</div> <div class='info_diagramm'>Klimadiagramm:</div> <div id='data_diagramm'></div>";
			var temperature_data = [parseFloat(data.results.bindings[0].tempJan.value), parseFloat(data.results.bindings[0].tempFeb.value), parseFloat(data.results.bindings[0].tempMar.value), parseFloat(data.results.bindings[0].tempApr.value), parseFloat(data.results.bindings[0].tempMay.value), parseFloat(data.results.bindings[0].tempJun.value), parseFloat(data.results.bindings[0].tempJul.value), parseFloat(data.results.bindings[0].tempAug.value), parseFloat(data.results.bindings[0].tempSep.value), parseFloat(data.results.bindings[0].tempOct.value), parseFloat(data.results.bindings[0].tempNov.value), parseFloat(data.results.bindings[0].tempDec.value)];
			var precipitation_data = [parseFloat(data.results.bindings[0].janPrecipitation.value), parseFloat(data.results.bindings[0].febPrecipitation.value), parseFloat(data.results.bindings[0].marPrecipitation.value), parseFloat(data.results.bindings[0].aprPrecipitation.value), parseFloat(data.results.bindings[0].mayPrecipitation.value), parseFloat(data.results.bindings[0].junPrecipitation.value), parseFloat(data.results.bindings[0].julPrecipitation.value), parseFloat(data.results.bindings[0].augPrecipitation.value), parseFloat(data.results.bindings[0].sepPrecipitation.value), parseFloat(data.results.bindings[0].octPrecipitation.value), parseFloat(data.results.bindings[0].novPrecipitation.value), parseFloat(data.results.bindings[0].decPrecipitation.value)];
			draw_chart(temperature_data, precipitation_data);
			jQuery("#modalOsterinsel").modal();		// Aufruf des Bootstrap Modals
		},
		error: function() { alert('something bad happened'); }
	});
}

// Abfrage der RanoRaraku-Daten von zwei SPARQL-Endpoint zur Darstellung im Popup
function getRanoRarakuInfo(){
	var abstractValue;
	var endpointUrlDBpedia = 'https://dbpedia.org/sparql';
	var sparqlQueryDBpedia = "PREFIX dbo: <http://dbpedia.org/ontology/>\n" +
		"PREFIX dbr: <http://dbpedia.org/resource/>\n" +
		"PREFIX foaf:  <http://xmlns.com/foaf/0.1/>\n" +
		"SELECT DISTINCT ?abstract WHERE{\n" +
			"dbr:Rano_Raraku dbo:abstract ?abstract.\n" +
			"FILTER langMatches(lang(?abstract), 'de')\n" +
		"}";
		
	var endpointUrlWiki = 'https://query.wikidata.org/sparql';
    var sparqlQueryWiki = "SELECT ?Rano_Raraku ?height ?picture ?country ?countryLabel ?administrative_entity ?administrative_entityLabel WHERE {\n" +
        "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],de\". }  \n" +
        "  ?Rano_Raraku wdt:P373 \"Rano Raraku\".\n" +
        "  ?Rano_Raraku wdt:P2044 ?height.\n" +
        "  ?Rano_Raraku wdt:P361 wd:Q14452.\n" +
        "  ?Rano_Raraku wdt:P18 ?picture.\n" +
        "  ?Rano_Raraku wdt:P17 ?country.\n" +
        "  ?Rano_Raraku wdt:P131 ?administrative_entity. \n" +
        "}\n" +
        "LIMIT 100",
    settings = {
        headers: { Accept: 'application/sparql-results+json' },
        data: { query: sparqlQueryWiki }
    };		
	
	displayProgressBar();
	jQuery.ajax({
		type: 'GET',
		url: endpointUrlDBpedia,
		headers: { Accept: 'application/sparql-results+json' },
		data: {query: sparqlQueryDBpedia },
		success: function(data){
			 abstractValue = data.results.bindings[0].abstract.value;
		},
		error: function() { alert('something bad happened'); }
	});
	
	jQuery.ajax({
		type: 'GET',
		url: endpointUrlWiki,
		headers: { Accept: 'application/sparql-results+json' },
		data: {query: sparqlQueryWiki },
		success: function(data){ 
			closeProgressBar();
			document.getElementById('modalHeaderRanoRaraku').innerHTML = "<h4 class='modal-title'>Rano Raraku</h4>";
			document.getElementById('modalBodyRanoRaraku').innerHTML =  "<div class='info_secondabstract'>" + abstractValue + "</div> <div class='info_fakten'><b> Höhe: </b>" + data.results.bindings[0].height.value + " m<br><b> Land: </b>" + data.results.bindings[0].countryLabel.value + " <br><b> Verwaltungseinheit: </b>" + data.results.bindings[0].administrative_entityLabel.value + "</div><div class='fakten'><img src='"+ data.results.bindings[0].picture.value + "' width='300px'></div>";
			jQuery("#modalRanoRaraku").modal();		// Aufruf des Bootstrap Modals
		},
	error: function() { alert('something bad happened'); }
	});	
}

// Abfrage der Moai-Daten vom SPARQL-Endpoint zur Darstellung im Popup
function getMoaiInfo(){
	var endpointUrl = 'https://dbpedia.org/sparql';
	var sparqlQuery = "PREFIX dbo: <http://dbpedia.org/ontology/>\n" +
		"PREFIX dbr: <http://dbpedia.org/resource/>\n" +
		"PREFIX foaf:  <http://xmlns.com/foaf/0.1/>\n" +
		"SELECT DISTINCT ?abstract ?pic WHERE {\n" +
			"dbr:Moai dbo:abstract ?abstract.\n" +
			"dbr:Moai dbo:thumbnail ?pic.\n" +
			"FILTER langMatches(lang(?abstract), 'de')\n" +
		"}";	
		
	displayProgressBar();
	jQuery.ajax({
		type: 'GET',
		url: endpointUrl,
		headers: { Accept: 'application/sparql-results+json' },
		data: {query: sparqlQuery },
		success: function(data){ 
			closeProgressBar();
			document.getElementById('modalHeaderMoai').innerHTML = "<h4 class='modal-title'>Moai</h4>";
			document.getElementById('modalBodyMoai').innerHTML =  "<div class='info_secondabstract'>" + data.results.bindings[0].abstract.value + "</div> <div class='info_fakten'><img src='"+ data.results.bindings[0].pic.value + "' width='300px'></div> ";
			jQuery("#modalMoai").modal();		// Aufruf des Bootstrap Modals
		},
		error: function() { alert('something bad happened'); }
	});
}

// Abfrage der Volcano-Daten vom lokalen volcanoArray und Darstellung auf der Karte inkl. Cluster
function getVolcanos(){
	volcanoMarkerCluster = L.markerClusterGroup({
		iconCreateFunction: function(cluster) {
			var zahl = cluster.getChildCount() 
			var stringzahl = zahl.toString();
			var ziffern = stringzahl.length;
			if (ziffern == 1){
				var html = "<div class='cluster_text' style='margin-left: 21px;'>"+cluster.getChildCount()+"</div> <img src='marker/volcano.png' height='50px' width='50px'/>";
			}
			if (ziffern == 2){
				var html = "<div class='cluster_text' style='margin-left: 18px;'>"+cluster.getChildCount()+"</div> <img src='marker/volcano.png' height='50px' width='50px'/>";
			}
			if (ziffern == 3){
				var html = "<div class='cluster_text' style='margin-left: 16px;'>"+cluster.getChildCount()+"</div> <img src='marker/volcano .png' height='50px' width='50px'/>";
			}									
			return L.divIcon({
				html: html, 
				iconAnchor: [25, 25],
				className: 'mycluster' 
				});
		}
	});
	// Festlegung des Volcano-Icons
	var volcanoIcon = L.icon({
		iconUrl: 'marker/volcano.png',
		iconSize: [30, 30],
		iconAnchor: [15, 15],	
	});
	for (var volcano in volcanoArray.features){
		var popupText = "<b>Name: </b>" + volcanoArray.features[volcano].properties.name;
		var volcanoMarker = new L.marker([volcanoArray.features[volcano].geometry.coordinates[1], volcanoArray.features[volcano].geometry.coordinates[0]],{icon: volcanoIcon}).bindPopup(popupText).on('click', volcanoMarkerOnClick);
		volcanoMarkerCluster.addLayer(volcanoMarker);
	}
	map.addLayer(volcanoMarkerCluster);
}

// OnClick Event um Popup des jeweiligen Markers zu öffnen
function volcanoMarkerOnClick(e){
	this.openPopup();	
}

// Abfrage der RanoRaraku-Daten vom SPARQL-Endpoint zur späteren Darstellung auf der Karte
function getRanoRaraku(){
	var endpointUrl = 'https://query.wikidata.org/sparql';
	var sparqlQuery = "PREFIX wd: <http://www.wikidata.org/entity/>\n"+
	"PREFIX wdt: <http://www.wikidata.org/prop/direct/>\n"+
	"PREFIX wikibase: <http://wikiba.se/ontology#>\n"+
		"SELECT DISTINCT ?loc ?elevation ?country ?countryLabel ?instance ?instanceLabel WHERE {\n"+
			"wd:Q937167 wdt:P625 ?loc. \n"+
			"wd:Q937167 wdt:P2044 ?elevation. \n"+
			"wd:Q937167 wdt:P17 ?country. \n"+
			"wd:Q937167 wdt:P31 ?instance. \n"+
			"\n" +
			"SERVICE wikibase:label { bd:serviceParam wikibase:language \"de\" . }\n" +
		"}";
	displayProgressBar();
	jQuery.ajax({
		type: 'GET',
		url: endpointUrl,
		headers: { Accept: 'application/sparql-results+json' },
		data: {query: sparqlQuery },
		success: function(data){ 
			closeProgressBar();
			addRanoRarakuToMap(data);
		},
		error: function() { alert('something bad happened'); }
	});
}

// Darstellung der RanoRaraku-Daten im Kartenbereich
function addRanoRarakuToMap(data){
	// Festlegung des RanoRaraku-Icons
	var ranoRarakuIcon = L.icon({
		iconUrl: 'marker/rano_raraku.png',
		iconSize: [25, 25],
		iconAnchor: [12.5, 12.5],	
	});
	
	var dataset = data.results.bindings[0].loc.value;
	var subCoord = dataset.substring(6, 30);
	var markerCoord	= subCoord.split(" ");
	var popupText = "<b>Land: </b>" + data.results.bindings[0].countryLabel.value + "<br><b>Instanz: </b>" + ( data.results.bindings[0].instanceLabel.value) + ", " + ( data.results.bindings[1].instanceLabel.value) + "<br><b>Höhe [m]: </b>" + data.results.bindings[0].elevation.value;
	var _ranoRarakuMarker = new L.marker([markerCoord[1], markerCoord[0]],{icon: ranoRarakuIcon}).bindPopup(popupText).on('click', ranoRarakuMarkerOnClick);
	ranoRarakuMarker.addLayer(_ranoRarakuMarker);
	
	map.addLayer(ranoRarakuMarker);
};

// OnClick Event um Popup des jeweiligen Markers zu öffnen
function ranoRarakuMarkerOnClick(e){
	this.openPopup();	
}

// Abfrage der Moai-Daten vom SPARQL-Endpoint zur späteren Darstellung auf der Karte
function getMoai(){
	var endpointUrl = 'https://sophox.org/bigdata/namespace/wdq/sparql';
	var sparqlQuery = "prefix osmnode: <https://www.openstreetmap.org/node/>\n" +
		"prefix osmway: <https://www.openstreetmap.org/way/>\n" +
		"prefix osmrel: <https://www.openstreetmap.org/relation/>\n" +
		"prefix osmt: <https://wiki.openstreetmap.org/wiki/Key:>\n" +
		"prefix osmm: <https://www.openstreetmap.org/meta/>\n" +
		"\n" +
		"SELECT * WHERE { \n" +
		"  ?osmObj osmt:name 'Moai' .\n" +
		"  ?osmObj osmm:loc ?loc .\n" +
		"  ?osmObj osmt:material ?material .\n" +
		"  ?osmObj osmt:memorial ?memorial .\n" +
		"  ?osmObj osmt:note ?number\n" +
		"\n" +
		"  SERVICE wikibase:label { bd:serviceParam wikibase:language \"ru,fr,de,en\" . }\n" +
		"}";

	displayProgressBar();
	jQuery.ajax({
		type: 'GET',
		url: endpointUrl,
		headers: { Accept: 'application/sparql-results+json' },
		data: {query: sparqlQuery },
		success: function(data){ 
			closeProgressBar();
			addMoaiToMap(data);
		},
		error: function() { alert('something bad happened'); }
	});
}

// Darstellung der Moai-Daten im Kartenbereich inkl. Cluster
function addMoaiToMap(data){
	moaiMarkerCluster = L.markerClusterGroup({
		iconCreateFunction: function(cluster) {

			var zahl = cluster.getChildCount() 
			var stringzahl = zahl.toString();
			var ziffern = stringzahl.length;
			if (ziffern == 1){
				var html = "<div class='cluster_text' style='margin-left: 21px;'>"+cluster.getChildCount()+"</div> <img src='marker/moai.png' height='50px' width='50px'/>";
			}
			if (ziffern == 2){
				var html = "<div class='cluster_text' style='margin-left: 18px;'>"+cluster.getChildCount()+"</div> <img src='marker/moai.png' height='50px' width='50px'/>";
			}
			if (ziffern == 3){
				var html = "<div class='cluster_text' style='margin-left: 16px;'>"+cluster.getChildCount()+"</div> <img src='marker/moai.png' height='50px' width='50px'/>";
			}									
			return L.divIcon({
				html: html, 
				iconAnchor: [25, 25],
				className: 'mycluster' 
				});
		}
	});
	// Festlegung des Moai-Icons
	var moaiIcon = L.icon({
		iconUrl: 'marker/moai.png',
		iconSize: [30, 30],
		iconAnchor: [15, 15],	
	});
	for (var coord in data.results.bindings){
		var dataset = data.results.bindings[coord].loc.value;
		var subCoord = dataset.substring(6, 30);
		var markerCoord	= subCoord.split(" ");
		var popupText = "<b>Typ: </b>" + data.results.bindings[coord].memorial.value + "<br><b>Moai Nummer: </b>" + ( data.results.bindings[coord].number.value).substring(12) + "<br><b>Material: </b>" + data.results.bindings[coord].material.value;
		var moaiMarker = new L.marker([markerCoord[1], markerCoord[0]],{icon: moaiIcon}).bindPopup(popupText).on('click', moaiMarkerOnClick);
		moaiMarkerCluster.addLayer(moaiMarker);
	}
	map.addLayer(moaiMarkerCluster);
};

// OnClick Event um Popup des jeweiligen Markers zu öffnen
function moaiMarkerOnClick(e){
	this.openPopup();	
}

// Erzeugung eines Klima-Linien-Diagramms zur Darstellung von Temperatur- und Niederschlagsdaten der Osterinsel
function draw_chart(temperature_data, precipitation_data){
	jQuery('#data_diagramm').highcharts({
		chart: {
			zoomType: 'xy'
		},
		title: {
			text: null
		},
		exporting: { 
			enabled: false 
		},
		xAxis: [{
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
				'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			crosshair: true
		}],
		yAxis: [{ // Primary yAxis
			labels: {
				format: '{value} °C',
				style: {
					color: '#bd362f'
				}
			},
			title: {
				text: 'Temperatur',
				style: {
					color: '#bd362f'
				}
			}
		}, { // Secondary yAxis
			title: {
				text: 'Niederschlag',
				style: {
					color: Highcharts.getOptions().colors[0]
				}
			},
			labels: {
				format: '{value} mm',
				style: {
					color: Highcharts.getOptions().colors[0]
				}
			},
			opposite: true
		}],
		tooltip: {
			shared: true
		},
		series: [{
			name: 'Niederschlag',
			type: 'column',
			yAxis: 1,
			data: precipitation_data,
			tooltip: {
				valueSuffix: ' mm'
			}
		}, {
			name: 'Temperatur',
			type: 'spline',
			color: '#bd362f',
			data: temperature_data,
			tooltip: {
				valueSuffix: ' °C'
			}
		}]
	});
}