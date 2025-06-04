// lib/email.ts
import nodemailer from 'nodemailer';

interface PasswordResetEmailData {
  to: string;
  name: string;
  resetUrl: string;
  userType: 'staff' | 'member';
}

// Создаем транспорт для отправки email
const createTransporter = () => {
  if (process.env.NODE_ENV === 'development') {
    // Для разработки используем Ethereal Email (тестовый сервис)
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }

  // Для продакшена используйте ваш SMTP сервис
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
  userType
}: PasswordResetEmailData) {
  const transporter = createTransporter();

  const userTypeText = userType === 'staff' ? 'персонала' : 'участника';
  const companyName = 'FitAccess';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Восстановление пароля</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        .security-tips { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Восстановление пароля</h1>
          <p>Запрос на сброс пароля ${userTypeText}</p>
        </div>
        
        <div class="content">
          <h2>Здравствуйте, ${name}!</h2>
          
          <p>Мы получили запрос на восстановление пароля для вашего аккаунта ${userTypeText} в системе ${companyName}.</p>
          
          <p>Для создания нового пароля нажмите на кнопку ниже:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Создать новый пароль</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ Важная информация:</strong>
            <ul>
              <li>Ссылка действительна в течение 1 часа</li>
              <li>Если вы не запрашивали сброс пароля, проигнорируйте это письмо</li>
              <li>Никому не передавайте эту ссылку</li>
            </ul>
          </div>
          
          <div class="security-tips">
            <strong>🛡️ Советы по безопасности:</strong>
            <ul>
              <li>Используйте уникальный пароль для каждого сервиса</li>
              <li>Включите двухфакторную аутентификацию, если доступна</li>
              <li>Регулярно обновляйте пароли</li>
              <li>Не используйте личную информацию в паролях</li>
            </ul>
          </div>
          
          <p>Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:</p>
          <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 3px; font-family: monospace;">
            ${resetUrl}
          </p>
        </div>
        
        <div class="footer">
          <p>Это автоматическое сообщение от системы ${companyName}</p>
          <p>Если у вас есть вопросы, обратитесь к администратору</p>
          <p>© ${new Date().getFullYear()} ${companyName}. Все права защищены.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Восстановление пароля ${userTypeText}
    
    Здравствуйте, ${name}!
    
    Мы получили запрос на восстановление пароля для вашего аккаунта ${userTypeText} в системе ${companyName}.
    
    Для создания нового пароля перейдите по ссылке:
    ${resetUrl}
    
    Важная информация:
    - Ссылка действительна в течение 1 часа
    - Если вы не запрашивали сброс пароля, проигнорируйте это письмо
    - Никому не передавайте эту ссылку
    
    Советы по безопасности:
    - Используйте уникальный пароль для каждого сервиса
    - Включите двухфакторную аутентификацию, если доступна
    - Регулярно обновляйте пароли
    - Не используйте личную информацию в паролях
    
    Это автоматическое сообщение от системы ${companyName}
    © ${new Date().getFullYear()} ${companyName}. Все права защищены.
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${companyName}" <noreply@${process.env.EMAIL_DOMAIN || 'example.com'}>`,
      to,
      subject: `🔐 Восстановление пароля ${userTypeText} - ${companyName}`,
      text: textContent,
      html: htmlContent
    });

    console.log('Email sent successfully:', info.messageId);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Не удалось отправить email');
  }
}

// Функция для отправки уведомления о смене пароля
export async function sendPasswordChangedNotification({
  to,
  name,
  userType,
  timestamp
}: {
  to: string;
  name: string;
  userType: 'staff' | 'member';
  timestamp: Date;
}) {
  const transporter = createTransporter();
  const userTypeText = userType === 'staff' ? 'персонала' : 'участника';
  const companyName = 'FitAccess';
  const formattedTime = timestamp.toLocaleString('ru-RU');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Пароль изменен</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Пароль успешно изменен</h1>
          <p>Уведомление о смене пароля ${userTypeText}</p>
        </div>
        
        <div class="content">
          <h2>Здравствуйте, ${name}!</h2>
          
          <div class="alert">
            <strong>🔐 Ваш пароль был успешно изменен</strong><br>
            Время: ${formattedTime}
          </div>
          
          <p>Если это были не вы, немедленно обратитесь к администратору системы.</p>
          
          <p>Для дополнительной безопасности рекомендуем:</p>
          <ul>
            <li>Проверить активные сессии в вашем аккаунте</li>
            <li>Убедиться, что никто посторонний не имеет доступа к вашей почте</li>
            <li>Включить двухфакторную аутентификацию, если доступна</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Это автоматическое уведомление от системы ${companyName}</p>
          <p>© ${new Date().getFullYear()} ${companyName}. Все права защищены.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"${companyName}" <noreply@${process.env.EMAIL_DOMAIN || 'example.com'}>`,
      to,
      subject: `✅ Пароль ${userTypeText} изменен - ${companyName}`,
      html: htmlContent
    });

    console.log('Password change notification sent to:', to);
  } catch (error) {
    console.error('Error sending password change notification:', error);
    // Не бросаем ошибку, так как это не критично
  }
}
