
import { NextApiRequest, NextApiResponse } from 'next';
import wandb from '@wandb/sdk';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      // Initialize a new wandb run
      await wandb.init({
        project: 'nextjs-app', // Name of your project
        config: {
          framework: 'Next.js',
        },
      });

      // Log custom data
      wandb.log({
        event_name: 'user_signup',
        user_id: req.body.userId,
        timestamp: new Date().toISOString(),
      });

      // It's important to call finish() to ensure all data is sent
      await wandb.finish();

      res.status(200).json({ message: 'Event tracked successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error tracking event' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
