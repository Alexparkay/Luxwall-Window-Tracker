
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
  Eye,
  X,
  Settings,
  Play,
  Loader2,
  Grid3X3,
  MapPin
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Building as BuildingType, Window, useBuildingData } from '@/hooks/useBuildingData';

// Generate proper UUID v4
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const MapViewer = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<any>(null);
  const [streetView, setStreetView] = useState<any>(null);
  const [autocomplete, setAutocomplete] = useState<any>(null);
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
  const [showMapControls, setShowMapControls] = useState(false);
  const [showAnalysisWidget, setShowAnalysisWidget] = useState(false);
  const [buildingSearchTerm, setBuildingSearchTerm] = useState('');
  
  const { buildings, windows, selectedBuilding, setSelectedBuilding, fetchWindows, startWindowDetection, saveBuilding, isLoading: buildingLoading } = useBuildingData();

  useEffect(() => {
    // Set up the global callback for Google Maps
    window.initMap = initializeMap;
    
    // If Google Maps is already loaded, initialize immediately
    if (window.google?.maps) {
      initializeMap();
    }
  }, []);

  // Handle keyboard events for Ctrl key and Street View escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' && !ctrlPressed) {
        setCtrlPressed(true);
        if (map) {
          map.setOptions({ 
            gestureHandling: 'greedy',
            rotateControl: true,
            tiltControl: true,
            draggable: true,
            scrollwheel: true
          });
          console.log('Rotation mode enabled - Hold Ctrl and drag to rotate/tilt');
        }
      }
      
      // Escape Street View with ESC key
      if (e.key === 'Escape' && showStreetView) {
        disableStreetView();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' && ctrlPressed) {
        setCtrlPressed(false);
        if (map) {
          map.setOptions({ 
            gestureHandling: 'cooperative',
            rotateControl: true,
            tiltControl: true,
            draggable: true,
            scrollwheel: true
          });
          console.log('Rotation mode disabled');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [map, ctrlPressed, showStreetView]);

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
    if (!mapRef.current || !window.google?.maps) {
      console.log('Google Maps not ready yet, retrying...');
      return;
    }

    console.log('Initializing Google Maps with 3D buildings and Street View...');

    // Create map with 3D buildings enabled and proper rotation controls
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: 40.7614, lng: -73.9776 },
      zoom: 18,
      mapTypeId: mapType,
      tilt: 45,
      heading: 0,
      mapId: 'DEMO_MAP_ID',
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: true,
      tiltControl: true,
      fullscreenControl: false,
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

    // Initialize Google Places Autocomplete - with safety check
    if (autocompleteRef.current && window.google?.maps?.places?.Autocomplete) {
      const autocompleteInstance = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
        types: ['establishment', 'geocode'],
        fields: ['place_id', 'geometry', 'name', 'formatted_address']
      });

      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        if (place.geometry && place.geometry.location) {
          mapInstance.setCenter(place.geometry.location);
          mapInstance.setZoom(19);
          setCurrentLocation(place.formatted_address || place.name || '');
          setSearchQuery('');
          console.log('Location selected from autocomplete:', place.name);
        }
      });

      setAutocomplete(autocompleteInstance);
    } else {
      console.warn('Google Places API not available - autocomplete disabled');
    }

    // Add zoom change listener
    mapInstance.addListener('zoom_changed', () => {
      const zoom = mapInstance.getZoom();
      setCurrentZoom(zoom);
      
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
      await handleMapClick(clickedLocation);
    });

    setMap(mapInstance);
    setIsLoading(false);

    console.log('Map initialized successfully with autocomplete and Street View');
  };

  const handleMapClick = async (location: any) => {
    const lat = location.lat();
    const lng = location.lng();
    
    // Check if clicked near an existing building
    const nearbyBuilding = buildings.find(building => {
      const distance = Math.sqrt(
        Math.pow(building.latitude - lat, 2) + Math.pow(building.longitude - lng, 2)
      );
      return distance < 0.001;
    });

    if (nearbyBuilding) {
      await handleBuildingClick(nearbyBuilding);
    } else {
      // Create and save a new building with proper UUID
      try {
        const newBuilding = await saveBuilding({
          name: 'Selected Building',
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          latitude: lat,
          longitude: lng,
          google_place_id: null,
          geometry: null
        });
        
        if (newBuilding) {
          await handleBuildingClick(newBuilding);
        }
      } catch (error) {
        console.error('Error saving new building:', error);
      }
    }
  };

  const handleBuildingClick = async (building: BuildingType) => {
    console.log('Building selected:', building.name);
    
    setSelectedBuilding(building);
    setShowAnalysisWidget(true);
    
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
        radius: 50
      });
    }
    
    // Fetch existing windows first
    await fetchWindows(building.id);
    
    // Start window detection automatically
    await startWindowDetection(building.id);
    
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
    
    windowMarkers.forEach(marker => marker.setMap(null));
    
    if (!showWindows || !selectedBuilding || windows.length === 0) {
      setWindowMarkers([]);
      return;
    }

    const newWindowMarkers = windows.map(windowData => {
      const offsetLat = (windowData.y_coordinate - 50) * 0.00001;
      const offsetLng = (windowData.x_coordinate - 50) * 0.00001;
      
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
        map.setTilt(45);
        
        setCurrentLocation(response.results[0].formatted_address);
        
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

  const handleDetectWindows = () => {
    if (selectedBuilding) {
      startWindowDetection(selectedBuilding.id);
    }
  };

  const filteredBuildings = buildings.filter(building =>
    building.name.toLowerCase().includes(buildingSearchTerm.toLowerCase()) ||
    (building.address && building.address.toLowerCase().includes(buildingSearchTerm.toLowerCase()))
  );

  const avgConfidence = windows.length > 0 ? windows.reduce((sum, w) => sum + (w.confidence || 0), 0) / windows.length : 0;
  const floorCounts = windows.reduce((acc, w) => {
    const floor = w.floor_number || 0;
    acc[floor] = (acc[floor] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Street View Container */}
        <div 
          ref={streetViewRef} 
          className={`absolute inset-0 ${showStreetView ? 'block' : 'hidden'}`}
        />
        
        {/* Street View Exit Button */}
        {showStreetView && (
          <Button
            onClick={disableStreetView}
            className="absolute top-4 left-4 z-20"
            variant="outline"
            size="sm"
          >
            <X className="w-4 h-4 mr-2" />
            Exit Street View
          </Button>
        )}
        
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading 3D Maps...</p>
            </div>
          </div>
        )}

        {/* Streamlined Search Bar */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-3 shadow-lg">
            <Input
              ref={autocompleteRef}
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
              className="bg-transparent border-none text-white placeholder-white/70 focus-visible:ring-0 w-80"
            />
            <Button onClick={searchLocation} size="sm" className="rounded-full bg-white/20 hover:bg-white/30">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Map Controls Toggle */}
        <Button
          onClick={() => setShowMapControls(!showMapControls)}
          className="absolute top-6 right-6 z-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30"
          size="sm"
        >
          <Settings className="w-4 h-4" />
        </Button>

        {/* Map Controls Popup */}
        {showMapControls && (
          <Card className="absolute top-20 right-6 p-4 bg-white/10 backdrop-blur-md border border-white/20 z-10">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-white mb-2">Map Controls</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={zoomIn} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={zoomOut} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={toggle3D} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                    <Move3D className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={resetView} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-white mb-2">Map Type</p>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant={mapType === 'satellite' ? 'default' : 'outline'}
                    onClick={() => handleMapTypeChange('satellite')}
                    className={mapType === 'satellite' ? 'bg-blue-600 text-white' : 'bg-white/20 border-white/30 text-white hover:bg-white/30'}
                  >
                    Satellite
                  </Button>
                  <Button 
                    size="sm" 
                    variant={mapType === 'roadmap' ? 'default' : 'outline'}
                    onClick={() => handleMapTypeChange('roadmap')}
                    className={mapType === 'roadmap' ? 'bg-blue-600 text-white' : 'bg-white/20 border-white/30 text-white hover:bg-white/30'}
                  >
                    Road
                  </Button>
                  <Button 
                    size="sm" 
                    variant={mapType === 'hybrid' ? 'default' : 'outline'}
                    onClick={() => handleMapTypeChange('hybrid')}
                    className={mapType === 'hybrid' ? 'bg-blue-600 text-white' : 'bg-white/20 border-white/30 text-white hover:bg-white/30'}
                  >
                    Hybrid
                  </Button>
                </div>
              </div>

              <div>
                <Button 
                  size="sm" 
                  variant={showStreetView ? 'default' : 'outline'}
                  onClick={() => showStreetView ? disableStreetView() : enableStreetView()}
                  className={showStreetView ? 'bg-blue-600 text-white w-full' : 'bg-white/20 border-white/30 text-white hover:bg-white/30 w-full'}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Street View
                </Button>
              </div>

              {ctrlPressed && (
                <div className="text-xs text-blue-200 bg-blue-500/20 p-2 rounded">
                  Rotation mode active - Drag to rotate/tilt
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Combined Building Controls & Window Analysis Widget */}
        {showAnalysisWidget && (
          <Card className="absolute bottom-6 right-6 p-6 bg-white/10 backdrop-blur-md border border-white/20 max-w-md z-10 shadow-2xl">
            <div className="space-y-4">
              {/* Building Controls Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Building className="w-5 h-5 text-white" />
                  <h3 className="font-semibold text-white">Building Analysis</h3>
                  <Button
                    onClick={() => setShowAnalysisWidget(false)}
                    size="sm"
                    variant="ghost"
                    className="ml-auto text-white hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Building Search */}
                <div className="mb-3">
                  <Input
                    placeholder="Search buildings..."
                    value={buildingSearchTerm}
                    onChange={(e) => setBuildingSearchTerm(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder-white/70 focus-visible:ring-white/50"
                  />
                </div>

                {/* Building List */}
                <div className="space-y-2 max-h-32 overflow-y-auto mb-3">
                  {filteredBuildings.map((building) => (
                    <div
                      key={building.id}
                      className={`p-2 rounded border cursor-pointer transition-colors ${
                        selectedBuilding?.id === building.id
                          ? 'bg-blue-500/30 border-blue-400'
                          : 'hover:bg-white/20 border-white/30'
                      }`}
                      onClick={() => handleBuildingClick(building)}
                    >
                      <div className="font-medium text-sm text-white">{building.name}</div>
                      {building.address && (
                        <div className="text-xs text-white/70 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {building.address}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Detection Controls */}
                {selectedBuilding && (
                  <div className="flex gap-2 mb-4">
                    <Button
                      onClick={handleDetectWindows}
                      disabled={buildingLoading}
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {buildingLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Detect Windows
                    </Button>
                    
                    <Button
                      onClick={() => setShowWindows(!showWindows)}
                      variant={showWindows ? "default" : "outline"}
                      size="sm"
                      className={showWindows ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white/20 border-white/30 text-white hover:bg-white/30'}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Window Analysis Section */}
              {windows.length > 0 && showWindows && (
                <div className="border-t border-white/20 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Grid3X3 className="w-5 h-5 text-green-400" />
                    <h4 className="font-semibold text-white">Window Analysis</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div className="bg-blue-500/20 p-3 rounded">
                      <div className="font-medium text-blue-200">Total Windows</div>
                      <div className="text-xl font-bold text-white">{windows.length}</div>
                    </div>
                    
                    <div className="bg-green-500/20 p-3 rounded">
                      <div className="font-medium text-green-200">Avg Confidence</div>
                      <div className="text-xl font-bold text-white">
                        {(avgConfidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium text-white">Windows by Floor</div>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {Object.entries(floorCounts).map(([floor, count]) => (
                        <div key={floor} className="flex justify-between items-center text-sm">
                          <span className="text-white/80">Floor {floor}</span>
                          <Badge variant="secondary" className="bg-white/20 text-white">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 mt-3">
                    <div className="font-medium text-white">Window Types</div>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(new Set(windows.map(w => w.window_type))).map(type => (
                        <Badge key={type} variant="outline" className="text-xs bg-white/10 border-white/30 text-white">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Location Info */}
        <Card className="absolute bottom-6 left-6 p-3 bg-white/10 backdrop-blur-md border border-white/20">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Current Location:</span>
          </div>
          <p className="text-sm text-white/80 mt-1">{currentLocation}</p>
          <div className="text-xs text-white/60 mt-1">
            Hold Ctrl + drag to rotate • Click buildings to analyze • Press ESC to exit Street View
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MapViewer;
