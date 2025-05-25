import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Search, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move3D,
  Building,
  Navigation,
  Map,
  Eye
} from 'lucide-react';
import BuildingControls from './BuildingControls';
import WindowDisplay from './WindowDisplay';
import { Building as BuildingType, useBuildingData } from '@/hooks/useBuildingData';

const MapViewer = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [streetView, setStreetView] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState('New York, NY');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('satellite');
  const [showWindows, setShowWindows] = useState(false);
  const [buildingMarkers, setBuildingMarkers] = useState<any[]>([]);
  const [windowMarkers, setWindowMarkers] = useState<any[]>([]);
  const [ctrlPressed, setCtrlPressed] = useState(false);
  const [showStreetView, setShowStreetView] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(18);
  
  const { buildings, windows, selectedBuilding, setSelectedBuilding, fetchWindows, startWindowDetection } = useBuildingData();

  useEffect(() => {
    // Set up the global callback for Google Maps
    window.initMap = initializeMap;
    
    // If Google Maps is already loaded, initialize immediately
    if (window.google?.maps) {
      initializeMap();
    }
  }, []);

  // Handle keyboard events for Ctrl key and rotation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' && !ctrlPressed) {
        setCtrlPressed(true);
        if (map) {
          // Enable rotation and tilting with Ctrl key
          map.setOptions({ 
            gestureHandling: 'greedy',
            rotateControl: true,
            tiltControl: true
          });
          console.log('Rotation mode enabled - Hold Ctrl and drag to rotate/tilt');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' && ctrlPressed) {
        setCtrlPressed(false);
        if (map) {
          map.setOptions({ 
            gestureHandling: 'cooperative',
            rotateControl: true,
            tiltControl: true
          });
          console.log('Rotation mode disabled');
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (ctrlPressed && map) {
        // Enable rotation on mouse down while Ctrl is pressed
        map.setOptions({ draggable: true, scrollwheel: true });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [map, ctrlPressed]);

  // Update building markers when buildings change
  useEffect(() => {
    if (map && buildings) {
      updateBuildingMarkers();
    }
  }, [map, buildings, selectedBuilding]);

  // Update window markers when windows change or visibility toggles
  useEffect(() => {
    if (map) {
      updateWindowMarkers();
    }
  }, [map, windows, showWindows, selectedBuilding]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google?.maps) return;

    console.log('Initializing Google Maps with 3D buildings and Street View...');

    // Create map with 3D buildings enabled
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: 40.7614, lng: -73.9776 }, // New York City
      zoom: 18,
      mapTypeId: mapType,
      tilt: 45, // Enable 3D view
      heading: 0,
      mapId: 'DEMO_MAP_ID', // Required for 3D buildings
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: true,
      rotateControl: true,
      tiltControl: true,
      fullscreenControl: true,
      gestureHandling: 'cooperative',
      draggable: true,
      scrollwheel: true
    });

    // Initialize Street View
    if (streetViewRef.current) {
      const streetViewInstance = new window.google.maps.StreetViewPanorama(streetViewRef.current, {
        position: { lat: 40.7614, lng: -73.9776 },
        pov: { heading: 34, pitch: 10 },
        visible: false
      });
      
      mapInstance.setStreetView(streetViewInstance);
      setStreetView(streetViewInstance);
    }

    // Add zoom change listener to automatically show Street View
    mapInstance.addListener('zoom_changed', () => {
      const zoom = mapInstance.getZoom();
      setCurrentZoom(zoom);
      
      // Auto-enable Street View when zoomed in very close
      if (zoom >= 21 && !showStreetView) {
        enableStreetView();
      } else if (zoom < 20 && showStreetView) {
        disableStreetView();
      }
    });

    // Add click listener for building selection
    mapInstance.addListener('click', async (event: any) => {
      const clickedLocation = event.latLng;
      console.log('Map clicked at:', clickedLocation.lat(), clickedLocation.lng());
      
      // Find nearest building or create a mock building for demo
      await handleMapClick(clickedLocation);
    });

    setMap(mapInstance);
    setIsLoading(false);

    console.log('Map initialized successfully with 3D buildings and Street View');
  };

  const handleMapClick = async (location: any) => {
    const lat = location.lat();
    const lng = location.lng();
    
    // Check if clicked near an existing building
    const nearbyBuilding = buildings.find(building => {
      const distance = Math.sqrt(
        Math.pow(building.latitude - lat, 2) + Math.pow(building.longitude - lng, 2)
      );
      return distance < 0.001; // Very close threshold
    });

    if (nearbyBuilding) {
      await handleBuildingClick(nearbyBuilding);
    } else {
      // Create a temporary building for demonstration
      const tempBuilding: BuildingType = {
        id: `temp-${Date.now()}`,
        name: 'Selected Building',
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        latitude: lat,
        longitude: lng,
        google_place_id: null,
        geometry: null
      };
      
      await handleBuildingClick(tempBuilding);
    }
  };

  const handleBuildingClick = async (building: BuildingType) => {
    console.log('Building selected:', building.name);
    
    // Set as selected building
    setSelectedBuilding(building);
    
    // Center map on building and add visual highlight
    if (map) {
      map.setCenter({ lat: building.latitude, lng: building.longitude });
      map.setZoom(20);
      map.setTilt(45);
      setCurrentLocation(building.address || building.name);
      
      // Add a highlight circle around the selected building
      new window.google.maps.Circle({
        strokeColor: '#dc2626',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillColor: '#dc2626',
        fillOpacity: 0.2,
        map: map,
        center: { lat: building.latitude, lng: building.longitude },
        radius: 50 // 50 meter radius
      });
    }
    
    // Fetch existing windows first
    await fetchWindows(building.id);
    
    // Start window detection automatically
    startWindowDetection(building.id);
    
    // Show windows
    setShowWindows(true);
  };

  const enableStreetView = () => {
    if (streetView && map) {
      const center = map.getCenter();
      streetView.setPosition(center);
      streetView.setVisible(true);
      setShowStreetView(true);
      console.log('Street View enabled');
    }
  };

  const disableStreetView = () => {
    if (streetView) {
      streetView.setVisible(false);
      setShowStreetView(false);
      console.log('Street View disabled');
    }
  };

  const updateBuildingMarkers = () => {
    if (!window.google?.maps) return;
    
    // Clear existing building markers
    buildingMarkers.forEach(marker => marker.setMap(null));
    
    const newMarkers = buildings.map(building => {
      const isSelected = selectedBuilding?.id === building.id;
      
      const marker = new window.google.maps.Marker({
        position: { lat: building.latitude, lng: building.longitude },
        map: map,
        title: building.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 20V4C3 3.45 3.196 2.979 3.588 2.587C3.98 2.195 4.45 2 5 2H19C19.55 2 20.021 2.195 20.413 2.587C20.805 2.979 21 3.45 21 4V20L12 17L3 20Z" fill="${isSelected ? '#dc2626' : '#2563eb'}" stroke="${isSelected ? '#b91c1c' : '#1e40af'}" stroke-width="1"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(30, 30),
          anchor: new window.google.maps.Point(15, 30)
        }
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div>
            <h3 style="margin: 0 0 8px 0; color: #1f2937;">${building.name}</h3>
            ${building.address ? `<p style="margin: 0; color: #6b7280; font-size: 14px;">${building.address}</p>` : ''}
            <p style="margin: 4px 0 0 0; color: #2563eb; font-size: 12px; cursor: pointer;">Click to analyze windows</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        handleBuildingClick(building);
      });

      return marker;
    });

    setBuildingMarkers(newMarkers);
  };

  const updateWindowMarkers = () => {
    if (!window.google?.maps) return;
    
    // Clear existing window markers
    windowMarkers.forEach(marker => marker.setMap(null));
    
    if (!showWindows || !selectedBuilding || windows.length === 0) {
      setWindowMarkers([]);
      return;
    }

    const newWindowMarkers = windows.map(windowData => {
      // Calculate position relative to building (this is simplified for demo)
      const offsetLat = (windowData.y_coordinate - 50) * 0.00001; // Convert to lat offset
      const offsetLng = (windowData.x_coordinate - 50) * 0.00001; // Convert to lng offset
      
      const marker = new window.google.maps.Marker({
        position: { 
          lat: selectedBuilding.latitude + offsetLat, 
          lng: selectedBuilding.longitude + offsetLng 
        },
        map: map,
        title: `Window (Floor ${windowData.floor_number})`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="10" height="10" fill="#10b981" stroke="#059669" stroke-width="1" rx="1"/>
              <line x1="6" y1="1" x2="6" y2="11" stroke="#059669" stroke-width="1"/>
              <line x1="1" y1="6" x2="11" y2="6" stroke="#059669" stroke-width="1"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(12, 12),
          anchor: new window.google.maps.Point(6, 6)
        }
      });

      // Add info window for windows
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div>
            <h4 style="margin: 0 0 4px 0; color: #1f2937;">Window Details</h4>
            <p style="margin: 2px 0; color: #6b7280; font-size: 12px;">Floor: ${windowData.floor_number}</p>
            <p style="margin: 2px 0; color: #6b7280; font-size: 12px;">Type: ${windowData.window_type}</p>
            <p style="margin: 2px 0; color: #6b7280; font-size: 12px;">Confidence: ${((windowData.confidence || 0) * 100).toFixed(1)}%</p>
            ${windowData.width && windowData.height ? `<p style="margin: 2px 0; color: #6b7280; font-size: 12px;">Size: ${windowData.width.toFixed(1)}m × ${windowData.height.toFixed(1)}m</p>` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      return marker;
    });

    setWindowMarkers(newWindowMarkers);
  };

  const handleBuildingSelect = (building: BuildingType) => {
    handleBuildingClick(building);
  };

  const searchLocation = async () => {
    if (!map || !searchQuery.trim() || !window.google?.maps) return;

    console.log('Searching for location:', searchQuery);

    const geocoder = new window.google.maps.Geocoder();
    
    try {
      const response = await geocoder.geocode({ address: searchQuery });
      
      if (response.results && response.results.length > 0) {
        const location = response.results[0].geometry.location;
        
        map.setCenter(location);
        map.setZoom(18);
        map.setTilt(45); // Ensure 3D view
        
        setCurrentLocation(response.results[0].formatted_address);
        
        // Add a marker
        new window.google.maps.Marker({
          position: location,
          map: map,
          title: response.results[0].formatted_address
        });
        
        console.log('Location found and centered:', response.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handleMapTypeChange = (newType: 'roadmap' | 'satellite' | 'hybrid') => {
    setMapType(newType);
    if (map) {
      map.setMapTypeId(newType);
    }
  };

  const zoomIn = () => {
    if (map) {
      map.setZoom(map.getZoom() + 1);
    }
  };

  const zoomOut = () => {
    if (map) {
      map.setZoom(map.getZoom() - 1);
    }
  };

  const resetView = () => {
    if (map) {
      map.setTilt(45);
      map.setHeading(0);
      map.setZoom(18);
    }
  };

  const toggle3D = () => {
    if (map) {
      const currentTilt = map.getTilt();
      map.setTilt(currentTilt === 0 ? 45 : 0);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md p-4 z-10">
        <div className="flex items-center gap-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">Window Detection Viewer</h1>
          </div>
          
          <div className="flex-1 flex items-center gap-2">
            <Input
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
              className="flex-1"
            />
            <Button onClick={searchLocation} size="sm">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Street View Container */}
        <div 
          ref={streetViewRef} 
          className={`absolute inset-0 ${showStreetView ? 'block' : 'hidden'}`}
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading 3D Maps...</p>
            </div>
          </div>
        )}

        {/* Building Controls */}
        <BuildingControls 
          onBuildingSelect={handleBuildingSelect}
          onShowWindows={setShowWindows}
          showWindows={showWindows}
        />

        {/* Window Display */}
        <WindowDisplay windows={windows} visible={showWindows} />

        {/* Control Panel */}
        <Card className="absolute top-4 right-4 p-4 bg-white/95 backdrop-blur">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Map Controls</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={zoomIn}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={zoomOut}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={toggle3D}>
                  <Move3D className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={resetView}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Map Type</p>
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant={mapType === 'satellite' ? 'default' : 'outline'}
                  onClick={() => handleMapTypeChange('satellite')}
                >
                  Satellite
                </Button>
                <Button 
                  size="sm" 
                  variant={mapType === 'roadmap' ? 'default' : 'outline'}
                  onClick={() => handleMapTypeChange('roadmap')}
                >
                  Road
                </Button>
                <Button 
                  size="sm" 
                  variant={mapType === 'hybrid' ? 'default' : 'outline'}
                  onClick={() => handleMapTypeChange('hybrid')}
                >
                  Hybrid
                </Button>
              </div>
            </div>

            {/* Street View Toggle */}
            <div>
              <Button 
                size="sm" 
                variant={showStreetView ? 'default' : 'outline'}
                onClick={() => showStreetView ? disableStreetView() : enableStreetView()}
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                Street View
              </Button>
            </div>

            {ctrlPressed && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                Rotation mode active - Drag to rotate/tilt
              </div>
            )}

            {currentZoom >= 20 && (
              <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                High zoom - Street View available
              </div>
            )}
          </div>
        </Card>

        {/* Location Info */}
        <Card className="absolute bottom-4 left-4 p-3 bg-white/95 backdrop-blur">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Current Location:</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{currentLocation}</p>
          <div className="text-xs text-gray-500 mt-1">
            Hold Ctrl + drag to rotate • Click anywhere to select building • Zoom to 21+ for Street View
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MapViewer;
