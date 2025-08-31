import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AccountDetails() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const getUsernameFromToken = (token) => {
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || '';
    } catch {
      return '';
    }
  };

  const username = getUsernameFromToken(token);

  // Editable fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [about, setAbout] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignOut = () => {
    logout();
    navigate('/auth');
  };

  const handleSave = () => {
    // Save logic here (e.g., API call or localStorage)
    setSuccessMessage('Your changes have been saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000); // Hide after 3 seconds
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Account Details</h1>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-md shadow-sm border border-green-300">
          {successMessage}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">Select</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">About Me</label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Tell us something about yourself..."
          />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-black text-white rounded hover:bg-black transition"
        >
          Save Changes
        </button>
        <button
          onClick={handleSignOut}
          className="px-6 py-2 bg-red-400 text-white rounded hover:bg-red-500 transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
