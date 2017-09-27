'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const pg = require('pg');
const fs = require('fs');

const app = express()

app.use(cors());
app.use(bodyParser.json());

const table = process.env.TABLE;


// adatbázis beállítás
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
//behúzza az adatbázis adatait
module.exports.query = function (text, values, callback) {
  console.log('query:', text, values);
  return pool.query(text, values, callback);
};


app.put('/', function (req, res) {
	const mailAdress = req.body.mail;
	const name = req.body.name;
	const role = req.body.role;
	
  	//új sor a db-be
  	pool.query('INSERT INTO ' + table + ' (name, email, role) VALUES($1, $2, $3);', [name , mailAdress, role], function(err, result) {
    	if(err) {
        	res.json({ "error": err.message });
    	} else {
    		nodemailer.createTestAccount((err, account) => {
				if(err) {
					res.send(err.message)
				} else {
					// email config
					var transporter = nodemailer.createTransport(smtpTransport({
					  service: 'gmail',
					  host: 'smtp.gmail.com',
					  auth: {
					    user: 'emailsendingteszt@gmail.com',
					    pass: 'teszt123'
					  }
					}));

					fs.readFile("./attachments/"+ role +".doc", function (err, data) {

					    let mailOptions = {
					        from: '"4iG Nyrt."<emailsendingteszt@gmail.com>', // sender address
					        to: mailAdress, // list of receivers
					        subject: "Állásajánlat információ", // Subject line
					        text: '4iG', // plain text body
					        html: '<h3>Kedves '+name+'!</h3><p> Köszönjük hogy jelentkezett ajánlatunkra, ezuttal küldjük önnek a további információkat.</p>', // html body
					        attachments: [{'filename': role+".doc", 'content': data}]
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
					})
				}
			});
        }	
    });
})

app.get('/admin', function (req, res) {
	
  	pool.query('SELECT * FROM ' + table + ' ;', function(err, result) {
    	if(err) {
        	res.json({ "error": err.message });
    	} else {
    		nodemailer.createTestAccount((err, account) => {
				if(err) {
					res.send(err.message)
				} else {
					// email config
					var transporter = nodemailer.createTransport(smtpTransport({
					  service: 'gmail',
					  host: 'smtp.gmail.com',
					  auth: {
					    user: 'emailsendingteszt@gmail.com',
					    pass: 'teszt123'
					  }
					}));
					
					let csvContent = "Jelentkező Neve: , E-mail Címe: , Feladatkör: ,";			

					for(var i = 0; i < result.rows.length; i++) { 
						csvContent += result.rows[i].name+','+result.rows[i].email+','+result.rows[i].role+'\n'; 
					}

					console.log(csvContent)

				    let mailOptions = {
				        from: '"4iG Nyrt."<emailsendingteszt@gmail.com>', // sender address
				        to: 'doczi.szilard@gmail.com, varga.gabor@axis.hu', // list of receivers
				        subject: "Jelentkezők", // Subject line
				        text: '4iG', // plain text body
				        html: "<h3>A jelentkezők Listája.</h3>", // html body
					    attachments: [{'filename': "Jelentkezok.csv", 'content': csvContent}]
				    	
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