import { useEffect, useRef } from "react";
import { useRoom } from "../context/RoomContext";
import { LinkIcon } from "lucide-react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import Button from "./ui/Button";
import clsx from "clsx";

const RoomLink = ({ className }: { className?: string }) => {
  const shiftPressed = useRef(false);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        shiftPressed.current = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        shiftPressed.current = false;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const { roomId } = useRoom();

  function handleCopy() {
    const textToCopy = window.location.host + `?roomId=${roomId}`;

    if (shiftPressed.current) {
      window.open(textToCopy, "_blank");
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textToCopy).catch((err) => {
        console.error("Clipboard access denied:", err);
      });
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }
      document.body.removeChild(textarea);
    }
  }

  return (
    <Tippy
      content="Copied!"
      placement="bottom"
      trigger="click"
      animation="tada"
    >
      <Button
        onClick={handleCopy}
        className={clsx("w-2/5", className)}
        startIcon={<LinkIcon className="w-4 h-4 inline-block mr-2" />}
      >
        <span>Invite</span>
      </Button>
    </Tippy>
  );
};

export default RoomLink;
