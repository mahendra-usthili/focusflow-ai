import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';

export const useFirestore = (collectionName) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, collectionName),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const results = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        
        // Client-side sort to avoid Firebase composite index requirements
        results.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA; // Descending
        });

        setData(results);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, currentUser]);

  const addDocument = async (docData) => {
    if (!currentUser) return null;
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...docData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef;
    } catch (err) {
      console.error('Error adding document:', err);
      throw err;
    }
  };

  const updateDocument = async (id, docData) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...docData,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error updating document:', err);
      throw err;
    }
  };

  const deleteDocument = async (id) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      console.error('Error deleting document:', err);
      throw err;
    }
  };

  return { data, loading, error, addDocument, updateDocument, deleteDocument };
};
