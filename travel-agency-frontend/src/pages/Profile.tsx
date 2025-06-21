import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import StarRating from '../components/StarRating';
import { Container, Card, Button, Form, Image, Spinner, Alert, Row, Col } from 'react-bootstrap';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Review {
  _id: string;
  comment: string;
  rating: number;
  createdAt: string;
  userId: { _id: string; username: string };
}

const Profile: React.FC = () => {
  const { profile, setProfile } = useUser();
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.avatarUrl) {
      setAvatarPreview(null);
    }
  }, [profile?.avatarUrl]);

  useEffect(() => {
    const fetchReviews = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setReviewsError('請先登入');
        return;
      }
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const res = await axios.get(`${API_BASE}/reviews/my-reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviews(res.data);
      } catch {
        setReviewsError('載入評論失敗');
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [profile]);

  if (!profile)
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">載入中...</p>
      </Container>
    );

  const handleUsernameUpdate = () => {
    const token = localStorage.getItem('token');
    axios
      .put(
        `${API_BASE}/users/me/name`,
        { username: newUsername },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => setProfile(res.data))
      .catch(() => alert('更新失敗'));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    } else {
      setAvatarPreview(null);
    }
  };

  const handleAvatarUpload = () => {
    if (!avatarFile) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    axios
      .put(`${API_BASE}/users/me/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        setProfile(res.data);
        setAvatarFile(null);
        setAvatarPreview(null);
      })
      .catch(() => alert('上傳失敗'));
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
      const res = await axios.get(`${API_BASE}/reviews/my-reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || '刪除失敗，請稍後再試');
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: 720, fontFamily: "'Lato', sans-serif" }}>
      <h2 className="mb-4 text-primary fw-bold">👤 Personal</h2>

      <Card className="p-4 shadow rounded-4 border-0">
        {/* 頭像區 */}
        <div
          className="text-center mb-4"
          style={{ cursor: 'pointer' }}
          onClick={() => fileInputRef.current?.click()}
          title="點擊更換頭像"
        >
          <Image
            src={
              avatarPreview ||
              (profile.avatarUrl ? `${API_BASE}${profile.avatarUrl}?t=${Date.now()}` : 'https://via.placeholder.com/120?text=Avatar')
            }
            roundedCircle
            width={120}
            height={120}
            alt="Avatar"
            style={{ objectFit: 'cover', border: '3px solid #d4af37', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
          />
        </div>
        <Form.Control type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} hidden />

        {/* 用戶名更新 */}
        <Form.Group className="mb-4" controlId="usernameUpdate">
          <Form.Label className="fw-semibold text-primary">用戶名</Form.Label>
          <Form.Control
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            style={{ borderColor: '#d4af37' }}
          />
          <Button
            variant="primary"
            className="mt-3 px-4 fw-semibold"
            style={{
              background: 'linear-gradient(45deg, #004080, #00264d)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,64,128,0.6)',
            }}
            onClick={handleUsernameUpdate}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#00264d')}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'linear-gradient(45deg, #004080, #00264d)')
            }
          >
            Update Username
          </Button>
        </Form.Group>

        {/* 頭像上傳 */}
        <Button
          variant="success"
          onClick={handleAvatarUpload}
          disabled={!avatarFile}
          className="mb-5 w-100 fw-semibold"
          style={{
            background: 'linear-gradient(45deg, #d4af37, #b68b00)',
            border: 'none',
            boxShadow: '0 4px 10px rgba(212,175,55,0.7)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#b68b00')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(45deg, #d4af37, #b68b00)')}
        >
          Upload avatar
        </Button>

        {/* 用戶評論區 */}
        <h3 className="mb-4 text-primary fw-bold">📝 Comments</h3>

        {reviewsLoading && (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">載入評論中...</p>
          </div>
        )}

        {reviewsError && <Alert variant="danger">{reviewsError}</Alert>}

        {!reviewsLoading && reviews.length === 0 && <p>尚無評論</p>}

        {reviews.map((r) => (
          <Card key={r._id} className="mb-3 shadow-sm border-0">
            <Card.Body>
              <Row className="align-items-center mb-2">
                <Col xs="auto" className="fw-bold text-secondary" style={{ fontSize: 16 }}>
                  {r.userId?.username || '匿名'}
                </Col>
                <Col xs="auto" className="text-muted" style={{ fontSize: 14 }}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </Col>
                <Col xs="auto" className="ms-auto">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteReview(r._id)}
                    title="刪除留言"
                  >
                    Delete
                  </Button>
                </Col>
              </Row>
              <StarRating rating={r.rating} readOnly size={22} />
              <Card.Text className="mt-2" style={{ fontSize: 15, color: '#333' }}>
                {r.comment}
              </Card.Text>
            </Card.Body>
          </Card>
        ))}
      </Card>
    </Container>
  );
};

export default Profile;
