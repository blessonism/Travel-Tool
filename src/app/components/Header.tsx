"use client";

import MenuButton from "@/components/MenuButton";
import { Bars3Icon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Item } from "react-stately";

const items = [
  { href: "/blogs", label: "Blog" },
  { href: "/about", label: "About us" },
];

export default function Header() {
  const router = useRouter();

  return (
    <header className="flex items-center w-full justify-between mb-12">
      <h2 className="font-bold text-xl">
        <Link href="/">Travel Ai Tool</Link>
      </h2>
      <div className="sm:hidden">
        <MenuButton
          icon={<Bars3Icon className="w-6 h-6" />}
          className="p-2"
          onAction={(route) => {
            router.push(route as string);
          }}
        >
          {items.map((item) => (
            <Item key={item.href}>{item.label}</Item>
          ))}
        </MenuButton>
      </div>
      <div className="hidden sm:flex sm:gap-6 font-medium">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
