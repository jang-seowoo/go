'use client';

import Link from 'next/link';
import React, { useEffect, useState, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Image from 'next/image'; // Next.js Image 컴포넌트 사용
import '../globals.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type SchoolData = {
  [key: string]: number;
};

type SchoolDescriptions = {
  [key: string]: string;
};

type NamuLink = {
  [key: string]: string;
};


const schoolLocations = {
  gwangmyeong: { lat: 37.47857117, lng: 126.8659896 },
  gwangmyeongbuk: { lat: 37.487906, lng: 126.8679386 },
  gwangmun: { lat: 37.46462137, lng: 126.8495912 },
  gwanghwi: { lat: 37.4290157, lng: 126.8818263 },
  myeongmun: { lat: 37.47057166, lng: 126.8498885 },
  soha: { lat: 37.44724606, lng: 126.8875821 },
  unsan: { lat: 37.45431392, lng: 126.8833501 },
  jinsung: { lat: 37.46950279, lng: 126.8767614},
  chunghyeon: { lat: 37.43295996, lng: 126.8845281 },
  hanggong: { lat: 37.47331347, lng: 126.8570351 },
  chang: { lat: 37.4383574, lng: 126.8821568 }
};

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
  const [selectedReason, setSelectedReason] = useState<string>('all');
  const [schoolData, setSchoolData] = useState<SchoolData>({});
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null); // 선택한 학교

  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [distances, setDistances] = useState<{[key: string]: number}>({});

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
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  // 거리 계산
  useEffect(() => {
    if (userLocation) {
      const newDistances: {[key: string]: number} = {};
      Object.entries(schoolLocations).forEach(([school, location]) => {
        newDistances[school] = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          location.lat,
          location.lng
        );
      });
      setDistances(newDistances);
    }
  }, [userLocation]);


  const schoolsList: string[] = [
    '광명고등학교', '광명북고등학교', '광문고등학교', '광휘고등학교',
    '명문고등학교', '소하고등학교', '운산고등학교', '진성고등학교',
    '충현고등학교', '경기항공고등학교', '창의경영고등학교'
  ];

  const schools: string[] = [
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

  const schoolDescriptions: SchoolDescriptions = {
    gwangmyeong: '경기도 광명시 철산동에 위치한 남녀공학 공립 일반계 고등학교로, 광명시 관내 고등학교 중에서는 가장 오래된 학교이다. 1974년 11월 29일에 광명고등학교 설립 인가를 받고 1975년 3월 1일에 지금의 광명동초등학교 자리에 개교했다. 이후 1978년 2월 20일에 제1회 졸업생을 배출하였다. 1983년 5월 14일에 현재 자리로 이전하였고, 2001년부터 남녀 공학으로 첫 입학생을 받았다.',
    gwangmyeongbuk: '경기도 광명시에 위치한 공립 고등학교다. 광명시 북쪽에 있어서 광명북고등학교이다. 실제로 광명시 고등학교 중 가장 북쪽에 위치하고 있다. 바로 옆에 광명북중학교가 있으며 맞은편에 광명북초등학교가 있다. 서울시계에서 불과 400m도 되지 않는다. 위치상으로는 광명의 중심지에서 떨어져 있는 변두리라고 할 수 있다. 가장 가까운 번화가인 철산상업지구가 걸어서 15분 정도이다.',
    gwangmun: "경기도 광명시 광명동에 위치한 공립 일반계 고등학교이다. 2023년 기준으로 1학년 11학급, 2학년 11학급, 3학년 11학급으로 구성되어있다. 광명시 내에서 교육과정 클러스터를 하는 세 학교 광문고등학교, 광명북고등학교, 명문고등학교 중 하나이다. 광문고등학교는 사회(국제경제)로 교육과정 클러스터를 한다고 한다.",
    gwanghwi: "2013년 3월 1일 설립된 대한민국 경기도 광명시에 위치한 일반계 단설 공립 고등학교이다. 추구하는 학교상은 학생에게는 삶 속에서 세상을 키울 수 있도록 도와주는 학교, 교사에게는 정성을 다해 연구하고 가르치며 학생과 더불어 성장하는 학교, 학부모에게는 참여 협육을 통해 교육의 질을 함께 높이고 그 결과에 대해 만족할 수 있는 학교, 지역 사회에서는 공교육 혁신의 모델로 신망받는 학교이다.",
    myeongmun: "경기도 광명시 광명6동에 위치한 공립 고등학교이다. 1975년 광명여자고등학교로 설립 인가를 받고 1976년 3월 3일 개교하였다. 그러다 2003년에 남녀 공학으로 개편 승인을 받았고 2004년 1월에 명문고등학교로 교명을 변경하였다. 시험이 쉬워서 다 같이 잘 보는 경우도 많다. 1학년 수학 만점자가 20명을 넘어간 적도 있다고 한다.",
    soha: "경기도 광명시 소하1동에 위치한 공립 고등학교이다. 광명시가 단일 학군이라 소하동뿐만 아니라 하안, 일직, 철산동에서도 통학하는 학생들이 있다. 광명 소재 타 고등학교와 조금 다른 점이 존재한다면 소하고등학교는 외국어 중점 학교이다. 이에 소하고등학교는 과학탐구, 사회탐구 계열 이외에 국제화 중점이 있다.",
    unsan: '경기도 광명시에 개교한 일반계 고등학교이다. 2011년 개교하였으며, 경기도 교육청 지정 혁신학교로, 대학수학능력시험 위주의 제한적인 커리큘럼에서 벗어나 창의적이고 학생 주도적인 학교 시스템과 수업을 만들어 나가고 있는 학교다. 교육혁신을 다방면으로 시도하고 있다. 다만 혁신학교에 대해 불호거나 일반 인문계 학교로 생각한 학생이 온다면 힘들 수도 있다고 한다. 2011년 개교부터 남녀공학이었으며, 개교한 뒤로 쭉 합반이었다. 혁신학교 답게 학생들에게 많은 자유를 주고 있으며, 학생이 학교의 주인이라는 인식을 가지고 있다. 학생들에게 주어진 자유가 상당히 많다. 수업시간에 스마트폰을 내지 않고, 염색도 아무런 제한이 없다.',
    jinsung: "경기도 광명시 철망산로 84(하안동)에 위치한 사립 일반계 기숙사 고등학교이다.  학교에 프로그램이 많아 학종으로 가려는 학생들에게 적합해 학종의 실적이 좋다. 과고 영재고 자사고 국제고 외고를 떨어진 학생들이 잔뜩 와서 내신은 피튀긴다. 하지만 그만큼 9지망으로 온 학생들도 많아서 내신 양극화가 심한 편이다. 단, 수학 시험이 상당히 어려워 수학 성적이 잘 나오지 않는다.",
    chunghyeon: '경기도 광명시 소하2동에 위치한 일반계 고등학교인 동시에 예술중점고등학교이다. 보통학교는 급식실이 하나이고 각자학교의 기준(예를 들어 학년순으로 먹는다던지)에 의해 순서대로 급식을 받는데 이 학교는 학년별로 급식실이 따로 있다. 시험이 쉬운 편이라 내신 따기에 좋다고 한다. ',
    hanggong: "경기도 광명시 광명7동에 위치한 사립 특성화 고등학교로 2017년 산학일체형 도제학교로 지정되었다. 2020년부터 교명이 경기항공고등학교로 변경되었다. 학과: 항공전기전자과, 항공영상미디어과, 로봇자동화과, 인테리어리모델링과",
    chang: "경기도 광명시 소하2동에 위치한 공립 특성화고등학교이다. 스마트회계, 스마트it, 인플루언서 마케팅, 스포츠 경영, 관광경영, 콘텐츠디자인 과로 나뉜다"
  };

  const namuLink: NamuLink = {
    gwangmyeong: "https://namu.wiki/w/%EA%B4%91%EB%AA%85%EA%B3%A0%EB%93%B1%ED%95%99%EA%B5%90(%EA%B2%BD%EA%B8%B0)",
    gwangmyeongbuk: "https://namu.wiki/w/%EA%B4%91%EB%AA%85%EB%B6%81%EA%B3%A0%EB%93%B1%ED%95%99%EA%B5%90",
    gwangmun: "https://namu.wiki/w/%EA%B4%91%EB%AC%B8%EA%B3%A0%EB%93%B1%ED%95%99%EA%B5%90",
    gwanghwi: "https://namu.wiki/w/%EA%B4%91%ED%9C%98%EA%B3%A0%EB%93%B1%ED%95%99%EA%B5%90",
    myeongmun: 'https://namu.wiki/w/%EB%AA%85%EB%AC%B8%EA%B3%A0%EB%93%B1%ED%95%99%EA%B5%90',
    soha: 'https://namu.wiki/w/%EC%86%8C%ED%95%98%EA%B3%A0%EB%93%B1%ED%95%99%EA%B5%90',
    unsan: 'https://namu.wiki/w/%EC%9A%B4%EC%82%B0%EA%B3%A0%EB%93%B1%ED%95%99%EA%B5%90',
    jinsung: 'https://namu.wiki/w/%EC%A7%84%EC%84%B1%EA%B3%A0%EB%93%B1%ED%95%99%EA%B5%90',
    chunghyeon: 'https://namu.wiki/w/%EC%B6%A9%ED%98%84%EA%B3%A0%EB%93%B1%ED%95%99%EA%B5%90',
    hanggong: 'https://namu.wiki/w/%EA%B2%BD%EA%B8%B0%ED%95%AD%EA%B3%B5%EA%B3%A0%EB%93%B1%ED%95%99%EA%B5%90',
    chang: 'https://namu.wiki/w/%EC%B0%BD%EC%9D%98%EA%B2%BD%EC%98%81%EA%B3%A0%EB%93%B1%ED%95%99%EA%B5%90',
  }




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
                    
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학교</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">거리 (km)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상세보기</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedSchools.map((school) => (
                    <tr key={school}>
                      
                      <td className="px-4 py-2 whitespace-nowrap">{schoolsList[schools.indexOf(school)]}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{schoolData[school] || 0}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                {distances[school] ? distances[school].toFixed(2) : '계산 중...'}
              </td>
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

            {/* 차트 */}
            <div className="mt-8" style={{ height: '500px' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>

            {/* 설명 문구 */}
            <p className="text-sm text-gray-500 mt-4 text-center">
              이 결과는 선택된 이유에 따라 집계된 학교 투표 수를 나타냅니다. 더 많은 정보는 아래 &apos;상세보기&apos; 버튼을 통해 확인하세요.
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
      
            <h3 className="text-sm text-blue-800 mb-3">
              정보는 모두 나무위키에서 가져왔으며, 수정할 부분이나 학교 관계자 중 불편한 내용이 있을 시 인스타그램 @wxstw_ 으로 문의주세요.
            </h3>
      
            <div className="mb-4"> {/* 여기를 추가하여 더보기 링크와 닫기 버튼 간의 간격을 조정 */}
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