//import request => js file
const { request } = require("http");
let req=require("request");
let fs=require("fs");
req("https://www.espncricinfo.com/series/8048/game/1237181/delhi-capitals-vs-mumbai-indians-final-indian-premier-league-2020-21",requestAns);

function requestAns(err,res,html){
   console.log(err);
   console.log(res.statusCode);
   console.log(html);
   if(err){
      console.log("some error",err);
   }else{
      console.log("Recieved Input");
     fs.writeFileSync("ipl.html",html);
   
   }
}

