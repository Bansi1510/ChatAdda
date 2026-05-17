import { useEffect, useRef } from "react";

type Props = {
  message: string;
  selectedContact: string;
  typingStart: (id: string) => void;
  typingStop: (id: string) => void;
};

const useTyping = ({
  message,
  selectedContact,
  typingStart,
  typingStop,
}: Props) => {
  const typingTimeoutRef =
    useRef<number | null>(null);

  useEffect(() => {
    if (!message || !selectedContact)
      return;

    typingStart(selectedContact);

    if (typingTimeoutRef.current) {
      clearTimeout(
        typingTimeoutRef.current
      );
    }

    typingTimeoutRef.current =
      window.setTimeout(() => {
        typingStop(selectedContact);
      }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(
          typingTimeoutRef.current
        );
      }
    };
  }, [
    message,
    selectedContact,
    typingStart,
    typingStop,
  ]);
};

export default useTyping;