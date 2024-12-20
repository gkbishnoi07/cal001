// Emergency contact list - you should store this securely, possibly in a database
const emergencyContacts = [
    { name: 'Emergency Contact 1', phone: '+918233758907' },
    { name: 'Emergency Contact 2', phone: '+916350582239' }
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

// Function to send SMS using a service like Twilio
async function sendSMS(to, message) {
    try {
        const response = await fetch('/api/send-sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: to,
                message: message
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to send SMS');
        }
        
        return await response.json();
    } catch (error) {
        console.error('SMS sending failed:', error);
        throw error;
    }
}

// Send location to emergency contacts
async function sendLocationToContacts() {
    if (!currentLocation) {
        throw new Error('Location not available');
    }

    const locationLink = `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
    const address = await getAddressFromCoordinates(currentLocation);
    
    const message = `EMERGENCY ALERT! Location: ${address}. Map: ${locationLink}`;
    
    const sendPromises = emergencyContacts.map(contact => 
        sendSMS(contact.phone, message)
            .catch(error => {
                console.error(`Failed to send to ${contact.name}:`, error);
                return { success: false, contact: contact.name };
            })
    );

    const results = await Promise.allSettled(sendPromises);
    
    // Check if any messages were sent successfully
    const anySuccess = results.some(result => result.status === 'fulfilled');
    if (!anySuccess) {
        throw new Error('Failed to send location to any contacts');
    }

    return results;
}

// Get address from coordinates using reverse geocoding
async function getAddressFromCoordinates(location) {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=YOUR_GOOGLE_MAPS_KEY`
        );
        
        if (!response.ok) {
            throw new Error('Geocoding failed');
        }

        const data = await response.json();
        if (data.results && data.results[0]) {
            return data.results[0].formatted_address;
        }
        
        return `${location.lat}, ${location.lng}`;
    } catch (error) {
        console.error('Geocoding error:', error);
        return `${location.lat}, ${location.lng}`;
    }
}

// Handle emergency button click
async function handleEmergency() {
    if (!currentLocation) return;
    
    emergencyBtn.disabled = true;
    let error = null;
    
    try {
        // Show loading state
        const originalButtonText = emergencyBtn.innerHTML;
        emergencyBtn.innerHTML = '🔄 Sending Alert...';
        
        // Send location to contacts
        await sendLocationToContacts();
        
        // Make emergency call
        window.location.href = 'tel:108';
    } catch (err) {
        error = err;
        console.error('Emergency action failed:', err);
        alert('Error sending location. Please call emergency services directly.');
    } finally {
        emergencyBtn.disabled = false;
        if (error) {
            emergencyBtn.innerHTML = '🚨 Emergency Call';
        }
    }
}

// Initialize
getLocation();
emergencyBtn.addEventListener('click', handleEmergency);
