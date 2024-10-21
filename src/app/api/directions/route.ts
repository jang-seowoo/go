import { NextResponse } from 'next/server';
import axios from 'axios';

interface Destination {
  schoolCode: string;
  location: {
    lng: number;
    lat: number;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const destinations = searchParams.get('destinations');

  if (!origin || !destinations) {
    return NextResponse.json(
      { message: 'Origin and destinations array are required' },
      { status: 400 }
    );
  }

  try {
    const parsedOrigin = JSON.parse(origin);
    const parsedDestinations = JSON.parse(destinations) as Destination[];

    const results = await Promise.all(
      parsedDestinations.map(async (destination: Destination) => {
        const response = await axios.get('https://apis-navi.kakaomobility.com/v1/directions', {
          params: {
            origin: `${parsedOrigin.lng},${parsedOrigin.lat}`,
            destination: `${destination.location.lng},${destination.location.lat}`,
            priority: 'RECOMMEND',
            car_type: '1',
            car_fuel: 'GASOLINE',
          },
          headers: {
            Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
          },
        });

        const route = response.data.routes[0];
        const { distance, duration } = route.summary;

        return {
          schoolCode: destination.schoolCode,
          distance,
          duration,
          route: `자동차 ${Math.floor(duration / 60)}분 소요 예상`
        };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching directions:', error);
    return NextResponse.json(
      { message: 'Failed to fetch directions' },
      { status: 500 }
    );
  }
}

