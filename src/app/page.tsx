'use client'

import {doc, updateDoc, increment} from 'firebase/firestore';
import {db} from './firebase/firestore'
import { useRouter } from 'next/navigation';
import React, { useState, FormEvent, useEffect } from 'react';
import "./globals.css";

import { schoolsList, schools, reasons, reasonsList } from './data/schoolData';

export default function Home() {
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();



  useEffect(() => {
    if (localStorage.getItem('voted')) {
      console.log('이미투표');
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedSchool && selectedReason) {
      try {
        const allDocRef = doc(db, "data", "all");
        await updateDoc(allDocRef, {
          [selectedSchool]: increment(1),
        });

        const reasonDocRef = doc(db, "data", selectedReason);
        await updateDoc(reasonDocRef, {
          [selectedSchool]: increment(1),
        });

        setIsSubmitted(true);
        
        setTimeout(() => {
          router.push('/result');
        }, 2000);
        
      } catch (error) {
        console.error('firebase 업데이트중 에러 발생 : ', error);
      }
    } else {
      alert('학교와 선택 이유를 모두 선택해주세요.');
    }
  };
 
  if (isSubmitted) {
    localStorage.setItem('voted', 'true');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-6 md:p-10 rounded-lg shadow-md text-center w-full max-w-md">
          <h1 className="text-2xl md:text-4xl font-bold mb-4">설문이 완료되었습니다!</h1>
          <p className="text-lg md:text-xl mb-4">
            선택한 학교: <strong>{schoolsList[schools.indexOf(selectedSchool)]}</strong>
          </p>
          <p className="text-lg md:text-xl mb-4">
            선택 이유: <strong>{reasonsList[reasons.indexOf(selectedReason)].label}</strong>
          </p>
          <p className="text-gray-500">잠시 후 결과 페이지로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between p-4 md:p-10">
      <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center flex-grow w-full max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-2xl p-6 md:p-10 w-full">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-700 mb-4">
            광명시 희망 고등학교
          </h1>
          <p className="text-center text-gray-500 text-sm mb-8">
            단순히 고입을 준비하는 우리에게 도움이 되기 위해서 웹을 만들었습니다. 특정 고등학교를 무시하거나 서열을 가리기 위한 목적이 아닙니다. 또한 사용자에게서 직접적으로 가져가는 데이터는 없고, 설문 조사 후 다른 사람들의 선택을 볼 수 있습니다. 
          </p>

          <div className="mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-medium text-gray-800 mb-4">1. 고등학교 선택</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {schoolsList.map((school, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedSchool(schools[index])}
                  className={`px-4 py-3 text-sm md:text-base rounded-lg font-semibold shadow transition-transform duration-200 hover:scale-105 h-auto min-h-[60px] flex items-center justify-center text-center ${
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

          <div className="mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-medium text-gray-800 mb-4">2. 선택 이유는 뭔가요?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {reasonsList.map((reason, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedReason(reasons[index])}
                  className={`px-4 py-3 text-sm md:text-base rounded-lg font-semibold shadow transition-transform duration-200 hover:scale-105 h-auto min-h-[60px] flex items-center justify-center text-center ${
                    selectedReason === reasons[index]
                      ? 'bg-green-500 text-white border-2 border-green-500'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                  }`}
                >
                  {reason.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="w-full bg-gray-800 text-white py-3 md:py-4 rounded-lg text-lg md:text-xl font-bold shadow-lg hover:bg-gray-900 transition-transform duration-200 hover:scale-105"
            >
              완료
            </button>
          </div>
        </div>
      </form>

      <div className="bg-gray-100 p-4 md:p-6 rounded-lg shadow-md mt-8 w-full max-w-4xl mx-auto">
        <p className="text-gray-600 text-center mb-2 text-sm md:text-base">
          모든 설문 응답은 익명으로 처리됩니다. 감사합니다 &gt;&lt;
        </p>
        <p className="text-gray-500 text-center text-xs md:text-sm">
          문의 및 제안: insta@[wxstw_] 기타를 고른 경우 어떤 이유인지 알려주세요 | 이 웹사이트는 개인 프로젝트로 제작되었으며, 모든 내용과 데이터는 비상업적 목적으로 사용됩니다.
        </p>
      </div> 
    </div>
  );
}