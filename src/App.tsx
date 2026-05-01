import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BrowserPage from './pages/BrowserPage'
import DetailPage from './pages/DetailPage'
import PracticePage from './pages/PracticePage'
import GrammarListPage from './pages/GrammarListPage'
import GrammarDetailPage from './pages/GrammarDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/hsk/1" replace />} />
        <Route path="/hsk/:level" element={<BrowserPage />} />
        <Route path="/word/:id" element={<DetailPage />} />
        <Route path="/practice/:level" element={<PracticePage />} />
        <Route path="/grammar/:level" element={<GrammarListPage />} />
        <Route path="/grammar/point/:id" element={<GrammarDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}
