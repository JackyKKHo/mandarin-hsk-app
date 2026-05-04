import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
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
import PronunciationPage from './pages/PronunciationPage'
import ReviewPage from './pages/ReviewPage'
import PinyinKeyboardPage from './pages/PinyinKeyboardPage'
import CoursePage from './pages/CoursePage'
import LessonPage from './pages/LessonPage'
import DialoguesPage from './pages/DialoguesPage'
import DialoguePage from './pages/DialoguePage'
import WelcomePage, { shouldShowWelcome } from './pages/WelcomePage'

export default function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <StopAudioOnNavigate />
      <Routes>
        <Route path="/" element={<Navigate to={shouldShowWelcome() ? '/welcome' : '/hsk/1'} replace />} />
        <Route path="/welcome" element={<WelcomePage />} />
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
        <Route path="/pronunciation" element={<PronunciationPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/keyboard" element={<PinyinKeyboardPage />} />
        <Route path="/course" element={<CoursePage />} />
        <Route path="/course/:lessonId" element={<LessonPage />} />
        <Route path="/dialogues" element={<DialoguesPage />} />
        <Route path="/dialogue/:id" element={<DialoguePage />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}
