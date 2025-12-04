// Wait for Supabase to be loaded
let supabaseClient;
const maxRetries = 20;
let retryCount = 0;

const waitForSupabase = setInterval(() => {
    if (window.supabaseClient) {
        supabaseClient = window.supabaseClient;
        clearInterval(waitForSupabase);
        initializeApp();
    }
    retryCount++;
    if (retryCount > maxRetries) {
        clearInterval(waitForSupabase);
        showError('Failed to load Supabase. Please check your config.js file.');
    }
}, 100);

// DOM Elements
const authSection = document.getElementById('authSection');
const appSection = document.getElementById('appSection');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');
const createBlogForm = document.getElementById('createBlogForm');
const blogPostsContainer = document.getElementById('blogPostsContainer');
const sortBy = document.getElementById('sortBy');

let currentUser = null;

// Initialize App
function initializeApp() {
    checkAuthStatus();
    attachEventListeners();
    handleAuthRedirect();
}

// Handle Auth Redirect (for email confirmation links)
async function handleAuthRedirect() {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const error = urlParams.get('error');

    if (error) {
        console.warn('Auth error from redirect:', error);
        const errorDescription = urlParams.get('error_description');
        if (errorDescription && errorDescription.includes('expired')) {
            alert('Email link has expired. Please sign up again.');
            window.location.hash = '';
        }
        return;
    }

    if (accessToken && refreshToken) {
        try {
            const { data, error } = await supabaseClient.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });

            if (!error) {
                console.log('Email confirmed successfully!');
                window.location.hash = '';
                checkAuthStatus();
            }
        } catch (err) {
            console.error('Error setting session:', err);
        }
    }
}

// Check Authentication Status
async function checkAuthStatus() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (session) {
            currentUser = session.user;
            showAppSection();
            loadUserPosts();
        } else {
            showAuthSection();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        showAuthSection();
    }
}

// Attach Event Listeners
function attachEventListeners() {
    // Auth toggle
    loginBtn.addEventListener('click', () => switchAuthTab('login'));
    signupBtn.addEventListener('click', () => switchAuthTab('signup'));

    // Forms
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    logoutBtn.addEventListener('click', handleLogout);

    // Blog
    createBlogForm.addEventListener('submit', handleCreateBlog);
    sortBy.addEventListener('change', loadUserPosts);

    // Auth state change listener
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            showAppSection();
            loadUserPosts();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            showAuthSection();
            clearForms();
        }
    });
}

// Switch Auth Tab
function switchAuthTab(tab) {
    const loginFormElement = document.getElementById('loginForm');
    const signupFormElement = document.getElementById('signupForm');

    if (tab === 'login') {
        loginBtn.classList.add('active');
        signupBtn.classList.remove('active');
        loginFormElement.classList.add('active');
        signupFormElement.classList.remove('active');
    } else {
        signupBtn.classList.add('active');
        loginBtn.classList.remove('active');
        signupFormElement.classList.add('active');
        loginFormElement.classList.remove('active');
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorElement = document.getElementById('loginError');

    try {
        errorElement.textContent = '';
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            errorElement.textContent = error.message;
            return;
        }

        currentUser = data.user;
        showAppSection();
        loadUserPosts();
    } catch (error) {
        errorElement.textContent = 'An error occurred during login';
        console.error('Login error:', error);
    }
}

// Handle Signup
async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const errorElement = document.getElementById('signupError');

    try {
        errorElement.textContent = '';

        if (password !== confirmPassword) {
            errorElement.textContent = 'Passwords do not match';
            return;
        }

        if (password.length < 6) {
            errorElement.textContent = 'Password must be at least 6 characters';
            return;
        }

        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                },
                emailRedirectTo: window.location.origin + window.location.pathname
            }
        });

        if (error) {
            errorElement.textContent = error.message;
            return;
        }

        errorElement.style.color = '#28a745';
        errorElement.textContent = 'Account created! Please check your email to verify your account.';
        
        // Clear form
        signupForm.reset();
        
        // Switch back to login after 3 seconds
        setTimeout(() => {
            switchAuthTab('login');
        }, 3000);

    } catch (error) {
        errorElement.textContent = 'An error occurred during signup';
        console.error('Signup error:', error);
    }
}

