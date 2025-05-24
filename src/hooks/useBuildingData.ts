
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Building {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  google_place_id: string | null;
  geometry: any;
}

export interface Window {
  id: string;
  building_id: string;
  x_coordinate: number;
  y_coordinate: number;
  z_coordinate: number | null;
  width: number | null;
  height: number | null;
  confidence: number | null;
  floor_number: number | null;
  window_type: string | null;
}

export interface DetectionSession {
  id: string;
  building_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_windows: number | null;
  processing_time: string | null;
  created_at: string;
  completed_at: string | null;
}

export const useBuildingData = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [windows, setWindows] = useState<Window[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch buildings
  const fetchBuildings = async () => {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBuildings(data || []);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch buildings",
        variant: "destructive",
      });
    }
  };

  // Fetch windows for a specific building
  const fetchWindows = async (buildingId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('windows')
        .select('*')
        .eq('building_id', buildingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWindows(data || []);
    } catch (error) {
      console.error('Error fetching windows:', error);
      toast({
        title: "Error",
        description: "Failed to fetch windows",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save a new building
  const saveBuilding = async (buildingData: Omit<Building, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .insert([buildingData])
        .select()
        .single();

      if (error) throw error;
      
      setBuildings(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Building saved successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error saving building:', error);
      toast({
        title: "Error",
        description: "Failed to save building",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Start window detection (mock implementation)
  const startWindowDetection = async (buildingId: string) => {
    try {
      setIsLoading(true);
      
      // Create detection session
      const { data: session, error: sessionError } = await supabase
        .from('detection_sessions')
        .insert([{
          building_id: buildingId,
          status: 'processing'
        }])
        .select()
        .single();

      if (sessionError) throw sessionError;

      toast({
        title: "Detection Started",
        description: "Window detection is processing...",
      });

      // Simulate window detection with mock data
      setTimeout(async () => {
        try {
          // Generate mock windows for demonstration
          const mockWindows = generateMockWindows(buildingId);
          
          // Save mock windows
          const { error: windowsError } = await supabase
            .from('windows')
            .insert(mockWindows);

          if (windowsError) throw windowsError;

          // Update session
          await supabase
            .from('detection_sessions')
            .update({
              status: 'completed',
              total_windows: mockWindows.length,
              completed_at: new Date().toISOString()
            })
            .eq('id', session.id);

          // Refresh windows data
          await fetchWindows(buildingId);
          
          toast({
            title: "Detection Complete",
            description: `Found ${mockWindows.length} windows`,
          });
        } catch (error) {
          console.error('Error in detection process:', error);
          await supabase
            .from('detection_sessions')
            .update({ status: 'failed' })
            .eq('id', session.id);
        } finally {
          setIsLoading(false);
        }
      }, 3000);

    } catch (error) {
      console.error('Error starting detection:', error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to start window detection",
        variant: "destructive",
      });
    }
  };

  // Generate mock windows for demonstration
  const generateMockWindows = (buildingId: string) => {
    const windows = [];
    const numWindows = Math.floor(Math.random() * 20) + 10; // 10-30 windows
    
    for (let i = 0; i < numWindows; i++) {
      windows.push({
        building_id: buildingId,
        x_coordinate: Math.random() * 100,
        y_coordinate: Math.random() * 100,
        z_coordinate: Math.random() * 50,
        width: Math.random() * 3 + 1, // 1-4 meters
        height: Math.random() * 2 + 1, // 1-3 meters
        confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
        floor_number: Math.floor(Math.random() * 10) + 1,
        window_type: ['standard', 'bay', 'dormer'][Math.floor(Math.random() * 3)]
      });
    }
    
    return windows;
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  return {
    buildings,
    windows,
    selectedBuilding,
    isLoading,
    setSelectedBuilding,
    fetchBuildings,
    fetchWindows,
    saveBuilding,
    startWindowDetection
  };
};
