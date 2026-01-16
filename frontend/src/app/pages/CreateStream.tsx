import { useNavigate } from "react-router-dom";

export default function CreateStream() {
  const navigate = useNavigate();
  const onCreate = () => {
    const id = crypto.randomUUID();
    navigate(`/stream/${id}`);
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900">
      <button
        onClick={onCreate}
        className="px-6 py-3 rounded-md bg-blue-600 text-white"
      >
        Create Stream
      </button>
    </div>
  );
}
