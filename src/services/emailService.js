const nodemailer = require('nodemailer');

// Initialize transporter
// Use service: 'gmail' or direct smtp config if host is provided
let transporter;
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
        //service: 'gmail',
        host: "smtp.gmail.com",
         port: 587,
        secure: false,
        family: 4,
        auth: {
            user: emailUser,
            pass: emailPass
        },
        tls: {
        rejectUnauthorized: false
        }
    });
} else {
    console.warn('WARNING: EMAIL_USER and EMAIL_PASS are not configured in environment variables. Email notifications will be printed to console.');
}

/**
 * Generates the common HTML envelope wrapper for the emails.
 */
function generateEmailTemplate(title, preheader, contentHtml) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #333333;">
        <div style="display: none; font-size: 1px; color: #fff; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
            ${preheader}
        </div>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f7f6; padding: 20px 0;">
            <tr>
                <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
                        <!-- Header -->
                        <tr>
                            <td align="center" style="background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); padding: 30px 20px; color: #ffffff;">
                                <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">JU IIT Classroom Tracker</h1>
                                <p style="margin: 5px 0 0 0; font-size: 14px; color: #a0aec0; font-weight: 300;">Classroom & Batch Availability Tracker</p>
                            </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                ${contentHtml}
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td align="center" style="background-color: #fafbfc; padding: 20px; border-top: 1px solid #edf2f7; font-size: 12px; color: #a0aec0;">
                                <p style="margin: 0 0 5px 0;">This is an automated notification from IIT Classroom & Batch Tracker.</p>
                                <p style="margin: 0;">© 2026 Jahangirnagar University IIT. All rights reserved.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
}

/**
 * Send email notification to students.
 * 
 * @param {string} action - 'create' | 'cancel' | 'reschedule'
 * @param {object} details - details of the schedule
 * @param {Array<string>} recipientEmails - list of student email addresses
 */
