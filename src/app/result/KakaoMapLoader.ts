import { 
  KakaoMap, 
 
  KakaoPolyline, 
  KakaoPolylineOptions,
 
} from './kakaoMapsTypes';

interface Location {
  lat: number;
  lng: number;
}

export class KakaoMapLoader {
  private static instance: KakaoMapLoader;
  private loadPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): KakaoMapLoader {
    if (!KakaoMapLoader.instance) {
      KakaoMapLoader.instance = new KakaoMapLoader();
    }
    return KakaoMapLoader.instance;
  }

  public load(apiKey: string): Promise<void> {
    if (!this.loadPromise) {
      this.loadPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services,clusterer,drawing&autoload=false`;
        
        script.onload = () => {
          console.log('Kakao Maps API script loaded');
          if (window.kakao && window.kakao.maps) {
            console.log('Kakao object exists, calling load function');
            window.kakao.maps.load(() => {
              console.log('Kakao Maps API fully loaded and initialized');
              if (window.kakao.maps.services) {
                console.log('Kakao Maps services are available');
                resolve();
              } else {
                console.error('Kakao Maps services are not available');
                reject(new Error('Kakao Maps services are not available'));
              }
            });
          } else {
            console.error('Kakao Maps object is not available');
            reject(new Error('Kakao Maps object is not available'));
          }
        };
        
        script.onerror = (error) => {
          console.error('Failed to load Kakao Maps API', error);
          reject(new Error('Failed to load Kakao Maps API'));
        };
        
        document.head.appendChild(script);
      });
    }
    return this.loadPromise;
  }

  public drawRoute(map: KakaoMap, origin: Location, destination: Location): void {
    const polylineOptions: KakaoPolylineOptions = {
      path: [
        new window.kakao.maps.LatLng(origin.lat, origin.lng),
        new window.kakao.maps.LatLng(destination.lat, destination.lng)
      ],
      strokeWeight: 5,
      strokeColor: '#DB4455',
      strokeOpacity: 0.7,
      strokeStyle: 'solid'
    };

    const polyline: KakaoPolyline = new window.kakao.maps.Polyline(polylineOptions);
    polyline.setMap(map);
  }
}