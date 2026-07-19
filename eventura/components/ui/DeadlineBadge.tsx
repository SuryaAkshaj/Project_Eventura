interface Props {
  startDate: string;
  registrationDeadline?: string | null;
  className?: string;
}

export default function DeadlineBadge({ startDate, registrationDeadline, className }: Props) {
  const now = new Date();
  const deadline = registrationDeadline ? new Date(registrationDeadline) : new Date(startDate);
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) return null; // Registration closed — no badge needed

  let label = '';
  let colorClass = '';

  if (diffDays === 0) {
    label = 'Closing today!';
    colorClass = 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800';
  } else if (diffDays <= 3) {
    label = `Closes in ${diffDays}d`;
    colorClass = 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-950 dark:text-red-400 dark:border-red-900';
  } else if (diffDays <= 7) {
    label = `Closes in ${diffDays}d`;
    colorClass = 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-800';
  } else {
    return null; // More than 7 days — no urgency badge needed
  }

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass} ${className || ''}`}>
      ⏰ {label}
    </span>
  );
}

