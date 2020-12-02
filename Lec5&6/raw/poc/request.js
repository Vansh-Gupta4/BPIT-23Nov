//npm install request
let request = require("request");//to request and receive data from cricinfo server
//npm install cheerio
let cheerio = require("cheerio");//used for data extraction

let fs = require("fs");//fs is a node module. we have to 'require' it to use it's functions. used to create file
let path = require("path");
let xlsx = require("xlsx");
//req("https://www.espncricinfo.com/series/8048/scorecard/1237181/delhi-capitals-vs-mumbai-indians-final-indian-premier-league-2020-21",requestKaAns);//request ka response will be recieved by 'requestKaAns' function
//function requestKaAns(err,response,html){
    //console.log(err);
    // console.log(res.statusCode);
    //console.log(html);//html code of URL will be printed by this
    //fs.writeFileSync("ipl.html",html);//explaination in copy  
    //html page -> selector -> input
    //load file
    //load html
    // console.log("Received file");
    // let outputObj = STool("div.summary");
    //it give html of that matching element
    //console.log(outputObj.html());
    //it gives val
    //console.log(outputObj.text());
    //select => unique
    //html => output -> html
    //fs.writeFileSync("summary.html",outputObj.text());
    // let inningsArr=STool("div.card.content-block.match-scorecard-table");//1 innings' table will be stored here 
    // let fullHtml="<table>";//to present the output as a table
    // for(let i = 0 ; i < inningsArr.length-1 ; i++){
    //     let tableBatsman = STool(inningsArr[i]).find("table.table.batsman");//STool will wrap the data. find() will find the batsman table in that data
    //     //extract batsman from the table
    //     fullHtml+= STool(tableBatsman).html();
    //     fullHtml+= "<table>";
    // }
    // fs.writeFileSync("innings.html", fullHtml);
//}
    //LECTURE 3+4 CONTENT BELOW:-
    
request("https://www.espncricinfo.com/series/_/id/8048/season/2020/indian-premier-league", MainMatchCb);//get all match URL   

function MainMatchCb(err,res,html){
    let sTool= cheerio.load(html);
    let allMatchPageUrl= sTool("a[data-hover='View All Results']").attr("href");//this will find the URL of 'View All Results' button in home page
    let fUrl = "https://www.espncricinfo.com"+allMatchPageUrl;//full URL
    allMatchPage(fUrl);  
}

function allMatchPage(fUrl){
    request(fUrl, GetAMUrl);
    function GetAMUrl(err,resp, html){//get all match URL
        let sTool= cheerio.load(html);
        let allMatchUrlElem= sTool("a[data-hover='Scorecard']");
        for(let i = 0; i < allMatchUrlElem.length; i++){
            let href= sTool(allMatchUrlElem[i]).attr("href");
            let fUrl= "https://www.espncricinfo.com"+href;//to get complete link
            findDataOfAMatch(fUrl);
            console.log("#######################################################");
        }
    }
    
}

function findDataOfAMatch(url){
    request(url, WhenDataArrive);
    function WhenDataArrive(err, resp, html){
        let sTool=cheerio.load(html);
        let tableElem = sTool("div.card.content-block.match-scorecard-table .Collapsible") ;//dono teams ka collapsible content
        console.log(tableElem.length);

        let count = 0;//to count number of players in a team
        for(let i = 0; i < tableElem.length; i++){//tableElem = 2 here. every collapsible area will be considered here
            //extracting and wrapping text
            //html => element html
            let teamName = sTool(tableElem[i]).find("h5.header-title.label").text();
            let rowsOfATeam = sTool(tableElem[i]).find(".table.batsman").find("tbody tr");
            let teamStrArr= teamName.split("Innings");
            teamName=teamStrArr[0].trim();
            console.log(teamName);
            
            for(let j = 0; j < rowsOfATeam.length; j++){
                let rCols = sTool(rowsOfATeam[j]).find("td");//to find number of columns of ith row
                let isBatsmanRow = sTool(rCols[0]).hasClass("batsman-cell");//to tell if this a batsman's row or empty row. every element having class "batsman-cell" will be considered
                if(isBatsmanRow == true){
                    count++;
                    let pName = sTool(rCols[0]).text().trim();//player name
                    let runs = sTool(rCols[2]).text().trim();
                    let balls = sTool(rCols[3]).text().trim();
                    let fours = sTool(rCols[5]).text().trim();
                    let sixes = sTool(rCols[6]).text().trim();
                    let sr = sTool(rCols[7]).text().trim();
                    console.log(`Name: ${pName} Runs: ${runs} Balls: ${balls} Fours:${fours} Sixes: ${sixes} Sr: ${sr}`);
                    processPlayer(teamName, pName, runs, balls, fours,sixes, sr);//to process every player's data
                }
            
            }
            console.log("No. of batsman in team", count);
            console.log(teamName);
            count = 0;//now we'll count other team's no. of players
        }
    }
}
function processPlayer(team, name, runs, balls, fours, sixes, sr){
    let pMatchStats = {//object that corresponds to and contain individual player's stats 
        Team:team,
        Name:name,
        Runs:runs,
        Balls:balls,
        Fours:fours,
        Sixes:sixes,
        Sr:sr
    }
    //STEPS
    //check folder i.e does this entry belong to an existing team
    //if folder exists then print else create a new folder
    let dirPath = team;
    if(fs.existsSync(dirPath)){//do nothing
        //console.log("Folder Exists");
    }else{//create new folder
        fs.mkdirSync(dirPath);
    }
    //if file exists => data append in file
    //else create new file and add data
    let playerFilePath= path.join(dirPath, name+".xlsx");
    let pData = [];
    if(fs.existsSync(playerFilePath)){//i.e if this is player's 2nd or further match
        pData = excelReader(playerFilePath, name);
        pData.push(pMatchStats);
    }else{//i.e this is player's first match
        //create file
        console.log("File of player",playerFilePath,"created");
        pData = [pMatchStats];
    }
    excelWriter(playerFilePath,pData,name);
}
//short summary
//if => file exists => append : create, add data
// => check if player's excel file exists or not
//if exists => data append

function excelReader(filePath, name){//got this function from stack overflow
    if(!fs.existsSync(filePath)){
        return null;
    }else{
        //workbook => excel
        let wt = xlsx.readFile(filePath);
        //get data from workbook
        let excelData = wt.Sheets[name];
        //convert excel format to json => array of object
        let ans = xlsx.utils.sheet_to_json(excelData);
        //console.log(ans);
        return ans;
    }
}

function excelWriter(filePath, json, name){//sir wrote this function
    //console.log(xlsx.readFile(filePath));
    let newWB = xlsx.utils.book_new();
    //console.log(json);
    let newWS = xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(newWB, newWS, name);
    //file => create, replace
    xlsx.writeFile(newWB, filePath);
}

 
