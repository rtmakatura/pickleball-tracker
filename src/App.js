import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Users, DollarSign, MapPin, Clock, Trophy, Target, Edit3, Trash2, Check, X, AlertCircle, Home, ExternalLink, Navigation, Award } from 'lucide-react';

// Firebase imports
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc,
  deleteDoc,
  onSnapshot 
} from 'firebase/firestore';

const PickleballTracker = () => {
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tournaments, setTournaments] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [members, setMembers] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [eventType, setEventType] = useState('tournament');
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Search states
  const [memberSearch, setMemberSearch] = useState('');
  const [tournamentSearch, setTournamentSearch] = useState('');
  const [leagueSearch, setLeagueSearch] = useState('');
  const [resultsSearch, setResultsSearch] = useState('');
  
  // Debounced search states
  const [memberSearchInput, setMemberSearchInput] = useState('');
  const [tournamentSearchInput, setTournamentSearchInput] = useState('');
  const [leagueSearchInput, setLeagueSearchInput] = useState('');
  const [resultsSearchInput, setResultsSearchInput] = useState('');

  // Debounce search functionality
  useEffect(() => {
    const timer = setTimeout(() => setMemberSearch(memberSearchInput), 300);
    return () => clearTimeout(timer);
  }, [memberSearchInput]);

  useEffect(() => {
    const timer = setTimeout(() => setTournamentSearch(tournamentSearchInput), 300);
    return () => clearTimeout(timer);
  }, [tournamentSearchInput]);

  useEffect(() => {
    const timer = setTimeout(() => setLeagueSearch(leagueSearchInput), 300);
    return () => clearTimeout(timer);
  }, [leagueSearchInput]);

  useEffect(() => {
    const timer = setTimeout(() => setResultsSearch(resultsSearchInput), 300);
    return () => clearTimeout(timer);
  }, [resultsSearchInput]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showEventModal || showMemberModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showEventModal, showMemberModal]);

  // Load data from Firebase
  useEffect(() => {
    const loadDataFromFirebase = async () => {
      try {
        setLoading(true);
        
        const membersSnapshot = await getDocs(collection(db, 'members'));
        const membersData = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const tournamentsSnapshot = await getDocs(collection(db, 'tournaments'));
        const tournamentsData = tournamentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const leaguesSnapshot = await getDocs(collection(db, 'leagues'));
        const leaguesData = leaguesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setMembers(membersData);
        setTournaments(tournamentsData);
        setLeagues(leaguesData);

        if (membersData.length === 0 && tournamentsData.length === 0 && leaguesData.length === 0) {
          await loadSampleData();
        }
        
      } catch (error) {
        console.error('Error loading data from Firebase:', error);
        alert('Error loading data. Please refresh the page and try again.');
      } finally {
        setLoading(false);
      }
    };

    const loadSampleData = async () => {
      try {
        const sampleMembers = [
          { id: '1', name: 'John Smith', email: 'john@email.com', phone: '555-0101', skillLevel: '3.5', venmo: '@johnsmith', notes: 'Prefers morning games.' },
          { id: '2', name: 'Sarah Johnson', email: 'sarah@email.com', phone: '555-0102', skillLevel: '4.0', venmo: '@sarahj', notes: 'Team captain experience.' },
          { id: '3', name: 'Mike Davis', email: 'mike@email.com', phone: '555-0103', skillLevel: '3.0', venmo: '@miked', notes: 'New to pickleball.' },
          { id: '4', name: 'Lisa Wilson', email: 'lisa@email.com', phone: '555-0104', skillLevel: '4.5', venmo: '@lisaw', notes: 'Tournament experience.' }
        ];
        
        const sampleTournaments = [
          {
            id: '1',
            name: 'Spring Championship',
            type: 'tournament',
            location: 'Central Park Courts',
            date: '2025-06-15',
            time: '9:00 AM',
            division: '4.0',
            fee: 50,
            status: 'registered',
            paymentMethod: 'group',
            paymentCoordinator: '1',
            googleMapsLink: 'https://maps.google.com/?q=Central+Park+Courts',
            tournamentLink: 'https://example.com/spring-championship',
            notes: 'Bring sunscreen and water bottles.',
            finalPlacing: '',
            completionDate: '',
            resultNotes: '',
            teamMembers: [
              { memberId: '1', role: 'Player 1', status: 'confirmed', amountOwed: 50, paymentStatus: 'paid_coordinator', paidDate: '2025-05-20' },
              { memberId: '2', role: 'Player 2', status: 'confirmed', amountOwed: 50, paymentStatus: 'pending', paidDate: null }
            ]
          }
        ];

        const sampleLeagues = [
          {
            id: '1',
            name: 'Summer League 2025',
            type: 'league',
            location: 'Recreation Center',
            startDate: '2025-06-01',
            endDate: '2025-08-31',
            dayOfWeek: 'Tuesday',
            time: '7:00 PM',
            division: '3.5',
            fee: 120,
            status: 'active',
            paymentMethod: 'direct',
            googleMapsLink: 'https://maps.google.com/?q=Recreation+Center',
            tournamentLink: 'https://example.com/summer-league',
            notes: 'Indoor courts available in case of rain.',
            finalPlacing: '',
            completionDate: '',
            resultNotes: '',
            teamMembers: [
              { memberId: '1', role: 'Regular', status: 'confirmed', amountOwed: 120, paymentStatus: 'paid_direct', paidDate: '2025-05-15' },
              { memberId: '3', role: 'Regular', status: 'confirmed', amountOwed: 120, paymentStatus: 'pending', paidDate: null }
            ]
          }
        ];

        for (const member of sampleMembers) {
          await setDoc(doc(db, 'members', member.id), member);
        }
        for (const tournament of sampleTournaments) {
          await setDoc(doc(db, 'tournaments', tournament.id), tournament);
        }
        for (const league of sampleLeagues) {
          await setDoc(doc(db, 'leagues', league.id), league);
        }

        setMembers(sampleMembers);
        setTournaments(sampleTournaments);
        setLeagues(sampleLeagues);
        
      } catch (error) {
        console.error('Error loading sample data:', error);
      }
    };

    loadDataFromFirebase();
  }, []);

  // Helper functions
  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : 'Unknown';
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid_direct':
      case 'paid_coordinator':
        return 'status-paid';
      case 'pending':
        return 'status-pending';
      case 'overdue':
        return 'status-overdue';
      default:
        return 'status-default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'registered':
        return 'status-registered';
      case 'active':
        return 'status-active';
      case 'interested':
        return 'status-interested';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-default';
    }
  };

  const formatPaymentStatus = (status) => {
    switch (status) {
      case 'paid_direct': return 'Paid Direct';
      case 'paid_coordinator': return 'Paid Coordinator';
      case 'pending': return 'Pending';
      case 'overdue': return 'Overdue';
      default: return status;
    }
  };

  // Event management functions
  const addEvent = async (eventData) => {
    const newEvent = {
      ...eventData,
      id: Date.now().toString(),
      teamMembers: eventData.teamMembers || [],
      finalPlacing: eventData.finalPlacing || '',
      completionDate: eventData.completionDate || '',
      resultNotes: eventData.resultNotes || ''
    };

    try {
      await setDoc(doc(db, eventData.type === 'tournament' ? 'tournaments' : 'leagues', newEvent.id), newEvent);
      
      if (eventData.type === 'tournament') {
        setTournaments([...tournaments, newEvent]);
      } else {
        setLeagues([...leagues, newEvent]);
      }
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Error saving event. Please try again.');
    }
  };

  const updateEvent = async (eventData) => {
    try {
      await updateDoc(doc(db, eventData.type === 'tournament' ? 'tournaments' : 'leagues', eventData.id), eventData);
      
      if (eventData.type === 'tournament') {
        setTournaments(tournaments.map(t => t.id === eventData.id ? eventData : t));
      } else {
        setLeagues(leagues.map(l => l.id === eventData.id ? eventData : l));
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Error updating event. Please try again.');
    }
  };

  const deleteEvent = async (id, type) => {
    const eventName = type === 'tournament' 
      ? tournaments.find(t => t.id === id)?.name 
      : leagues.find(l => l.id === id)?.name;
    
    if (confirm(`Are you sure you want to delete "${eventName}"?`)) {
      try {
        await deleteDoc(doc(db, type === 'tournament' ? 'tournaments' : 'leagues', id));
        
        if (type === 'tournament') {
          setTournaments(tournaments.filter(t => t.id !== id));
        } else {
          setLeagues(leagues.filter(l => l.id !== id));
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event. Please try again.');
      }
    }
  };

  // Member management functions
  const addMember = async (memberData) => {
    const newMember = { ...memberData, id: Date.now().toString() };
    
    try {
      await setDoc(doc(db, 'members', newMember.id), newMember);
      setMembers([...members, newMember]);
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Error saving member. Please try again.');
    }
  };

  const updateMember = async (memberData) => {
    try {
      await updateDoc(doc(db, 'members', memberData.id), memberData);
      setMembers(members.map(m => m.id === memberData.id ? memberData : m));
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Error updating member. Please try again.');
    }
  };

  const deleteMember = async (id) => {
    const member = members.find(m => m.id === id);
    if (confirm(`Are you sure you want to delete "${member?.name}"?`)) {
      try {
        await deleteDoc(doc(db, 'members', id));
        setMembers(members.filter(m => m.id !== id));
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Error deleting member. Please try again.');
      }
    }
  };

  // Quick payment status update function
  const updateTeamMemberPaymentStatus = async (eventId, eventType, memberIndex, newStatus) => {
    try {
      if (eventType === 'tournament') {
        const updatedTournaments = tournaments.map(tournament => {
          if (tournament.id === eventId) {
            const updatedMembers = [...tournament.teamMembers];
            updatedMembers[memberIndex] = {
              ...updatedMembers[memberIndex],
              paymentStatus: newStatus,
              paidDate: newStatus.includes('paid') ? new Date().toISOString().split('T')[0] : null
            };
            const updatedTournament = { ...tournament, teamMembers: updatedMembers };
            updateDoc(doc(db, 'tournaments', eventId), updatedTournament);
            return updatedTournament;
          }
          return tournament;
        });
        setTournaments(updatedTournaments);
      } else {
        const updatedLeagues = leagues.map(league => {
          if (league.id === eventId) {
            const updatedMembers = [...league.teamMembers];
            updatedMembers[memberIndex] = {
              ...updatedMembers[memberIndex],
              paymentStatus: newStatus,
              paidDate: newStatus.includes('paid') ? new Date().toISOString().split('T')[0] : null
            };
            const updatedLeague = { ...league, teamMembers: updatedMembers };
            updateDoc(doc(db, 'leagues', eventId), updatedLeague);
            return updatedLeague;
          }
          return league;
        });
        setLeagues(updatedLeagues);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Error updating payment status. Please try again.');
    }
  };

  // Dashboard Component
  const Dashboard = () => {
    const allEvents = [...tournaments, ...leagues];
    const upcomingEvents = allEvents
      .filter(event => new Date(event.date || event.startDate) >= new Date())
      .sort((a, b) => new Date(a.date || a.startDate) - new Date(b.date || b.startDate))
      .slice(0, 5);

    const pendingPayments = allEvents
      .flatMap(event => 
        event.teamMembers
          .filter(member => member.paymentStatus === 'pending')
          .map(member => ({
            eventName: event.name,
            memberName: getMemberName(member.memberId),
            amount: member.amountOwed,
            eventType: event.type
          }))
      );

    const totalPendingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const completedEvents = allEvents.filter(event => event.status === 'completed').length;
    const activeEvents = allEvents.filter(event => event.status !== 'completed').length;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Events</p>
                <p className="text-2xl font-bold text-blue-600">{activeEvents}</p>
              </div>
              <div className="icon-container bg-blue-100">
                <Trophy className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Team Members</p>
                <p className="text-2xl font-bold text-emerald-600">{members.length}</p>
              </div>
              <div className="icon-container bg-emerald-100">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Payments</p>
                <p className="text-2xl font-bold text-amber-600">{pendingPayments.length}</p>
                <p className="text-xs text-gray-500">${totalPendingAmount} total</p>
              </div>
              <div className="icon-container bg-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed Events</p>
                <p className="text-2xl font-bold text-purple-600">{completedEvents}</p>
              </div>
              <div className="icon-container bg-purple-100">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events and Pending Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Events */}
          <div className="lg:col-span-2 card">
            <div className="card-header">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </h3>
            </div>
            <div className="card-body">
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{event.name}</h4>
                        <span className={`status-badge ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><MapPin className="h-3 w-3 inline mr-1" />{event.location}</p>
                        <p><Calendar className="h-3 w-3 inline mr-1" />
                          {event.type === 'tournament' ? event.date : `${event.startDate} - ${event.endDate}`}
                        </p>
                        <p><DollarSign className="h-3 w-3 inline mr-1" />${event.fee}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No upcoming events</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Payments */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pending Payments
              </h3>
            </div>
            <div className="card-body">
              {pendingPayments.length > 0 ? (
                <div className="space-y-2">
                  {pendingPayments.slice(0, 5).map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-amber-50 rounded border">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{payment.memberName}</p>
                        <p className="text-xs text-gray-600">{payment.eventName}</p>
                      </div>
                      <span className="text-sm font-semibold text-amber-700">${payment.amount}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Check className="h-12 w-12 text-green-400 mx-auto mb-2" />
                  <p className="text-gray-500">All payments up to date!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Event Modal Component
  const EventModal = () => {
    const [formData, setFormData] = useState({
      name: '', type: eventType, location: '', date: '', startDate: '', endDate: '',
      time: '', dayOfWeek: '', division: '', fee: '', status: 'interested',
      paymentMethod: 'direct', paymentCoordinator: '', googleMapsLink: '',
      tournamentLink: '', notes: '', finalPlacing: '', completionDate: '',
      resultNotes: '', teamMembers: []
    });

    useEffect(() => {
      if (editingEvent) {
        setFormData({ ...editingEvent });
      } else {
        setFormData({
          name: '', type: eventType, location: '', date: '', startDate: '', endDate: '',
          time: '', dayOfWeek: '', division: '', fee: '', status: 'interested',
          paymentMethod: 'direct', paymentCoordinator: '', googleMapsLink: '',
          tournamentLink: '', notes: '', finalPlacing: '', completionDate: '',
          resultNotes: '', teamMembers: []
        });
      }
    }, [editingEvent, eventType]);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (editingEvent) {
        updateEvent(formData);
        setEditingEvent(null);
      } else {
        addEvent(formData);
      }
      setShowEventModal(false);
    };

    const addTeamMember = () => {
      setFormData({
        ...formData,
        teamMembers: [...formData.teamMembers, {
          memberId: '', role: 'Player', status: 'confirmed',
          amountOwed: formData.fee || 0, paymentStatus: 'pending', paidDate: null
        }]
      });
    };

    const updateTeamMember = (index, field, value) => {
      const updatedMembers = formData.teamMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      );
      setFormData({ ...formData, teamMembers: updatedMembers });
    };

    const removeTeamMember = (index) => {
      setFormData({
        ...formData,
        teamMembers: formData.teamMembers.filter((_, i) => i !== index)
      });
    };

    return (
      <div className="modal-overlay" onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowEventModal(false);
          setEditingEvent(null);
        }
      }}>
        <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="text-xl font-semibold">
              {editingEvent ? 'Edit' : 'Add'} {eventType === 'tournament' ? 'Tournament' : 'League'}
            </h2>
          </div>
          
          <div className="modal-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {eventType === 'tournament' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Time</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Day of Week</label>
                    <select
                      value={formData.dayOfWeek}
                      onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                      className="form-input"
                    >
                      <option value="">Select Day</option>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Time</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Division</label>
                  <input
                    type="text"
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    placeholder="e.g., 3.5, 4.0"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Fee ($)</label>
                  <input
                    type="number"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) || 0 })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-input"
                  >
                    <option value="interested">Interested</option>
                    <option value="registered">Registered</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {formData.status === 'completed' && (
                <div className="card">
                  <div className="card-header">
                    <h4 className="font-medium">Competition Results</h4>
                  </div>
                  <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Final Placing</label>
                        <input
                          type="text"
                          value={formData.finalPlacing}
                          onChange={(e) => setFormData({ ...formData, finalPlacing: e.target.value })}
                          placeholder="e.g., 1st Place, Semifinalist"
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">Completion Date</label>
                        <input
                          type="date"
                          value={formData.completionDate}
                          onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                          className="form-input"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="form-label">Result Notes</label>
                        <textarea
                          value={formData.resultNotes}
                          onChange={(e) => setFormData({ ...formData, resultNotes: e.target.value })}
                          placeholder="How did it go? Any highlights or learnings..."
                          rows="3"
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Google Maps Link</label>
                  <input
                    type="url"
                    value={formData.googleMapsLink}
                    onChange={(e) => setFormData({ ...formData, googleMapsLink: e.target.value })}
                    placeholder="https://maps.google.com/?q=..."
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">{eventType === 'tournament' ? 'Tournament' : 'League'} Website</label>
                  <input
                    type="url"
                    value={formData.tournamentLink}
                    onChange={(e) => setFormData({ ...formData, tournamentLink: e.target.value })}
                    placeholder="https://example.com/event-page"
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional information, rules, what to bring, etc..."
                  rows="3"
                  className="form-input"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="form-label">Team Members</label>
                  <button
                    type="button"
                    onClick={addTeamMember}
                    className="btn btn-primary btn-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Member
                  </button>
                </div>
                
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {formData.teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
                      <select
                        value={member.memberId}
                        onChange={(e) => updateTeamMember(index, 'memberId', e.target.value)}
                        className="form-input flex-1"
                      >
                        <option value="">Select Member</option>
                        {members.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                      
                      <input
                        type="text"
                        value={member.role}
                        onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                        placeholder="Role"
                        className="form-input w-24"
                      />
                      
                      <select
                        value={member.paymentStatus}
                        onChange={(e) => updateTeamMember(index, 'paymentStatus', e.target.value)}
                        className="form-input w-36"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid_direct">Paid Direct</option>
                        <option value="paid_coordinator">Paid Coordinator</option>
                        <option value="overdue">Overdue</option>
                      </select>
                      
                      <button
                        type="button"
                        onClick={() => removeTeamMember(index)}
                        className="btn btn-danger btn-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={() => {
                setShowEventModal(false);
                setEditingEvent(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                const form = e.target.closest('.modal-content').querySelector('form');
                if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
              }}
              className="btn btn-primary"
            >
              {editingEvent ? 'Update' : 'Add'} {eventType === 'tournament' ? 'Tournament' : 'League'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Member Modal Component
  const MemberModal = () => {
    const [formData, setFormData] = useState({
      name: '', email: '', phone: '', skillLevel: '', venmo: '', notes: ''
    });

    useEffect(() => {
      if (editingMember) {
        setFormData(editingMember);
      } else {
        setFormData({ name: '', email: '', phone: '', skillLevel: '', venmo: '', notes: '' });
      }
    }, [editingMember]);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (editingMember) {
        updateMember(formData);
        setEditingMember(null);
      } else {
        addMember(formData);
      }
      setShowMemberModal(false);
    };

    return (
      <div className="modal-overlay" onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowMemberModal(false);
          setEditingMember(null);
        }
      }}>
        <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="text-xl font-semibold">{editingMember ? 'Edit' : 'Add'} Member</h2>
          </div>
          
          <div className="modal-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="form-label">Skill Level</label>
                <input
                  type="text"
                  value={formData.skillLevel}
                  onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                  placeholder="e.g., 3.5, 4.0"
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="form-label">Venmo Username</label>
                <input
                  type="text"
                  value={formData.venmo}
                  onChange={(e) => setFormData({ ...formData, venmo: e.target.value })}
                  placeholder="@username"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Preferences, availability, special notes..."
                  rows="3"
                  className="form-input"
                />
              </div>
            </form>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={() => {
                setShowMemberModal(false);
                setEditingMember(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                const form = e.target.closest('.modal-content').querySelector('form');
                if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
              }}
              className="btn btn-success"
            >
              {editingMember ? 'Update' : 'Add'} Member
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Event List Component
  const EventList = ({ events, type, onEdit, onDelete }) => {
    const searchTerm = type === 'tournament' ? tournamentSearch : leagueSearch;
    const searchInput = type === 'tournament' ? tournamentSearchInput : leagueSearchInput;
    const setSearchInput = type === 'tournament' ? setTournamentSearchInput : setLeagueSearchInput;
    const clearSearch = () => {
      if (type === 'tournament') {
        setTournamentSearchInput('');
        setTournamentSearch('');
      } else {
        setLeagueSearchInput('');
        setLeagueSearch('');
      }
    };
    
    const activeEvents = events.filter(event => event.status !== 'completed');
    const filteredEvents = activeEvents.filter(event =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.division.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold capitalize">{type}s</h3>
            <button
              onClick={() => {
                setEventType(type);
                setShowEventModal(true);
              }}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4" />
              Add {type}
            </button>
          </div>
          
          <div className="space-y-2">
            <input
              type="text"
              placeholder={`Search ${type}s...`}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="form-input"
            />
            
            {searchTerm && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Showing {filteredEvents.length} of {activeEvents.length} active {type}s
                </span>
                <button onClick={clearSearch} className="text-blue-600 hover:text-blue-700 font-medium">
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {filteredEvents.length > 0 ? filteredEvents.map(event => (
            <div key={event.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-lg font-semibold">{event.name}</h4>
                    <span className={`status-badge ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {type === 'tournament' ? event.date : `${event.startDate} - ${event.endDate}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>${event.fee}</span>
                    </div>
                  </div>

                  {(event.googleMapsLink || event.tournamentLink) && (
                    <div className="flex gap-2 mb-3">
                      {event.googleMapsLink && (
                        <a
                          href={event.googleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-success"
                        >
                          <Navigation className="h-3 w-3" />
                          Directions
                        </a>
                      )}
                      {event.tournamentLink && (
                        <a
                          href={event.tournamentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-primary"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Details
                        </a>
                      )}
                    </div>
                  )}

                  {event.notes && (
                    <div className="mb-3 p-2 bg-blue-50 rounded border">
                      <p className="text-sm text-gray-700">{event.notes}</p>
                    </div>
                  )}
                  
                  {event.teamMembers.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Team Members</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {event.teamMembers.map((member, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                            <div>
                              <span className="font-medium text-sm">{getMemberName(member.memberId)}</span>
                              <span className="text-gray-500 ml-1 text-xs">({member.role})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`status-badge ${getPaymentStatusColor(member.paymentStatus)}`}>
                                {formatPaymentStatus(member.paymentStatus)}
                              </span>
                              
                              {member.paymentStatus === 'pending' && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => updateTeamMemberPaymentStatus(event.id, type, index, 'paid_direct')}
                                    className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                                    title="Mark as Paid"
                                  >
                                    ✓
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => {
                      setEditingEvent(event);
                      setEventType(type);
                      setShowEventModal(true);
                    }}
                    className="btn btn-sm btn-secondary"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(event.id, type)}
                    className="btn btn-sm btn-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              {searchTerm ? (
                <div>
                  <p className="text-gray-500 mb-2">No {type}s found matching "{searchTerm}"</p>
                  <button onClick={clearSearch} className="text-blue-600 hover:text-blue-700 font-medium">
                    Clear search
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 mb-3">No active {type}s</p>
                  <button
                    onClick={() => {
                      setEventType(type);
                      setShowEventModal(true);
                    }}
                    className="btn btn-primary"
                  >
                    Add your first {type}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Results Component
  const Results = () => {
    const completedEvents = [...tournaments, ...leagues]
      .filter(event => event.status === 'completed')
      .sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate));

    const filteredResults = completedEvents.filter(event =>
      event.name.toLowerCase().includes(resultsSearch.toLowerCase()) ||
      event.location.toLowerCase().includes(resultsSearch.toLowerCase()) ||
      (event.finalPlacing && event.finalPlacing.toLowerCase().includes(resultsSearch.toLowerCase()))
    );

    return (
      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedEvents.length}</p>
              </div>
              <div className="icon-container bg-blue-100">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">First Places</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {completedEvents.filter(event => 
                    event.finalPlacing && event.finalPlacing.toLowerCase().includes('1st')
                  ).length}
                </p>
              </div>
              <div className="icon-container bg-yellow-100">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Top 3 Finishes</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {completedEvents.filter(event => 
                    event.finalPlacing && (
                      event.finalPlacing.toLowerCase().includes('1st') ||
                      event.finalPlacing.toLowerCase().includes('2nd') ||
                      event.finalPlacing.toLowerCase().includes('3rd')
                    )
                  ).length}
                </p>
              </div>
              <div className="icon-container bg-emerald-100">
                <Award className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-semibold mb-4">Competition Results</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search results..."
                value={resultsSearchInput}
                onChange={(e) => setResultsSearchInput(e.target.value)}
                className="form-input"
              />
              
              {resultsSearch && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Showing {filteredResults.length} of {completedEvents.length} results
                  </span>
                  <button
                    onClick={() => {
                      setResultsSearchInput('');
                      setResultsSearch('');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredResults.length > 0 ? filteredResults.map(event => (
              <div key={event.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="text-lg font-semibold">{event.name}</h4>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                        {event.type}
                      </span>
                      {event.finalPlacing && (
                        <span className="status-badge status-completed">
                          {event.finalPlacing}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{event.completionDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span>Division: {event.division}</span>
                      </div>
                    </div>

                    {event.resultNotes && (
                      <div className="p-2 bg-blue-50 rounded border mb-3">
                        <p className="text-sm text-gray-700">{event.resultNotes}</p>
                      </div>
                    )}
                    
                    {event.teamMembers.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Team Members</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {event.teamMembers.map((member, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                              <span className="font-medium text-sm">{getMemberName(member.memberId)}</span>
                              <span className="text-gray-500 text-xs">({member.role})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      setEditingEvent(event);
                      setEventType(event.type);
                      setShowEventModal(true);
                    }}
                    className="btn btn-sm btn-secondary ml-4"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center">
                <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                {resultsSearch ? (
                  <div>
                    <p className="text-gray-500 mb-2">No results found matching "{resultsSearch}"</p>
                    <button
                      onClick={() => {
                        setResultsSearchInput('');
                        setResultsSearch('');
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-3">No completed events yet</p>
                    <p className="text-sm text-gray-400">Mark tournaments and leagues as "completed" to see results here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your pickleball data...</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pickleball Tracker</h1>
                <p className="text-sm text-gray-500">Tournament & League Management</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-gray-900">
                  {tournaments.filter(t => t.status !== 'completed').length + leagues.filter(l => l.status !== 'completed').length}
                </span>
                <span className="text-gray-500">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-gray-900">{members.length}</span>
                <span className="text-gray-500">Members</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Home },
                { id: 'tournaments', label: 'Tournaments', icon: Calendar },
                { id: 'leagues', label: 'Leagues', icon: Trophy },
                { id: 'members', label: 'Members', icon: Users },
                { id: 'results', label: 'Results', icon: Award }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <Dashboard />}
        
        {activeTab === 'tournaments' && (
          <EventList 
            events={tournaments} 
            type="tournament" 
            onEdit={(event) => {
              setEditingEvent(event);
              setEventType('tournament');
              setShowEventModal(true);
            }}
            onDelete={deleteEvent}
          />
        )}
        
        {activeTab === 'leagues' && (
          <EventList 
            events={leagues} 
            type="league" 
            onEdit={(event) => {
              setEditingEvent(event);
              setEventType('league');
              setShowEventModal(true);
            }}
            onDelete={deleteEvent}
          />
        )}

        {activeTab === 'results' && <Results />}
        
        {activeTab === 'members' && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Members</h3>
                <button
                  onClick={() => setShowMemberModal(true)}
                  className="btn btn-success"
                >
                  <Plus className="h-4 w-4" />
                  Add Member
                </button>
              </div>
              
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Search members..."
                  value={memberSearchInput}
                  onChange={(e) => setMemberSearchInput(e.target.value)}
                  className="form-input"
                />
                
                {memberSearch && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Showing {members.filter(member =>
                        member.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                        member.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
                        member.skillLevel.toLowerCase().includes(memberSearch.toLowerCase()) ||
                        (member.notes && member.notes.toLowerCase().includes(memberSearch.toLowerCase()))
                      ).length} of {members.length} members
                    </span>
                    <button
                      onClick={() => {
                        setMemberSearchInput('');
                        setMemberSearch('');
                      }}
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {(() => {
                const filteredMembers = members.filter(member =>
                  member.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                  member.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
                  member.skillLevel.toLowerCase().includes(memberSearch.toLowerCase()) ||
                  (member.notes && member.notes.toLowerCase().includes(memberSearch.toLowerCase()))
                );
                
                return filteredMembers.length > 0 ? filteredMembers.map(member => (
                  <div key={member.id} className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">{member.name}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                        <p><span className="font-medium">Email:</span> {member.email}</p>
                        <p><span className="font-medium">Phone:</span> {member.phone}</p>
                        <p><span className="font-medium">Skill Level:</span> {member.skillLevel}</p>
                        <p><span className="font-medium">Venmo:</span> {member.venmo}</p>
                      </div>
                      {member.notes && (
                        <div className="p-2 bg-blue-50 rounded border">
                          <p className="text-sm text-gray-700">{member.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingMember(member);
                          setShowMemberModal(true);
                        }}
                        className="btn btn-sm btn-secondary"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteMember(member.id)}
                        className="btn btn-sm btn-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    {memberSearch ? (
                      <div>
                        <p className="text-gray-500 mb-2">No members found matching "{memberSearch}"</p>
                        <button
                          onClick={() => {
                            setMemberSearchInput('');
                            setMemberSearch('');
                          }}
                          className="text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Clear search
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-500 mb-3">No members added yet</p>
                        <button
                          onClick={() => setShowMemberModal(true)}
                          className="btn btn-success"
                        >
                          Add your first member
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showEventModal && <EventModal />}
      {showMemberModal && <MemberModal />}
    </div>
  );
};

export default PickleballTracker;