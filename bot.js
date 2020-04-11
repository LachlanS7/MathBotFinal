// Preamble
const Discord = require('discord.js');
const { prefix, adminRole } = require('./config.json');
const client = new Discord.Client();
const latex = require('node-latex')
const fs = require('fs');
const shell = require('shelljs'); // interact with the OS's shell

let token = fs.readFileSync('token.txt');
client.login(String(token).replace('\n', ''));

// Needs to be defined globally
chosenQuestion = null;

// Loading data
let data = JSON.parse(fs.readFileSync('data.json'));
let dailyQuestionNumber = parseInt(data.dailyQuestionNumber);

// Connecting to Discord
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.channels.get(data.restartChannel).send('Hi again! I just restarted.');

    setInterval(() => {
        //Daily Questions
        time = new Date();
        if(time.getHours() == 12 && time.getMinutes()==0){ //that is 12:00, midday
            client.channels.get('698306874986070046').send(`${time.getDate()}/${time.getMonth()+1}, Daily Question: ${data.dailyQuestions[dailyQuestionNumber].question}`); 
            dailyQuestionNumber++;
        }
    }, 60000);
});

client.on('message', message => {
    // Discord Command !question.
    if (message.content.startsWith(`${prefix}question`)) {
        chosenQuestion = null; reqDifficulty = null; chosenQuestion = null

        if (message.content.replace(`${prefix}question`, '').trim() != '') {
            // Selecting difficulty
            if(message.content.split(" ").length = 3 && message.content.split(" ")[1] == 'd'){
                if(!isNaN(message.content.split(" ")[2])){ reqDifficulty = message.content.split(" ")[2]; }    
                else {message.reply(`Please enter a positive integer`); }    
            }
            // Selecting question
            if(message.content.split(" ").length == 2){
                if(!isNaN(message.content.split(" ")[1])){
                    if(data.questions[message.content.split(" ")[1]] != null) {chosenQuestion = message.content.split(" ")[1]-1; }
                    else (message.reply(`Question ${message.content.split(" ")[1]} does not exist`))}
                else{ message.reply(`Please enter a positive integer`); }
            }
            if(reqDifficulty != null){
                let avaliableQuestions = 0
                for (var i = 0; i < data.questions.length; i++) {
                    if (data.questions[i].difficulty == reqDifficulty) {
                        avaliableQuestions++
                    }
                }
                if (avaliableQuestions > 0) {

                    //choosing a random number
                    rand = Math.floor(Math.random() * (avaliableQuestions) + 1);
                    tempcount = 0

                    //Selecting the question
                    for (var i = 0; i < data.questions.length && tempcount <= rand; i++) {
                        if (data.questions[i].difficulty == reqDifficulty) {
                            tempcount++;
                        }
                        if (tempcount == rand) {
                            chosenQuestion = i;
                            break;
                        }
                    }
                } else if (avaliableQuestions == 0) {message.reply(`There are no questions with difficulty ${reqDifficulty}`)}
            } 
        }
        else {
            chosenQuestion = Math.floor(Math.random() * (data.questions.length - 1))
        }
        // data.questions.length - 1 is array index from 0 to x
        // Access image
        if (chosenQuestion != null) {
            if (data.questions[chosenQuestion].image && data.questions[chosenQuestion].image != "") {
                message.channel.send(`Question ${chosenQuestion + 1}: ${data.questions[chosenQuestion].question}`, { files: [data.questions[chosenQuestion].image] })
            }
            else {
                message.channel.send(`Question ${chosenQuestion + 1}: ${data.questions[chosenQuestion].question}`)
            }
        }
    }

    // Discord Command !solution
    else if (message.content.startsWith(`${prefix}solution`)) {

        //Variables
        input = (parseInt(message.content.split(" ")[1]))
        question = parseInt(' ')

        //Obtaining information from input
        if (isNaN(input) == true && isNaN(parseInt(chosenQuestion)) == false) {
            question = parseInt(chosenQuestion);
        } else if (isNaN(input) != true) {
            question = input - 1
        }

        if (isNaN(question) == false) {
            if (data.questions[question].solution != null) {
                //If a solution exits, the user will be directly messaged the solution
                if (data.questions[question].solutionAuthor) {
                    message.author.send(`The solution to Question ${question + 1} is: ${data.questions[question].solution} \nSolution provided by: ${data.questions[question].solutionAuthor}`);
                }
                else {
                    message.author.send(`The solution to Question ${question + 1} is: ${data.questions[question].solution}`);
                }

            } else {
                message.reply(`There is currently no solution to question ${question + 1}. If you have one, feel free to contact an admin`);
            }
        } else {
            message.reply('No question inputted for the solution');
        }
    }



    // Adding a question
    else if (message.content.startsWith(`${prefix}addquestion`)) {
        if (message.member.roles.find(r => r.name === adminRole)) {
            if (message.content.replace(`${prefix}addquestion`, '') == '') {
                message.reply(`${prefix}addquestion question, difficulty, (solution), (image url)`)
            }
            else {
                let theQuestion = message.content.replace(`${prefix}addquestion`, '').split(',').map(item => item.trim())
                let newEntry = { question: theQuestion[0], difficulty: theQuestion[1], image: theQuestion[3], solution: theQuestion[2], solutionAuthor: message.author.username };

                if (data.questions.find(r => r.question.toLowerCase() === newEntry.question.toLowerCase())) {
                    message.reply("that question already exists...");
                }
                else {
                    data.questions.push(newEntry)
                    fs.writeFile("data.json", JSON.stringify(data, null, 4), function () { console.log(`successfully added question: ${theQuestion[0]}`) })
                    message.reply(`successfully added question: ${theQuestion[0]}`);
                }
            }
        }
        else {
            message.reply("you need to be an admin for that...")
        }
    }
    else if (message.content === `${prefix}update` || message.content === `${prefix}restart`) {
        if (message.member.roles.find(r => r.name === adminRole)) {
            message.channel.send('Restarting and checking for updates...');
            data.restartChannel = message.channel.id;
            data.dailyQuestionNumber = dailyQuestionNumber;
            fs.writeFileSync('data.json', JSON.stringify(data, null, 4));
            setTimeout(() => {
                shell.exec('./update.sh'); 
                message.channel.send('Failed to restart!');
            }, 1000); 
        }
        else {
            message.reply("you need to be an admin for that...")
        }
    }
});