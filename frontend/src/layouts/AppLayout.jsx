import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MenuToggle from '../components/MenuToggle';

export default function AppLayout() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-muted, #f8fafc)' }}>
      <Navbar />
      <div className="app-content">
        <Outlet />
      </div>
      <MenuToggle />
    </div>
  );
}
