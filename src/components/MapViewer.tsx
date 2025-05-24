
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

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const MapViewer = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState('New York, NY');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('satellite');

  useEffect(() => {
    // Set up the global callback for Google Maps
    window.initMap = initializeMap;
    
    // If Google Maps is already loaded, initialize immediately
    if (window.google && window.google.maps) {
      initializeMap();
    }
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

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

  const searchLocation = async () => {
    if (!map || !searchQuery.trim()) return;

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
            <h1 className="text-xl font-bold text-gray-800">3D Maps Viewer</h1>
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
          <strong>Navigation:</strong> Click and drag to pan • Right-click and drag to rotate • Scroll to zoom • 
          Use Ctrl+Click and drag to tilt the view
        </p>
      </div>
    </div>
  );
};

export default MapViewer;
