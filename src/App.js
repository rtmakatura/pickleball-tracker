import React, { useState, useEffect } from 'react';
import { Trophy, Users, DollarSign, Calendar, Award, Target, Medal, Plus, Edit, Trash2, Search, Filter, CheckCircle, XCircle, Clock, Mail, Phone, MapPin, Star, TrendingUp } from 'lucide-react';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';

// Firebase operations
const firebaseOperations = {
  collection: (name) => ({
    add: async (data) => {
      const docRef = await addDoc(collection(db, name), {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { id: docRef.id };
    },
    doc: (id) => ({
      update: async (data) => {
        await updateDoc(doc(db, name, id), {
          ...data,
          updatedAt: new Date().toISOString()
        });
      },
      delete: async () => {
        await deleteDoc(doc(db, name, id));
      }
    }),
    onSnapshot: (callback) => {
      const q = query(collection(db, name), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
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
        { name: 'Sarah Johnson', email: 'sarah@email.com', phone: '555-0101', skillLevel: '4.0', venmo: '@sarah-johnson', notes: 'Team captain, prefers morning games', joinDate: '2024-01-15', status: 'active' },
        { name: 'Mike Chen', email: 'mike@email.com', phone: '555-0102', skillLevel: '3.5', venmo: '@mike-chen', notes: 'Reliable player, good at net play', joinDate: '2024-02-01', status: 'active' },
        { name: 'Emma Rodriguez', email: 'emma@email.com', phone: '555-0103', skillLevel: '4.5', venmo: '@emma-rodriguez', notes: 'Aggressive baseline player', joinDate: '2024-01-20', status: 'active' },
        { name: 'David Kim', email: 'david@email.com', phone: '555-0104', skillLevel: '3.0', venmo: '@david-kim', notes: 'New to competitive play', joinDate: '2024-03-01', status: 'active' }
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
        maxTeams: 16,
        registeredTeams: 2,
        teamMembers: [
          { memberId: memberRefs[0], role: 'Player 1', status: 'active', amountOwed: 80, paymentStatus: 'paid-direct', paidDate: '2025-06-01' },
          { memberId: memberRefs[1], role: 'Player 2', status: 'active', amountOwed: 80, paymentStatus: 'paid-direct', paidDate: '2025-06-01' }
        ]
      });

      // Add sample league
      await addDoc(collection(db, 'leagues'), {
        name: 'Summer League 2025',
        type: 'league',
        location: 'Riverside Courts',
        startDate: '2025-07-01',
        endDate: '2025-09-01',
        division: '3.5-4.0',
        fee: 120,
        status: 'active',
        paymentMethod: 'coordinator',
        coordinator: memberRefs[0],
        maxMembers: 20,
        registeredMembers: 3,
        teamMembers: [
          { memberId: memberRefs[0], role: 'Coordinator', status: 'active', amountOwed: 120, paymentStatus: 'paid-venmo', paidDate: '2025-06-10' },
          { memberId: memberRefs[1], role: 'Player', status: 'active', amountOwed: 120, paymentStatus: 'pending', paidDate: null },
          { memberId: memberRefs[2], role: 'Player', status: 'active', amountOwed: 120, paymentStatus: 'overdue', paidDate: null }
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
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);

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

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingItem(null);
  };

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
        {activeTab === 'tournaments' && <TournamentManagement tournaments={tournaments} members={members} openModal={openModal} />}
        {activeTab === 'leagues' && <LeagueManagement leagues={leagues} members={members} openModal={openModal} />}
        {activeTab === 'members' && <MemberManagement members={members} openModal={openModal} />}
        {activeTab === 'results' && <ResultsTracking tournaments={tournaments} leagues={leagues} members={members} />}
      </main>

      {showModal && (
        <Modal 
          type={modalType} 
          item={editingItem} 
          onClose={closeModal} 
          members={members}
          tournaments={tournaments}
          leagues={leagues}
        />
      )}
    </div>
  );
};

const Dashboard = ({ members, tournaments, leagues }) => {
  const allEvents = [...tournaments, ...leagues];
  const activeEvents = allEvents.filter(e => e.status === 'active' || e.status === 'registered');
  const completedEvents = allEvents.filter(e => e.status === 'completed');
  
  // Calculate pending payments
  const pendingPayments = allEvents.reduce((total, event) => {
    const pendingAmount = event.teamMembers?.reduce((sum, member) => {
      return member.paymentStatus === 'pending' || member.paymentStatus === 'overdue' 
        ? sum + (member.amountOwed || 0) 
        : sum;
    }, 0) || 0;
    return total + pendingAmount;
  }, 0);

  const recentActivity = [
    ...tournaments.slice(0, 3).map(t => ({ ...t, type: 'tournament' })),
    ...leagues.slice(0, 2).map(l => ({ ...l, type: 'league' }))
  ].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Active Events" value={activeEvents.length} icon={Calendar} color="blue" />
        <MetricCard title="Team Members" value={members.length} icon={Users} color="emerald" />
        <MetricCard title="Pending Payments" value={`$${pendingPayments}`} icon={DollarSign} color="amber" />
        <MetricCard title="Completed Events" value={completedEvents.length} icon={Trophy} color="purple" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {item.type === 'tournament' ? <Award className="h-5 w-5 text-blue-600" /> : <Target className="h-5 w-5 text-green-600" />}
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.location}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Overview</h2>
          <PaymentOverview events={allEvents} members={members} />
        </div>
      </div>
    </div>
  );
};

const TournamentManagement = ({ tournaments, members, openModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tournament Management</h1>
        <button
          onClick={() => openModal('tournament')}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tournament
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="registered">Registered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              members={members}
              onEdit={() => openModal('tournament', tournament)}
              onDelete={() => openModal('delete', tournament)}
            />
          ))}
        </div>

        {filteredTournaments.length === 0 && (
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tournaments found</p>
          </div>
        )}
      </div>
    </div>
  );
};

