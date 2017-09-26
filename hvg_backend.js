'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const app = express()

app.use(cors());
app.use(bodyParser.json());

app.put('/mail', function (req, res) {
	const mailAdress = req.body.mail;
  	const content = req.body.content;

	nodemailer.createTestAccount((err, account) => {
		if(err) {
			res.send(err.message)
		} else {
			var transporter = nodemailer.createTransport(smtpTransport({
			  service: 'gmail',
			  host: 'smtp.gmail.com',
			  auth: {
			    user: 'emailsendingteszt@gmail.com',
			    pass: 'teszt123'
			  }
			}));

			console.log(content);
		    let mailOptions = {
		        from: '"Fred Foo 👻" <doczi.szilard@gmail.com>', // sender address
		        to: mailAdress + ', v.gaabor@gmail.com', // list of receivers
		        subject: 'Hello ✔', // Subject line
		        text: 'Hello world?' + content, // plain text body
		        html: '<b style= "color: red; font-size: 30px;">Hello world?'+ content +'</b>' // html body
		    };

		    // send mail with defined transport object
		    transporter.sendMail(mailOptions, (error, info) => {
		        if (error) {
		            return console.log(error);
		        }
		        console.log('Message sent: %s', info.messageId);
		        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
		        res.send('OK, mail sended!')
		    });
		}
	});
})

app.listen(3000, function() {
	console.log("Server is running on port: 3000");
});