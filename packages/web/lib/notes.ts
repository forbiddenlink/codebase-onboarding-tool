/**
 * Notes management utility library
 * Handles file notes and line annotations with localStorage persistence
 */

export interface FileNote {
  id: string;
  fileName: string;
  filePath: string;
  text: string;
  author: string;
  timestamp: Date;
}

export interface LineAnnotation {
  id: string;
  fileName: string;
  filePath: string;
  lineNumber: number;
  lineContent: string;
  text: string;
  author: string;
  timestamp: Date;
  codeVersion: string;
  status?: 'current' | 'outdated' | 'moved';
}

const NOTES_STORAGE_KEY = 'codecompass_notes';
const ANNOTATIONS_STORAGE_KEY = 'codecompass_annotations';

/**
 * Get all file notes from localStorage
 */
export function getAllNotes(): FileNote[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const notesJson = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!notesJson) {
      return [];
    }

    const notes = JSON.parse(notesJson);
    // Convert timestamp strings back to Date objects
    return notes.map((note: any) => ({
      ...note,
      timestamp: new Date(note.timestamp)
    }));
  } catch (error) {
    console.error('Error reading notes from localStorage:', error);
    return [];
  }
}

/**
 * Get notes for a specific file
 */
export function getFileNotes(filePath: string): FileNote[] {
  const allNotes = getAllNotes();
  return allNotes.filter(note => note.filePath === filePath);
}

/**
 * Add a new file note
 */
export function addNote(note: Omit<FileNote, 'id' | 'timestamp'>): FileNote {
  const allNotes = getAllNotes();

  const newNote: FileNote = {
    ...note,
    id: Date.now().toString(),
    timestamp: new Date()
  };

  const updatedNotes = [...allNotes, newNote];
  saveNotes(updatedNotes);

  return newNote;
}

/**
 * Update an existing note
 */
export function updateNote(id: string, text: string): void {
  const allNotes = getAllNotes();
  const updatedNotes = allNotes.map(note =>
    note.id === id
      ? { ...note, text, timestamp: new Date() }
      : note
  );
  saveNotes(updatedNotes);
}

/**
 * Delete a note
 */
export function deleteNote(id: string): void {
  const allNotes = getAllNotes();
  const updatedNotes = allNotes.filter(note => note.id !== id);
  saveNotes(updatedNotes);
}

/**
 * Save notes to localStorage
 */
function saveNotes(notes: FileNote[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving notes to localStorage:', error);
  }
}

/**
 * Get all line annotations from localStorage
 */
export function getAllAnnotations(): LineAnnotation[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const annotationsJson = localStorage.getItem(ANNOTATIONS_STORAGE_KEY);
    if (!annotationsJson) {
      return [];
    }

    const annotations = JSON.parse(annotationsJson);
    // Convert timestamp strings back to Date objects
    return annotations.map((annotation: any) => ({
      ...annotation,
      timestamp: new Date(annotation.timestamp)
    }));
  } catch (error) {
    console.error('Error reading annotations from localStorage:', error);
    return [];
  }
}

/**
 * Get annotations for a specific file
 */
export function getFileAnnotations(filePath: string): LineAnnotation[] {
  const allAnnotations = getAllAnnotations();
  return allAnnotations.filter(annotation => annotation.filePath === filePath);
}

/**
 * Add a new line annotation
 */
export function addAnnotation(annotation: Omit<LineAnnotation, 'id' | 'timestamp'>): LineAnnotation {
  const allAnnotations = getAllAnnotations();

  const newAnnotation: LineAnnotation = {
    ...annotation,
    id: Date.now().toString(),
    timestamp: new Date()
  };

  const updatedAnnotations = [...allAnnotations, newAnnotation];
  saveAnnotations(updatedAnnotations);

  return newAnnotation;
}

/**
 * Update an existing annotation
 */
export function updateAnnotation(id: string, text: string): void {
  const allAnnotations = getAllAnnotations();
  const updatedAnnotations = allAnnotations.map(annotation =>
    annotation.id === id
      ? { ...annotation, text, timestamp: new Date() }
      : annotation
  );
  saveAnnotations(updatedAnnotations);
}

/**
 * Delete an annotation
 */
export function deleteAnnotation(id: string): void {
  const allAnnotations = getAllAnnotations();
  const updatedAnnotations = allAnnotations.filter(annotation => annotation.id !== id);
  saveAnnotations(updatedAnnotations);
}

/**
 * Save annotations to localStorage
 */
function saveAnnotations(annotations: LineAnnotation[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(ANNOTATIONS_STORAGE_KEY, JSON.stringify(annotations));
  } catch (error) {
    console.error('Error saving annotations to localStorage:', error);
  }
}

/**
 * Search notes by content, author, or file
 */
export function searchNotes(query: string): FileNote[] {
  const allNotes = getAllNotes();
  const lowerQuery = query.toLowerCase();

  return allNotes.filter(note => {
    return (
      note.text.toLowerCase().includes(lowerQuery) ||
      note.author.toLowerCase().includes(lowerQuery) ||
      note.fileName.toLowerCase().includes(lowerQuery) ||
      note.filePath.toLowerCase().includes(lowerQuery)
    );
  });
}

/**
 * Search annotations by content, author, or file
 */
export function searchAnnotations(query: string): LineAnnotation[] {
  const allAnnotations = getAllAnnotations();
  const lowerQuery = query.toLowerCase();

  return allAnnotations.filter(annotation => {
    return (
      annotation.text.toLowerCase().includes(lowerQuery) ||
      annotation.author.toLowerCase().includes(lowerQuery) ||
      annotation.fileName.toLowerCase().includes(lowerQuery) ||
      annotation.filePath.toLowerCase().includes(lowerQuery) ||
      annotation.lineContent.toLowerCase().includes(lowerQuery)
    );
  });
}

/**
 * Get notes statistics
 */
export function getNotesStats(): {
  totalNotes: number;
  totalAnnotations: number;
  filesCovered: number;
  authors: string[];
} {
  const notes = getAllNotes();
  const annotations = getAllAnnotations();

  const filesWithNotes = new Set([
    ...notes.map(n => n.filePath),
    ...annotations.map(a => a.filePath)
  ]);

  const authors = new Set([
    ...notes.map(n => n.author),
    ...annotations.map(a => a.author)
  ]);

  return {
    totalNotes: notes.length,
    totalAnnotations: annotations.length,
    filesCovered: filesWithNotes.size,
    authors: Array.from(authors)
  };
}
