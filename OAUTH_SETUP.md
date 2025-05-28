# OAuth Setup Guide for Supabase

This guide will help you set up OAuth authentication with Google, Facebook, and GitHub for your English Learning Platform.

## Prerequisites

- Supabase project created and configured
- Access to Google Cloud Console, Facebook Developers, and GitHub Settings

## 1. Supabase Configuration

### Enable OAuth Providers in Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable the following providers:
   - Google
   - Facebook  
   - GitHub

### Set Redirect URLs

In each provider configuration, set the redirect URL to:
```
https://yvsjynosfwyhvisqhasp.supabase.co/auth/v1/callback
```

Replace `your-project-ref` with your actual Supabase project reference.

## 2. Google OAuth Setup

### Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
5. Set application type to **Web application**
6. Add authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)

### Configure in Supabase

1. In Supabase Dashboard, go to **Authentication** > **Providers** > **Google**
2. Enable Google provider
3. Add your Google OAuth credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret

### Force Account Selection

The OAuth implementation includes `prompt: 'select_account'` which forces users to:
- Always see the account selection screen
- Choose which Google account to use
- Prevents automatic login with cached credentials

### Complete Logout

To ensure users can switch accounts:
1. Use the `LogoutHelper` component for complete logout
2. This clears both app session and Google session
3. Next login will show account selection screen

## 3. Facebook OAuth Setup

### Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add **Facebook Login** product
4. In **Facebook Login** settings, add redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)

### Configure in Supabase

1. In Supabase Dashboard, go to **Authentication** > **Providers** > **Facebook**
2. Enable Facebook provider
3. Add your Facebook app credentials:
   - **Client ID**: Your Facebook App ID
   - **Client Secret**: Your Facebook App Secret

## 4. GitHub OAuth Setup

### Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the application details:
   - **Application name**: English Learning Platform
   - **Homepage URL**: `http://localhost:3000` (or your domain)
   - **Authorization callback URL**: `https://your-project-ref.supabase.co/auth/v1/callback`

### Configure in Supabase

1. In Supabase Dashboard, go to **Authentication** > **Providers** > **GitHub**
2. Enable GitHub provider
3. Add your GitHub OAuth credentials:
   - **Client ID**: Your GitHub OAuth App Client ID
   - **Client Secret**: Your GitHub OAuth App Client Secret

## 5. Environment Variables

Add the following to your `.env.local` file:

```env
# Supabase Configuration (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OAuth Provider URLs (optional, for reference)
NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT=https://your-project-ref.supabase.co/auth/v1/callback
NEXT_PUBLIC_FACEBOOK_OAUTH_REDIRECT=https://your-project-ref.supabase.co/auth/v1/callback
NEXT_PUBLIC_GITHUB_OAUTH_REDIRECT=https://your-project-ref.supabase.co/auth/v1/callback
```

## 6. Testing OAuth

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login page: `http://localhost:3000/auth/login`

3. Click on any OAuth provider button (Google, Facebook, GitHub)

4. Complete the OAuth flow in the provider's authentication screen

5. You should be redirected back to your application and logged in

## 7. Production Deployment

When deploying to production:

1. Update redirect URIs in all OAuth provider configurations to use your production domain
2. Update Supabase site URL in your project settings
3. Ensure your production environment has the correct environment variables

## Troubleshooting

### Common Issues

1. **Invalid Redirect URI**: Make sure the redirect URI in your OAuth app matches exactly with Supabase
2. **CORS Errors**: Ensure your domain is added to Supabase allowed origins
3. **Provider Not Enabled**: Check that the OAuth provider is enabled in Supabase Dashboard

### Debug OAuth Flow

You can check the browser network tab to see the OAuth flow:
1. Initial redirect to provider
2. Provider callback to Supabase
3. Final redirect to your callback page

### Logs

Check Supabase logs in the Dashboard under **Logs** > **Auth** for any authentication errors.

## Security Notes

- Keep your OAuth client secrets secure and never expose them in client-side code
- Use HTTPS in production for all OAuth flows
- Regularly rotate your OAuth credentials
- Monitor authentication logs for suspicious activity

## Next Steps

After completing OAuth setup:
1. Test all three providers thoroughly
2. Implement proper error handling for failed OAuth attempts
3. Add user profile completion flow for OAuth users
4. Consider implementing account linking for users with multiple auth methods
