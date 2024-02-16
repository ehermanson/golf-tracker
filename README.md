# Remix Indie Stack

![The Remix Indie Stack](https://repository-images.githubusercontent.com/465928257/a241fa49-bd4d-485a-a2a5-5cb8e4ee0abf)

## Development

- Initial setup:

  ```sh
  npm run setup
  ```

- Start dev server:

  ```sh
  npm run dev
  ```

This starts your app in development mode, rebuilding assets on file changes.

The database seed script creates a new user with some data you can use to get
started:

- Email: `test@fake.com`
- Password: `password`

## Deployment

This Remix Stack comes with two GitHub Actions that handle automatically
deploying your app to production and staging environments.

Prior to your first deployment, you'll need to do a few things:

- [Install Fly](https://fly.io/docs/getting-started/installing-flyctl/)

- Sign up and log in to Fly

  ```sh
  fly auth signup
  ```

  > **Note:** If you have more than one Fly account, ensure that you are signed
  > into the same account in the Fly CLI as you are in the browser. In your
  > terminal, run `fly auth whoami` and ensure the email matches the Fly account
  > signed into the browser.

- Create two apps on Fly, one for staging and one for production:

  ```sh
  fly apps create golf-tracker-f37e
  fly apps create golf-tracker-f37e-staging
  ```

  > **Note:** Make sure this name matches the `app` set in your `fly.toml` file.
  > Otherwise, you will not be able to deploy.

  - Initialize Git.

  ```sh
  git init
  ```

- Create a new [GitHub Repository](https://repo.new), and then add it as the
  remote for your project. **Do not push your app yet!**

  ```sh
  git remote add origin <ORIGIN_URL>
  ```

- Add a `FLY_API_TOKEN` to your GitHub repo. To do this, go to your user
  settings on Fly and create a new
  [token](https://web.fly.io/user/personal_access_tokens/new), then add it to
  [your repo secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
  with the name `FLY_API_TOKEN`.

- Add a `SESSION_SECRET` to your fly app secrets, to do this you can run the
  following commands:

  ```sh
  fly secrets set SESSION_SECRET=$(openssl rand -hex 32) --app golf-tracker-f37e
  fly secrets set SESSION_SECRET=$(openssl rand -hex 32) --app golf-tracker-f37e-staging
  ```

  If you don't have openssl installed, you can also use
  [1Password](https://1password.com/password-generator) to generate a random
  secret, just replace `$(openssl rand -hex 32)` with the generated secret.

- Create a persistent volume for the sqlite database for both your staging and
  production environments. Run the following:

  ```sh
  fly volumes create data --size 1 --app golf-tracker-f37e
  fly volumes create data --size 1 --app golf-tracker-f37e-staging
  ```

Now that everything is set up you can commit and push your changes to your repo.
Every commit to your `main` branch will trigger a deployment to your production
environment, and every commit to your `dev` branch will trigger a deployment to
your staging environment.

### Connecting to your database

The sqlite database lives at `/data/sqlite.db` in your deployed application. You
can connect to the live database by running `fly ssh console -C database-cli`.

### Getting Help with Deployment

If you run into any issues deploying to Fly, make sure you've followed all of
the steps above and if you have, then post as many details about your deployment
(including your app name) to
[the Fly support community](https://community.fly.io). They're normally pretty
responsive over there and hopefully can help resolve any of your deployment
issues and questions.

## GitHub Actions

We use GitHub Actions for continuous integration and deployment. Anything that
gets into the `main` branch will be deployed to production after running
tests/build/etc. Anything in the `dev` branch will be deployed to staging.
