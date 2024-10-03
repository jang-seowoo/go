import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../../app/firebase/firestore';

async function testFirestore() {
  try {
    const testDoc = { testField: 1 };
    await setDoc(doc(db, 'testCollection', 'testDoc'), testDoc);
    console.log('테스트 문서가 성공적으로 추가되었습니다.');
  } catch (error) {
    console.error('테스트 문서 추가 중 오류:', error);
  }
}

testFirestore();
