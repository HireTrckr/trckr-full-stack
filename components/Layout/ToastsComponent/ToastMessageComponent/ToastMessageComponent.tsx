import { useEffect, useState } from 'react';
import { Toast, ToastCategory } from '../../../../types/toast';
import { TiDeleteOutline } from 'react-icons/ti';
import { TailwindColorName } from '../../../../types/tailwindColor';
import { useTranslation } from 'react-i18next';
interface ToastMessageComponentProps {
  toast: Toast;
  onExpire: () => void;
  onSkip: () => void;
}

const ANIMATION_LENGTH = 300;

type ToastColorScheme = {
  readonly [key in ToastCategory]: TailwindColorName;
};

const toastColorSchemes: ToastColorScheme = {
  [ToastCategory.ERROR]: 'red',
  [ToastCategory.WARNING]: 'yellow',
  [ToastCategory.INFO]: 'blue',
};

export function ToastMessageComponent({
  toast,
  onExpire,
  onSkip,
}: ToastMessageComponentProps) {
  const { t } = useTranslation();
  const [isLeaving, setIsLeaving] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    toast.duration || null
  );
  const [showSkipButton, setShowSkipButton] = useState(false);

  const progressWidth = `${(timeRemaining! / toast.duration!) * 100}%`;

  const toastColor = toastColorSchemes[toast.type || ToastCategory.INFO];

  const handleExpire = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onExpire();
    }, ANIMATION_LENGTH); // Match this with your animation duration
  };

  const handleSkip = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onSkip();
    }, ANIMATION_LENGTH);
  };

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining((prev) => (prev !== null ? prev - 500 : null));
      }, 500);

      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleExpire();
    }
  }, [timeRemaining, onExpire]);

  return (
    <div
      className={`bg-${toastColor}-300 pb-0 rounded-sm flex flex flex-col ${isLeaving ? 'slide-out' : 'slide-in'} z-[100]`}
      onMouseEnter={() => setShowSkipButton(true)}
      onMouseLeave={() => setShowSkipButton(false)}
    >
      <div className="p-2 flex flex-col pb-0">
        <div className="flex justify-between items-center min-h-[1rem]">
          {((toast.titleKey && toast.titleParams) || toast.title) && (
            <span
              className={`text-sm text-center text-${toastColor}-400 flex items-center justify-center h-full`}
            >
              {toast.titleKey
                ? t(toast.titleKey, toast.titleParams)
                : toast.title}
            </span>
          )}

          {showSkipButton && (
            <button
              onClick={() => handleSkip()}
              className={`text-${toastColor}-600 text-center`}
            >
              <TiDeleteOutline />
            </button>
          )}
        </div>

        <span
          className={`text-md text-${toastColor}-600 ${toast.onClick ? `cursor-pointer hover:underline` : ''}`}
          onClick={toast.onClick}
        >
          {toast.messageKey
            ? t(toast.messageKey, toast.messageParams)
            : toast.message}
        </span>

        <div className="flex justify-between">
          <span className={`text-xs text-${toastColor}-400`}>
            {new Date(toast._createdAt).toLocaleTimeString()}
          </span>
          {toast.undo && typeof toast.undo === 'function' && (
            <button
              onClick={() => {
                (toast.undo as (toast: Toast) => void)(toast);
                onSkip();
              }}
              className={`text-${toastColor}-600 text-xs hover:underline`}
            >
              {t('toasts.actions.undo')}
            </button>
          )}
        </div>
      </div>
      {toast.duration && (
        <div className="w-full h-1 bg-black/25 mt-2 ">
          <div
            className={`h-full bg-${toastColor}-500 transition-all duration-500 ease-linear`}
            style={{ width: progressWidth }}
          />
        </div>
      )}
    </div>
  );
}
