'use strict'

Object.defineProperty(exports, "__esModule", { value: true });
const Alexa = require("alexa-sdk");
const APP_ID = process.env.AWS_ALEXA_ID;
var async = require('async');
var request = require('request');
const cheerio = require('cheerio');
var Twit = require('twit');
var config = require("./Access/config.js");
var T = new Twit(config.twitterConfig);

const languageStrings = {
    'en': {
        translation: {
            HELLO_MESSAGE: 'Hi there, I am here to help with getting information about the bridge\'s status!',
            SKILL_NAME: 'Tay Bridge',
            HELP_MESSAGE: 'Ask me about the bridge\'s status',
            HELP_REPROMPT: 'What can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
        }
    }
};

const textResponses = {
    CouldNotGetStatus: "Something went wrong with getting the status",
    CouldNotGetTweet: "Something went wrong with getting the latest tweet",
    GeneralIssueShort: "Something went wrong, please try again in a few minutes",
    GeneralIssueLong: "Hm, something must have gone wrong, let me rest for a few minutes please and try again.",
    StatusSuccessPartial: "Bridge should be ",
    TweetSuccessPartial: "Latest tweet reads: ",
    StatusSuccessLaunch: "Here is the latest status: ",
    TweetSuccessLaunch: "Here is the latest tweet: "
}

var tparams = {
    user_id: 3994042942,
    count: 1,
    exclude_replies: true,
    include_rts: false,
    trim_user: true
}


const handlers = {
    'LaunchRequest': function () {
        // this.emit(":tell", this.t('HELLO_MESSAGE'));

        var myalexa = this;
        var mytwitter = T;

        var myResponses = {
            webSiteResponse: {},
            twitterResponse: {}
        }

        async.waterfall([
            function websiteStatusCall(step) {
                var myWebsiteResponse = {
                    Success: false,
                    Msg: ""
                }

                request('http://www.tayroadbridge.co.uk/', function (error, response, body) {
                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received    
                    if(error) {
                        myWebsiteResponse.Success = false;
                        myWebsiteResponse.Msg = textResponses.CouldNotGetStatus;
                    }
                    if(body) {
                        myWebsiteResponse.Success = true;
                        myWebsiteResponse.Msg = replyWithSentence("post", parseMyHtml(body));
                    }

                    step(null, myWebsiteResponse);
                });
            },          
            function latestTweetCall(myWebsiteResponse, step) {
                var myTwitterResponse = {
                    Success: false,
                    Msg: ""
                }

                mytwitter.get('statuses/user_timeline', tparams, function(err, data, response) {
                    var txt = data[data.length-1].text;
        
                    if(err) {
                        myTwitterResponse.Success = false;
                        myTwitterResponse.Msg = textResponses.CouldNotGetTweet;
                    }
                    if(data) {
                        myTwitterResponse.Success = true;
                        myTwitterResponse.Msg = txt;
                    }

                    step(null, [myWebsiteResponse, myTwitterResponse]);
                });
            }
            
          ], function(err, results){
            if( err ) {
          
              console.error('Error: '+err);
              myalexa.emit(":tell", textResponses.GeneralIssueShort);
          
            } else {
          
              console.log("Async success");
              myalexa.emit(":tell", myalexa.t('HELLO_MESSAGE') + " " + replyUsingBothResponses(results));
    
            }
          })
    },
    'GetTayBridgeInfo': function () {
        //this.emit(':tell', this.t('SKILL_NAME'));
        // return the string coming from your request here ^^^
        var myalexa = this;

        request('http://www.tayroadbridge.co.uk/', function (error, response, body) {
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received    
            if(error)
                myalexa.emit(":tell", textResponses.CouldNotGetStatus);
            if(body)
                myalexa.emit(":tell", replyWithSentence("post", parseMyHtml(body)));
        });

    },
    'GetTayBridgeLatestTweet': function () {
        var myalexa = this;

        T.get('statuses/user_timeline', tparams, function(err, data, response) {
            var txt = data[data.length-1].text;

            if(err)
                myalexa.emit(":tell", textResponses.CouldNotGetTweet);
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
            return textResponses.TweetSuccessPartial + status;
            break;
        case "post":
            return textResponses.StatusSuccessPartial + status;
            break;
        default:
            return status;
            break;
    }
}

function replyUsingBothResponses(arr) {
    if(arr.length == 2) {
        let myWebsiteResponse = arr[0];
        let myTwitterResponse = arr[1];
        var txt = "";

        if(myWebsiteResponse.Success && myTwitterResponse.Success) {
            txt = textResponses.StatusSuccessLaunch + myWebsiteResponse.Msg +
                " and " +
                textResponses.TweetSuccessLaunch + myTwitterResponse.Msg;
        } else if (myWebsiteResponse.Success) {
            txt = textResponses.StatusSuccessLaunch + myWebsiteResponse.Msg;
        } else if (myTwitterResponse.Success) {
            txt = textResponses.TweetSuccessLaunch + myTwitterResponse.Msg;
        } else {
            txt = textResponses.GeneralIssueLong
        }

        return txt;
    } else {
        return textResponses.GeneralIssueLong;
    }
}