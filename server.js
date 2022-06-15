const express = require('express');
const bodyParser = require('body-parser');
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

require('dotenv').config()

app.get('/', (req, res) => {
    res.send('Hello InterDM!')
})

app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.VERIFY_TOKEN

    // Parse the query params
    let mode = req.query['hub.mode']
    let token = req.query['hub.verify_token']
    let challenge = req.query['hub.challenge']

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED')
            res.status(200).send(challenge)

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403)
        }
    }
})

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {

    let body = req.body

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log(sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
              sendToDiscord(webhook_event.message);
            }
        })

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED')
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404)
    }

})

// Handles messages events
function sendToDiscord(received_message) {
  // Checks if the message contains text
  if (received_message.text) {    
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    got.post(`https://discord.com/api/v9/channels/${process.env.CHANNEL_ID}/messages`, {
      json: {
          content: received_message.text
      },
      headers: {
          authorization: process.env.AUTH
      }
    })
  }   
}

app.listen(process.env.PORT || 1337, '0.0.0.0', () => console.log('webhook is listening'))