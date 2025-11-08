
import { Header } from './components/Header';
import Speech2image from './pages/speech2image';

const BACKEND_URL = "http://localhost:8000/api/process";

const App = () => {
  

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div>
          <h1 className="text-2xl font-semibold mb-8">
            Speech 2 Sign
          </h1>

        </div>
        <Speech2image />
      </main>
    </div>
  );
};

export default App;
