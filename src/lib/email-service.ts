import AWS from "aws-sdk";

const ses = new AWS.SES({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export interface EmailParams {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  from,
}: EmailParams) {
  const recipients = Array.isArray(to) ? to : [to];

  const params = {
    Source: `"${from || "Emailer"}" <no-reply@email.soorajrao.in>`,
    Destination: { ToAddresses: recipients },
    Message: {
      Subject: { Data: subject },
      Body: {
        ...(html ? { Html: { Data: html } } : { Text: { Data: text || "" } }),
      },
    },
  };

  return ses.sendEmail(params).promise();
}

export async function sendBulkEmail(emails: EmailParams[]) {
  const results = [];

  for (const email of emails) {
    try {
      const result = await sendEmail(email);
      results.push({
        success: true,
        messageId: result.MessageId,
        to: email.to,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      let errorMessage = "unknown";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      results.push({ success: false, error: errorMessage, to: email.to });
    }
  }

  return results;
}
