import dynamic from "next/dynamic";

const Comparison = dynamic(() => import("@/components/Comparison"), { ssr: false });

export default function Page() {
  return <Comparison />;
}