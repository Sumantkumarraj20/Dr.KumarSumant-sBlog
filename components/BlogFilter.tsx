import React from "react";

type BlogFilterProps = {
  lang: string;
  category: string;
  onLangChange: (lng: string) => void;
  onCategoryChange: (cat: string) => void;
};

export default function BlogFilter({
  lang,
  category,
  onLangChange,
  onCategoryChange,
}: BlogFilterProps) {
  const languages = ["en", "hi", "ru"];
  const categories = ["education", "medical", "story"];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      {/* Language */}
      <div className="flex gap-2">
        {languages.map((lng) => (
          <button
            key={lng}
            onClick={() => onLangChange(lng)}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
              lang === lng
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {lng === "en" ? "EN" : lng === "hi" ? "हिंदी" : "RU"}
          </button>
        ))}
      </div>

      {/* Category */}
      <div className="flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
              category === cat
                ? "bg-green-600 text-white shadow"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
