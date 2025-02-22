import React from "react";
import { useRoom } from "../context/RoomContext";
import { LinkIcon } from "lucide-react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

const RoomLink: React.FC = () => {
  const { roomId } = useRoom();

  return (
    <Tippy
      content="Copied!"
      placement="bottom"
      trigger="click"
      animation="tada"
    >
      <button
        onClick={() => {
          navigator.clipboard.writeText(
            window.location.host + `?roomId=${roomId}`
          );
        }}
        className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600 w-full flex items-center justify-center gap-2"
      >
        <LinkIcon className="w-4 h-4 inline-block mr-2" />
        <span>Invite</span>
      </button>
    </Tippy>
  );
};

export default RoomLink;