// Handle Logout
async function handleLogout() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            console.error('Logout error:', error);
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Handle Create Blog
async function handleCreateBlog(e) {
    e.preventDefault();
    const title = document.getElementById('blogTitle').value;
    const content = document.getElementById('blogContent').value;
    const errorElement = document.getElementById('createBlogError');

    if (!currentUser) {
        errorElement.textContent = 'You must be logged in to create a post';
        return;
    }

    try {
        errorElement.textContent = '';

        const { data, error } = await supabaseClient
            .from('blogs')
            .insert([
                {
                    title,
                    content,
                    user_id: currentUser.id,
                    author_name: currentUser.user_metadata?.name || currentUser.email,
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            throw error;
        }

        // Clear form
        createBlogForm.reset();

        // Reload posts
        loadUserPosts();

        // Show success message
        errorElement.style.color = '#28a745';
        errorElement.textContent = 'Blog post published successfully!';
        setTimeout(() => {
            errorElement.textContent = '';
            errorElement.style.color = '#dc3545';
        }, 3000);

    } catch (error) {
        errorElement.textContent = 'Error creating blog post: ' + error.message;
        console.error('Create blog error:', error);
    }
}

// Load User Posts
async function loadUserPosts() {
    try {
        let query = supabaseClient.from('blogs').select('*');

        const sortValue = sortBy.value;
        if (sortValue === 'newest') {
            query = query.order('created_at', { ascending: false });
        } else {
            query = query.order('created_at', { ascending: true });
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            blogPostsContainer.innerHTML = '<p class="no-posts">No blog posts yet. Be the first to create one!</p>';
            return;
        }

        blogPostsContainer.innerHTML = data.map(post => createBlogPostElement(post)).join('');

        // Attach delete listeners
        document.querySelectorAll('.blog-post-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const postId = this.dataset.postId;
                deletePost(postId);
            });
        });

    } catch (error) {
        blogPostsContainer.innerHTML = '<p class="no-posts">Error loading blog posts</p>';
        console.error('Load posts error:', error);
    }
}

// Create Blog Post Element
function createBlogPostElement(post) {
    const canDelete = currentUser && currentUser.id === post.user_id;
    const deleteButton = canDelete 
        ? `<button class="blog-post-delete" data-post-id="${post.id}">Delete</button>`
        : '';

    const date = new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return `
        <div class="blog-post">
            <div class="blog-post-header">
                <h3 class="blog-post-title">${escapeHtml(post.title)}</h3>
                ${deleteButton}
            </div>
            <p class="blog-post-meta">
                By <span class="blog-post-author">${escapeHtml(post.author_name)}</span> • ${date}
            </p>
            <p class="blog-post-content">${escapeHtml(post.content)}</p>
        </div>
    `;
}

// Delete Post
async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('blogs')
            .delete()
            .eq('id', postId);

        if (error) {
            throw error;
        }

        loadUserPosts();
    } catch (error) {
        alert('Error deleting post: ' + error.message);
        console.error('Delete error:', error);
    }
}

// Show Auth Section
function showAuthSection() {
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
}

// Show App Section
function showAppSection() {
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    const userNameElement = document.getElementById('userName');
    userNameElement.textContent = currentUser.user_metadata?.name || currentUser.email;
}

// Clear Forms
function clearForms() {
    loginForm.reset();
    signupForm.reset();
    createBlogForm.reset();
    document.getElementById('loginError').textContent = '';
    document.getElementById('signupError').textContent = '';
    document.getElementById('createBlogError').textContent = '';
}

// Utility function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Error handler
function showError(message) {
    console.error(message);
    document.body.innerHTML = `<div style="text-align: center; padding: 50px; color: red;"><h1>Error</h1><p>${message}</p></div>`;
}
