import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: config.NODE_ENV === 'production',
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: config.nodemailer_host_email,
      pass: config.nodemailer_host_pass,
    },
  });

  // await transporter.sendMail({
  //   // from: 'nurmdopu428@gmail.com', // sender address
  //   from: 'alamin.softvence@gmail.com',
  //   to, // list of receivers
  //   subject,
  //   text: '', // plain text body
  //   html, // html body
  // });
  try {
    await transporter.sendMail({
      from: 'alamin.softvence@gmail.com',
      to,
      subject,
      text: '',
      html,
    });
    console.log(`OTP email sent to: ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
// import nodemailer from 'nodemailer';

// (async () => {
//   const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 587,
//     secure: false,
//     auth: {
//       user: 'alamin.softvence@gmail.com',
//       pass: 'acrz dujg iwur gniw', // App password
//     },
//   });

//   try {
//     await transporter.sendMail({
//       from: 'alamin.softvence@gmail.com',
//       to: 'alamin50cse.miu@gmail.com',
//       subject: 'Testing OTP Email',
//       html: `<p>Your test OTP is: <b>123456</b></p>`,
//     });

//     console.log('✅ Test Email Sent!');
//   } catch (err) {
//     console.error('❌ Error sending email:', err);
//   }
// })();
