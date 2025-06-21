import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from 'react-bootstrap';
import StarRating from '../components/StarRating';

interface HotelImage {
  path: string;
}

interface HotelDetailData {
  name: { content: string };
  description?: { content: string };
  address?: { content: string };
  images?: HotelImage[];
  category?: { name: string };
  zone?: { name: string };
}

interface Review {
  _id: string;
  userId: { _id: string; username: string };
  comment: string;
  rating: number;
  createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const HotelDetail: React.FC = () => {
  const { hotelCode } = useParams<{ hotelCode: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId') || '';

  const [hotel, setHotel] = useState<HotelDetailData | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [checkInDate, setCheckInDate] = useState('');
  const [stayDays, setStayDays] = useState(1);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (!hotelCode) return;

    setLoading(true);
    const detailRequest = axios.get(`${API_BASE}/hotels/hotel-details?hotelId=${hotelCode}`);
    const priceRequest = axios.get(`${API_BASE}/hotels/price?hotelId=${hotelCode}`);

    Promise.all([detailRequest, priceRequest])
      .then(([detailRes, priceRes]) => {
        setHotel(detailRes.data.hotel || null);
        setMinPrice(priceRes.data.minPrice ?? null);
      })
      .catch(() => {
        setHotel(null);
        setMinPrice(null);
      })
      .finally(() => setLoading(false));
  }, [hotelCode]);

  const fetchReviews = () => {
    if (!hotelCode) return;
    setReviewsLoading(true);
    axios
      .get(`${API_BASE}/reviews/externalHotels/${hotelCode}`)
      .then((res) => setReviews(res.data))
      .catch(() => setReviewsError('載入評論失敗'))
      .finally(() => setReviewsLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [hotelCode]);

  const handleBooking = async () => {
    if (!token) {
      setBookingMessage('請先登入才能預約');
      return;
    }
    if (!checkInDate) {
      setBookingMessage('請選擇入住日期');
      return;
    }
    if (stayDays <= 0) {
      setBookingMessage('入住天數必須大於 0');
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/bookings`,
        {
          hotelId: hotelCode,
          hotelSource: 'external',
          checkInDate,
          stayDays,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookingMessage('預約成功！即將跳轉...');
      setTimeout(() => navigate('/'), 2000);
    } catch (error: any) {
      const msg = error.response?.data?.message || '預約失敗，請稍後再試';
      setBookingMessage(msg);
    }
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
    if (!token) {
      setReviewMessage('請先登入才能留言');
      return;
    }

    setReviewLoading(true);
    axios
      .post(
        `${API_BASE}/reviews`,
        {
          hotelId: hotelCode,
          hotelSource: 'external',
          comment,
          rating,
        },
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
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-2">載入中...</p>
      </Container>
    );

  if (!hotel)
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">找不到酒店資料</Alert>
      </Container>
    );

  return (
    <Container className="my-5">
      <Button variant="secondary" onClick={() => navigate(-1)} className="mb-3">
        ← return
      </Button>

      <h2 className="mb-2 fw-bold text-primary">{hotel.name.content}</h2>
      {minPrice !== null && <p className="text-info fw-semibold">最低價: ${minPrice}</p>}
      {hotel.description?.content && <p>{hotel.description.content}</p>}
      {hotel.address?.content && <p><strong>地址：</strong>{hotel.address.content}</p>}
      {hotel.category?.name && <p><strong>分類：</strong>{hotel.category.name}</p>}
      {hotel.zone?.name && <p><strong>地區：</strong>{hotel.zone.name}</p>}

      {/* ===== 橫向滾動圖片區 ===== */}
      {hotel.images && hotel.images.length > 0 && (
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            gap: 16,
            paddingBottom: 8,
            scrollbarWidth: 'thin',
          }}
          className="my-4"
        >
          {hotel.images.map((img, idx) => (
            <div key={idx} style={{ flex: '0 0 auto', width: 320 }}>
              <img
                src={img.path}
                alt={`圖片${idx + 1}`}
                style={{
                  width: '100%',
                  height: 220,
                  objectFit: 'cover',
                  borderRadius: 10,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* 預約區 */}
      <Card className="mb-4" style={{ maxWidth: 500 }}>
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

      {/* 評論區 */}
      <Card style={{ maxWidth: 700 }}>
        <Card.Body>
          <Card.Title>留言評論</Card.Title>
          <Form.Group className="mb-3">
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

export default HotelDetail;
