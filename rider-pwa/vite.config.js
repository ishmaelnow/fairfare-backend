import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

function stripeDevPlugin(secretKey) {
  return {
    name: 'stripe-dev-functions',
    configureServer(server) {
      server.middlewares.use('/.netlify/functions/create-payment-intent', async (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const { amount } = JSON.parse(body);
            const { default: Stripe } = await import('stripe');
            const stripe = new Stripe(secretKey);
            const intent = await stripe.paymentIntents.create({
              amount: Math.round(amount * 100),
              currency: 'usd',
              automatic_payment_methods: { enabled: true },
            });
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ clientSecret: intent.client_secret }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (empty prefix = no filter, reads STRIPE_SECRET_KEY too)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      stripeDevPlugin(env.STRIPE_SECRET_KEY),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'FairFare Rider',
          short_name: 'Rider',
          description: 'Book rides with FairFare Transportation',
          theme_color: '#2563eb',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ],
          start_url: '/',
          scope: '/',
          orientation: 'portrait'
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/localhost:8001\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    server: {
      port: 3001,
      open: true,
    }
  };
});
