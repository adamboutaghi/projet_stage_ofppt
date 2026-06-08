import { useState, useRef, useEffect, useMemo, useId } from "react";
import { ChevronDown, Search } from "lucide-react";

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {import('react').ComponentType} [props.icon]
 * @param {{ value: string|number, label: string, description?: string }[]} props.options
 * @param {string|number} props.value
 * @param {(value: string|number) => void} props.onChange
 * @param {string} [props.placeholder]
 * @param {boolean} [props.disabled]
 * @param {string} [props.emptyMessage]
 */
export default function SearchableSelect({
  label,
  icon: Icon,
  options = [],
  value,
  onChange,
  placeholder = "Rechercher…",
  disabled = false,
  emptyMessage = "Aucun résultat",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const listId = useId();

  const selected = options.find((o) => String(o.value) === String(value));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.description?.toLowerCase().includes(q) ?? false)
    );
  }, [options, search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-blue-950 mb-2">
          <span className="inline-flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-orange-600" />}
            {label}
          </span>
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 text-left text-sm p-3 border rounded-xl transition-all duration-200 ${
          disabled
            ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
            : open
            ? "border-orange-500 ring-2 ring-orange-500/20 bg-white"
            : "border-gray-200 bg-white hover:border-orange-300"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "text-blue-950 font-medium truncate" : "text-gray-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform ${
            open ? "rotate-180 text-orange-600" : ""
          }`}
        />
      </button>

      {selected?.description && !open && (
        <p className="text-xs text-gray-500 mt-1.5">{selected.description}</p>
      )}

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-orange-100 overflow-hidden">
          <div className="p-2 border-b border-orange-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                autoFocus
              />
            </div>
          </div>
          <ul
            id={listId}
            role="listbox"
            className="max-h-56 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500 text-center">{emptyMessage}</li>
            ) : (
              filtered.map((opt) => {
                const isActive = String(opt.value) === String(value);
                return (
                  <li key={opt.value} role="option" aria-selected={isActive}>
                    <button
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        isActive
                          ? "bg-orange-50 text-orange-700 font-medium"
                          : "text-blue-950 hover:bg-orange-50/80"
                      }`}
                    >
                      <span className="block truncate">{opt.label}</span>
                      {opt.description && (
                        <span className="block text-xs text-gray-500 mt-0.5 truncate">
                          {opt.description}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
