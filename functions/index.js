const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise');

const app = express();

// Your Page Access Token from the Facebook App Dashboard
const PAGE_ACCESS_TOKEN = 'EAADxD5OQ7GgBO0MaQUM2liLsPlLYL1D23nuZCTGLEjSDGe9dIa47rOkMFzb7W2tZCheowZC2maaYKY62S7sykLM08mZAP31RJZBR4KLv4BqCl2Up3bxkQOzC5V6pFXN7byrgnurZCe1fKusyVR2frRbNtZAXs0j8VUqO5f51ZA1vd7ZBzyC6pNMS8sGLZB94RpwuULGDZBxE8HX93ZBDYhMQ';
const VERIFY_TOKEN = 'EAADxD5OQ7GgBO34EDzn7e6d3gU2jroBy2XlmGu7Q8iRtyOtXBZAoZBJbNXEuH7mbiWXhR9QIZCEoNSlUgnaoJF0XMOIUdFhluwDOWO6rw3q2xjP1KekCmojUccOx5WKhUi2Got25FRfvkjKZAKHRorTAGzhnUl6QKwa9uUyZCZBe1ZBNrp7TIFGioy6tbzgjkGRN093pPZCa8ZCoRYi6Q';  // Choose a secure token

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// For Facebook verification
app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong token');
});

// To handle messages
app.post('/webhook', (req, res) => {
    let messaging_events = req.body.entry[0].messaging;
    for (let i = 0; i < messaging_events.length; i++) {
      let event = messaging_events[i];
      
      if (event.message && event.message.text) {
        sendTextMessage(event.sender.id, "Text received from new code base, echo: " + event.message.text);
      } else if (event.postback && event.postback.payload) {
        handlePostback(event.sender.id, event.postback.payload);
      }
    }
    res.sendStatus(200);
  });

function sendTextMessage(sender, text) {
  let messageData = { text: text };
  request({
    url: 'https://graph.facebook.com/v18.0/me/messages',  // Use the appropriate API version
    qs: { access_token: `${PAGE_ACCESS_TOKEN}` },
    method: 'POST',
    json: {
      recipient: { id: sender },
      message: messageData,
    }
  });
}

function handlePostback(sender, payload) {
    if (payload === 'GET_STARTED_PAYLOAD') {
      //sendTextMessage(sender, "Hello! How can I assist you today?");
      sendQuickReplies(sender);
    }
    if (payload === 'DINE_IN_PAYLOAD') {
      sendTextMessage(sender, "What do you want to order?");
    }
    if (payload === 'TAKE_AWAY_PAYLOAD') {
      sendTextMessage(sender, "Are you sure you want to take away?");
    }    
    // Handle other postbacks here
}

function sendQuickReplies(sender) {
    let messageData = {
        attachment: {
            type: "template",
            payload: {
                template_type: "generic",
                elements: [
                    {
                        title: "Welcome to MagicIceCream",
                        subtitle: "Choose an option below:",
                        image_url: "https://scontent.fmru3-1.fna.fbcdn.net/v/t39.30808-6/355135977_578983624414745_4338409902758631795_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a2f6c7&_nc_ohc=tmabwWSjdNwAX8FxNZq&_nc_ht=scontent.fmru3-1.fna&oh=00_AfCEtzaEgO6jzQ4EZ69Y-A6mRw1cBTbmTjoFKrwSAGzEdQ&oe=6512A313",
                        buttons: [
                            {
                                type: "postback",
                                title: "DINE IN",
                                payload: "DINE_IN_PAYLOAD"
                            },
                            {
                                type: "postback",
                                title: "TAKE AWAY",
                                payload: "TAKE_AWAY_PAYLOAD"
                            }
                        ]
                    }
                ]
            }
        }
    };

  request({
    url: 'https://graph.facebook.com/v18.0/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: {
      recipient: { id: sender },
      message: messageData,
    }
  });
}

exports.chatbot = functions.https.onRequest(app);
