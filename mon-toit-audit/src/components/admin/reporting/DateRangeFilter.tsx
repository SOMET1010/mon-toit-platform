import { CalendarIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DateRangeFilterProps {
  startDate?: Date;
  endDate?: Date;
  onDateRangeChange: (start: Date, end: Date) => void;
  onPresetChange: (preset: '7d' | '30d' | '90d' | 'custom') => void;
  periodPreset: '7d' | '30d' | '90d' | 'custom';
}

export const DateRangeFilter = ({ 
  startDate, 
  endDate, 
  onDateRangeChange, 
  onPresetChange, 
  periodPreset 
}: DateRangeFilterProps) => {
  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
            <Filter className="mr-2 h-4 w-4" />
            {periodPreset === '7d' && '7 derniers jours'}
            {periodPreset === '30d' && '30 derniers jours'}
            {periodPreset === '90d' && '90 derniers jours'}
            {periodPreset === 'custom' && 'Personnalisé'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onPresetChange('7d')}>
            7 derniers jours
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPresetChange('30d')}>
            30 derniers jours
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPresetChange('90d')}>
            90 derniers jours
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPresetChange('custom')}>
            Personnalisé
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, 'PPP', { locale: fr }) : 'Date début'}
              <span className="mx-2">-</span>
              {endDate ? format(endDate, 'PPP', { locale: fr }) : 'Date fin'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={startDate}
              selected={{ from: startDate, to: endDate }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  onDateRangeChange(range.from, range.to);
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export { DateRangeFilter };