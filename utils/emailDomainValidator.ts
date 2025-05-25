// utils/emailDomainValidator.ts
// Расширенная проверка доменов email

export const DISPOSABLE_EMAIL_DOMAINS = [
  // Популярные одноразовые сервисы
  '10minutemail.com', '10minutemail.net', '20minutemail.com',
  'tempmail.org', 'temp-mail.org', 'temp-mail.io',
  'guerrillamail.com', 'guerrillamail.org', 'guerrillamail.net',
  'mailinator.com', 'mailinator.net', 'mailinator.org',
  'yopmail.com', 'yopmail.fr', 'yopmail.net',
  'getnada.com', 'jetable.org', 'throwaway.email',
  'maildrop.cc', 'sharklasers.com', 'grr.la',
  'armyspy.com', 'cuvox.de', 'dayrep.com',
  'einrot.com', 'fleckens.hu', 'gustr.com',
  'jourrapide.com', 'superrito.com', 'teleworm.us',
  // Российские одноразовые
  'mail.tm', 'temp-mail.ru', 'mohmal.com',
  'dropmail.me', 'tempail.com', 'fakemailgenerator.com'
];

export const TRUSTED_EMAIL_DOMAINS = [
  // Gmail
  'gmail.com', 'googlemail.com',
  // Microsoft
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  // Yahoo
  'yahoo.com', 'yahoo.ru', 'ymail.com',
  // Российские
  'mail.ru', 'bk.ru', 'inbox.ru', 'list.ru',
  'yandex.ru', 'ya.ru', 'yandex.com',
  'rambler.ru', 'lenta.ru', 'autorambler.ru',
  // Apple
  'icloud.com', 'me.com', 'mac.com',
  // Другие популярные
  'aol.com', 'protonmail.com', 'tutanota.com',
  'zoho.com', 'fastmail.com'
];

export const validateEmailDomain = (email: string): {
  isValid: boolean;
  isTrusted: boolean;
  isDisposable: boolean;
  warnings: string[];
} => {
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain) {
    return {
      isValid: false,
      isTrusted: false,
      isDisposable: false,
      warnings: ['Неверный формат email']
    };
  }

  const isDisposable = DISPOSABLE_EMAIL_DOMAINS.includes(domain);
  const isTrusted = TRUSTED_EMAIL_DOMAINS.includes(domain);
  const warnings: string[] = [];

  if (isDisposable) {
    warnings.push('Одноразовые email адреса не принимаются');
  }

  if (!isTrusted && !isDisposable) {
    warnings.push('Убедитесь, что email адрес введен правильно');
  }

  return {
    isValid: !isDisposable,
    isTrusted,
    isDisposable,
    warnings
  };
};
