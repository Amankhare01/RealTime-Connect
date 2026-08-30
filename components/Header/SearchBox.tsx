"use client";

import { useState } from "react";

export default function SearchBox({
  onSearch,
}: {
  onSearch: (value: string) => void;
}) {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    onSearch(val);
  };

  return (
    <input
      value={value}
      onChange={handleChange}
      placeholder="Search by email or user ID"
      aria-label="Search by email or user ID"
      className="
        w-full
        sm:w-60
        md:w-72
        bg-slate-100
        dark:bg-slate-800/80
        text-text-primary
        placeholder:text-text-secondary
        px-3.5
        py-1.5
        rounded-xl
        border
        border-border-subtle
        outline-none
        focus:ring-2
        focus:ring-blue-500
        transition-colors
        text-sm
      "
    />
  );
}
