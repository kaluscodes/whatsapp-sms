const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
const mysql = require('mysql');

const con = mysql.createConnection({
    connectionLimit: 10,
    host: "localhost",
   // port: 21,
    user: "root",
    password: "",
    database: "ojaa",
});


///CALL TO AUTHENTICATION 
app.get('/whatsapp/api/authenticate', (req,res) => {
    var myqr = "";
    var x = 0;
        const { Client } = require('whatsapp-web.js');
        const { MessageMedia } = require('whatsapp-web.js');

        const client = new Client({
            puppeteer: {
                executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
            }
        });

    var user = req.body.user;
    client.on('qr', qr => {
        if(x == 0){
            myqr = qr;
        }  
   });
    return res.send({
        qr_code: myqr,
        statusError: 200
    });

            // Save session values to the file upon successful auth
client.on('authenticated', (session) => {
    sessionData = session;
   
con.connect(function(err) {
    if (err) throw err;
    con.query("SELECT * FROM browser_sessions WHERE user = " + user, function (err, result, fields) {
      if (err){
        console.log(err);
      }else{
        if(result.length == 1){
            con.query("UPDATE `browser_sessions` SET `session` = '" + JSON.stringify(sessionData) + "' WHERE user = " + user);
        }else{
            con.query("INSERT INTO `browser_sessions` (`id`, `user`, `session`, `date_added`) VALUES (NULL, '" + user + "', '" + JSON.stringify(sessionData) + "', current_timestamp())");
        }
      }
    });
  });

});

client.initialize();


});
///END OF AUTHENTICATION 



    ///SEND MESSAGE CALL

    //send message
app.post('/whatsapp/api/message', (req,res) => {
    const phone = req.body.number + '@c.us';
    const message = req.body.message;
    const user = req.body.user;
    if(phone.length < 13){
        return res.status(404).send({
            statusError: 404,
            reply: 'Phone number must have country code without special characters'
        });
    }
    if(message.length < 1){
        return res.status(404).send({
            statusError: 404,
            reply: 'You must incude a message to send!'
        });
    }

    con.connect(function(err) {
        if (err) throw err;
        con.query("SELECT * FROM browser_sessions WHERE user = '" + user + "' AND session != '' ", function (err, result, fields) {
          if (err){
            return res.send({
                statusError: 500,
                errorText: "something went wrong"
            });
          }else{
            if(result.length == 1){
                let sessionData = result[0].session;
                //send message with existing session
                const { Client } = require('whatsapp-web.js');
                const { MessageMedia } = require('whatsapp-web.js');
                // Use the saved values
                const client = new Client({
                    session: sessionData
                });

                
                client.on('auth_failure', msg => {
                    // Fired if session restore was unsuccessfull
                    return res.send({
                        statusError: 500,
                        errorText: "session ended"
                    });
                });
                ///send message
                if(client.sendMessage(phone, message)){
                    return res.send({
                        text: message,
                        destination: phone,
                        statusError: 200
                    });
                } else { 
                   return res.send({
                        statusError: 500
                    });
                } 


               
            }else{
                //no existing session for this user
                return res.send({
                    statusError: 500,
                    errorText: "no session"
                });
            }
          }
        });
      });


      client.initialize();

 
});
    ///END OF SEND MESSAGE CALL
 

    

    
   ///CALL FOR SEND MEDIA  
app.post('/whatsapp/api/sendmedia', (req,res) => {
    var number = req.body.number;
    var media = req.body.media;
    var mediaType = req.body.mediatype;
    var mediacaption = req.body.caption;
    const user = req.body.user;
    if(number.length < 13){
        return res.status(404).send({
            statusError: 404,
            errorText: 'Phone number must have country code without special characters'
        });
    }

    if(media.length < 1){
        return res.status(404).send({
            statusError: 404,
            errorText: 'no media'
        });
    }

    con.connect(function(err) {
        if (err) throw err;
        con.query("SELECT * FROM browser_sessions WHERE user = '" + user + "' AND session != '' ", function (err, result, fields) {
          if (err){
            return res.send({
                statusError: 500,
                errorText: "something went wrong"
            });
          }else{
            if(result.length == 1){
                let sessionData = result[0].session;
                //send message with existing session
                const { Client } = require('whatsapp-web.js');
                const { MessageMedia } = require('whatsapp-web.js');
                // Use the saved values
                const client = new Client({
                    session: sessionData
                });

                
                client.on('auth_failure', msg => {
                    // Fired if session restore was unsuccessfull
                    return res.send({
                        statusError: 500,
                        errorText: "session ended"
                    });
                });
                ///send message
                const mediaa = new MessageMedia(mediaType, media);
                if(client.sendMessage(number + '@c.us', mediaa, { caption: mediacaption })){
                    //send 200 status
                    res.status(200).send({
                        statusError: 200,
                        errorText: 'media sent!'
                    });
                }else{
                    //send 404 status
                    res.send({
                        statusError: 400,
                        errorText: 'Not sent!'
                    });
                }


               
            }else{
                //no existing session for this user
                return res.send({
                    statusError: 500,
                    errorText: "no session"
                });
            }
          }
        });
      });


      client.initialize();

 
});
    ///END OF SEND MEDIA CALL


    //check if client is authenticated

app.get('/whatsapp/api/clientstatus',(req,res) => {
    const user = req.body.user;

    con.connect(function(err) {
        if (err) throw err;
        con.query("SELECT * FROM browser_sessions WHERE user = '" + user + "' AND session != '' ", function (err, result, fields) {
          if (err){
            return res.send({
                statusError: 500,
                errorText: "something went wrong"
            });
          }else{
            if(result.length == 1){
                let sessionData = result[0].session;
                //send message with existing session
                const { Client } = require('whatsapp-web.js');
                const { MessageMedia } = require('whatsapp-web.js');
                // Use the saved values
                const client = new Client({
                    session: sessionData
                });

                
                client.on('auth_failure', msg => {
                    // Fired if session restore was unsuccessfull
                    return res.send({
                        statusError: 500,
                        errorText: "session ended"
                    });
                }); 

                return res.send({
                    statusError: 200,
                        errorText: "session on"
                });

            }else{
                //no existing session for this user
                return res.send({
                    statusError: 500,
                    errorText: "no session"
                });
            }
          }
        });
      });


    client.initialize();
});


















 

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started at ${port}...`));


 
