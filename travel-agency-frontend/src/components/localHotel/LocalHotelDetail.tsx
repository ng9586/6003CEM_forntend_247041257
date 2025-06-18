import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import StarRating from '../../components/StarRating';

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

  // 預約相關
  const [checkInDate, setCheckInDate] = useState('');
  const [stayDays, setStayDays] = useState(1);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  // 留言相關
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // 取得登入用戶 userId (假設存在 localStorage)
  const currentUserId = localStorage.getItem('userId') || '';

  // 取得酒店資料
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

  // 取得評論列表
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

  // 預約
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

  // 新增留言
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

  // 刪除留言
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

  if (loading) return <p style={styles.loading}>載入中...</p>;
  if (error) return <p style={styles.error}>{error}</p>;
  if (!hotel) return <p style={styles.error}>找不到酒店資料</p>;

  // 圖片陣列處理
  const imageUrls =
    hotel.images && hotel.images.length > 0
      ? hotel.images.map((img) => `${IMAGE_BASE}/uploads/${img}?t=${Date.now()}`)
      : hotel.imageFilename
      ? [`${IMAGE_BASE}/uploads/${hotel.imageFilename}?t=${Date.now()}`]
      : [];

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={() => navigate(-1)}>
        ← 返回
      </button>

      <h2 style={styles.title}>{hotel.name}</h2>
      <p style={styles.text}>
        <strong>地點：</strong>
        {hotel.location}
      </p>
      <p style={styles.text}>
        <strong>價格：</strong>${hotel.price}
      </p>
      {hotel.description && (
        <p style={styles.text}>
          <strong>描述：</strong>
          {hotel.description}
        </p>
      )}

      {imageUrls.length > 0 && (
        <div style={styles.imageContainer}>
          {imageUrls.map((url, idx) => (
            <img key={idx} src={url} alt={`圖片${idx + 1}`} style={styles.image} loading="lazy" />
          ))}
        </div>
      )}

      {/* 預約區 */}
      <section style={styles.bookingSection}>
        <h3>預約入住</h3>
        <label>
          入住日期：
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            style={styles.input}
          />
        </label>
        <label>
          入住天數：
          <input
            type="number"
            min={1}
            value={stayDays}
            onChange={(e) => setStayDays(Number(e.target.value))}
            style={styles.input}
          />
        </label>
        <button onClick={handleBooking} style={styles.button}>
          預約
        </button>
        {bookingMessage && <p style={styles.message}>{bookingMessage}</p>}
      </section>

      {/* 留言區 */}
      <section style={styles.reviewSection}>
        <h3>留言評論</h3>

        {/* 新增留言 */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="寫下你的評論..."
          rows={4}
          style={styles.textarea}
          disabled={reviewLoading}
        />
        <label style={{ marginTop: 8 }}>
          評分：
          <StarRating rating={rating} onChange={setRating} size={28} />
        </label>
        <button onClick={handleSubmitReview} disabled={reviewLoading} style={styles.button}>
          {reviewLoading ? '送出中...' : '送出留言'}
        </button>
        {reviewMessage && (
          <p style={{ ...styles.message, color: reviewMessage.includes('成功') ? 'green' : 'red' }}>
            {reviewMessage}
          </p>
        )}

        {/* 留言列表 */}
        <div style={{ marginTop: 24 }}>
          {reviewsLoading && <p>載入評論中...</p>}
          {reviewsError && <p style={{ color: 'red' }}>{reviewsError}</p>}
          {!reviewsLoading && reviews.length === 0 && <p>尚無評論</p>}

          {reviews.map((r) => (
            <div key={r._id} style={styles.reviewItem}>
              <p style={styles.reviewHeader}>
                <strong>{r.userId?.username || '匿名'}</strong> -{' '}
                {new Date(r.createdAt).toLocaleDateString()}
                {r.userId?._id === currentUserId && (
                  <button
                    style={styles.deleteButton}
                    onClick={() => handleDeleteReview(r._id)}
                    title="刪除留言"
                  >
                    刪除
                  </button>
                )}
              </p>
              <StarRating rating={r.rating} readOnly size={20} />
              <p style={styles.reviewComment}>{r.comment}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 900,
    margin: '0 auto',
    padding: 24,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  backButton: {
    marginBottom: 20,
    padding: '6px 12px',
    borderRadius: 4,
    border: '1px solid #ccc',
    backgroundColor: '#f0f0f0',
    cursor: 'pointer',
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 6,
  },
  imageContainer: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 16,
  },
  image: {
    width: 240,
    height: 160,
    objectFit: 'cover',
    borderRadius: 8,
  },
  bookingSection: {
    marginTop: 32,
    padding: 16,
    border: '1px solid #ccc',
    borderRadius: 8,
    maxWidth: 320,
  },
  input: {
    display: 'block',
    width: '100%',
    marginTop: 6,
    marginBottom: 12,
    padding: 6,
    fontSize: 16,
    borderRadius: 4,
    border: '1px solid #ccc',
  },
  button: {
    width: '100%',
    padding: '10px 0',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: 6,
    color: 'white',
    fontSize: 16,
    cursor: 'pointer',
  },
  message: {
    marginTop: 12,
    fontSize: 14,
  },
  reviewSection: {
    marginTop: 40,
    maxWidth: 600,
  },
  textarea: {
    width: '100%',
    padding: 8,
    fontSize: 16,
    borderRadius: 6,
    border: '1px solid #ccc',
    resize: 'vertical',
  },
  reviewItem: {
    borderTop: '1px solid #ddd',
    paddingTop: 12,
    marginTop: 12,
  },
  reviewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deleteButton: {
    marginLeft: 12,
    backgroundColor: 'transparent',
    border: 'none',
    color: 'red',
    cursor: 'pointer',
    fontSize: 14,
  },
  reviewComment: {
    marginTop: 6,
    fontSize: 15,
  },
  loading: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 18,
  },
  error: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 18,
    color: 'red',
  },
};

export default LocalHotelDetail;
