'use client'

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Image from 'next/image';
import '../globals.css';
import { Info } from 'lucide-react';

import {
  SchoolCode, ReasonCode,
  schoolsList, schools, reasonsList,
  schoolDescriptions, namuLink, Location, schoolLocations
} from '../data/schoolData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type SchoolData = Record<SchoolCode, number>;

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function ResultPage() {
  const [selectedReason, setSelectedReason] = useState<ReasonCode | 'all' | 'distance'>('all');
  const [schoolData, setSchoolData] = useState<SchoolData>({});
  const [selectedSchool, setSelectedSchool] = useState<SchoolCode | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [distances, setDistances] = useState<Record<SchoolCode, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("사용자 위치 불러오기 에러:", error);
        }
      );
    } else {
      console.error("이 브라우저에서 Geolocation이 지원되지 않습니다.");
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      const newDistances: Record<SchoolCode, number> = {};
      Object.entries(schoolLocations).forEach(([school, location]) => {
        newDistances[school as SchoolCode] = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          location.lat,
          location.lng
        );
      });
      setDistances(newDistances);
    }
  }, [userLocation]);

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      if (selectedReason !== 'distance') {
        const docRef = doc(db, 'data', selectedReason);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSchoolData(docSnap.data() as SchoolData);
        } else {
          console.log('해당 데이터가 없습니다.');
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

  const sortedSchools = [...schools].sort((a, b) => {
    if (selectedReason === 'distance') {
      return (distances[a] || 0) - (distances[b] || 0);
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
          weight: 'bold' as 'bold' | 'normal' | 'bolder' | 'lighter' | number,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: '선호도',
          font: {
            size: 14,
            weight: 'bold' as 'bold' | 'normal' | 'bolder' | 'lighter' | number,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: '학교',
          font: {
            size: 14,
            weight: 'bold' as 'bold' | 'normal' | 'bolder' | 'lighter' | number,
          },
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold' as 'bold' | 'normal' | 'bolder' | 'lighter' | number,
          },
        },
      },
    },
  };
  

  const handleCloseModal = () => setSelectedSchool(null);

  if (isLoading) {
    return <div className="text-center mt-10">로딩 중...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="bg-white shadow-md rounded-xl p-4 md:p-8 w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-700 mb-6">광명시 희망 고등학교</h1>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4">
            <div className="grid grid-cols-2 gap-2 md:flex md:flex-col">
              {[...reasonsList, { id: 'distance' as ReasonCode, label: '현재 거리순' }].map((reason, index) => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  className={`px-3 py-2 text-sm rounded-lg font-semibold shadow transition-all duration-200 hover:scale-102 ${
                    selectedReason === reason.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${index === reasonsList.length ? 'col-span-2 md:col-span-1' : ''}`}
                >
                  {reason.label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:w-3/4">
            {selectedReason !== 'distance' && (
              <div className="mt-8 mb-8" style={{ height: '500px' }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            )}

            <div className="overflow-x-auto mb-8">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학교</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {selectedReason === 'distance' ? '거리 (km)' : '선호도'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedSchools.map((school) => (
                    <tr key={school}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center justify-between">
                          <div>
                            {schoolsList[schools.indexOf(school)]}
                            {selectedReason !== 'distance' && (
                              <span className="ml-2 text-xs text-blue-500">
                                거리: {distances[school] ? distances[school].toFixed(2) : '계산 중...'}km
                                <span className="relative group inline-block">
                                  <span className="cursor-help ml-1 text-gray-400">&#9432;</span>
                                  <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 -mt-2 ml-2">
                                    정확하지 않을 수 있습니다
                                  </span>
                                </span>
                              </span>
                            )}
                          </div>
                          <Info
                            className="text-blue-600 cursor-pointer hover:text-blue-800 transition-colors duration-200"
                            size={20}
                            onClick={() => setSelectedSchool(school)}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {selectedReason === 'distance' 
                          ? distances[school] ? distances[school].toFixed(2) : '계산 중...'
                          : schoolData[school] || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-gray-500 mt-4 text-center">
              {selectedReason === 'distance' 
                ? '이 결과는 현재 위치에서 각 학교까지의 대략적인 거리를 나타냅니다.' 
                : '이 결과는 선택된 이유에 따라 집계된 학교 선호도를 나타냅니다.'}
              더 많은 정보는 학교 이름 옆의 정보 아이콘을 클릭하세요.
            </p>
          </div>
        </div>
      </div>

      {selectedSchool && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 md:w-2/3 lg:w-1/2 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">{schoolsList[schools.indexOf(selectedSchool)]}</h2>
            <Image
              src={`/image/${selectedSchool}.png`}
              alt={`${schoolsList[schools.indexOf(selectedSchool)]} 사진`}
              width={600}
              height={500}
              className="w-full h-48 object-cover mb-4 rounded"
            />
      
            <p className="text-sm mb-4">{schoolDescriptions[selectedSchool]}</p>
      
            <h3 className="text-xs text-blue-800 mb-3">
              정보는 모두 나무위키에서 가져왔으며, 수정할 부분이나 학교 관계자 중 불편한 내용이 있을 시 인스타그램 @wxstw_ 으로 문의주세요.
            </h3>
      
            <div className="mb-4 text-xs">
              <Link href={namuLink[selectedSchool]} passHref className="text-blue-500 text-sm hover:underline transition duration-200">
                더보기 (나무위키 이동)
              </Link>
            </div>

            <button
              onClick={handleCloseModal}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded transition duration-200 hover:bg-red-600"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}