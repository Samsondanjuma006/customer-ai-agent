export type Agent = {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
};

export type KnowledgeItem = {
  id: string;
  title: string;
  type: string;
  content: string;
  createdAt: string;
};

export type Lead = {
  id: string;
  name: string;
  contact: string;
  interest: string;
  status: "new" | "contacted" | "converted";
  createdAt: string;
};

export type Conversation = {
  id: string;
  message: string;
  reply: string;
  createdAt: string;
};

export const agents: Agent[] = [];
export const knowledge: KnowledgeItem[] = [];
export const leads: Lead[] = [];
export const conversations: Conversation[] = [];
