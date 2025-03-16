import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { addTicketAttachment } from '@/services/ticketService';
import { uploadFile } from '@/lib/fileUpload'; // Assume this exists for S3 or similar storage

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const ticketId = params.id;
    
    // Handle file upload (multipart form data)
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Upload file to storage (S3, etc.)
    const fileInfo = await uploadFile(file);
    
    // Create attachment data
    const attachmentData = {
      fileName: fileInfo.fileName,
      fileSize: fileInfo.fileSize,
      fileType: fileInfo.fileType,
      fileUrl: fileInfo.fileUrl,
      uploadedBy: session.user.id,
      uploaderInfo: {
        name: session.user.name,
        email: session.user.email
      },
      uploadedAt: new Date()
    };
    
    // Add attachment to ticket
    const ticket = await addTicketAttachment(ticketId, attachmentData);
    
    // Return the new attachment (the last one)
    const newAttachment = ticket.attachments[ticket.attachments.length - 1];
    
    return NextResponse.json(newAttachment, { status: 201 });
  } catch (error) {
    console.error('Error adding attachment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add attachment' },
      { status: error.message === 'Ticket not found' ? 404 : 500 }
    );
  }
} 