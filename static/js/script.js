let map, marker, directionsService, directionsRenderer, infoWindow;
let startMarker, endMarker, currentLocationMarker;

// Initialize the map function
function initMap() {
  const makerereLatLng = { lat: 0.335794, lng: 32.5727231 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: makerereLatLng,
    zoom: 16,
  });


  //get an instance of the find button
  const searchInput = document.getElementById("searchInput");

  const autocomplete = new google.maps.places.Autocomplete(searchInput);

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: "#00FF00", //polylie color
    },
  });

  const calculateRouteButton = document.getElementById("calculateRouteButton");
  calculateRouteButton.addEventListener("click", () => {
    if (!searchInput.value) {
      alert("You haven't added any location");
      return;
    }
    const place = autocomplete.getPlace();
    if (place && place.geometry) {
      calculateRoute(place.geometry.location);
    }
  });
  

  const popularPlaces = document.querySelectorAll("#popularPlaces a");
  popularPlaces.forEach((place) => {
    place.addEventListener("click", (e) => {
      e.preventDefault();
      const lat = parseFloat(place.getAttribute("data-lat"));
      const lng = parseFloat(place.getAttribute("data-lng"));
      const destination = new google.maps.LatLng(lat, lng);
      calculateRoute(destination);
    });
  });

  showCurrentLocation(); // Show current location when the map loads
}

function showCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Center the map on the user's location
        map.setCenter(userLocation);

        // Add a marker for the user's location
        marker = new google.maps.Marker({
          position: userLocation,
          map: map,
          title: "Your Location",
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png", // Green pin icon
          },
        });

        // Initialize the rest of the map functionality
        initMap();
      },
      (error) => {
        console.error("Error getting user location:", error);
        // Initialize the map without centering on user's location
        initMap();
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
    // Initialize the map without centering on user's location
    initMap();
  }
}

// FUNCTION:  calculate Route
function calculateRoute(destination) {
  if (!destination) {
    return;
  }

  const userLocation = marker.getPosition();
  const request = {
    origin: userLocation,
    destination: destination,
    travelMode: google.maps.TravelMode.DRIVING,
  };

  directionsService.route(request, (result, status) => {
    if (status === google.maps.DirectionsStatus.OK) {
      // Use the overview path for Snap-to-Roads API
      const overviewPath = result.routes[0].overview_path;

      // Use Snap-to-Roads API to get accurate path
      snapToRoads(overviewPath)
        .then((snappedPath) => {
          // Update directionsRenderer with snapped path
          result.routes[0].overview_path = snappedPath;
          directionsRenderer.setDirections(result);

          // Add markers for start and end points (only if they are not added already)
          startMarker = new google.maps.Marker({
            position: userLocation,
            map: map,
            title: "Your Location",
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png", // Green pin icon
            },
          });

          if (endMarker) {
            endMarker.setMap(null); // Remove existing end marker
          }

          endMarker = new google.maps.Marker({
            position: destination,
            map: map,
            title: "Destination",
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png", // Green pin icon
            },
          });

          // Center the map on the route
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(userLocation);
          bounds.extend(destination);
          map.fitBounds(bounds);
        })
        .catch((error) => {
          console.error("Error in Snap-to-Roads API:", error);
        });
    }
  });
}

// FUNCTION:  snap to road API

function snapToRoads(path) {
  return new Promise((resolve, reject) => {
    const pathString = path
      .map((point) => point.lat() + "," + point.lng())
      .join("|");
    const apiUrl = `https://roads.googleapis.com/v1/snapToRoads?path=${pathString}&key=AIzaSyCYDmNQIKb6rGbum5292A599Ug1Wlgk6eI`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.snappedPoints && data.snappedPoints.length > 0) {
          const snappedPath = data.snappedPoints.map(
            (point) =>
              new google.maps.LatLng(
                point.location.latitude,
                point.location.longitude
              )
          );
          resolve(snappedPath);
        } else {
          reject(new Error("Snap-to-Roads API response is empty."));
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

window.addEventListener("load", initMap);
