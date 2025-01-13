import Image from "next/image";
import AuthGuard from "@/components/AuthGuard";


export default function Home() {



  return (
    <AuthGuard>
      <div>
        <h1>Home</h1>
      </div>
    </AuthGuard>
  );
}
