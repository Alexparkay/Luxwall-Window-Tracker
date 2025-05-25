
declare global {
  interface Window {
    google: {
      maps: {
        Map: any;
        Marker: any;
        InfoWindow: any;
        Geocoder: any;
        StreetViewPanorama: any;
        Circle: any;
        Size: any;
        Point: any;
        LatLng: any;
        event: {
          addListener: (instance: any, eventName: string, handler: () => void) => void;
        };
      };
    };
    initMap: () => void;
  }
}

export {};
