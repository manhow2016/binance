
import React, { useEffect, useState,useRef} from "react";
import {Table,Button, notification,Card} from "antd";
import "antd/dist/antd.css";
import './App.css';

import io from "socket.io-client";
import sounds from './70097.mp3'

const socket=io("http://192.168.0.201:3001");



function App() {
  
  const [data, setData] = useState([]);
  const [nn,setnn]=useState("");
  const [logs,setlogs]=useState([]);
  const [bcount,setBcount]=useState(500);
  const [paycount,setPaycount]=useState(496);
  const [pcount,setPcount]=useState(380);
  const [gonggao,setGonggao]=useState({});
  let audiosDom; //音频
const audioRef = useRef(null);
const logref= useRef(null);
//useEffect(()=>{
 // if(logs.length>0)
  //{
  //  logref.current.scrollIntoView({ behavior: "smooth" });
 // }
 // },[logs]);
const tb_header=()=>
{
return (
  "aaaaaa"
)
}
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
        //audioRef.current.audioEl.current.pause();
        //audioRef.current.audioEl.current.load();
        audioRef.current.pause();
        audioRef.current.load();
        }}>
        知道了
      </Button>
    );
    const cur=new Date(Date.now());
    notification.open({
      message: '提醒',
      duration: null,
      placement: "top",
      description:
        '新币名称: '+nn+'  '+cur.toLocaleDateString()+'  '+cur.toLocaleTimeString(),
      btn,
      key,
      onClose: close,
    });
  };
useEffect(()=>{
 // console.log(nn);
  if(nn!=="")
  {
  openNotification();
  //audioRef.current.audioEl.current.play();
  audioRef.current.play();
  setnn("");
  }
},[nn]);

 useEffect(()=>{

  socket.on("new",(rdata)=>{
    setnn(rdata);
    
  });
    socket.on("log",(rdata)=>{
      setlogs(aa => [rdata,...aa]);
      console.log(rdata);
      
    });
    socket.on("logs",(rdata)=>{
      //console.log(rdata);
      setlogs(rdata);
      
    });
    socket.on("info",(rdata)=>{
      setBcount(rdata.bcount);
      setPaycount(rdata.paycount);
      setPcount(rdata.pcount);
      setGonggao(rdata.gonggao);
    })
  },[socket]);
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
    <div >
      <>
     <audio
        src={sounds}
        autoPlay={false}
        ref={audioRef}
        loop={true}
      />
      </>
    
    {/* <Table dataSource={data} columns={columns} pagination={{pageSize:5}} title={tb_header} /> */}
    <div>
    <Card size="small" title="加密币" bordered={true} style={{ width:"96%" }}>
    <p>capital:<font color="blue">{bcount}</font>&nbsp;&nbsp;wallet:<font color="blue">{paycount}</font>&nbsp;&nbsp;product:<font color="blue">{pcount}</font></p>
     
     </Card> 

    </div>
    <div>
    <Card size="small" title="最新公告" bordered={true} style={{ width:"96%" }}>
    <p style={{color:"blue"}}><strong>{gonggao.title}&nbsp;&nbsp;{gonggao.time}</strong></p>
    </Card>
  </div>
  <div>
    <Card size="small" title="日志" bordered={true} style={{ width:"96%",height:"300px"}}>
    <div style={{width:"100%",display:"flex",flexDirection:"column",overflowY:"scroll",height:"240px"}} ref={logref}>
      {logs.map((m)=>{

        return <span>{m.msg}</span>;
      })}

    </div>
    </Card>
  </div>
    </div>
  );
}

export default App;
