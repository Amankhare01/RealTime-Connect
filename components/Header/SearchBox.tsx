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
    <div className="relative w-full">
      <input
        value={value}
        onChange={handleChange}
        placeholder="Search by email or user ID"
        className="
          w-full
          bg-slate-200/70 hover:bg-slate-200/90 dark:bg-slate-950/40 dark:hover:bg-slate-950/60
          text-slate-800 dark:text-slate-100
          placeholder-slate-500 dark:placeholder-slate-500
          px-4
          py-2
          rounded-xl
          border border-slate-300 dark:border-white/5
          outline-none
          focus:bg-white dark:focus:bg-slate-950
          focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
          transition-all duration-200
          text-sm
        "
      />
    </div>
  );
}
