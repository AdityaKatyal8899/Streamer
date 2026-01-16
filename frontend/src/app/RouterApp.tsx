import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CreateStream from "./pages/CreateStream";
import StreamPage from "./pages/StreamPage";
import WatchPage from "./pages/WatchPage";

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/create" element={<CreateStream />} />
        <Route path="/stream/:stream_id" element={<StreamPage />} />
        <Route path="/watch/:stream_id" element={<WatchPage />} />
        <Route path="*" element={<Navigate to="/create" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
