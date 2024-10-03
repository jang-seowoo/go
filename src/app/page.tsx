'use client'

import {doc, updateDoc, increment} from 'firebase/firestore';
import {db} from './firebase/firestore'

import React, { useState, FormEvent } from 'react';
import "./globals.css";

export default function Home() {
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  const schoolsList = [
    '광명고등학교',
    '광명북고등학교',
    '광문고등학교',
    '광휘고등학교',
    '명문고등학교',
    '소하고등학교',
    '운산고등학교',
    '진성고등학교',
    '충현고등학교',
    '경기항공고등학교',
    '창의경영고등학교'
  ];

  const schools = [
    'gwangmyeong',
    'gwangmyeongbuk',
    'gwangmun',
    'gwanghwi',
    'myeongmun',
    'soha',
    'unsan',
    'jinsung',
    'chunghyeon',
    'hanggong',
    'chang'
  ];

  const reasons = [
    'traffic',
    'academic',
    'grade',
    'facility',
    'employment',
    'document',
    'others'
  ];

  const reasonsList = [
    '🚌 교통 및 거리',
    '🕹️ 학업 분위기',
    '💡 내신 전략',
    '🏫 시설',
    '🏢 취업',
    '📜 생기부 관리',
    '기타'
  ];

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 기본 폼 제출 방지
    if (selectedSchool && selectedReason) {
      try {
        //all 문서에 +1
        const allDocRef = doc(db, "data", "all");
        await updateDoc(allDocRef, {
          [selectedSchool]: increment(1),
        });

        //선택한 이유 문서에 +1
        const reasonDocRef = doc(db, "data", selectedReason);
        await updateDoc(reasonDocRef, {
          [selectedSchool]: increment(1),
        });
      } catch (error){
          console.error('firebase 업데이트중 에러 발생 : ', error)
      }
    } else {
      alert('학교와 선택 이유를 모두 선택해주세요.');
    }
  };
 
 


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between p-10">
      {/* 메인 콘텐츠 */}
      <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center flex-grow"> {/* form 사용 */}
        <div className="bg-white shadow-md rounded-2xl p-10 w-full max-w-5xl">
          <h1 className="text-4xl font-bold text-center text-gray-700 mb-4">
            광명시 희망 고등학교
          </h1>
          <p className="text-center text-gray-500 text-sm mb-10">
            단순히 고입을 준비하는 우리에게 도움이 되기 위해서 웹을 만들었습니다. 특정 고등학교를 무시하거나 서열을 가리기 위한 목적이 아닙니다. 또한 사용자에게서 직접적으로 가져가는 데이터는 없고, 설문 조사 후 다른 사람들의 선택을 볼 수 있습니다. 
          </p>

          {/* 학교 선택*/}
          <div className="mb-16">
            <h2 className="text-2xl font-medium text-gray-800 mb-6">1. 고등학교 선택</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {schoolsList.map((school, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedSchool(schools[index])}
                  className={`px-8 py-4 text-lg rounded-lg font-semibold shadow transition-transform duration-200 hover:scale-105 ${
                    selectedSchool === schools[index]
                      ? 'bg-blue-500 text-white border-2 border-blue-500'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                  }`}
                >
                  {school}
                </button>
              ))}
            </div>
          </div>

          {/*이유 선택*/}
          <div className="mb-16">
            <h2 className="text-2xl font-medium text-gray-800 mb-6">2. 선택 이유는 뭔가요?</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {reasonsList.map((reason, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedReason(reasons[index])}
                  className={`px-8 py-4 text-lg rounded-lg font-semibold shadow transition-transform duration-200 hover:scale-105 ${
                    selectedReason === reasons[index]
                      ? 'bg-green-500 text-white border-2 border-green-500'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          {/*제출*/}
          <div className="text-center">
            <button
              type="submit" /* submit으로 변경 */
              className="w-full bg-gray-800 text-white py-4 rounded-lg text-xl font-bold shadow-lg hover:bg-gray-900 transition-transform duration-200 hover:scale-105"
            >
              완료
            </button>
          </div>
        </div>
      </form>

      {/* 하단 크레딧 및 안내 섹션 */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-md mt-10 w-full max-w-5xl mx-auto">
        <p className="text-gray-600 text-center mb-4">
          모든 설문 응답은 익명으로 처리됩니다. 감사합니다 &gt;&lt;
        </p>
        <p className="text-gray-500 text-center text-sm">
          문의 및 제안: insta@[wxstw_] 기타를 고른 경우 어떤 이유인지 알려주세요 | 이 웹사이트는 개인 프로젝트로 제작되었으며, 모든 내용과 데이터는 비상업적 목적으로 사용됩니다.
        </p>
      </div>
    </div>
  );
}
