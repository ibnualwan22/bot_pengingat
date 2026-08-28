import * as cron from 'node-cron';
import { prisma } from './prisma';
import { sendWaMessage } from './wa';

// Store active jobs to prevent duplicates
const activeJobs = new Map<number, cron.ScheduledTask>();

export async function initScheduler() {
  console.log("Initializing scheduler...");
  
  // Clear any existing jobs in memory
  for (const job of activeJobs.values()) {
    job.stop();
  }
  activeJobs.clear();

  try {
    const schedules = await prisma.scheduledMessage.findMany({
      where: { isActive: true },
      include: { group: true }
    });
    
    for (const schedule of schedules) {
      if (cron.validate(schedule.cronExpression)) {
        const job = cron.schedule(schedule.cronExpression, async () => {
          try {
            console.log(`Executing scheduled message ${schedule.id} for group ${schedule.group.name}`);
            
            // Send message
            await sendWaMessage(schedule.group.jid, schedule.message);
            
            // Log success
            await prisma.messageLog.create({
              data: {
                scheduledMessageId: schedule.id,
                groupId: schedule.groupId,
                message: schedule.message,
                status: 'SUCCESS'
              }
            });
            
            // Update last run
            await prisma.scheduledMessage.update({
              where: { id: schedule.id },
              data: { lastRunAt: new Date() }
            });
            
          } catch (error) {
            console.error(`Error executing schedule ${schedule.id}:`, error);
            // Log failure
            await prisma.messageLog.create({
              data: {
                scheduledMessageId: schedule.id,
                groupId: schedule.groupId,
                message: schedule.message,
                status: 'FAILED',
                errorMessage: String(error)
              }
            });
          }
        }, {
          timezone: "Asia/Jakarta"
        } as any);
        
        activeJobs.set(schedule.id, job);
      } else {
        console.warn(`Invalid cron expression for schedule ${schedule.id}: ${schedule.cronExpression}`);
      }
    }
    
    console.log(`Scheduled ${activeJobs.size} active jobs.`);
  } catch (error) {
    console.error("Scheduler initialization error:", error);
  }
}

export function refreshScheduler() {
  console.log("Refreshing scheduler...");
  initScheduler();
}
