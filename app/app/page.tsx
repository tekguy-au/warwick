import type { Metadata } from "next";
import Game from "./components/Game";

export const metadata: Metadata = {
  title: "Catch Warwick — Find Warwick's Friends!",
  description: "A cosy real-world adventure: walk around and discover Warwick's friends hiding near you.",
};

export default function AppPage() {
  return <Game />;
}
