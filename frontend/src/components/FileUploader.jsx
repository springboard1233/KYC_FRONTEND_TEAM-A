function FileUploader({ onUpload }) {
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onUpload(file);
  };

  return (
    <div className="border-2 border-dashed border-gray-400 p-6 rounded-lg">
      <input type="file" onChange={handleChange} />
    </div>
  );
}

export default FileUploader;
