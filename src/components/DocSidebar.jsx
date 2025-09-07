import React from 'react';
import Logo from './Logo';

const DoctorSidebar = ({ currentPage, setCurrentPage, onLogout }) => {
  const navItems = ['Dashboard', 'Requests'];

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
  <Logo height={100} width={250} />
        <p className="sidebar-role">Doctor Portal</p>
        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item}>
                <button
                  className={currentPage === item ? 'active' : ''}
                  onClick={() => setCurrentPage(item)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="sidebar-bottom">
        <button className="btn-danger" onClick={onLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default DoctorSidebar;
