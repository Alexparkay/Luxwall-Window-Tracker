
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Building2, 
  Search, 
  Eye, 
  Play,
  Loader2,
  MapPin
} from 'lucide-react';
import { Building, useBuildingData } from '@/hooks/useBuildingData';

interface BuildingControlsProps {
  onBuildingSelect: (building: Building) => void;
  onShowWindows: (show: boolean) => void;
  showWindows: boolean;
}

const BuildingControls: React.FC<BuildingControlsProps> = ({
  onBuildingSelect,
  onShowWindows,
  showWindows
}) => {
  const {
    buildings,
    windows,
    selectedBuilding,
    isLoading,
    setSelectedBuilding,
    fetchWindows,
    saveBuilding,
    startWindowDetection
  } = useBuildingData();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredBuildings = buildings.filter(building =>
    building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (building.address && building.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleBuildingSelect = async (building: Building) => {
    setSelectedBuilding(building);
    onBuildingSelect(building);
    await fetchWindows(building.id);
  };

  const handleDetectWindows = () => {
    if (selectedBuilding) {
      startWindowDetection(selectedBuilding.id);
    }
  };

  const handleSaveCurrentLocation = async (location: { lat: number; lng: number; name: string; address: string }) => {
    try {
      const newBuilding = await saveBuilding({
        name: location.name,
        address: location.address,
        latitude: location.lat,
        longitude: location.lng,
        google_place_id: null,
        geometry: null
      });
      
      if (newBuilding) {
        handleBuildingSelect(newBuilding);
      }
    } catch (error) {
      console.error('Error saving building:', error);
    }
  };

  return (
    <Card className="absolute top-20 left-4 p-4 bg-white/95 backdrop-blur max-w-sm z-10">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Building Controls</h3>
        </div>

        {/* Search Buildings */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Search Buildings</label>
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button size="sm" variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Building List */}
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {filteredBuildings.map((building) => (
            <div
              key={building.id}
              className={`p-2 rounded border cursor-pointer transition-colors ${
                selectedBuilding?.id === building.id
                  ? 'bg-blue-100 border-blue-300'
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
              onClick={() => handleBuildingSelect(building)}
            >
              <div className="font-medium text-sm">{building.name}</div>
              {building.address && (
                <div className="text-xs text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {building.address}
                </div>
              )}
            </div>
          ))}
          
          {filteredBuildings.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4">
              No buildings found
            </div>
          )}
        </div>

        {/* Controls */}
        {selectedBuilding && (
          <div className="space-y-3 pt-3 border-t">
            <div className="text-sm font-medium text-gray-700">
              Selected: {selectedBuilding.name}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleDetectWindows}
                disabled={isLoading}
                size="sm"
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Detect Windows
              </Button>
              
              <Button
                onClick={() => onShowWindows(!showWindows)}
                variant={showWindows ? "default" : "outline"}
                size="sm"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>

            {windows.length > 0 && (
              <div className="text-sm text-gray-600">
                {windows.length} windows detected
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default BuildingControls;
