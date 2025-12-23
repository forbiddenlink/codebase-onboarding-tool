export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CodeCompass
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            AI-Powered Codebase Onboarding Platform
          </p>
          <p className="text-lg mb-8">
            Make joining new codebases 10x faster
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition">
              Get Started
            </button>
            <button className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-accent transition">
              Learn More
            </button>
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
        <div className="p-6 border border-border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">🤖 AI Chat</h3>
          <p className="text-muted-foreground">
            Ask questions about your codebase in natural language
          </p>
        </div>
        <div className="p-6 border border-border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">📊 Architecture Diagrams</h3>
          <p className="text-muted-foreground">
            Interactive visualizations of your code structure
          </p>
        </div>
        <div className="p-6 border border-border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">🎯 Learning Paths</h3>
          <p className="text-muted-foreground">
            Personalized onboarding based on your role
          </p>
        </div>
      </div>

      <div className="mt-8 text-sm text-muted-foreground">
        <p>Environment setup complete. Start building! 🚀</p>
      </div>
    </main>
  )
}
