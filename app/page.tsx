"use client";

import { useEffect, useState } from "react";

type Agent = {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
};

type KnowledgeItem = {
  id: string;
  agentId: string;
  title: string;
  type: string;
  content: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  agentId: string;
  message: string;
  reply: string;
  createdAt: string;
};

type Stats = {
  conversations: number;
  aiResolved: number;
  humanHandoffs: number;
  leadsCaptured: number;
  knowledgeItems: number;
  agents: number;
  activeAgents: number;
};

const navItems = [
  "Dashboard",
  "AI Agents",
  "Knowledge",
  "Conversations",
  "Leads",
  "Analytics",
];

export default function Home() {
  const [active, setActive] = useState("Dashboard");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [stats, setStats] = useState<Stats>({
    conversations: 0,
    aiResolved: 0,
    humanHandoffs: 0,
    leadsCaptured: 0,
    knowledgeItems: 0,
    agents: 0,
    activeAgents: 0,
  });

  const [showAgentForm, setShowAgentForm] = useState(false);
  const [showKnowledgeForm, setShowKnowledgeForm] = useState(false);

  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");

  const [knowledgeTitle, setKnowledgeTitle] = useState("");
  const [knowledgeType, setKnowledgeType] = useState("business");
  const [knowledgeContent, setKnowledgeContent] = useState("");

  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      window.location.href = "/login";
    } catch {
      setError("Unable to sign out. Please try again.");
    }
  }

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [agentsResponse, statsResponse] = await Promise.all([
        fetch("/api/agents"),
        fetch("/api/stats"),
      ]);

      if (!agentsResponse.ok || !statsResponse.ok) {
        throw new Error("Unable to load dashboard data.");
      }

      const agentsData = await agentsResponse.json();
      const statsData = await statsResponse.json();

      setAgents(agentsData.agents);
      setStats(statsData);

      const firstAgent = agentsData.agents[0];

      if (firstAgent) {
        const agentId = selectedAgentId || firstAgent.id;

        setSelectedAgentId(agentId);

        const [knowledgeResponse, conversationsResponse] =
          await Promise.all([
            fetch(`/api/knowledge?agentId=${agentId}`),
            fetch(`/api/chat?agentId=${agentId}`),
          ]);

        if (knowledgeResponse.ok) {
          const data = await knowledgeResponse.json();
          setKnowledge(data.knowledge);
        }

        if (conversationsResponse.ok) {
          const data = await conversationsResponse.json();
          setConversations(data.conversations);
        }
      } else {
        setSelectedAgentId("");
        setKnowledge([]);
        setConversations([]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading the dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createAgent() {
    if (!agentName.trim()) {
      setError("Agent name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: agentName,
          description: agentDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create agent.");
      }

      setAgentName("");
      setAgentDescription("");
      setShowAgentForm(false);
      setSelectedAgentId(data.agent.id);

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create agent.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function addKnowledge() {
    if (!selectedAgentId) {
      setError("Create an AI agent before adding knowledge.");
      return;
    }

    if (!knowledgeTitle.trim() || !knowledgeContent.trim()) {
      setError("Knowledge title and content are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/knowledge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId: selectedAgentId,
          title: knowledgeTitle,
          type: knowledgeType,
          content: knowledgeContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to add knowledge.");
      }

      setKnowledgeTitle("");
      setKnowledgeContent("");
      setShowKnowledgeForm(false);

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to add knowledge.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function selectAgent(agentId: string) {
    setSelectedAgentId(agentId);

    try {
      setError("");

      const [knowledgeResponse, conversationsResponse] = await Promise.all([
        fetch(`/api/knowledge?agentId=${agentId}`),
        fetch(`/api/chat?agentId=${agentId}`),
      ]);

      if (knowledgeResponse.ok) {
        const data = await knowledgeResponse.json();
        setKnowledge(data.knowledge);
      }

      if (conversationsResponse.ok) {
        const data = await conversationsResponse.json();
        setConversations(data.conversations);
      }
    } catch {
      setError("Unable to load the selected agent.");
    }
  }

  const selectedAgent =
    agents.find((agent) => agent.id === selectedAgentId) || agents[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-slate-200 bg-white md:flex md:flex-col">
          <div className="border-b border-slate-200 px-6 py-6">
            <div className="text-xl font-bold">Customer AI</div>
            <p className="mt-1 text-xs text-slate-500">
              AI customer service platform
            </p>
          </div>

          <nav className="flex-1 px-3 py-5">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => setActive(item)}
                className={`mb-1 w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                  active === item
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <button
              onClick={handleLogout}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium"
            >
              Sign out
            </button>
          </div>
        </aside>

        <section className="flex-1">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-8">
            <div>
              <h1 className="text-lg font-semibold">{active}</h1>
              <p className="text-xs text-slate-500">
                Manage your AI customer service
              </p>
            </div>

            <button
              onClick={() => setShowAgentForm(true)}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Create AI Agent
            </button>
          </header>

          <div className="p-5 md:p-8">
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-2xl font-bold">Welcome to Customer AI</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Build an AI customer-service agent that understands your
                business, answers customer questions, and helps your team
                capture leads.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric title="Conversations" value={stats.conversations} />
              <Metric title="AI Resolved" value={stats.aiResolved} />
              <Metric title="Human Handoffs" value={stats.humanHandoffs} />
              <Metric title="Leads Captured" value={stats.leadsCaptured} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Your AI Agent</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Create an agent and give it knowledge about your
                      business.
                    </p>
                  </div>

                  {selectedAgent ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                      {selectedAgent.status}
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">
                      Not configured
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="mt-6 rounded-lg bg-slate-50 p-8 text-center text-sm text-slate-500">
                    Loading your workspace...
                  </div>
                ) : selectedAgent ? (
                  <div className="mt-6 rounded-lg border border-slate-200 p-5">
                    <h4 className="font-semibold">{selectedAgent.name}</h4>

                    <p className="mt-2 text-sm text-slate-500">
                      {selectedAgent.description ||
                        "No agent description provided."}
                    </p>

                    {agents.length > 1 && (
                      <select
                        value={selectedAgentId}
                        onChange={(event) =>
                          selectAgent(event.target.value)
                        }
                        className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      >
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">
                          Knowledge items
                        </p>
                        <p className="mt-1 text-xl font-bold">
                          {knowledge.length}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">
                          Conversations
                        </p>
                        <p className="mt-1 text-xl font-bold">
                          {conversations.length}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">
                      AI
                    </div>

                    <h4 className="mt-4 font-semibold">
                      Create your first AI agent
                    </h4>

                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                      Add business information, products, FAQs, documents,
                      and website content so your agent can answer customers.
                    </p>

                    <button
                      onClick={() => setShowAgentForm(true)}
                      className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white"
                    >
                      Create AI Agent
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold">Knowledge Base</h3>

                <p className="mt-1 text-sm text-slate-500">
                  Information your AI can use when answering customers.
                </p>

                {selectedAgent ? (
                  <>
                    <div className="mt-5 space-y-3">
                      {knowledge.length > 0 ? (
                        knowledge.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-lg bg-slate-50 p-3"
                          >
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {item.type}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                          No knowledge added yet.
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setShowKnowledgeForm(true)}
                      className="mt-6 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium"
                    >
                      Add Knowledge
                    </button>
                  </>
                ) : (
                  <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                    Create an AI agent first.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold">Recent conversations</h3>

              <p className="mt-1 text-sm text-slate-500">
                Customer conversations will appear here.
              </p>

              {conversations.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {conversations
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map((conversation) => (
                      <div
                        key={conversation.id}
                        className="rounded-lg bg-slate-50 p-4"
                      >
                        <p className="text-sm font-medium">
                          {conversation.message}
                        </p>

                        <p className="mt-2 whitespace-pre-line text-sm text-slate-500">
                          {conversation.reply}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="mt-6 rounded-lg bg-slate-50 p-8 text-center text-sm text-slate-500">
                  No conversations yet.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {showAgentForm && (
        <Modal
          title="Create AI Agent"
          onClose={() => setShowAgentForm(false)}
        >
          <input
            value={agentName}
            onChange={(event) => setAgentName(event.target.value)}
            placeholder="Agent name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />

          <textarea
            value={agentDescription}
            onChange={(event) => setAgentDescription(event.target.value)}
            placeholder="Describe what this agent should help customers with"
            rows={4}
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />

          <button
            onClick={createAgent}
            disabled={saving}
            className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Agent"}
          </button>
        </Modal>
      )}

      {showKnowledgeForm && (
        <Modal
          title="Add Knowledge"
          onClose={() => setShowKnowledgeForm(false)}
        >
          <input
            value={knowledgeTitle}
            onChange={(event) => setKnowledgeTitle(event.target.value)}
            placeholder="Title, e.g. Business Hours"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />

          <select
            value={knowledgeType}
            onChange={(event) => setKnowledgeType(event.target.value)}
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          >
            <option value="business">Business information</option>
            <option value="faq">FAQ</option>
            <option value="product">Product / Service</option>
            <option value="policy">Policy</option>
          </select>

          <textarea
            value={knowledgeContent}
            onChange={(event) => setKnowledgeContent(event.target.value)}
            placeholder="Enter the information your AI agent should know"
            rows={7}
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />

          <button
            onClick={addKnowledge}
            disabled={saving}
            className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add Knowledge"}
          </button>
        </Modal>
      )}
    </main>
  );
}

function Metric({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>

          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100"
          >
            ×
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
