import { socket } from "../../socketHandler";
import { GameEvent } from "../../types";

export default function WordSelector({ words }: { words: string[] }) {
  function handleWordSelect(word: string) {
    socket.emit(GameEvent.WORD_SELECT, word);
  }

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center">
      {words.map((e) => {
        return (
          <button
            onClick={() => handleWordSelect(e)}
            className="px-2 py-1 border-2 border-white rounded text-white font-bold text-2xl hover:bg-white hover:text-black duration-100"
            key={e}
          >
            {e}
          </button>
        );
      })}
    </div>
  );
}
