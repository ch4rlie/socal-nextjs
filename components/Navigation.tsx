"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useShipping } from '@/hooks/useShipping'
import { useCart } from '@/hooks/useCart'
import { SocialIcons } from './social-icons'
import { Button, Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from '@nextui-org/react'

export function Navigation() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { region } = useShipping()
  const { getItemCount } = useCart()

  const cartItemCount = getItemCount()

  const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ]

  return (
    <Navbar 
      isMenuOpen={isMenuOpen} 
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="full"
      className="bg-black border-b border-gray-800"
    >
      <NavbarContent className="basis-1/5 sm:basis-full">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <Link href="/" className="flex justify-start items-center gap-1">
            <Image
              src="/logo-white.svg"
              alt="SoCal Prerunner"
              width={150}
              height={40}
              priority
            />
          </Link>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {menuItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                href={item.href}
                className={`text-sm ${
                  pathname === item.href
                    ? 'text-blue-400'
                    : 'text-gray-300 hover:text-blue-400'
                }`}
              >
                {item.name}
              </Link>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent justify="end" className="basis-1/5 sm:basis-full">
        <NavbarItem className="hidden lg:flex">
          <SocialIcons className="gap-4" />
        </NavbarItem>
        <NavbarItem>
          <Link href="/cart" className="relative text-white">
            <i className="fa-solid fa-shopping-cart text-xl" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
        </NavbarItem>
        <NavbarMenuToggle className="lg:hidden text-white" />
      </NavbarContent>

      <NavbarMenu className="pt-6 bg-black">
        <div className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <NavbarMenuItem key={item.href}>
              <Link
                href={item.href}
                className={`w-full text-lg ${
                  pathname === item.href
                    ? 'text-blue-400'
                    : 'text-gray-300'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem>
            <div className="mt-4">
              <SocialIcons className="gap-6" />
            </div>
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </Navbar>
  )
}
