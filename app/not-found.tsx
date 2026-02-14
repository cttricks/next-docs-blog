export default function NotFound() {
  return (
    <div className="error-page">
      <h1>404</h1>
      <h2>Article Not Found</h2>
      <p>Sorry, we couldn't find the article you're looking for.</p>
      <a href="/" className="button">Back to Home</a>
    </div>
  )
}
