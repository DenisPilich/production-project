import { HStack } from "@/shared/ui/Stack";
import { Page } from "@/widgets/Page/Page";
import { memo } from "react";
import { useTranslation } from "react-i18next";

export const MainPage = memo(() => {
  const { t } = useTranslation("main");
  return (
    <Page>
      {t("Главная страница")}
      <HStack>
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </HStack>
    </Page>
  );
});

export default MainPage;
MainPage.displayName = "MainPage";
