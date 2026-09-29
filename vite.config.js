import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'vercel-api-dev-server',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/')) {
            try {
              const urlPath = req.url.split('?')[0]; // e.g. /api/send-otp
              const modulePath = `${urlPath}.js`; // e.g. /api/send-otp.js

              let bodyStr = '';
              req.on('data', chunk => { bodyStr += chunk; });
              req.on('end', async () => {
                try {
                  req.body = bodyStr ? JSON.parse(bodyStr) : {};
                } catch (e) {
                  req.body = {};
                }
                
                res.status = (code) => {
                  res.statusCode = code;
                  return res;
                };
                res.json = (data) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return res;
                };

                try {
                  const { default: handler } = await server.ssrLoadModule(modulePath);
                  await handler(req, res);
                } catch (loadErr) {
                  console.error(`[Dev API Server] Failed to load module ${modulePath}:`, loadErr);
                  next();
                }
              });
            } catch (err) {
              console.error('Local dev API handler error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          } else {
            next();
          }
        });
      }
    }
  ],
})
