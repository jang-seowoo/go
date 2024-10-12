'use client'


import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Image from 'next/image';
import '../globals.css';

import {
  SchoolCode, ReasonCode,
  schoolsList, schools,reasonsList,
  schoolDescriptions, namuLink, Location, schoolLocations
} from '../data/schoolData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type SchoolData = Record<SchoolCode, number>;

// 거리 계산 함수
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 지구의 반경 (km)
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
  const [selectedReason, setSelectedReason] = useState<ReasonCode | 'all'>('all');
  const [schoolData, setSchoolData] = useState<SchoolData>({});
  const [selectedSchool, setSelectedSchool] = useState<SchoolCode | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [distances, setDistances] = useState<Record<SchoolCode, number>>({});

  // 사용자 위치 가져오기
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

  // 거리 계산
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
      const docRef = doc(db, 'data', selectedReason);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSchoolData(docSnap.data() as SchoolData);
      } else {
        console.log('해당 데이터가 없습니다.');
      }
    } catch (error) {
      console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
    }
  }, [selectedReason]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sortedSchools = [...schools].sort((a, b) => (schoolData[b] || 0) - (schoolData[a] || 0));

  const chartData = {
    labels: sortedSchools.map((school) => schoolsList[schools.indexOf(school)]),
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
        text: '그래프',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: '수',
        },
      },
      y: {
        title: {
          display: true,
          text: '학교',
        },
      },
    },
  };

  const handleCloseModal = () => setSelectedSchool(null);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="bg-white shadow-md rounded-xl p-4 md:p-8 w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-700 mb-6">광명시 희망 고등학교</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* 필터 선택 */}
          <div className="md:w-1/4">
            <div className="grid grid-cols-2 gap-2 md:flex md:flex-col">
              {reasonsList.map((reason, index) => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  className={`px-3 py-2 text-sm rounded-lg font-semibold shadow transition-all duration-200 hover:scale-102 ${
                    selectedReason === reason.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${index === reasonsList.length - 1 ? 'col-span-2 md:col-span-1' : ''}`}
                >
                  {reason.label}
                </button>
              ))}
            </div>
          </div>

          {/* 결과 표시 */}
          <div className="md:w-3/4">
            {/* 차트 */}
            <div className="mt-8 mb-8" style={{ height: '500px' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>

            {/* 데이터 표 */}
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학교</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">선호도</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상세보기</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedSchools.map((school) => (
                    <tr key={school}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {schoolsList[schools.indexOf(school)]}
                        <span className="ml-2 text-xs text-blue-500">
                          거리: {distances[school] ? distances[school].toFixed(2) : '계산 중...'}km
                          <span className="relative group inline-block">
                            <span className="cursor-help ml-1 text-gray-400">&#9432;</span>
                            <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 -mt-2 ml-2">
                              정확하지 않을 수 있습니다
                            </span>
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">{schoolData[school] || 0}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span
                          onClick={() => setSelectedSchool(school)}
                          className="text-blue-600 hover:underline cursor-pointer transition duration-300 transform hover:scale-105 flex items-center"
                        >
                          <i className="fas fa-info-circle mr-2"></i>
                          학교 정보
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 설명 문구 */}
            <p className="text-sm text-gray-500 mt-4 text-center">
              이 결과는 선택된 이유에 따라 집계된 학교 선호도를 나타냅니다. 더 많은 정보는 학교 정보 버튼을 통해 확인하세요.
            </p>
          </div>
        </div>
      </div>
      {/* 모달 */}
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