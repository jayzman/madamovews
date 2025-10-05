import { PartialType } from '@nestjs/swagger';
import { CreateFavoriteDestinationDto } from './create-favorite-destination.dto';

export class UpdateFavoriteDestinationDto extends PartialType(CreateFavoriteDestinationDto) {}
