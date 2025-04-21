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
  const pathname = usePathname();

  useEffect(() => {
    const storedCollapsedState = localStorage.getItem("sidebarCollapsed");
    if (storedCollapsedState !== null) {
      setIsCollapsed(JSON.parse(storedCollapsedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-screen mt-16
        bg-white/30 backdrop-blur-md 
        border-r border-white/40
        transition-all duration-300 ease-in-out
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
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center p-3 rounded-xl group transition-all duration-200
                  ${isCollapsed ? "justify-center" : ""}
                  ${
                    isActive
                      ? "bg-pink-200  text-gray-800"
                      : "text-gray-600 hover:bg-white/60 hover:text-gray-800"
                  }
                `}
                title={isCollapsed ? item.name : ""}
              >
                <item.icon
                  className={`
                    h-5 w-5 flex-shrink-0
                    transition-colors duration-200
                    ${isCollapsed ? "" : "mr-3"}
                  `}
                  aria-hidden="true"
                />
                <span
                  className={`${
                    isCollapsed ? "sr-only" : "block"
                  } font-medium`}
                >
                  {item.name}
                </span>
                {!isCollapsed && isActive && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-white"></div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/20">
          {footerNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center p-3 my-1 rounded-xl group transition-all duration-200
                ${isCollapsed ? "justify-center" : ""}
                text-gray-500 hover:bg-white/60 hover:text-gray-800
              `}
              title={isCollapsed ? item.name : ""}
            >
              <item.icon
                className={`
                  h-5 w-5 flex-shrink-0
                  transition-colors duration-200
                  ${isCollapsed ? "" : "mr-3"}
                `}
                aria-hidden="true"
              />
              <span
                className={`${isCollapsed ? "sr-only" : "block"} font-medium`}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}