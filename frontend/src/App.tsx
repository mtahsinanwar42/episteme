import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import Footer from "@/features/footer";
import Navbar from "@/features/navbar";
import RouteConfig from "@/routeConfig";
import { type RootState } from "@/stores/store";
import "@/App.css";

function App() {
  const theme = useSelector((state: RootState) => state.theme.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-linear-to-br from-slate-100 via-slate-50 to-indigo-100 text-foreground flex flex-col justify-between">
        <div className="flex-1 flex flex-col">
          <div className="sticky top-0 left-0 z-100">
            <Navbar />
          </div>

          <RouteConfig />
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
