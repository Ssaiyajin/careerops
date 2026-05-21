import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function PageContainer({ children }: Props) {
  return (
    <div
      className="
        relative
        z-10
        flex
        min-h-screen
        w-full
        items-center
        justify-center
        px-6
        py-20
      "
    >
      <div className="w-full max-w-6xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}