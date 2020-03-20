// Initialize and add the Noida map 

function initMap() {

    var noida = {lat: 28.538, lng: 77.385};

    var map = new google.maps.Map(
        document.getElementById('gps-map'), {zoom: 12, center: noida}
    );
    
    var marker = new google.maps.Marker({position: noida, map: map});
}