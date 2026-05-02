"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import clsx from "clsx";


interface TextInputProps {
  type: 'text' | 'email' | 'password';
  id: string;
  // placeholder: string;
  label?: string;
  onChange?: (value: string) => void;
  error?: string;
  value?: string;
}

const TextInput: React.FC<TextInputProps> = (props) => {
  const { type, id, label, value, onChange, error } = props;

  // state to manage the input value and focus state
  const [internalValue, setInternalValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const inputValue = value ?? internalValue;
  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
    if (!value) setInternalValue(e.target.value);
  };

  const showFloatingLabel = isFocused || inputValue;

  return (
    <div className='w-full'>
      <div className={clsx(
        "h-14 w-full border rounded-xl relative px-4 transition-all duration-300 flex items-center gap-2",
        error
          ? "border-red-500"
          : "border-gray-300 focus-within:border-[#0F93A5]",
        showFloatingLabel ? "bg-transparent" : "bg-[#F9FAFB]"
      )}>
        {
          type === 'email'
            ? <Mail color='#99a1af' size={18} />
            : type === 'password'
              ? <Lock color='#99a1af' size={18} />
              : <User color='#99a1af' size={18} />
        }
        <span className={clsx("absolute px-1 transition-all duration-300 ease-in-out text-gray-500 capitalize pointer-events-none",
          !showFloatingLabel
            ? "top-1/2 -translate-y-1/2 bg-transparent left-9"
            : "-top-3.5 bg-white left-5")}>
          {label}
        </span>
        <input
          type={inputType}
          // placeholder={placeholder}
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className='w-full bg-transparent h-full border-none ring-0 outline-none' />
        {
          type === 'password' && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="focus:outline-none"

            >
              {showPassword ? <Eye color='#99a1af' size={18} /> : <EyeOff color='#99a1af' size={18} />}
            </button>
          )
        }
      </div>
      {/* Error text */}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default TextInput;
