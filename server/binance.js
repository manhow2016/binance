const WebSocket=require('ws');
const Axios=require("axios");
const HttpsProxyAgent = require("https-proxy-agent");

function binance(io,log)
{
    var data={};
    var curdata=[];
    var ws;
    const httpsAgent = new HttpsProxyAgent("http://127.0.0.1:8889");
    const axios = Axios.create({
    proxy:false,
    httpsAgent
    });
    
    this.init=function()
    {
         //console.log('init');
        axios.get("https://api.binance.com/api/v3/ticker/price").then(
            (response)=>{
                this.data=response.data;
                //console.log(this.data[0].symbol);
                this.pick();
            }

        ).catch(
            (error)=>
            {
                console.log(error);
            }
        );
    }
    this.isexit=function (l)
    {
        for(var j in curdata)
            {
              
                if(curdata[j].s==l.s)
                {
                    curdata[j].c=l.c;
                    return true;
                }
            }
            if(curdata.length<50)
            curdata=[...curdata,l];
            return false;
    }
    this.isnew=function(l)
    {
        for(var j in this.data)
        {
            if(this.data[j].symbol==l.s)
            {
                return false;
            }
        }
        this.data=[...this.data,{symbol:l.s,price:l.c}];
        io.to("1").emit("new",l.s);
        return true;
    }
    this.findnew=function(dt)
    {
       // dt=[...dt,{s:"测试币",c:"25.00"}];
        for(var i in dt)
        {
            this.isnew(dt[i]);
           this.isexit(dt[i]);
            
        }
    }
    this.pick=function()
    {
        //console.log('pick');

        this.ws=new WebSocket("wss://stream.binance.com:9443/ws/!miniTicker@arr",{agent:httpsAgent});
 
        this.ws.onmessage=(event)=>{
           //console.log("send update");
           this.findnew(JSON.parse(event.data));
            io.to("1").emit("update",curdata);
            log("update");
        }
        this.ws.onclose=()=>{
            this.reconnect();
        }
    }
    this.reconnect=function ()
    {
        this.ws.open();
    }
};
module.exports=binance;
