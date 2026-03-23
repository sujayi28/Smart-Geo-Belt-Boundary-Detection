document.addEventListener("DOMContentLoaded", () => {
    const mapContainer = document.getElementById('map-container');
    const geofenceCircle = document.getElementById('geofence-circle');
    const targetDot = document.getElementById('target-dot');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const latVal = document.getElementById('lat-val');
    const lngVal = document.getElementById('lng-val');
    const alertPopup = document.getElementById('alert-popup');
    const geofenceLabel = document.getElementById('geofence-label');
    const coordinatesCard = document.getElementById('coordinates-card');

    let startTime = null;
    const duration = 12000; // Total cycle

    function animate(time) {
        if (!startTime) startTime = time;
        let elapsed = time - startTime;
        let progress = elapsed / duration;
        
        // Move phase is first 8 seconds (progress up to 8/12 = 0.66)
        let moveProgress = progress * (12/8); 
        let currentX, currentY;

        const mapWidth = mapContainer.clientWidth;
        const mapHeight = mapContainer.clientHeight;
        const centerX = mapWidth / 2;
        const centerY = mapHeight / 2;
        
        // Using actual geofence radius dynamically
        const radius = geofenceCircle.clientWidth / 2;

        // Start inside
        const startX = centerX - radius * 0.4;
        const startY = centerY + radius * 0.4;
        // End outside
        const endX = centerX + radius * 1.2 * Math.cos(Math.PI / 6); // 30 degrees
        const endY = centerY - radius * 1.2 * Math.sin(Math.PI / 6); // 30 degrees

        if (moveProgress > 1) {
            currentX = endX;
            currentY = endY;
        } else {
            // Ease in-out
            const p = moveProgress < 0.5 ? 2 * moveProgress * moveProgress : 1 - Math.pow(-2 * moveProgress + 2, 2) / 2;
            currentX = startX + (endX - startX) * p;
            currentY = startY + (endY - startY) * p;
        }

        if (progress > 1) {
            startTime = time;
            progress = 0;
            resetState();
            return requestAnimationFrame(animate);
        }

        // Apply position
        targetDot.style.left = `${currentX}px`;
        targetDot.style.top = `${currentY}px`;

        // Update Coordinates
        const baseLat = 40.712800;
        const baseLng = -74.006000;
        // Simulate realistic GPS shift as dot moves
        latVal.innerText = (baseLat + (centerY - currentY) * 0.00004).toFixed(6);
        lngVal.innerText = (baseLng + (currentX - centerX) * 0.00004).toFixed(6);

        // Check distance from center
        const dist = Math.sqrt(Math.pow(currentX - centerX, 2) + Math.pow(currentY - centerY, 2));

        if (dist > radius) {
            triggerAlert();
        } else {
            clearAlert();
        }

        requestAnimationFrame(animate);
    }

    function triggerAlert() {
        if (!targetDot.classList.contains('breached')) {
            targetDot.classList.add('breached');
            statusDot.className = 'status-dot red';
            statusText.innerText = 'Outside / Alert!';
            statusText.style.color = 'var(--primary-red)';
            alertPopup.classList.add('show');
            geofenceCircle.classList.add('alert-mode');
            coordinatesCard.classList.add('alert-mode');
            geofenceLabel.innerText = 'Boundary Breached';
        }
    }

    function clearAlert() {
        if (targetDot.classList.contains('breached')) {
            targetDot.classList.remove('breached');
            statusDot.className = 'status-dot green';
            statusText.innerText = 'Inside Safe Zone';
            statusText.style.color = 'var(--primary-green)';
            alertPopup.classList.remove('show');
            geofenceCircle.classList.remove('alert-mode');
            coordinatesCard.classList.remove('alert-mode');
            geofenceLabel.innerText = 'Safe Zone';
        }
    }

    function resetState() {
        clearAlert();
    }

    // Start animation loop
    requestAnimationFrame(animate);
});
