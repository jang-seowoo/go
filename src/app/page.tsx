
'use client'

import { collection, addDoc, getDocs } from "firebase/firestore";
import {firestore} from "./firebase/firestore";
import React, { useEffect, useState } from 'react';
import firebase from "firebase/compat/app";


 export default function Home() {

  const [value, setValue] = useState("");
  
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);               
    console.log(value);
  }             

    const send = async ()=> {
    await addDoc(collection(firestore, "user"), {
      value: value




    })          
      setValue("");
  }

  return (
    <div>
      
      <input placeholder="text" type="text" value={value} onChange={onChange}/>
      <button onClick={send}>Send</button>
             

    </div>
  )

}