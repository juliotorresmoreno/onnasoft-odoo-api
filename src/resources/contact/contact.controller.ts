import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterResponseDto } from './dto/register-response.dto';
import { Public } from '@/utils/secure';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Post('')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiBody({ type: CreateContactDto })
  async create(@Body() createContactDto: CreateContactDto) {
    const response = await this.contactService.create(createContactDto);

    return {
      message: response,
      statusCode: HttpStatus.CREATED,
    };
  }
}
