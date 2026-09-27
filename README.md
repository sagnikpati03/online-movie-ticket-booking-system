# Movie Ticket Booking System

Full-stack movie ticket booking project with React/Vite frontend, Express/Node.js backend and MySQL database.


## Movie poster uploads

Admin movie posters are uploaded to `backend/uploads/posters` and served from `/uploads/posters/...`. The admin upload accepts JPG, PNG, WEBP, or GIF images up to 5 MB. The Home and Movie Details pages display the uploaded image, using a 16:9 preview/card ratio.

After updating this project, install dependencies in both folders (the backend now uses Multer for multipart image uploads):

```bash
cd backend
npm install

cd ../frontend
npm install
```
