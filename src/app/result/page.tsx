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
import { Info, RefreshCw} from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const [userVote, setUserVote] = useState<{ school: SchoolCode | null, reason: ReasonCode | null }>({ school: null, reason: null });
  const router = useRouter();

  useEffect(() => {
    const voted = localStorage.getItem('voted');
    const selectedSchool = localStorage.getItem('selectedSchool') as SchoolCode;
    const selectedReason = localStorage.getItem('selectedReason') as ReasonCode;
    
    if (voted && selectedSchool && selectedReason) {
      setUserVote({ school: selectedSchool, reason: selectedReason });
    }
  }, []);

  const handleResetVote = async () => {
    if (!userVote.school || !userVote.reason) return;

    try {
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
    }
  };



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
  



  if (isLoading) {
    return <div className="text-center mt-10">로딩 중...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-700 mb-4">광명시 희망 고등학교</h1>

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

        <div className="bg-white shadow-sm rounded-lg p-4">
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

          {selectedReason !== 'distance' && (
            <div className="mb-6" style={{ height: '300px' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}

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
                  <tr key={school} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="font-medium">{schoolsList[schools.indexOf(school)]}</span>
                          {selectedReason !== 'distance' && (
                            <span className="ml-2 text-xs text-blue-500">
                              {distances[school] ? `${distances[school].toFixed(2)}km` : '계산 중...'}
                            </span>
                          )}
                        </div>
                        <Info
                          className="text-blue-500 cursor-pointer hover:text-blue-700 transition-colors"
                          size={18}
                          onClick={() => setSelectedSchool(school)}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {selectedReason === 'distance' 
                        ? distances[school] ? distances[school].toFixed(2) : '계산 중...'
                        : schoolData[school] || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedSchool && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-3">{schoolsList[schools.indexOf(selectedSchool)]}</h2>
            <Image
              src={`/image/${selectedSchool}.png`}
              alt={`${schoolsList[schools.indexOf(selectedSchool)]} 사진`}
              width={600}
              height={400}
              className="w-full h-40 object-cover mb-3 rounded"
            />
            <p className="text-sm mb-3">{schoolDescriptions[selectedSchool]}</p>
            <div className="flex justify-between items-center">
              <Link href={namuLink[selectedSchool]} passHref className="text-blue-500 text-sm hover:underline">
                더보기 (나무위키)
              </Link>
              <button
                onClick={() => setSelectedSchool(null)}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}