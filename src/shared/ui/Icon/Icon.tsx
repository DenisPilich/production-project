import { memo } from "react";
import cls from "./Icon.module.scss";
import { classNames } from "@/shared/lib/classNames/classNames";

interface IconProps {
  className?: string;
  Svg: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  inverted?: boolean;
}

export const Icon = memo((props: IconProps) => {
  const { className, Svg, inverted } = props;

  return (
    <Svg className={classNames(cls.Icon, { [cls.inverted]: inverted }, className ? [className] : [])} />
  );
});

Icon.displayName = "Icon";
