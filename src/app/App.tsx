import { Suspense, useEffect } from "react";
import { classNames } from "@/shared/lib/classNames/classNames";
import { useTheme } from "./providers/ThemeProvider";
import { Navbar } from "@/widgets/Navbar";
import { Sidebar } from "@/widgets/Sidebar";
import { AppRouter } from "./providers/router";
import { useDispatch, useSelector } from "react-redux";
import { getUserInited, userActions } from "@/entities/User";
import { PageLoader } from "@/shared/ui/Pageloader";

export default function App() {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const inited = useSelector(getUserInited);
  useEffect(() => {
    dispatch(userActions.initAuthData());
  }, [dispatch]);

  return (
    <div className={classNames("app", {}, [theme])}>
      <Suspense fallback={<PageLoader />}>
        <Navbar />
        <div className="content-page">
          <Sidebar />
          {inited && <AppRouter />}
        </div>
      </Suspense>
    </div>
  );
}
