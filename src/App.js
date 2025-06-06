import React, { useState, useEffect } from 'react';
import { Trophy, Users, DollarSign, Calendar, Award, Target, Medal } from 'lucide-react';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  getDocs
} from 'firebase/firestore';

// Firebase operations
const firebaseOperations = {
  collection: (name) => ({
    add: async (data) => {
      const docRef = await addDoc(collection(db, name), data);
      return { id: docRef.id };
    },
    doc: (id) => ({
      update: async (data) => {
        await updateDoc(doc(db, name, id), data);
      },
      delete: async () => {
        await deleteDoc(doc(db, name, id));
      }
    }),
    onSnapshot: (callback) => {
      return onSnapshot(collection(db, name), (snapshot) => {
        callback({ 
          docs: snapshot.docs.map(doc => ({ 
            id: doc.id, 
            data: () => ({ id: doc.id, ...doc.data() })
          }))
        });
      });
    }
  })
};

// Initialize sample data
const initializeSampleData = async () => {
  try {
    const membersSnapshot = await getDocs(collection(db, 'members'));
    
    if (membersSnapshot.empty) {
      console.log('Initializing sample data...');
      
      // Add sample members
      const sampleMembers = [
        { name: 'Sarah Johnson', email: 'sarah@email.com', phone: '555-0101', skillLevel: '4.0', venmo: '@sarah-johnson', notes: 'Team captain, prefers morning games' },
        { name: 'Mike Chen', email: 'mike@email.com', phone: '555-0102', skillLevel: '3.5', venmo: '@mike-chen', notes: 'Reliable player, good at net play' },
        { name: 'Emma Rodriguez', email: 'emma@email.com', phone: '555-0103', skillLevel: '4.5', venmo: '@emma-rodriguez', notes: 'Aggressive baseline player' },
        { name: 'David Kim', email: 'david@email.com', phone: '555-0104', skillLevel: '3.0', venmo: '@david-kim', notes: 'New to competitive play' }
      ];

      const memberRefs = [];
      for (const member of sampleMembers) {
        const docRef = await addDoc(collection(db, 'members'), member);
        memberRefs.push(docRef.id);
      }

      // Add sample tournament
      await addDoc(collection(db, 'tournaments'), {
        name: 'Spring Championship',
        type: 'tournament',
        location: 'Central Sports Complex',
        date: '2025-06-15',
        time: '09:00',
        division: '4.0',
        fee: 80,
        status: 'completed',
        paymentMethod: 'direct',
        finalPlacing: '2nd',
        completionDate: '2025-06-15',
        resultNotes: 'Great teamwork, lost in finals',
        teamMembers: [
          { memberId: memberRefs[0], role: 'Player 1', status: 'active', amountOwed: 80, paymentStatus: 'paid-direct', paidDate: '2025-06-01' },
          { memberId: memberRefs[1], role: 'Player 2', status: 'active', amountOwed: 80, paymentStatus: 'paid-direct', paidDate: '2025-06-01' }
        ]
      });

      console.log('Sample data initialized!');
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeSampleData();

    const unsubscribeMembers = firebaseOperations.collection('members').onSnapshot((snapshot) => {
      const memberData = snapshot.docs.map(doc => doc.data());
      setMembers(memberData);
    });

    const unsubscribeTournaments = firebaseOperations.collection('tournaments').onSnapshot((snapshot) => {
      const tournamentData = snapshot.docs.map(doc => doc.data());
      setTournaments(tournamentData);
    });

    const unsubscribeLeagues = firebaseOperations.collection('leagues').onSnapshot((snapshot) => {
      const leagueData = snapshot.docs.map(doc => doc.data());
      setLeagues(leagueData);
      setLoading(false);
    });

    return () => {
      unsubscribeMembers();
      unsubscribeTournaments();
      unsubscribeLeagues();
    };
  }, []);

  const allEvents = [...tournaments, ...leagues];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600">Loading Pickleball Tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <header className="bg-gradient-to-r text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8" />
              <h1 className="text-xl font-bold">Pickleball Team Tracker</h1>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{members.length} Members</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{allEvents.filter(e => e.status === 'active' || e.status === 'registered').length} Active Events</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Trophy },
              { id: 'tournaments', label: 'Tournaments', icon: Award },
              { id: 'leagues', label: 'Leagues', icon: Target },
              { id: 'members', label: 'Members', icon: Users },
              { id: 'results', label: 'Results', icon: Medal }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id ? 'active' : ''
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard members={members} tournaments={tournaments} leagues={leagues} />}
        {activeTab === 'tournaments' && <ComingSoon title="Tournament Management" />}
        {activeTab === 'leagues' && <ComingSoon title="League Management" />}
        {activeTab === 'members' && <ComingSoon title="Member Management" />}
        {activeTab === 'results' && <ComingSoon title="Results" />}
      </main>
    </div>
  );
};

const ComingSoon = ({ title }) => (
  <div className="text-center py-8">
    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    <p className="text-gray-600 mt-2">Coming Soon!</p>
  </div>
);

const Dashboard = ({ members, tournaments, leagues }) => {
  const allEvents = [...tournaments, ...leagues];
  const activeEvents = allEvents.filter(e => e.status === 'active' || e.status === 'registered');
  const completedEvents = allEvents.filter(e => e.status === 'completed');

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Active Events" value={activeEvents.length} icon={Calendar} color="blue" />
        <MetricCard title="Team Members" value={members.length} icon={Users} color="emerald" />
        <MetricCard title="Pending Payments" value="$0" icon={DollarSign} color="amber" />
        <MetricCard title="Completed Events" value={completedEvents.length} icon={Trophy} color="purple" />
      </div>
      
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome to Pickleball Team Tracker!</h2>
        <p className="text-gray-600 mb-4">Your comprehensive solution for managing tournaments, leagues, and team members.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800">Getting Started</h3>
            <p className="text-blue-600 text-sm mt-1">Navigate using the tabs above to manage your pickleball activities.</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800">Firebase Connected</h3>
            <p className="text-green-600 text-sm mt-1">Your data is synced in real-time with Firebase!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="metric-card">
      <div>
        <p className="metric-title">{title}</p>
        <p className="metric-value">{value}</p>
      </div>
      <div className={`icon-container ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  );
};

export default App;
