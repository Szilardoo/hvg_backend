'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const pg = require('pg');

const app = express()

app.use(cors());
app.use(bodyParser.json());

const table = process.env.TABLE;

const config = {
  user: process.env.user,
  database: process.env.database,
  password: process.env.password, 
  host: process.env.host, 
  port: process.env.DATAPORT, 
  max: 10, 
  idleTimeoutMillis: 30000,
};

const pool = new pg.Pool(config);

module.exports.query = function (text, values, callback) {
  console.log('query:', text, values);
  return pool.query(text, values, callback);
};

app.put('/', function (req, res) {
	const mailAdress = req.body.mail;
	const name = req.body.name;
	const role = req.body.role;
	const subject = req.body.subject;
  	const content = req.body.content;

  	pool.query('INSERT INTO ' + table + ' (name, email, role) VALUES($1, $2, $3);', [name , mailAdress, role], function(err, result) {
    	if(err) {
        	res.json({ "error": err.message });
    	} else {
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
				        from: '<doczi.szilard@gmail.com>', // sender address
				        to: mailAdress, // list of receivers
				        subject: subject, // Subject line
				        text: '4iG', // plain text body
				        html: content  // html body
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
        }	
    });
})

app.listen(process.env.PORT || 3000, function() {
	console.log("Server is running on port: " + process.env.PORT);
});