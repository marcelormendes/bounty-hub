import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import * as express from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors()
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
  
  app.use(
    '/webhooks/github',
    express.raw({ type: 'application/json' }),
  )

  const config = new DocumentBuilder()
    .setTitle('Bounty Hub GitHub App')
    .setDescription('GitHub App for integrating with Bounty Hub')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  const port = process.env.PORT || 5000
  await app.listen(port)
  console.log(`GitHub App is running on: http://localhost:${port}`)
}

;(async () => {
  try {
    await bootstrap()
  } catch (error) {
    console.error('Error starting application:', error)
    process.exit(1)
  }
})()