'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../globals.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type SchoolData = {
  [key: string]: number;
};

export default function ResultPage() {
  const [selectedReason, setSelectedReason] = useState('all');
  const [schoolData, setSchoolData] = useState<SchoolData>({}); 

  const schoolsList = [
    '광명고등학교', '광명북고등학교', '광문고등학교', '광휘고등학교',
    '명문고등학교', '소하고등학교', '운산고등학교', '진성고등학교',
    '충현고등학교', '경기항공고등학교', '창의경영고등학교'
  ];

  const schools = [
    'gwangmyeong', 'gwangmyeongbuk', 'gwangmun', 'gwanghwi', 'myeongmun',
    'soha', 'unsan', 'jinsung', 'chunghyeon', 'hanggong', 'chang'
  ];

  const reasonsList = [
    { id: 'all', label: '전체' },
    { id: 'traffic', label: '🚌 교통' },
    { id: 'academic', label: '🕹️ 학업' },
    { id: 'grade', label: '💡 내신' },
    { id: 'facility', label: '🏫 시설' },
    { id: 'employment', label: '🏢 취업' },
    { id: 'document', label: '📜 생기부' },
    { id: 'others', label: '기타' }
  ];

  const fetchData = async () => {
    try {
      const docRef = doc(db, 'data', selectedReason);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSchoolData(docSnap.data() as SchoolData); // Type cast the data to SchoolData
      } else {
        console.log('해당 데이터가 없습니다.');
      }
    } catch (error) {
      console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedReason]);

  const sortedSchools = [...schools].sort((a, b) => (schoolData[b] || 0) - (schoolData[a] || 0));

  const chartData = {
    labels: sortedSchools.map(school => schoolsList[schools.indexOf(school)]),
    datasets: [
      {
        label: '투표 수',
        data: sortedSchools.map(school => schoolData[school] || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '학교별 투표 결과',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: '투표 수',
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="bg-white shadow-md rounded-xl p-4 md:p-8 w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-700 mb-6">투표 결과</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* 필터 선택 */}
          <div className="md:w-1/4">
            <div className="flex flex-col gap-2">
              {reasonsList.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  className={`px-3 py-2 text-sm rounded-lg font-semibold shadow transition-all duration-200 hover:scale-102 ${
                    selectedReason === reason.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {reason.label}
                </button>
              ))}
            </div>
          </div>

          {/* 결과 표시 */}
          <div className="md:w-3/4">
            {/* 데이터 표 */}
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순위</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학교</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">투표 수</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedSchools.map((school, index) => (
                    <tr key={school}>
                      <td className="px-4 py-2 whitespace-nowrap">{index + 1}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{schoolsList[schools.indexOf(school)]}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{schoolData[school] || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 차트 */}
            <div className="mt-8">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
