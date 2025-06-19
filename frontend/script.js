const API_URL = 'http://localhost:5000/api';
let socket;
let selectedDisasterId = null;
let currentUser = 'netrunnerX';

// Initialize Socket.IO
function initializeSocket() {
    socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    socket.on('disaster_updated', (data) => {
        console.log('Disaster updated:', data);
        loadDisasters();
    });
    
    socket.on('social_media_updated', (data) => {
        if (data.disasterId === selectedDisasterId) {
            displaySocialMediaReports(data.reports);
        }
    });
    
    socket.on('resources_updated', (data) => {
        if (data.disasterId === selectedDisasterId) {
            displayResources(data.resources);
        }
    });
}

// User selection
document.getElementById('userSelect').addEventListener('change', (e) => {
    currentUser = e.target.value;
});

// Disaster form submission
document.getElementById('disasterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('title').value,
        location_name: document.getElementById('locationName').value,
        description: document.getElementById('description').value,
        tags: document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t)
    };
    
    try {
        const response = await fetch(`${API_URL}/disasters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': currentUser
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to create disaster');
        
        const disaster = await response.json();
        console.log('Disaster created:', disaster);
        
        e.target.reset();
        loadDisasters();
    } catch (error) {
        console.error('Error creating disaster:', error);
        alert('Error creating disaster: ' + error.message);
    }
});

// Load disasters
async function loadDisasters() {
    const filterTag = document.getElementById('filterTag').value;
    let url = `${API_URL}/disasters`;
    
    if (filterTag) {
        url += `?tag=${filterTag}`;
    }
    
    try {
        const response = await fetch(url);
        const disasters = await response.json();
        displayDisasters(disasters);
    } catch (error) {
        console.error('Error loading disasters:', error);
    }
}

// Display disasters
function displayDisasters(disasters) {
    const container = document.getElementById('disastersList');
    
    if (!disasters || disasters.length === 0) {
        container.innerHTML = '<p class="loading">No disasters found</p>';
        return;
    }
    
    container.innerHTML = disasters.map(disaster => `
        <div class="disaster-card" onclick="selectDisaster('${disaster.id}')">
            <h3>${disaster.title}</h3>
            <p>${disaster.location_name || 'Unknown location'}</p>
            <p>${disaster.description}</p>
            <div class="tags">
                ${disaster.tags ? disaster.tags.map(tag => `<span class="tag ${tag}">${tag}</span>`).join('') : ''}
            </div>
            <p class="timestamp">Created: ${new Date(disaster.created_at).toLocaleString()}</p>
        </div>
    `).join('');
}

// Select disaster
async function selectDisaster(disasterId) {
    selectedDisasterId = disasterId;
    socket.emit('join_disaster', disasterId);
    document.getElementById('disasterDetails').style.display = 'block';
    
    try {
        const response = await fetch(`${API_URL}/disasters`);
        const disasters = await response.json();
        const disaster = disasters.find(d => d.id === disasterId);
        
        if (disaster) {
            document.getElementById('detailsContent').innerHTML = `
                <h3>${disaster.title}</h3>
                <p><strong>Location:</strong> ${disaster.location_name || 'Unknown'}</p>
                <p><strong>Description:</strong> ${disaster.description}</p>
                <p><strong>Tags:</strong> ${disaster.tags ? disaster.tags.join(', ') : 'None'}</p>
                <p><strong>Owner:</strong> ${disaster.owner_id}</p>
            `;
        }
        
        loadSocialMediaReports();
    } catch (error) {
        console.error('Error loading disaster details:', error);
    }
}

// Submit report
async function submitReport() {
    if (!selectedDisasterId) return;
    
    const content = document.getElementById('reportContent').value;
    const imageUrl = document.getElementById('reportImage').value;
    
    if (!content) {
        alert('Please enter report content');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': currentUser
            },
            body: JSON.stringify({
                disaster_id: selectedDisasterId,
                content,
                image_url: imageUrl
            })
        });
        
        if (!response.ok) throw new Error('Failed to submit report');
 

        document.getElementById('reportContent').value = '';

        document.getElementById('reportImage').value = '';

        

        if (imageUrl) {

            verifyImage(imageUrl);

        }

        

        alert('Report submitted successfully');

    } catch (error) {

        console.error('Error submitting report:', error);

        alert('Error submitting report: ' + error.message);

    }

}


// Load social media reports

async function loadSocialMediaReports() {

    if (!selectedDisasterId) return;

    

    try {

        const response = await fetch(`${API_URL}/social-media/${selectedDisasterId}/social-media`);

        const reports = await response.json();

        displaySocialMediaReports(reports);

    } catch (error) {

        console.error('Error loading social media reports:', error);

        document.getElementById('socialMediaReports').innerHTML = 

            '<p class="error">Error loading social media reports</p>';

    }

}


// Display social media reports

function displaySocialMediaReports(reports) {

    const container = document.getElementById('socialMediaReports');

    

    if (!reports || reports.length === 0) {

        container.innerHTML = '<p class="loading">No social media reports found</p>';

        return;

    }

    

    container.innerHTML = reports.map(report => `

        <div class="social-media-item ${report.priority === 'high' ? 'priority-high' : ''}">

            <p><strong>@${report.user}:</strong> ${report.post}</p>

            <p class="timestamp">${new Date(report.timestamp).toLocaleString()}</p>

            ${report.priority === 'high' ? '<span class="tag urgent">URGENT</span>' : ''}

        </div>

    `).join('');

}


// Load resources

async function loadResources() {

    if (!selectedDisasterId) return;

    

    // Mock coordinates for NYC

    const lat = 40.7128;

    const lon = -74.0060;

    

    try {

        const response = await fetch(

            `${API_URL}/resources/${selectedDisasterId}/resources?lat=${lat}&lon=${lon}&radius=10`

        );

        const resources = await response.json();

        displayResources(resources);

    } catch (error) {

        console.error('Error loading resources:', error);

        document.getElementById('resourcesList').innerHTML = 

            '<p class="error">Error loading resources</p>';

    }

}


// Display resources

function displayResources(resources) {

    const container = document.getElementById('resourcesList');

    

    if (!resources || resources.length === 0) {

        container.innerHTML = '<p class="loading">No resources found nearby</p>';

        return;

    }

    

    container.innerHTML = resources.map(resource => `

        <div class="resource-item">

            <h4>${resource.name}</h4>

            <p><strong>Type:</strong> ${resource.type}</p>

            <p><strong>Location:</strong> ${resource.location_name}</p>

            <p><strong>Distance:</strong> ${resource.distance_km ? resource.distance_km.toFixed(1) : 'N/A'} km</p>

        </div>

    `).join('');

}


// Load official updates

async function loadOfficialUpdates() {

    if (!selectedDisasterId) return;

    

    try {

        const response = await fetch(`${API_URL}/disasters/${selectedDisasterId}/official-updates`);

        const updates = await response.json();

        displayOfficialUpdates(updates);

    } catch (error) {

        console.error('Error loading official updates:', error);

        document.getElementById('officialUpdatesList').innerHTML = 

            '<p class="error">Error loading official updates</p>';

    }

}


// Display official updates

function displayOfficialUpdates(updates) {

    const container = document.getElementById('officialUpdatesList');

    

    if (!updates || updates.length === 0) {

        container.innerHTML = '<p class="loading">No official updates found</p>';

        return;

    }

    

    container.innerHTML = updates.map(update => `

        <div class="update-item">

            <h4>${update.title}</h4>

            <p><strong>Source:</strong> ${update.source}</p>

            <p>${update.content}</p>

            <p><a href="${update.url}" target="_blank">Read more</a></p>

            <p class="timestamp">${new Date(update.timestamp).toLocaleString()}</p>

        </div>

    `).join('');

}


// Verify image

async function verifyImage(imageUrl) {

    if (!selectedDisasterId) return;

    

    try {

        const response = await fetch(`${API_URL}/verification/${selectedDisasterId}/verify-image`, {

            method: 'POST',

            headers: {

                'Content-Type': 'application/json',

                'X-User-Id': currentUser

            },

            body: JSON.stringify({ image_url: imageUrl })

        });

        

        const verification = await response.json();

        console.log('Image verification:', verification);

        

        alert(`Image verification: ${verification.verification?.status || 'Unknown'} (Confidence: ${verification.verification?.confidence || 0}%)`);

    } catch (error) {

        console.error('Error verifying image:', error);

    }

}


// Initialize app

document.addEventListener('DOMContentLoaded', () => {

    initializeSocket();

    loadDisasters();

});

