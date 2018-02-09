'use strict'

Object.defineProperty(exports, "__esModule", { value: true });
const Alexa = require("alexa-sdk");
const APP_ID = process.env.AWS_ALEXA_ID;
var request = require('request');
const cheerio = require('cheerio');
var Twit = require('twit');
var config = require("./Access/config.js");
var T = new Twit(config.twitterConfig);

const languageStrings = {
    'en': {
        translation: {
            HELLO_MESSAGE: 'Hi there! Ask me about the bridge\'s status',
            SKILL_NAME: 'Tay Bridge',
            HELP_MESSAGE: 'Ask me about the bridge\'s status',
            HELP_REPROMPT: 'What can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
        }
    }
};

var tparams = {
    user_id: 3994042942,
    count: 1,
    exclude_replies: true,
    include_rts: false,
    trim_user: true
}


const handlers = {
    'LaunchRequest': function () {
        this.emit(":tell", this.t('HELLO_MESSAGE'));
    },
    'GetTayBridgeInfo': function () {
        //this.emit(':tell', this.t('SKILL_NAME'));
        // return the string coming from your request here ^^^
        var myalexa = this;

        request('http://www.tayroadbridge.co.uk/', function (error, response, body) {
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received    
            if(error)
                myalexa.emit(":tell", "Something went wrong when getting the status from the webpage");
            if(body)
                myalexa.emit(":tell", replyWithSentence("post", parseMyHtml(body)));
        });

    },
    'GetTayBridgeLatestTweet': function () {
        var myalexa = this;

        T.get('statuses/user_timeline', tparams, function(err, data, response) {
            var txt = data[data.length-1].text;

            if(err)
                myalexa.emit(":tell", "Something went wrong when getting the latest tweet");
            if(data)
                myalexa.emit(":tell", replyWithSentence("tweet", txt));
        });
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_MESSAGE');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
};
  
exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

function parseMyHtml(requestBody) {
    const $ = cheerio.load(requestBody);
    console.log($('.statusHighlight').text());
    return $('.statusHighlight').text();
}

function replyWithSentence(type, status) {
    switch(type) {
        case "tweet":
            return "Latest tweet reads: " + status;
            break;
        case "post":
            return "Bridge should be " + status;
            break;
        default:
            return status;
            break;
    }
}

function getLatestTweet(tparams) {

}