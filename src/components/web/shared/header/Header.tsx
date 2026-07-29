import React from "react";
import { HeaderContacts } from "./HeaderContacts";
import Logo from "./Logo";
import DesktopMenu from "./DesktopMenu";
import MobileMenu from "./MobileMenu";

export default function Header({ configs }: { configs: any }) {
  return (
    <>
      <header className="w-full">
        <div className="bg-web-background-1 border-b border-web-content-3">
          <div className="container">
            {/* upper header */}
            <div className="flex justify-between items-center py-1.5 md:py-4.5 border-b border-web-secondary-1">
              <div>
                <HeaderContacts
                  openHours={configs.open_daily}
                  phone={configs.phone}
                />
              </div>
              <span className="text-web-body text-web-content-1 hidden md:block">
                {configs.welcom_text}
              </span>
            </div>
            {/* below header */}
            <div className="pt-4 pb-5 flex justify-between items-center">
              <Logo />
              <DesktopMenu menus={configs.nav_bar} />
            </div>
          </div>
        </div>
        <MobileMenu menu={configs.nav_bar} />
      </header>
    </>
  );
}
