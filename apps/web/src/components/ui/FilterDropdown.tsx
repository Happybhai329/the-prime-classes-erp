import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  className?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`btn-ghost text-sm gap-2 border border-gray-300 ${
          value ? 'bg-primary-50 border-primary-300 text-primary-700' : ''
        }`}
      >
        {selectedOption ? selectedOption.label : label}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 z-40 w-48 bg-white rounded-lg border border-gray-200 shadow-lg py-1 animate-fade-in">
          <button
            onClick={() => {
              onChange(undefined);
              setIsOpen(false);
            }}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
              !value ? 'text-primary-700 font-medium' : 'text-gray-700'
            }`}
          >
            All
            {!value && <Check className="h-4 w-4" />}
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                value === option.value ? 'text-primary-700 font-medium' : 'text-gray-700'
              }`}
            >
              {option.label}
              {value === option.value && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
