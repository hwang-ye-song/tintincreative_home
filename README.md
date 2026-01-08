# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/22ff449e-c4a5-4a6a-853d-4584a71afe23

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/22ff449e-c4a5-4a6a-853d-4584a71afe23) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up environment variables.
# .env.example 파일을 참고하여 .env 파일을 생성하고 필요한 환경 변수를 설정하세요.
# DB.env 파일이 있다면 그 내용을 .env 파일로 복사하세요.
cp DB.env .env
# 또는
copy DB.env .env

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Environment Variables

이 프로젝트는 다음 환경 변수가 필요합니다:

- `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase Anon Key
- `VITE_GOOGLE_FORM_URL`: Google Form URL (선택사항)

`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 실제 값을 입력하세요.
`DB.env` 파일이 있다면 그 내용을 `.env`로 복사하면 됩니다.

**중요**: `.env` 파일은 Git에 커밋되지 않습니다. 실제 키 값은 절대 커밋하지 마세요.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/22ff449e-c4a5-4a6a-853d-4584a71afe23) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
