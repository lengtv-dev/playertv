import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function iptvProxyPlugin(): Plugin {
  return {
    name: 'iptv-proxy-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/proxy')) {
          return next();
        }

        try {
          const urlObj = new URL(req.url, 'http://localhost:3000');
          const targetUrl = urlObj.searchParams.get('url');

          if (!targetUrl) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Missing ?url= query parameter' }));
          }

          const fetchHeaders: Record<string, string> = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
            'referer': 'https://ball-online.com/',
            'origin': 'https://ball-online.com',
          };

          const upstreamRes = await fetch(targetUrl, {
            method: req.method || 'GET',
            headers: fetchHeaders,
          });

          res.statusCode = upstreamRes.status;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

          upstreamRes.headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase();
            if (
              lowerKey !== 'content-security-policy' &&
              lowerKey !== 'x-frame-options' &&
              lowerKey !== 'access-control-allow-origin'
            ) {
              res.setHeader(key, value);
            }
          });

          const buffer = await upstreamRes.arrayBuffer();
          res.end(Buffer.from(buffer));
        } catch (error: any) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ error: 'Proxy fetch failed', message: error?.message }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), iptvProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
