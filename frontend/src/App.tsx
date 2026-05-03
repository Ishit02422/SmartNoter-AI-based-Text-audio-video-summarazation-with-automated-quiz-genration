
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import VideoSummary from './pages/VideoSummary';
import FileSummary from './pages/FileSummary';
import Quiz from './pages/Quiz';
import Mindmap from './pages/Mindmap';
import Chat from './pages/Chat';
import TextSummary from './pages/TextSummary';
import Profile from './pages/Profile';
import Flashcards from './pages/Flashcards';
import WebSummary from './pages/WebSummary';
import Pricing from './pages/Pricing';
import ProtectedRoute from './components/ProtectedRoute';
import { SummaryProvider } from './context/SummaryContext';

function App() {
  return (
    <SummaryProvider>
      <BrowserRouter>
        <Routes>
          {/* Entrance is the Login page */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="video" element={<VideoSummary />} />
              <Route path="files" element={<FileSummary />} />
              <Route path="text" element={<TextSummary />} />
              <Route path="quiz" element={<Quiz />} />
              <Route path="mindmap" element={<Mindmap />} />
              <Route path="flashcards" element={<Flashcards />} />
              <Route path="chat" element={<Chat />} />
              <Route path="web" element={<WebSummary />} />
              <Route path="profile" element={<Profile />} />
              <Route path="pricing" element={<Pricing />} />
            </Route>
          </Route>

          {/* Catch all - redirect to entrance */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SummaryProvider>
  );
}

export default App;
