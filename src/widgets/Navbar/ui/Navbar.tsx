import { useTranslation } from "react-i18next";
import React, { memo, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import cls from "./Navbar.module.scss";
import { getUserAuthData, userActions, UserRole } from "@/entities/User";
import { classNames } from "@/shared/lib/classNames/classNames";
import { Text, TextTheme } from "@/shared/ui/Text/Text";
import { AppLink, AppLinkTheme } from "@/shared/ui/AppLink/AppLink";
import { RoutePath } from "@/shared/config/routeConfig/routeConfig";
import Avatar from "@/shared/ui/Avatar/Avatar";
import Button, { ThemeButton } from "@/shared/ui/Button/Button";
import LoginModal from "@/features/AuthByUsername/ui/LoginModal/LoginModal";
import { HStack } from "@/shared/ui/Stack";
import { Icon } from "@/shared/ui/Icon/Icon";
import NotificationIcon from "@/shared/assets/icons/notification-20-20.svg";
import { Dropdown } from "@/shared/ui/Popups";
interface NavbarProps {
  className?: string;
}

export const Navbar = memo(({ className }: NavbarProps) => {
  const { t } = useTranslation();
  const [isAuthModal, setIsAuthModal] = useState(false);
  const authData = useSelector(getUserAuthData);
  const dispatch = useDispatch();

  const onCloseModal = useCallback(() => {
    setIsAuthModal(false);
  }, []);

  const onShowModal = useCallback(() => {
    setIsAuthModal(true);
  }, []);

  const onLogout = useCallback(() => {
    dispatch(userActions.logout());
  }, [dispatch]);

  const userRoles = authData?.roles ?? authData?.role ?? [];

  const isAdminPanelVisible =
    userRoles.some(
      (role) => role === UserRole.ADMIN || role === UserRole.OWNER,
    ) ?? false;

  if (authData) {
    return (
      <header className={classNames(cls.Navbar, {}, [className])}>
        <Text
          className={cls.appName}
          title={t("Deniska")}
          theme={TextTheme.INVERTED}
        />
        <AppLink
          to={RoutePath.articles_create}
          theme={AppLinkTheme.SECONDARY}
          className={cls.createBtn}
        >
          {t("Создать статью")}
        </AppLink>
        <HStack gap="16" className={cls.actions}>
          <Button theme={ThemeButton.CLEAR}>
            <Icon Svg={NotificationIcon} inverted />
          </Button>
          <Dropdown
            direction="bottom left"
            items={[
              ...(isAdminPanelVisible
                ? [{ content: t("Админ панель"), href: RoutePath.admin_panel }]
                : []),
              {
                content: t("Профиль"),
                href: RoutePath.profile + authData.id,
              },
              {
                content: t("Выйти"),
                onClick: onLogout,
              },
            ]}
            trigger={<Avatar size={30} src={authData.avatar} />}
          />
        </HStack>
      </header>
    );
  }

  return (
    <header className={classNames(cls.Navbar, {}, [className])}>
      <Button
        theme={ThemeButton.CLEAR_INVERTED}
        className={cls.links}
        onClick={onShowModal}
      >
        {t("Войти")}
      </Button>
      {isAuthModal && (
        <LoginModal isOpen={isAuthModal} onClose={onCloseModal} />
      )}
    </header>
  );
});

Navbar.displayName = "Navbar";
