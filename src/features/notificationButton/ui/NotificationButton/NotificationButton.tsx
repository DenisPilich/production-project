import { classNames } from "@/shared/lib/classNames/classNames";
import React, { memo, useCallback, useState } from "react";
import { Button, ThemeButton } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";
import NotificationIcon from "@/shared/assets/icons/notification-20-20.svg";
import { NotificationList } from "@/entities/Notification";
import { Popover } from "@/shared/ui/Popups";
import { Drawer } from "@/shared/ui/Drawer/Drawer";
import { isMobileOnly } from "react-device-detect";
import cls from "./NotificationButton.module.scss";

interface NotificationButtonProps {
  className?: string;
}

export const NotificationButton = memo((props: NotificationButtonProps) => {
  const { className } = props;
  const [isOpen, setIsOpen] = useState(false);

  const onOpenDrawer = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onCloseDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * isMobileOnly — строго телефоны.
   * isMobile / MobileView сюда включают ещё и планшеты (iPad и т.п.),
   * поэтому используем именно isMobileOnly. На десктопе и планшетах — Popover.
   */
  if (isMobileOnly) {
    return (
      <div>
        <Button onClick={onOpenDrawer} theme={ThemeButton.CLEAR}>
          <Icon Svg={NotificationIcon} inverted />
        </Button>
        <Drawer isOpen={isOpen} onClose={onCloseDrawer}>
          <NotificationList />
        </Drawer>
      </div>
    );
  }

  return (
    <Popover
      className={classNames(cls.NotificationButton, {}, [className])}
      direction="bottom left"
      trigger={(
        <Button theme={ThemeButton.CLEAR}>
          <Icon Svg={NotificationIcon} inverted />
        </Button>
      )}
    >
      <NotificationList className={cls.notifications} />
    </Popover>
  );
});

NotificationButton.displayName = "NotificationButton";
