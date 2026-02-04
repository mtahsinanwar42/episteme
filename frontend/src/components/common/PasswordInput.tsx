import React, { useState } from "react";
import { Input } from "@/components/ui/input";

export interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  disabled?: boolean;
  name?: string;
  id?: string;
}

export function getPasswordStrength(password: string) {
  let score = 0;
  const specialCharRegex = /[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/;
  if (password?.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (specialCharRegex.test(password)) score++;
  if (password?.length >= 12) score++; // bonus for length
  if (score <= 2) return { label: "Weak", color: "bg-red-400", score };
  if (score === 3) return { label: "Fair", color: "bg-yellow-400", score };
  if (score === 4) return { label: "Good", color: "bg-blue-400", score };
  return { label: "Strong", color: "bg-green-500", score };
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  onBlur,
  disabled,
  name = "password",
  id = "password",
}) => {
  const [touched, setTouched] = useState(false);
  const strength = getPasswordStrength(value);

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={id} className="text-sm font-medium ">
        Password *
      </label>
      <Input
        id={id}
        name={name}
        type="password"
        placeholder="Enter a secure password"
        value={value}
        onChange={onChange}
        onBlur={() => {
          setTouched(true);
          onBlur && onBlur();
        }}
        autoComplete="new-password"
        disabled={disabled}
      />
      {/* Password strength meter */}
      {value && (
        <div className="mt-1 flex items-center gap-2">
          <div className="w-32 h-2 rounded bg-slate-200 overflow-hidden">
            <div
              className={`h-2 transition-all duration-300 ${strength.color}`}
              style={{ width: `${(strength.score / 5) * 100}%` }}
            />
          </div>
          <span
            className={`text-xs font-medium ${strength.color.replace("bg-", "text-")}`}
          >
            {strength.label}
          </span>
        </div>
      )}
      {/* Password requirements */}
      {touched && strength.score < 4 && (
        <ul className="text-xs text-red-300 mt-1 list-disc ml-4">
          {value?.length < 8 && <li>At least 8 characters</li>}
          {!/[A-Z]/.test(value) && <li>At least one uppercase letter</li>}
          {!/[a-z]/.test(value) && <li>At least one lowercase letter</li>}
          {!/[0-9]/.test(value) && <li>At least one number</li>}
          {!/[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/.test(value) && (
            <li>At least one special character</li>
          )}
        </ul>
      )}
    </div>
  );
};
