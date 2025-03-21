import { useEffect, useState } from 'react';
import { Toast } from '../../types/toast';
import { TiDeleteOutline } from 'react-icons/ti';
interface ToastMessageComponentProps {
  toast: Toast;
  onExpire: () => void;
  onSkip: () => void;
}

const ANIMATION_LENGTH = 300;

export function ToastMessageComponent({
  toast,
  onExpire,
  onSkip,
}: ToastMessageComponentProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    toast.duration || null
  );
  const [showSkipButton, setShowSkipButton] = useState(false);

  const progressWidth = `${(timeRemaining! / toast.duration!) * 100}%`;

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
      onClick={toast.onClick}
      className={`bg-accent-primary pb-0 rounded-sm flex flex flex-col ${isLeaving ? 'slide-out' : 'slide-in'}`}
      onMouseEnter={() => setShowSkipButton(true)}
      onMouseLeave={() => setShowSkipButton(false)}
    >
      <div className="p-2">
        <div className="flex justify-between items-center min-h-[1rem]">
          {toast.title && (
            <span className="text-xs text-text-secondary text-center felx items-center justify-center h-full">
              {toast.title}
            </span>
          )}

          {showSkipButton && (
            <button
              onClick={() => handleSkip()}
              className="text-accent-hover text-center"
            >
              <TiDeleteOutline />
            </button>
          )}
        </div>

        <span className="text-sm text-text-primary">{toast.message}</span>
      </div>
      {toast.duration && (
        <div className="w-full h-1 bg-black/25 mt-2 ">
          <div
            className="h-full bg-accent-hover transition-all duration-500 ease-linear"
            style={{ width: progressWidth }}
          />
        </div>
      )}
    </div>
  );
}
