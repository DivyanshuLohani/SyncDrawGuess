import { useEffect, useState } from "react";
import { useRoom } from "../../context/RoomContext";

const LineWidthSelector = ({
  onSelect,
  selectedWidth,
}: {
  onSelect: (width: number) => void;
  selectedWidth: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const lineWidths = [5, 7, 12, 14, 16, 20];
  const { myTurn } = useRoom();

  const togglePopup = () => {
    setIsOpen(!isOpen);
    console.log(isOpen);
  };

  const selectWidth = (width: number) => {
    onSelect(width);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!myTurn) setIsOpen(false);
  }, [myTurn]);

  return (
    <div className="relative">
      {/* Selector button - shows the currently selected line width */}
      <button
        className="flex items-center justify-center w-12 h-12 bg-white border border-gray-500 rounded-md shadow-sm"
        onClick={togglePopup}
      >
        <div
          className="bg-black rounded-full"
          style={{
            width: `${selectedWidth}px`,
            height: `${selectedWidth}px`,
          }}
        />
      </button>

      {/* Popup that appears when clicked */}
      {isOpen && (
        <div className="absolute bottom-10 left-0 bg-white border border-gray-300 rounded-md shadow-lg p-2 z-10">
          <div className="flex flex-col items-center space-y-3 py-1">
            {lineWidths.map((width) => (
              <button
                key={`width-${width}`}
                className={`flex items-center px-3 py-1 hover:bg-gray-100 rounded-md ${
                  selectedWidth === width ? "bg-gray-200" : ""
                }`}
                onClick={() => selectWidth(width)}
              >
                <div className="w-10 h-10 flex items-center">
                  <div
                    className="bg-black rounded-full mx-auto aspect-square"
                    style={{
                      width: `${width}px`,
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LineWidthSelector;
