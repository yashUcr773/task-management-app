import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

// DELETE /api/tasks/[id]/attachments/[attachmentId] - Delete attachment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; attachmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find attachment and verify access
    const attachment = await prisma.attachment.findFirst({
      where: {
        id: params.attachmentId,
        taskId: params.id,
        task: {
          team: {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: 'Attachment not found or access denied' },
        { status: 404 }
      );
    }

    // Check if user is the uploader or has admin rights
    const canDelete = 
      attachment.uploaderId === session.user.id ||
      // You can add additional admin checks here
      false;

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Permission denied. Only the uploader can delete this attachment.' },
        { status: 403 }
      );
    }    // Delete file from disk
    try {
      const filePath = join(process.cwd(), 'public', attachment.filePath);
      await unlink(filePath);
    } catch {
      console.warn('File not found on disk:', attachment.filePath);
    }

    // Delete attachment record from database
    await prisma.attachment.delete({
      where: { id: params.attachmentId },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'TASK_UPDATED',
        description: `Removed attachment: ${attachment.originalName}`,
        taskId: params.id,
        userId: session.user.id,
        metadata: JSON.stringify({
          attachmentId: attachment.id,
          fileName: attachment.originalName,
          fileSize: attachment.fileSize,
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return NextResponse.json(
      { error: 'Failed to delete attachment' },
      { status: 500 }
    );
  }
}

// GET /api/tasks/[id]/attachments/[attachmentId] - Download attachment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; attachmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find attachment and verify access
    const attachment = await prisma.attachment.findFirst({
      where: {
        id: params.attachmentId,
        taskId: params.id,
        task: {
          team: {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: 'Attachment not found or access denied' },
        { status: 404 }
      );
    }

    // Return file information for client-side download
    return NextResponse.json({
      id: attachment.id,
      originalName: attachment.originalName,
      filePath: attachment.filePath,
      mimeType: attachment.mimeType,
      fileSize: attachment.fileSize,
      downloadUrl: attachment.filePath, // Files are served from public directory
    });
  } catch (error) {
    console.error('Error fetching attachment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attachment' },
      { status: 500 }
    );
  }
}
