import { useRoom } from "../../context/RoomContext";

export default function Winners() {
  const { players } = useRoom();
  return (
    <div className="flex flex-col text-white w-1/2">
      <h3 className="text-2xl text-center font-bold mb-5 text-white">
        Game Ended
      </h3>
      <div className="flex flex-col">
        {players
          .sort((a, b) => b.score - a.score)
          .map((player, index) => (
            <div
              key={index}
              className="flex items-center justify-between w-full text-xl"
            >
              <div className="flex items-center space-x-2">
                <span
                  className="block w-4 h-4 rounded-full"
                  // style={{ backgroundColor: player.color }}
                ></span>
                <span className="font-semibold">{player.name}</span>
              </div>
              <span className="font-medium">{player.score}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
