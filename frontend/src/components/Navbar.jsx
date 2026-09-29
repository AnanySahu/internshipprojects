import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <div className="brand-icon">
            <Users size={20} />
          </div>
          <span>ContactManager Pro</span>
        </div>

        {isAuthenticated && user ? (
          <div className="nav-user">
            <div className="user-badge">
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
              </div>
              <span>{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="btn btn-secondary"
              title="Log out of your account"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  );
};

export default Navbar;
