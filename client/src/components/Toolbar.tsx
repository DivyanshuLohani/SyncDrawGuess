import React, { useState } from "react";

const colors = [
  "#000000", // Black
  "#FF0000", // Red
  "#00FF00", // Lime
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#800000", // Maroon
  "#008000", // Green
  "#000080", // Navy
  "#808000", // Olive
  "#800080", // Purple
  "#008080", // Teal
  "#C0C0C0", // Silver
  "#808080", // Gray
  "#F0F8FF", // AliceBlue
  "#FAEBD7", // AntiqueWhite
  "#7FFF00", // Chartreuse
  "#D2691E", // Chocolate
  "#FF7F50", // Coral
  "#6495ED", // CornflowerBlue
  "#DC143C", // Crimson
  "#00FFFF", // Aqua
  "#FF4500", // OrangeRed
  "#DA70D6", // Orchid
  "#B0C4DE", // LightSteelBlue
  "#32CD32", // LimeGreen
  "#FF6347", // Tomato
  "#4682B4", // SteelBlue
];

interface ToolbarProps {
  onLineWidthChange: (width: number) => void;
  onColorChange: (color: string) => void;
  handleUndo: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onLineWidthChange,
  onColorChange,
  handleUndo,
}) => {
  const [selectedLineWidth, setSelectedLineWidth] = useState<number>(5);
  const [selectedColor, setSelectedColor] = useState<string>("#000000");

  const handleLineWidthChange = (width: number) => {
    setSelectedLineWidth(width);
    onLineWidthChange(width);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    onColorChange(color);
  };

  const lineWidths = [1, 2, 4, 6, 8]; // Line widths options

  return (
    <div className="flex flex-col items-center p-4 bg-gray-200 shadow-md border-t border-gray-300">
      <div className="mb-4 flex space-x-2">
        {lineWidths.map((width) => (
          <div
            key={width}
            onClick={() => handleLineWidthChange(width)}
            className={`w-8 h-8 rounded-full border-2 ${
              width === selectedLineWidth
                ? "border-blue-500"
                : "border-gray-400"
            } flex items-center justify-center cursor-pointer`}
            style={{ borderWidth: width }}
          >
            <div className="w-4 h-4 rounded-full ${width === selectedLineWidth ? 'bg-blue-500' : 'bg-transparent'}" />
          </div>
        ))}
        <button
          className="border border-black px-2 rounded"
          onClick={handleUndo}
        >
          Undo
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((color, i) => (
          <div
            key={i}
            onClick={() => handleColorChange(color)}
            className={`w-8 h-8 rounded-full cursor-pointer`}
            style={{
              backgroundColor: color,
              border:
                color === selectedColor
                  ? "2px solid black"
                  : "2px solid transparent",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Toolbar;
