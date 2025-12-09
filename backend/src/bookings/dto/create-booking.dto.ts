import { IsNotEmpty, IsNumber, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsNumber()
  roomId: number;

  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  customizations?: {
    extraBed?: boolean;
    breakfast?: boolean;
    airportPickup?: boolean;
    lateCheckout?: boolean;
    roomDecoration?: boolean;
  };
}
