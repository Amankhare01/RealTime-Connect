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
      className="
        w-full
        sm:w-60
        md:w-72
        bg-gray-700
        text-white
        px-3
        py-1.5
        rounded
        outline-none
        focus:ring-2
        focus:ring-blue-500
      "
    />
  );
}
