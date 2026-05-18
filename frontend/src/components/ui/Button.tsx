import React from "react";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function Button({
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:opacity-90 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}