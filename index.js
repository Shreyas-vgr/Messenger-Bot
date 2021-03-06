'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})


app.post('/webhook/', function (req, res) {
let messaging_events = req.body.entry[0].messaging
for (let i = 0; i < messaging_events.length; i++) {
  let event = req.body.entry[0].messaging[i]
  let sender = event.sender.id
  if (event.message && event.message.text) {
	let text = event.message.text
	if (text === 'Shreyas') {
		sendGenericMessage(sender)
		continue
	}
	else{
		RatemyProf(sender,text);
		continue
	}
	sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200));
  }
  if (event.postback) {
	let text = event.postback
	//RatemyProf(sender,text.payload);
	sendTextMessage(sender, "Postback received: "+text.payload)
	continue
  }
}
res.sendStatus(200)
})

const token = "API_TOKEN"

function sendGenericMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Rate your professors",
                    "subtitle": "Select the professor you want to rate",
                    "image_url": "http://www.userlogos.org/files/logos/Karmody/Rate_My_Prof_01.png",                    
                    "buttons": [{
                        "type": "web_url",
                        "url": "http://www.ratemyprofessors.com/",
                        "title": "web url"
                    }, {
                        "type": "postback",
                        "title": "Ratings of professor",
                        "payload": "Enter the professor name",
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}



function RatemyProf(sender,text){
	console.log("SHREYAS text: ",text);
	var rmp = require("rmp-api");
	 
	var callback = function(professor) {
	  if (professor === null) {
		console.log("No professor found.");
		return;
	  }
	  sendTextMessage(sender ,"Name: " + professor.fname + " " + professor.lname);
	  sendTextMessage(sender ,"University: "+ professor.university);
	  sendTextMessage(sender ,"Quality: " + professor.quality);
	  sendTextMessage(sender ,"Easiness: " + professor.easiness);
	  sendTextMessage(sender ,"Helpfulness: " + professor.help);
	  sendTextMessage(sender ,"Average Grade: " + professor.grade);
	  sendTextMessage(sender ,"Chili: " + professor.chili);
	  sendTextMessage(sender ,"URL: " + professor.url);
	  sendTextMessage(sender ,"First comment: " + professor.comments[0]);
	};
	 
	rmp.get(text, callback);

}

