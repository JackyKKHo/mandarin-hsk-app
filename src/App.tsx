import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BrowserPage from './pages/BrowserPage'
import DetailPage from './pages/DetailPage'
import PracticePage from './pages/PracticePage'
import GrammarListPage from './pages/GrammarListPage'
import GrammarDetailPage from './pages/GrammarDetailPage'
import StopAudioOnNavigate from './components/StopAudioOnNavigate'
import FavouritesPage from './pages/FavouritesPage'
import SearchPage from './pages/SearchPage'
import StatsPage from './pages/StatsPage'
import QuizPage from './pages/QuizPage'
import WritingPage from './pages/WritingPage'
import ListeningPage from './pages/ListeningPage'
import FillBlankPage from './pages/FillBlankPage'

export default function App() {
  return (
    <BrowserRouter>
      <StopAudioOnNavigate />
      <Routes>
        <Route path="/" element={<Navigate to="/hsk/1" replace />} />
        <Route path="/hsk/:level" element={<BrowserPage />} />
        <Route path="/word/:id" element={<DetailPage />} />
        <Route path="/practice/:level" element={<PracticePage />} />
        <Route path="/grammar/:level" element={<GrammarListPage />} />
        <Route path="/grammar/point/:id" element={<GrammarDetailPage />} />
        <Route path="/favourites" element={<FavouritesPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/quiz/:level" element={<QuizPage />} />
        <Route path="/write/:level" element={<WritingPage />} />
        <Route path="/listen/:level" element={<ListeningPage />} />
        <Route path="/fill/:level" element={<FillBlankPage />} />
      </Routes>
    </BrowserRouter>
  )
}
