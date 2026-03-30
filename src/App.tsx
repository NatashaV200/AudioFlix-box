import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index.tsx";
import Browse from "./pages/Browse.tsx";
import Player from "./pages/Player.tsx";
import BookDetail from "./pages/BookDetail.tsx";
import Login from "./pages/Login.tsx";
import Profile from "./pages/Profile.tsx";
import SidebarPlaceholder from "./pages/SidebarPlaceholder.tsx";
import Library from "./pages/Library.tsx";
import NotFound from "./pages/NotFound.tsx";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/explore" element={<Browse />} />
      <Route path="/library" element={<Library />} />
      <Route path="/wishlist" element={<Library initialTab="wishlist" />} />
      <Route
        path="/history"
        element={<SidebarPlaceholder title="Listening History" description="Revisit everything you have recently played." />}
      />
      <Route
        path="/settings"
        element={<SidebarPlaceholder title="Settings" description="Tune playback, notifications, and account preferences." />}
      />
      <Route path="/book/:id" element={<BookDetail />} />
      <Route path="/player/:id" element={<Player />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
