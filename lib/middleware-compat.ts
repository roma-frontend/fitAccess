// lib/middleware-compat.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthenticatedRequest } from '@/lib/api-middleware';

// Точный тип для Next.js 15
export type NextJS15Context = {
  params: Promise<Record<string, string>>;
};

export type LegacyContext = {
  params: any;
};

// Функция-адаптер для конвертации контекста
export const adaptContext = async (context: NextJS15Context): Promise<LegacyContext> => {
  const resolvedParams = await context.params;
  return { params: resolvedParams };
};

// Обновленная обертка для middleware совместимости
export const withNextJS15Compat = (
  middlewareFunction: (
    handler: (req: AuthenticatedRequest, context?: LegacyContext) => Promise<NextResponse>
  ) => (req: NextRequest, context?: LegacyContext) => Promise<NextResponse>
) => {
  return (
    handler: (req: AuthenticatedRequest, context?: LegacyContext) => Promise<NextResponse>
  ) => {
    const wrappedMiddleware = middlewareFunction(handler);
    
    // Возвращаем функцию с правильной сигнатурой для Next.js 15
    return async (req: NextRequest, context: NextJS15Context): Promise<NextResponse> => {
      const legacyContext = await adaptContext(context);
      return wrappedMiddleware(req, legacyContext);
    };
  };
};
