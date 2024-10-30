export interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

export interface KakaoMap {
  setCenter(latlng: KakaoLatLng): void;
  
}

export interface KakaoMarker {
  setMap(map: KakaoMap | null): void;
}

export interface KakaoPolyline {
  setMap(map: KakaoMap | null): void;
}

export interface KakaoMarkerImage {
  readonly markerImage: unknown;
}

export interface KakaoServices {
  Geocoder: new () => {
    addressSearch(
      address: string,
      callback: (
        result: Array<{
          address_name: string;
          x: string;
          y: string;
        }>,
        status: string
      ) => void
    ): void;
  };
  
}

export interface KakaoMaps {
  load(callback: () => void): void;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap;
  Marker: new (options: KakaoMarkerOptions) => KakaoMarker;
  Polyline: new (options: KakaoPolylineOptions) => KakaoPolyline;
  MarkerImage: new (src: string, size: KakaoSize, options?: KakaoMarkerImageOptions) => KakaoMarkerImage;
  Size: new (width: number, height: number) => KakaoSize;
  Point: new (x: number, y: number) => KakaoPoint;
  services: KakaoServices;
}

export interface KakaoMapOptions {
  center: KakaoLatLng;
  level: number;
}

export interface KakaoMarkerOptions {
  map?: KakaoMap;
  position: KakaoLatLng;
  title?: string;
  image?: KakaoMarkerImage;
}

export interface KakaoPolylineOptions {
  path: KakaoLatLng[];
  strokeWeight: number;
  strokeColor: string;
  strokeOpacity: number;
  strokeStyle: string;
}

export interface KakaoSize {
  width: number;
  height: number;
}

export interface KakaoPoint {
  x: number;
  y: number;
}

export interface KakaoMarkerImageOptions {
  offset?: KakaoPoint;
}

declare global {
  interface Window {
    kakao: {
      maps: KakaoMaps;
    };
  }
}