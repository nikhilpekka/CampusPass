import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="content-max empty-state">
      <h1 style={{ marginBottom: 12 }}>Page not found</h1>
      <p style={{ marginBottom: 20 }}>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Back home</Link>
    </div>
  );
}
