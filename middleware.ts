// middleware.ts (исправленная версия через API)
import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = [
  '/',
  '/member-login',
  '/staff-login',
  '/register',
  '/face-login',
  '/demo',
  '/setup',
  '/setup-demo-data',
  '/setup-users',
  '/create-admin',
  '/init-super-admin',
  '/test-page',
  '/test-login',
  '/test-users',
  '/debug-auth',
  '/test-cookies',
  '/create-test-user',
  '/admin-login',
  '/clear-cookies',
  '/make-admin',
  '/create-real-admin',
  '/debug-dashboard',
  '/unauthorized',
  '/debug-password',
  '/test-auth-flow',
  '/fix-password',
  '/demo-smart-login',
  '/test-qr-codes',
  '/trainers',
  '/programs',
  '/consultation',
  '/trial-class',
  '/final-debug',
  '/debug-auth',
  'quick-test',
  'test-shop'
];

const memberRoutes = [
  '/member-dashboard',
  '/member-profile',
  '/member-visits',
  '/group-classes',
  '/shop',
  '/qr-code',
  '/setup-face-recognition',
  '/my-bookings',
  '/my-trainings',
  '/test-middleware',
];

const staffRoutes = [
  '/admin',
  '/staff-dashboard',
  '/trainer-dashboard',
  '/manager-dashboard'
];

const loginPages = ['/member-login', '/staff-login', '/login'];

const isPublicRoute = (pathname: string): boolean => {
  return publicRoutes.includes(pathname) ||
         Boolean(pathname.match(/^\/trainer\/[^\/]+$/)) ||
         Boolean(pathname.match(/^\/programs\/[^\/]+$/));
};

const isMemberRoute = (pathname: string): boolean => {
  return memberRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  ) || 
  Boolean(pathname.match(/^\/book-trainer\/[^\/]+$/)) ||
  Boolean(pathname.match(/^\/book-program\/[^\/]+$/)) ||
  Boolean(pathname.match(/^\/book-class\/[^\/]+\/[^\/]+$/));
};

const isStaffRoute = (pathname: string): boolean => {
  return staffRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
};

const getDashboardForRole = (role: string): string => {
  switch (role) {
    case 'member': return '/member-dashboard';
    case 'admin':
    case 'super-admin': return '/admin';
    case 'manager': return '/manager-dashboard';
    case 'trainer': return '/trainer-dashboard';
    default: return '/staff-dashboard';
  }
};

