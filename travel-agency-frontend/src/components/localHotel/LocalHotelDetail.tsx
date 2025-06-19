import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import StarRating from '../../components/StarRating';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE_URL || API_BASE;

interface Hotel {
  _id: string;
  name: string;
  location: string;
  price: number;
  description?: string;
  images?: string[];
  imageFilename?: string;
}

interface Review {
  _id: string;
  userId: { _id: string; username: string };
  comment: string;
  rating: number;
  createdAt: string;
}

const LocalHotelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking
  const [checkInDate, setCheckInDate] = useState('');
  const [stayDays, setStayDays] = useState(1);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const currentUserId = localStorage.getItem('userId') || '';

  useEffect(() => {
    if (!id) {
      setError('找不到酒店ID');
      setLoading(false);
      return;
    }
    setLoading(true);
    axios
      .get(`${API_BASE}/localHotels/${id}`)
      .then((res) => {
        setHotel(res.data);
        setError(null);
      })
      .catch(() => setError('載入酒店資料失敗'))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchReviews = () => {
    if (!id) return;
    setReviewsLoading(true);
    setReviewsError(null);
    axios
      .get(`${API_BASE}/reviews/localHotels/${id}`)
      .then((res) => setReviews(res.data))
      .catch(() => setReviewsError('載入評論失敗'))
      .finally(() => setReviewsLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  const handleBooking = () => {
    if (!hotel) return;
    if (!checkInDate) {
      setBookingMessage('請選擇入住日期');
      return;
    }
    if (stayDays < 1) {
      setBookingMessage('入住天數必須大於 0');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setBookingMessage('請先登入才能預約');
      return;
    }

    axios
      .post(
        `${API_BASE}/bookings`,
        {
          hotelId: hotel._id,
          hotelSource: 'local',
          checkInDate,
          stayDays,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setBookingMessage('預約成功！');
        setTimeout(() => navigate('/'), 2000);
      })
      .catch(() => setBookingMessage('預約失敗，請稍後再試'));
  };

  const handleSubmitReview = () => {
    if (!comment.trim()) {
      setReviewMessage('請輸入留言內容');
      return;
    }
    if (rating < 1 || rating > 5) {
      setReviewMessage('評分必須介乎 1 至 5');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setReviewMessage('請先登入才能留言');
      return;
    }

    setReviewLoading(true);
    setReviewMessage(null);

    axios
      .post(
        `${API_BASE}/reviews`,
        { hotelId: hotel?._id, comment, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setReviewMessage('留言成功！謝謝你的評論');
        setComment('');
        setRating(5);
        fetchReviews();
      })
      .catch((err) => {
        setReviewMessage(err.response?.data?.message || '留言失敗，請稍後再試');
      })
      .finally(() => setReviewLoading(false));
  };

  const handleDeleteReview = async (reviewId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('請先登入才能刪除留言');
      return;
    }
    if (!window.confirm('確定要刪除這則留言嗎？')) return;

    try {
      await axios.delete(`${API_BASE}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReviews();
    } catch (err: any) {
      alert(err.response?.data?.message || '刪除失敗，請稍後再試');
    }
  };

  if (loading)
    return (
      <Container className="text-center my-5">
        <p>載入中...</p>
      </Container>
    );

  if (error)
    return (
      <Container className="text-center my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );

  if (!hotel)
    return (
      <Container className="text-center my-5">
        <Alert variant="danger">找不到酒店資料</Alert>
      </Container>
    );

  const imageUrls =
    hotel.images && hotel.images.length > 0
      ? hotel.images.map((img) => `${IMAGE_BASE}/uploads/${img}?t=${Date.now()}`)
      : hotel.imageFilename
      ? [`${IMAGE_BASE}/uploads/${hotel.imageFilename}?t=${Date.now()}`]
      : [];

  return (
    <Container className="my-4">
      <Button variant="secondary" onClick={() => navigate(-1)} className="mb-3">
        ← 返回
      </Button>

      <h2 className="mb-3">{hotel.name}</h2>
      <p>
        <strong>地點：</strong> {hotel.location}
      </p>
      <p>
        <strong>價格：</strong> ${hotel.price}
      </p>
      {hotel.description && (
        <p>
          <strong>描述：</strong> {hotel.description}
        </p>
      )}

      {imageUrls.length > 0 && (
        <Row className="mb-4">
          {imageUrls.map((url, idx) => (
            <Col xs={12} md={6} lg={4} key={idx} className="mb-3">
              <Card>
                <Card.Img variant="top" src={url} alt={`圖片${idx + 1}`} loading="lazy" />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* 預約區 */}
      <Card className="mb-5" style={{ maxWidth: 400 }}>
        <Card.Body>
          <Card.Title>預約入住</Card.Title>
          <Form.Group className="mb-3" controlId="checkInDate">
            <Form.Label>入住日期</Form.Label>
            <Form.Control
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="stayDays">
            <Form.Label>入住天數</Form.Label>
            <Form.Control
              type="number"
              min={1}
              value={stayDays}
              onChange={(e) => setStayDays(Number(e.target.value))}
            />
          </Form.Group>
          <Button variant="primary" onClick={handleBooking} className="w-100">
            預約
          </Button>
          {bookingMessage && (
            <Alert
              variant={bookingMessage.includes('成功') ? 'success' : 'danger'}
              className="mt-3"
            >
              {bookingMessage}
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* 留言區 */}
      <Card style={{ maxWidth: 700 }}>
        <Card.Body>
          <Card.Title>留言評論</Card.Title>
          <Form.Group className="mb-3" controlId="comment">
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="寫下你的評論..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={reviewLoading}
            />
          </Form.Group>
          <Form.Group className="mb-3 d-flex align-items-center">
            <Form.Label className="me-2 mb-0">評分：</Form.Label>
            <StarRating rating={rating} onChange={setRating} size={28} />
          </Form.Group>
          <Button
            variant="primary"
            onClick={handleSubmitReview}
            disabled={reviewLoading}
            className="mb-3"
          >
            {reviewLoading ? '送出中...' : '送出留言'}
          </Button>
          {reviewMessage && (
            <Alert
              variant={reviewMessage.includes('成功') ? 'success' : 'danger'}
              className="mb-3"
            >
              {reviewMessage}
            </Alert>
          )}

          {/* 留言列表 */}
          {reviewsLoading && <p>載入評論中...</p>}
          {reviewsError && <Alert variant="danger">{reviewsError}</Alert>}
          {!reviewsLoading && reviews.length === 0 && <p>尚無評論</p>}

          {reviews.map((r) => (
            <Card key={r._id} className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{r.userId?.username || '匿名'}</strong> -{' '}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                  {r.userId?._id === currentUserId && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteReview(r._id)}
                      title="刪除留言"
                    >
                      刪除
                    </Button>
                  )}
                </div>
                <StarRating rating={r.rating} readOnly size={20} />
                <Card.Text className="mt-2">{r.comment}</Card.Text>
              </Card.Body>
            </Card>
          ))}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LocalHotelDetail;
