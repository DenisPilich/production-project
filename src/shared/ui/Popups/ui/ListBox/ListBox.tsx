import { Fragment, ReactNode } from "react";
import { Listbox as HListBox } from "@headlessui/react";
import { HStack } from "../../../Stack";
import { Button } from "../../../Button/Button";
import cls from "./ListBox.module.scss";
import { mapDirectionClass } from "../../styles/consts";
import popupCls from "../../styles/popup.module.scss";
import { classNames } from "@/shared/lib/classNames/classNames";
import { DropdownDirection } from "@/shared/types/ui";

export interface ListBoxItem {
  value: string;
  content: ReactNode;
  disabled?: boolean;
}

interface ListBoxProps {
  items?: ListBoxItem[];
  className?: string;
  value?: string;
  defaultValue?: string;
  onChange: (value: string) => void;
  readonly?: boolean;
  direction?: DropdownDirection;
  label?: string;
}

export function ListBox(props: ListBoxProps) {
  const {
    className,
    items,
    value,
    defaultValue,
    onChange,
    readonly,
    direction = "bottom right",
    label,
  } = props;

  const optionsClasses = [mapDirectionClass[direction]];

  return (
    <HStack
      gap="4"
      className={classNames("", { [popupCls.readonly]: !!readonly }, [])}
    >
      {label && <span>{`${label}>`}</span>}
      <HListBox
        disabled={readonly}
        as="div"
        className={classNames("", {}, [className, popupCls.popup])}
        value={value}
        onChange={onChange}
      >
        <HListBox.Button
          as={Button}
          disabled={readonly}
          className={popupCls.notrggier}
        >
          {value ?? defaultValue}
        </HListBox.Button>
        <HListBox.Options
          className={classNames(cls.options, {}, optionsClasses)}
        >
          {items?.map((item) => (
            <HListBox.Option
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              as={Fragment}
            >
              {({ active }) => (
                <li
                  className={classNames(cls.item, {
                    [popupCls.active]: active,
                    [popupCls.disabled]: item.disabled,
                  })}
                >
                  {item.content}
                </li>
              )}
            </HListBox.Option>
          ))}
        </HListBox.Options>
      </HListBox>
    </HStack>
  );
}
