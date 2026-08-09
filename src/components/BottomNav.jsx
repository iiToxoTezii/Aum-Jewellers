import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Landmark, User, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const { isAdmin } = useAuth();

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={20} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/collections" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Grid size={20} />
        <span>Catalog</span>
      </NavLink>
      <NavLink to="/sip" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Landmark size={20} />
        <span>SIP</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <User size={20} />
        <span>Profile</span>
      </NavLink>
      {isAdmin && (
        <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ShieldAlert size={20} />
          <span>Admin</span>
        </NavLink>
      )}
    </nav>
  );
};

export default BottomNav;
