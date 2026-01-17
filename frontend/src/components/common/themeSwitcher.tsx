import { useDispatch } from "react-redux";
import { setTheme, type ThemeType } from "@/stores/themeSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeSwitcher() {
  const dispatch = useDispatch();

  const handleThemeChange = (theme: ThemeType) => {
    dispatch(setTheme(theme));
  };

  return (
    <div className="flex gap-3 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger className="py-0!">
          Choose Theme
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleThemeChange("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange("emerald")}>
            Emerald
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
