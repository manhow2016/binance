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
io.on("connection", (socket) => {
//console.log('connect');
   socket.join("1");
   
});

const bc=new binance(io);
bc.init();
server.listen(3001,()=>{
    console.log("SERVER RUNNING...");

});