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
          navigator.clipboard.writeText(
            window.location.host + `?roomId=${roomId}`
          );
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
