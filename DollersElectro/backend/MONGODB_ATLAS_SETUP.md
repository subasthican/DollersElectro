# 🗄️ MongoDB Atlas Setup Guide

## Prerequisites
- MongoDB Atlas account (free tier available)
- Node.js and npm installed
- Your DollersElectro backend project

## Step 1: Create MongoDB Atlas Account

1. **Go to [MongoDB Atlas](https://cloud.mongodb.com/)**
2. **Click "Try Free" or "Sign Up"**
3. **Fill in your details and create account**

## Step 2: Create a Cluster

1. **Click "Build a Database"**
2. **Choose "FREE" tier (M0)**
3. **Select your preferred cloud provider (AWS, Google Cloud, or Azure)**
4. **Choose a region close to you**
5. **Click "Create"**

## Step 3: Set Up Database Access

1. **Go to "Database Access" in the left sidebar**
2. **Click "Add New Database User"**
3. **Choose "Password" authentication**
4. **Set username (e.g., `dollers_admin`)**
5. **Set a strong password**
6. **Set privileges to "Read and write to any database"**
7. **Click "Add User"**

## Step 4: Configure Network Access

1. **Go to "Network Access" in the left sidebar**
2. **Click "Add IP Address"**
3. **For development: Click "Allow Access from Anywhere" (0.0.0.0/0)**
4. **For production: Add only your server's IP address**
5. **Click "Confirm"**

## Step 5: Get Your Connection String

1. **Go back to "Database" in the left sidebar**
2. **Click "Connect" on your cluster**
3. **Choose "Connect your application"**
4. **Copy the connection string**

## Step 6: Update Your .env File

1. **Open your `.env` file in the backend directory**
2. **Find the line:**
   ```
   MONGODB_URI=mongodb://localhost:27017/dollers_electro
   ```
3. **Replace it with your Atlas connection string:**
   ```
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster_url/dollers_electro?retryWrites=true&w=majority
   ```

   **Important:** Replace:
   - `your_username` with the username you created
   - `your_password` with the password you set
   - `your_cluster_url` with your actual cluster URL

## Step 7: Test Your Connection

Run the test script to verify your connection:

```bash
node testMongoAtlas.js
```

You should see:
```
✅ Successfully connected to MongoDB Atlas!
🗄️  Database: dollers_electro
🌐 Host: your-cluster-url
🔌 Port: 27017
```

## Step 8: Start Your Server

```bash
npm start
```

You should see:
```
✅ Connected to MongoDB successfully!
🚀 Server running on port 5001
🗄️  Database: Connected
```

## Troubleshooting

### ❌ Authentication Failed
- Check username and password in connection string
- Ensure user has correct permissions

### ❌ Network Access Denied
- Check IP whitelist in Network Access
- For development, use "Allow Access from Anywhere"

### ❌ Connection Timeout
- Check cluster status in Atlas
- Verify connection string format
- Check firewall settings

### ❌ Invalid Connection String
- Ensure proper format: `mongodb+srv://username:password@cluster/database`
- Check for special characters in password (may need URL encoding)

## Security Best Practices

1. **Use strong passwords** for database users
2. **Limit IP access** in production
3. **Use environment variables** for sensitive data
4. **Regularly rotate** database passwords
5. **Monitor** database access logs

## Production Considerations

1. **Use dedicated clusters** (not free tier)
2. **Set up proper backup** strategies
3. **Configure monitoring** and alerts
4. **Use VPC peering** for enhanced security
5. **Implement connection pooling** for better performance

## Need Help?

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Community Forums](https://developer.mongodb.com/community/forums/)
- [MongoDB Support](https://www.mongodb.com/support)
