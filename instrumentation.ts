export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only run scheduled cron jobs on the nodejs runtime (not edge)
    const { initScheduler } = await import('./lib/scheduler');
    initScheduler();
  }
}
