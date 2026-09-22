"use client";

import { useState } from "react";

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
            <button className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium">
              Settings
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

            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              Create AI Agent
            </button>
          </header>

          <div className="p-5 md:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold">
                Welcome to Customer AI
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Build an AI customer-service agent that understands your
                business, answers customer questions, and helps your team
                capture leads.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric title="Conversations" value="0" />
              <Metric title="AI Resolved" value="0" />
              <Metric title="Human Handoffs" value="0" />
              <Metric title="Leads Captured" value="0" />
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

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">
                    Not configured
                  </span>
                </div>

                <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">
                    AI
                  </div>

                  <h4 className="mt-4 font-semibold">
                    Create your first AI agent
                  </h4>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Add business information, products, FAQs, documents, and
                    website content so your agent can answer customers.
                  </p>

                  <button className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white">
                    Create AI Agent
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold">Knowledge Base</h3>

                <p className="mt-1 text-sm text-slate-500">
                  Information your AI can use when answering customers.
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    "PDF documents",
                    "Business FAQs",
                    "Products & services",
                    "Website content",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-lg bg-slate-50 p-3"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-xs shadow-sm">
                        +
                      </div>
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <button className="mt-6 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium">
                  Add Knowledge
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold">Recent conversations</h3>
              <p className="mt-1 text-sm text-slate-500">
                Customer conversations will appear here.
              </p>

              <div className="mt-6 rounded-lg bg-slate-50 p-8 text-center text-sm text-slate-500">
                No conversations yet.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
