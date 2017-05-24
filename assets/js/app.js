  var stores; 
  var HUB;
  var zoomThreshold = 16;
  var curbcuts;
  var nosidewalks;
  var walking, walking_dash;

  $(document).ready(function() {
    //OPEN ABOUT DIALOG
 //   $('#aboutModal').modal(); 
  });

  $(document).on('hide.bs.modal','#aboutModal', function () {
    setTimeout(goHome, 2000);
  });
  // This will let you use the .remove() function later on
  if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function() {
      if (this.parentNode) {
          this.parentNode.removeChild(this);
      }
    };
  }

   $(function () {
      $('.glyphicon').unbind('click');
      $('.glyphicon').click(function (e) {
      $(this).toggleClass('glyphicon glyphicon-plus glyphicon glyphicon-minus');
      $('.content-one').slideToggle('slow'); return false;
  });
    });

  mapboxgl.accessToken = 'pk.eyJ1IjoiY3J2YW5wb2xsYXJkIiwiYSI6ImNqMHdvdnd5MTAwMWEycXBocm4zbXVjZm8ifQ.3zjbFccILu6mL7cOTtp40A';

  // This adds the map
  var map = new mapboxgl.Map({
    // container id specified in the HTML
    container: "map", 
   // style: 'mapbox://styles/mapbox/dark-v9', 
    style:'mapbox://styles/mapbox/outdoors-v10',
  //style: 'mapbox://styles/crvanpollard/ciyd8fyqo008j2rqfku4qxcb9',
    center: [ -75.898,40.369], 
    bearing: 20, // Rotate Philly ~9° off of north, thanks Billy Penn.
    pitch: 50,
    zoom: 9,
     attributionControl: false
  });

    function goHome() {
      // debugger
      if (map.loaded()) {
        var p = map.getPitch();
     //   console.log(p);
        if (p > 0) {
          map.flyTo({
            center: [ -75.898,40.369], 
            zoom: 9,
            speed: 0.1,
            bearing: -5,
            pitch: 15
          });
        }
      }
    }

