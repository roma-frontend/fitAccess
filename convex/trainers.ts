// convex/trainers.ts (исправленная версия с точным маппингом)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  handler: async (ctx) => {
    console.log('Convex trainers: получаем всех тренеров');
    const trainers = await ctx.db.query("trainers").collect();
    console.log('Convex trainers: найдено тренеров:', trainers.length);
    return trainers;
  },
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    console.log('Convex trainers: ищем тренера по ID:', args.id);
    
    try {
      const trainer = await ctx.db.get(args.id as any);
      if (trainer) {
        console.log('Convex trainers: тренер найден по _id');
        return trainer;
      }
    } catch (error) {
      console.log('Convex trainers: не найден по _id, пробуем другие поля');
    }
    
    const trainer = await ctx.db.query("trainers")
      .filter((q) => q.or(
        q.eq(q.field("email"), args.id),
        q.eq(q.field("name"), args.id)
      ))
      .first();
    
    console.log('Convex trainers: тренер найден:', trainer ? 'да' : 'нет');
    return trainer ?? null;
  },
});

// Точный маппинг на основе данных из базы
const SLUG_TO_NAME_MAP: { [key: string]: string } = {
  'elena-smirnova': 'Елена Смирнова',
  'anna-petrova': 'Анна Петрова',
  'mikhail-volkov': 'Михаил Волков',
  // Эти тренеры отсутствуют в базе данных:
  // 'aleksandr-petrov': 'Александр Петров', // НЕТ В БАЗЕ
  // 'dmitriy-kozlov': 'Дмитрий Козлов',     // НЕТ В БАЗЕ
};

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    console.log('Convex trainers: ищем тренера по slug:', args.slug);
    
    // Получаем русское имя из маппинга
    const russianName = SLUG_TO_NAME_MAP[args.slug];
    console.log('Convex trainers: русское имя из маппинга:', russianName);
    
    if (!russianName) {
      console.log('Convex trainers: slug не найден в маппинге. Доступные slug\'ы:', Object.keys(SLUG_TO_NAME_MAP));
      return null;
    }
    
    // Ищем тренера по русскому имени (берем первого, если есть дубликаты)
    const trainer = await ctx.db.query("trainers")
      .filter((q) => q.eq(q.field("name"), russianName))
      .first();
    
    if (trainer) {
      console.log('Convex trainers: найденный тренер:', trainer.name, 'ID:', trainer._id);
    } else {
      console.log('Convex trainers: тренер не найден по имени:', russianName);
      
      // Покажем всех доступных тренеров для отладки
      const allTrainers = await ctx.db.query("trainers").collect();
      console.log('Convex trainers: доступные тренеры:');
      allTrainers.forEach(t => {
        console.log(`  - ${t.name} (ID: ${t._id})`);
      });
    }
    
    return trainer ?? null;
  },
});
