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
import { Globe, CalendarDays } from 'lucide-react';

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
   {name: "Habits", href: "/habits", icon: CalendarDays },
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

  const NavItem = ({
    item,
    isActive,
    isMobile = false,
    className = "",
  }: {
    item: NavItem;
    isActive: boolean;
    isMobile?: boolean;
    className?: string;
  }) => (
    <Link
      href={item.href}
      className={`
        flex items-center rounded-xl group transition-all duration-200
        ${isMobile ? "p-2 justify-center" : isCollapsed ? "justify-center p-3" : "p-3"}
        ${
          isActive
            ? "bg-[#f4f0e7] text-gray-800"
            : "text-gray-600 hover:bg-white/60 hover:text-gray-800"
        }
        ${className}
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
        border-r border-gray-100
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
      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[rgba(250,250,247,0.2)]
 backdrop-blur-lg  border-t border-gray-200 dark:border-gray-700 z-50 shadow-lg">
        <div className="grid grid-cols-5 py-1">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <div key={item.name} className="flex items-center justify-center">
                <NavItem
                  item={item}
                  isActive={isActive}
                  isMobile={true}
                  className={`
                    ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}
                    hover:text-blue-600 dark:hover:text-blue-400
                  `}
                />
              </div>
            );
          })}
        </div>
      </nav>

      {/* Profile Button Floating Action Button */}
      {/* <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed bottom-20 right-4 bg-blue-600 text-white p-4 rounded-full shadow-xl z-50 flex items-center justify-center"
        aria-label="Open menu"
      >
        {isMobileMenuOpen ? (
          <FaSignOutAlt className="h-5 w-5" />
        ) : (
          <FaUserCircle className="h-5 w-5" />
        )}
      </button> */}

      {/* Expanded Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40 flex items-end">
          <div className="bg-white dark:bg-gray-900 rounded-t-3xl w-full p-6 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h3>
              <button 
                onClick={toggleMobileMenu} 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FaTimes className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              {navItems.slice(5).map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <NavItem 
                    key={item.name} 
                    item={item} 
                    isActive={isActive} 
                    isMobile={true}
                    className={`
                      py-2 rounded-lg
                      ${isActive 
                        ? "bg-blue-100/50 dark:bg-blue-900/50" 
                        : "hover:bg-gray-100/50 dark:hover:bg-gray-800/50"}
                    `}
                  />
                );
              })}
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="grid grid-cols-3 gap-4">
                {footerNavItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <NavItem 
                      key={item.name} 
                      item={item} 
                      isActive={isActive} 
                      isMobile={true}
                      className={`
                        py-2 rounded-lg
                        ${isActive 
                          ? "bg-blue-100/50 dark:bg-blue-900/50" 
                          : "hover:bg-gray-100/50 dark:hover:bg-gray-800/50"}
                      `}
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