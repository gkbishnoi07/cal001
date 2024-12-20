// Emergency contact list
const emergencyContacts = [
    { name: 'Emergency Contact 1', phone: '+1234567890' },
    { name: 'Emergency Contact 2', phone: '+1234567891' }
];

// Get DOM elements
const emergencyBtn = document.getElementById('emergency-btn');
const locationInfo = document.getElementById('location-info');
const hospitalsList = document.getElementById('hospitals-list');

// Store current location
let currentLocation = null;

// Get user's location
function getLocation() {
    if (!navigator.geolocation) {
        locationInfo.textContent = 'Geolocation is not supported';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            locationInfo.innerHTML = `
                <p>Latitude: ${currentLocation.lat.toFixed(6)}</p>
                <p>Longitude: ${currentLocation.lng.toFixed(6)}</p>
            `;
            
            emergencyBtn.disabled = false;
            findNearbyHospitals(currentLocation);
        },
        (error) => {
            locationInfo.textContent = 'Error: Please enable location access';
            console.error('Location error:', error);
        }
    );
}

// Find nearby hospitals using Google Places API
async function findNearbyHospitals(location) {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
            `location=${location.lat},${location.lng}&radius=5000&type=hospital&key=YOUR_GOOGLE_MAPS_KEY`
        );
        
        const data = await response.json();
        displayHospitals(data.results.slice(0, 3));
    } catch (error) {
        console.error('Error finding hospitals:', error);
    }
}

// Display hospitals in the list
function displayHospitals(hospitals) {
    hospitalsList.innerHTML = hospitals.map(hospital => `
        <div class="hospital-item">
            <h3>${hospital.name}</h3>
            <p>${hospital.vicinity}</p>
            <a href="tel:${hospital.formatted_phone_number}" class="hospital-call">
                📞 Call Hospital
            </a>
        </div>
    `).join('');
}

// Send location to emergency contacts
async function sendLocationToContacts() {
    const message = `Emergency Alert! My current location: https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
    
    // In a real app, you would integrate with an SMS API service
    // This is a simulation
    emergencyContacts.forEach(contact => {
        console.log(`Sending to ${contact.name}: ${message}`);
    });
}

// Handle emergency button click
async function handleEmergency() {
    if (!currentLocation) return;
    
    emergencyBtn.disabled = true;
    
    try {
        // Send location to contacts
        await sendLocationToContacts();
        
        // Make emergency call
        window.location.href = 'tel:911';
    } catch (error) {
        console.error('Emergency action failed:', error);
        alert('Error processing emergency action. Please try again.');
    } finally {
        emergencyBtn.disabled = false;
    }
}

// Initialize
getLocation();
emergencyBtn.addEventListener('click', handleEmergency);