//result/page.tsx

'use client'

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Image from 'next/image';
import '../globals.css';
import { Info, RefreshCw, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { KakaoMapLoader } from './KakaoMapLoader';
import { KakaoMap, KakaoMapOptions } from './kakaoMapsTypes';

import {
  SchoolCode,
  ReasonCode,
  schoolsList,
  schools,
  reasonsList,
  schoolDescriptions,
  namuLink,
  Location,
  schoolLocations
} from '../data/schoolData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type SchoolData = Record<SchoolCode, number>;

interface SchoolDistance {
  schoolCode: SchoolCode;
  distance: number;
  duration: number;
  route: string;
}

   

export default function ResultPage() {
  const [selectedReason, setSelectedReason] = useState<ReasonCode | 'all' | 'distance'>('all');
  const [schoolData, setSchoolData] = useState<SchoolData>({});
  const [selectedSchool, setSelectedSchool] = useState<SchoolCode | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [schoolDistances, setSchoolDistances] = useState<SchoolDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userVote, setUserVote] = useState<{ school: SchoolCode | null, reason: ReasonCode | null }>({ school: null, reason: null });
  const [kakaoLoaded, setKakaoLoaded] = useState(false);
  const [isLocationReady, setIsLocationReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedVote = localStorage.getItem('voted');
    const savedSchool = localStorage.getItem('selectedSchool') as SchoolCode;
    const savedReason = localStorage.getItem('selectedReason') as ReasonCode;
    if (savedVote && savedSchool && savedReason) {
      setUserVote({ school: savedSchool, reason: savedReason });
    }
  }, []);

  const calculateDistances = useCallback(async () => {
    if (!userLocation) {
      console.log('User location not available');
      return;
    }

    try {
      const queryParams = new URLSearchParams({
        origin: JSON.stringify(userLocation),
        destinations: JSON.stringify(
          Object.entries(schoolLocations).map(([schoolCode, location]) => ({
            schoolCode,
            location,
          }))
        ), 
      });
            
      const response = await fetch(`/api/directions?${queryParams.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch distances');
      }

      const distances = await response.json();
      setSchoolDistances(distances);
      setIsLoading(false);
    } catch (error) {
      console.error('Error calculating distances:', error);
      setIsLoading(false);
    }
  }, [userLocation]);

  // 카카오맵 API 초기화
  useEffect(() => {
    const initializeKakaoMaps = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_KAKAOMAP_API;
        if (!apiKey) {
          throw new Error('KAKAOMAP_API key is not defined');
        }
        
        await KakaoMapLoader.getInstance().load(apiKey);
        setKakaoLoaded(true);
      } catch (error) {
        console.error('Failed to initialize Kakao Maps:', error);
      }
    };

    initializeKakaoMaps();
    getUserLocation();
  }, []);

  
// 위치 정보 가져오기
const getUserLocation = (): Promise<Location> => {
  return new Promise<Location>((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          resolve(location);
        },
        (error) => {
          console.error("Error getting user location:", error);
          alert("이 브라우저에서는 거리 기능을 이용할 수 없습니다.");
          reject(error); 
        }
      );
    } else {
      console.error("Geolocation is not supported");
      alert("이 브라우저에서는 거리 기능을 이용할 수 없습니다.");
      reject(new Error("Geolocation not supported")); 
    }
  });
};


  useEffect(() => {
    const initializeLocationAndMap = async () => {
      const location = await getUserLocation();
      setUserLocation(location);
      setIsLocationReady(true);
    };
  
    initializeLocationAndMap();
  }, []); 

  // 거리 계산 트리거
  useEffect(() => {
    if (kakaoLoaded && isLocationReady && userLocation) {
      calculateDistances();
    }
  }, [kakaoLoaded, isLocationReady, userLocation, calculateDistances]);

  

  // 지도 초기화 함수
  const initializeMap = useCallback((school: SchoolCode) => {
    if (!kakaoLoaded || !userLocation) return;
  
    const schoolLocation = schoolLocations[school];
    const container = document.getElementById('kakaoMap');
    
    if (!container) return;
  
    const options: KakaoMapOptions = {
      center: new window.kakao.maps.LatLng(
        (userLocation.lat + schoolLocation.lat) / 2,
        (userLocation.lng + schoolLocation.lng) / 2
      ),
      level: 7
    };
  
    const map: KakaoMap = new window.kakao.maps.Map(container, options);
  
    // 출발지 마커
    new window.kakao.maps.Marker({
      map: map,
      position: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
      title: '현재 위치',
      image: new window.kakao.maps.MarkerImage(
        '/image/start-marker.png',
        new window.kakao.maps.Size(35, 35),
        { offset: new window.kakao.maps.Point(17, 35) }
      )
    });
  
    // 도착지 마커
    new window.kakao.maps.Marker({
      map: map,
      position: new window.kakao.maps.LatLng(schoolLocation.lat, schoolLocation.lng),
      title: schoolsList[schools.indexOf(school)],
      image: new window.kakao.maps.MarkerImage(
        '/image/school-marker.png',
        new window.kakao.maps.Size(35, 35),
        { offset: new window.kakao.maps.Point(17, 35) }
      )
    });
  
    // 경로 그리기
    KakaoMapLoader.getInstance().drawRoute(map, userLocation, schoolLocation);
  }, [kakaoLoaded, userLocation]);

  //firebase 불러오기
  const fetchData = useCallback(async (): Promise<void> => {
    try {
      if (selectedReason !== 'distance') {
        const docRef = doc(db, 'data', selectedReason);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSchoolData(docSnap.data() as SchoolData);
        }
      }
    } catch (error) {
      console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedReason]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 모달 열릴 때 지도 초기화
  useEffect(() => {
    if (selectedSchool) {
      initializeMap(selectedSchool);
    }
  }, [selectedSchool, initializeMap]);

  const handleResetVote = async () => {
    if (!userVote.school || !userVote.reason) return;
  
    try {
      setIsLoading(true);
  
      const allDocRef = doc(db, "data", "all");
      await updateDoc(allDocRef, {
        [userVote.school]: increment(-1),
      });
  
      const reasonDocRef = doc(db, "data", userVote.reason);
      await updateDoc(reasonDocRef, {
        [userVote.school]: increment(-1),
      });
  
      localStorage.removeItem('voted');
      localStorage.removeItem('selectedSchool');
      localStorage.removeItem('selectedReason');
  
      router.push('/');
    } catch (error) {
      console.error('투표 재설정 중 오류가 발생했습니다:', error);
      alert('투표 재설정 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const sortedSchools = [...schools].sort((a, b) => {
    if (selectedReason === 'distance') {
      const distanceA = schoolDistances.find(sd => sd.schoolCode === a)?.distance || Infinity;
      const distanceB = schoolDistances.find(sd => sd.schoolCode === b)?.distance || Infinity;
      return distanceA - distanceB;
    }
    return (schoolData[b] || 0) - (schoolData[a] || 0);
  });

  const abbreviateSchoolName = (name: string) => {
    return name.replace(/고등학교$/, '고');
  };
  const chartData = {
    labels: sortedSchools.map((school) => abbreviateSchoolName(schoolsList[schools.indexOf(school)])),
    datasets: [
      {
        label: '수',
        data: sortedSchools.map((school) => schoolData[school] || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '학교별 선호도',
        font: {
          size: 18,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: '선호도',
        },
      },
    },
  };

  if (isLoading) {
    return <div className="text-center mt-10">로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-700 mb-4">광명시 희망 고등학교</h1>

        {/*사용자 선택 */}
        <div className="bg-white shadow-sm rounded-lg p-4 mb-4 flex flex-wrap items-center justify-between">
          {userVote.school && userVote.reason ? (
            <>
              <div className="flex-grow mr-4">
                <span className="font-semibold">내 선택:</span>
                <span className="ml-2">{schoolsList[schools.indexOf(userVote.school)]}</span>
                <span className="mx-2">|</span>
                <span>{reasonsList.find(r => r.id === userVote.reason)?.label}</span>
              </div>
              <button
                onClick={handleResetVote}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm flex items-center hover:bg-gray-300 transition-colors"
              >
                <RefreshCw size={14} className="mr-1" />
                재설정
              </button>
            </>
          ) : (
            <p className="text-gray-500">아직 선택하지 않았습니다.</p>
          )}
        </div>

        {/* 메인 */}
        <div className="bg-white shadow-sm rounded-lg p-4">
          {/* 이유 선택 버튼 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[...reasonsList, { id: 'distance' as ReasonCode, label: '현재 거리순' }].map((reason) => (
              <button
                key={reason.id}
                onClick={() => setSelectedReason(reason.id)}
                className={`px-3 py-1 text-sm rounded-full font-medium transition-colors ${
                  selectedReason === reason.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {reason.label}
              </button>
            ))}
          </div>

          {/* 차트 */}
          {selectedReason !== 'distance' && (
            <div className="mb-6" style={{ height: '300px' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}

          {/* 학교 리스트 */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학교</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {selectedReason === 'distance' ? '거리 (km)' : '선호도'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedSchools.map((school) => (
                    <tr key={school} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{schoolsList[schools.indexOf(school)]}</span>
                            {selectedReason !== 'distance' && (
                              <span className="text-xs text-blue-500">
                                {schoolDistances.find(sd => sd.schoolCode === school)?.distance
                                  ? `${(schoolDistances.find(sd => sd.schoolCode === school)!.distance / 1000).toFixed(2)}km`
                                  : '거리 정보 없음'}
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => setSelectedSchool(school)}
                            className="text-blue-500 hover:text-blue-700 transition-colors focus:outline-none"
                          >
                            <Info size={18} />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {selectedReason === 'distance' 
                          ? schoolDistances.find(sd => sd.schoolCode === school)?.distance
                            ? `${(schoolDistances.find(sd => sd.schoolCode === school)!.distance / 1000).toFixed(2)}`
                            : '거리 정보 없음'
                          : schoolData[school] || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
                {/* 학교 설명 모달 */}
                {selectedSchool && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - 학교설명 */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">{schoolsList[schools.indexOf(selectedSchool)]}</h2>
                  <Image
                    src={`/image/${selectedSchool}.png`}
                    alt={`${schoolsList[schools.indexOf(selectedSchool)]} 사진`}
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover mb-4 rounded-lg shadow-md"
                  />
                  <div className="space-y-3">
                    <p className="text-gray-700">{schoolDescriptions[selectedSchool]}</p>
                    {schoolDistances.find(sd => sd.schoolCode === selectedSchool) && (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex items-center text-gray-700">
                          <MapPin size={16} className="mr-2" />
                          <span>거리: {(schoolDistances.find(sd => sd.schoolCode === selectedSchool)!.distance / 1000).toFixed(2)}km</span>
                        </div>
                        <p className="text-gray-700">소요 시간: {Math.floor(schoolDistances.find(sd => sd.schoolCode === selectedSchool)!.duration / 60)}분</p>
                        
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - 지도 */}
                <div className="h-full">
                  <div 
                    id="kakaoMap" 
                    className="w-full h-[400px] rounded-lg shadow-md"
                  ></div>
                </div>
              </div>

              {/* 하단 */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <Link 
                  href={namuLink[selectedSchool]} 
                  target="_blank"
                  className="text-blue-500 hover:text-blue-700 flex items-center transition-colors"
                >
                  <Info size={16} className="mr-1" />
                  더보기 (나무위키)
                </Link>
                <button
                  onClick={() => setSelectedSchool(null)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}