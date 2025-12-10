import { Controller, Get, Post, Body, UseGuards, Request, Param, Query, Patch, Delete } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles('USER')
  create(@Request() req, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(req.user.userId, createBookingDto);
  }

  @Get('my')
  @Roles('USER')
  findMyBookings(@Request() req) {
    return this.bookingsService.findMyBookings(req.user.userId);
  }

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get('room/:roomId')
  @Roles('ADMIN', 'USER')
  async findRoomBookings(@Param('roomId') roomId: string) {
    return this.bookingsService.findRoomBookings(+roomId);
  }



  @Delete(':id')
  @Roles('ADMIN', 'USER')
  cancelBooking(@Request() req, @Param('id') id: string) {
    return this.bookingsService.cancelBooking(+id, req.user.userId, req.user.role);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.bookingsService.updateStatus(+id, status);
  }


}
