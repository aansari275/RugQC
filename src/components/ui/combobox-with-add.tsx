"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface ComboboxWithAddProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  onAddOption: (value: string) => Promise<void>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}

export function ComboboxWithAdd({
  value,
  onChange,
  options,
  onAddOption,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No options found.",
  className,
}: ComboboxWithAddProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  const showAddNew = search.trim() && !options.some(
    (opt) => opt.toLowerCase() === search.toLowerCase()
  );

  const handleAddNew = async () => {
    if (!search.trim()) return;
    setIsAdding(true);
    try {
      await onAddOption(search.trim());
      onChange(search.trim());
      setSearch("");
      setOpen(false);
    } catch (error) {
      console.error("Error adding option:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setSearch("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-11 rounded-xl font-normal",
            !value && "text-zinc-500",
            className
          )}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="flex flex-col">
          {/* Search input */}
          <div className="flex items-center border-b px-3 py-2">
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              autoFocus
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setSearch("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 && !showAddNew && (
              <div className="py-6 text-center text-sm text-zinc-500">
                {emptyText}
              </div>
            )}

            {filteredOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={cn(
                  "flex w-full items-center px-3 py-2 text-sm hover:bg-zinc-100 cursor-pointer",
                  value === option && "bg-emerald-50"
                )}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4 text-emerald-600",
                    value === option ? "opacity-100" : "opacity-0"
                  )}
                />
                {option}
              </button>
            ))}

            {/* Add new option */}
            {showAddNew && (
              <button
                onClick={handleAddNew}
                disabled={isAdding}
                className="flex w-full items-center px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 cursor-pointer border-t"
              >
                <Plus className="mr-2 h-4 w-4" />
                {isAdding ? "Adding..." : `Add "${search}"`}
              </button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
