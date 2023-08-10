let map, marker, directionsService, directionsRenderer, infoWindow;
let startMarker, endMarker, currentLocationMarker;

// Initialize the map function
function initMap() {
  const makerereLatLng = { lat: 0.335794, lng: 32.5727231 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: makerereLatLng,
    zoom: 16,
  });

  const searchInput = document.getElementById("searchInput");

  const autocomplete = new google.maps.places.Autocomplete(searchInput);

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: "#00FF00",
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

// FUNCTION:  snap to road API

window.addEventListener("load", initMap);