// Проверка авторизации через внутренний API вызов
const checkAuthentication = async (request: NextRequest): Promise<{ user: any; authType: string } | null> => {
  try {
    // Создаем URL для внутреннего API вызова
    const baseUrl = request.nextUrl.origin;
    const checkUrl = new URL('/api/auth/check', baseUrl);
    
    // Копируем cookies из оригинального запроса
    const cookieHeader = request.headers.get('cookie');
    
    console.log(`🔍 Middleware: проверяем авторизацию через API`);
    console.log(`🍪 Middleware: cookies = ${cookieHeader ? 'ЕСТЬ' : 'НЕТ'}`);
    
    // Делаем внутренний запрос к API
    const response = await fetch(checkUrl.toString(), {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader || '',
        'User-Agent': 'Middleware-Internal-Check',
      },
    });
    
    if (!response.ok) {
      console.log(`❌ Middleware: API ответил с ошибкой ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`📊 Middleware: результат API = ${data.authenticated ? 'АВТОРИЗОВАН' : 'НЕ АВТОРИЗОВАН'}`);
    
    if (data.authenticated && data.user) {
      console.log(`✅ Middleware: пользователь ${data.user.email} (${data.user.role})`);
      return { user: data.user, authType: data.system || 'api-check' };
    }
    
    return null;
  } catch (error) {
    console.error(`💥 Middleware: ошибка проверки авторизации:`, error);
    return null;
  }
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Пропускаем служебные файлы
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/favicon.ico') || 
      pathname.startsWith('/static/') ||
      pathname.includes('.') ||
      pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  console.log(`\n🚀 === MIDDLEWARE START для ${pathname} ===`);

  // Проверяем авторизацию
  const auth = await checkAuthentication(request);

  // Перенаправляем авторизованных со страниц входа
  if (loginPages.includes(pathname) && auth) {
    const dashboardUrl = getDashboardForRole(auth.user.role);
    console.log(`↗️ Middleware: перенаправление ${auth.user.role} с ${pathname} на ${dashboardUrl}`);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Пропускаем публичные маршруты
  if (isPublicRoute(pathname)) {
    console.log(`✅ Middleware: публичный маршрут ${pathname}`);
    console.log(`🏁 === MIDDLEWARE END - ПУБЛИЧНЫЙ ===\n`);
    return NextResponse.next();
  }

  // Проверяем маршруты участников
  if (isMemberRoute(pathname)) {
    console.log(`👤 Middleware: маршрут участника ${pathname}`);
    
    if (!auth) {
      console.log(`❌ Middleware: нет авторизации для ${pathname}, перенаправляем на /member-login`);
      console.log(`🏁 === MIDDLEWARE END - ПЕРЕНАПРАВЛЕНИЕ ===\n`);
      return NextResponse.redirect(new URL('/member-login?redirect=' + encodeURIComponent(pathname), request.url));
    }
    
    if (auth.user.role !== 'member') {
      console.log(`❌ Middleware: неправильная роль ${auth.user.role} для ${pathname}, перенаправляем на /member-login`);
      console.log(`🏁 === MIDDLEWARE END - НЕПРАВИЛЬНАЯ РОЛЬ ===\n`);
      return NextResponse.redirect(new URL('/member-login?redirect=' + encodeURIComponent(pathname), request.url));
    }

    console.log(`✅ Middleware: доступ разрешен для участника ${auth.user.email} на ${pathname}`);
    console.log(`🏁 === MIDDLEWARE END - РАЗРЕШЕНО ===\n`);
    return NextResponse.next();
  }

  // Проверяем маршруты персонала
  if (isStaffRoute(pathname)) {
    console.log(`🛡️ Middleware: маршрут персонала ${pathname}`);
    
    if (!auth) {
      console.log(`❌ Middleware: нет авторизации для ${pathname}, перенаправляем на /staff-login`);
      console.log(`🏁 === MIDDLEWARE END - ПЕРЕНАПРАВЛЕНИЕ ===\n`);
      return NextResponse.redirect(new URL('/staff-login?redirect=' + encodeURIComponent(pathname), request.url));
    }
    
    const allowedRoles = ['admin', 'super-admin', 'manager', 'trainer'];
    if (!allowedRoles.includes(auth.user.role)) {
      console.log(`❌ Middleware: неправильная роль ${auth.user.role} для ${pathname}, перенаправляем на /staff-login`);
      console.log(`🏁 === MIDDLEWARE END - НЕПРАВИЛЬНАЯ РОЛЬ ===\n`);
      return NextResponse.redirect(new URL('/staff-login?redirect=' + encodeURIComponent(pathname), request.url));
    }

    console.log(`✅ Middleware: доступ разрешен для персонала ${auth.user.email} на ${pathname}`);
    console.log(`🏁 === MIDDLEWARE END - РАЗРЕШЕНО ===\n`);
    return NextResponse.next();
  }

  // Остальные защищенные маршруты
  console.log(`🔒 Middleware: защищенный маршрут ${pathname}`);
  if (!auth) {
    console.log(`❌ Middleware: нет авторизации для защищенного маршрута ${pathname}, перенаправляем на главную`);
    console.log(`🏁 === MIDDLEWARE END - ПЕРЕНАПРАВЛЕНИЕ НА ГЛАВНУЮ ===\n`);
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  console.log(`✅ Middleware: доступ разрешен для ${pathname}`);
  console.log(`🏁 === MIDDLEWARE END - РАЗРЕШЕНО ===\n`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
