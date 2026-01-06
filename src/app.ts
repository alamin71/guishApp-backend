import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import globalErrorHandler from './app/middleware/globalErrorhandler';
import notFound from './app/middleware/notfound';
import router from './app/routes';

const app: Application = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
//parsers
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PATCH'],
  }),
);
// application routes
app.use('/api/v1', router);
app.get('/', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>GuishApp API</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 60px 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
          max-width: 600px;
          width: 100%;
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .logo {
          font-size: 48px;
          font-weight: bold;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 20px;
          letter-spacing: -1px;
        }
        .status {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #10b981;
          color: white;
          padding: 12px 24px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 16px;
          margin: 30px 0;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }
        .pulse {
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .description {
          color: #64748b;
          font-size: 18px;
          line-height: 1.6;
          margin: 20px 0 30px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .info-card {
          background: #f8fafc;
          padding: 20px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
        }
        .info-label {
          color: #94a3b8;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        .info-value {
          color: #1e293b;
          font-size: 16px;
          font-weight: 600;
        }
        .footer {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 2px solid #e2e8f0;
          color: #94a3b8;
          font-size: 14px;
        }
        .link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s;
        }
        .link:hover {
          color: #764ba2;
        }
        @media (max-width: 600px) {
          .container {
            padding: 40px 30px;
          }
          .logo {
            font-size: 36px;
          }
          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">GuishApp</div>
        <div class="status">
          <span class="pulse"></span>
          Server is Up and Running
        </div>
        <p class="description">
          Welcome to GuishApp API Server.<br>
          All systems operational and ready to serve requests.
        </p>
        
        <div class="info-grid">
          <div class="info-card">
            <div class="info-label">Version</div>
            <div class="info-value">v1.0.0</div>
          </div>
          <div class="info-card">
            <div class="info-label">Environment</div>
            <div class="info-value">Production</div>
          </div>
          <div class="info-card">
            <div class="info-label">Status</div>
            <div class="info-value">✓ Healthy</div>
          </div>
        </div>

        <div class="footer">
          <p>API Base URL: <a href="https://api.guishapp.com/api/v1" class="link">https://api.guishapp.com/api/v1</a></p>
          <p style="margin-top: 10px;">© ${new Date().getFullYear()} GuishApp. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `);
});
app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;
