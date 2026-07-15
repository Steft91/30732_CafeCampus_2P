import { Module } from '@nestjs/common';
import { ProductosController } from './controllers/productos.controller';
import { ProductosGrpcController } from './controllers/productos-grpc.controller';
import { ProductosService } from './services/productos.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ProductosController, ProductosGrpcController],
  providers: [ProductosService, PrismaService],
})
export class ProductosModule {}
