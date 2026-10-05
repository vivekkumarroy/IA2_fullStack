import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

export interface SelectProps<T> {
  label: string;
  options: T[];
  value: T | null;
  onChange: (v: T | null) => void;
  getKey: (o: T) => string;
  getLabel: (o: T) => string;
  isOptionDisabled?: (o: T) => boolean;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  required?: boolean;
  className?: string;
}

export function Select<T>({
  label,
  options,
  value,
  onChange,
  getKey,
  getLabel,
  isOptionDisabled,
  placeholder = 'Select an option...',
  disabled = false,
  id,
  required = false,
  className = '',
}: SelectProps<T>): JSX.Element {
  const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const menuId = `${selectId}-menu`;
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return normalizedQuery ? options.filter((option) => getLabel(option).toLowerCase().includes(normalizedQuery)) : options;
  }, [getLabel, options, query]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (open) {
      const firstAvailable = filteredOptions.findIndex((option) => !isOptionDisabled?.(option));
      setActiveIndex(firstAvailable);
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [filteredOptions, isOptionDisabled, open]);

  const close = () => { setOpen(false); setQuery(''); };
  const choose = (option: T) => {
    if (isOptionDisabled?.(option)) return;
    onChange(option);
    close();
  };

  const moveActive = (direction: 1 | -1) => {
    if (!filteredOptions.length) return;
    let next = activeIndex;
    for (let count = 0; count < filteredOptions.length; count += 1) {
      next = (next + direction + filteredOptions.length) % filteredOptions.length;
      if (!isOptionDisabled?.(filteredOptions[next]!)) {
        setActiveIndex(next);
        return;
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement | HTMLInputElement>) => {
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key === 'ArrowDown') { event.preventDefault(); if (!open) setOpen(true); else moveActive(1); return; }
    if (event.key === 'ArrowUp') { event.preventDefault(); if (!open) setOpen(true); else moveActive(-1); return; }
    if (event.key === 'Enter' && open && activeIndex >= 0) { event.preventDefault(); choose(filteredOptions[activeIndex]!); }
  };

  return (
    <div className={`relative space-y-1.5 ${className}`} ref={rootRef}>
      <label id={`${selectId}-label`} className="field-label">
        {label} {required && <span className="text-[#a73e35]">*</span>}
      </label>
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => { setOpen((current) => !current); setQuery(''); }}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${selectId}-label`}
        aria-controls={menuId}
        className={`field-input flex items-center justify-between gap-3 text-left ${open ? 'border-[#1f6572] ring-4 ring-[#1f6572]/10' : ''}`}
      >
        <span className={`truncate ${value ? 'text-[#263640]' : 'text-[#9ba3a1]'}`}>{value ? getLabel(value) : placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#63716f] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="select-menu-enter absolute left-0 top-full z-30 mt-2 w-full overflow-hidden rounded-xl border border-[#cfc9be] bg-[#fffdf9] shadow-[0_18px_35px_rgba(27,48,55,0.18)]" role="presentation">
          <div className="border-b border-[#e5e0d7] bg-[#f7f4ed] p-2.5">
            <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#83908d]" /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={handleKeyDown} placeholder={`Search ${label.toLowerCase()}...`} className="block w-full rounded-lg border border-[#d8d3c9] bg-white py-2 pl-9 pr-3 text-sm text-[#263640] outline-none placeholder:text-[#9ba3a1] focus:border-[#1f6572] focus:ring-2 focus:ring-[#1f6572]/10" /></div>
          </div>
          <ul id={menuId} role="listbox" aria-labelledby={`${selectId}-label`} className="max-h-64 overflow-y-auto overscroll-contain p-1.5">
            {filteredOptions.length ? filteredOptions.map((option, index) => {
              const key = getKey(option);
              const isSelected = value ? getKey(value) === key : false;
              const optionDisabled = Boolean(isOptionDisabled?.(option));
              return <li key={key} role="option" aria-selected={isSelected} aria-disabled={optionDisabled} onMouseEnter={() => !optionDisabled && setActiveIndex(index)} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(option)} className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${optionDisabled ? 'cursor-not-allowed text-[#a4a9a5]' : activeIndex === index ? 'bg-[#edf4f1] text-[#1d5968]' : 'text-[#3d4b50] hover:bg-[#f5f2eb]'} ${isSelected ? 'font-bold' : 'font-medium'}`}><span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${isSelected ? 'border-[#1d5968] bg-[#1d5968] text-white' : 'border-[#cfc9be] bg-white text-transparent'}`}><Check className="h-3.5 w-3.5" /></span><span className="min-w-0 truncate">{getLabel(option)}</span>{optionDisabled && <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-[#a73e35]">Unavailable</span>}</li>;
            }) : <li className="px-3 py-7 text-center text-sm text-[#74807f]">No matches found.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
