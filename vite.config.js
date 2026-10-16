import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Expose .env variables to the Dev Config / Vite SSR process
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };

  return {
    server: {
      headers: {
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
      }
    },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'vercel-api-dev-server',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith('/api/')) {
              try {
                let urlPath = req.url.split('?')[0];
                let modulePath = `${urlPath}.js`;

                req.query = req.query || {};
                try {
                  const urlObj = new URL(req.url, 'http://localhost');
                  urlObj.searchParams.forEach((val, key) => { req.query[key] = val; });
                } catch (e) {}

                if (urlPath === '/api/send-otp' || urlPath === '/api/verify-otp' || urlPath === '/api/check-email') {
                  modulePath = '/api/auth.js';
                  req.query.action = urlPath.replace('/api/', '');
                } else if (urlPath === '/api/sign-cloudinary' || urlPath === '/api/upload-image') {
                  modulePath = '/api/cloudinary.js';
                  req.query.action = urlPath.replace('/api/', '');
                }

                let bodyStr = '';
                req.on('data', chunk => { bodyStr += chunk; });
                req.on('end', async () => {
                  req.rawBody = bodyStr;
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
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@firebase/firestore') || id.includes('firebase/firestore')) {
                return 'vendor-firestore';
              }
              if (id.includes('@firebase/auth') || id.includes('firebase/auth')) {
                return 'vendor-auth';
              }
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('recharts')) {
                return 'vendor-recharts';
              }
              if (id.includes('framer-motion')) {
                return 'vendor-framer-motion';
              }
              if (id.includes('react-icons') || id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'vendor-react';
              }
              return 'vendor-utils';
            }
          }
        }
      }
    }
  };
});
