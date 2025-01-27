import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { PrismaFilter } from '../middleware/filter/prisma.filter';
import { HttpExeptionFilter } from '../middleware/filter/http.filter';
import { ErrorFilter } from '../middleware/filter/error.filter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Collectif API ')
    .setDescription('Please first login to use the API {"email":"test@mail.com","password":"passwordtest"} to get the token and use the token in Authorize button')
    .setVersion('test')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new ErrorFilter(),
    new HttpExeptionFilter(),
    new PrismaFilter(httpAdapter),
  );

  app.useStaticAssets(join(__dirname, '..', 'public'), {
    index: false,
    prefix: '/public',
  });
  app.setBaseViewsDir(join('../public'));
  app.enableCors(
    {
      origin:
        ['http://localhost:5173',
          'http://localhost:3000',
          'http://51.210.106.127:8080',
          'https://imagindev-app.fr',
          'http://5.51.122.204',
          'https://5.51.122.204'
        ]
    }
  );


  await app.listen(3000);
}
bootstrap();