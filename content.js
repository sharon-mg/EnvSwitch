// SwitchEnv - Environment Marker Content Script

(function() {
  'use strict';

  const DEFAULT_COLOR = '#11CCCA';
  const MARKER_ID = 'switchenv-marker';

  // Get current page's subdomain
  function getSubdomain() {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    if (parts.length > 2) {
      return parts[0];
    } else if (parts.length === 2) {
      // No subdomain (e.g., example.com)
      return null;
    }
    return null;
  }

  // Find matching environment based on subdomain
  function findMatchingEnvironment(environments, subdomain) {
    if (!subdomain || !environments || !environments.length) {
      return null;
    }
    
    return environments.find(env => 
      env.subdomain && env.subdomain.toLowerCase() === subdomain.toLowerCase()
    );
  }

  // Remove existing marker if present
  function removeExistingMarker() {
    const existing = document.getElementById(MARKER_ID);
    if (existing) {
      existing.remove();
    }
  }

  // Create ribbon marker
  function createRibbonMarker(env, position, color) {
    const marker = document.createElement('div');
    marker.id = MARKER_ID;
    marker.className = `switchenv-marker ribbon ${position}`;
    
    const content = document.createElement('div');
    content.className = 'marker-content';
    content.textContent = env.name;
    content.style.backgroundColor = color;
    
    marker.appendChild(content);
    return marker;
  }

  // Create badge marker
  function createBadgeMarker(env, position, color) {
    const marker = document.createElement('div');
    marker.id = MARKER_ID;
    marker.className = `switchenv-marker badge ${position}`;
    
    const content = document.createElement('div');
    content.className = 'marker-content';
    content.textContent = env.name;
    content.style.backgroundColor = color;
    
    marker.appendChild(content);
    return marker;
  }

  // Create triangle marker
  function createTriangleMarker(env, position, color) {
    const marker = document.createElement('div');
    marker.id = MARKER_ID;
    marker.className = `switchenv-marker triangle ${position}`;
    
    const background = document.createElement('div');
    background.className = 'marker-background';
    background.style.color = color;
    
    const content = document.createElement('div');
    content.className = 'marker-content';
    content.textContent = env.name;
    
    marker.appendChild(background);
    marker.appendChild(content);
    return marker;
  }

  // Create marker based on shape setting
  function createMarker(env, settings) {
    const shape = settings.shape || 'ribbon';
    const position = settings.position || 'top-right';
    const color = env.color || DEFAULT_COLOR;

    switch (shape) {
      case 'badge':
        return createBadgeMarker(env, position, color);
      case 'triangle':
        return createTriangleMarker(env, position, color);
      case 'ribbon':
      default:
        return createRibbonMarker(env, position, color);
    }
  }

  // Track mouse position for hover effect (since pointer-events: none)
  let mouseTrackingEnabled = false;
  
  function setupMouseTracking(marker, hoverOpacity) {
    if (mouseTrackingEnabled) return;
    mouseTrackingEnabled = true;
    
    document.addEventListener('mousemove', function(e) {
      const currentMarker = document.getElementById(MARKER_ID);
      if (!currentMarker) return;
      
      const rect = currentMarker.getBoundingClientRect();
      const isOverMarker = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      
      currentMarker.classList.toggle('faded', isOverMarker);
    });
  }

  // Inject marker into the page
  function injectMarker(env, settings) {
    removeExistingMarker();
    
    const marker = createMarker(env, settings);
    
    // Set hover opacity from settings (default 20%)
    const hoverOpacity = (settings.hoverOpacity ?? 20) / 100;
    marker.style.setProperty('--hover-opacity', hoverOpacity);
    
    document.body.appendChild(marker);
    
    // Setup mouse tracking for hover effect
    setupMouseTracking(marker, hoverOpacity);
  }

  // Main initialization
  function init() {
    chrome.storage.sync.get(['environments', 'markerSettings'], function(result) {
      const environments = result.environments || [];
      const settings = result.markerSettings || { enabled: false };

      // Check if markers are enabled
      if (!settings.enabled) {
        removeExistingMarker();
        return;
      }

      // Get current subdomain
      const subdomain = getSubdomain();
      
      // Find matching environment
      const matchingEnv = findMatchingEnvironment(environments, subdomain);
      
      // Only show marker for known environments
      if (matchingEnv) {
        injectMarker(matchingEnv, settings);
      } else {
        removeExistingMarker();
      }
    });
  }

  // Listen for storage changes to update marker in real-time
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync') {
      if (changes.environments || changes.markerSettings) {
        init();
      }
    }
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
