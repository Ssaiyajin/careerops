import Link from "next/link";
import Container from "./Container";

export default function Navbar() {
  return (
    <nav className="border-b border-neutral-800 bg-black">
      <Container>
        <div className="flex h-16 items-center justify-between">
          
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-white"
          >
            CareerOps AI
          </Link>

          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/upload" className="hover:text-white transition">
              Upload
            </Link>

            <Link href="/results" className="hover:text-white transition">
              Results
            </Link>
          </div>

        </div>
      </Container>
    </nav>
  );
}