//data/schoolData.ts

export type SchoolName = string;
export type SchoolCode = string;
export type ReasonCode = string;
export type ReasonLabel = string;




export const schoolsList: SchoolName[] = [
    '광명고등학교', '광명북고등학교', '광문고등학교', '광휘고등학교',
    '명문고등학교', '소하고등학교', '운산고등학교', '진성고등학교',
    '충현고등학교', '경기항공고등학교', '창의경영고등학교'
  ];
  
  export const schools: SchoolCode[] = [
    'gwangmyeong', 'gwangmyeongbuk', 'gwangmun', 'gwanghwi',
    'myeongmun', 'soha', 'unsan', 'jinsung',
    'chunghyeon', 'hanggong', 'chang'
  ];
  
  export const reasons: ReasonCode[] = [
    'traffic', 'academic', 'grade', 'facility',
    'employment', 'document', 'others'
  ];
  
  export const reasonsList: { id: ReasonCode | 'all'; label: ReasonLabel }[] = [
    { id: 'all', label: '전체' },
    { id: 'traffic', label: '🚌 교통' },
    { id: 'academic', label: '🕹️ 학업 분위기' },
    { id: 'grade', label: '💡 내신 전략' },
    { id: 'facility', label: '🏫 시설' },
    { id: 'employment', label: '🏢 취업' },
    { id: 'document', label: '📜 생기부 관리' },
    { id: 'others', label: '기타' }
  ];
  
  export const schoolDescriptions: Record<SchoolCode, string> = {
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
                       
  export const namuLink: Record<SchoolCode, string> = {
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
  };
  
  export interface Location {
    lat: number;
    lng: number;
  }
  
  export const schoolLocations: Record<SchoolCode, Location> = {
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
    chang: { lat: 37.4383574, lng: 126.8821568 },
  }