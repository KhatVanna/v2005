import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
  height?: number;
  priority?: boolean;
};

export function Logo({
  href = "/",
  className = "",
  height = 40,
  priority = true,
}: LogoProps) {
  const width = Math.round(height * 3);

  return (
    <Link
      href={href}
      className={`inline-flex items-center ${className}`}
      aria-label="V2005 home"
    >
      <Image
        src="/images/logo_v2005.png"
        alt="V2005"
        width={width}
        height={height}
        priority={priority}
        className="rounded-md object-contain"
        style={{ width: "auto", height }}
      />
    </Link>
  );
}
