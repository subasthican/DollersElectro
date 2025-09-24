# 🚀 Quick MongoDB Atlas Setup

## **Step 1: Create .env File**

In your `backend` folder, create a file called `.env`:

```bash
cd backend
touch .env
```

## **Step 2: Add Your MongoDB Credentials**

Open the `.env` file and add this (replace with your actual values):

```env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster_url/dollers_electro?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
```

## **Step 3: Get Your Connection String**

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign in to your account
3. Click on your cluster
4. Click "Connect"
5. Choose "Connect your application"
6. Copy the connection string
7. Replace `your_username`, `your_password`, and `your_cluster_url`

## **Step 4: Test Connection**

```bash
cd backend
node testMongoAtlas.js
```

## **Step 5: Start Server**

```bash
npm start
```

## **What Happens Now:**

✅ **With MongoDB Atlas**: Your app will use the cloud database (like yesterday)
✅ **Without MongoDB**: Your app will automatically use local JSON database
✅ **Hybrid Mode**: Routes automatically choose the best available database

## **Need Help?**

- Check your internet connection
- Verify username/password in Atlas
- Check IP allowlist in Atlas Network Access
- Make sure your cluster is running

Your app will work either way! 🎉

