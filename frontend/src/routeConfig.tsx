import { Navigate, Route, Routes } from "react-router-dom";
import Login from "@/pages/login";
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
import UserSearch from "@/pages/users/search";
import Assets from "@/pages/assets";
import AssetDetails from "@/pages/assets/details";
import NewAsset from "@/pages/assets/new";
import AssetSearch from "@/pages/assets/search";
import Activities from "@/pages/activities";
import ActivitySearch from "@/pages/activities/search";
import ActivityDetails from "@/pages/activities/details";
import NewActivity from "@/pages/activities/new";
import EditActivity from "@/pages/activities/edit";
import TrainingDetails from "@/pages/trainings/details";
import NewTraining from "@/pages/trainings/new";
import EditTraining from "@/pages/trainings/edit";
import TrainingSearch from "@/pages/trainings/search";
import AnnouncementDetails from "@/pages/announcements/details";
import NewAnnouncement from "@/pages/announcements/new";
import EditAnnouncement from "@/pages/announcements/edit";
import AnnouncementSearch from "@/pages/announcements/search";
import BlogDetails from "@/pages/blogs/details";
import NewBlog from "@/pages/blogs/new";
import EditBlog from "@/pages/blogs/edit";
import BlogSearch from "@/pages/blogs/search";
import ConferenceDetails from "@/pages/conferences/details";
import NewConference from "@/pages/conferences/new";
import EditConference from "@/pages/conferences/edit";
import ConferenceSearch from "@/pages/conferences/search";
import { aboutPageFlags } from "@/config/featureFlags";
import Unauthorized from "@/pages/misc/unauthorized";
import NotFound from "@/pages/misc/notFound";
import UpdatePassword from "@/pages/me/updatePassword";
import MyProfile from "@/pages/me/myProfile";
import ForgotPassword from "./pages/me/forgotPassword";
import ResetPassword from "./pages/me/resetPassword";
import { UserRole } from "@/models/user";
import AllReviewAssignments from "@/pages/review-assignments";
import MyReviewAssignments from "@/pages/reviewer/review-assignments";

export default function RouteConfig() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

      <Route path="/" element={<Home />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MyProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/update-password"
        element={
          <ProtectedRoute>
            <UpdatePassword />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/new"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <NewUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/search"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <UserSearch />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/:userId"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <UserDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assets"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <Assets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assets/search"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AssetSearch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assets/:fileId"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AssetDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assets/new"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <NewAsset />
          </ProtectedRoute>
        }
      />

      <Route path="/activities" element={<Activities />} />
      <Route path="/activities/search" element={<ActivitySearch />} />
      <Route path="/activities/:activityId" element={<ActivityDetails />} />
      <Route
        path="/activities/new"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <NewActivity />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activities/edit/:activityId"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <EditActivity />
          </ProtectedRoute>
        }
      />

      <Route path="/trainings" element={<Trainings />} />
      <Route path="/trainings/search" element={<TrainingSearch />} />
      <Route path="/trainings/:trainingId" element={<TrainingDetails />} />
      <Route
        path="/trainings/new"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <NewTraining />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trainings/edit/:trainingId"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <EditTraining />
          </ProtectedRoute>
        }
      />

      <Route path="/announcements" element={<Announcements />} />
      <Route path="/announcements/search" element={<AnnouncementSearch />} />
      <Route
        path="/announcements/:announcementId"
        element={<AnnouncementDetails />}
      />
      <Route
        path="/announcements/new"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <NewAnnouncement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements/edit/:announcementId"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <EditAnnouncement />
          </ProtectedRoute>
        }
      />

      <Route path="/conferences" element={<Conferences />} />
      <Route path="/conferences/search" element={<ConferenceSearch />} />
      <Route
        path="/conferences/:conferenceId"
        element={<ConferenceDetails />}
      />

      <Route
        path="/conferences/new"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <NewConference />
          </ProtectedRoute>
        }
      />

      <Route
        path="/conferences/edit/:conferenceId"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <EditConference />
          </ProtectedRoute>
        }
      />

      <Route path="/blogs" element={<Blogs />} />
      <Route path="/blogs/search" element={<BlogSearch />} />
      <Route path="/blogs/:blogId" element={<BlogDetails />} />
      <Route
        path="/blogs/new"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <NewBlog />
          </ProtectedRoute>
        }
      />
      <Route
        path="/blogs/edit/:blogId"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <EditBlog />
          </ProtectedRoute>
        }
      />

      {aboutPageFlags.mission && (
        <Route path="/about/mission" element={<Mission />} />
      )}
      {aboutPageFlags.ethics && (
        <Route path="/about/ethics" element={<Ethics />} />
      )}
      {aboutPageFlags.sustainability && (
        <Route path="/about/sustainability" element={<Sustainability />} />
      )}
      {aboutPageFlags.executive && (
        <Route path="/about/executive" element={<Executive />} />
      )}
      {aboutPageFlags.policies && (
        <Route path="/about/policies" element={<Policies />} />
      )}
      {aboutPageFlags.career && (
        <Route path="/about/career" element={<Career />} />
      )}
      {aboutPageFlags.contact && (
        <Route path="/about/contact" element={<Contact />} />
      )}

      <Route
        path="/review-assignments"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AllReviewAssignments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/review-assignments/me"
        element={
          <ProtectedRoute allowedRoles={[UserRole.REVIEWER]}>
            <MyReviewAssignments />
          </ProtectedRoute>
        }
      />

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/404-not-found" element={<NotFound />} />

      <Route path="*" element={<Navigate to="/404-not-found" replace />} />
    </Routes>
  );
}
