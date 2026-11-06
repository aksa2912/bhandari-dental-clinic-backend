const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBookingEmail = async (appointment) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'kimmybhandari1984@gmail.com', // The clinic's email
      subject: `New Appointment: ${appointment.patient_name}`,
      html: `
        <h2>New Booking Confirmed!</h2>
        <p><strong>Patient:</strong> ${appointment.patient_name}</p>
        <p><strong>Phone:</strong> ${appointment.patient_phone}</p>
<p><strong>Time:</strong> ${new Date(appointment.start_time).toLocaleString('en-IN', { 
  timeZone: 'Asia/Kolkata', 
  weekday: 'short', 
  day: 'numeric', 
  month: 'short', 
  year: 'numeric',
  hour: '2-digit', 
  minute: '2-digit' 
})}</p>      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to clinic');
  } catch (error) {
    console.error('❌ Email error:', error);
  }
};

module.exports = { sendBookingEmail };