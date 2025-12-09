import axiosClient from './axiosClient';

export interface CreateBookingData {
  roomId: number;
  startTime: string;
  endTime: string;
  phoneNumber: string;
  customizations?: {
    extraBed?: boolean;
    breakfast?: boolean;
    airportPickup?: boolean;
    lateCheckout?: boolean;
    roomDecoration?: boolean;
  };
}

export const createBooking = async (data: CreateBookingData) => {
  const response = await axiosClient.post('/bookings', data);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await axiosClient.get('/bookings/my');
  return response.data;
};

export const getAllBookings = async () => {
  const response = await axiosClient.get('/bookings');
  return response.data;
};

export const getRoomBookings = async (roomId: number, date?: string) => {
  const url = date ? `/bookings/room/${roomId}?date=${date}` : `/bookings/room/${roomId}`;
  const response = await axiosClient.get(url);
  return response.data;
};

export const cancelBooking = async (bookingId: number) => {
  const response = await axiosClient.delete(`/bookings/${bookingId}`);
  return response.data;
};

export const updateBookingStatus = async (bookingId: number, status: string) => {
  const response = await axiosClient.patch(`/bookings/${bookingId}/status`, { status });
  return response.data;
};


