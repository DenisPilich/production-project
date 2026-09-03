import React, { memo } from "react";
import { classNames } from "@/shared/lib/classNames/classNames";
import cls from "./Button.module.scss";

export enum ThemeButton {
  CLEAR = "clear",
  CLEAR_INVERTED = "clearInverted",
  BACKGROUND = "background",
  BACKGROUND_INVERTED = "backgroundInverted",
  OUTLINE = "outline",
  OUTLINE_RED = "outlineRed",
}

export enum SizeButton {
  M = "size_m",
  L = "size_l",
  XL = "size_xl",
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  theme?: ThemeButton;
  size?: SizeButton;
  disabled?: boolean;
}

export const Button = memo(
  ({ className, theme, size, disabled, ...rest }: ButtonProps) => {
    const mods: Record<string, boolean> = {
      ...(theme && { [cls[theme]]: true }),
      ...(size && { [cls[size]]: true }),
      ...(disabled && { [cls.disabled]: true }),
    };
    return (
      <button
        type="button"
        className={classNames(cls.Button, mods, className ? [className] : [])}
        disabled={disabled}
        {...rest}
      >
        {rest.children}
      </button>
    );
  },
);

export default Button;
Button.displayName = "Button";
