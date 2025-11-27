import { redirect } from "next/navigation";
import { MadeWithDyad } from "@/components/made-with-dyad";

export default function Home() {
  // Redirect the root URL to the PIX generator page
  redirect("/pix");
}