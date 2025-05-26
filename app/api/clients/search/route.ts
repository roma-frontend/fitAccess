// app/api/clients/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, AuthenticatedRequest } from '@/lib/api-middleware';
import { mockClients, mockTrainers, Client } from '@/lib/mock-data';

// GET /api/clients/search - Расширенный поиск клиентов
export const GET = withPermissions(
  { resource: 'clients', action: 'read' },
  async (req: AuthenticatedRequest) => {
    try {
      console.log('🔍 API: расширенный поиск клиентов');
      
      const { user } = req;
      const url = new URL(req.url);
      const query = url.searchParams.get('q') || '';
      const limit = parseInt(url.searchParams.get('limit') || '10');

      if (!query || query.length < 2) {
        return NextResponse.json({
          success: true,
          data: [],
          message: 'Введите минимум 2 символа для поиска'
        });
      }

      let clients = [...mockClients];

      // Фильтрация по правам доступа
      if (user.role === 'trainer') {
        clients = clients.filter((client: Client) => client.trainerId === user.id);
      } else if (user.role === 'client') {
        clients = clients.filter((client: Client) => client.id === user.id);
      }

      // Поиск по различным полям
      const searchResults = clients.filter((client: Client) => {
        const searchTerm = query.toLowerCase();
        return (
          client.name.toLowerCase().includes(searchTerm) ||
          client.email.toLowerCase().includes(searchTerm) ||
          client.phone?.toLowerCase().includes(searchTerm) ||
          client.id.toLowerCase().includes(searchTerm)
        );
      });

      // Сортировка по релевантности
      searchResults.sort((a: Client, b: Client) => {
        const aScore = getRelevanceScore(a, query);
        const bScore = getRelevanceScore(b, query);
        return bScore - aScore;
      });

      // Ограничение результатов
      const limitedResults = searchResults.slice(0, limit);

      // Добавление информации о тренере
      const enrichedResults = limitedResults.map((client: Client) => {
        const trainer = mockTrainers.find(t => t.id === client.trainerId);
        return {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          status: client.status,
          membershipType: client.membershipType,
          trainerName: trainer?.name || null,
          joinDate: client.joinDate
        };
      });

      return NextResponse.json({
        success: true,
        data: enrichedResults,
        meta: {
          query,
          total: searchResults.length,
          returned: limitedResults.length,
          hasMore: searchResults.length > limit
        }
      });

    } catch (error) {
      console.error('💥 API: ошибка поиска клиентов:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка поиска клиентов' },
        { status: 500 }
      );
    }
  }
);

// Функция для расчета релевантности поиска
function getRelevanceScore(client: Client, query: string): number {
  const searchTerm = query.toLowerCase();
  let score = 0;

  // Точное совпадение имени - высший приоритет
  if (client.name.toLowerCase() === searchTerm) {
    score += 100;
  } else if (client.name.toLowerCase().startsWith(searchTerm)) {
    score += 50;
  } else if (client.name.toLowerCase().includes(searchTerm)) {
    score += 25;
  }

  // Совпадение email
  if (client.email.toLowerCase().includes(searchTerm)) {
    score += 30;
  }

  // Совпадение телефона
  if (client.phone?.toLowerCase().includes(searchTerm)) {
    score += 20;
  }

  // Совпадение ID
  if (client.id.toLowerCase().includes(searchTerm)) {
    score += 10;
  }

  return score;
}
