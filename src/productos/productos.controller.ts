import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Delete,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PermisoGuard } from 'src/auth/guards/permiso.guard';
import { Permiso } from 'src/auth/decorators/permiso.decorator';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Response } from 'express';

@UseGuards(JwtGuard, PermisoGuard)
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) { }

  @Post()
  @Permiso(18)
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './public/img/productos',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `producto-${unique}${ext}`;
          cb(null, filename);
        },
      }),
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const {
      codigo,
      nombre,
      descripcion,
      imagen,
      estado,
      fkUnidadMedida,
      fkCaracteristica,
    } = body;

    const parsedDto: CreateProductoDto = {
      codigo,
      nombre,
      descripcion,
      imagen,
      estado: estado === 'true' || estado === true,
      fkUnidadMedida: fkUnidadMedida ? Number(fkUnidadMedida) : undefined,
      fkCaracteristica: fkCaracteristica ? Number(fkCaracteristica) : undefined,
    };

    return this.productosService.create(parsedDto, file?.filename);
  }


  @Get()
  @Permiso(19)
  findAll() {
    return this.productosService.findAll();
  }

  // Endpoint para obtener productos con stock disponible
  @Get('con-stock')
  @Permiso(19)
  getProductosConStock() {
    return this.productosService.getProductosConStock();
  }

  @Get(':id')
  @Permiso(19)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.findOne(id);
  }

  @Patch(':id')
  @Permiso(20)
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './public/img/productos',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `producto-${unique}${ext}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const updateDto: UpdateProductoDto = {
      nombre: body.nombre,
      descripcion: body.descripcion,
      estado: body.estado === 'true' || body.estado === true,
      fkUnidadMedida: body.fkUnidadMedida ? Number(body.fkUnidadMedida) : undefined,
      fkCaracteristica: body.fkCaracteristica ? Number(body.fkCaracteristica) : undefined,
    };

    if (file?.filename) {
      updateDto.imagen = file.filename;
    }

    return this.productosService.update(id, updateDto);
  }

  @Patch('estado/:id')
  @Permiso(20)
  changeStatus(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.changeStatus(id);
  }

  @Delete(':id')
  @Permiso(21)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.remove(id);
  }
}
