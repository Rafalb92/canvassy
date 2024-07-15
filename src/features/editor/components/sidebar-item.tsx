import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

export const SidebarItem = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}: SidebarItemProps) => {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        'w-full h-full aspect-video p-3 py-4 transition flex flex-col rounded-none',
        isActive && 'bg-slate-900 hover:bg-slate-800 text-primary'
      )}
    >
      <Icon
        className={cn(
          'size-5 stroke-2 shrink-0',
          isActive && 'text-[#F7B82D] '
        )}
      />
      <span className={cn('mt-2 text-xs', isActive && 'text-[#F7B82D]')}>
        {label}
      </span>
    </Button>
  );
};
