import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { refreshScheduler } from '@/lib/scheduler';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Convert undefined to omit updating
    const updateData: any = {};
    if (data.groupId !== undefined) updateData.groupId = data.groupId;
    if (data.message !== undefined) updateData.message = data.message;
    if (data.cronExpression !== undefined) updateData.cronExpression = data.cronExpression;
    if (data.repeatType !== undefined) updateData.repeatType = data.repeatType;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const schedule = await prisma.scheduledMessage.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    refreshScheduler();
    
    return NextResponse.json({ schedule });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.scheduledMessage.delete({
      where: { id: parseInt(id) }
    });
    
    refreshScheduler();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
