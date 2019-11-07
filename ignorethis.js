    // Discord Command !solution
    else if(message.content.startsWith(`${prefix}solution`)){

        //Variables
        input=(parseInt(message.content.split(" ")[1]))
        question = null;
        
        //Obtaining information from input
        if(input == Nan && solution != null){
            question = choosenQuestion;
        } else if(input != Nan){
            question = input-1
        }

        if(question != Nan){
            if(data[question].solution != null){
                //If a solution exits, the user will be directly messaged the solution
                if(data[question].solutionAuthor) {
                    message.author.send(`The solution to Question ${question + 1} is: ${data[question].solution} \nSolution provided by: ${data[question].solutionAuthor}`);
                }
                else {
                    message.author.send(`The solution to Question ${question + 1} is: ${data[question].solution}`);
                }
                
            } else {
                message.reply(`There is currently no solution to question ${question+1}. If you have one, feel free to contact an admin`);
            }
        } else {
            message.reply('No question inputted for the solution');
            }
        }





        

        if(question != null){
        if(data[question].solution != null){
            //If a solution exits, the user will be directly messaged the solution
            if(data[question].solutionAuthor) {
                message.author.send(`The solution to Question ${question + 1} is: ${data[question].solution} \nSolution provided by: ${data[question].solutionAuthor}`);
            }
            else {
                message.author.send(`The solution to Question ${question + 1} is: ${data[question].solution}`);
            }
            
        } else {
            message.reply(`There is currently no solution to question ${question+1}. If you have one, feel free to contact an admin`);
        }
    } else {
        message.reply('No question inputted for the solution');
    }
}









 //Obtaining information from input
 if(isNaN(input) == false){
    question = input-1
}
else if(choosenQuestion != null && input == NaN){
    question = choosenQuestion;
}

if(isNaN(question) == false){
if(data[question].solution != Nan){
    //If a solution exits, the user will be directly messaged the solution
    if(data[question].solutionAuthor) {
        message.author.send(`The solution to Question ${question + 1} is: ${data[question].solution} \nSolution provided by: ${data[question].solutionAuthor}`);
    }
    else {
        message.author.send(`The solution to Question ${question + 1} is: ${data[question].solution}`);
    }
    
} else {
    message.reply(`There is currently no solution to question ${question+1}. If you have one, feel free to contact an admin`);
}
} else {
message.reply('No question inputted for the solution');
}