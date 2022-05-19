const express=require("express");
const app=express();
const http=require("http");
const cors=require("cors");
const {Server}=require("socket.io")
const binance=require("./binance");

app.use(cors());

const server=http.createServer(app);

const io=new Server(server,{
    cors:{
        origin: "http://192.168.0.201:3000",
        methods: ["GET","POST"]
    }
});

const log=function(txt)
    {
        const cur=new Date();
        const tt=`[${cur.toLocaleDateString()+"  "+cur.toLocaleTimeString()}]`+" "+txt+"\r\n";
        io.to("1").emit("log",{msg:tt});
    };
const bc=new binance(io,log);
io.on("connection", (socket) => {
//console.log('connect');
   socket.join("1");
   const cur=new Date();
const tt=`[${cur.toLocaleDateString()+"  "+cur.toLocaleTimeString()}]`+" 连接成功！"+"\r\n";
   socket.emit("log",{msg:tt});
   //console.log(tt);
   bc.sendinfo(socket);
   bc.sendlogs(socket);

});


bc.init();
server.listen(3001,()=>{
    console.log("SERVER RUNNING...");

});