// utils/securityValidation.ts
// Дополнительные проверки безопасности

export interface SecurityCheck {
  name: string;
  check: (value: string) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

export const SECURITY_CHECKS = {
  password: [
    {
      name: 'common_password',
      check: (password: string): boolean => {
        const commonPasswords = [
          'password', '123456', 'qwerty', 'abc123', 'password123',
          'admin', 'letmein', 'welcome', '123456789', 'password1',
          'iloveyou', 'princess', 'rockyou', '1234567890', '12345678',
          'sunshine', 'football', 'charlie', 'aa123456', 'donald',
          'bailey', 'solo', 'shadow', 'michael', 'computer'
        ];
        return !commonPasswords.includes(password.toLowerCase());
      },
      severity: 'critical' as const,
      message: 'Этот пароль слишком распространен и легко взламывается'
    },
    {
      name: 'sequential_chars',
      check: (password: string): boolean => {
        const sequences = ['123', '234', '345', '456', '567', '678', '789', 'abc', 'bcd', 'cde'];
        return !sequences.some(seq => password.toLowerCase().includes(seq));
      },
      severity: 'medium' as const,
      message: 'Избегайте последовательных символов (123, abc)'
    },
    {
      name: 'repeated_chars',
      check: (password: string): boolean => !/(.)\1{2,}/.test(password),
      severity: 'medium' as const,
      message: 'Избегайте повторяющихся символов (aaa, 111)'
    },
    {
      name: 'keyboard_patterns',
      check: (password: string): boolean => {
        const patterns = ['qwerty', 'asdf', 'zxcv', '1qaz', '2wsx', 'qazwsx'];
        return !patterns.some(pattern => password.toLowerCase().includes(pattern));
      },
      severity: 'high' as const,
      message: 'Избегайте клавиатурных шаблонов (qwerty, asdf)'
    },
    {
      name: 'no_personal_info',
      check: (password: string): boolean => {
        // Проверяем, что пароль не содержит очевидную персональную информацию
        const personalPatterns = [
          /\b(name|имя|фамилия|surname)\b/i,
          /\b(birthday|день рождения|дата)\b/i,
          /\b(phone|телефон|номер)\b/i
        ];
        return !personalPatterns.some(pattern => pattern.test(password));
      },
      severity: 'medium' as const,
      message: 'Не используйте личную информацию в пароле'
    },
    {
      name: 'sufficient_length',
      check: (password: string): boolean => password.length >= 8,
      severity: 'critical' as const,
      message: 'Пароль должен содержать минимум 8 символов'
    },
    {
      name: 'mixed_case',
      check: (password: string): boolean => /[a-z]/.test(password) && /[A-Z]/.test(password),
      severity: 'high' as const,
      message: 'Используйте строчные и заглавные буквы'
    },
    {
      name: 'contains_numbers',
      check: (password: string): boolean => /\d/.test(password),
      severity: 'high' as const,
      message: 'Добавьте цифры в пароль'
    },
    {
      name: 'contains_special_chars',
      check: (password: string): boolean => /[!@#$%^&*(),.?":{}|<>]/.test(password),
      severity: 'medium' as const,
      message: 'Добавьте специальные символы (!@#$%^&*)'
    }
  ] satisfies SecurityCheck[],
  
  email: [
    {
      name: 'suspicious_domain',
      check: (email: string): boolean => {
        const suspiciousDomains = [
          'example.com', 'test.com', 'localhost', '127.0.0.1',
          'fake.com', 'dummy.com', 'sample.com', 'invalid.com',
          'null.com', 'void.com', 'none.com'
        ];
        const domain = email.split('@')[1]?.toLowerCase();
        return domain ? !suspiciousDomains.includes(domain) : false;
      },
      severity: 'medium' as const,
      message: 'Используйте реальный email адрес'
    },
    {
      name: 'multiple_dots',
      check: (email: string): boolean => !email.includes('..'),
      severity: 'high' as const,
      message: 'Email не может содержать двойные точки'
    },
    {
      name: 'valid_tld',
      check: (email: string): boolean => {
        const domain = email.split('@')[1];
        if (!domain) return false;
        
        const tld = domain.split('.').pop();
        if (!tld) return false;
        
        // Проверяем, что TLD имеет правильную длину и содержит только буквы
        return tld.length >= 2 && tld.length <= 6 && /^[a-zA-Z]+$/.test(tld);
      },
      severity: 'high' as const,
      message: 'Неверное доменное расширение'
    },
    {
      name: 'valid_format',
      check: (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      },
      severity: 'critical' as const,
      message: 'Неверный формат email адреса'
    },
    {
      name: 'no_spaces',
      check: (email: string): boolean => !/\s/.test(email),
      severity: 'high' as const,
      message: 'Email не может содержать пробелы'
    },
    {
      name: 'reasonable_length',
      check: (email: string): boolean => email.length <= 254 && email.length >= 5,
      severity: 'medium' as const,
      message: 'Email имеет неразумную длину'
    },
    {
      name: 'valid_local_part',
      check: (email: string): boolean => {
        const localPart = email.split('@')[0];
        if (!localPart) return false;
        
        // Локальная часть не должна начинаться или заканчиваться точкой
        return !localPart.startsWith('.') && !localPart.endsWith('.');
      },
      severity: 'high' as const,
      message: 'Неверная локальная часть email адреса'
    }
  ] satisfies SecurityCheck[]
} as const;

export const runSecurityChecks = (
  fieldType: keyof typeof SECURITY_CHECKS,
  value: string
): {
  passed: SecurityCheck[];
  failed: SecurityCheck[];
  securityScore: number;
  criticalIssues: SecurityCheck[];
  highIssues: SecurityCheck[];
  mediumIssues: SecurityCheck[];
  lowIssues: SecurityCheck[];
} => {
  const checks = SECURITY_CHECKS[fieldType] || [];
  const passed: SecurityCheck[] = [];
  const failed: SecurityCheck[] = [];

  checks.forEach(check => {
    try {
      if (check.check(value)) {
        passed.push(check);
      } else {
        failed.push(check);
      }
    } catch (error) {
      console.error(`Ошибка в проверке безопасности ${check.name}:`, error);
      // В случае ошибки считаем проверку неудачной
      failed.push(check);
    }
  });

  // Группируем неудачные проверки по серьезности
  const criticalIssues = failed.filter(check => check.severity === 'critical');
  const highIssues = failed.filter(check => check.severity === 'high');
  const mediumIssues = failed.filter(check => check.severity === 'medium');
  const lowIssues = failed.filter(check => check.severity === 'low');

  // Вычисляем оценку безопасности (0-100)
  const weights = { low: 1, medium: 2, high: 3, critical: 4 };
  
  const totalWeight = checks.reduce((sum, check) => {
    return sum + weights[check.severity];
  }, 0);

  const passedWeight = passed.reduce((sum, check) => {
    return sum + weights[check.severity];
  }, 0);

  const securityScore = totalWeight > 0 ? Math.round((passedWeight / totalWeight) * 100) : 100;

  return { 
    passed, 
    failed, 
    securityScore,
    criticalIssues,
    highIssues,
    mediumIssues,
    lowIssues
  };
};

// Дополнительная функция для получения рекомендаций по улучшению безопасности
export const getSecurityRecommendations = (
  fieldType: keyof typeof SECURITY_CHECKS,
  value: string
): {
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  recommendations: string[];
  criticalIssues: string[];
} => {
  const result = runSecurityChecks(fieldType, value);
  
  let level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  if (result.criticalIssues.length > 0) {
    level = 'critical';
  } else if (result.securityScore >= 90) {
    level = 'excellent';
  } else if (result.securityScore >= 75) {
    level = 'good';
  } else if (result.securityScore >= 50) {
    level = 'fair';
  } else {
    level = 'poor';
  }

  const recommendations = result.failed
    .filter(check => check.severity !== 'critical')
    .map(check => check.message);

  const criticalIssues = result.criticalIssues.map(check => check.message);

  return {
    score: result.securityScore,
    level,
    recommendations,
    criticalIssues
  };
};

// Функция для проверки конкретного типа угроз
export const checkSpecificThreat = (
  fieldType: keyof typeof SECURITY_CHECKS,
  value: string,
  threatName: string
): boolean => {
  const checks = SECURITY_CHECKS[fieldType] || [];
  const specificCheck = checks.find(check => check.name === threatName);
  
  if (!specificCheck) {
    console.warn(`Проверка безопасности '${threatName}' не найдена для типа '${fieldType}'`);
    return true; // Если проверка не найдена, считаем что угрозы нет
  }

  try {
    return specificCheck.check(value);
  } catch (error) {
    console.error(`Ошибка при выполнении проверки '${threatName}':`, error);
    return false; // В случае ошибки считаем что есть угроза
  }
};
