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

    setInterval(() => {
        //Daily Questions
        time = new Date();
        var i = 0;
        
        if(time.getHours() == 15 && time.getMinutes() == 40){ //that is 12:00, midday
            if (i == 0){
                client.channels.get('698306874986070046').send(`${time.getDate()+1}/${time.getMonth()+1}, Daily Question: ${data.dailyQuestions[0].question}`); 
                i++;
            }
        } else {i = 0;}
    }, 30000);
});

// needs to be defined globally
chosenQuestion = null;

client.on('message', message => {
    // Discord Command !question.
    if (message.content.startsWith(`${prefix}question`)) {
        chosenQuestion = null

        if (message.content.replace(`${prefix}question`, '').trim() != '') {
            // Selecting difficulty
            reqDifficulty = message.content.split(" ")[1];

            if (isNaN(reqDifficulty) == true) {
                message.reply(`Please enter a positive integer`);
            } else {

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
                }

                //if no questions exist of reqdifficulty
                else {
                    message.reply('there are no questions with that difficulty');
                }
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
            fs.writeFileSync('data.json', JSON.stringify(data, null, 4));
            shell.exec('./update.sh'); // This script should eventually stop the bot, so the below line is not run
            message.channel.send('Failed to restart!');
        }
        else {
            message.reply("you need to be an admin for that...")
        }
    }
});


let token = fs.readFileSync('token.txt');
client.login(String(token).replace(`\n`, ""));
