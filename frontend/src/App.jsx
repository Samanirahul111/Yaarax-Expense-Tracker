import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './home/Home';
import Auth from './user/Auth';
import Dashboard from './user/Dashboard';
import Onboarding from './user/Onboarding';
import AppLayout from './layouts/AppLayout';
import FinancialTools from './tools/FinancialTools';
import GstCalculator from './tools/GstCalculator';
import SipCalculator from './tools/SipCalculator';
import FdCalculator from './tools/FdCalculator';
import LoanAffordability from './tools/LoanAffordability';
import EmiCalculator from './tools/EmiCalculator';
import CompoundInterestCalculator from './tools/CompoundInterestCalculator';
import Logs from './user/Logs';
import Analytics from './user/Analytics';
import AdminDashboard from './admin/AdminDashboard';
import GroupsList from './user/GroupsList';
import GroupDashboard from './user/GroupDashboard';
import SavingsDashboard from './user/SavingsDashboard';
import SubscriptionsDashboard from './user/SubscriptionsDashboard';
import Footer from './components/Footer';
import AboutUs from './home/AboutUs';
import Feedback from './home/Feedback';

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* App routes with Bottom Navigation */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tools" element={<FinancialTools />} />
              <Route path="/tools/gst" element={<GstCalculator />} />
              <Route path="/tools/sip" element={<SipCalculator />} />
              <Route path="/tools/fd" element={<FdCalculator />} />
              <Route path="/tools/loan" element={<LoanAffordability />} />
              <Route path="/tools/emi" element={<EmiCalculator />} />
              <Route path="/tools/compound" element={<CompoundInterestCalculator />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/groups" element={<GroupsList />} />
              <Route path="/groups/:id" element={<GroupDashboard />} />
              <Route path="/savings" element={<SavingsDashboard />} />
              <Route path="/subscriptions" element={<SubscriptionsDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
