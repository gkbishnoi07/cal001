const emergencyBtn = document.getElementById('emergency-btn');
const locationInfo = document.getElementById('location-info');
const emergencyNumber = '911';

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
                <p>Lat: ${currentLocation.lat.toFixed(6)}</p>
                <p>Lng: ${currentLocation.lng.toFixed(6)}</p>
            `;
            
            emergencyBtn.disabled = false;
        },
        (error) => {
            console.error('Location error:', error);
            locationInfo.textContent = 'Please enable location access';
            emergencyBtn.disabled = true;
        }
    );
}

// Handle emergency call
function handleEmergency() {
    if (!currentLocation) return;
    
    emergencyBtn.disabled = true;
    const originalText = emergencyBtn.innerHTML;
    emergencyBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        <span>Calling...</span>
    `;
    
    // Initiate phone call
    window.location.href = `tel:${emergencyNumber}`;
    
    // Reset button state after a delay
    setTimeout(() => {
        emergencyBtn.disabled = false;
        emergencyBtn.innerHTML = originalText;
    }, 2000);
}

// Initialize
getLocation();
emergencyBtn.addEventListener('click', handleEmergency);