import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const photo = formData.get('photo') as File;
    
    if (!photo) {
      return NextResponse.json(
        { error: 'No photo uploaded' },
        { status: 400 }
      );
    }
    
    const fileExtension = photo.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    const publicDir = join(process.cwd(), 'public');
    const uploadsDir = join(publicDir, 'uploads');
    
    // Читаем содержимое файла
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(join(uploadsDir, fileName), buffer);
    
    const url = `/uploads/${fileName}`;
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    );
  }
}
