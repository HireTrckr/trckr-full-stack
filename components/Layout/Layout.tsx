import { AuthCheck } from '../AuthCheck/AuthCheck';
import { LoadingIndicator } from '../LoadingIndicator/LoadingIndicator';
import { ModalHousing } from '../Modals/CreateTagModal/ModalHousing/ModalHousing';
import { Navbar } from '../Navbar/Navbar';
import { ToastsComponent } from '../ToastsComponent/ToastsComponent';

export function Layout({ children }: { children: React.ReactNode }) {
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
      </div>
    </div>
  );
}
