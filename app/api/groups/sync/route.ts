import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getWaGroups } from '@/lib/wa';

export async function POST() {
  try {
    let groups = [];
    try {
      const waData = await getWaGroups();
      groups = waData.groups || [];
    } catch (error) {
      console.log("Could not fetch groups from WA API, using WA_DEFAULT_GROUP from .env");
      const defaultJid = process.env.WA_DEFAULT_GROUP;
      if (defaultJid) {
        groups = [{
          JID: defaultJid,
          Name: 'Grup Pengingat Default',
          Topic: 'Default Group from ENV',
          ParticipantCount: 0
        }];
      } else {
        throw error;
      }
    }
    
    const defaultJid = process.env.WA_DEFAULT_GROUP;
    if (defaultJid) {
      groups = groups.filter((g: any) => g.JID === defaultJid);
      
      // Bersihkan grup lain dari Database agar hanya sisa 1 grup
      await prisma.group.deleteMany({
        where: {
          jid: { not: defaultJid }
        }
      });
    }
    
    const results = [];
    
    for (const group of groups) {
      if (!group.JID || !group.Name) continue;
      
      const upserted = await prisma.group.upsert({
        where: { jid: group.JID },
        update: {
          name: group.Name,
          topic: group.Topic || null,
          participantCount: group.ParticipantCount || 0,
        },
        create: {
          jid: group.JID,
          name: group.Name,
          topic: group.Topic || null,
          participantCount: group.ParticipantCount || 0,
          isActive: true
        }
      });
      results.push(upserted);
    }
    
    return NextResponse.json({ success: true, count: results.length, groups: results });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
