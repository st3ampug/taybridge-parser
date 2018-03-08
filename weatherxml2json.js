var parser = require('xml2js');
var logger = require("./mylogger.js");

//var xml = '<?xml version="1.0" encoding="UTF-8"?><SiteRep><Wx><Param name="F" units="C">Feels Like Temperature</Param><Param name="G" units="mph">Wind Gust</Param><Param name="H" units="%">Screen Relative Humidity</Param><Param name="T" units="C">Temperature</Param><Param name="V" units="">Visibility</Param><Param name="D" units="compass">Wind Direction</Param><Param name="S" units="mph">Wind Speed</Param><Param name="U" units="">Max UV Index</Param><Param name="W" units="">Weather Type</Param><Param name="Pp" units="%">Precipitation Probability</Param></Wx><DV dataDate="2018-03-01T19:00:00Z" type="Forecast"><Location i="310063" lat="56.4621" lon="-2.9692" name="DUNDEE" country="SCOTLAND" continent="EUROPE" elevation="10.0"><Period type="Day" value="2018-03-01Z"><Rep D="E" F="-8" G="47" H="78" Pp="89" S="27" T="0" V="VP" W="27" U="1">900</Rep><Rep D="E" F="-8" G="47" H="74" Pp="82" S="31" T="0" V="VP" W="27" U="0">1080</Rep><Rep D="E" F="-9" G="47" H="97" Pp="68" S="34" T="-1" V="MO" W="22" U="0">1260</Rep></Period><Period type="Day" value="2018-03-02Z"><Rep D="E" F="-7" G="47" H="82" Pp="53" S="31" T="1" V="VG" W="24" U="0">0</Rep><Rep D="ENE" F="-7" G="43" H="80" Pp="50" S="29" T="0" V="VG" W="24" U="0">180</Rep><Rep D="E" F="-7" G="43" H="85" Pp="64" S="29" T="0" V="GO" W="24" U="0">360</Rep><Rep D="E" F="-6" G="40" H="83" Pp="62" S="27" T="1" V="VG" W="24" U="1">540</Rep><Rep D="E" F="-6" G="38" H="79" Pp="58" S="27" T="1" V="GO" W="24" U="1">720</Rep><Rep D="E" F="-6" G="38" H="86" Pp="58" S="27" T="1" V="GO" W="24" U="1">900</Rep><Rep D="E" F="-5" G="36" H="86" Pp="55" S="22" T="1" V="GO" W="24" U="0">1080</Rep><Rep D="E" F="-5" G="34" H="87" Pp="61" S="22" T="1" V="GO" W="24" U="0">1260</Rep></Period><Period type="Day" value="2018-03-03Z"><Rep D="E" F="-5" G="31" H="81" Pp="20" S="20" T="2" V="VG" W="8" U="0">0</Rep><Rep D="E" F="-5" G="31" H="85" Pp="51" S="20" T="1" V="VG" W="24" U="0">180</Rep><Rep D="E" F="-5" G="31" H="87" Pp="53" S="20" T="1" V="VG" W="24" U="0">360</Rep><Rep D="E" F="-4" G="29" H="79" Pp="53" S="20" T="2" V="VG" W="24" U="1">540</Rep><Rep D="E" F="-4" G="27" H="82" Pp="57" S="18" T="2" V="GO" W="24" U="1">720</Rep><Rep D="E" F="-4" G="25" H="79" Pp="54" S="16" T="2" V="VG" W="24" U="1">900</Rep><Rep D="E" F="-4" G="25" H="82" Pp="15" S="16" T="2" V="VG" W="8" U="0">1080</Rep><Rep D="E" F="-4" G="25" H="79" Pp="14" S="16" T="2" V="VG" W="8" U="0">1260</Rep></Period><Period type="Day" value="2018-03-04Z"><Rep D="E" F="-3" G="25" H="79" Pp="13" S="16" T="2" V="VG" W="8" U="0">0</Rep><Rep D="E" F="-3" G="22" H="81" Pp="14" S="13" T="2" V="VG" W="8" U="0">180</Rep><Rep D="E" F="-3" G="22" H="81" Pp="15" S="13" T="2" V="GO" W="8" U="0">360</Rep><Rep D="E" F="-3" G="25" H="82" Pp="17" S="16" T="2" V="GO" W="8" U="1">540</Rep><Rep D="E" F="-3" G="25" H="76" Pp="17" S="16" T="2" V="GO" W="8" U="1">720</Rep><Rep D="E" F="-2" G="25" H="77" Pp="17" S="16" T="3" V="GO" W="8" U="1">900</Rep><Rep D="ENE" F="-3" G="22" H="86" Pp="16" S="16" T="2" V="GO" W="7" U="0">1080</Rep><Rep D="ENE" F="-3" G="25" H="86" Pp="49" S="16" T="2" V="GO" W="12" U="0">1260</Rep></Period><Period type="Day" value="2018-03-05Z"><Rep D="ENE" F="-3" G="22" H="88" Pp="21" S="13" T="2" V="GO" W="8" U="0">0</Rep><Rep D="ENE" F="-3" G="22" H="89" Pp="22" S="13" T="2" V="GO" W="8" U="0">180</Rep><Rep D="ENE" F="-3" G="22" H="90" Pp="18" S="13" T="2" V="GO" W="7" U="0">360</Rep><Rep D="ENE" F="-2" G="22" H="89" Pp="55" S="13" T="2" V="GO" W="12" U="1">540</Rep><Rep D="ENE" F="-1" G="25" H="83" Pp="52" S="13" T="3" V="GO" W="12" U="1">720</Rep><Rep D="ENE" F="-1" G="22" H="83" Pp="18" S="13" T="3" V="GO" W="8" U="1">900</Rep><Rep D="ENE" F="-2" G="20" H="87" Pp="18" S="13" T="3" V="GO" W="8" U="0">1080</Rep><Rep D="ENE" F="-2" G="22" H="89" Pp="20" S="13" T="2" V="GO" W="8" U="0">1260</Rep></Period></Location></DV></SiteRep>';
var x2j = require("./weatherxml2json.js");

module.exports = {
    parseXmlIntoJSON
}

// To export

function parseXmlIntoJSON(xml) {
    //logger.LOG(xml);

    return new Promise(
        function (resolve, reject) {
            parser.parseString(xml, function (err, result) {
                if(err) {
                    var empty = { timesteps: [] };
                    console.error(err);

                    reject(empty);
                } else {
                    //logger.LOG(result.SiteRep.DV[0].Location[0].Period[1].Rep);
        
                    var json = result.SiteRep.DV[0].Location[0].Period[1];
        
                    var parsedToday = {
                        timesteps: []
                    }
        
                    for(var i = 0; i < json.Rep.length; i++) {
                        var ts = {
                            time: {value: 0},
                            wind_speed: {value: 0},
                            wind_gust: {value: 0},
                            visibility: {value: "XX"},
                            temperature: {value: 0}
                        }
        
                        var r = json.Rep[i];;
                        
                        ts.time.value = r._ / 60;
                        ts.wind_speed.value = r.$.S;
                        ts.wind_gust.value = r.$.G;
                        ts.visibility.value = r.$.V;
                        ts.temperature.value = r.$.T;
        
                        parsedToday.timesteps.push(ts);
                    }

                    resolve(parsedToday);
                }
            });
        }
    );
}


// Private
