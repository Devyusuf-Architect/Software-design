import DesktopApp from './components/desktop/DesktopApp';
import { isTauri } from './utils/isTauri';
import HomePage    from './components/HomePage';

export default function App() {
  if (isTauri) return <DesktopApp />;
  return <HomePage />;
}
