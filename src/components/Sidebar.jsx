import React from 'react';
import Logo from './Logo';

const Sidebar = ({ currentPage, setCurrentPage, onLogout }) => {
  const navItems = ['Dashboard', 'Dockinator', 'Predict Diseases', 'Doc Appoint'];

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
  <Logo height={100} width={250} />
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

export default Sidebar;
