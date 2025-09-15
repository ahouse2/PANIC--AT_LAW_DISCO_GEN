import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const AGENT_NETWORK_DATA = [
  {
    name: 'Document Ingestion Team',
    description: 'Manages the intake and processing of legal documents.',
    tools: [
      { name: 'DataCollection', description: 'Ingests and processes a batch of documents.' },
      { name: 'VectorDatabaseManager', description: 'Manages the vector database for document search.' },
      { name: 'DocumentProcessor', description: 'Processes and prepares documents for analysis.' }
    ]
  },
  {
    name: 'Forensic Document Analysis Team',
    description: 'Analyzes documents for forensic evidence.',
    tools: [
      { name: 'FraudDetector', description: 'Identifies potential fraud within financial documents.' },
      { name: 'GraphAnalyzer', description: 'Builds a knowledge graph from document relationships.' }
    ]
  },
  {
    name: 'Legal Analysis Case Strategy Team',
    description: 'Provides legal analysis and case strategy recommendations.',
    tools: [
      { name: 'LegalSummary', description: 'Generates a summary of key legal arguments.' },
      { name: 'KnowledgeGraphManager', description: 'Manages and queries the legal knowledge graph.' }
    ]
  },
  {
    name: 'Timeline Construction Team',
    description: 'Constructs chronological timelines of events from case data.',
    tools: [
      { name: 'TimelineManager', description: 'Creates, updates, and exports case timelines.' }
    ]
  },
  {
    name: 'Legal Research Team',
    description: 'Conducts research on relevant legal precedents and references.',
    tools: [
      { name: 'ResearchTools', description: 'Performs legal and factual research.' }
    ]
  },
  {
    name: 'Forensic Financial Analysis Team',
    description: 'Analyzes financial data for irregularities and patterns.',
    tools: [
      { name: 'ForensicTools', description: 'Performs in-depth forensic analysis on financial records.' }
    ]
  },
  {
    name: 'Software Development Team',
    description: 'Builds and maintains the software tools for the agent network.',
    tools: [
      { name: 'CodeEditor', description: 'Provides a text editor for writing and modifying code.' },
      { name: 'FileManager', description: 'Manages files and directories on the system.' }
    ]
  },
  {
    name: 'Trial Preparation & Presentation Team',
    description: 'Prepares legal arguments and presentations for trial.',
    tools: [
      { name: 'PresentationGenerator', description: 'Creates and formats legal presentations.' },
      { name: 'SubpoenaManager', description: 'Manages the issuance and tracking of subpoenas.' },
      { name: 'DocumentModifier', description: 'Modifies and formats legal documents.' },
      { name: 'DocumentDrafter', description: 'Drafts pleadings and other legal documents.' }
    ]
  }
];

function AgentNetworkSection() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  useEffect(() => {
    const s = io("/chat");
    s.on("agent_response", (d) => {
      if (d && typeof d.data === 'string') setOutput(d.data);
    });
    return () => s.disconnect();
  }, []);

  const orchestrate = () => {
    if (!input.trim()) return;
    fetch("/api/agents/orchestrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    })
      .then((r) => r.json())
      .then((d) => setOutput(d.response || JSON.stringify(d)))
      .catch((e) => setOutput(String(e)));
  };

  return (
    <section className="card">
      <h2>Agent Network</h2>
      <div className="network-grid">
        {AGENT_NETWORK_DATA.map((team) => (
          <div key={team.name} className="network-card">
            <h3>{team.name}</h3>
            <p className="mb-2 text-sm">{team.description}</p>
            <ul className="pl-4 text-sm">
              {team.tools.map((tool) => (
                <li key={tool.name}>
                  {tool.name} - {tool.description}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <label className="block text-sm mb-1">Orchestrate a request</label>
        <textarea
          className="w-full p-2 rounded bg-gray-800 text-gray-100 mb-2"
          rows={2}
          placeholder="e.g., Draft a responsive declaration to an RFO move-away request"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="button-primary" onClick={orchestrate}>Run Orchestrator</button>
        {output && (
          <pre className="mt-2 p-2 bg-black/60 border border-gray-700 rounded text-xs overflow-x-auto">
            {output}
          </pre>
        )}
      </div>
    </section>
  );
}

export default AgentNetworkSection;
