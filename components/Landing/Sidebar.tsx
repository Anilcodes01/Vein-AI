"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuNotebook } from "react-icons/lu";
import { RiGeminiFill } from "react-icons/ri";
import { MdOutlineAnalytics } from "react-icons/md";
import { TbLayoutDashboard } from "react-icons/tb";
import {
  FaTachometerAlt,
  FaCameraRetro,
  FaChartLine,
  FaHistory,
  FaFileAlt,
  FaCog,
  FaInfoCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from "react-icons/fa";
import { Globe } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: TbLayoutDashboard },
  { name: "Track", href: "/track", icon: LuNotebook },
  { name: "Ask Leo", href: "/askAI", icon: RiGeminiFill },
  { name: "Analysis", href: "/analysis", icon: MdOutlineAnalytics },
  { name: "History", href: "/history", icon: FaHistory },
  { name: "Reports", href: "/reports", icon: FaFileAlt },
  { name: "Community", href: "/community", icon: Globe },
];

const footerNavItems: NavItem[] = [
  { name: "Settings", href: "/settings", icon: FaCog },
  { name: "Support", href: "/support", icon: FaInfoCircle },
  { name: "Logout", href: "/logout", icon: FaSignOutAlt },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const storedCollapsedState = localStorage.getItem("sidebarCollapsed");
    if (storedCollapsedState !== null) {
      setIsCollapsed(JSON.parse(storedCollapsedState));
    }

    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const NavItem = ({ item, isActive, isMobile = false }: { item: NavItem; isActive: boolean; isMobile?: boolean }) => (
    <Link
      href={item.href}
      className={`
        flex items-center rounded-xl group transition-all duration-200
        ${isMobile ? "p-2 justify-center" : isCollapsed ? "justify-center p-3" : "p-3"}
        ${
          isActive
            ? "bg-pink-200 text-gray-800"
            : "text-gray-600 hover:bg-white/60 hover:text-gray-800"
        }
      `}
      title={item.name}
      onClick={() => isMobile && setIsMobileMenuOpen(false)}
    >
      <item.icon
        className={`
          flex-shrink-0 transition-colors duration-200
          ${isMobile ? "h-6 w-6" : "h-5 w-5"}
          ${(!isMobile && !isCollapsed) ? "mr-3" : ""}
        `}
        aria-hidden="true"
      />
      <span
        className={`
          ${!isMobile ? "font-medium" : "sr-only"}
          ${(!isMobile && isCollapsed) ? "sr-only" : "block"}
        `}
      >
        {item.name}
      </span>
      {!isMobile && !isCollapsed && isActive && (
        <div className="ml-auto h-2 w-2 rounded-full bg-white"></div>
      )}
    </Link>
  );

  const DesktopSidebar = () => (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-screen mt-16
        bg-white/30 backdrop-blur-md 
        border-r border-white/40
        transition-all duration-300 ease-in-out
        hidden md:block
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      <div className="flex flex-col justify-between h-[calc(100%-4rem)]">
        <nav className="px-3 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <NavItem 
                key={item.name} 
                item={item} 
                isActive={isActive} 
              />
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/20">
          {footerNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <NavItem 
                key={item.name} 
                item={item} 
                isActive={isActive} 
              />
            );
          })}
        </div>
      </div>
    </aside>
  );

  const MobileNavigation = () => (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-white/40 z-40">
        <div className="grid grid-cols-5 px-2 py-1">
          {navItems.slice(0, 5).map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <NavItem 
                key={item.name} 
                item={item} 
                isActive={isActive} 
                isMobile={true}
              />
            );
          })}
        </div>
      </nav>

      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed bottom-20 right-4 bg-pink-200 p-3 rounded-full shadow-lg z-50"
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? (
          <FaTimes className="h-5 w-5" />
        ) : (
          <FaBars className="h-5 w-5" />
        )}
      </button>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40 flex items-end justify-center">
          <div className="bg-white rounded-t-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="grid grid-cols-3 gap-6 mb-8">
              {navItems.slice(5).map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <NavItem 
                    key={item.name} 
                    item={item} 
                    isActive={isActive} 
                    isMobile={true}
                  />
                );
              })}
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Settings</h3>
              <div className="grid grid-cols-3 gap-6">
                {footerNavItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <NavItem 
                      key={item.name} 
                      item={item} 
                      isActive={isActive} 
                      isMobile={true}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileNavigation />
    </>
  );
}