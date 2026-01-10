import { useState, useRef, useEffect } from 'react';
import './FilterDropdown.css';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
}

export function FilterDropdown({ label, options, value, onChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="filter-dropdown" ref={ref}>
      <button 
        className={`filter-trigger ${value ? 'filter-active' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span>{selectedOption?.label || label}</span>
        <ChevronIcon open={open} />
      </button>
      
      {open && (
        <div className="filter-menu">
          <button
            className={`filter-option ${!value ? 'filter-option-selected' : ''}`}
            onClick={() => { onChange(null); setOpen(false); }}
          >
            All
          </button>
          {options.map(option => (
            <button
              key={option.value}
              className={`filter-option ${value === option.value ? 'filter-option-selected' : ''}`}
              onClick={() => { onChange(option.value); setOpen(false); }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg 
      width="12" 
      height="12" 
      viewBox="0 0 12 12" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
    >
      <path d="M3 4.5l3 3 3-3" />
    </svg>
  );
}
