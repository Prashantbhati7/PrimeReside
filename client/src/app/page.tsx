import Navbar from "@/components/Navbar";
import Landing from "@/app/(nondashnboard)/landing/page";


export default function Home() {
  return (
    <div className="h-full">
      <Navbar />
      <main className={`h-full flex w-full  flex-col`}>
        <Landing />
      </main>
    </div>
  );
}
