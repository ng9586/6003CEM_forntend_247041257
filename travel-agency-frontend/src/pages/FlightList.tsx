import React, { useEffect, useState } from 'react';
import { Table, Button, Spinner, Alert, Container } from 'react-bootstrap';

interface Flight {
  flight_date: string;
  flight_status: string;
  flight_number: string;
  airline_name: string;
  departure_airport: string;
  departure_iata: string;
  departure_scheduled: string;
  arrival_airport: string;
  arrival_iata: string;
  arrival_scheduled: string;
}

const FlightList: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:3000/api/flights?limit=5');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // 模擬更新效果：每次刷新多加一筆假數據（示範）
      const updatedFlights = [...data.flights];
      if (updatedFlights.length > 0) {
        const lastFlight = updatedFlights[updatedFlights.length - 1];
        // 複製一筆並改個航班號示範
        const newFlight = {
          ...lastFlight,
          flight_number: lastFlight.flight_number + '_NEW',
          flight_date: new Date().toISOString().split('T')[0], // 今日日期
          flight_status: 'scheduled',
        };
        updatedFlights.push(newFlight);
      }

      setFlights(updatedFlights);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  return (
    <Container className="my-4">
      <h2>Flight List</h2>
      <Button variant="primary" onClick={fetchFlights} disabled={loading} className="mb-3">
        {loading ? (
          <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> 讀取中...
          </>
        ) : (
          '刷新航班資料'
        )}
      </Button>

      {error && <Alert variant="danger">錯誤: {error}</Alert>}

      {!loading && flights.length === 0 && <p>無航班資料</p>}

      {flights.length > 0 && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>日期</th>
              <th>狀態</th>
              <th>航班號</th>
              <th>航空公司</th>
              <th>出發機場</th>
              <th>出發時間</th>
              <th>到達機場</th>
              <th>到達時間</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((flight) => (
              <tr key={`${flight.flight_number}-${flight.flight_date}`}>
                <td>{flight.flight_date}</td>
                <td style={{ textTransform: 'capitalize' }}>{flight.flight_status}</td>
                <td>{flight.flight_number}</td>
                <td>{flight.airline_name}</td>
                <td>
                  {flight.departure_airport} ({flight.departure_iata})
                </td>
                <td>{new Date(flight.departure_scheduled).toLocaleString()}</td>
                <td>
                  {flight.arrival_airport} ({flight.arrival_iata})
                </td>
                <td>{new Date(flight.arrival_scheduled).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default FlightList;
