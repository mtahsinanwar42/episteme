import HeroSection from "@/components/home/HeroSection";
import HomeMission from "@/components/home/HomeMission";
import HomeBlogSection from "@/components/home/HomeBlogSection";
import HomeActivitySection from "@/components/home/HomeActivitySection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <HomeMission />
      <HomeBlogSection />
      <HomeActivitySection />
    </div>
  );
}
