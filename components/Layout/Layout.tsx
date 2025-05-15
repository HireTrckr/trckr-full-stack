import { AuthCheck } from './AuthCheck/AuthCheck';
import { LoadingIndicator } from './LoadingIndicator/LoadingIndicator';
import { ModalHousing } from './ModalHousing/ModalHousing';
import { Navbar } from '../NavbarComponents/Navbar/Navbar';
import { ToastsComponent } from './ToastsComponent/ToastsComponent';
import { CookieConsentBannerComponent } from './CookieConsentBannerComponent/CookieConsentBannerComponent';
import { MaintenanceComponent } from '../MaintenanceComponent/MaintenanceComponent';

export function Layout({ children }: { children: React.ReactNode }) {
  if (process.env.NEXT_PUBLIC_MAINTAINANCE === 'true') {
    return <MaintenanceComponent className="h-screen w-screen" />;
  }

  return (
    <div
      className="h-screen w-screen bg-background-secondary flex flex-col overflow-hidden"
      style={{ overscrollBehavior: 'contain' }}
    >
      <Navbar />
      <div className="flex-1 overflow-y-auto flex flex-row-reverse">
        <AuthCheck>
          <ModalHousing>
            <ToastsComponent />
            <main className="w-full p-6">{children}</main>
            <LoadingIndicator />
          </ModalHousing>
        </AuthCheck>
        <CookieConsentBannerComponent />
      </div>
    </div>
  );
}
