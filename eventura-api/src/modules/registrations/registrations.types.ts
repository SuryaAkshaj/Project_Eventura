export interface RegisterEventDto {
  eventId: string;
  idempotencyKey: string;  // Frontend generates this: crypto.randomUUID()
}

export interface CancelRegistrationDto {
  reason?: string;
}
