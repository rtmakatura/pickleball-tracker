import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Users, DollarSign, MapPin, Clock, Trophy, Target, Edit3, Trash2, Check, X, AlertCircle } from 'lucide-react';

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

  // Load sample data on initial render
  useEffect(() => {
    const sampleMembers = [
      { id: 1, name: 'John Smith', email: 'john@email.com', phone: '555-0101', skillLevel: '3.5', venmo: '@johnsmith' },
      { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', phone: '555-0102', skillLevel: '4.0', venmo: '@sarahj' },
      { id: 3, name: 'Mike Davis', email: 'mike@email.com', phone: '555-0103', skillLevel: '3.0', venmo: '@miked' },
      { id: 4, name: 'Lisa Wilson', email: 'lisa@email.com', phone: '555-0104', skillLevel: '4.5', venmo: '@lisaw' }
    ];
    
    const sampleTournaments = [
      {
        id: 1,
        name: 'Spring Championship',
        type: 'tournament',
        location: 'Central Park Courts',
        date: '2025-06-15',
        time: '9:00 AM',
        division: '4.0',
        fee: 50,
        status: 'registered',
        paymentMethod: 'group',
        paymentCoordinator: 1,
        teamMembers: [
          { memberId: 1, role: 'Player 1', status: 'confirmed', amountOwed: 50, paymentStatus: 'paid_coordinator', paidDate: '2025-05-20' },
          { memberId: 2, role: 'Player 2', status: 'confirmed', amountOwed: 50, paymentStatus: 'pending', paidDate: null }
        ]
      }
    ];

    const sampleLeagues = [
      {
        id: 1,
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
        teamMembers: [
          { memberId: 1, role: 'Regular', status: 'confirmed', amountOwed: 120, paymentStatus: 'paid_direct', paidDate: '2025-05-15' },
          { memberId: 3, role: 'Regular', status: 'confirmed', amountOwed: 120, paymentStatus: 'pending', paidDate: null }
        ]
      }
    ];

    setMembers(sampleMembers);
    setTournaments(sampleTournaments);
    setLeagues(sampleLeagues);
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
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'registered':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'interested':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  // Event management functions
  const addEvent = (eventData) => {
    const newEvent = {
      ...eventData,
      id: Date.now(),
      teamMembers: eventData.teamMembers || []
    };

    if (eventData.type === 'tournament') {
      setTournaments([...tournaments, newEvent]);
    } else {
      setLeagues([...leagues, newEvent]);
    }
  };

  const updateEvent = (eventData) => {
    if (eventData.type === 'tournament') {
      setTournaments(tournaments.map(t => t.id === eventData.id ? eventData : t));
    } else {
      setLeagues(leagues.map(l => l.id === eventData.id ? eventData : l));
    }
  };

  const deleteEvent = (id, type) => {
    if (type === 'tournament') {
      setTournaments(tournaments.filter(t => t.id !== id));
    } else {
      setLeagues(leagues.filter(l => l.id !== id));
    }
  };

  // Member management functions
  const addMember = (memberData) => {
    const newMember = {
      ...memberData,
      id: Date.now()
    };
    setMembers([...members, newMember]);
  };

  const updateMember = (memberData) => {
    setMembers(members.map(m => m.id === memberData.id ? memberData : m));
  };

  const deleteMember = (id) => {
    setMembers(members.filter(m => m.id !== id));
  };

  // Dashboard Component
  const Dashboard = () => {
    const upcomingEvents = [...tournaments, ...leagues]
      .filter(event => new Date(event.date || event.startDate) >= new Date())
      .sort((a, b) => new Date(a.date || a.startDate) - new Date(b.date || b.startDate))
      .slice(0, 5);

    const pendingPayments = [...tournaments, ...leagues]
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

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Events</p>
                <p className="text-2xl font-bold text-gray-900">{tournaments.length + leagues.length}</p>
              </div>
              <Trophy className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{members.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">{pendingPayments.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{event.name}</p>
                    <p className="text-sm text-gray-600">
                      {event.type === 'tournament' ? event.date : `${event.startDate} - ${event.endDate}`}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">No upcoming events</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Payments</h3>
            <div className="space-y-3">
              {pendingPayments.length > 0 ? pendingPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{payment.memberName}</p>
                    <p className="text-sm text-gray-600">{payment.eventName}</p>
                  </div>
                  <span className="text-red-600 font-medium">${payment.amount}</span>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">No pending payments</p>
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
      name: '',
      type: eventType,
      location: '',
      date: '',
      startDate: '',
      endDate: '',
      time: '',
      dayOfWeek: '',
      division: '',
      fee: '',
      status: 'interested',
      paymentMethod: 'direct',
      paymentCoordinator: '',
      teamMembers: []
    });

    useEffect(() => {
      if (editingEvent) {
        setFormData(editingEvent);
      } else {
        setFormData({
          name: '',
          type: eventType,
          location: '',
          date: '',
          startDate: '',
          endDate: '',
          time: '',
          dayOfWeek: '',
          division: '',
          fee: '',
          status: 'interested',
          paymentMethod: 'direct',
          paymentCoordinator: '',
          teamMembers: []
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
          memberId: '',
          role: 'Player',
          status: 'confirmed',
          amountOwed: formData.fee || 0,
          paymentStatus: 'pending',
          paidDate: null
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingEvent ? 'Edit' : 'Add'} {eventType === 'tournament' ? 'Tournament' : 'League'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {eventType === 'tournament' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Day</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                <input
                  type="text"
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  placeholder="e.g., 3.5, 4.0"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee ($)</label>
                <input
                  type="number"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="interested">Interested</option>
                  <option value="registered">Registered</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="direct">Direct Payment</option>
                  <option value="group">Group Payment</option>
                </select>
              </div>
              
              {formData.paymentMethod === 'group' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Coordinator</label>
                  <select
                    value={formData.paymentCoordinator}
                    onChange={(e) => setFormData({ ...formData, paymentCoordinator: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Member</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Team Members</label>
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 inline mr-1" />
                  Add Member
                </button>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {formData.teamMembers.map((member, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <select
                      value={member.memberId}
                      onChange={(e) => updateTeamMember(index, 'memberId', parseInt(e.target.value))}
                      className="flex-1 p-1 border border-gray-300 rounded text-sm"
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
                      className="w-20 p-1 border border-gray-300 rounded text-sm"
                    />
                    
                    <select
                      value={member.paymentStatus}
                      onChange={(e) => updateTeamMember(index, 'paymentStatus', e.target.value)}
                      className="w-32 p-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid_direct">Paid Direct</option>
                      <option value="paid_coordinator">Paid Coordinator</option>
                      <option value="overdue">Overdue</option>
                    </select>
                    
                    <button
                      type="button"
                      onClick={() => removeTeamMember(index)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowEventModal(false);
                  setEditingEvent(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingEvent ? 'Update' : 'Add'} {eventType === 'tournament' ? 'Tournament' : 'League'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Member Modal Component
  const MemberModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      skillLevel: '',
      venmo: ''
    });

    useEffect(() => {
      if (editingMember) {
        setFormData(editingMember);
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          skillLevel: '',
          venmo: ''
        });
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingMember ? 'Edit' : 'Add'} Member
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
              <input
                type="text"
                value={formData.skillLevel}
                onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                placeholder="e.g., 3.5, 4.0"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venmo Username</label>
              <input
                type="text"
                value={formData.venmo}
                onChange={(e) => setFormData({ ...formData, venmo: e.target.value })}
                placeholder="@username"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowMemberModal(false);
                  setEditingMember(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingMember ? 'Update' : 'Add'} Member
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Event List Component
  const EventList = ({ events, type, onEdit, onDelete }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 capitalize">{type}s</h3>
          <button
            onClick={() => {
              setEventType(type);
              setShowEventModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add {type}
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {events.length > 0 ? events.map(event => (
          <div key={event.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-medium text-gray-900">{event.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {type === 'tournament' ? event.date : `${event.startDate} - ${event.endDate}`}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {event.time}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    Division: {event.division}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Fee: ${event.fee}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {event.teamMembers.length} members
                  </div>
                </div>
                
                {event.teamMembers.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Team Members</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {event.teamMembers.map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium text-gray-900">{getMemberName(member.memberId)}</span>
                            <span className="text-gray-500 ml-2">({member.role})</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(member.paymentStatus)}`}>
                            {member.paymentStatus.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => {
                    setEditingEvent(event);
                    setEventType(type);
                    setShowEventModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(event.id, type)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No {type}s added yet</p>
            <button
              onClick={() => {
                setEventType(type);
                setShowEventModal(true);
              }}
              className="mt-2 text-blue-600 hover:text-blue-700"
            >
              Add your first {type}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Pickleball Tracker</h1>
            </div>
            <button
              onClick={() => setShowMemberModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Member
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Trophy },
              { id: 'tournaments', label: 'Tournaments', icon: Calendar },
              { id: 'leagues', label: 'Leagues', icon: Users },
              { id: 'members', label: 'Members', icon: Users }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        
        {activeTab === 'members' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Members</h3>
                <button
                  onClick={() => setShowMemberModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Member
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {members.length > 0 ? members.map(member => (
                <div key={member.id} className="p-6 flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{member.name}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Email: {member.email}</p>
                      <p>Phone: {member.phone}</p>
                      <p>Skill Level: {member.skillLevel}</p>
                      <p>Venmo: {member.venmo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingMember(member);
                        setShowMemberModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteMember(member.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No members added yet</p>
                  <button
                    onClick={() => setShowMemberModal(true)}
                    className="mt-2 text-blue-600 hover:text-blue-700"
                  >
                    Add your first member
                  </button>
                </div>
              )}
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
