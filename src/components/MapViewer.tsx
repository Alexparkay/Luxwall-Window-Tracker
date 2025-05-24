
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
  Map
} from 'lucide-react';
import BuildingControls from './BuildingControls';
import WindowDisplay from './WindowDisplay';
import { Building as BuildingType, useBuildingData } from '@/hooks/useBuildingData';

const MapViewer = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState('New York, NY');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('satellite');
  const [showWindows, setShowWindows] = useState(false);
  const [buildingMarkers, setBuildingMarkers] = useState<any[]>([]);
  const [windowMarkers, setWindowMarkers] = useState<any[]>([]);
  
  const { buildings, windows, selectedBuilding } = useBuildingData();

  useEffect(() => {
    // Set up the global callback for Google Maps
    window.initMap = initializeMap;
    
    // If Google Maps is already loaded, initialize immediately
    if (window.google?.maps) {
      initializeMap();
    }
  }, []);

  // Update building markers when buildings change
  useEffect(() => {
    if (map && buildings) {
      updateBuildingMarkers();
    }
  }, [map, buildings]);

  // Update window markers when windows change or visibility toggles
  useEffect(() => {
    if (map) {
      updateWindowMarkers();
    }
  }, [map, windows, showWindows, selectedBuilding]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google?.maps) return;

    console.log('Initializing Google Maps with 3D buildings...');

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
      fullscreenControl: true,
      gestureHandling: 'cooperative'
    });

    setMap(mapInstance);
    setIsLoading(false);

    console.log('Map initialized successfully with 3D buildings');
  };

  const updateBuildingMarkers = () => {
    if (!window.google?.maps) return;
    
    // Clear existing building markers
    buildingMarkers.forEach(marker => marker.setMap(null));
    
    const newMarkers = buildings.map(building => {
      const marker = new window.google.maps.Marker({
        position: { lat: building.latitude, lng: building.longitude },
        map: map,
        title: building.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 20V4C3 3.45 3.196 2.979 3.588 2.587C3.98 2.195 4.45 2 5 2H19C19.55 2 20.021 2.195 20.413 2.587C20.805 2.979 21 3.45 21 4V20L12 17L3 20Z" fill="#2563eb" stroke="#1e40af" stroke-width="1"/>
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
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
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

    const newWindowMarkers = windows.map(window => {
      // Calculate position relative to building (this is simplified for demo)
      const offsetLat = (window.y_coordinate - 50) * 0.00001; // Convert to lat offset
      const offsetLng = (window.x_coordinate - 50) * 0.00001; // Convert to lng offset
      
      const marker = new window.google.maps.Marker({
        position: { 
          lat: selectedBuilding.latitude + offsetLat, 
          lng: selectedBuilding.longitude + offsetLng 
        },
        map: map,
        title: `Window (Floor ${window.floor_number})`,
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
            <p style="margin: 2px 0; color: #6b7280; font-size: 12px;">Floor: ${window.floor_number}</p>
            <p style="margin: 2px 0; color: #6b7280; font-size: 12px;">Type: ${window.window_type}</p>
            <p style="margin: 2px 0; color: #6b7280; font-size: 12px;">Confidence: ${((window.confidence || 0) * 100).toFixed(1)}%</p>
            ${window.width && window.height ? `<p style="margin: 2px 0; color: #6b7280; font-size: 12px;">Size: ${window.width.toFixed(1)}m × ${window.height.toFixed(1)}m</p>` : ''}
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
    if (map) {
      map.setCenter({ lat: building.latitude, lng: building.longitude });
      map.setZoom(20);
      map.setTilt(45);
      setCurrentLocation(building.address || building.name);
    }
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
          </div>
        </Card>

        {/* Location Info */}
        <Card className="absolute bottom-4 left-4 p-3 bg-white/95 backdrop-blur">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Current Location:</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{currentLocation}</p>
        </Card>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-3 text-center">
        <p className="text-sm text-blue-800">
          <strong>Instructions:</strong> Search and select buildings • Click "Detect Windows" to analyze • 
          Toggle window visibility with the eye icon • Navigate with mouse controls
        </p>
      </div>
    </div>
  );
};

export default MapViewer;
