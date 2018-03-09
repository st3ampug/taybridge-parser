module.exports = {
    alexaLanguageStrings: {
        'en': {
            translation: {
                HELLO_MESSAGE: 'Hi there, I am here to help with getting information about the Tay Bridge!',
                SKILL_NAME: 'Tay Bridge',
                HELP_MESSAGE: 'Lets see, what can I do, I can check the bridges status, read out the latest tweet, check the weather, predict if the bridge will be closed. Good luck!',
                HELP_REPROMPT: 'What can I help you with?',
                STOP_MESSAGE: 'Goodbye!',
            }
        }
    },
    CouldNotGetStatus: "Something went wrong with getting the status",
    CouldNotGetTweet: "Something went wrong with getting the latest tweet",
    CouldNotGetWeather: "Something went wrong with getting the weather information",
    GeneralIssueShort: "Something went wrong, please try again in a few minutes",
    GeneralIssueLong: "Hm, something must have gone wrong, let me rest for a few minutes please and try again.",
    StatusSuccessPartial: "Bridge should be ",
    TweetSuccessPartial: "Latest tweet reads: ",
    StatusSuccessLaunch: "Here is the latest status: ",
    TweetSuccessLaunch: "Here is the latest tweet: ",
    WebsiteUnrecognisedText: "Unrecognised text on website",
    Greetings: {
        Morning: [
            "Good morning, "
        ],
        Day: [
            "Good day, ",
            "Good afternoon, "
        ],
        Evening: [
            "Good evening, "
        ],
        General: [
            "Hi, ",
            "Howdy, ",
            "Hey there, "
        ]
    },
    Weather: {
        Intro: "In the next hours ",
        Visibility: "visibility should be ",
        Temperature: "temperature can be ",
        WindSpeed: "wind speeds could get to ",
        GustSpeed: "gust speeds might go up to ",
        Units: {
            Temp: "Celsius",
            Speed: "miles per hour"
        },
        Prediction: {
            Default: "I think that the bridge should be open in the coming hours ",
            Over45: "There is a chance that the bridge will be closed for double decker buses ",
            Over60: "There is a chance that the bridge will be closed for all vehicles except cars and single decker buses and pedestrians ",
            Over80: "There is a chance that the bridge will be closed for all vehicles " ,
            VisibilityAddition: "especially since visibility might be "
        }
    }
}