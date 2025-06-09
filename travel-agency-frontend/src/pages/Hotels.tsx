import React, { useState } from 'react';
import { Container, Form, Button, Alert, Spinner, ListGroup, Image } from 'react-bootstrap';
import api from '../services/hotelonlyapi';

interface Hotel {
  hotel_id: string;
  title: string;
  subTitle: string;
  imageUrl: string;
}

const Hotels: React.FC = () => {
  const [query, setQuery] = useState('');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (query.trim().length < 3) {
      setError('請輸入至少 3 個字');
      setHotels([]);
      return;
    }

    setLoading(true);
    setError(null);
    setHotels([]);

    try {
      const res = await api.get('/autocomplete', { params: { query, limit: 10 } });
      console.log('API Response:', res.data);

      let mappedHotels: Hotel[] = [];
      if (
        res.data &&
        res.data.data &&
        res.data.data.autoCompleteSuggestions &&
        Array.isArray(res.data.data.autoCompleteSuggestions.results)
      ) {
        mappedHotels = res.data.data.autoCompleteSuggestions.results.map((item: any) => ({
          hotel_id: item.destination.destId,
          title: item.displayInfo.title,
          subTitle: item.displayInfo.subTitle,
          imageUrl: item.displayInfo.absoluteImageUrl,
        }));
      } else {
        console.warn('API 回應格式唔正確');
      }

      setHotels(mappedHotels);

      if (mappedHotels.length === 0) {
        setError('無相關酒店');
      }
    } catch (err: any) {
      console.error(err);
      setError('搜尋酒店失敗，請稍後重試');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2>酒店搜尋</h2>

      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="輸入酒店名稱或地點"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
          disabled={loading}
        />
      </Form.Group>

      <Button onClick={handleSearch} disabled={loading}>
        {loading ? <Spinner animation="border" size="sm" /> : '搜尋'}
      </Button>

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      <ListGroup className="mt-3" style={{ maxHeight: 400, overflowY: 'auto' }}>
        {hotels.map(hotel => (
          <ListGroup.Item key={hotel.hotel_id} className="d-flex align-items-center">
            {hotel.imageUrl && (
              <Image
                src={hotel.imageUrl}
                alt={hotel.title}
                rounded
                style={{ width: 80, height: 80, objectFit: 'cover', marginRight: 15 }}
              />
            )}
            <div>
              <h5>{hotel.title}</h5>
              <p className="mb-0 text-muted">{hotel.subTitle}</p>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

export default Hotels;
