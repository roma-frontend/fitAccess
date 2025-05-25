// components/SecurityIndicator.tsx (если отсутствует)
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { runSecurityChecks } from '@/utils/securityValidation';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

interface SecurityIndicatorProps {
  fieldType: 'password' | 'email';
  value: string;
  showDetails?: boolean;
}

export const SecurityIndicator: React.FC<SecurityIndicatorProps> = ({
  fieldType,
  value,
  showDetails = true
}) => {
  if (!value) return null;

  const { passed, failed, securityScore } = runSecurityChecks(fieldType, value);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Отлично';
    if (score >= 60) return 'Хорошо';
    if (score >= 40) return 'Удовлетворительно';
    return 'Требует улучшения';
  };

  return (
    <Card className="mt-2 border-l-4 border-l-blue-500 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center text-blue-900">
          <Shield className="h-4 w-4 mr-2" />
          Оценка безопасности: {securityScore}/100
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Уровень безопасности</span>
            <span className={`text-xs font-medium ${getScoreColor(securityScore)}`}>
              {getScoreText(securityScore)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getScoreBg(securityScore)}`}
              style={{ width: `${securityScore}%` }}
            />
          </div>
        </div>

        {showDetails && (
          <div className="space-y-2">
            {passed.length > 0 && (
              <div>
                <p className="text-xs font-medium text-green-800 mb-1">✅ Пройденные проверки:</p>
                <div className="space-y-1">
                  {passed.slice(0, 3).map((check, index) => (
                    <div key={index} className="flex items-center text-xs text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span>{check.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {failed.length > 0 && (
              <div>
                <p className="text-xs font-medium text-red-800 mb-1">⚠️ Рекомендации:</p>
                <div className="space-y-1">
                  {failed.slice(0, 3).map((check, index) => (
                    <div key={index} className="flex items-start text-xs text-red-700">
                      <XCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                      <span>{check.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
