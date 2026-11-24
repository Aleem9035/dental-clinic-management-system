import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <header className="navbar">
        <span className="brand">🦷 Dental Clinic</span>
        <nav aria-label="Main navigation">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/doctors">Doctors</NavLink>
          <NavLink to="/appointments">Appointments</NavLink>
        </nav>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}