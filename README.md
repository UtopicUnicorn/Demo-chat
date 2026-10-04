# Demo Messenger Chat

A small demo project with a React chat client and an Express backend that emulates messaging app conversations.

The current flow is intentionally simple: a user opens the app, signs in with a phone number, and the phone is stored in `localStorage`. After that, the user is redirected to the chat workspace where they see their mock messenger chats.

## Project structure

- `client` - React application built with Vite.
- `server` - Express API and Socket.IO realtime gateway.

## Requirements

- Node.js 20.19+
- npm

## Running locally

Install dependencies from the repository root:

```bash
npm install
```

Start the backend in one terminal:

```bash
npm run dev:server
```

Start the client in another terminal:

```bash
npm run dev:client
```

Open the app at:

```text
http://localhost:5173
```

By default:

- Client runs on `http://localhost:5173`.
- Backend runs on `http://localhost:4000`.
- Vite proxies `/api` and `/health` to the backend.
- Socket.IO connects to `http://localhost:4000` unless `VITE_REALTIME_ORIGIN` is provided.

## Available scripts

From the repository root:

```bash
npm run dev:client
npm run dev:server
npm run build
npm run lint
npm test
```

## What is implemented

1. Mock authentication: the app does not verify the phone number with the backend. The phone is saved directly to `localStorage`.
2. Protected routing: `/` opens the chat workspace only when a phone exists in `localStorage`; otherwise the user is redirected to `/auth`.
3. Chat history display: the client loads and renders chats and messages for the current phone.
4. In-memory backend storage: chats and messages live in server memory and are reset when the backend process restarts.
5. Messenger-specific theme accents: selecting a messenger instance changes the chat workspace color palette.
6. Chat creation: selecting a messenger instance and entering a recipient phone creates or reuses a chat for those participants.
7. Realtime session per opened chat: when a chat is opened, the client starts a WebSocket session and receives chat/message updates through Socket.IO.
8. Message sending: outgoing messages are sent through the backend API with the current user's phone.
9. Viewer-specific message direction: the backend can return the same conversation with message direction adjusted for the requesting phone.

## Known limitations and possible improvements

1. Refresh behavior: after a page reload the client reloads chats from the backend, but the current selected chat/open conversation state is not persisted.
2. Mock auth only: phone ownership is not verified, there are no sessions, tokens, or backend-side auth checks.
3. In-memory storage: all data disappears when the backend restarts. A json-file or database would be needed for persistence.
4. Basic participant model: chats are scoped by phone participants, but there is no contact book, profile metadata, or real user identity model.
5. Limited realtime recovery: the client reconnects through Socket.IO, but missed events are not reconciled with a dedicated sync step.
6. No message delivery states beyond the demo model: statuses are present, but there is no full delivery/read lifecycle.
7. No backend integration with real messengers: messenger instances are mocked and adapter behavior is local to the demo.
8. There are some visuals to be improved on mobile layout
9. Missed messages after websocket reconnect doesn't show
