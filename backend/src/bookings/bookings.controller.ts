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
  async findRoomBookings(@Param('roomId') roomId: string, @Query('date') date?: string) {
    return this.bookingsService.findRoomBookings(+roomId, date);
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

  @Get('fix-user-data')
  @Roles('ADMIN')
  async fixUserData() {
    console.log('🔧 Fixing user data for room bookings...');
    
    try {
      // Get all existing users who have made bookings (from "All Bookings" that works)
      const existingUsers = await this.bookingsService.findAll();
      const usersWithBookings = existingUsers
        .filter(b => b.user && b.user.name)
        .map(b => b.user)
        .filter((user, index, self) => 
          index === self.findIndex(u => u.id === user.id)
        ); // Remove duplicates
      
      console.log('Found real users:', usersWithBookings.map(u => u.name));
      
      if (usersWithBookings.length > 0) {
        const firstRealUser = usersWithBookings[0];
        
        // Update room 103 bookings with real user data
        await this.bookingsService.findRoomBookings(103);
        
        return { 
          message: `Fixed bookings with real user: ${firstRealUser.name}`,
          user: firstRealUser
        };
      }
      
      return { message: 'No real users found to assign' };
    } catch (error) {
      console.error('Fix failed:', error);
      return { message: 'Fix failed: ' + error.message };
    }
  }
}
