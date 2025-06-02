import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import api from '../services/api';

interface Hotel {
  _id: string;
  name: string;
  location: string;
  price: number;
  description: string;
}

const Hotels: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await api.get('/hotels');
        setHotels(response.data);
      } catch (err) {
        console.error('載入酒店資料失敗', err);
      }
    };

    fetchHotels();
  }, []);

  return (
    <Container className="mt-4">
      <h2 className="mb-4">酒店清單</h2>
      <Row>
        {hotels.map((hotel) => (
          <Col md={4} key={hotel._id} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{hotel.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{hotel.location}</Card.Subtitle>
                <Card.Text>{hotel.description}</Card.Text>
                <Card.Text><strong>HKD ${hotel.price}</strong></Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Hotels;
