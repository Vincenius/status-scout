// https://developers.brevo.com/reference/createcontact#code-examples
import fs from 'fs'

function pdfToBase64(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString('base64');
}

export const createAccount = async ({ email, firstName, listId }) => {
  try {
    const result = await fetch(`https://api.brevo.com/v3/contacts/doubleOptinConfirmation`, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        email,
        attributes: {
          VORNAME: firstName,
        },
        includeListIds: [listId],
        templateId: 1,
        redirectionUrl: `${process.env.FRONTEND_URL}/confirmation`,
      })
    }).then(res => res.json())

    console.log('create account', result)

    return result
  } catch (error) {
    console.log(error)
  }
}

export const getTemplate = async (id) => {
  try {
    const template = await fetch(`https://api.brevo.com/v3/smtp/templates/${id}`, {
      method: "GET",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .catch(error => console.error("Fetch error:", error));

    return template;
  } catch (error) {
    console.log(error)
  }
}

export const sendEmail = async ({ to, subject, html, pdfFilePath, pdfFileName }) => {
  const attachment = pdfFileName && pdfFilePath ? {
    attachment: [{
      content: await pdfToBase64(pdfFilePath),
      name: pdfFileName,
    }]
  } : {}
  const body = {
    sender: {
      name: process.env.NEXT_PUBLIC_WEBSITE_NAME,
      email: process.env.SENDER_EMAIL
    },
    to: [{ email: to }],
    subject,
    htmlContent: html,
    replyTo: {
      email: process.env.SENDER_EMAIL
    },
    ...attachment,
  }

  const result = await fetch(`https://api.brevo.com/v3/smtp/email`, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY
    },
    body: JSON.stringify(body)
  }).then(res => res.json())

  console.log('send email', result)
}

