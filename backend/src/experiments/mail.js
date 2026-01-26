import Mailjet from 'node-mailjet';
import dotenv from "dotenv";

dotenv.config();

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

const request = mailjet
  .post('send', { version: 'v3.1' })
  .request({
    Messages: [
      {
        From: {
          Email: 'tahsinanwar42@gmail.com', // TODO: give correct email address
          Name: 'Mailjet Pilot',
        },
        To: [
          {
            Email: 'tahsinanwar42@gmail.com',
            Name: 'passenger 1',
          },
        ],
        Subject: 'Your email flight plan!',
        TextPart:
          'Dear passenger 1, welcome to Mailjet! May the delivery force be with you!',
        HTMLPart:
          '<h3>Dear passenger 1, welcome to <a href="https://www.mailjet.com/">Mailjet</a>!</h3><br />May the delivery force be with you!',
      },
    ],
  });

request
  .then((result) => {
    console.log(result.body);
  })
  .catch((err) => {
    console.error(err.statusCode, err.message);
  });
