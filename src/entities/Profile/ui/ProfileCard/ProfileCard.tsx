import { useTranslation } from "react-i18next";
import cls from "./ProfileCard.module.scss";
import { Input } from "@/shared/ui/Input/Input";
import { Text, TextAlign, TextTheme } from "@/shared/ui/Text/Text";
import { classNames, Mods } from "@/shared/lib/classNames/classNames";
import { Profile } from "../../../../features/editableProfileCard/types/profile";
import Loader from "@/shared/ui/Loader/Loader";
import Avatar from "@/shared/ui/Avatar/Avatar";
import { Currency, CurrencySelect } from "@/entities/Currency";
import { Country as CountryEntity, CountrySelect } from "@/entities/Country";
import { Country } from "@/shared/const/common";
import { HStack, VStack } from "@/shared/ui/Stack";

interface ProfileCardProps {
  className?: string;
  data?: Profile;
  isLoading?: boolean;
  error?: string;
  readonly?: boolean;
  onChangeFirstname?: (value?: string) => void;
  onChangeLastname?: (value?: string) => void;
  onChangeAge?: (value?: string) => void;
  onChangeCity?: (value?: string) => void;
  onChangeUsername?: (value?: string) => void;
  onChangeAvatar?: (value?: string) => void;
  onChangeCurrency?: (value: Currency) => void;
  onChangeCountry?: (value: Country) => void;
}

export const ProfileCard = ({
  className,
  data,
  isLoading,
  error,
  readonly,
  onChangeFirstname,
  onChangeLastname,
  onChangeAge,
  onChangeCity,
  onChangeUsername,
  onChangeAvatar,
  onChangeCurrency,
  onChangeCountry,
}: ProfileCardProps) => {
  const { t } = useTranslation("profile");

  if (isLoading) {
    return (
      <HStack
        max
        justify="center"
        className={classNames(
          cls.ProfileCard,
          { [cls.loading]: true },
          className ? [className] : [],
        )}
      >
        <Loader />
      </HStack>
    );
  }
  if (error) {
    return (
      <HStack
        justify="center"
        className={classNames(
          cls.ProfileCard,
          {},
          className ? [className, cls.error] : [],
        )}
      >
        <Text
          title={t("Произошла ошибка при загрузке профиля")}
          theme={TextTheme.ERROR}
          align={TextAlign.CENTER}
        />
      </HStack>
    );
  }

  const mods: Mods = {
    [cls.editing]: !readonly,
  };

  return (
    <VStack
      max
      gap="16"
      className={classNames(
        cls.ProfileCard,
        mods,
        className ? [className] : [],
      )}
    >
      {data?.avatar && (
        <HStack justify="center" max>
          <Avatar src={data?.avatar} />
        </HStack>
      )}
      <Input
        value={data?.first || ""}
        placeholder={t("Ваше имя")}
        className={cls.input}
        readonly={readonly}
        onChange={onChangeFirstname}
      />
      <Input
        value={data?.lastname || ""}
        placeholder={t("Ваша фамилия")}
        className={cls.input}
        readonly={readonly}
        onChange={onChangeLastname}
      />
      <Input
        value={data?.age !== undefined ? String(data.age) : ""}
        placeholder={t("Ваш возраст")}
        className={cls.input}
        readonly={readonly}
        onChange={onChangeAge}
        type="number"
        min="0" // 
        max="150" //
      />
      <Input
        value={data?.city || ""}
        placeholder={t("Город")}
        className={cls.input}
        readonly={readonly}
        onChange={onChangeCity}
      />
      <Input
        value={data?.username || ""}
        placeholder={t("Имя пользователя")}
        className={cls.input}
        readonly={readonly}
        onChange={onChangeUsername}
      />
      <Input
        value={data?.avatar || ""}
        placeholder={t("Аватар")}
        className={cls.input}
        readonly={readonly}
        onChange={onChangeAvatar}
      />
      <CurrencySelect
        className={cls.input}
        value={data?.currency as Currency | undefined}
        onChange={onChangeCurrency}
        readonly={readonly}
      />
      <CountrySelect
        className={cls.input}
        value={data?.country as Country | undefined}
        onChange={onChangeCountry}
        readonly={readonly}
      />
    </VStack>
  );
};
