import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
 
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Use PORT environment variable (provided by Render) or fallback to 3001 for local dev
  const port = process.env.PORT || 3001;
  
  await app.listen(port);
  console.log(`🚀 NestJS API running on http://localhost:${port}`);
}
bootstrap(); 