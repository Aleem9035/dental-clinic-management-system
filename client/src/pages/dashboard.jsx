import { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';
import { formatDateTime, statusType } from '../utils/Format';
import Badge from '../components/Badge';
import PageState from '../components/PageState';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      setData(await getDashboard());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // the 4 summary cards
  const cards = data && [
    { label: 'Total doctors', value: data.total_doctors },
    { label: 'Upcoming appointments', value: data.upcoming_appointments },
    { label: "Today's appointments", value: data.todays_appointments },
    { label: 'Pending appointments', value: data.pending_appointments },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <PageState loading={loading} error={error} onRetry={loadDashboard}>
        {data && (
          <>
            <div className="stats">
              {cards.map((card) => (
                <div className="card" key={card.label}>
                  <div className="stat-value">{card.value}</div>
                  <div className="stat-label">{card.label}</div>
                </div>
              ))}
            </div>

            <h2>Upcoming appointments</h2>
            {data.upcoming.length === 0 ? (
              <div className="state-box">No upcoming appointments</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date and time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.upcoming.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.patient_name}</td>
                        <td>{appointment.doctor_name}</td>
                        <td>{formatDateTime(appointment.starts_at)}</td>
                        <td><Badge text={appointment.status} type={statusType[appointment.status]} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </PageState>
    </>
  );
}