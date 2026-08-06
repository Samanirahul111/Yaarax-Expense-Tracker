import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MenuToggle from '../components/MenuToggle';
import AIAssistant from '../components/AIAssistant';

export default function AppLayout() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)' }}>
      <Navbar />
      <div className="app-content">
        <Outlet />
      </div>
      <MenuToggle />
      <AIAssistant />
    </div>
  );
}