// add markers to map
HUB.features.forEach(function(marker2) {
    // create a DOM element for the marker
    var el2 = document.createElement('div');
    el2.className = marker2.properties.CLASS;
    el2.style.backgroundImage = 'url(https://raw.githubusercontent.com/crvanpollard/rangar_pa/master/assets/img/'+marker2.properties.Leg + '.png)';
    el2.style.width = marker2.properties.Width;
    el2.style.height = marker2.properties.Height;
//    el2.addEventListener('click', function() {
    //    window.alert(marker2.properties.ICON);
  //  });

    // add marker to map
    new mapboxgl.Marker(el2)
        .setLngLat(marker2.geometry.coordinates)
        .addTo(map)
   });    

  // This adds the data to the map
  map.on('load', function (e) {
    // This is where your '.addLayer()' used to be, instead add only the source without styling a layer
    map.addSource("places",{
      "type": "geojson",
      "data": stores
    });
    // Initialize the list
    buildLocationList(stores);
  });

  
  // This is where your interactions with the symbol layer used to be
  // Now you have interactions with DOM markers instead
  stores.features.forEach(function(marker, i) {
    // Create an img element for the marker
    var el = document.createElement('div');
      el.id = "marker-" + i;
      el.className = 'marker';
      el.style.left ='-15px';
      el.style.top ='-26px';
      el.style.backgroundImage = 'url(https://raw.githubusercontent.com/crvanpollard/rangar_pa/master/assets/img/markers/'+marker.properties.Leg + '.png)';
      el.style.width = '25px';
      el.style.height ='25px';

    // Add markers to the map at all points
    new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        .addTo(map);   

    el.addEventListener('click', function(e){
        // 1. Fly to the point
        flyToStore(marker);
        // 2. Close all other popups and display popup for clicked store
        createPopUp(marker);
        // 3. Highlight listing in sidebar (and remove highlight for all other listings)
        var activeItem = document.getElementsByClassName('active');
        e.stopPropagation();
        if (activeItem[0]) {
           activeItem[0].classList.remove('active');
        }
        var listing = document.getElementById('listing-' + i);
        listing.classList.add('active');
    });
  });

  function flyToStore(currentFeature) {
    map.flyTo({
        center: currentFeature.geometry.coordinates,
        zoom: 14
      }); 
  }

  function createPopUp(currentFeature) {
    var mq = window.matchMedia( "(min-width: 500px)" );
      if (mq.matches) {
        {
          var popUps = document.getElementsByClassName('mapboxgl-popup');
        if (popUps[0]) popUps[0].remove();

          if (currentFeature.properties.info ==='na'){ var info2 = '';}
          else { var info2 =  currentFeature.properties.info +'<br>';}


          if (currentFeature.properties.Website ==='na'){ var web = '';}
          else { var web =  '<a class="one" href="' + currentFeature.properties.Website+'" target="_new">Visit the website</a>';}


        var popup = new mapboxgl.Popup({closeOnClick: false})
              .setLngLat(currentFeature.geometry.coordinates)
              .setHTML('<h3 style="padding-bottom:1px;background:'+ currentFeature.properties.POPCOLOR +'">'+ currentFeature.properties.Name +'<br><p class="addr">'+currentFeature.properties.Address + '</font></h3>' + 
                '<h4>' + info2 + web +'</h4>')
              .addTo(map);
        }
           
    } 
    else 
        {
      var popUps = document.getElementsByClassName('mapboxgl-popup');
        if (popUps[0]) popUps[0].remove();

              if (currentFeature.properties.info ==='na'){ var info2 = '';}
          else { var info2 =  currentFeature.properties.info +'<br>';}

          if (currentFeature.properties.Website ==='na'){ var web = '';}
          else { var web =  '<a class="one" href="' + currentFeature.properties.Website+'" target="_new">Visit the website</a>';}

            
          var title = '<h3 style="padding-bottom:1px;padding-top:10px;background:'+ currentFeature.properties.POPCOLOR +'"><img src="https://raw.githubusercontent.com/crvanpollard/rangar_pa/master/assets/img/markers/'+ currentFeature.properties.Leg + '.png" class="list_markersINFO" style="vertical-align: middle;margin-right:5px;">'+currentFeature.properties.Name +'<br><p class="addr">'+currentFeature.properties.Location + '</font></h3>';
          var content = '<h4>' + info2 + web +'</h4>';

          // Modal Content
          $("#marker_title").html(title);
          $("#marker_content").html(content);

          $('#infoModal').modal('show');}
          
        // alert("NOPE");
        }


  function buildLocationList(data) {
    for (i = 0; i < data.features.length; i++) {
      var currentFeature = data.features[i];
      var prop = currentFeature.properties;
      
      var listings = document.getElementById(prop.RACE_LEG);
      var listing = listings.appendChild(document.createElement('div'));
      listing.className = 'item';
      listing.id = "listing-" + i;
      
      var link = listing.appendChild(document.createElement('a'));
      link.href = '#';
      link.className = 'title';
      link.dataPosition = i;
      link.innerHTML = '<img src="https://raw.githubusercontent.com/crvanpollard/rangar_pa/master/assets/img/markers/'+ prop.Leg+ '.png" class="list_markers" style="vertical-align: middle;margin-right:5px;">'+ prop.Name;     
      
      var details = listing.appendChild(document.createElement('div'));
     // content = prop.Address + '<br>'+prop.Amenities;
      
   //   if (prop.ADA_WC ==='no'){ var WC = '';}
   //   else { var WC =  '<img class="list_icons" src="https://raw.githubusercontent.com/crvanpollard/mapbox_listings/master/assets/img/amenities/ada_wc.png">';}

   //   if (prop.ADA_PARK ==='no'){ var Parking = '';}
   //   else { var Parking =  '<img class="list_icons" src="https://raw.githubusercontent.com/crvanpollard/mapbox_listings/master/assets/img/amenities/ada_parking.png">';}

      if (prop.amshow ==='no'){ var amshow = '';}
      else { var amshow ='<div class="amen_icons"> <img class="'+ prop.ICON_CLASS +'" src="https://raw.githubusercontent.com/crvanpollard/mapbox_listings/master/assets/img/amenities/'+ prop.AM_ICON + '.png" >';}

      content = '<div class="address_info">'
                + prop.Location 
                +'</div>'
              //  + amshow
          //      + WC
          //      + Parking
         //       + STEPS
                +'</div>';
      details.innerHTML = content;

      link.addEventListener('click', function(e){
        // Update the currentFeature to the store associated with the clicked link
        var clickedListing = data.features[this.dataPosition]; 
        // 1. Fly to the point
        flyToStore(clickedListing);
        // 2. Close all other popups and display popup for clicked store
        createPopUp(clickedListing);
        // 3. Highlight listing in sidebar (and remove highlight for all other listings)
        var activeItem = document.getElementsByClassName('active');
        if (activeItem[0]) {
           activeItem[0].classList.remove('active');
        }
        this.parentNode.classList.add('active');
      });
    }
  }

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl(),['top-left']);
map.addControl(new mapboxgl.AttributionControl(),'top-right');


