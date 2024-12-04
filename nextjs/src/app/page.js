import ChatInterface from "./components/chat-interface";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h1 className="text-xl font-bold">AI Job Assistant</h1>
      </div>
      <ChatInterface />
    </main>
  );
}
