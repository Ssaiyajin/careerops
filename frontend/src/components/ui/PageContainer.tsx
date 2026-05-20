import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function PageContainer({ children }: Props) {
  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6">
      {children}
    </div>
  );
}