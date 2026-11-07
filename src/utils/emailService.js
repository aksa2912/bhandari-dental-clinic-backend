const { Resend } = require('resend');

// This reads the key from your .env file
const resend = new Resend(process.env.RESEND_API_KEY);

const sendBookingEmail = async (appointment) => {
  try {
    const formattedTime = new Date(appointment.start_time).toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    // 1. Email to Clinic (Admin)
    await resend.emails.send({
      from: 'Bhandari Dental Clinic <onboarding@resend.dev>', 
      to: process.env.EMAIL_USER, // Your Gmail (from .env)
      subject: `New Booking: ${appointment.patient_name}`,
      html: `
        <h2>New Booking Confirmed!</h2>
        <p><strong>Patient:</strong> ${appointment.patient_name}</p>
        <p><strong>Phone:</strong> ${appointment.patient_phone}</p>
        <p><strong>Email:</strong> ${appointment.patient_email}</p>
        <p><strong>Time:</strong> ${formattedTime}</p>
      `,
    });
    console.log('✅ Clinic email sent via Resend');

    // 2. Email to Patient (Confirmation)
    if (appointment.patient_email) {
      await resend.emails.send({
        from: 'Bhandari Dental Clinic <onboarding@resend.dev>',
        to: appointment.patient_email,
        subject: `Appointment Confirmed - Bhandari Dental Clinic`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #1e40af; text-align: center;">Appointment Confirmed</h2>
            <p>Dear <strong>${appointment.patient_name}</strong>,</p>
            <p>Your appointment at Bhandari Dental Clinic has been successfully confirmed.</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${formattedTime}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${appointment.patient_phone}</p>
            </div>
            <p style="color: #64748b; font-size: 14px;">If you need to reschedule or cancel, please contact the clinic directly.</p>
            <br/>
            <p>Warm regards,</p>
            <p><strong>Bhandari Dental Clinic</strong></p>
          </div>
        `,
      });
      console.log('✅ Patient email sent via Resend');
    }

  } catch (error) {
    console.error('❌ Resend email error:', error);
  }
};

module.exports = { sendBookingEmail };