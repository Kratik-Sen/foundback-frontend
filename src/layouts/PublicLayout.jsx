import AnimatedOutlet from '../components/AnimatedOutlet'
import Footer from '../components/Footer'
import Header from '../components/Header'

export default function PublicLayout() {
  return <div className="min-h-screen"><Header /><main><AnimatedOutlet /></main><Footer /></div>
}
