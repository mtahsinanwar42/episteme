import { Navigate, Route, Routes } from "react-router-dom";
import Login from "@/pages/login";
import AuthCallback from "@/pages/authCallback";
import ProtectedRoute from "@/components/common/protectedRoute";
import Users from "@/pages/users";
import Home from "@/pages/home";
import Mission from "@/pages/about/Mission";
import Ethics from "@/pages/about/Ethics";
import Sustainability from "@/pages/about/Sustainability";
import Executive from "@/pages/about/Executive";
import Policies from "@/pages/about/Policies";
import Career from "@/pages/about/Career";
import Contact from "@/pages/about/Contact";
import Conferences from "@/pages/conferences";
import Trainings from "@/pages/trainings";
import Announcements from "@/pages/announcements";
import Blogs from "@/pages/blogs";

export default function RouteConfig() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route path="/" element={<Home />} />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />

      <Route path="/conferences" element={<Conferences />} />
      <Route path="/trainings" element={<Trainings />} />
      <Route path="/announcements" element={<Announcements />} />
      <Route path="/blogs" element={<Blogs />} />

      <Route path="/about/mission" element={<Mission />} />
      <Route path="/about/ethics" element={<Ethics />} />
      <Route path="/about/sustainability" element={<Sustainability />} />
      <Route path="/about/executive" element={<Executive />} />
      <Route path="/about/policies" element={<Policies />} />
      <Route path="/about/career" element={<Career />} />
      <Route path="/about/contact" element={<Contact />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
