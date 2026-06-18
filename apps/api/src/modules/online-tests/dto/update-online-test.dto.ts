import { PartialType } from '@nestjs/swagger';
import { CreateOnlineTestDto } from './create-online-test.dto';

export class UpdateOnlineTestDto extends PartialType(CreateOnlineTestDto) {}
