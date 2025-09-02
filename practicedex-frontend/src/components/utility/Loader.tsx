import { BarLoader } from "react-spinners";

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-30">
      <BarLoader color="#6150a6ff" width={200} height={5} />
    </div>
  );
};

export default Loader;
