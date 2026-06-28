// Shimmer skeleton components for loading states
// Used across: events, tickets, admin users pages

interface Props {
  className?: string;
}

export function ShimmerLine({ className }: Props) {
  return (
    <div className={`bg-gray-200 rounded animate-pulse ${className || 'h-4 w-full'}`} />
  );
}

export function ShimmerCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <ShimmerLine className="h-4 w-3/4" />
          <ShimmerLine className="h-3 w-1/2" />
        </div>
      </div>
      <ShimmerLine className="h-3 w-full" />
      <ShimmerLine className="h-3 w-5/6" />
      <div className="flex gap-2 pt-1">
        <ShimmerLine className="h-6 w-16 rounded-full" />
        <ShimmerLine className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function ShimmerEventCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="h-48 bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <ShimmerLine className="h-5 w-3/4" />
        <ShimmerLine className="h-4 w-1/2" />
        <div className="flex gap-2">
          <ShimmerLine className="h-6 w-16 rounded-full" />
          <ShimmerLine className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <ShimmerLine className="h-4 w-24" />
          <ShimmerLine className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ShimmerTableRow() {
  return (
    <tr>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
          <div className="space-y-1.5">
            <ShimmerLine className="h-4 w-32" />
            <ShimmerLine className="h-3 w-48" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3"><ShimmerLine className="h-4 w-40" /></td>
      <td className="px-4 py-3"><ShimmerLine className="h-4 w-20" /></td>
      <td className="px-4 py-3"><ShimmerLine className="h-4 w-24" /></td>
      <td className="px-4 py-3"><ShimmerLine className="h-4 w-16" /></td>
    </tr>
  );
}

export function ShimmerTicketCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
      <div className="h-40 bg-gray-200 animate-pulse" />
      <div className="p-5 space-y-3">
        <ShimmerLine className="h-5 w-3/4" />
        <ShimmerLine className="h-4 w-1/2" />
        <ShimmerLine className="h-4 w-1/3" />
        <div className="relative flex items-center my-4">
          <div className="flex-1 border-t-2 border-dashed border-gray-200" />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <ShimmerLine className="h-3 w-24" />
            <ShimmerLine className="h-5 w-20" />
          </div>
          <ShimmerLine className="h-10 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
