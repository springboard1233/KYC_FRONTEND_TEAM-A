function ResultCard({ text }) {
  return (
    <div className="border rounded-lg shadow p-4 bg-gray-50">
      <pre className="whitespace-pre-wrap">{text}</pre>
    </div>
  );
}

export default ResultCard;
