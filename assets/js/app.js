  var stores; 
  var zoomThreshold = 16;
  var race_legs;

  var baseLayers = [{
  label: 'Hills and Woods',
  id: 'outdoors-v10'
}, {
  label: 'Engage Night Mode',
  id: 'dark-v8'
}];

var menu = document.getElementById('menu');
var geojson;

  $(document).ready(function() {
    //OPEN ABOUT DIALOG
    $('#aboutModal').modal(); 
  });

 // $(document).on('hide.bs.modal','#aboutModal', function () {
//    setTimeout(goHome, 2000);
//  });
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
 //   style: 'mapbox://styles/mapbox/dark-v9', 
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
            pitch: 35
          });
        }
      }
    }


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
      el.style.backgroundImage = 'url(https://raw.githubusercontent.com/crvanpollard/ragnar_pa/master/assets/img/markers/'+marker.properties.Leg + '.png)';
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
        pitch: 50,
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
          else { var web =  '<a class="one" href="' + currentFeature.properties.Website+'" target="_new">Launch Google Maps</a>';}


        var popup = new mapboxgl.Popup({closeOnClick: false})
              .setLngLat(currentFeature.geometry.coordinates)
              .setHTML('<h3 style="padding-bottom:1px;background:'+ currentFeature.properties.POPCOLOR +'">'+ currentFeature.properties.Name +'<br><p class="addr">'+currentFeature.properties.Rating + ' ( '+currentFeature.properties.Miles+' miles)</font></h3>' + 
                '<h4>'
                + '<B>'+ currentFeature.properties.Location +'</B><br>' 
                + 'Address: '+ currentFeature.properties.address +', '+currentFeature.properties.city+', '+currentFeature.properties.zip+'<br>' 
                + 'Rating: '+ currentFeature.properties.Rating +'<br>' 
                + 'Milage: '+ currentFeature.properties.Miles +' miles<br>' 
                + 'Estimated Start: '+ currentFeature.properties.start+'<br>' 
                + 'Estimated End: '+ currentFeature.properties.end+'<br>' 
                + 'Estimated Time: '+ currentFeature.properties.etime+'<br>' 
            //    + web 
                +'</h4>')
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

            
          var title = '<h3 style="padding-bottom:1px;padding-top:10px;background:'+ currentFeature.properties.POPCOLOR +'"><img src="https://raw.githubusercontent.com/crvanpollard/rangar_pa/master/assets/img/markers/'+ currentFeature.properties.Leg + '.png" class="list_markersINFO" style="vertical-align: middle;margin-right:5px;">'+currentFeature.properties.Name +
          currentFeature.properties.Rating + ' ( '+currentFeature.properties.Miles+' miles)<br><p class="addr">'+currentFeature.properties.Location +'</font></h3>';
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
      link.innerHTML = '<img src="https://raw.githubusercontent.com/crvanpollard/ragnar_pa/master/assets/img/markers/'+ prop.Leg+ '.png" class="list_markers" style="vertical-align: middle;margin-right:5px;">'+ prop.Name;     
      
      var details = listing.appendChild(document.createElement('div'));
     // content = prop.Address + '<br>'+prop.Amenities;
      
   //   if (prop.ADA_WC ==='no'){ var WC = '';}
   //   else { var WC =  '<img class="list_icons" src="https://raw.githubusercontent.com/crvanpollard/mapbox_listings/master/assets/img/amenities/ada_wc.png">';}

   //   if (prop.ADA_PARK ==='no'){ var Parking = '';}
   //   else { var Parking =  '<img class="list_icons" src="https://raw.githubusercontent.com/crvanpollard/mapbox_listings/master/assets/img/amenities/ada_parking.png">';}

      if (prop.amshow ==='no'){ var amshow = '';}
      else { var amshow ='<div class="amen_icons"> <img class="'+ prop.ICON_CLASS +'" src="https://raw.githubusercontent.com/crvanpollard/mapbox_listings/master/assets/img/amenities/'+ prop.AM_ICON + '.png" >';}

      content = '<div class="address_info"><i>'
                + prop.Rating + ' ( '+prop.Miles+' miles)</i><br>'
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
map.addControl(new mapboxgl.AttributionControl(),'bottom-right');

var stateLegendEl = document.getElementById('extent');

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
            pitch: 35
    });
});

map.on('click', function (currentFeature) {
    var popUps = document.getElementsByClassName('mapboxgl-popup');
    if (popUps[0]) popUps[0].remove();
});

function addDataLayer() {
  map.addSource('race-legs', {
    'type': 'geojson',
    'data': race_legs
  });

  map.addLayer({
     "id": "route",
        "type": "line",
 'source': 'race-legs',
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
       //     "line-color": "#822e81",
            "line-width": 4,
         //   "line-dasharray": [2,4],
            "line-color": {
              "type": "identity",
              "property": "color"
           }
        }
  });
}

map.on('style.load', function () {
  // Triggered when `setStyle` is called.
//  alert("NOPE");
  addDataLayer();
   map.addLayer({
        'id': 'Buildings',
        'source': 'composite',
      //  'minzoom':15,
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

// walk about layer
map.on('load', function () {

    map.addLayer({
        "id": "route",
        "type": "line",
        "source": {
            "type": "geojson",
            "data": race_legs
        },
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
       //     "line-color": "#822e81",
            "line-width": 4,
         //   "line-dasharray": [2,4],
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
      //  'minzoom':15,
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


map.on('load', function () {
  baseLayers.forEach(function(l) {
    var button = document.createElement('button'); 
    button.textContent = l.label;
    button.addEventListener('click', function() {
      map.setStyle('mapbox://styles/mapbox/' + l.id); 
    });

    menu.appendChild(button);
  });
});
