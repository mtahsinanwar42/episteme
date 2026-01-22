import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "@/stores/authSlice";
import { type RootState } from "@/stores/store";

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className="">
      <h1>Welcome to Episteme</h1>
    </div>
  );
}

export default Home;
