import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Listings from './pages/Listings'
import ListingDetail from './pages/ListingDetail'
import PostMaterial from './pages/PostMaterial'
import Profile from './pages/Profile'
import Login from './pages/Login'
import PostRequirement from './pages/PostRequirement'
import Requirements from './pages/Requirements'

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              <Route path="/post" element={<PostMaterial />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/post-requirement" element={<PostRequirement />} />
              <Route path="/requirements" element={<Requirements />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  )
}

export default App