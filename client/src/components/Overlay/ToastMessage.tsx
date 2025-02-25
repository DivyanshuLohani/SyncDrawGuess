import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Message, { IMessage } from "../Chat/Message";
import useMessages from "../../hooks/useMessages";

const MAX_VISIBLE_MESSAGES = 5;

const ToastStack = () => {
  const { messages } = useMessages();
  const [visibleMsgs, setVisibleMsgs] = useState<IMessage[]>([]);

  useEffect(() => {
    if (messages.length > 0) {
      const newMsg = messages[messages.length - 1];
      setVisibleMsgs((prev) => {
        const newMsgs = [...prev, newMsg];
        return newMsgs.length > MAX_VISIBLE_MESSAGES
          ? newMsgs.slice(1)
          : newMsgs;
      });

      // Remove message after 3 seconds
      setTimeout(() => {
        setVisibleMsgs((prev) => prev.filter((msg) => msg !== newMsg));
      }, 3000);
    }
  }, [messages]);

  return (
    <div className="absolute bottom-4 right-4 z-50 flex flex-col gap-2 sm:hidden">
      <AnimatePresence>
        {visibleMsgs.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, x: 10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: 10 }}
            transition={{ duration: 0.3 }}
          >
            <Message message={msg} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastStack;
