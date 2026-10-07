import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function PageContainer({ children, className = "" }: Props) {
  return (
    <div
      className={`
        relative
        z-10
        flex
        w-full
        items-center
        justify-center
        px-4
        sm:px-6
        py-20
        ${className}
      `}
    >
      <div className="w-full max-w-6xl min-w-0">
        {children}
      </div>
    </div>
  );
}