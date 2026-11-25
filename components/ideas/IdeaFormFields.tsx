"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type IdeaFormValues = {
  title: string;
  description: string;
  category: string;
  tags: string;
};

export const EMPTY_IDEA_FORM: IdeaFormValues = {
  title: "",
  description: "",
  category: "",
  tags: "",
};

const CATEGORIES = [
  { value: "Development", label: "💻 Development" },
  { value: "Product", label: "📦 Product" },
  { value: "Automation", label: "🤖 Automation" },
  { value: "Productivity", label: "⚡ Productivity" },
  { value: "User Experience", label: "🎨 User Experience" },
  { value: "Other", label: "🔧 Other" },
];

const inputClass =
  "bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400";
const labelClass = "text-sm text-cyan-300 mb-2 block";

export function validateIdeaForm(values: IdeaFormValues): string | null {
  if (values.title.trim().length < 5)
    return "Give your idea a title of at least 5 characters";
  if (values.description.trim().length < 20)
    return "Describe your idea in at least 20 characters";
  return null;
}

export function parseTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export function IdeaFormFields({
  idPrefix,
  values,
  onChange,
}: {
  idPrefix: string;
  values: IdeaFormValues;
  onChange: (values: IdeaFormValues) => void;
}) {
  const set = (field: keyof IdeaFormValues) => (value: string) =>
    onChange({ ...values, [field]: value });

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-title`} className={labelClass}>
          Title
        </label>
        <Input
          id={`${idPrefix}-title`}
          name="title"
          autoComplete="off"
          placeholder="e.g. Glossary builder for transcripts…"
          value={values.title}
          onChange={(e) => set("title")(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-description`} className={labelClass}>
          Description
        </label>
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          placeholder="What problem does it solve, and for whom?…"
          value={values.description}
          onChange={(e) => set("description")(e.target.value)}
          rows={6}
          className={`w-full rounded-md border px-3 py-2 resize-y focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-400/50 ${inputClass}`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${idPrefix}-category`} className={labelClass}>
            Category
          </label>
          <div className="space-y-2">
            <Select value={values.category} onValueChange={set("category")}>
              <SelectTrigger
                id={`${idPrefix}-category`}
                className="bg-black/20 border-cyan-400/30 text-white"
              >
                <SelectValue placeholder="Pick a category" />
              </SelectTrigger>
              <SelectContent className="bg-black/80 border-cyan-400/30 text-white">
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              aria-label="Custom category"
              name="customCategory"
              autoComplete="off"
              placeholder="Or type your own…"
              value={values.category}
              onChange={(e) => set("category")(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${idPrefix}-tags`} className={labelClass}>
            Tags (comma-separated)
          </label>
          <Input
            id={`${idPrefix}-tags`}
            name="tags"
            autoComplete="off"
            placeholder="e.g. react, api, ui…"
            value={values.tags}
            onChange={(e) => set("tags")(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
