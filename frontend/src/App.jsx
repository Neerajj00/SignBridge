import { Hand, MessageSquare, Mic2, MicIcon } from "lucide-react";
import { Header } from './components/Header';
import { ParticipantCard } from './components/ParticipantCard';
import { MessageDisplay } from './components/MessageDisplay';
import { Button } from './components/Button';

const App = () => {
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <Header />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold mb-8 text-neutral-100">
          Speech 2 Sign
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <ParticipantCard
            name="You"
            icon={<MicIcon className="w-12 h-12 text-neutral-300" />}
            isAI={true}
            />
          <ParticipantCard
            name="Deaf User"
            icon={<Hand className="w-12 h-12 text-neutral-300" />}
            isAI={true}
          />
        </div>

        <div className="space-y-6">
          <MessageDisplay 
            message="Hello, Let's decode for you."
          />

          <div className="flex justify-center">
            <Button variant="coral" size="lg" className="px-12">
              End
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
