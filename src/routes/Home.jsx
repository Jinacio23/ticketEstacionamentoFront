import React, { useEffect, useState } from 'react'
import "../styles/Home.css"
import axios from 'axios';

const Home = () => {

    const [data, setData] = useState([]);

    const getData = async () => {

        try{
            const res = await axios.get("http://localhost:8080/api/list");
            console.log(res.data);
            setData(res.data);
        } catch (err) {
            console.error(err);
        }

    }

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        console.log('data', data);
    }, [data])

  return (
    <>
    {
        data.length === 0 ? <p>Loading...</p> : (
            data.map((e, index) => (
                <h2 key={index}>{e.nome}</h2>
            ))
        )
    }
    </>
  )
}

export default Home