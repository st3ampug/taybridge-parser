'use strict'

Object.defineProperty(exports, "__esModule", { value: true });

const config            = require("./access/config.js");
const textResponses     = require("./text-responses.js");
var logger              = require("./utils/mylogger.js");
var wp                  = require("./utils/weatherparser.js");
var x2j                 = require("./utils/weatherxml2json.js");

var async               = require('async');
var request             = require('request');
const cheerio           = require('cheerio');
var moment              = require('moment-timezone');
var Twit                = require('twit');
const Alexa             = require("alexa-sdk");

const APP_ID            = process.env.AWS_ALEXA_ID;
var T                   = new Twit(config.twitter.twit_config);

const handlers = {
    'LaunchRequest': function () {
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

                mytwitter.get('statuses/user_timeline', config.twitter.tparams, function(err, data, response) {
        
                    if(err) {
                        myTwitterResponse.Success = false;
                        myTwitterResponse.Msg = textResponses.CouldNotGetTweet;
                    }
                    if(data) {
                        var txt = data[data.length-1].full_text;
                        myTwitterResponse.Success = true;
                        myTwitterResponse.Msg = txt;
                    }

                    step(null, [myWebsiteResponse, myTwitterResponse]);
                });
            }
            
          ], function(err, results) {
            if( err ) {
              console.error('Error: '+err);
              myalexa.emit(":tell", textResponses.GeneralIssueShort);
            } else {
              console.log("Async success");
              myalexa.emit(":tell", myalexa.t('HELLO_MESSAGE') + addPause(1) + replyUsingBothResponses(results));
            }
          })
    },
    'GetTayBridgeInfo': function() {
        //this.emit(':tell', this.t('SKILL_NAME'));
        // return the string coming from your request here ^^^
        var myalexa = this;

        request('http://www.tayroadbridge.co.uk/', function (error, response, body) {
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received    
            if(error)
                myalexa.emit(":tell", textResponses.CouldNotGetStatus);
            if(body)
                myalexa.emit(":tell", randomGreeting(getCurrentHour()) + replyWithSentence("post", parseMyHtml(body)));
        });

    },
    'GetTayBridgeLatestTweet': function() {
        var myalexa = this;

        T.get('statuses/user_timeline', config.twitter.tparams, function(err, data, response) {
            if(err)
                myalexa.emit(":tell", textResponses.CouldNotGetTweet);
            if(data) {
                var txt = data[data.length-1].full_text;
                myalexa.emit(":tell", randomGreeting(getCurrentHour()) + replyWithSentence("tweet", txt));
            }
        });
    },
    'GetWeatherInfo': function() {
        var myalexa = this;

        var url = "http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/xml/" + config.weather.location.siteid +
            "?res=" + config.weather.location.update +
            "&key=" + config.weather.apikey;

        request(url, function (error, response, body) {
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received    

            if(error) {
                console.error(error);
                myalexa.emit(":tell", textResponses.CouldNotGetWeather);
            }
            if(body) {

                x2j.parseXmlIntoJSON(body)
                .then(
                    function(res) {
                        var hour = getCurrentHour();
                        var txt = wp.whatIsTheWeather(res, hour); // WORKS
                        //var txt = wp.predictBridgeStatus(res, hour);
                        myalexa.emit(":tell", randomGreeting(getCurrentHour()) + txt);
                    }
                )
                .catch(
                    function(err) {
                        logger.LOG(err);
                        myalexa.emit(":tell", textResponses.CouldNotGetWeather);
                    }
                );
            }
        });
    },
    'PredictBridgeStatus': function() {
        var myalexa = this;

        var url = "http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/xml/" + config.weather.location.siteid +
            "?res=" + config.weather.location.update +
            "&key=" + config.weather.apikey;

        request(url, function (error, response, body) {
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received    

            if(error) {
                console.error(error);
                myalexa.emit(":tell", textResponses.CouldNotGetWeather);
            }
            if(body) {

                x2j.parseXmlIntoJSON(body)
                .then(
                    function(res) {
                        var hour = getCurrentHour();
                        var txt = wp.predictBridgeStatus(res, hour);
                        myalexa.emit(":tell", randomGreeting(getCurrentHour()) + txt);
                    }
                )
                .catch(
                    function(err) {
                        logger.LOG(err);
                        myalexa.emit(":tell", textResponses.CouldNotGetWeather);
                    }
                );
            }
        });
    },
    'AMAZON.HelpIntent': function() {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_MESSAGE');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function() {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
};
  
exports.handler = function(event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = textResponses.alexaLanguageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

// Private

function parseMyHtml(requestBody) {
    const $ = cheerio.load(requestBody);
    var txt;
    
    if($('.statusHighlight').text().length > 0)
        txt = textResponses.StatusSuccessPartial + $('.statusHighlight').text();
    else
        txt = $('.restrictionDescription').text();
    
    console.log(txt);
    return txt;
}

function replyWithSentence(type, status) {
    switch(type) {
        case "tweet":
            return textResponses.TweetSuccessPartial + status;
            break;
        case "post":
            if(status.length == 0)
                return textResponses.WebsiteUnrecognisedText;
            else
                return status;
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
                addPause(1) + " and " +
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

function addPause(num) {
    return "<break time='" + num + "s'/>"
}

function getCurrentHour() {
    return moment().tz("Europe/London").format('HH');
}

function randomGreeting(hour) {
    var myGreetings;

    if(hour >= 5 && hour < 12) {
        // Morning
        myGreetings = mergeArrays(textResponses.Greetings.Morning, textResponses.Greetings.General);
    } else if(hour >= 12 && hour < 17) {
        // Afternoon
        myGreetings = mergeArrays(textResponses.Greetings.Day, textResponses.Greetings.General);
    } else if(hour >= 17 && hour < 21) {
        // Evening
        myGreetings = mergeArrays(textResponses.Greetings.Evening, textResponses.Greetings.General);
    } else {
        // Night
        myGreetings = textResponses.Greetings.General;
    }

    return getRandomArrayItem(myGreetings);
}

function mergeArrays(a, b) {
    if(Array.isArray(a) && Array.isArray(b))
        return a.concat(b);
}

function getRandomArrayItem(arr) {
    if(Array.isArray(arr)) {
        var num = Math.floor((Math.random() * arr.length)); // random number from 0 to array's length
        return arr[num];
    } else {
        return "";
    }
}