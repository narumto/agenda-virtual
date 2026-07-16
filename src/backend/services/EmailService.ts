import nodemailer from "nodemailer";

export class EmailService {
  private transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendConfirmationEmail(
    toEmail: string,
    appointmentId: string,
    clientName: string,
    serviceName: string,
    formattedDate: string,
    formattedTime: string
  ): Promise<void> {
    const confirmationLink = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/confirmar?id=${appointmentId}`;

    const mailOptions = {
      from: `"Agenda Virtual" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Confirme o seu agendamento",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <h2 style="color: #C49A82;">Olá, ${clientName}!</h2>
          <p>Recebemos a sua solicitação de agendamento. Para confirmar o seu horário, por favor clique no link abaixo:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationLink}" style="background-color: #C49A82; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 25px; display: inline-block;">
              Confirmar Agendamento
            </a>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Detalhes do agendamento:</strong></p>
          <ul>
            <li><strong>Serviço:</strong> ${serviceName}</li>
            <li><strong>Data:</strong> ${formattedDate}</li>
            <li><strong>Horário:</strong> ${formattedTime}</li>
          </ul>
          <p style="font-size: 12px; color: #999;">Caso não tenha solicitado este agendamento, desconsidere este e-mail.</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
