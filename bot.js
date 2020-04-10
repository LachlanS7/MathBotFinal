// Preamble
const Discord = require('discord.js');
const { prefix, adminRole } = require('./config.json');
const client = new Discord.Client();
const latex = require('node-latex')
const fs = require('fs');
const shell = require('shelljs'); // interact with the OS's shell

// Obtaning data from data.json
temp = fs.readFileSync('data.json');
let data = JSON.parse(temp);

// Connecting to Discord
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.channels.get(data.restartChannel).send('Hi again! I just restarted.');
});

//needs to be defined once on start up
choosenQuestion = parseInt(' ')

client.on('message', message => {
    // Discord Command !question.
    if(message.content.startsWith(`${prefix}question`)) {
        choosenQuestion = null

        if(message.content.replace(`${prefix}question`, '').trim() != '') {
            // Selecting difficulty
            reqDifficulty = message.content.split(" ")[1];

            if(isNaN(reqDifficulty) == true){
                message.reply(`Please enter a positive integer`)
            } else {

            let avaliableQuestions = 0
            for(var i = 0; i < data.questions.length; i++){
                if(data.questions[i].difficulty == reqDifficulty){
                    avaliableQuestions++
                }
            }
            if(avaliableQuestions>0){

            //choosing a random number
            rand = Math.floor(Math.random() * (avaliableQuestions)+1);
            tempcount = 0

            //Selecting the question
            for(var i = 0; i < data.questions.length && tempcount <= rand; i++ ){
                if(data.questions[i].difficulty == reqDifficulty){
                    tempcount++;
                }
                if(tempcount == rand){
                     choosenQuestion = i;
                     break;
                }
                } 
        }

        //if no questions exist of reqdifficulty
        else {
                message.reply(`there are no questions with difficulty`)
            }
        }

        }
        else {
            choosenQuestion = Math.floor(Math.random() * (data.questions.length - 1))
        }
            // data.questions.length - 1 is array index from 0 to x
            // Access image
            if(choosenQuestion != null){
            if(data.questions[choosenQuestion].image && data.questions[choosenQuestion].image != "") {
                message.channel.send(`Question ${choosenQuestion + 1}: ${data.questions[choosenQuestion].question}`, {files: [data.questions[choosenQuestion].image]}) 
            } 
            else {
                message.channel.send(`Question ${choosenQuestion + 1}: ${data.questions[choosenQuestion].question}`) 
            }
        } 
    }
    
    // Discord Command !solution
    else if(message.content.startsWith(`${prefix}solution`)){

        //Variables
        input=(parseInt(message.content.split(" ")[1]))
        question = parseInt(' ')

        //Obtaining information from input
        if(isNaN(input) == true && isNaN(parseInt(choosenQuestion)) == false){
            question = parseInt(choosenQuestion);
        } else if(isNaN(input) != true){
            question = input-1
        }

        if(isNaN(question) == false){
            if(data.questions[question].solution != null){
                //If a solution exits, the user will be directly messaged the solution
                if(data.questions[question].solutionAuthor) {
                    message.author.send(`The solution to Question ${question + 1} is: ${data.questions[question].solution} \nSolution provided by: ${data.questions[question].solutionAuthor}`);
                }
                else {
                    message.author.send(`The solution to Question ${question + 1} is: ${data.questions[question].solution}`);
                }
                
            } else {
                message.reply(`There is currently no solution to question ${question+1}. If you have one, feel free to contact an admin`);
            }
        } else {
            message.reply('No question inputted for the solution');
            }
        }



    // Adding a question
    else if(message.content.startsWith(`${prefix}addquestion`)) {
        if(message.member.roles.find(r => r.name === adminRole))
        {
            if(message.content.replace(`${prefix}addquestion`, '') == '') {
                message.reply(`${prefix}addquestion question, difficulty, (solution), (image url)`)
            }
            else {
                let theQuestion = message.content.replace(`${prefix}addquestion`, '').split(',').map(item => item.trim())
                let newEntry = { question: theQuestion[0], difficulty: theQuestion[1], image: theQuestion[3], solution: theQuestion[2], solutionAuthor: message.author.username}
                data.questions.push(newEntry)
                fs.writeFile("data.json", JSON.stringify(data, null, 4), function() { console.log(`successfully added question: ${theQuestion[0]}`) })
                message.reply(`successfully added question: ${theQuestion[0]}`)
            }
        }
        else {
            message.reply("you need to be an admin for that...")
        }
    }
    else if(message.content === `${prefix}update` || message.content === `${prefix}restart`) {
        if(message.member.roles.find(r => r.name === adminRole)) {
            message.channel.send('Restarting and checking for updates...');
            data.restartChannel = message.channel.id;
            fs.writeFileSync('data.json', JSON.stringify(data, null, 4));
	    setTimeout(function(){ shell.exec('./update.sh'); message.channel.send('Failed to restart!'); }, 1000);
        }
        else {
            message.reply("you need to be an admin for that...")
        }
    }
});

let token = fs.readFileSync('token.txt');
client.login(String(token).replace(`\n`, ""));
