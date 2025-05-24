
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Window } from '@/hooks/useBuildingData';
import { Eye, EyeOff, Grid3X3 } from 'lucide-react';

interface WindowDisplayProps {
  windows: Window[];
  visible: boolean;
}

const WindowDisplay: React.FC<WindowDisplayProps> = ({ windows, visible }) => {
  if (!visible || windows.length === 0) return null;

  const avgConfidence = windows.reduce((sum, w) => sum + (w.confidence || 0), 0) / windows.length;
  const floorCounts = windows.reduce((acc, w) => {
    const floor = w.floor_number || 0;
    acc[floor] = (acc[floor] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return (
    <Card className="absolute bottom-20 right-4 p-4 bg-white/95 backdrop-blur max-w-sm z-10">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-800">Window Analysis</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-blue-50 p-2 rounded">
            <div className="font-medium text-blue-800">Total Windows</div>
            <div className="text-xl font-bold text-blue-600">{windows.length}</div>
          </div>
          
          <div className="bg-green-50 p-2 rounded">
            <div className="font-medium text-green-800">Avg Confidence</div>
            <div className="text-xl font-bold text-green-600">
              {(avgConfidence * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="font-medium text-gray-700">Windows by Floor</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {Object.entries(floorCounts).map(([floor, count]) => (
              <div key={floor} className="flex justify-between items-center text-sm">
                <span>Floor {floor}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="font-medium text-gray-700">Window Types</div>
          <div className="flex flex-wrap gap-1">
            {Array.from(new Set(windows.map(w => w.window_type))).map(type => (
              <Badge key={type} variant="outline" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WindowDisplay;
