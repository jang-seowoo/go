'use client'

import { collection, addDoc } from "firebase/firestore";
import {firestore} from "./firebase/firestore";

export default function Home() {

  const onClickUpLoadButton = async () => {
    await addDoc(collection(firestore, "users"),
      {
        first: "Ada",
        last: "Lovelace",
        born: 1815
      })
  }

  return (
    <div>
      <button onClick={onClickUpLoadButton}>Ada Lovelace 등록</button>
    </div>
  )}