import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
  } from '@nestjs/common';
  import { LivraisonService } from './livraison.service';
  import { CreateLivraisonDto } from './dto/create-livraison.dto';
  import { UpdateLivraisonDto } from './dto/update-livraison.dto';
  import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
  
  @Controller('livraisons')
  @ApiTags('livraisons')
  @ApiBearerAuth()
  export class LivraisonController {
    constructor(private readonly livraisonService: LivraisonService) {}
  
    @Post()
    create(@Body() createLivraisonDto: CreateLivraisonDto) {
      return this.livraisonService.create(createLivraisonDto);
    }
  
    @Get()
    findAll() {
      return this.livraisonService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: number) {
      return this.livraisonService.findOne(+id);
    }
  
    @Patch(':id')
    update(
      @Param('id') id: number,
      @Body() updateLivraisonDto: UpdateLivraisonDto,
    ) {
      return this.livraisonService.update(+id, updateLivraisonDto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: number) {
      return this.livraisonService.remove(+id);
    }
  }