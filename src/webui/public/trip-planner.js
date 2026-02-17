/**
 * Trip Planner - AI-Powered Itinerary with Tianditu Maps
 * A modern frontend app for planning, editing, and visualizing trip itineraries
 */

(function () {
  'use strict';

  // ============================================
  // Configuration & State
  // ============================================

  const CONFIG = {
    defaultMapCenter: [116.391212, 39.90779], // Beijing
    defaultZoom: 12,
    markerColors: [
      '#e74c3c',
      '#3498db',
      '#2ecc71',
      '#f39c12',
      '#9b59b6',
      '#1abc9c',
      '#e67e22',
      '#34495e',
      '#16a085',
      '#c0392b',
    ],
    geocodeApi: 'https://api.tianditu.gov.cn/geocoder',
  };

  let nextTrackId = 1;

  const state = {
    map: null,
    markers: [],
    tripData: null,
    tracks: [], // [{id, displayName, trackData, overlays, visible}]
    allMarkersVisible: true,
    settings: {
      llmProvider: 'local',
      localUrl: 'http://localhost:4000',
      localModel: 'gpt-3.5-turbo',
      mapKey: '',
    },
    visibleDays: new Set(),
    visibleLocations: new Set(),
  };

  // ============================================
  // Utility Functions
  // ============================================

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${message}</span>
      <button class="toast-close">&times;</button>
    `;
    container.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.add('toast-hide');
      setTimeout(() => toast.remove(), 300);
    });

    setTimeout(() => {
      toast.classList.add('toast-hide');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function showLoading(text = 'Processing...') {
    document.getElementById('loading-text').textContent = text;
    document.getElementById('loading-overlay').classList.add('active');
  }

  function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('active');
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // ============================================
  // Settings Management
  // ============================================

  function loadSettings() {
    const saved = localStorage.getItem('tripPlannerSettings');
    if (saved) {
      try {
        Object.assign(state.settings, JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
    applySettingsToUI();
  }

  function saveSettings() {
    const settings = {
      llmProvider: document.getElementById('llm-provider').value,
      localUrl: document.getElementById('local-url').value,
      localModel: document.getElementById('local-model').value,
      mapKey: document.getElementById('map-key').value,
    };
    state.settings = settings;
    localStorage.setItem('tripPlannerSettings', JSON.stringify(settings));
    showToast('Settings saved successfully', 'success');

    // Reinitialize map with new key if changed
    if (settings.mapKey && !state.map) {
      initMap();
    }
  }

  function applySettingsToUI() {
    document.getElementById('llm-provider').value = state.settings.llmProvider;
    document.getElementById('local-url').value =
      state.settings.localUrl || 'http://localhost:4000';
    document.getElementById('local-model').value =
      state.settings.localModel || 'gpt-3.5-turbo';
    document.getElementById('map-key').value = state.settings.mapKey || '';
    updateProviderFields();
  }

  function updateProviderFields() {
    const provider = document.getElementById('llm-provider').value;
    const localUrlGroup = document.getElementById('local-url-group');
    const localModelGroup = document.getElementById('local-model-group');
    const localTestGroup = document.getElementById('local-test-group');

    const isLocal = provider === 'local';
    localUrlGroup.style.display = isLocal ? 'block' : 'none';
    localModelGroup.style.display = isLocal ? 'block' : 'none';
    localTestGroup.style.display = isLocal ? 'block' : 'none';
  }

  // ============================================
  // Map Functions
  // ============================================

  function initMap() {
    const mapKey = state.settings.mapKey;
    if (!mapKey) {
      document.getElementById('map-container').innerHTML = `
        <div class="map-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <p>Please configure your Tianditu API key in Settings</p>
        </div>
      `;
      return;
    }

    // Load Tianditu API dynamically
    if (typeof T === 'undefined') {
      const script = document.createElement('script');
      script.src = `https://api.tianditu.gov.cn/api?v=4.0&tk=${mapKey}`;
      script.onload = () => {
        createMap();
      };
      script.onerror = () => {
        showToast('Failed to load Tianditu map API', 'error');
      };
      document.head.appendChild(script);
    } else {
      createMap();
    }
  }

  function createMap() {
    try {
      state.map = new T.Map('map-container');
      state.map.centerAndZoom(
        new T.LngLat(CONFIG.defaultMapCenter[0], CONFIG.defaultMapCenter[1]),
        CONFIG.defaultZoom
      );

      // Add controls
      state.map.addControl(new T.Control.Scale());
      state.map.addControl(new T.Control.Zoom());
      state.map.addControl(new T.Control.MapType());

      showToast('Map initialized successfully', 'success');
    } catch (e) {
      console.error('Failed to create map:', e);
      showToast('Failed to initialize map', 'error');
    }
  }

  function clearMarkers() {
    if (!state.map) return;
    state.markers.forEach((marker) => {
      state.map.removeOverLay(marker.marker);
      if (marker.label) state.map.removeOverLay(marker.label);
    });
    state.markers = [];
    clearAllTrackOverlays();
    state.tracks = [];
    updateLegend();
  }

  function addMarker(location, dayIndex, color) {
    if (!state.map || !location.coordinates) return null;

    const [lon, lat] = location.coordinates;
    const position = new T.LngLat(lon, lat);

    // Create custom marker icon
    const icon = new T.Icon({
      iconUrl: createMarkerIcon(color, dayIndex + 1),
      iconSize: new T.Point(32, 40),
      iconAnchor: new T.Point(16, 40),
    });

    const marker = new T.Marker(position, { icon });

    // Create label with inline styles for map compatibility
    const labelStyle =
      'background:rgba(255,255,255,0.95);color:#1e293b;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:500;border:1px solid rgba(0,0,0,0.1);box-shadow:0 2px 6px rgba(0,0,0,0.15);white-space:nowrap;';
    const label = new T.Label({
      text: `<div style="${labelStyle}">${location.name}</div>`,
      position: position,
      offset: new T.Point(20, -20),
    });

    // Add click handler
    marker.addEventListener('click', () => {
      const infoWin = new T.InfoWindow({
        content: `
          <div class="info-window">
            <h4>${location.name}</h4>
            <p><strong>Time:</strong> ${location.datetime || 'N/A'}</p>
            <p><strong>Coordinates:</strong> ${lon.toFixed(6)}, ${lat.toFixed(
          6
        )}</p>
          </div>
        `,
      });
      marker.openInfoWindow(infoWin);
    });

    state.map.addOverLay(marker);
    state.map.addOverLay(label);

    const markerData = {
      marker,
      label,
      location,
      dayIndex,
      visible: true,
    };
    state.markers.push(markerData);

    return markerData;
  }

  function createMarkerIcon(color, number) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 24 16 24s16-15.163 16-24C32 7.163 24.837 0 16 0z" fill="${color}"/>
        <circle cx="16" cy="14" r="10" fill="white"/>
        <text x="16" y="18" text-anchor="middle" font-size="12" font-weight="bold" fill="${color}">${number}</text>
      </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }

  function fitBounds() {
    if (!state.map || state.markers.length === 0) return;

    const visibleMarkers = state.markers.filter((m) => m.visible);
    if (visibleMarkers.length === 0) return;

    const points = visibleMarkers.map((m) => m.marker.getLngLat());

    if (points.length === 1) {
      state.map.centerAndZoom(points[0], 15);
    } else {
      const bounds = new T.LngLatBounds(points[0], points[0]);
      points.forEach((p) => bounds.extend(p));
      state.map.setViewport(points);
    }
  }

  function toggleMarkerVisibility(dayIndex, locationName, visible) {
    state.markers.forEach((m) => {
      const matchDay = dayIndex === undefined || m.dayIndex === dayIndex;
      const matchLoc =
        locationName === undefined || m.location.name === locationName;

      if (matchDay && matchLoc) {
        m.visible = visible;
        if (visible) {
          state.map.addOverLay(m.marker);
          state.map.addOverLay(m.label);
        } else {
          state.map.removeOverLay(m.marker);
          state.map.removeOverLay(m.label);
        }
      }
    });
  }

  function updateLegend() {
    const legendItems = document.getElementById('legend-items');
    let html = '';

    // Track legends
    state.tracks.forEach((track) => {
      html += `
        <div class="legend-item">
          <span class="legend-line" style="background: #3b82f6"></span>
          <span class="legend-text">${track.displayName}</span>
        </div>
      `;
    });

    // Trip day legends
    if (state.tripData && state.tripData.days) {
      html += state.tripData.days
        .map(
          (day, i) => `
        <div class="legend-item">
          <span class="legend-color" style="background: ${
            CONFIG.markerColors[i % CONFIG.markerColors.length]
          }"></span>
          <span class="legend-text">${day.title}</span>
        </div>
      `
        )
        .join('');
    }

    if (!html) {
      legendItems.innerHTML = '<p class="hint">No locations to display</p>';
    } else {
      legendItems.innerHTML = html;
    }
  }

  // ============================================
  // Geocoding Functions
  // ============================================

  async function geocodeLocation(locationName) {
    const mapKey = state.settings.mapKey;
    if (!mapKey) {
      throw new Error('Tianditu API key not configured');
    }

    const url = `${CONFIG.geocodeApi}?ds=${encodeURIComponent(
      JSON.stringify({ keyWord: locationName })
    )}&tk=${mapKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === '0' && data.location) {
        return {
          lon: parseFloat(data.location.lon),
          lat: parseFloat(data.location.lat),
          level: data.location.level,
        };
      }
      return null;
    } catch (e) {
      console.error('Geocoding error:', e);
      return null;
    }
  }

  async function geocodeAllLocations(tripData) {
    const statusEl = document.getElementById('extraction-status');
    let processed = 0;
    let skipped = 0;
    let total = 0;

    // Count total locations
    tripData.days.forEach((day) => {
      total += day.locations.length;
    });

    for (const day of tripData.days) {
      for (const location of day.locations) {
        processed++;

        // Skip if already has coordinates (from markdown parsing)
        if (location.coordinates && location.coordinates.length === 2) {
          skipped++;
          statusEl.innerHTML = `<div class="status-progress">Processing: ${processed}/${total} - ${location.name} (has coords)</div>`;
          continue;
        }

        statusEl.innerHTML = `<div class="status-progress">Geocoding: ${processed}/${total} - ${location.name}</div>`;

        const coords = await geocodeLocation(location.name);
        if (coords) {
          location.coordinates = [coords.lon, coords.lat];
          location.geocodeLevel = coords.level;
        } else {
          location.coordinates = null;
          location.geocodeError = true;
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    const geocoded = processed - skipped;
    statusEl.innerHTML = `<div class="status-success">Complete: ${geocoded} geocoded, ${skipped} already had coordinates</div>`;
    return tripData;
  }

  // ============================================
  // LLM Integration
  // ============================================

  async function extractLocationsWithLLM(text) {
    const provider = state.settings.llmProvider;

    if (provider === 'manual') {
      return extractLocationsManually(text);
    }

    const prompt = `Extract all locations and their associated times from this trip plan.

IMPORTANT: Location names MUST be in Chinese (Simplified Chinese) for geocoding to work correctly with Chinese map services.
For example: "天安门广场,北京" instead of "Tiananmen Square, Beijing"

Return a JSON object with this structure:
{
  "title": "行程标题 (Trip title in Chinese)",
  "days": [
    {
      "title": "第1天 - 描述 (Day 1 - Description)",
      "date": "YYYY-MM-DD if mentioned",
      "locations": [
        {
          "name": "完整中文地名,城市名 (e.g., '天安门广场,北京' or '沈阳华府酒店,沈阳')",
          "datetime": "Time if mentioned (e.g., '9:00 AM')",
          "description": "Brief description"
        }
      ]
    }
  ]
}

Trip plan:
${text}

Return ONLY valid JSON, no markdown or explanation. All location names must be in Chinese.`;

    try {
      let result;

      if (provider === 'local') {
        result = await callLocalAI(prompt);
      } else {
        throw new Error('Unknown provider');
      }

      // Parse JSON from response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response from LLM');
    } catch (e) {
      console.error('LLM extraction error:', e);
      showToast(
        `LLM error: ${e.message}. Falling back to manual extraction.`,
        'warning'
      );
      return extractLocationsManually(text);
    }
  }

  async function callLocalAI(prompt) {
    // Call local OpenAI-compatible server directly (no proxy needed, same origin or CORS enabled)
    const baseUrl = (
      state.settings.localUrl || 'http://localhost:4000'
    ).replace(/\/$/, '');
    const model = state.settings.localModel || 'gpt-3.5-turbo';

    // Ensure prompt is properly sanitized for JSON
    const sanitizedPrompt = prompt.replace(/[\x00-\x1F\x7F]/g, (char) => {
      if (char === '\n') return '\\n';
      if (char === '\r') return '\\r';
      if (char === '\t') return '\\t';
      return '';
    });

    const requestBody = {
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    };

    console.log('Calling Local AI:', baseUrl, 'with model:', model);

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Local AI error response:', data);
      throw new Error(
        data.error?.message ||
          data.message ||
          `Local AI error: ${response.status}`
      );
    }

    return data.choices[0].message.content;
  }

  async function testLocalAI() {
    const baseUrl = (
      document.getElementById('local-url').value || 'http://localhost:4000'
    ).replace(/\/$/, '');
    const model =
      document.getElementById('local-model').value || 'gpt-3.5-turbo';

    try {
      showLoading('Testing connection...');

      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'Say "pong" and nothing else.' }],
          temperature: 0,
          max_tokens: 10,
        }),
      });

      const data = await response.json();
      hideLoading();

      if (!response.ok) {
        showToast(
          `Test failed: ${data.error?.message || response.status}`,
          'error'
        );
        return;
      }

      const reply = data.choices?.[0]?.message?.content || 'No response';
      showToast(`AI responded: "${reply}"`, 'success');
    } catch (e) {
      hideLoading();
      console.error('Test error:', e);
      showToast(`Connection failed: ${e.message}`, 'error');
    }
  }

  function extractLocationsManually(text) {
    const lines = text.split('\n');
    const tripData = {
      title: 'My Trip',
      days: [],
    };

    let currentDay = null;
    const dayPattern = /^(?:Day\s*(\d+)|(\d{4}-\d{2}-\d{2}))\s*[-:.]?\s*(.*)$/i;
    const timePattern =
      /^[-*•]?\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[-:.]?\s*(.+)$/i;
    const locationPattern = /^[-*•]\s*(.+)$/;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const dayMatch = trimmed.match(dayPattern);
      if (dayMatch) {
        currentDay = {
          title: trimmed,
          date: dayMatch[2] || null,
          locations: [],
        };
        tripData.days.push(currentDay);
        continue;
      }

      if (!currentDay) {
        currentDay = {
          title: 'Day 1',
          date: null,
          locations: [],
        };
        tripData.days.push(currentDay);
      }

      const timeMatch = trimmed.match(timePattern);
      if (timeMatch) {
        currentDay.locations.push({
          name: timeMatch[2].trim(),
          datetime: timeMatch[1],
          description: '',
        });
        continue;
      }

      const locMatch = trimmed.match(locationPattern);
      if (locMatch) {
        currentDay.locations.push({
          name: locMatch[1].trim(),
          datetime: '',
          description: '',
        });
      }
    }

    // Set title from first day if possible
    if (tripData.days.length > 0 && tripData.days[0].title) {
      const titleMatch = tripData.days[0].title.match(/[-:]\s*(.+)/);
      if (titleMatch) {
        tripData.title = titleMatch[1].trim() + ' Trip';
      }
    }

    return tripData;
  }

  // ============================================
  // Tree View Functions
  // ============================================

  function renderTreeView(tripData) {
    const treeContainer = document.getElementById('trip-tree');

    // Remove existing trip day sections (but preserve track sections)
    treeContainer
      .querySelectorAll('.tree-day:not([data-track-id])')
      .forEach((el) => el.remove());

    // Remove empty state
    const emptyState = treeContainer.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    if (!tripData || !tripData.days || tripData.days.length === 0) {
      if (state.tracks.length === 0) {
        treeContainer.innerHTML = `
          <div class="empty-state">
            <p>No trip loaded</p>
            <p class="hint">Enter a trip plan or load a markdown file to get started</p>
          </div>
        `;
      }
      return;
    }

    const html = tripData.days
      .map((day, dayIndex) => {
        const color =
          CONFIG.markerColors[dayIndex % CONFIG.markerColors.length];
        const locations = day.locations
          .map(
            (loc, locIndex) => `
        <li class="tree-location" data-day="${dayIndex}" data-loc="${locIndex}">
          <input type="checkbox" class="tree-cb" checked data-type="location" data-day="${dayIndex}" data-loc="${locIndex}">
          <span class="location-marker" style="background: ${color}"></span>
          <span class="location-info">
            <span class="location-name">${loc.name}</span>
            ${
              loc.datetime
                ? `<span class="location-time">${loc.datetime}</span>`
                : ''
            }
            ${
              loc.geocodeError
                ? '<span class="location-error" title="Location not found">!</span>'
                : ''
            }
            ${
              loc.coordinates
                ? ''
                : '<span class="location-no-coords" title="No coordinates">[?]</span>'
            }
          </span>
        </li>
      `
          )
          .join('');

        return `
        <div class="tree-day" data-day="${dayIndex}">
          <div class="tree-day-header">
            <button class="tree-toggle" data-day="${dayIndex}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            <input type="checkbox" class="tree-cb" checked data-type="day" data-day="${dayIndex}">
            <span class="day-color" style="background: ${color}"></span>
            <span class="day-title">${day.title}</span>
            <span class="location-count">(${day.locations.length})</span>
          </div>
          <ul class="tree-locations expanded">
            ${locations}
          </ul>
        </div>
      `;
      })
      .join('');

    // Append trip days after any track sections
    treeContainer.insertAdjacentHTML('beforeend', html);
    bindTreeEvents();
  }

  function bindTreeEvents() {
    // Toggle day expansion (arrow button only)
    document.querySelectorAll('.tree-toggle').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dayEl = e.target.closest('.tree-day');
        const locations = dayEl.querySelector('.tree-locations');
        locations.classList.toggle('expanded');
        btn.classList.toggle('collapsed');
      });
    });

    // Day checkbox - only toggle visibility
    document
      .querySelectorAll('.tree-day-header input[data-type="day"]')
      .forEach((checkbox) => {
        checkbox.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent triggering row click
        });
        checkbox.addEventListener('change', (e) => {
          e.stopPropagation();
          const dayIndex = parseInt(e.target.dataset.day);
          const visible = e.target.checked;

          // Update all location checkboxes under this day
          const dayEl = e.target.closest('.tree-day');
          dayEl
            .querySelectorAll('input[data-type="location"]')
            .forEach((locCheckbox) => {
              locCheckbox.checked = visible;
            });

          toggleMarkerVisibility(dayIndex, undefined, visible);
        });
      });

    // Location checkbox - only toggle visibility
    document
      .querySelectorAll('.tree-location input[data-type="location"]')
      .forEach((checkbox) => {
        checkbox.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent triggering row click
        });
        checkbox.addEventListener('change', (e) => {
          e.stopPropagation();
          const dayIndex = parseInt(e.target.dataset.day);
          const locIndex = parseInt(e.target.dataset.loc);
          const location = state.tripData.days[dayIndex].locations[locIndex];
          const visible = e.target.checked;

          toggleMarkerVisibility(dayIndex, location.name, visible);
        });
      });

    // Click on day header (excluding checkbox and toggle) to pan to center of mass
    document.querySelectorAll('.tree-day-header').forEach((headerEl) => {
      headerEl.addEventListener('click', (e) => {
        // Ignore if clicking on checkbox or toggle button
        if (
          e.target.classList.contains('tree-cb') ||
          e.target.closest('.tree-toggle')
        )
          return;

        const dayEl = headerEl.closest('.tree-day');
        const dayIndex = parseInt(dayEl.dataset.day);
        const day = state.tripData.days[dayIndex];

        if (!day || !state.map) return;

        // Calculate center of mass for this day's locations
        const coords = day.locations
          .filter((loc) => loc.coordinates)
          .map((loc) => loc.coordinates);

        if (coords.length === 0) {
          showToast('No geocoded locations for this day', 'warning');
          return;
        }

        const center = coords.reduce(
          (acc, c) => [
            acc[0] + c[0] / coords.length,
            acc[1] + c[1] / coords.length,
          ],
          [0, 0]
        );

        state.map.panTo(new T.LngLat(center[0], center[1]));
        if (coords.length > 1) {
          // Zoom to fit all locations of this day
          const points = coords.map((c) => new T.LngLat(c[0], c[1]));
          state.map.setViewport(points);
        }
      });
    });

    // Click on location row (excluding checkbox) to pan to it
    document.querySelectorAll('.tree-location').forEach((locEl) => {
      locEl.addEventListener('click', (e) => {
        // Only ignore if clicking directly on checkbox
        if (e.target.classList.contains('tree-cb')) return;

        const dayIndex = parseInt(locEl.dataset.day);
        const locIndex = parseInt(locEl.dataset.loc);
        const location = state.tripData.days[dayIndex].locations[locIndex];

        if (location.coordinates && state.map) {
          state.map.panTo(
            new T.LngLat(location.coordinates[0], location.coordinates[1])
          );
          state.map.setZoom(15);

          // Find and open marker info window
          const marker = state.markers.find(
            (m) => m.dayIndex === dayIndex && m.location.name === location.name
          );
          if (marker) {
            const infoWin = new T.InfoWindow({
              content: `
                <div class="info-window">
                  <h4>${location.name}</h4>
                  <p><strong>Time:</strong> ${location.datetime || 'N/A'}</p>
                </div>
              `,
            });
            marker.marker.openInfoWindow(infoWin);
          }
        } else if (!location.coordinates) {
          showToast('Location not geocoded', 'warning');
        }
      });
    });
  }

  function toggleAllMarkers(visible) {
    // Update all checkboxes
    document
      .querySelectorAll('input[data-type="day"], input[data-type="location"]')
      .forEach((cb) => {
        cb.checked = visible;
      });

    // Update all markers
    state.markers.forEach((m) => {
      m.visible = visible;
      if (visible) {
        state.map.addOverLay(m.marker);
        state.map.addOverLay(m.label);
      } else {
        state.map.removeOverLay(m.marker);
        state.map.removeOverLay(m.label);
      }
    });

    // Update button text
    const btn = document.getElementById('toggle-all-markers');
    btn.textContent = visible ? 'Hide All' : 'Show All';
    state.allMarkersVisible = visible;
  }

  // ============================================
  // Markdown Functions
  // ============================================

  function generateMarkdown(tripData) {
    if (!tripData) return '';

    let md = `# ${tripData.title}\n\n`;

    tripData.days.forEach((day) => {
      md += `## ${day.title}\n`;
      if (day.date) {
        md += `*Date: ${day.date}*\n`;
      }
      md += '\n';

      day.locations.forEach((loc) => {
        const time = loc.datetime ? `**${loc.datetime}** - ` : '- ';
        const coords = loc.coordinates
          ? ` *(${loc.coordinates[0].toFixed(6)}, ${loc.coordinates[1].toFixed(
              6
            )})*`
          : '';
        md += `${time}${loc.name}${coords}\n`;
        if (loc.description) {
          md += `  ${loc.description}\n`;
        }
      });
      md += '\n';
    });

    return md;
  }

  function parseMarkdown(md) {
    const lines = md.split('\n');
    const tripData = {
      title: 'My Trip',
      days: [],
    };

    let currentDay = null;
    let lastLocation = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Title (# Title)
      if (trimmed.startsWith('# ')) {
        tripData.title = trimmed.substring(2).trim();
        continue;
      }

      // Day header (## Day Title)
      if (trimmed.startsWith('## ')) {
        currentDay = {
          title: trimmed.substring(3).trim(),
          date: null,
          locations: [],
        };
        tripData.days.push(currentDay);
        lastLocation = null;
        continue;
      }

      // Date (*Date: YYYY-MM-DD*)
      const dateMatch = trimmed.match(/^\*Date:\s*(.+)\*$/);
      if (dateMatch && currentDay) {
        currentDay.date = dateMatch[1];
        continue;
      }

      // Skip description lines (indented text after location)
      if (
        trimmed &&
        !trimmed.startsWith('*') &&
        !trimmed.startsWith('-') &&
        !trimmed.startsWith('#') &&
        lastLocation
      ) {
        // This is likely a description for the previous location
        if (lastLocation) {
          lastLocation.description =
            (lastLocation.description ? lastLocation.description + ' ' : '') +
            trimmed;
        }
        continue;
      }

      if (!currentDay) continue;

      // Pattern 1: **时间** - 地点,城市 *(lon, lat)*
      // Pattern 2: **时间 - 时间** - 地点,城市 *(lon, lat)*
      // Pattern 3: - 地点,城市 *(lon, lat)*

      // Extract coordinates if present
      let coordinates = null;
      const coordMatch = trimmed.match(/\*\(([\d.]+),\s*([\d.]+)\)\*\s*$/);
      if (coordMatch) {
        coordinates = [parseFloat(coordMatch[1]), parseFloat(coordMatch[2])];
      }

      // Remove coordinates from line for further parsing
      const lineWithoutCoords = trimmed
        .replace(/\s*\*\([\d.,\s]+\)\*\s*$/, '')
        .trim();

      // Pattern: **时间** - 地点 or **时间 - 时间** - 地点
      const boldTimeMatch = lineWithoutCoords.match(
        /^\*\*(.+?)\*\*\s*-\s*(.+)$/
      );
      if (boldTimeMatch) {
        const datetime = boldTimeMatch[1].trim();
        const name = boldTimeMatch[2].trim();
        lastLocation = {
          name,
          datetime,
          description: '',
          coordinates,
        };
        currentDay.locations.push(lastLocation);
        continue;
      }

      // Pattern: - 地点 (no time, starts with dash)
      const dashMatch = lineWithoutCoords.match(/^-\s+(.+)$/);
      if (dashMatch) {
        const name = dashMatch[1].trim();
        lastLocation = {
          name,
          datetime: '',
          description: '',
          coordinates,
        };
        currentDay.locations.push(lastLocation);
        continue;
      }

      // Pattern: time - location (plain text, e.g., "08:30 - Location")
      const plainTimeMatch = lineWithoutCoords.match(
        /^(\d{1,2}:\d{2}(?:\s*-\s*\d{1,2}:\d{2})?(?:\s*(?:AM|PM))?)\s*-\s*(.+)$/i
      );
      if (plainTimeMatch) {
        lastLocation = {
          name: plainTimeMatch[2].trim(),
          datetime: plainTimeMatch[1].trim(),
          description: '',
          coordinates,
        };
        currentDay.locations.push(lastLocation);
        continue;
      }
    }

    return tripData;
  }

  // ============================================
  // FIT File Import
  // ============================================

  const SEMICIRCLES_TO_DEGREES = 180 / Math.pow(2, 31);

  function parseFitFile(arrayBuffer, fileName) {
    const { Decoder, Stream } = window.FitSDK;
    const stream = Stream.fromArrayBuffer(arrayBuffer);

    if (!Decoder.isFIT(stream)) {
      throw new Error('Not a valid FIT file');
    }

    const decoder = new Decoder(stream);
    const { messages, errors } = decoder.read({
      applyScaleAndOffset: true,
      convertDateTimesToDates: true,
      expandComponents: true,
      includeUnknownData: false,
      convertTypesToStrings: true,
    });

    if (errors.length > 0) {
      console.warn('FIT decode warnings:', errors);
    }

    const records = messages.recordMesgs || [];
    const sessions = messages.sessionMesgs || [];

    // Filter to records with GPS data
    const gpsRecords = records.filter(
      (r) => r.positionLat != null && r.positionLong != null
    );

    if (gpsRecords.length === 0) {
      throw new Error('No GPS data found in FIT file');
    }

    // Distance filter: keep points >= 5m apart
    const filteredRecords = [gpsRecords[0]];
    for (let i = 1; i < gpsRecords.length; i++) {
      const prev = filteredRecords[filteredRecords.length - 1];
      const curr = gpsRecords[i];
      const dist = haversineDistance(
        prev.positionLat * SEMICIRCLES_TO_DEGREES,
        prev.positionLong * SEMICIRCLES_TO_DEGREES,
        curr.positionLat * SEMICIRCLES_TO_DEGREES,
        curr.positionLong * SEMICIRCLES_TO_DEGREES
      );
      if (dist >= 5) {
        filteredRecords.push(curr);
      }
    }
    // Always include the last point
    const lastRecord = gpsRecords[gpsRecords.length - 1];
    if (filteredRecords[filteredRecords.length - 1] !== lastRecord) {
      filteredRecords.push(lastRecord);
    }

    // Convert to track points
    const points = filteredRecords.map((r) => ({
      timestamp: r.timestamp,
      latSemicircles: r.positionLat,
      lonSemicircles: r.positionLong,
      lat: r.positionLat * SEMICIRCLES_TO_DEGREES,
      lon: r.positionLong * SEMICIRCLES_TO_DEGREES,
      enhancedAltitude: r.enhancedAltitude ?? r.altitude ?? null,
      enhancedSpeed: r.enhancedSpeed ?? r.speed ?? null,
      distance: r.distance ?? null,
      heartRate: r.heartRate ?? null,
      cadence: r.cadence ?? null,
      power: r.power ?? null,
    }));

    // Session summary
    const session = sessions[0] || {};
    const summary = {
      sport: session.sport || 'unknown',
      startTime: points[0].timestamp,
      endTime: points[points.length - 1].timestamp,
      totalDistance: session.totalDistance ?? null,
      startPosition: [points[0].lon, points[0].lat],
      endPosition: [
        points[points.length - 1].lon,
        points[points.length - 1].lat,
      ],
    };

    // Compute stats
    let maxAltitude = -Infinity;
    let minAltitude = Infinity;
    let maxSpeed = 0;
    for (const p of points) {
      if (p.enhancedAltitude != null) {
        if (p.enhancedAltitude > maxAltitude) maxAltitude = p.enhancedAltitude;
        if (p.enhancedAltitude < minAltitude) minAltitude = p.enhancedAltitude;
      }
      if (p.enhancedSpeed != null && p.enhancedSpeed > maxSpeed) {
        maxSpeed = p.enhancedSpeed;
      }
    }

    const stats = {
      maxAltitude: maxAltitude === -Infinity ? null : maxAltitude,
      minAltitude: minAltitude === Infinity ? null : minAltitude,
      maxSpeed: maxSpeed || null,
      totalDistance: summary.totalDistance,
      pointCount: points.length,
      rawPointCount: gpsRecords.length,
    };

    const waypoints = [
      { type: 'start', pointIndex: 0, label: 'Start' },
      { type: 'end', pointIndex: points.length - 1, label: 'End' },
    ];

    return { fileName, summary, points, waypoints, stats };
  }

  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async function loadFitTracks(files) {
    const fitFiles = Array.from(files).filter((f) =>
      f.name.toLowerCase().endsWith('.fit')
    );
    if (fitFiles.length === 0) return;

    showLoading(`Loading ${fitFiles.length} FIT file(s)...`);
    let loaded = 0;

    for (const file of fitFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const trackData = parseFitFile(arrayBuffer, file.name);

        const track = {
          id: nextTrackId++,
          displayName: file.name,
          trackData: trackData,
          overlays: [],
          visible: true,
        };
        state.tracks.push(track);
        displayTrackOnMap(track);
        loaded++;

        console.log(
          `FIT loaded: ${trackData.stats.pointCount} points ` +
            `(filtered from ${trackData.stats.rawPointCount}), ` +
            `sport: ${trackData.summary.sport}`
        );
      } catch (err) {
        console.error(`Failed to load ${file.name}:`, err);
        showToast(`Failed: ${file.name} - ${err.message}`, 'error');
      }
    }

    renderAllTracksInTree();
    updateLegend();

    // Fit map to show all tracks
    if (state.map && loaded > 0) {
      const allPoints = [];
      state.tracks.forEach((t) => {
        if (t.visible && t.trackData.points.length > 0) {
          allPoints.push(t.trackData.points[0]);
          allPoints.push(t.trackData.points[t.trackData.points.length - 1]);
        }
      });
      if (allPoints.length > 0) {
        const lngLats = allPoints.map((p) => new T.LngLat(p.lon, p.lat));
        state.map.setViewport(lngLats);
      }
    }

    hideLoading();
    if (loaded > 0) {
      showToast(`${loaded} track(s) loaded successfully`, 'success');
    }
  }

  function displayTrackOnMap(track) {
    if (!state.map) {
      showToast('Map not initialized', 'warning');
      return;
    }

    const points = track.trackData.points;

    // For very large tracks, sample points for polyline display
    let displayPoints = points;
    if (points.length > 10000) {
      const step = Math.ceil(points.length / 10000);
      displayPoints = [];
      for (let i = 0; i < points.length; i += step) {
        displayPoints.push(points[i]);
      }
      // Always include last point
      if (
        displayPoints[displayPoints.length - 1] !== points[points.length - 1]
      ) {
        displayPoints.push(points[points.length - 1]);
      }
    }

    // Create polyline
    const lngLats = displayPoints.map((p) => new T.LngLat(p.lon, p.lat));
    const polyline = new T.Polyline(lngLats, {
      color: '#3b82f6',
      weight: 3,
      opacity: 0.8,
    });
    state.map.addOverLay(polyline);
    track.overlays.push(polyline);

    // Start marker (green)
    const startPoint = points[0];
    const startIcon = new T.Icon({
      iconUrl: createTrackMarkerIcon('#10b981', 'S'),
      iconSize: new T.Point(32, 40),
      iconAnchor: new T.Point(16, 40),
    });
    const startMarker = new T.Marker(
      new T.LngLat(startPoint.lon, startPoint.lat),
      { icon: startIcon }
    );
    startMarker.addEventListener('click', () => {
      const infoWin = new T.InfoWindow({
        content: formatTrackMarkerInfo('Start', startPoint),
      });
      startMarker.openInfoWindow(infoWin);
    });
    state.map.addOverLay(startMarker);
    track.overlays.push(startMarker);

    // End marker (red)
    const endPoint = points[points.length - 1];
    const endIcon = new T.Icon({
      iconUrl: createTrackMarkerIcon('#ef4444', 'E'),
      iconSize: new T.Point(32, 40),
      iconAnchor: new T.Point(16, 40),
    });
    const endMarker = new T.Marker(new T.LngLat(endPoint.lon, endPoint.lat), {
      icon: endIcon,
    });
    endMarker.addEventListener('click', () => {
      const infoWin = new T.InfoWindow({
        content: formatTrackMarkerInfo('End', endPoint),
      });
      endMarker.openInfoWindow(infoWin);
    });
    state.map.addOverLay(endMarker);
    track.overlays.push(endMarker);

    // Fit map to track bounds
    state.map.setViewport(lngLats);
  }

  function createTrackMarkerIcon(color, letter) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 24 16 24s16-15.163 16-24C32 7.163 24.837 0 16 0z" fill="${color}"/>
        <circle cx="16" cy="14" r="10" fill="white"/>
        <text x="16" y="18" text-anchor="middle" font-size="13" font-weight="bold" fill="${color}">${letter}</text>
      </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }

  function formatTrackMarkerInfo(label, point) {
    const time = point.timestamp
      ? new Date(point.timestamp).toLocaleString()
      : 'N/A';
    const alt =
      point.enhancedAltitude != null
        ? point.enhancedAltitude.toFixed(1) + ' m'
        : 'N/A';
    return `
      <div class="info-window">
        <h4>${label}</h4>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Coordinates:</strong> ${point.lon.toFixed(
          6
        )}, ${point.lat.toFixed(6)}</p>
        <p><strong>Altitude:</strong> ${alt}</p>
      </div>
    `;
  }

  function clearAllTrackOverlays() {
    if (!state.map) return;
    state.tracks.forEach((track) => {
      track.overlays.forEach((overlay) => state.map.removeOverLay(overlay));
      track.overlays = [];
    });
  }

  function removeTrack(trackId) {
    const idx = state.tracks.findIndex((t) => t.id === trackId);
    if (idx === -1) return;
    const track = state.tracks[idx];
    if (state.map) {
      track.overlays.forEach((overlay) => state.map.removeOverLay(overlay));
    }
    state.tracks.splice(idx, 1);
    renderAllTracksInTree();
    updateLegend();
  }

  function renderAllTracksInTree() {
    const treeContainer = document.getElementById('trip-tree');

    // Remove all existing track sections
    treeContainer
      .querySelectorAll('[data-track-id]')
      .forEach((el) => el.remove());

    if (state.tracks.length === 0 && !state.tripData) {
      // Only show empty state if there's also no trip data
      if (!treeContainer.querySelector('.tree-day:not([data-track-id])')) {
        treeContainer.innerHTML = `
          <div class="empty-state">
            <p>No trip loaded</p>
            <p class="hint">Enter a trip plan or load a markdown file to get started</p>
          </div>
        `;
      }
      return;
    }

    // Remove empty state if present
    const emptyState = treeContainer.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    // Render each track
    state.tracks.forEach((track) => {
      const trackData = track.trackData;

      const startTime = trackData.summary.startTime
        ? new Date(trackData.summary.startTime).toLocaleString()
        : 'N/A';
      const endTime = trackData.summary.endTime
        ? new Date(trackData.summary.endTime).toLocaleString()
        : 'N/A';

      const distKm =
        trackData.stats.totalDistance != null
          ? (trackData.stats.totalDistance / 1000).toFixed(2) + ' km'
          : 'N/A';
      const maxAlt =
        trackData.stats.maxAltitude != null
          ? trackData.stats.maxAltitude.toFixed(1) + ' m'
          : 'N/A';
      const maxSpd =
        trackData.stats.maxSpeed != null
          ? (trackData.stats.maxSpeed * 3.6).toFixed(1) + ' km/h'
          : 'N/A';

      const trackHtml = `
        <div class="tree-day track-section" data-track-id="${track.id}">
          <div class="tree-day-header track-header">
            <button class="tree-toggle" data-track-toggle="${track.id}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            <input type="checkbox" class="tree-cb" ${
              track.visible ? 'checked' : ''
            } data-type="track" data-track-id="${track.id}">
            <span class="track-line-indicator"></span>
            <span class="day-title track-name" data-track-id="${
              track.id
            }" title="Double-click to rename">${track.displayName}</span>
            <span class="location-count">(${
              trackData.stats.pointCount
            } pts)</span>
            <button class="btn-icon track-remove-btn" data-track-id="${
              track.id
            }" title="Remove track">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <ul class="tree-locations expanded">
            <li class="tree-location track-waypoint" data-track-id="${
              track.id
            }" data-wp="start">
              <span class="track-wp-icon track-wp-start">S</span>
              <span class="location-info">
                <span class="location-name">Start</span>
                <span class="location-time">${startTime}</span>
              </span>
            </li>
            <li class="tree-location track-waypoint" data-track-id="${
              track.id
            }" data-wp="end">
              <span class="track-wp-icon track-wp-end">E</span>
              <span class="location-info">
                <span class="location-name">End</span>
                <span class="location-time">${endTime}</span>
              </span>
            </li>
            <li class="track-stats-row">
              <span class="track-stat">
                <span class="track-stat-label">Dist</span>
                <span class="track-stat-value">${distKm}</span>
              </span>
              <span class="track-stat">
                <span class="track-stat-label">Max Alt</span>
                <span class="track-stat-value">${maxAlt}</span>
              </span>
              <span class="track-stat">
                <span class="track-stat-label">Max Spd</span>
                <span class="track-stat-value">${maxSpd}</span>
              </span>
            </li>
          </ul>
        </div>
      `;

      treeContainer.insertAdjacentHTML('afterbegin', trackHtml);
    });

    bindTrackTreeEvents();
  }

  function bindTrackTreeEvents() {
    // Toggle expand/collapse
    document.querySelectorAll('[data-track-toggle]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dayEl = e.target.closest('.tree-day');
        const locations = dayEl.querySelector('.tree-locations');
        locations.classList.toggle('expanded');
        btn.classList.toggle('collapsed');
      });
    });

    // Track visibility checkboxes
    document.querySelectorAll('input[data-type="track"]').forEach((cb) => {
      cb.addEventListener('click', (e) => e.stopPropagation());
      cb.addEventListener('change', (e) => {
        e.stopPropagation();
        const trackId = parseInt(e.target.dataset.trackId);
        const track = state.tracks.find((t) => t.id === trackId);
        if (!track || !state.map) return;
        const visible = e.target.checked;
        track.visible = visible;
        track.overlays.forEach((overlay) => {
          if (visible) {
            state.map.addOverLay(overlay);
          } else {
            state.map.removeOverLay(overlay);
          }
        });
      });
    });

    // Remove track buttons
    document.querySelectorAll('.track-remove-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const trackId = parseInt(btn.dataset.trackId);
        removeTrack(trackId);
      });
    });

    // Double-click to rename track
    document.querySelectorAll('.track-name').forEach((nameEl) => {
      nameEl.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const trackId = parseInt(nameEl.dataset.trackId);
        const track = state.tracks.find((t) => t.id === trackId);
        if (!track) return;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'track-name-input';
        input.value = track.displayName;

        const commitRename = () => {
          const newName = input.value.trim();
          if (newName && newName !== track.displayName) {
            track.displayName = newName;
            updateLegend();
          }
          nameEl.textContent = track.displayName;
          nameEl.style.display = '';
          input.remove();
        };

        input.addEventListener('blur', commitRename);
        input.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') {
            ev.preventDefault();
            input.blur();
          } else if (ev.key === 'Escape') {
            input.value = track.displayName;
            input.blur();
          }
        });

        nameEl.style.display = 'none';
        nameEl.parentNode.insertBefore(input, nameEl.nextSibling);
        input.focus();
        input.select();
      });
    });

    // Click waypoints to pan
    document.querySelectorAll('.track-waypoint').forEach((wpEl) => {
      wpEl.addEventListener('click', () => {
        const trackId = parseInt(wpEl.dataset.trackId);
        const track = state.tracks.find((t) => t.id === trackId);
        if (!track || !state.map) return;
        const wp = wpEl.dataset.wp;
        const points = track.trackData.points;
        const point = wp === 'start' ? points[0] : points[points.length - 1];
        state.map.panTo(new T.LngLat(point.lon, point.lat));
        state.map.setZoom(15);
      });
    });
  }

  // ============================================
  // KML Export
  // ============================================

  function exportTracksToKml() {
    const checkedTracks = state.tracks.filter((t) => t.visible);
    if (checkedTracks.length === 0) {
      showToast('No tracks selected for export', 'warning');
      return;
    }

    const placemarks = checkedTracks
      .map((track) => {
        const points = track.trackData.points;
        const coordLines = points
          .map((p) => {
            const alt = p.enhancedAltitude != null ? p.enhancedAltitude : 0;
            return `${p.lon},${p.lat},${alt}`;
          })
          .join('\n            ');

        const startTime = track.trackData.summary.startTime
          ? new Date(track.trackData.summary.startTime).toISOString()
          : '';
        const endTime = track.trackData.summary.endTime
          ? new Date(track.trackData.summary.endTime).toISOString()
          : '';

        let timeSpan = '';
        if (startTime && endTime) {
          timeSpan = `
        <TimeSpan>
          <begin>${startTime}</begin>
          <end>${endTime}</end>
        </TimeSpan>`;
        }

        return `
    <Placemark>
      <name>${escapeXml(track.displayName)}</name>${timeSpan}
      <Style>
        <LineStyle>
          <color>fff68c3b</color>
          <width>3</width>
        </LineStyle>
      </Style>
      <LineString>
        <extrude>1</extrude>
        <tessellate>1</tessellate>
        <altitudeMode>absolute</altitudeMode>
        <coordinates>
            ${coordLines}
        </coordinates>
      </LineString>
    </Placemark>`;
      })
      .join('\n');

    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Trip Planner Export</name>
    <description>Exported ${checkedTracks.length} track(s)</description>
${placemarks}
  </Document>
</kml>`;

    const blob = new Blob([kml], {
      type: 'application/vnd.google-earth.kml+xml',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName =
      checkedTracks.length === 1
        ? checkedTracks[0].displayName.replace(/\.\w+$/, '') + '.kml'
        : 'trip-export.kml';
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    showToast(`Exported ${checkedTracks.length} track(s) to KML`, 'success');
  }

  function escapeXml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // ============================================
  // File Operations
  // ============================================

  function saveTrip() {
    if (!state.tripData) {
      showToast('No trip data to save', 'warning');
      return;
    }

    const md = generateMarkdown(state.tripData);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.tripData.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();

    URL.revokeObjectURL(url);
    showToast('Trip saved successfully', 'success');
  }

  function loadTrip(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        showLoading('Loading trip...');
        const content = e.target.result;

        // Parse markdown
        state.tripData = parseMarkdown(content);

        // Geocode locations
        await geocodeAllLocations(state.tripData);

        // Update UI
        renderTreeView(state.tripData);
        document.getElementById('markdown-output').value = content;
        document.getElementById('trip-input').value = content;

        // Add markers
        displayMarkersOnMap();

        hideLoading();
        showToast('Trip loaded successfully', 'success');
      } catch (err) {
        hideLoading();
        console.error('Load error:', err);
        showToast('Failed to load trip: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  }

  // ============================================
  // Main Functions
  // ============================================

  function displayMarkersOnMap() {
    clearMarkers();

    if (!state.tripData || !state.tripData.days) return;

    state.tripData.days.forEach((day, dayIndex) => {
      const color = CONFIG.markerColors[dayIndex % CONFIG.markerColors.length];
      day.locations.forEach((location) => {
        if (location.coordinates) {
          addMarker(location, dayIndex, color);
        }
      });
    });

    updateLegend();

    if (state.markers.length > 0) {
      setTimeout(() => fitBounds(), 100);
    }
  }

  async function processTrip() {
    const input = document.getElementById('trip-input').value.trim();

    if (!input) {
      showToast('Please enter a trip plan', 'warning');
      return;
    }

    if (!state.settings.mapKey) {
      showToast(
        'Please configure Tianditu API key in Settings first',
        'warning'
      );
      return;
    }

    try {
      showLoading('Extracting locations...');

      // Extract locations using LLM or manual parsing
      state.tripData = await extractLocationsWithLLM(input);

      // Geocode all locations
      await geocodeAllLocations(state.tripData);

      // Update UI
      renderTreeView(state.tripData);
      document.getElementById('markdown-output').value = generateMarkdown(
        state.tripData
      );

      // Display markers on map
      displayMarkersOnMap();

      hideLoading();
      showToast('Locations extracted and mapped successfully', 'success');
    } catch (err) {
      hideLoading();
      console.error('Processing error:', err);
      showToast('Failed to process trip: ' + err.message, 'error');
    }
  }

  function newTrip() {
    state.tripData = null;
    clearMarkers();
    document.getElementById('trip-input').value = '';
    document.getElementById('markdown-output').value = '';
    document.getElementById('extraction-status').innerHTML = '';
    renderTreeView(null);
    showToast('Started new trip', 'info');
  }

  // ============================================
  // UI Event Handlers
  // ============================================

  function initUI() {
    // Tab switching
    document.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;

        document
          .querySelectorAll('.tab')
          .forEach((t) => t.classList.remove('active'));
        document
          .querySelectorAll('.tab-content')
          .forEach((c) => c.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(`tab-${tabId}`).classList.add('active');
      });
    });

    // Sidebar toggles
    document
      .getElementById('toggle-left-sidebar')
      .addEventListener('click', () => {
        document.getElementById('sidebar-left').classList.toggle('collapsed');
      });

    document
      .getElementById('toggle-right-sidebar')
      .addEventListener('click', () => {
        document.getElementById('sidebar-right').classList.toggle('collapsed');
      });

    document.getElementById('collapse-left').addEventListener('click', () => {
      document.getElementById('sidebar-left').classList.add('collapsed');
    });

    document.getElementById('collapse-right').addEventListener('click', () => {
      document.getElementById('sidebar-right').classList.add('collapsed');
    });

    // Tree controls
    document.getElementById('expand-all').addEventListener('click', () => {
      document
        .querySelectorAll('.tree-locations')
        .forEach((el) => el.classList.add('expanded'));
      document
        .querySelectorAll('.tree-toggle')
        .forEach((el) => el.classList.remove('collapsed'));
    });

    document.getElementById('collapse-all').addEventListener('click', () => {
      document
        .querySelectorAll('.tree-locations')
        .forEach((el) => el.classList.remove('expanded'));
      document
        .querySelectorAll('.tree-toggle')
        .forEach((el) => el.classList.add('collapsed'));
    });

    document
      .getElementById('toggle-all-markers')
      .addEventListener('click', () => {
        toggleAllMarkers(!state.allMarkersVisible);
      });

    // Main actions
    document.getElementById('new-trip').addEventListener('click', newTrip);
    document.getElementById('save-trip').addEventListener('click', saveTrip);

    document.getElementById('load-trip').addEventListener('click', () => {
      document.getElementById('file-input').click();
    });

    document.getElementById('file-input').addEventListener('change', (e) => {
      if (e.target.files.length === 0) return;
      const files = e.target.files;
      const fitFiles = [];
      let otherFile = null;

      for (const file of files) {
        if (file.name.toLowerCase().endsWith('.fit')) {
          fitFiles.push(file);
        } else {
          otherFile = file;
        }
      }

      if (fitFiles.length > 0) {
        loadFitTracks(fitFiles);
      }
      if (otherFile) {
        loadTrip(otherFile);
      }

      e.target.value = '';
    });

    document
      .getElementById('extract-locations')
      .addEventListener('click', processTrip);

    // Map controls
    document.getElementById('fit-bounds').addEventListener('click', fitBounds);
    document.getElementById('clear-markers').addEventListener('click', () => {
      clearMarkers();
      showToast('All markers cleared', 'info');
    });

    // Export KML
    document
      .getElementById('export-kml')
      .addEventListener('click', exportTracksToKml);

    // Markdown actions
    document.getElementById('copy-markdown').addEventListener('click', () => {
      const md = document.getElementById('markdown-output').value;
      navigator.clipboard.writeText(md);
      showToast('Markdown copied to clipboard', 'success');
    });

    document.getElementById('edit-markdown').addEventListener('click', () => {
      const textarea = document.getElementById('markdown-output');
      textarea.readOnly = !textarea.readOnly;
      document.getElementById('edit-markdown').textContent = textarea.readOnly
        ? 'Edit'
        : 'Lock';
    });

    document
      .getElementById('apply-markdown')
      .addEventListener('click', async () => {
        const md = document.getElementById('markdown-output').value;
        showLoading('Applying changes...');

        try {
          state.tripData = parseMarkdown(md);
          await geocodeAllLocations(state.tripData);
          renderTreeView(state.tripData);
          displayMarkersOnMap();
          hideLoading();
          showToast('Changes applied', 'success');
        } catch (err) {
          hideLoading();
          showToast('Failed to apply changes: ' + err.message, 'error');
        }
      });

    // Settings
    document
      .getElementById('llm-provider')
      .addEventListener('change', updateProviderFields);
    document
      .getElementById('save-settings')
      .addEventListener('click', saveSettings);
    document
      .getElementById('test-local-ai')
      .addEventListener('click', testLocalAI);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            saveTrip();
            break;
          case 'o':
            e.preventDefault();
            document.getElementById('file-input').click();
            break;
          case 'Enter':
            if (document.activeElement.id === 'trip-input') {
              e.preventDefault();
              processTrip();
            }
            break;
        }
      }
    });
  }

  // ============================================
  // Initialization
  // ============================================

  function init() {
    loadSettings();
    initUI();
    initMap();
    renderTreeView(null);

    console.log('Trip Planner initialized');
  }

  // Start the app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
