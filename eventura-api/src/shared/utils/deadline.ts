export function getDeadlineStatus(event: {
  registrationDeadline?: Date | null;
  startDate: Date;
}): {
  status: 'closing_today' | 'closing_soon' | 'open' | 'ended' | null;
  label: string | null;
  urgency: 'high' | 'medium' | 'low' | null;
} {
  const now = new Date();
  const deadline = event.registrationDeadline || event.startDate;
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    return { status: 'ended', label: 'Registration closed', urgency: null };
  }
  if (diffDays === 0) {
    return { status: 'closing_today', label: 'Closing today!', urgency: 'high' };
  }
  if (diffDays <= 3) {
    return { status: 'closing_soon', label: `Closes in ${diffDays} day${diffDays > 1 ? 's' : ''}`, urgency: 'high' };
  }
  if (diffDays <= 7) {
    return { status: 'closing_soon', label: `Closes in ${diffDays} days`, urgency: 'medium' };
  }
  return { status: 'open', label: null, urgency: 'low' };
}
