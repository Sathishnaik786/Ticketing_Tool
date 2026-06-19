import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

const DEPARTMENTS = ['All Departments', 'HR', 'IT', 'Admin', 'Finance', 'Operations'];

export function DepartmentSelector() {
  const { user } = useAuth();

  return (
    <Select defaultValue="All Departments">
      <SelectTrigger
        className="hidden md:flex h-9 w-[160px] rounded-xl text-xs"
        aria-label="Filter by department"
      >
        <SelectValue placeholder="Department" />
      </SelectTrigger>
      <SelectContent>
        {DEPARTMENTS.map((dept) => (
          <SelectItem key={dept} value={dept}>
            {dept === 'All Departments' ? dept : `${dept}${user?.role === 'MANAGER' ? '' : ''}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
