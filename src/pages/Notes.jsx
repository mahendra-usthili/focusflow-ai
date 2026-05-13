import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Search, Trash2, Save, Clock, Loader2, Star, Pin, AlertCircle, Filter, Flag } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';

const Notes = () => {
  const { data: notes, loading, addDocument, updateDocument, deleteDocument } = useFirestore('notes');
  const [activeNote, setActiveNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  
  // Editor State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState(null);

  // Delete Confirmation
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Clean up timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [saveTimeout]);

  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content || '');
      setCategory(activeNote.category || 'personal');
    } else {
      setTitle('');
      setContent('');
      setCategory('personal');
    }
  }, [activeNote]);

  const filteredNotes = notes.filter(note => {
    // Category Filter
    if (categoryFilter !== 'all' && note.category !== categoryFilter) return false;
    
    // Starred/Pinned Filters
    if (showStarredOnly && !note.isStarred) return false;
    if (showPinnedOnly && !note.isPinned) return false;
    
    // Search Query
    const searchMatch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return searchMatch;
  }).sort((a, b) => {
    // 1. Pinned notes go to the top
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    
    // 2. Starred notes
    if (a.isStarred !== b.isStarred) return a.isStarred ? -1 : 1;
    
    // 3. Default: Most recently updated first
    const aTime = a.updatedAt?.seconds || 0;
    const bTime = b.updatedAt?.seconds || 0;
    return bTime - aTime;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  const handleCreateNew = async () => {
    try {
      const newNoteRef = await addDocument({
        title: 'Untitled Note',
        content: '',
        category: 'personal',
        isStarred: false,
        isPinned: false
      });
      if (newNoteRef?.id) {
        setActiveNote({ 
          id: newNoteRef.id, 
          title: 'Untitled Note', 
          content: '', 
          category: 'personal',
          isStarred: false,
          isPinned: false 
        });
      }
    } catch (err) {
      console.warn('Could not create note:', err.message);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const note = notes.find(n => n.id === id);
    setNoteToDelete(note);
    setIsDeleteModalOpen(true);
  };

  const toggleStar = async (e, note) => {
    e.stopPropagation();
    await updateDocument(note.id, { isStarred: !note.isStarred });
    if (activeNote?.id === note.id) {
      setActiveNote(prev => ({ ...prev, isStarred: !note.isStarred }));
    }
  };

  const togglePin = async (e, note) => {
    e.stopPropagation();
    await updateDocument(note.id, { isPinned: !note.isPinned });
    if (activeNote?.id === note.id) {
      setActiveNote(prev => ({ ...prev, isPinned: !note.isPinned }));
    }
  };

  // Autosave Logic
  const handleEditorChange = (newTitle, newContent, newCategory) => {
    setTitle(newTitle);
    setContent(newContent);
    setCategory(newCategory);

    if (activeNote) {
      setIsSaving(true);
      if (saveTimeout) clearTimeout(saveTimeout);
      
      const timeout = setTimeout(async () => {
        await updateDocument(activeNote.id, {
          title: newTitle || 'Untitled Note',
          content: newContent,
          category: newCategory
        });
        setIsSaving(false);
        // Update local active note state to match
        setActiveNote(prev => ({ ...prev, title: newTitle, content: newContent, category: newCategory }));
      }, 1000); // 1 second debounce
      
      setSaveTimeout(timeout);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* Sidebar List */}
      <div className="w-full md:w-1/3 md:max-w-sm flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-dark-900 dark:text-white flex items-center gap-2">
            <FileText className="text-primary-500" />
            Notes
          </h1>
          <button 
            onClick={handleCreateNew}
            className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/30"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="glass-card flex items-center px-3 py-2.5 rounded-xl mb-4">
          <Search size={16} className="text-dark-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-sm"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={() => setShowStarredOnly(!showStarredOnly)}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider ${
              showStarredOnly ? 'bg-yellow-500/10 text-yellow-500' : 'glass-card text-dark-500 hover:text-dark-900 dark:hover:text-white'
            }`}
          >
            <Star size={10} fill={showStarredOnly ? 'currentColor' : 'none'} />
            Starred
          </button>
          <button
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider ${
              showPinnedOnly ? 'bg-primary-500/10 text-primary-500' : 'glass-card text-dark-500 hover:text-dark-900 dark:hover:text-white'
            }`}
          >
            <Pin size={10} fill={showPinnedOnly ? 'currentColor' : 'none'} />
            Pinned
          </button>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="glass-card bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-wider p-1.5 rounded-lg text-dark-600 dark:text-dark-300 cursor-pointer"
          >
            <option value="all">All</option>
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="ideas">Ideas</option>
            <option value="journal">Journal</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-20 custom-scrollbar">
          {loading ? (
             <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary-500" /></div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <p className="text-sm">No notes found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pinned Section */}
              {pinnedNotes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-dark-400 uppercase tracking-widest pl-2">
                    <Pin size={10} className="text-primary-500" />
                    Pinned
                  </div>
                  <AnimatePresence>
                    {pinnedNotes.map(note => (
                      <NoteListItem 
                        key={note.id} 
                        note={note} 
                        activeNote={activeNote} 
                        setActiveNote={setActiveNote} 
                        toggleStar={toggleStar} 
                        togglePin={togglePin} 
                        handleDelete={handleDelete} 
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* All Notes Section */}
              <div className="space-y-2">
                {pinnedNotes.length > 0 && otherNotes.length > 0 && (
                  <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest pl-2 mt-4">
                    Other Notes
                  </div>
                )}
                <AnimatePresence>
                  {otherNotes.map(note => (
                    <NoteListItem 
                      key={note.id} 
                      note={note} 
                      activeNote={activeNote} 
                      setActiveNote={setActiveNote} 
                      toggleStar={toggleStar} 
                      togglePin={togglePin} 
                      handleDelete={handleDelete} 
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 glass-panel rounded-3xl p-6 md:p-8 flex flex-col min-h-64 md:h-[calc(100vh-140px)] relative">
        {activeNote ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <select 
                  value={category}
                  onChange={(e) => handleEditorChange(title, content, e.target.value)}
                  className="glass-card bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg text-primary-500 cursor-pointer"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="ideas">Ideas</option>
                  <option value="journal">Journal</option>
                </select>
                
                <div className="flex items-center gap-1 border-l border-dark-100 dark:border-dark-800 pl-4">
                  <button 
                    onClick={(e) => togglePin(e, activeNote)}
                    className={`p-2 rounded-lg transition-colors ${activeNote.isPinned ? 'bg-primary-500/10 text-primary-500' : 'text-dark-400 hover:text-primary-500 hover:bg-primary-500/10'}`}
                    title={activeNote.isPinned ? "Unpin" : "Pin to top"}
                  >
                    <Pin size={18} fill={activeNote.isPinned ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={(e) => toggleStar(e, activeNote)}
                    className={`p-2 rounded-lg transition-colors ${activeNote.isStarred ? 'bg-yellow-500/10 text-yellow-500' : 'text-dark-400 hover:text-yellow-500 hover:bg-yellow-500/10'}`}
                    title={activeNote.isStarred ? "Unstar" : "Mark as favorite"}
                  >
                    <Star size={18} fill={activeNote.isStarred ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-dark-400">
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-primary-500" />
                    <span className="text-primary-500">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Saved
                  </>
                )}
              </div>
            </div>

            <input 
              type="text"
              value={title}
              onChange={(e) => handleEditorChange(e.target.value, content, category)}
              placeholder="Note Title"
              className="bg-transparent border-none outline-none text-3xl font-display font-bold text-dark-900 dark:text-white placeholder-dark-300 dark:placeholder-dark-700 mb-6 w-full"
            />
            
            <textarea
              value={content}
              onChange={(e) => handleEditorChange(title, e.target.value, category)}
              placeholder="Start typing your thoughts here..."
              className="flex-1 bg-transparent border-none outline-none resize-none text-dark-700 dark:text-dark-200 leading-relaxed custom-scrollbar placeholder-dark-300 dark:placeholder-dark-700"
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
            <FileText size={64} className="mb-6 text-dark-300" />
            <h2 className="text-xl font-display font-bold text-dark-700 dark:text-dark-300">No Note Selected</h2>
            <p className="text-dark-500 mt-2 max-w-xs">Select a note from the sidebar or create a new one to start writing.</p>
            <button 
              onClick={handleCreateNew}
              className="mt-6 btn-primary flex items-center gap-2"
            >
              <Plus size={18} /> Create Note
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && noteToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-dark-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700 w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-xl font-bold mb-2">Delete Note?</h2>
              <p className="text-dark-500 dark:text-dark-400 text-sm mb-6">
                Are you sure you want to delete <span className="font-bold text-dark-900 dark:text-white">"{noteToDelete.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setNoteToDelete(null);
                  }} 
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    await deleteDocument(noteToDelete.id);
                    if (activeNote?.id === noteToDelete.id) setActiveNote(null);
                    setIsDeleteModalOpen(false);
                    setNoteToDelete(null);
                  }} 
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notes;

const NoteListItem = ({ note, activeNote, setActiveNote, toggleStar, togglePin, handleDelete }) => {
  const isActive = activeNote?.id === note.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={() => setActiveNote(note)}
      className={`p-4 rounded-2xl cursor-pointer group transition-all duration-200 border relative overflow-hidden ${
        isActive 
          ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/20' 
          : 'glass-card border-transparent hover:border-primary-500/30'
      }`}
    >
      {note.isPinned && !isActive && <Pin size={8} className="absolute top-2 right-2 text-primary-500 fill-primary-500" />}
      
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2 pr-4 truncate">
          <h3 className={`font-semibold truncate pr-4 pr-4 ${isActive ? 'text-white' : 'text-dark-800 dark:text-white'}`}>
            {note.title}
          </h3>
          {note.isStarred && <Star size={10} className={`${isActive ? 'text-white fill-white' : 'text-yellow-500 fill-yellow-500'}`} />}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button 
            onClick={(e) => togglePin(e, note)}
            className={`p-1 rounded-md transition-colors ${isActive ? 'hover:bg-white/20 text-white' : 'hover:bg-primary-500/10 text-dark-400 hover:text-primary-500'}`}
          >
            <Pin size={12} fill={note.isPinned ? 'currentColor' : 'none'} />
          </button>
          <button 
            onClick={(e) => toggleStar(e, note)}
            className={`p-1 rounded-md transition-colors ${isActive ? 'hover:bg-white/20 text-white' : 'hover:bg-yellow-500/10 text-dark-400 hover:text-yellow-500'}`}
          >
            <Star size={12} fill={note.isStarred ? 'currentColor' : 'none'} />
          </button>
          <button 
            onClick={(e) => handleDelete(e, note.id)}
            className={`p-1 rounded-md transition-colors ${isActive ? 'hover:bg-white/20 text-white' : 'hover:bg-red-500/10 text-dark-400 hover:text-red-500'}`}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      <p className={`text-xs line-clamp-2 ${isActive ? 'text-primary-100' : 'text-dark-500 dark:text-dark-400'}`}>
        {note.content || 'No additional text...'}
      </p>
      
      <div className="flex items-center justify-between mt-3">
        <p className={`text-[10px] font-medium flex items-center gap-1 ${isActive ? 'text-primary-200' : 'text-dark-400'}`}>
          <Clock size={10} />
          {note.updatedAt?.seconds ? new Date(note.updatedAt.seconds * 1000).toLocaleDateString() : 'Just now'}
        </p>
        <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${
          isActive ? 'border-white/40 text-white' : 'border-dark-200 dark:border-dark-700 text-dark-500'
        }`}>
          {note.category || 'personal'}
        </span>
      </div>
    </motion.div>
  );
};
