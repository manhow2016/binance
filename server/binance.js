const WebSocket=require('ws');
const Axios=require("axios");
const HttpsProxyAgent = require("https-proxy-agent");
const format=require("string-format");
const cronjob=require("cron").CronJob;

function binance(io,log)
{
    var data={};
    var curdata=[];
    var ws;
    var logs=[];
    var bdata=[];
    var pdata=[];
    var paydata=[];
    var lastgg=null;
    let isworking=false;
    let dataok=false;
    const httpsAgent = new HttpsProxyAgent("http://127.0.0.1:8889");
    const axios = Axios.create({
    proxy:false,
    httpsAgent
    });
   // this.Crypt(str)
  //  {
       // let test = CryptoJS.HmacSHA256(str, key);
// 使用16进制的方法加密，输出字符串
//let testStr= CryptoJS.enc.Hex.stringify(test);
  //  }
    this.createTimestamp = function () {
        return parseInt(new Date().getTime() / 1000) + '';
      };
      this.sendinfo=()=>{
          if(dataok==false) return;
          const d={
              bcount:bdata.length,
              pcount:pdata.length,
              paycount:paydata.length,
              gonggao:lastgg
          };
          io.to("1").emit("info",d);
      }

    this.getdata=async (area)=>
    {
       
        var url="";
        switch(area)
        {
            case 0:
                url="https://www.binance.com/bapi/asset/v1/public/asset-service/wallet/get-support-asset";
                break;
            case 1:
                url="https://www.binance.com/bapi/capital/v2/public/capital/config/getAll?includeEtf=true";
                break;
            case 2:
                url="https://www.binance.com/bapi/asset/v2/public/asset-service/product/get-products?includeEtf=true";
                break;
            case 3:
                url="https://www.binance.com/bapi/composite/v3/public/market/notice/get?page=1&rows=50&lang=cn";
                break;
        }
       // console.log(url);
        try {
           const d=await axios.get(url);
           return d;

        } catch (error) {
           // console.log(error);
           return null;
        }
       
       return null;
    }
    this.filter=(title)=>
    {
        if(title.indexOf("上市")>=0 || title.indexOf("新增")>=0)return true;
        return false;
    }
    this.gonggao=(gg)=>{
        const d=gg.data;
        if(d.code!=="000000")return;
        for(var i in d.data)
        {
            const dd=d.data[i];
            if(dd.type=="数字货币及交易对上新")
            {
            if(this.filter(dd.title))
            {
                console.log(dd.title);
                const dt=new Date(dd.time);
                
                lastgg={
                    title:dd.title,
                    time:dt.toLocaleDateString()+" "+dt.toLocaleTimeString()

                };
                //console.log(lastgg);
                return;
            }
            }
            
        }
    }
    this.checkNew=async function()
    {
        const pl=await this.getdata(0);
        const nl=await this.getdata(2);
        const pl2=await this.getdata(1);
        const nc=await this.getdata(3);
        if(pl==null || nl==null || pl2==null || nc==null)
        {
            isworking=false;
            return;
        }
        isworking=true;
        this.gonggao(nc);
        if(pl.data.code=="000000")
        {
            const d=pl.data.data;
            if(paydata.length==0)
            {
            //paydata.push()
            
            //paydata=[...paydata,...d.main,...d.future,...d.delivery,...d.fiat,...d.card];
            paydata.push(...d.main);
            paydata.push(...d.future);
            paydata.push(...d.delivery);
            paydata.push(...d.fiat);
            paydata.push(...d.card);
            
            }
            else
            {
               //paydata=[...paydata,{assetCode:"测试",aaa:0}]; 
               this.findnew(0,[...d.main,...d.future,...d.delivery,...d.fiat,...d.card]);
            }
            

        }
        if(nl.data.code=="000000")
        {
            if(pdata.length==0)
            {
            pdata=[...pdata,...nl.data.data];
            
            }
            else
            this.findnew(2,nl.data.data);
        }
        if(pl2.data.code=="000000")
        {
            if(bdata.length==0)
            {
            bdata=[...bdata,...pl2.data.data];
            
            }
            else
            this.findnew(1,pl2.data.data);
        }
        dataok=true;
        this.sendinfo();
        isworking=false;
        
        //this.paydata=[...this.paydata,pl.]
    }
    this.init=function()
    {
       // this.checkNew();
        new cronjob("*/20 * * * * *",()=>{
        if(isworking==false)
           this.checkNew();
           //console.log("one");
        },null,true);
         //console.log('init');
       /* axios.get("https://api.binance.com/api/v3/ticker/price").then(
            (response)=>{
                this.data=response.data;
                console.log(this.data.length);
                //this.pick();
            }

        ).catch(
            (error)=>
            {
                console.log(error);
            }
        );*/
        cronjob
    }
    this.sendlogs=function()
    {
        if(dataok==false) return;
        if(logs.length>0)
        io.to("1").emit("logs",logs);
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
    this.sendnew=function(type,l)
    {
        const cur=new Date(Date.now());
        let tp="";
        let ll=null;
        let s="";
        switch(type)
        {
            case 0:
                tp="wallet";
                ll=
                {
                    msg:format("[{} {}] {}新增 {}",cur.toLocaleDateString(),cur.toLocaleTimeString(),tp,l.assetCode)
                };
                s=l.assetCode;
                break;
            case 1:
                tp="capital";
                ll=
                {
                    msg:format("[{} {}] {}新增 {}",cur.toLocaleDateString(),cur.toLocaleTimeString(),tp,l.coin)
                };
                s=l.coin;
                break;
            case 2:
                tp="product";
                ll=
                {
                    msg:format("[{} {}] {}新增 {}",cur.toLocaleDateString(),cur.toLocaleTimeString(),tp,l.s)
                };
                s=l.s;
                break;
        }
        
        
        logs=[...logs,ll];
        io.to("1").emit("log",ll);
        io.to("1").emit("new",s);
        return true;
    }
    this.findnew=function(type,dt)
    {
       switch(type)
       {
           case 0:
               
                dt.forEach(it => {
                   if(paydata.find((item)=>{
                       
                        return item.assetCode==it.assetCode
                  })==undefined)
                   {
                        paydata=[...paydata,it];
                        this.sendnew(0,it);
                   };
                });
               break;
           case 1:
            dt.forEach(it => {
                if(bdata.find((item)=>{
                    
                     return item.coin==it.coin
               })==undefined)
                {
                     bdata=[...bdata,it];
                     this.sendnew(1,it);
                };
             });
               break;
           case 2:
            dt.forEach(it => {
                if(pdata.find((item)=>{
                    
                     return item.s==it.s
               })==undefined)
                {
                     pdata=[...pdata,it];
                     this.sendnew(2,it);
                };
             });
               break;
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
           // log("update");
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