async function sendScheduleNotification(action, details, recipientEmails) {
    if (!recipientEmails || recipientEmails.length === 0) {
        console.log(`[Email Service] No student emails found to notify for action: ${action}`);
        return;
    }

    let subject = '';
    let preheader = '';
    let contentHtml = '';

    const typeLabel = (details.scheduleType || 'class').toUpperCase();

    if (action === 'create') {
        subject = `[Classroom Tracker] New ${typeLabel} Scheduled: ${details.courseCode}`;
        preheader = `A new ${details.scheduleType} has been scheduled for ${details.courseCode}.`;
        contentHtml = `
            <h2 style="margin-top: 0; color: #2d3748; font-size: 20px; font-weight: 600;">New Session Scheduled</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #4a5568; margin-bottom: 25px;">
                Dear Students, a new <strong>${details.scheduleType || 'class'}</strong> has been scheduled for your batch. Here are the details:
            </p>
            <table border="0" cellpadding="10" cellspacing="0" width="100%" style="background-color: #f7fafc; border-radius: 8px; border-collapse: collapse; margin-bottom: 25px;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td width="30%" style="font-weight: 600; color: #718096; font-size: 14px;">Course</td>
                    <td style="color: #2d3748; font-size: 15px; font-weight: 500;">${details.courseCode} - ${details.courseTitle}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="font-weight: 600; color: #718096; font-size: 14px;">Teacher</td>
                    <td style="color: #2d3748; font-size: 15px; font-weight: 500;">${details.teacherName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="font-weight: 600; color: #718096; font-size: 14px;">Date</td>
                    <td style="color: #2d3748; font-size: 15px; font-weight: 500;">${details.scheduleDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="font-weight: 600; color: #718096; font-size: 14px;">Time Slot</td>
                    <td style="color: #2d3748; font-size: 15px; font-weight: 500;">Slot ${details.slotNo} (${details.startTime} - ${details.endTime})</td>
                </tr>
                <tr>
                    <td style="font-weight: 600; color: #718096; font-size: 14px;">Classroom</td>
                    <td style="color: #2d3748; font-size: 15px; font-weight: 500;">${details.roomNumber}</td>
                </tr>
            </table>
            <p style="font-size: 15px; line-height: 1.5; color: #718096; margin-top: 25px;">
                Please check your dashboard for the complete updated grid.
            </p>
        `;
    } else if (action === 'cancel') {
        subject = `[Classroom Tracker] CANCELLED: ${details.courseCode} ${typeLabel}`;
        preheader = `The scheduled ${details.scheduleType} for ${details.courseCode} has been cancelled.`;
        contentHtml = `
            <h2 style="margin-top: 0; color: #e53e3e; font-size: 20px; font-weight: 600;">Session Cancelled</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #4a5568; margin-bottom: 25px;">
                Dear Students, the following scheduled <strong>${details.scheduleType || 'class'}</strong> has been <strong>cancelled</strong> by the teacher.
            </p>
            <table border="0" cellpadding="10" cellspacing="0" width="100%" style="background-color: #fff5f5; border-radius: 8px; border-collapse: collapse; margin-bottom: 25px; border-left: 4px solid #e53e3e;">
                <tr style="border-bottom: 1px solid #fed7d7;">
                    <td width="30%" style="font-weight: 600; color: #c53030; font-size: 14px;">Course</td>
                    <td style="color: #9b2c2c; font-size: 15px; font-weight: 500;">${details.courseCode} - ${details.courseTitle}</td>
                </tr>
                <tr style="border-bottom: 1px solid #fed7d7;">
                    <td style="font-weight: 600; color: #c53030; font-size: 14px;">Teacher</td>
                    <td style="color: #9b2c2c; font-size: 15px; font-weight: 500;">${details.teacherName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #fed7d7;">
                    <td style="font-weight: 600; color: #c53030; font-size: 14px;">Date</td>
                    <td style="color: #9b2c2c; font-size: 15px; font-weight: 500;">${details.scheduleDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #fed7d7;">
                    <td style="font-weight: 600; color: #c53030; font-size: 14px;">Time Slot</td>
                    <td style="color: #9b2c2c; font-size: 15px; font-weight: 500;">Slot ${details.slotNo} (${details.startTime} - ${details.endTime})</td>
                </tr>
                <tr>
                    <td style="font-weight: 600; color: #c53030; font-size: 14px;">Classroom</td>
                    <td style="color: #9b2c2c; font-size: 15px; font-weight: 500;">${details.roomNumber}</td>
                </tr>
            </table>
            <p style="font-size: 15px; line-height: 1.5; color: #718096; margin-top: 25px;">
                Please check your dashboard for alternative slots.
            </p>
        `;
    } else if (action === 'reschedule') {
        subject = `[Classroom Tracker] RESCHEDULED: ${details.courseCode} ${typeLabel}`;
        preheader = `The scheduled ${details.scheduleType} for ${details.courseCode} has been rescheduled.`;
        contentHtml = `
            <h2 style="margin-top: 0; color: #dd6b20; font-size: 20px; font-weight: 600;">Session Rescheduled</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #4a5568; margin-bottom: 25px;">
                Dear Students, the scheduled <strong>${details.scheduleType || 'class'}</strong> for <strong>${details.courseCode} - ${details.courseTitle}</strong> has been rescheduled by the teacher.
            </p>
            
            <h3 style="color: #c53030; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Original Session (Cancelled)</h3>
            <table border="0" cellpadding="10" cellspacing="0" width="100%" style="background-color: #fff5f5; border-radius: 8px; border-collapse: collapse; margin-bottom: 25px; border-left: 4px solid #fc8181;">
                <tr style="border-bottom: 1px solid #fed7d7;">
                    <td width="30%" style="font-weight: 600; color: #9b2c2c; font-size: 13px;">Date</td>
                    <td style="color: #9b2c2c; font-size: 14px;">${details.oldDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #fed7d7;">
                    <td style="font-weight: 600; color: #9b2c2c; font-size: 13px;">Time Slot</td>
                    <td style="color: #9b2c2c; font-size: 14px;">Slot ${details.oldSlotNo} (${details.oldStartTime} - ${details.oldEndTime})</td>
                </tr>
                <tr>
                    <td style="font-weight: 600; color: #9b2c2c; font-size: 13px;">Classroom</td>
                    <td style="color: #9b2c2c; font-size: 14px;">${details.oldRoomNumber}</td>
                </tr>
            </table>

            <h3 style="color: #276749; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">New Session (Scheduled)</h3>
            <table border="0" cellpadding="10" cellspacing="0" width="100%" style="background-color: #f0fff4; border-radius: 8px; border-collapse: collapse; margin-bottom: 25px; border-left: 4px solid #48bb78;">
                <tr style="border-bottom: 1px solid #c6f6d5;">
                    <td width="30%" style="font-weight: 600; color: #22543d; font-size: 13px;">Date</td>
                    <td style="color: #22543d; font-size: 14px; font-weight: 500;">${details.newDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #c6f6d5;">
                    <td style="font-weight: 600; color: #22543d; font-size: 13px;">Time Slot</td>
                    <td style="color: #22543d; font-size: 14px; font-weight: 500;">Slot ${details.newSlotNo} (${details.newStartTime} - ${details.newEndTime})</td>
                </tr>
                <tr style="border-bottom: 1px solid #c6f6d5;">
                    <td style="font-weight: 600; color: #22543d; font-size: 13px;">Classroom</td>
                    <td style="color: #22543d; font-size: 14px; font-weight: 500;">${details.newRoomNumber}</td>
                </tr>
                <tr>
                    <td style="font-weight: 600; color: #22543d; font-size: 13px;">Teacher</td>
                    <td style="color: #22543d; font-size: 14px; font-weight: 500;">${details.teacherName}</td>
                </tr>
            </table>
        `;
    }

    const html = generateEmailTemplate(subject, preheader, contentHtml);
    await transporter.verify();
    console.log("SMTP working");
    if (transporter) {
        try {
            const info = await transporter.sendMail({
                from: `"JU IIT Classroom Tracker" <${emailUser}>`,
                bcc: recipientEmails.join(', '),
                to: emailUser, // Send to self so it's a valid email, BCC is the real list of students
                subject: subject,
                html: html
            });
            console.log(`[Email Service] Notification email sent successfully: ${info.messageId} (action: ${action}, recipients: ${recipientEmails.length})`);
        } catch (error) {
            console.error(`[Email Service] Failed to send notification email (action: ${action}):`, error);
        }
    } else {
        // Fallback: Log email details to the console if not configured
        console.log('======================================================================');
        console.log(`[MOCK EMAIL SENT]`);
        console.log(`Action: ${action.toUpperCase()}`);
        console.log(`To (BCC): ${recipientEmails.join(', ')}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body Snippet: ${preheader}`);
        console.log('======================================================================');
    }
}

module.exports = {
    sendScheduleNotification
};
