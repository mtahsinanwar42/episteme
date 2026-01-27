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
import Register from "@/pages/register";
import UserDetails from "@/pages/users/details";
import NewUser from "@/pages/users/new";
import Assets from "@/pages/assets";
import AssetDetails from "@/pages/assets/details";
import NewAsset from "@/pages/assets/new";
import Activities from "@/pages/activities/list";
import ActivityDetails from "@/pages/activities/details";
import NewActivity from "@/pages/activities/new";

export default function RouteConfig() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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
      <Route
        path="/users/new"
        element={
          <ProtectedRoute>
            <NewUser />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/:userId"
        element={
          <ProtectedRoute>
            <UserDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assets"
        element={
          <ProtectedRoute>
            <Assets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assets/:fileId"
        element={
          <ProtectedRoute>
            <AssetDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assets/new"
        element={
          <ProtectedRoute>
            <NewAsset />
          </ProtectedRoute>
        }
      />

      <Route path="/activities" element={<Activities />} />
      <Route path="/activities/:activityId" element={<ActivityDetails />} />
      <Route path="/activities/new" element={<NewActivity />} />

      <Route path="/conferences" element={<Conferences />} />
      <Route path="/trainings" element={<Trainings />} />
      <Route path="/announcements" element={<Announcements />} />

      <Route path="/blogs" element={<Blogs />} />
      <Route path="/blogs/:id" element={<Blogs />} />

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
