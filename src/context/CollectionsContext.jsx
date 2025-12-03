import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

const CollectionsContext = createContext();

export const useCollections = () => {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error('useCollections must be used within CollectionsProvider');
  }
  return context;
};

export const CollectionsProvider = ({ children }) => {
  const [collections, setCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load collections when user logs in
  useEffect(() => {
    if (user) {
      loadCollections();
    } else {
      setCollections([]);
      setActiveCollection(null);
    }
  }, [user]);

  const loadCollections = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await apiService.getCollections();
      console.log('Collections API Response:', response); // Debug log
      
      // Ensure items array exists for each collection
      const collectionsWithItems = (response.data || []).map(collection => ({
        ...collection,
        items: collection.collection_items || [] // Handle both field names
      }));
      
      setCollections(collectionsWithItems);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async (collectionData) => {
    if (!user) throw new Error('Please login to create collections');
    
    try {
      const response = await apiService.createCollection(collectionData);
      const newCollection = {
        ...response.data,
        items: [] // Initialize empty items array
      };
      setCollections(prev => [...prev, newCollection]);
      return newCollection;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  };

  const deleteCollection = async (collectionId) => {
    try {
      await apiService.deleteCollection(collectionId);
      setCollections(prev => prev.filter(collection => collection.id !== collectionId));
      if (activeCollection?.id === collectionId) {
        setActiveCollection(null);
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }
  };

  // In addToCollection function, add better error handling:
const addToCollection = async (collectionId, requestData) => {
  try {
    // Validate JSON before sending
    if (requestData.headers && typeof requestData.headers === 'string') {
      try {
        requestData.headers = JSON.parse(requestData.headers);
      } catch (error) {
        throw new Error('Invalid JSON in headers');
      }
    }

    if (requestData.body && typeof requestData.body === 'string') {
      try {
        requestData.body = JSON.parse(requestData.body);
      } catch (error) {
        throw new Error('Invalid JSON in body');
      }
    }

    const response = await apiService.addToCollection({
      collection_id: collectionId,
      ...requestData
    });
    
    const newItem = response.data;
    
    // Update local state
    setCollections(prev => 
      prev.map(collection => 
        collection.id === collectionId 
          ? {
              ...collection,
              items: [...(collection.items || []), newItem]
            }
          : collection
      )
    );

    // Update active collection if it's the same
    if (activeCollection?.id === collectionId) {
      setActiveCollection(prev => ({
        ...prev,
        items: [...(prev.items || []), newItem]
      }));
    }

    return newItem;
  } catch (error) {
    console.error('Error adding to collection:', error);
    throw error;
  }
};

  const removeFromCollection = async (collectionId, itemId) => {
    try {
      await apiService.deleteCollectionItem(itemId);
      
      setCollections(prev =>
        prev.map(collection =>
          collection.id === collectionId
            ? {
                ...collection,
                items: (collection.items || []).filter(item => item.id !== itemId)
              }
            : collection
        )
      );

      // Update active collection if it's the same
      if (activeCollection?.id === collectionId) {
        setActiveCollection(prev => ({
          ...prev,
          items: (prev.items || []).filter(item => item.id !== itemId)
        }));
      }
    } catch (error) {
      console.error('Error removing from collection:', error);
      throw error;
    }
  };

  const updateCollection = async (collectionId, updateData) => {
    try {
      const response = await apiService.updateCollection(collectionId, updateData);
      const updatedCollection = response.data;
      
      setCollections(prev =>
        prev.map(collection =>
          collection.id === collectionId
            ? { ...collection, ...updatedCollection }
            : collection
        )
      );

      if (activeCollection?.id === collectionId) {
        setActiveCollection(updatedCollection);
      }

      return updatedCollection;
    } catch (error) {
      console.error('Error updating collection:', error);
      throw error;
    }
  };

  const value = {
    collections,
    activeCollection,
    setActiveCollection,
    createCollection,
    deleteCollection,
    addToCollection,
    removeFromCollection,
    updateCollection,
    loading,
    refreshCollections: loadCollections
  };

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
};