import React, { useState } from 'react';
import { useCollections } from '../context/CollectionsContext';

const AddRequestModal = ({ isOpen, onClose, collectionId }) => {
  const { addToCollection } = useCollections();
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    method: 'GET',
    headers: '{"Content-Type": "application/json"}',
    body: ''
  });
  const [loading, setLoading] = useState(false);

  const methods = [
    { value: 'GET', color: 'bg-green-100 text-green-800' },
    { value: 'POST', color: 'bg-blue-100 text-blue-800' },
    { value: 'PUT', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'DELETE', color: 'bg-red-100 text-red-800' },
    { value: 'PATCH', color: 'bg-purple-100 text-purple-800' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await addToCollection(collectionId, {
        name: formData.name,
        url: formData.url,
        method: formData.method,
        headers: formData.headers ? JSON.parse(formData.headers) : {},
        body: formData.body ? JSON.parse(formData.body) : null
      });
      
      // Reset form
      setFormData({
        name: '',
        url: '',
        method: 'GET',
        headers: '{"Content-Type": "application/json"}',
        body: ''
      });
      
      onClose();
      alert('Request added to collection successfully!');
    } catch (error) {
      console.error('Error adding request:', error);
      alert('Error adding request to collection. Please check your JSON format.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Request</h2>
          <p className="text-sm text-gray-500 mt-1">Manually add API request to collection</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Request Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Get User Details, Create New Post"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>

          {/* Method and URL */}
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Method *
              </label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({...formData, method: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {methods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.value}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                placeholder="https://api.example.com/users"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Headers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Headers
            </label>
            <textarea
              value={formData.headers}
              onChange={(e) => setFormData({...formData, headers: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none transition-colors"
              placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
            />
            <p className="text-xs text-gray-500 mt-2">Enter headers as valid JSON</p>
          </div>

          {/* Body */}
          {formData.method !== 'GET' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Body
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({...formData, body: e.target.value})}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none transition-colors"
                placeholder='{"key": "value", "name": "John"}'
              />
              <p className="text-xs text-gray-500 mt-2">Enter request body as valid JSON (for POST, PUT, PATCH requests)</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRequestModal;