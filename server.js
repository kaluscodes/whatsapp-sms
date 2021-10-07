const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

const { Client } = require('whatsapp-web.js');
const client = new Client();

const { MessageMedia } = require('whatsapp-web.js');

//send whatsapp QRcode for authentication
app.get('/whatsapp/api/authenticate', (req,res) => {
    client.on('qr', qr => {
        const codeRes = {
            qrcode_data: qr,
            statusError: 200
        };
        res.send(codeRes);
        
    });
});

//check if client is authenticated

app.get('/whatsapp/api/clientstatus',(req,res) => {
    client.on('ready', () => {
       const codeRes = {
        clientstatus: 'ready',
        statusError: 200
       };
       return res.send(codeRes);
    });

    res.send('scan QRcode');
    
});

//send message
app.post('/whatsapp/api/message', (req,res) => {
    const phone = req.body.number + '@c.us';
    const message = req.body.message;
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
    if(client.sendMessage(phone, message)){
        return res.send({
            text: message,
            destination: phone,
            statusError: 200
        });
    } else { 
        res.send({
            statusError: 500
        });
    } 
});

//send media image

app.post('/whatsapp/api/sendmedia', (req,res) => {
    var number = req.body.number;
    var media = req.body.media;
    var mediaType = req.body.mediatype;
    var mediacaption = req.body.caption;
    if(media.length > 0 && number.length == 13){
        if(mediacaption.length < 1){
            mediacaption = '';
        }
        //send media
        const mediaa = new MessageMedia(mediaType, media);
        if(client.sendMessage(number + '@c.us', mediaa, { caption: mediacaption })){
            //send 200 status
            res.status(200).send({
                statusError: 200,
                reply: 'media sent!'
            });
        }else{
            //send 404 status
            res.send({
                statusError: 400,
                reply: 'Not sent!'
            });
        }

    }else{
        res.status(404).send({
            reply: 'You must add media and Phone number must come with country code and no special characters like +',
            statusError: 404
        });
    }

});

 

/*
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
    client.sendMessage('2348085138481@c.us', 'Hello World');
});


client.on('message', message => {
	console.log(message.body + 'from: ' + message.from);
}); */



client.initialize();
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started at ${port}...`));


