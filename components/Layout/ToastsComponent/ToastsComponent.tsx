import { useToastStore } from '../../../context/toastStore';
import { ToastMessageComponent } from './ToastMessageComponent/ToastMessageComponent';

export function ToastsComponent() {
  const currentToast = useToastStore((state) => state.currentToast);
  const removeCurrentToast = useToastStore((state) => state.removeCurrentToast);

  if (!currentToast) {
    return <></>;
  }

  return (
    <div className="fixed justify-start z-[100]" id="toast-overlay">
      <div className="mr-4">
        <ToastMessageComponent
          key={currentToast._id}
          toast={currentToast}
          onExpire={removeCurrentToast}
          onSkip={removeCurrentToast}
        />
      </div>
    </div>
  );
}
