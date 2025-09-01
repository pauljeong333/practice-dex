export default function CustomTimeInput(props: {
  hours: string;
  setHours: (value: string) => void;
  minutes: string;
  setMinutes: (value: string) => void;
}) {
  const { hours, setHours, minutes, setMinutes } = props;

  //   const formattedTime =
  //     hours !== "" && minutes !== ""
  //       ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
  //       : "";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Enter Time (HH:MM)</label>
      <div className="flex gap-2 items-center">
        <input
          type="number"
          min="0"
          max="23"
          value={hours}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || (Number(val) >= 0 && Number(val) <= 23)) {
              setHours(val);
            }
          }}
          className="w-16 px-2 py-1 border rounded text-center"
          placeholder="HH"
        />
        <span className="text-xl font-medium">:</span>
        <input
          type="number"
          min="0"
          max="59"
          value={parseInt(minutes) >= 10 ? minutes : `0${minutes}`}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || (Number(val) >= 0 && Number(val) <= 59)) {
              setMinutes(val);
            }
          }}
          className="w-16 px-2 py-1 border rounded text-center"
          placeholder="MM"
        />
      </div>

      {/* {formattedTime && (
        <div className="text-sm text-gray-600">
          You entered: {formattedTime}
        </div>
      )} */}
    </div>
  );
}
