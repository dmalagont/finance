import type { Metadata } from "next";
import { PendulumLesson } from "@/components/learn/pendulum-lesson";

export const metadata: Metadata = { title: "The pendulum" };

export default function PendulumPage() {
  return <PendulumLesson />;
}
