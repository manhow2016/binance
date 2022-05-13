
import React, { useEffect, useState,useRef} from "react";
import {Table,Button, notification} from "antd";
import './App.css';

import io from "socket.io-client";
import ReactAudioPlayer from 'react-audio-player';
import sounds from './70097.mp3'


const socket=io("http://192.168.0.201:3001");

function App() {
  const [data, setData] = useState([]);
  const [nn,setnn]=useState("");
  let audiosDom; //音频
const audioRef = useRef(null);
  const close = () => {
    
    //audiosDom=audios.current;
    //audiosDom.pause();
   // audiosDom.load();
    console.log(
      'Notification was closed. Either the close button was clicked or duration time elapsed.',
    );
  }; 
  const openNotification = () => {
    const key = `open${Date.now()}`;
    const btn = (
      <Button type="primary" size="small" onClick={() => {
        notification.close(key);
        audioRef.current.audioEl.current.pause();
        audioRef.current.audioEl.current.load();
        }}>
        知道了
      </Button>
    );
    
    notification.open({
      message: '提醒',
      duration: null,
      placement: "top",
      description:
        '新币名称: '+nn,
      btn,
      key,
      onClose: close,
    });
  };
useEffect(()=>{
  console.log(nn);
  if(nn!=="")
  {
  openNotification();
  audioRef.current.audioEl.current.play();
  setnn("");
  }
},[nn]);
 useEffect(()=>{
    socket.on("update", (rdata) => {
      //const dd=JSON.parse(rdata);
      //tmpdata=[].concat(rdata);
      
      
      setData(rdata);
    });
    socket.on("new",(rdata)=>{
      setnn(rdata);
      
    });
  },[]);
  const columns = [
    {
      title: '名称',
      dataIndex: 's',
      key: 's',
    },
    {
      title: '价格',
      dataIndex: 'c',
      key: 'c',
    }
    
  ];
  return (
    <div className="App">
     <ReactAudioPlayer
        src={sounds}
        autoPlay={false}
        ref={audioRef}
        loop={true}
        
      />
    
    <Table dataSource={data} columns={columns} />
    </div>
  );
}

export default App;