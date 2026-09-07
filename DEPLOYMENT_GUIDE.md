# VPS Deployment Guide (aaPanel Edition)

This guide is tailored for deploying **RT App** using **aaPanel** on a Linux VPS.

## 1. Domain & DNS
- Point your domain (e.g., `rtapp.domaingwa.com`) to your VPS IP address (A Record).

## 2. Backend Deployment (Python Project)
aaPanel makes this easy with the **Python Project Manager**.

1.  **Upload Code**:
    - Go to `Files` -> `/www/wwwroot`.
    - Create folder `rtapp-backend`.
    - Upload the contents of your `backend` folder here.
    - **Important**: Also upload your local `kas_rt.db` if you want to keep existing data.
2.  **Install Python Manager**:
    - Go to `App Store` -> Search `Python` -> Install `Python Project Manager`.
3.  **Add Project**:
    - Open Python Project Manager -> `Add Python Project`.
    - **Path**: `/www/wwwroot/rtapp-backend`
    - **Run File**: `main.py` (or `backend/main.py` depending on folder structure)
    - **Port**: `8000`
    - **Framework**: `FastAPI` (or choose Manual)
    - **Startup Command**: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`
    - Click **OK**.
4.  **Dependencies**:
    - In the project list, click `Modules`.
    - It should auto-install from `requirements.txt`. If not, add manually: `fastapi uvicorn sqlalchemy pydantic python-multipart python-jose passlib[bcrypt]`.

## 3. Frontend Deployment (Static Site)
1.  **Build Locally**:
    - On your PC, run: `npm run build`
    - This creates a `dist` folder.
2.  **Create Website in aaPanel**:
    - Go to `Website` -> `Add Site`.
    - **Domain**: `rtapp.domaingwa.com`
    - **Database**: Not needed (we use SQLite in backend).
    - **PHP**: Pure Static (or any PHP version, doesn't matter).
3.  **Upload Frontend**:
    - Go to `Files` -> `/www/wwwroot/rtapp.domaingwa.com`.
    - Delete default files (`index.html`, `404.html`).
    - Upload **contents** of your local `dist` folder here.
    - You should see `index.html` and `assets` folder in the root.

## 4. Nginx Configuration (The "Bridge")
Now we connect the frontend (Domain) to the backend (Port 8000).

1.  Go to `Website` -> Click your domain (`rtapp.domaingwa.com`).
2.  Go to `Config` (or `Reverse Proxy` if you prefer GUI, but Config is more flexible).
3.  Find the `location /` block. It usually serves static files. Keep it.
4.  **Add this block BEFORE the closing `}` of the `server` block**:

```nginx
    # Proxy /api requests to Backend
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve Uploaded Files
    location /uploads {
        alias /www/wwwroot/rtapp-backend/uploads;
    }
```
*Note: Adjust `/www/wwwroot/rtapp-backend/uploads` to the actual path where your backend stores images.*

5.  **Save**.

## 5. Environment Variables (Optional but Recommended)
In your `frontend` build, the API URL is handled by `config.js`. 
- By default it tries to connect to the same domain relative path (`/api/...`) if built for production, or you can hardcode the domain if needed.
- Since we set up Nginx proxy above, the frontend will call `http://rtapp.domaingwa.com/api/...`, Nginx will forward it to `localhost:8000/api/...`, and it works!

## 6. SSL (HTTPS)
1.  Go to `Website` -> Click your domain.
2.  Go to `SSL`.
3.  Select `Let's Encrypt`.
4.  Select your domain -> `Apply`.
5.  Turn on `Force HTTPS`.

Done! Access `https://rtapp.domaingwa.com`.
