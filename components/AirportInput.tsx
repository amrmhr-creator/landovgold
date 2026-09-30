"use client";

import { useId, useState } from "react";
import { airportLabel, searchAirports } from "@/lib/airports";

type Props = {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
};

/** Searchable airport picker. Free text is still accepted for airports not in the list. */
export default function AirportInput({ name, label, placeholder, defaultValue = "" }: Props) {
  const id = useId();
  const listId = `${id}-list`;
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const results = searchAirports(value);

  function choose(i: number) {
    const a = results[i];
    if (!a) return;
    setValue(airportLabel(a));
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + results.length) % results.length);
    } else if (e.key === "Enter" && open && results.length > 0) {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showList = open && results.length > 0;

  return (
    <label className="airport">
      {label}
      <input
        name={name}
        required
        maxLength={100}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList ? `${id}-${active}` : undefined}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={(e) => {
          e.target.select();
          setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {showList && (
        <ul className="airport-list" id={listId} role="listbox">
          {results.map((a, i) => (
            <li
              key={a.code}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === active}
              // mousedown, not click: keeps focus in the input so onBlur doesn't close the list first.
              onMouseDown={(e) => {
                e.preventDefault();
                choose(i);
              }}
              onMouseEnter={() => setActive(i)}
            >
              <span>
                {a.city}
                <small>{a.country}</small>
              </span>
              <b dir="ltr">{a.code}</b>
            </li>
          ))}
        </ul>
      )}
    </label>
  );
}
