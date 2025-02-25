import React from "react";
import { useRoom } from "../context/RoomContext";
import { LinkIcon } from "lucide-react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import Button from "./ui/Button";

const RoomLink: React.FC = () => {
  const { roomId } = useRoom();

  return (
    <Tippy
      content="Copied!"
      placement="bottom"
      trigger="click"
      animation="tada"
    >
      <Button
        onClick={() => {
          const textToCopy = window.location.host + `?roomId=${roomId}`;

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
        }}
        className="w-2/5"
        startIcon={<LinkIcon className="w-4 h-4 inline-block mr-2" />}
      >
        <span>Invite</span>
      </Button>
    </Tippy>
  );
};

export default RoomLink;