const LeagueManagement = ({ leagues, members, openModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredLeagues = leagues.filter(league => {
    const matchesSearch = league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         league.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || league.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">League Management</h1>
        <button
          onClick={() => openModal('league')}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add League
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search leagues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="registered">Registered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLeagues.map((league) => (
            <LeagueCard
              key={league.id}
              league={league}
              members={members}
              onEdit={() => openModal('league', league)}
              onDelete={() => openModal('delete', league)}
            />
          ))}
        </div>

        {filteredLeagues.length === 0 && (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No leagues found</p>
          </div>
        )}
      </div>
    </div>
  );
};

const MemberManagement = ({ members, openModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = skillFilter === 'all' || member.skillLevel === skillFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesSkill && matchesStatus;
  });

  const skillLevels = [...new Set(members.map(m => m.skillLevel))].sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
        <button
          onClick={() => openModal('member')}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Skill Levels</option>
              {skillLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={() => openModal('member', member)}
              onDelete={() => openModal('delete', member)}
            />
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No members found</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ResultsTracking = ({ tournaments, leagues, members }) => {
  const [selectedEvent, setSelectedEvent] = useState('all');
  
  const completedEvents = [...tournaments, ...leagues].filter(event => event.status === 'completed');
  const eventResults = completedEvents.filter(event => 
    selectedEvent === 'all' || event.id === selectedEvent
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Results & Statistics</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Events</span>
              <span className="font-semibold">{completedEvents.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tournaments</span>
              <span className="font-semibold">{tournaments.filter(t => t.status === 'completed').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Leagues</span>
              <span className="font-semibold">{leagues.filter(l => l.status === 'completed').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Members</span>
              <span className="font-semibold">{members.filter(m => m.status === 'active').length}</span>
            </div>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Event Results</h3>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Events</option>
              {completedEvents.map(event => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {eventResults.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {event.type === 'tournament' ? 
                      <Award className="h-5 w-5 text-blue-600" /> : 
                      <Target className="h-5 w-5 text-green-600" />
                    }
                    <div>
                      <h4 className="font-semibold text-gray-800">{event.name}</h4>
                      <p className="text-sm text-gray-600">{event.location}</p>
                    </div>
                  </div>
                  {event.finalPlacing && (
                    <div className="flex items-center space-x-2">
                      <Medal className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{event.finalPlacing} Place</span>
                    </div>
                  )}
                </div>
                {event.resultNotes && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{event.resultNotes}</p>
                )}
              </div>
            ))}
          </div>

          {eventResults.length === 0 && (
            <div className="text-center py-8">
              <Medal className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No completed events found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Component Cards
const TournamentCard = ({ tournament, members, onEdit, onDelete }) => {
  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : 'Unknown Member';
  };

  const pendingPayments = tournament.teamMembers?.filter(m => 
    m.paymentStatus === 'pending' || m.paymentStatus === 'overdue'
  ).length || 0;

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Award className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{tournament.name}</h3>
            <p className="text-sm text-gray-600">{tournament.location}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Date & Time</span>
          <span className="text-sm font-medium">{tournament.date} at {tournament.time}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Division</span>
          <span className="text-sm font-medium">{tournament.division}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Entry Fee</span>
          <span className="text-sm font-medium">${tournament.fee}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Teams</span>
          <span className="text-sm font-medium">{tournament.registeredTeams || 0}/{tournament.maxTeams || 'Unlimited'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
          {tournament.status}
        </span>
        {pendingPayments > 0 && (
          <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
            {pendingPayments} pending payment{pendingPayments !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {tournament.teamMembers && tournament.teamMembers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Team Members:</p>
          <div className="space-y-1">
            {tournament.teamMembers.map((member, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{getMemberName(member.memberId)} ({member.role})</span>
                <PaymentStatusBadge status={member.paymentStatus} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const LeagueCard = ({ league, members, onEdit, onDelete }) => {
  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : 'Unknown Member';
  };

  const coordinator = members.find(m => m.id === league.coordinator);
  const pendingPayments = league.teamMembers?.filter(m => 
    m.paymentStatus === 'pending' || m.paymentStatus === 'overdue'
  ).length || 0;

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Target className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{league.name}</h3>
            <p className="text-sm text-gray-600">{league.location}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Season</span>
          <span className="text-sm font-medium">{league.startDate} - {league.endDate}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Division</span>
          <span className="text-sm font-medium">{league.division}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Season Fee</span>
          <span className="text-sm font-medium">${league.fee}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Members</span>
          <span className="text-sm font-medium">{league.registeredMembers || 0}/{league.maxMembers || 'Unlimited'}</span>
        </div>
        {coordinator && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Coordinator</span>
            <span className="text-sm font-medium">{coordinator.name}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(league.status)}`}>
          {league.status}
        </span>
        {pendingPayments > 0 && (
          <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
            {pendingPayments} pending payment{pendingPayments !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {league.teamMembers && league.teamMembers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">League Members:</p>
          <div className="space-y-1">
            {league.teamMembers.slice(0, 3).map((member, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{getMemberName(member.memberId)} ({member.role})</span>
                <PaymentStatusBadge status={member.paymentStatus} />
              </div>
            ))}
            {league.teamMembers.length > 3 && (
              <p className="text-xs text-gray-500">+{league.teamMembers.length - 3} more members</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MemberCard = ({ member, onEdit, onDelete }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-lg">
              {member.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">{member.skillLevel}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{member.email}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{member.phone}</span>
        </div>
        {member.venmo && (
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{member.venmo}</span>
          </div>
        )}
      </div>

      {member.notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{member.notes}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Joined {member.joinDate}</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          member.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {member.status}
        </span>
      </div>
    </div>
  );
};

const PaymentOverview = ({ events, members }) => {
  const paymentStats = events.reduce((stats, event) => {
    event.teamMembers?.forEach(member => {
      if (member.paymentStatus === 'paid-direct' || member.paymentStatus === 'paid-venmo') {
        stats.paid += member.amountOwed || 0;
      } else if (member.paymentStatus === 'pending') {
        stats.pending += member.amountOwed || 0;
      } else if (member.paymentStatus === 'overdue') {
        stats.overdue += member.amountOwed || 0;
      }
    });
    return stats;
  }, { paid: 0, pending: 0, overdue: 0 });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Paid</span>
        <span className="text-sm font-semibold text-green-600">${paymentStats.paid}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Pending</span>
        <span className="text-sm font-semibold text-amber-600">${paymentStats.pending}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Overdue</span>
        <span className="text-sm font-semibold text-red-600">${paymentStats.overdue}</span>
      </div>
      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-800">Total Outstanding</span>
          <span className="text-sm font-bold text-gray-800">${paymentStats.pending + paymentStats.overdue}</span>
        </div>
      </div>
    </div>
  );
};

const PaymentStatusBadge = ({ status }) => {
  const getStatusInfo = (status) => {
    switch (status) {
      case 'paid-direct':
      case 'paid-venmo':
        return { icon: CheckCircle, color: 'text-green-600 bg-green-100', text: 'Paid' };
      case 'pending':
        return { icon: Clock, color: 'text-amber-600 bg-amber-100', text: 'Pending' };
      case 'overdue':
        return { icon: XCircle, color: 'text-red-600 bg-red-100', text: 'Overdue' };
      default:
        return { icon: Clock, color: 'text-gray-600 bg-gray-100', text: 'Unknown' };
    }
  };

  const { icon: Icon, color, text } = getStatusInfo(status);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3 mr-1" />
      {text}
    </span>
  );
};

const Modal = ({ type, item, onClose, members, tournaments, leagues }) => {
  const [formData, setFormData] = useState(getInitialFormData(type, item));

  function getInitialFormData(type, item) {
    switch (type) {
      case 'tournament':
        return item ? { ...item } : {
          name: '',
          location: '',
          date: '',
          time: '',
          division: '',
          fee: '',
          maxTeams: '',
          status: 'active',
          paymentMethod: 'direct',
          teamMembers: []
        };
      case 'league':
        return item ? { ...item } : {
          name: '',
          location: '',
          startDate: '',
          endDate: '',
          division: '',
          fee: '',
          maxMembers: '',
          status: 'active',
          paymentMethod: 'coordinator',
          coordinator: '',
          teamMembers: []
        };
      case 'member':
        return item ? { ...item } : {
          name: '',
          email: '',
          phone: '',
          skillLevel: '',
          venmo: '',
          notes: '',
          joinDate: new Date().toISOString().split('T')[0],
          status: 'active'
        };
      default:
        return {};
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const collectionName = type === 'member' ? 'members' : type === 'tournament' ? 'tournaments' : 'leagues';
      
      if (item) {
        await firebaseOperations.collection(collectionName).doc(item.id).update(formData);
      } else {
        await firebaseOperations.collection(collectionName).add(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const collectionName = item.type === 'member' ? 'members' : item.type === 'tournament' ? 'tournaments' : 'leagues';
      await firebaseOperations.collection(collectionName).doc(item.id).delete();
      onClose();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  if (type === 'delete') {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Confirm Delete</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "{item.name}"? This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {item ? 'Edit' : 'Add'} {type.charAt(0).toUpperCase() + type.slice(1)}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {type === 'tournament' && (
            <TournamentForm formData={formData} setFormData={setFormData} members={members} />
          )}
          {type === 'league' && (
            <LeagueForm formData={formData} setFormData={setFormData} members={members} />
          )}
          {type === 'member' && (
            <MemberForm formData={formData} setFormData={setFormData} />
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {item ? 'Update' : 'Create'} {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TournamentForm = ({ formData, setFormData, members }) => {
  const addTeamMember = () => {
    setFormData({
      ...formData,
      teamMembers: [
        ...formData.teamMembers,
        { memberId: '', role: 'Player', status: 'active', amountOwed: formData.fee, paymentStatus: 'pending' }
      ]
    });
  };

  const updateTeamMember = (index, field, value) => {
    const updated = [...formData.teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, teamMembers: updated });
  };

  const removeTeamMember = (index) => {
    const updated = formData.teamMembers.filter((_, i) => i !== index);
    setFormData({ ...formData, teamMembers: updated });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tournament Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
          <input
            type="text"
            value={formData.division}
            onChange={(e) => setFormData({ ...formData, division: e.target.value })}
            className="form-input"
            placeholder="e.g., 4.0, 3.5-4.0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Entry Fee ($)</label>
          <input
            type="number"
            value={formData.fee}
            onChange={(e) => setFormData({ ...formData, fee: parseInt(e.target.value) })}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Teams</label>
          <input
            type="number"
            value={formData.maxTeams}
            onChange={(e) => setFormData({ ...formData, maxTeams: parseInt(e.target.value) })}
            className="form-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="form-input"
          >
            <option value="active">Active</option>
            <option value="registered">Registered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">Team Members</label>
          <button
            type="button"
            onClick={addTeamMember}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + Add Member
          </button>
        </div>
        
        {formData.teamMembers.map((member, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <select
                  value={member.memberId}
                  onChange={(e) => updateTeamMember(index, 'memberId', e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">Select Member</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="text"
                  value={member.role}
                  onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                  className="form-input"
                  placeholder="Role (e.g., Player 1)"
                />
              </div>
              <div>
                <select
                  value={member.paymentStatus}
                  onChange={(e) => updateTeamMember(index, 'paymentStatus', e.target.value)}
                  className="form-input"
                >
                  <option value="pending">Pending</option>
                  <option value="paid-direct">Paid Direct</option>
                  <option value="paid-venmo">Paid Venmo</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => removeTeamMember(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const LeagueForm = ({ formData, setFormData, members }) => {
  const addTeamMember = () => {
    setFormData({
      ...formData,
      teamMembers: [
        ...formData.teamMembers,
        { memberId: '', role: 'Player', status: 'active', amountOwed: formData.fee, paymentStatus: 'pending' }
      ]
    });
  };

  const updateTeamMember = (index, field, value) => {
    const updated = [...formData.teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, teamMembers: updated });
  };

  const removeTeamMember = (index) => {
    const updated = formData.teamMembers.filter((_, i) => i !== index);
    setFormData({ ...formData, teamMembers: updated });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">League Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
          <input
            type="text"
            value={formData.division}
            onChange={(e) => setFormData({ ...formData, division: e.target.value })}
            className="form-input"
            placeholder="e.g., 3.5-4.0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Season Fee ($)</label>
          <input
            type="number"
            value={formData.fee}
            onChange={(e) => setFormData({ ...formData, fee: parseInt(e.target.value) })}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Members</label>
          <input
            type="number"
            value={formData.maxMembers}
            onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
            className="form-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Coordinator</label>
          <select
            value={formData.coordinator}
            onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
            className="form-input"
          >
            <option value="">Select Coordinator</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="form-input"
          >
            <option value="active">Active</option>
            <option value="registered">Registered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">League Members</label>
          <button
            type="button"
            onClick={addTeamMember}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + Add Member
          </button>
        </div>
        
        {formData.teamMembers.map((member, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <select
                  value={member.memberId}
                  onChange={(e) => updateTeamMember(index, 'memberId', e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">Select Member</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={member.role}
                  onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                  className="form-input"
                >
                  <option value="Player">Player</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Captain">Captain</option>
                </select>
              </div>
              <div>
                <select
                  value={member.paymentStatus}
                  onChange={(e) => updateTeamMember(index, 'paymentStatus', e.target.value)}
                  className="form-input"
                >
                  <option value="pending">Pending</option>
                  <option value="paid-direct">Paid Direct</option>
                  <option value="paid-venmo">Paid Venmo</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => removeTeamMember(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const MemberForm = ({ formData, setFormData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="form-input"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="form-input"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="form-input"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label>
        <input
          type="text"
          value={formData.skillLevel}
          onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
          className="form-input"
          placeholder="e.g., 4.0, 3.5"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Venmo Handle</label>
        <input
          type="text"
          value={formData.venmo}
          onChange={(e) => setFormData({ ...formData, venmo: e.target.value })}
          className="form-input"
          placeholder="@username"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
        <input
          type="date"
          value={formData.joinDate}
          onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
          className="form-input"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="form-input"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="form-input"
          rows="3"
          placeholder="Additional notes about the member..."
        />
      </div>
    </div>
  );
};

// Utility functions
const getStatusColor = (status) => {
  switch (status) {
    case 'active':
    case 'registered':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
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