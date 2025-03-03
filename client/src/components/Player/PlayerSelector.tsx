import { useState } from "react";

const CustomizableCharacter = () => {
  // Define options for each customizable part
  const eyeOptions = ["◕◕", "••", "««", "XX", "OO"];
  const mouthOptions = ["O", "‿", "—", "∆", "D"];
  const bodyOptions = ["◓", "◒", "◙", "◐", "○"];

  // State for currently selected options
  const [currentEye, setCurrentEye] = useState(0);
  const [currentMouth, setCurrentMouth] = useState(0);
  const [currentBody, setCurrentBody] = useState(0);

  // Handlers for changing options
  const changeOption = (
    setter: (number: number) => void,
    current: number,
    options: string[],
    direction: string
  ) => {
    if (direction === "next") {
      setter((current + 1) % options.length);
    } else {
      setter((current - 1 + options.length) % options.length);
    }
  };

  return (
    <div className="flex flex-col items-center ">
      {/* Main container with blue background */}
      <div className="gap-5 p-4 rounded-lg shadow-lg relative flex">
        {/* Character display area */}
        <div className="flex items-center justify-center h-40">
          {/* Character */}
          <div className="text-center">
            <div className="text-yellow-300 text-6xl">
              <div>{eyeOptions[currentEye]}</div>
              <div>{mouthOptions[currentMouth]}</div>
              <div>{bodyOptions[currentBody]}</div>
            </div>
          </div>
        </div>

        {/* Control panels with arrows */}
        <div className="absolute top-0 left-0 h-full flex flex-col justify-evenly">
          <button
            className="text-white text-2xl bg-black rounded p-1 m-1"
            onClick={() =>
              changeOption(setCurrentEye, currentEye, eyeOptions, "prev")
            }
          >
            &lt;
          </button>
          <button
            className="text-white text-2xl bg-black rounded p-1 m-1"
            onClick={() =>
              changeOption(setCurrentMouth, currentMouth, mouthOptions, "prev")
            }
          >
            &lt;
          </button>
          <button
            className="text-white text-2xl bg-black rounded p-1 m-1"
            onClick={() =>
              changeOption(setCurrentBody, currentBody, bodyOptions, "prev")
            }
          >
            &lt;
          </button>
        </div>

        <div className="absolute top-0 right-0 h-full flex flex-col justify-evenly">
          <button
            className="text-white text-2xl bg-black rounded p-1 m-1"
            onClick={() =>
              changeOption(setCurrentEye, currentEye, eyeOptions, "next")
            }
          >
            &gt;
          </button>
          <button
            className="text-white text-2xl bg-black rounded p-1 m-1"
            onClick={() =>
              changeOption(setCurrentMouth, currentMouth, mouthOptions, "next")
            }
          >
            &gt;
          </button>
          <button
            className="text-white text-2xl bg-black rounded p-1 m-1"
            onClick={() =>
              changeOption(setCurrentBody, currentBody, bodyOptions, "next")
            }
          >
            &gt;
          </button>
        </div>

        {/* Cube icon in top-right corner */}
        <div className="absolute top-2 right-2">
          <div className="text-white text-xl">⊡</div>
        </div>
      </div>
    </div>
  );
};

export default CustomizableCharacter;
