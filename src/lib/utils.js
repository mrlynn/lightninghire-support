// src/lib/utils.js
/**
 * Converts MongoDB documents to plain JavaScript objects
 * by removing non-serializable properties
 */
export function serializeDocument(doc) {
    if (!doc) return null;
    
    // If it's already a plain object from .lean() or .toObject()
    if (!doc.toObject && !doc.toJSON) {
      // Recursively handle potential nested documents in arrays
      return JSON.parse(JSON.stringify(doc));
    }
    
    // Convert to a plain object
    const plainDoc = doc.toObject ? doc.toObject() : doc.toJSON();
    
    // Convert _id to string
    if (plainDoc._id) {
      plainDoc._id = plainDoc._id.toString();
    }
    
    return plainDoc;
  }
  
  /**
   * Serialize an array of documents
   */
  export function serializeDocuments(docs) {
    if (!docs) return [];
    return docs.map(doc => serializeDocument(doc));
  }