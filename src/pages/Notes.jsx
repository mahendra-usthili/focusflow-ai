import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Search, Trash2, Save, Clock, Loader2 } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';

const Notes = () => {
  const { data: notes, loading, addDocument, updateDocument, deleteDocument } = useFirestore('notes');
  const [activeNote, setActiveNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState(null);

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
    } else {
      setTitle('');
      setContent('');
    }
  }, [activeNote]);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateNew = async () => {
    try {
      const newNoteRef = await addDocument({
        title: 'Untitled Note',
        content: ''
      });
      if (newNoteRef?.id) {
        setActiveNote({ id: newNoteRef.id, title: 'Untitled Note', content: '' });
      }
    } catch (err) {
      console.warn('Could not create note:', err.message);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteDocument(id);
    if (activeNote?.id === id) {
      setActiveNote(null);
    }
  };

  // Autosave Logic
  const handleEditorChange = (newTitle, newContent) => {
    setTitle(newTitle);
    setContent(newContent);

    if (activeNote) {
      setIsSaving(true);
      if (saveTimeout) clearTimeout(saveTimeout);
      
      const timeout = setTimeout(async () => {
        await updateDocument(activeNote.id, {
          title: newTitle || 'Untitled Note',
          content: newContent
        });
        setIsSaving(false);
        // Update local active note state to match
        setActiveNote(prev => ({ ...prev, title: newTitle, content: newContent }));
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

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 pb-20">
          {loading ? (
             <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary-500" /></div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <p className="text-sm">No notes found.</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredNotes.map(note => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setActiveNote(note)}
                  className={`p-4 rounded-2xl cursor-pointer group transition-all duration-200 border ${
                    activeNote?.id === note.id 
                      ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/20' 
                      : 'glass-card border-transparent hover:border-primary-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-semibold truncate pr-4 ${activeNote?.id === note.id ? 'text-white' : 'text-dark-800 dark:text-white'}`}>
                      {note.title}
                    </h3>
                    <button 
                      onClick={(e) => handleDelete(e, note.id)}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md ${
                        activeNote?.id === note.id ? 'hover:bg-white/20' : 'hover:bg-red-500/10 hover:text-red-500 text-dark-400'
                      }`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className={`text-xs line-clamp-2 ${activeNote?.id === note.id ? 'text-primary-100' : 'text-dark-500 dark:text-dark-400'}`}>
                    {note.content || 'No additional text...'}
                  </p>
                  <p className={`text-[10px] mt-3 font-medium flex items-center gap-1 ${activeNote?.id === note.id ? 'text-primary-200' : 'text-dark-400'}`}>
                    <Clock size={10} />
                    {note.updatedAt?.seconds ? new Date(note.updatedAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 glass-panel rounded-3xl p-6 md:p-8 flex flex-col min-h-64 md:h-[calc(100vh-140px)] relative">
        {activeNote ? (
          <>
            <div className="absolute top-8 right-8 flex items-center gap-2 text-xs font-semibold text-dark-400">
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

            <input 
              type="text"
              value={title}
              onChange={(e) => handleEditorChange(e.target.value, content)}
              placeholder="Note Title"
              className="bg-transparent border-none outline-none text-3xl font-display font-bold text-dark-900 dark:text-white placeholder-dark-300 dark:placeholder-dark-700 mb-6 w-5/6"
            />
            
            <textarea
              value={content}
              onChange={(e) => handleEditorChange(title, e.target.value)}
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
    </div>
  );
};

export default Notes;
