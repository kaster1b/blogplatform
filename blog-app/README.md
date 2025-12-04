# Blog Platform

A modern, responsive blog application with user authentication and Supabase database integration.

## Features

- ✨ User Authentication (Sign up, Login, Logout)
- ✍️ Create, Read, and Delete Blog Posts
- 👤 User Profiles with Author Information
- 📱 Fully Responsive Design
- 🎨 Modern UI with Gradient Background
- 🔄 Real-time Updates
- 🔒 Secure Password Authentication

## Project Structure

```
blog-app/
├── index.html       # Main HTML file
├── styles.css       # Styling
├── script.js        # Main JavaScript logic
├── config.js        # Supabase configuration
└── README.md        # This file
```

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up for a free account
2. Click "New Project" and follow the prompts
3. Wait for your project to be created (takes a few minutes)

### 2. Create Database Tables

In your Supabase dashboard:

1. Go to the **SQL Editor**
2. Click "New Query"
3. Paste the following SQL to create the `blogs` table:

```sql
CREATE TABLE IF NOT EXISTS blogs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT,
  CONSTRAINT title_length CHECK (char_length(title) <= 500),
  CONSTRAINT content_length CHECK (char_length(content) <= 10000)
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS blogs_user_id_idx ON blogs(user_id);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS blogs_created_at_idx ON blogs(created_at);
```

4. Click "Run" to execute the query

### 3. Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Make sure "Email" is enabled (it should be by default)
3. You can configure email settings if needed

### 4. Set Row Level Security (RLS) Policies

In the SQL Editor, run this query to set up RLS:

```sql
-- Enable RLS on the blogs table
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Policy for selecting all blogs (anyone can read)
CREATE POLICY "Anyone can view blogs" ON blogs
  FOR SELECT
  USING (true);

-- Policy for inserting (only authenticated users can create)
CREATE POLICY "Authenticated users can create blogs" ON blogs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating (only the author can update)
CREATE POLICY "Users can update own blogs" ON blogs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for deleting (only the author can delete)
CREATE POLICY "Users can delete own blogs" ON blogs
  FOR DELETE
  USING (auth.uid() = user_id);
```

### 5. Get Your Supabase Credentials

1. Go to **Settings** → **API**
2. Copy your:
   - **Project URL** (labeled as `URL`)
   - **Anon Public Key** (labeled as `anon public`)

### 6. Configure the Application

1. Open `config.js` in the blog-app folder
2. Replace the placeholder values:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';          // Paste your Project URL here
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Paste your Anon Public Key here
```

Example:
```javascript
const SUPABASE_URL = 'https://xyzabc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 7. Run the Application

1. Open `index.html` in your web browser
2. Create an account or log in
3. Start creating blog posts!

## Usage

### Sign Up
1. Click the "Sign Up" tab
2. Enter your name, email, and password
3. Confirm your password
4. Click "Sign Up"
5. Check your email to verify your account

### Login
1. Enter your email and password
2. Click "Login"

### Create a Blog Post
1. After logging in, fill in the blog title and content
2. Click "Publish Post"
3. Your post will appear in the blog feed

### Delete a Blog Post
1. Click the "Delete" button on your own blog post
2. Confirm the deletion

### Sort Blog Posts
1. Use the dropdown menu to sort posts by:
   - Newest First (default)
   - Oldest First

## Security Features

- ✅ Passwords are securely stored by Supabase
- ✅ Row Level Security (RLS) ensures users can only delete their own posts
- ✅ Email verification required for new accounts
- ✅ XSS protection through HTML escaping
- ✅ Secure authentication tokens

## Troubleshooting

### "Failed to load Supabase"
- Make sure you've added your Supabase URL and Anon Key to `config.js`
- Check that the values are correct (no extra spaces)
- Refresh the page

### "Email already exists"
- This email address is already registered
- Try logging in instead, or use a different email

### Can't delete other people's posts
- This is by design for security
- You can only delete your own posts

### Posts not appearing
- Make sure you're logged in
- Check that the Supabase table was created correctly
- Verify RLS policies are set up

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: CSS Grid, Flexbox, CSS Animations
- **Libraries**: Supabase JS Client v2.38.0

## Performance Notes

- Posts are sorted by creation date
- Indexes are created for faster queries
- Responsive design works on mobile, tablet, and desktop
- Real-time updates when new posts are created

## Limitations

- Maximum 500 characters for blog title
- Maximum 10,000 characters for blog content
- Email verification required before first login
- Currently stores author name from signup, can be updated in future versions

## Future Enhancements

- Edit existing blog posts
- Search functionality
- Categories/Tags for blog posts
- Comments on blog posts
- User profiles with bio
- Like/Star blog posts
- Follow other users

## Support

For issues with Supabase:
- Visit [Supabase Documentation](https://supabase.com/docs)
- Check [Supabase Support](https://supabase.com/support)

## License

This project is open source and available for personal and educational use.

## Credits

Built as a learning project for Vibathon Workshop
