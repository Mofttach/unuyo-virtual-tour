// Visual Hotspot Editor for Django Admin
(function() {
    'use strict';
    
    let viewer;
    let currentPitch = null;
    let currentYaw = null;
    let hotspots = [];
    
    // Initialize when document is ready
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof PANORAMA_URL === 'undefined' || !PANORAMA_URL) {
            console.log('No panorama image, skipping viewer initialization');
            return;
        }
        
        initPanoramaViewer();
        initEventListeners();
        loadExistingHotspots();
    });
    
    function initPanoramaViewer() {
        viewer = pannellum.viewer('panorama-viewer', {
            type: 'equirectangular',
            panorama: PANORAMA_URL,
            autoLoad: true,
            showControls: true,
            compass: true,
            northOffset: 0,
            pitch: 0,
            yaw: 0,
            hfov: 90,
            minHfov: 50,
            maxHfov: 120,
            mouseZoom: true,
            draggable: true,
            showFullscreenCtrl: true,
            hotSpotDebug: false
        });
        
        // Add click listener to get coordinates
        viewer.on('mousedown', function(event) {
            const coords = viewer.mouseEventToCoords(event);
            currentPitch = coords[0];
            currentYaw = coords[1];
            console.log('Clicked at Pitch:', currentPitch, 'Yaw:', currentYaw);
        });
    }
    
    function initEventListeners() {
        // Hotspot type change
        const hotspotType = document.getElementById('hotspot-type');
        if (hotspotType) {
            hotspotType.addEventListener('change', function() {
                toggleFieldsBasedOnType(this.value);
            });
        }
        
        // Add hotspot button
        const addBtn = document.getElementById('add-hotspot-btn');
        if (addBtn) {
            addBtn.addEventListener('click', addHotspot);
        }
        
        // Delete hotspot buttons
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('delete-hotspot')) {
                const hotspotId = e.target.getAttribute('data-id');
                deleteHotspot(hotspotId, e.target);
            }
            
            if (e.target.classList.contains('goto-hotspot')) {
                const pitch = parseFloat(e.target.getAttribute('data-pitch'));
                const yaw = parseFloat(e.target.getAttribute('data-yaw'));
                viewer.setPitch(pitch);
                viewer.setYaw(yaw);
            }
        });
    }
    
    function toggleFieldsBasedOnType(type) {
        const toSceneGroup = document.getElementById('to-scene-group');
        const infoDescGroup = document.getElementById('info-desc-group');
        
        if (type === 'scene') {
            toSceneGroup.style.display = 'flex';
            infoDescGroup.style.display = 'none';
        } else if (type === 'info') {
            toSceneGroup.style.display = 'none';
            infoDescGroup.style.display = 'flex';
        }
    }
    
    function loadExistingHotspots() {
        // Hotspots are already rendered in the table by Django template
        // We can add them to the viewer if needed
        const rows = document.querySelectorAll('#hotspot-list-body tr[data-hotspot-id]');
        rows.forEach(row => {
            const pitch = parseFloat(row.querySelector('.goto-hotspot').getAttribute('data-pitch'));
            const yaw = parseFloat(row.querySelector('.goto-hotspot').getAttribute('data-yaw'));
            const text = row.querySelector('td:nth-child(2)').textContent;
            const type = row.querySelector('.badge').textContent.trim();
            
            addHotspotToViewer(pitch, yaw, text, type);
        });
    }
    
    function addHotspotToViewer(pitch, yaw, text, type) {
        let cssClass = 'custom-hotspot';
        if (type.includes('Info')) {
            cssClass += ' hotspot-info';
        } else if (type.includes('Floor')) {
            cssClass += ' hotspot-floor';
        }
        
        viewer.addHotSpot({
            pitch: pitch,
            yaw: yaw,
            cssClass: cssClass,
            createTooltipFunc: function(hotSpotDiv) {
                hotSpotDiv.classList.add('custom-tooltip');
                const span = document.createElement('span');
                span.innerHTML = text;
                hotSpotDiv.appendChild(span);
            }
        });
    }
    
    function addHotspot() {
        if (currentPitch === null || currentYaw === null) {
            alert('Silakan klik pada panorama terlebih dahulu untuk memilih posisi hotspot');
            return;
        }
        
        const type = document.getElementById('hotspot-type').value;
        const toSceneId = document.getElementById('to-scene').value;
        const text = document.getElementById('hotspot-text').value.trim();
        const infoDesc = document.getElementById('hotspot-info').value.trim();
        
        // Validation
        if (!text) {
            alert('Label hotspot harus diisi');
            return;
        }
        
        if (type === 'scene' && !toSceneId) {
            alert('Scene tujuan harus dipilih untuk hotspot navigasi');
            return;
        }
        
        if (type === 'info' && !infoDesc) {
            alert('Deskripsi harus diisi untuk info point');
            return;
        }
        
        // Prepare data
        const data = {
            from_scene: SCENE_ID,
            hotspot_type: type,
            to_scene: toSceneId || null,
            text: text,
            info_description: infoDesc,
            pitch: currentPitch,
            yaw: currentYaw
        };
        
        // Send to server
        fetch('/api/hotspots/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': CSRF_TOKEN
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(JSON.stringify(err));
                });
            }
            return response.json();
        })
        .then(result => {
            console.log('Hotspot added:', result);
            
            // Add to viewer
            addHotspotToViewer(currentPitch, currentYaw, text, type);
            
            // Add to table
            addHotspotToTable(result);
            
            // Reset form
            document.getElementById('hotspot-text').value = '';
            document.getElementById('hotspot-info').value = '';
            document.getElementById('to-scene').value = '';
            currentPitch = null;
            currentYaw = null;
            
            showMessage('Hotspot berhasil ditambahkan!', 'success');
        })
        .catch(error => {
            console.error('Error adding hotspot:', error);
            alert('Gagal menambahkan hotspot: ' + error.message);
        });
    }
    
    function addHotspotToTable(hotspot) {
        const tbody = document.getElementById('hotspot-list-body');
        
        // Remove empty message if exists
        const emptyRow = tbody.querySelector('td[colspan="6"]');
        if (emptyRow) {
            emptyRow.parentElement.remove();
        }
        
        const typeDisplay = hotspot.hotspot_type === 'scene' ? 'Navigasi' : 
                           hotspot.hotspot_type === 'info' ? 'Info Point' : 
                           hotspot.hotspot_type;
        
        const row = document.createElement('tr');
        row.setAttribute('data-hotspot-id', hotspot.id);
        row.innerHTML = `
            <td>
                <span class="badge badge-${hotspot.hotspot_type}">
                    ${typeDisplay}
                </span>
            </td>
            <td>${hotspot.text}</td>
            <td>${hotspot.to_scene_title || '-'}</td>
            <td>
                <button type="button" class="button small goto-hotspot" data-pitch="${hotspot.pitch}" data-yaw="${hotspot.yaw}">Lihat</button>
                <button type="button" class="button small delete-hotspot" data-id="${hotspot.id}}">Hapus</button>
            </td>
        `;
        
        tbody.appendChild(row);
    }
    
    function deleteHotspot(hotspotId, button) {
        if (!confirm('Yakin ingin menghapus hotspot ini?')) {
            return;
        }
        
        fetch(`/api/hotspots/${hotspotId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': CSRF_TOKEN
            }
        })
        .then(response => {
            if (response.ok) {
                // Remove from table
                const row = button.closest('tr');
                row.remove();
                
                // Check if table is empty
                const tbody = document.getElementById('hotspot-list-body');
                if (tbody.children.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">Belum ada hotspot. Klik pada panorama untuk menambahkan.</td></tr>';
                }
                
                showMessage('Hotspot berhasil dihapus', 'success');
                
                // Reload viewer to remove hotspot
                location.reload();
            } else {
                throw new Error('Failed to delete');
            }
        })
        .catch(error => {
            console.error('Error deleting hotspot:', error);
            alert('Gagal menghapus hotspot');
        });
    }
    
    function showMessage(message, type) {
        const messagesContainer = document.querySelector('.messagelist');
        if (messagesContainer) {
            const li = document.createElement('li');
            li.className = type;
            li.textContent = message;
            messagesContainer.appendChild(li);
            
            setTimeout(() => {
                li.remove();
            }, 3000);
        }
    }
    
})();
