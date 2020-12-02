let request=require("request");
let ch=require("cheerio");
let fs=require("fs");
request("https://www.espncricinfo.com/series/8048/scorecard/1237181/delhi-capitals-vs-mumbai-indians-final-indian-premier-league-2020-21",urlKaAns);

function urlKaAns(err,res,html){
   console.log(err);
  // fs.writeFileSync("index.html",html);
  console.log("Recieved File");
   let STool=ch.load(html);
   //FOR SINGLE ENTITY
   // let output=STool("div.summary");
   // console.log(output.html());
   // console.log(output.text());
   // fs.writeFileSync("summary.html",output.text());
   // console.log("Selected file wrote to disk");

   //FOR MULTIPLE ENTITITES
   //innings isolate
   let inningsArr=STool("div.card.content-block.match-scorecard-table");
   let fullHTML="<table>"
   for(let i=0;i<2;i++){
      let tablebatsman=
      STool(inningsArr[i]).find("table.table.batsman");
      fullHTML+=STool(tablebatsman).html();
      fullHTML+="<table>";
   }
   fs.writeFileSync("innings.html",fullHTML);
}


