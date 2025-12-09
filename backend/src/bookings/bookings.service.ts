import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { RoomsService } from '../rooms/rooms.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private roomsService: RoomsService,
  ) { }

  async create(userId: number, createBookingDto: CreateBookingDto): Promise<Booking> {
    const room = await this.roomsService.findOne(createBookingDto.roomId);

    if (!room.is_active) {
      throw new BadRequestException('Room is not available');
    }

    const startTime = new Date(createBookingDto.startTime);
    const endTime = new Date(createBookingDto.endTime);
    const now = new Date();

    // Validate dates
    if (startTime < now) {
      throw new BadRequestException('Check-in date cannot be in the past');
    }

    if (endTime <= startTime) {
      throw new BadRequestException('Check-out date must be after check-in date');
    }

    // Check for booking conflicts
    const conflictingBookings = await this.bookingsRepository
      .createQueryBuilder('booking')
      .where('booking.room_id = :roomId', { roomId: createBookingDto.roomId })
      .andWhere('booking.start_time < :endTime', { endTime })
      .andWhere('booking.end_time > :startTime', { startTime })
      .andWhere('booking.status = :status', { status: BookingStatus.CONFIRMED })
      .getMany();

    if (conflictingBookings.length > 0) {
      throw new BadRequestException('Room already booked in this time range');
    }

    // Calculate duration and total cost
    const diffTime = endTime.getTime() - startTime.getTime();
    const durationHours = Math.ceil(diffTime / (1000 * 60 * 60));

    // Check minimum 6-hour requirement
    if (durationHours < 6) {
      throw new BadRequestException('Minimum stay requirement is 6 hours');
    }

    const dailyRate = room.cost;

    // Calculate cost based on duration
    let totalCost: number;
    if (durationHours <= 12) {
      // 6-12 hours: half the daily cost
      totalCost = dailyRate / 2;
    } else if (durationHours <= 24) {
      // 12-24 hours: full daily cost
      totalCost = dailyRate;
    } else {
      // Multiple days: calculate full days
      const fullDays = Math.ceil(durationHours / 24);
      totalCost = fullDays * dailyRate;
    }

    const booking = this.bookingsRepository.create({
      room: { id: createBookingDto.roomId },
      user: { id: userId },
      start_time: startTime,
      end_time: endTime,
      duration_hours: durationHours,
      total_cost: totalCost,
      payment_method: createBookingDto.paymentMethod || 'CASH',
      phone_number: createBookingDto.phoneNumber,
      customizations: createBookingDto.customizations || {},
    });

    return this.bookingsRepository.save(booking);
  }

  async findMyBookings(userId: number): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: { user: { id: userId } },
      relations: ['room', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingsRepository.find({
      relations: ['room', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async findRoomBookings(roomId: number, date?: string): Promise<Booking[]> {
    console.log(`Finding bookings for room ${roomId}`);

    // Use the same method as findAll() to get real database data
    const allBookings = await this.findAll();

    // Filter for the specific room - only return real data from database
    const roomBookings = allBookings.filter(booking => booking.room?.id === roomId);

    console.log(`Found ${roomBookings.length} real bookings for room ${roomId}`);
    return roomBookings;
  }

  async cancelBooking(bookingId: number, userId: number, userRole: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
      relations: ['user'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Users can only cancel their own bookings, admins can cancel any
    if (userRole !== 'ADMIN' && booking.user.id !== userId) {
      throw new BadRequestException('You can only cancel your own bookings');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    booking.status = BookingStatus.CANCELLED;
    return this.bookingsRepository.save(booking);
  }

  async updateStatus(id: number, status: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Validate status
    const validStatuses = Object.values(BookingStatus);
    if (!validStatuses.includes(status as BookingStatus)) {
      throw new BadRequestException('Invalid booking status');
    }

    booking.status = status as BookingStatus;
    return this.bookingsRepository.save(booking);
  }
}
