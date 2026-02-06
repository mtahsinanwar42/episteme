import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import RouteConfig from "@/routeConfig";
import { useAuthInitialization } from "@/hooks/useAuthInitialization";
import { type RootState } from "@/stores/store";
import { SuccessToastProvider } from "@/hooks/useSuccessToast";
import "@/App.css";

function App() {
  const theme = useSelector((state: RootState) => state.theme.theme);

  // Initialize authentication on app mount
  useAuthInitialization();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <SuccessToastProvider>
        <div className="min-h-screen text-foreground grid grid-rows-[1fr_auto]">
          <div className="h-full flex flex-col">
            <div className="sticky top-0 left-0 z-100">
              <Navbar />
            </div>

            <main className="h-full p-4 mx-auto w-full 2xl:max-w-7xl 2xl:px-0">
              <RouteConfig />
            </main>
          </div>

          <Footer />
        </div>
      </SuccessToastProvider>
    </BrowserRouter>
  );
}

export default App;
