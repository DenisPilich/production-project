import { useTranslation } from "react-i18next";
import cls from "./LoginForm.module.scss";
import { classNames } from "@/shared/lib/classNames/classNames";
import Button, { ThemeButton } from "@/shared/ui/Button/Button";
import { Input } from "@/shared/ui/Input/Input";
import { useSelector } from "react-redux";
import { memo, useCallback } from "react";
import { loginActions, loginReducer } from "../../model/slice/loginSlice";
import { loginByUsername } from "../../model/services/loginByUsername/loginByUsername";
import { TextTheme, Text } from "@/shared/ui/Text/Text";
import { getLoginUsername } from "../../model/selectors/getLoginUsername/getLoginUsername";
import { getLoginPassword } from "../../model/selectors/getLoginPassword/getLoginPassword";
import { getLoginError } from "../../model/selectors/getLoginError/getLoginError";
import { getLoginIsLoading } from "../../model/selectors/getLoginIsLoading/getLoginIsLoading";
import DynamicModuleLoader, {
  ReducersList,
} from "@/shared/lib/components/DynamicModuleLoader/DynamicModuleLoader";
import { useAppDispatch } from "@/shared/lib/hooks/useAppDispatch";

export interface LoginFormProps {
  className?: string;
  onSuccess: () => void;
}

const initialReducer: ReducersList = {
  loginForm: loginReducer,
};

export const LoginForm = memo(({ className, onSuccess }: LoginFormProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const username = useSelector(getLoginUsername);
  const password = useSelector(getLoginPassword);
  const error = useSelector(getLoginError);
  const isLoading = useSelector(getLoginIsLoading);

  const onChangeUsername = useCallback(
    (value: string) => {
      dispatch(loginActions.setUsername(value));
    },
    [dispatch],
  );

  const onLoginClick = useCallback(async () => {
    try {
      await dispatch(loginByUsername({ username, password })).unwrap();
      onSuccess();
    } catch {
      // login failed, error state is handled by redux
    }
  }, [onSuccess, dispatch, password, username]);

  const onChangePassword = useCallback(
    (value: string) => {
      dispatch(loginActions.setPassword(value));
    },
    [dispatch],
  );

  return (
    <DynamicModuleLoader reducers={initialReducer}>
      <div
        className={classNames(cls.LoginForm, {}, className ? [className] : [])}
      >
        <Text title={t("Форма авторизации")} />
        {error && <Text text={error} theme={TextTheme.ERROR} />}
        <Input
          autofocus
          type="text"
          className={cls.input}
          placeholder={t("Введите username")}
          onChange={onChangeUsername}
          value={username}
        />
        <Input
          type="text"
          className={cls.input}
          placeholder={t("Введите пароль")}
          onChange={onChangePassword}
          value={password}
        />
        <Button
          className={cls.loginBtn}
          theme={ThemeButton.OUTLINE}
          onClick={onLoginClick}
          disabled={isLoading}
        >
          {t("Войти")}
        </Button>
      </div>
    </DynamicModuleLoader>
  );
});

LoginForm.displayName = "LoginForm";