var stateLegendEl = document.getElementById('extent');
var countyLegendEl = document.getElementById('county-legend');
map.on('zoom', function() {
    if (map.getZoom() > zoomThreshold) {
        stateLegendEl.style.display = 'none';
        countyLegendEl.style.display = 'block';
    } else {
        countyLegendEl.style.display = 'none';
        stateLegendEl.style.display = 'block';

    }
});

document.getElementById('export').addEventListener('click', function () {
    // Fly to a random location by offsetting the point -74.50, 40
    // by up to 5 degrees.
        var popUps = document.getElementsByClassName('mapboxgl-popup');
    if (popUps[0]) popUps[0].remove();

    map.flyTo({
        center: [ -75.898,40.369], 
            zoom: 9,
            speed: 0.5,
            bearing: -5,
            pitch: 15
    });
});


map.on('click', function (currentFeature) {
    var popUps = document.getElementsByClassName('mapboxgl-popup');
    if (popUps[0]) popUps[0].remove();
});

// parks layer
map.on('load', function () {

    map.addLayer({
        "id": "Parks",
     //   "minzoom":16,
        "type": "fill",
        "source": {
            "type": "geojson",
            "data": parks
        },
     "layout": {},
           "paint": {
            "fill-color": 'hsl(100, 59%, 76%)',
            "fill-opacity": 0.6
          //  "fill-pattern":'triangle-11'
        }
            }, 'road-path');
        
    });

// no sidewalks layer
map.on('load', function () {

    map.addLayer({
        "id": "No Sidewalks",
        "minzoom":16,
        "type": "fill",
        "source": {
            "type": "geojson",
            "data": nosidewalks
        },
     "layout": {},
           "paint": {
          //  "fill-color": 'hsl(0, 0%, 52%)',
            "fill-color": 'hsl(21, 67%, 67%)',
            "fill-opacity": 0.6,
            "fill-pattern":'dot-10'
        }
            }, 'water');
        
    });


// curb cuts layer
map.on('load', function () {

    map.addLayer({
        "id": "Curb Cuts",
        "maxzoom":21,
        "minzoom":16,
        "type": "circle",
        "source": {
            "type": "geojson",
            "data": curbcuts
        },
    //    'source-layer': 'sf2010',
        "paint": {
            "circle-radius": 3,
            "circle-color": 'rgba(254,224,139,.8)'
            }
        }
        )
    });

// walk about layer
map.on('load', function () {

    map.addLayer({
        "id": "route",
        "type": "line",
        "source": {
            "type": "geojson",
            "data": walking 
        },
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
          //  "line-color": "#66cccc",
            "line-width": 3,
         //   "line-dasharray": [2,4],
            "line-color": {
                "type": "identity",
                "property": "color"
            }
        }

    });
});


// walk about layer
map.on('load', function () {

    map.addLayer({
        "id": "route2",
        "type": "line",
        "source": {
            "type": "geojson",
            "data": walking_dash 
        },
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
          //  "line-color": "#66cccc",
            "line-width": 3,
            "line-dasharray": [2,4],
            "line-color": {
                "type": "identity",
                "property": "color"
            }
        }

    });
});

// the 'building' layer in the mapbox-streets vector source contains building-height
// data from OpenStreetMap.
map.on('load', function() {
    map.addLayer({
        'id': 'Buildings',
        'source': 'composite',
        'minzoom':15,
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
      //  'minzoom': 14,
        'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': {
                'type': 'identity',
                'property': 'height'
            },
            'fill-extrusion-base': {
                'type': 'identity',
                'property': 'min_height'
            },
            'fill-extrusion-opacity': .5
        }
    });
    });
/*
var toggleableLayerIds = [ 'Buildings'];

for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];

    var link = document.createElement('a');
    link.href = '#';
    link.className = 'active';
    link.textContent = id;

    link.onclick = function (e) {
        var clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();

        var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

        if (visibility === 'visible') {
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
            this.className = '';
        } else {
            this.className = 'active';
            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
        }
    };

    var layers = document.getElementById('menu');
    layers.appendChild(link);
}
*/
